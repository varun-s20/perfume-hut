import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import type { BottleSpec, Finish } from '@/data/bottles';
import { finish } from './materials';
import { canvasTexture, fitText, type Fonts } from './textures';

/*
 * A perfume bottle in 3D, built from its spec (data/bottles.ts). Built in cm
 * with the base of the body at the origin, facing +z; whoever shelves it
 * scales it to display size.
 */

export type BuiltBottle = {
  group: THREE.Group;
  /** Overall size in cm, cap included. */
  width: number;
  height: number;
  depth: number;
};

/** Glass wall thickness (cm): the juice sits this far inside. */
const WALL = 0.45;

/** Draw order for see-through parts, back to front. */
const ORDER = { juice: 1, glassBack: 2, glass: 3, print: 4 } as const;

export function buildBottle(spec: BottleSpec, fonts: Fonts): BuiltBottle {
  const group = new THREE.Group();
  const [w, h, d] = spec.size;
  const body = bodyGeometry(spec);
  const bodyTop = h;

  // ---------- The glass, and what's inside it ----------
  const surface = glassMaterial(spec);
  if (spec.glass === 'clear' || spec.glass === 'frosted') {
    const juice = juiceGeometry(spec);
    if (juice && spec.juice) add(group, juice, juiceMaterial(spec.juice), ORDER.juice);
    // The far side of the glass first, so the bottle reads as a solid.
    const back = (surface as THREE.MeshPhysicalMaterial).clone();
    back.side = THREE.BackSide;
    back.opacity *= 0.7;
    add(group, body, back, ORDER.glassBack);
  }
  add(group, body, surface, spec.glass === 'opaque' ? 0 : ORDER.glass);

  // ---------- Print on the glass ----------
  const front = d / 2;
  const decals = (spec.detail ?? []).filter((detail) =>
    ['greek-key', 'stripe'].includes(detail.kind),
  );
  if (decals.length > 0) {
    const decal = new THREE.Mesh(
      new THREE.PlaneGeometry(w * 0.94, h * 0.94),
      printMaterial(decalTexture(spec, decals)),
    );
    decal.position.set(0, h / 2, front + 0.02);
    decal.renderOrder = ORDER.print;
    group.add(decal);
  }
  if (spec.label) {
    const label = labelMesh(spec, fonts);
    group.add(label);
  }
  for (const detail of spec.detail ?? []) {
    if (detail.kind === 'medallion') {
      const medal = new THREE.Mesh(
        new THREE.CylinderGeometry(w * 0.15, w * 0.15, 0.3, 40),
        finish(detail.colour as Finish),
      );
      medal.rotation.x = Math.PI / 2;
      medal.position.set(0, h * 0.56, front + 0.15);
      group.add(medal);
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(w * 0.11, 0.09, 8, 40),
        finish(detail.colour as Finish),
      );
      ring.position.set(0, h * 0.56, front + 0.32);
      group.add(ring);
    }
  }

  // ---------- Collar, cap and bow ----------
  const [cw, ch, cd] = spec.cap.size;
  let top = bodyTop;
  if (spec.collar) {
    const radius = Math.min(cw, cd) * 0.3;
    const collar = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius * 1.08, 0.8, 32),
      finish(spec.collar),
    );
    collar.position.y = top + 0.4;
    group.add(collar);
    top += 0.8;
  }
  const cap = capMesh(spec);
  cap.position.y = top;
  group.add(cap);
  if (spec.cap.band) {
    const band = new THREE.Mesh(
      spec.cap.shape === 'block'
        ? new RoundedBoxGeometry(cw * 1.02, ch * 0.16, cd * 1.02, 2, 0.08)
        : new THREE.CylinderGeometry(cw * 0.51, cw * 0.51, ch * 0.16, 40),
      finish(spec.cap.band),
    );
    band.position.y = top + ch * 0.1;
    group.add(band);
  }
  for (const detail of spec.detail ?? []) {
    if (detail.kind === 'bow') group.add(bow(detail.colour as Finish, bodyTop + 0.4, d));
  }

  const height = top + ch;
  return { group, width: Math.max(w, cw), height, depth: Math.max(d, cd) };
}

function add(
  group: THREE.Group,
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  order: number,
) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.renderOrder = order;
  group.add(mesh);
  return mesh;
}

/* ---------- Shapes ---------- */

