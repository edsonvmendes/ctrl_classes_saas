import { useState, useEffect, useRef } from "react";

// ═══ BRAND TOKENS ═══
const B = {
  navy: "#0F1B2D", navyMid: "#1A2942", navyLight: "#243B5C",
  blue: "#2563EB", blueLight: "#3B82F6", blueSoft: "#60A5FA", blueGlow: "#93C5FD",
  accent: "#06D6A0", warm: "#FFB703",
  white: "#FFFFFF", offWhite: "#F8FAFC",
  g100: "#F1F5F9", g200: "#E2E8F0", g300: "#CBD5E1", g400: "#94A3B8", g600: "#475569", g800: "#1E293B",
  danger: "#EF4444", success: "#10B981", warning: "#F59E0B",
};

// ═══ MOCK DATA ═══
const STUDENTS = [
  { id: 1, name: "Maria Silva", email: "maria@email.com", phone: "+5511999001122", subject: "Inglês B2", active: true, emoji: "🇬🇧", color: B.blue, paymentStatus: "paid" },
  { id: 2, name: "João Santos", email: "joao@email.com", phone: "+5511988112233", subject: "Pilates", active: true, emoji: "🧘", color: B.accent, paymentStatus: "pending" },
  { id: 3, name: "Ana Costa", email: "ana@email.com", phone: "+5511977223344", subject: "Matemática", active: true, emoji: "📐", color: B.warm, paymentStatus: "paid" },
  { id: 4, name: "Pedro Oliveira", email: "pedro@email.com", phone: "+5511966334455", subject: "Violão", active: true, emoji: "🎸", color: "#8B5CF6", paymentStatus: "overdue" },
  { id: 5, name: "Luísa Ferreira", email: "luisa@email.com", phone: "+5511955445566", subject: "Inglês A2", active: true, emoji: "🇬🇧", color: B.blue, paymentStatus: "paid" },
  { id: 6, name: "Carlos Mendes", email: "", phone: "+5511944556677", subject: "Yoga", active: false, emoji: "🧘‍♂️", color: B.accent, paymentStatus: "cancelled" },
  { id: 7, name: "Beatriz Lima", email: "bia@email.com", phone: "+5511933667788", subject: "Piano", active: true, emoji: "🎹", color: "#EC4899", paymentStatus: "paid" },
  { id: 8, name: "Rafael Souza", email: "rafa@email.com", phone: "+5511922778899", subject: "Espanhol", active: true, emoji: "🇪🇸", color: "#F97316", paymentStatus: "pending" },
];

const CLASSES_TODAY = [
  { id: 1, time: "08:00", end: "09:00", student: "Maria Silva", subject: "Inglês B2", emoji: "🇬🇧", color: B.blue, status: "completed" },
  { id: 2, time: "09:30", end: "10:30", student: "Luísa Ferreira", subject: "Inglês A2", emoji: "🇬🇧", color: B.blue, status: "completed" },
  { id: 3, time: "14:00", end: "15:00", student: "João Santos", subject: "Pilates", emoji: "🧘", color: B.accent, status: "scheduled" },
  { id: 4, time: "15:30", end: "16:30", student: "Ana Costa", subject: "Matemática", emoji: "📐", color: B.warm, status: "scheduled" },
  { id: 5, time: "17:00", end: "18:00", student: "Pedro Oliveira", subject: "Violão", emoji: "🎸", color: "#8B5CF6", status: "scheduled" },
  { id: 6, time: "19:00", end: "20:00", student: "Beatriz Lima", subject: "Piano", emoji: "🎹", color: "#EC4899", status: "scheduled" },
];

const WEEK_CLASSES = [
  { day: "Seg", classes: 5 }, { day: "Ter", classes: 4 }, { day: "Qua", classes: 6 },
  { day: "Qui", classes: 3 }, { day: "Sex", classes: 5 }, { day: "Sáb", classes: 2 }, { day: "Dom", classes: 0 },
];

const PAYMENTS = [
  { id: 1, student: "Pedro Oliveira", amount: 28000, due: "2026-02-28", status: "overdue", method: null },
  { id: 2, student: "João Santos", amount: 35000, due: "2026-03-05", status: "pending", method: null },
  { id: 3, student: "Rafael Souza", amount: 25000, due: "2026-03-10", status: "pending", method: null },
  { id: 4, student: "Maria Silva", amount: 40000, due: "2026-03-01", status: "paid", method: "pix", paidAt: "2026-03-01" },
  { id: 5, student: "Ana Costa", amount: 30000, due: "2026-03-01", status: "paid", method: "transfer", paidAt: "2026-02-28" },
  { id: 6, student: "Luísa Ferreira", amount: 40000, due: "2026-03-01", status: "paid", method: "pix", paidAt: "2026-03-02" },
  { id: 7, student: "Beatriz Lima", amount: 45000, due: "2026-03-01", status: "paid", method: "card", paidAt: "2026-03-01" },
];

