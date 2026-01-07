<script lang="ts">
	import { Soaps, type SoapType } from "../../../Game/Soap/Soap.svelte.ts";
	import { DevHacks, Update } from "../../../Game/Game.svelte";
	import { Player } from "../../../Game/Player.svelte";
	import { SoapProducer } from "./SoapProducer.svelte.ts";
	import SoapSellTab from "./SoapSellTab.svelte";
	import { CollapsibleCard } from "svelte5-collapsible";
	import { slide } from "svelte/transition";
	import { SaveSystem } from "../../../Game/Saves.ts";

	let { type }: { type: SoapType } = $props();
	let producer = $derived(new SoapProducer(type));

	let soap = $derived(Soaps.get(type)!);
	let width = $derived(producer.Progress.div(producer.MaxProgress).mul(100));
	let rankUpUnlocked = $state(false);

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

	let canRankUp = $derived(
		producer.Amount.lt(producer.RankUpReq)
			? "bg-gray-100 hover:cursor-default"
			: "hover:cursor-pointer",
	);

	let eatenUnlocked = $state(false);
	$effect(() => {
		if (producer.EatAmount.gt(0)) eatenUnlocked = true;
	});

	Update.add(() => {
		if (producer.Unlocked) {
			producer.AddProgress();
		}
	});

	interface SoapProducerSave {
		eatenUnlocked: boolean;
	}

	// svelte-ignore state_referenced_locally
	let saveKey = `${type} producer`;
	// svelte-ignore state_referenced_locally
	SaveSystem.SaveCallback<SoapProducerSave>(saveKey, () => {
		return {
			eatenUnlocked: eatenUnlocked,
		};
	});

	// svelte-ignore state_referenced_locally
	SaveSystem.LoadCallback<SoapProducerSave>(saveKey, (data) => {
		eatenUnlocked = data.eatenUnlocked;
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
						{#if rankUpUnlocked || DevHacks.skipUnlock}
							<button
								onclick={producer.Decelerate}
								class=" mr-1 mt-1 {canRankUp}  "
								>Decelerate
								<div>
									({producer.Speed.format()}/ {producer.DecelerateReq.format()})
								</div></button
							>
						{/if}
						{#if rankUpUnlocked || DevHacks.skipUnlock}
							<button onclick={producer.TierUp} class=" ml-0 mt-1 {canRankUp}"
								>Promote <div>
									({soap?.ProducedAmount.format()}/ {producer.RankUpReq.format()})
								</div></button
							>
						{/if}
					</div>
				</div>
				<div class="ml-2 pl-2 border-l">
					<SoapSellTab soapType={type} />
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
