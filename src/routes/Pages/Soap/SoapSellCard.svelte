<script lang="ts">
	import type { Soap } from "../../../Game/Soap/Soap.svelte";
	import { Player } from "../../../Game/Player.svelte";
	import {
		UpgradesData,
		UpgradesKey,
	} from "../../../Game/Soap/Upgrades.svelte";
	import { Decimal } from "../../../Game/Shared/BreakInfinity/Decimal.svelte";
	import { onMount } from "svelte";

	let { soap }: { soap: Soap } = $props();
	let amount = $derived(Decimal.min(Player.BulkAmount, soap.Amount));
	let can = $derived(
		soap.Amount.gte(amount) && soap.Amount.gt(0) ? "" : "bg-gray-100",
	);

	let holdUpgradeUnlocked = $derived(
		UpgradesData.get(UpgradesKey.HoldSell)!.count > 0,
	);

	function Sell(): void {
		if (soap.CanSell(amount)) {
			soap.Sell(amount);
		}
	}

	function Eat(): void {}
	function Offer(): void {}

	onMount(() => {
		document.addEventListener("keydown", (ev) => {
			if (ev.code !== "KeyS" && holdUpgradeUnlocked) return;
			Sell();
		});
	});
</script>

<div class="border m-2 p-2 min-w-5/12">
	<h1>{soap.Type}</h1>
	<div class="flex flex-row">
		<h1>Amount: {soap.Amount.format()}</h1>
		<h1 class="ml-auto">Quality: {soap.Quality}</h1>
	</div>
	<div class="flex flex-row">
		<button class="w-full {can}" onclick={Sell}>
			Sell {amount.format()}x
		</button>

		<button class="w-full {can} mr-1 ml-1" onclick={Eat}>
			Eat {amount.format()}x
		</button>
		<button class="w-full {can}" onclick={Offer}>
			Offer {amount.format()}x
		</button>
	</div>
</div>
