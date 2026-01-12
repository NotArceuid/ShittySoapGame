<script>
	import { Decimal } from "../../../Game/Shared/BreakInfinity/Decimal.svelte.ts";
	import { SoapType } from "../../../Game/Soap/Soap.svelte.ts";
	import {
		UpgradesData,
		UpgradesKey,
	} from "../../../Game/Soap/Upgrades.svelte.ts";
	import SoapProducer from "./SoapProducer.svelte";
</script>

<div class="absolute p-2">
	<div class="flex flex-wrap w-full">
		<SoapProducer
			type={SoapType.Red}
			canAutoSell={UpgradesData[UpgradesKey.RedSoapAutoSeller].count > 0}
			autoSellInterval={30 -
				3 * UpgradesData[UpgradesKey.RedSoapAutoSeller].count}
			autoSellBonus={UpgradesData[UpgradesKey.RedSoapAutoSellBonus].count - 1}
			canAutobuyQuality={UpgradesData[UpgradesKey.RedQualityAutobuy].count > 0}
			canAutobuySpeed={UpgradesData[UpgradesKey.RedSpeedAutobuy].count > 0}
			canAutoDeccelerate={false}
			deccelerateUnlockThreshold={new Decimal(30)}
			autoEatInterval={0}
			canAutoEat={false}
			autoEatBonus={new Decimal(1)}
		/>
	</div>
</div>
