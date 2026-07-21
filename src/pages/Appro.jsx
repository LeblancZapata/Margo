import { useState, useMemo } from "react";
import { Package, Check, X } from "lucide-react";
import { COLORS } from "../theme";
import { fmt, uid, todayStr } from "../lib/format";
import { getS, totalQty } from "../lib/engine";
import { Card, FIn, FSel, Btn, AM, PH, VirtualPreview } from "../components/ui";

export default function ApproPage({
  boutiques,
  products,
  eng,
  onEvent,
  setProducts,
}) {
  const { stock } = eng;
  // purchases arrive at the warehouse first
  const [bId, setBId] = useState(
    boutiques.find((b) => b.type === "warehouse")?.id || "",
  );
  const [pId, setPId] = useState("");
  const [qty, setQty] = useState("1");
  const [pp, setPp] = useState("");
  const [src, setSrc] = useState("warehouse");
  const [msg, setMsg] = useState(null);
  const [newProd, setNewProd] = useState(null);
  const [approSearch, setApproSearch] = useState("");

  const approProdsList = useMemo(
    () =>
      products.filter(
        (p) =>
          !p.archived &&
          (!approSearch ||
            p.name.toLowerCase().includes(approSearch.toLowerCase()) ||
            p.brand.toLowerCase().includes(approSearch.toLowerCase())),
      ),
    [products, approSearch],
  );

  const allB = [
    ...boutiques.filter((b) => b.type === "boutique"),
    boutiques.find((b) => b.type === "warehouse"),
  ].filter(Boolean);

  const currentS = getS(stock, bId, pId);
  const natQty = pId ? totalQty(stock, pId) : 0; // units across ALL locations
  const natPrice = pId ? eng.prices?.[pId] || 0 : 0; // national purchase price
  const newPriceN = parseFloat(pp) || 0;
  const newQtyN = parseInt(qty) || 0;
  const prod = products.find((p) => p.pid === pId);

  const save = () => {
    if (!bId || !pId || !qty || !pp)
      return setMsg({ t: "error", m: "Tous les champs requis" });
    onEvent({
      id: uid(),
      type: "entry",
      date: todayStr(),
      boutiqueId: bId,
      productId: pId,
      quantity: newQtyN,
      purchasePrice: newPriceN,
      source: src,
    });
    setMsg({
      t: "success",
      m: `Lot cree: ${qty}x ${prod?.name} @ ${fmt(newPriceN)} F → ${
        boutiques.find((b) => b.id === bId)?.name
      }`,
    });
    setPId("");
    setQty("1");
    setPp("");
    setTimeout(() => setMsg(null), 5000);
  };

  const saveNewProd = () => {
    if (!newProd?.name || !newProd?.brand) return;
    const norm = (s) =>
      s.toUpperCase().replace(/[+\/]/g, "").replace(/\s+/g, "");
    if (
      products.some(
        (x) =>
          norm(x.brand) === norm(newProd.brand) &&
          norm(x.name) === norm(newProd.name),
      )
    )
      return setMsg({
        t: "error",
        m: "Ce produit existe déjà (même nom et marque) — sélectionnez-le dans la liste",
      });
    const p = {
      pid: uid(),
      name: newProd.name.trim(),
      brand: newProd.brand.trim().toUpperCase(),
      category: newProd.category || "telephone",
      salePrice: 0,
      archived: false,
    };
    setProducts((ps) => [...ps, p]);
    setPId(p.pid);
    setNewProd(null);
  };

  return (
    <div>
      <PH
        title="Approvisionnement"
        sub="Chaque réception met à jour le prix d'achat du produit et réévalue automatiquement le stock de toutes les boutiques"
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          maxWidth: 1000,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>
              Nouvelle reception
            </div>
            <div
              style={{
                marginBottom: 14,
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              {[
                { v: "warehouse", l: "Du fournisseur" },
                { v: "purchase", l: "Achat direct" },
                { v: "initial", l: "Stock initial" },
              ].map((o) => (
                <button
                  key={o.v}
                  onClick={() => setSrc(o.v)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 7,
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 500,
                    border: `1px solid ${
                      src === o.v ? COLORS.teal : COLORS.border
                    }`,
                    background: src === o.v ? `${COLORS.teal}15` : "white",
                    color: src === o.v ? COLORS.teal : COLORS.text,
                  }}
                >
                  {o.l}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              <FSel
                label="Destination"
                value={bId}
                onChange={(e) => setBId(e.target.value)}
                options={allB.map((b) => ({
                  v: b.id,
                  l:
                    b.type === "warehouse"
                      ? `🏭 ${b.name}`
                      : b.name + " — " + b.responsible,
                }))}
              />
              <div>
                <label
                  style={{
                    fontSize: 12,
                    color: COLORS.muted,
                    marginBottom: 4,
                    display: "block",
                  }}
                >
                  Produit
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    <input
                      value={approSearch || ""}
                      onChange={(e) => {
                        setApproSearch(e.target.value);
                        setPId("");
                      }}
                      placeholder="🔍 Rechercher un produit..."
                      style={{
                        padding: "8px 12px",
                        borderRadius: 8,
                        border: `1px solid ${COLORS.border}`,
                        fontSize: 13,
                        outline: "none",
                        fontFamily: "inherit",
                        color: COLORS.text,
                      }}
                    />
                    <select
                      value={pId}
                      onChange={(e) => setPId(e.target.value)}
                      size={Math.min(6, approProdsList.length + 1)}
                      style={{
                        flex: 1,
                        padding: "6px 8px",
                        borderRadius: 8,
                        border: `1px solid ${COLORS.border}`,
                        fontSize: 13,
                        outline: "none",
                        fontFamily: "inherit",
                        color: COLORS.text,
                        background: "white",
                        minHeight: 36,
                      }}
                    >
                      <option value="">Sélectionner un produit</option>
                      {approProdsList.map((p) => (
                        <option key={p.pid} value={p.pid}>
                          [{p.category === "telephone" ? "Tel" : "Acc"}]{" "}
                          {p.name} — {p.brand}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() =>
                      setNewProd({
                        name: "",
                        brand: "",
                        category: "telephone",
                        purchasePrice: "",
                      })
                    }
                    style={{
                      padding: "9px 12px",
                      borderRadius: 8,
                      border: `1px solid ${COLORS.teal}`,
                      background: `${COLORS.teal}15`,
                      color: COLORS.teal,
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    + Nouveau
                  </button>
                </div>
              </div>
              <FIn
                label="Quantite reçue"
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
              />
              <FIn
                label="Prix d'achat unitaire (FCFA)"
                type="number"
                value={pp}
                onChange={(e) => setPp(e.target.value)}
                placeholder="Ex: 55000"
              />
            </div>
            <div style={{ marginTop: 18 }}>
              <Btn onClick={save}>
                <Package size={14} />
                Créer le lot
              </Btn>
            </div>
            {msg && <AM type={msg.t}>{msg.m}</AM>}
          </Card>

          {newProd && (
            <Card style={{ border: `1px solid ${COLORS.teal}` }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>
                Nouveau produit
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <FIn
                  label="Nom"
                  value={newProd.name}
                  onChange={(e) =>
                    setNewProd({ ...newProd, name: e.target.value })
                  }
                  placeholder="Ex: Tecno Camon 50"
                />

                <FIn
                  label="Marque"
                  value={newProd.brand}
                  onChange={(e) =>
                    setNewProd({ ...newProd, brand: e.target.value })
                  }
                  placeholder="Ex: Tecno"
                />
                <div>
                  <label
                    style={{
                      fontSize: 12,
                      color: COLORS.muted,
                      marginBottom: 6,
                      display: "block",
                    }}
                  >
                    Catégorie
                  </label>
                  <div style={{ display: "flex", gap: 10 }}>
                    {["telephone", "accessoire"].map((c) => (
                      <button
                        key={c}
                        onClick={() => setNewProd({ ...newProd, category: c })}
                        style={{
                          padding: "7px 14px",
                          borderRadius: 8,
                          cursor: "pointer",
                          fontSize: 12,
                          border: `1px solid ${
                            newProd.category === c ? COLORS.teal : COLORS.border
                          }`,
                          background:
                            newProd.category === c
                              ? `${COLORS.teal}15`
                              : "white",
                          color:
                            newProd.category === c ? COLORS.teal : COLORS.text,
                        }}
                      >
                        {c === "telephone" ? "Telephone" : "Accessoire"}
                      </button>
                    ))}
                  </div>
                </div>
                <FIn
                  label="Prix d'achat reference (FCFA)"
                  type="number"
                  value={newProd.purchasePrice}
                  onChange={(e) =>
                    setNewProd({ ...newProd, purchasePrice: e.target.value })
                  }
                  placeholder="Ex: 55000"
                />
              </div>
              <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
                <Btn onClick={saveNewProd}>
                  <Check size={14} />
                  Créer et utiliser
                </Btn>
                <Btn variant="light" onClick={() => setNewProd(null)}>
                  <X size={14} />
                  Annuler
                </Btn>
              </div>
            </Card>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Current stock card */}
          <Card
            style={{
              background: `linear-gradient(135deg, ${COLORS.navy},#0c1f5e)`,
              color: "white",
            }}
          >
            <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 4 }}>
              Stock actuel —{" "}
              {boutiques.find((b) => b.id === bId)?.name || "Boutique"}
            </div>
            <div style={{ fontSize: 42, fontWeight: 800, lineHeight: 1 }}>
              {currentS.qty}
            </div>
            <div style={{ fontSize: 13, opacity: 0.7, marginTop: 6 }}>
              {prod?.name || "—"}
            </div>
            <div
              style={{
                marginTop: 8,
                display: "flex",
                justifyContent: "space-between",
                fontSize: 12,
                opacity: 0.6,
              }}
            >
              <span>Prix d'achat actuel</span>
              <span style={{ fontWeight: 700, fontSize: 14, opacity: 1 }}>
                {currentS.qty > 0 ? fmt(currentS.costPrice) + " F" : "—"}
              </span>
            </div>

            {currentS.qty > 0 && (
              <div
                style={{
                  marginTop: 4,
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 12,
                  opacity: 0.6,
                }}
              >
                <span>Valeur totale (PA)</span>
                <span style={{ fontWeight: 600, opacity: 1 }}>
                  {fmt(currentS.costVal)} F
                </span>
              </div>
            )}
          </Card>

          {/* Virtual gain/loss preview  */}
          {bId && pId && newPriceN > 0 && (
            <VirtualPreview
              currentQty={natQty}
              currentPrice={natPrice}
              newPrice={newPriceN}
              newQty={newQtyN}
              productName={prod?.name}
            />
          )}

          {/* Same price = no adjustment */}
          {bId &&
            pId &&
            newPriceN > 0 &&
            natQty > 0 &&
            Math.round(natPrice) === Math.round(newPriceN) && (
              <div
                style={{
                  padding: "12px 14px",
                  background: COLORS.light,
                  borderRadius: 10,
                  border: `1px solid ${COLORS.border}`,
                  fontSize: 13,
                  color: COLORS.muted,
                }}
              >
                <strong style={{ color: COLORS.text }}>Prix identique</strong>{" "}
                Aucun ajustement virtuel. Les {newQtyN} nouvelles unites
                s'ajoutent au stock existant au meme prix ({fmt(newPriceN)} F).
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
