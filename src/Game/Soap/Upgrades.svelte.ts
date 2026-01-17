import { InvokeableEvent } from "../Shared/Events";
import { ReactiveText } from "../Shared/ReactiveText.svelte.ts";
import { Decimal } from "../Shared/BreakInfinity/Decimal.svelte.ts";
import { Exponential, ExpPolynomial } from "../Shared/Math.ts";
import { Player } from "../Player.svelte.ts";
import { SaveSystem } from "../Saves.ts";
import type { IUpgradesInfo } from "../../routes/Components/UpgradesInfo.svelte.ts";
import { Soaps, SoapType } from "./Soap.svelte.ts";
import { log } from "console";
import { AchievementKey, UnlockAchievement } from "../Achievements/Achievements.svelte.ts";

export const UpgradeBought: InvokeableEvent<UpgradesKey> = new InvokeableEvent<UpgradesKey>();

export enum UpgradesKey {
  RedSoapAutoSeller,
  RedSoapAutoSellBonus,
  QualityUpgrade,
  SpeedUpgrade,
  RedAutoSellReduction,
  BulkUpgrade,
  EatRedSoapUpgrade,
  UnlockOrangeSoap,
  OrangeSoapAutoSeller,
  OrangeSoapAutoSellBonus,
  OrangeAutoSellReduction,
  RedQualityAutobuy,
  RedSpeedAutobuy,
  UnlockFoundry,
  BulkUpgrade2,
  OrangeQualityAutoBuy,
  OrangeSpeedAutoBuy,
  CatPrestige,
  ChargeSpeedUpgrade,
}

export abstract class BaseUpgrade implements IUpgradesInfo {
  abstract key: UpgradesKey;
  buy = () => {
    if (this.count + this.buyAmount > this.maxCount)
      return;

    Player.Money = Player.Money.minus(this.cost);
    this.count = this.count + this.buyAmount;
    UpgradeBought.invoke(this.key);
  }

  abstract name: string;
  abstract description: () => ReactiveText;
  abstract maxCount: number;
  abstract Requirements: [() => ReactiveText, () => boolean];
  abstract ShowCondition: () => boolean;
  abstract cost: Decimal;
  effect?: () => ReactiveText;
  count: number = $state(0)
  getMax?: () => number = undefined;
  unlocked: boolean = $state(false);
  buyAmount: number = $state(1);
}

class RedSoapAutoSeller extends BaseUpgrade {
  key: UpgradesKey = UpgradesKey.RedSoapAutoSeller
  name = "Mouse brokwn :(";
  description = () => new ReactiveText("Unlocks the red soap autosell. Happy now? Each level decreases the time interval by 5 tick");
  maxCount = 9;

  get cost(): Decimal {
    return new Decimal(this.count + 1).factorial().mul(10).div(8);
  }

  getMax = () => {
    let count = 0;
    let tempCost = Decimal.ZERO;
    while (count < this.maxCount) {
      let nextCost = new Decimal(count).factorial().mul(10);
      tempCost = tempCost.add(nextCost)
      if (Player.Money.lessThan(tempCost)) break;
      count++;
    }
    return count;
  }

  effect = () => {
    return new ReactiveText(`Current Effect: ${30 - 3 * this.count} ticks`);
  }

  Requirements = [() => new ReactiveText(this.cost.format()), () => Player.Money.greaterThan(this.cost)] as [() => ReactiveText, () => boolean];
  ShowCondition = () => true;

}
class QualityUpgrade extends BaseUpgrade {
  key = UpgradesKey.QualityUpgrade;
  name = "Not rich enough!!";
  description = () => new ReactiveText("Improves Producer Quality by 100%, 2x at each 25 levels");
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

  effect = () => {
    return new ReactiveText(`Current Multiplier: ${new Decimal(((this.count) + 1) * Math.pow(2, Math.floor(this.count / 25))).mul(100).format()}%`);
  }

  getMax = () => {
    let amt = this.qualityCost.BuyMax(Player.Money, this.count);
    return amt == -1 ? 1 : amt;
  }

  ShowCondition = () => true;
}
class SpeedUpgrade extends BaseUpgrade {
  key = UpgradesKey.SpeedUpgrade
  name = "It's too slow!!";
  description = () => new ReactiveText("Improves Producer Speed by 100%, 2x at each 25 levels");
  unlocked = true;
  maxCount = 600;

