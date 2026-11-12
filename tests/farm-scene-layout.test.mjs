import assert from 'node:assert/strict';
import test from 'node:test';
import { getBirdGridPosition, getVisibleBirdCount } from '../src/features/farm-builder/scene-layout.ts';

test('visual flock budget is bounded while preserving small flock counts', () => {
  assert.equal(getVisibleBirdCount(80, true), 80);
  assert.equal(getVisibleBirdCount(50_000, true), 180);
  assert.equal(getVisibleBirdCount(50_000, false), 360);
  assert.equal(getVisibleBirdCount(Number.NaN, false), 0);
  assert.equal(getVisibleBirdCount(-5, false), 0);
});

test('bird positions are deterministic and remain inside the house footprint', () => {
  const first = getBirdGridPosition(4, 120, 14, 2.8);
  const second = getBirdGridPosition(4, 120, 14, 2.8);
  assert.deepEqual(first, second);
  assert.ok(first.x >= -7 && first.x <= 7);
  assert.ok(first.z >= -1.4 && first.z <= 1.4);
  assert.ok(first.scale >= 0.9 && first.scale <= 1.1);
});

test('bird placement rejects invalid dimensions and indices', () => {
  assert.throws(() => getBirdGridPosition(-1, 10, 14, 2.8), RangeError);
  assert.throws(() => getBirdGridPosition(0, 10, 0, 2.8), RangeError);
});
