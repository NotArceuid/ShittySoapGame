import { SvelteMap } from "svelte/reactivity";
import { Player } from "../Player.svelte";
import { Decimal } from "../Shared/BreakInfinity/Decimal.svelte";
import { SaveSystem } from "../Saves";

export class Soap implements ISoapData {
  public Type: SoapType;
  public Amount: Decimal;
  public ProducedAmount: Decimal;
  public Quality: Decimal;
  public Progress: Decimal;
  public MaxProgress: Decimal;
  public Unlocked: boolean;

  constructor(data: ISoapData) {
    this.Type = $state(data.Type);
    this.Amount = $state(data.Amount);
    this.ProducedAmount = $state(data.ProducedAmount);
    this.Quality = $state(data.Quality);
    this.Progress = $state(data.Progress);
    this.MaxProgress = $state(data.MaxProgress);
    this.Unlocked = $state(data.Unlocked);
  }

  public CanSell(amount: Decimal | number): boolean {
    // equality check with 0 can be skipped here because selling by zero is 0,
    // if negative, then it's the user's problem :)
    return this.Amount.gte(amount);
  }

  public Sell(amount: Decimal | number) {
    Player.Money = Player.Money.add(this.Quality.mul(amount));
    this.Amount = this.Amount.minus(amount);
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
  Quality: Decimal;
  Progress: Decimal;
  MaxProgress: Decimal;
  Unlocked: boolean;
}

export const SoapData: ISoapData[] = [
  {
    Type: SoapType.Red,
    Amount: Decimal.ZERO,
    ProducedAmount: Decimal.ZERO,
    Quality: Decimal.ONE,
    Progress: Decimal.ZERO,
    MaxProgress: new Decimal(100),
    Unlocked: true,
  },
  {
    Type: SoapType.Orange,
    Amount: Decimal.ZERO,
    ProducedAmount: Decimal.ZERO,
    Quality: Decimal.ONE,
    Progress: Decimal.ZERO,
    MaxProgress: new Decimal(2500),
    Unlocked: false,
  },
  {
    Type: SoapType.Yellow,
    Amount: Decimal.ZERO,
    ProducedAmount: Decimal.ZERO,
    Quality: Decimal.ONE,
    Progress: Decimal.ZERO,
    MaxProgress: new Decimal(100000),
    Unlocked: false,
  },
  {
    Type: SoapType.Green,
    Amount: Decimal.ZERO,
    ProducedAmount: Decimal.ZERO,
    Quality: Decimal.ONE,
    Progress: Decimal.ZERO,
    MaxProgress: new Decimal(100_000_000),
    Unlocked: false,
  },
  {
    Type: SoapType.Blue,
    Amount: Decimal.ZERO,
    ProducedAmount: Decimal.ZERO,
    Quality: Decimal.ONE,
    Progress: Decimal.ZERO,
    MaxProgress: new Decimal(100),
    Unlocked: false,
  },
  {
    Type: SoapType.Indigo,
    Amount: Decimal.ZERO,
    ProducedAmount: Decimal.ZERO,
    Quality: Decimal.ONE,
    Progress: Decimal.ZERO,
    MaxProgress: new Decimal(100),
    Unlocked: false,
  },
  {
    Type: SoapType.Violet,
    Amount: Decimal.ZERO,
    ProducedAmount: Decimal.ZERO,
    Quality: Decimal.ONE,
    Progress: Decimal.ZERO,
    MaxProgress: new Decimal(100),
    Unlocked: false,
  },
  {
    Type: SoapType.White,
    Amount: Decimal.ZERO,
    ProducedAmount: Decimal.ZERO,
    Quality: Decimal.ONE,
    Progress: Decimal.ZERO,
    MaxProgress: new Decimal(100),
    Unlocked: false,
  },
  {
    Type: SoapType.Black,
    Amount: Decimal.ZERO,
    ProducedAmount: Decimal.ZERO,
    Quality: Decimal.ONE,
    Progress: Decimal.ZERO,
    MaxProgress: new Decimal(100),
    Unlocked: false,
  },
  {
    Type: SoapType.Rainbow,
    Amount: Decimal.ZERO,
    ProducedAmount: Decimal.ZERO,
    Quality: Decimal.ONE,
    Progress: Decimal.ZERO,
    MaxProgress: new Decimal(100),
    Unlocked: false,
  },
]

export interface SoapSaveData {
  type: SoapType,
  progress: Decimal,
  unlocked: boolean,
  amount: Decimal
  producedAmount: Decimal,
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
      progress: v.Progress,
      producedAmount: v.ProducedAmount,
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
