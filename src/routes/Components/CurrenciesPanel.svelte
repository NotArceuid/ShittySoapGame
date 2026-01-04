<script lang="ts">
	import { CollapsibleCard } from "svelte5-collapsible";
	import { slide } from "svelte/transition";
	import { Bulk, Player } from "../../Game/Player.svelte";

	let selectedStyle = `bg-gray-200`;
	function SwitchBulk(bulk: Bulk) {
		Player.Bulk = bulk;
	}
</script>

<div class="border-l w-2/12">
	<h1 class="text-center border-b">Currencies</h1>
	<div class="m-3 w-full">
		<h1>Money: {Player.Money.format()}</h1>
		<CollapsibleCard transition={{ transition: slide }} isOpen={true}>
			{#snippet header()}
				<div class="underline w-full">Soaps</div>
			{/snippet}
			{#snippet body()}
				{#each Player.Soap as soap}
					{#if soap[1].Unlocked}
						<h1>{soap[0]}: {soap[1].Amount.format()}</h1>
					{/if}
				{/each}
			{/snippet}
		</CollapsibleCard>
	</div>
	<div class="w-full flex flex-col text-center border-t" id="bulk">
		<h1>Bulk</h1>
		<div class="flex flex-row m-2 mt-0">
			<button
				onclick={() => SwitchBulk(Bulk.One)}
				class={Player.Bulk == Bulk.One ? selectedStyle : ""}>1</button
			>
			<button
				onclick={() => SwitchBulk(Bulk.Ten)}
				class={Player.Bulk == Bulk.Ten ? selectedStyle : ""}>10</button
			>
			<button
				onclick={() => SwitchBulk(Bulk.TwoFive)}
				class={Player.Bulk == Bulk.TwoFive ? selectedStyle : ""}>25</button
			>
			<button
				onclick={() => SwitchBulk(Bulk.Juanzerozeo)}
				class={Player.Bulk == Bulk.Juanzerozeo ? selectedStyle : ""}>💯</button
			>
			<button
				onclick={() => SwitchBulk(Bulk.Max)}
				class={Player.Bulk == Bulk.Max ? selectedStyle : ""}>Max</button
			>
		</div>
	</div>
</div>

<style>
	#bulk button {
		margin-right: 0.3rem;
		width: 2.5rem;
		height: 1.5rem;
		padding: 0;
		font-size: 0.8rem;
	}
</style>
