import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

const BRONZE = '#cd7f32';
const GOLD = '#d4a017';
const DARK_GOLD = '#8b6914';
const AGED_BRONZE = '#6d4c2a';
const WARM_WHITE = '#f5e6c8';

interface MaterialProps {
  color: string;
  metalness?: number;
  roughness?: number;
  emissive?: string;
  emissiveIntensity?: number;
}

function MetalMaterial({ color, metalness = 0.85, roughness = 0.25, emissive, emissiveIntensity = 0.05 }: MaterialProps) {
  return (
    <meshStandardMaterial
      color={color}
      metalness={metalness}
      roughness={roughness}
      emissive={emissive || color}
      emissiveIntensity={emissiveIntensity}
    />
  );
}

function DecorativeSpheres({ radius, count, size, color }: { radius: number; count: number; size: number; color: string }) {
  const spheres = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const angle = (i / count) * Math.PI * 2;
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        key: i,
      };
    });
  }, [radius, count]);

  return (
    <>
      {spheres.map(({ x, y, key }) => (
        <mesh key={key} position={[x, y, 0]}>
          <sphereGeometry args={[size, 8, 8]} />
          <MetalMaterial color={color} metalness={0.9} roughness={0.2} />
        </mesh>
      ))}
    </>
  );
}

function DecorativeNotches({ radius, count, color }: { radius: number; count: number; color: string }) {
  const notches = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const angle = (i / count) * Math.PI * 2;
      return { angle, key: i };
    });
  }, [radius, count]);

  return (
    <>
      {notches.map(({ angle, key }) => (
        <mesh key={key} position={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0]} rotation={[0, 0, angle]}>
          <boxGeometry args={[0.015, 0.06, 0.025]} />
          <MetalMaterial color={color} metalness={0.95} roughness={0.15} />
        </mesh>
      ))}
    </>
  );
}

function CompassNeedle() {
  return (
    <group>
      <mesh position={[0, 0.28, 0.02]}>
        <coneGeometry args={[0.04, 0.35, 6]} />
        <meshStandardMaterial color="#cc2200" metalness={0.7} roughness={0.3} emissive="#880000" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, -0.21, 0.02]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.035, 0.28, 6]} />
        <MetalMaterial color={AGED_BRONZE} metalness={0.8} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0, 0.025]}>
        <cylinderGeometry args={[0.045, 0.045, 0.04, 12]} />
        <MetalMaterial color={GOLD} metalness={0.95} roughness={0.1} />
      </mesh>
    </group>
  );
}

