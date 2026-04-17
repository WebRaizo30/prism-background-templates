export interface PrismWebglHeroApi {
  applyConfig(partial: Partial<Template2Config>): void;
  getState(): Template2Config;
  reset(): void;
  defaults: Template2Config;
}

export interface Template2Config {
  timeScale: number;
  mouseSmooth: number;
  paused: boolean;
  /** `#rrggbb` — background nebula layer A */
  nebula1: string;
  /** `#rrggbb` — background nebula layer B */
  nebula2: string;
  /** `#rrggbb` — rim / edge highlight */
  edgeTint: string;
  /** `#rrggbb` — subsurface-style accent */
  sssTint: string;
  /** `#rrggbb` — final color grade (warm / cool) */
  grade: string;
}
