"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { MeshReflectorMaterial, RoundedBox, Sparkles } from "@react-three/drei";
import { prefersReducedMotion } from "@/lib/story";
import { ORIGIN, presence } from "./journey";

/* ───────────── noise ───────────── */

function h2(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function vnoise(x: number, y: number) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), w = yf * yf * (3 - 2 * yf);
  const a = h2(xi, yi), b = h2(xi + 1, yi), c = h2(xi, yi + 1), d = h2(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * w + (a - b - c + d) * u * w;
}
function ridged(x: number, y: number) {
  let s = 0, amp = 0.55, f = 1;
  for (let o = 0; o < 5; o++) {
    s += amp * (1 - Math.abs(vnoise(x * f, y * f) * 2 - 1));
    f *= 2.05;
    amp *= 0.5;
  }
  return s;
}

/* ───────────── water ───────────── */

export function Water() {
  // a soft ripple map so reflections shimmer instead of mirroring perfectly
  const ripple = useMemo(() => {
    const size = 256;
    const data = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++) {
        const n = vnoise(x / 9, y / 3.5) * 0.6 + vnoise(x / 3, y / 1.6) * 0.4;
        const i = (y * size + x) * 4;
        data[i] = data[i + 1] = data[i + 2] = n * 255;
        data[i + 3] = 255;
      }
    const t = new THREE.DataTexture(data, size, size);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(10, 40);
    t.needsUpdate = true;
    return t;
  }, []);
  const water = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    const map = (water.current?.material as { distortionMap?: THREE.Texture } | undefined)?.distortionMap;
    if (map && !prefersReducedMotion()) map.offset.y -= dt * 0.02;
  });
  return (
    <mesh ref={water} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -80]}>
      <planeGeometry args={[220, 240]} />
      <MeshReflectorMaterial
        resolution={512}
        mirror={0.85}
        mixStrength={9}
        mixBlur={0.6}
        blur={[120, 40]}
        roughness={0.85}
        depthScale={0.6}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.3}
        distortion={0.35}
        distortionMap={ripple}
        color="#03060f"
        metalness={0.6}
      />
    </mesh>
  );
}

/* ───────────── mountains ───────────── */

/** A ridge of mountains, lit hard from one side so the snow catches cyan */
export function Ridge({
  position,
  side,
  length = 26,
  height = 5,
  seed = 0,
}: {
  position: [number, number, number];
  side: 1 | -1;
  length?: number;
  height?: number;
  seed?: number;
}) {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(14, length, 90, 160);
    g.rotateX(-Math.PI / 2);
    const p = g.attributes.position as THREE.BufferAttribute;
    const colors = new Float32Array(p.count * 3);
    const dark = new THREE.Color("#070d1d");
    const snow = new THREE.Color("#2f7fd8");
    const c = new THREE.Color();
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const z = p.getZ(i);
      // rise away from the valley floor, fade out at the ends
      const across = THREE.MathUtils.clamp((x * side + 7) / 14, 0, 1);
      const ends = Math.sin(THREE.MathUtils.clamp((z / length + 0.5), 0, 1) * Math.PI);
      const r = ridged(x * 0.32 + seed, z * 0.16 + seed * 1.7);
      const y = Math.pow(across, 1.35) * height * ends * (0.35 + r * 0.95) - 0.25;
      p.setY(i, y);
      // snow catches on the high ground
      const k = THREE.MathUtils.smoothstep(y, height * 0.35, height * 0.85);
      c.copy(dark).lerp(snow, k * (0.6 + vnoise(x * 1.3, z * 1.3) * 0.4));
      c.toArray(colors, i * 3);
    }
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  }, [side, length, height, seed]);
  return (
    <mesh geometry={geo} position={position}>
      <meshStandardMaterial vertexColors roughness={0.92} metalness={0.05} />
    </mesh>
  );
}

/* ───────────── the HashOne monolith ───────────── */

