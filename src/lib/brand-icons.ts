import { Mail } from 'lucide';

/**
 * Brand marks as lucide-compatible icon nodes. Lucide deprecated its brand
 * icons (Github, Linkedin, etc.), so these carry the official paths in the
 * same tuple shape astro-lucide renders.
 */

/** Shape of a lucide icon node (astro-lucide renders these). */
export type LucideIcon = typeof Mail;

export const githubMark: LucideIcon = [
  'svg',
  {
    xmlns: 'http://www.w3.org/2000/svg',
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': 2,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  },
  [
    ['path', { d: 'M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4' }],
    ['path', { d: 'M9 18c-4.51 2-5-2-7-2' }],
  ],
];

export const linkedinMark: LucideIcon = [
  'svg',
  {
    xmlns: 'http://www.w3.org/2000/svg',
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': 2,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  },
  [
    ['path', { d: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z' }],
    ['rect', { width: '4', height: '12', x: '2', y: '9' }],
    ['circle', { cx: '4', cy: '4', r: '2' }],
  ],
];

export const xMark: LucideIcon = [
  'svg',
  {
    xmlns: 'http://www.w3.org/2000/svg',
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': 2,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  },
  [
    ['path', { d: 'M4 4l16 16' }],
    ['path', { d: 'M20 4 4 20' }],
  ],
];

export const youtubeMark: LucideIcon = [
  'svg',
  {
    xmlns: 'http://www.w3.org/2000/svg',
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': 2,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  },
  [
    ['rect', { width: '20', height: '13', x: '2', y: '5.5', rx: '3' }],
    ['path', { d: 'm10 9 5 2.5-5 2.5z', fill: 'currentColor', stroke: 'none' }],
  ],
];

export const twitchMark: LucideIcon = [
  'svg',
  {
    xmlns: 'http://www.w3.org/2000/svg',
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': 2,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  },
  [
    ['path', { d: 'M21 2H3v16h5v4l4-4h5l4-4V2z' }],
    ['path', { d: 'M11 7v4' }],
    ['path', { d: 'M16 7v4' }],
  ],
];

export const kickMark: LucideIcon = [
  'svg',
  {
    xmlns: 'http://www.w3.org/2000/svg',
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': 2,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  },
  [
    ['path', { d: 'M13 2 3 14h7l-1 8 10-12h-7l1-8z' }],
  ],
];
