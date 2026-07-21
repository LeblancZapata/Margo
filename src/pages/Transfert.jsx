import { useState } from "react";
import { ArrowRightLeft } from "lucide-react";
import { COLORS } from "../theme";
import { fmt, uid, todayStr } from "../lib/format";
import { getS } from "../lib/format";
import { Card, FIn, FSel, Btn, AM, PH } from "../components/ui";

export default function TransfertPage({ boutiques, products, eng, onEvent }) {
  const { stock } = eng;
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [pId, setPId] = useState("");
  const [qty, setQty] = useState("1");
  const [msg, setMsg] = useState(null);

  const srcS = getS(stock, from, pId);
  const dstS = getS(stock, to, pId);
  const prod = products.find((p) => p.pid === pId);
  const allB = [
    ...boutiques.filter((b) => b.type === "boutique"),
    boutiques.find((b) => b.type === "warehouse"),
  ].filter(Boolean);

  const save = () => {
    if (!from || !to || !pId || !qty)
      return setMsg({ t: "error", m: "Tous les champs requis" });
    if (from === to)
      return setMsg({ t: "error", m: "Source et destination identiques" });
    if (srcS.qty < parseInt(qty))
      return setMsg({
        t: "error",
        m: `Stock insuffisant! Dispo: ${srcS.qty}`,
      });
    onEvent({
      id: uid(),
      type: "transfer",
      date: todayStr(),
      from,
      to,
      productId: pId,
      quantity: parseInt(qty),
    });
    setMsg({ t: "success", m: "Transfert effectue!" });
    setPId("");
    setQty("1");
    setTimeout(() => setMsg(null), 3000);
  };

  return (
    <div>
      <PH
        title="Transfert de Stock"
        sub="Le prix d'achat est national : un transfert déplace les unités sans jamais créer d'ajustement"
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          maxWidth: 1000,
        }}
      >
        <Card>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
            Nouveau transfert
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
            <FSel
              label="Source"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                setPId("");
              }}
              options={allB.map((b) => ({
                v: b.id,
                l: b.type === "warehouse" ? `🏭 ${b.name}` : b.name,
              }))}
            />
            <FSel
              label="Destination"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              options={allB
                .filter((b) => b.id !== from)
                .map((b) => ({
                  v: b.id,
                  l: b.type === "warehouse" ? `🏭 ${b.name}` : b.name,
                }))}
            />
            <FSel
              label="Produit"
              value={pId}
              onChange={(e) => setPId(e.target.value)}
              options={products
                .filter(
                  (p) =>
                    !p.archived && (!from || getS(stock, from, p.pid).qty > 0),
                )
                .map((p) => ({
                  v: p.pid,
                  l: `${p.name} — ${p.brand} (${
                    from ? getS(stock, from, p.pid).qty : "?"
                  } dispo)`,
                }))}
            />
            {from && pId && (
              <div
                style={{
                  padding: "8px 12px",
                  background: "#e8f8f4",
                  borderRadius: 8,
                  fontSize: 12,
                  color: COLORS.teal,
                }}
              >
                Source: <strong>{srcS.qty} unites</strong> @{" "}
                {fmt(srcS.costPrice)} F
              </div>
            )}
            <FIn
              label="Quantite"
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
          </div>
          <div style={{ marginTop: 18 }}>
            <Btn onClick={save}>
              <ArrowRightLeft size={14} />
              Confirmer
            </Btn>
          </div>
          {msg && <AM type={msg.t}>{msg.m}</AM>}
        </Card>

        {from && to && pId && srcS.qty > 0 && (
          <div>
            <Card>
              <div
                style={{ fontSize: 12, color: COLORS.muted, marginBottom: 8 }}
              >
                Etat apres transfert —{" "}
                {boutiques.find((b) => b.id === to)?.name}
              </div>
              <div
                style={{ fontSize: 16, fontWeight: 700, color: COLORS.navy }}
              >
                {dstS.qty + (parseInt(qty) || 0)} unites @ {fmt(srcS.costPrice)}{" "}
                F
              </div>
              <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 6 }}>
                Prix d'achat national inchangé — {prod?.name}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
