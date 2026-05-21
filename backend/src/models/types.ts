export type InstrumentType = "spot" | "futures";

export type AdviceSignal = "BUY" | "SELL" | "WAIT";

export type Instrument = {
  symbol: string;
  tvSymbol: string;
  displayName: string;
  instrumentType: InstrumentType;
  exchange: string;
  timezone: string;
  delayed: boolean;
};

export type Candle = {
  ts: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type AdviceResponse = {
  signal: AdviceSignal;
  confidence: number;
  reasons: string[];
  risk_level: "LOW" | "MEDIUM" | "HIGH";
  entry_zone: string;
  stop_loss: string;
  take_profit: string;
  time_horizon: "scalp" | "intraday" | "swing";
  warning: string;
};
