export interface PrismBubblesApi {
  applyConfig(partial: Partial<Template5Config>): void;
  getState(): Template5Config;
  reset(): void;
  defaults: Template5Config;
}

/** CSS variables + pointer follower — all colors `#rrggbb`. */
export interface Template5Config {
  colorBg1: string;
  colorBg2: string;
  color1: string;
  color2: string;
  color3: string;
  color4: string;
  color5: string;
  colorInteractive: string;
  /** Gradient orb diameter as percent of viewport (30–120). */
  circleSizePercent: number;
  /** Mouse follower smoothing; higher = slower (4–80). */
  mouseSmooth: number;
}
