"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, Noise, Vignette, ChromaticAberration } from "@react-three/postprocessing";
import { prefersReducedMotion } from "@/lib/story";
import { journey, KEYS } from "./journey";
import { Arrival, Beams, Network, Offices, Spiral, Valley, Water } from "./scenes";

const ease = (t: number) => t * t * (3 - 2 * t);
const tmp = { pos: new THREE.Vector3(), look: new THREE.Vector3(), lookNow: new THREE.Vector3() };

/** Flies the camera between chapter stops, with a little handheld drift and cursor parallax */
function CameraRig() {
  const { size } = useThree();
  const pointer = useRef({ x: 0, y: 0 });
  const look = useRef(new THREE.Vector3().copy(KEYS[0].look));

  useEffect(() => {
    const move = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / innerWidth) * 2 - 1;
      pointer.current.y = -(e.clientY / innerHeight) * 2 + 1;
    };
    addEventListener("pointermove", move, { passive: true });
    return () => removeEventListener("pointermove", move);
  }, []);

  useFrame((s, delta) => {
    const camera = s.camera;
    const p = THREE.MathUtils.clamp(journey.progress, 0, KEYS.length - 1);
    const i = Math.min(Math.floor(p), KEYS.length - 2);
    const t = ease(p - i);
    const A = KEYS[i], B = KEYS[i + 1];
    tmp.pos.lerpVectors(A.pos, B.pos, t);
    tmp.look.lerpVectors(A.look, B.look, t);
    // mid-flight, rise a touch so the move reads as travel, not a dolly
    tmp.pos.y += Math.sin(Math.PI * t) * 1.2;

    const still = prefersReducedMotion() ? 0 : 1;
    const time = s.clock.elapsedTime;
    const mobile = size.width < 768;
    tmp.pos.x += (pointer.current.x * 0.6 + Math.sin(time * 0.3) * 0.12) * still;
    tmp.pos.y += (pointer.current.y * 0.3 + Math.sin(time * 0.4) * 0.06) * still;
    if (mobile) tmp.pos.z += 4;

    // generous cap: a slow device still arrives, a dropped frame does not teleport
    const dt = Math.min(delta, 0.25);
    camera.position.x = THREE.MathUtils.damp(camera.position.x, tmp.pos.x, 4, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, tmp.pos.y, 4, dt);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, tmp.pos.z, 4, dt);
    look.current.lerp(tmp.look, 1 - Math.pow(0.02, dt));
    camera.lookAt(look.current);
  });
  return null;
}

export default function MonolithCanvas() {
  const host = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(true);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setLive(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={host} aria-hidden className="absolute inset-0">
      <Canvas
        frameloop={live ? "always" : "never"}
        camera={{ position: KEYS[0].pos.toArray(), fov: 42, near: 0.1, far: 120 }}
        dpr={[1, 1.75]}
        gl={{ antialias: false, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1 }}
      >
        <color attach="background" args={["#03050c"]} />
        <fog attach="fog" args={["#050a18", 14, 46]} />
        <hemisphereLight args={["#1b3a7a", "#02040a", 0.6]} />
        {/* hard side light: the ridges catch it like moonlit snow */}
        <directionalLight position={[14, 9, 4]} intensity={2.2} color="#5fb6ff" />
        <directionalLight position={[-10, 6, -20]} intensity={0.8} color="#1e56c8" />
        <CameraRig />
        <Water />
        <Arrival />
        <Valley />
        <Network />
        <Beams />
        <Spiral />
        <Offices />
        <EffectComposer multisampling={0}>
          <Bloom mipmapBlur intensity={1.1} luminanceThreshold={0.35} luminanceSmoothing={0.25} radius={0.75} />
          <ChromaticAberration offset={new THREE.Vector2(0.0009, 0.0006)} radialModulation modulationOffset={0.3} />
          <Noise opacity={0.035} />
          <Vignette offset={0.2} darkness={0.85} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
