export const PALETTES = {
  broadsheet: {
    name: 'Broadsheet',
    '--paper':   'oklch(0.97 0.008 85)',
    '--paper-2': 'oklch(0.94 0.012 85)',
    '--ink':     'oklch(0.18 0.012 60)',
    '--ink-2':   'oklch(0.35 0.012 60)',
    '--rule':    'oklch(0.72 0.012 60)',
    '--accent':  'oklch(0.48 0.15 25)',
    '--good':    'oklch(0.42 0.08 150)',
  },
  financial: {
    name: 'Financial',
    '--paper':   'oklch(0.93 0.022 45)',
    '--paper-2': 'oklch(0.90 0.028 45)',
    '--ink':     'oklch(0.22 0.015 40)',
    '--ink-2':   'oklch(0.40 0.015 40)',
    '--rule':    'oklch(0.72 0.02 40)',
    '--accent':  'oklch(0.42 0.12 30)',
    '--good':    'oklch(0.40 0.08 145)',
  },
  midnight: {
    name: 'Midnight',
    '--paper':   'oklch(0.18 0.012 250)',
    '--paper-2': 'oklch(0.22 0.015 250)',
    '--ink':     'oklch(0.93 0.008 90)',
    '--ink-2':   'oklch(0.75 0.01 90)',
    '--rule':    'oklch(0.40 0.015 250)',
    '--accent':  'oklch(0.78 0.14 75)',
    '--good':    'oklch(0.80 0.12 150)',
  },
  mint: {
    name: 'Mint',
    '--paper':   'oklch(0.96 0.018 165)',
    '--paper-2': 'oklch(0.93 0.022 165)',
    '--ink':     'oklch(0.22 0.02 180)',
    '--ink-2':   'oklch(0.38 0.02 180)',
    '--rule':    'oklch(0.72 0.02 165)',
    '--accent':  'oklch(0.48 0.13 25)',
    '--good':    'oklch(0.44 0.10 160)',
  },
};

export const VISUAL_OPTIONS = [
  { value: 'gallows',    label: 'Gallows' },
  { value: 'sandcastle', label: 'Sandcastle' },
  { value: 'candle',     label: 'Candle' },
  { value: 'inkblot',    label: 'Ink blot' },
];

export const PALETTE_OPTIONS = [
  { value: 'broadsheet', label: 'Paper' },
  { value: 'financial',  label: 'Salmon' },
  { value: 'midnight',   label: 'Night' },
  { value: 'mint',       label: 'Mint' },
];
