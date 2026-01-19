<script lang="ts">
	import { DevHacks, MainLoop, OfflineProps } from "../Game/Game.svelte.ts";
	import { dev } from "$app/environment";
	import Settings from "./Pages/Settings.svelte";
	import Soap from "./Pages/Soap/Soap.svelte";
	import Howtfdoiplay from "./Pages/guide/howtfdoiplay.svelte";
	import Cat from "./Pages/Cat/Cat.svelte";
	import Achievements from "./Pages/Achievements/Achievements.svelte";
	import CurrenciesPanel from "./Components/CurrenciesPanel.svelte";
	import NavBar from "./Components/NavBar.svelte";
	import { isLoading } from "svelte-i18n";
	import { MainPageHandler, PagesEnum } from "./Pages/Pages.svelte.ts";
	import ScreenSaver from "./ScreenSaver.svelte";
	import { SvelteMap } from "svelte/reactivity";
	import Footer from "./Footer.svelte";
	import MenuSettings from "./MenuSettings.svelte";
	import { onMount } from "svelte";
	import NotificationHandler from "./Components/NotificationHandler.svelte";
	import {
		NotificationPopUp,
		type INotification,
	} from "./Components/Notification.svelte.ts";

	MainLoop.start();

	let previousPage = $state(PagesEnum.Soap);
	$effect(() => {
		if (OfflineProps.calculating) {
			previousPage = MainPageHandler.currentPage ?? PagesEnum.Soap;
			MainPageHandler.PagesMap.forEach((v) => {
				v.style.visibility = "hidden";
			});
		}
		if (!OfflineProps.calculating && gameEntered) {
			let elements = document.getElementById("locations")?.children!;
			MainPageHandler.PagesMap = new SvelteMap();
			MainPageHandler.RegisterPages(PagesEnum.Soap, elements[0] as HTMLElement);
			MainPageHandler.RegisterPages(PagesEnum.Cat, elements[1] as HTMLElement);
			MainPageHandler.RegisterPages(
				PagesEnum.Achievements,
				elements[2] as HTMLElement,
			);
			MainPageHandler.RegisterPages(
				PagesEnum.Settings,
				elements[3] as HTMLElement,
			);
			MainPageHandler.RegisterPages(
				PagesEnum.HowTfDoIPlay,
				elements[4] as HTMLElement,
			);

			MainPageHandler.ChangePage(previousPage);
		}
	});

	let gameEntered = $state(false);
	let inMenuSettings = $state(false);

	let notificationList: INotification[] = $state([]);
	onMount(() => {
		NotificationPopUp.add((notification: INotification) => {
			notificationList.push(notification);
		});
	});
</script>

{#if !gameEntered}
	<div class="flex justify-center items-center absolute w-full h-full">
		<div
			class="border absolute flex flex-col justify-center items-center min-w-xl p-5 space-y-2 {inMenuSettings
				? 'invisible'
				: 'visible'}"
		>
			<h1 class="text-center text-2xl pb-3">Soap Game</h1>

			<div class="flex flex-row w-full space-x-4">
				<button
					class="w-full border"
					onclick={() => (gameEntered = !gameEntered)}>Play</button
				>
				<button class="w-full border" onclick={() => (inMenuSettings = true)}
					>Settings</button
				>
			</div>
		</div>

		{#if inMenuSettings}
			<div class="absolute w-12/12 h-6/12 items-center justify-center">
				<MenuSettings bind:open={inMenuSettings} />
			</div>
		{/if}
	</div>
	<div class="absolute bottom-0 left-6">
		<Footer />
	</div>
{/if}

{#if gameEntered}
	{#if isLoading}
		{#if OfflineProps.calculating}
			<div class="flex justify-center items-center absolute w-full h-full">
				<ScreenSaver active={OfflineProps.calculating} />
				<div
					class="border absolute flex flex-col justify-center items-center p-2"
				>
					<h1>Calculating Offline Progress</h1>
					<div>
						{OfflineProps.initialTick -
							OfflineProps.offlineTick}/{OfflineProps.initialTick}
					</div>
				</div>
			</div>
		{/if}
		<div
			class="h-full p-6 pb-0 flex flex-col {OfflineProps.calculating
				? 'invisible'
				: 'visible'}"
		>
			<NavBar />
			<div class="flex flex-rows w-full h-full">
				<div
					id="locations"
					class="w-11/12 relative border-l border-b border-border"
				>
					<Soap />
					<Cat />
					<Achievements />
					<Settings />
					<Howtfdoiplay />
				</div>
				<div class="min-w-48 border-b">
					<CurrenciesPanel />
				</div>
			</div>

			<div class="absolute bottom-5 right-5">
				{#each notificationList as notification}
					<NotificationHandler
						data={notification}
						done={() => {
							notificationList = notificationList.filter(
								(a) => a.name !== notification.name,
							);
						}}
					/>
				{/each}
			</div>

			<Footer />
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
	{:else}
		<div class="flex items-center justify-center min-h-screen">
			<div class="text-center">
				<h1>Loading..</h1>
			</div>
		</div>
	{/if}
{/if}
