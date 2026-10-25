import type { StaticImageData } from 'next/image';
import welcome from '@/assets/images/ava/welcome.webp';
import point from '@/assets/images/ava/point.webp';
import idea from '@/assets/images/ava/idea.webp';
import present from '@/assets/images/ava/present.webp';
import here from '@/assets/images/ava/here.webp';
import think from '@/assets/images/ava/think.webp';
import listen from '@/assets/images/ava/listen.webp';
import ponder from '@/assets/images/ava/ponder.webp';
import mouthWelcome from '@/assets/images/ava/mouth-welcome.webp';
import mouthPoint from '@/assets/images/ava/mouth-point.webp';
import mouthIdea from '@/assets/images/ava/mouth-idea.webp';
import mouthPresent from '@/assets/images/ava/mouth-present.webp';
import mouthHere from '@/assets/images/ava/mouth-here.webp';
import mouthThink from '@/assets/images/ava/mouth-think.webp';
import mouthListen from '@/assets/images/ava/mouth-listen.webp';
import mouthPonder from '@/assets/images/ava/mouth-ponder.webp';

export type AvaPoseName =
  'welcome' | 'point' | 'idea' | 'present' | 'here' | 'think' | 'listen' | 'ponder';

/** Where a pose looks and gestures; she is mirrored to face whatever she is presenting. */
export type Facing = 'left' | 'right' | 'front';

export type AvaPose = {
  image: StaticImageData;
  facing: Facing;
  /** Four mouth frames stacked vertically, and where they sit on the pose (canvas px). */
  mouth: { sprite: StaticImageData; x: number; y: number; width: number; height: number };
};

/** Every pose shares one square canvas, with her mouth in the same place. */
export const AVA_CANVAS = 1300;

/**
 * Ava in eight poses from one photo shoot (see CREDITS.json), cut out and
 * aligned so swapping poses keeps her head in place, each with mouth frames.
 */
export const avaPoses: Record<AvaPoseName, AvaPose> = {
  welcome: {
    image: welcome,
    facing: 'right',
    mouth: { sprite: mouthWelcome, x: 564, y: 391, width: 171, height: 158 },
  },
  point: {
    image: point,
    facing: 'right',
    mouth: { sprite: mouthPoint, x: 557, y: 384, width: 185, height: 183 },
  },
  idea: {
    image: idea,
    facing: 'right',
    mouth: { sprite: mouthIdea, x: 536, y: 366, width: 227, height: 223 },
  },
  present: {
    image: present,
    facing: 'left',
    mouth: { sprite: mouthPresent, x: 545, y: 360, width: 211, height: 221 },
  },
  here: {
    image: here,
    facing: 'left',
    mouth: { sprite: mouthHere, x: 561, y: 378, width: 178, height: 180 },
  },
  think: {
    image: think,
    facing: 'left',
    mouth: { sprite: mouthThink, x: 556, y: 379, width: 188, height: 179 },
  },
  listen: {
    image: listen,
    facing: 'front',
    mouth: { sprite: mouthListen, x: 540, y: 370, width: 220, height: 213 },
  },
  ponder: {
    image: ponder,
    facing: 'right',
    mouth: { sprite: mouthPonder, x: 572, y: 399, width: 155, height: 141 },
  },
};
