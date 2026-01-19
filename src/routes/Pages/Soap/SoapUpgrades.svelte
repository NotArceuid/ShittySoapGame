<script lang="ts">
	import {
		BaseUpgrade,
		UpgradesData,
		UpgradesKey,
	} from "../../../Game/Soap/Upgrades.svelte";
	import UpgradesInfo from "../../Components/UpgradesInfo.svelte";
	import { DevHacks } from "../../../Game/Game.svelte.ts";
	import ActionButton from "../../Components/ActionButton.svelte";
	import { log } from "console";
	import {
		AchievementKey,
		AchievementsData,
		UnlockAchievement,
	} from "../../../Game/Achievements/Achievements.svelte.ts";
	import { Decimal } from "../../../Game/Shared/BreakInfinity/Decimal.svelte.ts";

	let currUpgrade = $state<BaseUpgrade | undefined>(undefined);
	let showMaxxedUpgrades = $state(false);
	let data = $derived(Object.entries(UpgradesData));

	$effect(() => {
		if (
			AchievementsData[AchievementKey.Automation].check(
				new Decimal(UpgradesData[UpgradesKey.RedSoapAutoSeller].count),
			)
		)
			UnlockAchievement(AchievementKey.Automation);

		if (
			AchievementsData[AchievementKey.EatSoap].check(
				new Decimal(UpgradesData[UpgradesKey.EatRedSoapUpgrade].count),
			)
		)
			UnlockAchievement(AchievementKey.EatSoap);

		if (
			AchievementsData[AchievementKey.SixNineNineNine].check(
				new Decimal(UpgradesData[UpgradesKey.RedSoapAutoSellBonus].count),
			)
		)
			UnlockAchievement(AchievementKey.SixNineNineNine);
		if (
			AchievementsData[AchievementKey.Foundry].check(
				new Decimal(UpgradesData[UpgradesKey.UnlockFoundry].count),
			)
		)
			UnlockAchievement(AchievementKey.Foundry);

		if (
			AchievementsData[AchievementKey.Cat].check(
				new Decimal(UpgradesData[UpgradesKey.CatPrestige].count),
			)
		)
			UnlockAchievement(AchievementKey.Cat);
		if (
			AchievementsData[AchievementKey.ILY].check(
				new Decimal(UpgradesData[UpgradesKey.SpeedUpgrade].count),
			)
		)
			UnlockAchievement(AchievementKey.ILY);
		if (
			AchievementsData[AchievementKey.Maxxed].check(
				new Decimal(UpgradesData[UpgradesKey.SpeedUpgrade].count),
				new Decimal(UpgradesData[UpgradesKey.QualityUpgrade].count),
			)
		)
			UnlockAchievement(AchievementKey.Maxxed);
		if (
			AchievementsData[AchievementKey.BulkedUp].check(
				new Decimal(UpgradesData[UpgradesKey.BulkUpgrade].count),
			)
		)
			UnlockAchievement(AchievementKey.BulkedUp);
		if (
			AchievementsData[AchievementKey.Cheapskate].check(
				new Decimal(UpgradesData[UpgradesKey.RedSpeedNoCost].count),
				new Decimal(UpgradesData[UpgradesKey.RedQualityNoCost].count),
			)
		)
			UnlockAchievement(AchievementKey.Cheapskate);
	});
</script>

<div class="absolute w-full flex flex-col h-full overflow-y-hidden">
	<div class="relative w-full h-full">
		<div class="flex flex-wrap overflow-y-scroll">
			{#each data as upgrade}
				{#if (upgrade[1].ShowCondition() && (showMaxxedUpgrades || upgrade[1].count < upgrade[1].maxCount)) || DevHacks.skipUnlock}
					<ActionButton
						buttonClass="w-67 h-12 shrink-0 m-2  {upgrade[1].buttonStyle}"
						disabled={!upgrade[1].Requirements[1]()}
						onclick={() => {
							if (currUpgrade == upgrade[1]) currUpgrade = undefined;
							else currUpgrade = upgrade[1];
						}}
					>
						{#snippet content()}
							<span>
								{upgrade[1].name} ({upgrade[1].count}/{upgrade[1].maxCount})
							</span>
						{/snippet}
					</ActionButton>
				{/if}
			{/each}
		</div>

		<div class="absolute bottom-0 left-0 right-0 border-t">
			{#if currUpgrade !== undefined}
				<div class="mt-auto">
					<UpgradesInfo upgrade={currUpgrade} />
				</div>
			{/if}

			<div class="flex justify-end items-center p-4">
				<label for="checkbox" class="mr-2"> Show Max Upgrades</label>
				<input type="checkbox" bind:checked={showMaxxedUpgrades} />
			</div>
		</div>
	</div>
</div>
