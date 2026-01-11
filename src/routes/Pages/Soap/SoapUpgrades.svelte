<script lang="ts">
	import { UpgradesData } from "../../../Game/Soap/Upgrades.svelte";
	import type { IUpgradesInfo } from "../../Components/UpgradesInfo.svelte.ts";
	import UpgradesInfo from "../../Components/UpgradesInfo.svelte";

	let currUpgrade = $state<IUpgradesInfo>();
	let showMaxxedUpgrades = $state(false);
	function hoverUpgrade(_upgrade: IUpgradesInfo) {
		currUpgrade = _upgrade;
	}
</script>

<div class="absolute pr-4 w-full flex flex-col h-9/12">
	<div class="flex flex-row ml-auto">
		<label for="checkbox" class="mr-2"> Show Max Upgrades</label>
		<input type="checkbox" bind:checked={showMaxxedUpgrades} />
	</div>
	<div class="flex flex-wrap">
		{#each Object.entries(UpgradesData) as upgrade}
			{#if upgrade[1].ShowCondition() && (showMaxxedUpgrades || upgrade[1].count < upgrade[1].maxCount)}
				<button
					class="w-64 h-12 shrink-0 m-2"
					class:bg-gray-100={currUpgrade?.name == upgrade[1].name}
					onclick={() => hoverUpgrade(upgrade[1] as IUpgradesInfo)}
					>{upgrade[1].name} ({upgrade[1].count}/{upgrade[1].maxCount})</button
				>
			{/if}
		{/each}
	</div>
	<!-- Bottom frag -->
	<div class="mt-auto">
		<UpgradesInfo upgrade={currUpgrade} />
	</div>
</div>
