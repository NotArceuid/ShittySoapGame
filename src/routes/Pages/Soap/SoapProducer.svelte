<script lang="ts">
	import { Soaps, type SoapType } from "../../../Game/Soap/Soap.svelte.ts";
	import { DevHacks, Update } from "../../../Game/Game.svelte";
	import { Player } from "../../../Game/Player.svelte";
	import { SoapProducer } from "./SoapProducer.svelte.ts";
	import { CollapsibleCard } from "svelte5-collapsible";
	import { slide } from "svelte/transition";
	import { SaveSystem } from "../../../Game/Saves.ts";
	import {
		UpgradesData,
		UpgradesKey,
	} from "../../../Game/Soap/Upgrades.svelte.ts";
	import { Decimal } from "../../../Game/Shared/BreakInfinity/Decimal.svelte.ts";
	import { log } from "console";

	let { type }: { type: SoapType } = $props();

	let producer = $derived(new SoapProducer(type));
	let soap = $derived(Soaps.get(type)!);
	let width = $derived(producer.Progress.div(producer.MaxProgress).mul(100));
	let decelerateUnlocked = $state(false);

	const speedCostAmt = $derived(
		Math.min(
			Player.BulkAmount,
			producer.SpeedFormula.BuyMax(Player.Money, producer.SpeedCount),
		),
	);
	const qualityCostAmt = $derived(
		Math.min(
			Player.BulkAmount,
			producer.QualityFormula.BuyMax(Player.Money, producer.QualityCount),
		),
	);
	let qualityCanBuy = $derived(
		producer.GetQualityCost(qualityCostAmt).gt(Player.Money)
			? "bg-gray-100 hover:cursor-default"
			: "hover:cursor-pointer",
	);
	let speedCanBuy = $derived(
		producer.GetSpeedCost(speedCostAmt).gt(Player.Money)
			? "bg-gray-100 hover:cursor-default"
			: "hover:cursor-pointer",
	);
	let accelerateIndicator = $derived(
		producer.DecelerateCount > 1 ? "bg-gray-100" : "",
	);
	let canDeccelerate = $derived(
		producer.Speed.gt(producer.DecelerateReq) ? "" : "bg-gray-100",
	);
	let canEat = $derived(
		producer.ProducedAmount.lt(producer.EatReq) ? "bg-gray-100" : "",
	);
	let amount = $derived(Decimal.min(Player.BulkAmount, soap.Amount));
	let can = $derived(
		soap.Amount.gte(amount) && soap.Amount.gt(0) ? "" : "bg-gray-100",
	);

	function Sell(): void {
		if (soap.CanSell(amount)) {
			soap.Sell(amount);
		}
	}

	function Offer(): void {}
	function Accelerate(): void {
		producer.DecelerateCount = Math.max(producer.DecelerateCount - 1, 0);
	}
	let counter = $state(0);
	let autosellCap = $derived(
		30 - 3 * UpgradesData.get(UpgradesKey.RedSoapAutoSeller)!.count,
	);

	Update.add(() => {
		if (producer.Unlocked) {
			producer.AddProgress();
		}

		if (UpgradesData.get(UpgradesKey.RedSoapAutoSeller)!.count == 0) return;

		if (counter < autosellCap) {
			counter++;
		}
		if (counter >= autosellCap) {
			let sellPercentage = UpgradesData.get(
				UpgradesKey.RedSoapAutoSellBonus,
			)!.count;
			let sellAmount = soap.Amount.mul(sellPercentage).div(100);

			let reductionPercentage = UpgradesData.get(
				UpgradesKey.RedSoapAutoSellCostRed,
			)!.count;
			let reductionAmount = sellAmount.mul(reductionPercentage).div(100);

			soap.Sell(sellAmount, reductionAmount);
			counter = 0;
		}
	});

	let eatenUnlocked = $state(false);
	$effect(() => {
		if (producer.EatAmount.gt(0)) eatenUnlocked = true;
		if (producer.Speed.gt(30)) decelerateUnlocked = true;
	});

	interface SoapProducerSave {
		eaten: boolean;
		decelerate: boolean;
	}

	// svelte-ignore state_referenced_locally
	let saveKey = `${type} producer`;
	// svelte-ignore state_referenced_locally
	SaveSystem.SaveCallback<SoapProducerSave>(saveKey, () => {
		return {
			eaten: eatenUnlocked,
			decelerate: decelerateUnlocked,
		};
	});

	// svelte-ignore state_referenced_locally
	SaveSystem.LoadCallback<SoapProducerSave>(saveKey, (data) => {
		eatenUnlocked = data.eaten;
		decelerateUnlocked = data.decelerate;
	});
