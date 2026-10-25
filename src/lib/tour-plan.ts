/**
 * The walk through the store, as plain numbers: the room's geometry, where the
 * camera stands along the way, and how much scrolling each part takes.
 *
 * Units: world lengths are in metres (x to the right as you walk in, y up from
 * the floor, z back towards the door: the store runs away from you down -z).
 * Scroll positions are in `svh` from the top of the tour.
 */

export type Vec3 = readonly [number, number, number];
export type Wall = 'left' | 'right';
export type Side = 'left' | 'right';
export type Layout = 'wide' | 'narrow';

export const STORE = {
  /** Half the width of the floor. */
  halfWidth: 3.2,
  height: 3.6,
  /** The shopfront wall behind you as you enter, and the feature wall at the far end. */
  front: 8,
  back: -21,
  /** Cabinet centres along each wall, near to far. */
  cabinetZ: [-3, -7.4, -11.8, -16.2],
  /** A display case standing against the wall: plinth, lit niche, then a header with the house name. */
  cabinet: { width: 1.3, height: 2.5, depth: 0.5, plinth: 0.42, header: 0.38 },
} as const;

/** Cabinets go down the right wall, then back up the left one: a loop of the floor. */
export function cabinetPlacement(index: number): { wall: Wall; z: number } {
  const perWall = STORE.cabinetZ.length;
  return index < perWall
    ? { wall: 'right', z: STORE.cabinetZ[index]! }
    : { wall: 'left', z: STORE.cabinetZ[2 * perWall - 1 - index]! };
}

/** The x of a cabinet's front face. */
export const cabinetFrontX = (wall: Wall) =>
  (STORE.halfWidth - STORE.cabinet.depth) * (wall === 'right' ? 1 : -1);

/** The middle of a cabinet's lit niche, on its front face. */
export function cabinetCentre(index: number): Vec3 {
  const { wall, z } = cabinetPlacement(index);
  const { plinth, height, header } = STORE.cabinet;
  return [cabinetFrontX(wall), (plinth + height - header) / 2, z];
}

/**
 * Where the camera stands, what it looks at, and a lens shift that moves what
 * it looks at off centre (a share of the screen; x to the right, y up), so the
 * subject can make room for the words beside or beneath it.
 */
export type Pose = { position: Vec3; target: Vec3; shift: readonly [number, number] };

/** `side`: the half of the screen Ava takes when she's on (lib/flags.ts). */
export type Stop =
  | { kind: 'intro'; at: number; side: Side }
  | { kind: 'cabinet'; cabinet: number; at: number; side: Side };

/** A camera keyframe at a scroll position; `stop` marks the ones the walk is about. */
export type Key = { at: number; pose: Pose; stop?: number };

export type TourPlan = {
  /** When you're through the door and the lights come up. */
  arrival: number;
  /** The floor fades up as you step through the window. */
  reveal: [number, number];
  stops: Stop[];
  keys: Key[];
  /** Total scroll distance of the tour (svh). */
  length: number;
};

/** Scroll budget (svh). The entrance before `walkIn` is timed in StoreTour. */
const TIMING = {
  walkIn: [166, 238] as [number, number],
  reveal: [186, 196] as [number, number],
  arrival: 222,
  /** From the overview to the first cabinet, and between neighbours on a wall. */
  first: 76,
  move: 68,
  /** Turning from one wall to the other, past the feature wall, takes longer. */
  turn: 120,
  /** The last look back down the floor before the page moves on. */
  farewell: 72,
};

const radians = (degrees: number) => (degrees * Math.PI) / 180;

/**
 * At a cabinet you stand off to the side you came from and turn in: a
 * three-quarter view, so the wall recedes and you see into the case.
 * Phones stand closer and leave the bottom of the screen for the words.
 */
const VIEW = {
  wide: { distance: 4.9, angle: 30, eye: 1.6, shift: [0.08, 0.03] },
  narrow: { distance: 3.9, angle: 24, eye: 1.5, shift: [0, 0.14] },
} as const;

/** Stepping inside a cabinet: face it square on, close enough to read the shelves. */
const OPEN = {
  wide: { distance: 4.1, eye: 1.42, shift: [0.2, 0] },
  narrow: { distance: 3.6, eye: 1.5, shift: [0, 0.22] },
} as const;

