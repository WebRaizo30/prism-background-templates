export interface PrismSparklingBoxesApi {
  applyConfig(partial: Partial<Template3Config>): void;
  getState(): Template3Config;
  reset(): void;
  randomizeColors(): void;
  defaults: Template3Config;
}

export interface Template3Config {
  attractionIntensity: number;
  size: number;
  maxVelocity: number;
  light1: string;
  light2: string;
}
