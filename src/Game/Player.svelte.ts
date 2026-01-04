import { Soap, SoapData, SoapType, type SoapSaveData } from "./Soap/Soap.svelte.ts";
import { SaveSystem, type ISaveable } from "./Saves.ts";
import { Decimal } from "./Shared/BreakInfinity/Decimal.svelte";
import { SvelteMap } from "svelte/reactivity";

interface IPlayer {
  Name: string;
  Money: Decimal;
  SC: number;
  Soaps: SvelteMap<SoapType, Soap>;
  Bulk: Bulk;
}

class PlayerClass implements ISaveable {
  _player = $state<IPlayer>({
    Name: "Player",
    Money: new Decimal(0),
    SC: 0,
    Soaps: new SvelteMap<SoapType, Soap>(),
    Bulk: Bulk.One,
  });

  constructor() {
    Object.values(SoapType)
      .forEach((soap, idx) => {
        if (typeof soap === 'number')
          return;
        const newSoap = new Soap(SoapData[idx]);
        this._player.Soaps.set(soap as unknown as SoapType, newSoap);
      })
  }

  get Bulk() {
    return this._player.Bulk;
  }

  set Bulk(value) {
    this._player.Bulk = value;
  }

  get Name() {
    return this._player.Name;
  }

  get Money() {
    return this._player.Money;
  }

  set Money(value) {
    this._player.Money = value;
  }

  get Soap() {
    return this._player.Soaps;
  }

  saveKey: string = "player_data";
  getSaveData(): unknown {
    let soap: SoapSaveData[] = [];
    this.Soap.forEach((v, k) => {
      soap.push({
        type: k,
        progress: v.Progress,
        unlocked: v.Unlocked,
        amount: v.Amount,
      })
    })

    return {
      Name: this.Name,
      Money: this.Money,
      Soaps: soap,
    };
  }

  loadSaveData(data: IPlayer): void {
    this._player.Name = data.Name;
    this._player.Money = data.Money;

    let soap = data.Soaps as unknown as SoapSaveData[];
    soap.forEach(data => {
      let curSoap = this._player.Soaps.get(data.type)!;
      curSoap.Progress = data.progress;
      curSoap.Unlocked = data.unlocked;
      curSoap.Amount = data.amount;
      this._player.Soaps.set(data.type, curSoap);
    })
  }
}

export const Player = new PlayerClass();
SaveSystem.SaveCallback(Player.saveKey, () => {
  return Player.getSaveData();
});

SaveSystem.LoadCallback(Player.saveKey, (data) => {
  Player.loadSaveData(data as IPlayer);
});

// Yes, this is some real shitty code right here
export enum Bulk {
  One, Ten, TwoFive, Max, Juanzerozeo
}
