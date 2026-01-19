<script lang="ts">
	import { log } from "console";
	import { Player } from "../../Game/Player.svelte.ts";
	import type { IUpgradesInfo } from "./UpgradesInfo.svelte.ts";
	import ActionButton from "./ActionButton.svelte";

	let { upgrade }: { upgrade?: IUpgradesInfo } = $props();

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
		if (upgrade.Requirements.some((req) => !req())) return;
		upgrade.buy();
	}
</script>

<div class="w-full h-full flex items-center align-middle flex-col p-5">
	{#if upgrade}
		<h1>
			{upgrade.name}
			({upgrade.count}/{upgrade.maxCount})
		</h1>
		<h1 class="mb-2">{upgrade.description()}</h1>
		{#if upgrade.effect}
			<h1 class="mb-2">{upgrade.effect()}</h1>
		{/if}
		<ActionButton
			disabled={!upgrade.Requirements.every((t) => t())}
			onclick={buyUpgrades}
		>
			{#snippet content()}
				<div>Cost({amount}): {upgrade.Requirements[0]()}</div>
			{/snippet}
		</ActionButton>
	{/if}
</div>
