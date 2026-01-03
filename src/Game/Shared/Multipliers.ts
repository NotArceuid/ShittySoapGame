import { Decimal } from "./BreakInfinity/Decimal.svelte";

export interface Multiplier {
  priority: number;
  value: () => Decimal;
  type: MultiplierType;
}

export enum MultiplierType {
  Additive,
  Multiplicative,
  Compounding,
}

class MultiplierBase {
  public BaseValue: Decimal = Decimal.ONE;
  protected MultiplierList: Map<string, Multiplier> = new Map();

  public Set(source: string, multiplier: Multiplier): void {
    for (const [_, existingMultiplier] of this.MultiplierList) {
      if (existingMultiplier.priority === multiplier.priority) {
        console.error(`Duplicate priority in multiplier, ${source}`);
        return;
      }
    }

    this.MultiplierList.set(source, multiplier);
    this.sortMultipliersByPriority();
  }

  public Get(): Decimal {
    let result = new Decimal(this.BaseValue);
    this.MultiplierList.forEach((multiplier) => {
      switch (multiplier.type) {
        case MultiplierType.Additive:
          result = result.add(multiplier.value());
          break;
        case MultiplierType.Multiplicative:
          result = result.multiply(multiplier.value());
          break;
        case MultiplierType.Compounding:
          result = result.multiply(Decimal.ONE.add(multiplier.value()));
          break;
      }
    });

    return result;
  }

  private sortMultipliersByPriority(): void {
    const sortedEntries = Array.from(this.MultiplierList.entries()).sort(
      ([, a], [, b]) => a.priority - b.priority,
    );

    this.MultiplierList = new Map(sortedEntries);
  }
}

export const Multipliers = {
  QualityMultiplier: new MultiplierBase(),
  SpeedMultiplier: new MultiplierBase(),
};
