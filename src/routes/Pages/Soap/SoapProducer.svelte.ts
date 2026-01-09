import { Soaps, type SoapType } from "../../../Game/Soap/Soap.svelte";
import { Player } from "../../../Game/Player.svelte";
import { Decimal } from "../../../Game/Shared/BreakInfinity/Decimal.svelte";
import { ExpPolynomial } from "../../../Game/Shared/Math";
import { Multipliers } from "../../../Game/Shared/Multipliers";
import { SaveSystem } from "../../../Game/Saves";
import { ResetUpgrades, UpgradesData, UpgradesKey } from "../../../Game/Soap/Upgrades.svelte";
import { log } from "console";

export class SoapProducer {
  public SoapType: SoapType;
  public SpeedCount: number;
  public QualityCount: number;
  public Unlocked: boolean;
  public DecelerateCount: number;
  public SpeedFormula: ExpPolynomial;
  public QualityFormula: ExpPolynomial;
  public Progress: Decimal;

  constructor(soapType: SoapType) {
    this.SoapType = $state(soapType);
    this.Unlocked = $state(true);
    this.DecelerateCount = $state(0)
    this.SpeedCount = $state(0);
    this.QualityCount = $state(0);
    this.Progress = $state(Decimal.ZERO);

    this.SpeedFormula = new ExpPolynomial(new Decimal(7.29), new Decimal(1.15));
    this.QualityFormula = new ExpPolynomial(new Decimal(4.5), new Decimal(1.17));

    let saveKey = this.SoapType.toLowerCase();
    SaveSystem.SaveCallback<SoapProducerSave>(saveKey, () => {
      return {
        speedcnt: this.SpeedCount,
        qualitycnt: this.QualityCount,
        unlocked: this.Unlocked,
        decelerate: this.DecelerateCount,
        eatamt: this.EatAmount,
      }
    });
    SaveSystem.LoadCallback<SoapProducerSave>(saveKey, (data) => {
      this.SpeedCount = data.speedcnt;
      this.QualityCount = data.qualitycnt;
      this.Unlocked = data.unlocked;
      this.DecelerateCount = data.decelerate;
      this.EatAmount = new Decimal(data.eatamt);
    });
  }

  GetSpeedCost(amount: number) {
    return this.SpeedFormula.Integrate(this.SpeedCount, this.SpeedCount + amount);
  }

  GetQualityCost(amount: number) {
    return this.QualityFormula.Integrate(this.QualityCount, this.QualityCount + amount);
  }

  get Quality() {
    let upgCount = UpgradesData.get(UpgradesKey.QualityUpgrade)!.count;
    let amt = Multipliers.QualityMultiplier.Get()
      .mul(1 + this.QualityCount).div(3) // Multi from upgrade
      .mul(((upgCount) + 1) * Math.pow(2, Math.floor(upgCount) / 25))
      .pow(this.DecelerateCount !== 0 ? 1 + this.DecelerateCount / 2.25 : 1) // mult from decel
    return amt;
  }

  get Speed() {
    let upgCount = UpgradesData.get(UpgradesKey.SpeedUpgrade)!.count;
    let amt = Multipliers.SpeedMultiplier.Get()
      .mul(1 + (this.SpeedCount)) // Multi from upgrade 
      .mul(((upgCount) + 1) * Math.pow(2, Math.floor(upgCount / 25)))
      .div(this.DecelerateCount !== 0 ? this.DecelerateCount * 5 : 1) // nerfs from decel

    return amt
  }

  get EatReq() {
    return this.Soap.EatReq;
  }

  get DecelerateReq() {
    return new Decimal(1000).mul(new Decimal(10).pow(this.DecelerateCount));
  }

  get MaxProgress() {
    return this.Soap.MaxProgress.mul(new Decimal(15).pow(this.DecelerateCount));
  }

  private get Soap() {
    return Soaps.get(this.SoapType)!
  }

  get Amount() {
    return this.Soap.Amount;
  }

  get ProducedAmount() {
    return this.Soap.ProducedAmount;
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
    this.Progress = this.Progress.add(this.Speed);

    // Overexceeded logic here
    if (this.Progress.gte(this.MaxProgress)) {
      this.Progress = Decimal.ZERO;
      this.Soap?.SoapMade(this.Quality);
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
    let soap = this.Soap;
    if (!soap || soap.ProducedAmount.lt(this.EatReq))
      return;
    this.EatAmount = this.EatAmount.add(this.Amount);

    this.QualityCount = 0;
    this.SpeedCount = 0;
    this.DecelerateCount = 0;

    ResetUpgrades();
  }
}

export interface SoapProducerSave {
  speedcnt: number;
  qualitycnt: number;
  unlocked: boolean;
  decelerate: number;
  eatamt: Decimal;
}
