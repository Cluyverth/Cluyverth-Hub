import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createOutlineReading } from '../src/scripts/outline-reading.ts';

function article() {
  // The final two headings are nested and cannot reach the reading line at the end.
  const headings = [240, 480, 560, 680];
  let scrollTop = 0;
  const reading = createOutlineReading(headings.length, (index) => headings[index] - scrollTop);
  const scrollLimit = 400;

  function currentAt(offset, readingLine = 100) {
    scrollTop = offset;
    return reading.currentAt(scrollTop, readingLine, scrollTop >= scrollLimit - 2);
  }

  return { currentAt, navigateTo: reading.navigateTo, scrollLimit };
}

test('follows the reading line, including nested headings, and selects the final heading at the end', () => {
  const outline = article();
  assert.equal(outline.currentAt(0), -1);
  assert.equal(outline.currentAt(139), -1);
  assert.equal(outline.currentAt(140), 0);
  assert.equal(outline.currentAt(380), 1);
  assert.equal(outline.currentAt(385, 180), 2);
  assert.equal(outline.currentAt(outline.scrollLimit), 3);
  assert.equal(outline.currentAt(380), 1);
});

test('keeps an explicit fragment at its clamped landing only until the scroll position changes', () => {
  const outline = article();
  outline.navigateTo(2);
  assert.equal(outline.currentAt(outline.scrollLimit), 2);
  assert.equal(outline.currentAt(outline.scrollLimit, 110), 2);
  assert.equal(outline.currentAt(outline.scrollLimit - 1), 3);
  assert.equal(outline.currentAt(380), 1);
  assert.equal(outline.currentAt(outline.scrollLimit), 3);
});

test('reopening the same fragment selects it again after scrolling', () => {
  const outline = article();
  outline.navigateTo(2);
  assert.equal(outline.currentAt(outline.scrollLimit), 2);
  assert.equal(outline.currentAt(380), 1);

  outline.navigateTo(2);
  assert.equal(outline.currentAt(outline.scrollLimit), 2);
  assert.equal(outline.currentAt(380), 1);
  assert.equal(outline.currentAt(outline.scrollLimit), 3);
});

test('a new navigation replaces the previous fragment without requiring a scroll', () => {
  const outline = article();
  outline.navigateTo(1);
  assert.equal(outline.currentAt(outline.scrollLimit), 1);
  outline.navigateTo(2);
  assert.equal(outline.currentAt(outline.scrollLimit), 2);
  outline.navigateTo(-1);
  assert.equal(outline.currentAt(outline.scrollLimit), 3);
});
