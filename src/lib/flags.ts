/**
 * Parts of the site that can be switched on and off in one place.
 *
 * `ava`: the virtual fragrance advisor. Off for now: the store tour and the
 * cabinet rooms run without her (placards and a house panel speak instead).
 * Her poses, script and guided pick are all kept (components/tour/Ava*,
 * data/ava-poses.ts, lib/ava*.ts); set this to true to bring her back.
 */
export const flags = {
  ava: false,
} as const;
