import { Player } from "../Player.svelte";
import { Decimal } from "../Shared/BreakInfinity/Decimal.svelte";
import { SaveSystem } from "../Saves";
import { ReactiveText } from "../Shared/ReactiveText.svelte";
import { log } from "console";

export abstract class SoapBase implements ISoapData {
  abstract Type: SoapType;
  Amount: Decimal = $state(Decimal.ZERO);
  EatAmount: Decimal = $state(Decimal.ZERO);
  ProducedAmount: Decimal = $state(Decimal.ZERO);
  abstract MaxProgress: Decimal;
  abstract EatMessage: () => ReactiveText;
  Unlocked: boolean = $state(false);
  abstract EatReq: Decimal;

  public CanSell(amount: Decimal | number): boolean {
    // equality check with 0 can be skipped here because selling by zero is 0,
    // if negative, then it's the user's problem :)
    return this.Amount.gte(amount);
  }

  public Sell(amount: Decimal) {
    let eatMult = this.EatAmount.gt(0) ? (this.EatAmount.div("5e12")) : 1;
    let mult = eatMult;

    Player.Money = Player.Money.add(amount.mul(mult!));
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

  Type = $state(SoapType.Red);
  MaxProgress = $state(new Decimal(100));
  EatReq = new Decimal("1e+13");
  Unlocked = true;
}

class OrangeSoap extends SoapBase {
  EatMessage = () => {
    return new ReactiveText(``);
  }
  Type = SoapType.Orange;
  MaxProgress = new Decimal(2500);
  EatReq = Decimal.ZERO;
}

class YellowSoap extends SoapBase {
  EatMessage = () => {
    return new ReactiveText(``);
  }
  Type = SoapType.Yellow;
  MaxProgress = new Decimal(100000);
  EatReq = Decimal.ZERO;
}

class GreenSoap extends SoapBase {
  EatMessage = () => {
    return new ReactiveText(``);
  }
  Type = SoapType.Green;
  MaxProgress = new Decimal(100_000_000);
  EatReq = Decimal.ZERO;
}

class BlueSoap extends SoapBase {
  EatMessage = () => {
    return new ReactiveText(``);
  }
  Type = SoapType.Blue;
  MaxProgress = new Decimal(100);
  EatReq = Decimal.ZERO;
}

class IndigoSoap extends SoapBase {
  EatMessage = () => {
    return new ReactiveText(``);
  }

  Type = SoapType.Indigo;
  MaxProgress = new Decimal(100);
  EatReq = Decimal.ZERO;
}

class VioletSoap extends SoapBase {
  EatMessage = () => {
    return new ReactiveText(``);
  }

  Type = SoapType.Violet;
  MaxProgress = new Decimal(100);
  EatReq = Decimal.ZERO;
}

class WhiteSoap extends SoapBase {
  Type = SoapType.White;
  MaxProgress = new Decimal(100);
  EatMessage = () => {
    return new ReactiveText(``);
  }

  EatReq = Decimal.ZERO;
}

class BlackSoap extends SoapBase {
  EatMessage = () => {
    return new ReactiveText(``);
  }

  Type = SoapType.Black;
  MaxProgress = new Decimal(100);
  EatReq = Decimal.ZERO;
}

class RainbowSoap extends SoapBase {
  Type = SoapType.Rainbow;
  EatMessage = () => {
    return new ReactiveText(``);
  }

  MaxProgress = new Decimal(100);
  EatReq = Decimal.ZERO;
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
  eatamt: Decimal,
  producedamt: Decimal,
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
  for (const [k, v] of Object.entries(Soaps)) {
    soap.push({
      type: SoapType[k as keyof typeof SoapType],
      producedamt: new Decimal(v.ProducedAmount),
      eatamt: v.EatAmount,
      unlocked: v.Unlocked,
      amount: v.Amount,
    })

  }

  return soap;
})

SaveSystem.LoadCallback<SoapSaveData[]>("soap", (data) => {
  for (const [k, v] of Object.entries(data)) {
    let soapIdx = SoapType[k as keyof typeof SoapType];
    Soaps[soapIdx].ProducedAmount = new Decimal(v.producedamt);
    Soaps[soapIdx].EatAmount = new Decimal(v.eatamt);
    Soaps[soapIdx].Unlocked = v.unlocked;
    Soaps[soapIdx].Amount = new Decimal(v.amount);
  }
})
