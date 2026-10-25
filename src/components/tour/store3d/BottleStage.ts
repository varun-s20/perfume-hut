import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import type { BottleSpec } from '@/data/bottles';
import { buildBottle } from './bottle';
import { brass, disposeMaterials, PALETTE, paint, shade } from './materials';
import { type Fonts, glowTexture } from './textures';

export type BottleStageOptions = {
  spec: BottleSpec;
  fonts: Fonts;
  /** No turntable: the bottle only turns when you turn it. */
  reduced: boolean;
};

/** Height the bottle stands at (m), and how fast it turns on its own (radians a second). */
const BOTTLE_HEIGHT = 0.42;
const SPIN = 0.32;
const FOV = 28;

/**
 * One bottle on a stone plinth, lit like a studio shot: the product page's
 * 3D view. It turns slowly on its own and follows a drag, with a little
 * momentum when you let go. It only draws while it's on screen.
 */
export class BottleStage {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(FOV, 1, 0.05, 20);
  private readonly turntable = new THREE.Group();
  private readonly reduced: boolean;
  private angle = -0.35;
  private velocity = 0;
  private drag: { x: number; at: number } | null = null;
  private frame = 0;
  private last = 0;
  private visible = true;
  private size = { width: 1, height: 1 };

  static async create(canvas: HTMLCanvasElement, options: BottleStageOptions) {
    await Promise.all([
      document.fonts.load(`48px ${options.fonts.serif}`),
      document.fonts.load(`600 48px ${options.fonts.sans}`),
    ]);
    return new BottleStage(canvas, options);
  }

  private constructor(canvas: HTMLCanvasElement, { spec, fonts, reduced }: BottleStageOptions) {
    this.reduced = reduced;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environmentIntensity = 0.7;
    pmrem.dispose();

    this.scene.add(new THREE.HemisphereLight('#fff4e6', '#5a4a4c', 0.7));
    const key = new THREE.DirectionalLight('#ffe8c8', 1.1);
    key.position.set(1.4, 2.2, 2);
    const rim = new THREE.DirectionalLight('#dfe8ff', 0.8);
    rim.position.set(-1.6, 1.2, -2);
    this.scene.add(key, rim);

    // The plinth, with the bottle's shadow on it.
    const glow = glowTexture();
    const plinth = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.215, 0.05, 64),
      paint(PALETTE.stone, 0.35),
    );
    plinth.position.y = -0.025;
    const edge = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.0035, 8, 64), brass());
    edge.rotation.x = Math.PI / 2;
    const contact = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.26), shade(glow, 0.55));
    contact.rotation.x = -Math.PI / 2;
    contact.position.y = 0.001;
    this.scene.add(plinth, edge, contact);

    const bottle = buildBottle(spec, fonts);
    bottle.group.scale.setScalar(BOTTLE_HEIGHT / bottle.height);
    this.turntable.add(bottle.group);
    this.turntable.rotation.y = this.angle;
    this.scene.add(this.turntable);

    this.resize(canvas.clientWidth || 600, canvas.clientHeight || 600);
  }

  resize(width: number, height: number) {
    this.size = { width: Math.max(1, width), height: Math.max(1, height) };
    this.renderer.setSize(this.size.width, this.size.height, false);
    // Stand back far enough for the bottle and plinth to fit either way round.
    const aspect = this.size.width / this.size.height;
    const half = Math.tan(((FOV / 2) * Math.PI) / 180);
    const tall = (BOTTLE_HEIGHT / 2 + 0.12) / half;
    const wide = 0.36 / (half * aspect);
    const distance = Math.max(tall, wide);
    this.camera.aspect = aspect;
    this.camera.position.set(0, BOTTLE_HEIGHT * 0.8, distance);
    this.camera.lookAt(0, BOTTLE_HEIGHT * 0.45, 0);
    this.camera.updateProjectionMatrix();
    this.wake();
  }

  /* ---------- Turning it by hand ---------- */

  pointerDown(x: number) {
    this.drag = { x, at: performance.now() };
    this.velocity = 0;
    this.wake();
  }

  pointerMove(x: number) {
    if (!this.drag) return;
    const now = performance.now();
    const delta = ((x - this.drag.x) / this.size.width) * Math.PI * 1.6;
    this.angle += delta;
    this.velocity = delta / Math.max((now - this.drag.at) / 1000, 1 / 120);
    this.drag = { x, at: now };
    this.wake();
  }

  pointerUp() {
    this.drag = null;
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

  dispose() {
    if (this.frame) cancelAnimationFrame(this.frame);
    this.scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.geometry.dispose();
      const material = object.material as THREE.Material & Record<string, unknown>;
      for (const value of Object.values(material))
        if (value instanceof THREE.Texture) value.dispose();
      material.dispose();
    });
    this.scene.environment?.dispose();
    disposeMaterials();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }

  private wake() {
    if (this.frame || !this.visible) return;
    this.last = 0;
    this.frame = requestAnimationFrame(this.tick);
  }

  private readonly tick = (now: number) => {
    this.frame = 0;
    const dt = Math.min(this.last ? (now - this.last) / 1000 : 1 / 60, 1 / 20);
    this.last = now;
    let busy = Boolean(this.drag);
    if (!this.drag) {
      // Let go: momentum eases back into the slow turn (or to rest, with reduced motion).
      const rest = this.reduced ? 0 : SPIN;
      this.velocity += (rest - this.velocity) * (1 - Math.exp(-2.5 * dt));
      this.angle += this.velocity * dt;
      busy = Math.abs(this.velocity) > 0.002;
    }
    this.turntable.rotation.y = this.angle;
    this.renderer.render(this.scene, this.camera);
    if (busy && this.visible) this.frame = requestAnimationFrame(this.tick);
  };
}
