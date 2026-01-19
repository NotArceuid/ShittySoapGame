<script lang="ts">
	import { GeneratorsData } from "../../../Game/Foundry/Generator.svelte";
	import ActionButton from "../../Components/ActionButton.svelte";
	import UpgradesInfo from "../../Components/UpgradesInfo.svelte";
	import type { IUpgradesInfo } from "../../Components/UpgradesInfo.svelte.ts";
	import Milestones from "./Milestones.svelte";

	let currUpgrade: IUpgradesInfo | undefined = $state(undefined);
</script>

<div class="h-full absolute w-full flex flex-row p-2 overflow-y-scroll">
	<div class="w-full mr-4 flex flex-col">
		<div class=" border mb-2">
			<h1 class="font-bold border-b p-2">Generator</h1>
			<div class="p-3 space-x-2">
				{#each Object.values(GeneratorsData) as generator}
					{#if generator.unlocked}
						<ActionButton
							disabled={!generator.Requirements}
							onclick={() => {
								if (currUpgrade) currUpgrade = undefined;
								else currUpgrade = generator;
							}}
						>
							{#snippet content()}
								<span>{generator.name}</span>
							{/snippet}
						</ActionButton>
					{/if}
				{/each}
			</div>
		</div>

		{#if currUpgrade !== undefined}
			<div
				class="h-42 border mt-auto flex flex-col justify-center items-center m-2"
			>
				<UpgradesInfo upgrade={currUpgrade} />
			</div>
		{/if}
	</div>

	<div class="ml-auto border max-w-2/12 sm:min-w-4/12 sm:max-w-4/12">
		<Milestones />
	</div>
</div>
