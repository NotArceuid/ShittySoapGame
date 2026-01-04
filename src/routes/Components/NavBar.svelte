<script lang="ts">
	import { MainPageHandler, Pages } from "../page.svelte";
</script>

<div id="navbar">
	<button onclick={() => MainPageHandler.ChangePage(Pages.Soap)}>Soap</button>
	<button onclick={() => MainPageHandler.ChangePage(Pages.Cat)}
		>Cat ₍^. .^₎⟆</button
	>
	<button onclick={() => MainPageHandler.ChangePage(Pages.Achievements)}
		>Achievements</button
	>
	<button onclick={() => MainPageHandler.ChangePage(Pages.Settings)}
		>Settings</button
	>
	<button
		class="justify-end"
		onclick={() => MainPageHandler.ChangePage(Pages.HowTfDoIPlay)}
		>How Do I Play</button
	>
</div>

<style>
	#navbar {
		padding-bottom: 0.75rem;
		margin-bottom: 0.75rem;
		width: 100%;
		display: flex;
		border-bottom: 1px solid #000;
	}

	#navbar button {
		margin-left: 0.5rem;
	}
</style>
