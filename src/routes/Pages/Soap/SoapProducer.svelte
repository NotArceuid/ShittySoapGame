<script lang="ts">
	import {
		SoapNameMapping,
		Soaps,
		SoapType,
	} from "../../../Game/Soap/Soap.svelte.ts";
	import { AutomationTick, DevHacks, Update } from "../../../Game/Game.svelte";
	import { Player } from "../../../Game/Player.svelte";
	import { SoapProducers } from "./SoapProducer.svelte.ts";
	import { CollapsibleCard } from "svelte5-collapsible";
	import { fade, slide } from "svelte/transition";
	import { Decimal } from "../../../Game/Shared/BreakInfinity/Decimal.svelte.ts";
	import ActionButton from "../../Components/ActionButton.svelte";
	import {
		AchievementKey,
		AchievementsData,
		UnlockAchievement,
	} from "../../../Game/Achievements/Achievements.svelte.ts";
	import { SaveSystem } from "../../../Game/Saves.ts";
	import { log } from "console";

	let {
		type,
		unlocked,
		canAutobuyQuality,
		canAutobuySpeed,

		canAutoDeccelerate,
		canDeccelerate,

		canEat,
		canAutoEat,
		autoEatInterval,
		autoEatBonus,

		autoSellInterval,
		canAutoSell,
		autoSellReduction,
		autoSellBonus,
	}: {
		type: SoapType;
		unlocked: boolean;
		canAutobuyQuality: boolean;
		canAutobuySpeed: boolean;

		canAutoDeccelerate: boolean;
		canDeccelerate: boolean;

		autoEatInterval: number;
		canEat: boolean;
		canAutoEat: boolean;
		autoEatBonus: Decimal;

		autoSellInterval: number;
		autoSellReduction: number;
		canAutoSell: boolean;
		autoSellBonus: number;
	} = $props();

	let producer = $derived(SoapProducers[type]);
	let soap = $derived(Soaps[type]!);
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
	// Here for unlock
	$effect(() => {
		if (canEat) producer.EatSoapUnlocked = true;
		if (canDeccelerate) producer.DeccelerateUnlocked = true;
		if (canAutoSell) autoSell = true;

		let qualityCount = new Decimal(producer.QualityCount);
		let speedCount = new Decimal(producer.SpeedCount);
		if (AchievementsData[AchievementKey.Nice].check(qualityCount, speedCount))
			UnlockAchievement(AchievementKey.Nice);
		if (AchievementsData[AchievementKey.Quality].check(qualityCount))
			UnlockAchievement(AchievementKey.Quality);
		if (AchievementsData[AchievementKey.Speedy].check(speedCount))
			UnlockAchievement(AchievementKey.Speedy);
		if (AchievementsData[AchievementKey.OCD].check(qualityCount, speedCount))
			UnlockAchievement(AchievementKey.OCD);

		if (type === SoapType.Red) {
			if (
				AchievementsData[AchievementKey.Deccelerate].check(
					new Decimal(producer.DecelerateCount),
				)
			)
				UnlockAchievement(AchievementKey.Deccelerate);
			if (
				AchievementsData[AchievementKey.Deccelerate2].check(
					new Decimal(producer.DecelerateCount),
				)
			)
				UnlockAchievement(AchievementKey.Deccelerate2);
			if (
				AchievementsData[AchievementKey.Deccelerate3].check(
					new Decimal(producer.DecelerateCount),
				)
			)
				UnlockAchievement(AchievementKey.Deccelerate3);
			if (
				AchievementsData[AchievementKey.Deccelerate4].check(
					new Decimal(producer.DecelerateCount),
				)
			)
				UnlockAchievement(AchievementKey.Deccelerate4);
			if (
				AchievementsData[AchievementKey.Overcap].check(
					new Decimal(producer.Speed),
					new Decimal(producer.MaxProgress),
				)
			)
				UnlockAchievement(AchievementKey.Overcap);
		}
		if (type === SoapType.Orange) {
			if (
				AchievementsData[AchievementKey.OrangeDeccel1].check(
					new Decimal(producer.DecelerateCount),
				)
			)
				UnlockAchievement(AchievementKey.OrangeDeccel1);
		}
	});

	// Quality autobuy code
	let qualityAutobuy = $state(true);
	let qualityInterval = $state(0);
	Update.add(() => {
		if (
			qualityInterval < AutomationTick &&
			qualityAutobuy &&
			canAutobuyQuality
		) {
			qualityInterval++;
			if (qualityInterval >= AutomationTick) {
				qualityInterval = 0;
				producer.UpgradeQuality(qualityCostAmt);
			}
		}
	});

	// Speed autobuy code
	let speedAutobuy = $state(true);
	let speedInterval = $state(0);
	Update.add(() => {
		if (speedInterval < AutomationTick && speedAutobuy && canAutobuySpeed) {
			speedInterval++;
			if (speedInterval >= AutomationTick) {
				speedInterval = 0;
				producer.UpgradeSpeed(speedCostAmt);
			}
		}
	});

	let counter = $state(0);
	let autoSell = $state(true);
	Update.add(() => {
		if (!autoSell || !canAutoSell) return;

		if (counter < autoSellInterval) {
			counter++;
		}

		if (counter >= autoSellInterval) {
			let sellAmount = soap.Amount.mul(autoSellBonus + 1).div(100);
			let reductionAmount = sellAmount.mul(autoSellReduction).div(100);

			soap.Sell(sellAmount, reductionAmount);
			counter = 0;
		}
	});

	Update.add(() => {
		if (producer.Unlocked) {
			producer.AddProgress();
		}
	});

	let canShowUpgrades = $state(false);
	// svelte-ignore state_referenced_locally
	let saveKey = `${soap.Type} + producer`;
	interface SaveProps {
		showupgrades: boolean;
	}

	SaveSystem.SaveCallback<SaveProps>(saveKey, () => {
		return {
			showupgrades: canShowUpgrades,
		};
	});

	SaveSystem.LoadCallback<SaveProps>(saveKey, (data) => {
		canShowUpgrades = data.showupgrades;
	});

	let barProgress = $derived(
		producer.Speed.gt(producer.MaxProgress)
			? producer.MaxProgress.format()
			: producer.Progress.format(),
	);
	let barWidth = $derived(
		producer.Speed.gt(producer.MaxProgress)
			? 100
			: producer.Progress.div(producer.MaxProgress).mul(100).toNumber(),
	);
