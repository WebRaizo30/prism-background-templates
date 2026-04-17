export interface PrismParticleTeapotApi {
  applyConfig(partial: Partial<Template14Config>): void;
  getState(): Template14Config;
  reset(): void;
  defaults: Template14Config;
}

export type Template14ShapePreset = 'teapot' | 'torus' | 'sphere' | 'knot' | 'icosahedron';

export interface Template14Config {
  bgColorInner: string;
  bgColorOuter: string;
  ambientColor: string;
  ambientIntensity: number;
  fogDensity: number;
  cameraFov: number;
  cameraZ: number;
  rotationSpeed: number;
  particleSize: number;
  bloomStrength: number;
  bloomRadius: number;
  bloomThreshold: number;
  teapotSize: number;
  /** Source mesh for the particle surface */
  shapePreset: Template14ShapePreset;
  /** Particle color gradient (low index) */
  particleColorA: string;
  /** Particle color gradient (high index) */
  particleColorB: string;
}
