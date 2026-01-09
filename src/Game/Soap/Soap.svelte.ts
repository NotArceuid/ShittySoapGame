import { SvelteMap } from "svelte/reactivity";
import { Player } from "../Player.svelte";
import { Decimal } from "../Shared/BreakInfinity/Decimal.svelte";
import { SaveSystem } from "../Saves";
import { ReactiveText } from "../Shared/ReactiveText.svelte";

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

  public Sell(amount: Decimal, red?: Decimal) {
    let eatMult = this.EatAmount.gt(0) ? Decimal.log10(this.EatAmount.add(2)) + 1 : 1;
    let mult = eatMult;

    Player.Money = Player.Money.add(amount.mul(mult!));
    this.Amount = this.Amount.minus(amount.minus(red ?? 0));
  }

  public Eat(amount: Decimal) {
    this.Amount = this.Amount.minus(amount);
    this.EatAmount = this.EatAmount.add(amount);
  }

  public SoapMade(gain: Decimal) {
    this.ProducedAmount = this.ProducedAmount.add(gain);
    this.Amount = this.Amount.add(gain);
  }
}

class RedSoap extends SoapBase {
  EatMessage = () => {
    return new ReactiveText(`Increases sell multiplier by ${Math.round(Decimal.log10(this.EatAmount.add(2)) + 1)}`)
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
  Red = "Red Soap",
  Orange = "Orange Soap",
  Yellow = "Yellow Soap",
  Green = "Green Soap",
  Blue = "Blue Soap",
  Indigo = "Indigo Soap",
  Violet = "Violet Soap",
  White = "White Soap",
  Black = "Black Soap",
  Rainbow = "Rainbow Soap"
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

export const Soaps = new SvelteMap<SoapType, SoapBase>();
Soaps.set(SoapType.Red, new RedSoap());

SaveSystem.SaveCallback<SoapSaveData[]>("soap", () => {
  let soap: SoapSaveData[] = [];
  Soaps.forEach((v, k) => {
    soap.push({
      type: k,
      producedamt: v.ProducedAmount,
      eatamt: v.EatAmount,
      unlocked: v.Unlocked,
      amount: v.Amount,
    })
  })

  return soap;
})

SaveSystem.LoadCallback<SoapSaveData[]>("soap", (data) => {
  for (let i = 0; i < data.length; i++) {
    const soapData = data[i];
    let soap = Soaps.get(soapData.type)!;
    soap.ProducedAmount = new Decimal(soapData.producedamt);
    soap.EatAmount = new Decimal(soapData.eatamt);
    soap.Unlocked = soapData.unlocked;
    soap.Amount = new Decimal(soapData.amount);
    Soaps.set(soapData.type, soap);
  }
})
