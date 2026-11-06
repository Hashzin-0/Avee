import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateFarm, calculateUniformity } from '../src/features/farm-builder/domain.ts';

const baseInput = {
  houseLengthM: 100,
  houseWidthM: 12,
  sideHeightM: 3,
  ridgeHeightM: 4.5,
  targetBirds: 5_000,
  usableAreaPercent: 80,
};

test('calculates area and leaves equipment values pending without documented coefficients', () => {
  const result = calculateFarm(baseInput);
  assert.equal(result.grossAreaM2, 1_200);
  assert.equal(result.usableAreaM2, 960);
  assert.equal(result.nipplesRequired, null);
  assert.equal(result.fansRequired, null);
  assert.equal(result.areaCapacityStatus, 'missing-parameter');
});

test('rounds up counts based on user-provided parameters', () => {
  const result = calculateFarm({
    ...baseInput,
    birdsPerNipple: 12,
    feederCmPerBird: 7,
    fanCapacityM3h: 40_000,
    airflowM3hPerBird: 4,
    cageCapacity: 120,
    areaPerBirdCm2: 490,
  });
  assert.equal(result.nipplesRequired, 417);
  assert.equal(result.feederLengthM, 350);
  assert.equal(result.fansRequired, 1);
  assert.equal(result.cagesRequired, 42);
  assert.equal(result.areaBasedCapacity, 19_591);
});

test('rejects invalid building dimensions', () => {
  assert.throws(() => calculateFarm({ ...baseInput, houseLengthM: 0 }), /maior que zero/);
  assert.throws(() => calculateFarm({ ...baseInput, ridgeHeightM: 2 }), /cumeeira/);
});

test('calculates mean, CV and uniformity on valid weights only', () => {
  const result = calculateUniformity([900, 1_000, 1_100, 0, -2]);
  assert.equal(result.count, 3);
  assert.equal(result.meanGrams, 1_000);
  assert.ok(Math.abs(result.cvPercent - 10) < 0.0001);
  assert.ok(Math.abs(result.uniformityPercent - 100) < 0.0001);
});

test('returns empty metrics when there are no valid weights', () => {
  const result = calculateUniformity([0, -2, Number.NaN]);
  assert.equal(result.count, 0);
  assert.equal(result.meanGrams, null);
});
