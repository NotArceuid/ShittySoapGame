<script lang="ts">
	import { Settings } from "./Pages/Settings.svelte.ts";
	import { ColorTheme } from "./Pages/Settings.svelte.ts";
	import {
		formatter,
		formatTime,
		Notation,
	} from "../Game/Shared/BreakInfinity/Formatter.svelte";
	import { Player } from "../Game/Player.svelte";

	let { open = $bindable() } = $props();

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
		document.documentElement.classList.remove(classList[oldTheme]);
		switch (Settings.Theme) {
			case ColorTheme.Dark:
				document.documentElement.classList.toggle(classList[ColorTheme.Dark]);
				break;
			case ColorTheme.Light:
				document.documentElement.classList.toggle(classList[ColorTheme.Light]);
		}
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

	let classList: Record<ColorTheme, string> = {
		[ColorTheme.Light]: "light",
		[ColorTheme.Dark]: "dark",
	};
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
	</div>

	<button class=" border absolute right-50" onclick={() => (open = false)}
		>Back</button
	>
</div>
