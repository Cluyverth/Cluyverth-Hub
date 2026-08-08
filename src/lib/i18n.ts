/**
 * Site locales and UI strings. Every user-facing string on the site is
 * resolved through `t()` so a page can render fully in its locale.
 */

export const locales = ['en', 'pt'] as const;
export type Locale = (typeof locales)[number];

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** URL prefix for a locale: English lives at the root, others get a prefix. */
export function localePrefix(locale: Locale): string {
  return locale === 'en' ? '' : `/${locale}`;
}

type Dict = Record<string, Record<Locale, string>>;

const dict: Dict = {
  'nav.home': { en: 'Home', pt: 'Início' },
  'nav.vault': { en: 'Vault', pt: 'Vault' },
  'nav.projects': { en: 'Projects', pt: 'Projetos' },
  'nav.graph': { en: 'Graph', pt: 'Grafo' },
  'nav.about': { en: 'About', pt: 'Sobre' },
  'nav.links': { en: 'Links', pt: 'Links' },
  'hero.motto': {
    en: 'Notes, projects, and the things I make. A public slice of my Obsidian vault.',
    pt: 'Notas, projetos e as coisas que eu faço. Uma fatia pública do meu vault do Obsidian.',
  },
  'hero.quote': {
    en: 'Luck is what happens when preparation meets opportunity.',
    pt: 'A sorte é o que acontece quando a preparação encontra a oportunidade.',
  },
  'hero.seneca': { en: 'Seneca', pt: 'Sêneca' },
  'vault.title': { en: 'Vault', pt: 'Vault' },
  'vault.intro': {
    en: 'Public notes from my Obsidian vault. Everything here is a note I decided to publish.',
    pt: 'Notas públicas do meu vault do Obsidian. Tudo aqui é uma nota que decidi publicar.',
  },
  'vault.search': { en: 'Search notes…', pt: 'Buscar notas…' },
  'vault.all': { en: 'All', pt: 'Todas' },
  'vault.noResults': { en: 'No notes match your search.', pt: 'Nenhuma nota corresponde à sua busca.' },
  'vault.empty': {
    en: 'No public notes yet. Drop a markdown file with `status: public` into your notes source and it will appear here.',
    pt: 'Ainda não há notas públicas. Escreva uma nota com `status: public` e ela aparecerá aqui.',
  },
  'vault.draft': { en: 'draft', pt: 'rascunho' },
  'vault.draftDev': { en: 'draft, visible in dev only', pt: 'rascunho, visível apenas em dev' },
  'toc.title': { en: 'Table of contents', pt: 'Sumário' },
  'toc.backlinks': { en: 'Back links', pt: 'Links de retorno' },
  'projects.title': { en: 'Projects', pt: 'Projetos' },
  'projects.intro': {
    en: 'Things I build. Each project is a note in the vault, so every card opens into its full story.',
    pt: 'Coisas que eu construo. Cada projeto é uma nota no vault, então cada card abre a história completa.',
  },
  'projects.empty': {
    en: 'No projects yet. Write a note with `project: true` and it appears here.',
    pt: 'Ainda não há projetos. Escreva uma nota com `project: true` e ela aparecerá aqui.',
  },
  'projects.noImage': { en: 'no image', pt: 'sem imagem' },
  'projects.live': { en: 'Open site', pt: 'Abrir site' },
  'projects.source': { en: 'Source code', pt: 'Código-fonte' },
  'graph.title': { en: 'Graph', pt: 'Grafo' },
  'graph.intro': {
    en: 'Every public note is a node and every resolved wikilink is an edge. Drag to move, scroll to zoom, click a node to open the note.',
    pt: 'Cada nota pública é um nó e cada wikilink resolvido é uma aresta. Arraste para mover, role para dar zoom, clique em um nó para abrir a nota.',
  },
  'graph.legend.notes': { en: 'notes', pt: 'notas' },
  'graph.legend.categories': { en: 'categories', pt: 'categorias' },
  'graph.legend.tags': { en: 'tags', pt: 'tags' },
  'graph.legend.notebooks': { en: 'notebooks', pt: 'cadernos' },
  'about.title': { en: 'About', pt: 'Sobre' },
  'about.intro': {
    en: 'I am a software engineer with a background in Mechatronics engineering. I take abstract and real-world problems and turn them into code.',
    pt: 'Sou engenheiro de software com formação em engenharia mecatrônica. Pego problemas abstratos e do mundo real e os transformo em código.',
  },
  'about.techstack': { en: 'Tech stack', pt: 'Tecnologias' },
  'about.experience': { en: 'Experience', pt: 'Experiência' },
  'about.education': { en: 'Education', pt: 'Formação' },
  'about.languages': { en: 'Languages', pt: 'Idiomas' },
  'about.resume': { en: 'Resume (PDF)', pt: 'Currículo (PDF)' },
  'about.location': { en: 'Tokyo, Japan', pt: 'Tóquio, Japão' },
  'links.title': { en: 'Links', pt: 'Links' },
  'links.intro': { en: 'Where to find me, and the gear I run.', pt: 'Onde me encontrar e o equipamento que eu uso.' },
  'links.comingSoon': { en: 'link coming soon', pt: 'link em breve' },
  'links.social': { en: 'Social', pt: 'Redes' },
  'links.setup': { en: 'My Setup', pt: 'Meu Setup' },
  'notfound.title': { en: 'Page not found', pt: 'Página não encontrada' },
  'notfound.text': {
    en: 'This note does not exist, or was never public.',
    pt: 'Esta nota não existe, ou nunca foi pública.',
  },
  'notfound.home': { en: 'Back home', pt: 'Voltar ao início' },
};

export function t(locale: Locale, key: keyof typeof dict): string {
  return dict[key][locale];
}
