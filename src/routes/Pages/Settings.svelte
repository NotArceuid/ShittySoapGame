<script lang="ts">
	import { SaveSystem } from "../../Game/Saves.ts";
	import { _ } from "svelte-i18n";
	import { Player } from "../../Game/Player.svelte.ts";
	import {
		formatter,
		formatTime,
		Notation,
	} from "../../Game/Shared/BreakInfinity/Formatter.svelte.ts";
	import SaveSlot from "./SaveSlot.svelte";
	import { ColorTheme, SetTheme, Settings } from "./Settings.svelte.ts";
	import { onMount } from "svelte";
	import { OfflineProps } from "../../Game/Game.svelte.ts";
	import { NotificationPopUp } from "../Components/Notification.svelte.ts";

	async function saveToClipboard() {
		const saveString = await SaveSystem.exportToString();
		await navigator.clipboard.writeText(saveString);

		NotificationPopUp.invoke({ name: "Saves", description: "Game Saved!" });
	}

	async function saveToFile() {
		try {
			const saveString = await SaveSystem.exportToString();
			const blob = new Blob([saveString], { type: "text/plain" });
			const a = document.createElement("a");
			document.body.append(a);
			a.download = "ssg_save.txt";
			a.href = URL.createObjectURL(blob);
			a.click();
			a.remove();
			NotificationPopUp.invoke({ name: "Saves", description: "Game Saved!" });
		} catch {}
	}

	//@ts-ignore
	let name = PKG_NAME;
	// @ts-ignore
	let version = PKG_VERSION;

	function RotateTheme() {
		let oldTheme = Settings.Theme;
		let entries = Object.values(ColorTheme)
			.filter((x) => typeof x === "number")
			.map((x) => x as ColorTheme);
		let idx = entries.findIndex((e) => e == Settings.Theme);
		if (idx == -1 || idx >= entries.length - 1) idx = 0;
		else idx = idx + 1;

		Settings.Theme = entries[idx];
		SetTheme(oldTheme);
	}

	function RotateNotation() {
		let entries = Object.values(Notation)
			.filter((x) => typeof x === "number")
			.map((x) => x as Notation);
		let idx = entries.findIndex((e) => e == Settings.Format);
		if (idx == -1 || idx >= entries.length - 1) idx = 0;
		else idx = idx + 1;

		Settings.Format = entries[idx];

		formatter.Notation = Settings.Format;
	}

	let saveBeforeUnload = $state(true);
	onMount(() => {
		window.addEventListener("beforeunload", async () => {
			if (saveBeforeUnload)
				localStorage.setItem(
					OfflineProps.saveId.toString(),
					await SaveSystem.exportToString(),
				);
		});
	});

	onMount(() => {
		saveBeforeUnload = true;
		let save = localStorage.getItem(OfflineProps.saveId.toString());
		if (save) SaveSystem.importFromString(save);

		document.querySelectorAll("button").forEach((button) => {
			button.addEventListener("click", () => {
				const audio = new Audio("/click.wav");
				if (Settings.Sounds) audio.play();
			});
		});
	});

	onMount(() => {
		setInterval(async () => {
			localStorage.setItem(
				OfflineProps.saveId.toString(),
				await SaveSystem.exportToString(),
			);
			NotificationPopUp.invoke({ name: "Saves", description: "Game Saved!" });
		}, 300000);
	});
</script>

<div class="w-full p-2 absolute h-full">
	<div
		class="w-full flex flex-wrap flex-row space-x-8 text-center pb-4 justify-center"
	>
		<div class="w-3/12 p-2 space-y-1">
			<h1 class="text-center font-bold">Settings</h1>
			<div class="flex flex-row flex-wrap gap-2">
				<button onclick={RotateNotation} class="w-full border"
					>Format Type: {Notation[Settings.Format]}</button
				>
				<button onclick={RotateTheme} class="w-full border"
					>Color Theme: {ColorTheme[Settings.Theme]}</button
				>
			</div>
		</div>

		<div class="w-3/12 text-center">
			<h1 class="text-center font-bold">Info</h1>
			<p>{`${name} v${version}`}</p>
			<h1>Time wasted: {formatTime(Player._player.Playtime)}</h1>
		</div>

		<div class="w-3/12 p-2 space-y-1">
			<h1 class="text-center font-bold">Saves</h1>
			<div class="flex flex-wrap flex-row gap-2">
				<button class="w-full border" onclick={saveToClipboard}
					>Save to clipboard</button
				>
				<button class="w-full border" onclick={saveToFile}>Save to file</button>
			</div>
			<SaveSlot save={true} idx="0" />
			<button
				class="bg-red-300 w-full text-black border"
				onclick={() => {
					localStorage.setItem(OfflineProps.saveId.toString(), "");
					localStorage.setItem("savedate", "");
					saveBeforeUnload = false;
					location.reload();
				}}>Delete Save</button
			>
		</div>
	</div>
</div>
