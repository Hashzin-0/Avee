export interface BirdGridPosition {
  x: number;
  z: number;
  yaw: number;
  scale: number;
}

/**
 * Limits GPU instances independently from the flock's real population.
 * The full count remains in domain state; only the visual sample is capped.
 */
export function getVisibleBirdCount(totalBirds: number, compactViewport: boolean): number {
  if (!Number.isFinite(totalBirds) || totalBirds <= 0) return 0;
  return Math.min(Math.floor(totalBirds), compactViewport ? 180 : 360);
}

/** Stable, evenly distributed placement without random work on every render. */
export function getBirdGridPosition(
  index: number,
  count: number,
  length: number,
  width: number,
): BirdGridPosition {
  if (!Number.isInteger(index) || index < 0 || index >= count || count < 1) {
    throw new RangeError('Índice de ave fora da população visual.');
  }
  if (![length, width].every((value) => Number.isFinite(value) && value > 0)) {
    throw new RangeError('As dimensões da cena devem ser positivas.');
  }

  const columns = Math.max(1, Math.ceil(Math.sqrt(count * (length / width))));
  const rows = Math.ceil(count / columns);
  const column = index % columns;
  const row = Math.floor(index / columns);
  const random = (seed: number) => {
    const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
    return value - Math.floor(value);
  };
  const cellWidth = length / columns;
  const cellDepth = width / rows;

  return {
    x: -length / 2 + (column + 0.5) * cellWidth + (random(index * 2 + 1) - 0.5) * Math.min(cellWidth * 0.18, 0.08),
    z: -width / 2 + (row + 0.5) * cellDepth + (random(index * 2 + 2) - 0.5) * Math.min(cellDepth * 0.18, 0.08),
    yaw: random(index * 3 + 3) * Math.PI * 2,
    scale: 0.9 + random(index * 5 + 4) * 0.2,
  };
}
