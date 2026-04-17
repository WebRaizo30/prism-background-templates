export interface PrismCssLinesApi {
  applyConfig(partial: Partial<Template6Config>): void;
  getState(): Template6Config;
  reset(): void;
  defaults: Template6Config;
}

export interface Template6Config {
  bgColor: string;
  lineColor: string;
  lineOpacity: number;
  dropHighlight: string;
  dropDurationSec: number;
  delayLine1: number;
  delayLine2: number;
  delayLine3: number;
  linesWidthPercent: number;
  lineWidthPx: number;
}
