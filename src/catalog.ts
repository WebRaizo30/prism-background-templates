/** Gallery metadata (titles aligned with templates/ATTRIBUTION.md). */
export interface TemplateEntry {
  readonly id: number;
  readonly title: string;
  /** Short blurb: what this background is good for */
  readonly description: string;
  /** One-line stack / tech label */
  readonly stack: string;
}

export const TEMPLATE_CATALOG: readonly TemplateEntry[] = [
  {
    id: 1,
    title: 'Shape Wave',
    description:
      'SVG wave motion with color, speed, and shape controls. Full Engine: copy JSON and download a single standalone HTML file.',
    stack: 'SVG · Canvas · Export',
  },
  {
    id: 2,
    title: 'WebGL Shader Hero Design',
    description: 'Full-screen fragment shader; palette and mouse-driven hero backdrop.',
    stack: 'WebGL · GLSL',
  },
  {
    id: 3,
    title: 'Sparkling Boxes',
    description: 'Three.js box particles; density and color for a glittery scene.',
    stack: 'Three.js',
  },
  {
    id: 4,
    title: 'CPChallenge: Neon Strings Shader',
    description: 'Neon string shader; bright lines and motion.',
    stack: 'WebGL · Shader',
  },
  {
    id: 5,
    title: 'Bubbles Background Animation',
    description: 'Floating bubbles; speed and look for a light, playful background.',
    stack: 'Canvas',
  },
  {
    id: 6,
    title: 'CSS Background Effect',
    description: 'Layered CSS gradients and animation; lightweight and fast.',
    stack: 'CSS',
  },
  {
    id: 7,
    title: 'Only CSS: Warning',
    description: 'Typographic warning stripes; bold static or animated look.',
    stack: 'CSS',
  },
  {
    id: 8,
    title: 'Hearts animation background',
    description: 'Floating heart particles; romantic or social-themed pages.',
    stack: 'CSS · DOM',
  },
  {
    id: 9,
    title: 'Pure css infinite background animation',
    description: 'Infinite CSS pattern loop; cheap decorative fill.',
    stack: 'CSS',
  },
  {
    id: 10,
    title: 'WaVvVvVvVeSsS',
    description: 'Wave and typography motion; great behind a headline or logo.',
    stack: 'CSS',
  },
  {
    id: 11,
    title: 'Cloudy Spiral CSS animation',
    description: 'Cloud-like spiral motion; soft, hypnotic backdrop.',
    stack: 'CSS',
  },
  {
    id: 12,
    title: 'Parallel dimension',
    description: 'Layered “dimension” feel; depth and color for sci-fi mood.',
    stack: 'CSS',
  },
  {
    id: 13,
    title: 'Beesandbombs/davidope Inspired Three.js Animation',
    description: 'Geometric Three.js loop; repeating, math-forward aesthetic.',
    stack: 'Three.js',
  },
  {
    id: 14,
    title: 'Particle Teapot with Glow Effects',
    description: 'Particle surface, bloom, and shape presets; color gradient and background controls.',
    stack: 'Three.js · PostFX',
  },
  {
    id: 15,
    title: 'CSS only animated static noise background',
    description: 'TV static / grain; film and retro UI vibes.',
    stack: 'CSS',
  },
  {
    id: 16,
    title: 'Random Background Color use CSS',
    description: 'Random color shifts; a fresh palette feel on each load.',
    stack: 'CSS',
  },
  {
    id: 17,
    title: 'Rays background',
    description: 'God-ray style light; dramatic spotlight and depth.',
    stack: 'CSS',
  },
];

export function previewUrl(id: number): string {
  return `/templates/${id}/dist/index.html`;
}
