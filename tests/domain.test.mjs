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


test('calculates the maximum floor-system capacity from usable area and a documented area coefficient', () => {
  const result = calculateFarm({
    ...baseInput,
    houseWidthM: 20,
    usableAreaPercent: 80,
    areaPerBirdCm2: 1_429,
  });
  assert.equal(result.grossAreaM2, 2_000);
  assert.equal(result.usableAreaM2, 1_600);
  assert.equal(result.areaBasedCapacity, Math.floor((1_600 * 10_000) / 1_429));
});

test('does not infer maximum capacity when the applicable area coefficient is missing', () => {
  const result = calculateFarm({ ...baseInput, houseWidthM: 20 });
  assert.equal(result.areaBasedCapacity, null);
  assert.equal(result.areaCapacityStatus, 'missing-parameter');
});


test('limits existing-house capacity by the lowest documented installed-system constraint', () => {
  const result = calculateFarm({
    ...baseInput,
    houseWidthM: 20,
    areaPerBirdCm2: 1_429,
    birdsPerNipple: 10,
    installedNipples: 150,
    feederCmPerBird: 10,
    installedFeederLengthM: 1_200,
    fanCapacityM3h: 40_000,
    airflowM3hPerBird: 4,
    installedFanCount: 2,
    cageCapacity: 100,
    installedCageModules: 30,
  });
  assert.equal(result.areaBasedCapacity, 11_196);
  assert.equal(result.availableBirdCapacity, 1_500);
  assert.deepEqual(result.limitingConstraints.map(({ key }) => key), ['drinkers']);
});

test('reports all tied limiting constraints and does not infer capacity from ratios alone', () => {
  const result = calculateFarm({
    ...baseInput,
    birdsPerNipple: 10,
    feederCmPerBird: 10,
  });
  assert.equal(result.availableBirdCapacity, null);
  assert.equal(result.capacityStatus, 'missing-parameters');
  assert.deepEqual(result.limitingConstraints, []);
});

test('rejects fractional installed equipment counts', () => {
  assert.throws(() => calculateFarm({ ...baseInput, installedNipples: 2.5 }), /inteiro/);
});
