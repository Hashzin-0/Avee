import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateFlockDashboard } from '../src/features/flock-management/domain.ts';
import { getLayerAgeReference, getManagementPhase, layerAgeReferences, layerGuideSources } from '../src/features/flock-management/management-library.ts';
import { hyLineTechnicalResources } from '../src/features/flock-management/hyline-resource-library.ts';

const base = {
  id: 'd1', date: '2026-11-01', deaths: 5, culls: 2,
  feedKg: 500, waterLiters: 1000, eggsProduced: 4200,
  averageEggWeightGrams: 60,
};

test('calculates daily flock metrics using average live inventory', () => {
  const result = calculateFlockDashboard(5000, [base]);
  assert.equal(result.currentBirds, 4993);
  assert.equal(result.deathsTotal, 5);
  assert.equal(result.cullsTotal, 2);
  assert.equal(result.cumulativeMortalityPercent, 0.1);
  assert.equal(result.cumulativeCullsPercent, 0.04);
  assert.ok(Math.abs((result.latest?.feedGramsPerBirdDay ?? 0) - 100.0700420252) < 0.0001);
  assert.ok(Math.abs((result.latest?.waterMlPerBirdDay ?? 0) - 200.1400840501) < 0.0001);
  assert.ok(Math.abs((result.latest?.henDayProductionPercent ?? 0) - 84.117164029) < 0.0001);
  assert.equal(result.latest?.henHousedProductionPercent, 84);
  assert.equal(result.latest?.eggMassKg, 252);
  assert.equal(result.latest?.dailyFeedConversion, 500 / 252);
  assert.equal(result.eggMassCoverageComplete, true);
});

test('aggregates multi-day feed, egg mass, mortality and inventory in date order', () => {
  const result = calculateFlockDashboard(1000, [
    { ...base, id: 'd2', date: '2026-11-02', deaths: 1, culls: 0, feedKg: 100, waterLiters: 200, eggsProduced: 800, averageEggWeightGrams: 60 },
    { ...base, id: 'd1', date: '2026-11-01', deaths: 2, culls: 1, feedKg: 100, waterLiters: 200, eggsProduced: 700, averageEggWeightGrams: 60 },
  ]);
  assert.equal(result.currentBirds, 996);
  assert.equal(result.deathsTotal, 3);
  assert.equal(result.eggsTotal, 1500);
  assert.equal(result.eggsPerHousedBird, 1.5);
  assert.equal(result.eggMassTotalKg, 90);
  assert.equal(result.cumulativeFeedConversion, 200 / 90);
  assert.equal(result.daily[0].date, '2026-11-01');
});

test('does not report cumulative feed conversion when egg-weight coverage is incomplete', () => {
  const result = calculateFlockDashboard(100, [{ ...base, averageEggWeightGrams: undefined }]);
  assert.equal(result.eggMassCoverageComplete, false);
  assert.equal(result.cumulativeFeedConversion, null);
});

test('rejects invalid inventory, duplicate dates and losses exceeding the flock', () => {
  assert.throws(() => calculateFlockDashboard(0, []), /maior que zero/);
  assert.throws(() => calculateFlockDashboard(10, [base, { ...base, id: 'd2' }]), /mais de um registro/);
  assert.throws(() => calculateFlockDashboard(2, [{ ...base, deaths: 2, culls: 1 }]), /excedem o plantel/);
});

test('maps age to the management cycle without a fixed starting age for lay', () => {
  assert.equal(getManagementPhase(0), 'Cria');
  assert.equal(getManagementPhase(5.9), 'Cria');
  assert.equal(getManagementPhase(6), 'Recria');
  assert.equal(getManagementPhase(15), 'Pré-postura');
  assert.equal(getManagementPhase(18), 'Produção');
  assert.throws(() => getManagementPhase(-1), /não negativo/);
});

