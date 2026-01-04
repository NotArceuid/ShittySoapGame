<script lang="ts">
	import { Bulk, Player } from "../../Game/Player.svelte.ts";
	import type { IUpgradesInfo } from "./UpgradesInfo.svelte.ts";

	let { upgrade }: { upgrade?: IUpgradesInfo } = $props();
	let canBuy = $derived(
		upgrade?.Requirements?.every((t) => t()) ? "" : "bg-gray-200",
	);

	let amount = $state(1);
	$effect(() => {
		if (!upgrade) return;
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
				if (upgrade.getMax) amount = upgrade.getMax();
				break;
		}

		upgrade.buyAmount = amount;
	});
</script>

<div>
	{#if upgrade}
		<h1>
			{upgrade.name}
			({upgrade.count}/{upgrade.maxCount})
		</h1>
		<h1 class="mb-2">{upgrade.description()}</h1>
		<button class={canBuy}>
			<div>
				<div>{upgrade.Requirements[0]()}</div>
			</div>
		</button>
	{/if}
</div>
