export interface PrismWaveLinesApi {
  applyConfig(partial: Partial<Template10Config>): void;
  getState(): Template10Config;
  reset(): void;
  defaults: Template10Config;
}

export interface Template10Config {
  /** SVG linearGradient first stop (wave fill). */
  gradientStop0: string;
  /** SVG linearGradient second stop (wave fill). */
  gradientStop1: string;
  /** Body radial gradient center color. */
  bgRadialInner: string;
  /** Body radial gradient outer color. */
  bgRadialOuter: string;
  /** GSAP global timeline speed multiplier. */
  timeScale: number;
}
