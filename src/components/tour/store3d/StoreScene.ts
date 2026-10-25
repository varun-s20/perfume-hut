import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  cabinetCentre,
  cabinetFrontX,
  cabinetPlacement,
  fieldOfView,
  type Layout,
  openPose,
  type Pose,
  poseAt,
  stopAt,
  type TourPlan,
  type Vec3,
} from '@/lib/tour-plan';
import { type BuiltCabinet, buildCabinet, type SceneCabinet } from './cabinet';
import { disposeMaterials, PALETTE } from './materials';
import { buildRoom } from './room';
import {
  ceilingTexture,
  drapeTexture,
  edgeTexture,
  floorTexture,
  type Fonts,
  glowTexture,
  panellingTexture,
  panelTexture,
  runnerTexture,
  scallopTexture,
  sheenTexture,
  shopWindowTexture,
} from './textures';

export type { SceneCabinet } from './cabinet';

export type StoreSceneOptions = {
  cabinets: readonly SceneCabinet[];
  plan: TourPlan;
  layout: Layout;
  fonts: Fonts;
  /** The marble photograph the floor tiles are cut from. */
  marble: string;
  reduced: boolean;
};

/** What's under the pointer: a case on the floor, or a bottle in the open case. */
export type Hit = { kind: 'cabinet'; index: number } | { kind: 'bottle'; slug: string };

/** How quickly the camera catches up with the scroll (per second): weight without lag. */
const FOLLOW = 6.5;
/** How far the camera glances towards a mouse at the screen's edge (radians). */
const LOOK = { yaw: 0.045, pitch: 0.028 };
/** Stepping inside: the walk to the case, then the doors. */
const FLIGHT = 1.1;
const DOORS = 1.05;
const DOOR_ANGLE = 1.95;

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const damp = (from: number, to: number, rate: number, dt: number) =>
  from + (to - from) * (1 - Math.exp(-rate * dt));
const mixVec = (a: Vec3, b: Vec3, t: number): Vec3 => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

/**
 * The store floor in WebGL. It renders only while something is moving: the
 * scroll, the lights coming up, a case opening. Standing still, it costs
 * nothing, which keeps phones cool and the scroll smooth.
 */
export class StoreScene {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(45, 1, 0.05, 60);
  private last = 0;
  private readonly raycaster = new THREE.Raycaster();
  private readonly cabinets: BuiltCabinet[] = [];
  private readonly spot: THREE.PointLight;
  private plan: TourPlan;
  private layout: Layout;
  private readonly reduced: boolean;

  private target = 0;
  private current = 0;
  private lit = 0;
  private litTarget = 0;
  private readonly glows: number[] = [];
  private readonly look = { x: 0, y: 0, tx: 0, ty: 0 };
  private readonly open = { index: -1, amount: 0, doors: 0, want: false };
  private hoverCabinet = -1;
  private hoverBottle: string | null = null;
  private highlight: string | null = null;
  private time = 0;

  private frame = 0;
  private visible = true;
  private size = { width: 1, height: 1 };
  private pixelRatio: number;
  private slowFrames = 0;

  static async create(canvas: HTMLCanvasElement, options: StoreSceneOptions) {
    const [marble] = await Promise.all([
      loadImage(options.marble),
      document.fonts.load(`48px ${options.fonts.serif}`),
      document.fonts.load(`600 48px ${options.fonts.sans}`),
    ]);
    return new StoreScene(canvas, options, marble);
  }

  private constructor(
    canvas: HTMLCanvasElement,
    options: StoreSceneOptions,
    marble: HTMLImageElement,
  ) {
    this.plan = options.plan;
    this.layout = options.layout;
    this.reduced = options.reduced;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, 1.75);
    this.renderer.setPixelRatio(this.pixelRatio);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.02;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Reflections for glass, brass and polished stone, from a neutral studio.
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environmentIntensity = 0.62;
    pmrem.dispose();
    this.scene.background = new THREE.Color(PALETTE.slateDeep);
    this.scene.fog = new THREE.Fog('#2c3746', 15, 38);

