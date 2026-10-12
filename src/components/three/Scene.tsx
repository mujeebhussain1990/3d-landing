"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, Noise, Vignette } from "@react-three/postprocessing";
import { story } from "@/lib/story";
import { buildShapes } from "./shapes";
import { vertexShader, fragmentShader } from "./particles.glsl";

const FOV = 35;

function Particles({ count }: { count: number }) {
  const group = useRef<THREE.Group>(null);
  const points = useRef<THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>>(null);
  const { size, viewport, gl } = useThree();

  const geometry = useMemo(() => {
    const { targets, kind, seed } = buildShapes(count);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(targets[0], 3));
    targets.slice(1).forEach((t, i) => g.setAttribute(`aP${i + 1}`, new THREE.BufferAttribute(t, 3)));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    g.setAttribute("aKind", new THREE.BufferAttribute(kind, 1));
    return g;
  }, [count]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uFrom: { value: 0 },
          uTo: { value: 0 },
          uMix: { value: 0 },
          uGlobe: { value: 0 },
          uDim: { value: 1 },
          uIntro: { value: 0 },
          uTime: { value: 0 },
          uSize: { value: 26 },
          uPixelRatio: { value: 1 },
          uMotion: { value: 1 },
          uMouse: { value: new THREE.Vector2() },
          uMouseActive: { value: 0 },
          uTanHalfFov: { value: Math.tan(THREE.MathUtils.degToRad(FOV / 2)) },
          uAspect: { value: 1 },
          uPrimary: { value: new THREE.Color("#5fd4f4") },
          uSecondary: { value: new THREE.Color("#40a8de") },
          uArc: { value: new THREE.Color("#bff0ff") },
        },
      }),
    [],
  );

  useEffect(() => () => {
    geometry.dispose();
    material.dispose();
  }, [geometry, material]);

  const smooth = useRef({ progress: 0, x: 0, dim: 1, scale: 1, mouseX: 0, mouseY: 0, active: 0 });

  useFrame((state, delta) => {
    const s = smooth.current;
    const g = group.current;
    const p = points.current;
    if (!g || !p) return;
    const u = p.material.uniforms;
    const dt = Math.min(delta, 1 / 20);
    const mobile = size.width < 768;

    s.progress = THREE.MathUtils.damp(s.progress, story.progress, 6, dt);
    s.dim = THREE.MathUtils.damp(s.dim, story.dim, 3, dt);
    s.scale = THREE.MathUtils.damp(s.scale, story.scale, 4, dt);
    s.x = THREE.MathUtils.damp(s.x, mobile ? 0 : story.offsetX * viewport.width * 0.5, 4, dt);
    s.mouseX = THREE.MathUtils.damp(s.mouseX, story.mouse.x, 8, dt);
    s.mouseY = THREE.MathUtils.damp(s.mouseY, story.mouse.y, 8, dt);
    s.active = THREE.MathUtils.damp(s.active, story.mouse.active, 3, dt);

    let from: number, to: number, mix: number;
    if (story.direct) {
      ({ from, to, mix } = story);
    } else {
      from = Math.min(Math.floor(s.progress), 4);
      to = from + 1;
      mix = s.progress - from;
    }
    u.uFrom.value = from;
    u.uTo.value = to;
    u.uMix.value = mix;
    u.uGlobe.value = (to === 5 ? mix : 0) + (from === 5 ? 1 - mix : 0);
    u.uDim.value = s.dim;
    u.uIntro.value = story.intro;
    u.uTime.value = state.clock.elapsedTime;
    u.uPixelRatio.value = gl.getPixelRatio();
    u.uMotion.value = story.reducedMotion ? 0 : 1;
    u.uMouse.value.set(s.mouseX, s.mouseY);
    u.uMouseActive.value = s.active;
    u.uAspect.value = size.width / size.height;
    u.uSize.value = mobile ? 20 : 26;

    const t = state.clock.elapsedTime;
    const still = story.reducedMotion ? 0 : 1;
    g.position.x = s.x;
    g.position.y = mobile ? 0.35 : 0;
    g.scale.setScalar((mobile ? Math.min(1, viewport.width / 4.2) : Math.min(1, viewport.width / 7)) * s.scale);
    g.rotation.y = (Math.sin(t * 0.22) * 0.28 + s.mouseX * 0.22) * still;
    g.rotation.x = (Math.sin(t * 0.17) * 0.06 - s.mouseY * 0.14) * still;
  });

  return (
    <group ref={group}>
      <points ref={points} geometry={geometry} material={material} frustumCulled={false} />
    </group>
  );
}

export default function Scene() {
  const count = useMemo(() => (typeof window !== "undefined" && window.innerWidth < 768 ? 12000 : 26000), []);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      story.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      story.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      story.mouse.active = 1;
    };
    const leave = () => (story.mouse.active = 0);
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 h-lvh" aria-hidden>
    <Canvas
      camera={{ position: [0, 0, 7], fov: FOV, near: 0.1, far: 50 }}
      dpr={[1, 1.75]}
      gl={{ antialias: false, powerPreference: "high-performance", alpha: false, stencil: false }}
    >
      <color attach="background" args={["#05070e"]} />
      <Particles count={count} />
      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur intensity={0.85} luminanceThreshold={0.18} luminanceSmoothing={0.35} radius={0.7} />
        <Noise opacity={0.045} />
        <Vignette offset={0.25} darkness={0.75} />
      </EffectComposer>
    </Canvas>
    </div>
  );
}