function bodyGeometry(spec: BottleSpec): THREE.BufferGeometry {
  const [w, h, d] = spec.size;
  switch (spec.body) {
    case 'block':
    case 'flask': {
      const radius = Math.min(spec.radius ?? 0.5, d / 2 - 0.05, w / 2 - 0.05);
      const geometry = new RoundedBoxGeometry(w, h, d, spec.body === 'flask' ? 6 : 4, radius);
      geometry.translate(0, h / 2, 0);
      return geometry;
    }
    case 'round': {
      // A disc, face-on, standing on its rim.
      const geometry = new THREE.CylinderGeometry(w / 2, w / 2, d, 64, 1);
      geometry.rotateX(Math.PI / 2);
      geometry.translate(0, h / 2, 0);
      return geometry;
    }
    case 'cylinder': {
      const geometry = latheBody(
        w / 2,
        h,
        spec.detail?.some((detail) => detail.kind === 'flutes'),
      );
      return geometry;
    }
    case 'facet': {
      // A cut stone: a low-poly ellipsoid with flat facets.
      const geometry = new THREE.IcosahedronGeometry(1, 1);
      geometry.scale(w / 2, h / 2, d / 2);
      geometry.translate(0, h / 2, 0);
      geometry.computeVertexNormals();
      return geometry;
    }
  }
}

/** Round in plan with soft shoulders; fluted glass gets vertical ribs. */
function latheBody(radius: number, h: number, fluted = false) {
  const profile = [
    [0, 0],
    [radius * 0.9, 0],
    [radius, h * 0.04],
    [radius, h * 0.78],
    [radius * 0.94, h * 0.88],
    [radius * 0.66, h * 0.97],
    [radius * 0.42, h],
    [0, h],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const geometry = new THREE.LatheGeometry(profile, 64);
  if (fluted) {
    const position = geometry.attributes.position!;
    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i);
      const y = position.getY(i);
      const z = position.getZ(i);
      if (y < h * 0.06 || y > h * 0.8) continue;
      const angle = Math.atan2(x, z);
      const rib = 1 + 0.035 * Math.cos(angle * 22);
      position.setXYZ(i, x * rib, y, z * rib);
    }
    geometry.computeVertexNormals();
  }
  return geometry;
}

/** The juice: the body's shape, inset by the glass, filled most of the way. */
function juiceGeometry(spec: BottleSpec): THREE.BufferGeometry | null {
  const [w, h, d] = spec.size;
  const fill = 0.84;
  switch (spec.body) {
    case 'block':
    case 'flask': {
      const iw = w - 2 * WALL;
      const id = d - 2 * WALL;
      const ih = (h - 2 * WALL) * fill;
      const radius = Math.min(
        Math.max((spec.radius ?? 0.5) - WALL, 0.05),
        id / 2 - 0.05,
        iw / 2 - 0.05,
      );
      const geometry = new RoundedBoxGeometry(iw, ih, id, 3, radius);
      geometry.translate(0, WALL * 1.6 + ih / 2, 0);
      return geometry;
    }
    case 'round': {
      const geometry = new THREE.CylinderGeometry(w / 2 - WALL, w / 2 - WALL, d - 2 * WALL, 48);
      geometry.rotateX(Math.PI / 2);
      geometry.translate(0, h / 2, 0);
      return geometry;
    }
    case 'cylinder': {
      const radius = w / 2 - WALL;
      const ih = h * 0.74;
      const geometry = new THREE.CylinderGeometry(radius, radius, ih, 48);
      geometry.translate(0, WALL * 1.6 + ih / 2, 0);
      return geometry;
    }
    case 'facet':
      return null;
  }
}

function capMesh(spec: BottleSpec): THREE.Object3D {
  const [cw, ch, cd] = spec.cap.size;
  const material = finish(spec.cap.finish);
  let geometry: THREE.BufferGeometry;
  switch (spec.cap.shape) {
    case 'cylinder':
      geometry = new THREE.CylinderGeometry(cw / 2, cw / 2, ch, 48);
      geometry.translate(0, ch / 2, 0);
      break;
    case 'block':
      geometry = new RoundedBoxGeometry(cw, ch, cd, 3, Math.min(0.3, cd / 4));
      geometry.translate(0, ch / 2, 0);
      break;
    case 'dome': {
      const r = cw / 2;
      const profile = [
        new THREE.Vector2(0, 0),
        new THREE.Vector2(r, 0),
        new THREE.Vector2(r, ch * 0.42),
      ];
      for (let i = 1; i <= 10; i++) {
        const a = (i / 10) * (Math.PI / 2);
        profile.push(new THREE.Vector2(r * Math.cos(a), ch * 0.42 + ch * 0.58 * Math.sin(a)));
      }
      geometry = new THREE.LatheGeometry(profile, 48);
      break;
    }
    case 'facet': {
      // A cut stopper: eight facets, a little narrower at the top.
      geometry = new THREE.CylinderGeometry(cw * 0.44, cw / 2, ch, 8, 1).toNonIndexed();
      geometry.scale(1, 1, cd / cw);
      geometry.translate(0, ch / 2, 0);
      geometry.computeVertexNormals();
      break;
    }
    case 'ribbed': {
      // Stacked rings, like the magnetic cap on Sauvage.
      const r = cw / 2;
      const rings = 5;
      const profile = [new THREE.Vector2(0, 0)];
      for (let i = 0; i < rings; i++) {
        const y0 = (i / rings) * ch;
        const y1 = ((i + 1) / rings) * ch;
        profile.push(new THREE.Vector2(r * 0.93, y0 + 0.02));
        profile.push(new THREE.Vector2(r, y0 + (y1 - y0) * 0.25));
        profile.push(new THREE.Vector2(r, y0 + (y1 - y0) * 0.75));
        profile.push(new THREE.Vector2(r * 0.93, y1 - 0.02));
      }
      profile.push(new THREE.Vector2(0, ch));
      geometry = new THREE.LatheGeometry(profile, 48);
      break;
    }
  }
  const mesh = new THREE.Mesh(geometry, material);
  if (spec.cap.finish === 'clear') mesh.renderOrder = ORDER.glass;
  return mesh;
}