function monolithFace() {
  const s = 1024;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const g = c.getContext("2d")!;
  g.fillStyle = "#56c9ec";
  g.fillRect(0, 0, s, s);
  // panel seams, like a machined block
  g.strokeStyle = "rgba(255,255,255,.35)";
  g.lineWidth = 3;
  for (let i = 0; i < 26; i++) {
    const x = h2(i, 1) * s, y = h2(i, 2) * s, w = 80 + h2(i, 3) * 260, h = 60 + h2(i, 4) * 220;
    g.strokeRect(x, y, w, h);
  }
  // the mark, recessed: O ring and hash
  g.translate(s / 2, s / 2);
  g.strokeStyle = "rgba(4,18,27,.55)";
  g.lineWidth = 46;
  g.beginPath();
  g.arc(0, 0, 250, 0, Math.PI * 2);
  g.stroke();
  g.fillStyle = "rgba(4,18,27,.5)";
  g.rotate(-0.18);
  g.fillRect(-90, -300, 52, 600);
  g.fillRect(40, -300, 52, 600);
  g.rotate(0.18);
  g.fillStyle = "rgba(255,255,255,.55)";
  g.fillRect(-300, -100, 600, 48);
  g.fillRect(-300, 52, 600, 48);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

export function Monolith({ position = [0, 1.75, 0] as [number, number, number], scale = 0.8 }) {
  const ref = useRef<THREE.Group>(null);
  const face = useMemo(() => monolithFace(), []);
  useFrame((s) => {
    const g = ref.current;
    if (!g || prefersReducedMotion()) return;
    const t = s.clock.elapsedTime;
    g.rotation.y = t * 0.12;
    g.rotation.x = Math.sin(t * 0.3) * 0.06 + 0.12;
    g.position.y = position[1] + Math.sin(t * 0.7) * 0.08;
  });
  return (
    <group ref={ref} position={position} scale={scale}>
      <RoundedBox args={[2.1, 2.1, 2.1]} radius={0.04} smoothness={4}>
        <meshStandardMaterial map={face} emissiveMap={face} emissive="#ffffff" emissiveIntensity={0.62} roughness={0.35} toneMapped={false} />
      </RoundedBox>
      <pointLight color="#5fd4f4" intensity={40} distance={14} decay={2} position={[0, -1.6, 0]} />
    </group>
  );
}

/* ───────────── light streaks ───────────── */

const streakMaterial = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uReveal: { value: 0 },
      uSpeed: { value: 0.25 },
      uColor: { value: new THREE.Color("#5fd4f4") },
      uSeed: { value: 0 },
      uBright: { value: 1 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uTime, uReveal, uSpeed, uSeed, uBright;
      uniform vec3 uColor;
      varying vec2 vUv;
      float h(float n){ return fract(sin(n*91.3+uSeed*17.1)*43758.5453); }
      void main(){
        // draws itself along the curve as the chapter arrives
        float head = uReveal * 1.15;
        float drawn = smoothstep(head, head - 0.12, vUv.x);
        // pulses of light running down the line
        float run = fract(vUv.x * 3.0 - uTime * uSpeed + uSeed);
        float pulse = pow(smoothstep(0.0, 1.0, run), 10.0) * 2.2;
        // fine glints, like data packets
        float cell = floor(vUv.x * 160.0);
        float glint = step(0.93, h(cell + floor(uTime * 3.0))) * 0.9;
        float tip = smoothstep(head - 0.03, head, vUv.x) * smoothstep(head + 0.01, head - 0.01, vUv.x) * 3.0;
        float edges = smoothstep(0.0, 0.08, vUv.x) * smoothstep(1.0, 0.85, vUv.x);
        float a = (0.35 + pulse + glint + tip) * drawn * edges * uBright;
        gl_FragColor = vec4(uColor * a, a);
      }`,
  });

/** A bundle of parallel light lines following one path */
export function Streaks({
  chapter,
  path,
  count = 14,
  spread = 0.35,
  radius = 0.012,
  speed = 0.25,
  color = "#5fd4f4",
  bright = 1,
}: {
  chapter: number;
  path: THREE.Vector3[];
  count?: number;
  spread?: number;
  radius?: number;
  speed?: number;
  color?: string;
  bright?: number;
}) {
  const lines = useMemo(() => {
    const base = new THREE.CatmullRomCurve3(path);
    const frames = base.computeFrenetFrames(80, false);
    return Array.from({ length: count }, (_, k) => {
      const a = h2(k, 7) * Math.PI * 2;
      const r = Math.sqrt(h2(k, 9)) * spread;
      const pts = Array.from({ length: 81 }, (_, i) => {
        const t = i / 80;
        const p = base.getPointAt(t);
        const wob = 1 + Math.sin(t * 9 + k) * 0.25;
        return p
          .add(frames.normals[i].clone().multiplyScalar(Math.cos(a) * r * wob))
          .add(frames.binormals[i].clone().multiplyScalar(Math.sin(a) * r * wob));
      });
      const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 160, radius * (0.4 + h2(k, 3) * 1.4), 5, false);
      const mat = streakMaterial();
      mat.uniforms.uSeed.value = h2(k, 5) * 10;
      mat.uniforms.uSpeed.value = speed * (0.7 + h2(k, 4) * 0.6);
      mat.uniforms.uColor.value.set(k % 5 === 0 ? "#bff0ff" : k % 3 === 0 ? "#40a8de" : color);
      return { geo, mat };
    });
  }, [path, count, spread, radius, speed, color]);
  const group = useRef<THREE.Group>(null);

  useFrame((s) => {
    const g = group.current;
    if (!g) return;
    const pr = presence(chapter);
    g.visible = pr > 0.01;
    if (!g.visible) return;
    const reduced = prefersReducedMotion();
    const reveal = reduced ? (pr > 0.5 ? 1 : 0) : THREE.MathUtils.clamp(pr * 1.6 - 0.3, 0, 1);
    for (const child of g.children) {
      const u = ((child as THREE.Mesh).material as THREE.ShaderMaterial).uniforms;
      u.uTime.value = reduced ? 0 : s.clock.elapsedTime;
      u.uReveal.value = reveal;
      u.uBright.value = bright;
    }
  });

  return (
    <group ref={group}>
      {lines.map((l, i) => (
        <mesh key={i} geometry={l.geo} material={l.mat} />
      ))}
    </group>
  );
}

/* ───────────── the six places ───────────── */

const at = (i: number, x: number, y: number, z: number) => new THREE.Vector3(x, y, z).add(ORIGIN[i]);

/** Chapter 0: the monolith hangs over still water between two ridges */
export function Arrival() {
  return (
    <group>
      <Monolith />
      <Ridge position={[-11, 0, -7]} side={-1} length={30} height={6} seed={1} />
      <Ridge position={[11, 0, -9]} side={1} length={30} height={5.2} seed={4} />
      <Sparkles count={160} scale={[22, 5, 16]} position={[0, 2, -2]} size={2.2} speed={0.25} color="#8fdcff" opacity={0.8} />
    </group>
  );
}

/** Chapter 1 (Mobile): a river of light runs down a dark valley */
export function Valley() {
  const path = useMemo(
    () => [at(1, -4, 5.2, 8), at(1, -1.5, 2.4, 2), at(1, 1.6, 0.6, -3), at(1, -0.6, 0.15, -9), at(1, 1.8, 0.1, -16), at(1, 0, 0.05, -24)],
    [],
  );
  return (
    <group>
      <Ridge position={[-8, 0, ORIGIN[1].z - 6]} side={-1} length={40} height={8} seed={7} />
      <Ridge position={[8, 0, ORIGIN[1].z - 6]} side={1} length={40} height={7} seed={9} />
      <Streaks chapter={1} path={path} count={26} spread={0.42} radius={0.016} speed={0.35} />
      <Sparkles count={90} scale={[14, 5, 26]} position={[0, 2, ORIGIN[1].z - 6]} size={1.8} speed={0.3} color="#5fd4f4" />
    </group>
  );
}

/** Chapter 2 (Web): three arcs of light weave into a network */
export function Network() {
  const paths = useMemo(
    () => [
      [at(2, -7, -1, 2), at(2, -3.5, 2.5, -2), at(2, -1, 5, -4), at(2, 0.5, 9, -5)],
      [at(2, -2, -1, 1), at(2, 0.4, 2, -3), at(2, 3, 3.6, -5), at(2, 4.5, 8, -6)],
      [at(2, 9, 0.2, -2), at(2, 4, 1.2, -4), at(2, 0, 3, -6), at(2, -4, 6, -7), at(2, -6, 10, -8)],
    ],
    [],
  );
  return (
    <group>
      {paths.map((p, i) => (
        <Streaks key={i} chapter={2} path={p} count={18} spread={0.5} radius={0.012} speed={0.3 + i * 0.05} />
      ))}
      <Sparkles count={120} scale={[18, 10, 10]} position={[0, 4, ORIGIN[2].z - 4]} size={1.6} speed={0.2} color="#bff0ff" />
    </group>
  );
}

/** Chapter 3 (AI): tall beams pulse like a thinking machine */
export function Beams() {
  const paths = useMemo(
    () =>
      [-4.5, -1.2, 2.2, 5.2].map((x, i) => [
        at(3, x, -0.5, -4 - i),
        at(3, x + 0.4, 2.5, -4.5 - i),
        at(3, x - 0.3, 5.5, -5 - i),
        at(3, x + 0.2, 10, -5.5 - i),
      ]),
    [],
  );
  return (
    <group>
      {paths.map((p, i) => (
        <Streaks key={i} chapter={3} path={p} count={i % 2 ? 22 : 10} spread={i % 2 ? 0.25 : 0.4} radius={0.014} speed={0.5} bright={i % 2 ? 1.2 : 0.8} />
      ))}
      <Ridge position={[-10, 0, ORIGIN[3].z - 10]} side={-1} length={26} height={6} seed={11} />
      <Ridge position={[10, 0, ORIGIN[3].z - 10]} side={1} length={26} height={6.5} seed={13} />
    </group>
  );
}

/** Chapter 4 (Cloud): light spirals upward into the sky */
export function Spiral() {
  const paths = useMemo(
    () =>
      [0, 1, 2].map((k) =>
        Array.from({ length: 14 }, (_, i) => {
          const t = i / 13;
          const a = t * Math.PI * 3 + (k * Math.PI * 2) / 3;
          const r = 1.2 + t * 3.2;
          return at(4, Math.cos(a) * r, t * 11 - 0.4, -2 + Math.sin(a) * r);
        }),
      ),
    [],
  );
  return (
    <group>
      {paths.map((p, i) => (
        <Streaks key={i} chapter={4} path={p} count={14} spread={0.3} radius={0.012} speed={0.28} />
      ))}
      <Sparkles count={160} scale={[14, 12, 12]} position={[0, 5, ORIGIN[4].z - 2]} size={2} speed={0.4} color="#8fdcff" />
    </group>
  );
}

/** Chapter 5 (Global): the monolith again, ringed by five beams, one per office */
export function Offices() {
  const paths = useMemo(
    () =>
      [0, 1, 2, 3, 4].map((k) => {
        const a = (k / 5) * Math.PI * 2 + 0.3;
        const x = Math.cos(a) * 5.5, z = Math.sin(a) * 3.2;
        return [at(5, x, -0.2, z), at(5, x * 1.02, 3, z), at(5, x * 1.04, 7, z), at(5, x * 1.06, 14, z)];
      }),
    [],
  );
  const ring = useMemo(() => {
    const pts = Array.from({ length: 41 }, (_, i) => {
      const a = (i / 40) * Math.PI * 2;
      return at(5, Math.cos(a) * 5.5, 0.05, Math.sin(a) * 3.2);
    });
    return pts;
  }, []);
  return (
    <group>
      <Monolith position={[ORIGIN[5].x, 1.9, ORIGIN[5].z]} scale={0.65} />
      {paths.map((p, i) => (
        <Streaks key={i} chapter={5} path={p} count={12} spread={0.12} radius={0.014} speed={0.45} />
      ))}
      <Streaks chapter={5} path={ring} count={6} spread={0.06} radius={0.01} speed={0.2} color="#40a8de" />
      <Ridge position={[-12, 0, ORIGIN[5].z - 6]} side={-1} length={30} height={6} seed={17} />
      <Ridge position={[12, 0, ORIGIN[5].z - 6]} side={1} length={30} height={5.5} seed={19} />
    </group>
  );
}
