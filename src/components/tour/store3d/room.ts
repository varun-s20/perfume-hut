import * as THREE from 'three';
import { bottleSpecs } from '@/data/bottles';
import { STORE } from '@/lib/tour-plan';
import { buildBottle } from './bottle';
import { brass, glow, PALETTE, paint, shade, wash } from './materials';
import { type Fonts, signTexture } from './textures';

export type RoomTextures = {
  panelling: THREE.Texture;
  panel: THREE.Texture;
  edge: THREE.Texture;
  floor: THREE.Texture;
  runner: THREE.Texture;
  ceiling: THREE.Texture;
  glow: THREE.Texture;
  scallop: THREE.Texture;
  drape: THREE.Texture;
  shopWindow: THREE.Texture;
};

const { halfWidth: X, height: Y, front: FRONT, back: BACK } = STORE;
const LENGTH = FRONT - BACK;
const MID_Z = (FRONT + BACK) / 2;
/** Wall panelling repeats once per cabinet bay. */
const BAY = STORE.cabinetZ[0] - STORE.cabinetZ[1];
/** Three globes down the aisle, hung short so they don't stack up in the view. */
const PENDANTS = [-3.2, -9.6, -16];
const ARCH = { width: 2.3, rise: 1.75 };

/** A plane, turned to face along `normal` (+z unless told otherwise). */
function plane(
  w: number,
  h: number,
  material: THREE.Material,
  at: THREE.Vector3Tuple,
  turn?: THREE.EulerTuple,
) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
  mesh.position.set(...at);
  if (turn) mesh.rotation.set(...turn);
  return mesh;
}

const flat: THREE.EulerTuple = [-Math.PI / 2, 0, 0];
const overhead: THREE.EulerTuple = [Math.PI / 2, 0, 0];

/**
 * The store floor: slate panelling like the shopfront's joinery, a checker of
 * cream and slate stone with a rose runner down the aisle, a coffered cream
 * ceiling with lit coves, globe pendants like the lamp over the door, and at
 * the far end an arched niche dressed like the shop window.
 */
export function buildRoom(textures: RoomTextures, fonts: Fonts) {
  const group = new THREE.Group();

  // ---------- Walls ----------
  const panelling = (repeat: number, offset: number) => {
    const map = textures.panelling.clone();
    map.repeat.set(repeat, 1);
    map.offset.set(offset, 0);
    map.needsUpdate = true;
    return new THREE.MeshStandardMaterial({ map, roughness: 0.7 });
  };
  const zc = STORE.cabinetZ[0];
  // Bays line up so a moulded panel fills each gap between cabinets.
  group.add(
    plane(
      LENGTH,
      Y,
      panelling(LENGTH / BAY, (BACK - zc) / BAY),
      [X, Y / 2, MID_Z],
      [0, -Math.PI / 2, 0],
    ),
    plane(
      LENGTH,
      Y,
      panelling(LENGTH / BAY, (zc - FRONT) / BAY),
      [-X, Y / 2, MID_Z],
      [0, Math.PI / 2, 0],
    ),
    plane(2 * X, Y, panelling((2 * X) / BAY, 0.5 - X / BAY), [0, Y / 2, BACK]),
    plane(2 * X, Y, panelling((2 * X) / BAY, 0.5 - X / BAY), [0, Y / 2, FRONT], [0, Math.PI, 0]),
  );

  // ---------- Floor ----------
  const floorMap = textures.floor;
  floorMap.repeat.set((2 * X) / 1.6, LENGTH / 1.6);
  group.add(
    plane(
      2 * X,
      LENGTH,
      new THREE.MeshStandardMaterial({ map: floorMap, roughness: 0.2, envMapIntensity: 0.95 }),
      [0, 0, MID_Z],
      flat,
    ),
  );
  const runnerLength = 23.5;
  const runnerMap = textures.runner;
  runnerMap.repeat.set(1, runnerLength / 1.8);
  group.add(
    plane(
      1.8,
      runnerLength,
      new THREE.MeshStandardMaterial({ map: runnerMap, roughness: 0.95 }),
      [0, 0.004, 5 - runnerLength / 2],
      flat,
    ),
  );

  // A soft shadow where the floor meets each wall, so the room has corners.
  const corner = new THREE.MeshBasicMaterial({
    map: textures.edge,
    color: '#140c10',
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  });
  for (const side of [-1, 1]) {
    group.add(
      plane(
        0.7,
        LENGTH,
        corner,
        [side * (X - 0.35), 0.002, MID_Z],
        [-Math.PI / 2, 0, side > 0 ? 0 : Math.PI],
      ),
    );
  }

  // ---------- Ceiling: coffered field, soffits with a lit cove ----------
  const ceilingMap = textures.ceiling;
  ceilingMap.repeat.set(1, LENGTH / 2.2);
  group.add(
    plane(
      2 * X,
      LENGTH,
      new THREE.MeshStandardMaterial({
        map: ceilingMap,
        emissive: '#ffffff',
        emissiveMap: ceilingMap,
        emissiveIntensity: 0.32,
        roughness: 0.9,
      }),
      [0, Y, MID_Z],
      overhead,
    ),
  );
  for (const side of [-1, 1]) {
    const soffit = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.22, LENGTH),
      paint(PALETTE.plaster, 0.85),
    );
    soffit.position.set(side * (X - 0.275), Y - 0.11, MID_Z);
    const cove = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, LENGTH), glow('#ffe7c2', 2.2));
    cove.position.set(side * (X - 0.57), Y - 0.02, MID_Z);
    group.add(soffit, cove);
  }

  // ---------- Pendants: globe lamps on brass rods ----------
  // Frosted globes, lit from within: bright, but with enough form to read as glass.
  const globe = new THREE.MeshPhysicalMaterial({
    color: '#fff2df',
    emissive: '#ffcf8f',
    emissiveIntensity: 0.85,
    roughness: 0.35,
    clearcoat: 1,
  });
  const halo = new THREE.SpriteMaterial({
    map: textures.glow,
    color: PALETTE.lamp,
    transparent: true,
    opacity: 0.26,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const pool = wash(textures.glow, PALETTE.lamp, 0.16);
  for (const z of PENDANTS) {
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.34, 8), brass());
    rod.position.set(0, Y - 0.17, z);
    const rose = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.03, 24), brass());
    rose.position.set(0, Y - 0.015, z);
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.09, 24), brass());
    collar.position.set(0, Y - 0.36, z);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 20), globe);
    bulb.position.set(0, Y - 0.6, z);
    const sprite = new THREE.Sprite(halo);
    sprite.scale.setScalar(1.15);
    sprite.position.copy(bulb.position);
    group.add(rod, rose, collar, bulb, sprite, plane(3.2, 3.2, pool, [0, 0.008, z], flat));
  }

  // ---------- The window you came in by ----------
  group.add(
    plane(
      2.6,
      2.6,
      new THREE.MeshBasicMaterial({ map: textures.shopWindow }),
      [0, 1.3, FRONT - 0.01],
      [0, Math.PI, 0],
    ),
  );

  // ---------- The far end: an arched niche, dressed like the shop window ----------
  group.add(featureWall(textures, fonts));

  return group;
}

