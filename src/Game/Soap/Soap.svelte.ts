import { Player } from "../Player.svelte";
import { Decimal } from "../Shared/BreakInfinity/Decimal.svelte";
import { SaveSystem } from "../Saves";
import { ReactiveText } from "../Shared/ReactiveText.svelte";
import { log } from "console";
import { UnlockedAchievementCount } from "../Achievements/Achievements.svelte";

export abstract class SoapBase implements ISoapData {
  abstract Type: SoapType;
  abstract MaxProgress: Decimal;
  abstract EatMessage: () => ReactiveText;

  abstract DeccelerateBase: Decimal;
  abstract SpeedCostBase: Decimal;
  abstract SpeedDivisor: Decimal;
  abstract QualityCostBase: Decimal;
  abstract QualityDivisor: Decimal;
  abstract EatReq: Decimal;
  abstract SellPrice: Decimal;
  abstract StyleColor: string;
  abstract DeccelReqBase: Decimal;

  Amount: Decimal = $state(Decimal.ZERO);
  EatAmount: Decimal = $state(Decimal.ZERO);
  ProducedAmount: Decimal = $state(Decimal.ZERO);
  Unlocked: boolean = $state(false);

  public Sell(amount: Decimal, red?: Decimal) {
    let eatMult = Soaps[SoapType.Red]?.EatAmount!.div("5e12").add(Decimal.ONE);
    let sellMult = (UnlockedAchievementCount() * 0.01) + 1;
    let mult = this.SellPrice.mul(eatMult).mul(sellMult)

    Player.Money = Player.Money.add(amount.mul(mult!));
    this.Amount = this.Amount.minus(amount.minus(red ?? 0));
  }

  public SoapMade(gain: Decimal) {
    this.ProducedAmount = this.ProducedAmount.add(gain);
    this.Amount = this.Amount.add(gain);
  }
}

class RedSoap extends SoapBase {
  EatMessage = () => {
    return new ReactiveText(`Sell multiplier: ${(this.EatAmount.div("5e12").format())}x`)
  }
  SellPrice: Decimal = Decimal.ONE;
  DeccelerateBase: Decimal = new Decimal(100);
  DeccelReqBase: Decimal = new Decimal(1000);
  SpeedCostBase: Decimal = new Decimal(7.29);
  SpeedDivisor: Decimal = Decimal.ONE;
  QualityCostBase: Decimal = new Decimal(4.5);
  QualityDivisor: Decimal = Decimal.ONE;
  Type = $state(SoapType.Red);
  MaxProgress = $state(new Decimal(100));
  EatReq = new Decimal("2.5e+14");
  Unlocked = true;
  StyleColor: string = "border-red-400";
}

class OrangeSoap extends SoapBase {
  EatMessage = () => {
    return new ReactiveText(`Improve charge gain by ${this.EatAmount}%`);
  }

  SellPrice: Decimal = new Decimal(5e15);
  DeccelerateBase: Decimal = new Decimal(1000);
  DeccelReqBase: Decimal = new Decimal(1000);
  Type = SoapType.Orange;
  MaxProgress = new Decimal(500);
  EatReq = new Decimal("1e8");
  SpeedCostBase: Decimal = new Decimal(2.186e16);
  QualityCostBase: Decimal = new Decimal(1e16);
  SpeedDivisor: Decimal = new Decimal(100000);
  QualityDivisor: Decimal = new Decimal(100000);
  StyleColor: string = "border-orange-300";
}

class YellowSoap extends SoapBase {
  EatMessage = () => {
    return new ReactiveText(``);
  }

  SellPrice: Decimal = new Decimal(1e18);
  DeccelerateBase: Decimal = new Decimal(100);
  Type = SoapType.Yellow;
  DeccelReqBase: Decimal = new Decimal(1000);
  MaxProgress = new Decimal(100000);
  EatReq = Decimal.ZERO;
  SpeedCostBase: Decimal = Decimal.ONE;
  QualityCostBase: Decimal = Decimal.ONE;
  SpeedDivisor: Decimal = new Decimal(1000);
  QualityDivisor: Decimal = new Decimal(1000);
  StyleColor: string = "border-yellow-300";
}

