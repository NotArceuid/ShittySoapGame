<script lang="ts">
	import SoapProduction from "./SoapProduction.svelte";
	import { onMount } from "svelte";
	import { SoapPages } from "../../../Game/Soap/Soap.svelte";
	import { PageHandler } from "../Pages";
	import { Pages } from "../../page.svelte";
	import SoapUpgrades from "./SoapUpgrades.svelte";
	import Foundry from "../Foundry/Foundry.svelte";
	import { DevHacks } from "../../../Game/Game.svelte";
	import { SaveSystem } from "../../../Game/Saves";
	import { Player } from "../../../Game/Player.svelte";
	import {
		UpgradeBought,
		UpgradesKey,
	} from "../../../Game/Soap/Upgrades.svelte";

	const pageHandler = new PageHandler<SoapPages>(false, Pages.Soap);

	let upgradesUnlocked = $state(false);
	let foundryUnlocked = $state(false);
	$effect(() => {
		if (Player.Money.gt(10)) upgradesUnlocked = true;
	});

	UpgradeBought.add((key) => {
		if (key == UpgradesKey.UnlockFoundry) foundryUnlocked = true;
	});

	onMount(() => {
		let elements = document.getElementById("soap-pages")?.children!;
		pageHandler.RegisterPages(SoapPages.Produce, elements[0] as HTMLElement);
		pageHandler.RegisterPages(SoapPages.Upgrades, elements[1] as HTMLElement);
		pageHandler.RegisterPages(SoapPages.Foundry, elements[2] as HTMLElement);

		pageHandler.ChangePage(SoapPages.Produce);
	});

	interface SoapData {
		upgradesUnlocked: boolean;
		foundryUnlocked: boolean;
	}

	SaveSystem.SaveCallback<SoapData>("soap", () => {
		return {
			upgradesUnlocked: upgradesUnlocked,
			foundryUnlocked: foundryUnlocked,
		};
	});

	SaveSystem.LoadCallback<SoapData>("soap", (data) => {
		upgradesUnlocked = data.upgradesUnlocked;
		foundryUnlocked = data.foundryUnlocked;
	});
</script>

<div class="absolute w-full">
	<div class="flex flex-row w-full ml-2 pr-2" id="soap-nav">
		<button onclick={() => pageHandler.ChangePage(SoapPages.Produce)}>
			Produce
		</button>

		{#if upgradesUnlocked || DevHacks.skipUnlock}
			<button onclick={() => pageHandler.ChangePage(SoapPages.Upgrades)}>
				Upgrades
			</button>
		{/if}

		{#if foundryUnlocked || DevHacks.skipUnlock}
			<button onclick={() => pageHandler.ChangePage(SoapPages.Foundry)}>
				Foundry
			</button>
		{/if}
		<div class="ml-auto"></div>
	</div>
	<div id="soap-pages" class="w-full flex flex-row h-screen overflow-y-scroll">
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
