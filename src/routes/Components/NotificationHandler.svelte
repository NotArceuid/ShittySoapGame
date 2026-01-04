<script lang="ts">
	import {
		AchievementsData,
		UnlockAchievement,
		type IAchievement,
	} from "../../Game/Achievements/Achievements.svelte.ts";

	let data = $state<IAchievement>();
	let visible = $state(false);
	UnlockAchievement.add((key) => {
		data = AchievementsData.get(key);
		visible = true;
		setTimeout(() => {
			visible = !visible;
		}, 5000);
	});
</script>

<div
	class="border p-2 min-w-74 min-h-32 max-w-84 bg-white dark:bg-gray-500 overflow-y-auto
           transition-all duration-300 ease-in-out
           {visible
		? 'opacity-100 translate-y-0'
		: 'opacity-0 translate-y-4 invisible'}"
>
	<div class="flex flex-row border-b">
		<h1 class="text-center wrap-break-word">{data?.name}</h1>
		<button
			class="max-w-6 min-h-6 p-0 m-0 ml-auto flex items-center justify-center"
			>X</button
		>
	</div>
	<h1 class="m-2 wrap-break-words">{data?.description}</h1>
</div>
