import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  ShoppingCart,
  TrendingUp,
  Warehouse,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { COLORS } from "../theme";
import { fmtS, fmt, todayStr } from "../lib/format";
import { totalCostVal } from "../lib/engine";
import { Card, Stat, DT, AM, PH } from "../components/ui";

export default function DashPage({ events, boutiques, products, eng }) {
  const { stock, saleResults, virtualLog, anomalies } = eng;
  const td = events.filter(
    (e) =>
      e.date === todayStr() &&
      e.type === "sale" &&
      !saleResults[e.id]?.cancelled,
  );
  const tv = td.reduce((s, e) => s + e.quantity * e.salePrice, 0);
  const tm = td.reduce((s, e) => s + (saleResults[e.id]?.totalMargin || 0), 0);
  const allIds = boutiques.map((b) => b.id);
  const totalCV = totalCostVal(stock, allIds);
  const netVirtual = virtualLog.reduce((s, v) => s + v.amount, 0);
  const bp = boutiques
    .filter((b) => b.type === "boutique")
    .map((b) => {
      const bS = td.filter((s) => s.boutiqueId === b.id);
      const v = bS.reduce((t, s) => t + s.quantity * s.salePrice, 0);
      const m = bS.reduce(
        (t, s) => t + (saleResults[s.id]?.totalMargin || 0),
        0,
      );
      return {
        ...b,
        v,
        m,
        nb: bS.length,
        t: v > 0 ? Math.round((m / v) * 100) : 0,
      };
    });
  const LOW_SEUIL = 1;
  const stockAlerts = [];
  boutiques.forEach((b) => {
    const sb = stock[b.id] || {};
    Object.entries(sb).forEach(([pid, st]) => {
      if (st.qty <= LOW_SEUIL) {
        const p = products.find((x) => x.pid === pid);
        if (p && !p.archived)
          stockAlerts.push({
            bName: b.name,
            pName: `${p.brand} ${p.name}`,
            qty: st.qty,
          });
      }
    });
  });
  stockAlerts.sort((a, b) => a.qty - b.qty);
  const nbRupture = stockAlerts.filter((a) => a.qty === 0).length;
  const cd = bp
    .filter((b) => b.v > 0)
    .sort((a, b) => b.v - a.v)
    .slice(0, 8)
    .map((b) => ({
      name: b.name.length > 12 ? b.name.slice(0, 12) + "..." : b.name,
      Ventes: b.v,
      Marges: b.m,
    }));
  return (
    <div>
      <PH
        title="Tableau de bord"
        sub={`Journee du ${new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`}
      />
      {anomalies.length > 0 && (
        <AM type="warning">
          ⚠ {anomalies.length} survente(s) détectée(s) — des ventes dépassaient
          le stock disponible. Vérifiez les saisies.
        </AM>
      )}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(185px,1fr))",
          gap: 14,
          marginBottom: 22,
          marginTop: anomalies.length > 0 ? 14 : 0,
        }}
      >
        <Stat
          label="Ventes du jour"
          value={`${fmt(tv)} F`}
          sub={`${td.length} transactions`}
          Icon={ShoppingCart}
          color={COLORS.teal}
        />
        <Stat
          label="Marges du jour"
          value={`${fmt(tm)} F`}
          sub={
            tv > 0 ? `Taux: ${Math.round((tm / tv) * 100)}%` : "aucune vente"
          }
          Icon={TrendingUp}
          color={COLORS.navy}
        />
        <Stat
          label="Fond total (PA)"
          value={`${fmt(totalCV)} F`}
          sub="prix d'achat unifie"
          Icon={Warehouse}
          color={COLORS.blue}
        />
        <Stat
          label="Position virtuelle"
          value={fmtS(netVirtual)}
          sub={netVirtual >= 0 ? "marges latentes" : "pertes latentes"}
          Icon={Sparkles}
          color={netVirtual >= 0 ? COLORS.teal : COLORS.red}
        />
      </div>
      {stockAlerts.length > 0 && (
        <Card
          style={{ marginBottom: 22, border: `1px solid ${COLORS.orange}55` }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 10,
              color: COLORS.orange,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <AlertTriangle size={16} />
            Alertes stock — {nbRupture} rupture(s) et{" "}
            {stockAlerts.length - nbRupture} article(s) en stock faible (≤{" "}
            {LOW_SEUIL})
          </div>
          <DT
            cols={[
              { l: "Boutique", k: "bName" },
              { l: "Article", k: "pName" },
              {
                l: "Restant",
                a: "center",
                r: (r) => (
                  <span
                    style={{
                      padding: "2px 10px",
                      borderRadius: 12,
                      background: r.qty === 0 ? "#fdf2f0" : "#fef9e7",
                      color: r.qty === 0 ? COLORS.red : COLORS.orange,
                      fontWeight: 700,
                      fontSize: 11,
                    }}
                  >
                    {r.qty === 0 ? "RUPTURE" : r.qty}
                  </span>
                ),
              },
            ]}
            rows={stockAlerts.slice(0, 15)}
          />
          {stockAlerts.length > 15 && (
            <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 8 }}>
              … et {stockAlerts.length - 15} autres articles concernés
            </div>
          )}
        </Card>
      )}
      {cd.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "3fr 2fr",
            gap: 14,
            marginBottom: 22,
          }}
        >
          <Card>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>
              Ventes & Marges — Aujourd'hui
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={cd} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => `${fmt(v)} F`} />
                <Bar
                  dataKey="Ventes"
                  fill={COLORS.navy}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="Marges"
                  fill={COLORS.teal}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
              Top boutiques
            </div>
            {[...bp]
              .sort((a, b) => b.v - a.v)
              .slice(0, 7)
              .map((b) => (
                <div
                  key={b.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "7px 0",
                    borderBottom: `1px solid ${COLORS.border}`,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500 }}>
                      {b.name}
                    </div>
                    <div style={{ fontSize: 11, color: COLORS.muted }}>
                      {b.responsible}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: COLORS.navy,
                      }}
                    >
                      {fmt(b.v)} F
                    </div>
                    <div style={{ fontSize: 11, color: COLORS.teal }}>
                      {b.t}% marge
                    </div>
                  </div>
                </div>
              ))}
          </Card>
        </div>
      ) : (
        <div
          style={{
            padding: 40,
            textAlign: "center",
            background: COLORS.card,
            borderRadius: 12,
            border: `1px solid ${COLORS.border}`,
            marginBottom: 22,
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 10 }}>📊</div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: COLORS.text,
              marginBottom: 6,
            }}
          >
            Aucune vente enregistree aujourd'hui
          </div>
          <div style={{ fontSize: 13, color: COLORS.muted }}>
            Utilisez la "Saisie des Ventes" pour enregistrer les ventes du jour
            par boutique
          </div>
        </div>
      )}
      <Card>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>
          Performance du jour
        </div>
        <DT
          cols={[
            { l: "Boutique", k: "name" },
            { l: "Responsable", k: "responsible" },
            {
              l: "Ventes (F)",
              a: "right",
              r: (r) => <span style={{ fontWeight: 500 }}>{fmt(r.v)}</span>,
            },
            {
              l: "Marges (F)",
              a: "right",
              r: (r) => (
                <span style={{ color: r.m > 0 ? COLORS.teal : COLORS.muted }}>
                  {fmt(r.m)}
                </span>
              ),
            },
            {
              l: "Taux",
              a: "center",
              r: (r) =>
                r.t > 0 ? (
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: 12,
                      background: r.t >= 15 ? "#e8f8f4" : "#fdf2f0",
                      color: r.t >= 15 ? COLORS.teal : COLORS.red,
                      fontSize: 11,
                    }}
                  >
                    {r.t}%
                  </span>
                ) : (
                  "—"
                ),
            },
            { l: "Tx", a: "center", k: "nb" },
          ]}
          rows={bp}
        />
      </Card>
    </div>
  );
}
