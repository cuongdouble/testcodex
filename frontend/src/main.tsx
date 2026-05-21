import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";

type Instrument = { symbol: string; tvSymbol: string; displayName: string; delayed: boolean };

declare global {
  interface Window {
    TradingView: any;
  }
}

function App() {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [symbol, setSymbol] = useState("XAUUSD");
  const [timeframe, setTimeframe] = useState("1m");
  const [advice, setAdvice] = useState<any>(null);
  const [live, setLive] = useState<string>("waiting stream...");

  const selected = useMemo(() => instruments.find((x) => x.symbol === symbol), [instruments, symbol]);

  useEffect(() => {
    fetch("http://localhost:4000/api/instruments").then((r) => r.json()).then((d) => setInstruments(d.instruments));
  }, []);

  useEffect(() => {
    const s = document.createElement("script");
    s.src = "https://s3.tradingview.com/tv.js";
    s.onload = () => {
      if (!selected) return;
      new window.TradingView.widget({
        autosize: true,
        symbol: selected.tvSymbol,
        interval: timeframe.replace("m", ""),
        timezone: "Etc/UTC",
        theme: "dark",
        style: "1",
        locale: "en",
        container_id: "tv_chart",
      });
    };
    document.body.appendChild(s);
    return () => {
      s.remove();
      const chart = document.getElementById("tv_chart");
      if (chart) chart.innerHTML = "";
    };
  }, [selected, timeframe]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:4000/stream");
    ws.onmessage = (evt) => {
      const msg = JSON.parse(evt.data);
      if (msg.type === "candle" && msg.symbol === symbol) {
        setLive(`${msg.symbol} ${msg.timeframe} close=${msg.candle.close.toFixed(2)} vol=${msg.candle.volume.toFixed(0)}`);
      }
    };
    return () => ws.close();
  }, [symbol]);

  async function getAdvice() {
    const r = await fetch("http://localhost:4000/api/advice", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ symbol, timeframe }),
    });
    setAdvice(await r.json());
  }

  return (
    <div style={{ fontFamily: "sans-serif", background: "#0b1020", color: "#e5e7eb", minHeight: "100vh", padding: 16 }}>
      <h2>AI Trading Advice — Gold</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <select value={symbol} onChange={(e) => setSymbol(e.target.value)}>
          {instruments.map((i) => <option key={i.symbol} value={i.symbol}>{i.displayName}</option>)}
        </select>
        <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
          <option>1m</option><option>5m</option><option>15m</option>
        </select>
        <button onClick={getAdvice}>Get AI Advice</button>
      </div>
      <div style={{ marginBottom: 10 }}>Live: {live} {selected?.delayed ? "(data may be delayed)" : ""}</div>
      <div id="tv_chart" style={{ height: 460, border: "1px solid #374151", marginBottom: 12 }} />
      <pre style={{ background: "#111827", padding: 12, borderRadius: 8, overflow: "auto" }}>{advice ? JSON.stringify(advice, null, 2) : "No advice yet."}</pre>
      <p style={{ fontSize: 12, opacity: 0.8 }}>Educational only, not financial advice.</p>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
