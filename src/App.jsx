/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

// ── Firebase Configuration ───────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyCkiA-7FYA9vBTgojbYXdkpsPQ5cAx_nk4",
  authDomain: "registro-e2328.firebaseapp.com",
  projectId: "registro-e2328",
  storageBucket: "registro-e2328.firebasestorage.app",
  messagingSenderId: "315752771883",
  appId: "1:315752771883:web:93dad6707d4778bd5fd56e",
};

const firebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);
const provider = new GoogleAuthProvider();

// ── Design Tokens ─────────────────────────────────────────────────────────────
const T = {
  green900: "#0a3d20",
  green800: "#0f5c2e",
  green700: "#136636",
  green600: "#1a874a",
  green500: "#22a55b",
  green400: "#4cbe7a",
  green100: "#d4f0e0",
  green50: "#edf7f0",
  amber100: "#fef3d5",
  coral600: "#c0631a",
  coral100: "#fce8d0",
  blue600: "#3b5bdb",
  blue100: "#e8f0fe",
  gray800: "#1e2226",
  gray700: "#343a40",
  gray600: "#495057",
  gray400: "#adb5bd",
  gray300: "#ced4da",
  gray200: "#e9ecef",
  gray100: "#f1f3f5",
  gray50: "#f8f9fa",
  white: "#ffffff",
};

