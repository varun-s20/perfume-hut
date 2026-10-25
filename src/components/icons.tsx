import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

/** Icons are decorative: the surrounding link or button carries the accessible name. */
const base = { 'aria-hidden': true, focusable: false } as const;

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 13 11"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.15}
      {...base}
      {...props}
    >
      <path d="M0 5.5h12.2M7.1.7l4.9 4.8-4.9 4.8" />
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 8 5" fill="none" stroke="currentColor" strokeWidth={1.1} {...base} {...props}>
      <path d="M.6.6 4 4 7.4.6" />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 10 10"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.05}
      {...base}
      {...props}
    >
      <circle cx="4.3" cy="4.3" r="3.6" />
      <path d="m7 7 2.5 2.5" />
    </svg>
  );
}

export function BagIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 11 10"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.05}
      {...base}
      {...props}
    >
      <rect x=".6" y=".6" width="9.8" height="8.8" rx="1.7" />
      <path d="M3.4 3.3a2.1 2.1 0 0 0 4.2 0" />
    </svg>
  );
}

export function SendIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...base} {...props}>
      <path d="M20.6 3.1 3.4 10c-.9.4-.8 1.6.1 1.9l6.6 2 2 6.6c.3.9 1.5 1 1.9.1l6.9-17.2c.2-.4-.2-.8-.3-.3z" />
    </svg>
  );
}

export function HeartIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinejoin="round"
      {...base}
      {...props}
    >
      <path d="M12 20.3s-7.8-4.6-9.4-9.4C1.4 7.2 3.7 4 7.1 4c2.1 0 3.6 1.2 4.9 2.9C13.3 5.2 14.8 4 16.9 4c3.4 0 5.7 3.2 4.5 6.9-1.6 4.8-9.4 9.4-9.4 9.4z" />
    </svg>
  );
}

export function PaperPlaneIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinejoin="round"
      {...base}
      {...props}
    >
      <path d="M21.5 2.5 10.6 13.4M21.5 2.5l-6.9 19-4-8.1-8.1-4z" />
    </svg>
  );
}

export function MusicIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 12 12" {...base} {...props}>
      <path d="M4 9.2V2.6l6.5-1.4v6.3" fill="none" stroke="currentColor" strokeWidth={1.2} />
      <circle cx="2.6" cy="9.4" r="1.6" fill="currentColor" />
      <circle cx="9.1" cy="7.7" r="1.6" fill="currentColor" />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 20 12"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.3}
      {...base}
      {...props}
    >
      <path d="M0 1h20M0 6h20M0 11h12" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.3}
      {...base}
      {...props}
    >
      <path d="m1 1 12 12M13 1 1 13" />
    </svg>
  );
}