function CompassRose() {
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const count = 8;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
      const isCardinal = i % 2 === 0;
      const outerR = isCardinal ? 0.55 : 0.38;
      const innerR = 0.1;
      const prevAngle = ((i - 0.5) / count) * Math.PI * 2 - Math.PI / 2;
      const nextAngle = ((i + 0.5) / count) * Math.PI * 2 - Math.PI / 2;
      pts.push(
        new THREE.Vector3(Math.cos(prevAngle) * innerR, Math.sin(prevAngle) * innerR, 0),
        new THREE.Vector3(Math.cos(angle) * outerR, Math.sin(angle) * outerR, 0),
        new THREE.Vector3(Math.cos(nextAngle) * innerR, Math.sin(nextAngle) * innerR, 0),
      );
    }
    return pts;
  }, []);

  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    const count = 8;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
      const isCardinal = i % 2 === 0;
      const outerR = isCardinal ? 0.55 : 0.38;
      const innerR = 0.1;
      const prevAngle = ((i - 0.5) / count) * Math.PI * 2 - Math.PI / 2;
      const nextAngle = ((i + 0.5) / count) * Math.PI * 2 - Math.PI / 2;

      if (i === 0) {
        shape.moveTo(Math.cos(prevAngle) * innerR, Math.sin(prevAngle) * innerR);
      } else {
        shape.lineTo(Math.cos(prevAngle) * innerR, Math.sin(prevAngle) * innerR);
      }
      shape.lineTo(Math.cos(angle) * outerR, Math.sin(angle) * outerR);
      shape.lineTo(Math.cos(nextAngle) * innerR, Math.sin(nextAngle) * innerR);
    }
    shape.closePath();
    return new THREE.ShapeGeometry(shape);
  }, []);

  return (
    <group position={[0, 0, 0.005]}>
      <mesh geometry={geometry}>
        <meshStandardMaterial color={DARK_GOLD} metalness={0.7} roughness={0.4} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function DirectionalMarkers() {
  const markers = [
    { label: 'V', position: [0, 0.82, 0.06] as [number, number, number], color: '#ff6644' },
    { label: 'J', position: [0, -0.82, 0.06] as [number, number, number], color: WARM_WHITE },
    { label: 'P', position: [-0.82, 0, 0.06] as [number, number, number], color: WARM_WHITE },
    { label: 'L', position: [0.82, 0, 0.06] as [number, number, number], color: WARM_WHITE },
  ];

  return (
    <>
      {markers.map(({ label, position, color }) => (
        <Html key={label} position={position} center transform occlude={false}>
          <div
            style={{
              color,
              fontSize: '13px',
              fontFamily: "'Space Mono', monospace",
              fontWeight: 700,
              letterSpacing: '0.05em',
              userSelect: 'none',
              pointerEvents: 'none',
              textShadow: `0 0 8px ${color}88`,
            }}
          >
            {label}
          </div>
        </Html>
      ))}
    </>
  );
}

function BusulaLabel() {
  return (
    <Html position={[0, 0, 0.06]} center transform occlude={false}>
      <div
        style={{
          color: GOLD,
          fontSize: '7px',
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          letterSpacing: '0.35em',
          userSelect: 'none',
          pointerEvents: 'none',
          textTransform: 'uppercase',
          opacity: 0.85,
          marginTop: '38px',
          textShadow: `0 0 6px ${GOLD}66`,
        }}
      >
        BUSULLA
      </div>
    </Html>
  );
}

function TickMarks({ radius, count, color }: { radius: number; count: number; color: string }) {
  const ticks = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const isCardinal = i % (count / 4) === 0;
      const length = isCardinal ? 0.09 : 0.045;
      const innerR = radius - length / 2;
      const outerR = radius + length / 2;
      return { angle, innerR, outerR, isCardinal, key: i };
    });
  }, [radius, count]);

  return (
    <>
      {ticks.map(({ angle, innerR, outerR, isCardinal, key }) => (
        <mesh
          key={key}
          position={[
            Math.cos(angle) * (innerR + outerR) / 2,
            Math.sin(angle) * (innerR + outerR) / 2,
            0.01,
          ]}
          rotation={[0, 0, angle + Math.PI / 2]}
        >
          <boxGeometry args={[isCardinal ? 0.02 : 0.012, outerR - innerR, 0.015]} />
          <MetalMaterial color={isCardinal ? GOLD : color} metalness={0.8} roughness={0.3} emissiveIntensity={isCardinal ? 0.1 : 0.02} />
        </mesh>
      ))}
    </>
  );
}

interface CompassGroupProps {
  isSpinning: boolean;
  rotationSpeed: number;
}

