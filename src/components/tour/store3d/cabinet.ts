import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { bottleSpecs, fallbackBottle } from '@/data/bottles';
import { shelve } from '@/lib/ava-speech';
import { STORE } from '@/lib/tour-plan';
import { buildBottle } from './bottle';
import { brass, glass, glow, PALETTE, paint, shade, wash } from './materials';
import { type Fonts, plaqueTexture, signTexture } from './textures';

/** What the store needs to know about a house's cabinet. */
export type SceneCabinet = {
  slug: string;
  name: string;
  number: number;
  tagline: string;
  bottles: readonly { slug: string; name: string }[];
};

export type ShelvedBottle = {
  slug: string;
  /** Turns and lifts on its own when you look at it. */
  pivot: THREE.Group;
  /** The shelf it stands on. */
  baseY: number;
  /** An invisible box round the bottle, for the pointer. */
  hit: THREE.Mesh;
};

export type BuiltCabinet = {
  group: THREE.Group;
  hit: THREE.Mesh;
  /** Hinges of the left and right glass doors. */
  doors: [THREE.Object3D, THREE.Object3D];
  bottles: ShelvedBottle[];
  /** Turn the cabinet's own lights up and down (0 off, 1 lit, more when you're at it). */
  setGlow: (level: number) => void;
};

export type CabinetTextures = {
  drape: THREE.Texture;
  glow: THREE.Texture;
  scallop: THREE.Texture;
  panel: THREE.Texture;
  sheen: THREE.Texture;
};

/*
 * A display case like the shopfront's joinery: slate paint, pale mouldings
 * and brass, a niche lit rose like the window dressing, two glass shelves,
 * and glass doors that swing open. Local space: the front face is centred on
 * x = 0 and z = 0, the case runs back to z = -depth, y = 0 is the floor.
 */
const { width: W, height: H, depth: D, plinth: P, header: HEAD } = STORE.cabinet;
const STILE = 0.09;
const IW = W - 2 * STILE;
const IH = H - P - HEAD;
const ID = D - 0.05;
const SHELF = IH / 3;
/** Display bottles stand about seven-tenths of a shelf tall. */
const BOTTLE_HEIGHT = SHELF * 0.7;

const box = (w: number, h: number, d: number, x: number, y: number, z: number) =>
  new THREE.BoxGeometry(w, h, d).translate(x, y, z);

const merged = (parts: THREE.BufferGeometry[], material: THREE.Material) =>
  new THREE.Mesh(mergeGeometries(parts), material);

