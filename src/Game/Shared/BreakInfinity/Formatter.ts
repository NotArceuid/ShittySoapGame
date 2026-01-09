
// Types for the number formatter
export type Notation = "standard" | "scientific";

interface LargeNumberDefinition {
  threshold: number;
  symbol: string;
}

const LARGE_NUMBER_NAMES: LargeNumberDefinition[] = [
  { threshold: 1e3, symbol: 'k' },
  { threshold: 1e6, symbol: 'M' },
  { threshold: 1e9, symbol: 'B' },
  { threshold: 1e12, symbol: 'T' },
  { threshold: 1e15, symbol: 'qd' },
  { threshold: 1e18, symbol: 'Qn' },
  { threshold: 1e21, symbol: 'sx' },
  { threshold: 1e24, symbol: 'Sp' },
  { threshold: 1e27, symbol: 'O' },
  { threshold: 1e30, symbol: 'N' },
  { threshold: 1e33, symbol: 'de' },
  { threshold: 1e36, symbol: 'Ud' },
  { threshold: 1e39, symbol: 'DD' },
  { threshold: 1e42, symbol: 'tdD' },
  { threshold: 1e45, symbol: 'qdD' },
  { threshold: 1e48, symbol: 'QnD' },
  { threshold: 1e51, symbol: 'sxD' },
  { threshold: 1e54, symbol: 'SpD' },
  { threshold: 1e57, symbol: 'OcD' },
  { threshold: 1e60, symbol: 'NvD' },
  { threshold: 1e63, symbol: 'Vgn' },
  { threshold: 1e66, symbol: 'UVg' },
  { threshold: 1e69, symbol: 'DVg' },
  { threshold: 1e72, symbol: 'TVg' },
  { threshold: 1e75, symbol: 'qtV' },
  { threshold: 1e78, symbol: 'QnV' },
  { threshold: 1e81, symbol: 'SeV' },
  { threshold: 1e84, symbol: 'SPG' },
  { threshold: 1e87, symbol: 'OVG' },
  { threshold: 1e90, symbol: 'NVG' },
  { threshold: 1e93, symbol: 'TGN' },
  { threshold: 1e96, symbol: 'UTG' },
  { threshold: 1e99, symbol: 'DTG' },
  { threshold: 1e102, symbol: 'tsTG' },
  { threshold: 1e105, symbol: 'qtTG' },
  { threshold: 1e108, symbol: 'QnTG' },
  { threshold: 1e111, symbol: 'ssTG' },
  { threshold: 1e114, symbol: 'SpTG' },
  { threshold: 1e117, symbol: 'OcTG' },
  { threshold: 1e120, symbol: 'NoTG' },
  { threshold: 1e123, symbol: 'QdDR' },
  { threshold: 1e126, symbol: 'uQDR' },
  { threshold: 1e129, symbol: 'dQDR' },
  { threshold: 1e132, symbol: 'tQDR' },
  { threshold: 1e135, symbol: 'qdQDR' },
  { threshold: 1e138, symbol: 'QnQDR' },
  { threshold: 1e141, symbol: 'sxQDR' },
  { threshold: 1e144, symbol: 'SpQDR' },
  { threshold: 1e147, symbol: 'OQDDr' },
  { threshold: 1e150, symbol: 'NQDDr' },
  { threshold: 1e153, symbol: 'qQGNT' },
  { threshold: 1e156, symbol: 'uQGNT' },
  { threshold: 1e159, symbol: 'dQGNT' },
  { threshold: 1e162, symbol: 'tQGNT' },
  { threshold: 1e165, symbol: 'qdQGNT' },
  { threshold: 1e168, symbol: 'QnQGNT' },
  { threshold: 1e171, symbol: 'sxQGNT' },
  { threshold: 1e174, symbol: 'SpQGNT' },
  { threshold: 1e177, symbol: 'OQQGNT' },
  { threshold: 1e180, symbol: 'NQQGNT' },
  { threshold: 1e183, symbol: 'SXGNTL' },
  { threshold: 1e186, symbol: 'USXGNTL' },
  { threshold: 1e189, symbol: 'DSXGNTL' },
  { threshold: 1e192, symbol: 'TSXGNTL' },
  { threshold: 1e195, symbol: 'QTSXGNTL' },
  { threshold: 1e198, symbol: 'QNSXGNTL' },
  { threshold: 1e201, symbol: 'SXSXGNTL' },
  { threshold: 1e204, symbol: 'SPSXGNTL' },
  { threshold: 1e207, symbol: 'OSXGNTL' },
  { threshold: 1e210, symbol: 'NVSXGNTL' },
  { threshold: 1e213, symbol: 'SPTGNTL' },
  { threshold: 1e216, symbol: 'USPTGNTL' },
  { threshold: 1e219, symbol: 'DSPTGNTL' },
  { threshold: 1e222, symbol: 'TSPTGNTL' },
  { threshold: 1e225, symbol: 'QTSPTGNTL' },
  { threshold: 1e228, symbol: 'QNSPTGNTL' },
  { threshold: 1e231, symbol: 'SXSPTGNTL' },
  { threshold: 1e234, symbol: 'SPSPTGNTL' },
  { threshold: 1e237, symbol: 'OSPTGNTL' },
  { threshold: 1e240, symbol: 'NVSPTGNTL' },
  { threshold: 1e243, symbol: 'OTGNTL' },
  { threshold: 1e246, symbol: 'UOTGNTL' },
  { threshold: 1e249, symbol: 'DOTGNTL' },
  { threshold: 1e252, symbol: 'TOTGNTL' },
  { threshold: 1e255, symbol: 'QTOTGNTL' },
  { threshold: 1e258, symbol: 'QNOTGNTL' },
  { threshold: 1e261, symbol: 'SXOTGNTL' },
  { threshold: 1e264, symbol: 'SPOTGNTL' },
  { threshold: 1e267, symbol: 'OTOTGNTL' },
  { threshold: 1e270, symbol: 'NVOTGNTL' },
  { threshold: 1e273, symbol: 'NONGNTL' },
  { threshold: 1e276, symbol: 'UNONGNTL' },
  { threshold: 1e279, symbol: 'DNONGNTL' },
  { threshold: 1e282, symbol: 'TNONGNTL' },
  { threshold: 1e285, symbol: 'QTNONGNTL' },
  { threshold: 1e288, symbol: 'QNNONGNTL' },
  { threshold: 1e291, symbol: 'SXNONGNTL' },
  { threshold: 1e294, symbol: 'SPNONGNTL' },
  { threshold: 1e297, symbol: 'OTNONGNTL' },
  { threshold: 1e300, symbol: 'NONONGNTL' },
  { threshold: 1e303, symbol: 'CENT' },
  { threshold: 1e306, symbol: 'UNCENT' }
];

