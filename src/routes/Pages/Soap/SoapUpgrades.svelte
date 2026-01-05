<script lang="ts">
	import { UpgradesData } from "../../../Game/Soap/Upgrades.svelte";
	import type { IUpgradesInfo } from "../../Components/UpgradesInfo.svelte.ts";
	import UpgradesInfo from "../../Components/UpgradesInfo.svelte";

	let currUpgrade = $state<IUpgradesInfo>();
	function hoverUpgrade(_upgrade: IUpgradesInfo) {
		currUpgrade = _upgrade;
	}
</script>

<div class="absolute m-2 w-full flex flex-col h-8/12">
	<h1 class="">The tab where i bully you with upgrades >:)</h1>
	<div class="flex flex-wrap overflow-scroll">
		{#each UpgradesData as upgrade}
			<button
				class="{currUpgrade?.name == upgrade[1].name ? 'bg-gray-100' : ''} "
				onclick={() => hoverUpgrade(upgrade[1] as IUpgradesInfo)}
				>{upgrade[1].name} ({upgrade[1].count}/{upgrade[1].maxCount})</button
			>
		{/each}
	</div>
	<!-- Bottom frag -->
	<div class="mt-auto pt-4 flex flex-col items-center content-center">
		<UpgradesInfo upgrade={currUpgrade} />
	</div>
</div>