export function buildCabinet(
  cabinet: SceneCabinet,
  fonts: Fonts,
  textures: CabinetTextures,
): BuiltCabinet {
  const group = new THREE.Group();
  group.name = cabinet.slug;

  // ---------- Joinery ----------
  group.add(
    merged(
      [
        box(W, P, D, 0, P / 2, -D / 2),
        box(STILE, IH, D, -(W - STILE) / 2, P + IH / 2, -D / 2),
        box(STILE, IH, D, (W - STILE) / 2, P + IH / 2, -D / 2),
        box(W + 0.06, HEAD, D + 0.04, 0, H - HEAD / 2, -D / 2 + 0.02),
        box(W, IH, 0.02, 0, P + IH / 2, -D + 0.01),
      ],
      paint(PALETTE.slate),
    ),
    merged(
      [
        // A stepped crown, then the panels picked out in a paler slate.
        box(W + 0.12, 0.05, D + 0.1, 0, H + 0.025, -D / 2 + 0.03),
        box(W + 0.2, 0.035, D + 0.14, 0, H + 0.067, -D / 2 + 0.05),
        box(W - 0.2, P - 0.14, 0.014, 0, P / 2, 0.007),
        box(0.028, IH - 0.1, 0.012, -(W - STILE) / 2, P + IH / 2, 0.006),
        box(0.028, IH - 0.1, 0.012, (W - STILE) / 2, P + IH / 2, 0.006),
      ],
      paint(PALETTE.slateLight, 0.55),
    ),
    merged(
      [
        box(IW + 0.02, 0.014, 0.016, 0, P + 0.007, 0.008),
        box(W + 0.06, 0.012, 0.012, 0, H - HEAD - 0.004, 0.044),
        box(0.012, IH, 0.012, -IW / 2 - 0.006, P + IH / 2, 0.006),
        box(0.012, IH, 0.012, IW / 2 + 0.006, P + IH / 2, 0.006),
        // A picture light over the case.
        box(0.56, 0.03, 0.05, 0, H + 0.2, -D + 0.07),
      ],
      brass(),
    ),
  );

  // ---------- The lit niche ----------
  const interior = new THREE.MeshStandardMaterial({
    map: textures.drape,
    emissive: '#ffffff',
    emissiveMap: textures.drape,
    emissiveIntensity: 0.3,
    roughness: 0.85,
  });
  // The niche's side walls: plain rose, a shade deeper (pleats would shimmer at this angle).
  const sides = new THREE.MeshStandardMaterial({
    color: '#d9aeb3',
    emissive: '#c48d95',
    emissiveIntensity: 0.2,
    roughness: 0.85,
  });
  const back = new THREE.Mesh(new THREE.PlaneGeometry(IW, IH), interior);
  back.position.set(0, P + IH / 2, -ID);
  group.add(back);
  for (const side of [-1, 1]) {
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(ID, IH), sides);
    // Just inside the stile, so the two never fight over the same depth.
    wall.position.set(side * (IW / 2 - 0.003), P + IH / 2, -ID / 2);
    wall.rotation.y = (-side * Math.PI) / 2;
    group.add(wall);
  }
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(IW, ID), paint('#e7cdc9', 0.7));
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, P + 0.004, -ID / 2);
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(IW, ID), glow('#fff1de', 0.9));
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(0, P + IH - 0.004, -ID / 2);
  group.add(floor, ceiling);

  // Glass shelves with an LED strip under each front edge, and one under the niche's top.
  const leds = new THREE.MeshStandardMaterial({
    color: '#000000',
    emissive: '#fff3dc',
    emissiveIntensity: 0.6,
  });
  const shelves: THREE.BufferGeometry[] = [];
  const strips: THREE.BufferGeometry[] = [box(IW, 0.012, 0.02, 0, P + IH - 0.012, -0.03)];
  for (const k of [1, 2]) {
    const y = P + SHELF * k;
    shelves.push(box(IW, 0.014, ID - 0.02, 0, y, -ID / 2));
    strips.push(box(IW, 0.008, 0.012, 0, y - 0.012, -0.03));
  }
  const shelfMesh = merged(shelves, glass(0.3));
  shelfMesh.renderOrder = 5;
  group.add(shelfMesh, merged(strips, leds));

  // Moulded panels down the outside of each side, as on the shopfront's pilasters.
  const panelLines = new THREE.MeshBasicMaterial({
    map: textures.panel,
    transparent: true,
    depthWrite: false,
  });
  for (const side of [-1, 1]) {
    const lines = new THREE.Mesh(new THREE.PlaneGeometry(D - 0.06, H - P - 0.06), panelLines);
    lines.position.set(side * (W / 2 + 0.002), P + (H - P) / 2 - 0.02, -D / 2);
    lines.rotation.y = (side * Math.PI) / 2;
    group.add(lines);
  }

  // ---------- Signage ----------
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(W - 0.08, HEAD - 0.08),
    new THREE.MeshStandardMaterial({
      map: signTexture(fonts, {
        title: cabinet.name,
        eyebrow: `No. ${String(cabinet.number).padStart(2, '0')}`,
        width: 1024,
        height: Math.round((1024 * (HEAD - 0.08)) / (W - 0.08)),
      }),
      roughness: 0.45,
      metalness: 0.25,
    }),
  );
  sign.position.set(0, H - HEAD / 2, 0.042);
  const plaque = new THREE.Mesh(
    new THREE.PlaneGeometry(0.86, 0.086),
    new THREE.MeshStandardMaterial({
      map: plaqueTexture(fonts, cabinet.tagline),
      roughness: 0.35,
      metalness: 0.55,
    }),
  );
  plaque.position.set(0, P / 2, 0.016);
  group.add(sign, plaque);

  // ---------- Light it throws around it ----------
  const washes = [
    wash(textures.scallop, PALETTE.lamp, 0.42),
    wash(textures.glow, PALETTE.lamp, 0.34),
  ];
  const scallop = new THREE.Mesh(new THREE.PlaneGeometry(2, 1.3), washes[0]);
  scallop.position.set(0, H + 0.55, -D + 0.006);
  const spill = new THREE.Mesh(new THREE.PlaneGeometry(2, 1.5), washes[1]);
  spill.rotation.x = -Math.PI / 2;
  spill.position.set(0, 0.006, 0.7);
  const contact = new THREE.Mesh(
    new THREE.PlaneGeometry(W + 0.5, D + 0.6),
    shade(textures.glow, 0.7),
  );
  contact.rotation.x = -Math.PI / 2;
  contact.position.set(0, 0.004, -D / 2 + 0.06);
  group.add(scallop, spill, contact);

  // ---------- Doors ----------
  const pane = new THREE.MeshBasicMaterial({
    map: textures.sheen,
    transparent: true,
    depthWrite: false,
  });
  const door = (side: -1 | 1) => {
    const hinge = new THREE.Group();
    hinge.position.set((side * IW) / 2, P + IH / 2, 0.016);
    const dw = IW / 2 - 0.004;
    const dh = IH - 0.004;
    // The door runs from its hinge towards the middle of the case.
    const cx = (-side * dw) / 2;
    const frame = merged(
      [
        box(dw, 0.02, 0.014, cx, dh / 2 - 0.01, 0),
        box(dw, 0.02, 0.014, cx, -dh / 2 + 0.01, 0),
        box(0.02, dh, 0.014, cx - dw / 2 + 0.01, 0, 0),
        box(0.02, dh, 0.014, cx + dw / 2 - 0.01, 0, 0),
        // The handle, where the doors meet.
        box(0.012, 0.16, 0.03, -side * (dw - 0.04), 0, 0.012),
      ],
      brass(),
    );
    const glazing = new THREE.Mesh(new THREE.PlaneGeometry(dw - 0.03, dh - 0.03), pane);
    glazing.position.x = cx;
    glazing.renderOrder = 6;
    hinge.add(frame, glazing);
    group.add(hinge);
    return hinge;
  };
  const doors: [THREE.Object3D, THREE.Object3D] = [door(-1), door(1)];

  // ---------- Bottles, standing at mid-depth on each shelf ----------
  const bottles: ShelvedBottle[] = [];
  const rows = shelve(cabinet.bottles);
  rows.forEach((row, r) => {
    // Rows run top to bottom; each stands on the shelf beneath it.
    const floorY = P + SHELF * (2 - r) + (r < 2 ? 0.007 : 0);
    const slot = IW / Math.max(row.length, 1);
    row.forEach((item, j) => {
      const built = buildBottle(bottleSpecs[item.slug] ?? fallbackBottle, fonts);
      const scale = Math.min(
        BOTTLE_HEIGHT / built.height,
        (slot * 0.78) / built.width,
        (ID * 0.7) / built.depth,
      );
      const pivot = new THREE.Group();
      pivot.position.set(-IW / 2 + slot * (j + 0.5), floorY, -ID * 0.5);
      built.group.scale.setScalar(scale);
      pivot.add(built.group);

      const footprint = new THREE.Mesh(
        new THREE.PlaneGeometry(built.width * scale * 1.5, built.depth * scale * 2.2),
        shade(textures.glow, 0.5),
      );
      footprint.rotation.x = -Math.PI / 2;
      footprint.position.y = 0.002;
      pivot.add(footprint);

      const hit = new THREE.Mesh(
        new THREE.BoxGeometry(built.width * scale, built.height * scale, built.depth * scale),
      );
      hit.position.y = (built.height * scale) / 2;
      hit.visible = false;
      hit.userData = { bottle: item.slug };
      pivot.add(hit);

      group.add(pivot);
      bottles.push({ slug: item.slug, pivot, baseY: floorY, hit });
    });
  });

  // The whole case, for pointing at it on the floor.
  const hit = new THREE.Mesh(new THREE.BoxGeometry(W, H, D));
  hit.position.set(0, H / 2, -D / 2);
  hit.visible = false;
  group.add(hit);

  const setGlow = (level: number) => {
    interior.emissiveIntensity = 0.08 + level * 0.4;
    sides.emissiveIntensity = 0.05 + level * 0.22;
    leds.emissiveIntensity = 0.4 + level * 1.8;
    washes[0]!.opacity = 0.1 + level * 0.38;
    washes[1]!.opacity = 0.04 + level * 0.16;
  };
  setGlow(0);

  return { group, hit, doors, bottles, setGlow };
}
