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

/** A wax seal: sealed, authentic. */
export function SealIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.3}
      {...base}
      {...props}
    >
      <circle cx="12" cy="10" r="6.2" />
      <path d="m9.4 10 1.8 1.8 3.6-3.6M8.6 15.4 7.4 21l4.6-2.4 4.6 2.4-1.2-5.6" />
    </svg>
  );
}

/** A parcel: packed by hand, tracked. */
export function ParcelIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.3}
      {...base}
      {...props}
    >
      <path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5z" />
      <path d="M3.5 7.5 12 12l8.5-4.5M12 12v9M7.8 5.3l8.4 4.5" />
    </svg>
  );
}

/** An arrow coming back round: easy returns. */
export function ReturnIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.3}
      {...base}
      {...props}
    >
      <path d="M8.5 5.5 4.5 9.5l4 4" />
      <path d="M4.5 9.5h10a5 5 0 0 1 0 10h-6" />
    </svg>
  );
}

/** Two sliders: open the filters. */
export function FilterIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      {...base}
      {...props}
    >
      <path d="M4 7h9M17 7h3M4 17h3M11 17h9" strokeLinecap="round" />
      <circle cx="15" cy="7" r="2" />
      <circle cx="9" cy="17" r="2" />
    </svg>
  );
}

/** Up and down: change the order. */
export function SortIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      {...base}
      {...props}
    >
      <path
        d="M8 19V5M4.5 8.5 8 5l3.5 3.5M16 5v14M12.5 15.5 16 19l3.5-3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...base} {...props}>
      <path d="m5 12.5 4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
