import { SaveSystem } from "../Saves";
import { InvokeableEvent } from "../Shared/Events";
import { ReactiveText } from "../Shared/ReactiveText.svelte";
import type { IUpgradesInfo } from "../../routes/Components/UpgradesInfo.svelte.ts";
import { Exponential, ExpPolynomial } from "../Shared/Math";
import { Decimal } from "../Shared/BreakInfinity/Decimal.svelte";
import { Player } from "../Player.svelte";
import { Soaps } from "../Soap/Soap.svelte";
import { number } from "svelte-i18n";

export const UnlockGenerators: InvokeableEvent<GeneratorsKey> = new InvokeableEvent<GeneratorsKey>();

export enum GeneratorsKey {
  ChargeSpeed, ChargePower, TicketConversion
}

export abstract class BaseGenerator implements IUpgradesInfo {
  abstract buy: () => void;
  abstract name: string;
  abstract description: () => ReactiveText;
  abstract maxCount: number;
  abstract Requirements: [() => ReactiveText, () => boolean];
  abstract ShowCondition: () => boolean;
  count: number = $state(0)
  effect?: (() => ReactiveText) | undefined;
  getMax: () => number = () => { return 1 }
  unlocked: boolean = $state(false);
  buyAmount: number = $state(1);
}

class ChargeSpeed extends BaseGenerator {
  unlocked: boolean = true;
  private formula = new ExpPolynomial(new Decimal("1.0618e+20"), new Decimal(2.5));
  private get cost() {
    return this.formula.Integrate(this.count, this.count + this.buyAmount);
  }
  buy: () => void = () => {
    if (Soaps[0].Amount.lt(this.cost))
      return;
    Soaps[0].Amount = Soaps[0].Amount.minus(this.cost);
    this.count += this.buyAmount;
  };
  name: string = "Charge Speed"
  description: () => ReactiveText = () => new ReactiveText("Increases Charge Gain by 0.25 per level");
  effect: (() => ReactiveText) = () => new ReactiveText(`Gain: ${this.count * 0.25} `);
  maxCount: number = 999;
  Requirements: [() => ReactiveText, () => boolean] = [() => new ReactiveText(`${this.cost.format()} Red Soap`), () => Soaps[0].Amount.gt(this.cost)];
  ShowCondition: () => boolean = () => true;
}

class ChargePower extends BaseGenerator {
  private formula = new ExpPolynomial(new Decimal(10), new Decimal(2));
  private get cost() {
    return this.formula.Integrate(this.count, this.count + this.buyAmount);
  }
  buy: () => void = () => {
    if (Soaps[1].Amount.lt(this.cost))
      return;

    Soaps[1].Amount = Soaps[1].Amount.minus(this.cost);
    this.count += this.buyAmount;
  }
  name: string = "Charge Power"
  description: () => ReactiveText = () => new ReactiveText("Increases the power of charge milestones by 100% per level")
  effect: (() => ReactiveText) = () => new ReactiveText(`${this.count * 100}% Gain`);
  maxCount: number = 999;
  Requirements: [() => ReactiveText, () => boolean] = [() => new ReactiveText(`${this.cost.format()} Orange Soap`), () => Soaps[1].Amount.gt(this.cost)];
  ShowCondition: () => boolean = () => true;
}

class TicketConversion extends BaseGenerator {
  private formula = new Exponential(new Decimal(121.3), new Decimal(2));
  private get cost() {
    return this.formula.Integrate(this.count, this.count + this.buyAmount);
  }
  buy: () => void = () => {
    if (Player.Money.lt(this.cost))
      return;

    Player.Charge = Player.Charge.minus(this.cost);
  }
  name: string = "Ticket Conversion"
  description: () => ReactiveText = () => new ReactiveText("Converts your excess charge into tickets..")
  maxCount: number = 1e308;
  Requirements: [() => ReactiveText, () => boolean] = [() => new ReactiveText(`${this.cost.format()} Charge`), () => Player.Charge.gt(this.cost)];
  ShowCondition: () => boolean = () => true;
}

export const GeneratorsData: Record<GeneratorsKey, BaseGenerator> = $state({
  [GeneratorsKey.ChargeSpeed]: new ChargeSpeed(),
  [GeneratorsKey.ChargePower]: new ChargePower(),
  [GeneratorsKey.TicketConversion]: new TicketConversion(),
})

const saveKey = "generator";
SaveSystem.SaveCallback<GeneratorSaveData[]>(saveKey, () => {
  const upgrades: GeneratorSaveData[] = [];
  Object.values(GeneratorsData).forEach((v, k) => {
    upgrades.push({
      generatorsKey: k,
      count: v.count,
      unlocked: v.unlocked,
    })
  })

  return upgrades;
});

interface GeneratorSaveData {
  generatorsKey: GeneratorsKey;
  count: number;
  unlocked: boolean;
}

SaveSystem.LoadCallback<GeneratorSaveData[]>(saveKey, (data) => {
  data.forEach((entry, index) => {
    const key = Object.keys(GeneratorsData)[index] as unknown as keyof typeof GeneratorsData;
    GeneratorsData[key].count = entry.count;
    GeneratorsData[key].unlocked = entry.unlocked;
  });
})
