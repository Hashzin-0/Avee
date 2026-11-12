import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import {
  CylinderGeometry,
  InstancedMesh,
  Matrix4,
  MeshStandardMaterial,
  Quaternion,
  Vector3,
} from 'three';

interface FarmEquipmentProps {
  rows: number;
  length: number;
  width: number;
  wallHeight: number;
  scale: number;
  fans?: number;
  nipples?: number;
}

function DrinkerNipples({ count, rows, length, scale }: {
  count: number;
  rows: number[];
  length: number;
  scale: number;
}) {
  const instanceRef = useRef<InstancedMesh>(null);
  const visibleCount = Math.min(Math.max(0, Math.floor(count)), 300);
  const geometry = useMemo(() => new CylinderGeometry(0.018, 0.025, 0.11, 7), []);
  const material = useMemo(() => new MeshStandardMaterial({ color: '#c3a65f', metalness: 0.42, roughness: 0.48 }), []);

  useEffect(() => () => {
    geometry.dispose();
    material.dispose();
  }, [geometry, material]);

  useLayoutEffect(() => {
    const mesh = instanceRef.current;
    if (!mesh || visibleCount === 0 || rows.length === 0) return;
    const matrix = new Matrix4();
    const position = new Vector3();
    const rotation = new Quaternion();
    const size = new Vector3(scale, scale, scale);
    const axis = new Vector3(0, 0, 1);
    const stride = Math.ceil(visibleCount / rows.length);

    for (let index = 0; index < visibleCount; index += 1) {
      const rowIndex = Math.min(rows.length - 1, Math.floor(index / stride));
      const rowItem = index % stride;
      const rowCount = Math.min(stride, visibleCount - rowIndex * stride);
      const x = -length * 0.42 + ((rowItem + 0.5) / Math.max(rowCount, 1)) * length * 0.84;
      position.set(x, 0.72 * scale, rows[rowIndex] + 0.035 * scale);
      rotation.setFromAxisAngle(axis, Math.PI);
      matrix.compose(position, rotation, size);
      mesh.setMatrixAt(index, matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [length, rows, scale, visibleCount]);

  if (visibleCount === 0) return null;

  return <instancedMesh ref={instanceRef} args={[geometry, material, visibleCount]} />;
}

export function FarmEquipment({ rows, length, width, wallHeight, scale, fans, nipples }: FarmEquipmentProps) {
  const rowPositions = Array.from({ length: Math.min(12, Math.max(1, Math.floor(rows))) }, (_, index) =>
    -width / 2 + ((index + 1) * width) / (Math.min(12, Math.max(1, Math.floor(rows))) + 1),
  );
  const fanCount = Math.min(12, Math.max(0, Math.floor(fans ?? 0)));
  const fanPositions = Array.from({ length: fanCount }, (_, index) =>
    -width / 2 + ((index + 1) * width) / (fanCount + 1),
  );

  return (
    <group>
      {rowPositions.map((z, index) => (
        <group key={`row-${index}`} position={[0, 0, z]}>
          <mesh position={[0, 0.31 * scale, 0]}>
            <boxGeometry args={[length * 0.88, 0.58 * scale, Math.max(0.2 * scale, width * 0.025)]} />
            <meshStandardMaterial color="#77877b" metalness={0.35} roughness={0.68} />
          </mesh>
          <mesh position={[0, 0.64 * scale, 0]}>
            <boxGeometry args={[length * 0.9, 0.065 * scale, 0.1 * scale]} />
            <meshStandardMaterial color="#b8a16d" metalness={0.28} roughness={0.55} />
          </mesh>
          <mesh position={[0, 0.76 * scale, 0.12 * scale]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.035 * scale, 0.035 * scale, length * 0.9, 10]} />
            <meshStandardMaterial color="#8bb6bd" metalness={0.5} roughness={0.32} />
          </mesh>
          <mesh position={[0, 0.64 * scale, -0.12 * scale]}>
            <boxGeometry args={[length * 0.9, 0.08 * scale, 0.16 * scale]} />
            <meshStandardMaterial color="#b9bfc0" metalness={0.58} roughness={0.42} />
          </mesh>
        </group>
      ))}

      <DrinkerNipples count={nipples ?? 0} rows={rowPositions} length={length} scale={scale} />

      {fanPositions.map((z, index) => (
        <group key={`fan-${index}`} position={[length / 2 - 0.02 * scale, wallHeight * 0.52, z]} rotation={[0, 0, Math.PI / 2]}>
          <mesh>
            <cylinderGeometry args={[0.46 * scale, 0.46 * scale, 0.18 * scale, 20]} />
            <meshStandardMaterial color="#52615e" metalness={0.72} roughness={0.34} />
          </mesh>
          <mesh position={[0, 0.105 * scale, 0]}>
            <cylinderGeometry args={[0.12 * scale, 0.12 * scale, 0.04 * scale, 16]} />
            <meshStandardMaterial color="#b8c2bd" metalness={0.82} roughness={0.3} />
          </mesh>
          {[0, 1, 2, 3].map((blade) => (
            <mesh key={blade} rotation={[0, (blade * Math.PI) / 2, 0]} position={[0, 0.1 * scale, 0]}>
              <boxGeometry args={[0.12 * scale, 0.035 * scale, 0.66 * scale]} />
              <meshStandardMaterial color="#9baaa4" metalness={0.66} roughness={0.38} />
            </mesh>
          ))}
          <mesh position={[0, 0.19 * scale, 0]}>
            <boxGeometry args={[1.08 * scale, 0.06 * scale, 1.08 * scale]} />
            <meshStandardMaterial color="#354844" metalness={0.55} roughness={0.4} wireframe />
          </mesh>
        </group>
      ))}
    </group>
  );
}
