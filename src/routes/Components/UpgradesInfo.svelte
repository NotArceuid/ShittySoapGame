<script lang="ts">
	import { Render } from "../../Game/Game.svelte.ts";
	import { Player } from "../../Game/Player.svelte.ts";
	import type { IUpgradesInfo } from "./UpgradesInfo.svelte.ts";

	let { upgrade }: { upgrade?: IUpgradesInfo } = $props();
	let canBuy = $state("");

	Render.add((_) => {
		canBuy = upgrade?.Requirements?.every((t) => t()) ? "" : "bg-gray-100";
	});

	let amount = $state(1);
	$effect(() => {
		if (!upgrade || !upgrade.getMax) return;
		upgrade.buyAmount = Math.min(upgrade.getMax(), Player.BulkAmount);
		upgrade.buyAmount = amount;
	});
	function buyUpgrades() {
		if (upgrade) upgrade.buy();
	}
</script>

<div class="w-full h-full flex items-center align-middle flex-col">
	{#if upgrade}
		<h1>
			{upgrade.name}
			({upgrade.count}/{upgrade.maxCount})
		</h1>
		<h1 class="mb-2">{upgrade.description()}</h1>
		<button class=" ml-auto mr-auto {canBuy}" onclick={buyUpgrades}>
			<div>
				<div>Cost: {upgrade.Requirements[0]()}</div>
			</div>
		</button>
	{/if}
</div>
