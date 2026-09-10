import { useEffect, useState } from "react";
import { NavLink, Route, Routes, useLocation } from "react-router-dom";
import type { FormEvent, ReactNode } from "react";
import { createSosIncident, fetchAgentDecision, fetchDemoStatus, fetchMapData, fetchSystemStatus, requestAdvancedIntelligence, resetDemo, seedDemo, type AgentDecision, type DemoStatus, type MapData, type SosIncident, type SosSubmission } from "./api";

type IconName = "grid" | "sos" | "alert" | "map" | "users" | "spark" | "wifi" | "bot" | "settings" | "search" | "bell" | "arrow" | "clock" | "shield" | "plus";

const navGroups = [
  {
    label: "Operations",
    items: [
      { label: "Dashboard", path: "/", icon: "grid" as IconName },
      { label: "SOS", path: "/sos", icon: "sos" as IconName, accent: true },
      { label: "Incidents", path: "/incidents", icon: "alert" as IconName, badge: "03" },
      { label: "Map", path: "/map", icon: "map" as IconName },
    ],
  },
  {
    label: "Network",
    items: [
      { label: "Responders", path: "/responders", icon: "users" as IconName },
      { label: "AI Intelligence", path: "/intelligence", icon: "spark" as IconName, badge: "BETA" },
      { label: "Offline Network", path: "/offline", icon: "wifi" as IconName },
      { label: "x402 Agent", path: "/x402", icon: "bot" as IconName },
    ],
  },
];

const viewCopy: Record<string, { eyebrow: string; title: string; description: string }> = {
  "/sos": { eyebrow: "Emergency response", title: "SOS Center", description: "Send a distress signal to the operations desk with your current location." },
  "/incidents": { eyebrow: "Operations log", title: "Incidents", description: "Track, triage, and coordinate incident response from one workspace." },
  "/map": { eyebrow: "Situational awareness", title: "Live Map", description: "Incident coordinates and nearest available responder coverage." },
  "/responders": { eyebrow: "Field network", title: "Responders", description: "Monitor responder readiness, assignments, and coverage." },
  "/intelligence": { eyebrow: "Decision support", title: "AI Intelligence", description: "Signals, summaries, and recommendations will be presented here." },
  "/offline": { eyebrow: "Resilient operations", title: "Offline Network", description: "Queued SOS submissions and store-and-forward sync status." },
  "/x402": { eyebrow: "Autonomous services", title: "x402 Agent", description: "Agent service status and activity will be shown here." },
  "/system": { eyebrow: "Platform health", title: "System", description: "Configuration, access, and platform health controls will live here." },
};

const queueKey = "sentinel:sos-queue";
function readQueue(): SosSubmission[] {
  try {
    const value = localStorage.getItem(queueKey);
    return value ? JSON.parse(value) as SosSubmission[] : [];
  } catch {
    return [];
  }
}
function writeQueue(queue: SosSubmission[]) {
  localStorage.setItem(queueKey, JSON.stringify(queue));
}
async function syncQueue(): Promise<{ synced: number; remaining: number }> {
  const queue = readQueue();
  let synced = 0;
  while (synced < queue.length) {
    try { await createSosIncident(queue[synced]); synced += 1; }
    catch { break; }
  }
  const remaining = queue.slice(synced);
  writeQueue(remaining);
  return { synced, remaining: remaining.length };
}

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const paths: Record<IconName, ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    sos: <><path d="M12 3 21 20H3L12 3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></>,
    alert: <><path d="M10.3 3.3 2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.3a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 17h.01" /></>,
    map: <><path d="m9 18-6 3V6l6-3 6 3 6-3v15l-6 3-6-3Z" /><path d="M9 3v15M15 6v15" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    spark: <><path d="m12 3-1.5 5.5L5 10l5.5 1.5L12 17l1.5-5.5L19 10l-5.5-1.5L12 3Z" /><path d="m19 16-.7 2.3L16 19l2.3.7L19 22l.7-2.3L22 19l-2.3-.7L19 16Z" /></>,
    wifi: <><path d="M5 12.5a11 11 0 0 1 14 0M8 16a6.7 6.7 0 0 1 8 0M11 19.5a2 2 0 0 1 2 0" /><path d="M12 20h.01" /></>,
    bot: <><rect x="4" y="7" width="16" height="13" rx="3" /><path d="M8 7V5a4 4 0 0 1 8 0v2M8 13h.01M16 13h.01M9 17h6" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.42 1.42-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V20h-2v-.08a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-1.42-1.42.06-.06A1.7 1.7 0 0 0 9.4 15a1.7 1.7 0 0 0-1.56-1.03H7v-2h.84A1.7 1.7 0 0 0 9.4 11a1.7 1.7 0 0 0-.34-1.88L9 9.06l1.42-1.42.06.06a1.7 1.7 0 0 0 1.88.34A1.7 1.7 0 0 0 13.39 6V5h2v1a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.42 1.42-.06.06a1.7 1.7 0 0 0-.34 1.88A1.7 1.7 0 0 0 21 12h.5v2H21a1.7 1.7 0 0 0-1.6 1Z" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    shield: <><path d="M12 21s8-4 8-10V5l-8-3-8 3v6c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
  };
  return <svg {...common} aria-hidden="true">{paths[name]}</svg>;
}

