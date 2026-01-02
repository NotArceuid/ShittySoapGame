import { _ } from "svelte-i18n";
import { Decimal } from "./BreakInfinity/Decimal.svelte";
import { get } from "svelte/store";

export class ReactiveText {
  parts = $state<(string | Decimal | number | (() => string))[]>([]);

  constructor(...parts: (string | number | Decimal | (() => string))[]) {
    this.parts = parts;
  }

  toString(): string {
    return this.parts
      .map((part) => {
        if (typeof part === "string") {
          if (part.includes(".")) {
            return get(_)(part);
          }
          return part;
        } else if (part instanceof Decimal) {
          return part.toString();
        } else if (typeof part === "function") {
          return part();
        }

        return String(part);
      })
      .join("");
  }

  add(...newParts: (string | Decimal | (() => string))[]): ReactiveText {
    return new ReactiveText(...this.parts, ...newParts);
  }

  prepend(...newParts: (string | Decimal | (() => string))[]): ReactiveText {
    return new ReactiveText(...newParts, ...this.parts);
  }
}
