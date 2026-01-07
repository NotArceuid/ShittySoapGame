import { SvelteMap } from "svelte/reactivity";
import { InvokeableEvent } from "../Shared/Events";
import { ReactiveText } from "../Shared/ReactiveText.svelte.ts";
import { Decimal } from "../Shared/BreakInfinity/Decimal.svelte.ts";
import { Exponential, ExpPolynomial } from "../Shared/Math.ts";
import { Player } from "../Player.svelte.ts";
import { SaveSystem } from "../Saves.ts";
import type { IUpgradesInfo } from "../../routes/Components/UpgradesInfo.svelte.ts";
import { log } from "console";

export const UpgradeBought: InvokeableEvent<UpgradesKey> = new InvokeableEvent<UpgradesKey>();
export const UpgradesData: SvelteMap<UpgradesKey, BaseUpgrade> = new SvelteMap<UpgradesKey, BaseUpgrade>();

export enum UpgradesKey {
  HoldButtonUpgrade, QualityUpgrade, SpeedUpgrade, RedSoapAutoSeller,
  RedSoapAutoSellBonus, BulkUpgrade, EatRedSoapUpgrade, UnlockFoundry, CatPrestige
}

export abstract class BaseUpgrade implements IUpgradesInfo {
  buy = () => {
    let increment = this.buyAmount + this.count;
    this.count = Math.min(increment, this.maxCount);

    Player.Money = Player.Money.minus(this.cost);
  }

  abstract name: string;
  abstract description: () => ReactiveText;
  abstract maxCount: number;
  abstract Requirements: [() => ReactiveText, () => boolean];
  abstract ShowCondition: () => boolean;
  abstract cost: Decimal;
  count: number = $state(0)
  getMax?: () => number = undefined;
  unlocked: boolean = $state(false);
  buyAmount: number = $state(1);
}

class HoldButtonUpgrade extends BaseUpgrade {
  name = "Mouse broken?";
  description = () => new ReactiveText("Unlock the ability to sell by holding the [S] key (this works anywhere btw) ");
  maxCount = 1;
  get cost() {
    return new Decimal(25);
  }
  Requirements = [() => new ReactiveText("25"), () => Player.Money.gte(25)] as [() => ReactiveText, () => boolean];
  ShowCondition = () => true;
}
class QualityUpgrade extends BaseUpgrade {
  name = "Not rich enough!!";
  description = () => new ReactiveText("Improves Producer Quality by 100%");
  unlocked = true;
  maxCount = 600;

  private qualityCost = new ExpPolynomial(new Decimal(360), new Decimal(1.17));
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

  private speedCost = new ExpPolynomial(new Decimal(365), new Decimal(1.15));
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
  description = () => new ReactiveText("Unlocks the red soap autoseller, happy now?");
  maxCount = 9;

  private costFormula = new Exponential(new Decimal(750), new Decimal(1.1));
  get cost(): Decimal {
    return this.costFormula.Integrate(this.count, this.count + this.buyAmount).round();
  }

  getMax = () => {
    let amt = this.costFormula.BuyMax(Player.Money, this.count);
    return amt == -1 ? 1 : amt;
  }

  Requirements = [() => new ReactiveText(this.cost.format()), () => Player.Money.greaterThan(this.cost)] as [() => ReactiveText, () => boolean];
  ShowCondition = () => true;
}

class RedSoapAutoSellBonus extends BaseUpgrade {
  name = "Red soap autosell is too slow >:(";
  description = () => new ReactiveText("Not satisfied yet? This upgrade increases the effect of red soap autoseller by 1% per level");
  maxCount = 100;

  private costFormula = new Exponential(new Decimal(957), new Decimal(1.10));
  get cost(): Decimal {
    return this.costFormula.Integrate(this.count, this.count + this.buyAmount).round();
  }