function CompassGroup({ isSpinning, rotationSpeed }: CompassGroupProps) {
  const outerGroupRef = useRef<THREE.Group>(null);
  const needleRef = useRef<THREE.Group>(null);
  const innerRingRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (outerGroupRef.current) {
      const speed = isSpinning ? rotationSpeed * 3.5 : rotationSpeed * 0.4;
      outerGroupRef.current.rotation.z -= delta * speed;
    }
    if (innerRingRef.current) {
      const speed = isSpinning ? rotationSpeed * 2.0 : rotationSpeed * 0.15;
      innerRingRef.current.rotation.z += delta * speed;
    }
    if (needleRef.current && !isSpinning) {
      needleRef.current.rotation.z += Math.sin(Date.now() * 0.001) * 0.002;
    }
  });

  return (
    <group>
      <group ref={outerGroupRef}>
        <mesh>
          <torusGeometry args={[1.0, 0.055, 16, 80]} />
          <MetalMaterial color={BRONZE} metalness={0.88} roughness={0.22} emissiveIntensity={0.04} />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <torusGeometry args={[0.95, 0.025, 12, 80]} />
          <MetalMaterial color={DARK_GOLD} metalness={0.9} roughness={0.18} />
        </mesh>
        <mesh>
          <torusGeometry args={[1.06, 0.03, 12, 80]} />
          <MetalMaterial color={AGED_BRONZE} metalness={0.82} roughness={0.3} />
        </mesh>
        <DecorativeSpheres radius={1.0} count={32} size={0.022} color={GOLD} />
        <DecorativeSpheres radius={1.0} count={8} size={0.04} color={BRONZE} />
        <TickMarks radius={0.88} count={72} color={AGED_BRONZE} />
      </group>

      <group ref={innerRingRef}>
        <mesh>
          <torusGeometry args={[0.72, 0.04, 14, 64]} />
          <MetalMaterial color={BRONZE} metalness={0.85} roughness={0.28} />
        </mesh>
        <mesh>
          <torusGeometry args={[0.68, 0.018, 10, 64]} />
          <MetalMaterial color={GOLD} metalness={0.92} roughness={0.16} />
        </mesh>
        <DecorativeNotches radius={0.72} count={24} color={GOLD} />
      </group>

      <mesh>
        <circleGeometry args={[0.62, 64]} />
        <meshStandardMaterial
          color="#0a0804"
          metalness={0.3}
          roughness={0.8}
          transparent
          opacity={0.95}
        />
      </mesh>
      <mesh position={[0, 0, -0.01]}>
        <circleGeometry args={[0.98, 64]} />
        <meshStandardMaterial
          color="#0d0a06"
          metalness={0.2}
          roughness={0.9}
          transparent
          opacity={0.85}
        />
      </mesh>

      <CompassRose />
      <DirectionalMarkers />
      <BusulaLabel />

      <group ref={needleRef}>
        <CompassNeedle />
      </group>

      <mesh position={[0, 0, 0.04]}>
        <cylinderGeometry args={[0.055, 0.055, 0.05, 20]} />
        <MetalMaterial color={GOLD} metalness={0.95} roughness={0.1} emissiveIntensity={0.12} />
      </mesh>
      <mesh position={[0, 0, 0.06]}>
        <sphereGeometry args={[0.03, 12, 12]} />
        <MetalMaterial color={WARM_WHITE} metalness={0.9} roughness={0.12} emissiveIntensity={0.2} />
      </mesh>

      <mesh position={[0, 0, -0.02]}>
        <torusGeometry args={[0.78, 0.025, 10, 64]} />
        <MetalMaterial color={AGED_BRONZE} metalness={0.8} roughness={0.35} />
      </mesh>
    </group>
  );
}

interface CompassProps {
  isSpinning?: boolean;
  rotationSpeed?: number;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_MAP = {
  sm: { width: 180, height: 180, camera: 2.2 },
  md: { width: 280, height: 280, camera: 2.2 },
  lg: { width: 420, height: 420, camera: 2.2 },
};

const Compass: React.FC<CompassProps> = ({ isSpinning = false, rotationSpeed = 1, size = 'md' }) => {
  const dims = SIZE_MAP[size];

  return (
    <div style={{ width: dims.width, height: dims.height }}>
      <Canvas
        camera={{ position: [0, 0, dims.camera], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.35} color="#fff8e7" />
        <pointLight position={[3, 3, 4]} intensity={2.5} color="#ffd580" castShadow={false} />
        <pointLight position={[-3, -2, 3]} intensity={1.2} color="#c87941" />
        <pointLight position={[0, 0, 5]} intensity={0.8} color="#ffffff" />
        <directionalLight position={[2, 4, 3]} intensity={1.0} color="#ffe4b5" />
        <CompassGroup isSpinning={isSpinning} rotationSpeed={rotationSpeed} />
      </Canvas>
    </div>
  );
};

export default Compass;
