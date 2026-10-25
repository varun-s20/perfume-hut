import * as THREE from 'three';
import type { Finish } from '@/data/bottles';

/**
 * The store's colours, taken from the shopfront you walk in through: slate
 * joinery with pale mouldings, dusty-rose window dressing, warm globe lamps,
 * cream plaster and brass.
 */
export const PALETTE = {
  slate: '#3e5066',
  slateDeep: '#26343f',
  slateLight: '#5c7088',
  moulding: '#8a9cb0',
  plaster: '#ece5d8',
  stone: '#ddd5c6',
  blush: '#f1d6d6',
  rose: '#c79ea5',
  mauve: '#a2838b',
  brass: '#c9a35b',
  brassLight: '#e8cf98',
  lamp: '#ffe4b8',
  daylight: '#f6f0e6',
} as const;

export const colour = (value: string) => new THREE.Color(value);

const cache = new Map<string, THREE.Material>();
const cached = <T extends THREE.Material>(key: string, make: () => T): T => {
  let material = cache.get(key) as T | undefined;
  if (!material) {
    material = make();
    cache.set(key, material);
  }
  return material;
};

/** Painted joinery: slate, soft satin. */
export const paint = (value: string, roughness = 0.62) =>
  cached(
    `paint:${value}:${roughness}`,
    () => new THREE.MeshStandardMaterial({ color: value, roughness, metalness: 0 }),
  );

export const brass = () =>
  cached(
    'brass',
    () => new THREE.MeshStandardMaterial({ color: PALETTE.brass, metalness: 1, roughness: 0.32 }),
  );

/** Something that gives off light: LED strips, lamp globes, lit glass. */
export const glow = (value: string, intensity = 1) =>
  cached(
    `glow:${value}:${intensity}`,
    () =>
      new THREE.MeshStandardMaterial({
        color: '#000000',
        emissive: value,
        emissiveIntensity: intensity,
        roughness: 1,
      }),
  );

/** Soft light thrown on walls and floors: an additive sprite of a glow texture. */
export const wash = (map: THREE.Texture, value: string, opacity = 1) =>
  new THREE.MeshBasicMaterial({
    map,
    color: value,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  });

/** A soft dark pool under something standing on a surface. */
export const shade = (map: THREE.Texture, opacity = 0.55) =>
  new THREE.MeshBasicMaterial({
    map,
    color: '#1b1012',
    transparent: true,
    opacity,
    depthWrite: false,
  });

export const glass = (opacity = 0.16) =>
  cached(
    `glass:${opacity}`,
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#ffffff',
        metalness: 0,
        roughness: 0.04,
        transparent: true,
        opacity,
        clearcoat: 1,
        clearcoatRoughness: 0.03,
        envMapIntensity: 1.4,
        depthWrite: false,
      }),
  );

/** Metals and lacquers for caps, collars and medallions. */
export function finish(value: Finish): THREE.Material {
  return cached(`finish:${value}`, () => {
    switch (value) {
      case 'gold':
        return new THREE.MeshPhysicalMaterial({
          color: '#dcb263',
          metalness: 1,
          roughness: 0.2,
          envMapIntensity: 1.3,
        });
      case 'silver':
        return new THREE.MeshPhysicalMaterial({
          color: '#dfe1e6',
          metalness: 1,
          roughness: 0.14,
          envMapIntensity: 1.3,
        });
      case 'gunmetal':
        return new THREE.MeshPhysicalMaterial({
          color: '#55585f',
          metalness: 1,
          roughness: 0.28,
        });
      case 'black':
        return new THREE.MeshPhysicalMaterial({
          color: '#101013',
          metalness: 0.15,
          roughness: 0.22,
          clearcoat: 1,
          clearcoatRoughness: 0.08,
        });
      case 'white':
        return new THREE.MeshPhysicalMaterial({
          color: '#f3f2ee',
          roughness: 0.34,
          clearcoat: 0.6,
        });
      case 'clear':
        return new THREE.MeshPhysicalMaterial({
          color: '#ffffff',
          metalness: 0,
          roughness: 0.02,
          transparent: true,
          opacity: 0.42,
          clearcoat: 1,
          envMapIntensity: 1.8,
          depthWrite: false,
        });
      default:
        // A lacquer in any colour.
        return new THREE.MeshPhysicalMaterial({
          color: value,
          metalness: 0.2,
          roughness: 0.26,
          clearcoat: 1,
          clearcoatRoughness: 0.08,
        });
    }
  });
}

/** Frees everything the cache built (when the store is torn down). */
export function disposeMaterials() {
  for (const material of cache.values()) material.dispose();
  cache.clear();
}
