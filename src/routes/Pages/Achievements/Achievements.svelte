<script>
	import {
		AchievementsData,
		UnlockedAchievementCount,
	} from "../../../Game/Achievements/Achievements.svelte";
	import { OfflineProps } from "../../../Game/Game.svelte";
	import AchievementsCard from "./AchievementsCard.svelte";
</script>

<div
	class="absolute m-2 overflow-scroll h-full {OfflineProps.calculating
		? 'invisible'
		: 'visible'}"
>
	<h1>
		You current have ({UnlockedAchievementCount()} / {Object.entries(
			AchievementsData,
		).length}) achievementes unlocked
	</h1>
	<h1>
		Granting a total of {(UnlockedAchievementCount() * 0.01 + 1).toFixed(2)}x
		bonus to sell multiplier
	</h1>
	<div class="flex flex-wrap items-center content-center">
		{#each Object.entries(AchievementsData) as achievement}
			<AchievementsCard idx={parseInt(achievement[0])} />
		{/each}
	</div>
</div>