const DOORWAY: Pose = { position: [0, 1.6, 7.2], target: [0, 1.45, -6], shift: [0, 0] };
const OVERVIEW: Record<Layout, Pose> = {
  wide: { position: [0, 1.65, 4.2], target: [0, 1.35, -10], shift: [0, 0.04] },
  narrow: { position: [0, 1.55, 4.6], target: [0, 1.3, -10], shift: [0, 0.1] },
};
/** Halfway round the loop: facing the feature wall at the far end. */
const TURN: Pose = { position: [0, 1.6, -13.4], target: [0, 1.55, STORE.back], shift: [0, 0.04] };
const FAREWELL: Record<Layout, Pose> = {
  wide: { position: [0, 1.75, 3.6], target: [0, 1.3, -12], shift: [0, 0] },
  narrow: { position: [0, 1.65, 4], target: [0, 1.3, -12], shift: [0, 0.06] },
};

/** Where the camera stands to show a cabinet on the walk. */
export function cabinetPose(index: number, layout: Layout): Pose {
  const { wall, z } = cabinetPlacement(index);
  const { distance, angle, eye, shift } = VIEW[layout];
  const centre = cabinetCentre(index);
  const facing = wall === 'right' ? 1 : -1;
  // Down the right wall you arrive from the door (+z); back up the left, from the far end.
  const approach = wall === 'right' ? 1 : -1;
  return {
    position: [
      centre[0] - facing * distance * Math.cos(radians(angle)),
      eye,
      z + approach * distance * Math.sin(radians(angle)),
    ],
    target: centre,
    shift,
  };
}

/** Standing square on to a cabinet you've stepped inside. */
export function openPose(index: number, layout: Layout): Pose {
  const { wall, z } = cabinetPlacement(index);
  const { distance, eye, shift } = OPEN[layout];
  const front = cabinetFrontX(wall);
  const facing = wall === 'right' ? 1 : -1;
  const { plinth, height } = STORE.cabinet;
  // Phones frame the header too: the name is part of the picture there.
  const y = layout === 'wide' ? cabinetCentre(index)[1] + 0.08 : (plinth + height) / 2;
  return { position: [front - facing * distance, eye, z], target: [front, y, z], shift };
}

export function planTour(cabinetCount: number, layout: Layout): TourPlan {
  const stops: Stop[] = [{ kind: 'intro', at: TIMING.walkIn[1], side: 'left' }];
  const keys: Key[] = [
    { at: TIMING.walkIn[0], pose: DOORWAY },
    { at: TIMING.walkIn[1], pose: OVERVIEW[layout], stop: 0 },
  ];

  let t = TIMING.walkIn[1];
  for (let i = 0; i < cabinetCount; i++) {
    const turning = i > 0 && cabinetPlacement(i).wall !== cabinetPlacement(i - 1).wall;
    if (turning) {
      keys.push({ at: t + TIMING.turn / 2, pose: TURN });
      t += TIMING.turn;
    } else {
      t += i === 0 ? TIMING.first : TIMING.move;
    }
    keys.push({ at: t, pose: cabinetPose(i, layout), stop: stops.length });
    stops.push({ kind: 'cabinet', cabinet: i, at: t, side: i % 2 === 0 ? 'left' : 'right' });
  }

  t += TIMING.farewell;
  keys.push({ at: t, pose: FAREWELL[layout] });

  return { arrival: TIMING.arrival, reveal: TIMING.reveal, stops, keys, length: t };
}

/* ==========================================================================
   Following the walk
   ========================================================================== */

/**
 * How much the walk eases off at each keyframe: 0 is constant speed, 1 comes
 * to a dead stop. Just enough to linger at a cabinet without ever halting.
 */
