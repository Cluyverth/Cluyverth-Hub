import { createOutlineReading } from './outline-reading';

const linkSelector = 'a[href^="#"]';

function bindOutline(outline: HTMLElement, header: HTMLElement): void {
  const entries: { link: HTMLAnchorElement; heading: HTMLElement }[] = [];
  outline.querySelectorAll<HTMLAnchorElement>(linkSelector).forEach((link) => {
    const heading = document.getElementById(decodeURIComponent(link.hash.slice(1)));
    if (heading) entries.push({ link, heading });
  });
  if (!entries.length) return;

  const reading = createOutlineReading(entries.length, (index) => entries[index].heading.getBoundingClientRect().top);
  let active: HTMLAnchorElement | undefined;
  let frame = 0;
  let fragmentPending = Boolean(location.hash);

  function acceptFragment(): void {
    const target = document.querySelector(':target');
    // The browser can complete an initial fragment jump after this script starts.
    fragmentPending = !target && document.readyState !== 'complete';
    reading.navigateTo(target ? entries.findIndex(({ heading }) => heading === target) : -1);
  }

  function syncOutline(): void {
    frame = 0;
    if (fragmentPending) acceptFragment();

    const scrollTop = window.scrollY;
    const height = window.innerHeight;
    const readingLine = header.getBoundingClientRect().bottom + height * .12;
    const atBottom = scrollTop > 0 && scrollTop + height >= document.documentElement.scrollHeight - 2;
    const current = entries[reading.currentAt(scrollTop, readingLine, atBottom)]?.link;
    if (current === active) return;

    active?.removeAttribute('aria-current');
    current?.setAttribute('aria-current', 'location');
    active = current;
  }

  function schedule(): void {
    if (!frame) frame = requestAnimationFrame(syncOutline);
  }

  function followFragment(): void {
    fragmentPending = true;
    schedule();
  }

  function repeatFragment(event: MouseEvent): void {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (!(event.target instanceof Element)) return;

    const link = event.target.closest<HTMLAnchorElement>(linkSelector);
    // Reopening the same fragment does not produce a hashchange.
    if (link && link.hash === location.hash) followFragment();
  }

  outline.addEventListener('click', repeatFragment);
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('hashchange', followFragment);
  window.addEventListener('pageshow', schedule);
  schedule();
}

const outline = document.querySelector<HTMLElement>('.post-outline');
const header = document.querySelector<HTMLElement>('.site-head');
if (outline && header) bindOutline(outline, header);
