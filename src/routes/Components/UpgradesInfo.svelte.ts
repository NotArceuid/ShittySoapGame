import type { ReactiveText } from "../../Game/Shared/ReactiveText.svelte";
export interface IUpgradesInfo {
  name: string;
  description: () => ReactiveText;
  Requirements: [() => ReactiveText, () => boolean];
  count: number;
  maxCount: number;

  getMax?: () => number;
  buyAmount: number;
  buy: () => void;
}