function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [apiOnline, setApiOnline] = useState(false);
  const isDashboard = location.pathname === "/";
  const page = viewCopy[location.pathname];
  useEffect(() => {
    const controller = new AbortController();
    fetchSystemStatus(controller.signal)
      .then(() => setApiOnline(true))
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setApiOnline(false);
        }

      });
    return () => controller.abort();
  }, []);
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a><aside className="sidebar">
        <div className="brand"><div className="brand-mark"><span /></div><div><strong>SENTINEL</strong><small>EMERGENCY OPERATIONS</small></div></div>
        <div className="workspace-switcher"><div className="workspace-avatar">N</div><div><span>Northstar Region</span><small>Operations workspace</small></div><span className="chevron">⌄</span></div>
        <nav aria-label="Primary navigation">
          {navGroups.map((group) => <div className="nav-group" key={group.label}><p>{group.label}</p>{group.items.map((item) => <NavLink key={item.path} to={item.path} end={item.path === "/"} className={({ isActive }) => `nav-item ${isActive ? "active" : ""} ${item.accent ? "accent" : ""}`}><Icon name={item.icon} /><span>{item.label}</span>{item.badge && <em>{item.badge}</em>}</NavLink>)}</div>)}
        </nav>
        <div className="sidebar-bottom"><NavLink to="/system" className="nav-item"><Icon name="settings" /><span>System</span></NavLink><div className="user-card"><div className="user-avatar">AR</div><div><strong>Alex Rivera</strong><small>Command lead</small></div><span className="presence" /></div></div>
      </aside>
      <main className="main-content" id="main-content">
        <header className="topbar"><div className="crumbs"><span>Northstar Region</span><b aria-hidden="true">/</b><strong>{isDashboard ? "Overview" : page?.title ?? "Overview"}</strong></div><div className="top-actions"><button type="button" className="icon-button" aria-label="Search"><Icon name="search" /></button><button type="button" className="icon-button notification" aria-label="Notifications"><Icon name="bell" /><i /></button><div className={`status-pill ${apiOnline ? "" : "offline"}`} role="status" aria-live="polite"><span />{apiOnline ? "All systems nominal" : "API unavailable"}</div></div></header>
        <div className="page-body">{children}</div>
      </main>
    </div>
  );
}

function useConnectivity() {
  const [online, setOnline] = useState(() => navigator.onLine);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => { window.removeEventListener("online", update); window.removeEventListener("offline", update); };
  }, []);
  return online;
}

function Dashboard() {
  return <><section className="hero"><div><p className="eyebrow">Thursday, September 10, 2026 · 14:32 UTC</p><h1>Good afternoon, Alex.</h1><p className="hero-copy">Here’s the current operational picture across your response network.</p></div><button className="outline-button"><Icon name="clock" size={16} /> Last synced just now</button></section>
    <section className="metrics"><Metric label="Active incidents" value="03" detail="1 critical · 2 monitoring" tone="red" icon="alert" /><Metric label="Responders online" value="24" detail="+4 from yesterday" tone="green" icon="users" /><Metric label="Network coverage" value="98.4%" detail="All regions connected" tone="blue" icon="wifi" /><Metric label="AI signals" value="12" detail="3 require review" tone="purple" icon="spark" /></section>
    <div className="dashboard-grid"><section className="panel incidents-panel"><PanelHeader title="Active incidents" link="View all incidents" /><div className="incident-list"><Incident title="Highway 12 · Mile 44" type="Medical emergency" time="12 min ago" severity="Critical" color="red" /><Incident title="East Harbor District" type="Unusual crowd density" time="28 min ago" severity="Elevated" color="amber" /><Incident title="Pine Ridge Trail" type="Missing person report" time="1 hr ago" severity="Monitoring" color="blue" /></div></section><section className="panel network-panel"><PanelHeader title="Network status" link="Open network" /><div className="network-visual"><div className="orb"><span /><span /><span /></div><div><strong>All systems operational</strong><p>24 nodes connected across 6 regions</p></div></div><div className="region-list"><Region name="Northstar" value="100%" /><Region name="East Harbor" value="98%" /><Region name="Pine Ridge" value="97%" /></div></section></div>
    <section className="panel activity-panel"><PanelHeader title="Recent activity" link="View activity log" /><div className="activity-list"><Activity icon="shield" title="System check completed" note="All services responding normally" time="Just now" /><Activity icon="users" title="Responder team updated" note="Unit R-14 joined Northstar coverage" time="8 min ago" /><Activity icon="spark" title="AI signal reviewed" note="East Harbor density alert acknowledged" time="21 min ago" /></div></section>
  </>;
}