</script>

<div class="border">
	<div class="m-2">
		{#if producer.Unlocked}
			<div class="flex flex-row">
				<div class="flex flex-col">
					<div class="mb-3 w-full h-full flex flex-col relative">
						<div class="flex flex-row">
							<h1 class="mr-auto">Red Soap ({soap.Amount.format()}x)</h1>
							<h1 class="ml-auto">
								({producer.Progress.format()} /
								{producer.MaxProgress.format()})
							</h1>
						</div>
						<div class="h-2">
							<div
								class="bg-blue-300 absolute h-2"
								style="width: {width}%"
							></div>
							<div class="border w-full h-full z-10"></div>
						</div>
					</div>

					<div class="grid grid-cols-2">
						<button
							onclick={() => producer.UpgradeQuality(qualityCostAmt)}
							class="{qualityCanBuy} mr-1 mb-1"
							>Upgrade Quality +{qualityCostAmt}
							<div>
								({producer.QualityCount}) Cost: ${producer
									.GetQualityCost(qualityCostAmt)
									.format()}
							</div></button
						>
						<button
							class="ml-0 mb-1 {speedCanBuy}"
							onclick={() => producer.UpgradeSpeed(speedCostAmt)}
							>Upgrade Speed +{speedCostAmt}
							<div>
								({producer.SpeedCount}) Cost: ${producer
									.GetSpeedCost(speedCostAmt)
									.format()}
							</div></button
						>
						{#if decelerateUnlocked || DevHacks.skipUnlock}
							<button
								onclick={() => producer.Decelerate()}
								class=" mr-1 mt-1 {canDeccelerate}"
								>Decelerate
								<div>
									({producer.Speed.format()}/ {producer.DecelerateReq.format()})
								</div></button
							>
						{/if}
						{#if eatenUnlocked || DevHacks.skipUnlock}
							<button onclick={producer.Eat} class=" ml-0 mt-1 {canEat}"
								>Eat Soap <div>
									({soap?.ProducedAmount.format()}/ {producer.EatReq.format()})
								</div></button
							>
						{/if}
					</div>
				</div>
				<div class="ml-2 pl-2 border-l">
					<div class="flex flex-col h-full">
						<h1 class="text-center underline mb-2">Actions</h1>
						<div class="flex flex-col">
							<button class="w-full {can}" onclick={Sell}>
								Sell {amount.format()}x
							</button>

							{#if UpgradesData.get(UpgradesKey.CatPrestige)!.count > 0 || DevHacks.skipUnlock}
								<button class="w-full {can}" onclick={Offer}>
									Offer {amount.format()}x
								</button>
							{/if}

							{#if producer.DecelerateCount > 0}
								<button
									class="mt-auto {accelerateIndicator}"
									onclick={Accelerate}>Accelerate</button
								>
							{/if}
						</div>
					</div>
				</div>
			</div>
			<CollapsibleCard transition={{ transition: slide }} isOpen={true}>
				{#snippet header()}
					<div class="h-2 flex flex-row hover:cursor-pointer"></div>
				{/snippet}

				{#snippet body()}
					<div class="flex flex-row">
						<h1>
							Total: {producer.ProducedAmount.format()}
						</h1>
						<h1 class="ml-auto">Quality: {producer.Quality.format()}</h1>
						<h1 class="ml-auto">Speed: {producer.Speed.format()}</h1>
					</div>
					{#if eatenUnlocked || DevHacks.skipUnlock}
						<div class="flex flex-row">
							<h1>
								Eaten: {producer.EatAmount}
							</h1>
							<h1 class="ml-auto">
								{producer.EatMessage()}
							</h1>
						</div>
					{/if}
				{/snippet}
			</CollapsibleCard>
		{:else}
			<div class="flex flex-row">
				<button
					onclick={() => {
						producer.Unlocked = true;
					}}>Unlock Soap Producer?</button
				>
			</div>
		{/if}
	</div>
</div>
