export interface PrismHeartsApi {
  applyConfig(partial: Partial<Template8Config>): void;
  getState(): Template8Config;
  reset(): void;
  defaults: Template8Config;
}

export interface Template8Config {
  /** Six heart palette colors (hex). */
  colors: [string, string, string, string, string, string];
  /** Scale increment per animation frame. */
  step: number;
  /** Upper bound before a heart resets (matches original ~18). */
  maxScale: number;
}
