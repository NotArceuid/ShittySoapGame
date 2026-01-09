<script lang="ts">
	import { MainPageHandler, Pages } from "./page.svelte.ts";
	import { DevHacks, MainLoop } from "../Game/Game.svelte.ts";
	import { SaveSystem } from "../Game/Saves.ts";
	import { dev } from "$app/environment";
	import { ColorTheme } from "./Pages/Settings.svelte.ts";
	import Settings from "./Pages/Settings.svelte";
	import Soap from "./Pages/Soap/Soap.svelte";
	import { onMount } from "svelte";
	import { PagesState } from "./Pages/Pages.ts";
	import Howtfdoiplay from "./Pages/guide/howtfdoiplay.svelte";
	import Cat from "./Pages/Cat/Cat.svelte";
	import Achievements from "./Pages/Achievements/Achievements.svelte";
	import CurrenciesPanel from "./Components/CurrenciesPanel.svelte";
	import NotificationHandler from "./Components/NotificationHandler.svelte";
	import NavBar from "./Components/NavBar.svelte";
	import { isLoading } from "svelte-i18n";

	MainLoop.start();

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

  isLoading.subscribe((state) => {
    if (state ) return;
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
  })
</script>

{#if isLoading}
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
		{#if dev}
			<div class="absolute -top-1">
				<input
					type="checkbox"
					bind:checked={DevHacks.speedhack}
					onchange={() => {
						MainLoop.restart();
					}}
				/>
				<input type="checkbox" bind:checked={DevHacks.skipUnlock} />
			</div>
		{/if}
	</div>
{:else}
	<div class="flex items-center justify-center min-h-screen">
		<div class="text-center">
			<h1>Loading..</h1>
		</div>
	</div>
{/if}
