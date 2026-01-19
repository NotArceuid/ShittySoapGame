<script lang="ts">
	import favicon from "$lib/assets/favicon.svg";
	import { getLocaleFromNavigator, init, waitLocale } from "svelte-i18n";
	import "../app.css";
	import { RegisterLocales } from "../Locales/i18n";
	let { children } = $props();

	RegisterLocales();
	init({
		initialLocale: getLocaleFromNavigator() || "en",
		fallbackLocale: "en",
	});

	waitLocale();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div
	class="w-full h-full transition-colors duration-300 bg-bg text-font border-border"
>
	<main class="w-full h-full">
		{@render children?.()}
	</main>
</div>
