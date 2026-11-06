import test from 'node:test';
import assert from 'node:assert/strict';
import { getLayerPerformanceProfile, getLayerTechnicalRecommendation } from '../src/features/farm-builder/technical-recommendations.ts';

const base = {
  lineage: 'Hy-Line Brown',
  housingSystem: 'Gaiolas convencionais',
  phase: 'Produção',
  ageWeeks: 24,
  climateProfile: 'Quente',
};

test('autofills Hy-Line Brown conventional cage values from its cited production guide', () => {
  const recommendation = getLayerTechnicalRecommendation(base);
  assert.ok(recommendation);
  assert.deepEqual(recommendation.values, {
    birdsPerNipple: 12,
    feederCmPerBird: 12,
  });
  assert.equal(recommendation.values.areaPerBirdCm2, undefined);
  assert.match(recommendation.note, /piso de gaiola/);
  assert.equal(recommendation.source.page, '7');
  assert.match(recommendation.source.url, /^https:\/\//);
});

test('autofills Hy-Line Brown floor values and marks free-range area as indoor only', () => {
  const recommendation = getLayerTechnicalRecommendation({
    ...base,
    housingSystem: 'Free-range',
  });
  assert.ok(recommendation);
  assert.equal(recommendation.values.areaPerBirdCm2, 1429);
  assert.match(recommendation.note, /área interna útil/);
});

test('does not invent coefficients for unsupported lineages, systems, ages or phases', () => {
  assert.ok(getLayerTechnicalRecommendation({ ...base, lineage: 'Lohmann Brown-Classic' }));
  assert.ok(getLayerTechnicalRecommendation({ ...base, lineage: 'NOVOgen Brown', climateProfile: 'Quente' }));
  assert.equal(getLayerTechnicalRecommendation({ ...base, housingSystem: 'Gaiolas enriquecidas' }), null);
  assert.equal(getLayerTechnicalRecommendation({ ...base, phase: 'Recria' }), null);
});

test('uses only the exact documented W-36 age intervals', () => {
  const recommendation = getLayerTechnicalRecommendation({
    ...base,
    lineage: 'Hy-Line W-36',
    ageWeeks: 45,
  });
  assert.ok(recommendation);
  assert.equal(recommendation.values.birdsPerNipple, 12);
  assert.equal(recommendation.values.areaPerBirdCm2, undefined);
  assert.equal(getLayerTechnicalRecommendation({
    ...base,
    lineage: 'Hy-Line W-36',
    ageWeeks: 35,
  }), null);
});

test('autofills Lohmann Brown-Classic cage equipment values from its guide', () => {
  const recommendation = getLayerTechnicalRecommendation({
    ...base,
    lineage: 'Lohmann Brown-Classic',
  });
  assert.ok(recommendation);
  assert.deepEqual(recommendation.values, {
    birdsPerNipple: 8,
    feederCmPerBird: 5,
  });
  assert.equal(recommendation.source.page, '33');
});

test('provides source-backed performance indicators for Hy-Line Brown and Lohmann', () => {
  const hyline = getLayerPerformanceProfile('Hy-Line Brown');
  assert.ok(hyline);
  assert.ok(hyline.indicators.some((item) => item.label.includes('Mortalidade') && item.value === '8,60%'));
  assert.ok(hyline.indicators.some((item) => item.label.includes('Ovos por ave alojada')));
  assert.ok(hyline.indicators.some((item) => item.label.includes('Consumo médio de ração')));
  const lohmann = getLayerPerformanceProfile('Lohmann Brown-Classic');
  assert.ok(lohmann);
  assert.ok(lohmann.indicators.some((item) => item.value === '358–363 ovos'));
});

test('does not present unsupported performance profiles as official', () => {
  assert.ok(getLayerPerformanceProfile('NOVOgen Brown'));
  assert.equal(getLayerPerformanceProfile('Outra / não definida'), null);
});

test('NOVOgen Brown applies climate-specific floor and nipple recommendations', () => {
  const warm = getLayerTechnicalRecommendation({
    ...base,
    lineage: 'NOVOgen Brown',
    housingSystem: 'Sistema de piso',
    climateProfile: 'Quente',
  });
  assert.ok(warm);
  assert.equal(warm.values.areaPerBirdCm2, 1667);
  assert.equal(warm.values.birdsPerNipple, 8);
  const temperate = getLayerTechnicalRecommendation({
    ...base,
    lineage: 'NOVOgen Brown',
    housingSystem: 'Sistema de piso',
    climateProfile: 'Temperado',
  });
  assert.ok(temperate);
  assert.equal(temperate.values.areaPerBirdCm2, 1250);
  assert.equal(temperate.values.birdsPerNipple, 10);
  assert.equal(getLayerTechnicalRecommendation({
    ...base,
    lineage: 'NOVOgen Brown',
    climateProfile: 'Frio',
  }), null);
});

test('NOVOgen Brown performance indicators include mortality, eggs, body weight and feed intake', () => {
  const profile = getLayerPerformanceProfile('NOVOgen Brown');
  assert.ok(profile);
  assert.ok(profile.indicators.some((item) => item.value === '4,2%' && item.label.includes('Mortalidade')));
  assert.ok(profile.indicators.some((item) => item.value === '254 ovos'));
  assert.ok(profile.indicators.some((item) => item.value === '111–119 g/ave/dia'));
});
