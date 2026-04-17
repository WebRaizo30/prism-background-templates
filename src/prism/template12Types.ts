export interface PrismParallelDimensionApi {
  applyConfig(partial: Partial<Template12Config>): void;
  getState(): Template12Config;
  reset(): void;
  defaults: Template12Config;
}

export interface Template12Config {
  colorLow: string;
  colorHigh: string;
  trailOpacity: number;
  particleSizePx: number;
  maxAmplitude: number;
  fov: number;
  dist: number;
  rotSpeed: number;
  waveSpeed: number;
  sideLength: number;
  spacingPx: number;
}
