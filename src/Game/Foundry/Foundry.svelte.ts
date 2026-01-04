import type { ReactiveText } from "../Shared/ReactiveText.svelte";

export interface IFoundryInfo {
  name: string,
  description: () => ReactiveText,
  Requirements: [() => ReactiveText, () => boolean]
  count: number;
  maxCount: number;

  getMax: () => number
  buyAmount: number;
} 
