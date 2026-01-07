<script lang="ts">
	import { Soaps, type SoapType } from "../../../Game/Soap/Soap.svelte.ts";
	import { DevHacks, Update } from "../../../Game/Game.svelte";
	import { Player } from "../../../Game/Player.svelte";
	import { SoapProducer } from "./SoapProducer.svelte.ts";
	import SoapSellTab from "./SoapSellTab.svelte";

	let { type }: { type: SoapType } = $props();
	let producer = $derived(new SoapProducer(type));

	let soap = $derived(Soaps.get(type)!);
	let width = $derived(soap?.Progress.div(soap.MaxProgress).mul(100));
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
		producer.Soap?.Amount.lt(producer.RankUpReq)
			? "bg-gray-100 hover:cursor-default"
			: "hover:cursor-pointer",
	);

	Update.add(() => {
		if (producer.Unlocked) {
			producer.AddProgress();
		}
	});
</script>

<div class="border">
	<div class="m-2">
		{#if producer.Unlocked}
			<div class="flex flex-row">
				<div class="flex flex-col">
					<div class=" mb-2 flex flex-row">
						<div class="w-full h-full flex flex-col relative">
							<div class="flex flex-row">
								<h1 class="mr-auto">Red Soap ({soap.Amount.format()}x)</h1>
								<h1 class="ml-auto">
									({soap.Progress.format()} /
									{soap.MaxProgress.format()})
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
					</div>

					<div class="w-full h-full flex flex-row">
						<button
							onclick={() => producer.UpgradeQuality(qualityCostAmt)}
							class={qualityCanBuy}
							>Upgrade Quality +{qualityCostAmt}
							<div>
								({producer.QualityCount}) Cost: ${producer
									.GetQualityCost(qualityCostAmt)
									.format()}
							</div></button
						>
						<button
							class="ml-1 mr-1 {speedCanBuy}"
							onclick={() => producer.UpgradeSpeed(speedCostAmt)}
							>Upgrade Speed +{speedCostAmt}
							<div>
								({producer.SpeedCount}) Cost: ${producer
									.GetSpeedCost(speedCostAmt)
									.format()}
							</div></button
						>
						{#if rankUpUnlocked || DevHacks.skipUnlock}
							<button onclick={producer.TierUp} class={canRankUp}
								>Rank Up <div>
									({soap?.ProducedAmount.format()}/ {producer.RankUpReq.format()})
								</div></button
							>
						{/if}
					</div>
					<div class="flex flex-row mt-3">
						<h1 class="">
							Total: {producer.Soap?.ProducedAmount.format()}
						</h1>
						<h1 class="ml-auto">Quality: {producer.Quality.format()}</h1>
						<h1 class="ml-auto">Speed: {producer.Speed.format()}</h1>
					</div>
				</div>
				<div class="ml-2 pl-2 border-l">
					<SoapSellTab soapType={type} />
				</div>
			</div>
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
