import { useSyncExternalStore } from 'react';
import { type CartAction, type CartLine, cartReducer, parseStoredLines } from './cart';

/*
 * Client-side bag state. A tiny external store read through
 * useSyncExternalStore: hydration-safe (the server snapshot is empty), synced
 * across tabs via the `storage` event, and usable from any component without a
 * provider.
 */

const STORAGE_KEY = 'perfumehut:bag:v1';
const EMPTY: readonly CartLine[] = [];

let lines: readonly CartLine[] = EMPTY;
let loaded = false;
const lineListeners = new Set<() => void>();

function readStorage(): readonly CartLine[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? parseStoredLines(JSON.parse(raw)) : EMPTY;
  } catch {
    return EMPTY;
  }
}

function writeStorage() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // Storage blocked or full: the bag still works for this visit.
  }
}

function ensureLoaded() {
  if (!loaded) {
    loaded = true;
    lines = readStorage();
  }
}

function emitLines() {
  for (const listener of lineListeners) listener();
}

function onStorage(event: StorageEvent) {
  if (event.key !== STORAGE_KEY) return;
  lines = readStorage();
  emitLines();
}

function subscribeLines(listener: () => void) {
  lineListeners.add(listener);
  if (lineListeners.size === 1) window.addEventListener('storage', onStorage);
  return () => {
    lineListeners.delete(listener);
    if (lineListeners.size === 0) window.removeEventListener('storage', onStorage);
  };
}

export function dispatchCart(action: CartAction) {
  ensureLoaded();
  lines = cartReducer(lines, action);
  writeStorage();
  emitLines();
}

export function useCartLines(): readonly CartLine[] {
  return useSyncExternalStore(
    subscribeLines,
    () => {
      ensureLoaded();
      return lines;
    },
    () => EMPTY,
  );
}

/* ---------- Drawer visibility ---------- */

let drawerOpen = false;
const drawerListeners = new Set<() => void>();

function setDrawer(open: boolean) {
  if (drawerOpen === open) return;
  drawerOpen = open;
  for (const listener of drawerListeners) listener();
}

export const bagDrawer = {
  open: () => setDrawer(true),
  close: () => setDrawer(false),
};

function subscribeDrawer(listener: () => void) {
  drawerListeners.add(listener);
  return () => drawerListeners.delete(listener);
}

export function useBagDrawerOpen(): boolean {
  return useSyncExternalStore(
    subscribeDrawer,
    () => drawerOpen,
    () => false,
  );
}
