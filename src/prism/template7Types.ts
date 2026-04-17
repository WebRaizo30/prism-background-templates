export interface PrismWarningStripeApi {
  applyConfig(partial: Partial<Template7Config>): void;
  getState(): Template7Config;
  reset(): void;
  defaults: Template7Config;
}

export interface Template7Config {
  color1: string;
  color2: string;
  stripeSizePx: number;
  durationSec: number;
  /** Shown as masked stripe text (max 48 chars). */
  labelText: string;
}
