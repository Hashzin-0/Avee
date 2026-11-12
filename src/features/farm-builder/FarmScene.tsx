import { Canvas } from '@react-three/fiber';
import { Grid, OrbitControls } from '@react-three/drei';
import { FarmEquipment } from './FarmEquipment';
import { FlockInstances } from './FlockInstances';

interface FarmSceneProps {
  length: number;
  width: number;
  sideHeight: number;
  ridgeHeight: number;
  rows: number;
  fans?: number;
  birds?: number;
  nipples?: number;
}

interface HouseProps extends FarmSceneProps {
  scale: number;
}

function House({ length, width, sideHeight, ridgeHeight, rows, fans, birds, nipples, scale }: HouseProps) {
  const safeRows = Math.min(12, Math.max(1, Math.floor(rows)));
  const safeLength = Math.max(length, 1) * scale;
  const safeWidth = Math.max(width, 1) * scale;
  const wallHeight = Math.max(sideHeight, 0.5) * scale;
  const roofRise = Math.max((ridgeHeight - sideHeight) * scale, 0.15 * scale);
  const ridgeY = wallHeight + roofRise;
  const roofHalfSpan = safeWidth / 2 + 0.3 * scale;
  const roofSlopeLength = Math.hypot(roofHalfSpan, roofRise);
  const roofAngle = Math.atan2(roofRise, roofHalfSpan);
  const roofCenterY = wallHeight + roofRise / 2;
  const roofCenterZ = roofHalfSpan / 2;
  const floorThickness = 0.12 * scale;
  const wallThickness = 0.08 * scale;
  const supportCount = Math.min(32, Math.max(4, Math.ceil(safeLength / (2.8 * scale))));

  return (
    <group>
      <mesh position={[0, -floorThickness / 2, 0]}>
        <boxGeometry args={[safeLength, floorThickness, safeWidth]} />
        <meshStandardMaterial color="#b8b9a9" roughness={0.94} />
      </mesh>

      <mesh position={[0, wallHeight / 2, -safeWidth / 2]}>
        <boxGeometry args={[safeLength, wallHeight, wallThickness]} />
        <meshStandardMaterial color="#dce4dc" transparent opacity={0.25} depthWrite={false} />
      </mesh>
      <mesh position={[0, wallHeight / 2, safeWidth / 2]}>
        <boxGeometry args={[safeLength, wallHeight, wallThickness]} />
        <meshStandardMaterial color="#dce4dc" transparent opacity={0.25} depthWrite={false} />
      </mesh>

      {Array.from({ length: supportCount + 1 }, (_, index) => {
        const x = -safeLength / 2 + (index * safeLength) / supportCount;
        return (
          <group key={`frame-${index}`}>
            {[-safeWidth / 2, safeWidth / 2].map((z) => (
              <mesh key={z} position={[x, wallHeight / 2, z]}>
                <boxGeometry args={[0.1 * scale, wallHeight, 0.1 * scale]} />
                <meshStandardMaterial color="#526b59" metalness={0.3} roughness={0.72} />
              </mesh>
            ))}
            <mesh position={[x, ridgeY - roofRise * 0.18, 0]}>
              <boxGeometry args={[0.07 * scale, 0.07 * scale, safeWidth]} />
              <meshStandardMaterial color="#637c68" metalness={0.24} roughness={0.7} />
            </mesh>
          </group>
        );
      })}

      <FarmEquipment
        rows={safeRows}
        length={safeLength}
        width={safeWidth}
        wallHeight={wallHeight}
        scale={scale}
        fans={fans}
        nipples={nipples}
      />

      <FlockInstances
        count={birds ?? 0}
        length={safeLength * 0.9}
        width={safeWidth * 0.88}
        scale={scale}
      />

      <mesh position={[0, roofCenterY, roofCenterZ]} rotation={[roofAngle, 0, 0]}>
        <boxGeometry args={[safeLength + 0.6 * scale, 0.1 * scale, roofSlopeLength]} />
        <meshStandardMaterial color="#657d68" roughness={0.78} transparent opacity={0.24} depthWrite={false} />
      </mesh>
      <mesh position={[0, roofCenterY, -roofCenterZ]} rotation={[-roofAngle, 0, 0]}>
        <boxGeometry args={[safeLength + 0.6 * scale, 0.1 * scale, roofSlopeLength]} />
        <meshStandardMaterial color="#718b73" roughness={0.78} transparent opacity={0.24} depthWrite={false} />
      </mesh>
      <mesh position={[0, ridgeY, 0]}>
        <boxGeometry args={[safeLength + 0.6 * scale, 0.12 * scale, 0.14 * scale]} />
        <meshStandardMaterial color="#4c6251" roughness={0.72} />
      </mesh>
    </group>
  );
}

export function FarmScene(props: FarmSceneProps) {
  const sceneScale = Math.min(
    14 / Math.max(props.length, 1),
    8 / Math.max(props.width, 1),
    4 / Math.max(props.ridgeHeight, 1),
  );

  return (
    <div className="scene-canvas" role="img" aria-label="Modelo tridimensional paramétrico do galpão, equipamentos avícolas e amostra visual do lote">
      <Canvas
        camera={{ position: [10, 8, 11], fov: 42 }}
        dpr={[1, 1.35]}
        frameloop="demand"
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        fallback={<div className="scene-fallback">A visualização 3D não está disponível neste navegador. Os cálculos e parâmetros continuam disponíveis.</div>}
      >
        <color attach="background" args={['#e8eee8']} />
        <ambientLight intensity={1.05} />
        <directionalLight position={[7, 10, 5]} intensity={1.65} />
        <House {...props} scale={sceneScale} />
        <Grid
          args={[24, 24]}
          cellSize={1}
          cellThickness={0.45}
          sectionSize={5}
          sectionThickness={0.9}
          fadeDistance={30}
          infiniteGrid
          position={[0, -0.12 * sceneScale - 0.001, 0]}
        />
        <OrbitControls makeDefault minDistance={5} maxDistance={30} maxPolarAngle={Math.PI / 2.05} />
      </Canvas>
    </div>
  );
}
