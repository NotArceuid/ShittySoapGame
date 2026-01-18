import { SoapBase, Soaps, SoapType } from "../../../Game/Soap/Soap.svelte";
import { Player } from "../../../Game/Player.svelte";
import { Decimal } from "../../../Game/Shared/BreakInfinity/Decimal.svelte";
import { ExpPolynomial } from "../../../Game/Shared/Math";
import { SaveSystem } from "../../../Game/Saves";
import { ResetUpgrades, UpgradesData, UpgradesKey } from "../../../Game/Soap/Upgrades.svelte";
import { AchievementKey, AchievementsData, UnlockAchievement } from "../../../Game/Achievements/Achievements.svelte";
import { ChargeMilestones } from "../Foundry/Foundry.svelte.ts";

export class SoapProducer {
  public SoapType: SoapType;
  private Soap: SoapBase;
  public Unlocked: boolean = $state(true);
  public SpeedCount: number = $state(0)
  public SpeedFormula: ExpPolynomial;
  public QualityCount: number = $state(0);
  public QualityFormula: ExpPolynomial;
  public AutoDeccelerate: boolean = $state(false);
  public DecelerateCount: number = $state(0)
  public Progress: Decimal = $state(Decimal.ZERO)
  public AutoEat: boolean = $state(false);
  public AutoSellUnlocked: boolean = $state(false);

  public EatSoapUnlocked: boolean = $state(false)
  public DeccelerateUnlocked: boolean = $state(false)
  constructor(type: SoapType) {
    this.SoapType = type;
    this.Soap = Soaps[type];
    this.SpeedFormula = new ExpPolynomial(this.Soap.SpeedCostBase, new Decimal(1.15));
    this.QualityFormula = new ExpPolynomial(this.Soap.QualityCostBase, new Decimal(1.17));
  }

  GetSpeedCost(amount: number) {
    return this.SpeedFormula.Integrate(this.SpeedCount, this.SpeedCount + amount);
  }

  GetQualityCost(amount: number) {
    return this.QualityFormula.Integrate(this.QualityCount, this.QualityCount + amount);
  }

  getQualityLevelBonus() {
    switch (this.SoapType) {
      case SoapType.Red:
        return UpgradesData[UpgradesKey.RedSpeedLevelBonus].count;
      case SoapType.Orange:
        return UpgradesData[UpgradesKey.OrangeSpeedLevelBonus].count;
      default:
        return 1;
    }
  }
  getSpeedLevelBonus() {
    switch (this.SoapType) {
      case SoapType.Red:
        return UpgradesData[UpgradesKey.RedQualityLevelBonus].count;
      case SoapType.Orange:
        return UpgradesData[UpgradesKey.OrangeQualityLevelBonus].count;
      default:
        return 1;
    }
  }

  get Quality() {
    let upgCount = UpgradesData[UpgradesKey.QualityUpgrade].count;
    let amt = Decimal.ONE
      .mul((1 + this.QualityCount) * Math.pow(this.getQualityLevelBonus(), Math.floor(this.QualityCount / 25))).div(3) // Multi from upgrade
      .mul(((upgCount) + 1) * Math.pow(2, Math.floor(upgCount) / 25))
      .mul(this.DecelerateCount > 0 ? this.Soap.DeccelerateBase.mul(Decimal.pow(4, this.DecelerateCount + 1)) : 1) // mult from decel
      .mul(ChargeMilestones.get(0)!.formula().add(1))
      .div(this.Soap.QualityDivisor);

    return amt;
  }

  get Speed() {
    let upgCount = UpgradesData[UpgradesKey.SpeedUpgrade].count;
    let amt = Decimal.ONE
      .mul((1 + this.SpeedCount) * Math.pow(this.getSpeedLevelBonus(), Math.floor(this.SpeedCount / 25))) // Multi from upgrade 
      .mul(((upgCount) + 1) * Math.pow(2, Math.floor(upgCount / 25)))
      .div(this.DecelerateCount !== 0 ? this.DecelerateCount * 5 : 1) // nerfs from decel
      .mul(ChargeMilestones.get(1)!.formula().add(1))
      .div(this.Soap.SpeedDivisor)

    return amt
  }