// ── Global CSS ────────────────────────────────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@700&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html,body,#root{height:100%}
    body{font-family:'DM Sans',sans-serif;background:${T.green50};color:${T.gray800}}
    button{font-family:'DM Sans',sans-serif;cursor:pointer}
    textarea,input{font-family:'DM Sans',sans-serif}
    ::-webkit-scrollbar{width:4px;height:4px}
    ::-webkit-scrollbar-thumb{background:${T.gray300};border-radius:4px}
    .fade-in{animation:fadeIn 0.25s ease}
    @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
    @keyframes spin{to{transform:rotate(360deg)}}
    .login-page{min-height:100vh;display:flex;align-items:center;justify-content:center;
      background:linear-gradient(145deg,${T.green900} 0%,${T.green700} 50%,${T.green800} 100%);padding:1.5rem}
    @media(min-width:768px){
      .app-shell{display:grid !important;grid-template-columns:300px 1fr;height:100vh}
      .app-sidebar{display:flex !important;flex-direction:column;overflow-y:auto;
        border-right:1px solid ${T.gray200};background:${T.white}}
      .app-main{overflow-y:auto;background:${T.gray50}}
      .bottom-nav{display:none !important}
    }
    @media(max-width:767px){
      .app-shell{display:flex;flex-direction:column;min-height:100vh}
      .app-sidebar{display:none !important}
      .app-main{flex:1;overflow-y:auto;padding-bottom:80px;background:${T.gray50}}
    }
  `}</style>
);

// ── Helpers ───────────────────────────────────────────────────────────────────
const todayStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const fmtTime = (ts) => {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleTimeString("es-CO", { hour12: false });
};

const MOVE_META = {
  Entrada: { icon: "login", bg: T.green100, color: T.green700 },
  Salida: { icon: "logout", bg: T.coral100, color: T.coral600 },
  "Almuerzo Entrada": { icon: "soup", bg: T.amber100, color: "#9a6200" },
  "Almuerzo Salida": { icon: "soup", bg: T.amber100, color: "#7b6000" },
  "Break Entrada": { icon: "coffee", bg: T.blue100, color: T.blue600 },
  "Break Salida": { icon: "coffee", bg: T.blue100, color: "#2d45b0" },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ÁTOMOS E ICONOS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const Icon = ({ name, size = 20, color = "currentColor" }) => {
  const p = {
    login: (
      <>
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
        <polyline points="10 17 15 12 10 7" />
        <line x1="15" y1="12" x2="3" y2="12" />
      </>
    ),
    logout: (
      <>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </>
    ),
    soup: (
      <>
        <path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9z" />
        <path d="M7 21h10" />
        <path d="M19.5 12c0-4.5-3.58-8-8-8" />
      </>
    ),
    coffee: (
      <>
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
        <line x1="6" y1="1" x2="6" y2="4" />
        <line x1="10" y1="1" x2="10" y2="4" />
        <line x1="14" y1="1" x2="14" y2="4" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </>
    ),
    check: <polyline points="20 6 9 17 4 12" />,
    close: (
      <>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </>
    ),
    list: (
      <>
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
      </>
    ),
    bar: (
      <>
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
        <line x1="2" y1="20" x2="22" y2="20" />
      </>
    ),
    user: (
      <>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </>
    ),
    alert: (
      <>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </>
    ),
    signout: (
      <>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </>
    ),
    brain: (
      <>
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1 0-3.12 3 3 0 0 1 0-4.88 2.5 2.5 0 0 1 0-3.12A2.5 2.5 0 0 1 9.5 2z" />
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 0-3.12 3 3 0 0 0 0-4.88 2.5 2.5 0 0 0 0-3.12A2.5 2.5 0 0 0 14.5 2z" />
      </>
    ),
  };
  if (name === "google")
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        style={{
          display: "inline-block",
          flexShrink: 0,
          verticalAlign: "middle",
        }}
      >
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
    );
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        display: "inline-block",
        flexShrink: 0,
        verticalAlign: "middle",
      }}
    >
      {p[name]}
    </svg>
  );
};

const CustomLogo = ({ size = 32 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0a3d20" />
        <stop offset="100%" stopColor="#22a55b" />
      </linearGradient>
      <rect
        x="2"
        y="11"
        width="3"
        height="8"
        rx="1.5"
        fill="url(#logoGrad)"
        opacity="0.4"
      />
      <rect
        x="8"
        y="7"
        width="3"
        height="12"
        rx="1.5"
        fill="url(#logoGrad)"
        opacity="0.75"
      />
      <rect x="14" y="3" width="3" height="16" rx="1.5" fill="url(#logoGrad)" />
      <path
        d="M15.5 8L19 4"
        stroke="url(#logoGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
    <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
      <span
        style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: 15,
          fontWeight: 800,
          color: T.green900,
          letterSpacing: "-0.5px",
        }}
      >
        ASISTENCIA
      </span>
      <span
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 9,
          fontWeight: 600,
          color: T.gray600,
          letterSpacing: "0.5px",
          marginTop: 2,
        }}
      >
        CONTROL DE TIEMPO
      </span>
    </div>
  </div>
);

const Spinner = ({ size = 20, color = T.green500 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    style={{ animation: "spin 0.7s linear infinite", flexShrink: 0 }}
  >
    <circle
      cx="12"
      cy="12"
      r="9"
      fill="none"
      stroke={T.gray200}
      strokeWidth="2.5"
    />
    <path
      d="M12 3A9 9 0 0 1 21 12"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

const Avatar = ({ photoURL, name, size = 36 }) => {
  if (photoURL)
    return (
      <img
        src={photoURL}
        alt={name}
        referrerPolicy="no-referrer"
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
          border: "2px solid rgba(255,255,255,0.2)",
        }}
      />
    );
  const init = (name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const hue = ((name || "").charCodeAt(0) * 37) % 360;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `hsl(${hue},50%,88%)`,
        color: `hsl(${hue},50%,28%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: size * 0.34,
        flexShrink: 0,
      }}
    >
      {init}
    </div>
  );
};

const SectionLabel = ({ text }) => (
  <div
    style={{
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.8px",
      textTransform: "uppercase",
      color: T.green700,
      marginBottom: 8,
      marginTop: 4,
    }}
  >
    {text}
  </div>
);

