"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Trail } from "@react-three/drei";

import { PERF_BUDGET } from "@/hooks/use-perf-tier";
import { seededRandom } from "@/lib/utils";
import { KONAMI_EVENT } from "@/components/effects/konami";
import type { ScenePalette } from "@/components/three/scene-palette";
import type { SceneRenderOptions } from "@/components/three/scene-shell";

/* ------------------------------------------------------------------------ */
/*  Shared helpers                                                           */
/* ------------------------------------------------------------------------ */

/** Soft radial sprite used for every glow in the scene — a cheap stand-in for bloom. */
function makeGlowTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.32, "rgba(255,255,255,0.42)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

interface WarpRef {
  boostedAt: number;
}

/** 1 normally; spikes to ~6 right after the Konami code and decays back. */
function warpFactor(warp: WarpRef) {
  const elapsed = performance.now() - warp.boostedAt;
  return 1 + 5 * Math.exp(-Math.max(elapsed, 0) / 900);
}

/* ------------------------------------------------------------------------ */
/*  Starfield                                                                */
/* ------------------------------------------------------------------------ */

function Starfield({
  count,
  palette,
  warp,
  glow,
}: {
  count: number;
  palette: ScenePalette;
  warp: WarpRef;
  glow: THREE.Texture;
}) {
  const ref = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const random = seededRandom(1758); // CodeChef rating as the seed — why not.
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const swatches = [
      palette.ion,
      palette.violet,
      palette.cyan,
      palette.star,
      palette.star,
    ].map((hex) => new THREE.Color(hex));
    for (let i = 0; i < count; i++) {
      // shell distribution keeps the middle clear for the orbital system
      const radius = 7 + random() * 8;
      const theta = random() * Math.PI * 2;
      const phi = Math.acos(2 * random() - 1);
      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.72;
      pos[i * 3 + 2] = radius * Math.cos(phi);
      const c = swatches[Math.floor(random() * swatches.length)];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return [pos, col];
  }, [count, palette]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const speed = warpFactor(warp);
    ref.current.rotation.y += delta * 0.016 * speed;
    ref.current.rotation.x += delta * 0.004 * speed;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={glow}
        size={palette.light ? 0.075 : 0.09}
        sizeAttenuation
        vertexColors
        transparent
        opacity={palette.light ? 0.55 : 0.8}
        depthWrite={false}
        blending={palette.light ? THREE.NormalBlending : THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ------------------------------------------------------------------------ */
/*  Orbital system: core + rings of service nodes + request pulses           */
/* ------------------------------------------------------------------------ */

interface RingDef {
  radius: number;
  tilt: [number, number, number];
  speed: number;
  nodeAngles: number[];
}

function buildRings(totalNodes: number): RingDef[] {
  const random = seededRandom(7);
  const distribution = [0.38, 0.33, 0.29];
  const defs: RingDef[] = [
    { radius: 2.0, tilt: [1.12, 0, 0.3], speed: 0.17, nodeAngles: [] },
    { radius: 2.7, tilt: [1.45, 0.42, -0.28], speed: -0.115, nodeAngles: [] },
    { radius: 3.4, tilt: [0.72, -0.5, 0.14], speed: 0.082, nodeAngles: [] },
  ];
  defs.forEach((def, i) => {
    const n =
      i === defs.length - 1
        ? totalNodes - defs.slice(0, -1).reduce((sum, d) => sum + d.nodeAngles.length, 0)
        : Math.max(3, Math.round(totalNodes * distribution[i]));
    for (let k = 0; k < n; k++) {
      def.nodeAngles.push((k / n) * Math.PI * 2 + random() * 0.55);
    }
  });
  return defs;
}

function OrbitalSystem({
  palette,
  nodeCount,
  pulseCount,
  warp,
  glow,
}: {
  palette: ScenePalette;
  nodeCount: number;
  pulseCount: number;
  warp: WarpRef;
  glow: THREE.Texture;
}) {
  const rings = useMemo(() => buildRings(nodeCount), [nodeCount]);
  const spinRefs = useRef<(THREE.Group | null)[]>([]);
  const nodeRefs = useRef<(THREE.Mesh | null)[]>([]);
  const coreMaterialRef = useRef<THREE.MeshBasicMaterial>(null);

  const nodeColors = useMemo(
    () => [palette.ion, palette.violet, palette.cyan].map((hex) => new THREE.Color(hex)),
    [palette],
  );

  useFrame((state, delta) => {
    const speed = warpFactor(warp);
    rings.forEach((ring, i) => {
      const spin = spinRefs.current[i];
      if (spin) spin.rotation.y += delta * ring.speed * speed;
    });
    if (coreMaterialRef.current) {
      const pulse = 0.82 + Math.sin(state.clock.elapsedTime * 1.3) * 0.14;
      coreMaterialRef.current.opacity = pulse;
    }
  });

  const ringStarts = useMemo(() => {
    const starts: number[] = [];
    let acc = 0;
    for (const ring of rings) {
      starts.push(acc);
      acc += ring.nodeAngles.length;
    }
    return starts;
  }, [rings]);

  return (
    <group>
      {/* The core service */}
      <Float speed={1.6} rotationIntensity={0.5} floatIntensity={0.35}>
        <mesh>
          <icosahedronGeometry args={[0.86, 1]} />
          <meshBasicMaterial
            ref={coreMaterialRef}
            color={palette.gold}
            wireframe
            transparent
            opacity={0.9}
          />
        </mesh>
        <mesh scale={0.38}>
          <icosahedronGeometry args={[1, 1]} />
          <meshBasicMaterial color={palette.violet} wireframe transparent opacity={0.4} />
        </mesh>
        <sprite scale={[3.1, 3.1, 1]}>
          <spriteMaterial
            map={glow}
            color={palette.gold}
            transparent
            opacity={palette.light ? 0.22 : 0.34}
            depthWrite={false}
            blending={palette.light ? THREE.NormalBlending : THREE.AdditiveBlending}
          />
        </sprite>
      </Float>

      {/* Orbit rings with service nodes */}
      {rings.map((ring, ringIdx) => (
        <group key={ringIdx} rotation={ring.tilt}>
          <group
            ref={(el) => {
              spinRefs.current[ringIdx] = el;
            }}
          >
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[ring.radius, 0.0042, 6, 160]} />
              <meshBasicMaterial
                color={palette.ion}
                transparent
                opacity={palette.light ? 0.3 : 0.2}
              />
            </mesh>
            {ring.nodeAngles.map((angle, k) => {
              const flatIndex = ringStarts[ringIdx] + k;
              const color = nodeColors[flatIndex % nodeColors.length];
              const size = 0.055 + ((flatIndex * 37) % 5) * 0.011;
              return (
                <mesh
                  key={k}
                  ref={(el) => {
                    nodeRefs.current[flatIndex] = el;
                  }}
                  position={[Math.cos(angle) * ring.radius, 0, Math.sin(angle) * ring.radius]}
                  scale={size}
                >
                  <sphereGeometry args={[1, 12, 12]} />
                  <meshBasicMaterial color={color} />
                </mesh>
              );
            })}
          </group>
        </group>
      ))}

      <NodeGlows nodeRefs={nodeRefs} maxNodes={nodeCount} palette={palette} glow={glow} />
      <CoreLinks nodeRefs={nodeRefs} maxNodes={nodeCount} palette={palette} />
      <Pulses
        nodeRefs={nodeRefs}
        count={pulseCount}
        palette={palette}
        warp={warp}
        glow={glow}
      />
    </group>
  );
}

/* ------------------------------------------------------------------------ */
/*  Holographic architecture                                                 */
/* ------------------------------------------------------------------------ */

function HologramLattice({
  palette,
  tier,
  warp,
}: {
  palette: ScenePalette;
  tier: "high" | "low";
  warp: WarpRef;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const count = tier === "high" ? 11 : 7;
  const instancedRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);

  const cells = useMemo(() => {
    const random = seededRandom(404);
    return Array.from({ length: count * count }, (_, i) => {
      const x = (i % count) - (count - 1) / 2;
      const y = Math.floor(i / count) - (count - 1) / 2;
      const radius = Math.hypot(x, y);
      return {
        x: x * 0.42,
        y: y * 0.42,
        z: Math.sin(radius * 1.2) * 0.16 + (random() - 0.5) * 0.12,
        lift: random() * Math.PI * 2,
        scale: 0.07 + random() * 0.055,
      };
    });
  }, [count]);

  useFrame((state, delta) => {
    const group = groupRef.current;
    const mesh = instancedRef.current;
    if (!group || !mesh) return;
    const speed = warpFactor(warp);
    group.rotation.z += delta * 0.026 * speed;
    group.rotation.x = -0.88 + state.pointer.y * 0.12;
    group.rotation.y = state.pointer.x * 0.18;

    cells.forEach((cell, i) => {
      const pulse = 0.75 + Math.sin(state.clock.elapsedTime * 1.9 + cell.lift) * 0.25;
      dummy.position.set(cell.x, cell.y, cell.z + pulse * 0.08);
      dummy.rotation.set(
        state.clock.elapsedTime * 0.18 + cell.lift,
        state.clock.elapsedTime * 0.12,
        cell.lift,
      );
      const s = cell.scale * pulse;
      dummy.scale.set(s, s, s * 0.55);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (materialRef.current) {
      materialRef.current.opacity = palette.light ? 0.2 : 0.28;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.32, -0.55]} scale={[1.35, 1.35, 1.35]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.86, 0.006, 5, 220]} />
        <meshBasicMaterial
          color={palette.cyan}
          transparent
          opacity={palette.light ? 0.22 : 0.18}
          blending={palette.light ? THREE.NormalBlending : THREE.AdditiveBlending}
        />
      </mesh>
      <instancedMesh ref={instancedRef} args={[undefined, undefined, cells.length]}>
        <octahedronGeometry args={[1, 0]} />
        <meshBasicMaterial
          ref={materialRef}
          color={palette.ion}
          wireframe
          transparent
          opacity={0.24}
          depthWrite={false}
          blending={palette.light ? THREE.NormalBlending : THREE.AdditiveBlending}
        />
      </instancedMesh>
    </group>
  );
}

function EnergyRibbon({
  palette,
  tier,
  warp,
}: {
  palette: ScenePalette;
  tier: "high" | "low";
  warp: WarpRef;
}) {
  const lineRef = useRef<THREE.LineSegments>(null);
  const pointCount = tier === "high" ? 190 : 110;
  const segmentCount = pointCount - 1;
  const positions = useMemo(() => new Float32Array(segmentCount * 2 * 3), [segmentCount]);

  useFrame((state) => {
    const line = lineRef.current;
    if (!line) return;
    const time = state.clock.elapsedTime * (0.42 + warpFactor(warp) * 0.045);
    const writePoint = (targetIndex: number, sourceIndex: number) => {
      const t = sourceIndex / (pointCount - 1);
      const angle = t * Math.PI * 2.35 + time;
      const radius = 1.5 + Math.sin(t * Math.PI * 6 + time * 1.5) * 0.34;
      positions[targetIndex] = Math.cos(angle) * radius;
      positions[targetIndex + 1] = Math.sin(t * Math.PI * 2 + time * 0.7) * 0.62;
      positions[targetIndex + 2] = Math.sin(angle) * radius * 0.72;
    };
    for (let i = 0; i < segmentCount; i++) {
      writePoint(i * 6, i);
      writePoint(i * 6 + 3, i + 1);
    }
    line.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <lineSegments ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <lineBasicMaterial
        color={palette.gold}
        transparent
        opacity={palette.light ? 0.32 : 0.42}
        blending={palette.light ? THREE.NormalBlending : THREE.AdditiveBlending}
      />
    </lineSegments>
  );
}
function PlayfulSatellites({
  palette,
  tier,
  warp,
  glow,
}: {
  palette: ScenePalette;
  tier: "high" | "low";
  warp: WarpRef;
  glow: THREE.Texture;
}) {
  const count = tier === "high" ? 5 : 3;
  const refs = useRef<(THREE.Sprite | null)[]>([]);

  useFrame((state) => {
    const speed = warpFactor(warp);
    refs.current.forEach((sprite, i) => {
      if (!sprite) return;
      const phase = state.clock.elapsedTime * (0.32 + i * 0.035) * speed + i * 1.37;
      const radius = 3.35 + Math.sin(phase * 1.7) * 0.28;
      sprite.position.set(
        Math.cos(phase) * radius,
        Math.sin(phase * 0.8) * 1.15,
        Math.sin(phase) * radius * 0.78,
      );
      const scale = 0.22 + Math.sin(phase * 2) * 0.04;
      sprite.scale.set(scale, scale, 1);
    });
  });

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Trail
          key={i}
          width={0.6}
          length={tier === "high" ? 8 : 5}
          color={i % 2 ? palette.cyan : palette.violet}
          attenuation={(t) => t * t}
        >
          <sprite
            ref={(el) => {
              refs.current[i] = el;
            }}
          >
            <spriteMaterial
              map={glow}
              color={i % 3 === 0 ? palette.ion : i % 3 === 1 ? palette.violet : palette.gold}
              transparent
              opacity={0.78}
              depthWrite={false}
              blending={palette.light ? THREE.NormalBlending : THREE.AdditiveBlending}
            />
          </sprite>
        </Trail>
      ))}
    </>
  );
}

