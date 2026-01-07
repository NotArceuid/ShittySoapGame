<script lang="ts">
	import { Player } from "../../Game/Player.svelte.ts";
	import type { IUpgradesInfo } from "./UpgradesInfo.svelte.ts";

	let { upgrade }: { upgrade?: IUpgradesInfo } = $props();
	let canBuy = $derived(
		upgrade?.Requirements?.every((t) => t()) ? "" : "bg-gray-100",
	);

	let amount = $derived.by<number>(() => {
		if (!upgrade || !upgrade.getMax) return 1;
		return Math.max(
			1,
			Math.min(
				upgrade.maxCount - upgrade.count,
				Math.min(upgrade.getMax(), Player.BulkAmount),
			),
		);
	});

	$effect(() => {
		if (upgrade && upgrade.buyAmount) upgrade.buyAmount = amount;
	});

	function buyUpgrades() {
		if (!upgrade) return;
		upgrade.buy();
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
				<div>Cost({amount}): {upgrade.Requirements[0]()}</div>
			</div>
		</button>
	{/if}
</div>
