<script lang="ts">
	import { Soaps, type SoapType } from "../../../Game/Soap/Soap.svelte.ts";
	import { DevHacks, Update } from "../../../Game/Game.svelte";
	import { Player } from "../../../Game/Player.svelte";
	import { SoapProducers } from "./SoapProducer.svelte.ts";
	import { CollapsibleCard } from "svelte5-collapsible";
	import { slide } from "svelte/transition";
	import { SaveSystem } from "../../../Game/Saves.ts";
	import {
		UpgradesData,
		UpgradesKey,
	} from "../../../Game/Soap/Upgrades.svelte.ts";
	import { Decimal } from "../../../Game/Shared/BreakInfinity/Decimal.svelte.ts";
	import { log } from "console";
	import ActionButton from "../../Components/ActionButton.svelte";

	let {
		type,
		canAutobuyQuality,
		canAutobuySpeed,
		canAutoDeccelerate,
		deccelerateUnlockThreshold,
		autoEatInterval,
		canAutoEat,
		autoEatBonus,
		autoSellInterval,
		canAutoSell,
		autoSellBonus,
	}: {
		type: SoapType;
		canAutobuyQuality: boolean;
		canAutobuySpeed: boolean;
		canAutoDeccelerate: boolean;
		deccelerateUnlockThreshold: Decimal;
		autoEatInterval: number;
		canAutoEat: boolean;
		autoEatBonus: Decimal;
		autoSellInterval: number;
		canAutoSell: boolean;
		autoSellBonus: Decimal | number;
	} = $props();

	let producer = $derived(SoapProducers[type]);
	let soap = $derived(Soaps[type]!);
	let qualityAutobuy = $state(false);
	let speedAutobuy = $state(false);
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

	let amount = $derived(Decimal.min(Player.BulkAmount, soap.Amount));

	function Sell(): void {
		if (soap.CanSell(amount)) {
			soap.Sell(amount);
		}
	}

	function Offer(): void {}
	function Accelerate(): void {
		producer.DecelerateCount = Math.max(producer.DecelerateCount - 1, 0);
	}
	let qualityInterval = $state(0);
	let speedInterval = $state(0);
	let autobuyTick = 5;
	Update.add(() => {
		if (qualityInterval < autobuyTick && qualityAutobuy) {
			qualityInterval++;
			if (qualityInterval >= autobuyTick) {
				qualityInterval = 0;
				producer.UpgradeQuality(qualityCostAmt);
			}
		}

		if (speedInterval < autobuyTick && speedAutobuy) {
			speedInterval++;
			if (speedInterval >= autobuyTick) {
				speedInterval = 0;
				producer.UpgradeSpeed(speedCostAmt);
			}
		}
	});

	let counter = $state(0);
	Update.add(() => {
		if (producer.Unlocked) {
			producer.AddProgress();
		}

		if (!canAutoSell) return;

		if (counter < autoSellInterval) {
			counter++;
		}

		if (counter >= autoSellInterval) {
			let sellAmount = soap.Amount.mul(autoSellBonus).div(100);
			soap.Sell(sellAmount);
			counter = 0;
		}
	});

	let eatenUnlocked = $state(false);
	let decelerateUnlocked = $state(false);
	$effect(() => {
		if (producer.Speed.gt(deccelerateUnlockThreshold))
			decelerateUnlocked = true;
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

<div class="border p-2">
	{#if producer.Unlocked}
		<div class="flex flex-row border-b pb-4">
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
							style="width: {producer.Progress.div(producer.MaxProgress).mul(
								100,
							)}%"
						></div>
						<div class="border w-full h-full z-10"></div>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-1">
					<div class="flex flex-col">
						<ActionButton
							onclick={() => producer.UpgradeQuality(qualityCostAmt)}
							disabled={producer
								.GetQualityCost(qualityCostAmt)
								.gt(Player.Money)}
						>
							{#snippet content()}
								Upgrade Quality +{qualityCostAmt}
								<div>
									({producer.QualityCount}) Cost: ${producer
										.GetQualityCost(qualityCostAmt)
										.format()}
								</div>
							{/snippet}
						</ActionButton>

						{#if canAutobuyQuality || DevHacks.skipUnlock}
							<!-- Had to use style for padding because tailwinds padding doesnt work here bruvh-->
							<ActionButton
								onclick={() => {
									if (canAutobuyQuality) qualityAutobuy = !qualityAutobuy;
								}}
								disabled={!qualityAutobuy}
								customStyle="padding-bottom: 0px; padding-top: 0px;"
							>
								{#snippet content()}
									<span class="text-xs font-semibold">
										Autobuy: {qualityAutobuy ? "on" : "off"}
									</span>
								{/snippet}
							</ActionButton>
						{/if}
					</div>

					<div class="flex flex-col">
						<ActionButton
							disabled={producer.GetSpeedCost(speedCostAmt).gt(Player.Money)}
							onclick={() => {
								producer.UpgradeSpeed(speedCostAmt);
							}}
						>
							{#snippet content()}
								Upgrade Speed +{speedCostAmt}
								<div>
									({producer.SpeedCount}) Cost: ${producer
										.GetSpeedCost(speedCostAmt)
										.format()}
								</div>
							{/snippet}
						</ActionButton>

						{#if canAutobuySpeed || DevHacks.skipUnlock}
							<ActionButton
								onclick={() => {
									if (canAutobuySpeed) speedAutobuy = !speedAutobuy;
								}}
								disabled={!speedAutobuy}
								customStyle="padding-bottom: 0px; padding-top: 0px;"
							>
								{#snippet content()}
									<span class="font-semibold text-xs">
										Autobuy: {speedAutobuy ? "on" : "off"}
									</span>
								{/snippet}
							</ActionButton>
						{/if}
					</div>

					{#if decelerateUnlocked || DevHacks.skipUnlock}
						<ActionButton
							onclick={() => producer.Decelerate()}
							disabled={producer.Speed.lte(producer.DecelerateReq)}
						>
							{#snippet content()}
								Deccelerate ({producer.DecelerateCount})
								<div>
									({producer.Speed.format()}/ {producer.DecelerateReq.format()})
								</div>
							{/snippet}
						</ActionButton>
					{/if}
					{#if eatenUnlocked || DevHacks.skipUnlock}
						<ActionButton
							onclick={() => producer.Eat()}
							disabled={producer.ProducedAmount.lt(producer.EatReq)}
						>
							{#snippet content()}
								Eat Soap <div>
									({soap?.ProducedAmount.format()}/ {producer.EatReq.format()})
								</div>
							{/snippet}
						</ActionButton>
					{/if}
				</div>
			</div>

			<div class="ml-2 pl-2 border-l">
				<div class="flex flex-col h-full">
					<h1 class="text-center underline mb-2">Actions</h1>
					<div class="flex flex-col">
						<ActionButton
							disabled={soap.Amount.lte(amount) && soap.Amount.lt(0)}
							onclick={Sell}
						>
							{#snippet content()}
								Sell {amount.format()}x
							{/snippet}
						</ActionButton>

						{#if UpgradesData[UpgradesKey.CatPrestige].count > 0 || DevHacks.skipUnlock}
							<ActionButton
								disabled={soap.Amount.gte(amount) && soap.Amount.gt(0)}
								onclick={Sell}
							>
								{#snippet content()}
									Offer: {amount.format()}x
								{/snippet}
							</ActionButton>
						{/if}

						{#if producer.DecelerateCount > 0}
							<ActionButton
								disabled={producer.DecelerateCount <= 1}
								onclick={Accelerate}
							>
								{#snippet content()}
									Accelerate
								{/snippet}
							</ActionButton>
						{/if}
					</div>
				</div>
			</div>
		</div>

		<CollapsibleCard transition={{ transition: slide }} isOpen={true}>
			{#snippet header()}
				<div class="h-2 flex flex-row"></div>
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
							Eaten: {producer.EatAmount.format()}
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
			<ActionButton
				onclick={() => {
					producer.Unlocked = true;
				}}
				disabled={false}
			>
				{#snippet content()}
					Unlock Soap Producer?
				{/snippet}
			</ActionButton>
		</div>
	{/if}
</div>
