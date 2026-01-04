<script lang="ts">
	import SoapSell from "./SoapSell.svelte";
	import SoapProduction from "./SoapProduction.svelte";
	import { onMount } from "svelte";
	import { SoapPages } from "../../../Game/Soap/Soap.svelte";
	import { PageHandler } from "../Pages";
	import { Pages } from "../../page.svelte";
	import SoapUpgrades from "./SoapUpgrades.svelte";
	import Foundry from "../Foundry/Foundry.svelte";

	const pageHandler = new PageHandler<SoapPages>(false, Pages.Soap);
	onMount(() => {
		let elements = document.getElementById("soap-pages")?.children!;
		pageHandler.RegisterPages(SoapPages.Sell, elements[0] as HTMLElement);
		pageHandler.RegisterPages(SoapPages.Produce, elements[1] as HTMLElement);
		pageHandler.RegisterPages(SoapPages.Upgrades, elements[2] as HTMLElement);
		pageHandler.RegisterPages(SoapPages.Foundry, elements[3] as HTMLElement);

		pageHandler.ChangePage(SoapPages.Foundry);
	});
</script>

<div class="absolute w-full">
	<div class="flex flex-row w-full ml-2 pr-2" id="soap-nav">
		<button onclick={() => pageHandler.ChangePage(SoapPages.Sell)}>
			Sell
		</button>
		<button onclick={() => pageHandler.ChangePage(SoapPages.Produce)}>
			Produce
		</button>
		<button onclick={() => pageHandler.ChangePage(SoapPages.Upgrades)}>
			Upgrades
		</button>
		<button onclick={() => pageHandler.ChangePage(SoapPages.Foundry)}>
			Foundry
		</button>
		<div class="ml-auto"></div>
	</div>
	<div id="soap-pages" class="w-full flex flex-row h-screen overflow-y-scroll">
		<SoapSell />
		<SoapProduction />
		<SoapUpgrades />
		<Foundry />
	</div>
</div>

<style>
	#soap-nav > * {
		margin-right: 0.5rem;
	}
</style>