const SCHEDULES = [
  { id: 1, student: "Maria Silva", subject: "Inglês B2", day: "Segunda", time: "08:00", duration: 60, recurrence: "Semanal" },
  { id: 2, student: "Luísa Ferreira", subject: "Inglês A2", day: "Seg / Qua / Sex", time: "09:30", duration: 60, recurrence: "Semanal" },
  { id: 3, student: "João Santos", subject: "Pilates", day: "Ter / Qui", time: "14:00", duration: 60, recurrence: "Semanal" },
  { id: 4, student: "Ana Costa", subject: "Matemática", day: "Segunda", time: "15:30", duration: 60, recurrence: "Semanal" },
  { id: 5, student: "Pedro Oliveira", subject: "Violão", day: "Quarta", time: "17:00", duration: 60, recurrence: "Semanal" },
  { id: 6, student: "Beatriz Lima", subject: "Piano", day: "Seg / Sex", time: "19:00", duration: 60, recurrence: "Semanal" },
];

// ═══ HELPERS ═══
const fmt = (cents) => `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`;
const badgeStyle = (status) => {
  const map = {
    paid: { bg: "#ECFDF5", color: B.success, label: "Pago ✓" },
    pending: { bg: "#FFFBEB", color: "#B45309", label: "Pendente" },
    overdue: { bg: "#FEF2F2", color: B.danger, label: "Atrasado!" },
    cancelled: { bg: B.g100, color: B.g400, label: "Cancelado" },
    scheduled: { bg: "#EFF6FF", color: B.blue, label: "Agendada" },
    completed: { bg: "#ECFDF5", color: B.success, label: "Concluída" },
    no_show: { bg: "#FEF2F2", color: B.danger, label: "Faltou" },
    active: { bg: "#ECFDF5", color: B.success, label: "Ativo" },
    inactive: { bg: B.g100, color: B.g400, label: "Inativo" },
  };
  return map[status] || map.pending;
};

// ═══ REUSABLE COMPONENTS ═══
function StatusBadge({ status }) {
  const s = badgeStyle(status);
  return <span style={{ fontSize: 12, fontWeight: 600, borderRadius: 6, padding: "3px 10px", background: s.bg, color: s.color, whiteSpace: "nowrap" }}>{s.label}</span>;
}

function Btn({ children, variant = "primary", onClick, full, size = "md" }) {
  const [h, setH] = useState(false);
  const styles = {
    primary: { bg: B.blue, color: "#fff", hbg: B.blueLight },
    accent: { bg: B.accent, color: B.navy, hbg: "#05c494" },
    secondary: { bg: B.g100, color: B.g800, hbg: B.g200 },
    ghost: { bg: "transparent", color: B.blue, hbg: B.g100 },
    danger: { bg: "#FEF2F2", color: B.danger, hbg: "#FEE2E2" },
  };
  const s = styles[variant];
  const sz = size === "sm" ? { p: "6px 14px", fs: 13 } : size === "lg" ? { p: "14px 28px", fs: 16 } : { p: "10px 20px", fs: 14 };
  return (
    <button onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} onClick={onClick} style={{
      background: h ? s.hbg : s.bg, color: s.color, border: variant === "ghost" ? `1.5px solid ${B.blue}` : "none",
      borderRadius: 10, padding: sz.p, fontSize: sz.fs, fontWeight: 600, cursor: "pointer",
      transition: "all 0.15s", transform: h ? "translateY(-1px)" : "none", minHeight: 44,
      width: full ? "100%" : "auto", fontFamily: "'DM Sans', sans-serif",
      boxShadow: h && variant === "primary" ? "0 4px 14px rgba(37,99,235,0.3)" : "none",
    }}>{children}</button>
  );
}

function StatCard({ emoji, value, label, trend, up }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: "16px 18px", border: `1px solid ${B.g200}`, flex: "1 1 140px", minWidth: 140 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 24 }}>{emoji}</span>
        {trend && <span style={{ fontSize: 11, fontWeight: 600, color: up ? B.success : B.danger, background: up ? "#ECFDF5" : "#FEF2F2", borderRadius: 20, padding: "2px 8px" }}>{trend}</span>}
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: B.navy, fontFamily: "'JetBrains Mono', monospace" }}>{value}</div>
      <div style={{ fontSize: 12, color: B.g400, marginTop: 2 }}>{label}</div>
    </div>
  );
}

function InputField({ label, placeholder, value, type = "text", icon }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: B.g800, display: "block", marginBottom: 6 }}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", border: `2px solid ${B.g200}`, borderRadius: 10, padding: "11px 14px", background: "#fff", gap: 8 }}>
        {icon && <span style={{ fontSize: 16 }}>{icon}</span>}
        <span style={{ fontSize: 14, color: value ? B.g800 : B.g400, fontFamily: "'DM Sans', sans-serif", flex: 1 }}>{value || placeholder}</span>
      </div>
    </div>
  );
}

