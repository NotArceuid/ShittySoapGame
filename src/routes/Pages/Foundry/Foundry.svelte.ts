import { SvelteMap } from "svelte/reactivity";
import { GeneratorsData, GeneratorsKey } from "../../../Game/Foundry/Generator.svelte";
import { Update } from "../../../Game/Game.svelte";
import { Player } from "../../../Game/Player.svelte";
import { Decimal } from "../../../Game/Shared/BreakInfinity/Decimal.svelte";
import { ReactiveText } from "../../../Game/Shared/ReactiveText.svelte";
import { UpgradesData, UpgradesKey } from "../../../Game/Soap/Upgrades.svelte";

interface IMilestoneEntries {
  threshold: Decimal;
  text: () => ReactiveText;
  formula: () => Decimal;
}

export const ChargeMilestones: IMilestoneEntries[] = [
  {
    threshold: new Decimal(100),
    text: () => new ReactiveText(`Producer quality ${ChargeMilestones[0].formula().format()}x`),
    formula: () => {
      if (Player.Charge.lt(100))
        return Decimal.ZERO;
      return Player.Charge.sub(100).div(100).plus(1);
    }
  },
  {
    threshold: new Decimal(100_000),
    text: () => new ReactiveText(`Producer speed ${ChargeMilestones[1].formula().format()}x`),
    formula: () => {
      if (Player.Charge.lt(100_000))
        return Decimal.ZERO;
      return Player.Charge.sub(100_000).div(100_000).plus(1);
    }
  },
  {
    threshold: new Decimal(100_000_000),
    text: () => new ReactiveText(`Sell Mult ${ChargeMilestones[2].formula().format()}x`),
    formula: () => {
      if (Player.Charge.lt(100_000_000))
        return Decimal.ZERO;
      return Player.Charge.sub(100_000_000).div(100_000_000).times(0.5).plus(1);
    }
  },
  {
    threshold: new Decimal(100_000_000_000),
    text: () => new ReactiveText(`Red Soap Gain ${ChargeMilestones[3].formula().format()}x`),
    formula: () => {
      if (Player.Charge.lt(100_000_000_000))
        return Decimal.ZERO;
      return Player.Charge.sub(100_000_000_000).div(100_000_000_000).times(2).plus(1);
    }
  },
  {
    threshold: new Decimal(100_000_000_000_000),
    text: () => new ReactiveText(`Orange Soap Gain ${ChargeMilestones[4].formula().format()}x`),
    formula: () => {
      if (Player.Charge.lt(100_000_000_000_000))
        return Decimal.ZERO;
      return Player.Charge.sub(100_000_000_000_000).div(100_000_000_000_000).times(2).plus(1);
    }
  }
];

Update.add(() => {
  let chargeGain = new Decimal(GeneratorsData[GeneratorsKey.ChargeSpeed].count * 0.25)
    .mul(UpgradesData[UpgradesKey.ChargeSpeedUpgrade].count + 1);

  Player.Charge = Player.Charge.add(chargeGain);
})