const Toast = ({ message, type, visible }) => (
  <div
    style={{
      position: "fixed",
      bottom: 80,
      left: "50%",
      transform: `translateX(-50%) translateY(${visible ? 0 : 60}px)`,
      opacity: visible ? 1 : 0,
      background: type === "error" ? "#c0392b" : T.green700,
      color: T.white,
      padding: "11px 20px",
      borderRadius: 100,
      fontSize: 13,
      fontWeight: 500,
      display: "flex",
      alignItems: "center",
      gap: 8,
      boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
      zIndex: 9999,
      transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
      whiteSpace: "nowrap",
      pointerEvents: "none",
    }}
  >
    <Icon name={type === "error" ? "alert" : "check"} size={15} color="white" />
    {message}
  </div>
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPONENTE: NOTIFICACIÓN PREDICTIVA INTELIGENTE (MODAL)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const PredictiveNotification = ({ prediction, onAccept, onCancel }) => {
  if (!prediction) return null;
  const m = MOVE_META[prediction.tipo] || MOVE_META["Entrada"];

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(10, 61, 32, 0.4)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        padding: "1.5rem",
      }}
      className="fade-in"
    >
      <div
        style={{
          background: T.white,
          borderRadius: 24,
          padding: "2rem 1.75rem",
          width: "100%",
          maxWidth: 380,
          boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
          textAlign: "center",
          border: `1px solid ${T.gray200}`,
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: T.green50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.25rem",
            boxShadow: `0 8px 20px ${T.green100}`,
          }}
        >
          <Icon name="brain" size={30} color={T.green600} />
        </div>
        <h3
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 20,
            fontWeight: 800,
            color: T.gray800,
            marginBottom: 8,
          }}
        >
          ¿Ya vas a marcar tu {prediction.tipo}?
        </h3>
        <p
          style={{
            fontSize: 13,
            color: T.gray600,
            lineHeight: 1.5,
            marginBottom: "1.75rem",
          }}
        >
          Detectamos que usualmente registras tu{" "}
          <strong style={{ color: m.color }}>{prediction.tipo}</strong>{" "}
          alrededor de las {prediction.horaSugerida}. ¿Quieres registrarlo
          ahora?
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: 14,
              border: `1.5px solid ${T.gray300}`,
              background: T.white,
              color: T.gray600,
              fontSize: 14,
              fontWeight: 600,
              transition: "all 0.15s",
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onAccept}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: 14,
              border: "none",
              background: m.color,
              color: T.white,
              fontSize: 14,
              fontWeight: 600,
              boxShadow: `0 4px 12px ${m.color}40`,
              transition: "all 0.15s",
            }}
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MOLÉCULAS Y VISTAS EXISTENTES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const ClockDisplay = ({ lastStatus }) => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div
      style={{
        background: `linear-gradient(135deg,${T.green700},${T.green900})`,
        borderRadius: 20,
        padding: "1.5rem 1.75rem",
        marginBottom: "1.25rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 8px 32px rgba(10,61,32,0.25)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          right: -20,
          top: -20,
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.04)",
        }}
      />
      <div style={{ zIndex: 1 }}>
        <div
          style={{
            fontFamily: "'JetBrains Mono',monospace",
            fontSize: "clamp(28px,5vw,40px)",
            fontWeight: 700,
            color: T.white,
            letterSpacing: 2,
            lineHeight: 1,
          }}
        >
          {now.toLocaleTimeString("es-CO", { hour12: false })}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.6)",
            marginTop: 6,
            textTransform: "capitalize",
          }}
        >
          {now.toLocaleDateString("es-CO", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
      </div>
      <div
        style={{
          background: "rgba(255,255,255,0.12)",
          borderRadius: 12,
          padding: "10px 16px",
          textAlign: "center",
          zIndex: 1,
        }}
      >
        <div
          style={{
            fontSize: 10,
            color: "rgba(255,255,255,0.55)",
            textTransform: "uppercase",
            letterSpacing: "0.6px",
          }}
        >
          Estado
        </div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: T.white,
            marginTop: 3,
            maxWidth: 110,
            wordBreak: "break-word",
          }}
        >
          {lastStatus || "Sin registro"}
        </div>
      </div>
    </div>
  );
};

const MovementCard = ({ type, selected, onClick }) => {
  const m = MOVE_META[type] || MOVE_META["Entrada"];
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: selected ? m.bg : T.white,
        border: `2px solid ${selected ? m.color : T.gray200}`,
        borderRadius: 14,
        padding: "14px 8px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        boxShadow:
          hov || selected
            ? "0 4px 16px rgba(0,0,0,0.1)"
            : "0 1px 4px rgba(0,0,0,0.06)",
        transform: hov ? "translateY(-2px)" : "none",
        transition: "all 0.15s ease",
        outline: "none",
        width: "100%",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: m.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: selected ? `0 0 0 3px ${m.color}33` : "none",
        }}
      >
        <Icon name={m.icon} size={20} color={m.color} />
      </div>
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: selected ? m.color : T.gray600,
          textAlign: "center",
          lineHeight: 1.3,
        }}
      >
        {type}
      </span>
    </button>
  );
};

