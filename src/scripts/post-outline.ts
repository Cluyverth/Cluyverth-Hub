import { createOutlineReading } from './outline-reading.ts';

const linkSelector = 'a[href^="#"]';

// TypeScript's DOM declarations do not yet include the navigate event.
type OutlineNavigateEvent = Event & {
  readonly destination: { readonly sameDocument: boolean; readonly url: string };
  readonly hashChange: boolean;
  readonly navigationType: NavigationType;
};

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
  const timing = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  let initialFragmentPending = Boolean(location.hash) && timing?.type !== 'back_forward';
  let pendingHash: string | undefined;

  function syncOutline(): void {
    frame = 0;
    if (initialFragmentPending || pendingHash === location.hash) {
      const target = document.querySelector(':target');
      // The browser can complete an initial fragment jump after this script starts.
      initialFragmentPending = initialFragmentPending && !target && document.readyState !== 'complete';
      if (target) reading.navigateTo(entries.findIndex(({ heading }) => heading === target));
    }
    pendingHash = undefined;

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

  function syncHistory(): void {
    // New fragment navigations also emit popstate. Keep their pending anchor until the frame.
    initialFragmentPending = false;
    reading.navigateTo(-1);
    schedule();
  }

  function beginNavigation(event: Event): void {
    const { destination, hashChange, navigationType } = event as OutlineNavigateEvent;
    if (!destination.sameDocument) return;
    if (navigationType === 'traverse') {
      pendingHash = undefined;
    } else if (hashChange) {
      pendingHash = new URL(destination.url).hash;
      schedule();
    }
  }

  function openFragment(event: MouseEvent): void {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (!(event.target instanceof Element)) return;

    const link = event.target.closest<HTMLAnchorElement>(linkSelector);
    if (!link) return;
    pendingHash = link.hash;
    schedule();
  }

  const navigation = (window as Window & { navigation?: EventTarget }).navigation;
  navigation?.addEventListener('navigate', beginNavigation);
  outline.addEventListener('click', openFragment);
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('popstate', syncHistory);
  window.addEventListener('hashchange', schedule);
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      pendingHash = undefined;
      syncHistory();
    } else {
      schedule();
    }
  });
  schedule();
}

const outline = document.querySelector<HTMLElement>('.post-outline');
const header = document.querySelector<HTMLElement>('.site-head');
if (outline && header) bindOutline(outline, header);
