import { SvelteMap } from "svelte/reactivity";
import { Player } from "../Player.svelte";
import { Decimal } from "../Shared/BreakInfinity/Decimal.svelte";
import { SaveSystem } from "../Saves";
import { ReactiveText } from "../Shared/ReactiveText.svelte";
import { log } from "console";

export class Soap implements ISoapData {
  public Type: SoapType;
  public Amount: Decimal;
  public EatAmount: Decimal;
  public ProducedAmount: Decimal;
  public MaxProgress: Decimal;
  public Unlocked: boolean;
  public EatMessage: () => ReactiveText;

  constructor(data: ISoapData) {
    this.Type = $state(data.Type);
    this.Amount = $state(data.Amount);
    this.EatAmount = $state(Decimal.ZERO);
    this.ProducedAmount = $state(data.ProducedAmount);
    this.MaxProgress = $state(data.MaxProgress);
    this.Unlocked = $state(data.Unlocked);
    this.EatMessage = $state(data.EatMessage);
  }

  public CanSell(amount: Decimal | number): boolean {
    // equality check with 0 can be skipped here because selling by zero is 0,
    // if negative, then it's the user's problem :)
    return this.Amount.gte(amount);
  }

  public Sell(amount: Decimal, red?: Decimal) {
    let eatMult = Soaps.get(SoapType.Red)?.EatAmount!.div(100).add(Decimal.ONE);
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
  EatMessage: () => ReactiveText;
}

export const SoapData: ISoapData[] = [
  {
    Type: SoapType.Red,
    Amount: Decimal.ZERO,
    ProducedAmount: Decimal.ZERO,
    MaxProgress: new Decimal(100),
    Unlocked: true,
    EatMessage: () => { return new ReactiveText(`Increases sell multiplier by ${Soaps.get(SoapType.Red)?.EatAmount!.div(100)}%`) }
  },
  {
    Type: SoapType.Orange,
    Amount: Decimal.ZERO,
    ProducedAmount: Decimal.ZERO,
    MaxProgress: new Decimal(2500),
    Unlocked: false,
    EatMessage: () => { return new ReactiveText(); }
  },
  {
    Type: SoapType.Yellow,
    Amount: Decimal.ZERO,
    ProducedAmount: Decimal.ZERO,
    MaxProgress: new Decimal(100000),
    Unlocked: false,
    EatMessage: () => { return new ReactiveText(); }
  },
  {
    Type: SoapType.Green,
    Amount: Decimal.ZERO,
    ProducedAmount: Decimal.ZERO,
    MaxProgress: new Decimal(100_000_000),
    Unlocked: false,
    EatMessage: () => { return new ReactiveText(); }
  },
  {
    Type: SoapType.Blue,
    Amount: Decimal.ZERO,
    ProducedAmount: Decimal.ZERO,
    MaxProgress: new Decimal(100),
    Unlocked: false,
    EatMessage: () => { return new ReactiveText(); }
  },
  {
    Type: SoapType.Indigo,
    Amount: Decimal.ZERO,
    ProducedAmount: Decimal.ZERO,
    MaxProgress: new Decimal(100),
    Unlocked: false,
    EatMessage: () => { return new ReactiveText(); }
  },
  {
    Type: SoapType.Violet,
    Amount: Decimal.ZERO,
    ProducedAmount: Decimal.ZERO,
    MaxProgress: new Decimal(100),
    Unlocked: false,
    EatMessage: () => { return new ReactiveText(); }
  },
  {
    Type: SoapType.White,
    Amount: Decimal.ZERO,
    ProducedAmount: Decimal.ZERO,
    MaxProgress: new Decimal(100),
    Unlocked: false,
    EatMessage: () => { return new ReactiveText(); }
  },
  {
    Type: SoapType.Black,
    Amount: Decimal.ZERO,
    ProducedAmount: Decimal.ZERO,
    MaxProgress: new Decimal(100),
    Unlocked: false,
    EatMessage: () => { return new ReactiveText(); }
  },
  {
    Type: SoapType.Rainbow,
    Amount: Decimal.ZERO,
    ProducedAmount: Decimal.ZERO,
    MaxProgress: new Decimal(100),
    Unlocked: false,
    EatMessage: () => { return new ReactiveText(); }
  },
]

export interface SoapSaveData {
  type: SoapType,
  unlocked: boolean,
  amount: Decimal,
  eatamt: Decimal,
  producedamt: Decimal,
}

export const Soaps = new SvelteMap<SoapType, Soap>();
SoapData.forEach((val, idx) => {
  Soaps.set(val.Type, new Soap(SoapData[idx]))
})

SaveSystem.SaveCallback("soap", () => {
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

  return {
    soap: soap
  }
})

SaveSystem.LoadCallback("soap", (_) => {
  Soaps.forEach(data => {
    Soaps.set(data.Type, data);
  })
})
