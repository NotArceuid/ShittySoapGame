<script lang="ts">
	import { Player } from "../../../Game/Player.svelte";
	import {
		UpgradesData,
		UpgradesKey,
	} from "../../../Game/Soap/Upgrades.svelte";
	import { Decimal } from "../../../Game/Shared/BreakInfinity/Decimal.svelte";
	import { onMount } from "svelte";
	import { Soaps, type SoapType } from "../../../Game/Soap/Soap.svelte";
	import { DevHacks, GameLoop, Update } from "../../../Game/Game.svelte";
	import { log } from "console";

	let { soapType }: { soapType: SoapType } = $props();
	let soap = $derived(Soaps.get(soapType)!);

	let amount = $derived(Decimal.min(Player.BulkAmount, soap.Amount));
	let can = $derived(
		soap.Amount.gte(amount) && soap.Amount.gt(0) ? "" : "bg-gray-100",
	);

	let holdUpgradeUnlocked = $derived(
		UpgradesData.get(UpgradesKey.HoldButtonUpgrade)!.count > 0,
	);

	function Sell(): void {
		if (soap.CanSell(amount)) {
			soap.Sell(amount);
		}
	}

	function Eat(): void {}
	function Offer(): void {}

	let counter = $state(0);
	let amt = $derived(
		2500 - 250 * UpgradesData.get(UpgradesKey.RedSoapAutoSeller)!.count,
	);

	Update.add(() => {
		if (UpgradesData.get(UpgradesKey.RedSoapAutoSeller)!.count == 0) return;

		if (counter < amt) {
			counter++;
		}
		if (counter >= amt) {
			soap.Sell(soap.Amount.div(1));
			counter = 0;
		}
	});

	onMount(() => {
		document.addEventListener("keydown", (ev) => {
			if (ev.code !== "KeyS" || !holdUpgradeUnlocked) return;
			Sell();
		});
	});
</script>

<div class="flex flex-col justify-center">
	<h1 class="text-center underline mb-2">Actions</h1>
	<div class="flex flex-col">
		<button class="w-full {can}" onclick={Sell}>
			Sell {amount.format()}x
		</button>

		{#if UpgradesData.get(UpgradesKey.EatRedSoapUpgrade)!.count > 0 || DevHacks.skipUnlock}
			<button class="w-full {can}" onclick={Eat}>
				Eat {amount.format()}x
			</button>
		{/if}

		{#if UpgradesData.get(UpgradesKey.CatPrestige)!.count > 0 || DevHacks.skipUnlock}
			<button class="w-full {can}" onclick={Offer}>
				Offer {amount.format()}x
			</button>
		{/if}
	</div>
</div>
