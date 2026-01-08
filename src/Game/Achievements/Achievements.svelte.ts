import { SvelteMap } from "svelte/reactivity";
import { InvokeableEvent } from "../Shared/Events";

export const UnlockAchievement: InvokeableEvent<AchievementKey> = new InvokeableEvent<AchievementKey>();
export function InvokeAchievement(key: AchievementKey) { UnlockAchievement.invoke(key); }

export const AchievementsData: SvelteMap<AchievementKey, IAchievement> = new SvelteMap<AchievementKey, IAchievement>();
export enum AchievementKey {
  Businessman,
  UpgradeProducer,
  Bulk,
  BrokeLol,
  JuanZeroZero,
  UndiagnosedOCD,
  Millionaire, RankUp, Cat, UIIAI, FirstQuest, EatSoap, OrangeSoap, IShowSpeed
}
AchievementsData.set(AchievementKey.Businessman, { name: "Businessman", description: "Sell soap for the first time." })
AchievementsData.set(AchievementKey.UpgradeProducer, { name: "Upgrades!!", description: "Upgrade the producer once" })
AchievementsData.set(AchievementKey.Bulk, { name: "Broken mouse convention", description: "Unlock Bulk" })
AchievementsData.set(AchievementKey.BrokeLol, { name: "Broke Lol", description: "Sell 0 soap (totally not a bug)" })
AchievementsData.set(AchievementKey.JuanZeroZero, { name: "💯", description: "100+" })
AchievementsData.set(AchievementKey.UndiagnosedOCD, { name: "Undiagnosed OCD", description: "j3b4it3d" })
AchievementsData.set(AchievementKey.Millionaire, { name: "Millionaire", description: "That's 1 with 6 zeroes!" })
AchievementsData.set(AchievementKey.RankUp, { name: "Rank Up", description: "Rank up a producer for the first time" })
AchievementsData.set(AchievementKey.Cat, { name: "Cat", description: "Your worst nightmare" })
AchievementsData.set(AchievementKey.UIIAI, { name: "OIIAI", description: "五一一二一" })
AchievementsData.set(AchievementKey.FirstQuest, { name: "Questing!!", description: "Finish your first quest" })
AchievementsData.set(AchievementKey.EatSoap, { name: "Eat Soap", description: "Eat Soap for the first time" })
AchievementsData.set(AchievementKey.OrangeSoap, { name: "Orange Soap", description: "Unlock Orange soap" })
AchievementsData.set(AchievementKey.IShowSpeed, { name: "IShowSpeed", description: "Reach 100 speed on any producer" })

export interface IAchievement {
  name: string,
  description: string,
  unlocked?: boolean
}

// Decelerate.. I hope you enjoy stacking speed upgrades
// 25 T- seat soap desc: The wall is now over
