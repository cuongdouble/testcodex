import { Router } from "express";
import { z } from "zod";
import { instruments } from "../services/instruments.js";
import { generateAdvice } from "../services/advice.js";
import { getCandles } from "../services/marketData.js";

export const api = Router();

api.get("/health", (_, res) => res.json({ ok: true }));

api.get("/instruments", (_, res) => {
  res.json({ instruments });
});

api.get("/candles", (req, res) => {
  const schema = z.object({ symbol: z.string(), timeframe: z.string().default("1m") });
  const parsed = schema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());
  const { symbol, timeframe } = parsed.data;
  const candles = getCandles(symbol, timeframe);
  return res.json({ symbol, timeframe, candles });
});

api.post("/advice", async (req, res) => {
  const schema = z.object({ symbol: z.string(), timeframe: z.string().default("1m") });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());
  const { symbol, timeframe } = parsed.data;

  const instrument = instruments.find((x) => x.symbol === symbol);
  if (!instrument) return res.status(404).json({ error: "Instrument not found" });

  const candles = getCandles(symbol, timeframe);
  const advice = await generateAdvice(instrument, timeframe, candles);
  return res.json({ symbol, timeframe, advice, at: new Date().toISOString() });
});