/** One Points object that hugs the node meshes each frame — the halo layer. */
function NodeGlows({
  nodeRefs,
  maxNodes,
  palette,
  glow,
}: {
  nodeRefs: React.RefObject<(THREE.Mesh | null)[]>;
  maxNodes: number;
  palette: ScenePalette;
  glow: THREE.Texture;
}) {
  const geometryRef = useRef<THREE.BufferGeometry>(null);
  const positions = useMemo(() => new Float32Array(maxNodes * 3), [maxNodes]);
  const colors = useMemo(() => {
    const arr = new Float32Array(maxNodes * 3);
    const swatches = [palette.ion, palette.violet, palette.cyan].map(
      (hex) => new THREE.Color(hex),
    );
    for (let i = 0; i < maxNodes; i++) {
      const c = swatches[i % swatches.length];
      arr[i * 3] = c.r;
      arr[i * 3 + 1] = c.g;
      arr[i * 3 + 2] = c.b;
    }
    return arr;
  }, [maxNodes, palette]);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    const geometry = geometryRef.current;
    if (!geometry) return;
    const nodes = nodeRefs.current;
    let count = 0;
    for (let i = 0; i < nodes.length && count < maxNodes; i++) {
      const node = nodes[i];
      if (!node) continue;
      node.getWorldPosition(tmp);
      positions[count * 3] = tmp.x;
      positions[count * 3 + 1] = tmp.y;
      positions[count * 3 + 2] = tmp.z;
      count += 1;
    }
    geometry.setDrawRange(0, count);
    geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={glow}
        size={0.55}
        sizeAttenuation
        vertexColors
        transparent
        opacity={palette.light ? 0.35 : 0.5}
        depthWrite={false}
        blending={palette.light ? THREE.NormalBlending : THREE.AdditiveBlending}
      />
    </points>
  );
}

