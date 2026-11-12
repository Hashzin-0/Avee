import { Canvas, useThree } from '@react-three/fiber';
import { Grid, OrbitControls, useGLTF } from '@react-three/drei';
import { Component, Suspense, useEffect, useLayoutEffect, useMemo, useRef, type ReactNode } from 'react';
import {
  BoxGeometry,
  CylinderGeometry,
  InstancedMesh,
  Matrix4,
  Mesh,
  Quaternion,
  SphereGeometry,
  Vector3,
  type Material,
} from 'three';
import { getBirdGridPosition, getVisibleBirdCount } from './scene-layout';

const CHICKEN_MODEL_URL = 'https://grab3d.com/dl/low-poly-chicken/low-poly-chicken.glb';

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

interface BoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

class AssetErrorBoundary extends Component<BoundaryProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function ChickenInstances({ count, length, width, scale }: {
  count: number;
  length: number;
  width: number;
  scale: number;
}) {
  const { scene } = useGLTF(CHICKEN_MODEL_URL);
  const instanceRef = useRef<InstancedMesh>(null);
  const compactViewport = useThree((state) => state.size.width < 640);
  const visibleCount = getVisibleBirdCount(count, compactViewport);

  const asset = useMemo(() => {
    scene.updateMatrixWorld(true);
    let sourceMesh: Mesh | null = null;
    scene.traverse((object) => {
      if (!sourceMesh && (object as Mesh).isMesh) sourceMesh = object as Mesh;
    });
    if (!sourceMesh) throw new Error('O modelo de galinha não contém uma malha renderizável.');

    const geometry = sourceMesh.geometry.clone();
    geometry.applyMatrix4(sourceMesh.matrixWorld);
    geometry.computeBoundingBox();
    const bounds = geometry.boundingBox;
    if (!bounds) throw new Error('Não foi possível calcular os limites do modelo de galinha.');

    const height = Math.max(bounds.max.y - bounds.min.y, 0.001);
    const normalization = 0.43 / height;
    geometry.translate(
      -((bounds.min.x + bounds.max.x) / 2),
      -bounds.min.y,
      -((bounds.min.z + bounds.max.z) / 2),
    );
    geometry.scale(normalization, normalization, normalization);
    geometry.computeVertexNormals();

    return { geometry, material: sourceMesh.material as Material | Material[] };
  }, [scene]);

  useEffect(() => () => asset.geometry.dispose(), [asset.geometry]);

  useLayoutEffect(() => {
    const mesh = instanceRef.current;
    if (!mesh) return;

    const matrix = new Matrix4();
    const position = new Vector3();
    const rotation = new Quaternion();
    const birdScale = new Vector3();
    const up = new Vector3(0, 1, 0);

    for (let index = 0; index < visibleCount; index += 1) {
      const placement = getBirdGridPosition(index, visibleCount, length, width);
      position.set(placement.x, 0.012 * scale, placement.z);
      rotation.setFromAxisAngle(up, placement.yaw);
      const size = scale * placement.scale;
      birdScale.set(size, size, size);
      matrix.compose(position, rotation, birdScale);
      mesh.setMatrixAt(index, matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [length, scale, visibleCount, width]);

  if (visibleCount === 0) return null;

  return (
    <instancedMesh
      ref={instanceRef}
      args={[asset.geometry, asset.material, visibleCount]}
      castShadow={false}
      receiveShadow={false}
      frustumCulled
    />
  );
}

function ProceduralFlock({ count, length, width, scale }: {
  count: number;
  length: number;
  width: number;
  scale: number;
}) {
  const compactViewport = useThree((state) => state.size.width < 640);
  const visibleCount = getVisibleBirdCount(count, compactViewport);
  const bodyRef = useRef<InstancedMesh>(null);
  const headRef = useRef<InstancedMesh>(null);
  const combRef = useRef<InstancedMesh>(null);

  const geometries = useMemo(() => ({
    body: new SphereGeometry(1, 12, 8).scale(0.21, 0.135, 0.13),
    head: new SphereGeometry(1, 10, 7).scale(0.075, 0.075, 0.07),
    comb: new SphereGeometry(1, 7, 5).scale(0.025, 0.055, 0.025),
  }), []);

  useEffect(() => () => {
    geometries.body.dispose();
    geometries.head.dispose();
    geometries.comb.dispose();
  }, [geometries]);

  useLayoutEffect(() => {
    const matrix = new Matrix4();
    const position = new Vector3();
    const rotation = new Quaternion();
    const size = new Vector3();
    const up = new Vector3(0, 1, 0);
    const meshes = [bodyRef.current, headRef.current, combRef.current];
    if (meshes.some((mesh) => !mesh)) return;

    for (let index = 0; index < visibleCount; index += 1) {
      const placement = getBirdGridPosition(index, visibleCount, length, width);
      const yaw = placement.yaw;
      const birdScale = scale * placement.scale;
      rotation.setFromAxisAngle(up, yaw);

      position.set(placement.x, 0.16 * birdScale, placement.z);
      size.set(birdScale, birdScale, birdScale);
      matrix.compose(position, rotation, size);
      bodyRef.current!.setMatrixAt(index, matrix);

      position.set(placement.x + Math.cos(yaw) * 0.15 * birdScale, 0.29 * birdScale, placement.z - Math.sin(yaw) * 0.15 * birdScale);
      matrix.compose(position, rotation, size);
      headRef.current!.setMatrixAt(index, matrix);

      position.set(placement.x + Math.cos(yaw) * 0.15 * birdScale, 0.355 * birdScale, placement.z - Math.sin(yaw) * 0.15 * birdScale);
      matrix.compose(position, rotation, size);
      combRef.current!.setMatrixAt(index, matrix);
    }

    meshes.forEach((mesh) => {
      mesh!.instanceMatrix.needsUpdate = true;
      mesh!.computeBoundingSphere();
    });
  }, [length, scale, visibleCount, width]);

  if (visibleCount === 0) return null;

  return (
    <group>
      <instancedMesh ref={bodyRef} args={[geometries.body, undefined, visibleCount]}>
        <meshStandardMaterial color="#9d542b" roughness={0.88} />
      </instancedMesh>
      <instancedMesh ref={headRef} args={[geometries.head, undefined, visibleCount]}>
        <meshStandardMaterial color="#b66a32" roughness={0.82} />
      </instancedMesh>
      <instancedMesh ref={combRef} args={[geometries.comb, undefined, visibleCount]}>
        <meshStandardMaterial color="#b72e2e" roughness={0.72} />
      </instancedMesh>
    </group>
  );
}

function DrinkerNipples({ count, rows, length, width, scale }: {
  count: number;
  rows: number[];
  length: number;
  width: number;
  scale: number;
}) {
  const instanceRef = useRef<InstancedMesh>(null);
  const visibleCount = Math.min(Math.max(0, Math.floor(count)), 300);
  const geometry = useMemo(() => new CylinderGeometry(0.018, 0.025, 0.11, 7), []);
  const material = useMemo(() => ({ color: '#c3a65f', metalness: 0.42, roughness: 0.48 }), []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useLayoutEffect(() => {
    const mesh = instanceRef.current;
    if (!mesh || visibleCount === 0 || rows.length === 0) return;
    const matrix = new Matrix4();
    const position = new Vector3();
    const rotation = new Quaternion();
    const size = new Vector3(scale, scale, scale);
    const stride = Math.ceil(visibleCount / rows.length);

    for (let index = 0; index < visibleCount; index += 1) {
      const rowIndex = Math.min(rows.length - 1, Math.floor(index / stride));
      const rowItem = index % stride;
      const rowCount = Math.min(stride, visibleCount - rowIndex * stride);
      const x = -length * 0.42 + ((rowItem + 0.5) / Math.max(rowCount, 1)) * length * 0.84;
      position.set(x, 0.72 * scale, rows[rowIndex] + 0.035 * scale);
      rotation.setFromAxisAngle(new Vector3(0, 0, 1), Math.PI);
      matrix.compose(position, rotation, size);
      mesh.setMatrixAt(index, matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [length, rows, scale, visibleCount]);

  if (visibleCount === 0) return null;

  return (
    <instancedMesh ref={instanceRef} args={[geometry, undefined, visibleCount]} material={undefined}>
      <meshStandardMaterial {...material} />
    </instancedMesh>
  );
}

function House({ length, width, sideHeight, ridgeHeight, rows, fans, birds, nipples, scale }: HouseProps) {
  const safeRows = Math.min(12, Math.max(1, Math.floor(rows)));
  const safeFans = Math.min(12, Math.max(0, Math.floor(fans ?? 0)));
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
  const rowPositions = Array.from({ length: safeRows }, (_, index) =>
    -safeWidth / 2 + ((index + 1) * safeWidth) / (safeRows + 1),
  );
  const supportCount = Math.min(32, Math.max(4, Math.ceil(safeLength / (2.8 * scale))));
  const fanPositions = Array.from({ length: safeFans }, (_, index) =>
    -safeWidth / 2 + ((index + 1) * safeWidth) / (safeFans + 1),
  );

  return (
    <group>
      <mesh position={[0, -floorThickness / 2, 0]} receiveShadow>
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

      {rowPositions.map((z, index) => (
        <group key={`row-${index}`} position={[0, 0, z]}>
          <mesh position={[0, 0.31 * scale, 0]}>
            <boxGeometry args={[safeLength * 0.88, 0.58 * scale, Math.max(0.2 * scale, safeWidth * 0.025)]} />
            <meshStandardMaterial color="#77877b" metalness={0.35} roughness={0.68} />
          </mesh>
          <mesh position={[0, 0.64 * scale, 0]}>
            <boxGeometry args={[safeLength * 0.9, 0.065 * scale, 0.1 * scale]} />
            <meshStandardMaterial color="#b8a16d" metalness={0.28} roughness={0.55} />
          </mesh>
          <mesh position={[0, 0.76 * scale, 0.12 * scale]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.035 * scale, 0.035 * scale, safeLength * 0.9, 10]} />
            <meshStandardMaterial color="#8bb6bd" metalness={0.5} roughness={0.32} />
          </mesh>
          <mesh position={[0, 0.64 * scale, -0.12 * scale]}>
            <boxGeometry args={[safeLength * 0.9, 0.08 * scale, 0.16 * scale]} />
            <meshStandardMaterial color="#b9bfc0" metalness={0.58} roughness={0.42} />
          </mesh>
        </group>
      ))}

      <DrinkerNipples count={nipples ?? 0} rows={rowPositions} length={safeLength} width={safeWidth} scale={scale} />

      {fanPositions.map((z, index) => (
        <group key={`fan-${index}`} position={[safeLength / 2 - 0.02 * scale, wallHeight * 0.52, z]} rotation={[0, 0, Math.PI / 2]}>
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

      <AssetErrorBoundary fallback={<ProceduralFlock count={birds ?? 0} length={safeLength * 0.9} width={safeWidth * 0.88} scale={scale} />}>
        <Suspense fallback={null}>
          <ChickenInstances count={birds ?? 0} length={safeLength * 0.9} width={safeWidth * 0.88} scale={scale} />
        </Suspense>
      </AssetErrorBoundary>

      <mesh position={[0, roofCenterY, roofCenterZ]} rotation={[roofAngle, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[safeLength + 0.6 * scale, 0.1 * scale, roofSlopeLength]} />
        <meshStandardMaterial color="#657d68" roughness={0.78} />
      </mesh>
      <mesh position={[0, roofCenterY, -roofCenterZ]} rotation={[-roofAngle, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[safeLength + 0.6 * scale, 0.1 * scale, roofSlopeLength]} />
        <meshStandardMaterial color="#718b73" roughness={0.78} />
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
        <Suspense fallback={null}>
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
        </Suspense>
        <OrbitControls makeDefault minDistance={5} maxDistance={30} maxPolarAngle={Math.PI / 2.05} />
      </Canvas>
    </div>
  );
}