class GreenSoap extends SoapBase {
  EatMessage = () => {
    return new ReactiveText(``);
  }

  SellPrice: Decimal = new Decimal(1e18);
  DeccelerateBase: Decimal = new Decimal(1000);
  Type = SoapType.Green;
  MaxProgress = new Decimal(100_000_000);
  DeccelReqBase: Decimal = new Decimal(1000);
  EatReq = Decimal.ZERO;
  SpeedCostBase: Decimal = Decimal.ONE;
  QualityCostBase: Decimal = Decimal.ONE;
  SpeedDivisor: Decimal = new Decimal(1000);
  QualityDivisor: Decimal = new Decimal(1000);
  StyleColor: string = "border-green-300";
}

class BlueSoap extends SoapBase {
  EatMessage = () => {
    return new ReactiveText(``);
  }
  DeccelerateBase: Decimal = new Decimal(10000);

  SellPrice: Decimal = new Decimal(1e18);
  Type = SoapType.Blue;
  MaxProgress = new Decimal(100);
  EatReq = Decimal.ZERO;
  DeccelReqBase: Decimal = new Decimal(1000);
  SpeedCostBase: Decimal = Decimal.ONE;
  QualityCostBase: Decimal = Decimal.ONE;
  SpeedDivisor: Decimal = new Decimal(1000);
  QualityDivisor: Decimal = new Decimal(1000);
  StyleColor: string = "border-blue-300";
}

class IndigoSoap extends SoapBase {
  EatMessage = () => {
    return new ReactiveText(``);
  }
  DeccelerateBase: Decimal = new Decimal(100_000);

  SellPrice: Decimal = new Decimal(1e18);
  Type = SoapType.Indigo;
  MaxProgress = new Decimal(100);
  EatReq = Decimal.ZERO;
  SpeedCostBase: Decimal = Decimal.ONE;
  DeccelReqBase: Decimal = new Decimal(1000);
  QualityCostBase: Decimal = Decimal.ONE;
  SpeedDivisor: Decimal = new Decimal(1000);
  QualityDivisor: Decimal = new Decimal(1000);
  StyleColor: string = "border-white-300";
}

class VioletSoap extends SoapBase {
  EatMessage = () => {
    return new ReactiveText(``);
  }

  DeccelerateBase: Decimal = new Decimal(1_000_000);
  SellPrice: Decimal = new Decimal(1e18);

  Type = SoapType.Violet;
  MaxProgress = new Decimal(100);
  EatReq = Decimal.ZERO;
  SpeedCostBase: Decimal = Decimal.ONE;
  DeccelReqBase: Decimal = new Decimal(1000);
  QualityCostBase: Decimal = Decimal.ONE;
  SpeedDivisor: Decimal = new Decimal(1000);
  QualityDivisor: Decimal = new Decimal(1000);
  StyleColor: string = "border-white-300";
}

class WhiteSoap extends SoapBase {
  Type = SoapType.White;
  MaxProgress = new Decimal(100);

  DeccelerateBase: Decimal = new Decimal(10_000_000);
  SellPrice: Decimal = new Decimal(1e18);
  EatMessage = () => {
    return new ReactiveText(``);
  }

  EatReq = Decimal.ZERO;
  SpeedCostBase: Decimal = Decimal.ONE;
  DeccelReqBase: Decimal = new Decimal(1000);
  QualityCostBase: Decimal = Decimal.ONE;
  SpeedDivisor: Decimal = new Decimal(1000);
  QualityDivisor: Decimal = new Decimal(1000);

  StyleColor: string = "border-white-300";
}

class BlackSoap extends SoapBase {
  EatMessage = () => {
    return new ReactiveText(``);
  }
  SellPrice: Decimal = new Decimal(1e18);

  DeccelerateBase: Decimal = new Decimal(100_000_000);