/** Faint spokes from every node back to the core. */
function CoreLinks({
  nodeRefs,
  maxNodes,
  palette,
}: {
  nodeRefs: React.RefObject<(THREE.Mesh | null)[]>;
  maxNodes: number;
  palette: ScenePalette;
}) {
  const geometryRef = useRef<THREE.BufferGeometry>(null);
  const positions = useMemo(() => new Float32Array(maxNodes * 2 * 3), [maxNodes]);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    const geometry = geometryRef.current;
    if (!geometry) return;
    const nodes = nodeRefs.current;
    let count = 0;
    for (let i = 0; i < nodes.length && count < maxNodes; i++) {
      const node = nodes[i];
      if (!node) continue;
      node.getWorldPosition(tmp);
      positions[count * 6] = tmp.x;
      positions[count * 6 + 1] = tmp.y;
      positions[count * 6 + 2] = tmp.z;
      positions[count * 6 + 3] = 0;
      positions[count * 6 + 4] = 0;
      positions[count * 6 + 5] = 0;
      count += 1;
    }
    geometry.setDrawRange(0, count * 2);
    geometry.attributes.position.needsUpdate = true;
  });

  return (
    <lineSegments>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <lineBasicMaterial
        color={palette.ion}
        transparent
        opacity={palette.light ? 0.16 : 0.1}
        blending={palette.light ? THREE.NormalBlending : THREE.AdditiveBlending}
      />
    </lineSegments>
  );
}

