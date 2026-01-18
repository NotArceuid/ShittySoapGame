<script lang="ts">
	import { DevHacks } from "../../Game/Game.svelte";
	import { UpgradesData, UpgradesKey } from "../../Game/Soap/Upgrades.svelte";
	import { MainPageHandler, PagesEnum } from "../Pages/Pages.svelte";
</script>

<div id="navbar" class="border py-3 border-border">
	<button onclick={() => MainPageHandler.ChangePage(PagesEnum.Soap)}
		>Soap</button
	>
	{#if UpgradesData[UpgradesKey.CatPrestige].count > 0 || DevHacks.skipUnlock}
		<button onclick={() => MainPageHandler.ChangePage(PagesEnum.Cat)}>
			Cat ₍^. .^₎⟆
		</button>
	{/if}
	<button onclick={() => MainPageHandler.ChangePage(PagesEnum.Achievements)}
		>Achievements</button
	>
	<button onclick={() => MainPageHandler.ChangePage(PagesEnum.Settings)}
		>Settings</button
	>
	<!-- 
	<button
		class="justify-end"
		onclick={() => MainPageHandler.ChangePage(PagesEnum.HowTfDoIPlay)}
		>How Do I Play</button
	>
-->
</div>

<style>
	#navbar {
		width: 100%;
		display: flex;
	}

	#navbar button {
		border: 1px solid var(--color-border);
		margin-left: 0.5rem;
	}
</style>
