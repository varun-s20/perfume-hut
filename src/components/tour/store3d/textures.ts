import * as THREE from 'three';
import { PALETTE } from './materials';

/** CSS font stacks from next/font, so canvas type matches the page. */
export type Fonts = { serif: string; sans: string };

type Draw = (ctx: CanvasRenderingContext2D, width: number, height: number) => void;

/** A canvas drawn once, as a texture. */
export function canvasTexture(width: number, height: number, draw: Draw, colourData = true) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  draw(ctx, width, height);
  const texture = new THREE.CanvasTexture(canvas);
  if (colourData) texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

const repeating = (texture: THREE.Texture) => {
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
};

/** Seeded, so every visit draws the same marble and glitter. */
function random(seed: number) {
  let state = seed;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

/* ---------- Light ---------- */

/** A round falloff, white to clear: lamp halos, light on walls and floors. */
export const glowTexture = () =>
  canvasTexture(256, 256, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.25, 'rgba(255,255,255,0.55)');
    g.addColorStop(0.6, 'rgba(255,255,255,0.14)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });

/** The scallop a downlight throws on the wall above a cabinet: bright at the top, fanning down. */
export const scallopTexture = () =>
  canvasTexture(256, 256, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h * 0.02, 0, w / 2, h * 0.02, h * 0.98);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.3, 'rgba(255,255,255,0.5)');
    g.addColorStop(0.7, 'rgba(255,255,255,0.1)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(w * 0.42, 0);
    ctx.lineTo(w * 0.58, 0);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();
  });

