"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

import { skillCategories, skills, type Skill } from "@/lib/resume";
import { seededRandom } from "@/lib/utils";
import type { ScenePalette } from "@/components/three/scene-palette";
import type { SceneRenderOptions } from "@/components/three/scene-shell";

/* ------------------------------------------------------------------------ */
/*  Layout — deterministic constellation positions                           */
/* ------------------------------------------------------------------------ */

export interface PlacedSkill {
  skill: Skill;
  position: THREE.Vector3;
  radius: number;
  color: string;
  colorLight: string;
  phase: number;
}

interface ConstellationLayout {
  placed: PlacedSkill[];
  hubs: {
    id: string;
    label: string;
    color: string;
    colorLight: string;
    position: THREE.Vector3;
  }[];
  clusterLines: { from: THREE.Vector3; to: THREE.Vector3; category: string }[];
  ringLines: { from: THREE.Vector3; to: THREE.Vector3 }[];
}

function buildLayout(): ConstellationLayout {
  const random = seededRandom(2024);
  const golden = Math.PI * (3 - Math.sqrt(5));
  const hubRadius = 2.05;

  const hubs = skillCategories.map((category, i) => {
    // Fibonacci sphere keeps the seven clusters evenly spread
    const y = 1 - (i / Math.max(skillCategories.length - 1, 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    const position = new THREE.Vector3(
      Math.cos(theta) * r * hubRadius,
      y * hubRadius * 0.82,
      Math.sin(theta) * r * hubRadius,
    );
    return {
      id: category.id,
      label: category.label,
      color: category.color,
      colorLight: category.colorLight,
      position,
    };
  });

  const placed: PlacedSkill[] = skills.map((skill) => {
    const hub = hubs.find((h) => h.id === skill.category)!;
    const offset = new THREE.Vector3(random() * 2 - 1, random() * 2 - 1, random() * 2 - 1)
      .normalize()
      .multiplyScalar(0.42 + random() * 0.5);
    const category = skillCategories.find((c) => c.id === skill.category)!;
    return {
      skill,
      position: hub.position.clone().add(offset),
      radius: 0.05 + skill.weight * 0.028,
      color: category.color,
      colorLight: category.colorLight,
      phase: random() * Math.PI * 2,
    };
  });

  const clusterLines = placed.map((p) => ({
    from: hubs.find((h) => h.id === p.skill.category)!.position,
    to: p.position,
    category: p.skill.category,
  }));

  const ringLines = hubs.map((hub, i) => ({
    from: hub.position,
    to: hubs[(i + 1) % hubs.length].position,
  }));

  return { placed, hubs, clusterLines, ringLines };
}

/* ------------------------------------------------------------------------ */
/*  Scene internals                                                          */
/* ------------------------------------------------------------------------ */

interface ConstellationSceneProps extends SceneRenderOptions {
  palette: ScenePalette;
  /** names to keep bright; null → everything bright */
  highlight: ReadonlySet<string> | null;
  selected: string | null;
  onSelect: (name: string | null) => void;
}

function SkillNode({
  placed,
  palette,
  bright,
  isSelected,
  onSelect,
  onHover,
}: {
  placed: PlacedSkill;
  palette: ScenePalette;
  bright: boolean;
  isSelected: boolean;
  onSelect: (name: string | null) => void;
  onHover: (name: string | null) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  const [hovered, setHovered] = useState(false);
  const color = palette.light ? placed.colorLight : placed.color;

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    const material = materialRef.current;
    if (!mesh || !material) return;
    // gentle bob
    mesh.position.y =
      placed.position.y + Math.sin(state.clock.elapsedTime * 0.7 + placed.phase) * 0.045;
    // scale + opacity toward targets
    const targetScale = (hovered || isSelected ? 1.45 : 1) * placed.radius;
    const current = mesh.scale.x;
    const next = current + (targetScale - current) * Math.min(1, delta * 8);
    mesh.scale.setScalar(next);
    const targetOpacity = bright ? 1 : 0.14;
    material.opacity += (targetOpacity - material.opacity) * Math.min(1, delta * 6);
  });

  return (
    <mesh
      ref={meshRef}
      position={placed.position}
      scale={placed.radius}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
        onHover(placed.skill.name);
      }}
      onPointerOut={() => {
        setHovered(false);
        onHover(null);
      }}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(isSelected ? null : placed.skill.name);
      }}
    >
      <sphereGeometry args={[1, 16, 16]} />
      <meshBasicMaterial ref={materialRef} color={color} transparent opacity={1} />
      {(hovered || isSelected) && bright && (
        <Html center distanceFactor={7} style={{ pointerEvents: "none" }} zIndexRange={[40, 0]}>
          <div
            style={{
              transform: "translateY(-180%)",
              whiteSpace: "nowrap",
              padding: "6px 10px",
              borderRadius: "10px",
              border: `1px solid ${color}55`,
              background: palette.light ? "rgba(255,255,255,0.9)" : "rgba(10,14,29,0.9)",
              color: palette.light ? "#171d33" : "#e9edf8",
              fontSize: "11px",
              fontFamily: "var(--font-jetbrains), monospace",
              letterSpacing: "0.04em",
            }}
          >
            {placed.skill.name}
            <span style={{ color, marginLeft: 6 }}>{"●".repeat(placed.skill.weight)}</span>
          </div>
        </Html>
      )}
    </mesh>
  );
}