/** Two loops and a knot at the neck, as on Miss Dior. */
function bow(value: Finish, y: number, depth: number) {
  const group = new THREE.Group();
  const material = finish(value);
  for (const side of [-1, 1]) {
    const loop = new THREE.Mesh(new THREE.TorusGeometry(1, 0.26, 10, 28), material);
    loop.scale.set(1.15, 0.62, 0.5);
    loop.position.set(side * 1.25, 0, 0);
    loop.rotation.z = side * 0.32;
    group.add(loop);
  }
  const knot = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 12), material);
  knot.scale.set(1, 0.8, 0.7);
  group.add(knot);
  group.position.set(0, y + 0.3, depth * 0.18);
  return group;
}

/* ---------- Materials ---------- */

function glassMaterial(spec: BottleSpec): THREE.Material {
  switch (spec.glass) {
    case 'clear':
      return new THREE.MeshPhysicalMaterial({
        color: spec.tint ?? '#ffffff',
        metalness: 0,
        roughness: 0.03,
        transparent: true,
        opacity: 0.3,
        clearcoat: 1,
        clearcoatRoughness: 0.02,
        envMapIntensity: 1.8,
        depthWrite: false,
      });
    case 'frosted':
      return new THREE.MeshPhysicalMaterial({
        color: '#f4f6f7',
        roughness: 0.5,
        transparent: true,
        opacity: 0.8,
        clearcoat: 0.4,
        clearcoatRoughness: 0.3,
        envMapIntensity: 0.9,
        depthWrite: false,
      });
    case 'tinted':
      // Deep coloured glass: almost opaque, lit from within a little.
      return new THREE.MeshPhysicalMaterial({
        color: spec.tint ?? '#334455',
        emissive: spec.tint ?? '#334455',
        emissiveIntensity: 0.16,
        metalness: 0,
        roughness: 0.06,
        transparent: true,
        opacity: 0.94,
        clearcoat: 1,
        clearcoatRoughness: 0.03,
        envMapIntensity: 1.5,
      });
    case 'opaque': {
      const glitter = spec.detail?.find((detail) => detail.kind === 'glitter');
      return new THREE.MeshPhysicalMaterial({
        // Glitter carries its own colour in the texture.
        color: glitter ? '#ffffff' : (spec.tint ?? '#cccccc'),
        map: glitter ? glitterTexture(glitter.colour) : null,
        metalness: glitter ? 0.5 : 0.05,
        roughness: glitter ? 0.35 : 0.24,
        clearcoat: 1,
        clearcoatRoughness: 0.06,
        envMapIntensity: 1.2,
      });
    }
  }
}

function juiceMaterial(value: string) {
  return new THREE.MeshStandardMaterial({
    color: value,
    emissive: value,
    emissiveIntensity: 0.24,
    roughness: 0.18,
    transparent: true,
    opacity: 0.9,
  });
}

const printMaterial = (map: THREE.Texture) =>
  new THREE.MeshStandardMaterial({
    map,
    transparent: true,
    roughness: 0.45,
    metalness: 0.1,
    depthWrite: false,
  });

/* ---------- Labels and print ---------- */

