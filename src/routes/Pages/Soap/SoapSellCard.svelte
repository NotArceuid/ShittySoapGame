<script lang="ts">
	import type { Soap } from "../../../Game/Soap/Soap.svelte";
	import { Bulk, Player } from "../../../Game/Player.svelte";
	import { Decimal } from "../../../Game/Shared/BreakInfinity/Decimal.svelte";

	let { soap }: { soap: Soap } = $props();
	let amount = $state(Decimal.ONE);
	let can = $derived(soap.CanSell(amount) ? "bg-gray-100" : "");

	$effect(() => {
		switch (Player.Bulk) {
			case Bulk.One:
				amount = Decimal.ONE;
				break;
			case Bulk.Ten:
				amount = new Decimal(10);
				break;
			case Bulk.TwoFive:
				amount = new Decimal(25);
				break;
			case Bulk.Juanzerozeo:
				amount = new Decimal(100);
				break;
			case Bulk.Max:
				amount = soap.Amount;
				break;
		}
	});

	function Sell() {
		if (soap.CanSell(amount)) {
			soap.Sell(amount);
		}
	}

	function Consume() {}
</script>

<div class="border m-2 p-2 min-w-5/12">
	<h1>{soap.Type}</h1>
	<div class="flex flex-row">
		<h1>Amount: {soap.Amount}</h1>
		<h1 class="ml-auto">Quality: {soap.Quality}</h1>
	</div>
	<div class="flex flex-row">
		<button class="w-full {can}" onclick={Sell}>Sell {amount}x</button>
		<button class="w-full {can} mr-1 ml-1" onclick={Consume}
			>Eat {amount}x</button
		>
		<button class="w-full {can}" onclick={Consume}>Offer {amount}x</button>
	</div>
</div>
