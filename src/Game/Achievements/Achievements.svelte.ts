import type { Decimal } from "../Shared/BreakInfinity/Decimal.svelte";
import { NotificationPopUp, type INotification } from "../../routes/Components/Notification.svelte";
import { log } from "console";
import { SaveSystem } from "../Saves";

let savekey = "achievements";
SaveSystem.SaveCallback<boolean[]>(savekey, () => {
  let arr: boolean[] = []
  Object.values(AchievementsData).forEach((e) => {
    arr.push(e.unlocked ?? false);
  })
  return arr;
})

SaveSystem.LoadCallback<boolean[]>(savekey, (data) => {
  let arr = Object.values(AchievementsData);
  for (let i = 0; i < arr.length; i++) {
    arr[i].unlocked = data[i];
  }
})

export function UnlockAchievement(key: AchievementKey) {
  if (AchievementsData[key].unlocked)
    return;

  AchievementsData[key].unlocked = true;
  NotificationPopUp.invoke(AchievementsData[key]);
}

export enum AchievementKey {
  Soapy,
  Businessman,
  Quality,
  Speedy,
  Nice,
  Upgrades,
  Automation,
  Overcap,
  OCD,
  Millionaire,
  SixNineNineNine,
  Deccelerate,
  HighSpeed,
  Accelerate,
  Deccelerate2,
  BulkedUp,
  EatSoap,
  Deccelerate3,
  Deccelerate4,
  Foundry,
  Bulk,
  Charge,
  Cheapskate,
  OrangeSoap,
  OrangeDeccel1,
  ILY,
  Maxxed,
  Cat
}

export const AchievementsData: Record<AchievementKey, IAchievement> = $state({
  [AchievementKey.Soapy]: {
    name: "Soapy",
    description: "Produce your first soap",
    unlocked: false,
    check: (...props) => props[0].gt(0) && !AchievementsData[AchievementKey.Soapy].unlocked!,
  },
  [AchievementKey.Businessman]: {
    name: "Businessman",
    description: "Sell your first soap",
    check: (...props) => props[0].gt(1)
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
  [AchievementKey.Nice]: {
    name: "Nice",
    description: "6/9 in the big 26",
    check: (...props) => props[0].eq(6) && props[1].eq(9),
  },
  [AchievementKey.Upgrades]: {
    name: "ooo, shinyyy",
    description: "Unlock upgrades",
    check: (_) => false
  },

  [AchievementKey.Automation]: {
    name: "Autoselling",
    description: "The factory must grow!!",
    check: (...props) => props[0].gt(1)
  },
  [AchievementKey.Overcap]: {
    name: "Catch me if you can",
    description: "Overcap your speed for the first time",
    check: (...props) => props[0].gt(props[1])
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

  [AchievementKey.SixNineNineNine]: {
    name: "6/99",
    description: "Cost: 69, level: 9/99",
    check: (...props) => props[0].eq(9)
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
    check: (_) => false
  },

  [AchievementKey.Deccelerate2]: {
    name: "Deccelerate 2",
    description: "You've passed deccelerate 2, now be prepare for the wall",
    check: (...props) => props[0].gt(1)
  },
  [AchievementKey.BulkedUp]: {
    name: "Bulked Up",
    description: "Max out the first bulk upgrade",
    check: (...props) => props[0].eq(9)
  },

  [AchievementKey.EatSoap]: {
    name: "Eat Red Soap",
    description: "Fyi: there is a wall here [[][][]]",
    check: (...props) => props[0].gt(0)
  },

  [AchievementKey.Deccelerate3]: {
    name: "Deccelerate 3",
    description: "You'd love the quality autoseller i gave yall after this",
    check: (...props) => props[0].gt(2)
  },
  [AchievementKey.Deccelerate4]: {
    name: "Deccelerate 4",
    description: "Phew.. pass the wall. it sure took a while right.. right??",
    check: (...props) => props[0].gt(3)
  },

  [AchievementKey.OrangeSoap]: {
    name: "Orange ca- i mean soap",
    description: "You did it!!! You passed the wall!!",
    check: (...props) => props[0].gt(0)
  },
  [AchievementKey.OrangeDeccel1]: {
    name: "One orange deccel",
    description: "This is where it get fastttttttttttt",
    check: (...props) => props[0].gt(0)
  },
  [AchievementKey.Foundry]: {
    name: "Foundry",
    description: "I hope they don't sue me",
    check: (...props) => props[0].gt(0)
  },
  [AchievementKey.Bulk]: {
    name: "Bulked upp",
    description: "get 25 max bulk buy",
    check: (...props) => props[0].gt(14)
  },
  [AchievementKey.Charge]: {
    name: "Unlock Charge",
    description: "Totally not stolen from a certain grass game",
    check: (...props) => props[0].gt(0)
  },

  [AchievementKey.Cheapskate]: {
    name: "Cheapskate",
    description: "Your red soap upgrades doesnt deduct your money now :)",
    check: (...props) => props[0].gt(0) && props[1].gt(0)
  },

  [AchievementKey.ILY]: {
    name: "ILY",
    description: "Get 520 Quality",
    check: (...props) => props[0].gt(520)
  },

  [AchievementKey.Maxxed]: {
    name: "Maxxed",
    description: "Max out the speed and quality upgrades.",
    check: (...props) => props[0].gte(600) && props[1].gte(600)
  },
  [AchievementKey.Cat]: {
    name: "1.0.0's final achievement",
    description: "It's time to meet the cat overlords",
    check: (...props) => props[0].gt(0)
  }
});

export interface IAchievement extends INotification {
  name: string,
  description: string,
  check: (...props: Decimal[]) => boolean;
  unlocked?: boolean
}

export function UnlockedAchievementCount(): number {
  return Object.values(AchievementsData)
    .filter(data => data.unlocked)
    .length;
}
