<script lang="ts">
	import type { Soap } from "../../../Game/Soap/Soap.svelte";
	import { Bulk, Player } from "../../../Game/Player.svelte";
	import { Decimal } from "../../../Game/Shared/BreakInfinity/Decimal.svelte";
	import {
		UpgradesData,
		UpgradesKey,
	} from "../../../Game/Soap/Upgrades.svelte";
	import { log } from "console";

	let { soap }: { soap: Soap } = $props();
	let amount = $state(Decimal.ONE);
	let can = $derived(amount <= soap.Amount ? "" : "bg-gray-100");

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

	// 0 - sell
	// 1 - eat
	// 2 - offer
	// fck la, no enums in compoennets
	let holdTimer: NodeJS.Timeout | null = null;
	const HOLD_DELAY = 300;
	let holdUpgradeUnlocked = $derived(
		UpgradesData.get(UpgradesKey.Hold)!.count == 0,
	);

	function Sell(): void {
		if (soap.CanSell(amount)) {
			soap.Sell(amount);
		}
	}

	function start(event: MouseEvent | TouchEvent, type: number): void {
		log(holdUpgradeUnlocked + " " + (event instanceof MouseEvent) + " ");
		if (
			holdUpgradeUnlocked &&
			event instanceof MouseEvent &&
			event.button === 0
		) {
			holdTimer = setInterval(() => {
				switch (type) {
					case 0:
						Sell();
						break;
					case 1:
						Eat();
						break;
					case 2:
						Offer();
						break;
				}
			}, HOLD_DELAY);
		}
	}

	function end(): void {
		if (holdTimer) {
			clearTimeout(holdTimer);
			holdTimer = null;
		}
	}

	function Eat(): void {}
	function Offer(): void {}

	$effect(() => {
		return () => {
			if (holdTimer) {
				clearTimeout(holdTimer);
			}
		};
	});
</script>

<div class="border m-2 p-2 min-w-5/12">
	<h1>{soap.Type}</h1>
	<div class="flex flex-row">
		<h1>Amount: {soap.Amount.format()}</h1>
		<h1 class="ml-auto">Quality: {soap.Quality}</h1>
	</div>
	<div class="flex flex-row">
		<button
			class="w-full {can}"
			onclick={Sell}
			onmousedown={(e) => start(e, 0)}
			ontouchstart={(e) => start(e, 0)}
			onmouseup={end}
			onmouseleave={end}
			ontouchend={end}
		>
			Sell {amount.format()}x
		</button>

		<button
			class="w-full {can} mr-1 ml-1"
			onclick={Eat}
			onmousedown={(e) => start(e, 1)}
			ontouchstart={(e) => start(e, 1)}
			onmouseup={end}
			onmouseleave={end}
			ontouchend={end}
		>
			Eat {amount.format()}x
		</button>
		<button
			class="w-full {can}"
			onclick={Offer}
			onmousedown={(e) => start(e, 2)}
			ontouchstart={(e) => start(e, 2)}
			onmouseup={end}
			onmouseleave={end}
			ontouchend={end}
		>
			Offer {amount.format()}x
		</button>
	</div>
</div>
