import { Player } from "../Player.svelte";
import { Decimal } from "../Shared/BreakInfinity/Decimal.svelte";

export class Soap implements ISoapData {
  public Type: SoapType;
  public Tier: number;
  public Amount: Decimal;
  public Quality: Decimal;
  public Progress: Decimal;
  public MaxProgress: Decimal;
  public Unlocked: boolean;

  constructor(data: ISoapData) {
    this.Type = data.Type;
    this.Tier = $state(data.Tier);
    this.Amount = $state(data.Amount);
    this.Quality = $state(data.Quality);
    this.Progress = $state(data.Progress);
    this.MaxProgress = $state(data.MaxProgress);
    this.Unlocked = $state(data.Unlocked);
  }

  public CanSell(amount: Decimal): boolean {
    return amount <= this.Amount;
  }

  public Sell(amount: Decimal) {
    Player.Money = Player.Money.add(this.Quality.mul(amount));
    this.Amount = this.Amount.minus(amount);
  }

  public SoapMade(gain: Decimal) {
    this.Amount = this.Amount.add(gain);
  }
}

export enum SoapPages {
  Sell, Produce, Upgrades
}

export enum SoapType {
  Red = "Red Soap",
  Orange = "Orange Soap",
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
  Tier: number;
  Amount: Decimal;
  Quality: Decimal;
  Progress: Decimal;
  MaxProgress: Decimal;
  Unlocked: boolean;
}

export const SoapData: ISoapData[] = [
  {
    Type: SoapType.Red,
    Tier: 0,
    Amount: Decimal.ZERO,
    Quality: Decimal.ONE,
    Progress: Decimal.ZERO,
    MaxProgress: new Decimal(100),
    Unlocked: true,
  }
]
