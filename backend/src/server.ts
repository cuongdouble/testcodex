import "dotenv/config";
import cors from "cors";
import express from "express";
import { WebSocketServer } from "ws";
import { createServer } from "http";
import { api } from "./routes/api.js";
import { stepCandle } from "./services/marketData.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", api);

const server = createServer(app);
const wss = new WebSocketServer({ server, path: "/stream" });

wss.on("connection", (ws) => {
  ws.send(JSON.stringify({ type: "hello", message: "connected" }));
});

setInterval(() => {
  for (const [symbol, timeframe] of [["XAUUSD", "1m"], ["GC1!", "1m"], ["MGC1!", "1m"]] as const) {
    const candle = stepCandle(symbol, timeframe);
    const payload = JSON.stringify({ type: "candle", symbol, timeframe, candle });
    for (const client of wss.clients) {
      if (client.readyState === 1) client.send(payload);
    }
  }
}, 3000);

const port = Number(process.env.PORT ?? 4000);
server.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});
