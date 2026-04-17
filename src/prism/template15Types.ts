export interface PrismStaticNoiseApi {
  applyConfig(partial: Partial<Template15Config>): void;
  getState(): Template15Config;
  reset(): void;
  defaults: Template15Config;
}

export interface Template15Config {
  bgColor: string;
  noiseOpacity: number;
  animDurationSec: number;
}
