<script lang="ts">
	import { SoapType } from "../../../Game/Soap/Soap.svelte.ts";
	import { Update } from "../../../Game/Game.svelte";
	import { Player } from "../../../Game/Player.svelte";
	import { SoapProducer } from "./SoapProducer.svelte.ts";

	let { type }: { type: SoapType } = $props();
	let producer = $derived(new SoapProducer(type));

	let soap = $derived(Player.Soap.get(type)!);
	let width = $derived(soap?.Progress.div(soap.MaxProgress).mul(100));

	let speedCostAmt = $state(1);
	let qualityCostAmt = $state(1);

	$effect(() => {
		const speedMax = producer.SpeedFormula.BuyMax(
			Player.Money,
			producer.SpeedCount,
		);

		const speedAmt = speedMax >= 1 ? speedMax : 1;

		const qualityMax = producer.QualityFormula.BuyMax(
			Player.Money,
			producer.QualityCount,
		);
		const qualityAmt = qualityMax >= 1 ? qualityMax : 1;

		speedCostAmt = Math.min(Player.BulkAmount, speedAmt);
		qualityCostAmt = Math.min(Player.BulkAmount, qualityAmt);
	});

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
			<div class=" mb-2 flex flex-row">
				<h1 class="text-nowrap mt-auto">Making: {type}</h1>

				<div class="w-11/12 h-full ml-4 flex flex-col relative">
					<h1 class="ml-auto">
						({soap.Progress.format()} /
						{soap.MaxProgress.format()})
					</h1>
					<div class="h-2">
						<div class="bg-blue-300 absolute h-2" style="width: {width}%"></div>
						<div class="border w-full h-full z-10"></div>
					</div>
				</div>
			</div>
			<div class="flex flex-col">
				<div class="w-full h-full flex flex-row">
					<button
						onclick={() => producer.UpgradeQuality(qualityCostAmt)}
						class={qualityCanBuy}
						>Upgrade Quality {qualityCostAmt}
						<div>
							Cost: {producer.GetQualityCost(qualityCostAmt).format()}
						</div></button
					>
					<button
						class="ml-2 mr-2 {speedCanBuy}"
						onclick={() => producer.UpgradeSpeed(speedCostAmt)}
						>Upgrade Speed {speedCostAmt}
						<div>
							Cost: {producer.GetSpeedCost(speedCostAmt).format()}
						</div></button
					>
					<button onclick={producer.TierUp} class={canRankUp}
						>Rank Up <div>
							({soap?.ProducedAmount}/ {producer.RankUpReq})
						</div></button
					>
				</div>
			</div>
			<div class="flex flex-row mt-3">
				<h1>Quality: {producer.QualityCount}</h1>
				<h1 class="ml-auto">Speed: {producer.SpeedCount}</h1>
				<h1 class="ml-auto">Produced: {producer.QualityCount}</h1>
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
