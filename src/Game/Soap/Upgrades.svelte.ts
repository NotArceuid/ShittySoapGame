import { SvelteMap } from "svelte/reactivity";
import { InvokeableEvent } from "../Shared/Events";
import { ReactiveText } from "../Shared/ReactiveText.svelte.ts";
import { Decimal } from "../Shared/BreakInfinity/Decimal.svelte.ts";
import { ExpPolynomial } from "../Shared/Math.ts";
import { Player } from "../Player.svelte.ts";
import { SaveSystem } from "../Saves.ts";
import type { IUpgradesInfo } from "../../routes/Components/UpgradesInfo.svelte.ts";

export const UnlockUpgrades: InvokeableEvent<UpgradesKey> = new InvokeableEvent<UpgradesKey>();
export const UpgradesData: SvelteMap<UpgradesKey, BaseUpgrade> = new SvelteMap<UpgradesKey, BaseUpgrade>();

export enum UpgradesKey {
  HoldButtonUpgrade, QualityUpgrade, SpeedUpgrade, RedSoapAutoSeller,
  BulkUpgrade, EatRedSoapUpgrade, OrangeSoapUpgrade,
  UnlockFoundry, CatPrestige
}

export abstract class BaseUpgrade implements IUpgradesInfo {
  buy = () => {
    this.count = Math.min(this.buyAmount, this.maxCount);
  }

  abstract name: string;
  abstract description: () => ReactiveText;
  abstract maxCount: number;
  abstract Requirements: [() => ReactiveText, () => boolean];
  abstract ShowCondition: () => boolean;
  count: number = $state(0)
  getMax?: () => number = undefined;
  unlocked: boolean = $state(false);
  buyAmount: number = $state(1);
}

class HoldButtonUpgrade extends BaseUpgrade {
  name = "Mouse broken?";
  description = () => new ReactiveText("Unlock the ability to sell by holding the [S] key (this works anywhere btw) ");
  maxCount = 1;
  Requirements = [() => new ReactiveText("25"), () => Player.Money.gte(25)] as [() => ReactiveText, () => boolean];
  ShowCondition = () => true;
}
class QualityUpgrade extends BaseUpgrade {
  name = "Not rich enough!!";
  description = () => new ReactiveText("Improves Producer Quality by 100%");
  unlocked = true;
  maxCount = 600;

  private qualityCost = new ExpPolynomial(new Decimal(100), new Decimal(1.17));
  get cost() {
    return this.qualityCost.Integrate(this.count, this.count + this.buyAmount).round();
  }
  Requirements = [
    () => {
      return new ReactiveText(this.cost.format())
    },
    () => {
      return Player.Money.gte(this.cost) && this.count < this.maxCount
    }
  ] as [() => ReactiveText, () => boolean];

  getMax = () => {
    let amt = this.qualityCost.BuyMax(Player.Money, this.count);
    return amt == -1 ? 1 : amt;
  }

  ShowCondition = () => true;
}
class SpeedUpgrade extends BaseUpgrade {
  name = "It's too slow!!";
  description = () => new ReactiveText("Improves Producer Speed by 100%");
  unlocked = true;
  maxCount = 700;

  private speedCost = new ExpPolynomial(new Decimal(100), new Decimal(1.15));
  get cost() {
    return this.speedCost.Integrate(this.count, this.count + this.buyAmount).round();
  }

  Requirements = [
    () => {
      return new ReactiveText(this.cost.format())
    },
    () => {
      return Player.Money.gte(this.cost) && this.count < this.maxCount
    }
  ] as [() => ReactiveText, () => boolean];

  getMax = () => {
    let amt = this.speedCost.BuyMax(Player.Money, this.count);
    return amt == -1 ? 1 : amt;
  }

  ShowCondition = () => true;

}

class RedSoapAutoSellter extends BaseUpgrade {
  name = "Red soap autosell";
  description = () => new ReactiveText("Happy now? This upgrades fires 1 time every 5s and will decrease by 0.5s with each subsequence upgrade.. hehe");
  maxCount = 9;

  get cost(): Decimal {
    let amt = Decimal.ZERO;
    for (let i = 0; i < this.buyAmount; i++) {
      amt = amt.add(new Decimal(250).mul(new Decimal(2).pow(i)))
    }
    return amt;
  }