  private speedCost = new ExpPolynomial(new Decimal(365), new Decimal(1.15));
  get cost() {
    return this.speedCost.Integrate(this.count, this.count + this.buyAmount).round();
  }

  effect = () => {
    return new ReactiveText(`Current Multiplier: ${new Decimal(((this.count) + 1) * Math.pow(2, Math.floor(this.count / 25))).mul(100).format()}%`);
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
class RedSoapAutoSellBonus extends BaseUpgrade {
  key = UpgradesKey.RedSoapAutoSellBonus
  name = "Gooder autoseller";
  description = () => new ReactiveText("Still not satisfied yet? This upgrade increases the effect of red soap autoseller by 1% per level");
  maxCount = 99;

  private costFormula = new Exponential(new Decimal(5.7), new Decimal(1.3));
  get cost(): Decimal {
    return this.costFormula.Integrate(this.count, this.count + this.buyAmount).round();
  }

  getMax = () => {
    let amt = this.costFormula.BuyMax(Player.Money, this.count);
    return amt == -1 ? 1 : amt
  }

  effect = () => {
    return new ReactiveText(`Red Soap Conversion: ${this.count}%`);
  }

  Requirements = [() => new ReactiveText(this.cost.format()), () => Player.Money.greaterThan(this.cost)] as [() => ReactiveText, () => boolean];
  ShowCondition = () => true;
}

class RedSoapAutoSellerCostRed extends BaseUpgrade {
  key = UpgradesKey.RedAutoSellReduction
  name = "I have no soap now";
  description = () => new ReactiveText("Too greedy buying the previous upgrade? Reduces the cost deduction of red soap autoseller by 1% per level");
  maxCount = 99;

  private costFormula = new ExpPolynomial(new Decimal(15000), new Decimal(1.3));
  get cost(): Decimal {
    return this.costFormula.Integrate(this.count, this.count + this.buyAmount).round();
  }

  getMax = () => {
    let amt = this.costFormula.BuyMax(Player.Money, this.count);
    return amt == -1 ? 1 : amt
  }

  Requirements = [() => new ReactiveText(this.cost.format()), () => Player.Money.greaterThan(this.cost)] as [() => ReactiveText, () => boolean];
  ShowCondition = () => true;
  effect = () => {
    return new ReactiveText(`Cost Reduction: ${this.count}%`);
  }
}

class BulkUpgrade extends BaseUpgrade {
  key = UpgradesKey.BulkUpgrade
  name = "I Want More!!!";
  description = () => new ReactiveText("Increases Bulk Limit by 1 per level");
  maxCount = 9;
  get cost(): Decimal {
    let amt = Decimal.ZERO;
    for (let i = 0; i < this.buyAmount; i++) {
      amt = amt.add(new Decimal(1000).mul(new Decimal(10).pow(UpgradesData[UpgradesKey.BulkUpgrade].count! + i)))
    }
    return amt;
  }
  getMax = () => {
    let count = 0;
    let tempCost = new Decimal(1000);
    let currentCount = UpgradesData[UpgradesKey.BulkUpgrade].count || 0;

    while (count < this.maxCount) {
      let nextCost = tempCost.mul(new Decimal(10).pow(currentCount + count));
      if (Player.Money.lessThan(nextCost)) break;
      tempCost = nextCost;
      count++;
    }

    return count;
  }

  effect = () => {
    return new ReactiveText(`Bulk amount: ${this.count}`)
  }

  Requirements = [() => new ReactiveText(this.cost.format()), () => Player.Money.greaterThan(this.cost)] as [() => ReactiveText, () => boolean];
  ShowCondition = () => true;
}
class EatRedSoapUpgrade extends BaseUpgrade {
  key = UpgradesKey.EatRedSoapUpgrade
  name = "Learn to eat red soap";
  description = () => new ReactiveText("Why would you do that?");
  maxCount = 1;
  get cost() {
    return new Decimal("2.5e+13");
  }
  Requirements = [() => new ReactiveText(this.cost.format()), () => Player.Money.gt(this.cost)] as [() => ReactiveText, () => boolean];
  ShowCondition = () => true;
}

class RedQualityAutobuy extends BaseUpgrade {
  key = UpgradesKey.RedQualityAutobuy
  name: string = "Red Quality Automation"
  description: () => ReactiveText = () => new ReactiveText("Enjoyed the quick boost? Here's an automation for the red soap producer that you've been neglecting")
  maxCount: number = 1;
  Requirements: [() => ReactiveText, () => boolean] = [
    () => new ReactiveText(this.cost.format()), () => Player.Money.gte(this.cost)
  ]

  ShowCondition: () => boolean = () => UpgradesData[UpgradesKey.UnlockOrangeSoap].count > 0;
  get cost() {
    return new Decimal("2.5e+20")
  }
}

class RedSpeedAutobuy extends BaseUpgrade {
  key = UpgradesKey.RedSpeedAutobuy;
  name: string = "Red Speed Automation"
  description: () => ReactiveText = () => new ReactiveText("Here's another one")
  maxCount: number = 1;
  Requirements: [() => ReactiveText, () => boolean] = [
    () => new ReactiveText(this.cost.format()), () => Player.Money.gte(this.cost)]

  ShowCondition: () => boolean = () => UpgradesData[UpgradesKey.UnlockOrangeSoap].count > 0;
  get cost() {
    return new Decimal("2.5e+20")
  }
}

class UnlockFoundry extends BaseUpgrade {
  key = UpgradesKey.UnlockFoundry
  name = "Unlock Foundry";
  description = () => new ReactiveText("The last push before cat prestige >:)");
  maxCount = 1;
  get cost() {
    return new Decimal("2.5e+24");
  }
  Requirements = [() => new ReactiveText(this.cost.format()), () => Player.Money.gt(this.cost)] as [() => ReactiveText, () => boolean];
  ShowCondition = () => true;
}

class BulkUpgrade2 extends BaseUpgrade {
  key = UpgradesKey.BulkUpgrade2
  name = "Bulked up";
  description = () => new ReactiveText("Increases Bulk Limit by 1 per level, you must really hate clicking on upgrades.");
  maxCount = 15;
  get cost(): Decimal {
    let amt = Decimal.ZERO;
    for (let i = 0; i < this.buyAmount; i++) {
      amt = amt.add(new Decimal(1000).mul(new Decimal(10).pow(UpgradesData[UpgradesKey.BulkUpgrade].count! + i)))
    }
    return amt;
  }
  getMax = () => {
    let count = 0;
    let tempCost = new Decimal("2.5e+25");
    let currentCount = UpgradesData[UpgradesKey.BulkUpgrade].count || 0;

    while (count < this.maxCount) {
      let nextCost = tempCost.mul(new Decimal(10).pow(currentCount + count));
      if (Player.Money.lessThan(nextCost)) break;
      tempCost = nextCost;
      count++;
    }

    return count;
  }

  effect = () => {
    return new ReactiveText(`Bulk amount: ${this.count}`)
  }

  Requirements = [() => new ReactiveText(this.cost.format()), () => Player.Money.greaterThan(this.cost)] as [() => ReactiveText, () => boolean];
  ShowCondition = () => true;
}

class UnlockOrangeSoap extends BaseUpgrade {
  key = UpgradesKey.UnlockOrangeSoap
  name = "Unlock orange soap";
  description = () => new ReactiveText("Oranges are orange");
  maxCount = 1;
  get cost() {
    return new Decimal("1e+18");
  }
  buy: () => void = () => {
    if (this.count + this.buyAmount > this.maxCount)
      return;

    Player.Money = Player.Money.minus(this.cost);
    this.count = this.count + this.buyAmount;

    UnlockAchievement(AchievementKey.OrangeSoap);
    Soaps[SoapType.Orange].Unlocked = true;
  }
  Requirements = [() => new ReactiveText(this.cost.format()), () => Player.Money.gt(this.cost)] as [() => ReactiveText, () => boolean];
  ShowCondition = () => true;
}


class OrangeSoapAutoSeller extends BaseUpgrade {
  key = UpgradesKey.OrangeSoapAutoSeller
  name = "Mouse brokwn (again) :(";
  description = () => new ReactiveText("Unlocks orange soap autosell. I'm pretty sure you're tired at clicking the sell button");
  maxCount = 9;

  get cost(): Decimal {
    return new Decimal(this.count + 1).factorial().mul(1e19);
  }

  getMax = () => {
    let count = 0;
    let tempCost = Decimal.ZERO;
    while (count < this.maxCount) {
      let nextCost = new Decimal(count + 1).factorial().mul(1e19);
      tempCost = tempCost.add(nextCost)
      if (Player.Money.lessThan(tempCost)) break;
      count++;
    }
    return count;
  }

  effect = () => {
    return new ReactiveText(`Current Effect: ${30 - 3 * this.count} ticks`);
  }

  Requirements = [() => new ReactiveText(this.cost.format()), () => Player.Money.greaterThan(this.cost)] as [() => ReactiveText, () => boolean];
  ShowCondition = () => true;

}

class OrangeSoapAutoSellBonus extends BaseUpgrade {
  key = UpgradesKey.OrangeSoapAutoSellBonus
  name = "Goder orange autoseller";
  description = () => new ReactiveText("Same as the red one");
  maxCount = 99;

  private costFormula = new Exponential(new Decimal(9.57e19), new Decimal(1.3));
  get cost(): Decimal {
    return this.costFormula.Integrate(this.count, this.count + this.buyAmount).round();
  }

  getMax = () => {
    let amt = this.costFormula.BuyMax(Player.Money, this.count);
    return amt == -1 ? 1 : amt
  }

  effect = () => {
    return new ReactiveText(`Orange Soap Conversion: ${this.count}%`);
  }

  Requirements = [() => new ReactiveText(this.cost.format()), () => Player.Money.greaterThan(this.cost)] as [() => ReactiveText, () => boolean];
  ShowCondition = () => true;
}


class OrangeSoapAutoSellReduction extends BaseUpgrade {
  key = UpgradesKey.OrangeAutoSellReduction
  name = "I need orange soap";
  description = () => new ReactiveText("Too greedy buying the previous upgrade? Reduces the cost deduction of red soap autoseller by 1% per level");
  maxCount = 99;

  private costFormula = new ExpPolynomial(new Decimal(1.5e20), new Decimal(1.3));
  get cost(): Decimal {
    return this.costFormula.Integrate(this.count, this.count + this.buyAmount).round();
  }

  getMax = () => {
    let amt = this.costFormula.BuyMax(Player.Money, this.count);
    return amt == -1 ? 1 : amt
  }

  Requirements = [() => new ReactiveText(this.cost.format()), () => Player.Money.greaterThan(this.cost)] as [() => ReactiveText, () => boolean];
  ShowCondition = () => true;
  effect = () => {
    return new ReactiveText(`Cost Reduction: ${this.count}%`);
  }
}
class OrangeQualityAutobuy extends BaseUpgrade {
  key = UpgradesKey.OrangeQualityAutoBuy
  name: string = "Orange Quality Autobuy"
  description: () => ReactiveText = () => new ReactiveText("I hope you like eating red soap.")
  maxCount: number = 1;
  Requirements: [() => ReactiveText, () => boolean] = [
    () => new ReactiveText(this.cost.format()), () => Player.Money.gte(this.cost)
  ]

  ShowCondition: () => boolean = () => UpgradesData[UpgradesKey.UnlockOrangeSoap].count > 0;
  get cost() {
    return new Decimal("2.5e+32")
  }
}

class OrangeSpeedAutoBuy extends BaseUpgrade {
  key = UpgradesKey.RedSpeedAutobuy;
  name: string = "Orange Speed Autobuy"
  description: () => ReactiveText = () => new ReactiveText("Zooooooooooooooooooooom")
  maxCount: number = 1;
  Requirements: [() => ReactiveText, () => boolean] = [
    () => new ReactiveText(this.cost.format()), () => Player.Money.gte(this.cost)]

  ShowCondition: () => boolean = () => UpgradesData[UpgradesKey.UnlockOrangeSoap].count > 0;
  get cost() {
    return new Decimal("2.5e+32")
  }
}

class CatUpgrade extends BaseUpgrade {
  key = UpgradesKey.CatPrestige
  name = "Buy a.. cat?";
  description = () => new ReactiveText("Quite an expensive kitten");
  maxCount = 1;
  get cost() {
    return new Decimal("2.5e+43");
  }
  Requirements = [() => new ReactiveText(this.cost.format()), () => Player.Money.gt(this.cost)] as [() => ReactiveText, () => boolean];
  ShowCondition = () => Player.Charge.gt(1000);
}

class ChargeSpeedUpgrade extends BaseUpgrade {
  key = UpgradesKey.ChargeSpeedUpgrade
  name = "Charge Speed";
  description = () => new ReactiveText("Improves Charge Gain by 100%");
  unlocked = true;
  maxCount = 600;

  private formula = new ExpPolynomial(new Decimal(1e24), new Decimal(1.20));
  get cost() {
    return this.formula.Integrate(this.count, this.count + this.buyAmount).round();
  }
  Requirements = [
    () => {
      return new ReactiveText(this.cost.format())
    },
    () => {
      return Player.Money.gte(this.cost) && this.count < this.maxCount
    }
  ] as [() => ReactiveText, () => boolean];

  effect = () => {
    return new ReactiveText(`Current Multiplier: ${new Decimal(((this.count) + 1) * Math.pow(2, Math.floor(this.count / 25))).mul(100).format()}%`);
  }

  getMax = () => {
    let amt = this.formula.BuyMax(Player.Money, this.count);
    return amt == -1 ? 1 : amt;
  }

  ShowCondition = () => false;

}

export const UpgradesData: Record<UpgradesKey, BaseUpgrade> = $state({
  [UpgradesKey.RedSoapAutoSeller]: new RedSoapAutoSeller(),
  [UpgradesKey.RedSoapAutoSellBonus]: new RedSoapAutoSellBonus(),
  [UpgradesKey.QualityUpgrade]: new QualityUpgrade(),
  [UpgradesKey.SpeedUpgrade]: new SpeedUpgrade(),
  [UpgradesKey.BulkUpgrade]: new BulkUpgrade(),
  [UpgradesKey.RedAutoSellReduction]: new RedSoapAutoSellerCostRed(),
  [UpgradesKey.EatRedSoapUpgrade]: new EatRedSoapUpgrade(),
  [UpgradesKey.UnlockOrangeSoap]: new UnlockOrangeSoap(),
  [UpgradesKey.RedQualityAutobuy]: new RedQualityAutobuy(),
  [UpgradesKey.RedSpeedAutobuy]: new RedSpeedAutobuy(),
  [UpgradesKey.OrangeSoapAutoSeller]: new OrangeSoapAutoSeller(),
  [UpgradesKey.OrangeSoapAutoSellBonus]: new OrangeSoapAutoSellBonus(),
  [UpgradesKey.OrangeAutoSellReduction]: new OrangeSoapAutoSellReduction(),
  [UpgradesKey.UnlockFoundry]: new UnlockFoundry(),
  [UpgradesKey.BulkUpgrade2]: new BulkUpgrade2(),
  [UpgradesKey.OrangeSpeedAutoBuy]: new OrangeSpeedAutoBuy(),
  [UpgradesKey.OrangeQualityAutoBuy]: new OrangeQualityAutobuy(),
  [UpgradesKey.ChargeSpeedUpgrade]: new ChargeSpeedUpgrade(),
  [UpgradesKey.CatPrestige]: new CatUpgrade(),
});

const saveKey = "upgrades";

SaveSystem.SaveCallback<UpgradeSaveData[]>(saveKey, () => {
  const upgrades: UpgradeSaveData[] = [];
  Object.values(UpgradesData).forEach((value, index) => {
    upgrades.push({
      key: index,
      count: value.count,
      unlocked: value.unlocked,
    });
  });
  return upgrades;
});

SaveSystem.LoadCallback<UpgradeSaveData[]>(saveKey, (data) => {
  data.forEach((entry, index) => {
    const key = Object.keys(UpgradesData)[index] as unknown as keyof typeof UpgradesData;
    UpgradesData[key].count = entry.count;
    UpgradesData[key].unlocked = entry.unlocked;
  });
});

interface UpgradeSaveData {
  key: UpgradesKey;
  count: number;
  unlocked: boolean;
}

export function ResetUpgrades() {
  const exceptions = [
    UpgradesKey.RedSpeedAutobuy,
    UpgradesKey.RedQualityAutobuy,
    UpgradesKey.BulkUpgrade,
    UpgradesKey.EatRedSoapUpgrade,
    UpgradesKey.RedSoapAutoSeller,
    UpgradesKey.OrangeSoapAutoSeller,
    UpgradesKey.UnlockOrangeSoap,
    UpgradesKey.UnlockFoundry,
    UpgradesKey.BulkUpgrade2,
    UpgradesKey.OrangeSpeedAutoBuy,
    UpgradesKey.OrangeQualityAutoBuy,
    UpgradesKey.CatPrestige,
  ];

  const exceptionCounts = new Map<UpgradesKey, number>();
  exceptions.forEach(key => {
    exceptionCounts.set(key, UpgradesData[key].count);
  });

  Object.values(UpgradesData).forEach(upgrade => {
    upgrade.count = 0;
  });

  exceptionCounts.forEach((count, key) => {
    UpgradesData[key].count = count;
  });
}
