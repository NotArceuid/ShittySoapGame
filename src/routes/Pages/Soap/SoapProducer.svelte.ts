import { Soaps, type SoapType } from "../../../Game/Soap/Soap.svelte";
import { Player } from "../../../Game/Player.svelte";
import { Decimal } from "../../../Game/Shared/BreakInfinity/Decimal.svelte";
import { ExpPolynomial } from "../../../Game/Shared/Math";
import { Multipliers } from "../../../Game/Shared/Multipliers";
import { SaveSystem, type ISaveable } from "../../../Game/Saves";
import { UpgradesData, UpgradesKey } from "../../../Game/Soap/Upgrades.svelte";

export class SoapProducer implements SoapProducerProps, ISaveable {
  public SoapType: SoapType;
  public SpeedCount: number;
  public QualityCount: number;
  public Tier: number;
  public Unlocked: boolean;
  public SpeedFormula: ExpPolynomial;
  public QualityFormula: ExpPolynomial;

  constructor(soapType: SoapType) {
    this.SoapType = $state(soapType);
    this.saveKey = $state(this.SoapType);
    this.Unlocked = $state(true);
    this.Tier = $state(0);
    this.SpeedCount = $state(0);
    this.QualityCount = $state(0);

    this.SpeedFormula = new ExpPolynomial(new Decimal(7.29), new Decimal(1.15));
    this.QualityFormula = new ExpPolynomial(new Decimal(4.5), new Decimal(1.17));

    SaveSystem.SaveCallback<SoapProducerProps>(this.saveKey, () => this.getSaveData());
    SaveSystem.LoadCallback<SoapProducerProps>(this.saveKey, (data) => this.loadSaveData(data));
  }

  saveKey: string;
  getSaveData(): any {
    return {
      SpeedCount: this.SpeedCount,
      QualityCount: this.QualityCount,
      Unlocked: this.Unlocked,
      Tier: this.Tier,
    }
  }

  loadSaveData(data: SoapProducerProps): void {
    this.SpeedCount = data.SpeedCount;
    this.QualityCount = data.QualityCount;
    this.Unlocked = data.Unlocked;
    this.Tier = data.Tier;
  }

  GetSpeedCost(amount: number) {
    return this.SpeedFormula.Integrate(this.SpeedCount, this.SpeedCount + amount);
  }

  GetQualityCost(amount: number) {
    return this.QualityFormula.Integrate(this.QualityCount, this.QualityCount + amount);
  }

  get Quality() {
    let amt = Multipliers.QualityMultiplier.Get()
      .mul(1 + (this.QualityCount * 1.0) * Math.pow(2, Math.floor(this.QualityCount / 25))).div(3) // Multi from upgrade
      .mul(UpgradesData.get(UpgradesKey.QualityUpgrade)!.count + 1)
      .mul(this.Tier !== 0 ? this.Tier * 7.5 : 1) // Multi from tier
    return amt;
  }

  get Speed() {
    let amt = Multipliers.SpeedMultiplier.Get()
      .mul(1 + (this.SpeedCount * 1.0) * Math.pow(2, Math.floor(this.SpeedCount / 25))) // Multi from upgrade 
      .mul(UpgradesData.get(UpgradesKey.SpeedUpgrade)!.count + 1)
      .div(this.Tier !== 0 ? this.Tier * 5 : 1) // Multi from tier 

    return amt
  }

  get RankUpReq() {
    return new Decimal(1_000_000).mul(new Decimal(10).pow(this.Tier));
  }

  get Soap() {
    return Soaps.get(this.SoapType)!
  }

  AddProgress() {
    let soap = this.Soap;
    if (!soap) return;

    soap.Progress = soap.Progress.add(this.Speed);

    // Overexceeded logic here
    if (soap.Progress.gte(soap.MaxProgress)) {
      soap.Progress = Decimal.ZERO;
      soap.SoapMade(this.Quality);
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

  TierUp() {
    let soap = this.Soap;
    if (!soap || soap.ProducedAmount.lt(this.RankUpReq))
      return;

    this.Tier++;
  }
}

export interface SoapProducerProps {
  SoapType: SoapType;
  SpeedCount: number;
  QualityCount: number;
  Tier: number;
  Unlocked: boolean;
}
