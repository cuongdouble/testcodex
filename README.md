# AI Gold Trading Advice (XAUUSD + Gold Futures)

MVP web app that:
- shows live TradingView chart,
- streams candle updates (price + volume),
- sends market context to AI for BUY/SELL/WAIT advice.

## Supported symbols
- `XAUUSD` (spot)
- `GC1!` (Gold futures continuous)
- `MGC1!` (Micro gold futures continuous)

## Run
```bash
npm install
npm run dev
```
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`

## Optional OpenAI
Create `backend/.env`:
```bash
OPENAI_API_KEY=...
PORT=4000
```
If missing API key, backend uses local heuristic advice.

## API
- `GET /api/instruments`
- `GET /api/candles?symbol=XAUUSD&timeframe=1m`
- `POST /api/advice` with body `{ "symbol": "XAUUSD", "timeframe": "1m" }`
- WebSocket stream: `ws://localhost:4000/stream`
