export interface PrismNeonStringsApi {
  applyConfig(partial: Partial<Template4Config>): void;
  getState(): Template4Config;
  reset(): void;
  defaults: Template4Config;
}

export interface Template4Config {
  timeScale: number;
  paused: boolean;
  /** `#rrggbb` — multiplies final fragment color */
  tint: string;
}