/** Dark at the right-hand edge, fading out to the left: shade along a corner. */
export const edgeTexture = () =>
  canvasTexture(256, 4, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(0.7, 'rgba(255,255,255,0.35)');
    g.addColorStop(1, 'rgba(255,255,255,1)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });

/* ---------- Walls ---------- */

/** One raised moulding: a light edge where the light catches it, a dark one beneath. */
function moulding(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  s: number,
) {
  ctx.lineWidth = 3 * s;
  ctx.strokeStyle = 'rgba(14,22,32,0.55)';
  ctx.strokeRect(x + 2 * s, y + 2 * s, w, h);
  ctx.strokeStyle = 'rgba(176,192,210,0.6)';
  ctx.strokeRect(x, y, w, h);
  ctx.lineWidth = 1.2 * s;
  ctx.strokeStyle = 'rgba(214,226,238,0.35)';
  ctx.strokeRect(x + 7 * s, y + 7 * s, w - 14 * s, h - 14 * s);
}

/**
 * Slate panelling for one bay of wall (4.4 m between cabinet centres, full
 * height): skirting, a dado rail over a low panel, a tall moulded panel, and
 * the cornice. A cabinet stands at either edge of the bay.
 */
export const panellingTexture = () =>
  repeating(
    canvasTexture(1024, 838, (ctx, w, h) => {
      const m = (metres: number) => (metres / 3.6) * h;
      const across = (metres: number) => (metres / 4.4) * w;
      const top = (metres: number) => h - m(metres);
      const s = w / 1024;

      const paint = ctx.createLinearGradient(0, 0, 0, h);
      paint.addColorStop(0, '#465a71');
      paint.addColorStop(0.5, PALETTE.slate);
      paint.addColorStop(1, '#34455a');
      ctx.fillStyle = paint;
      ctx.fillRect(0, 0, w, h);

      // Skirting and cornice.
      ctx.fillStyle = PALETTE.slateDeep;
      ctx.fillRect(0, top(0.16), w, m(0.16));
      ctx.fillStyle = 'rgba(170,186,204,0.4)';
      ctx.fillRect(0, top(0.17), w, 2 * s);
      ctx.fillStyle = '#4e6279';
      ctx.fillRect(0, 0, w, m(0.24));
      ctx.fillStyle = 'rgba(190,204,220,0.45)';
      ctx.fillRect(0, m(0.24), w, 3 * s);
      ctx.fillStyle = 'rgba(14,22,32,0.4)';
      ctx.fillRect(0, m(0.24) + 3 * s, w, 4 * s);

      // Dado rail.
      ctx.fillStyle = 'rgba(190,204,220,0.4)';
      ctx.fillRect(0, top(0.96), w, 4 * s);
      ctx.fillStyle = 'rgba(14,22,32,0.45)';
      ctx.fillRect(0, top(0.96) + 4 * s, w, 5 * s);

      // The bay between two cabinets: a low panel and a tall one above it.
      const left = across(0.95);
      const width = across(3.45) - left;
      moulding(ctx, left, top(0.82), width, m(0.82 - 0.26), s);
      moulding(ctx, left, top(3.12), width, m(3.12 - 1.14), s);
    }),
  );

/** A single moulded panel, lines only, laid over painted joinery (a cabinet's side). */
export const panelTexture = () =>
  canvasTexture(256, 768, (ctx, w, h) => {
    moulding(ctx, w * 0.14, h * 0.05, w * 0.72, h * 0.9, w / 512);
  });

/** Light caught in a pane of glass: two soft diagonal bands, clear elsewhere. */
export const sheenTexture = () =>
  canvasTexture(256, 512, (ctx, w, h) => {
    const band = (from: number, width: number, alpha: number) => {
      const g = ctx.createLinearGradient(0, 0, w, h * 0.5);
      g.addColorStop(Math.max(0, from - width), 'rgba(255,255,255,0)');
      g.addColorStop(from, `rgba(255,255,255,${alpha})`);
      g.addColorStop(Math.min(1, from + width), 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    };
    band(0.28, 0.16, 0.16);
    band(0.62, 0.05, 0.1);
  });

/* ---------- Floor ---------- */

/**
 * Two 0.8 m tiles a side of polished stone, cream and slate in a checker,
 * cut from the marble photograph so the veining is real.
 */
export function floorTexture(marble: HTMLImageElement) {
  return repeating(
    canvasTexture(1024, 1024, (ctx, w, h) => {
      const tile = w / 2;
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 2; col++) {
          const x = col * tile;
          const y = row * tile;
          ctx.save();
          ctx.beginPath();
          ctx.rect(x, y, tile, tile);
          ctx.clip();
          // A different part of the slab for each tile, so the pattern doesn't repeat by eye.
          const sx = ((row * 2 + col) * marble.width) / 5;
          ctx.drawImage(marble, sx, 0, marble.width / 2, marble.height / 2, x, y, tile, tile);
          const dark = (row + col) % 2 === 1;
          ctx.globalCompositeOperation = 'multiply';
          ctx.fillStyle = dark ? '#a0abb5' : '#f2ece2';
          ctx.fillRect(x, y, tile, tile);
          ctx.restore();
        }
      }
      ctx.strokeStyle = 'rgba(60,52,48,0.35)';
      ctx.lineWidth = 2;
      for (let i = 0; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(i * tile, 0);
        ctx.lineTo(i * tile, h);
        ctx.moveTo(0, i * tile);
        ctx.lineTo(w, i * tile);
        ctx.stroke();
      }
    }),
  );
}

/** A runner down the aisle in the window dressing's dusty rose, bordered in slate and brass. */
export const runnerTexture = () =>
  repeating(
    canvasTexture(512, 512, (ctx, w, h) => {
      ctx.fillStyle = '#9b7d85';
      ctx.fillRect(0, 0, w, h);
      const field = ctx.createLinearGradient(0, 0, w, 0);
      field.addColorStop(0, 'rgba(255,255,255,0)');
      field.addColorStop(0.5, 'rgba(255,236,238,0.16)');
      field.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = field;
      ctx.fillRect(0, 0, w, h);
      // Pile: fine noise so it reads as cloth, not paint.
      const rand = random(7);
      for (let i = 0; i < 9000; i++) {
        ctx.fillStyle = rand() > 0.5 ? 'rgba(255,240,242,0.05)' : 'rgba(60,30,40,0.06)';
        ctx.fillRect(rand() * w, rand() * h, 2, 2);
      }
      const border = w * 0.09;
      ctx.fillStyle = PALETTE.slateDeep;
      ctx.fillRect(0, 0, border, h);
      ctx.fillRect(w - border, 0, border, h);
      ctx.fillStyle = PALETTE.brass;
      ctx.fillRect(border, 0, 5, h);
      ctx.fillRect(w - border - 5, 0, 5, h);
      ctx.fillRect(border + 16, 0, 2, h);
      ctx.fillRect(w - border - 18, 0, 2, h);
    }),
  );

/* ---------- Ceiling ---------- */

/**
 * The ceiling across the store's width, repeating along its length: a low
 * soffit along each wall with a lit cove, and a coffered field between.
 */
export const ceilingTexture = () =>
  repeating(
    canvasTexture(1024, 352, (ctx, w, h) => {
      const across = (metres: number) => (metres / 6.4) * w;
      ctx.fillStyle = PALETTE.plaster;
      ctx.fillRect(0, 0, w, h);
      const field = ctx.createLinearGradient(0, 0, w, 0);
      field.addColorStop(0, 'rgba(255,214,160,0.55)');
      field.addColorStop(0.16, 'rgba(255,232,200,0.2)');
      field.addColorStop(0.5, 'rgba(255,255,255,0)');
      field.addColorStop(0.84, 'rgba(255,232,200,0.2)');
      field.addColorStop(1, 'rgba(255,214,160,0.55)');
      ctx.fillStyle = field;
      ctx.fillRect(0, 0, w, h);
      // Coffers.
      const inset = across(0.95);
      const cols = 3;
      const cw = (w - 2 * inset) / cols;
      for (let c = 0; c < cols; c++) {
        const x = inset + c * cw + 14;
        ctx.fillStyle = 'rgba(120,96,70,0.1)';
        ctx.fillRect(x, 18, cw - 28, h - 36);
        ctx.strokeStyle = 'rgba(255,255,255,0.7)';
        ctx.lineWidth = 3;
        ctx.strokeRect(x + 6, 24, cw - 40, h - 48);
        ctx.strokeStyle = 'rgba(120,96,70,0.28)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, 18, cw - 28, h - 36);
      }
    }),
  );

/* ---------- The window you came in by, seen from inside ---------- */

export const shopWindowTexture = () =>
  canvasTexture(1024, 1024, (ctx, w, h) => {
    ctx.fillStyle = PALETTE.slateDeep;
    ctx.fillRect(0, 0, w, h);
    const arch = (inset: number) => {
      const r = (w - 2 * inset) / 2;
      ctx.beginPath();
      ctx.moveTo(inset, h);
      ctx.lineTo(inset, r + inset);
      ctx.arc(w / 2, r + inset, r, Math.PI, 0);
      ctx.lineTo(w - inset, h);
      ctx.closePath();
    };
    const day = ctx.createLinearGradient(0, 0, 0, h);
    day.addColorStop(0, '#fffaf0');
    day.addColorStop(1, '#efe6d8');
    arch(60);
    ctx.fillStyle = day;
    ctx.fill();
    // Glazing bars, and the fan in the arch.
    ctx.strokeStyle = PALETTE.slate;
    ctx.lineWidth = 16;
    const r = (w - 120) / 2;
    for (let i = 1; i < 4; i++) {
      const x = 60 + (i * (w - 120)) / 4;
      ctx.beginPath();
      ctx.moveTo(x, r + 60);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = r + 60; y < h; y += (h - r - 60) / 3) {
      ctx.beginPath();
      ctx.moveTo(60, y);
      ctx.lineTo(w - 60, y);
      ctx.stroke();
    }
    for (let i = 1; i < 6; i++) {
      const a = Math.PI + (i * Math.PI) / 6;
      ctx.beginPath();
      ctx.moveTo(w / 2, r + 60);
      ctx.lineTo(w / 2 + Math.cos(a) * r, r + 60 + Math.sin(a) * r);
      ctx.stroke();
    }
    arch(60);
    ctx.lineWidth = 22;
    ctx.strokeStyle = PALETTE.moulding;
    ctx.stroke();
  });

/* ---------- Cabinets ---------- */

/**
 * The lit back of a cabinet, dressed like the shop window: rose drapes in
 * soft pleats, brightest under the downlight.
 */
export const drapeTexture = () =>
  canvasTexture(256, 512, (ctx, w, h) => {
    const base = ctx.createLinearGradient(0, 0, 0, h);
    base.addColorStop(0, '#f7dcda');
    base.addColorStop(0.45, '#e9bfc2');
    base.addColorStop(1, '#c8939b');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);
    const pleats = 6;
    for (let i = 0; i < pleats; i++) {
      const x = (i / pleats) * w;
      const g = ctx.createLinearGradient(x, 0, x + w / pleats, 0);
      g.addColorStop(0, 'rgba(120,60,70,0.12)');
      g.addColorStop(0.45, 'rgba(255,255,255,0.18)');
      g.addColorStop(1, 'rgba(120,60,70,0.12)');
      ctx.fillStyle = g;
      ctx.fillRect(x, 0, w / pleats, h);
    }
    const pool = ctx.createRadialGradient(w / 2, 0, 0, w / 2, 0, h * 0.8);
    pool.addColorStop(0, 'rgba(255,244,230,0.55)');
    pool.addColorStop(1, 'rgba(255,248,236,0)');
    ctx.fillStyle = pool;
    ctx.fillRect(0, 0, w, h);
  });

