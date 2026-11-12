import { useGLTF } from '@react-three/drei';
import { Component, Suspense, useEffect, useLayoutEffect, useMemo, useRef, type ReactNode } from 'react';
import {
  InstancedMesh,
  Matrix4,
  Mesh,
  Quaternion,
  Vector3,
  type Material,
} from 'three';

const EXHAUST_FAN_MODEL_URL = 'https://www.renderahouse.com/downloads/free-3d-models/exhaust-fan/exhaust-fan.glb';

interface FanProps {
  count: number;
  length: number;
  width: number;
  wallHeight: number;
  scale: number;
}

class FanAssetBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function ImportedFans({ count, length, width, wallHeight, scale }: FanProps) {
  const { scene } = useGLTF(EXHAUST_FAN_MODEL_URL);
  const instanceRef = useRef<InstancedMesh>(null);
  const visibleCount = Math.min(12, Math.max(0, Math.floor(count)));

  const asset = useMemo(() => {
    scene.updateMatrixWorld(true);
    const candidate = scene.getObjectByProperty('isMesh', true);
    if (!(candidate instanceof Mesh)) {
      throw new Error('O modelo de ventilador não contém uma malha renderizável.');
    }
    const sourceMesh = candidate;

    const geometry = sourceMesh.geometry.clone();
    geometry.applyMatrix4(sourceMesh.matrixWorld);
    // The source asset is authored Z-up with its front facing -Y.
    geometry.rotateX(-Math.PI / 2);
    geometry.rotateY(Math.PI / 2);
    geometry.computeBoundingBox();
    const bounds = geometry.boundingBox;
    if (!bounds) throw new Error('Não foi possível calcular os limites do ventilador.');

    const faceSize = Math.max(bounds.max.y - bounds.min.y, bounds.max.z - bounds.min.z, 0.001);
    const normalization = 1.2 / faceSize;
    geometry.translate(
      -((bounds.min.x + bounds.max.x) / 2),
      -((bounds.min.y + bounds.max.y) / 2),
      -((bounds.min.z + bounds.max.z) / 2),
    );
    geometry.scale(normalization, normalization, normalization);
    geometry.computeVertexNormals();

    return { geometry, material: sourceMesh.material as Material | Material[] };
  }, [scene]);

  useEffect(() => () => asset.geometry.dispose(), [asset.geometry]);

  useLayoutEffect(() => {
    const mesh = instanceRef.current;
    if (!mesh || visibleCount === 0) return;
    const matrix = new Matrix4();
    const position = new Vector3();
    const rotation = new Quaternion();
    const size = new Vector3(scale, scale, scale);

    for (let index = 0; index < visibleCount; index += 1) {
      const z = -width / 2 + ((index + 1) * width) / (visibleCount + 1);
      position.set(length / 2 - 0.015 * scale, wallHeight * 0.52, z);
      matrix.compose(position, rotation, size);
      mesh.setMatrixAt(index, matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [length, scale, visibleCount, wallHeight, width]);

  if (visibleCount === 0) return null;

  return <instancedMesh ref={instanceRef} args={[asset.geometry, asset.material, visibleCount]} />;
}

function ProceduralFans({ count, length, width, wallHeight, scale }: FanProps) {
  const visibleCount = Math.min(12, Math.max(0, Math.floor(count)));
  const positions = Array.from({ length: visibleCount }, (_, index) =>
    -width / 2 + ((index + 1) * width) / (visibleCount + 1),
  );

  return (
    <group>
      {positions.map((z, index) => (
        <group key={`fallback-fan-${index}`} position={[length / 2 - 0.02 * scale, wallHeight * 0.52, z]} rotation={[0, 0, Math.PI / 2]}>
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

export function FarmFanInstances(props: FanProps) {
  if (props.count <= 0) return null;

  return (
    <FanAssetBoundary fallback={<ProceduralFans {...props} />}>
      <Suspense fallback={<ProceduralFans {...props} />}>
        <ImportedFans {...props} />
      </Suspense>
    </FanAssetBoundary>
  );
}
