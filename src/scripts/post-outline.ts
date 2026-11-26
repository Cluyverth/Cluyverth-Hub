const outline = document.querySelector('.post-outline');
const headings = Array.from(outline?.querySelectorAll<HTMLAnchorElement>('a[href^="#"]') ?? []).flatMap((link) => {
  const heading = document.getElementById(decodeURIComponent(link.hash.slice(1)));
  return heading ? [{ link, heading }] : [];
});

if (headings.length) {
  const header = document.querySelector<HTMLElement>('.site-head')!;
  const footer = document.querySelector<HTMLElement>('.site-foot')!;
  let active: HTMLAnchorElement | undefined;
  let frame = 0;

  function syncOutline() {
    frame = 0;
    const headerBottom = header.getBoundingClientRect().bottom;
    const readingLine = headerBottom + innerHeight * .12;
    const atBottom = scrollY > 0 && scrollY + innerHeight >= document.documentElement.scrollHeight - 2;
    let current: HTMLAnchorElement | undefined;

    if (atBottom) {
      const target = headings.find(({ heading }) => heading.matches(':target'));
      const top = target?.heading.getBoundingClientRect().top;
      current = target && top !== undefined && top >= headerBottom && top < footer.getBoundingClientRect().top
        ? target.link : headings.at(-1)?.link;
    } else {
      for (const { link, heading } of headings) {
        if (heading.getBoundingClientRect().top > readingLine) break;
        current = link;
      }
    }

    if (current !== active) {
      active?.removeAttribute('aria-current');
      current?.setAttribute('aria-current', 'location');
      active = current;
    }
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(syncOutline);
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('hashchange', schedule);
  window.addEventListener('pageshow', schedule);
  schedule();
}