/** Type on the glass, or on a printed plate; curved round a cylinder. */
function labelMesh(spec: BottleSpec, fonts: Fonts) {
  const label = spec.label!;
  const [w, h, d] = spec.size;
  const lw = w * (label.width ?? 0.6);
  const lh = h * (label.height ?? 0.3);
  const texture = labelTexture(
    label,
    fonts,
    lw / lh,
    spec.detail?.some((x) => x.kind === 'frame'),
  );
  const material = printMaterial(texture);
  let mesh: THREE.Mesh;
  if (spec.body === 'cylinder') {
    const radius = w / 2 + 0.04;
    const arc = Math.min(lw / radius, Math.PI * 0.9);
    mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, lh, 32, 1, true, -arc / 2, arc),
      material,
    );
  } else {
    mesh = new THREE.Mesh(new THREE.PlaneGeometry(lw, lh), material);
    mesh.position.z = (spec.body === 'facet' ? d * 0.42 : d / 2) + 0.03;
  }
  mesh.position.y = h * (label.at ?? 0.5);
  mesh.renderOrder = ORDER.print;
  return mesh;
}

function labelTexture(
  label: NonNullable<BottleSpec['label']>,
  fonts: Fonts,
  aspect: number,
  framed = false,
) {
  const width = 512;
  const height = Math.max(64, Math.round(width / aspect));
  return canvasTexture(width, height, (ctx, w, h) => {
    if (label.plate) {
      ctx.fillStyle = label.plate;
      ctx.fillRect(0, 0, w, h);
      if (framed) {
        ctx.strokeStyle = label.ink;
        ctx.lineWidth = Math.max(6, w * 0.035);
        ctx.strokeRect(w * 0.06, h * 0.06, w * 0.88, h * 0.88);
      }
    }
    const family = label.font === 'sans' ? fonts.sans : fonts.serif;
    const weight = label.font === 'sans' ? '600' : '400';
    const lines = label.lines;
    // The first line leads; the rest are set smaller beneath it.
    const sizes = lines.map((_, i) => (i === 0 ? 1 : 0.46));
    const total = sizes.reduce((sum, size) => sum + size, 0) + (lines.length - 1) * 0.28;
    const unit = Math.min((h * (label.plate ? 0.62 : 0.86)) / total, h);
    let y = (h - unit * total) / 2;
    ctx.fillStyle = label.ink;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    lines.forEach((line, i) => {
      const size = unit * sizes[i]!;
      const tracking = i === 0 ? 0.06 : 0.16;
      fitText(ctx, line, w * (label.plate ? 0.76 : 0.94), size, family, tracking, weight);
      ctx.fillText(line, w / 2, y);
      y += size + unit * 0.28;
    });
  });
}

/** A Greek-key border and stripes, printed across the front of the glass. */
function decalTexture(spec: BottleSpec, decals: NonNullable<BottleSpec['detail']>) {
  const [w, h] = spec.size;
  const width = 512;
  const height = Math.round((width * h) / w);
  return canvasTexture(width, height, (ctx, cw, chh) => {
    for (const decal of decals) {
      if (decal.kind === 'greek-key') {
        ctx.strokeStyle = decal.colour;
        ctx.globalAlpha = 0.75;
        ctx.lineWidth = cw * 0.012;
        const step = cw * 0.07;
        const inset = cw * 0.04;
        // A meander along each edge.
        const meander = (x0: number, y0: number, length: number, horizontal: boolean) => {
          const count = Math.floor(length / step);
          for (let i = 0; i < count; i++) {
            const a = i * step;
            const s = step * 0.8;
            const pts = [
              [0, 0],
              [0, s],
              [s, s],
              [s, s * 0.3],
              [s * 0.35, s * 0.3],
              [s * 0.35, s * 0.65],
            ];
            ctx.beginPath();
            pts.forEach(([px, py], k) => {
              const x = horizontal ? x0 + a + px! : x0 + py!;
              const y = horizontal ? y0 + py! : y0 + a + px!;
              if (k === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            });
            ctx.stroke();
          }
        };
        meander(inset, inset, cw - 2 * inset, true);
        meander(inset, chh - inset - step * 0.8, cw - 2 * inset, true);
        meander(inset, inset + step, chh - 2 * inset - 2 * step, false);
        meander(cw - inset - step * 0.8, inset + step, chh - 2 * inset - 2 * step, false);
        ctx.globalAlpha = 1;
      }
      if (decal.kind === 'stripe') {
        ctx.fillStyle = decal.colour;
        ctx.fillRect(cw * 0.18, 0, cw * 0.07, chh);
      }
    }
  });
}

function glitterTexture(value: string) {
  return canvasTexture(256, 256, (ctx, w, h) => {
    let seed = 11;
    const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    ctx.fillStyle = '#1a161c';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 1600; i++) {
      ctx.globalAlpha = 0.2 + rand() * 0.8;
      ctx.fillStyle = rand() > 0.6 ? value : '#7e6f78';
      const size = 1 + rand() * 2;
      ctx.fillRect(rand() * w, rand() * h, size, size);
    }
    ctx.globalAlpha = 1;
  });
}