/** Gold-leaf lettering on slate, like the fascia over the shop door. */
export function signTexture(
  fonts: Fonts,
  {
    title,
    eyebrow,
    width = 1024,
    height = 300,
  }: { title: string; eyebrow?: string; width?: number; height?: number },
) {
  return canvasTexture(width, height, (ctx, w, h) => {
    ctx.fillStyle = PALETTE.slate;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(201,163,91,0.85)';
    ctx.lineWidth = 3;
    ctx.strokeRect(14, 14, w - 28, h - 28);
    ctx.strokeStyle = 'rgba(201,163,91,0.4)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(24, 24, w - 48, h - 48);

    const leaf = ctx.createLinearGradient(0, h * 0.25, 0, h * 0.8);
    leaf.addColorStop(0, '#f7e2a8');
    leaf.addColorStop(0.5, '#d8ad5c');
    leaf.addColorStop(1, '#a87a35');
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = leaf;
    const titleY = eyebrow ? h * 0.6 : h * 0.53;
    fitText(ctx, title.toUpperCase(), w * 0.84, h * (eyebrow ? 0.34 : 0.42), fonts.serif, 0.12);
    ctx.fillText(title.toUpperCase(), w / 2, titleY);
    if (eyebrow) {
      ctx.font = `600 ${Math.round(h * 0.1)}px ${fonts.sans}`;
      ctx.letterSpacing = `${Math.round(h * 0.035)}px`;
      ctx.fillStyle = '#d6b679';
      ctx.fillText(eyebrow.toUpperCase(), w / 2, h * 0.27);
    }
  });
}

/** Engraved brass: the plaque on a cabinet's plinth. */
export function plaqueTexture(fonts: Fonts, text: string) {
  return canvasTexture(1024, 128, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#f0dcab');
    g.addColorStop(0.5, '#d1ad69');
    g.addColorStop(1, '#a98443');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(80,52,20,0.5)';
    ctx.lineWidth = 3;
    ctx.strokeRect(6, 6, w - 12, h - 12);
    ctx.fillStyle = '#3d2610';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    fitText(ctx, text, w * 0.9, h * 0.42, fonts.serif, 0.02);
    ctx.fillText(text, w / 2, h * 0.53);
  });
}

/** Sets the largest font (up to `size`) at which `text` fits in `width`. */
export function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  width: number,
  size: number,
  family: string,
  tracking = 0,
  weight = '400',
) {
  let px = Math.round(size);
  do {
    ctx.font = `${weight} ${px}px ${family}`;
    ctx.letterSpacing = `${(px * tracking).toFixed(1)}px`;
    if (ctx.measureText(text).width <= width) return px;
    px -= 2;
  } while (px > 8);
  return px;
}
