import { useState } from "react";

// ═══ CTRL_Classes Brand Identity System ═══

const BRAND = {
  navy: "#0F1B2D",
  navyMid: "#1A2942",
  navyLight: "#243B5C",
  blue: "#2563EB",
  blueLight: "#3B82F6",
  blueSoft: "#60A5FA",
  blueGlow: "#93C5FD",
  accent: "#06D6A0",       // verde-menta divertido
  accentWarm: "#FFB703",   // amarelo quente para destaques
  white: "#FFFFFF",
  offWhite: "#F8FAFC",
  gray100: "#F1F5F9",
  gray200: "#E2E8F0",
  gray400: "#94A3B8",
  gray600: "#475569",
  gray800: "#1E293B",
  danger: "#EF4444",
  success: "#10B981",
  warning: "#F59E0B",
};

// ═══ LOGO COMPONENT ═══
function Logo({ size = 48, variant = "full", theme = "dark" }) {
  const isDark = theme === "dark";
  const fg = isDark ? BRAND.white : BRAND.navy;
  const accent = BRAND.blue;

  if (variant === "icon") {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        {/* Rounded square background */}
        <rect width="64" height="64" rx="16" fill={BRAND.navy} />
        {/* CTRL bracket */}
        <path d="M18 18 L12 32 L18 46" stroke={BRAND.blueSoft} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M46 18 L52 32 L46 46" stroke={BRAND.blueSoft} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {/* C letter stylized */}
        <path d="M38 24 C38 24 34 20 28 20 C22 20 20 25 20 32 C20 39 22 44 28 44 C34 44 38 40 38 40" stroke={BRAND.white} strokeWidth="4" strokeLinecap="round" fill="none" />
        {/* Cursor blink line */}
        <line x1="42" y1="22" x2="42" y2="42" stroke={BRAND.accent} strokeWidth="3" strokeLinecap="round">
          <animate attributeName="opacity" values="1;0;1" dur="1.2s" repeatCount="indefinite" />
        </line>
      </svg>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.25 }}>
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <rect width="64" height="64" rx="16" fill={BRAND.navy} />
        <path d="M18 18 L12 32 L18 46" stroke={BRAND.blueSoft} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M46 18 L52 32 L46 46" stroke={BRAND.blueSoft} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M38 24 C38 24 34 20 28 20 C22 20 20 25 20 32 C20 39 22 44 28 44 C34 44 38 40 38 40" stroke={BRAND.white} strokeWidth="4" strokeLinecap="round" fill="none" />
        <line x1="42" y1="22" x2="42" y2="42" stroke={BRAND.accent} strokeWidth="3" strokeLinecap="round">
          <animate attributeName="opacity" values="1;0;1" dur="1.2s" repeatCount="indefinite" />
        </line>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
        <span style={{
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: size * 0.45,
          fontWeight: 700,
          color: fg,
          letterSpacing: "-0.02em",
        }}>
          CTRL<span style={{ color: BRAND.accent }}>_</span>
        </span>
        <span style={{
          fontFamily: "'DM Sans', 'Nunito', sans-serif",
          fontSize: size * 0.35,
          fontWeight: 600,
          color: isDark ? BRAND.blueSoft : BRAND.blue,
          letterSpacing: "0.08em",
          marginTop: -2,
        }}>
          Classes
        </span>
      </div>
    </div>
  );
}

// ═══ COLOR SWATCH ═══
function Swatch({ color, name, hex, label }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{
        width: 64, height: 64, borderRadius: 12,
        background: color,
        boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
        border: color === "#FFFFFF" || color === "#F8FAFC" || color === "#F1F5F9" ? "1px solid #E2E8F0" : "none",
      }} />
      <span style={{ fontFamily: "monospace", fontSize: 11, color: BRAND.gray600 }}>{hex}</span>
      <span style={{ fontSize: 11, fontWeight: 600, color: BRAND.gray800, textAlign: "center" }}>{name}</span>
      {label && <span style={{ fontSize: 10, color: BRAND.gray400 }}>{label}</span>}
    </div>
  );
}

