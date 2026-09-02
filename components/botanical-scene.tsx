"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Float, OrbitControls, Sparkles } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function createLeafGeometry(length = 1.8, width = 1.05, curl = 0.22) {
  const rows = 10;
  const cols = 5;
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let row = 0; row <= rows; row += 1) {
    const t = row / rows;
    const y = t * length - length / 2;
    const taper = Math.sin(Math.PI * t) ** 0.72;
    const centerLift = Math.sin(t * Math.PI) * curl;

    for (let col = 0; col <= cols; col += 1) {
      const u = col / cols;
      const x = (u - 0.5) * width * taper;
      const z = centerLift + Math.sin(u * Math.PI) * Math.sin(t * Math.PI) * curl * 0.55;
      positions.push(x, y, z);
      normals.push(0, 1, 0);
      uvs.push(u, t);
    }
  }

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const a = row * (cols + 1) + col;
      const b = a + 1;
      const c = a + cols + 1;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function RealisticLeaf({ position, rotation, scale = 1, color, phase = 0 }: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale?: number;
  color: string;
  phase?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const geometry = useMemo(() => createLeafGeometry(1.85, 1.25, 0.22), []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.z = rotation[2] + Math.sin(state.clock.elapsedTime * 0.7 + phase) * 0.045;
    ref.current.rotation.y = rotation[1] + Math.sin(state.clock.elapsedTime * 0.42 + phase) * 0.025;
  });

  return (
    <mesh ref={ref} geometry={geometry} position={position} rotation={rotation} scale={scale} castShadow receiveShadow>
      <meshPhysicalMaterial
        color={color}
        roughness={0.74}
        metalness={0}
        clearcoat={0.05}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function Vein({ position, rotation, scale = 1 }: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale?: number;
}) {
  return (
    <mesh position={position} rotation={rotation} scale={scale}>
      <capsuleGeometry args={[0.018, 0.8, 5, 8]} />
      <meshStandardMaterial color="#3f5936" roughness={1} />
    </mesh>
  );
}

function Stem() {
  return (
    <mesh position={[0, 0.1, 0]} castShadow>
      <cylinderGeometry args={[0.055, 0.095, 4.15, 20]} />
      <meshPhysicalMaterial color="#344b2f" roughness={0.88} />
    </mesh>
  );
}

function Pot() {
  return (
    <group position={[0, -2.18, 0]}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[1.2, 0.96, 1.42, 64]} />
        <meshPhysicalMaterial color="#c7c2b5" roughness={0.56} clearcoat={0.18} clearcoatRoughness={0.5} />
      </mesh>
      <mesh position={[0, 0.74, 0]} castShadow>
        <torusGeometry args={[1.06, 0.095, 14, 64]} />
        <meshPhysicalMaterial color="#d9d4c6" roughness={0.48} clearcoat={0.25} />
      </mesh>
      <mesh position={[0, 0.79, 0]}>
        <cylinderGeometry args={[0.92, 0.92, 0.07, 64]} />
        <meshStandardMaterial color="#514735" roughness={1} />
      </mesh>
      <mesh position={[0, 0.83, 0]}>
        <cylinderGeometry args={[0.72, 0.72, 0.025, 64]} />
        <meshStandardMaterial color="#30291f" roughness={1} />
      </mesh>
    </group>
  );
}

function Plant() {
  return (
    <Float speed={0.75} rotationIntensity={0.025} floatIntensity={0.13}>
      <group>
        <Stem />
        <RealisticLeaf position={[-0.86, 0.05, 0.02]} rotation={[0.1, -0.5, -0.55]} scale={1.05} color="#597b45" phase={0.2} />
        <RealisticLeaf position={[0.86, 0.34, 0.01]} rotation={[-0.06, 0.45, 0.5]} scale={1.08} color="#6e8f53" phase={1.1} />
        <RealisticLeaf position={[-0.76, 1.02, -0.01]} rotation={[0.12, -0.42, -0.7]} scale={0.94} color="#79945a" phase={2.0} />
        <RealisticLeaf position={[0.72, 1.42, 0.02]} rotation={[-0.08, 0.4, 0.58]} scale={0.98} color="#527544" phase={2.8} />
        <RealisticLeaf position={[0.08, 2.13, -0.02]} rotation={[0.1, 0.02, 0.08]} scale={1.08} color="#d6ed72" phase={3.6} />
        <RealisticLeaf position={[-0.22, 2.78, 0]} rotation={[0.12, -0.14, -0.38]} scale={0.84} color="#8aa765" phase={4.25} />
        <Vein position={[-0.8, 0.05, 0.22]} rotation={[Math.PI / 2, 0, -0.55]} scale={1.05} />
        <Vein position={[0.8, 0.35, 0.22]} rotation={[Math.PI / 2, 0, 0.48]} scale={1.02} />
        <Pot />
      </group>
    </Float>
  );
}

export default function BotanicalScene() {
  return (
    <div className="three-scene" aria-hidden="true">
      <Canvas
        dpr={[1, 1.7]}
        camera={{ position: [0, 0.12, 7.2], fov: 34 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        shadows
      >
        <color attach="background" args={["transparent"]} />
        <ambientLight intensity={1.7} />
        <hemisphereLight intensity={1.25} color="#eff5d8" groundColor="#182319" />
        <directionalLight position={[4, 6, 5]} intensity={4.5} castShadow shadow-mapSize={[1024, 1024]} />
        <directionalLight position={[-4, 2, 1]} intensity={1.2} color="#dff784" />
        <pointLight position={[0, 2.8, 2]} intensity={1.05} color="#ecfa9b" />
        <Plant />
        <Sparkles count={28} scale={[5.8, 5.3, 3.8]} size={1.15} speed={0.18} color="#e1f783" />
        <ContactShadows position={[0, -2.88, 0]} opacity={0.42} scale={5.5} blur={2.6} far={4.5} />
        <OrbitControls enablePan={false} enableZoom={false} enableDamping dampingFactor={0.08} autoRotate autoRotateSpeed={0.16} minPolarAngle={Math.PI * 0.44} maxPolarAngle={Math.PI * 0.58} />
      </Canvas>
    </div>
  );
}
