import { describe, expect, it } from 'vitest';
import { appendClones, CLONE_MARKER_ATTRIBUTE, pruneClones, resolveDuplicateCount } from './duplication';

describe('resolveDuplicateCount', () => {
  describe('content smaller than container (odd-count seam adjustment)', () => {
    it('returns 11 for (400, 80)', () => {
      const count = resolveDuplicateCount(400, 80);
      expect(count).toBe(11);
      expect(count % 2).toBe(1);
    });

    it('returns 9 for (400, 100)', () => {
      const count = resolveDuplicateCount(400, 100);
      expect(count).toBe(9);
      expect(count % 2).toBe(1);
    });

    it('returns 7 for (300, 100)', () => {
      const count = resolveDuplicateCount(300, 100);
      expect(count).toBe(7);
      expect(count % 2).toBe(1);
    });
  });

  describe('content larger than or equal to container', () => {
    it('returns 1 when content is larger than container (200, 600)', () => {
      expect(resolveDuplicateCount(200, 600)).toBe(1);
    });

    it('returns 1 when content equals container (400, 400)', () => {
      expect(resolveDuplicateCount(400, 400)).toBe(1);
    });
  });

  describe('empty or unmeasurable content', () => {
    it('returns 0 when content size is zero (400, 0)', () => {
      expect(resolveDuplicateCount(400, 0)).toBe(0);
    });

    it('returns 0 when content size is negative (400, -5)', () => {
      expect(resolveDuplicateCount(400, -5)).toBe(0);
    });
  });
});

describe('pruneClones', () => {
  it('removes only direct children with aria-hidden="true" and keeps originals', () => {
    const inner = document.createElement('div');
    const original = document.createElement('span');
    original.textContent = 'original';
    const clone = document.createElement('span');
    clone.setAttribute(CLONE_MARKER_ATTRIBUTE, 'true');
    clone.textContent = 'clone';
    inner.appendChild(original);
    inner.appendChild(clone);

    pruneClones(inner);

    expect(inner.children).toHaveLength(1);
    expect(inner.children[0]).toBe(original);
    expect(inner.children[0].textContent).toBe('original');
  });

  it('preserves nested aria-hidden descendants inside an original child', () => {
    const inner = document.createElement('div');
    const original = document.createElement('span');
    const nestedHidden = document.createElement('em');
    nestedHidden.setAttribute(CLONE_MARKER_ATTRIBUTE, 'true');
    nestedHidden.textContent = 'nested';
    original.appendChild(nestedHidden);
    const clone = document.createElement('span');
    clone.setAttribute(CLONE_MARKER_ATTRIBUTE, 'true');
    inner.appendChild(original);
    inner.appendChild(clone);

    pruneClones(inner);

    expect(inner.children).toHaveLength(1);
    expect(inner.children[0]).toBe(original);
    expect(original.querySelector('em')?.getAttribute(CLONE_MARKER_ATTRIBUTE)).toBe('true');
    expect(original.querySelector('em')?.textContent).toBe('nested');
  });
});

describe('appendClones', () => {
  it('appends duplicateCount copies of each original child, each marked aria-hidden="true"', () => {
    const inner = document.createElement('div');
    const childA = document.createElement('span');
    childA.textContent = 'a';
    const childB = document.createElement('span');
    childB.textContent = 'b';
    const childC = document.createElement('span');
    childC.textContent = 'c';
    inner.appendChild(childA);
    inner.appendChild(childB);
    inner.appendChild(childC);

    appendClones(inner, 2);

    expect(inner.children).toHaveLength(9);
    expect(inner.children[0]).toBe(childA);
    expect(inner.children[1]).toBe(childB);
    expect(inner.children[2]).toBe(childC);
    for (let index = 3; index < 9; index++) {
      expect(inner.children[index].getAttribute(CLONE_MARKER_ATTRIBUTE)).toBe('true');
    }
  });

  it('appends nothing when duplicateCount is 0', () => {
    const inner = document.createElement('div');
    const child = document.createElement('span');
    inner.appendChild(child);

    appendClones(inner, 0);

    expect(inner.children).toHaveLength(1);
    expect(inner.children[0]).toBe(child);
  });

  it('appends nothing when the element has no children', () => {
    const inner = document.createElement('div');

    appendClones(inner, 2);

    expect(inner.children).toHaveLength(0);
  });
});
