import { SaveSystem } from "./Saves.ts";
import { Decimal } from "./Shared/BreakInfinity/Decimal.svelte";

interface IPlayer {
  Name: string;
  Money: Decimal;
  SC: number;
  BulkAmount: number;
}

class PlayerClass {
  _player = $state<IPlayer>({
    Name: "Player",
    Money: new Decimal(0),
    SC: 0,
    BulkAmount: 1,
  });

  get BulkAmount() {
    return this._player.BulkAmount;
  }

  set BulkAmount(value) {
    this._player.BulkAmount = value;
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

  saveKey: string = "player_data";
  getSaveData(): unknown {
    return {
      Name: this.Name,
      Money: this.Money,
    };
  }

  loadSaveData(data: IPlayer): void {
    this._player.Name = data.Name;
    this._player.Money = new Decimal(data.Money);
  }
}

export const Player = new PlayerClass();
SaveSystem.SaveCallback(Player.saveKey, () => {
  return Player.getSaveData();
});

SaveSystem.LoadCallback(Player.saveKey, (data) => {
  Player.loadSaveData(data as IPlayer);
});