  // Exposing soap's properties
  get EatReq() {
    return this.Soap.EatReq;
  }
  get DecelerateReq() {
    return this.Soap.DeccelReqBase.mul(this.DecelerateCount + 1).mul(new Decimal(10).pow(this.DecelerateCount));
  }
  get MaxProgress() {
    return this.Soap.MaxProgress.mul(new Decimal(1000).pow(this.DecelerateCount));
  }
  get Amount() {
    return this.Soap.Amount;
  }
  set Amount(value) {
    this.Soap.Amount = value
  }
  get ProducedAmount() {
    return this.Soap.ProducedAmount;
  }
  set ProducedAmount(value) {
    this.Soap.ProducedAmount = value;
  }
  get EatAmount() {
    return this.Soap.EatAmount;
  }
  set EatAmount(value) {
    this.Soap.EatAmount = value;
  }
  get EatMessage() {
    return this.Soap.EatMessage;
  }
  AddProgress() {
    if (AchievementsData[AchievementKey.HighSpeed].check(this.Progress, this.MaxProgress))
      UnlockAchievement(AchievementKey.HighSpeed)

    this.Progress = this.Progress.add(this.Speed);

    // Overexceeded logic here
    if (this.Progress.gte(this.MaxProgress)) {
      this.Progress = Decimal.ZERO;
      this.Soap?.SoapMade(this.Quality);

      let qualityDecimal = new Decimal(this.Quality);
      if (AchievementsData[AchievementKey.Soapy].check(qualityDecimal)) UnlockAchievement(AchievementKey.Soapy)
      if (AchievementsData[AchievementKey.Millionaire].check(qualityDecimal)) UnlockAchievement(AchievementKey.Millionaire)
    }
  }

  UpgradeQuality(amount: number) {
    let cost = this.GetQualityCost(amount);
    if (Player.Money.lte(cost)) {
      return;
    }

    Player.Money = Player.Money.sub(cost);
    this.QualityCount = this.QualityCount + amount;
    this.Quality.add(amount);
  }

  UpgradeSpeed(amount: number) {
    let cost = this.GetSpeedCost(amount);
    if (Player.Money.lte(cost)) {
      return;
    }

    Player.Money = Player.Money.sub(cost);
    this.SpeedCount = this.SpeedCount + amount;
    this.Speed.add(amount);
  }

  Decelerate() {
    if (this.Speed.lt(this.DecelerateReq))
      return;

    this.DecelerateCount++;
  }

  Eat() {
    if (this.Soap.ProducedAmount.lt(this.EatReq) || !this.EatSoapUnlocked)
      return;

    this.EatAmount = this.EatAmount.add(this.ProducedAmount);

    this.QualityCount = 0;
    this.SpeedCount = 0;
    this.DecelerateCount = 0;

    Player.Money = Decimal.ZERO;

    Soaps[0].Amount = Decimal.ZERO;
    Soaps[0].ProducedAmount = Decimal.ZERO;
    Soaps[1].Amount = Decimal.ZERO;
    Soaps[1].ProducedAmount = Decimal.ZERO;

    ResetUpgrades();
  }
}

export interface SoapProducerSave {
  speed_count: number;
  quality_count: number;
  unlocked: boolean;
  decelerate_count: number;
  lifetime_produced: Decimal;
  type: SoapType;
}

export const SoapProducers: Record<SoapType, SoapProducer> = {
  [SoapType.Red]: new SoapProducer(SoapType.Red),
  [SoapType.Orange]: new SoapProducer(SoapType.Orange),
  [SoapType.Yellow]: new SoapProducer(SoapType.Yellow),
  [SoapType.Green]: new SoapProducer(SoapType.Green),
  [SoapType.Blue]: new SoapProducer(SoapType.Blue),
  [SoapType.Indigo]: new SoapProducer(SoapType.Indigo),
  [SoapType.Violet]: new SoapProducer(SoapType.Violet),
  [SoapType.White]: new SoapProducer(SoapType.White),
  [SoapType.Black]: new SoapProducer(SoapType.Black),
  [SoapType.Rainbow]: new SoapProducer(SoapType.Rainbow)
};

let saveKey = "soap_producers";
SaveSystem.SaveCallback<SoapProducerSave[]>(saveKey, () => {
  const producers: SoapProducerSave[] = [];
  Object.values(SoapProducers).forEach((value, idx) => {
    producers.push({
      speed_count: value.SpeedCount,
      quality_count: value.QualityCount,
      unlocked: value.Unlocked,
      decelerate_count: value.DecelerateCount,
      lifetime_produced: value.ProducedAmount,
      type: idx,
    })
  })

  return producers;
});

SaveSystem.LoadCallback<SoapProducerSave[]>(saveKey, (data) => {
  data.forEach((value, index) => {
    let key = Object.keys(SoapProducers)[index] as unknown as keyof typeof SoapProducers
    SoapProducers[key].SoapType = index;
    SoapProducers[key].SpeedCount = value.speed_count;
    SoapProducers[key].QualityCount = value.quality_count;
    SoapProducers[key].Unlocked = value.unlocked;
    SoapProducers[key].DecelerateCount = value.decelerate_count;
    SoapProducers[key].ProducedAmount = new Decimal(value.lifetime_produced);
  })
});