// ═══ BUTTON SAMPLES ═══
function ButtonSample({ children, variant = "primary", size = "md" }) {
  const styles = {
    primary: { bg: BRAND.blue, color: "#fff", hover: BRAND.blueLight },
    secondary: { bg: BRAND.gray100, color: BRAND.gray800, hover: BRAND.gray200 },
    accent: { bg: BRAND.accent, color: BRAND.navy, hover: "#05c494" },
    ghost: { bg: "transparent", color: BRAND.blue, hover: BRAND.gray100 },
    danger: { bg: BRAND.danger, color: "#fff", hover: "#dc2626" },
  };
  const sizes = {
    sm: { px: 12, py: 6, fs: 13 },
    md: { px: 20, py: 10, fs: 14 },
    lg: { px: 28, py: 14, fs: 16 },
  };
  const s = styles[variant];
  const sz = sizes[size];
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? s.hover : s.bg,
        color: s.color,
        border: variant === "ghost" ? `1.5px solid ${BRAND.blue}` : "none",
        borderRadius: 10,
        padding: `${sz.py}px ${sz.px}px`,
        fontSize: sz.fs,
        fontWeight: 600,
        fontFamily: "'DM Sans', sans-serif",
        cursor: "pointer",
        transition: "all 0.2s ease",
        transform: hovered ? "translateY(-1px)" : "none",
        boxShadow: hovered && variant === "primary" ? "0 4px 14px rgba(37,99,235,0.35)" : "none",
        minHeight: 44,
      }}
    >
      {children}
    </button>
  );
}

// ═══ CARD SAMPLE ═══
function CardSample({ emoji, title, value, trend, trendUp }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 16,
      padding: "20px 24px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
      border: `1px solid ${BRAND.gray200}`,
      display: "flex",
      flexDirection: "column",
      gap: 8,
      minWidth: 160,
      flex: "1 1 160px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 28 }}>{emoji}</span>
        <span style={{
          fontSize: 12, fontWeight: 600, borderRadius: 20, padding: "3px 10px",
          background: trendUp ? "#ECFDF5" : "#FEF2F2",
          color: trendUp ? BRAND.success : BRAND.danger,
        }}>
          {trend}
        </span>
      </div>
      <span style={{ fontSize: 28, fontWeight: 700, color: BRAND.navy, fontFamily: "'DM Sans', sans-serif" }}>{value}</span>
      <span style={{ fontSize: 13, color: BRAND.gray400 }}>{title}</span>
    </div>
  );
}

// ═══ BADGE ═══
function Badge({ children, variant = "blue" }) {
  const variants = {
    blue: { bg: "#EFF6FF", color: BRAND.blue },
    green: { bg: "#ECFDF5", color: BRAND.success },
    yellow: { bg: "#FFFBEB", color: "#B45309" },
    red: { bg: "#FEF2F2", color: BRAND.danger },
    gray: { bg: BRAND.gray100, color: BRAND.gray600 },
    accent: { bg: "#E6FFF6", color: "#059669" },
  };
  const v = variants[variant];
  return (
    <span style={{
      fontSize: 12, fontWeight: 600, borderRadius: 6, padding: "3px 10px",
      background: v.bg, color: v.color, fontFamily: "'DM Sans', sans-serif",
    }}>
      {children}
    </span>
  );
}

