import { SoapType } from "../../../Game/Soap/Soap.svelte";
import { Player } from "../../../Game/Player.svelte";
import { Decimal } from "../../../Game/Shared/BreakInfinity/Decimal.svelte";
import { ExpPolynomial } from "../../../Game/Shared/Math";
import { Multipliers } from "../../../Game/Shared/Multipliers";

export class SoapProducer implements SoapProducerProps {
  public SoapType: SoapType;
  public SpeedCount: number;
  public QualityCount: number;
  public Unlocked: boolean;
  public SpeedFormula: ExpPolynomial;
  public QualityFormula: ExpPolynomial;

  constructor(soapType: SoapType) {
    this.SoapType = $state(soapType);
    this.Unlocked = $state(true);
    this.SpeedCount = $state(0);
    this.QualityCount = $state(0);

    this.SpeedFormula = new ExpPolynomial(new Decimal(4), new Decimal(1.15));
    this.QualityFormula = new ExpPolynomial(new Decimal(2), new Decimal(1.17));
  }

  GetSpeedCost(amount: number) {
    return this.SpeedFormula.Integrate(this.SpeedCount, this.SpeedCount + amount);
  }

  GetQualityCost(amount: number) {
    return this.QualityFormula.Integrate(this.QualityCount, this.QualityCount + amount);
  }

  get Quality() {
    return Multipliers.QualityMultiplier.Get().mul(1 + (this.QualityCount * 1.0) * Math.pow(2, Math.floor(this.QualityCount / 25))).div(3);
  }

  get Speed() {
    return Multipliers.SpeedMultiplier.Get().mul(1 + (this.SpeedCount * 1.0) * Math.pow(2, Math.floor(this.SpeedCount / 25)));
  }

  AddProgress() {
    let soap = Player.Soap.get(this.SoapType);
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
}

export interface SoapProducerProps {
  SoapType: SoapType;
  Speed: Decimal;
  Quality: Decimal;
  Unlocked: boolean;
}
