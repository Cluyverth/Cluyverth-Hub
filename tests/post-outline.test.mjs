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

async function bindArticle(t, { hash = '', top = 0, navigationType = 'navigate' } = {}) {
  class Link {
    attributes = new Map();
    constructor(hash) { this.hash = hash; }
    closest() { return this; }
    setAttribute(name, value) { this.attributes.set(name, value); }
    removeAttribute(name) { this.attributes.delete(name); }
  }

  const window = Object.assign(new EventTarget(), {
    scrollY: top,
    innerHeight: 300,
    performance: { getEntriesByType: () => [{ type: navigationType }] },
  });
  const location = { hash };
  const headings = new Map([
    ['#contexto', 240], ['#tres-linhas', 480], ['#modelo', 560], ['#exemplo', 680],
  ].map(([fragment, offset]) => [fragment, {
    getBoundingClientRect: () => ({ top: offset - window.scrollY }),
  }]));
  const links = Array.from(headings.keys(), (fragment) => new Link(fragment));
  let onClick;
  const outline = {
    querySelectorAll: () => links,
    addEventListener: (_type, listener) => { onClick = listener; },
  };
  const header = { getBoundingClientRect: () => ({ bottom: 64 }) };
  const frames = [];
  const globals = {
    window,
    location,
    Element: Link,
    requestAnimationFrame: (frame) => frames.push(frame),
    document: {
      readyState: 'complete',
      documentElement: { scrollHeight: 700 },
      getElementById: (id) => headings.get(`#${id}`),
      querySelector: (selector) => ({
        '.post-outline': outline,
        '.site-head': header,
        ':target': headings.get(location.hash),
      })[selector],
    },
  };
  t.after(() => {
    for (const key of Object.keys(globals)) delete globalThis[key];
  });
  Object.assign(globalThis, globals);
  const script = new URL('../src/scripts/post-outline.ts', import.meta.url);
  script.searchParams.set('case', t.name);
  await import(script.href);

  function settle() {
    for (const frame of frames.splice(0)) frame();
  }

  function moveTo(top) {
    if (top === window.scrollY) return;
    window.scrollY = top;
    window.dispatchEvent(new Event('scroll'));
  }

  function navigate(hash, top) {
    const changed = hash !== location.hash;
    location.hash = hash;
    if (changed) window.dispatchEvent(new Event('popstate'));
    moveTo(top);
    settle();
    if (changed) window.dispatchEvent(new Event('hashchange'));
    settle();
  }

  settle();
  return {
    assertCurrent(...fragments) {
      assert.deepEqual(links.filter((link) => link.attributes.has('aria-current'))
        .map((link) => [link.hash, link.attributes.get('aria-current')]),
      fragments.map((fragment) => [fragment, 'location']));
    },
    click(hash, top) {
      onClick({ target: links.find((link) => link.hash === hash), button: 0 });
      navigate(hash, top);
    },
    traverse: navigate,
    scroll(top) {
      moveTo(top);
      settle();
    },
    restoreFromCache() {
      window.dispatchEvent(Object.assign(new Event('pageshow'), { persisted: true }));
      settle();
    },
  };
}

test('direct link, click and re-click select their clamped fragments until the reader scrolls', async (t) => {
  const article = await bindArticle(t, { hash: '#modelo', top: 400 });
  article.assertCurrent('#modelo');
  article.click('#tres-linhas', 400);
  article.assertCurrent('#tres-linhas');
  article.scroll(399);
  article.assertCurrent('#exemplo');
  article.click('#tres-linhas', 400);
  article.assertCurrent('#tres-linhas');
});

test('Back and Forward follow the restored reading line, even without a scroll event', async (t) => {
  const article = await bindArticle(t);
  article.assertCurrent();
  article.click('#modelo', 400);
  article.assertCurrent('#modelo');
  article.click('#tres-linhas', 400);
  article.assertCurrent('#tres-linhas');
  article.traverse('#modelo', 400);
  article.assertCurrent('#exemplo');
  article.traverse('#tres-linhas', 400);
  article.assertCurrent('#exemplo');

  article.scroll(140);
  article.click('#modelo', 400);
  article.traverse('#tres-linhas', 140);
  article.assertCurrent('#contexto');
  article.traverse('#modelo', 400);
  article.assertCurrent('#exemplo');
});

test('a new document loaded by history traversal follows the restored position', async (t) => {
  const article = await bindArticle(t, { hash: '#modelo', top: 400, navigationType: 'back_forward' });
  article.assertCurrent('#exemplo');
});

test('restoring a cached article discards its previous fragment selection', async (t) => {
  const article = await bindArticle(t, { hash: '#modelo', top: 400 });
  article.assertCurrent('#modelo');
  article.restoreFromCache();
  article.assertCurrent('#exemplo');
});
