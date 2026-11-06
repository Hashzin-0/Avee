import { Canvas } from '@react-three/fiber';
import { Grid, OrbitControls } from '@react-three/drei';
import { Suspense } from 'react';
import { DoubleSide } from 'three';

interface FarmSceneProps {
  length: number;
  width: number;
  sideHeight: number;
  ridgeHeight: number;
  rows: number;
}

function House({ length, width, sideHeight, ridgeHeight, rows }: FarmSceneProps) {
  const safeLength = Math.max(length, 1);
  const safeWidth = Math.max(width, 1);
  const safeRows = Math.max(0, Math.floor(rows));
  const scale = Math.min(14 / safeLength, 8 / safeWidth, 4 / Math.max(ridgeHeight, 1));
  const l = safeLength * scale;
  const w = safeWidth * scale;
  const wallHeight = Math.max(sideHeight, 0.5) * scale;
  const roofRise = Math.max((ridgeHeight - sideHeight) * scale, 0.15 * scale);
  const ridgeY = wallHeight + roofRise;
  const roofHalfSpan = w / 2 + 0.3 * scale;
  const roofSlopeLength = Math.hypot(roofHalfSpan, roofRise);
  const roofAngle = Math.atan2(roofRise, roofHalfSpan);
  const roofCenterY = wallHeight + roofRise / 2;
  const roofCenterZ = roofHalfSpan / 2;
  const floorThickness = 0.12 * scale;
  const wallThickness = 0.08 * scale;
  const rowPositions = Array.from({ length: safeRows }, (_, index) =>
    -w / 2 + ((index + 1) * w) / (safeRows + 1),
  );

  return (
    <group>
      <mesh position={[0, -floorThickness / 2, 0]} receiveShadow>
        <boxGeometry args={[l, floorThickness, w]} />
        <meshStandardMaterial color="#aab5a8" roughness={0.92} />
      </mesh>

      <mesh position={[0, wallHeight / 2, -w / 2]}>
        <boxGeometry args={[l, wallHeight, wallThickness]} />
        <meshStandardMaterial color="#d8dfd7" transparent opacity={0.32} />
      </mesh>
      <mesh position={[0, wallHeight / 2, w / 2]}>
        <boxGeometry args={[l, wallHeight, wallThickness]} />
        <meshStandardMaterial color="#d8dfd7" transparent opacity={0.32} />
      </mesh>

      {rowPositions.map((z, index) => (
        <group key={`row-${index}`} position={[0, 0, z]}>
          <mesh position={[0, 0.31 * scale, 0]} castShadow>
            <boxGeometry args={[l * 0.88, 0.62 * scale, Math.max(0.16 * scale, w * 0.035)]} />
            <meshStandardMaterial color="#718477" metalness={0.28} roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.68 * scale, 0]}>
            <boxGeometry args={[l * 0.9, 0.045 * scale, 0.07 * scale]} />
            <meshStandardMaterial color="#d1a85d" metalness={0.25} />
          </mesh>
          <mesh position={[0, 0.78 * scale, 0.16 * scale]}>
            <boxGeometry args={[l * 0.9, 0.035 * scale, 0.035 * scale]} />
            <meshStandardMaterial color="#7ba8b0" metalness={0.2} />
          </mesh>
        </group>
      ))}

      {Array.from({ length: 5 }, (_, index) => (
        <mesh
          key={`fan-${index}`}
          position={[l / 2 - 0.2 * scale, wallHeight * 0.52, -w / 2 + ((index + 1) * w) / 6]}
          rotation={[0, Math.PI / 2, 0]}
        >
          <cylinderGeometry args={[0.28 * scale, 0.28 * scale, 0.08 * scale, 24]} />
          <meshStandardMaterial color="#384b43" metalness={0.55} roughness={0.35} />
        </mesh>
      ))}

      <mesh position={[0, roofCenterY, roofCenterZ]} rotation={[roofAngle, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[l + 0.6 * scale, 0.1 * scale, roofSlopeLength]} />
        <meshStandardMaterial color="#657d68" roughness={0.78} side={DoubleSide} />
      </mesh>
      <mesh position={[0, roofCenterY, -roofCenterZ]} rotation={[-roofAngle, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[l + 0.6 * scale, 0.1 * scale, roofSlopeLength]} />
        <meshStandardMaterial color="#718b73" roughness={0.78} side={2} />
      </mesh>
      <mesh position={[0, ridgeY, 0]} castShadow>
        <boxGeometry args={[l + 0.6 * scale, 0.12 * scale, 0.14 * scale]} />
        <meshStandardMaterial color="#4c6251" roughness={0.72} />
      </mesh>
    </group>
  );
}

export function FarmScene(props: FarmSceneProps) {
  const sceneScale = Math.min(14 / Math.max(props.length, 1), 8 / Math.max(props.width, 1), 4 / Math.max(props.ridgeHeight, 1));

  return (
    <div className="scene-canvas" role="img" aria-label="Pré-visualização tridimensional ilustrativa do galpão com telhado de duas águas">
      <Canvas camera={{ position: [10, 8, 11], fov: 42 }} shadows dpr={[1, 1.5]}>
        <color attach="background" args={['#e8eee8']} />
        <ambientLight intensity={1.15} />
        <directionalLight position={[7, 10, 5]} intensity={2} castShadow />
        <Suspense fallback={null}>
          <House {...props} />
          <Grid args={[24, 24]} cellSize={1} cellThickness={0.45} sectionSize={5} sectionThickness={0.9} fadeDistance={30} infiniteGrid position={[0, -0.12 * sceneScale - 0.001, 0]} />
        </Suspense>
        <OrbitControls makeDefault minDistance={5} maxDistance={30} maxPolarAngle={Math.PI / 2.05} />
      </Canvas>
    </div>
  );
}
