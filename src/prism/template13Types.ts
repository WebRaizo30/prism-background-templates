export interface PrismBeesThreeApi {
  applyConfig(partial: Partial<Template13Config>): void;
  getState(): Template13Config;
  reset(): void;
  defaults: Template13Config;
}

export interface Template13Config {
  clearColor: string;
  torusColor: string;
  fov: number;
  cameraZ: number;
  rotationSpeed: number;
  torusMajorRadius: number;
  tubeRadius: number;
  radialSegments: number;
  tubularSegments: number;
  textureRepeat: number;
}
