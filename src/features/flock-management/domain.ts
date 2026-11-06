export type FlockDailyEntry = {
  id: string;
  date: string;
  deaths: number;
  culls: number;
  feedKg: number;
  waterLiters: number;
  eggsProduced: number;
  averageEggWeightGrams?: number;
  averageBodyWeightGrams?: number;
};

export type FlockDailyResult = FlockDailyEntry & {
  birdsAtStart: number;
  birdsAtEnd: number;
  averageInventory: number;
  dailyMortalityPercent: number;
  cumulativeMortalityPercent: number;
  cumulativeCullsPercent: number;
  feedGramsPerBirdDay: number | null;
  feedKgPerBirdDay: number | null;
  waterMlPerBirdDay: number | null;
  henDayProductionPercent: number | null;
  henHousedProductionPercent: number | null;
  eggMassKg: number | null;
  cumulativeEggMassKg: number;
  dailyFeedConversion: number | null;
  cumulativeFeedConversion: number | null;
};

function assertNonNegativeInteger(name: string, value: number) {
  if (!Number.isInteger(value) || value < 0) throw new RangeError(`${name} deve ser um inteiro não negativo.`);
}
function assertNonNegative(name: string, value: number) {
  if (!Number.isFinite(value) || value < 0) throw new RangeError(`${name} deve ser um número finito não negativo.`);
}

export function calculateFlockDashboard(initialBirds: number, entries: FlockDailyEntry[]) {
  if (!Number.isInteger(initialBirds) || initialBirds <= 0) throw new RangeError('Aves alojadas deve ser um inteiro maior que zero.');
  const dates = new Set<string>();
  const ordered = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  let deathsTotal = 0;
  let cullsTotal = 0;
  let feedTotalKg = 0;
  let eggMassTotalKg = 0;
  let eggsTotal = 0;
  let eggMassCoverageComplete = true;
  let previousEnd = initialBirds;

  const daily: FlockDailyResult[] = ordered.map((entry) => {
    const parsedDate = new Date(`${entry.date}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.date) || Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== entry.date) throw new RangeError('Data do registro inválida.');
    if (dates.has(entry.date)) throw new RangeError('Existe mais de um registro para a mesma data.');
    dates.add(entry.date);
    assertNonNegativeInteger('Mortalidade', entry.deaths);
    assertNonNegativeInteger('Aves eliminadas', entry.culls);
    assertNonNegativeInteger('Ovos produzidos', entry.eggsProduced);
    assertNonNegative('Ração consumida', entry.feedKg);
    assertNonNegative('Água consumida', entry.waterLiters);
    if (entry.averageEggWeightGrams !== undefined) assertNonNegative('Peso médio do ovo', entry.averageEggWeightGrams);
    if (entry.averageBodyWeightGrams !== undefined) assertNonNegative('Peso corporal médio', entry.averageBodyWeightGrams);
    if (entry.averageEggWeightGrams === 0 || entry.averageBodyWeightGrams === 0) throw new RangeError('Pesos informados devem ser maiores que zero.');

    const birdsAtStart = previousEnd;
    if (entry.deaths + entry.culls > birdsAtStart) throw new RangeError(`Mortalidade e eliminações em ${entry.date} excedem o plantel disponível.`);
    const birdsAtEnd = birdsAtStart - entry.deaths - entry.culls;
    const averageInventory = (birdsAtStart + birdsAtEnd) / 2;
    const eggMassKg = entry.averageEggWeightGrams !== undefined
      ? (entry.eggsProduced * entry.averageEggWeightGrams) / 1000
      : null;
    deathsTotal += entry.deaths;
    cullsTotal += entry.culls;
    feedTotalKg += entry.feedKg;
    eggsTotal += entry.eggsProduced;
    if (eggMassKg !== null) eggMassTotalKg += eggMassKg;
    else if (entry.eggsProduced > 0) eggMassCoverageComplete = false;
    const feedGramsPerBirdDay = averageInventory > 0 ? (entry.feedKg * 1000) / averageInventory : null;
    const dailyFeedConversion = eggMassKg !== null && eggMassKg > 0 ? entry.feedKg / eggMassKg : null;
    const cumulativeFeedConversion = eggMassCoverageComplete && eggMassTotalKg > 0 ? feedTotalKg / eggMassTotalKg : null;

    const result: FlockDailyResult = {
      ...entry,
      birdsAtStart,
      birdsAtEnd,
      averageInventory,
      dailyMortalityPercent: birdsAtStart > 0 ? (entry.deaths / birdsAtStart) * 100 : 0,
      cumulativeMortalityPercent: (deathsTotal / initialBirds) * 100,
      cumulativeCullsPercent: (cullsTotal / initialBirds) * 100,
      feedGramsPerBirdDay,
      feedKgPerBirdDay: feedGramsPerBirdDay === null ? null : feedGramsPerBirdDay / 1000,
      waterMlPerBirdDay: averageInventory > 0 ? (entry.waterLiters * 1000) / averageInventory : null,
      henDayProductionPercent: birdsAtEnd > 0 ? (entry.eggsProduced / birdsAtEnd) * 100 : null,
      henHousedProductionPercent: (entry.eggsProduced / initialBirds) * 100,
      eggMassKg,
      cumulativeEggMassKg: eggMassTotalKg,
      dailyFeedConversion,
      cumulativeFeedConversion,
    };
    previousEnd = birdsAtEnd;
    return result;
  });

  const latest = daily.at(-1) ?? null;
  return {
    initialBirds,
    currentBirds: latest?.birdsAtEnd ?? initialBirds,
    deathsTotal,
    cullsTotal,
    feedTotalKg,
    eggsTotal,
    eggMassTotalKg,
    daily,
    latest,
    cumulativeMortalityPercent: (deathsTotal / initialBirds) * 100,
    cumulativeCullsPercent: (cullsTotal / initialBirds) * 100,
    liveabilityPercent: ((initialBirds - deathsTotal - cullsTotal) / initialBirds) * 100,
    cumulativeFeedConversion: eggMassCoverageComplete && eggMassTotalKg > 0 ? feedTotalKg / eggMassTotalKg : null,
    eggMassCoverageComplete,
  };
}
