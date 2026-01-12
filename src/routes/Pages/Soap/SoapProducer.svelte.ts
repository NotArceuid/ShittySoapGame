import { Soaps, SoapType } from "../../../Game/Soap/Soap.svelte";
import { Player } from "../../../Game/Player.svelte";
import { Decimal } from "../../../Game/Shared/BreakInfinity/Decimal.svelte";
import { ExpPolynomial } from "../../../Game/Shared/Math";
import { Multipliers } from "../../../Game/Shared/Multipliers";
import { SaveSystem } from "../../../Game/Saves";
import { ResetUpgrades, UpgradesData, UpgradesKey } from "../../../Game/Soap/Upgrades.svelte";
import { AchievementKey, AchievementsData } from "../../../Game/Achievements/Achievements.svelte";
import { ChargeMilestones } from "../Foundry/Foundry.svelte.ts";
import { log } from "console";

export class SoapProducer {
  public SoapType: SoapType;
  public Unlocked: boolean = $state(false);

  public SpeedCount: number = $state(0)
  public SpeedFormula: ExpPolynomial = new ExpPolynomial(new Decimal(7.29), new Decimal(1.15));

  public QualityCount: number = $state(0);
  public QualityFormula: ExpPolynomial = new ExpPolynomial(new Decimal(4.5), new Decimal(1.17));

  public AutoDeccelerate: boolean = $state(false);
  public DecelerateCount: number = $state(0)

  public Progress: Decimal = $state(Decimal.ZERO)

  public AutoEat: boolean = $state(false);
  public AutoSellUnlocked: boolean = $state(false);

  public EatSoapUnlocked: boolean = $state(false)

  constructor(soapType: SoapType) {
    this.SoapType = $state(soapType);

    let saveKey = this.SoapType.toString();
    SaveSystem.SaveCallback<SoapProducerSave>(saveKey, () => {
      return {
        speedcnt: this.SpeedCount,
        qualitycnt: this.QualityCount,
        unlocked: this.Unlocked,
        decelerate: this.DecelerateCount,
        eatamt: this.EatAmount,
        producedamt: this.ProducedAmount,
        type: this.SoapType,
      }
    });
    SaveSystem.LoadCallback<SoapProducerSave>(saveKey, (data) => {
      this.SoapType = data.type;

      this.SpeedCount = data.speedcnt;
      this.QualityCount = data.qualitycnt;
      this.Unlocked = data.unlocked;
      this.DecelerateCount = data.decelerate;
      this.EatAmount = new Decimal(data.eatamt);
      this.ProducedAmount = new Decimal(data.producedamt);
    });
  }

  GetSpeedCost(amount: number) {
    return this.SpeedFormula.Integrate(this.SpeedCount, this.SpeedCount + amount);
  }

  GetQualityCost(amount: number) {
    return this.QualityFormula.Integrate(this.QualityCount, this.QualityCount + amount);
  }

  get Quality() {
    let upgCount = UpgradesData[UpgradesKey.QualityUpgrade].count;
    let amt = Multipliers.QualityMultiplier.Get()
      .mul(1 + this.QualityCount).div(3) // Multi from upgrade
      .mul(((upgCount) + 1) * Math.pow(2, Math.floor(upgCount) / 25))
      .mul(this.DecelerateCount > 0 ? new Decimal(2500).mul(Decimal.pow(5, this.DecelerateCount + 1)) : 1) // mult from decel
      .mul(ChargeMilestones.get(0)!.formula().add(1))

    return amt;
  }

  get Speed() {
    let upgCount = UpgradesData[UpgradesKey.SpeedUpgrade].count;
    let amt = Multipliers.SpeedMultiplier.Get()
      .mul(1 + (this.SpeedCount)) // Multi from upgrade 
      .mul(((upgCount) + 1) * Math.pow(2, Math.floor(upgCount / 25)))
      .div(this.DecelerateCount !== 0 ? this.DecelerateCount * 5 : 1) // nerfs from decel
      .mul(ChargeMilestones.get(1)!.formula().add(1))

    return amt
  }

  // Exposing soap's properties
  get EatReq() {
    return this.Soap.EatReq;
  }
  get DecelerateReq() {
    return new Decimal(1000).mul(this.DecelerateCount + 1).mul(new Decimal(10).pow(this.DecelerateCount));
  }
  get MaxProgress() {
    return this.Soap.MaxProgress.mul(new Decimal(100).pow(this.DecelerateCount));
  }
  private get Soap() {
    return Soaps[this.SoapType]!
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
    if (AchievementsData[AchievementKey.HighSpeed].check(this.Progress, this.MaxProgress)) AchievementsData[AchievementKey.HighSpeed].unlocked = true;
    this.Progress = this.Progress.add(this.Speed);

    // Overexceeded logic here
    if (this.Progress.gte(this.MaxProgress)) {
      this.Progress = Decimal.ZERO;
      this.Soap?.SoapMade(this.Quality);

      let qualityDecimal = new Decimal(this.Quality);
      if (AchievementsData[AchievementKey.Soapy].check(qualityDecimal)) AchievementsData[AchievementKey.Soapy].unlocked = true;
      if (AchievementsData[AchievementKey.Millionaire].check(qualityDecimal)) AchievementsData[AchievementKey.Millionaire].unlocked = true;
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
    if (this.Soap.ProducedAmount.lt(this.EatReq) || UpgradesData[UpgradesKey.EatRedSoapUpgrade].count! < 0)
      return;

    this.EatAmount = this.EatAmount.add(this.ProducedAmount);

    this.QualityCount = 0;
    this.SpeedCount = 0;
    this.DecelerateCount = 0;

    this.Amount = Decimal.ZERO;
    Player.Money = Decimal.ZERO;
    this.ProducedAmount = Decimal.ZERO;

    ResetUpgrades();
  }
}

export interface SoapProducerSave {
  speedcnt: number;
  qualitycnt: number;
  unlocked: boolean;
  decelerate: number;
  eatamt: Decimal;
  producedamt: Decimal;
  type: SoapType;
}

export const SoapProducers: Record<SoapType, SoapProducer> = $state({
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
})

export interface AutosellProps {
  Bonus: Decimal;
  CostReduction: Decimal;
  Cap: Decimal;
}
