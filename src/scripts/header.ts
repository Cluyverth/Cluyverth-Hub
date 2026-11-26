import type { SearchEntry } from './search-entry';

const header = document.querySelector<HTMLElement>('.site-head')!;
const root = document.documentElement;
const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')!;
const toggle = header.querySelector<HTMLButtonElement>('.theme-toggle')!;
const themeLabel = toggle.querySelector<HTMLElement>('.theme-toggle-label')!;
const themeKey = 'cluyverth-estudio-theme';
function applyTheme(light: boolean) {
  root.dataset.theme = light ? 'light' : 'dark';
  themeColor.content = light ? '#f7f5ef' : '#181715';
  const label = light ? 'Ativar tema escuro' : 'Ativar tema claro';
  toggle.setAttribute('aria-label', label);
  themeLabel.textContent = label;
  toggle.title = label;
}
let lightTheme = root.dataset.theme === 'light';
let themeTransition: ViewTransition | undefined;
const motion = matchMedia('(prefers-reduced-motion: no-preference)');
applyTheme(lightTheme);
toggle.addEventListener('click', (event) => {
  lightTheme = !lightTheme;
  try { localStorage.setItem(themeKey, lightTheme ? 'light' : 'dark'); } catch { /* Storage is optional. */ }
  themeTransition?.skipTransition();
  if (!motion.matches || !document.startViewTransition) {
    applyTheme(lightTheme);
    return;
  }

  const bounds = toggle.getBoundingClientRect();
  const x = event.detail ? event.clientX : bounds.left + bounds.width / 2;
  const y = event.detail ? event.clientY : bounds.top + bounds.height / 2;
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  root.style.setProperty('--theme-origin', `${x}px ${y}px`);
  root.style.setProperty('--theme-radius', `${Math.ceil(radius)}px`);
  root.setAttribute('data-theme-wave', '');

  const transition = document.startViewTransition(() => { applyTheme(lightTheme); });
  themeTransition = transition;
  const clear = () => {
    if (themeTransition !== transition) return;
    themeTransition = undefined;
    root.removeAttribute('data-theme-wave');
    root.style.removeProperty('--theme-origin');
    root.style.removeProperty('--theme-radius');
  };
  void transition.finished.then(clear, clear);
});
const updateHeaderHeight = () => root.style.setProperty('--header-height', `${header.getBoundingClientRect().height}px`);

const form = header.querySelector<HTMLFormElement>('.site-search')!;
const input = form.querySelector<HTMLInputElement>('input')!;
const panel = form.querySelector<HTMLElement>('#search-panel')!;
const results = panel.querySelector<HTMLOListElement>('#search-results')!;
const filterIcons = new Map(Array.from(panel.querySelectorAll<HTMLElement>('[data-filter]'), (hint) =>
  [hint.dataset.filter, hint.querySelector('svg')!] as const
));
const status = panel.querySelector<HTMLParagraphElement>('#search-status')!;
const skeleton = panel.querySelector<HTMLElement>('.search-skeleton')!;
const labels = { '#': 'Tags', '!': 'Categorias', '': 'Posts' } as const;
const normalize = (text: string) => text.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('pt-BR').trim();

interface IndexedEntry extends SearchEntry {
  key: string;
  categoryKey: string;
  tagKeys: string[];
}