// ═══ PAGE: LOGIN ═══
function LoginPage({ onNavigate }) {
  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${B.navy} 0%, ${B.navyMid} 100%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ marginBottom: 40, textAlign: "center" }}>
        <div style={{ fontSize: 13, color: B.blueSoft, marginBottom: 12, letterSpacing: "0.1em" }}>BEM-VINDO AO</div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 36, fontWeight: 700, color: "#fff" }}>CTRL<span style={{ color: B.accent }}>_</span></div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 28, fontWeight: 600, color: B.blueSoft, letterSpacing: "0.08em", marginTop: -4 }}>Classes</div>
      </div>
      <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: "100%", maxWidth: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: B.navy, marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>Entrar</h2>
        <p style={{ fontSize: 14, color: B.g400, marginBottom: 24 }}>Gerencie suas aulas com inteligência</p>
        <button onClick={() => onNavigate("dashboard")} style={{ width: "100%", padding: "12px", borderRadius: 10, border: `2px solid ${B.g200}`, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontSize: 14, fontWeight: 600, color: B.g800, marginBottom: 16, minHeight: 48, fontFamily: "'DM Sans', sans-serif" }}>
          <span style={{ fontSize: 20 }}>🔵</span> Continuar com Google
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: B.g200 }} />
          <span style={{ fontSize: 12, color: B.g400 }}>ou</span>
          <div style={{ flex: 1, height: 1, background: B.g200 }} />
        </div>
        <InputField label="Email" placeholder="seu@email.com" icon="✉️" />
        <InputField label="Senha" placeholder="••••••••" type="password" icon="🔒" />
        <div style={{ textAlign: "right", marginBottom: 20 }}>
          <span style={{ fontSize: 13, color: B.blue, cursor: "pointer", fontWeight: 500 }}>Esqueci minha senha</span>
        </div>
        <Btn full onClick={() => onNavigate("dashboard")}>Entrar →</Btn>
        <div style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: B.g400 }}>
          Não tem conta? <span style={{ color: B.blue, fontWeight: 600, cursor: "pointer" }} onClick={() => onNavigate("signup")}>Criar conta grátis</span>
        </div>
      </div>
      <div style={{ marginTop: 24, display: "flex", gap: 16 }}>
        {["🇧🇷 PT", "🇺🇸 EN", "🇪🇸 ES"].map(l => <span key={l} style={{ fontSize: 13, color: B.blueSoft, cursor: "pointer", padding: "4px 8px", borderRadius: 6 }}>{l}</span>)}
      </div>
    </div>
  );
}

// ═══ PAGE: SIGNUP ═══
function SignupPage({ onNavigate }) {
  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${B.navy} 0%, ${B.navyMid} 100%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: "100%", maxWidth: 440, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
          <span onClick={() => onNavigate("login")} style={{ fontSize: 20, cursor: "pointer" }}>←</span>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: B.navy, fontFamily: "'DM Sans', sans-serif" }}>Criar conta</h2>
        </div>
        <div style={{ background: `${B.accent}15`, borderRadius: 12, padding: "12px 16px", marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>🎉</span>
          <span style={{ fontSize: 13, color: B.g800 }}><strong>30 dias grátis</strong> — sem cartão de crédito</span>
        </div>
        <button onClick={() => onNavigate("onboarding")} style={{ width: "100%", padding: "12px", borderRadius: 10, border: `2px solid ${B.g200}`, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontSize: 14, fontWeight: 600, color: B.g800, marginBottom: 16, minHeight: 48, fontFamily: "'DM Sans', sans-serif" }}>
          <span style={{ fontSize: 20 }}>🔵</span> Cadastrar com Google
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: B.g200 }} /><span style={{ fontSize: 12, color: B.g400 }}>ou</span><div style={{ flex: 1, height: 1, background: B.g200 }} />
        </div>
        <InputField label="Nome completo" placeholder="Seu nome" icon="👤" />
        <InputField label="Email" placeholder="seu@email.com" icon="✉️" />
        <InputField label="Senha" placeholder="Mínimo 8 caracteres" icon="🔒" />
        <Btn full onClick={() => onNavigate("onboarding")}>Criar conta grátis →</Btn>
        <p style={{ fontSize: 12, color: B.g400, textAlign: "center", marginTop: 16, lineHeight: 1.5 }}>
          Ao criar conta, você concorda com os <span style={{ color: B.blue }}>Termos de Uso</span> e <span style={{ color: B.blue }}>Política de Privacidade</span>
        </p>
      </div>
    </div>
  );
}

