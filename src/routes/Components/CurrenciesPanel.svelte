<script lang="ts">
	import { CollapsibleCard } from "svelte5-collapsible";
	import { slide } from "svelte/transition";
	import { Player } from "../../Game/Player.svelte";
	import { UpgradesData, UpgradesKey } from "../../Game/Soap/Upgrades.svelte";
	import { DevHacks } from "../../Game/Game.svelte";
	import {
		SoapNameMapping,
		Soaps,
		SoapType,
	} from "../../Game/Soap/Soap.svelte";
	import {
		AchievementKey,
		AchievementsData,
		UnlockAchievement,
	} from "../../Game/Achievements/Achievements.svelte";
	import ActionButton from "./ActionButton.svelte";

	let maxBulkAmt = $derived(
		UpgradesData[UpgradesKey.BulkUpgrade].count +
			1 +
			UpgradesData[UpgradesKey.BulkUpgrade2].count,
	);

	$effect(() => {
		if (AchievementsData[AchievementKey.Millionaire].check(Player.Money))
			UnlockAchievement(AchievementKey.Millionaire);
	});

	function SetMaxBulk(amount: number) {
		Player.BulkAmount = amount;
	}

	let btns: boolean[] = $state([true, false, false, false, false]);
	function SetButtonActive(id: number) {
		for (let i = 0; i < btns.length; i++) {
			btns[i] = false;
		}

		btns[id] = true;
	}
	let btnStyle =
		"padding-left: 8px; padding-right: 8px; padding-top: 2px; padding-bottom: 2px;";
</script>

<div class="border-x h-full border-border">
	<h1 class="text-center border-b py-2 font-bold">Currencies</h1>
	<div class="m-3 w-full">
		<h1>Money: {Player.Money.format()}</h1>
		{#if Player.Charge.gt(0)}
			<h1>Charge: {Player.Charge.format()}</h1>
		{/if}
		<CollapsibleCard transition={{ transition: slide }} isOpen={true}>
			{#snippet header()}
				<div class="underline w-full">Soaps</div>
			{/snippet}
			{#snippet body()}
				{#each Object.entries(Soaps) as soap}
					{#if soap[1].Unlocked || DevHacks.skipUnlock}
						<h1>
							{SoapNameMapping[soap[0] as unknown as SoapType]}: {soap[1].Amount.format()}
						</h1>
					{/if}
				{/each}
			{/snippet}
		</CollapsibleCard>
	</div>
	{#if UpgradesData[UpgradesKey.BulkUpgrade].count > 0 || DevHacks.skipUnlock}
		<div class="w-full border-t p-3">
			<div class="flex flex-row">
				<h1 class="content-center">Bulk Limit:</h1>
				<ActionButton
					onclick={() => {
						SetMaxBulk(1);
						SetButtonActive(0);
					}}
					disabled={btns[0]}
					customStyle={btnStyle}
					>{#snippet content()}
						1
					{/snippet}</ActionButton
				>
				{#if UpgradesData[UpgradesKey.BulkUpgrade].count >= 5 || DevHacks.skipUnlock}
					<ActionButton
						onclick={() => {
							SetMaxBulk(5);
							SetButtonActive(1);
						}}
						disabled={btns[1]}
						customStyle={btnStyle}
						>{#snippet content()}
							5
						{/snippet}</ActionButton
					>
				{/if}
				{#if UpgradesData[UpgradesKey.BulkUpgrade].count >= 9 || DevHacks.skipUnlock}
					<ActionButton
						onclick={() => {
							SetMaxBulk(10);
							SetButtonActive(2);
						}}
						disabled={btns[2]}
						customStyle={btnStyle}
						>{#snippet content()}
							10
						{/snippet}</ActionButton
					>
				{/if}
				{#if UpgradesData[UpgradesKey.BulkUpgrade2].count >= 15 || DevHacks.skipUnlock}
					<ActionButton
						onclick={() => {
							SetMaxBulk(25);
							SetButtonActive(3);
						}}
						disabled={btns[3]}
						customStyle={btnStyle}
						>{#snippet content()}
							25
						{/snippet}</ActionButton
					>
				{/if}

				<ActionButton
					onclick={() => {
						SetMaxBulk(maxBulkAmt);
						SetButtonActive(4);
					}}
					disabled={btns[4]}
					customStyle={btnStyle}
					>{#snippet content()}
						<span class="text-sm">
							Max ({maxBulkAmt})
						</span>
					{/snippet}</ActionButton
				>
			</div>
		</div>
	{/if}
</div>