  Type = SoapType.Black;
  MaxProgress = new Decimal(100);
  EatReq = Decimal.ZERO;
  DeccelReqBase: Decimal = new Decimal(1000);
  SpeedCostBase: Decimal = Decimal.ONE;
  QualityCostBase: Decimal = Decimal.ONE;
  SpeedDivisor: Decimal = new Decimal(1000);
  QualityDivisor: Decimal = new Decimal(1000);

  StyleColor: string = "border-white-300";
}

class RainbowSoap extends SoapBase {
  Type = SoapType.Rainbow;
  EatMessage = () => {
    return new ReactiveText(``);
  }

  SellPrice: Decimal = new Decimal(1e18);
  DeccelerateBase: Decimal = new Decimal(1_000_000_000);
  MaxProgress = new Decimal(100);
  EatReq = Decimal.ZERO;
  DeccelReqBase: Decimal = new Decimal(1000);
  SpeedCostBase: Decimal = Decimal.ONE;
  QualityCostBase: Decimal = Decimal.ONE;
  SpeedDivisor: Decimal = new Decimal(1000);
  QualityDivisor: Decimal = new Decimal(1000);

  StyleColor: string = "border-white-300";
}

export enum SoapPages {
  Produce, Upgrades, Foundry
}

export enum SoapType {
  Red,
  Orange,
  Yellow,
  Green,
  Blue,
  Indigo,
  Violet,
  White,
  Black,
  Rainbow
}

export const SoapNameMapping: Record<SoapType, string> = {
  [SoapType.Red]: "Red Soap",
  [SoapType.Orange]: "Orange Soap",
  [SoapType.Yellow]: "Yellow Soap",
  [SoapType.Green]: "Green Soap",
  [SoapType.Blue]: "Blue Soap",
  [SoapType.Indigo]: "Indigo Soap",
  [SoapType.Violet]: "Violet Soap",
  [SoapType.White]: "White Soap",
  [SoapType.Black]: "Black Soap",
  [SoapType.Rainbow]: "Rainbow Soap"
}

export interface ISoapData {
  Type: SoapType;
  Amount: Decimal;
  // @params Lifetime produced amount of the soap
  ProducedAmount: Decimal;
  MaxProgress: Decimal;
  Unlocked: boolean;
  EatAmount: Decimal;
  EatReq: Decimal;
}

export interface SoapSaveData {
  type: SoapType,
  unlocked: boolean,
  amount: Decimal,
  eaten: Decimal,
  produced: Decimal,
}

export const Soaps: Record<SoapType, SoapBase> = $state({
  [SoapType.Red]: new RedSoap(),
  [SoapType.Orange]: new OrangeSoap(),
  [SoapType.Yellow]: new YellowSoap(),
  [SoapType.Green]: new GreenSoap(),
  [SoapType.Blue]: new BlueSoap(),
  [SoapType.Indigo]: new IndigoSoap(),
  [SoapType.Violet]: new VioletSoap(),
  [SoapType.White]: new WhiteSoap(),
  [SoapType.Black]: new BlackSoap(),
  [SoapType.Rainbow]: new RainbowSoap()
})

SaveSystem.SaveCallback<SoapSaveData[]>("soap", () => {
  let soap: SoapSaveData[] = [];
  Object.values(Soaps).forEach((k, v) => {
    soap.push({
      type: v,
      produced: new Decimal(k.ProducedAmount),
      eaten: k.EatAmount,
      unlocked: k.Unlocked,
      amount: k.Amount,
    })
  })

  return soap;
})

SaveSystem.LoadCallback<SoapSaveData[]>("soap", (data) => {
  data.forEach((v, k) => {
    let soapIdx = Object.keys(Soaps)[k] as unknown as keyof typeof Soaps;
    Soaps[soapIdx].ProducedAmount = new Decimal(v.produced);
    Soaps[soapIdx].EatAmount = new Decimal(v.eaten);
    Soaps[soapIdx].Unlocked = v.unlocked;
    Soaps[soapIdx].Amount = new Decimal(v.amount);
  })
})