function Metric({ label, value, detail, tone, icon }: { label: string; value: string; detail: string; tone: string; icon: IconName }) { return <div className="metric-card"><div className={`metric-icon ${tone}`}><Icon name={icon} /></div><div><p>{label}</p><strong>{value}</strong><small className={tone === "red" ? "warning" : ""}>{detail}</small></div></div>; }
function PanelHeader({ title, link }: { title: string; link: string }) { return <div className="panel-header"><h2>{title}</h2><a href="#placeholder">{link}<Icon name="arrow" size={14} /></a></div>; }
function Incident({ title, type, time, severity, color }: { title: string; type: string; time: string; severity: string; color: string }) { return <div className="incident-row"><div className={`incident-dot ${color}`} /><div className="incident-copy"><strong>{title}</strong><span>{type}</span></div><div className="incident-meta"><em className={color}>{severity}</em><small>{time}</small></div><Icon name="arrow" size={15} /></div>; }
function Region({ name, value }: { name: string; value: string }) { return <div className="region-row"><span>{name}</span><div className="progress"><i style={{ width: value }} /></div><strong>{value}</strong></div>; }
function Activity({ icon, title, note, time }: { icon: IconName; title: string; note: string; time: string }) { return <div className="activity-row"><div className="activity-icon"><Icon name={icon} size={16} /></div><div><strong>{title}</strong><span>{note}</span></div><time>{time}</time></div>; }

function SosPage() {
  const online = useConnectivity();
  const [severity, setSeverity] = useState<SosIncident["severity"]>("critical");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState<SosIncident["location"]>(null);
  const [locationState, setLocationState] = useState<"idle" | "requesting" | "ready" | "unavailable">("idle");
  const [locationMessage, setLocationMessage] = useState("Location is optional, but helps responders orient the request.");
  const [incident, setIncident] = useState<SosIncident | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function captureLocation() {
    if (!navigator.geolocation) {
      setLocationState("unavailable");
      setLocationMessage("This browser does not provide location. You can continue without coordinates.");
      return;
    }
    setLocationState("requesting");
    setLocationMessage("Requesting a precise browser location…");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy });
        setLocationState("ready");
        setLocationMessage(`Location captured ±${Math.round(position.coords.accuracy)}m`);
      },
      () => {
        setLocationState("unavailable");
        setLocationMessage("Location permission was unavailable. You can continue without coordinates.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const submission = { severity, description, location };
      if (!online) {
        const queue = readQueue();
        queue.push(submission);
        writeQueue(queue);
        setError("");
        setIncident(null);
        setDescription("");
        setLocationMessage(`Queued locally. ${queue.length} SOS signal${queue.length === 1 ? "" : "s"} waiting for sync.`);
      } else {
        try {
          setIncident(await createSosIncident(submission));
        } catch {
          const queue = readQueue();
          queue.push(submission);
          writeQueue(queue);
          setLocationMessage(`API unavailable. Queued locally. ${queue.length} signal${queue.length === 1 ? "" : "s"} waiting for sync.`);
        }
      }
      setDescription("");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to submit SOS.");
    } finally {
      setSubmitting(false);
    }
  }

  return <section className="sos-page"><div className="sos-intro"><div><p className="eyebrow">Emergency response</p><h1>SOS Center</h1><p>Use this channel for an urgent incident requiring operations awareness.</p></div><div className="sos-warning"><Icon name="shield" size={18} /><span>For immediate life safety emergencies, call local emergency services.</span></div></div><div className="sos-layout"><form className="panel sos-form" onSubmit={submit}><div className="panel-header"><h2>New distress signal</h2><span className="required-label">{online ? "API connected" : "Offline · queued"}</span></div><label>Severity<select value={severity} onChange={(event) => setSeverity(event.target.value as SosIncident["severity"])}><option value="critical">Critical · Immediate attention</option><option value="high">High · Urgent response</option><option value="moderate">Moderate · Needs review</option></select></label><label>What is happening?<textarea required minLength={5} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe the situation and any immediate needs…" rows={5} /></label><div className="location-box"><div><strong>Current location</strong><p>{locationMessage}</p></div><button type="button" className="outline-button" onClick={captureLocation} disabled={locationState === "requesting"}>{locationState === "ready" ? "Refresh location" : "Capture location"}</button></div><button className="sos-submit" type="submit" disabled={submitting || description.trim().length < 5}><Icon name="sos" size={17} />{submitting ? "Sending signal…" : online ? "Send SOS signal" : "Queue SOS signal"}</button>{error && <p className="form-error">{error}</p>}</form><aside className="panel sos-status"><div className="panel-header"><h2>Signal status</h2><span className="status-badge">{incident ? "Received" : "Standby"}</span></div>{incident ? <div className="received-state"><div className="received-icon"><Icon name="shield" size={24} /></div><h3>Signal received</h3><strong>{incident.id}</strong><p>Operations has received your SOS request. The incident is queued for review.</p><div className="received-detail"><span>Severity</span><b>{incident.severity}</b><span>Location</span><b>{incident.location ? `${incident.location.latitude.toFixed(4)}, ${incident.location.longitude.toFixed(4)}` : "Not provided"}</b></div></div> : <div className="standby-state"><div className="standby-ring"><Icon name="sos" size={25} /></div><h3>No active signal</h3><p>Complete the form to create an in-memory incident for the operations desk.</p><span>{online ? "API connected · ready to receive" : "Offline · submission will be queued"}</span></div>}</aside></div></section>;
}

