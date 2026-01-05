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
  Hold, SellButton, Bulk, MaxBulk, SpeedUpgrade,
  QualityUpgrade, OCD, TierUp, OrangeSoap,
  EatRedSoap, Cat
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
  buyAmount: number = $state(0);
}

class HoldUpgrade extends BaseUpgrade {
  name = "Hold to sell";
  description = () => new ReactiveText("Unlocks the ability to sell soap by holding the mouse button ");
  maxCount = 1;
  Requirements = [() => new ReactiveText("Cost: 25"), () => Player.Money.gte(25)] as [() => ReactiveText, () => boolean];
  ShowCondition = () => true;
}

class MaxBulkUpgrade extends BaseUpgrade {
  name = "My fingers still hurt!!";
  description = () => new ReactiveText("Oh, you thought gatekeeping qol upgrades behind upgrades is over? Here, take this.. Buy max option");
  maxCount = 1;
  Requirements = [() => new ReactiveText("Cost: 25,000"), () => true] as [() => ReactiveText, () => boolean];
  ShowCondition = () => true;
}

class SpeedUpgrade extends BaseUpgrade {
  name = "It's too slow!!";
  description = () => new ReactiveText("Improves Producer Speed by 100%");
  unlocked = true;
  maxCount = 700;
  buyAmount = $state(1);
  private speedCost = new ExpPolynomial(new Decimal(100), new Decimal(1.15));

  Requirements = [
    () => {
      return new ReactiveText(`Cost: ${this.speedCost.Integrate(this.count, this.count + this.buyAmount).format()}`)
    },
    () => {
      return Player.Money.gte(this.speedCost.Integrate(this.count, this.count + this.buyAmount)) && this.count < this.maxCount
    }
  ] as [() => ReactiveText, () => boolean];

  getMax = () => {
    let amt = this.speedCost.BuyMax(Player.Money, this.count);
    return amt == -1 ? 1 : amt;
  }

  ShowCondition = () => true;
}

class QualityUpgrade extends BaseUpgrade {
  name = "Not rich enough!!";
  description = () => new ReactiveText("Improves Producer Quality by 100%");
  unlocked = true;
  maxCount = 600;
  buyAmount = $state(1);
  private qualityCost = new ExpPolynomial(new Decimal(100), new Decimal(1.17));

  Requirements = [
    () => {
      return new ReactiveText(`Cost: ${this.qualityCost.Integrate(this.count, this.count + this.buyAmount).format()}`)
    },
    () => {
      return Player.Money.gte(this.qualityCost.Integrate(this.count, this.count + this.buyAmount)) && this.count < this.maxCount
    }
  ] as [() => ReactiveText, () => boolean];

  getMax = () => {
    let amt = this.qualityCost.BuyMax(Player.Money, this.count);
    return amt == -1 ? 1 : amt;
  }

  ShowCondition = () => true;
}

class HoldButtonUpgrade extends BaseUpgrade {
  name = "Mouse broken?";
  description = () => new ReactiveText("Unlock the ability to sell by holding the [S] key (this works anywhere btw)");
  maxCount = 1;
  Requirements = [() => new ReactiveText("Cost: 75"), () => Player.Money.gte(75)] as [() => ReactiveText, () => boolean];
  ShowCondition = () => true;
}

class BulkUpgrade extends BaseUpgrade {
  name = "Grr my fingers hurt!!";
  description = () => new ReactiveText("Unlocks the ability to buy upgrades in batches of 1, 10, 25 and 100");
  maxCount = 1;
  Requirements = [() => new ReactiveText("Cost: 1,000"), () => Player.Money.greaterThan(1000)] as [() => ReactiveText, () => boolean];
  ShowCondition = () => true;
}


class OCDUpgrade extends BaseUpgrade {
  name = "Do you have OCD?";
  description = () => new ReactiveText("Unlock OCD buy.. hehe");
  maxCount = 1;
  Requirements = [() => new ReactiveText("Cost: 24999.98"), () => Player.Money.gt(24999.98)] as [() => ReactiveText, () => boolean];
  ShowCondition = () => true;
}

class TierUpUpgrade extends BaseUpgrade {
  name = "Promotions";
  description = () => new ReactiveText("Unlock Tier up");
  maxCount = 1;
  Requirements = [() => new ReactiveText("Cost: 100,000"), () => Player.Money.gt(100000)] as [() => ReactiveText, () => boolean];
  ShowCondition = () => true;
}

class OrangeSoapUpgrade extends BaseUpgrade {
  name = "Unlock orange soap";
  description = () => new ReactiveText("I hope they don't contain any harmful chemicals");
  maxCount = 1;
  Requirements = [() => new ReactiveText("Cost: 1.00m"), () => Player.Money.gt(1000000)] as [() => ReactiveText, () => boolean];
  ShowCondition = () => true;
}

class EatRedSoapUpgrade extends BaseUpgrade {
  name = "Learn to eat red soap";
  description = () => new ReactiveText("Why would you do that?");
  maxCount = 1;
  Requirements = [() => new ReactiveText("Cost: 2.50m"), () => Player.Money.gt(2500000)] as [() => ReactiveText, () => boolean];
  ShowCondition = () => true;
}

class CatUpgrade extends BaseUpgrade {
  name = "Buy a.. cat?";
  description = () => new ReactiveText("Quite an expensive kitten");
  maxCount = 1;
  Requirements = [() => new ReactiveText("Cost: 5.00m"), () => Player.Money.gt("5e6")] as [() => ReactiveText, () => boolean];
  ShowCondition = () => true;
}
UpgradesData.set(UpgradesKey.Hold, new HoldUpgrade());
UpgradesData.set(UpgradesKey.SellButton, new HoldButtonUpgrade());
UpgradesData.set(UpgradesKey.SpeedUpgrade, new SpeedUpgrade());
UpgradesData.set(UpgradesKey.QualityUpgrade, new QualityUpgrade());
UpgradesData.set(UpgradesKey.Bulk, new BulkUpgrade());
UpgradesData.set(UpgradesKey.MaxBulk, new MaxBulkUpgrade());
UpgradesData.set(UpgradesKey.OCD, new OCDUpgrade());
UpgradesData.set(UpgradesKey.TierUp, new TierUpUpgrade());
UpgradesData.set(UpgradesKey.OrangeSoap, new OrangeSoapUpgrade());
UpgradesData.set(UpgradesKey.EatRedSoap, new EatRedSoapUpgrade());
UpgradesData.set(UpgradesKey.Cat, new CatUpgrade());

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
