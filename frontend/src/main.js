import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
function App() {
    const [instruments, setInstruments] = useState([]);
    const [symbol, setSymbol] = useState("XAUUSD");
    const [timeframe, setTimeframe] = useState("1m");
    const [advice, setAdvice] = useState(null);
    const [live, setLive] = useState("waiting stream...");
    const selected = useMemo(() => instruments.find((x) => x.symbol === symbol), [instruments, symbol]);
    useEffect(() => {
        fetch("http://localhost:4000/api/instruments").then((r) => r.json()).then((d) => setInstruments(d.instruments));
    }, []);
    useEffect(() => {
        const s = document.createElement("script");
        s.src = "https://s3.tradingview.com/tv.js";
        s.onload = () => {
            if (!selected)
                return;
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
            if (chart)
                chart.innerHTML = "";
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
    return (_jsxs("div", { style: { fontFamily: "sans-serif", background: "#0b1020", color: "#e5e7eb", minHeight: "100vh", padding: 16 }, children: [_jsx("h2", { children: "AI Trading Advice \u2014 Gold" }), _jsxs("div", { style: { display: "flex", gap: 8, marginBottom: 12 }, children: [_jsx("select", { value: symbol, onChange: (e) => setSymbol(e.target.value), children: instruments.map((i) => _jsx("option", { value: i.symbol, children: i.displayName }, i.symbol)) }), _jsxs("select", { value: timeframe, onChange: (e) => setTimeframe(e.target.value), children: [_jsx("option", { children: "1m" }), _jsx("option", { children: "5m" }), _jsx("option", { children: "15m" })] }), _jsx("button", { onClick: getAdvice, children: "Get AI Advice" })] }), _jsxs("div", { style: { marginBottom: 10 }, children: ["Live: ", live, " ", selected?.delayed ? "(data may be delayed)" : ""] }), _jsx("div", { id: "tv_chart", style: { height: 460, border: "1px solid #374151", marginBottom: 12 } }), _jsx("pre", { style: { background: "#111827", padding: 12, borderRadius: 8, overflow: "auto" }, children: advice ? JSON.stringify(advice, null, 2) : "No advice yet." }), _jsx("p", { style: { fontSize: 12, opacity: 0.8 }, children: "Educational only, not financial advice." })] }));
}
createRoot(document.getElementById("root")).render(_jsx(App, {}));