  Requirements = [() => new ReactiveText(this.cost.format()), () => Player.Money.greaterThan(this.cost)] as [() => ReactiveText, () => boolean];
  ShowCondition = () => true;
}

class BulkUpgrade extends BaseUpgrade {
  name = "I Want More!!!";
  description = () => new ReactiveText("Increases Bulk Limit by 1 per level");
  maxCount = 9;
  get cost(): Decimal {
    let amt = Decimal.ZERO;
    for (let i = 0; i < this.buyAmount; i++) {
      amt = amt.add(new Decimal(10000).mul(new Decimal(100).pow(i)))
    }
    return amt;
  }
  Requirements = [() => new ReactiveText(this.cost.format()), () => Player.Money.greaterThan(this.cost)] as [() => ReactiveText, () => boolean];
  ShowCondition = () => true;
}
class EatRedSoapUpgrade extends BaseUpgrade {
  name = "Learn to eat red soap";
  description = () => new ReactiveText("Why would you do that?");
  maxCount = 1;
  Requirements = [() => new ReactiveText(new Decimal(2_500_000).format()), () => Player.Money.gt(2500000)] as [() => ReactiveText, () => boolean];
  ShowCondition = () => true;
}
class OrangeSoapUpgrade extends BaseUpgrade {
  name = "Unlock orange soap";
  description = () => new ReactiveText("I hope they don't contain any harmful chemicals");
  maxCount = 1;
  Requirements = [() => new ReactiveText(new Decimal(1_000_000).format()), () => Player.Money.gt(1000000)] as [() => ReactiveText, () => boolean];
  ShowCondition = () => true;
}
class UnlockFoundry extends BaseUpgrade {
  name = "Unlock Foundry";
  description = () => new ReactiveText("The last push before cat prestige >:)");
  maxCount = 1;
  Requirements = [() => new ReactiveText(new Decimal("1e+9").format()), () => Player.Money.gt("1e9")] as [() => ReactiveText, () => boolean];
  ShowCondition = () => true;
}
class CatUpgrade extends BaseUpgrade {
  name = "Buy a.. cat?";
  description = () => new ReactiveText("Quite an expensive kitten");
  maxCount = 1;
  Requirements = [() => new ReactiveText(new Decimal("25e+18").format()), () => Player.Money.gt("25e+18")] as [() => ReactiveText, () => boolean];
  ShowCondition = () => true;
}

UpgradesData.set(UpgradesKey.HoldButtonUpgrade, new HoldButtonUpgrade());
UpgradesData.set(UpgradesKey.SpeedUpgrade, new SpeedUpgrade());
UpgradesData.set(UpgradesKey.QualityUpgrade, new QualityUpgrade());
UpgradesData.set(UpgradesKey.RedSoapAutoSeller, new RedSoapAutoSellter());
UpgradesData.set(UpgradesKey.BulkUpgrade, new BulkUpgrade());
UpgradesData.set(UpgradesKey.OrangeSoapUpgrade, new OrangeSoapUpgrade());
UpgradesData.set(UpgradesKey.EatRedSoapUpgrade, new EatRedSoapUpgrade());
UpgradesData.set(UpgradesKey.UnlockFoundry, new UnlockFoundry());
UpgradesData.set(UpgradesKey.CatPrestige, new CatUpgrade());

const saveKey = "upgrades";
SaveSystem.SaveCallback(saveKey, () => SaveData());

interface UpgradeSaveData {
  upgradesKey: UpgradesKey;
  count: number;
  unlocked: boolean;
}

function SaveData() {
  let upgrades: UpgradeSaveData[] = [];
  UpgradesData.forEach((v, k) => {
    upgrades.push({
      upgradesKey: k,
      count: v.count,
      unlocked: v.unlocked,
    })
  })

  return {
    Upgrades: upgrades
  }
}

SaveSystem.LoadCallback(saveKey, (data) => LoadData(data as UpgradeSaveData[]));
function LoadData(data: UpgradeSaveData[]) {
  data.forEach((ele) => {
    let currUpgrade = UpgradesData.get(ele.upgradesKey)!;
    currUpgrade.count = ele.count;
    currUpgrade.unlocked = ele.unlocked;

    UpgradesData.set(ele.upgradesKey, currUpgrade);
  })
}
