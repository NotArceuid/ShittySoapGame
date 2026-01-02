<script lang="ts">
	import {
		UpgradesData,
		type IUpgrades,
	} from "../../../Game/Soap/Upgrades.svelte";

	let hoveredUpgrade = $state<IUpgrades | null>();
	function hoverUpgrade(upgrade: IUpgrades | null) {
		hoveredUpgrade = upgrade;
	}

	function buyUpgrades(upgrade: IUpgrades) {}
</script>

<div class="absolute m-2">
	<h1 class="mt-auto">The tab where i bully you with upgrades >:)</h1>

	{#each UpgradesData as upgrade}
		<button
			onclick={() => buyUpgrades(upgrade[1])}
			onmouseover={() => {
				hoverUpgrade(upgrade[1]);
			}}
			onmouseout={() => {
				hoverUpgrade(null);
			}}
			onfocus={() => {
				hoverUpgrade(upgrade[1]);
			}}
			onblur={() => {
				hoverUpgrade(upgrade[1]);
			}}
			>{upgrade[1].name} ({!upgrade[1].count ? 0 : upgrade[1].count}/{upgrade[1]
				.maxCount})</button
		>
	{/each}

	<!-- Bottom frag -->
	<div class="mt-auto">
		<span>
			{#if hoveredUpgrade}
				{hoveredUpgrade.description()}
				({!hoveredUpgrade?.count
					? 0
					: hoveredUpgrade?.count}/{hoveredUpgrade?.maxCount})
			{/if}
		</span>
	</div>
</div>
