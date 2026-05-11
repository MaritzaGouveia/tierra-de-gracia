import { useState, useMemo, useRef } from "react";

// ─── THEME ───────────────────────────────────────────────────────────────────
const T = {
  bg: "#0F1A0E", surface: "#162214", card: "#1C2B1A", border: "#2A3D28",
  green: "#3A7D2C", greenLight: "#4E9E3C", greenGlow: "#5BBB47",
  gold: "#C8960C", goldLight: "#E5B020", cream: "#F2E8D0",
  brown: "#6B4226", brownLight: "#8B5A3A", text: "#E8F0E4",
  muted: "#7A9070", faint: "#3A4F38",
};

// ─── INITIAL DATA ─────────────────────────────────────────────────────────────
const INIT = {
  projects: [
    { id: 1, name: "Siembra de Aguacates", description: "Proyecto principal - 5 hectáreas", status: "activo", startDate: "2024-01-15", color: T.green },
    { id: 2, name: "Cercado del Terreno", description: "Instalación de cercas perimetrales", status: "en-progreso", startDate: "2024-02-01", color: T.gold },
  ],
  investments: [
    { id: 1, projectId: 1, category: "Limpieza", description: "Limpieza y preparación del terreno", amountUSD: 1200, amountVES: 43200000, date: "2024-01-20", receipt: null },
    { id: 2, projectId: 1, category: "Plantas", description: "Compra de 200 plantas de aguacate Hass", amountUSD: 800, amountVES: 28800000, date: "2024-02-05", receipt: null },
    { id: 3, projectId: 2, category: "Materiales", description: "Postes y alambre para cerca", amountUSD: 950, amountVES: 34200000, date: "2024-02-10", receipt: null },
    { id: 4, projectId: 1, category: "Herramientas", description: "Palas, machetes, mangueras", amountUSD: 350, amountVES: 12600000, date: "2024-02-15", receipt: null },
  ],
  employees: [
    { id: 1, name: "Carlos Martínez", role: "Dueño", type: "owner", salary: 0, phone: "+58 412 555 0001", startDate: "2024-01-01", avatar: "CM" },
    { id: 2, name: "Miguel Rodríguez", role: "Dueño", type: "owner", salary: 0, phone: "+58 424 555 0002", startDate: "2024-01-01", avatar: "MR" },
    { id: 3, name: "José Pérez", role: "Trabajador de campo", type: "employee", salary: 200, phone: "+58 416 555 0003", startDate: "2024-02-01", avatar: "JP" },
  ],
  tasks: [
    { id: 1, projectId: 1, title: "Análisis del suelo", status: "done", assignee: "José Pérez", priority: "alta", date: "2024-01-18" },
    { id: 2, projectId: 1, title: "Trazado de surcos", status: "done", assignee: "José Pérez", priority: "alta", date: "2024-01-25" },
    { id: 3, projectId: 1, title: "Siembra de plantas", status: "in-progress", assignee: "José Pérez", priority: "alta", date: "2024-02-10" },
    { id: 4, projectId: 1, title: "Sistema de riego", status: "todo", assignee: "Carlos Martínez", priority: "media", date: "2024-03-01" },
    { id: 5, projectId: 2, title: "Compra de materiales", status: "done", assignee: "Miguel Rodríguez", priority: "alta", date: "2024-02-08" },
    { id: 6, projectId: 2, title: "Instalación de postes", status: "in-progress", assignee: "José Pérez", priority: "media", date: "2024-02-20" },
  ],
  gallery: [],
  bills: [
    { id: 1, description: "Agua y riego - Febrero", amount: 80, amountVES: 2880000, dueDate: "2024-02-28", status: "pagada", projectId: 1 },
    { id: 2, description: "Salario José Pérez - Febrero", amount: 200, amountVES: 7200000, dueDate: "2024-02-28", status: "pagada", projectId: 1 },
    { id: 3, description: "Fertilizantes", amount: 150, amountVES: 5400000, dueDate: "2024-03-15", status: "pendiente", projectId: 1 },
  ],
};

const BTC = 36; // Bs per USD (mock rate)

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmt = (n, currency = "USD") => currency === "USD"
  ? `$${Number(n).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  : `Bs ${Number(n).toLocaleString("es-VE")}`;

const fmtDate = d => d ? new Date(d + "T12:00:00").toLocaleDateString("es-VE", { day: "2-digit", month: "short", year: "numeric" }) : "";

const STATUS_CFG = {
  "activo": { label: "Activo", color: T.greenGlow },
  "en-progreso": { label: "En Progreso", color: T.goldLight },
  "pausado": { label: "Pausado", color: "#E07070" },
  "completado": { label: "Completado", color: T.muted },
  "done": { label: "Hecho", color: T.greenGlow },
  "in-progress": { label: "En Progreso", color: T.goldLight },
  "todo": { label: "Por Hacer", color: T.muted },
  "pagada": { label: "Pagada", color: T.greenGlow },
  "pendiente": { label: "Pendiente", color: "#E07070" },
};

const CATEGORIES = ["Limpieza", "Plantas", "Materiales", "Herramientas", "Riego", "Fertilizantes", "Salarios", "Transporte", "Servicios", "Otro"];
const PRIORITIES = ["alta", "media", "baja"];

// ─── UI COMPONENTS ────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Lato:wght@300;400;500;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:${T.bg};font-family:'Lato',sans-serif;color:${T.text};}
  ::-webkit-scrollbar{width:5px;height:5px;}
  ::-webkit-scrollbar-track{background:${T.surface};}
  ::-webkit-scrollbar-thumb{background:${T.faint};border-radius:99px;}
  input,select,textarea{background:${T.card};border:1px solid ${T.border};border-radius:8px;padding:9px 12px;color:${T.text};font-family:'Lato',sans-serif;font-size:14px;outline:none;width:100%;}
  input:focus,select:focus,textarea:focus{border-color:${T.green};}
  select option{background:${T.card};}
  button{cursor:pointer;font-family:'Lato',sans-serif;}
  @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
  .fade{animation:fadeIn 0.3s ease;}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
  .thinking{animation:pulse 1.4s ease infinite;}
`;

function Badge({ status }) {
  const cfg = STATUS_CFG[status] || { label: status, color: T.muted };
  return <span style={{ background: cfg.color + "22", color: cfg.color, border: `1px solid ${cfg.color}44`, borderRadius: 6, padding: "2px 9px", fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>{cfg.label}</span>;
}

function Card({ children, style = {} }) {
  return <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 20, ...style }}>{children}</div>;
}

