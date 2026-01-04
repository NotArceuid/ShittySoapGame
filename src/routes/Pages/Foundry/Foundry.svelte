<script lang="ts">
	import type { IFoundryInfo } from "../../../Game/Foundry/Foundry.svelte";
	import {
		GeneratorsData,
		GeneratorsKey,
	} from "../../../Game/Foundry/Generator.svelte";
	import { Bulk, Player } from "../../../Game/Player.svelte";

	let currUpgrade: IFoundryInfo | undefined = $state();
	let canBuy = $derived(
		currUpgrade?.Requirements?.every((t) => t()) ? "" : "bg-gray-200",
	);

	function hoverUpgrade(upgrade: IFoundryInfo) {
		currUpgrade = upgrade;
	}
	let amount = $state(1);
	$effect(() => {
		if (!currUpgrade) return;
		switch (Player.Bulk) {
			case Bulk.One:
				amount = 1;
				break;
			case Bulk.Ten:
				amount = 10;
				break;
			case Bulk.TwoFive:
				amount = 25;
				break;
			case Bulk.Juanzerozeo:
				amount = 100;
				break;
			case Bulk.Max:
				if (currUpgrade.getMax) amount = currUpgrade.getMax();
				break;
		}

		currUpgrade.buyAmount = amount;
	});
</script>

<div class="h-11/12 w-full flex flex-row p-2">
	<div class="w-4/6 mr-4 flex flex-col">
		<div class="flex flex-col h-full">
			<div class="flex-1 overflow-auto">
				<div class="border mb-2">
					<h1 class="bg-gray-200 p-1">Generator</h1>
					<div class="m-1">
						<button
							onclick={() => {
								hoverUpgrade(GeneratorsData.get(GeneratorsKey.ChargeSpeed)!);
							}}>Charge Speed</button
						>
						<button
							onclick={() => {
								hoverUpgrade(GeneratorsData.get(GeneratorsKey.ChargeCapacity)!);
							}}>Charge Capacity</button
						>
					</div>
				</div>
			</div>

			<div class="border-t h-32">
				<div class="mt-auto pt-4 flex flex-col items-center content-center">
					{#if currUpgrade}
						<h1>
							{currUpgrade.name}
							({currUpgrade.count}/{currUpgrade.maxCount})
						</h1>
						<h1 class="mb-2">{currUpgrade.description()}</h1>
						<button class={canBuy}>
							<div>
								{#each currUpgrade.Requirements as requirements}
									<div>{requirements()}</div>
								{/each}
							</div>
						</button>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<div class="w-2/6 border ml-auto">
		<h1 class="bg-gray-200 p-1">Milestones</h1>
		<div class="flex flex-row p-1 w-full">
			<button class="grow">Ticket</button>
			<button class="grow">Generator</button>
			<button class="grow">Assembler</button>
		</div>
	</div>
</div>
