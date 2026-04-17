export interface PrismRandomBgApi {
  applyConfig(partial: Partial<Template16Config>): void;
  getState(): Template16Config;
  reset(): void;
  defaults: Template16Config;
}

export interface Template16Config {
  animDurationSec: number;
  edgeColor: string;
  band15: string;
  band30: string;
  band45: string;
  band60: string;
  band75: string;
  centerBg: string;
  centerSizePx: number;
}