function Lines({
  layout,
  palette,
  highlight,
}: {
  layout: ConstellationLayout;
  palette: ScenePalette;
  highlight: ReadonlySet<string> | null;
}) {
  const { clusterPositions, clusterColors, ringPositions } = useMemo(() => {
    const bg = new THREE.Color(palette.bg);
    const positions = new Float32Array(layout.clusterLines.length * 6);
    const colors = new Float32Array(layout.clusterLines.length * 6);
    layout.clusterLines.forEach((line, i) => {
      positions.set(
        [line.from.x, line.from.y, line.from.z, line.to.x, line.to.y, line.to.z],
        i * 6,
      );
      const category = skillCategories.find((c) => c.id === line.category)!;
      const base = new THREE.Color(palette.light ? category.colorLight : category.color);
      const target = layout.placed[i];
      const bright = !highlight || highlight.has(target.skill.name);
      const c = bright ? base : base.clone().lerp(bg, 0.82);
      colors.set([c.r, c.g, c.b, c.r, c.g, c.b], i * 6);
    });
    const ring = new Float32Array(layout.ringLines.length * 6);
    layout.ringLines.forEach((line, i) => {
      ring.set([line.from.x, line.from.y, line.from.z, line.to.x, line.to.y, line.to.z], i * 6);
    });
    return { clusterPositions: positions, clusterColors: colors, ringPositions: ring };
  }, [layout, palette, highlight]);

  return (
    <>
      <lineSegments key={`cluster-${palette.light}-${highlight ? highlight.size : "all"}`}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[clusterPositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[clusterColors, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={palette.light ? 0.5 : 0.38}
          blending={palette.light ? THREE.NormalBlending : THREE.AdditiveBlending}
        />
      </lineSegments>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[ringPositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          color={palette.star}
          transparent
          opacity={palette.light ? 0.22 : 0.12}
        />
      </lineSegments>
    </>
  );
}

function ConstellationContent({
  palette,
  highlight,
  selected,
  onSelect,
}: Omit<ConstellationSceneProps, "tier" | "active">) {
  const layout = useMemo(() => buildLayout(), []);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = !hovered && !selected;
    }
  }, [hovered, selected]);

  return (
    <>
      <fog attach="fog" args={[palette.bg, 7, 13.5]} />
      <OrbitControls
        ref={controlsRef}
        autoRotate
        autoRotateSpeed={0.55}
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.55}
      />
      <Lines layout={layout} palette={palette} highlight={highlight} />
      {layout.hubs.map((hub) => (
        <group key={hub.id} position={hub.position}>
          <Html
            center
            distanceFactor={8}
            style={{ pointerEvents: "none" }}
            zIndexRange={[30, 0]}
          >
            <span
              style={{
                fontFamily: "var(--font-jetbrains), monospace",
                fontSize: "10px",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: palette.light ? hub.colorLight : hub.color,
                opacity: 0.85,
                whiteSpace: "nowrap",
              }}
            >
              {hub.label}
            </span>
          </Html>
        </group>
      ))}
      {layout.placed.map((placed) => (
        <SkillNode
          key={placed.skill.name}
          placed={placed}
          palette={palette}
          bright={!highlight || highlight.has(placed.skill.name)}
          isSelected={selected === placed.skill.name}
          onSelect={onSelect}
          onHover={setHovered}
        />
      ))}
    </>
  );
}

export default function ConstellationScene({
  palette,
  tier,
  active,
  highlight,
  selected,
  onSelect,
}: ConstellationSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0.35, 6.6], fov: 45 }}
      dpr={tier === "high" ? [1, 1.75] : [1, 1.25]}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
      onPointerMissed={() => onSelect(null)}
    >
      <ConstellationContent
        palette={palette}
        highlight={highlight}
        selected={selected}
        onSelect={onSelect}
      />
    </Canvas>
  );
}
