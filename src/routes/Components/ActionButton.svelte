<script lang="ts">
	import type { Snippet } from "svelte";

	let {
		disabled,
		onclick,
		content,
		customStyle,
		buttonClass,
	}: {
		disabled: boolean;
		onclick: () => void;
		content: Snippet;
		customStyle?: string;
		buttonClass?: string;
	} = $props();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<button
	{onclick}
	class={`${buttonClass} border hover:bg-inactive ${disabled ? "bg-inactive/10" : "bg-active/10"}`}
	style={`${customStyle}`}
>
	{@render content()}
</button>
