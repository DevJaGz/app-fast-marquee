export const CLONE_MARKER_ATTRIBUTE = 'aria-hidden';

/**
 * Number of extra content copies needed to fill the container seamlessly.
 * When content is smaller than the container the cover count is doubled so half the track (the
 * 50% travel distance) still covers the full container; the count is then forced odd so the total
 * number of content copies (originals + duplicates) is even and the 50% translation lands exactly
 * on a copy boundary. Empty or unmeasurable content yields no duplicates.
 */
export function resolveDuplicateCount(containerSizeInPx: number, contentSizeInPx: number): number {
  if (contentSizeInPx <= 0) return 0;
  const coverCount = Math.ceil(containerSizeInPx / contentSizeInPx);
  const base = containerSizeInPx > contentSizeInPx ? 2 * coverCount : coverCount;
  return base % 2 !== 0 ? base : base + 1;
}

/** Removes previously appended clones (direct children marked aria-hidden), leaving user content untouched. */
export function pruneClones(inner: HTMLElement): void {
  for (const child of Array.from(inner.children)) {
    if (child.getAttribute(CLONE_MARKER_ATTRIBUTE) === 'true') child.remove();
  }
}

/** Clones the current (original) children `duplicateCount` times into a fragment and appends it. */
export function appendClones(inner: HTMLElement, duplicateCount: number): void {
  if (duplicateCount <= 0 || inner.children.length === 0) return;
  const originals = Array.from(inner.children);
  const fragment = inner.ownerDocument.createDocumentFragment();
  for (let copy = 0; copy < duplicateCount; copy++) {
    for (const original of originals) {
      const clone = original.cloneNode(true) as HTMLElement;
      clone.setAttribute(CLONE_MARKER_ATTRIBUTE, 'true');
      fragment.appendChild(clone);
    }
  }
  inner.appendChild(fragment);
}
