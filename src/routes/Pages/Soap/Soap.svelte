<script lang="ts">
	import SoapProduction from "./SoapProduction.svelte";
	import { onMount } from "svelte";
	import { SoapPages } from "../../../Game/Soap/Soap.svelte";
	import SoapUpgrades from "./SoapUpgrades.svelte";
	import Foundry from "../Foundry/Foundry.svelte";
	import { DevHacks, OfflineProps } from "../../../Game/Game.svelte";
	import { SaveSystem } from "../../../Game/Saves";
	import { Player } from "../../../Game/Player.svelte";
	import {
		UpgradeBought,
		UpgradesKey,
	} from "../../../Game/Soap/Upgrades.svelte";
	import { PageHandler, PagesEnum } from "../Pages.svelte.ts";
	import {
		AchievementKey,
		UnlockAchievement,
	} from "../../../Game/Achievements/Achievements.svelte.ts";

	const pageHandler = new PageHandler<SoapPages>(false, PagesEnum.Soap);

	let upgradesUnlocked = $state(false);
	let foundryUnlocked = $state(false);
	$effect(() => {
		if (Player.Money.gt(7.5)) {
			upgradesUnlocked = true;
			UnlockAchievement(AchievementKey.Upgrades);
		}
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

	let saveKey = "soap_page";
	SaveSystem.SaveCallback<SoapData>(saveKey, () => {
		return {
			upgradesUnlocked: upgradesUnlocked,
			foundryUnlocked: foundryUnlocked,
		};
	});

	SaveSystem.LoadCallback<SoapData>(saveKey, (data) => {
		upgradesUnlocked = data.upgradesUnlocked;
		foundryUnlocked = data.foundryUnlocked;
	});

	function ChangePage(page: SoapPages) {
		pageHandler.ChangePage(page);
	}
</script>

<div
	class="absolute w-full pt-2 flex flex-col h-full {OfflineProps.calculating
		? 'opacity-0'
		: 'opacity-100'}"
>
	<div class="flex flex-row w-full ml-2" id="soap-nav">
		<button onclick={() => ChangePage(SoapPages.Produce)}> Produce </button>

		{#if upgradesUnlocked || DevHacks.skipUnlock}
			<button onclick={() => ChangePage(SoapPages.Upgrades)}> Upgrades </button>
		{/if}

		{#if foundryUnlocked || DevHacks.skipUnlock}
			<button onclick={() => ChangePage(SoapPages.Foundry)}> Foundry </button>
		{/if}
	</div>
	<div
		id="soap-pages"
		class="w-full flex flex-row h-screen relative overflow-y-scroll"
	>
		<SoapProduction />
		<SoapUpgrades />
		<Foundry />
	</div>
</div>

<style>
	#soap-nav > * {
		margin-right: 0.5rem;
		border: 1px solid var(--color-border);
	}
</style>
