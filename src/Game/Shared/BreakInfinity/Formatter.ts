import { Decimal } from "./Decimal.svelte";

export type Notation = "scientific" | "engineering" | "standard";

export interface NumberFormatterOptions {
  decimals?: number;
  notation?: Notation;
}

const STANDARD_SUFFIXES: Map<number, string> = new Map([
  [0, ""],
  [1, "K"],
  [2, "M"],
  [3, "B"],
  [4, "T"],
  [5, "Qa"],
  [6, "Qi"],
  [7, "Sx"],
  [8, "Sp"],
  [9, "Oc"],
  [10, "No"],
  [11, "Dc"],
  [12, "Ud"],
  [13, "Dd"],
  [14, "Td"],
  [15, "Qad"],
  [16, "Qid"],
  [17, "Sxd"],
  [18, "Spd"],
  [19, "Ocd"],
  [20, "Nod"],
]);

export class NumberFormatter {
  private decimals: number;
  private notation: Notation;

  constructor(options: NumberFormatterOptions = {}) {
    this.notation = options.notation || "standard";
    this.decimals = options.decimals ?? 2;
  }

  public format(value: Decimal): string {
    if (typeof value == typeof "") return "Invalid Data type!";

    if (value.lessThan(1) && value.greaterThan(0)) {
      return this.formatSmallNumber(value);
    }

    if (value.lessThan(1e6)) {
      return this.formatSmallNumber(value);
    }

    switch (this.notation) {
      case "scientific":
        return this.formatScientific(value);
      case "engineering":
        return this.formatEngineering(value);
      case "standard":
      default:
        return this.formatStandard(value);
    }
  }

  private formatSmallNumber(value: Decimal): string {
    const formatWithConditionalDecimals = (num: Decimal): string => {
      const isWholeNumber = num.equals(num.floor());

      if (isWholeNumber) {
        return num.toFixed(0);
      } else {
        return num.toFixed(2);
      }
    };

    if (value.lessThan(0.001) && value.greaterThan(0)) {
      return "0";
    }

    if (value.lessThan(1000)) {
      return formatWithConditionalDecimals(value);
    }

    if (value.lessThan(1e6)) {
      const thousands = value.div(1000);
      return thousands.toFixed(2) + "K";
    }

    if (value.lessThan(1e9)) {
      const millions = value.div(1e6);
      return millions.toFixed(2) + "M";
    }

    if (value.lessThan(1e12)) {
      const billions = value.div(1e9);
      return billions.toFixed(2) + "B";
    }

    return value.toFixed(0);
  }

  private formatStandard(value: Decimal): string {
    const exponent = Math.floor(Decimal.log(value, 1000));
    const mantissa = value.div(Decimal.pow(1000, exponent));

    const suffix =
      STANDARD_SUFFIXES.get(exponent) || this.formatScientific(value);
    return mantissa.toFixed(this.decimals) + suffix;
  }

  private formatScientific(value: Decimal): string {
    const exponent = Math.floor(Decimal.log(value, 10));
    const mantissa = value.div(Decimal.pow(10, exponent));
    return `${mantissa.toFixed(this.decimals)}e${exponent}`;
  }

  private formatEngineering(value: Decimal): string {
    const exponent = Math.floor(Decimal.log(value, 10));
    const engineeringExponent = Math.floor(exponent / 3) * 3;
    const mantissa = value.div(Decimal.pow(10, engineeringExponent));
    return `${mantissa.toFixed(this.decimals)}e${engineeringExponent}`;
  }
}

export const formatter = new NumberFormatter({
  notation: "scientific",
  decimals: 2,
});