    // Warm light from the ceiling, falling off towards the floor and the corners.
    this.scene.add(new THREE.HemisphereLight('#fff0dc', '#3a3236', 0.72));
    const key = new THREE.DirectionalLight('#ffe4bf', 0.75);
    key.position.set(1.5, 6, 6);
    const fill = new THREE.DirectionalLight('#c9d6e8', 0.22);
    fill.position.set(-3, 2, -4);
    this.scene.add(key, fill);
    // One warm light follows you from case to case, so the one you're at glows.
    this.spot = new THREE.PointLight('#ffe2b6', 0, 7, 1.6);
    this.scene.add(this.spot);

    const textures = {
      panelling: panellingTexture(),
      panel: panelTexture(),
      edge: edgeTexture(),
      floor: floorTexture(marble),
      runner: runnerTexture(),
      ceiling: ceilingTexture(),
      glow: glowTexture(),
      scallop: scallopTexture(),
      sheen: sheenTexture(),
      drape: drapeTexture(),
      shopWindow: shopWindowTexture(),
    };
    this.scene.add(buildRoom(textures, options.fonts));

    options.cabinets.forEach((data, index) => {
      const cabinet = buildCabinet(data, options.fonts, textures);
      const { wall, z } = cabinetPlacement(index);
      // The back of the case stands against the wall, its front to the aisle.
      cabinet.group.position.set(cabinetFrontX(wall), 0, z);
      cabinet.group.rotation.y = (wall === 'right' ? -1 : 1) * (Math.PI / 2);
      this.scene.add(cabinet.group);
      this.cabinets.push(cabinet);
      this.glows.push(0);
    });

