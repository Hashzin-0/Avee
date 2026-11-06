export interface FarmInput {
  houseLengthM: number;
  houseWidthM: number;
  sideHeightM: number;
  ridgeHeightM: number;
  targetBirds: number;
  usableAreaPercent: number;
  areaPerBirdCm2?: number;
  birdsPerNipple?: number;
  feederCmPerBird?: number;
  fanCapacityM3h?: number;
  airflowM3hPerBird?: number;
  cageCapacity?: number;
}

export interface CalculationResult {
  grossAreaM2: number;
  usableAreaM2: number;
  areaBasedCapacity: number | null;
  areaCapacityStatus: 'calculated' | 'missing-parameter';
  nipplesRequired: number | null;
  feederLengthM: number | null;
  fansRequired: number | null;
  cagesRequired: number | null;
  assumptions: string[];
}

function assertPositive(name: string, value: number | undefined) {
  if (value === undefined) return;
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} deve ser um número finito maior que zero.`);
  }
}

function validateFarmInput(input: FarmInput) {
  assertPositive('Comprimento', input.houseLengthM);
  assertPositive('Largura', input.houseWidthM);
  assertPositive('Altura lateral', input.sideHeightM);
  assertPositive('Altura da cumeeira', input.ridgeHeightM);
  assertPositive('Quantidade de aves', input.targetBirds);
  if (!Number.isInteger(input.targetBirds)) throw new RangeError('Quantidade de aves deve ser inteira.');
  if (!Number.isFinite(input.usableAreaPercent) || input.usableAreaPercent < 1 || input.usableAreaPercent > 100) {
    throw new RangeError('Área útil deve estar entre 1% e 100%.');
  }
  if (input.ridgeHeightM < input.sideHeightM) throw new RangeError('A cumeeira não pode ser mais baixa que a altura lateral.');
  assertPositive('Área por ave', input.areaPerBirdCm2);
  assertPositive('Aves por nipple', input.birdsPerNipple);
  assertPositive('Comedouro linear por ave', input.feederCmPerBird);
  assertPositive('Vazão do ventilador', input.fanCapacityM3h);
  assertPositive('Necessidade de ar por ave', input.airflowM3hPerBird);
  assertPositive('Capacidade por gaiola', input.cageCapacity);
}

const ceilPositive = (value: number): number => Math.ceil(value);

export function calculateFarm(input: FarmInput): CalculationResult {
  validateFarmInput(input);
  const grossAreaM2 = input.houseLengthM * input.houseWidthM;
  const usableAreaM2 = grossAreaM2 * (input.usableAreaPercent / 100);
  const areaBasedCapacity = input.areaPerBirdCm2
    ? Math.floor((usableAreaM2 * 10_000) / input.areaPerBirdCm2)
    : null;
  const nipplesRequired = input.birdsPerNipple
    ? ceilPositive(input.targetBirds / input.birdsPerNipple)
    : null;
  const feederLengthM = input.feederCmPerBird
    ? (input.targetBirds * input.feederCmPerBird) / 100
    : null;
  const fansRequired = input.fanCapacityM3h && input.airflowM3hPerBird
    ? ceilPositive((input.targetBirds * input.airflowM3hPerBird) / input.fanCapacityM3h)
    : null;
  const cagesRequired = input.cageCapacity
    ? ceilPositive(input.targetBirds / input.cageCapacity)
    : null;

  return {
    grossAreaM2,
    usableAreaM2,
    areaBasedCapacity,
    areaCapacityStatus: areaBasedCapacity === null ? 'missing-parameter' : 'calculated',
    nipplesRequired,
    feederLengthM,
    fansRequired,
    cagesRequired,
    assumptions: [
      'A área útil é calculada pela porcentagem informada sobre a área bruta do galpão.',
      'A capacidade por área é uma estimativa geométrica e não substitui limites legais, bem-estar, equipamentos ou validação técnica.',
      'Ventiladores são estimados pela vazão nominal informada; pressão estática, curva do equipamento e perdas de carga ainda precisam ser avaliadas.',
    ],
  };
}

export function calculateUniformity(weightsGrams: number[], meanBandPercent = 10) {
  if (!Number.isFinite(meanBandPercent) || meanBandPercent < 0 || meanBandPercent > 100) {
    throw new RangeError('A faixa de uniformidade deve estar entre 0% e 100%.');
  }
  const validWeights = weightsGrams.filter((weight) => Number.isFinite(weight) && weight > 0);
  if (validWeights.length === 0) {
    return { count: 0, meanGrams: null, standardDeviationGrams: null, cvPercent: null, uniformityPercent: null };
  }
  const mean = validWeights.reduce((sum, weight) => sum + weight, 0) / validWeights.length;
  const squaredDeviationSum = validWeights.reduce((sum, weight) => sum + (weight - mean) ** 2, 0);
  // Sample standard deviation (n - 1), appropriate for an observed sample of the flock.
  const variance = validWeights.length > 1 ? squaredDeviationSum / (validWeights.length - 1) : 0;
  const standardDeviation = Math.sqrt(variance);
  const withinBand = validWeights.filter((weight) => Math.abs(weight - mean) <= mean * (meanBandPercent / 100)).length;
  return {
    count: validWeights.length,
    meanGrams: mean,
    standardDeviationGrams: standardDeviation,
    cvPercent: (standardDeviation / mean) * 100,
    uniformityPercent: (withinBand / validWeights.length) * 100,
  };
}