// ═══ PHONE MOCKUP ═══
function PhoneMockup() {
  return (
    <div style={{
      width: 280, background: BRAND.offWhite, borderRadius: 32,
      border: `3px solid ${BRAND.gray800}`,
      padding: "12px 0", overflow: "hidden",
      boxShadow: "0 25px 50px rgba(0,0,0,0.2)",
      position: "relative",
    }}>
      {/* Status bar */}
      <div style={{ padding: "0 20px 8px", display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, color: BRAND.gray800 }}>
        <span>9:41</span>
        <span>●●● ⚡ 87%</span>
      </div>
      {/* Header */}
      <div style={{
        padding: "12px 20px",
        background: BRAND.navy,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div>
          <div style={{ fontSize: 11, color: BRAND.blueSoft }}>Bom dia, Edson 👋</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>Minha agenda</div>
        </div>
        <div style={{
          width: 36, height: 36, borderRadius: 12, background: BRAND.blue,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, color: "#fff", fontWeight: 700,
        }}>E</div>
      </div>

      {/* Content */}
      <div style={{ padding: "16px 16px 8px" }}>
        {/* Today cards */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <div style={{ flex: 1, background: "#fff", borderRadius: 12, padding: "12px", textAlign: "center", border: `1px solid ${BRAND.gray200}` }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: BRAND.blue }}>4</div>
            <div style={{ fontSize: 11, color: BRAND.gray400 }}>Aulas hoje</div>
          </div>
          <div style={{ flex: 1, background: "#fff", borderRadius: 12, padding: "12px", textAlign: "center", border: `1px solid ${BRAND.gray200}` }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: BRAND.accent }}>12</div>
            <div style={{ fontSize: 11, color: BRAND.gray400 }}>Alunos ativos</div>
          </div>
          <div style={{ flex: 1, background: "#fff", borderRadius: 12, padding: "12px", textAlign: "center", border: `1px solid ${BRAND.gray200}` }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: BRAND.accentWarm }}>3</div>
            <div style={{ fontSize: 11, color: BRAND.gray400 }}>Pendentes 💰</div>
          </div>
        </div>

        {/* Class list */}
        <div style={{ fontSize: 13, fontWeight: 600, color: BRAND.gray600, marginBottom: 8 }}>Próximas aulas</div>
        {[
          { time: "14:00", name: "Maria Silva", subject: "Inglês B2", color: BRAND.blue, emoji: "🇬🇧" },
          { time: "15:30", name: "João Santos", subject: "Pilates", color: BRAND.accent, emoji: "🧘" },
          { time: "17:00", name: "Ana Costa", subject: "Matemática", color: BRAND.accentWarm, emoji: "📐" },
        ].map((c, i) => (
          <div key={i} style={{
            background: "#fff", borderRadius: 12, padding: "12px 14px",
            marginBottom: 8, display: "flex", alignItems: "center", gap: 12,
            borderLeft: `4px solid ${c.color}`,
            boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
          }}>
            <div style={{ fontSize: 22 }}>{c.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: BRAND.gray800 }}>{c.name}</div>
              <div style={{ fontSize: 12, color: BRAND.gray400 }}>{c.subject}</div>
            </div>
            <div style={{
              fontSize: 13, fontWeight: 700, color: c.color,
              background: `${c.color}15`, borderRadius: 8, padding: "4px 10px",
            }}>{c.time}</div>
          </div>
        ))}
      </div>

      {/* Bottom nav */}
      <div style={{
        display: "flex", justifyContent: "space-around", padding: "10px 0 6px",
        borderTop: `1px solid ${BRAND.gray200}`, marginTop: 8,
        background: "#fff",
      }}>
        {[
          { icon: "📅", label: "Agenda", active: true },
          { icon: "👥", label: "Alunos", active: false },
          { icon: "➕", label: "", active: false, fab: true },
          { icon: "💰", label: "Pagtos", active: false },
          { icon: "☰", label: "Menu", active: false },
        ].map((item, i) => (
          <div key={i} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            ...(item.fab ? {
              width: 44, height: 44, borderRadius: 14,
              background: BRAND.blue, display: "flex", alignItems: "center",
              justifyContent: "center", marginTop: -20,
              boxShadow: "0 4px 12px rgba(37,99,235,0.4)",
            } : {}),
          }}>
            <span style={{ fontSize: item.fab ? 20 : 18, ...(item.fab ? { color: "#fff" } : {}) }}>{item.icon}</span>
            {!item.fab && (
              <span style={{
                fontSize: 10, fontWeight: item.active ? 700 : 400,
                color: item.active ? BRAND.blue : BRAND.gray400,
              }}>{item.label}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══ MAIN COMPONENT ═══
export default function BrandIdentity() {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "🎨 Visão Geral" },
    { id: "colors", label: "🎭 Cores" },
    { id: "typography", label: "✏️ Tipografia" },
    { id: "components", label: "🧩 Componentes" },
    { id: "mobile", label: "📱 Mobile Preview" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(135deg, ${BRAND.navy} 0%, ${BRAND.navyMid} 50%, ${BRAND.navyLight} 100%)`,
      fontFamily: "'DM Sans', 'Nunito', -apple-system, sans-serif",
      color: BRAND.white,
      padding: 0,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{
        padding: "32px 40px 24px",
        borderBottom: `1px solid ${BRAND.navyLight}`,
      }}>
        <Logo size={52} variant="full" theme="dark" />
        <p style={{ marginTop: 12, fontSize: 15, color: BRAND.blueSoft, maxWidth: 500 }}>
          Brand Identity System & Visual Guidelines — v1.0
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", gap: 4, padding: "16px 40px",
        borderBottom: `1px solid ${BRAND.navyLight}`,
        overflowX: "auto",
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "8px 18px",
              borderRadius: 10,
              border: "none",
              background: activeTab === tab.id ? BRAND.blue : "transparent",
              color: activeTab === tab.id ? "#fff" : BRAND.blueSoft,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
              whiteSpace: "nowrap",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "32px 40px" }}>

        {/* ═══ OVERVIEW ═══ */}
        {activeTab === "overview" && (
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Conceito da marca</h2>
            <p style={{ fontSize: 15, color: BRAND.blueSoft, lineHeight: 1.7, maxWidth: 680, marginBottom: 32 }}>
              CTRL_Classes mistura a confiança de um terminal de comando com a acessibilidade de um app moderno.
              O underscore é proposital — remete a código, controle, comando. Mas o tom é leve, colorido e humano.
              <strong style={{ color: BRAND.accent }}> Sério por fora, divertido por dentro.</strong>
            </p>

            {/* Logo variations */}
            <h3 style={{ fontSize: 18, fontWeight: 600, color: BRAND.blueGlow, marginBottom: 20 }}>Variações do logo</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 32, marginBottom: 40 }}>
              <div style={{ background: BRAND.navy, borderRadius: 16, padding: 32, border: `1px solid ${BRAND.navyLight}` }}>
                <div style={{ fontSize: 11, color: BRAND.gray400, marginBottom: 12 }}>DARK BACKGROUND (primary)</div>
                <Logo size={52} variant="full" theme="dark" />
              </div>
              <div style={{ background: "#fff", borderRadius: 16, padding: 32 }}>
                <div style={{ fontSize: 11, color: BRAND.gray400, marginBottom: 12 }}>LIGHT BACKGROUND</div>
                <Logo size={52} variant="full" theme="light" />
              </div>
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{ background: BRAND.navy, borderRadius: 16, padding: 20, border: `1px solid ${BRAND.navyLight}` }}>
                  <div style={{ fontSize: 11, color: BRAND.gray400, marginBottom: 12 }}>APP ICON</div>
                  <Logo size={56} variant="icon" />
                </div>
                <div style={{ background: BRAND.navy, borderRadius: 16, padding: 20, border: `1px solid ${BRAND.navyLight}` }}>
                  <div style={{ fontSize: 11, color: BRAND.gray400, marginBottom: 12 }}>FAVICON</div>
                  <Logo size={32} variant="icon" />
                </div>
              </div>
            </div>

            {/* DNA */}
            <h3 style={{ fontSize: 18, fontWeight: 600, color: BRAND.blueGlow, marginBottom: 16 }}>DNA visual</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 32 }}>
              {[
                { emoji: "🎯", title: "Clareza", desc: "Cada tela tem 1 objetivo. Sem poluição visual." },
                { emoji: "🌊", title: "Azul profundo", desc: "Navy como base, azul como ação. Confiança e profissionalismo." },
                { emoji: "✨", title: "Toques de cor", desc: "Verde-menta e amarelo como acentos. Trazem vida e diversão." },
                { emoji: "📱", title: "Touch-first", desc: "Botões grandes (44px+), gestos intuitivos, zero confusão." },
                { emoji: "🔤", title: "Mono + Sans", desc: "JetBrains Mono no logo/dados, DM Sans no corpo. Tech + human." },
                { emoji: "😊", title: "Emoji nativo", desc: "Emojis como ícones em contextos informais. Universais e divertidos." },
              ].map((item, i) => (
                <div key={i} style={{
                  background: `${BRAND.navyMid}`,
                  border: `1px solid ${BRAND.navyLight}`,
                  borderRadius: 14, padding: "20px",
                  flex: "1 1 200px", minWidth: 200,
                }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{item.emoji}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{item.title}</div>
                  <div style={{ fontSize: 13, color: BRAND.blueSoft, lineHeight: 1.5 }}>{item.desc}</div>
                </div>
              ))}
            </div>

            {/* Personality */}
            <h3 style={{ fontSize: 18, fontWeight: 600, color: BRAND.blueGlow, marginBottom: 16 }}>Personalidade da marca</h3>
            <div style={{
              background: BRAND.navyMid, borderRadius: 14, padding: 24,
              border: `1px solid ${BRAND.navyLight}`, maxWidth: 600,
            }}>
              {[
                ["Profissional", "━━━━━━━━━━━━━━━━●━━━━", "Casual"],
                ["Técnico", "━━━━━━━━━━━━●━━━━━━━━━", "Simples"],
                ["Sério", "━━━━━━━━━━━━━━●━━━━━━━", "Divertido"],
                ["Minimalista", "━━━━━━━━━━━━━●━━━━━━━━", "Detalhado"],
                ["Masculino", "━━━━━━━━━━━●━━━━━━━━━━", "Neutro"],
              ].map(([left, bar, right], i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: BRAND.gray400, width: 80, textAlign: "right" }}>{left}</span>
                  <span style={{ fontSize: 12, color: BRAND.blueSoft, fontFamily: "monospace", flex: 1 }}>{bar}</span>
                  <span style={{ fontSize: 12, color: BRAND.gray400, width: 80 }}>{right}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ COLORS ═══ */}
        {activeTab === "colors" && (
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Paleta de cores</h2>
            <p style={{ fontSize: 15, color: BRAND.blueSoft, lineHeight: 1.7, maxWidth: 600, marginBottom: 32 }}>
              Azul navy como fundação. Azul vivo para ações. Verde-menta e amarelo para dar personalidade.
              A paleta funciona tanto em fundo escuro (login, landing) quanto em fundo claro (dashboard).
            </p>

            <h3 style={{ fontSize: 16, fontWeight: 600, color: BRAND.blueGlow, marginBottom: 16 }}>Core</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginBottom: 32, background: BRAND.navyMid, borderRadius: 16, padding: 24 }}>
              <Swatch color={BRAND.navy} name="Navy" hex="#0F1B2D" label="Background" />
              <Swatch color={BRAND.navyMid} name="Navy Mid" hex="#1A2942" label="Cards dark" />
              <Swatch color={BRAND.navyLight} name="Navy Light" hex="#243B5C" label="Borders dark" />
              <Swatch color={BRAND.blue} name="Blue" hex="#2563EB" label="Primary action" />
              <Swatch color={BRAND.blueLight} name="Blue Light" hex="#3B82F6" label="Hover" />
              <Swatch color={BRAND.blueSoft} name="Blue Soft" hex="#60A5FA" label="Links/text" />
              <Swatch color={BRAND.blueGlow} name="Blue Glow" hex="#93C5FD" label="Highlights" />
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 600, color: BRAND.blueGlow, marginBottom: 16 }}>Accents</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginBottom: 32, background: BRAND.navyMid, borderRadius: 16, padding: 24 }}>
              <Swatch color={BRAND.accent} name="Mint" hex="#06D6A0" label="Sucesso / CTA" />
              <Swatch color={BRAND.accentWarm} name="Amber" hex="#FFB703" label="Warning / Badge" />
              <Swatch color={BRAND.danger} name="Red" hex="#EF4444" label="Erro / Deletar" />
              <Swatch color={BRAND.success} name="Emerald" hex="#10B981" label="Confirmado" />
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 600, color: BRAND.blueGlow, marginBottom: 16 }}>Neutrals (light theme)</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginBottom: 32, background: BRAND.navyMid, borderRadius: 16, padding: 24 }}>
              <Swatch color={BRAND.white} name="White" hex="#FFFFFF" label="Background" />
              <Swatch color={BRAND.offWhite} name="Off White" hex="#F8FAFC" label="Page bg" />
              <Swatch color={BRAND.gray100} name="Gray 100" hex="#F1F5F9" label="Card hover" />
              <Swatch color={BRAND.gray200} name="Gray 200" hex="#E2E8F0" label="Borders" />
              <Swatch color={BRAND.gray400} name="Gray 400" hex="#94A3B8" label="Secondary text" />
              <Swatch color={BRAND.gray600} name="Gray 600" hex="#475569" label="Body text" />
              <Swatch color={BRAND.gray800} name="Gray 800" hex="#1E293B" label="Headings" />
            </div>

            {/* Usage rules */}
            <h3 style={{ fontSize: 16, fontWeight: 600, color: BRAND.blueGlow, marginBottom: 16 }}>Regras de uso</h3>
            <div style={{ background: BRAND.navyMid, borderRadius: 14, padding: 24, border: `1px solid ${BRAND.navyLight}`, maxWidth: 560 }}>
              {[
                "✅ Navy para backgrounds de auth/landing. Branco para dashboard.",
                "✅ Blue (#2563EB) SEMPRE para botões primários e links.",
                "✅ Mint (#06D6A0) para sucesso e CTAs secundários.",
                "✅ Amber (#FFB703) para badges de atenção e trial.",
                "❌ Nunca usar Navy + Red juntos (baixo contraste).",
                "❌ Nunca usar Blue como texto em fundo branco (usar Blue Soft).",
                "❌ Nunca mais de 3 cores de destaque na mesma tela.",
              ].map((rule, i) => (
                <div key={i} style={{ fontSize: 13, color: BRAND.blueSoft, marginBottom: 6, lineHeight: 1.5 }}>{rule}</div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ TYPOGRAPHY ═══ */}
        {activeTab === "typography" && (
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Tipografia</h2>
            <p style={{ fontSize: 15, color: BRAND.blueSoft, lineHeight: 1.7, maxWidth: 600, marginBottom: 32 }}>
              Duas fontes que refletem o DNA da marca: código + humanidade.
            </p>

            {/* Font 1 */}
            <div style={{ background: BRAND.navyMid, borderRadius: 16, padding: 32, marginBottom: 24, border: `1px solid ${BRAND.navyLight}` }}>
              <div style={{ fontSize: 12, color: BRAND.accent, fontWeight: 600, marginBottom: 8, letterSpacing: "0.1em" }}>DISPLAY / LOGO / DADOS</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 42, fontWeight: 700, marginBottom: 8 }}>
                JetBrains Mono
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, color: BRAND.blueSoft, marginBottom: 16 }}>
                ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
                abcdefghijklmnopqrstuvwxyz<br />
                0123456789 !@#$%&*()_+-=
              </div>
              <div style={{ fontSize: 13, color: BRAND.gray400, lineHeight: 1.6 }}>
                Usada em: logo "CTRL", números em cards de métricas, labels de status, código.<br />
                Transmite: precisão, controle, tech. O professor sente que tem uma ferramenta profissional.
              </div>
            </div>

            {/* Font 2 */}
            <div style={{ background: BRAND.navyMid, borderRadius: 16, padding: 32, marginBottom: 24, border: `1px solid ${BRAND.navyLight}` }}>
              <div style={{ fontSize: 12, color: BRAND.accentWarm, fontWeight: 600, marginBottom: 8, letterSpacing: "0.1em" }}>BODY / UI / NAVEGAÇÃO</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 42, fontWeight: 700, marginBottom: 8 }}>
                DM Sans
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: BRAND.blueSoft, marginBottom: 16 }}>
                ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
                abcdefghijklmnopqrstuvwxyz<br />
                0123456789 !@#$%&*()_+-=
              </div>
              <div style={{ fontSize: 13, color: BRAND.gray400, lineHeight: 1.6 }}>
                Usada em: todo o corpo de texto, botões, menus, formulários, títulos de página.<br />
                Transmite: clareza, amigabilidade, modernidade. Qualquer pessoa lê sem esforço.
              </div>
            </div>

            {/* Scale */}
            <h3 style={{ fontSize: 16, fontWeight: 600, color: BRAND.blueGlow, marginBottom: 16 }}>Escala tipográfica</h3>
            <div style={{ background: BRAND.navyMid, borderRadius: 16, padding: 32, border: `1px solid ${BRAND.navyLight}` }}>
              {[
                { label: "H1 — Título de página", size: 24, weight: 700, font: "DM Sans" },
                { label: "H2 — Seção", size: 20, weight: 600, font: "DM Sans" },
                { label: "H3 — Sub-seção", size: 16, weight: 600, font: "DM Sans" },
                { label: "Body — Texto principal", size: 14, weight: 400, font: "DM Sans" },
                { label: "Small — Legendas", size: 12, weight: 400, font: "DM Sans" },
                { label: "Mono — Dados/Métricas", size: 14, weight: 600, font: "JetBrains Mono" },
                { label: "Mono Large — KPIs", size: 28, weight: 700, font: "JetBrains Mono" },
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "baseline", gap: 20, marginBottom: 16,
                  borderBottom: i < 6 ? `1px solid ${BRAND.navyLight}` : "none",
                  paddingBottom: 16,
                }}>
                  <span style={{ fontSize: 11, color: BRAND.gray400, width: 180, flexShrink: 0 }}>{item.label}</span>
                  <span style={{
                    fontFamily: `'${item.font}', ${item.font === "JetBrains Mono" ? "monospace" : "sans-serif"}`,
                    fontSize: item.size, fontWeight: item.weight,
                  }}>
                    CTRL_Classes
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ COMPONENTS ═══ */}
        {activeTab === "components" && (
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Componentes UI</h2>
            <p style={{ fontSize: 15, color: BRAND.blueSoft, lineHeight: 1.7, maxWidth: 600, marginBottom: 32 }}>
              Componentes base que definem o visual de toda a aplicação. Border radius generoso (10-16px), sombras sutis, toques de cor.
            </p>

            {/* Buttons */}
            <h3 style={{ fontSize: 16, fontWeight: 600, color: BRAND.blueGlow, marginBottom: 16 }}>Botões</h3>
            <div style={{ background: "#fff", borderRadius: 16, padding: 28, marginBottom: 24, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
              <ButtonSample variant="primary">Nova aula</ButtonSample>
              <ButtonSample variant="accent">Confirmar ✓</ButtonSample>
              <ButtonSample variant="secondary">Cancelar</ButtonSample>
              <ButtonSample variant="ghost">Ver detalhes</ButtonSample>
              <ButtonSample variant="danger">Excluir</ButtonSample>
              <ButtonSample variant="primary" size="sm">SM</ButtonSample>
              <ButtonSample variant="primary" size="lg">Começar grátis →</ButtonSample>
            </div>

            {/* Badges */}
            <h3 style={{ fontSize: 16, fontWeight: 600, color: BRAND.blueGlow, marginBottom: 16 }}>Badges de status</h3>
            <div style={{ background: "#fff", borderRadius: 16, padding: 28, marginBottom: 24, display: "flex", flexWrap: "wrap", gap: 10 }}>
              <Badge variant="blue">Agendada</Badge>
              <Badge variant="green">Concluída</Badge>
              <Badge variant="gray">Cancelada</Badge>
              <Badge variant="red">Não compareceu</Badge>
              <Badge variant="accent">Pago</Badge>
              <Badge variant="yellow">Pendente</Badge>
              <Badge variant="red">Atrasado</Badge>
              <Badge variant="yellow">Trial — 23 dias</Badge>
            </div>

            {/* Stat Cards */}
            <h3 style={{ fontSize: 16, fontWeight: 600, color: BRAND.blueGlow, marginBottom: 16 }}>Cards de métricas</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
              <CardSample emoji="👥" title="Alunos ativos" value="24" trend="+3 este mês" trendUp />
              <CardSample emoji="📚" title="Aulas no mês" value="87" trend="+12%" trendUp />
              <CardSample emoji="💰" title="Receita mensal" value="R$ 4.280" trend="+8%" trendUp />
              <CardSample emoji="⚠️" title="Inadimplentes" value="2" trend="-1" trendUp />
            </div>

            {/* Input sample */}
            <h3 style={{ fontSize: 16, fontWeight: 600, color: BRAND.blueGlow, marginBottom: 16 }}>Formulários</h3>
            <div style={{ background: "#fff", borderRadius: 16, padding: 28, maxWidth: 400 }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: BRAND.gray800, display: "block", marginBottom: 6 }}>Nome do aluno</label>
                <div style={{
                  border: `2px solid ${BRAND.blue}`, borderRadius: 10, padding: "12px 14px",
                  fontSize: 14, color: BRAND.gray800, background: "#fff",
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  Maria Silva
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: BRAND.gray800, display: "block", marginBottom: 6 }}>Email</label>
                <div style={{
                  border: `2px solid ${BRAND.gray200}`, borderRadius: 10, padding: "12px 14px",
                  fontSize: 14, color: BRAND.gray400, background: BRAND.offWhite,
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  email@exemplo.com
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: BRAND.gray800, display: "block", marginBottom: 6 }}>Matéria</label>
                <div style={{
                  border: `2px solid ${BRAND.gray200}`, borderRadius: 10, padding: "12px 14px",
                  fontSize: 14, color: BRAND.gray800, background: "#fff",
                  display: "flex", justifyContent: "space-between",
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  <span>Inglês B2</span>
                  <span style={{ color: BRAND.gray400 }}>▾</span>
                </div>
              </div>
              <ButtonSample variant="primary">Salvar aluno</ButtonSample>
            </div>
          </div>
        )}

        {/* ═══ MOBILE ═══ */}
        {activeTab === "mobile" && (
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Mobile Preview</h2>
            <p style={{ fontSize: 15, color: BRAND.blueSoft, lineHeight: 1.7, maxWidth: 600, marginBottom: 32 }}>
              A experiência mobile é a principal. O professor usa entre uma aula e outra,
              muitas vezes com uma mão só. Tudo precisa estar a 1-2 toques de distância.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 40, alignItems: "flex-start" }}>
              <PhoneMockup />

              <div style={{ flex: "1 1 300px", minWidth: 280 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: BRAND.blueGlow, marginBottom: 16 }}>Princípios mobile</h3>
                {[
                  { emoji: "👆", title: "Touch targets 44px+", desc: "Todo elemento interativo tem no mínimo 44x44px. Sem frustração." },
                  { emoji: "📏", title: "Font 16px mínimo em inputs", desc: "Evita zoom automático no iOS Safari." },
                  { emoji: "⬇️", title: "Bottom sheet > Modal", desc: "Ações abrem de baixo pra cima. Mais natural no polegar." },
                  { emoji: "👋", title: "Swipe gestures", desc: "Swipe left no card de aula = marcar presença. Swipe right = cancelar." },
                  { emoji: "➕", title: "FAB central", desc: "Botão flutuante azul no bottom nav para criar nova aula rapidamente." },
                  { emoji: "🎨", title: "Color-coded borders", desc: "Cada aula tem borda esquerda colorida por tipo/matéria. Scan visual instantâneo." },
                  { emoji: "😊", title: "Emojis como ícones", desc: "📅 👥 💰 — universais, leves, sem carregar icon fonts extras." },
                  { emoji: "💬", title: "Feedback tátil", desc: "Toast de sucesso com haptics (vibração) em ações completadas." },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: "flex", gap: 12, marginBottom: 14,
                    background: BRAND.navyMid, borderRadius: 12, padding: "14px 16px",
                    border: `1px solid ${BRAND.navyLight}`,
                  }}>
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{item.emoji}</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{item.title}</div>
                      <div style={{ fontSize: 12, color: BRAND.blueSoft, lineHeight: 1.5 }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Footer */}
      <div style={{
        padding: "24px 40px",
        borderTop: `1px solid ${BRAND.navyLight}`,
        textAlign: "center",
      }}>
        <span style={{ fontSize: 13, color: BRAND.gray400 }}>
          CTRL<span style={{ color: BRAND.accent }}>_</span>Classes Brand Identity v1.0 — Março 2026
        </span>
      </div>
    </div>
  );
}
