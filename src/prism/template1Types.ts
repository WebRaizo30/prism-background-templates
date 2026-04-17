export interface PrismShapeWaveApi {
  applyConfig(partial: Partial<Template1Config>): void;
  getState(): Template1Config;
  reset(): void;
  defaults: Template1Config;
}

export interface Template1Config {
  gap: number;
  radiusVmin: number;
  speedIn: number;
  speedOut: number;
  restScale: number;
  minHoverScale: number;
  maxHoverScale: number;
  waveSpeed: number;
  waveWidth: number;
  bgColor: string;
}
