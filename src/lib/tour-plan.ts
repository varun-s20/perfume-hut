/**
 * The walk through the store, as plain numbers: the room's geometry, where the
 * camera stands at each stop, and how much scrolling each part takes.
 *
 * Units: lengths are in `cqh` of the stage (100 = the screen's height); scroll
 * positions are in `svh` from the top of the tour. The room is a corridor seen
 * with CSS perspective: x to the right, y down, z towards you, eye at y = 0.
 */

export const ROOM = {
  /** Perspective distance: a surface this far from the camera shows at 1:1. */
  perspective: 100,
  /** Half the corridor's width. */
  halfWidth: 110,
  ceiling: -62,
  floor: 48,
  /** The walls run from behind where you stand to the feature wall at the back. */
  front: 200,
  back: -470,
  /** Cabinet centres along each wall, near to far. */
  cabinetZ: [-110, -200, -290, -380] as const,
  /** Cabinets stand against the wall: their front face is `depth` out from it. */
  cabinet: { width: 44, height: 88, depth: 18, centreY: 4 },
} as const;

export type Wall = 'left' | 'right';
export type Side = 'left' | 'right';
export type Layout = 'wide' | 'narrow';
export type Camera = { x: number; y: number; z: number; yaw: number };

/** Cabinets go down the right wall, then back up the left one: a loop of the floor. */
export function cabinetPlacement(index: number): { wall: Wall; z: number } {
  const perWall = ROOM.cabinetZ.length;
  return index < perWall
    ? { wall: 'right', z: ROOM.cabinetZ[index]! }
    : { wall: 'left', z: ROOM.cabinetZ[2 * perWall - 1 - index]! };
}

/** `side`: the half of the screen the guide (Ava, or the placard) takes; the cabinet takes the other. */
export type Stop =
  | { kind: 'intro'; hold: [number, number]; camera: Camera; side: Side }
  | { kind: 'cabinet'; cabinet: number; hold: [number, number]; camera: Camera; side: Side }
  | { kind: 'outro'; hold: [number, number]; camera: Camera; side: Side };

export type TourPlan = {
  /** When you're through the door and the floor greets you. */
  arrival: number;
  /** The gallery fades up as you step through the window. */
  reveal: [number, number];
  stops: Stop[];
  /** Camera keyframes over scroll position. */
  keys: { at: number[]; cameras: Camera[]; moving: boolean[] };
  /** Total scroll distance of the tour (svh). */
  length: number;
};

/** Scroll budget (svh). The entrance before this is defined in StoreTour. */
const TIMING = {
  reveal: [170, 205] as [number, number],
  arrival: 223,
  walkIn: [166, 238] as [number, number],
  introHold: 62,
  move: 34,
  /** Turning from one wall to the other takes a little longer. */
  turn: 64,
  hold: 48,
  outroMove: 44,
  outroHold: 64,
};

const degrees = (angle: number) => (angle * Math.PI) / 180;

/**
 * Where you stand at a cabinet: distance from its front face, sideways shift
 * along the wall, eye height, and how far you turn back towards it (degrees).
 * Standing off to one side and turning in gives a three-quarter view: the
 * wall recedes and you see into the case, rather than facing it flat.
 */
const VIEW = {
  wide: { distance: 124, shift: 58, y: 0, turn: 12 },
  // Phones: stand further back so the whole cabinet fits above the guide,
  // looking up a little, and turn in exactly enough to centre it.
  narrow: { distance: 190, shift: 190 * Math.tan(degrees(8)), y: 30, turn: 8 },
};

const OVERVIEW: Record<Layout, Camera> = {
  wide: { x: 0, y: 0, z: 150, yaw: 0 },
  // Phones are tall: stand a little lower so the floor, not the ceiling, fills the screen.
  narrow: { x: 0, y: 14, z: 150, yaw: 0 },
};
const DOORWAY: Camera = { x: 0, y: 0, z: 330, yaw: 0 };

