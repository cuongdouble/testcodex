import OpenAI from "openai";
import { AdviceResponse, Candle, Instrument } from "../models/types.js";

const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

function localHeuristic(candles: Candle[]): AdviceResponse {
  const last = candles[candles.length - 1];
  const prev = candles[candles.length - 2] ?? last;
  const momentum = last.close - prev.close;
  const volSpike = last.volume > prev.volume * 1.3;
  const signal = momentum > 0.6 && volSpike ? "BUY" : momentum < -0.6 && volSpike ? "SELL" : "WAIT";

  return {
    signal,
    confidence: signal === "WAIT" ? 0.52 : 0.67,
    reasons: [
      `Momentum delta: ${momentum.toFixed(2)}`,
      `Volume: ${last.volume.toFixed(0)} vs prev ${prev.volume.toFixed(0)}`,
      "Heuristic mode active (no OPENAI_API_KEY).",
    ],
    risk_level: "MEDIUM",
    entry_zone: `${(last.close - 0.5).toFixed(2)} - ${(last.close + 0.5).toFixed(2)}`,
    stop_loss: (last.close - 3.8).toFixed(2),
    take_profit: (last.close + 6.2).toFixed(2),
    time_horizon: "intraday",
    warning: "Educational only, not financial advice",
  };
}

export async function generateAdvice(instrument: Instrument, timeframe: string, candles: Candle[]) {
  if (!client) return localHeuristic(candles);

  const payload = {
    instrument,
    timeframe,
    candles: candles.slice(-80),
  };

  const prompt = `You are a disciplined gold market assistant. Return JSON only with keys: signal, confidence, reasons, risk_level, entry_zone, stop_loss, take_profit, time_horizon, warning. Use BUY/SELL/WAIT and include warning exactly 'Educational only, not financial advice'. Input: ${JSON.stringify(payload)}`;

  const completion = await client.responses.create({
    model: "gpt-5-mini",
    input: prompt,
  });

  const text = completion.output_text;
  try {
    return JSON.parse(text) as AdviceResponse;
  } catch {
    return localHeuristic(candles);
  }
}