/** Bright dots that travel node → core: requests arriving at the service. */
function Pulses({
  nodeRefs,
  count,
  palette,
  warp,
  glow,
}: {
  nodeRefs: React.RefObject<(THREE.Mesh | null)[]>;
  count: number;
  palette: ScenePalette;
  warp: WarpRef;
  glow: THREE.Texture;
}) {
  const spriteRefs = useRef<(THREE.Sprite | null)[]>([]);
  const states = useRef(
    Array.from({ length: count }, (_, i) => ({
      node: -1,
      t: (i / count) * 0.9,
      speed: 0.32 + ((i * 29) % 7) * 0.05,
    })),
  );
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    const speedFactor = warpFactor(warp);
    const nodes = nodeRefs.current;
    const available: THREE.Mesh[] = [];
    for (const node of nodes) if (node) available.push(node);
    if (available.length === 0) return;

    states.current.forEach((state, i) => {
      const sprite = spriteRefs.current[i];
      if (!sprite) return;
      if (state.node < 0 || state.t >= 1) {
        state.node = Math.floor(Math.random() * available.length);
        state.t = 0;
      }
      state.t += delta * state.speed * speedFactor;
      const source = available[state.node % available.length];
      source.getWorldPosition(tmp);
      const k = THREE.MathUtils.smoothstep(Math.min(state.t, 1), 0, 1);
      sprite.position.set(tmp.x * (1 - k), tmp.y * (1 - k), tmp.z * (1 - k));
      const scale = 0.15 + Math.sin(Math.min(state.t, 1) * Math.PI) * 0.13;
      sprite.scale.set(scale, scale, 1);
    });
  });

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <sprite
          key={i}
          ref={(el) => {
            spriteRefs.current[i] = el;
          }}
        >
          <spriteMaterial
            map={glow}
            color={i % 3 === 0 ? palette.gold : i % 3 === 1 ? palette.ion : palette.cyan}
            transparent
            opacity={0.9}
            depthWrite={false}
            blending={palette.light ? THREE.NormalBlending : THREE.AdditiveBlending}
          />
        </sprite>
      ))}
    </>
  );
}