/** An arch standing on the floor: straight sides `rise` tall, then a semicircle. */
function archShape(width: number, rise: number) {
  const r = width / 2;
  const shape = new THREE.Shape();
  shape.moveTo(-r, 0);
  shape.lineTo(-r, rise);
  shape.absarc(0, rise, r, Math.PI, 0, true);
  shape.lineTo(r, 0);
  shape.closePath();
  return shape;
}

function featureWall(textures: RoomTextures, fonts: Fonts) {
  const group = new THREE.Group();
  const { width, rise } = ARCH;
  const top = rise + width / 2;

  // The niche: rose drapes, lit from above.
  const inner = new THREE.ShapeGeometry(archShape(width - 0.24, rise), 32);
  const uv = inner.attributes.uv!;
  const position = inner.attributes.position!;
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(i, (position.getX(i) + width / 2) / width, position.getY(i) / top);
  }
  const niche = new THREE.Mesh(
    inner,
    new THREE.MeshStandardMaterial({
      map: textures.drape,
      emissive: '#ffffff',
      emissiveMap: textures.drape,
      emissiveIntensity: 0.4,
      roughness: 0.9,
    }),
  );
  niche.position.z = BACK + 0.01;

  // A moulded slate surround, and pilasters either side.
  const surround = archShape(width + 0.16, rise);
  surround.holes.push(archShape(width - 0.24, rise));
  const frame = new THREE.Mesh(
    new THREE.ExtrudeGeometry(surround, { depth: 0.1, bevelEnabled: false, curveSegments: 32 }),
    paint(PALETTE.slateLight, 0.55),
  );
  frame.position.z = BACK;
  group.add(niche, frame);
  for (const side of [-1, 1]) {
    const pilaster = new THREE.Mesh(
      new THREE.BoxGeometry(0.26, top, 0.12),
      paint(PALETTE.slateLight, 0.55),
    );
    pilaster.position.set(side * (width / 2 + 0.36), top / 2, BACK + 0.06);
    const capital = new THREE.Mesh(
      new THREE.BoxGeometry(0.36, 0.08, 0.18),
      paint(PALETTE.moulding, 0.5),
    );
    capital.position.set(side * (width / 2 + 0.36), top + 0.04, BACK + 0.08);
    group.add(pilaster, capital);
  }

  // The name over it, in gold leaf.
  const signMap = signTexture(fonts, { title: 'Perfume Hut', width: 1700, height: 200 });
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(3.4, 0.4),
    new THREE.MeshStandardMaterial({
      map: signMap,
      roughness: 0.4,
      metalness: 0.3,
      emissive: '#ffffff',
      emissiveMap: signMap,
      emissiveIntensity: 0.08,
    }),
  );
  sign.position.set(0, top + 0.36, BACK + 0.02);
  group.add(sign);

  // A stone plinth with one bottle under the light.
  const plinth = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.44, 0.92, 48),
    paint(PALETTE.stone, 0.4),
  );
  plinth.position.set(0, 0.46, BACK + 0.85);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.012, 8, 48), brass());
  rim.rotation.x = Math.PI / 2;
  rim.position.set(0, 0.92, BACK + 0.85);
  group.add(plinth, rim);
  const spec = bottleSpecs['chanel-no5-eau-de-parfum'];
  if (spec) {
    const hero = buildBottle(spec, fonts);
    hero.group.scale.setScalar(0.78 / hero.height);
    hero.group.position.set(0, 0.92, BACK + 0.85);
    group.add(hero.group);
  }
  const contact = plane(1.3, 1.3, shade(textures.glow, 0.6), [0, 0.005, BACK + 0.85], flat);
  const beam = plane(1.6, 2.6, wash(textures.scallop, PALETTE.lamp, 0.16), [0, 1.6, BACK + 0.4]);
  group.add(contact, beam);
  return group;
}
