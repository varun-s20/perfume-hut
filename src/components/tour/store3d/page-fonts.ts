import type { Fonts } from './textures';

/** next/font's family stacks, so type drawn in 3D matches the page around it. */
export function pageFonts(): Fonts {
  const style = getComputedStyle(document.documentElement);
  return {
    serif: style.getPropertyValue('--font-marcellus').trim() || 'serif',
    sans: style.getPropertyValue('--font-inter-tight').trim() || 'sans-serif',
  };
}