  getMax = () => {
    let amt = this.costFormula.BuyMax(Player.Money, this.count);
    return amt == -1 ? 1 : amt;
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
      amt = amt.add(new Decimal(1000).mul(new Decimal(10).pow(UpgradesData.get(UpgradesKey.BulkUpgrade)?.count! + i)))
    }
    return amt;
  }
  getMax = () => {
    let count = 0;
    let tempCost = new Decimal(1000);
    let currentCount = UpgradesData.get(UpgradesKey.BulkUpgrade)?.count || 0;
    let totalMoney = Player.Money;

    while (count < 9) {
      let nextCost = tempCost.mul(new Decimal(10).pow(currentCount + count));
      if (totalMoney.lessThan(nextCost)) break;
      totalMoney = totalMoney.sub(nextCost);
      tempCost = nextCost;
      count++;
    }

    return count;
  }
  Requirements = [() => new ReactiveText(this.cost.format()), () => Player.Money.greaterThan(this.cost)] as [() => ReactiveText, () => boolean];
  ShowCondition = () => true;
}
class EatRedSoapUpgrade extends BaseUpgrade {
  name = "Learn to eat red soap";
  description = () => new ReactiveText("Why would you do that?");
  maxCount = 1;
  get cost() {
    return new Decimal("2.5e+19");
  }
  Requirements = [() => new ReactiveText(this.cost.format()), () => Player.Money.gt(this.cost)] as [() => ReactiveText, () => boolean];
  ShowCondition = () => true;
}

class UnlockFoundry extends BaseUpgrade {
  name = "Unlock Foundry";
  description = () => new ReactiveText("The last push before cat prestige >:)");
  maxCount = 1;
  get cost() {
    return new Decimal("1e+9");
  }
  Requirements = [() => new ReactiveText(this.cost.format()), () => Player.Money.gt(this.cost)] as [() => ReactiveText, () => boolean];
  ShowCondition = () => true;
}
class CatUpgrade extends BaseUpgrade {
  name = "Buy a.. cat?";
  description = () => new ReactiveText("Quite an expensive kitten");
  maxCount = 1;
  get cost() {
    return new Decimal("1e+33");
  }
  Requirements = [() => new ReactiveText(this.cost.format()), () => Player.Money.gt(this.cost)] as [() => ReactiveText, () => boolean];
  ShowCondition = () => true;
}

UpgradesData.set(UpgradesKey.HoldButtonUpgrade, new HoldButtonUpgrade());
UpgradesData.set(UpgradesKey.SpeedUpgrade, new SpeedUpgrade());
UpgradesData.set(UpgradesKey.QualityUpgrade, new QualityUpgrade());
UpgradesData.set(UpgradesKey.RedSoapAutoSeller, new RedSoapAutoSellter());
UpgradesData.set(UpgradesKey.RedSoapAutoSellBonus, new RedSoapAutoSellBonus());
UpgradesData.set(UpgradesKey.BulkUpgrade, new BulkUpgrade());
UpgradesData.set(UpgradesKey.EatRedSoapUpgrade, new EatRedSoapUpgrade());
UpgradesData.set(UpgradesKey.UnlockFoundry, new UnlockFoundry());
UpgradesData.set(UpgradesKey.CatPrestige, new CatUpgrade());

const saveKey = "upgrades";

SaveSystem.SaveCallback<UpgradeSaveData[]>(saveKey, () => {
  let upgrades: UpgradeSaveData[] = [];
  UpgradesData.forEach((v, k) => {
    upgrades.push({
      upgradesKey: k,
      count: v.count,
      unlocked: v.unlocked,
    })
  })

  return upgrades

});

interface UpgradeSaveData {
  upgradesKey: UpgradesKey;
  count: number;
  unlocked: boolean;
}

SaveSystem.LoadCallback<UpgradeSaveData[]>(saveKey, (data) => {
  log(data.length)
  for (let i = 0; i < data.length; i++) {
    let ele = data[i]
    log("workds")
    let currUpgrade = UpgradesData.get(ele.upgradesKey)!;
    log(currUpgrade)
    currUpgrade.count = ele.count;
    currUpgrade.unlocked = ele.unlocked;

    UpgradesData.set(ele.upgradesKey, currUpgrade);

  }
});
