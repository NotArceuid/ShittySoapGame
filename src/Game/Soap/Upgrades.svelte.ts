import { SvelteMap } from "svelte/reactivity";
import { InvokeableEvent } from "../Shared/Events";
import { ReactiveText } from "../Shared/ReactiveText.svelte.ts";

export const UnlockUpgrades: InvokeableEvent<UpgradesKey> = new InvokeableEvent<UpgradesKey>();

export const UpgradesData: SvelteMap<UpgradesKey, IUpgrades> = new SvelteMap<UpgradesKey, IUpgrades>();
export enum UpgradesKey { Bulk, MaxBulk, SpeedUpgrade, QualityUpgrade, OCD, TierUp, OrangeSoap, EatRedSoap, Cat }
UpgradesData.set(UpgradesKey.Bulk, {
  name: "Grr my fingers hurt!!",
  description: () => new ReactiveText("Unlocks Bulk"),
  maxCount: 1,
  Requirements: [[() => new ReactiveText("Cost: 100"), () => true]],
  ShowCondition: [() => true]
})

UpgradesData.set(UpgradesKey.MaxBulk, {
  name: "My fingers still hurt!!",
  description: () => new ReactiveText("Unlocks Max Buttons in bulk"),
  maxCount: 1,
  Requirements: [[() => new ReactiveText("Cost: 200"), () => true]],
  ShowCondition: [() => true]
})

UpgradesData.set(UpgradesKey.SpeedUpgrade, {
  name: "It's too slow!!",
  description: () => new ReactiveText("Improves Producer Speed by 100%"),
  maxCount: 700,
  Requirements: [[() => new ReactiveText("Cost: 150"), () => true]],
  ShowCondition: [() => true]
})

UpgradesData.set(UpgradesKey.QualityUpgrade, {
  name: "Not rich enough!!",
  description: () => new ReactiveText("Improves Producer Quality by 100%"),
  maxCount: 600,
  Requirements: [[() => new ReactiveText("Cost: 180"), () => true]],
  ShowCondition: [() => true]
})

UpgradesData.set(UpgradesKey.OCD, {
  name: "Do you have OCD?",
  description: () => new ReactiveText("Unlock OCD Buy"),
  maxCount: 1,
  Requirements: [[() => new ReactiveText("Cost: 120"), () => true]],
  ShowCondition: [() => true]
})

UpgradesData.set(UpgradesKey.TierUp, {
  name: "Promotions",
  description: () => new ReactiveText("Unlock Tier up in producer"),
  maxCount: 1,
  Requirements: [[() => new ReactiveText("Cost: 120"), () => true]],
  ShowCondition: [() => true]
})

UpgradesData.set(UpgradesKey.OrangeSoap, {
  name: "Hello orange soap",
  description: () => new ReactiveText("Unlocks orange soap (duh)"),
  maxCount: 1,
  Requirements: [[() => new ReactiveText("Cost: 120"), () => true]],
  ShowCondition: [() => true]
})

UpgradesData.set(UpgradesKey.EatRedSoap, {
  name: "Learn to eat red soap",
  description: () => new ReactiveText("Why would you do that?"),
  maxCount: 1,
  Requirements: [[() => new ReactiveText("Cost: 120"), () => true]],
  ShowCondition: [() => true]
})

UpgradesData.set(UpgradesKey.Cat, {
  name: "Buy a.. cat?",
  description: () => new ReactiveText("Buy a cat"),
  maxCount: 1,
  Requirements: [[() => new ReactiveText("Cost: 120"), () => true]],
  ShowCondition: [() => true]
})

export interface IUpgrades {
  name: string,
  description: () => ReactiveText,
  unlocked?: boolean
  count?: number,
  maxCount: number,
  /*
  * @param Requirements needed for the purchasing of upgrades
  * */
  Requirements: [() => ReactiveText, () => boolean][];
  /*
* @param Requirements needed for the showing of upgrades
* */
  ShowCondition: Array<() => boolean>;
}
