<script lang="ts">
	import { slide } from "svelte/transition";
	import { CollapsibleCard } from "svelte5-collapsible";
	import { SaveSystem } from "../../Game/Saves";
	import { _ } from "svelte-i18n";
	import { Player } from "../../Game/Player.svelte";
	import { NotificationPopUp } from "../Components/Notification.svelte";

	let { save, idx } = $props();
	let isOpen = $state(false);
	function slidedown() {
		isOpen = !isOpen;
	}

	let text = $state("");
	function LoadSuccess() {
		NotificationPopUp.invoke({ name: "Saves", description: "Load Success!" });
	}

	function LoadFailed() {
		NotificationPopUp.invoke({ name: "Saves", description: "Load Failed!" });
	}

	async function load() {
		try {
			if (text) {
				await SaveSystem.importFromString(text);
				LoadSuccess();
			}
		} catch {
			LoadFailed();
		}
	}

	function loadFromFile(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = async (e) => {
			try {
				const content = e.target?.result as string;
				if (content) {
					const success = await SaveSystem.importFromString(content);
					LoadSuccess();
				}
			} catch {
				LoadFailed();
			}
		};
		reader.readAsText(file);
		input.value = "";
	}

	async function saveToLStorage() {
		let save = await SaveSystem.exportToString();
		localStorage.setItem(idx, save);
	}
</script>

<div class="border p-2 pb-0 w-full border-border">
	<h1 class="text-left pb-2">{Player.Name}</h1>
	<div class="flex flex-wrap flex-row gap-2 mb-2">
		{#if save}
			<button onclick={saveToLStorage} class="flex-1 border">Save</button>
		{/if}
		<button class="flex-1 border" onclick={slidedown}>Load</button>
	</div>
	<CollapsibleCard transition={{ transition: slide }} {isOpen}>
		{#snippet header()}
			<div class="h-2"></div>
		{/snippet}
		{#snippet body()}
			<div class="space-y-2">
				<div class="flex items-center gap-2">
					<input
						type="text"
						bind:value={text}
						class="border h-8 grow px-2"
						placeholder="Paste your save here"
					/>
					<button class="h-8 px-4 whitespace-nowrap" onclick={load}
						>Load
					</button>
				</div>
				<div class="flex items-center">
					<input
						type="file"
						class="w-full h-8 border px-2"
						onchange={loadFromFile}
						accept=".txt,.json,.save"
					/>
				</div>
			</div>
		{/snippet}
	</CollapsibleCard>
</div>