function Placeholder() {
  const location = useLocation();
  const copy = viewCopy[location.pathname] ?? viewCopy["/system"];
  return <section className="placeholder-page"><div className="placeholder-icon"><Icon name={location.pathname === "/sos" ? "sos" : "grid"} size={28} /></div><p className="eyebrow">{copy.eyebrow}</p><h1>{copy.title}</h1><p>{copy.description}</p><span className="coming-soon"><span />Phase 2 shell · Ready for implementation</span></section>;
}

function MapPage() {
  const [data, setData] = useState<MapData | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    fetchMapData(controller.signal).then(setData).catch((reason: unknown) => {
      if (!(reason instanceof DOMException && reason.name === "AbortError")) setError("Map data is unavailable.");
    });
    return () => controller.abort();
  }, []);
  return <section className="map-page"><p className="eyebrow">Situational awareness</p><h1>Live Map</h1><p className="hero-copy">Deterministic responder proximity for the latest in-memory SOS incident.</p>{error && <p className="form-error">{error}</p>}{data && <div className="map-grid"><div className="panel map-surface"><div className="panel-header"><h2>Coverage view</h2><span className="status-badge">MVP DATA</span></div><div className="map-placeholder"><Icon name="map" size={34} /><strong>{data.incident?.location ? "Incident coordinates available" : "No incident coordinates"}</strong><p>{data.incident?.location ? `${data.incident.location.latitude.toFixed(4)}, ${data.incident.location.longitude.toFixed(4)}` : "Submit an SOS with browser location to enable proximity matching."}</p></div></div><div className="panel responder-match"><div className="panel-header"><h2>Nearest responder</h2><span className="status-badge">{data.nearestResponder ? "MATCHED" : "WAITING"}</span></div>{data.nearestResponder ? <div className="match-state"><div className="received-icon"><Icon name="users" size={23} /></div><h3>{data.nearestResponder.name}</h3><strong>{data.nearestResponder.id} · {data.nearestResponder.unit}</strong><p>{data.nearestResponder.distanceMiles} miles from incident</p></div> : <div className="standby-state"><div className="standby-ring"><Icon name="map" size={25} /></div><h3>Coordinates required</h3><p>{data.reason}</p></div>}</div></div>}</section>;
}

function OfflinePage() {
  const online = useConnectivity();
  const [count, setCount] = useState(() => readQueue().length);
  const [message, setMessage] = useState("Queue is ready.");
  const [syncing, setSyncing] = useState(false);
  async function sync() {
    setSyncing(true);
    const result = await syncQueue();
    setCount(result.remaining);
    setMessage(result.synced ? `Synced ${result.synced} queued signal${result.synced === 1 ? "" : "s"}.` : result.remaining ? "Sync could not reach the API; items remain queued." : "Nothing is waiting to sync.");
    setSyncing(false);
  }
  useEffect(() => {
    if (online) void sync();
  }, [online]);
  return <section className="offline-page"><p className="eyebrow">Resilient operations</p><h1>Offline Network</h1><p className="hero-copy">Store-and-forward status for SOS submissions. Queued payloads remain local until the API is reachable.</p><div className="offline-grid"><div className="panel offline-card"><div className="offline-count">{count}</div><div><strong>Queued SOS signals</strong><p>{online ? "Connection available for sync." : "Browser is offline; new signals will queue locally."}</p></div></div><div className="panel offline-card"><div className={`connection-dot ${online ? "online" : ""}`} /><div><strong>{online ? "Online" : "Offline"}</strong><p>{message}</p></div><button className="outline-button" onClick={() => void sync()} disabled={!online || syncing}>{syncing ? "Syncing…" : "Sync now"}</button></div></div></section>;
}