async function loadIndex(): Promise<IndexedEntry[]> {
  const response = await fetch('/busca.json');
  if (!response.ok) throw new Error(`Índice de busca: ${response.status}`);
  const entries = await response.json() as SearchEntry[];
  return entries.map((entry) => ({
    ...entry,
    key: normalize([entry.title, entry.category, ...entry.tags, entry.text].join(' ')),
    categoryKey: normalize(entry.category),
    tagKeys: entry.tags.map(normalize),
  }));
}
let index: Promise<IndexedEntry[]> | undefined;
let requestId = 0;
function close() {
  requestId++;
  panel.hidden = true;
}
async function render() {
  const id = ++requestId;
  const query = input.value.trim();
  const prefix = query[0] === '#' || query[0] === '!' ? query[0] : '';
  const term = normalize(query.slice(prefix.length));
  const words = term.split(/\s+/).filter(Boolean);
  panel.hidden = false;
  results.replaceChildren();
  if (!query) {
    skeleton.hidden = true;
    status.textContent = '';
    return;
  }
  status.textContent = 'Buscando…';
  skeleton.hidden = false;
  try {
    const entries = await (index ??= loadIndex());
    if (id !== requestId) return;
    const matches = entries.filter((entry) => {
      if (prefix === '#') return entry.tagKeys.some((tag) => tag.includes(term));
      if (prefix === '!') return entry.categoryKey.includes(term);
      return words.every((word) => entry.key.includes(word));
    });
    const fragment = document.createDocumentFragment();
    for (const [position, entry] of matches.entries()) {
      const row = document.createElement('li');
      const link = document.createElement('a');
      const number = document.createElement('span');
      const copy = document.createElement('span');
      const title = document.createElement('strong');
      const meta = document.createElement('small');
      link.href = entry.href;
      title.className = 'ink-line';
      title.textContent = entry.title;
      number.className = 'search-number';
      number.setAttribute('aria-hidden', 'true');
      number.textContent = String(position + 1).padStart(2, '0');
      copy.className = 'search-result-copy';
      const kind = prefix === '#' ? '#' : '!';
      meta.dataset.filter = kind;
      const label = prefix === '#'
        ? entry.tags.filter((_, i) => entry.tagKeys[i]?.includes(term)).map((tag) => `#${tag}`).join(' · ')
        : entry.category;
      meta.append(filterIcons.get(kind)!.cloneNode(true), label);
      copy.append(title, meta);
      link.append(number, copy);
      row.append(link);
      fragment.append(row);
    }
    results.replaceChildren(fragment);
    status.textContent = `${labels[prefix]} · ${matches.length ? `${matches.length} ${matches.length === 1 ? 'resultado' : 'resultados'}` : 'Nenhum resultado'}`;
  } catch {
    index = undefined;
    if (id === requestId) status.textContent = 'Não foi possível carregar a busca.';
  } finally {
    if (id === requestId) skeleton.hidden = true;
  }
}
input.addEventListener('focus', render);
input.addEventListener('click', () => { if (panel.hidden) void render(); });
input.addEventListener('input', render);
form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (panel.hidden) { void render(); return; }
  results.querySelector('a')?.click();
});
form.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !panel.hidden) {
    event.preventDefault();
    input.focus();
    close();
  } else if (event.key === 'ArrowDown' && document.activeElement === input && !panel.hidden) {
    const first = results.querySelector('a');
    if (first) { event.preventDefault(); first.focus(); }
  }
});
form.addEventListener('focusout', (event) => {
  if (!(event.relatedTarget instanceof Node) || !form.contains(event.relatedTarget)) close();
});

const menu = header.querySelector<HTMLButtonElement>('.menu-toggle')!;
const navigation = header.querySelector('nav')!;
const mobile = matchMedia('(max-width: 760px)');
const isMenuOpen = () => menu.getAttribute('aria-expanded') === 'true';
function setMenuOpen(open: boolean) {
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  if (!open) close();
}
menu.addEventListener('click', () => setMenuOpen(!isMenuOpen()));
header.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || event.defaultPrevented || !mobile.matches || !isMenuOpen()) return;
  event.preventDefault();
  setMenuOpen(false);
  menu.focus();
});
document.addEventListener('click', (event) => {
  if (mobile.matches && isMenuOpen() && event.target instanceof Node && !header.contains(event.target)) {
    if (header.contains(document.activeElement)) menu.focus();
    setMenuOpen(false);
  }
});
function syncMenuLayout() {
  setMenuOpen(false);
  if (mobile.matches) navigation.before(form);
  else navigation.after(form);
}
mobile.addEventListener('change', syncMenuLayout);
syncMenuLayout();

function enableHeader() {
  new ResizeObserver(updateHeaderHeight).observe(header, { box: 'border-box' });
  // Keep a fallback link usable if the module loads while someone is tabbing through it.
  if (mobile.matches && navigation.contains(document.activeElement)) setMenuOpen(true);
  header.setAttribute('data-header-ready', '');
  updateHeaderHeight();
}

const pageFade = (window as Window & { pageFadeFinished?: Promise<void> }).pageFadeFinished;
if (pageFade) void pageFade.then(enableHeader, enableHeader);
else enableHeader();
