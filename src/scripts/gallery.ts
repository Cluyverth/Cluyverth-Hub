const gallery = document.querySelector<HTMLElement>('.work-gallery')!;
const stage = gallery.querySelector<HTMLElement>('.work-stage')!;
const desktop = matchMedia('(min-width: 50rem)');

interface Entry {
  card: HTMLElement;
  link: HTMLAnchorElement;
  preview: HTMLElement;
}

const projects = new Map<string, Entry>([...gallery.querySelectorAll<HTMLElement>('.work-card')].map((card) => [card.id, {
  card,
  link: card.querySelector<HTMLAnchorElement>('.work-select')!,
  preview: card.querySelector<HTMLElement>('.work-preview')!,
}]));
let selected: Entry | undefined;

function select(next: Entry | undefined, reveal = false) {
  const previous = selected;
  const focused = document.activeElement;
  if (previous && previous !== next) {
    previous.card.removeAttribute('data-active');
    previous.link.setAttribute('aria-expanded', 'false');
    previous.preview.hidden = true;
    previous.preview.removeAttribute('data-reveal');
    if (previous.preview.parentElement !== previous.card) previous.card.append(previous.preview);
  }
  selected = next;
  if (next) {
    const container = desktop.matches ? stage : next.card;
    if (next.preview.parentElement !== container) container.append(next.preview);
    next.card.setAttribute('data-active', '');
    next.link.setAttribute('aria-expanded', 'true');
    next.preview.toggleAttribute('data-reveal', reveal && previous !== next);
    next.preview.hidden = false;
  }
  if (focused instanceof HTMLElement && previous?.preview.contains(focused) && focused !== document.activeElement) {
    (previous === next ? focused : previous.link).focus({ preventScroll: true });
  }
}

function syncSelection(reveal = false) {
  const linked = projects.get(location.hash.slice(1));
  select(linked ?? (desktop.matches ? projects.values().next().value : undefined), reveal);
}

for (const project of projects.values()) {
  project.preview.hidden = true;
  project.link.setAttribute('aria-expanded', 'false');
  project.link.addEventListener('click', (event) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (selected === project && desktop.matches) return;
    const next = selected === project ? undefined : project;
    const fragment = next ? `#${next.card.id}` : '';
    history.pushState(null, '', `${location.pathname}${location.search}${fragment}`);
    select(next, true);
    if (!desktop.matches) project.link.scrollIntoView({ block: 'nearest' });
  });
}

if (projects.size) {
  gallery.setAttribute('data-enhanced', '');
  syncSelection();
  desktop.addEventListener('change', () => syncSelection());
  window.addEventListener('hashchange', () => syncSelection(true));
}