const RecordRow = ({ record }) => {
  const m = MOVE_META[record.tipo] || MOVE_META["Entrada"];
  return (
    <div
      className="fade-in"
      style={{
        background: T.white,
        borderRadius: 12,
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 8,
        borderLeft: `3px solid ${m.color}`,
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: "50%",
          background: m.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon name={m.icon} size={17} color={m.color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.gray800 }}>
          {record.tipo}
        </div>
        <div style={{ fontSize: 11, color: T.gray400, marginTop: 1 }}>
          {record.fecha} ·{" "}
          <span style={{ fontWeight: 500, color: T.gray600 }}>
            {record.nombre || record.usuario}
          </span>
        </div>
        {record.nota && (
          <div
            style={{
              fontSize: 11,
              color: T.gray400,
              marginTop: 2,
              fontStyle: "italic",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            "{record.nota}"
          </div>
        )}
      </div>
      <div
        style={{
          fontFamily: "'JetBrains Mono',monospace",
          fontSize: 12,
          fontWeight: 700,
          color: m.color,
          flexShrink: 0,
        }}
      >
        {fmtTime(record.timestamp)}
      </div>
    </div>
  );
};

const LoginPage = ({ onLogin, loading, error }) => (
  <div className="login-page">
    <div
      style={{
        background: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 28,
        padding: "3rem 2.5rem",
        width: "100%",
        maxWidth: 420,
        textAlign: "center",
        boxShadow: "0 32px 80px rgba(0,0,0,0.4)",
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 22,
          background: `linear-gradient(135deg,${T.green400},${T.green600})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 1.5rem",
          boxShadow: "0 12px 32px rgba(34,165,91,0.4)",
        }}
      >
        <Icon name="clock" size={34} color="white" />
      </div>
      <h1
        style={{
          fontFamily: "'Syne',sans-serif",
          fontSize: 26,
          fontWeight: 800,
          color: "white",
          marginBottom: 8,
          letterSpacing: "-0.5px",
        }}
      >
        Registro de Asistencia
      </h1>
      <p
        style={{
          fontSize: 14,
          color: "rgba(255,255,255,0.55)",
          marginBottom: "2.5rem",
          lineHeight: 1.5,
        }}
      >
        Inicia sesión con tu cuenta de Google para continuar
      </p>
      {error && (
        <div
          style={{
            background: "rgba(192,99,26,0.2)",
            border: "1px solid rgba(192,99,26,0.4)",
            borderRadius: 12,
            padding: "10px 14px",
            marginBottom: "1.25rem",
            fontSize: 13,
            color: "#ffb380",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Icon name="alert" size={15} color="#ffb380" />
          {error}
        </div>
      )}
      <button
        onClick={onLogin}
        disabled={loading}
        style={{
          width: "100%",
          background: loading ? "rgba(255,255,255,0.08)" : "white",
          border: "none",
          borderRadius: 14,
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          fontSize: 15,
          fontWeight: 600,
          color: loading ? "rgba(255,255,255,0.4)" : T.gray800,
          cursor: loading ? "not-allowed" : "pointer",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          transition: "all 0.2s",
        }}
      >
        {loading ? (
          <Spinner size={18} />
        ) : (
          <>
            <Icon name="google" size={20} />
            <span>Continuar con Google</span>
          </>
        )}
      </button>
    </div>
  </div>
);

const RegisterForm = ({ onRegister, lastStatus, user }) => {
  const [tipo, setTipo] = useState("Entrada");
  const [nota, setNota] = useState("");
  const [loading, setLoading] = useState(false);
  const mainMoves = [
    "Entrada",
    "Salida",
    "Almuerzo Entrada",
    "Almuerzo Salida",
  ];
  const breakMoves = ["Break Entrada", "Break Salida"];

  const handleSubmit = async () => {
    setLoading(true);
    await onRegister({ tipo, nota });
    setNota("");
    setLoading(false);
  };

  return (
    <div style={{ padding: "1.25rem" }}>
      <ClockDisplay lastStatus={lastStatus} />
      <div
        style={{
          background: T.white,
          border: `1.5px solid ${T.gray200}`,
          borderRadius: 12,
          padding: "10px 14px",
          marginBottom: "1.25rem",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Avatar photoURL={user.photoURL} name={user.displayName} size={36} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.gray800 }}>
            {user.displayName}
          </div>
          <div style={{ fontSize: 11, color: T.gray400 }}>{user.email}</div>
        </div>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: T.green500,
          }}
        />
      </div>
      <SectionLabel text="Movimientos principales" />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2,1fr)",
          gap: 10,
          marginBottom: "1.25rem",
        }}
      >
        {mainMoves.map((t) => (
          <MovementCard
            key={t}
            type={t}
            selected={tipo === t}
            onClick={() => setTipo(t)}
          />
        ))}
      </div>
      <SectionLabel text="Descanso" />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2,1fr)",
          gap: 10,
          marginBottom: "1.25rem",
        }}
      >
        {breakMoves.map((t) => (
          <MovementCard
            key={t}
            type={t}
            selected={tipo === t}
            onClick={() => setTipo(t)}
          />
        ))}
      </div>
      <div style={{ marginBottom: "1.25rem" }}>
        <SectionLabel text="Nota (opcional)" />
        <textarea
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          rows={2}
          placeholder="Agrega una observación..."
          style={{
            width: "100%",
            border: `1.5px solid ${T.gray200}`,
            borderRadius: 12,
            padding: "10px 14px",
            fontSize: 14,
            resize: "none",
            outline: "none",
          }}
        />
      </div>
      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          width: "100%",
          background: loading ? T.gray400 : T.green600,
          color: T.white,
          border: "none",
          borderRadius: 14,
          padding: "14px",
          fontSize: 15,
          fontWeight: 600,
        }}
      >
        {loading ? <Spinner size={18} color="white" /> : "Registrar Ahora"}
      </button>
    </div>
  );
};

const RecordsList = ({ records, loading, filter, onFilter }) => {
  const filters = [
    "Todos",
    "Entrada",
    "Salida",
    "Almuerzo Entrada",
    "Almuerzo Salida",
    "Break Entrada",
    "Break Salida",
  ];
  const shown =
    filter === "Todos" ? records : records.filter((r) => r.tipo === filter);
  return (
    <div style={{ padding: "1.25rem" }}>
      <SectionLabel text={`Historial — ${shown.length} registros`} />
      <div
        style={{
          display: "flex",
          gap: 6,
          overflowX: "auto",
          paddingBottom: 10,
          marginBottom: 16,
          scrollbarWidth: "none",
        }}
      >
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => onFilter(f)}
            style={{
              padding: "5px 12px",
              borderRadius: 100,
              whiteSpace: "nowrap",
              border: `1.5px solid ${filter === f ? T.green500 : T.gray200}`,
              background: filter === f ? T.green50 : T.white,
              color: filter === f ? T.green700 : T.gray600,
              fontSize: 11,
            }}
          >
            {f}
          </button>
        ))}
      </div>
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: T.gray400 }}>
          <Spinner />
          <span style={{ marginLeft: 8 }}>Cargando...</span>
        </div>
      ) : shown.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "3rem 1rem",
            color: T.gray400,
          }}
        >
          <p>No hay registros aún</p>
        </div>
      ) : (
        shown.map((r) => <RecordRow key={r.id} record={r} />)
      )}
    </div>
  );
};

const StatsDashboard = ({ records }) => {
  const hoyLocale = todayStr();
  const hoy = records.filter((r) => r.fecha === hoyLocale);
  const byUser = {};
  hoy.forEach((r) => {
    const nameKey = r.nombre || r.usuario;
    byUser[nameKey] = (byUser[nameKey] || 0) + 1;
  });

  const stats = [
    { label: "Total hoy", value: hoy.length, icon: "list", color: T.green600 },
    {
      label: "Usuarios",
      value: Object.keys(byUser).length,
      icon: "user",
      color: T.blue600,
    },
    {
      label: "Entradas",
      value: hoy.filter((r) => r.tipo === "Entrada").length,
      icon: "login",
      color: T.green500,
    },
    {
      label: "Salidas",
      value: hoy.filter((r) => r.tipo === "Salida").length,
      icon: "logout",
      color: T.coral600,
    },
  ];
  return (
    <div style={{ padding: "1.25rem" }}>
      <SectionLabel text="Resumen del día" />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2,1fr)",
          gap: 10,
          marginBottom: "1.5rem",
        }}
      >
        {stats.map((s) => (
          <div
            key={s.label}
            style={{ background: T.white, borderRadius: 14, padding: "14px" }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: s.color + "18",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 10,
              }}
            >
              <Icon name={s.icon} size={17} color={s.color} />
            </div>
            <div
              style={{
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: 26,
                fontWeight: 700,
                color: s.color,
              }}
            >
              {s.value}
            </div>
            <div style={{ fontSize: 11, color: T.gray400, marginTop: 4 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TABS = [
  { id: "registro", label: "Registrar", icon: "clock" },
  { id: "historial", label: "Historial", icon: "list" },
  { id: "stats", label: "Resumen", icon: "bar" },
];

const BottomNav = ({ tab, onTab }) => (
  <nav
    className="bottom-nav"
    style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      height: 64,
      background: T.white,
      borderTop: `1px solid ${T.gray200}`,
      display: "flex",
      zIndex: 9000,
    }}
  >
    {TABS.map((t) => {
      const act = tab === t.id;
      return (
        <button
          key={t.id}
          onClick={() => onTab(t.id)}
          style={{
            flex: 1,
            background: "none",
            border: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            color: act ? T.green600 : T.gray400,
          }}
        >
          <Icon name={t.icon} size={20} color={act ? T.green600 : T.gray400} />
          <span style={{ fontSize: 10, fontWeight: act ? 600 : 400 }}>
            {t.label}
          </span>
        </button>
      );
    })}
  </nav>
);

const Sidebar = ({ tab, onTab, onLogout, user }) => (
  <aside className="app-sidebar">
    <div style={{ padding: "1.5rem", borderBottom: `1px solid ${T.gray100}` }}>
      <CustomLogo />
    </div>
    <div
      style={{
        padding: "1rem",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {TABS.map((t) => {
        const act = tab === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onTab(t.id)}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: 12,
              border: "none",
              background: act ? T.green50 : "none",
              color: act ? T.green700 : T.gray700,
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 14,
              fontWeight: act ? 600 : 500,
              textAlign: "left",
            }}
          >
            <Icon
              name={t.icon}
              size={18}
              color={act ? T.green700 : T.gray600}
            />
            <span>{t.label}</span>
          </button>
        );
      })}
    </div>
    <div
      style={{
        padding: "1rem",
        borderTop: `1px solid ${T.gray100}`,
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <Avatar photoURL={user.photoURL} name={user.displayName} size={32} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: T.gray800,
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
        >
          {user.displayName}
        </div>
      </div>
      <button
        onClick={onLogout}
        style={{
          background: "none",
          border: "none",
          padding: 6,
          color: T.gray400,
          borderRadius: 8,
          display: "flex",
        }}
      >
        <Icon name="signout" size={18} />
      </button>
    </div>
  </aside>
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPONENTE PRINCIPAL (APP)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("registro");
  const [records, setRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [filter, setFilter] = useState("Todos");
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    setRecordsLoading(true);
    const qRes = query(
      collection(db, "asistencias"),
      orderBy("timestamp", "desc"),
    );
    const unsub = onSnapshot(
      qRes,
      (snap) => {
        const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setRecords(list);
        setRecordsLoading(false);
      },
      (err) => {
        console.error(err);
        setRecordsLoading(false);
      },
    );
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user || records.length === 0) return;

    const userRecords = records.filter(
      (r) => (r.nombre || r.usuario) === user.displayName,
    );
    if (userRecords.length < 3) return;

    const conteos = {
      Entrada: [],
      Salida: [],
      "Almuerzo Entrada": [],
      "Almuerzo Salida": [],
    };
    userRecords.forEach((r) => {
      if (conteos[r.tipo] && r.timestamp) {
        const date = r.timestamp.toDate
          ? r.timestamp.toDate()
          : new Date(r.timestamp);
        const mins = date.getHours() * 60 + date.getMinutes();
        conteos[r.tipo].push(mins);
      }
    });

    const ahora = new Date();
    const minsAhora = ahora.getHours() * 60 + ahora.getMinutes();
    const hoyStrLocal = todayStr();

    const yaMarcadoHoy = (tipo) =>
      records.some(
        (r) =>
          r.fecha === hoyStrLocal &&
          (r.nombre || r.usuario) === user.displayName &&
          r.tipo === tipo,
      );

    let sugerencia = null;
    for (const [tipo, listaMins] of Object.entries(conteos)) {
      if (listaMins.length >= 2 && !yaMarcadoHoy(tipo)) {
        const promedioMins =
          listaMins.reduce((a, b) => a + b, 0) / listaMins.length;
        if (Math.abs(minsAhora - promedioMins) <= 45) {
          const h = String(Math.floor(promedioMins / 60)).padStart(2, "0");
          const m = String(Math.floor(promedioMins % 60)).padStart(2, "0");
          sugerencia = { tipo, horaSugerida: `${h}:${m}` };
          break;
        }
      }
    }
    setPrediction(sugerencia);
  }, [records, user]);

  const handleLogin = async () => {
    setError(null);
    setAuthLoading(true);
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error(err);
      setError("Error al iniciar sesión con la ventana flotante.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setTab("registro");
  };

  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000);
  };

  const handleRegister = async ({ tipo, nota }) => {
    if (!user) return;
    try {
      await addDoc(collection(db, "asistencias"), {
        tipo,
        nota: nota.trim(),
        fecha: todayStr(),
        usuario: user.email,
        nombre: user.displayName,
        timestamp: serverTimestamp(),
      });
      showToast(`¡${tipo} registrada con éxito!`);
      setPrediction(null);
    } catch (err) {
      console.error(err);
      showToast("Error al guardar en la base de datos", "error");
    }
  };

  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: T.green50,
        }}
      >
        <Spinner size={32} />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <GlobalStyle />
        <LoginPage onLogin={handleLogin} loading={authLoading} error={error} />
      </>
    );
  }

  const userRecords = records.filter(
    (r) => (r.nombre || r.usuario) === user.displayName,
  );
  const lastStatus = userRecords[0]?.tipo || "Sin registro";

  return (
    <>
      <GlobalStyle />
      <div
        className="app-shell"
        style={{ display: "flex", flexDirection: "column" }}
      >
        <Sidebar tab={tab} onTab={setTab} onLogout={handleLogout} user={user} />

        <main className="app-main">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "1.25rem 1.25rem 0 1.25rem",
            }}
            className="bottom-nav"
          >
            <CustomLogo />
            <button
              onClick={handleLogout}
              style={{
                background: "none",
                border: "none",
                color: T.gray400,
                display: "flex",
                padding: 4,
              }}
            >
              <Icon name="signout" size={20} />
            </button>
          </div>

          {tab === "registro" && (
            <RegisterForm
              onRegister={handleRegister}
              lastStatus={lastStatus}
              user={user}
            />
          )}
          {tab === "historial" && (
            <RecordsList
              records={records}
              loading={recordsLoading}
              filter={filter}
              onFilter={setFilter}
            />
          )}
          {tab === "stats" && <StatsDashboard records={records} />}
        </main>

        <BottomNav tab={tab} onTab={setTab} />
        <Toast
          message={toast.message}
          type={toast.type}
          visible={toast.visible}
        />

        <PredictiveNotification
          prediction={prediction}
          onAccept={() =>
            handleRegister({
              tipo: prediction.tipo,
              nota: "Marcación predictiva inteligente",
            })
          }
          onCancel={() => setPrediction(null)}
        />
      </div>
    </>
  );
}
