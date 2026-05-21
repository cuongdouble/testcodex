# Project Instructions — AI Gold Trading Advice

## 1) Project overview
This project is an MVP full-stack web application that provides AI-based trading suggestions for gold markets.

Supported instruments:
- Spot gold: `XAUUSD`
- Gold futures continuous: `GC1!`
- Micro gold futures continuous: `MGC1!`

Core capabilities:
- Render live chart UI using TradingView widget in the browser.
- Stream live-like candle updates (OHLCV) from backend to frontend via WebSocket.
- Expose REST APIs for instruments, candles, and advice.
- Generate recommendation payload with `BUY | SELL | WAIT` using:
  - OpenAI API mode (when `OPENAI_API_KEY` is configured), or
  - local heuristic fallback mode (when API key is absent).

> Important: current market stream is synthetic for MVP development and integration testing. It is not connected to a production-grade brokerage/feed yet.

---

## 2) Repository structure

- `backend/` — Express + WebSocket + TypeScript server
  - `src/server.ts` — HTTP + WS bootstrap (`/api`, `/stream`)
  - `src/routes/api.ts` — REST endpoints
  - `src/services/instruments.ts` — instrument registry/mapping
  - `src/services/marketData.ts` — in-memory candle generation/cache
  - `src/services/advice.ts` — advice engine (OpenAI + fallback)
  - `src/models/types.ts` — shared domain types

- `frontend/` — React + Vite + TypeScript client
  - `src/main.tsx` — UI, TradingView embed, API calls, WS subscription

- Root
  - `package.json` — npm workspace scripts
  - `README.md` — quick start notes
  - `INSTRUCTIONS.md` — this detailed instruction file

---

## 3) Runtime architecture

1. Frontend loads instruments from `GET /api/instruments`.
2. User selects symbol and timeframe.
3. TradingView chart displays mapped symbol (e.g. `OANDA:XAUUSD`, `COMEX:GC1!`).
4. Backend periodically updates candles and pushes events on `/stream`.
5. Frontend listens WS and shows latest `close` and `volume`.
6. On “Get AI Advice”, frontend calls `POST /api/advice`.
7. Backend returns normalized advice JSON.

---

## 4) API contracts

### `GET /api/health`
Response:
```json
{ "ok": true }
```

### `GET /api/instruments`
Response:
```json
{
  "instruments": [
    {
      "symbol": "XAUUSD",
      "tvSymbol": "OANDA:XAUUSD",
      "displayName": "Gold Spot (XAUUSD)",
      "instrumentType": "spot",
      "exchange": "OTC",
      "timezone": "Etc/UTC",
      "delayed": false
    }
  ]
}
```

### `GET /api/candles?symbol=XAUUSD&timeframe=1m`
Response:
```json
{
  "symbol": "XAUUSD",
  "timeframe": "1m",
  "candles": [
    { "ts": 0, "open": 0, "high": 0, "low": 0, "close": 0, "volume": 0 }
  ]
}
```

### `POST /api/advice`
Request body:
```json
{ "symbol": "XAUUSD", "timeframe": "1m" }
```
Response shape:
```json
{
  "symbol": "XAUUSD",
  "timeframe": "1m",
  "advice": {
    "signal": "BUY",
    "confidence": 0.67,
    "reasons": ["..."],
    "risk_level": "MEDIUM",
    "entry_zone": "...",
    "stop_loss": "...",
    "take_profit": "...",
    "time_horizon": "intraday",
    "warning": "Educational only, not financial advice"
  },
  "at": "2026-01-01T00:00:00.000Z"
}
```

### WebSocket `/stream`
Message types:
- `hello` on connect
- `candle` updates:
```json
{
  "type": "candle",
  "symbol": "XAUUSD",
  "timeframe": "1m",
  "candle": { "ts": 0, "open": 0, "high": 0, "low": 0, "close": 0, "volume": 0 }
}
```

---

## 5) Environment configuration

Create `backend/.env` (optional):
```bash
OPENAI_API_KEY=your_key_here
PORT=4000
```

Behavior:
- With `OPENAI_API_KEY`: use OpenAI responses API for advice generation.
- Without key: fallback to deterministic local heuristic.

---

## 6) Local development workflow

From repo root:
```bash
npm install
npm run dev
```

Default ports:
- Backend: `http://localhost:4000`
- Frontend: `http://localhost:5173`

Build check:
```bash
npm run build
```

---

## 7) Known limitations (current MVP)

- Candle stream is synthetic (mocked), not broker-grade live feed.
- No authentication/authorization.
- No persistence/database; candles are in-memory.
- No automated unit/integration tests yet.
- No risk engine or strategy backtesting module.

---

## 8) Recommended next steps

1. Replace `marketData.ts` with real provider integrations for XAUUSD and futures.
2. Add persistence (PostgreSQL/TimescaleDB) for candle/advice history.
3. Add indicator pipeline (EMA/RSI/MACD/ATR) and stricter prompt schema validation.
4. Add frontend historical advice panel + confidence analytics.
5. Add test suite:
   - backend API integration tests,
   - advice schema contract tests,
   - frontend smoke tests.
6. Add production safety controls (rate limit, audit logs, error observability).

---

## 9) Compliance and disclaimer

All outputs are for education/research purposes only.

Required user-facing disclaimer:
- **"Educational only, not financial advice."**

Do not use this MVP as-is for automatic trade execution without adding proper controls, legal review, and risk management.
