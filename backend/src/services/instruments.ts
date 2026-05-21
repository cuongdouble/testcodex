import { Instrument } from "../models/types.js";

export const instruments: Instrument[] = [
  {
    symbol: "XAUUSD",
    tvSymbol: "OANDA:XAUUSD",
    displayName: "Gold Spot (XAUUSD)",
    instrumentType: "spot",
    exchange: "OTC",
    timezone: "Etc/UTC",
    delayed: false,
  },
  {
    symbol: "GC1!",
    tvSymbol: "COMEX:GC1!",
    displayName: "Gold Futures Continuous (GC1!)",
    instrumentType: "futures",
    exchange: "COMEX",
    timezone: "America/New_York",
    delayed: true,
  },
  {
    symbol: "MGC1!",
    tvSymbol: "COMEX_MINI:MGC1!",
    displayName: "Micro Gold Futures Continuous (MGC1!)",
    instrumentType: "futures",
    exchange: "COMEX_MINI",
    timezone: "America/New_York",
    delayed: true,
  },
];
