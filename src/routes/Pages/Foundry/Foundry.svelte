<script lang="ts">
	import {
		GeneratorsData,
		GeneratorsKey,
	} from "../../../Game/Foundry/Generator.svelte";
	import UpgradesInfo from "../../Components/UpgradesInfo.svelte";
	import type { IUpgradesInfo } from "../../Components/UpgradesInfo.svelte.ts";

	let currUpgrade: IUpgradesInfo | undefined = $state();
	let canBuy = $derived(
		currUpgrade?.Requirements?.every((t) => t()) ? "" : "bg-gray-200",
	);

	function hoverUpgrade(upgrade: IUpgradesInfo) {
		currUpgrade = upgrade;
	}
</script>

<div class="h-11/12 w-full flex flex-row p-2">
	<div class="w-4/6 mr-4 flex flex-col">
		<div class="flex flex-col h-full">
			<div class="flex-1 overflow-auto">
				<div class="border mb-2">
					<h1 class="bg-gray-200 p-1">Generator</h1>
					<div class="m-1">
						<button
							class={canBuy}
							onclick={() => {
								hoverUpgrade(GeneratorsData.get(GeneratorsKey.ChargeSpeed)!);
							}}>Charge Speed</button
						>
						<button
							class={canBuy}
							onclick={() => {
								hoverUpgrade(GeneratorsData.get(GeneratorsKey.ChargeCapacity)!);
							}}>Charge Capacity</button
						>
					</div>
				</div>
			</div>

			<div class="border-t h-32">
				<div class="mt-auto pt-4 flex flex-col items-center content-center">
					<UpgradesInfo upgrade={currUpgrade} />
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
