import { useRef, useMemo, useState, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Float } from "@react-three/drei";
import * as THREE from "three";

const ROWS: string[][] = [
  ["ESC", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="],
  ["TAB", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]"],
  ["CAPS", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'", "↵"],
  ["SHIFT", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "↑", "FN"],
  ["CTRL", "ALT", "CMD", "______SPACE______", "CMD", "ALT", "←", "↓", "→"],
];

// RGB rainbow color per key based on position
function rgbColor(i: number, total: number, time: number) {
  const hue = ((i / total) * 360 + time * 40) % 360;
  return new THREE.Color(`hsl(${hue}, 100%, 60%)`);
}

interface KeyCapProps {
  position: [number, number, number];
  width?: number;
  label: string;
  index: number;
  total: number;
  pressed: boolean;
  rgbOn: boolean;
}

function KeyCap({ position, width = 1, label, index, total, pressed, rgbOn }: KeyCapProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [localPress, setLocalPress] = useState(false);

  useFrame((state) => {
    if (!meshRef.current) return;
    const targetY = (pressed || localPress) ? -0.18 : hovered ? 0.05 : 0;
    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 0.25);

    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      const c = rgbOn ? rgbColor(index, total, state.clock.elapsedTime) : new THREE.Color("#1a1530");
      mat.color.lerp(c, 0.1);
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, rgbOn ? 0.9 : 0.0, 0.1);
    }
  });

  return (
    <group position={position}>
      {/* RGB underglow */}
      <mesh ref={glowRef} position={[0, -0.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width * 1.15, 1.15]} />
        <meshBasicMaterial color="#000" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* Keycap */}
      <mesh
        ref={meshRef}
        castShadow
        receiveShadow
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = "auto"; }}
        onPointerDown={(e) => {
          e.stopPropagation();
          setLocalPress(true);
          // typing sound
          try {
            const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.frequency.value = 600 + Math.random() * 400;
            osc.type = "triangle";
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
            osc.connect(gain).connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.1);
          } catch { /* noop */ }
        }}
        onPointerUp={() => setLocalPress(false)}
      >
        <boxGeometry args={[width * 0.95, 0.32, 0.95]} />
        <meshPhysicalMaterial
          color={hovered ? "#2a2440" : "#16131f"}
          roughness={0.55}
          metalness={0.1}
          clearcoat={0.4}
          clearcoatRoughness={0.6}
          emissive={rgbOn ? rgbColor(index, total, performance.now() / 1000) : new THREE.Color("#000")}
          emissiveIntensity={rgbOn ? 0.18 : 0}
        />
      </mesh>

      {/* Legend */}
      <mesh position={[0, 0.17, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width * 0.9, 0.9]} />
        <meshBasicMaterial transparent map={useLegendTexture(label)} depthWrite={false} />
      </mesh>
    </group>
  );
}

// Cache canvas textures for legends
const legendCache = new Map<string, THREE.CanvasTexture>();
function useLegendTexture(label: string): THREE.CanvasTexture {
  return useMemo(() => {
    if (legendCache.has(label)) return legendCache.get(label)!;
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "rgba(0,0,0,0)";
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = "#e8e6f5";
    ctx.font = `${label.length > 2 ? 26 : 56}px 'Space Grotesk', sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(180,140,255,0.6)";
    ctx.shadowBlur = 6;
    ctx.fillText(label === "______SPACE______" ? "" : label, 64, 70);
    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 8;
    legendCache.set(label, tex);
    return tex;
  }, [label]);
}

function KeyboardModel() {
  const groupRef = useRef<THREE.Group>(null);
  const [allPressed, setAllPressed] = useState(false);
  const [rgbOn, setRgbOn] = useState(false);
  const { mouse } = useThree();

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    // Slow rotation + parallax to mouse
    const targetRotY = mouse.x * 0.3 + state.clock.elapsedTime * 0.08;
    const targetRotX = -mouse.y * 0.15 + 0.35;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.05);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.05);
  });

  // Build key positions
  const keyData = useMemo(() => {
    const keys: { pos: [number, number, number]; w: number; label: string; idx: number }[] = [];
    const keyGap = 0.05;
    const baseKey = 1;
    let idx = 0;

    ROWS.forEach((row, rIdx) => {
      let xCursor = 0;
      // compute total row width to center
      const widths = row.map((k) => {
        if (k === "______SPACE______") return baseKey * 6;
        if (["TAB", "CAPS", "SHIFT", "CTRL", "ALT", "CMD", "FN", "ENTER", "↵"].includes(k)) return baseKey * 1.4;
        return baseKey;
      });
      const totalW = widths.reduce((a, b) => a + b + keyGap, -keyGap);
      xCursor = -totalW / 2;
      row.forEach((label, i) => {
        const w = widths[i];
        const x = xCursor + w / 2;
        const z = (rIdx - 2) * 1.05;
        keys.push({ pos: [x, 0, z], w, label, idx: idx++ });
        xCursor += w + keyGap;
      });
    });
    return keys;
  }, []);

  const total = keyData.length;

  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.4}>
      <group
        ref={groupRef}
        onPointerOver={() => setRgbOn(true)}
        onPointerOut={() => setRgbOn(false)}
        onClick={(e) => {
          e.stopPropagation();
          setAllPressed(true);
          setTimeout(() => setAllPressed(false), 180);
        }}
      >
        {/* Aluminum chassis */}
        <mesh receiveShadow castShadow position={[0, -0.3, 0]}>
          <boxGeometry args={[15.5, 0.5, 6.5]} />
          <meshPhysicalMaterial
            color="#1a1825"
            roughness={0.3}
            metalness={0.95}
            clearcoat={0.6}
            clearcoatRoughness={0.2}
          />
        </mesh>
        {/* Inner plate */}
        <mesh position={[0, -0.05, 0]} receiveShadow>
          <boxGeometry args={[15, 0.1, 6]} />
          <meshPhysicalMaterial color="#0a0812" roughness={0.6} metalness={0.5} />
        </mesh>

        {/* Brand badge */}
        <mesh position={[6.3, 0.01, -2.6]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.2, 0.4]} />
          <meshBasicMaterial color="#a78bfa" transparent opacity={0.9} />
        </mesh>

        {keyData.map((k) => (
          <KeyCap
            key={`${k.label}-${k.idx}`}
            position={k.pos}
            width={k.w}
            label={k.label}
            index={k.idx}
            total={total}
            pressed={allPressed}
            rgbOn={rgbOn}
          />
        ))}
      </group>
    </Float>
  );
}

function Loader() {
  return (
    <mesh>
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshBasicMaterial color="#a78bfa" />
    </mesh>
  );
}

export default function Keyboard3D() {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 6, 11], fov: 38 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
    >
      <color attach="background" args={["#00000000"]} />
      <fog attach="fog" args={["#0a0612", 18, 35]} />

      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={30}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <pointLight position={[-6, 4, -4]} intensity={2} color="#a78bfa" />
      <pointLight position={[6, 4, -4]} intensity={2} color="#60a5fa" />
      <pointLight position={[0, -2, 4]} intensity={1.2} color="#ec4899" />

      <Suspense fallback={<Loader />}>
        <KeyboardModel />
        <ContactShadows position={[0, -0.6, 0]} opacity={0.6} scale={20} blur={2.5} far={4} color="#000" />
        <Environment preset="city" />
      </Suspense>

      <OrbitControls
        enablePan={false}
        enableZoom
        minDistance={7}
        maxDistance={18}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
        enableDamping
        dampingFactor={0.08}
      />
    </Canvas>
  );
}
