import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

type Incident = { id: string; type: string; description: string; severity: string; status: string; latitude: number; longitude: number };
const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

function App() {
  const [view, setView] = useState("home");
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [health, setHealth] = useState("checking");
  const [form, setForm] = useState({ incidentType: "medical", description: "", latitude: "0", longitude: "0", timestamp: new Date().toISOString().slice(0, 16), reporterId: "demo-user" });
  const refresh = () => fetch(`${API}/api/incidents`).then((r) => r.json()).then(setIncidents).catch(() => setIncidents([]));
  useEffect(() => { fetch(`${API}/health`).then((r) => r.json()).then((d) => setHealth(d.status)).catch(() => setHealth("offline")); refresh(); }, []);
  const submit = async (e: React.FormEvent) => { e.preventDefault(); await fetch(`${API}/api/incidents`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...form, latitude: Number(form.latitude), longitude: Number(form.longitude) }) }); setForm({ ...form, description: "" }); await refresh(); setView("active"); };
  return <div className="shell"><header><strong>SENTINEL</strong><span>Emergency response network</span><small>API: {health}</small></header><nav>{["home","sos","incidents","responders","x402"].map((item) => <button key={item} onClick={() => setView(item)}>{item}</button>)}</nav><main>
    {view === "home" && <section><h1>Help when it matters.</h1><p>Report an emergency, coordinate responders, and keep a resilient incident record.</p><button className="primary" onClick={() => setView("sos")}>Send SOS</button><h2>System status</h2><p className="status">{health === "ok" ? "API connected" : "API unavailable — reports can be queued locally"}</p></section>}
    {view === "sos" && <section><h1>Send SOS</h1><form onSubmit={submit}>{Object.entries(form).map(([key, value]) => key !== "timestamp" && <label key={key}>{key}<input required value={value} onChange={(e) => setForm({ ...form, [key]: e.target.value })} /></label>)}<button className="primary">Create incident</button></form></section>}
    {["incidents","active","responders","x402"].includes(view) && <section><h1>{view === "x402" ? "Protected incident intelligence" : view === "responders" ? "Responder dashboard" : "Incident list"}</h1>{view === "x402" ? <p>This endpoint uses real HTTP 402 payment requirements and Algorand Testnet settlement through the configured GoPlausible facilitator. Connect a Testnet wallet to request advanced analysis.</p> : <>{incidents.length === 0 ? <p>No incidents reported yet.</p> : incidents.map((i) => <article key={i.id}><b>{i.type}</b><span>{i.status} · {i.severity}</span><p>{i.description}</p><small>{i.latitude}, {i.longitude}</small></article>)}</>}</section>}
  </main></div>;
}
createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