/* ------------------------------------------------------------------------ */
/*  Camera rig — cursor-reactive drift                                       */
/* ------------------------------------------------------------------------ */

function CameraRig() {
  useFrame((state, delta) => {
    const damp = Math.min(1, delta * 2.2);
    const targetX = state.pointer.x * 0.6;
    const targetY = 0.5 + state.pointer.y * 0.32;
    state.camera.position.x += (targetX - state.camera.position.x) * damp;
    state.camera.position.y += (targetY - state.camera.position.y) * damp;
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

/* ------------------------------------------------------------------------ */
/*  Scene root                                                               */
/* ------------------------------------------------------------------------ */

/** Module-level mutable warp state — the hero scene renders once per page. */
const warpState: WarpRef = { boostedAt: -1e9 };

function SceneContent({ palette, tier }: { palette: ScenePalette; tier: "high" | "low" }) {
  const budget = PERF_BUDGET[tier];
  const glow = useMemo(() => makeGlowTexture(), []);
  const warp = warpState;

  useEffect(() => {
    const boost = () => {
      warp.boostedAt = performance.now();
    };
    window.addEventListener(KONAMI_EVENT, boost);
    return () => window.removeEventListener(KONAMI_EVENT, boost);
  }, [warp]);

  useEffect(() => () => glow.dispose(), [glow]);

  return (
    <>
      <fog attach="fog" args={[palette.bg, 8.5, 17]} />
      <CameraRig />
      <Starfield count={budget.stars} palette={palette} warp={warp} glow={glow} />
      <HologramLattice palette={palette} tier={tier} warp={warp} />
      <EnergyRibbon palette={palette} tier={tier} warp={warp} />
      <OrbitalSystem
        palette={palette}
        nodeCount={budget.orbitNodes}
        pulseCount={budget.pulses}
        warp={warp}
        glow={glow}
      />
      <PlayfulSatellites palette={palette} tier={tier} warp={warp} glow={glow} />
    </>
  );
}

export default function HeroScene({
  palette,
  tier,
  active,
}: SceneRenderOptions & { palette: ScenePalette }) {
  const budget = PERF_BUDGET[tier];
  return (
    <Canvas
      camera={{ position: [0, 0.5, 7.4], fov: 42 }}
      dpr={budget.dpr}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
    >
      <SceneContent palette={palette} tier={tier} />
    </Canvas>
  );
}
