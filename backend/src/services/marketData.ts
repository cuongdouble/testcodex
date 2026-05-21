import { Candle } from "../models/types.js";

const cache = new Map<string, Candle[]>();

function seed(symbol: string, timeframe: string) {
  const key = `${symbol}:${timeframe}`;
  if (cache.has(key)) return;

  const arr: Candle[] = [];
  const now = Date.now();
  const intervalMs = timeframeToMs(timeframe);
  let price = symbol === "XAUUSD" ? 2380 : 2395;

  for (let i = 120; i > 0; i--) {
    const ts = now - i * intervalMs;
    const drift = (Math.random() - 0.5) * 2.8;
    const open = price;
    const close = Math.max(1500, open + drift);
    const high = Math.max(open, close) + Math.random() * 1.8;
    const low = Math.min(open, close) - Math.random() * 1.8;
    const volume = 120 + Math.random() * 700;
    arr.push({ ts, open, high, low, close, volume });
    price = close;
  }

  cache.set(key, arr);
}

export function timeframeToMs(timeframe: string) {
  if (timeframe.endsWith("m")) return Number(timeframe.replace("m", "")) * 60_000;
  if (timeframe.endsWith("h")) return Number(timeframe.replace("h", "")) * 3_600_000;
  return 60_000;
}

export function getCandles(symbol: string, timeframe: string) {
  seed(symbol, timeframe);
  return cache.get(`${symbol}:${timeframe}`) ?? [];
}

export function stepCandle(symbol: string, timeframe: string) {
  const key = `${symbol}:${timeframe}`;
  const candles = getCandles(symbol, timeframe);
  const last = candles[candles.length - 1];
  const drift = (Math.random() - 0.5) * 3.2;
  const open = last.close;
  const close = Math.max(1500, open + drift);
  const high = Math.max(open, close) + Math.random() * 1.2;
  const low = Math.min(open, close) - Math.random() * 1.2;
  const volume = 130 + Math.random() * 860;
  const next: Candle = {
    ts: last.ts + timeframeToMs(timeframe),
    open,
    high,
    low,
    close,
    volume,
  };
  const nextSeries = [...candles.slice(-199), next];
  cache.set(key, nextSeries);
  return next;
}
