import { ElementCategory, MatterState } from '../types/element';

export interface CategoryInfo {
  name: ElementCategory;
  description: string;
  bgLight: string;
  bgSolid: string;
  textLight: string;
  borderLight: string;
  accentColor: string;
  dotColor: string;
}

export const CATEGORIES: Record<ElementCategory, CategoryInfo> = {
  'Logam Alkali': {
    name: 'Logam Alkali',
    description: 'Logam golongan 1 yang sangat reaktif, lunak, dan mudah melepaskan 1 elektron valensi.',
    bgLight: 'bg-rose-500/15 hover:bg-rose-500/25',
    bgSolid: 'bg-rose-500',
    textLight: 'text-rose-300',
    borderLight: 'border-rose-500/30',
    accentColor: '#f43f5e',
    dotColor: 'bg-rose-400',
  },
  'Logam Alkali Tanah': {
    name: 'Logam Alkali Tanah',
    description: 'Logam golongan 2 yang reaktif, memiliki 2 elektron valensi, dan membentuk basa kuat.',
    bgLight: 'bg-amber-500/15 hover:bg-amber-500/25',
    bgSolid: 'bg-amber-500',
    textLight: 'text-amber-300',
    borderLight: 'border-amber-500/30',
    accentColor: '#f59e0b',
    dotColor: 'bg-amber-400',
  },
  'Logam Transisi': {
    name: 'Logam Transisi',
    description: 'Logam blok d (golongan 3–12) berdaya hantar listrik/panas tinggi dan memiliki banyak biloks.',
    bgLight: 'bg-cyan-500/15 hover:bg-cyan-500/25',
    bgSolid: 'bg-cyan-500',
    textLight: 'text-cyan-300',
    borderLight: 'border-cyan-500/30',
    accentColor: '#06b6d4',
    dotColor: 'bg-cyan-400',
  },
  'Logam Pascatransisi': {
    name: 'Logam Pascatransisi',
    description: 'Logam lunak di blok p sebelah kanan logam transisi dengan elektronegativitas lebih tinggi.',
    bgLight: 'bg-blue-500/15 hover:bg-blue-500/25',
    bgSolid: 'bg-blue-500',
    textLight: 'text-blue-300',
    borderLight: 'border-blue-500/30',
    accentColor: '#3b82f6',
    dotColor: 'bg-blue-400',
  },
  'Metaloid': {
    name: 'Metaloid',
    description: 'Unsur semilogam yang memiliki sifat perantara antara logam dan nonlogam (semikonduktor).',
    bgLight: 'bg-teal-500/15 hover:bg-teal-500/25',
    bgSolid: 'bg-teal-500',
    textLight: 'text-teal-300',
    borderLight: 'border-teal-500/30',
    accentColor: '#14b8a6',
    dotColor: 'bg-teal-400',
  },
  'Nonlogam': {
    name: 'Nonlogam',
    description: 'Unsur yang tidak menghantarkan listrik dengan baik dan cenderung menarik elektron.',
    bgLight: 'bg-emerald-500/15 hover:bg-emerald-500/25',
    bgSolid: 'bg-emerald-500',
    textLight: 'text-emerald-300',
    borderLight: 'border-emerald-500/30',
    accentColor: '#10b981',
    dotColor: 'bg-emerald-400',
  },
  'Halogen': {
    name: 'Halogen',
    description: 'Nonlogam golongan 17 yang sangat elektronegatif dan membutuhkan 1 elektron untuk oktet.',
    bgLight: 'bg-yellow-500/15 hover:bg-yellow-500/25',
    bgSolid: 'bg-yellow-500',
    textLight: 'text-yellow-300',
    borderLight: 'border-yellow-500/30',
    accentColor: '#eab308',
    dotColor: 'bg-yellow-400',
  },
  'Gas Mulia': {
    name: 'Gas Mulia',
    description: 'Gas golongan 18 yang sangat stabil (duplet/oktet) dan sukar bereaksi dengan unsur lain.',
    bgLight: 'bg-purple-500/15 hover:bg-purple-500/25',
    bgSolid: 'bg-purple-500',
    textLight: 'text-purple-300',
    borderLight: 'border-purple-500/30',
    accentColor: '#a855f7',
    dotColor: 'bg-purple-400',
  },
  'Lantanida': {
    name: 'Lantanida',
    description: 'Seri 15 unsur tanah jarang (nomor atom 57–71) pada blok 4f dengan sifat magnetik khas.',
    bgLight: 'bg-pink-500/15 hover:bg-pink-500/25',
    bgSolid: 'bg-pink-500',
    textLight: 'text-pink-300',
    borderLight: 'border-pink-500/30',
    accentColor: '#ec4899',
    dotColor: 'bg-pink-400',
  },
  'Aktinida': {
    name: 'Aktinida',
    description: 'Seri 15 unsur radioaktif (nomor atom 89–103) pada blok 5f, sebagian besar buatan.',
    bgLight: 'bg-fuchsia-500/15 hover:bg-fuchsia-500/25',
    bgSolid: 'bg-fuchsia-500',
    textLight: 'text-fuchsia-300',
    borderLight: 'border-fuchsia-500/30',
    accentColor: '#d946ef',
    dotColor: 'bg-fuchsia-400',
  },
};

export const CATEGORY_LIST: ElementCategory[] = [
  'Logam Alkali',
  'Logam Alkali Tanah',
  'Logam Transisi',
  'Logam Pascatransisi',
  'Metaloid',
  'Nonlogam',
  'Halogen',
  'Gas Mulia',
  'Lantanida',
  'Aktinida',
];

export const STATE_STYLES: Record<MatterState, { label: string; badge: string; icon: string }> = {
  Padat: {
    label: 'Padat',
    badge: 'bg-slate-800 text-slate-200 border-slate-700',
    icon: '■',
  },
  Cair: {
    label: 'Cair',
    badge: 'bg-sky-950/80 text-sky-300 border-sky-700/50',
    icon: '💧',
  },
  Gas: {
    label: 'Gas',
    badge: 'bg-violet-950/80 text-violet-300 border-violet-700/50',
    icon: '☁',
  },
  Sintetis: {
    label: 'Sintetis / Buatan',
    badge: 'bg-neutral-800/80 text-neutral-400 border-neutral-700/50',
    icon: '⚙',
  },
};
