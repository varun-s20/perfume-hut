import { describe, expect, it } from 'vitest';
import { cabinetFrontX, cabinetPlacement, planTour, project, ROOM, stopAt } from './tour-plan';

describe('cabinetPlacement', () => {
  it('runs down the right wall and back up the left', () => {
    const walls = Array.from({ length: 8 }, (_, i) => cabinetPlacement(i));
    expect(walls.slice(0, 4).every((p) => p.wall === 'right')).toBe(true);
    expect(walls.slice(4).every((p) => p.wall === 'left')).toBe(true);
    expect(walls.map((p) => p.z)).toEqual([-110, -200, -290, -380, -380, -290, -200, -110]);
  });
});

describe('planTour', () => {
  const plan = planTour(8, 'wide');

  it('greets you, visits every cabinet in order, then steps back', () => {
    expect(plan.stops.map((stop) => stop.kind)).toEqual([
      'intro',
      ...Array(8).fill('cabinet'),
      'outro',
    ]);
    expect(plan.stops.filter((s) => s.kind === 'cabinet').map((s) => s.cabinet)).toEqual([
      0, 1, 2, 3, 4, 5, 6, 7,
    ]);
  });

  it('keeps stops in order with scroll room between them', () => {
    plan.stops.forEach((stop, i) => {
      expect(stop.hold[1]).toBeGreaterThan(stop.hold[0]);
      if (i > 0) expect(stop.hold[0]).toBeGreaterThan(plan.stops[i - 1]!.hold[1]);
    });
    expect(plan.length).toBe(plan.stops.at(-1)!.hold[1]);
    expect(plan.arrival).toBeLessThan(plan.stops[0]!.hold[0]);
  });

  it('has matching, increasing camera keyframes', () => {
    const { at, cameras, moving } = plan.keys;
    expect(cameras).toHaveLength(at.length);
    expect(moving).toHaveLength(at.length);
    at.forEach((value, i) => i > 0 && expect(value).toBeGreaterThanOrEqual(at[i - 1]!));
  });

  it('frames each cabinet opposite the guide, at a three-quarter angle', () => {
    for (const stop of plan.stops) {
      if (stop.kind !== 'cabinet') continue;
      const { wall, z } = cabinetPlacement(stop.cabinet);
      const x = cabinetFrontX(wall);
      const centre = project(stop.camera, { x, y: ROOM.cabinet.centreY, z });
      expect(centre).not.toBeNull();
      // Cabinet on the other half of the screen from the guide.
      if (stop.side === 'left') expect(centre!.x).toBeGreaterThan(15);
      else expect(centre!.x).toBeLessThan(-15);
      // Big enough to read, small enough to fit.
      const height = ROOM.cabinet.height * centre!.scale;
      expect(height).toBeGreaterThan(60);
      expect(height).toBeLessThan(80);
      // Seen at an angle: one edge of the case is nearer, so it looks taller.
      const half = ROOM.cabinet.width / 2;
      const edges = [z - half, z + half].map((edgeZ) =>
        project(stop.camera, { x, y: 0, z: edgeZ })!,
      );
      expect(Math.abs(edges[0]!.scale - edges[1]!.scale)).toBeGreaterThan(0.02);
    }
  });

  it('alternates the guide from side to side', () => {
    const sides = plan.stops.filter((s) => s.kind === 'cabinet').map((s) => s.side);
    expect(sides).toEqual(['left', 'right', 'left', 'right', 'left', 'right', 'left', 'right']);
  });

  it('centres the cabinet above the guide on phones', () => {
    const narrow = planTour(8, 'narrow');
    for (const stop of narrow.stops) {
      if (stop.kind !== 'cabinet') continue;
      const { wall, z } = cabinetPlacement(stop.cabinet);
      const centre = project(stop.camera, {
        x: cabinetFrontX(wall),
        y: ROOM.cabinet.centreY,
        z,
      });
      expect(Math.abs(centre!.x)).toBeLessThan(1);
      expect(centre!.y).toBeLessThan(0);
    }
  });
});

describe('stopAt', () => {
  const plan = planTour(8, 'wide');

  it('is at a stop while holding there', () => {
    const [start, end] = plan.stops[3]!.hold;
    expect(stopAt(plan, (start + end) / 2)).toEqual({ index: 3, moving: false });
  });

  it('is walking between stops, towards the nearer one', () => {
    const end = plan.stops[2]!.hold[1];
    const start = plan.stops[3]!.hold[0];
    expect(stopAt(plan, end + 1)).toEqual({ index: 2, moving: true });
    expect(stopAt(plan, start - 1)).toEqual({ index: 3, moving: true });
  });

  it('is at the intro before the walk starts and the outro after it ends', () => {
    expect(stopAt(plan, 0).index).toBe(0);
    expect(stopAt(plan, plan.length + 100)).toEqual({
      index: plan.stops.length - 1,
      moving: false,
    });
  });
});
