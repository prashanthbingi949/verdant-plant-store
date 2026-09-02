"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Float, OrbitControls, Sparkles } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function Leaf({ position, rotation, scale = 1, color }: { position: [number, number, number]; rotation: [number, number, number]; scale?: number; color: string }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.z = rotation[2] + Math.sin(state.clock.elapsedTime * 0.8 + position[1]) * 0.035;
  });

  return (
    <mesh ref={ref} position={position} rotation={rotation} scale={scale} castShadow>
      <sphereGeometry args={[0.78, 24, 16]} />
      <meshStandardMaterial color={color} roughness={0.76} metalness={0.02} />
    </mesh>
  );
}

function Stem() {
  return (
    <mesh position={[0, 0.18, 0]} castShadow>
      <cylinderGeometry args={[0.075, 0.1, 3.8, 16]} />
      <meshStandardMaterial color="#354b31" roughness={0.9} />
    </mesh>
  );
}

function Pot() {
  return (
    <group position={[0, -2.05, 0]}>
      <mesh castShadow>
        <cylinderGeometry args={[1.18, 0.92, 1.32, 40]} />
        <meshStandardMaterial color="#bcb7a8" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.67, 0]} castShadow>
        <cylinderGeometry args={[1.12, 1.12, 0.12, 40]} />
        <meshStandardMaterial color="#9d987f" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.75, 0]}>
        <cylinderGeometry args={[0.93, 0.93, 0.05, 40]} />
        <meshStandardMaterial color="#4c432f" roughness={1} />
      </mesh>
    </group>
  );
}

function Plant() {
  return (
    <Float speed={1.15} rotationIntensity={0.04} floatIntensity={0.2}>
      <group>
        <Stem />
        <Leaf position={[-0.78, 0.1, 0]} rotation={[0.15, -0.45, -0.55]} scale={1.05} color="#668a4d" />
        <Leaf position={[0.78, 0.42, 0.02]} rotation={[-0.1, 0.4, 0.46]} scale={1.12} color="#78995a" />
        <Leaf position={[-0.7, 1.12, 0]} rotation={[0.2, -0.5, -0.7]} scale={0.94} color="#829d61" />
        <Leaf position={[0.68, 1.52, -0.01]} rotation={[-0.12, 0.45, 0.5]} scale={1.02} color="#5e824b" />
        <Leaf position={[0.06, 2.15, 0]} rotation={[0.08, 0.06, 0.05]} scale={1.12} color="#d7f275" />
        <Leaf position={[-0.28, 2.82, -0.02]} rotation={[0.18, -0.12, -0.42]} scale={0.87} color="#89a963" />
        <Pot />
      </group>
    </Float>
  );
}

export default function BotanicalScene() {
  return (
    <div className="three-scene" aria-hidden="true">
      <Canvas
        dpr={[1, 1.6]}
        camera={{ position: [0, 0.2, 7.4], fov: 37 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={1.5} />
        <directionalLight position={[3.5, 5, 4]} intensity={3.2} />
        <pointLight position={[-3, 2, 2]} intensity={1.1} color="#ddf27a" />
        <Plant />
        <Sparkles count={34} scale={[5.5, 5.5, 3.8]} size={1.5} speed={0.23} color="#ddf27a" />
        <ContactShadows position={[0, -2.7, 0]} opacity={0.36} scale={5.8} blur={2.8} far={4} />
        <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.35} minPolarAngle={Math.PI * 0.42} maxPolarAngle={Math.PI * 0.6} />
      </Canvas>
    </div>
  );
}