const SETTLE = 0.55;
const settle = (s: number) => s - (SETTLE * Math.sin(2 * Math.PI * s)) / (2 * Math.PI);

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const mix = (a: Vec3, b: Vec3, t: number): Vec3 => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
  lerp(a[2], b[2], t),
];
const distance = (a: Vec3, b: Vec3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

/**
 * Centripetal Catmull–Rom between p1 and p2: a smooth path through every
 * keyframe that never overshoots or loops on tight turns.
 */
function catmullRom(p0: Vec3, p1: Vec3, p2: Vec3, p3: Vec3, t: number): Vec3 {
  const knot = (a: Vec3, b: Vec3) => Math.max(Math.sqrt(distance(a, b)), 1e-4);
  const t1 = knot(p0, p1);
  const t2 = t1 + knot(p1, p2);
  const t3 = t2 + knot(p2, p3);
  const u = lerp(t1, t2, t);
  const a1 = mix(p0, p1, u / t1);
  const a2 = mix(p1, p2, (u - t1) / (t2 - t1));
  const a3 = mix(p2, p3, (u - t2) / (t3 - t2));
  const b1 = mix(a1, a2, u / t2);
  const b2 = mix(a2, a3, (u - t1) / (t3 - t1));
  return mix(b1, b2, (u - t1) / (t2 - t1));
}

/** Mirrors a neighbour past an end, so the path leaves the first key and reaches the last one naturally. */
const beyond = (end: Vec3, next: Vec3): Vec3 => [
  2 * end[0] - next[0],
  2 * end[1] - next[1],
  2 * end[2] - next[2],
];

/** The camera at a scroll position: always moving, easing a little at each key. */
export function poseAt(plan: TourPlan, position: number): Pose {
  const { keys } = plan;
  const first = keys[0]!;
  const last = keys.at(-1)!;
  if (position <= first.at) return first.pose;
  if (position >= last.at) return last.pose;

  let i = 0;
  while (keys[i + 1]!.at < position) i++;
  const from = keys[i]!;
  const to = keys[i + 1]!;
  const s = settle((position - from.at) / (to.at - from.at));
  const point = (pick: (pose: Pose) => Vec3) => {
    const p1 = pick(from.pose);
    const p2 = pick(to.pose);
    const p0 = i > 0 ? pick(keys[i - 1]!.pose) : beyond(p1, p2);
    const p3 = i + 2 < keys.length ? pick(keys[i + 2]!.pose) : beyond(p2, p1);
    return catmullRom(p0, p1, p2, p3, s);
  };
  return {
    position: point((pose) => pose.position),
    target: point((pose) => pose.target),
    shift: [
      lerp(from.pose.shift[0], to.pose.shift[0], s),
      lerp(from.pose.shift[1], to.pose.shift[1], s),
    ],
  };
}

/** Within this much scroll of a stop, you're standing at it rather than walking past. */
const AT_STOP = 18;

/** The stop you're nearest (the words follow it), and whether you're between stops. */
export function stopAt(plan: TourPlan, position: number): { index: number; moving: boolean } {
  let index = 0;
  plan.stops.forEach((stop, i) => {
    if (Math.abs(position - stop.at) < Math.abs(position - plan.stops[index]!.at)) index = i;
  });
  return { index, moving: Math.abs(position - plan.stops[index]!.at) > AT_STOP };
}

/**
 * Vertical field of view (degrees) for a screen's aspect ratio: tall phone
 * screens open it up so a cabinet still fits across them.
 */
export function fieldOfView(aspect: number): number {
  const minimumAcross = radians(30);
  const needed = (2 * Math.atan(Math.tan(minimumAcross / 2) / aspect) * 180) / Math.PI;
  return Math.min(62, Math.max(42, needed));
}

/**
 * Screen position of a world point for a pose, as a share of the screen from
 * its centre (x right, y up; ±0.5 is the edge), or null when it's behind the
 * camera. The 3D camera does the same sum, lens shift included.
 */
export function project(pose: Pose, point: Vec3, aspect: number) {
  const [px, py, pz] = pose.position;
  const forward = normalise([pose.target[0] - px, pose.target[1] - py, pose.target[2] - pz]);
  const right = normalise(cross(forward, [0, 1, 0]));
  const up = cross(right, forward);
  const d: Vec3 = [point[0] - px, point[1] - py, point[2] - pz];
  const depth = dot(d, forward);
  if (depth <= 0) return null;
  const halfHeight = Math.tan(radians(fieldOfView(aspect)) / 2);
  const scale = 1 / (depth * halfHeight);
  return {
    x: (dot(d, right) * scale) / (2 * aspect) + pose.shift[0],
    y: (dot(d, up) * scale) / 2 + pose.shift[1],
    /** Screen heights per metre at that depth. */
    scale: scale / 2,
  };
}

const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const normalise = (v: Vec3): Vec3 => {
  const length = Math.hypot(...v) || 1;
  return [v[0] / length, v[1] / length, v[2] / length];
};