// ═══ PAGE: ONBOARDING ═══
function OnboardingPage({ onNavigate }) {
  const [step, setStep] = useState(0);
  const steps = [
    { title: "Como seus alunos te conhecem?", subtitle: "Esse nome aparece para quem agendar com você" },
    { title: "O que você ensina?", subtitle: "Isso nos ajuda a personalizar sua experiência" },
    { title: "Como você dá aula?", subtitle: "Pode mudar depois nas configurações" },
  ];
  return (
    <div style={{ minHeight: "100vh", background: B.offWhite, display: "flex", flexDirection: "column", alignItems: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 520, paddingTop: 40 }}>
        {/* Progress */}
        <div style={{ display: "flex", gap: 8, marginBottom: 40 }}>
          {[0, 1, 2].map(i => <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? B.blue : B.g200, transition: "all 0.3s" }} />)}
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: B.navy, marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>{steps[step].title}</h1>
        <p style={{ fontSize: 15, color: B.g400, marginBottom: 32 }}>{steps[step].subtitle}</p>

        {step === 0 && (
          <div style={{ background: "#fff", borderRadius: 16, padding: 28, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <InputField label="Nome comercial" value="Prof. Edson" icon="✏️" />
            <InputField label="Telefone (WhatsApp)" value="+55 12 99999-0000" icon="📱" />
            <InputField label="Fuso horário" value="América/São Paulo (BRT)" icon="🌎" />
          </div>
        )}
        {step === 1 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { emoji: "📚", label: "Idiomas", selected: true },
              { emoji: "🧘", label: "Fitness / Pilates" },
              { emoji: "🎵", label: "Música" },
              { emoji: "📐", label: "Reforço escolar" },
              { emoji: "💼", label: "Mentoria / Coach" },
              { emoji: "🎨", label: "Arte / Design" },
              { emoji: "💻", label: "Tecnologia" },
              { emoji: "🎯", label: "Outro" },
            ].map((c, i) => (
              <div key={i} style={{
                background: c.selected ? `${B.blue}10` : "#fff",
                border: `2px solid ${c.selected ? B.blue : B.g200}`,
                borderRadius: 14, padding: "18px 16px", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 12,
                transition: "all 0.15s",
              }}>
                <span style={{ fontSize: 28 }}>{c.emoji}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: B.g800 }}>{c.label}</span>
                {c.selected && <span style={{ marginLeft: "auto", color: B.blue, fontSize: 18 }}>✓</span>}
              </div>
            ))}
          </div>
        )}
        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { emoji: "👤", label: "Individual (1 aluno por vez)", selected: true },
              { emoji: "👥", label: "Em grupo (vários alunos)" },
              { emoji: "🔄", label: "Ambos" },
            ].map((m, i) => (
              <div key={i} style={{
                background: m.selected ? `${B.blue}10` : "#fff",
                border: `2px solid ${m.selected ? B.blue : B.g200}`,
                borderRadius: 14, padding: "18px 20px", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 14,
              }}>
                <span style={{ fontSize: 28 }}>{m.emoji}</span>
                <span style={{ fontSize: 15, fontWeight: 600, color: B.g800 }}>{m.label}</span>
                {m.selected && <span style={{ marginLeft: "auto", color: B.blue, fontSize: 18 }}>✓</span>}
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              {[
                { emoji: "💻", label: "Online", selected: true },
                { emoji: "🏠", label: "Presencial" },
                { emoji: "🔄", label: "Ambos" },
              ].map((m, i) => (
                <div key={i} style={{
                  background: m.selected ? `${B.accent}12` : "#fff",
                  border: `2px solid ${m.selected ? B.accent : B.g200}`,
                  borderRadius: 14, padding: "14px 20px", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 14, marginBottom: 10,
                }}>
                  <span style={{ fontSize: 22 }}>{m.emoji}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: B.g800 }}>{m.label}</span>
                  {m.selected && <span style={{ marginLeft: "auto", color: B.accent, fontSize: 18 }}>✓</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
          {step > 0 && <Btn variant="secondary" onClick={() => setStep(step - 1)}>← Voltar</Btn>}
          <div style={{ flex: 1 }}>
            <Btn full onClick={() => step < 2 ? setStep(step + 1) : onNavigate("dashboard")}>
              {step < 2 ? "Próximo →" : "Começar a usar! 🚀"}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══ APP SHELL (sidebar + bottom nav) ═══
function AppShell({ page, onNavigate, children }) {
  const navItems = [
    { id: "dashboard", icon: "📊", label: "Início" },
    { id: "calendar", icon: "📅", label: "Agenda" },
    { id: "fab", icon: "➕", label: "" },
    { id: "students", icon: "👥", label: "Alunos" },
    { id: "payments", icon: "💰", label: "Pagtos" },
  ];
  const sideItems = [
    { id: "dashboard", icon: "📊", label: "Dashboard" },
    { id: "calendar", icon: "📅", label: "Agenda" },
    { id: "students", icon: "👥", label: "Alunos" },
    { id: "classes", icon: "📚", label: "Aulas" },
    { id: "schedules", icon: "🔄", label: "Recorrência" },
    { id: "attendance", icon: "✅", label: "Presença" },
    { id: "payments", icon: "💰", label: "Pagamentos" },
    { id: "settings", icon: "⚙️", label: "Configurações" },
  ];
  const [showNewMenu, setShowNewMenu] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: B.offWhite, fontFamily: "'DM Sans', sans-serif" }}>
      {/* Desktop Sidebar */}
      <div className="sidebar-desktop" style={{ width: 240, background: B.navy, display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50 }}>
        <div style={{ padding: "20px 20px 16px" }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 700, color: "#fff" }}>CTRL<span style={{ color: B.accent }}>_</span></div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600, color: B.blueSoft, letterSpacing: "0.06em", marginTop: -2 }}>Classes</div>
        </div>
        <div style={{ padding: "0 12px", flex: 1 }}>
          {sideItems.map(item => (
            <div key={item.id} onClick={() => onNavigate(item.id)} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
              borderRadius: 10, cursor: "pointer", marginBottom: 2,
              background: page === item.id ? `${B.blue}25` : "transparent",
              transition: "all 0.15s",
            }}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span style={{ fontSize: 14, fontWeight: page === item.id ? 600 : 400, color: page === item.id ? B.blueGlow : B.blueSoft }}>{item.label}</span>
            </div>
          ))}
        </div>
        <div style={{ padding: 16, borderTop: `1px solid ${B.navyLight}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 4px" }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: B.blue, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff" }}>E</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Prof. Edson</div>
              <div style={{ fontSize: 11, color: B.g400 }}>Trial — 23 dias</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, marginLeft: 240, paddingBottom: 80 }}>
        {/* Top header */}
        <div style={{ padding: "16px 28px", borderBottom: `1px solid ${B.g200}`, background: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 40 }}>
          <div>
            <div style={{ fontSize: 12, color: B.g400 }}>Março 2026</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: B.navy }}>
              {page === "dashboard" && "Bom dia, Edson 👋"}
              {page === "calendar" && "📅 Agenda"}
              {page === "students" && "👥 Alunos"}
              {page === "classes" && "📚 Aulas de hoje"}
              {page === "schedules" && "🔄 Aulas recorrentes"}
              {page === "attendance" && "✅ Presença"}
              {page === "payments" && "💰 Pagamentos"}
              {page === "settings" && "⚙️ Configurações"}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <Btn variant="primary" size="sm" onClick={() => setShowNewMenu(!showNewMenu)}>＋ Novo</Btn>
              {showNewMenu && (
                <div style={{ position: "absolute", right: 0, top: 44, background: "#fff", borderRadius: 14, boxShadow: "0 8px 30px rgba(0,0,0,0.12)", border: `1px solid ${B.g200}`, padding: 8, minWidth: 200, zIndex: 100 }}>
                  {[
                    { icon: "👤", label: "Novo aluno", page: "students" },
                    { icon: "📚", label: "Nova aula", page: "classes" },
                    { icon: "🔄", label: "Nova recorrência", page: "schedules" },
                    { icon: "💰", label: "Novo pagamento", page: "payments" },
                  ].map((m, i) => (
                    <div key={i} onClick={() => { setShowNewMenu(false); onNavigate(m.page); }} style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                      borderRadius: 8, cursor: "pointer", fontSize: 14, color: B.g800,
                    }}><span style={{ fontSize: 18 }}>{m.icon}</span>{m.label}</div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {["🇧🇷", "🇺🇸", "🇪🇸"].map((f, i) => <span key={i} style={{ fontSize: 18, cursor: "pointer", opacity: i === 0 ? 1 : 0.4 }}>{f}</span>)}
            </div>
          </div>
        </div>
        {/* Page content */}
        <div style={{ padding: "24px 28px" }}>
          {children}
        </div>
      </div>

      {/* Mobile bottom nav (visual only) */}
      <div className="mobile-nav" style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: `1px solid ${B.g200}`, display: "none", justifyContent: "space-around", padding: "8px 0 12px", zIndex: 50 }}>
        {navItems.map((item, i) => (
          <div key={item.id} onClick={() => item.id !== "fab" && onNavigate(item.id)} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 2, cursor: "pointer",
            ...(item.id === "fab" ? { width: 50, height: 50, borderRadius: 16, background: B.blue, justifyContent: "center", marginTop: -20, boxShadow: "0 4px 14px rgba(37,99,235,0.4)" } : {}),
          }}>
            <span style={{ fontSize: item.id === "fab" ? 22 : 20, ...(item.id === "fab" ? { color: "#fff" } : {}) }}>{item.icon}</span>
            {item.id !== "fab" && <span style={{ fontSize: 10, fontWeight: page === item.id ? 700 : 400, color: page === item.id ? B.blue : B.g400 }}>{item.label}</span>}
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .sidebar-desktop { display: none !important; }
          .mobile-nav { display: flex !important; }
          div[style*="marginLeft: 240"] { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  );
}

// ═══ PAGE: DASHBOARD ═══
function DashboardPage() {
  return (
    <div>
      {/* Stats */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 28 }}>
        <StatCard emoji="👥" value="8" label="Alunos ativos" trend="+2" up />
        <StatCard emoji="📚" value="6" label="Aulas hoje" trend="+1" up />
        <StatCard emoji="💰" value="R$ 2.430" label="Receita do mês" trend="+12%" up />
        <StatCard emoji="⚠️" value="3" label="Pgtos pendentes" />
      </div>

      {/* Two columns */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Today's classes */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 20, border: `1px solid ${B.g200}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: B.navy }}>📅 Aulas de hoje</h3>
            <span style={{ fontSize: 12, color: B.blue, fontWeight: 600, cursor: "pointer" }}>Ver agenda →</span>
          </div>
          {CLASSES_TODAY.map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < CLASSES_TODAY.length - 1 ? `1px solid ${B.g100}` : "none" }}>
              <div style={{ width: 4, height: 40, borderRadius: 2, background: c.color }} />
              <span style={{ fontSize: 20 }}>{c.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: B.g800 }}>{c.student}</div>
                <div style={{ fontSize: 12, color: B.g400 }}>{c.subject}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: B.g800 }}>{c.time}</div>
                <StatusBadge status={c.status} />
              </div>
            </div>
          ))}
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Week overview */}
          <div style={{ background: "#fff", borderRadius: 16, padding: 20, border: `1px solid ${B.g200}` }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: B.navy, marginBottom: 16 }}>📊 Esta semana</h3>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 100 }}>
              {WEEK_CLASSES.map((d, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div style={{
                    width: "100%", borderRadius: 6,
                    height: Math.max(8, d.classes * 16),
                    background: i === 0 ? B.blue : `${B.blue}40`,
                    transition: "all 0.3s",
                  }} />
                  <span style={{ fontSize: 11, fontWeight: i === 0 ? 700 : 400, color: i === 0 ? B.blue : B.g400 }}>{d.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pending payments */}
          <div style={{ background: "#fff", borderRadius: 16, padding: 20, border: `1px solid ${B.g200}` }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: B.navy, marginBottom: 16 }}>💰 Pagamentos pendentes</h3>
            {PAYMENTS.filter(p => p.status !== "paid").map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${B.g100}` }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: B.g800 }}>{p.student}</div>
                  <div style={{ fontSize: 12, color: B.g400 }}>Vence: {p.due.split("-").reverse().join("/")}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: B.navy }}>{fmt(p.amount)}</div>
                  <StatusBadge status={p.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`@media (max-width: 768px) { div[style*="gridTemplateColumns: 1fr 1fr"] { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

// ═══ PAGE: CALENDAR ═══
function CalendarPage() {
  const hours = Array.from({ length: 13 }, (_, i) => i + 7);
  return (
    <div>
      {/* Day selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, overflowX: "auto", paddingBottom: 4 }}>
        {["Seg 2", "Ter 3", "Qua 4", "Qui 5", "Sex 6", "Sáb 7", "Dom 8"].map((d, i) => (
          <div key={i} style={{
            padding: "10px 16px", borderRadius: 12, cursor: "pointer", textAlign: "center", minWidth: 64,
            background: i === 0 ? B.blue : "#fff", color: i === 0 ? "#fff" : B.g800,
            border: `1px solid ${i === 0 ? B.blue : B.g200}`, fontWeight: 600, fontSize: 13,
          }}>{d}</div>
        ))}
      </div>
      {/* Timeline */}
      <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${B.g200}`, overflow: "hidden" }}>
        {hours.map(h => {
          const cls = CLASSES_TODAY.find(c => parseInt(c.time) === h);
          return (
            <div key={h} style={{ display: "flex", borderBottom: `1px solid ${B.g100}`, minHeight: cls ? 72 : 48 }}>
              <div style={{ width: 60, padding: "12px 8px", textAlign: "right", fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: B.g400, borderRight: `1px solid ${B.g100}` }}>
                {`${h.toString().padStart(2, "0")}:00`}
              </div>
              <div style={{ flex: 1, padding: "6px 12px", position: "relative" }}>
                {cls && (
                  <div style={{
                    background: `${cls.color}12`, border: `1px solid ${cls.color}40`,
                    borderLeft: `4px solid ${cls.color}`, borderRadius: 10, padding: "10px 14px",
                    cursor: "pointer",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <span style={{ fontSize: 16, marginRight: 8 }}>{cls.emoji}</span>
                        <span style={{ fontSize: 14, fontWeight: 600, color: B.g800 }}>{cls.student}</span>
                      </div>
                      <StatusBadge status={cls.status} />
                    </div>
                    <div style={{ fontSize: 12, color: B.g400, marginTop: 4 }}>{cls.time} — {cls.end} · {cls.subject}</div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══ PAGE: STUDENTS ═══
function StudentsPage() {
  const [search, setSearch] = useState("");
  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200, display: "flex", alignItems: "center", gap: 8, background: "#fff", border: `1px solid ${B.g200}`, borderRadius: 10, padding: "0 14px" }}>
          <span>🔍</span>
          <span style={{ fontSize: 14, color: B.g400, padding: "11px 0" }}>Buscar aluno...</span>
        </div>
        <Btn variant="primary">＋ Novo aluno</Btn>
      </div>

      <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${B.g200}`, overflow: "hidden" }}>
        {/* Table header */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr", padding: "12px 20px", background: B.g100, fontSize: 12, fontWeight: 600, color: B.g400, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          <span>Aluno</span><span>Contato</span><span>Matéria</span><span>Pagamento</span><span>Status</span>
        </div>
        {STUDENTS.map((s, i) => (
          <div key={s.id} style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr", padding: "14px 20px", borderBottom: `1px solid ${B.g100}`, alignItems: "center", cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{s.emoji}</div>
              <span style={{ fontSize: 14, fontWeight: 600, color: B.g800 }}>{s.name}</span>
            </div>
            <div>
              <div style={{ fontSize: 13, color: B.g600 }}>{s.email || "—"}</div>
              <div style={{ fontSize: 12, color: B.g400 }}>{s.phone}</div>
            </div>
            <span style={{ fontSize: 13, color: B.g600 }}>{s.subject}</span>
            <StatusBadge status={s.paymentStatus} />
            <StatusBadge status={s.active ? "active" : "inactive"} />
          </div>
        ))}
      </div>
      <style>{`@media (max-width: 768px) {
        div[style*="gridTemplateColumns: 2fr 2fr 1fr 1fr 1fr"] { grid-template-columns: 1fr !important; gap: 8px; }
      }`}</style>
    </div>
  );
}

// ═══ PAGE: CLASSES ═══
function ClassesPage() {
  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <Btn variant="primary">＋ Nova aula avulsa</Btn>
        <Btn variant="secondary">Filtrar por aluno ▾</Btn>
        <Btn variant="secondary">Filtrar por status ▾</Btn>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {CLASSES_TODAY.map((c, i) => (
          <div key={i} style={{
            background: "#fff", borderRadius: 14, padding: "16px 20px",
            border: `1px solid ${B.g200}`, borderLeft: `5px solid ${c.color}`,
            display: "flex", alignItems: "center", gap: 16, cursor: "pointer",
          }}>
            <span style={{ fontSize: 28 }}>{c.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: B.g800 }}>{c.student}</div>
              <div style={{ fontSize: 13, color: B.g400 }}>{c.subject} · {c.time} — {c.end}</div>
            </div>
            <StatusBadge status={c.status} />
            <div style={{ display: "flex", gap: 6 }}>
              {c.status === "scheduled" && <Btn variant="accent" size="sm">✓ Presença</Btn>}
              {c.status === "scheduled" && <Btn variant="danger" size="sm">✕</Btn>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══ PAGE: SCHEDULES ═══
function SchedulesPage() {
  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <Btn variant="primary">＋ Nova recorrência</Btn>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {SCHEDULES.map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 14, padding: "20px", border: `1px solid ${B.g200}`, cursor: "pointer" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: B.navy }}>{s.student}</div>
                <div style={{ fontSize: 13, color: B.g400 }}>{s.subject}</div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: B.blue, background: `${B.blue}12`, borderRadius: 6, padding: "3px 10px" }}>{s.recurrence}</span>
            </div>
            <div style={{ display: "flex", gap: 16, fontSize: 13, color: B.g600 }}>
              <span>📅 {s.day}</span>
              <span>🕐 {s.time}</span>
              <span>⏱️ {s.duration}min</span>
            </div>
          </div>
        ))}
      </div>
      <style>{`@media (max-width: 768px) { div[style*="gridTemplateColumns: 1fr 1fr"] { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

// ═══ PAGE: ATTENDANCE ═══
function AttendancePage() {
  return (
    <div>
      <div style={{ background: `${B.blue}08`, borderRadius: 14, padding: "16px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 24 }}>📋</span>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: B.navy }}>Aula atual: Pilates — João Santos</div>
          <div style={{ fontSize: 13, color: B.g400 }}>14:00 — 15:00 · Hoje</div>
        </div>
      </div>
      <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${B.g200}`, overflow: "hidden" }}>
        {["João Santos"].map((name, i) => (
          <div key={i} style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: `${B.accent}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🧘</div>
              <span style={{ fontSize: 15, fontWeight: 600, color: B.g800 }}>{name}</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { label: "Presente", color: B.success, bg: "#ECFDF5", selected: false },
                { label: "Ausente", color: B.danger, bg: "#FEF2F2", selected: false },
                { label: "Atrasou", color: B.warning, bg: "#FFFBEB", selected: false },
                { label: "Justificou", color: B.g400, bg: B.g100, selected: false },
              ].map((opt, j) => (
                <div key={j} style={{
                  padding: "8px 16px", borderRadius: 10, cursor: "pointer",
                  border: `2px solid ${opt.selected ? opt.color : B.g200}`,
                  background: opt.selected ? opt.bg : "#fff",
                  fontSize: 13, fontWeight: 600, color: opt.selected ? opt.color : B.g600,
                  minHeight: 40, display: "flex", alignItems: "center",
                }}>{opt.label}</div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <h3 style={{ fontSize: 16, fontWeight: 700, color: B.navy, marginTop: 28, marginBottom: 16 }}>Histórico de hoje</h3>
      {CLASSES_TODAY.filter(c => c.status === "completed").map((c, i) => (
        <div key={i} style={{ background: "#fff", borderRadius: 12, padding: "14px 20px", border: `1px solid ${B.g200}`, marginBottom: 10, display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 20 }}>{c.emoji}</span>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: B.g800 }}>{c.student}</span>
            <span style={{ fontSize: 12, color: B.g400, marginLeft: 8 }}>{c.time}</span>
          </div>
          <StatusBadge status="completed" />
          <span style={{ fontSize: 12, fontWeight: 600, color: B.success }}>✓ Presente</span>
        </div>
      ))}
    </div>
  );
}

// ═══ PAGE: PAYMENTS ═══
function PaymentsPage() {
  const [tab, setTab] = useState("all");
  const filtered = tab === "all" ? PAYMENTS : PAYMENTS.filter(p => p.status === tab);
  return (
    <div>
      {/* Summary */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 24 }}>
        <StatCard emoji="💰" value={fmt(PAYMENTS.filter(p => p.status === "paid").reduce((a, p) => a + p.amount, 0))} label="Recebido em março" trend="+8%" up />
        <StatCard emoji="⏳" value={fmt(PAYMENTS.filter(p => p.status === "pending").reduce((a, p) => a + p.amount, 0))} label="Pendente" />
        <StatCard emoji="🚨" value={fmt(PAYMENTS.filter(p => p.status === "overdue").reduce((a, p) => a + p.amount, 0))} label="Atrasado" />
      </div>

      {/* Tabs + button */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
        {[
          { id: "all", label: "Todos" }, { id: "pending", label: "Pendentes" },
          { id: "overdue", label: "Atrasados" }, { id: "paid", label: "Pagos" },
        ].map(t => (
          <div key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "8px 16px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600,
            background: tab === t.id ? B.blue : "#fff", color: tab === t.id ? "#fff" : B.g600,
            border: `1px solid ${tab === t.id ? B.blue : B.g200}`,
          }}>{t.label}</div>
        ))}
        <div style={{ marginLeft: "auto" }}>
          <Btn variant="primary" size="sm">＋ Registrar pagamento</Btn>
        </div>
      </div>

      {/* List */}
      <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${B.g200}`, overflow: "hidden" }}>
        {filtered.map((p, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px",
            borderBottom: i < filtered.length - 1 ? `1px solid ${B.g100}` : "none", cursor: "pointer",
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: B.g800 }}>{p.student}</div>
              <div style={{ fontSize: 12, color: B.g400 }}>
                Vence: {p.due.split("-").reverse().join("/")}
                {p.paidAt && ` · Pago: ${p.paidAt.split("-").reverse().join("/")}`}
                {p.method && ` · ${p.method.toUpperCase()}`}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 16, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: B.navy }}>{fmt(p.amount)}</span>
              <StatusBadge status={p.status} />
              {p.status !== "paid" && <Btn variant="accent" size="sm">Marcar pago</Btn>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══ PAGE: SETTINGS ═══
function SettingsPage() {
  return (
    <div style={{ maxWidth: 600 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 28, border: `1px solid ${B.g200}`, marginBottom: 20 }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: B.navy, marginBottom: 20 }}>👤 Perfil</h3>
        <InputField label="Nome comercial" value="Prof. Edson" icon="✏️" />
        <InputField label="Email" value="edson@email.com" icon="✉️" />
        <InputField label="Telefone" value="+55 12 99999-0000" icon="📱" />
        <InputField label="Slug (URL pública)" value="ctrlclasses.com/book/prof-edson" icon="🔗" />
        <Btn variant="primary">Salvar alterações</Btn>
      </div>

      <div style={{ background: "#fff", borderRadius: 16, padding: 28, border: `1px solid ${B.g200}`, marginBottom: 20 }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: B.navy, marginBottom: 20 }}>🌍 Idioma e região</h3>
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          {[
            { flag: "🇧🇷", label: "Português", selected: true },
            { flag: "🇺🇸", label: "English" },
            { flag: "🇪🇸", label: "Español" },
          ].map((l, i) => (
            <div key={i} style={{
              padding: "12px 20px", borderRadius: 12, cursor: "pointer",
              border: `2px solid ${l.selected ? B.blue : B.g200}`,
              background: l.selected ? `${B.blue}08` : "#fff",
              display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600,
            }}>
              <span style={{ fontSize: 22 }}>{l.flag}</span> {l.label}
            </div>
          ))}
        </div>
        <InputField label="Fuso horário" value="América/São Paulo (BRT -03:00)" icon="🕐" />
        <InputField label="Moeda" value="BRL — Real Brasileiro (R$)" icon="💱" />
      </div>

      <div style={{ background: "#fff", borderRadius: 16, padding: 28, border: `1px solid ${B.g200}`, marginBottom: 20 }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: B.navy, marginBottom: 20 }}>📅 Integrações</h3>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: `1px solid ${B.g100}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 24 }}>📆</span>
            <div><div style={{ fontSize: 14, fontWeight: 600 }}>Google Calendar</div><div style={{ fontSize: 12, color: B.g400 }}>Sincronize suas aulas automaticamente</div></div>
          </div>
          <Btn variant="ghost" size="sm">Conectar</Btn>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 24 }}>🌐</span>
            <div><div style={{ fontSize: 14, fontWeight: 600 }}>Agendamento público</div><div style={{ fontSize: 12, color: B.g400 }}>Permita que alunos agendem online</div></div>
          </div>
          <div style={{ width: 48, height: 28, borderRadius: 14, background: B.g200, cursor: "pointer", position: "relative" }}>
            <div style={{ width: 22, height: 22, borderRadius: 11, background: "#fff", position: "absolute", top: 3, left: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
          </div>
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: 16, padding: 28, border: `1px solid ${B.g200}` }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: B.navy, marginBottom: 16 }}>💳 Assinatura</h3>
        <div style={{ background: `${B.warm}12`, borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <span style={{ fontSize: 22 }}>⏳</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: B.g800 }}>Período de teste — 23 dias restantes</div>
            <div style={{ fontSize: 12, color: B.g400 }}>Acesso completo a todas as funcionalidades</div>
          </div>
        </div>
        <Btn variant="primary" full>Assinar agora — a partir de R$ 29/mês</Btn>
      </div>
    </div>
  );
}

// ═══ MAIN APP ═══
export default function CTRLClassesMockup() {
  const [page, setPage] = useState("login");

  const authPages = ["login", "signup", "onboarding"];
  const isAuth = authPages.includes(page);

  if (page === "login") return <LoginPage onNavigate={setPage} />;
  if (page === "signup") return <SignupPage onNavigate={setPage} />;
  if (page === "onboarding") return <OnboardingPage onNavigate={setPage} />;

  return (
    <AppShell page={page} onNavigate={setPage}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      {page === "dashboard" && <DashboardPage />}
      {page === "calendar" && <CalendarPage />}
      {page === "students" && <StudentsPage />}
      {page === "classes" && <ClassesPage />}
      {page === "schedules" && <SchedulesPage />}
      {page === "attendance" && <AttendancePage />}
      {page === "payments" && <PaymentsPage />}
      {page === "settings" && <SettingsPage />}
    </AppShell>
  );
}
