export interface PrismRaysBgApi {
  applyConfig(partial: Partial<Template17Config>): void;
  getState(): Template17Config;
  reset(): void;
  defaults: Template17Config;
}

export interface Template17Config {
  stripeColor: string;
  stripeColorAlt: string;
  animDurationSec: number;
  heroBlurPx: number;
  iconBlinkSec: number;
  switchOn: boolean;
  titleText: string;
}
