<script lang="ts">
	import { onMount } from "svelte";
	import { type INotification } from "./Notification.svelte";
	import { fade } from "svelte/transition";
	let { data, done = $bindable() }: { data: INotification; done: () => void } =
		$props();

	onMount(() => {
		setTimeout(() => {
			done();
		}, 2500);
	});
</script>

<div
	class="border p-2 min-w-md min-h-40 overflow-y-auto opacity-100 bg-bg border-border"
	transition:fade={{ duration: 250 }}
>
	<div class="flex flex-row border-b">
		<h1 class="text-lg text-center wrap-break-word">{data?.name}</h1>
		<button
			onclick={done}
			class="max-w-6 min-h-6 p-0 m-0 ml-auto flex items-center justify-center"
			>X</button
		>
	</div>
	<h1 class="m-2 wrap-break-words text-lg text-center flex items-center h-full">
		{data?.description}
	</h1>
</div>