test('provides source-backed Hy-Line Brown weekly rearing references and lineage guide catalog', () => {
  const week12 = getLayerAgeReference('Hy-Line Brown', 12);
  assert.equal(week12?.dailyFeedMinGrams, 63);
  assert.equal(week12?.dailyFeedMaxGrams, 68);
  assert.equal(week12?.dailyWaterMinMl, 94);
  assert.equal(week12?.cumulativeMortalityPercent, 1.55);
  assert.equal(layerGuideSources.length, 4);
  assert.ok(layerGuideSources.every((source) => source.url.startsWith('https://')));
  assert.equal(getLayerAgeReference('Lohmann Brown-Classic', 17)?.bodyWeightMinGrams, 1380);
  assert.equal(getLayerAgeReference('NOVOgen Brown', 60)?.eggsPerHenHousedMin, 254);
  assert.equal(getLayerAgeReference('Hy-Line Brown', 100)?.cumulativeMortalityPercent, 8.6);
  assert.equal(getLayerAgeReference('Hy-Line Brown', 44)?.dailyFeedMinGrams, 109.1);
  assert.equal(getLayerAgeReference('NOVOgen Brown', 23.5)?.ageWeeks, 23);
  assert.equal(getLayerAgeReference('Hy-Line W-36', 45)?.dailyFeedMinGrams, 99.6);
  assert.equal(getLayerAgeReference('NOVOgen Brown', 12)?.dailyFeedMinGrams, 65);
  assert.equal(getLayerAgeReference('NOVOgen Brown', 35)?.dailyFeedMaxGrams, 119);
  assert.equal(getLayerAgeReference('Lohmann Brown-Classic', 45)?.dailyFeedMaxGrams, 120);
  assert.equal(week12?.reviewStatus, 'transcribed-unreviewed');
});


test('keeps Hy-Line Brown conventional and alternative performance standards separate', () => {
  const conventional = layerAgeReferences.filter((item) => item.lineage === 'Hy-Line Brown' && item.sourceId === 'hyline-brown-2025-conventional');
  const alternative = layerAgeReferences.filter((item) => item.lineage === 'Hy-Line Brown' && item.sourceId === 'hyline-brown-2026-alternative');
  assert.equal(conventional.length, 100);
  assert.equal(alternative.length, 100);
  assert.deepEqual(conventional.map((item) => item.ageWeeks).sort((a, b) => a - b), Array.from({ length: 100 }, (_, index) => index + 1));
  assert.deepEqual(alternative.map((item) => item.ageWeeks).sort((a, b) => a - b), Array.from({ length: 100 }, (_, index) => index + 1));
  assert.equal(getLayerAgeReference('Hy-Line Brown', 100, 'conventional')?.eggsPerHenHousedMax, 497.9);
  assert.equal(getLayerAgeReference('Hy-Line Brown', 100, 'alternative')?.eggsPerHenHousedMax, 489.1);
  assert.equal(getLayerAgeReference('Hy-Line Brown', 100, 'conventional')?.cumulativeMortalityPercent, 8.6);
  assert.equal(getLayerAgeReference('Hy-Line Brown', 100, 'alternative')?.cumulativeMortalityPercent, 10.04);
  assert.equal(getLayerAgeReference('Hy-Line Brown', 101, 'alternative'), null);
  assert.equal(getLayerGuideSource('Hy-Line Brown', 'alternative')?.id, 'hyline-brown-2026-alternative');
});

test('catalogs Hy-Line PDFs with source, category, applicability and concise extraction', () => {
  assert.ok(hyLineTechnicalResources.length >= 20);
  assert.ok(hyLineTechnicalResources.every((resource) => resource.url.startsWith('https://')));
  assert.ok(hyLineTechnicalResources.every((resource) => resource.summary.length > 50));
  assert.ok(hyLineTechnicalResources.some((resource) => resource.id === 'vaccination-recommendations' && resource.language === 'Português'));
});
