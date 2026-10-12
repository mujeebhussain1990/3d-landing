import * as THREE from "three";

// One continuous world laid out along -Z. Each chapter is a place; the camera
// travels between them as the visitor scrolls.

export const CHAPTERS = 6;

export const journey = {
  /** damped chapter position: 0 = monolith … 5 = five beams; fractions are in flight */
  progress: 0,
};

/** Where each chapter's scene sits */
export const ORIGIN = [0, -32, -64, -96, -128, -160].map((z) => new THREE.Vector3(0, 0, z));

type Key = { pos: THREE.Vector3; look: THREE.Vector3 };
const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/** Camera stops, desktop framing (phones pull back a little) */
export const KEYS: Key[] = [
  { pos: v(0, 1.3, 9.5), look: v(0, 0.9, 0) },
  { pos: v(0, 4.6, -19), look: v(0, 0, -36) },
  { pos: v(0, 1.2, -52), look: v(0, 2.2, -66) },
  { pos: v(0, 1.6, -84), look: v(0, 3.2, -98) },
  { pos: v(0, 0.4, -111), look: v(0, 5.4, -130) },
  { pos: v(0, 8.5, -138), look: v(0, -3.2, -160) },
];

/** 1 when the camera sits on chapter `i`, falling to 0 a chapter away */
export function presence(i: number) {
  return Math.max(0, 1 - Math.abs(journey.progress - i));
}