    this.resize(canvas.clientWidth || window.innerWidth, canvas.clientHeight || window.innerHeight);
    this.wake();
  }

  /* ---------- Inputs ---------- */

  /** Where the walk is (svh of scroll from the top of the tour). */
  setPosition(position: number) {
    this.target = position;
    // Big jumps (a skip link, a resize) cut straight there rather than racing.
    if (Math.abs(this.target - this.current) > 160) this.current = this.target;
    this.wake();
  }

  setPlan(plan: TourPlan, layout: Layout) {
    this.plan = plan;
    this.layout = layout;
    this.wake();
  }

  /** The store's lights: off as you come through the door, up once you're in. */
  setLit(lit: boolean) {
    this.litTarget = lit ? 1 : 0;
    this.wake();
  }

  /** Pointer position, -1 to 1 across the screen; the camera glances that way. */
  setLook(x: number, y: number) {
    if (this.reduced) return;
    this.look.tx = x;
    this.look.ty = y;
    this.wake();
  }

  /** Step inside a case (or back out with -1): the camera walks up and the doors open. */
  setOpen(index: number) {
    if (index >= 0) {
      this.open.index = index;
      this.open.want = true;
      if (this.reduced) {
        this.open.amount = 1;
        this.open.doors = 1;
      }
    } else {
      this.open.want = false;
      if (this.reduced) {
        this.open.amount = 0;
        this.open.doors = 0;
      }
    }
    this.wake();
  }

  /** A bottle to show off in the open case (a list hover, or Ava's pick). */
  setHighlight(slug: string | null) {
    this.highlight = slug;
    this.wake();
  }

  setVisible(visible: boolean) {
    this.visible = visible;
    if (visible) this.wake();
    else if (this.frame) {
      cancelAnimationFrame(this.frame);
      this.frame = 0;
    }
  }

  resize(width: number, height: number) {
    this.size = { width: Math.max(1, width), height: Math.max(1, height) };
    this.renderer.setSize(this.size.width, this.size.height, false);
    this.wake();
  }

  /** What's under a point on the canvas (CSS pixels from its top left). */
  pick(x: number, y: number): Hit | null {
    this.raycaster.setFromCamera(
      new THREE.Vector2((x / this.size.width) * 2 - 1, -(y / this.size.height) * 2 + 1),
      this.camera,
    );
    const open =
      this.open.index >= 0 && this.open.want ? this.cabinets[this.open.index] : undefined;
    if (open) {
      const [hit] = this.raycaster.intersectObjects(
        open.bottles.map((bottle) => bottle.hit),
        false,
      );
      return hit ? { kind: 'bottle', slug: hit.object.userData.bottle as string } : null;
    }
    const [hit] = this.raycaster.intersectObjects(
      this.cabinets.map((cabinet) => cabinet.hit),
      false,
    );
    if (!hit) return null;
    return {
      kind: 'cabinet',
      index: this.cabinets.findIndex((cabinet) => cabinet.hit === hit.object),
    };
  }

  /** Hovering: a case on the floor lifts its lights; a bottle in the open case turns to you. */
  setHover(hit: Hit | null) {
    this.hoverCabinet = hit?.kind === 'cabinet' ? hit.index : -1;
    this.hoverBottle = hit?.kind === 'bottle' ? hit.slug : null;
    this.wake();
  }

  /** Where a bottle's top is on screen (CSS pixels), for its name tag. */
  bottleAnchor(slug: string): { x: number; y: number } | null {
    for (const cabinet of this.cabinets) {
      const bottle = cabinet.bottles.find((candidate) => candidate.slug === slug);
      if (!bottle) continue;
      const box = new THREE.Box3().setFromObject(bottle.hit, true);
      const top = new THREE.Vector3(
        (box.min.x + box.max.x) / 2,
        box.max.y,
        (box.min.z + box.max.z) / 2,
      );
      top.project(this.camera);
      return {
        x: ((top.x + 1) / 2) * this.size.width,
        y: ((1 - top.y) / 2) * this.size.height,
      };
    }
    return null;
  }

  dispose() {
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh || object instanceof THREE.Sprite)) return;
      object.geometry.dispose();
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of materials) {
        for (const value of Object.values(material)) {
          if (value instanceof THREE.Texture) value.dispose();
        }
        material.dispose();
      }
    });
    this.scene.environment?.dispose();
    disposeMaterials();
    this.renderer.dispose();
    // Give the GPU memory back now rather than whenever the browser gets round to it.
    this.renderer.forceContextLoss();
  }

  /* ---------- The loop ---------- */

  private wake() {
    if (this.frame || !this.visible) return;
    this.last = 0;
    this.frame = requestAnimationFrame(this.tick);
  }

  private readonly tick = (now: number) => {
    this.frame = 0;
    // The first frame after a rest counts as one ordinary frame.
    const elapsed = this.last ? (now - this.last) / 1000 : 1 / 60;
    this.last = now;
    const dt = Math.min(elapsed, 1 / 20);
    this.time += dt;
    let busy = false;

    // Follow the scroll, with a little weight.
    this.current = damp(this.current, this.target, FOLLOW, dt);
    if (Math.abs(this.target - this.current) < 0.02) this.current = this.target;
    else busy = true;

    // Lights come up as you arrive, case by case.
    this.lit = damp(this.lit, this.litTarget, 2.2, dt);
    if (Math.abs(this.lit - this.litTarget) > 0.002) busy = true;
    const at = stopAt(this.plan, this.current);
    const stop = this.plan.stops[at.index];
    const standingAt = stop?.kind === 'cabinet' && !at.moving ? stop.cabinet : -1;
    const focus = this.open.want
      ? this.open.index
      : standingAt >= 0
        ? standingAt
        : this.hoverCabinet;
    this.cabinets.forEach((cabinet, index) => {
      const arrive = Math.min(1, Math.max(0, this.lit * 1.6 - index * 0.08));
      const goal = arrive * (index === focus ? 1.45 : index === this.hoverCabinet ? 1.25 : 1);
      const level = damp(this.glows[index]!, goal, 3, dt);
      if (Math.abs(level - goal) > 0.003) busy = true;
      this.glows[index] = level;
      cabinet.setGlow(level);
    });

    // The light that walks with you.
    const lightAt = focus >= 0 ? focus : Math.max(0, standingAt);
    const [cx, , cz] = cabinetCentre(lightAt);
    const out = cx > 0 ? -1 : 1;
    this.spot.position.set(
      damp(this.spot.position.x, cx + out * 1.4, 4, dt),
      2.6,
      damp(this.spot.position.z, cz, 4, dt),
    );
    this.spot.intensity = damp(
      this.spot.intensity,
      focus >= 0 ? 7 * this.lit : 2.5 * this.lit,
      4,
      dt,
    );

    // Stepping inside, and back out.
    busy = this.stepInside(dt) || busy;

    // The pointer glance.
    this.look.x = damp(this.look.x, this.look.tx, 3.5, dt);
    this.look.y = damp(this.look.y, this.look.ty, 3.5, dt);
    if (Math.abs(this.look.x - this.look.tx) + Math.abs(this.look.y - this.look.ty) > 0.001)
      busy = true;

    this.placeCamera();
    this.renderer.render(this.scene, this.camera);
    this.adapt(elapsed, busy);

    if (busy && this.visible) this.frame = requestAnimationFrame(this.tick);
  };

  private stepInside(dt: number): boolean {
    const open = this.open;
    if (open.index < 0) return false;
    const cabinet = this.cabinets[open.index]!;
    let busy = false;
    if (open.want) {
      open.amount = Math.min(1, open.amount + dt / FLIGHT);
      if (open.amount > 0.55) open.doors = Math.min(1, open.doors + dt / DOORS);
    } else {
      // Close the doors, then walk back.
      open.doors = Math.max(0, open.doors - dt / (DOORS * 0.55));
      if (open.doors < 0.25) open.amount = Math.max(0, open.amount - dt / (FLIGHT * 0.85));
    }
    const swing = easeInOut(open.doors) * DOOR_ANGLE;
    cabinet.doors[0].rotation.y = -swing;
    cabinet.doors[1].rotation.y = swing;

    // Inside, the bottles turn slowly so you see them in the round; the one you're on turns to you.
    cabinet.bottles.forEach((bottle, i) => {
      const chosen = bottle.slug === this.hoverBottle || bottle.slug === this.highlight;
      const sway = Math.sin(this.time * 0.6 + i * 1.7) * 0.38 * open.doors;
      const turn = chosen ? 0.5 : this.reduced ? 0 : sway;
      bottle.pivot.rotation.y = damp(bottle.pivot.rotation.y, turn, chosen ? 6 : 2, dt);
      const lift = damp(bottle.pivot.position.y - bottle.baseY, chosen ? 0.03 : 0, 8, dt);
      bottle.pivot.position.y = bottle.baseY + lift;
    });

    if (open.want || open.amount > 0 || open.doors > 0) busy = true;
    if (!open.want && open.amount === 0 && open.doors === 0) {
      cabinet.bottles.forEach((bottle) => {
        bottle.pivot.rotation.y = 0;
        bottle.pivot.position.y = bottle.baseY;
      });
      open.index = -1;
    }
    return busy;
  }

  private placeCamera() {
    let pose: Pose = poseAt(this.plan, this.current);
    if (this.open.index >= 0 && this.open.amount > 0) {
      const inside = openPose(this.open.index, this.layout);
      const t = easeInOut(this.open.amount);
      pose = {
        position: mixVec(pose.position, inside.position, t),
        target: mixVec(pose.target, inside.target, t),
        shift: [
          pose.shift[0] + (inside.shift[0] - pose.shift[0]) * t,
          pose.shift[1] + (inside.shift[1] - pose.shift[1]) * t,
        ],
      };
    }
    this.camera.position.set(...pose.position);
    this.camera.lookAt(...pose.target);
    const glance = 1 - (this.open.index >= 0 ? easeInOut(this.open.amount) : 0);
    this.camera.rotateY(-this.look.x * LOOK.yaw * glance);
    this.camera.rotateX(-this.look.y * LOOK.pitch * glance);

    // Lens shift: move the subject off centre without bending the room.
    const { width, height } = this.size;
    const [sx, sy] = pose.shift;
    const fullWidth = width * (1 + 2 * Math.abs(sx));
    const fullHeight = height * (1 + 2 * Math.abs(sy));
    const fov = fieldOfView(width / height);
    this.camera.fov =
      (2 * Math.atan(Math.tan((fov * Math.PI) / 360) * (1 + 2 * Math.abs(sy))) * 180) / Math.PI;
    this.camera.aspect = fullWidth / fullHeight;
    this.camera.setViewOffset(
      fullWidth,
      fullHeight,
      sx > 0 ? 0 : 2 * Math.abs(sx) * width,
      sy > 0 ? 2 * sy * height : 0,
      width,
      height,
    );
    this.camera.updateProjectionMatrix();
  }

  /** Slow phones get fewer pixels rather than dropped frames (judged on frame time while moving). */
  private adapt(elapsed: number, busy: boolean) {
    if (!busy) return;
    this.slowFrames = elapsed > 0.024 ? this.slowFrames + 1 : Math.max(0, this.slowFrames - 1);
    if (this.slowFrames > 30 && this.pixelRatio > 1) {
      this.pixelRatio = Math.max(1, this.pixelRatio - 0.25);
      this.renderer.setPixelRatio(this.pixelRatio);
      this.renderer.setSize(this.size.width, this.size.height, false);
      this.slowFrames = 0;
    }
  }
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}
