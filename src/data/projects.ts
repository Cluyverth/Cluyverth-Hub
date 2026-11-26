type Project = {
  id: string;
  title: string;
  summary: string;
  stack: string[];
  screenshot: {
    src: `/media/${string}.webp`;
    width: number;
    height: number;
    alt: string;
  };
  repository: `https://${string}`;
  live: `https://${string}`;
};

export const projects: Project[] = [
  {
    id: 'cluyverth-hub',
    title: 'Cluyverth Hub',
    summary: 'Site pessoal estático para publicar textos e reunir links em um só lugar.',
    stack: ['Astro', 'TypeScript'],
    screenshot: {
      src: '/media/screenshot-home.webp',
      width: 1024,
      height: 640,
      alt: 'Página inicial do Cluyverth Hub',
    },
    repository: 'https://github.com/Cluyverth/Cluyverth-Hub',
    live: 'https://cluyverth.com',
  },
  {
    id: 'estudio-template',
    title: 'Estúdio Template',
    summary: 'Template de portfólio em Astro, com galeria em masonry e lightbox.',
    stack: ['Astro', 'Tailwind CSS', 'JavaScript'],
    screenshot: {
      src: '/media/estudio-screenshot-galeria.webp',
      width: 738,
      height: 1024,
      alt: 'Galeria de imagens do Estúdio Template',
    },
    repository: 'https://github.com/Cluyverth/Estudio-Template',
    live: 'https://estudio.cluyverth.com',
  },
  {
    id: 'oficio-template',
    title: 'Ofício Template',
    summary: 'Template estático para negócios de serviço, com portfólio e contato por WhatsApp.',
    stack: ['Astro', 'Tailwind CSS', 'JavaScript'],
    screenshot: {
      src: '/media/oficio-screenshot-projetos.webp',
      width: 997,
      height: 1024,
      alt: 'Página de projetos do Ofício Template',
    },
    repository: 'https://github.com/Cluyverth/oficio-template',
    live: 'https://oficio.cluyverth.com',
  },
];