</script>

{#if unlocked}
	<div class="border p-2 h-fit min-w-xl max-w-2xl border-border">
		<div class="flex flex-row border-b pb-2">
			<div class="flex flex-col w-9/12">
				<div class="mb-3 w-full h-full flex flex-col relative">
					<div class="flex flex-row">
						<h1 class="mr-auto">
							{SoapNameMapping[type]} ({soap.Amount.format()}x)
						</h1>
						<h1 class="ml-auto">
							({barProgress} /
							{producer.MaxProgress.format()})
						</h1>
					</div>
					<div class="h-2 relative overflow-hidden rounded">
						<div
							class=" absolute h-2 transition-all ease-linear duration-25 bg-blue-300"
							style="width: {barWidth}%"
						></div>
						<div
							class="border border-gray-900 w-full h-full absolute rounded"
						></div>
					</div>
				</div>

				{#if canShowUpgrades}
					<div class="grid grid-cols-2 gap-1" transition:fade>
						<div class="flex flex-col">
							<ActionButton
								onclick={() => producer.UpgradeQuality(qualityCostAmt)}
								disabled={producer
									.GetQualityCost(qualityCostAmt)
									.gt(Player.Money)}
							>
								{#snippet content()}
									Upgrade Quality [+{qualityCostAmt}]
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
									disabled={qualityAutobuy}
									customStyle="padding-bottom: 0px; padding-top: 0px;"
								>
									{#snippet content()}
										<span class="text-xs font-semibold">
											Auto Buy: {qualityAutobuy ? "on" : "off"}
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
									Upgrade Speed [+{speedCostAmt}]
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
									disabled={speedAutobuy}
									customStyle="padding-bottom: 0px; padding-top: 0px;"
								>
									{#snippet content()}
										<span class="font-semibold text-xs">
											Auto Buy: {speedAutobuy ? "on" : "off"}
										</span>
									{/snippet}
								</ActionButton>
							{/if}
						</div>

						{#if canDeccelerate || DevHacks.skipUnlock}
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
						{#if canEat || DevHacks.skipUnlock}
							<ActionButton
								onclick={() => producer.Eat()}
								disabled={producer.Soap.ProducedAmount.lt(producer.EatReq)}
							>
								{#snippet content()}
									Eat Soap <div>
										({soap?.ProducedAmount.format()}/ {producer.EatReq.format()})
									</div>
								{/snippet}
							</ActionButton>
						{/if}
					</div>
				{/if}
			</div>

			<div class="ml-2 pl-2 border-l w-3/12">
				<div class="flex flex-col h-full">
					<div class="flex flex-col">
						<ActionButton
							disabled={soap.Amount.lte(0)}
							onclick={() => {
								if (!canShowUpgrades) {
									if (!AchievementsData[AchievementKey.Businessman].unlocked)
										UnlockAchievement(AchievementKey.Businessman);
									canShowUpgrades = true;
								}
								soap.Sell(amount);
							}}
						>
							{#snippet content()}
								Sell {amount.format()}x
							{/snippet}
						</ActionButton>

						{#if canAutoSell || DevHacks.skipUnlock}
							<ActionButton
								customStyle={"padding-top: 0px; padding-bottom: 0px; margin-bottom: .5rem;"}
								disabled={autoSell}
								onclick={() => {
									autoSell = !autoSell;
								}}
							>
								{#snippet content()}
									<span class="text-xs font-semibold">
										Auto Sell: {autoSell ? "on" : "off"}
									</span>
								{/snippet}
							</ActionButton>
						{/if}

						{#if producer.DecelerateCount > 0 || DevHacks.skipUnlock}
							<ActionButton
								disabled={producer.DecelerateCount < 1}
								onclick={() => {
									if (!AchievementsData[AchievementKey.Accelerate].unlocked)
										UnlockAchievement(AchievementKey.Accelerate);
									producer.DecelerateCount = Math.max(
										producer.DecelerateCount - 1,
										0,
									);
								}}
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

		{#if canShowUpgrades}
			<CollapsibleCard transition={{ transition: slide }} isOpen={true}>
				{#snippet header()}
					<div class="h-2 flex flex-row"></div>
				{/snippet}

				{#snippet body()}
					<div class="flex flex-row border-border">
						<h1>
							Total: {producer.Soap.ProducedAmount.format()}
						</h1>
						<h1 class="ml-auto">Quality: {producer.Quality.format()}</h1>
						<h1 class="ml-auto">Speed: {producer.Speed.format()}</h1>
					</div>
					{#if canEat || DevHacks.skipUnlock}
						<div class="flex flex-row">
							<h1>
								Eaten: {producer.Soap.EatAmount.format()}
							</h1>
							<h1 class="ml-auto">
								{producer.Soap.EatMessage()}
							</h1>
						</div>
					{/if}
				{/snippet}
			</CollapsibleCard>
		{/if}
	</div>
{/if}
