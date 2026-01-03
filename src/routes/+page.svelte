<script lang="ts">
	import { DevHacks, GameLoop } from "../Game/Game.svelte.ts";
	import { SaveSystem } from "../Game/Saves.ts";
	import { dev } from "$app/environment";
	import { ColorTheme } from "./Pages/Settings.svelte.ts";
	import Settings from "./Pages/Settings.svelte";
	import NavBar from "../Components/Layout/NavBar.svelte";
	import Soap from "./Pages/Soap/Soap.svelte";
	import { onMount } from "svelte";
	import { MainPageHandler, Pages } from "./page.svelte.ts";
	import { PagesState } from "./Pages/Pages.ts";
	import CurrenciesPanel from "../Components/Layout/CurrenciesPanel.svelte";
	import Howtfdoiplay from "./Pages/guide/howtfdoiplay.svelte";
	import Cat from "./Pages/Cat/Cat.svelte";
	import NotificationHandler from "../Components/Common/NotificationHandler.svelte";
	import Achievements from "./Pages/Achievements/Achievements.svelte";

	let gameRunning = true;
	let gameloop: GameLoop;

	gameloop = new GameLoop();
	gameloop.start();

	async function LoadPlayerData() {
		let playerSaveData =
			localStorage.getItem("player_save") ||
			(await SaveSystem.exportToString());
		if (!playerSaveData) {
			SaveSystem.events.onAfterLoad.add((e) => {
				console.error(e.error);
			});
		}

		return playerSaveData;
	}

	let versionNumber = $derived(
		//@ts-ignore
		`${PKG_NAME} v${PKG_VERSION}${dev ? "(dev)" : ""}`,
	);

	onMount(() => {
		PagesState.set(Pages.Settings, -1);
		PagesState.set(Pages.Soap, -1);

		let elements = document.getElementById("locations")?.children!;
		MainPageHandler.RegisterPages(Pages.Soap, elements[0] as HTMLElement);
		MainPageHandler.RegisterPages(Pages.Cat, elements[1] as HTMLElement);
		MainPageHandler.RegisterPages(
			Pages.Achievements,
			elements[2] as HTMLElement,
		);
		MainPageHandler.RegisterPages(Pages.Settings, elements[3] as HTMLElement);
		MainPageHandler.RegisterPages(
			Pages.HowTfDoIPlay,
			elements[4] as HTMLElement,
		);

		MainPageHandler.ChangePage(Pages.Soap);
	});
</script>

{#if gameRunning}
	<div
		class="h-full relative p-6 flex flex-col"
		style="border-color: rgba({ColorTheme.BorderColor.r}, {ColorTheme
			.BorderColor.g}, {ColorTheme.BorderColor.b}, {ColorTheme.BorderColor.a});"
	>
		<NavBar />
		<div class="flex flex-rows w-full h-full">
			<div id="locations" class="w-10/12 relative">
				<Soap />
				<Cat />
				<Achievements />
				<Settings />
				<Howtfdoiplay />
			</div>
			<CurrenciesPanel />
		</div>

		<div class="absolute bottom-5 right-5">
			<NotificationHandler />
		</div>
	</div>
	{#if dev}
		<div class="absolute">
			<input
				type="checkbox"
				bind:checked={DevHacks.speedhack}
				onchange={() => {
					gameloop.stop();
					gameloop = new GameLoop();
					gameloop.start();
				}}
			/>
			<input type="checkbox" bind:checked={DevHacks.skipMenu} />
			<input type="checkbox" bind:checked={DevHacks.skipUnlock} />
			<input type="checkbox" bind:checked={DevHacks.skipRequirements} />
		</div>
	{/if}
{:else}
	<div class="flex items-center justify-center min-h-screen">
		<div class="text-center">
			<h1>Loading..</h1>
		</div>
	</div>
{/if}
