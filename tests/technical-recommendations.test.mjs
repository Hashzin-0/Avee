import test from 'node:test';
import assert from 'node:assert/strict';
import { getLayerTechnicalRecommendation } from '../src/features/farm-builder/technical-recommendations.ts';

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
  assert.equal(getLayerTechnicalRecommendation({ ...base, lineage: 'Lohmann Brown-Classic' }), null);
  assert.equal(getLayerTechnicalRecommendation({ ...base, lineage: 'NOVOgen Brown' }), null);
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
  assert.equal(recommendation.values.areaPerBirdCm2, undefined);
  assert.equal(getLayerTechnicalRecommendation({
    ...base,
    lineage: 'Hy-Line W-36',
    ageWeeks: 35,
  }), null);
});
