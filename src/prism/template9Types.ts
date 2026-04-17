export interface PrismInfinityBgApi {
  applyConfig(partial: Partial<Template9Config>): void;
  getState(): Template9Config;
  reset(): void;
  defaults: Template9Config;
}

export interface Template9Config {
  /** Center headline (replaces original ::before text). */
  labelText: string;
  textColor: string;
  /** CSS animation duration for the scrolling grid (seconds). */
  durationSec: number;
  /** Grid tile size in pixels (background-position step). */
  tileSizePx: number;
  /** Headline font size in rem. */
  labelSizeRem: number;
  /** Body top margin in rem (original ~13.5). */
  bodyMarginTopRem: number;
}