export interface NumberFormatterOptions {
  notation?: Notation;
  decimals?: number;
  forceScientificAbove?: number;
}

export class NumberFormatter {
  private options: Required<NumberFormatterOptions>;

  constructor(options: NumberFormatterOptions = {}) {
    this.options = {
      notation: options.notation || "standard",
      decimals: options.decimals || 2,
      forceScientificAbove: options.forceScientificAbove || 1e306,
    };
  }

  format(number: { mantissa: number; exponent: number }): string {
    const absLog10 = Math.abs(number.mantissa) > 0
      ? number.exponent + Math.log10(Math.abs(number.mantissa))
      : -Infinity;

    const value = Math.abs(number.mantissa) * Math.pow(10, number.exponent);

    if (absLog10 >= Math.log10(this.options.forceScientificAbove)) {
      return this.formatScientific(value);
    }

    switch (this.options.notation) {
      case "scientific":
        return this.formatScientific(value);

      case "standard":
      default:
        return this.formatStandard(value);
    }
  }

  formatCurrency(number: { mantissa: number; exponent: number }, symbol: string = '$'): string {
    return `${symbol}${this.format(number)}`;
  }

  updateOptions(newOptions: Partial<NumberFormatterOptions>): void {
    this.options = { ...this.options, ...newOptions };
  }

  get currentNotation(): Notation {
    return this.options.notation;
  }

  get currentDecimals(): number {
    return this.options.decimals;
  }

  private formatScientific(value: number): string {
    if (value === 0) return '0';

    const exponent = Math.floor(Math.log10(Math.abs(value)));
    const mantissa = value / Math.pow(10, exponent);

    return `${mantissa.toFixed(this.options.decimals)}e${exponent}`;
  }

  private formatStandard(value: number): string {
    const absValue = Math.abs(value);

    if (absValue < 0.1) {
      return "0";
    }

    if (absValue < 1000) {
      return this.formatSmallNumber(value);
    }

    for (let i = LARGE_NUMBER_NAMES.length - 1; i >= 0; i--) {
      if (absValue >= LARGE_NUMBER_NAMES[i].threshold) {
        const divided = value / LARGE_NUMBER_NAMES[i].threshold;
        return `${divided.toFixed(this.options.decimals)}${LARGE_NUMBER_NAMES[i].symbol}`;
      }
    }

    return this.formatSmallNumber(value);
  }

  private formatSmallNumber(value: number): string {
    if (Math.abs(value) < 0.01 && value !== 0) {
      return this.formatScientific(value);
    }

    return value.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: this.options.decimals,
      useGrouping: true
    });
  }
}
export const formatter = new NumberFormatter({
  notation: "standard",
  decimals: 2,
});
