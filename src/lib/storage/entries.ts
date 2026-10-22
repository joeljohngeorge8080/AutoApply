/** Helpers for the repeatable education / work-history lists on a Profile. */

export function isBlankEntry(entry: Record<string, string | undefined>): boolean {
  return Object.values(entry).every((v) => !v?.trim());
}

/** Drops entries with no content; a blank "latest" entry would fill nothing. */
export function pruneBlank<T extends Record<string, string | undefined>>(entries: T[]): T[] {
  return entries.filter((e) => !isBlankEntry(e));
}

export function removeAt<T>(list: T[], index: number): T[] {
  if (index < 0 || index >= list.length) return list.slice();
  return [...list.slice(0, index), ...list.slice(index + 1)];
}

/** Moves the item at `index` by `delta` positions; out-of-range moves are no-ops. */
export function move<T>(list: T[], index: number, delta: number): T[] {
  const target = index + delta;
  if (index < 0 || index >= list.length || target < 0 || target >= list.length) return list.slice();
  const next = list.slice();
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}
