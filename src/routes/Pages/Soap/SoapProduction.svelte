<script>
	import { DevHacks } from "../../../Game/Game.svelte.ts";
	import { Decimal } from "../../../Game/Shared/BreakInfinity/Decimal.svelte.ts";
	import { SoapType } from "../../../Game/Soap/Soap.svelte.ts";
	import {
		UpgradesData,
		UpgradesKey,
	} from "../../../Game/Soap/Upgrades.svelte.ts";
	import SoapProducer from "./SoapProducer.svelte";
	import { SoapProducers } from "./SoapProducer.svelte.ts";
</script>

<div class="absolute p-2">
	<div class="flex flex-wrap w-full space-x-6 spacey-6">
		<SoapProducer
			type={SoapType.Red}
			canAutoSell={UpgradesData[UpgradesKey.RedSoapAutoSeller].count > 0}
			autoSellInterval={30 -
				3 * UpgradesData[UpgradesKey.RedSoapAutoSeller].count}
			autoSellReduction={UpgradesData[UpgradesKey.RedAutoSellReduction].count}
			autoSellBonus={UpgradesData[UpgradesKey.RedSoapAutoSellBonus].count}
			canAutobuyQuality={UpgradesData[UpgradesKey.RedQualityAutobuy].count > 0}
			canAutobuySpeed={UpgradesData[UpgradesKey.RedSpeedAutobuy].count > 0}
			canAutoDeccelerate={false}
			canDeccelerate={SoapProducers[SoapType.Red].Speed.gt(30)}
			canEat={UpgradesData[UpgradesKey.EatRedSoapUpgrade].count > 0}
			autoEatInterval={0}
			canAutoEat={false}
			autoEatBonus={new Decimal(1)}
		/>

		{#if UpgradesData[UpgradesKey.UnlockOrangeSoap].count > 0 || DevHacks.skipUnlock}
			<SoapProducer
				type={SoapType.Orange}
				canAutoSell={UpgradesData[UpgradesKey.OrangeSoapAutoSeller].count > 0}
				autoSellInterval={30 -
					3 * UpgradesData[UpgradesKey.OrangeSoapAutoSeller].count}
				autoSellReduction={UpgradesData[UpgradesKey.OrangeAutoSellReduction]
					.count}
				autoSellBonus={UpgradesData[UpgradesKey.OrangeSoapAutoSellBonus].count}
				canAutobuyQuality={false}
				canAutobuySpeed={false}
				canAutoDeccelerate={false}
				canDeccelerate={SoapProducers[SoapType.Orange].Speed.gt(100)}
				canEat={false}
				autoEatInterval={0}
				canAutoEat={false}
				autoEatBonus={new Decimal(1)}
			/>
		{/if}
	</div>
</div>