function AgentPage() {
  const [data, setData] = useState<AgentDecision | null>(null);
  const [error, setError] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("Not requested");
  useEffect(() => {
    const controller = new AbortController();
    fetchAgentDecision(controller.signal).then(setData).catch((reason: unknown) => {
      if (!(reason instanceof DOMException && reason.name === "AbortError")) setError("Agent decision is unavailable.");
    });
    return () => controller.abort();
  }, []);
  async function requestPayment() {
    setPaymentStatus("Checking x402 configuration…");
    try {
      const result = await requestAdvancedIntelligence();
      setPaymentStatus(result === "payment-required" ? "Payment required · Algorand Testnet" : result === "unavailable" ? "Unavailable · x402 not configured" : "Verification required · not settled");
    } catch { setPaymentStatus("Request failed"); }
  }
  return <section className="agent-page"><p className="eyebrow">Decision layer</p><h1>Agent Decision</h1><p className="hero-copy">Transparent rule-based triage for the current in-memory incident state. Advanced intelligence is payment-gated and configuration-dependent.</p>{error && <p className="form-error" role="alert">{error}</p>}{data && <div className="panel agent-card"><div className="panel-header"><h2>Current recommendation</h2><span className="status-badge">DETERMINISTIC MVP</span></div><strong className="agent-decision">{data.decision}</strong><p>{data.rationale}</p><div className="agent-details"><span>Confidence</span><b>{data.confidence}</b><span>Advanced intelligence</span><b>{data.advancedIntelligenceRequired ? "Required" : "Not required"}</b></div><div className="payment-note">x402 payment is not simulated. When configured, the protected endpoint returns HTTP 402 with Algorand Testnet requirements until facilitator-verified proof is supplied.</div><button type="button" className="outline-button payment-button" onClick={() => void requestPayment()}>Request advanced intelligence</button><div className="payment-status" role="status" aria-live="polite">{paymentStatus}</div></div>}</section>;
}

function SystemPage() {
  const [status, setStatus] = useState<DemoStatus | null>(null);
  const [message, setMessage] = useState("Demo controls are explicit and simulated.");
  async function refresh() { setStatus(await fetchDemoStatus()); }
  async function reset() { await resetDemo(); setMessage("Demo state cleared."); await refresh(); }
  async function seed() { await seedDemo(); setMessage("Coordinate SOS seeded for walkthrough."); await refresh(); }
  useEffect(() => { void refresh(); }, []);
  return <section className="system-page"><p className="eyebrow">Platform health</p><h1>System & Demo Status</h1><p className="hero-copy">Deterministic walkthrough controls for judges. No payment settlement is simulated or claimed.</p><div className="demo-controls"><button type="button" className="outline-button" onClick={() => void reset()}>Clear demo state</button><button type="button" className="sos-submit demo-seed" onClick={() => void seed()}>Seed coordinate SOS</button><span role="status" aria-live="polite">{message}</span></div>{status && <div className="panel demo-status"><div className="panel-header"><h2>Demo state</h2><span className="status-badge">SIMULATED</span></div><div className="agent-details"><span>Incident</span><b>{status.incident?.id ?? "None"}</b><span>Responder match</span><b>{status.map.nearestResponder ? `${status.map.nearestResponder.id} · ${status.map.nearestResponder.distanceMiles} mi` : "None"}</b><span>Agent decision</span><b>{status.agent.decision}</b><span>x402</span><b>{status.x402.configured ? "Configured · unpaid" : "Unavailable · not configured"}</b></div></div>}</section>;
}

export default function App() { return <Layout><Routes><Route path="/" element={<Dashboard />} /><Route path="/sos" element={<SosPage />} /><Route path="/map" element={<MapPage />} /><Route path="/offline" element={<OfflinePage />} /><Route path="/x402" element={<AgentPage />} /><Route path="/system" element={<SystemPage />} /><Route path="*" element={<Placeholder />} /></Routes></Layout>; }
