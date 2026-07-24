import { useState } from "react";
import { Plus, Check, X } from "lucide-react";
import { COLORS } from "../theme";
import { fmt, uid, todayStr } from "../lid/format";
import { getS } from "../lib/engine";
import { Card, FIn, FSel, Btn, DT, AM, PH } from "../components/ui";

export default function AvancesPage({
  boutiques,
  products,
  eng,
  avances,
  setAvances,
  onEvent,
}) {
  const { stock } = eng;
  const [tab, setTab] = useState("pending");
  const [form, setForm] = useState(null);
  const [msg, setMsg] = useState(null);

  const save = () => {
    if (
      !form.boutiqueId ||
      !form.productId ||
      !form.totalSalePrice ||
      !form.advancePaid
    )
      return setMsg({ t: "error", m: "Champs requis manquants" });
    setAvances((av) => [
      ...av,
      {
        id: uid(),
        date: todayStr(),
        boutiqueId: form.boutiqueId,
        productId: form.productId,
        quantity: parseInt(form.quantity) || 1,
        totalSalePrice: parseFloat(form.totalSalePrice),
        advancePaid: parseFloat(form.advancePaid),
        customerName: form.customerName || "",
        status: "pending",
        completedDate: null,
        saleEventId: null,
      },
    ]);
    setForm(null);
    setMsg({ t: "success", m: "Avance enregistrer!" });
    setTimeout(() => setMsg(null), 3000);
  };

  const complete = (av) => {
    const s = getS(stock, av.boutiqueId, av.productId);
    if (s.qty < av.quantity) {
      setMsg({ t: "error", m: `Stock insuffisant! Dispo: ${s.qty}` });
      return;
    }
    const sid = uid();
    onEvent({
      id: sid,
      type: "sale",
      date: todayStr(),
      boutiqueId: av.boutiqueId,
      productId: av.productId,
      quantity: av.quantity,
      salePrice: av.totalSalePrice,
    });
    setAvances((avs) =>
      avs.map((a) =>
        a.id === av.id
          ? {
              ...a,
              status: "completed",
              completedDate: todayStr(),
              saleEventId: sid,
            }
          : a,
      ),
    );
    setMsg({ t: "success", m: "Vente complete!" });
    setTimeout(() => setMsg(null), 3000);
  };

  const pending = avances.filter((a) => a.status === "pending").length;

  return (
    <div>
      <PH
        title="Avances Clients"
        sub="Depots partiels — completez la vente au paiement final"
        right={[
          <Btn
            key="a"
            onClick={() =>
              setForm({
                boutiqueId: "",
                productId: "",
                quantity: "1",
                totalSalePrice: "",
                advancePaid: "",
                customerName: "",
              })
            }
          >
            <Plus size={14} />
            Nouvelle avance
          </Btn>,
        ]}
      />

      {form && (
        <Card style={{ marginBottom: 18, border: `1px solid ${COLORS.teal}` }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>
            Nouvelle avance
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13 }}
          >
            <FSel
              label="Boutique"
              value={form.boutiqueId}
              onChange={(e) => setForm({ ...form, boutiqueId: e.target.value })}
              options={boutiques
                .filter((b) => b.type === "boutique")
                .map((b) => ({ v: b.id, l: `${b.name}` }))}
            />
            <FSel
              label="Produit"
              value={form.productId}
              onChange={(e) => setForm({ ...form, productId: e.target.value })}
              options={products
                .filter((p) => !p.archived)
                .map((p) => ({ v: p.pid, l: `${p.name} — ${p.brand}` }))}
            />
            <FIn
              label="Quantite"
              type="number"
              min="1"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            />
            <FIn
              label="Prix total convenu (F)"
              type="number"
              value={form.totalSalePrice}
              onChange={(e) =>
                setForm({ ...form, totalSalePrice: e.target.value })
              }
            />
            <FIn
              label="Montant avance recu (F)"
              type="number"
              value={form.advancePaid}
              onChange={(e) =>
                setForm({ ...form, advancePaid: e.target.value })
              }
            />
            <FIn
              label="Nom client (optionnel)"
              value={form.customerName}
              onChange={(e) =>
                setForm({ ...form, customerName: e.target.value })
              }
            />
          </div>
          {form.totalSalePrice && form.advancePaid && (
            <div
              style={{
                marginTop: 10,
                padding: "10px",
                background: "#e8f4ff",
                borderRadius: 8,
                fontSize: 13,
                color: COLORS.blue,
              }}
            >
              Reste:{" "}
              <strong>
                {fmt(
                  parseFloat(form.totalSalePrice) -
                    parseFloat(form.advancePaid),
                )}{" "}
                F
              </strong>
            </div>
          )}
          <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
            <Btn onClick={save}>
              <Check size={14} />
              Enregistrer
            </Btn>
            <Btn variant="light" onClick={() => setForm(null)}>
              <X size={14} />
              Annuler
            </Btn>
          </div>
          {msg && <AM type={msg.t}>{msg.m}</AM>}
        </Card>
      )}
      {!form && msg && <AM type={msg.t}>{msg.m}</AM>}

      <Card style={{ marginTop: form ? 0 : 8 }}>
        <div
          style={{
            display: "flex",
            gap: 4,
            marginBottom: 16,
            background: COLORS.light,
            padding: 4,
            borderRadius: 10,
            width: "fit-content",
          }}
        >
          {["pending", "completed", "cancelled"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "7px 14px",
                borderRadius: 7,
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: tab === t ? 600 : 400,
                background: tab === t ? COLORS.navy : "transparent",
                color: tab === t ? "white" : COLORS.muted,
              }}
            >
              {t === "pending"
                ? `En attente (${pending})`
                : t === "completed"
                  ? "Complétées"
                  : "Annulées"}
            </button>
          ))}
        </div>

        <DT
          empty="Aucune avance"
          cols={[
            { l: "Date", k: "date" },
            {
              l: "Boutique",
              r: (r) =>
                boutiques.find((b) => b.id === r.boutiqueId)?.name || "",
            },
            {
              l: "Produit",
              r: (r) => products.find((p) => p.pid === r.productId)?.name || "",
            },
            {
              l: "Prix total",
              a: "right",
              r: (r) => fmt(r.totalSalePrice) + " F",
            },
            {
              l: "Avance",
              a: "right",
              r: (r) => (
                <span style={{ color: COLORS.teal }}>
                  {fmt(r.advancePaid)} F
                </span>
              ),
            },
            {
              l: "Reste",
              a: "right",
              r: (r) => (
                <span
                  style={{
                    color:
                      r.status === "pending" ? COLORS.orange : COLORS.muted,
                    fontWeight: r.status === "pending" ? 600 : 400,
                  }}
                >
                  {fmt(r.totalSalePrice - r.advancePaid)} F
                </span>
              ),
            },
            { l: "Client", r: (r) => r.customerName || "—" },
            {
              l: "",
              r: (r) =>
                r.status === "pending" ? (
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() => complete(r)}
                      style={{
                        padding: "4px 10px",
                        borderRadius: 6,
                        border: "none",
                        background: `linear-gradient(135deg, ${COLORS.teal}, #0d9b78)`,
                        color: "white",
                        cursor: "pointer",
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      ✓ Completer
                    </button>
                    <button
                      onClick={() =>
                        setAvances((avs) =>
                          avs.map((a) =>
                            a.id === r.id ? { ...a, status: "cancelled" } : a,
                          ),
                        )
                      }
                      style={{
                        padding: "4px 10px",
                        borderRadius: 6,
                        border: `1px solid ${COLORS.border}`,
                        background: "white",
                        cursor: "pointer",
                        fontSize: 11,
                        color: COLORS.muted,
                      }}
                    >
                      Annuler
                    </button>
                  </div>
                ) : r.status === "completed" ? (
                  <span style={{ fontSize: 11, color: COLORS.teal }}>
                    ✓ {r.completedDate}
                  </span>
                ) : (
                  <span style={{ fontSize: 11, color: COLORS.muted }}>
                    Annulee
                  </span>
                ),
            },
          ]}
          rows={avances.filter((a) => a.status === tab)}
        />
      </Card>
    </div>
  );
}
