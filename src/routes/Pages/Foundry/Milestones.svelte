<script lang="ts">
	import { Player } from "../../../Game/Player.svelte";
	import { SaveSystem } from "../../../Game/Saves";
	import { DevHacks } from "../../../Game/Game.svelte";
	import { ChargeMilestones } from "./Foundry.svelte.ts";

	interface MilestoneSaves {
		ticketunlocked: boolean;
		chargeunlocked: boolean;
		assemblerunlocked: boolean;
	}

	let ticketUnlocked = $state(false);
	let chargeunlocked = $state(false);
	let assemblerunlocked = $state(false);
	let saveKey = "milestones";

	let currentPage = $state(0);
	function ChangePage(page: number) {
		currentPage = page;
	}

	SaveSystem.SaveCallback<MilestoneSaves>(saveKey, () => {
		return {
			ticketunlocked: ticketUnlocked,
			chargeunlocked: chargeunlocked,
			assemblerunlocked: assemblerunlocked,
		};
	});

	SaveSystem.LoadCallback<MilestoneSaves>(saveKey, (data) => {
		ticketUnlocked = data.ticketunlocked;
		chargeunlocked = data.chargeunlocked;
		assemblerunlocked = data.assemblerunlocked;
	});

	$effect(() => {
		if (Player.Charge.gt(0)) chargeunlocked = true;
	});
</script>

<h1 class="p-2 font-bold border-b">Milestones</h1>
<div class="p-1 w-full">
	<div class="flex flex-row space-x-1">
		{#if chargeunlocked || DevHacks.skipUnlock}
			<button class="grow" onclick={() => ChangePage(0)}>Charge</button>
		{/if}
		<button class="grow" onclick={() => ChangePage(1)}
			>{ticketUnlocked ? "Ticket" : "???"}</button
		>
	</div>

	<div id="foundry-milestones" class="relative">
		{#if currentPage === 0}
			<div class="absolute p-2 w-full overflow-y-scroll">
				{#each ChargeMilestones as milestones}
					<div
						class="border-b {Player.Charge.lt(milestones[1].threshold)
							? 'text-gray-600'
							: 'text-green-600'}"
					>
						<h1 class="text-center">
							{milestones[1].threshold.format()} Charge
						</h1>
						<h1 class="text-center">{milestones[1].text()}</h1>
					</div>
				{/each}
			</div>
		{/if}

		{#if currentPage === 1}
			<div class="absolute p-2 w-full overflow-y-scroll">
				<h1>Comming soon tm(d)</h1>
			</div>
		{/if}

		{#if currentPage === 2}
			<div class="absolute p-2 w-full overflow-y-scroll">
				<h1>Assembler Milestones Content</h1>
			</div>
		{/if}
	</div>
</div>
