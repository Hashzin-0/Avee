import { Canvas } from '@react-three/fiber';
import { Grid, OrbitControls } from '@react-three/drei';
import { Suspense } from 'react';

interface FarmSceneProps {
  length: number;
  width: number;
  rows: number;
}

function House({ length, width, rows }: FarmSceneProps) {
  const scale = Math.min(14 / length, 8 / width);
  const l = length * scale;
  const w = width * scale;
  const wallHeight = 1.15;
  const rowPositions = Array.from({ length: rows }, (_, index) =>
    -w / 2 + ((index + 1) * w) / (rows + 1),
  );

  return (
    <group>
      <mesh position={[0, -0.08, 0]} receiveShadow>
        <boxGeometry args={[l, 0.16, w]} />
        <meshStandardMaterial color="#aab5a8" roughness={0.92} />
      </mesh>
      <mesh position={[0, wallHeight / 2, -w / 2]}>
        <boxGeometry args={[l, wallHeight, 0.08]} />
        <meshStandardMaterial color="#d8dfd7" transparent opacity={0.32} />
      </mesh>
      <mesh position={[0, wallHeight / 2, w / 2]}>
        <boxGeometry args={[l, wallHeight, 0.08]} />
        <meshStandardMaterial color="#d8dfd7" transparent opacity={0.32} />
      </mesh>
      {rowPositions.map((z, index) => (
        <group key={`row-${index}`} position={[0, 0, z]}>
          <mesh position={[0, 0.48, 0]} castShadow>
            <boxGeometry args={[l * 0.88, 0.62, Math.max(0.16, w * 0.035)]} />
            <meshStandardMaterial color="#718477" metalness={0.28} roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.84, 0]}>
            <boxGeometry args={[l * 0.9, 0.045, 0.07]} />
            <meshStandardMaterial color="#d1a85d" metalness={0.25} />
          </mesh>
          <mesh position={[0, 0.9, 0.16]}>
            <boxGeometry args={[l * 0.9, 0.035, 0.035]} />
            <meshStandardMaterial color="#7ba8b0" metalness={0.2} />
          </mesh>
        </group>
      ))}
      {Array.from({ length: 5 }, (_, index) => (
        <mesh key={`fan-${index}`} position={[l / 2 - 0.2, 0.6, -w / 2 + ((index + 1) * w) / 6]} rotation={[0, Math.PI / 2, 0]}>
          <cylinderGeometry args={[0.28, 0.28, 0.08, 24]} />
          <meshStandardMaterial color="#384b43" metalness={0.55} roughness={0.35} />
        </mesh>
      ))}
      <mesh position={[0, wallHeight + 0.8, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[w + 0.4, 0.08, l]} />
        <meshStandardMaterial color="#58665e" roughness={0.82} />
      </mesh>
    </group>
  );
}

export function FarmScene(props: FarmSceneProps) {
  return (
    <div className="scene-canvas" role="img" aria-label="Pré-visualização tridimensional ilustrativa do galpão">
      <Canvas camera={{ position: [10, 8, 11], fov: 42 }} shadows dpr={[1, 1.5]}>
        <color attach="background" args={['#e8eee8']} />
        <ambientLight intensity={1.15} />
        <directionalLight position={[7, 10, 5]} intensity={2} castShadow />
        <Suspense fallback={null}>
          <House {...props} />
          <Grid args={[24, 24]} cellSize={1} cellThickness={0.45} sectionSize={5} sectionThickness={0.9} fadeDistance={30} infiniteGrid position={[0, -0.17, 0]} />
        </Suspense>
        <OrbitControls makeDefault minDistance={5} maxDistance={30} maxPolarAngle={Math.PI / 2.05} />
      </Canvas>
    </div>
  );
}
