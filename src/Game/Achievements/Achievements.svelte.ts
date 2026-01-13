import { InvokeableEvent } from "../Shared/Events";
import type { Decimal } from "../Shared/BreakInfinity/Decimal.svelte";

export const UnlockAchievementEvent: InvokeableEvent<AchievementKey> = new InvokeableEvent<AchievementKey>();
export function UnlockAchievement(key: AchievementKey) {
  AchievementsData[key].unlocked = true;
  UnlockAchievementEvent.invoke(key);
}

export enum AchievementKey {
  Soapy, Quality, Speedy, Businessman,
  Automation, OCD, Millionaire, Deccelerate,
  HighSpeed, Accelerate, Deccelerate2, EatSoap,
  Deccelerate3, Deccelerate4, Foundry, Charge,
  Ticket, OrangeSoap, OrangeDeccel1, Cat
}

export const AchievementsData: Record<AchievementKey, IAchievement> = $state({
  [AchievementKey.Soapy]: {
    name: "Soapy",
    description: "Produce your first soap",
    unlocked: false,
    check: (...props) => props[0].gt(0) && !AchievementsData[AchievementKey.Soapy].unlocked!,
  },
  [AchievementKey.Quality]: {
    name: "Quality",
    description: "Upgrade producer quality once",
    check: (...props) => props[0].gt(1),
  },
  [AchievementKey.Speedy]: {
    name: "Speeeed",
    description: "Upgrade producer speed once ",
    check: (...props) => props[0].gt(1),
  },
  [AchievementKey.Businessman]: {
    name: "Businessman",
    description: "Sell your first soap",
    check: (...props) => props[0].gt(1)
  },
  [AchievementKey.Automation]: {
    name: "Autoselling",
    description: "The factory must grow!!",
    check: (...props) => props[0].gt(1)
  },
  [AchievementKey.OCD]: {
    name: "5 squares",
    description: "Get more than 25 quality and speed upgrades",
    check: (...props) => props[0].gte(25) && props[1].gte(25)
  },
  [AchievementKey.Millionaire]: {
    name: "Millionaire",
    description: "Get more than 1 million money",
    check: (...props) => props[0].gt(1000000),
  },
  [AchievementKey.Deccelerate]: {
    name: "Quality over quantity",
    description: "Deccelerate once, i hope you like stacking speed upgrades from now on hehe..",
    check: (...props) => props[0].gt(0),
  },
  [AchievementKey.HighSpeed]: {
    name: "High Speed",
    description: "Overcap your speed while deccelerating",
    check: (...props) => props[0].gt(props[1]) && !AchievementsData[AchievementKey.HighSpeed].unlocked
  },
  [AchievementKey.Accelerate]: {
    name: "Whoaaaa.. slow down man",
    description: "Accelerate once",
    check: (...props) => props[0].gt(1)
  },
  [AchievementKey.Deccelerate2]: {
    name: "Deccelerate 2",
    description: "You've passed deccelerate 2, now be prepare for the wall",
    check: (...props) => props[0].gt(1)
  },
  [AchievementKey.EatSoap]: {
    name: "Eat Soap",
    description: "Fyi: there is a wall here [[][][]]",
    check: (...props) => props[0].gt(0)
  },
  [AchievementKey.Deccelerate3]: {
    name: "Deccelerate 3",
    description: "You'd love the quality autoseller i gave yall after this",
    check: (...props) => props[0].gt(0)
  },
  [AchievementKey.Deccelerate4]: {
    name: "Deccelerate 4",
    description: "Phew.. pass the wall. it sure took a while right.. right??",
    check: (...props) => props[0].gt(0)
  },
  [AchievementKey.Foundry]: {
    name: "Foundry",
    description: "You did it!!! You passed the wall!!",
    check: (...props) => props[0].gt(0)
  },
  [AchievementKey.Charge]: {
    name: "Unlock Charge",
    description: "Totally not stolen from a certain grass game",
    check: (...props) => props[0].gt(0)
  },
  [AchievementKey.Ticket]: {
    name: "Awesome time sink",
    description: "Make your first ticket",
    check: (...props) => props[0].gt(0)
  },
  [AchievementKey.OrangeSoap]: {
    name: "Orange ca- i mean soap",
    description: "Unlock orange soap Meowmeowowemowe",
    check: (...props) => props[0].gt(0)
  },
  [AchievementKey.OrangeDeccel1]: {
    name: "One orange deccel",
    description: "Deccelerate orange soap once ",
    check: (...props) => props[0].gt(0)
  },
  [AchievementKey.Cat]: {
    name: "1.0.0's final achievement",
    description: "It's time to meet the cat overlords",
    check: (...props) => props[0].gt(0)
  }
});

export interface IAchievement {
  name: string,
  description: string,
  check: (...props: Decimal[]) => boolean;
  unlocked?: boolean
}