function Btn({ children, onClick, variant = "primary", style = {}, disabled = false }) {
  const variants = {
    primary: { background: `linear-gradient(135deg, ${T.green}, ${T.greenLight})`, color: "#fff", border: "none" },
    gold: { background: `linear-gradient(135deg, ${T.gold}, ${T.goldLight})`, color: "#0F1A0E", border: "none" },
    ghost: { background: "transparent", color: T.muted, border: `1px solid ${T.border}` },
    danger: { background: "transparent", color: "#E07070", border: "1px solid #E0707044" },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...variants[variant], borderRadius: 9, padding: "9px 18px", fontWeight: 700, fontSize: 13,
      opacity: disabled ? 0.5 : 1, transition: "opacity 0.2s, transform 0.1s",
      ...style
    }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.opacity = "0.85"; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
    >{children}</button>
  );
}

function Modal({ title, onClose, children, wide = false }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000AA", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={onClose}>
      <div className="fade" style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, padding: 28, width: wide ? 700 : 420, maxWidth: "100%", maxHeight: "90vh", overflowY: "auto" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <h3 style={{ fontFamily: "'Playfair Display',serif", color: T.cream, fontSize: 18 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.muted, fontSize: 22, lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return <div style={{ marginBottom: 14 }}>
    <label style={{ color: T.muted, fontSize: 11, fontWeight: 700, letterSpacing: 0.8, display: "block", marginBottom: 5 }}>{label}</label>
    {children}
  </div>;
}

function StatCard({ icon, label, value, sub, color = T.greenGlow }) {
  return (
    <Card style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ fontSize: 22 }}>{icon}</div>
      <div style={{ color: T.muted, fontSize: 12, fontWeight: 700, letterSpacing: 0.6 }}>{label}</div>
      <div style={{ color, fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700 }}>{value}</div>
      {sub && <div style={{ color: T.faint, fontSize: 12 }}>{sub}</div>}
    </Card>
  );
}

function ProgressBar({ value, color = T.greenGlow }) {
  return <div style={{ background: T.faint, borderRadius: 99, height: 6, overflow: "hidden" }}>
    <div style={{ background: color, width: `${Math.min(100, value)}%`, height: "100%", borderRadius: 99, transition: "width 0.5s" }} />
  </div>;
}

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────
const NAV = [
  { id: "dashboard", icon: "🌿", label: "Dashboard" },
  { id: "projects", icon: "🗂️", label: "Proyectos" },
  { id: "investments", icon: "💰", label: "Inversiones" },
  { id: "tasks", icon: "✅", label: "Tareas" },
  { id: "employees", icon: "👥", label: "Equipo" },
  { id: "bills", icon: "🧾", label: "Facturas" },
  { id: "gallery", icon: "📸", label: "Galería" },
  { id: "reports", icon: "📊", label: "Reportes" },
  { id: "ai", icon: "🤖", label: "Asistente IA" },
];

