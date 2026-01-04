import { SvelteMap } from "svelte/reactivity";
import { SaveSystem } from "../Saves";
import { InvokeableEvent } from "../Shared/Events";
import { ReactiveText } from "../Shared/ReactiveText.svelte";
import type { IUpgradesInfo } from "../../routes/Components/UpgradesInfo.svelte";

export const UnlockGenerators: InvokeableEvent<GeneratorsKey> = new InvokeableEvent<GeneratorsKey>();
export const GeneratorsData: SvelteMap<GeneratorsKey, BaseGenerator> = new SvelteMap<GeneratorsKey, BaseGenerator>();

export enum GeneratorsKey {
  ChargeSpeed, ChargeCapacity
}

export abstract class BaseGenerator implements IUpgradesInfo {
  getMax: () => number = () => { return 1 }
  abstract name: string;
  abstract description: () => ReactiveText;
  abstract maxCount: number;
  abstract Requirements: [() => ReactiveText, () => boolean];
  abstract ShowCondition: () => boolean;
  count: number = $state(0)

  unlocked: boolean = $state(false);
  buyAmount: number = $state(0);
}


const saveKey = "generator";
SaveSystem.SaveCallback(saveKey, () => SaveData());

interface GeneratorSaveData {
  generatorsKey: GeneratorsKey;
  count: number;
  unlocked: boolean;
}

function SaveData() {
  let upgrades: GeneratorSaveData[] = [];
  GeneratorsData.forEach((v, k) => {
    upgrades.push({
      generatorsKey: k,
      count: v.count,
      unlocked: v.unlocked,
    })
  })

  return {
    Generators: upgrades
  }
}

SaveSystem.LoadCallback(saveKey, (data) => LoadData(data as GeneratorSaveData[]));
function LoadData(data: GeneratorSaveData[]) {
  data.forEach((ele) => {
    let currGenerator = GeneratorsData.get(ele.generatorsKey)!;
    currGenerator.count = ele.count;
    currGenerator.unlocked = ele.unlocked;

    GeneratorsData.set(ele.generatorsKey, currGenerator);
  })
}

class ChargeSpeed extends BaseGenerator {
  name: string = "Charge Speed"
  description: () => ReactiveText = () => new ReactiveText("Increases the charge gain per tick")
  maxCount: number = 999;
  Requirements: [() => ReactiveText, () => boolean] = [() => new ReactiveText("Cost: 1000"), () => true];
  ShowCondition: () => boolean = () => true;
}

class ChargeCapacity extends BaseGenerator {
  name: string = "Charge Capacity"
  description: () => ReactiveText = () => new ReactiveText("Increases the maximum charge that you can hold at a time.")
  maxCount: number = 999;
  Requirements: [() => ReactiveText, () => boolean] = [() => new ReactiveText("Cost: 1000"), () => true];
  ShowCondition: () => boolean = () => true;
}

GeneratorsData.set(GeneratorsKey.ChargeSpeed, new ChargeSpeed());
GeneratorsData.set(GeneratorsKey.ChargeCapacity, new ChargeCapacity());
