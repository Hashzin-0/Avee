import { useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Component, Suspense, useEffect, useLayoutEffect, useMemo, useRef, type ReactNode } from 'react';
import {
  InstancedMesh,
  Matrix4,
  MeshStandardMaterial,
  Quaternion,
  SphereGeometry,
  Vector3,
  Mesh,
  type Material,
} from 'three';
import { getBirdGridPosition, getVisibleBirdCount } from './scene-layout';

const CHICKEN_MODEL_URL = 'https://grab3d.com/dl/low-poly-chicken/low-poly-chicken.glb';

interface FlockProps {
  count: number;
  length: number;
  width: number;
  scale: number;
}

class AssetErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function ChickenInstances({ count, length, width, scale }: FlockProps) {
  const { scene } = useGLTF(CHICKEN_MODEL_URL);
  const instanceRef = useRef<InstancedMesh>(null);
  const compactViewport = useThree((state) => state.size.width < 640);
  const visibleCount = getVisibleBirdCount(count, compactViewport);

  const asset = useMemo(() => {
    scene.updateMatrixWorld(true);
    const candidate = scene.getObjectByProperty('isMesh', true);
    if (!(candidate instanceof Mesh)) {
      throw new Error('O modelo de galinha não contém uma malha renderizável.');
    }
    const sourceMesh = candidate;

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

function ProceduralFlock({ count, length, width, scale }: FlockProps) {
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
  const materials = useMemo(() => ({
    body: new MeshStandardMaterial({ color: '#9d542b', roughness: 0.88 }),
    head: new MeshStandardMaterial({ color: '#b66a32', roughness: 0.82 }),
    comb: new MeshStandardMaterial({ color: '#b72e2e', roughness: 0.72 }),
  }), []);

  useEffect(() => () => {
    geometries.body.dispose();
    geometries.head.dispose();
    geometries.comb.dispose();
    materials.body.dispose();
    materials.head.dispose();
    materials.comb.dispose();
  }, [geometries, materials]);

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
      <instancedMesh ref={bodyRef} args={[geometries.body, materials.body, visibleCount]} />
      <instancedMesh ref={headRef} args={[geometries.head, materials.head, visibleCount]} />
      <instancedMesh ref={combRef} args={[geometries.comb, materials.comb, visibleCount]} />
    </group>
  );
}

export function FlockInstances(props: FlockProps) {
  if (props.count <= 0) return null;

  return (
    <AssetErrorBoundary fallback={<ProceduralFlock {...props} />}>
      <Suspense fallback={null}>
        <ChickenInstances {...props} />
      </Suspense>
    </AssetErrorBoundary>
  );
}