function Sidebar({ active, setActive, sideOpen }) {
  return (
    <div style={{
      width: sideOpen ? 220 : 64, background: T.surface, borderRight: `1px solid ${T.border}`,
      display: "flex", flexDirection: "column", transition: "width 0.3s", overflow: "hidden", flexShrink: 0
    }}>
      {/* Logo */}
      <div style={{ padding: "20px 14px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, flexShrink: 0, fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>🥑</div>
        {sideOpen && <div>
          <div style={{ fontFamily: "'Playfair Display',serif", color: T.cream, fontSize: 13, fontWeight: 700, lineHeight: 1.1 }}>Tierra de</div>
          <div style={{ fontFamily: "'Playfair Display',serif", color: T.greenGlow, fontSize: 13, fontWeight: 700 }}>Gracia</div>
        </div>}
      </div>
      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV.map(n => (
          <button key={n.id} onClick={() => setActive(n.id)} style={{
            display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
            borderRadius: 9, border: "none", background: active === n.id ? T.green + "33" : "transparent",
            color: active === n.id ? T.greenGlow : T.muted, fontWeight: active === n.id ? 700 : 400,
            fontSize: 13, textAlign: "left", transition: "all 0.15s", whiteSpace: "nowrap"
          }}
            onMouseEnter={e => { if (active !== n.id) e.currentTarget.style.background = T.faint; }}
            onMouseLeave={e => { if (active !== n.id) e.currentTarget.style.background = "transparent"; }}
          >
            <span style={{ fontSize: 16, flexShrink: 0 }}>{n.icon}</span>
            {sideOpen && n.label}
          </button>
        ))}
      </nav>
      <div style={{ padding: "12px 8px", borderTop: `1px solid ${T.border}` }}>
        {sideOpen && <div style={{ fontSize: 11, color: T.faint, textAlign: "center" }}>v1.0 · Venezuela 🇻🇪</div>}
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ data, setView }) {
  const totalUSD = data.investments.reduce((a, i) => a + i.amountUSD, 0);
  const totalVES = data.investments.reduce((a, i) => a + i.amountVES, 0);
  const allTasks = data.tasks;
  const doneTasks = allTasks.filter(t => t.status === "done").length;
  const pendingBills = data.bills.filter(b => b.status === "pendiente").reduce((a, b) => a + b.amount, 0);
  const projProgress = data.projects.map(p => {
    const pt = data.tasks.filter(t => t.projectId === p.id);
    const pd = pt.filter(t => t.status === "done").length;
    return { ...p, pct: pt.length ? Math.round(pd / pt.length * 100) : 0, taskCount: pt.length };
  });

  return (
    <div className="fade">
      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${T.green}33, ${T.card})`, border: `1px solid ${T.border}`, borderRadius: 16, padding: "28px 32px", marginBottom: 24, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: 24, top: "50%", transform: "translateY(-50%)", fontSize: 80, opacity: 0.08 }}>🥑</div>
        <div style={{ color: T.muted, fontSize: 13, fontWeight: 700, letterSpacing: 0.8, marginBottom: 6 }}>BIENVENIDO A</div>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, color: T.cream, marginBottom: 4 }}>Tierra de Gracia</h1>
        <p style={{ color: T.muted, fontSize: 14 }}>Cultivo de Aguacates · Venezuela · Gestión integral del proyecto</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        <StatCard icon="💵" label="TOTAL INVERTIDO" value={fmt(totalUSD)} sub={fmt(totalVES, "VES")} color={T.goldLight} />
        <StatCard icon="🗂️" label="PROYECTOS" value={data.projects.length} sub={`${data.projects.filter(p => p.status === "activo").length} activos`} />
        <StatCard icon="✅" label="TAREAS COMPLETADAS" value={`${doneTasks}/${allTasks.length}`} sub={`${Math.round(doneTasks / (allTasks.length || 1) * 100)}% del total`} />
        <StatCard icon="🧾" label="FACTURAS PENDIENTES" value={fmt(pendingBills)} sub="Por pagar" color="#E07070" />
      </div>

      {/* Projects progress */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 24 }}>
        <Card>
          <div style={{ fontFamily: "'Playfair Display',serif", color: T.cream, fontSize: 16, marginBottom: 18 }}>Progreso por Proyecto</div>
          {projProgress.map(p => (
            <div key={p.id} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: T.text }}>{p.name}</span>
                <span style={{ fontSize: 13, color: p.color, fontWeight: 700 }}>{p.pct}%</span>
              </div>
              <ProgressBar value={p.pct} color={p.color} />
              <div style={{ color: T.faint, fontSize: 11, marginTop: 4 }}>{p.taskCount} tareas · <Badge status={p.status} /></div>
            </div>
          ))}
        </Card>

        <Card>
          <div style={{ fontFamily: "'Playfair Display',serif", color: T.cream, fontSize: 16, marginBottom: 18 }}>Inversión por Categoría</div>
          {CATEGORIES.filter(c => data.investments.some(i => i.category === c)).map(cat => {
            const total = data.investments.filter(i => i.category === cat).reduce((a, i) => a + i.amountUSD, 0);
            const pct = Math.round(total / totalUSD * 100);
            return (
              <div key={cat} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: T.muted }}>{cat}</span>
                  <span style={{ fontSize: 12, color: T.goldLight }}>{fmt(total)}</span>
                </div>
                <ProgressBar value={pct} color={T.gold} />
              </div>
            );
          })}
        </Card>
      </div>

      {/* Recent activity */}
      <Card>
        <div style={{ fontFamily: "'Playfair Display',serif", color: T.cream, fontSize: 16, marginBottom: 16 }}>Actividad Reciente</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[...data.investments].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4).map(inv => (
            <div key={inv.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: T.surface, borderRadius: 10 }}>
              <span style={{ fontSize: 18 }}>💰</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: T.text }}>{inv.description}</div>
                <div style={{ fontSize: 11, color: T.muted }}>{fmtDate(inv.date)} · {inv.category}</div>
              </div>
              <span style={{ color: T.goldLight, fontWeight: 700, fontSize: 13 }}>{fmt(inv.amountUSD)}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── PROJECTS ─────────────────────────────────────────────────────────────────
function Projects({ data, setData }) {
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", status: "activo", startDate: "", color: T.green });
  const f = v => setForm(p => ({ ...p, ...v }));

  const add = () => {
    if (!form.name.trim()) return;
    setData(d => ({ ...d, projects: [...d.projects, { ...form, id: Date.now() }] }));
    setShowNew(false); setForm({ name: "", description: "", status: "activo", startDate: "", color: T.green });
  };

  return (
    <div className="fade">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
        <h2 style={{ fontFamily: "'Playfair Display',serif", color: T.cream, fontSize: 22 }}>Proyectos</h2>
        <Btn onClick={() => setShowNew(true)}>+ Nuevo Proyecto</Btn>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
        {data.projects.map(p => {
          const tasks = data.tasks.filter(t => t.projectId === p.id);
          const done = tasks.filter(t => t.status === "done").length;
          const inv = data.investments.filter(i => i.projectId === p.id).reduce((a, i) => a + i.amountUSD, 0);
          return (
            <Card key={p.id} style={{ borderTop: `3px solid ${p.color}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <h3 style={{ fontFamily: "'Playfair Display',serif", color: T.cream, fontSize: 16 }}>{p.name}</h3>
                <Badge status={p.status} />
              </div>
              <p style={{ color: T.muted, fontSize: 13, marginBottom: 14 }}>{p.description}</p>
              <ProgressBar value={tasks.length ? done / tasks.length * 100 : 0} color={p.color} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: 12, color: T.muted }}>
                <span>📋 {done}/{tasks.length} tareas</span>
                <span>💵 {fmt(inv)}</span>
              </div>
              {p.startDate && <div style={{ fontSize: 11, color: T.faint, marginTop: 6 }}>Inicio: {fmtDate(p.startDate)}</div>}
            </Card>
          );
        })}
      </div>

      {showNew && (
        <Modal title="Nuevo Proyecto" onClose={() => setShowNew(false)}>
          <Field label="NOMBRE"><input value={form.name} onChange={e => f({ name: e.target.value })} /></Field>
          <Field label="DESCRIPCIÓN"><input value={form.description} onChange={e => f({ description: e.target.value })} /></Field>
          <Field label="ESTADO">
            <select value={form.status} onChange={e => f({ status: e.target.value })}>
              <option value="activo">Activo</option>
              <option value="en-progreso">En Progreso</option>
              <option value="pausado">Pausado</option>
            </select>
          </Field>
          <Field label="FECHA DE INICIO"><input type="date" value={form.startDate} onChange={e => f({ startDate: e.target.value })} /></Field>
          <Field label="COLOR">
            <div style={{ display: "flex", gap: 8 }}>
              {[T.green, T.gold, "#4A7BA7", "#9B4E9B", "#C04A4A"].map(c => (
                <div key={c} onClick={() => f({ color: c })} style={{ width: 28, height: 28, borderRadius: "50%", background: c, cursor: "pointer", border: form.color === c ? "3px solid white" : "3px solid transparent" }} />
              ))}
            </div>
          </Field>
          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            <Btn onClick={add} style={{ flex: 1 }}>Crear Proyecto</Btn>
            <Btn variant="ghost" onClick={() => setShowNew(false)}>Cancelar</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── INVESTMENTS ──────────────────────────────────────────────────────────────
function Investments({ data, setData }) {
  const [showNew, setShowNew] = useState(false);
  const [filter, setFilter] = useState("todos");
  const [form, setForm] = useState({ projectId: data.projects[0]?.id || 1, category: "Limpieza", description: "", amountUSD: "", amountVES: "", date: "" });
  const f = v => setForm(p => ({ ...p, ...v }));

  const filtered = filter === "todos" ? data.investments : data.investments.filter(i => i.projectId === Number(filter));
  const totalUSD = filtered.reduce((a, i) => a + i.amountUSD, 0);
  const totalVES = filtered.reduce((a, i) => a + i.amountVES, 0);

  const add = () => {
    if (!form.description || !form.amountUSD) return;
    setData(d => ({ ...d, investments: [...d.investments, { ...form, id: Date.now(), projectId: Number(form.projectId), amountUSD: Number(form.amountUSD), amountVES: Number(form.amountVES || form.amountUSD * BTC * 1000) }] }));
    setShowNew(false);
  };

  const del = id => setData(d => ({ ...d, investments: d.investments.filter(i => i.id !== id) }));

  return (
    <div className="fade">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <h2 style={{ fontFamily: "'Playfair Display',serif", color: T.cream, fontSize: 22 }}>Inversiones</h2>
        <Btn onClick={() => setShowNew(true)}>+ Registrar Inversión</Btn>
      </div>

      {/* Totals */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 20 }}>
        <StatCard icon="💵" label="TOTAL USD" value={fmt(totalUSD)} color={T.goldLight} />
        <StatCard icon="🏦" label="TOTAL BOLÍVARES" value={`Bs ${(totalVES / 1000000).toFixed(1)}M`} color={T.gold} />
        <StatCard icon="📦" label="REGISTROS" value={filtered.length} sub="transacciones" />
      </div>

      {/* Filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {[{ id: "todos", label: "Todos" }, ...data.projects.map(p => ({ id: String(p.id), label: p.name }))].map(opt => (
          <button key={opt.id} onClick={() => setFilter(opt.id)} style={{
            padding: "6px 14px", borderRadius: 99, border: `1px solid ${filter === opt.id ? T.green : T.border}`,
            background: filter === opt.id ? T.green + "33" : "transparent", color: filter === opt.id ? T.greenGlow : T.muted, fontSize: 12, fontWeight: 600
          }}>{opt.label}</button>
        ))}
      </div>

      {/* Table */}
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.border}` }}>
              {["Fecha", "Proyecto", "Categoría", "Descripción", "USD", "Bolívares", ""].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: 0.7 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((inv, i) => {
              const proj = data.projects.find(p => p.id === inv.projectId);
              return (
                <tr key={inv.id} style={{ borderBottom: `1px solid ${T.border}`, background: i % 2 ? T.surface : "transparent" }}>
                  <td style={{ padding: "11px 16px", fontSize: 12, color: T.muted }}>{fmtDate(inv.date)}</td>
                  <td style={{ padding: "11px 16px" }}>
                    <span style={{ fontSize: 11, color: proj?.color || T.green, fontWeight: 700 }}>{proj?.name || "—"}</span>
                  </td>
                  <td style={{ padding: "11px 16px", fontSize: 12, color: T.muted }}>{inv.category}</td>
                  <td style={{ padding: "11px 16px", fontSize: 13, color: T.text }}>{inv.description}</td>
                  <td style={{ padding: "11px 16px", fontSize: 13, color: T.goldLight, fontWeight: 700 }}>{fmt(inv.amountUSD)}</td>
                  <td style={{ padding: "11px 16px", fontSize: 12, color: T.muted }}>{(inv.amountVES / 1000000).toFixed(2)}M Bs</td>
                  <td style={{ padding: "11px 16px" }}>
                    <button onClick={() => del(inv.id)} style={{ background: "none", border: "none", color: "#E07070", fontSize: 14, cursor: "pointer" }}>🗑️</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={{ padding: 40, textAlign: "center", color: T.faint }}>Sin inversiones registradas</div>}
      </Card>

      {showNew && (
        <Modal title="Registrar Inversión" onClose={() => setShowNew(false)}>
          <Field label="PROYECTO">
            <select value={form.projectId} onChange={e => f({ projectId: e.target.value })}>
              {data.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </Field>
          <Field label="CATEGORÍA">
            <select value={form.category} onChange={e => f({ category: e.target.value })}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="DESCRIPCIÓN"><input value={form.description} onChange={e => f({ description: e.target.value })} /></Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="MONTO USD ($)"><input type="number" value={form.amountUSD} onChange={e => f({ amountUSD: e.target.value, amountVES: (e.target.value * BTC * 1000000).toFixed(0) })} /></Field>
            <Field label="MONTO BOLÍVARES"><input type="number" value={form.amountVES} onChange={e => f({ amountVES: e.target.value })} /></Field>
          </div>
          <Field label="FECHA"><input type="date" value={form.date} onChange={e => f({ date: e.target.value })} /></Field>
          <div style={{ background: T.card, borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 12, color: T.muted }}>
            💱 Tasa de referencia: 1 USD ≈ {(BTC * 1000000).toLocaleString()} Bs
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn onClick={add} style={{ flex: 1 }}>Guardar</Btn>
            <Btn variant="ghost" onClick={() => setShowNew(false)}>Cancelar</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── TASKS ────────────────────────────────────────────────────────────────────
function Tasks({ data, setData }) {
  const [showNew, setShowNew] = useState(false);
  const [activeProj, setActiveProj] = useState(data.projects[0]?.id || 1);
  const [form, setForm] = useState({ title: "", status: "todo", assignee: data.employees[0]?.name || "", priority: "media", date: "", projectId: data.projects[0]?.id || 1 });
  const f = v => setForm(p => ({ ...p, ...v }));

  const tasks = data.tasks.filter(t => t.projectId === activeProj);
  const grouped = { todo: tasks.filter(t => t.status === "todo"), "in-progress": tasks.filter(t => t.status === "in-progress"), done: tasks.filter(t => t.status === "done") };

  const add = () => {
    if (!form.title.trim()) return;
    setData(d => ({ ...d, tasks: [...d.tasks, { ...form, id: Date.now(), projectId: Number(activeProj) }] }));
    setShowNew(false);
  };

  const changeStatus = (id, status) => setData(d => ({ ...d, tasks: d.tasks.map(t => t.id === id ? { ...t, status } : t) }));
  const del = id => setData(d => ({ ...d, tasks: d.tasks.filter(t => t.id !== id) }));

  return (
    <div className="fade">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <h2 style={{ fontFamily: "'Playfair Display',serif", color: T.cream, fontSize: 22 }}>Tareas</h2>
        <Btn onClick={() => setShowNew(true)}>+ Nueva Tarea</Btn>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {data.projects.map(p => (
          <button key={p.id} onClick={() => setActiveProj(p.id)} style={{
            padding: "7px 16px", borderRadius: 99, border: `1px solid ${activeProj === p.id ? p.color : T.border}`,
            background: activeProj === p.id ? p.color + "33" : "transparent", color: activeProj === p.id ? p.color : T.muted, fontSize: 12, fontWeight: 600
          }}>{p.name}</button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        {[["todo", "Por Hacer"], ["in-progress", "En Progreso"], ["done", "Completado"]].map(([status, label]) => (
          <div key={status}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: STATUS_CFG[status]?.color }} />
              <span style={{ color: T.muted, fontSize: 11, fontWeight: 700, letterSpacing: 0.8 }}>{label.toUpperCase()}</span>
              <span style={{ color: T.faint, fontSize: 11, marginLeft: "auto" }}>{grouped[status].length}</span>
            </div>
            {grouped[status].length === 0 && (
              <div style={{ border: `1px dashed ${T.border}`, borderRadius: 10, padding: 20, textAlign: "center", color: T.faint, fontSize: 12 }}>Sin tareas</div>
            )}
            {grouped[status].map(task => (
              <Card key={task.id} style={{ marginBottom: 8, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: T.text, fontWeight: 500 }}>{task.title}</span>
                  <button onClick={() => del(task.id)} style={{ background: "none", border: "none", color: T.faint, fontSize: 13, cursor: "pointer" }}>×</button>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                  <Badge status={task.priority === "alta" ? "activo" : task.priority === "media" ? "en-progreso" : "pausado"} />
                  <span style={{ fontSize: 11, color: T.faint }}>👤 {task.assignee}</span>
                </div>
                {status !== "done" && (
                  <select value={task.status} onChange={e => changeStatus(task.id, e.target.value)}
                    style={{ marginTop: 10, fontSize: 11, padding: "4px 8px", width: "100%" }}>
                    <option value="todo">Por Hacer</option>
                    <option value="in-progress">En Progreso</option>
                    <option value="done">Completado</option>
                  </select>
                )}
              </Card>
            ))}
          </div>
        ))}
      </div>

      {showNew && (
        <Modal title="Nueva Tarea" onClose={() => setShowNew(false)}>
          <Field label="PROYECTO">
            <select value={form.projectId} onChange={e => f({ projectId: Number(e.target.value) })}>
              {data.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </Field>
          <Field label="TÍTULO"><input value={form.title} onChange={e => f({ title: e.target.value })} /></Field>
          <Field label="RESPONSABLE">
            <select value={form.assignee} onChange={e => f({ assignee: e.target.value })}>
              {data.employees.map(em => <option key={em.id} value={em.name}>{em.name}</option>)}
            </select>
          </Field>
          <Field label="PRIORIDAD">
            <select value={form.priority} onChange={e => f({ priority: e.target.value })}>
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="FECHA LÍMITE"><input type="date" value={form.date} onChange={e => f({ date: e.target.value })} /></Field>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn onClick={add} style={{ flex: 1 }}>Crear</Btn>
            <Btn variant="ghost" onClick={() => setShowNew(false)}>Cancelar</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── EMPLOYEES ────────────────────────────────────────────────────────────────
function Employees({ data, setData }) {
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ name: "", role: "", type: "employee", salary: "", phone: "", startDate: "" });
  const f = v => setForm(p => ({ ...p, ...v }));

  const add = () => {
    if (!form.name.trim()) return;
    const avatar = form.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    setData(d => ({ ...d, employees: [...d.employees, { ...form, id: Date.now(), avatar, salary: Number(form.salary) }] }));
    setShowNew(false);
  };

  const del = id => setData(d => ({ ...d, employees: d.employees.filter(e => e.id !== id) }));
  const totalSalary = data.employees.filter(e => e.type === "employee").reduce((a, e) => a + (e.salary || 0), 0);

  return (
    <div className="fade">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
        <h2 style={{ fontFamily: "'Playfair Display',serif", color: T.cream, fontSize: 22 }}>Equipo</h2>
        <Btn onClick={() => setShowNew(true)}>+ Agregar Persona</Btn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 24 }}>
        <StatCard icon="👥" label="TOTAL EQUIPO" value={data.employees.length} />
        <StatCard icon="👑" label="DUEÑOS" value={data.employees.filter(e => e.type === "owner").length} color={T.goldLight} />
        <StatCard icon="💼" label="NÓMINA MENSUAL" value={fmt(totalSalary)} color="#E07070" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 14 }}>
        {data.employees.map(em => (
          <Card key={em.id} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 48, height: 48, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                background: em.type === "owner" ? `linear-gradient(135deg,${T.gold},${T.goldLight})` : `linear-gradient(135deg,${T.green},${T.greenLight})`,
                color: em.type === "owner" ? "#0F1A0E" : "#fff", fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 16
              }}>{em.avatar}</div>
              <div>
                <div style={{ color: T.cream, fontWeight: 700, fontSize: 15 }}>{em.name}</div>
                <div style={{ color: T.muted, fontSize: 12 }}>{em.role}</div>
              </div>
              <button onClick={() => del(em.id)} style={{ marginLeft: "auto", background: "none", border: "none", color: T.faint, fontSize: 15, cursor: "pointer" }}>×</button>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 6,
                background: em.type === "owner" ? T.goldLight + "22" : T.green + "22",
                color: em.type === "owner" ? T.goldLight : T.greenGlow,
                border: `1px solid ${em.type === "owner" ? T.gold + "44" : T.green + "44"}`
              }}>{em.type === "owner" ? "👑 Dueño" : "👷 Empleado"}</span>
            </div>
            <div style={{ fontSize: 12, color: T.muted, display: "flex", flexDirection: "column", gap: 4 }}>
              {em.phone && <span>📞 {em.phone}</span>}
              {em.startDate && <span>📅 Desde {fmtDate(em.startDate)}</span>}
              {em.type === "employee" && em.salary > 0 && <span style={{ color: T.goldLight }}>💵 {fmt(em.salary)}/mes</span>}
            </div>
          </Card>
        ))}
      </div>

      {showNew && (
        <Modal title="Agregar Persona" onClose={() => setShowNew(false)}>
          <Field label="NOMBRE COMPLETO"><input value={form.name} onChange={e => f({ name: e.target.value })} /></Field>
          <Field label="CARGO / ROL"><input value={form.role} onChange={e => f({ role: e.target.value })} /></Field>
          <Field label="TIPO">
            <select value={form.type} onChange={e => f({ type: e.target.value })}>
              <option value="owner">Dueño</option>
              <option value="employee">Empleado</option>
            </select>
          </Field>
          <Field label="SALARIO MENSUAL (USD)"><input type="number" value={form.salary} onChange={e => f({ salary: e.target.value })} /></Field>
          <Field label="TELÉFONO"><input value={form.phone} onChange={e => f({ phone: e.target.value })} /></Field>
          <Field label="FECHA DE INICIO"><input type="date" value={form.startDate} onChange={e => f({ startDate: e.target.value })} /></Field>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn onClick={add} style={{ flex: 1 }}>Agregar</Btn>
            <Btn variant="ghost" onClick={() => setShowNew(false)}>Cancelar</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── BILLS ────────────────────────────────────────────────────────────────────
function Bills({ data, setData }) {
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ description: "", amount: "", amountVES: "", dueDate: "", status: "pendiente", projectId: data.projects[0]?.id || 1 });
  const f = v => setForm(p => ({ ...p, ...v }));

  const add = () => {
    if (!form.description || !form.amount) return;
    setData(d => ({ ...d, bills: [...d.bills, { ...form, id: Date.now(), projectId: Number(form.projectId), amount: Number(form.amount), amountVES: Number(form.amountVES || form.amount * BTC * 1000000) }] }));
    setShowNew(false);
  };

  const toggle = id => setData(d => ({ ...d, bills: d.bills.map(b => b.id === id ? { ...b, status: b.status === "pagada" ? "pendiente" : "pagada" } : b) }));
  const del = id => setData(d => ({ ...d, bills: d.bills.filter(b => b.id !== id) }));

  const pending = data.bills.filter(b => b.status === "pendiente").reduce((a, b) => a + b.amount, 0);
  const paid = data.bills.filter(b => b.status === "pagada").reduce((a, b) => a + b.amount, 0);

  return (
    <div className="fade">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
        <h2 style={{ fontFamily: "'Playfair Display',serif", color: T.cream, fontSize: 22 }}>Facturas & Pagos</h2>
        <Btn onClick={() => setShowNew(true)}>+ Nueva Factura</Btn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 22 }}>
        <StatCard icon="⏳" label="POR PAGAR" value={fmt(pending)} color="#E07070" />
        <StatCard icon="✅" label="PAGADO" value={fmt(paid)} color={T.greenGlow} />
        <StatCard icon="📋" label="TOTAL FACTURAS" value={data.bills.length} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {data.bills.map(b => {
          const proj = data.projects.find(p => p.id === b.projectId);
          return (
            <Card key={b.id} style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: b.status === "pagada" ? T.greenGlow : "#E07070", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, color: T.text, fontWeight: 500 }}>{b.description}</div>
                <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{proj?.name} · Vence: {fmtDate(b.dueDate)}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: T.goldLight, fontWeight: 700 }}>{fmt(b.amount)}</div>
                <Badge status={b.status} />
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <Btn variant={b.status === "pagada" ? "ghost" : "primary"} onClick={() => toggle(b.id)} style={{ padding: "6px 12px", fontSize: 11 }}>
                  {b.status === "pagada" ? "↩️" : "✅"}
                </Btn>
                <button onClick={() => del(b.id)} style={{ background: "none", border: "none", color: "#E07070", fontSize: 14, cursor: "pointer" }}>🗑️</button>
              </div>
            </Card>
          );
        })}
      </div>

      {showNew && (
        <Modal title="Nueva Factura" onClose={() => setShowNew(false)}>
          <Field label="PROYECTO">
            <select value={form.projectId} onChange={e => f({ projectId: e.target.value })}>
              {data.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </Field>
          <Field label="DESCRIPCIÓN"><input value={form.description} onChange={e => f({ description: e.target.value })} /></Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="MONTO USD"><input type="number" value={form.amount} onChange={e => f({ amount: e.target.value })} /></Field>
            <Field label="MONTO BS"><input type="number" value={form.amountVES} onChange={e => f({ amountVES: e.target.value })} /></Field>
          </div>
          <Field label="FECHA DE VENCIMIENTO"><input type="date" value={form.dueDate} onChange={e => f({ dueDate: e.target.value })} /></Field>
          <Field label="ESTADO">
            <select value={form.status} onChange={e => f({ status: e.target.value })}>
              <option value="pendiente">Pendiente</option>
              <option value="pagada">Pagada</option>
            </select>
          </Field>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn onClick={add} style={{ flex: 1 }}>Guardar</Btn>
            <Btn variant="ghost" onClick={() => setShowNew(false)}>Cancelar</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── GALLERY ──────────────────────────────────────────────────────────────────
function Gallery({ data, setData }) {
  const fileRef = useRef();
  const [selected, setSelected] = useState(null);
  const [tag, setTag] = useState("todo");

  const handleFiles = e => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        const isVideo = file.type.startsWith("video");
        setData(d => ({
          ...d, gallery: [...d.gallery, {
            id: Date.now() + Math.random(), src: ev.target.result,
            name: file.name, type: isVideo ? "video" : "image",
            date: new Date().toISOString().split("T")[0], tag: "terreno"
          }]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const del = id => setData(d => ({ ...d, gallery: d.gallery.filter(g => g.id !== id) }));
  const tags = ["todo", ...new Set(data.gallery.map(g => g.tag))];
  const filtered = tag === "todo" ? data.gallery : data.gallery.filter(g => g.tag === tag);

  return (
    <div className="fade">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
        <h2 style={{ fontFamily: "'Playfair Display',serif", color: T.cream, fontSize: 22 }}>Galería del Proceso</h2>
        <Btn onClick={() => fileRef.current.click()}>📁 Subir Archivos</Btn>
      </div>
      <input ref={fileRef} type="file" multiple accept="image/*,video/*,.pdf" style={{ display: "none" }} onChange={handleFiles} />

      {data.gallery.length === 0 ? (
        <div onClick={() => fileRef.current.click()} style={{
          border: `2px dashed ${T.border}`, borderRadius: 16, padding: 60, textAlign: "center", cursor: "pointer",
          color: T.faint, transition: "border-color 0.2s"
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor = T.green}
          onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>📸</div>
          <div style={{ fontSize: 16, color: T.muted, marginBottom: 6 }}>Sube fotos y videos del terreno</div>
          <div style={{ fontSize: 13 }}>Arrastra archivos o haz clic aquí</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 12 }}>
          {filtered.map(item => (
            <div key={item.id} style={{ position: "relative", borderRadius: 12, overflow: "hidden", cursor: "pointer", aspectRatio: "1", background: T.card }}
              onClick={() => setSelected(item)}>
              {item.type === "image"
                ? <img src={item.src} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <span style={{ fontSize: 40 }}>🎬</span>
                  <span style={{ fontSize: 11, color: T.muted, padding: "0 8px", textAlign: "center" }}>{item.name}</span>
                </div>
              }
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent,#000000AA)", padding: "20px 10px 8px", fontSize: 11, color: "#fff" }}>
                {fmtDate(item.date)}
              </div>
              <button onClick={e => { e.stopPropagation(); del(item.id); }} style={{ position: "absolute", top: 6, right: 6, background: "#00000088", border: "none", borderRadius: "50%", width: 24, height: 24, color: "#fff", fontSize: 12, cursor: "pointer" }}>×</button>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <Modal title={selected.name} onClose={() => setSelected(null)} wide>
          {selected.type === "image"
            ? <img src={selected.src} alt={selected.name} style={{ width: "100%", borderRadius: 10 }} />
            : <video src={selected.src} controls style={{ width: "100%", borderRadius: 10 }} />
          }
          <div style={{ color: T.muted, fontSize: 12, marginTop: 10 }}>Subido: {fmtDate(selected.date)}</div>
        </Modal>
      )}
    </div>
  );
}

// ─── REPORTS ──────────────────────────────────────────────────────────────────
function Reports({ data }) {
  const totalUSD = data.investments.reduce((a, i) => a + i.amountUSD, 0);
  const totalVES = data.investments.reduce((a, i) => a + i.amountVES, 0);
  const monthlySalary = data.employees.filter(e => e.type === "employee").reduce((a, e) => a + (e.salary || 0), 0);

  // Projected yield: 200 plants, ~50kg per plant per year after 3 years, $2.5/kg
  const plants = data.investments.filter(i => i.category === "Plantas").reduce((a, i) => a + i.amountUSD, 0);
  const estimatedPlants = Math.round(plants / 4); // ~$4 per plant
  const annualKg = estimatedPlants * 50;
  const pricePerKg = 2.5;
  const annualRevenue = annualKg * pricePerKg;
  const annualCost = monthlySalary * 12 + 500; // fixed costs
  const annualProfit = annualRevenue - annualCost;
  const roi = totalUSD > 0 ? ((annualProfit / totalUSD) * 100).toFixed(1) : 0;
  const breakeven = annualProfit > 0 ? (totalUSD / annualProfit).toFixed(1) : "—";

  const byProject = data.projects.map(p => ({
    ...p,
    total: data.investments.filter(i => i.projectId === p.id).reduce((a, i) => a + i.amountUSD, 0)
  }));

  const byCat = CATEGORIES.map(cat => ({
    cat, total: data.investments.filter(i => i.category === cat).reduce((a, i) => a + i.amountUSD, 0)
  })).filter(x => x.total > 0);

  const downloadReport = () => {
    const txt = `
═══════════════════════════════════════
    TIERRA DE GRACIA - REPORTE DE INVERSIÓN
═══════════════════════════════════════

Fecha: ${new Date().toLocaleDateString("es-VE")}

── RESUMEN FINANCIERO ───────────────
Total Invertido (USD):    ${fmt(totalUSD)}
Total Invertido (Bs):     ${fmt(totalVES, "VES")}
Nómina mensual:           ${fmt(monthlySalary)}

── INVERSIÓN POR PROYECTO ───────────
${byProject.map(p => `${p.name.padEnd(30)} ${fmt(p.total)}`).join("\n")}

── INVERSIÓN POR CATEGORÍA ──────────
${byCat.map(x => `${x.cat.padEnd(20)} ${fmt(x.total)}`).join("\n")}

── PROYECCIÓN DE GANANCIAS ──────────
Plantas estimadas:        ${estimatedPlants} árboles
Producción anual est.:    ${annualKg.toLocaleString()} kg
Precio/kg estimado:       ${fmt(pricePerKg)}
Ingreso anual estimado:   ${fmt(annualRevenue)}
Costo anual estimado:     ${fmt(annualCost)}
Ganancia anual estimada:  ${fmt(annualProfit)}
ROI estimado:             ${roi}%
Punto de equilibrio:      ${breakeven} años

* Proyecciones basadas en datos actuales. Los resultados reales pueden variar.
═══════════════════════════════════════
    `;
    const blob = new Blob([txt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "reporte-tierra-de-gracia.txt"; a.click();
  };

  return (
    <div className="fade">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
        <h2 style={{ fontFamily: "'Playfair Display',serif", color: T.cream, fontSize: 22 }}>Reportes & Proyecciones</h2>
        <Btn variant="gold" onClick={downloadReport}>⬇️ Descargar Reporte</Btn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 20 }}>
        <Card>
          <div style={{ fontFamily: "'Playfair Display',serif", color: T.cream, fontSize: 16, marginBottom: 18 }}>Inversión por Proyecto</div>
          {byProject.map(p => (
            <div key={p.id} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: T.text }}>{p.name}</span>
                <span style={{ fontSize: 13, color: T.goldLight, fontWeight: 700 }}>{fmt(p.total)}</span>
              </div>
              <ProgressBar value={totalUSD > 0 ? p.total / totalUSD * 100 : 0} color={p.color} />
            </div>
          ))}
        </Card>

        <Card>
          <div style={{ fontFamily: "'Playfair Display',serif", color: T.cream, fontSize: 16, marginBottom: 18 }}>Inversión por Categoría</div>
          {byCat.map(x => (
            <div key={x.cat} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: T.muted }}>{x.cat}</span>
                <span style={{ fontSize: 12, color: T.goldLight }}>{fmt(x.total)}</span>
              </div>
              <ProgressBar value={totalUSD > 0 ? x.total / totalUSD * 100 : 0} color={T.gold} />
            </div>
          ))}
        </Card>
      </div>

      {/* Projections */}
      <Card style={{ borderLeft: `4px solid ${T.greenGlow}` }}>
        <div style={{ fontFamily: "'Playfair Display',serif", color: T.cream, fontSize: 18, marginBottom: 6 }}>🌱 Proyección de Ganancias</div>
        <p style={{ color: T.muted, fontSize: 12, marginBottom: 20 }}>Estimación basada en datos actuales. Los aguacates producen después de 3-5 años.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 20 }}>
          <StatCard icon="🌳" label="PLANTAS ESTIMADAS" value={estimatedPlants} sub="árboles de aguacate" />
          <StatCard icon="⚖️" label="PRODUCCIÓN/AÑO" value={`${(annualKg / 1000).toFixed(1)}t`} sub="toneladas de aguacate" color={T.greenGlow} />
          <StatCard icon="💹" label="INGRESO ANUAL EST." value={fmt(annualRevenue)} sub={`a $${pricePerKg}/kg`} color={T.goldLight} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
          <StatCard icon="📉" label="COSTO ANUAL EST." value={fmt(annualCost)} color="#E07070" />
          <StatCard icon="📈" label="GANANCIA ANUAL EST." value={fmt(annualProfit)} color={T.greenGlow} />
          <StatCard icon="🎯" label="PUNTO DE EQUILIBRIO" value={`${breakeven} años`} sub={`ROI: ${roi}%`} color={T.goldLight} />
        </div>
        <div style={{ marginTop: 18, background: T.surface, borderRadius: 10, padding: "12px 16px", fontSize: 12, color: T.faint }}>
          ⚠️ Estas proyecciones son estimaciones basadas en datos promedio de la industria. Usa el Asistente IA para cálculos más personalizados.
        </div>
      </Card>
    </div>
  );
}

// ─── AI ASSISTANT ─────────────────────────────────────────────────────────────
function AIAssistant({ data }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "¡Hola! Soy tu asistente de IA para **Tierra de Gracia**. Puedo ayudarte con preguntas sobre el cultivo de aguacates, análisis de tus inversiones, proyecciones de ganancia, consejos agronómicos y mucho más. ¿En qué te puedo ayudar hoy? 🥑" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();

  const SUGGESTIONS = [
    "¿Cuánto he invertido en total?",
    "¿Cuándo empezaré a ver ganancias?",
    "¿Cómo cuidar los aguacates en Venezuela?",
    "¿Cuál es el mejor sistema de riego?",
    "Dame un resumen del proyecto",
  ];

  const systemPrompt = `Eres el asistente de IA de "Tierra de Gracia", una empresa de cultivo de aguacates en Venezuela. Eres experto en:
- Agronomía y cultivo de aguacates (especialmente variedad Hass)
- Gestión financiera de proyectos agrícolas
- Condiciones climáticas y de suelo en Venezuela
- Análisis de inversiones y proyecciones de rentabilidad

Datos actuales de la empresa:
- Total invertido: $${data.investments.reduce((a, i) => a + i.amountUSD, 0).toLocaleString()} USD
- Número de proyectos: ${data.projects.length}
- Empleados: ${data.employees.length} personas
- Tareas completadas: ${data.tasks.filter(t => t.status === "done").length}/${data.tasks.length}
- Proyectos: ${data.projects.map(p => p.name).join(", ")}

Responde siempre en español, de forma amigable, concisa y útil. Usa emojis ocasionalmente. Si te preguntan sobre datos financieros usa los datos reales de la empresa.`;

  const send = async (msg) => {
    if (!msg.trim() || loading) return;
    const userMsg = { role: "user", content: msg };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: updated.map(m => ({ role: m.role, content: m.content }))
        })
      });
      const d = await res.json();
      const reply = d.content?.[0]?.text || "No pude obtener una respuesta. Intenta de nuevo.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "❌ Error al conectar con la IA. Verifica tu conexión." }]);
    }
    setLoading(false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  return (
    <div className="fade" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontFamily: "'Playfair Display',serif", color: T.cream, fontSize: 22 }}>🤖 Asistente IA</h2>
        <p style={{ color: T.muted, fontSize: 13 }}>Conectado con Claude · Experto en aguacates y gestión agrícola</p>
      </div>

      {/* Suggestions */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {SUGGESTIONS.map(s => (
          <button key={s} onClick={() => send(s)} style={{
            background: T.card, border: `1px solid ${T.border}`, borderRadius: 99, padding: "6px 12px",
            color: T.muted, fontSize: 12, cursor: "pointer", transition: "all 0.15s"
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.green; e.currentTarget.style.color = T.greenGlow; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.muted; }}
          >{s}</button>
        ))}
      </div>

      {/* Chat */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 14, marginBottom: 16, minHeight: 300, maxHeight: 420 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "80%", padding: "12px 16px", borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              background: m.role === "user" ? `linear-gradient(135deg,${T.green},${T.greenLight})` : T.card,
              border: m.role === "assistant" ? `1px solid ${T.border}` : "none",
              color: T.text, fontSize: 14, lineHeight: 1.6,
              whiteSpace: "pre-wrap"
            }}>
              {m.content.replace(/\*\*(.*?)\*\*/g, "$1")}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{ padding: "12px 16px", borderRadius: "18px 18px 18px 4px", background: T.card, border: `1px solid ${T.border}` }}>
              <span className="thinking" style={{ color: T.muted, fontSize: 13 }}>🌱 Pensando...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: 10 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && send(input)}
          placeholder="Pregunta sobre aguacates, inversiones, proyecciones..."
          style={{ flex: 1 }}
          disabled={loading}
        />
        <Btn onClick={() => send(input)} disabled={loading || !input.trim()}>Enviar</Btn>
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [nav, setNav] = useState("dashboard");
  const [sideOpen, setSideOpen] = useState(true);
  const [data, setData] = useState(INIT);

  const views = { dashboard: Dashboard, projects: Projects, investments: Investments, tasks: Tasks, employees: Employees, bills: Bills, gallery: Gallery, reports: Reports, ai: AIAssistant };
  const View = views[nav];

  return (
    <>
      <style>{css}</style>
      <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        <Sidebar active={nav} setActive={setNav} sideOpen={sideOpen} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Topbar */}
          <div style={{ padding: "14px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 14, background: T.surface, flexShrink: 0 }}>
            <button onClick={() => setSideOpen(s => !s)} style={{ background: "none", border: "none", color: T.muted, fontSize: 18, cursor: "pointer" }}>☰</button>
            <div style={{ flex: 1 }}>
              <span style={{ color: T.muted, fontSize: 13 }}>{NAV.find(n => n.id === nav)?.icon} {NAV.find(n => n.id === nav)?.label}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.greenGlow }} />
              <span style={{ color: T.muted, fontSize: 12 }}>Tierra de Gracia · {new Date().toLocaleDateString("es-VE")}</span>
            </div>
          </div>
          {/* Content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
            <View data={data} setData={setData} setView={setNav} />
          </div>
        </div>
      </div>
    </>
  );
}
