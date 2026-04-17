export interface PrismCloudySpiralApi {
  applyConfig(partial: Partial<Template11Config>): void;
  getState(): Template11Config;
  reset(): void;
  defaults: Template11Config;
}

export interface Template11Config {
  bgColor: string;
  particleSizePx: number;
  radiusPx: number;
  lapDurationSec: number;
}
