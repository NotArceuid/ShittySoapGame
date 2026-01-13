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
	import { log } from "console";

	let maxBulkAmt = $derived(UpgradesData[UpgradesKey.BulkUpgrade].count + 1);
</script>

<div class="border-l w-2/12">
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
		<div class="w-full flex flex-col text-center border-t">
			<h1>Bulk Limit</h1>
			<div class="relative w-full px-4">
				<div class="flex flex-row h-full align-middle items-center">
					<input
						type="range"
						min="1"
						max={maxBulkAmt}
						bind:value={Player.BulkAmount}
						class="w-full h-2 bg-gray-200 cursor-pointer"
					/>
					<h1>{Player.BulkAmount}</h1>
				</div>
			</div>
		</div>
	{/if}
</div>