/** The x of a cabinet's front face. */
export const cabinetFrontX = (wall: Wall) =>
  (ROOM.halfWidth - ROOM.cabinet.depth) * (wall === 'right' ? 1 : -1);

/**
 * Where the camera stands to show a cabinet, with the cabinet on the opposite
 * side of the screen from the guide.
 */
export function cabinetCamera(index: number, side: Side, layout: Layout): Camera {
  const { wall, z } = cabinetPlacement(index);
  const { distance, shift, y, turn } = VIEW[layout];
  const facing = wall === 'right' ? 1 : -1;
  const x = cabinetFrontX(wall) - distance * facing;
  // Looking right, deeper is screen-left; looking left, deeper is screen-right.
  const cabinetOnRight = side === 'left';
  const towardsEntrance = wall === 'right' ? !cabinetOnRight : cabinetOnRight;
  // Turning towards +z is a larger yaw on the right wall, a smaller one on the left.
  const turnTowardsEntrance = towardsEntrance ? -1 : 1;
  return {
    x,
    y,
    z: z + (towardsEntrance ? shift : -shift),
    yaw: 90 * facing + turn * facing * turnTowardsEntrance,
  };
}

export function planTour(cabinetCount: number, layout: Layout): TourPlan {
  const stops: Stop[] = [];
  let t = TIMING.walkIn[1];
  stops.push({
    kind: 'intro',
    hold: [t, t + TIMING.introHold],
    camera: OVERVIEW[layout],
    side: 'left',
  });
  t += TIMING.introHold;

  for (let i = 0; i < cabinetCount; i++) {
    const switchingWalls = i > 0 && cabinetPlacement(i).wall !== cabinetPlacement(i - 1).wall;
    t += switchingWalls ? TIMING.turn : TIMING.move;
    const side: Side = i % 2 === 0 ? 'left' : 'right';
    stops.push({
      kind: 'cabinet',
      cabinet: i,
      hold: [t, t + TIMING.hold],
      camera: cabinetCamera(i, side, layout),
      side,
    });
    t += TIMING.hold;
  }

  t += TIMING.outroMove;
  stops.push({
    kind: 'outro',
    hold: [t, t + TIMING.outroHold],
    camera: OVERVIEW[layout],
    side: 'right',
  });
  t += TIMING.outroHold;

  const at = [TIMING.walkIn[0]];
  const cameras = [DOORWAY];
  const moving = [true];
  for (const stop of stops) {
    at.push(stop.hold[0], stop.hold[1]);
    cameras.push(stop.camera, stop.camera);
    moving.push(true, false);
  }

  return {
    arrival: TIMING.arrival,
    reveal: TIMING.reveal,
    stops,
    keys: { at, cameras, moving },
    length: t,
  };
}

/** The stop you're at (or walking to), and whether you're between stops. */
export function stopAt(plan: TourPlan, position: number): { index: number; moving: boolean } {
  const { stops } = plan;
  for (let i = 0; i < stops.length; i++) {
    const [start, end] = stops[i]!.hold;
    if (position < start) {
      // Between stops: you belong to whichever is nearer.
      const previousEnd = i > 0 ? stops[i - 1]!.hold[1] : -Infinity;
      const index = i > 0 && position - previousEnd < start - position ? i - 1 : i;
      return { index, moving: i > 0 };
    }
    if (position <= end) return { index: i, moving: false };
  }
  return { index: stops.length - 1, moving: false };
}

/**
 * Screen position of a world point for a camera (in cqh from the centre), or
 * null when it's behind the camera. The CSS camera does the same sum.
 */
export function project(camera: Camera, point: { x: number; y: number; z: number }) {
  const yaw = (camera.yaw * Math.PI) / 180;
  const dx = point.x - camera.x;
  const dz = point.z - camera.z;
  const x = dx * Math.cos(yaw) + dz * Math.sin(yaw);
  const z = -dx * Math.sin(yaw) + dz * Math.cos(yaw);
  if (z >= 0) return null;
  const scale = ROOM.perspective / -z;
  return { x: x * scale, y: (point.y - camera.y) * scale, scale };
}
