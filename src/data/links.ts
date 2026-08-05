import { Cpu } from 'lucide';
import { kickMark, twitchMark, xMark, youtubeMark } from '../lib/brand-icons';

/**
 * Link-in-bio data. One typed entry per link: editing this file is how a
 * link gets added to `/links`. `url` is optional: entries without a URL
 * render as plain names (e.g. setup items with no affiliate link yet).
 * Affiliate groups are hidden entirely when they have no entries.
 */

export type LinkKind = 'social' | 'affiliate';

/** Shape of a lucide icon node (astro-lucide renders these). */
export type LucideIcon = typeof Cpu;

export interface SiteLink {
  label: string;
  /** Optional: rows without a URL render as plain names. */
  url?: string;
  /** Lucide line icon shown next to the label. */
  icon: LucideIcon;
}

export interface LinkGroup {
  kind: LinkKind;
  /** Group title shown on the page, e.g. "My Setup". */
  title: string;
  links: SiteLink[];
}

export const linkGroups: LinkGroup[] = [
  {
    kind: 'social',
    title: 'Social',
    links: [
      { label: 'YouTube', url: 'https://www.youtube.com/@Odryin', icon: youtubeMark },
      { label: 'YouTube AFK', url: 'https://www.youtube.com/@OdryinAFK', icon: youtubeMark },
      { label: 'YouTube Cortes', url: 'https://www.youtube.com/@OdryinCortes', icon: youtubeMark },
      { label: 'Twitch', url: 'https://www.twitch.tv/Odryin', icon: twitchMark },
      { label: 'Kick', url: 'https://kick.com/Odryin', icon: kickMark },
      { label: 'X', url: 'https://x.com/odryin', icon: xMark },
    ],
  },
  {
    kind: 'affiliate',
    title: 'My Setup',
    links: [
      { label: 'AMD Ryzen 7 5700X3D', icon: Cpu },
      { label: 'Rise Mode 32 GB RAM', icon: Cpu },
      { label: 'ASUS TUF B550M-Plus', icon: Cpu },
      { label: 'ASUS RTX 3060 12 GB', icon: Cpu },
      { label: 'MSI 750 W Gold PSU', icon: Cpu },
      { label: 'Minifire 27" 1440p 200 Hz monitor', icon: Cpu },
      { label: 'Thermalright 240 mm AIO watercooler', icon: Cpu },
      { label: 'UGREEN 4K HDMI capture card', icon: Cpu },
      { label: 'DIY case', icon: Cpu },
    ],
  },
];
