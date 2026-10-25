import { describe, expect, it } from 'vitest';
import {
  cabinetCentre,
  cabinetPlacement,
  cabinetPose,
  fieldOfView,
  openPose,
  planTour,
  poseAt,
  project,
  STORE,
  stopAt,
  type Vec3,
} from './tour-plan';

const WIDE = 1440 / 900;
const NARROW = 390 / 844;

/** How much of the screen's height the cabinet fills, seen from a pose. */
function cabinetHeight(pose: ReturnType<typeof cabinetPose>, index: number, aspect: number) {
  const [x, , z] = cabinetCentre(index);
  const top = project(pose, [x, STORE.cabinet.height, z], aspect)!;
  const foot = project(pose, [x, 0, z], aspect)!;
  return top.y - foot.y;
}

describe('cabinetPlacement', () => {
  it('runs down the right wall and back up the left', () => {
    const walls = Array.from({ length: 8 }, (_, i) => cabinetPlacement(i));
    expect(walls.slice(0, 4).every((p) => p.wall === 'right')).toBe(true);
    expect(walls.slice(4).every((p) => p.wall === 'left')).toBe(true);
    expect(walls.map((p) => p.z)).toEqual([-3, -7.4, -11.8, -16.2, -16.2, -11.8, -7.4, -3]);
  });
});

describe('planTour', () => {
  const plan = planTour(8, 'wide');

  it('greets you, then visits every cabinet in order, with no stop at the end', () => {
    expect(plan.stops.map((stop) => stop.kind)).toEqual(['intro', ...Array(8).fill('cabinet')]);
    expect(plan.stops.filter((s) => s.kind === 'cabinet').map((s) => s.cabinet)).toEqual([
      0, 1, 2, 3, 4, 5, 6, 7,
    ]);
  });

  it('keeps keys and stops in order, the lights coming up before the first stop', () => {
    plan.keys.forEach((key, i) => i > 0 && expect(key.at).toBeGreaterThan(plan.keys[i - 1]!.at));
    plan.stops.forEach(
      (stop, i) => i > 0 && expect(stop.at).toBeGreaterThan(plan.stops[i - 1]!.at),
    );
    expect(plan.length).toBe(plan.keys.at(-1)!.at);
    expect(plan.reveal[1]).toBeLessThanOrEqual(plan.arrival);
    expect(plan.arrival).toBeLessThan(plan.stops[0]!.at);
  });

  it('turns past the feature wall when it changes walls', () => {
    const turn = plan.keys.find(
      (key) => key.stop === undefined && key.pose.target[2] === STORE.back,
    );
    expect(turn).toBeDefined();
  });
});

describe('poseAt', () => {
  const plan = planTour(8, 'wide');

  it('passes through every keyframe exactly', () => {
    for (const key of plan.keys) {
      const pose = poseAt(plan, key.at);
      pose.position.forEach((value, i) => expect(value).toBeCloseTo(key.pose.position[i]!, 6));
      pose.target.forEach((value, i) => expect(value).toBeCloseTo(key.pose.target[i]!, 6));
    }
  });

  it('never stands still between the door and the last look round', () => {
    const start = plan.keys[0]!.at;
    const moved = (a: Vec3, b: Vec3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
    for (let t = start; t < plan.length - 1; t += 1) {
      const here = poseAt(plan, t);
      const next = poseAt(plan, t + 1);
      const change = moved(here.position, next.position) + moved(here.target, next.target);
      expect(change).toBeGreaterThan(0.002);
    }
  });

  it('stays inside the store', () => {
    for (let t = 0; t <= plan.length; t += 2) {
      const [x, y, z] = poseAt(plan, t).position;
      expect(Math.abs(x)).toBeLessThan(STORE.halfWidth - 0.3);
      expect(y).toBeGreaterThan(0.5);
      expect(y).toBeLessThan(STORE.height - 0.5);
      expect(z).toBeLessThan(STORE.front);
      expect(z).toBeGreaterThan(STORE.back + 1);
    }
  });
});

describe('cabinet views', () => {
  it('frames each cabinet whole and large on a wide screen, at a three-quarter angle', () => {
    for (let i = 0; i < 8; i++) {
      const pose = cabinetPose(i, 'wide');
      const centre = project(pose, cabinetCentre(i), WIDE)!;
      expect(Math.abs(centre.x)).toBeLessThan(0.3);
      const height = cabinetHeight(pose, i, WIDE);
      expect(height).toBeGreaterThan(0.6);
      expect(height).toBeLessThan(0.9);
      // One edge of the case is nearer than the other, so you see into it.
      const { z } = cabinetPlacement(i);
      const half = STORE.cabinet.width / 2;
      const [x] = cabinetCentre(i);
      const edges = [z - half, z + half].map((edgeZ) => project(pose, [x, 1, edgeZ], WIDE)!);
      expect(Math.abs(edges[0]!.scale - edges[1]!.scale)).toBeGreaterThan(0.01);
    }
  });

  it('keeps the cabinet in the top of a phone screen, above the words', () => {
    for (let i = 0; i < 8; i++) {
      const pose = cabinetPose(i, 'narrow');
      const [x, , z] = cabinetCentre(i);
      const centre = project(pose, cabinetCentre(i), NARROW)!;
      const foot = project(pose, [x, 0, z], NARROW)!;
      expect(centre.y).toBeGreaterThan(0.05);
      expect(foot.y).toBeGreaterThan(-0.35);
      expect(Math.abs(centre.x)).toBeLessThan(0.15);
    }
  });

  it('steps inside square on and closer, leaving room for the house panel', () => {
    for (let i = 0; i < 8; i++) {
      const walk = cabinetHeight(cabinetPose(i, 'wide'), i, WIDE);
      const inside = openPose(i, 'wide');
      expect(cabinetHeight(inside, i, WIDE)).toBeGreaterThan(walk);
      expect(project(inside, cabinetCentre(i), WIDE)!.x).toBeGreaterThan(0.12);
      const phone = openPose(i, 'narrow');
      expect(project(phone, cabinetCentre(i), NARROW)!.y).toBeGreaterThan(0.1);
    }
  });
});

describe('stopAt', () => {
  const plan = planTour(8, 'wide');

  it('follows the nearest stop, and knows when you are between stops', () => {
    const first = plan.stops[1]!;
    const second = plan.stops[2]!;
    expect(stopAt(plan, first.at)).toEqual({ index: 1, moving: false });
    expect(stopAt(plan, first.at + 1).moving).toBe(false);
    const between = (first.at + second.at) / 2;
    expect(stopAt(plan, between - 1)).toEqual({ index: 1, moving: true });
    expect(stopAt(plan, between + 1)).toEqual({ index: 2, moving: true });
    expect(stopAt(plan, 0).index).toBe(0);
    expect(stopAt(plan, plan.length + 50).index).toBe(plan.stops.length - 1);
  });
});

describe('fieldOfView', () => {
  it('opens up on tall screens so a cabinet still fits across them', () => {
    expect(fieldOfView(WIDE)).toBe(42);
    expect(fieldOfView(NARROW)).toBeGreaterThan(55);
    expect(fieldOfView(0.2)).toBe(62);
  });
});
