import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  ArrowRightLeft,
  Store,
  TrendingUp,
  TrendingDown,
  FileText,
  CreditCard,
  Sparkles,
} from "lucide-react";
import { C, BRAND } from "../theme";
import { MargoMark } from "./MargoLogo";
import { fmt } from "../lib/format";

export const NAV = [
  { id: "dashboard", label: "Tableau de bord", Icon: LayoutDashboard },
  { id: "vente", label: "Saisie des Ventes", Icon: ShoppingCart },
  { id: "avances", label: "Avances Clients", Icon: CreditCard },
  { id: "appro", label: "Approvisionnement", Icon: Package },
  { id: "transfert", label: "Transfert", Icon: ArrowRightLeft },
  { id: "boutiques", label: "Boutiques & Stock", Icon: Store },
  { id: "marges", label: "Marges Reelles", Icon: TrendingUp },
  { id: "virtuelles", label: "Marges Virtuelles", Icon: Sparkles },
  { id: "rapport", label: "Rapports", Icon: FileText },
];

export function Sidebar({ page, onNav, col, badge }) {
  return (
    <div
      style={{
        width: col ? 58 : 225,
        background: "linear-gradient(180deg,#121f56 0%,#0b153e 100%)",
        boxShadow: "inset -1px 0 0 rgba(255,255,255,.06)",
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        transition: "width .2s",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: col ? "14px 9px" : "14px 16px",
          borderBottom: "1px solid rgba(255,255,255,.09)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 4,
        }}
      >
        <div style={{ flexShrink: 0 }}>
          <MargoMark size={36} />
        </div>
        {!col && (
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 13,
                color: "white",
                letterSpacing: 0.5,
              }}
            >
              {BRAND.product.toUpperCase()}
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,.45)" }}>
              {BRAND.client}
            </div>
          </div>
        )}
      </div>
      {NAV.map(({ id, label, Icon }) => (
        <button
          key={id}
          className="m-nav"
          onClick={() => onNav(id)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 11,
            padding: col ? "11px 0" : "10px 16px",
            justifyContent: col ? "center" : "flex-start",
            background: page === id ? "rgba(234,114,14,.16)" : "transparent",
            borderLeft: `3px solid ${page === id ? C.orange : "transparent"}`,
            border: "none",
            cursor: "pointer",
            width: "100%",
            color: page === id ? "white" : "rgba(255,255,255,.55)",
            fontSize: 12,
            transition: "all .15s",
            position: "relative",
          }}
        >
          <Icon size={17} style={{ flexShrink: 0 }} />
          {!col && <span>{label}</span>}
          {id === "avances" && badge > 0 && (
            <span
              style={{
                marginLeft: "auto",
                background: C.orange,
                color: "white",
                borderRadius: 10,
                fontSize: 10,
                padding: "1px 6px",
                fontWeight: 700,
              }}
            >
              {badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export function Card({ children, style = {} }) {
  return (
    <div
      className="m-card"
      style={{
        background: "rgba(255,255,255,.78)",
        backdropFilter: "blur(14px) saturate(1.35)",
        WebkitBackdropFilter: "blur(14px) saturate(1.35)",
        borderRadius: 16,
        padding: 20,
        boxShadow: "0 4px 20px rgba(16,24,64,.06)",
        border: "1px solid rgba(255,255,255,.7)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Stat({ label, value, sub, Icon, color }) {
  return (
    <div
      className="m-card"
      style={{
        background: "rgba(255,255,255,.78)",
        backdropFilter: "blur(14px) saturate(1.35)",
        WebkitBackdropFilter: "blur(14px) saturate(1.35)",
        borderRadius: 16,
        padding: 18,
        boxShadow: "0 4px 20px rgba(16,24,64,.06)",
        border: "1px solid rgba(255,255,255,.7)",
        display: "flex",
        gap: 14,
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 13,
          background: `${color}16`,
          border: `1px solid ${color}22`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={22} color={color} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11, color: C.muted, marginBottom: 3 }}>
          {label}
        </div>
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: C.text,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {value}
        </div>
        {sub && (
          <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

export function FIn({ label, err, ...p }) {
  return (
    <div>
      {label && (
        <label
          style={{
            fontSize: 12,
            color: C.muted,
            marginBottom: 4,
            display: "block",
          }}
        >
          {label}
        </label>
      )}
      <input
        style={{
          width: "100%",
          padding: "9px 12px",
          borderRadius: 8,
          border: `1px solid ${err ? C.red : C.border}`,
          fontSize: 13,
          outline: "none",
          boxSizing: "border-box",
          fontFamily: "inherit",
          color: C.text,
        }}
        {...p}
      />
      {err && (
        <div style={{ fontSize: 11, color: C.red, marginTop: 3 }}>{err}</div>
      )}
    </div>
  );
}

export function FSel({ label, options = [], ...p }) {
  return (
    <div>
      {label && (
        <label
          style={{
            fontSize: 12,
            color: C.muted,
            marginBottom: 4,
            display: "block",
          }}
        >
          {label}
        </label>
      )}
      <select
        style={{
          width: "100%",
          padding: "9px 12px",
          borderRadius: 8,
          border: `1px solid ${C.border}`,
          fontSize: 13,
          outline: "none",
          boxSizing: "border-box",
          fontFamily: "inherit",
          color: C.text,
          background: "white",
        }}
        {...p}
      >
        <option value="">— Choisir —</option>
        {options.map((o) => (
          <option key={o.v} value={o.v}>
            {o.l}
          </option>
        ))}
      </select>
    </div>
  );
}

export function Btn({ children, variant = "primary", style = {}, ...p }) {
  const bg =
    variant === "navy"
      ? `linear-gradient(135deg,${C.navy},#2a3fb8)`
      : variant === "orange"
        ? `linear-gradient(135deg,${C.orange},#d05f04)`
        : variant === "danger"
          ? `linear-gradient(135deg,${C.red},#c33520)`
          : variant === "light"
            ? "rgba(255,255,255,.85)"
            : variant === "purple"
              ? `linear-gradient(135deg,${C.purple},#5f27cd)`
              : `linear-gradient(135deg,${C.teal},#0c8f6e)`;
  return (
    <button
      className="m-btn"
      style={{
        padding: "9px 18px",
        borderRadius: 10,
        border: variant === "light" ? `1px solid ${C.border}` : "none",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 600,
        fontFamily: "inherit",
        background: bg,
        color: variant === "light" ? C.text : "white",
        display: "flex",
        alignItems: "center",
        gap: 5,
        ...style,
      }}
      {...p}
    >
      {children}
    </button>
  );
}

export function DT({ cols, rows, empty = "Aucune donnee" }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
      >
        <thead>
          <tr>
            {cols.map((c, i) => (
              <th
                key={i}
                style={{
                  padding: "9px 12px",
                  textAlign: c.a || "left",
                  fontWeight: 600,
                  color: C.muted,
                  fontSize: 12,
                  borderBottom: `1px solid ${C.border}`,
                  background: "rgba(22,39,155,.05)",
                  whiteSpace: "nowrap",
                }}
              >
                {c.l}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={cols.length}
                style={{ padding: 32, textAlign: "center", color: C.muted }}
              >
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((r, i) => (
              <tr
                key={i}
                className="m-row"
                style={{
                  borderBottom: `1px solid ${C.border}`,
                  background:
                    i % 2 === 0 ? "transparent" : "rgba(22,39,155,.02)",
                }}
              >
                {cols.map((c, j) => (
                  <td
                    key={j}
                    style={{ padding: "9px 12px", textAlign: c.a || "left" }}
                  >
                    {c.r ? c.r(r) : r[c.k]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function AM({ type, children }) {
  const s =
    {
      success: { bg: "#e8f8f4", c: C.teal },
      error: { bg: "#fdf2f0", c: C.red },
      info: { bg: "#e8f4ff", c: C.blue },
      warning: { bg: "#fef9e7", c: C.orange },
      virtual: { bg: "#f3e8ff", c: C.purple },
    }[type] || {};
  return (
    <div
      style={{
        padding: "10px 14px",
        borderRadius: 8,
        background: s.bg,
        color: s.c,
        fontSize: 13,
        marginTop: 12,
      }}
    >
      {children}
    </div>
  );
}

export function PH({ title, sub, right }) {
  return (
    <div
      style={{
        marginBottom: 22,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      <div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: C.text,
            letterSpacing: "-0.4px",
          }}
        >
          {title}
        </div>
        {sub && (
          <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>
            {sub}
          </div>
        )}
      </div>
      {right && (
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {right}
        </div>
      )}
    </div>
  );
}

// Shown in Approvisionnement before confirming a batch at a different price:
// previews the virtual gain/loss the new price will generate
export function VirtualPreview({
  currentQty,
  currentPrice,
  newPrice,
  newQty,
  productName,
}) {
  if (
    !currentQty ||
    !currentPrice ||
    !newPrice ||
    Math.round(currentPrice) === Math.round(newPrice)
  )
    return null;
  const delta = currentQty * (newPrice - currentPrice);
  const isGain = delta > 0;
  const totalNew = (currentQty + (newQty || 0)) * newPrice;
  return (
    <div
      style={{
        marginTop: 12,
        borderRadius: 10,
        overflow: "hidden",
        border: `2px solid ${isGain ? C.teal : C.red}`,
      }}
    >
      <div
        style={{
          background: isGain ? C.teal : C.red,
          padding: "8px 14px",
          color: "white",
          fontSize: 12,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {isGain ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        {isGain ? "MARGE VIRTUELLE GÉNÉRÉE" : "PERTE VIRTUELLE GÉNÉRÉE"}
      </div>
      <div style={{ padding: 14, background: isGain ? "#e8f8f4" : "fdf2f0" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            gap: 12,
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              textAlign: "center",
              padding: 10,
              background: "white",
              borderRadius: 8,
            }}
          >
            <div style={{ fontSize: 11, color: C.muted }}>Avant</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>
              {currentQty} unités
            </div>
            <div style={{ fontSize: 12, color: C.muted }}>
              @ {fmt(currentPrice)} F
            </div>
          </div>
          <div
            style={{
              textAlign: "center",
              fontSize: 18,
              color: isGain ? C.teal : C.red,
              fontWeight: 700,
            }}
          >
            →
          </div>
          <div
            style={{
              textAlign: "center",
              padding: 10,
              background: "white",
              borderRadius: 8,
            }}
          >
            <div style={{ fontSize: 11, color: C.muted }}>Après</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>
              {currentQty + (newQty || 0)} unités
            </div>
            <div style={{ fontSize: 12, color: C.muted }}>
              @ {fmt(newPrice)} F
            </div>
          </div>
        </div>
        <div
          style={{ background: "white", borderRadius: 8, padding: "10px 14px" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 13,
              marginBottom: 6,
            }}
          >
            <span style={{ color: C.muted }}>
              {currentQty} unités × ({fmt(newPrice)} - {fmt(currentPrice)}) F
            </span>
            <span
              style={{
                fontWeight: 700,
                fontSize: 16,
                color: isGain ? C.teal : C.red,
              }}
            >
              {isGain ? "+" : ""}
              {fmt(delta)} F
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 12,
              color: C.muted,
            }}
          >
            <span>Nouvelle valeur du stock</span>
            <span style={{ fontWeight: 600, color: C.navy }}>
              {fmt(totalNew)} F
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
