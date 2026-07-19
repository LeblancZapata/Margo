import { useState, useMemo } from "react";
import { Store, Check, X, AlertTriangle } from "lucide-react";
import { COLORS } from "../theme";
import { fmt, uid, todayStr } from "../lib/format";
import { getS } from "../lib/engine";
import { Card, FSel, Btn, AM, PH } from "../components/ui";

export default function VentePage({ boutiques, products, eng, onEvent }) {
  const { stock, saleResults } = eng;
  const [bId, setBId] = useState("");
  const [date, setDate] = useState(todayStr());
  const [cart, setCart] = useState([]);
  const [inputs, setInputs] = useState({});
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState(null);
  const [filterCat, setFilterCat] = useState("all");

  const boutique = boutiques.find((b) => b.id === bId);

  // Products in this boutique, with stock info
  const allProds = useMemo(() => {
    if (!bId) return [];
    return products
      .filter((p) => !p.archived && stock[bId]?.[p.pid]) // boutique's own assortment: only articles with history here
      .map((p) => {
        const s = getS(stock, bId, p.pid);
        return { ...p, ...s };
      })
      .sort((a, b) => {
        if (a.qty === 0 && b.qty > 0) return 1;
        if (b.qty === 0 && a.qty > 0) return -1;
        return a.brand.localeCompare(b.brand) || a.name.localeCompare(b.name);
      });
  }, [bId, stock, products]);

  // Filtered by search + category
  const displayed = allProds.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q);
    const matchCat =
      filterCat === "all" ||
      (filterCat === "telephone" && p.category === "telephone") ||
      (filterCat === "accessoire" && p.category === "accessoire");
    return matchSearch && matchCat;
  });

  const setInput = (pid, field, val) =>
    setInputs((prev) => ({ ...prev, [pid]: { ...prev[pid], [field]: val } }));

  //How many units already in cart for this product
  const cartQtyFor = (pid) =>
    cart.filter((c) => COLORS.pid === pid).reduce((s, c) => s + COLORS.qty, 0);

  const addToCart = (p) => {
    const inp = inputs[p.pid] || {};
    const qty = parseInt(inp.qty) || 0;
    const price = parseFloat(inp.price) || 0;
    if (qty <= 0)
      return setMsg({ t: "error", m: `Entrez une quantite pour ${p.name}` });
    if (price <= 0)
      return setMsg({
        t: "error",
        m: `Entrez un prix de vente pour ${p.name}`,
      });
    const totalInCart = cartQtyFor(p.pid);
    if (totalInCart + qty > p.qty)
      return setMsg({
        t: "error",
        m: `Stock insuffisant pour ${p.name}! Dispo: ${p.qty}, deja au panier: ${totalInCart}`,
      });
    setCart((c) => [...c, { id: uid(), pid: p.pid, qty, price }]);
    setInputs((prev) => ({ ...prev, [p.pid]: { qty: "", price: "" } }));
    if (p.costPrice > 0 && price < p.costPrice)
      setMsg({
        t: "warning",
        m: `⚠ ${p.name}: prix de vente (${fmt(price)} F) INFÉRIEUR au prix d'achat (${fmt(p.costPrice)} F) — vente à perte ajoutée au panier`,
      });
    else setMsg(null);
  };

  const removeFromCart = (cid) =>
    setCart((c) => COLORS.filter((x) => x.id !== cid));

  const totV = cart.reduce((t, c) => t + COLORS.qty * COLORS.price, 0);
  const totM = cart.reduce((t, c) => {
    const s = getS(stock, bId, COLORS.pid);
    return t + (COLORS.price - s.costPrice) * COLORS.qty;
  }, 0);

  const validate = () => {
    if (!cart.length) return setMsg({ t: "error", m: "Le panier est vide" });
    cart.forEach((c) =>
      onEvent({
        id: uid(),
        type: "sale",
        date,
        boutiqueId: bId,
        productId: COLORS.pid,
        quantity: COLORS.qty,
        salePrice: COLORS.price,
      }),
    );
    setMsg({
      t: "success",
      m: `✓ ${cart.length} vente(s) validee(s) — Total: ${fmt(totV)} F — Marges: ${fmt(totM)} F`,
    });
    setCart([]);
    setTimeout(() => setMsg(null), 5000);
  };

  const zeroStock = allProds.filter((p) => p.qty === 0);

  return (
    <div>
      <PH
        title="Saisie des Ventes"
        sub="Ajoutez chaque vente au panier — plusieurs ventes du meme article a prix differents sont possibles"
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
          maxWidth: 700,
          marginBottom: 10,
        }}
      >
        <FSel
          label="Boutique"
          value={bId}
          onChange={(e) => {
            setBId(e.target.value);
            setCart([]);
            setInputs({});
            setMsg(null);
          }}
          options={boutiques
            .filter((b) => b.type === "boutique")
            .map((b) => ({ v: b.id, l: `${b.name}-${b.responsible}` }))}
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
            Date des ventes
          </label>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                flex: 1,
                padding: "9px 12px",
                borderRadius: 8,
                border: `1px solid ${COLORS.border}`,
                fontSize: 13,
                outline: "none",
                fontFamily: "inherit",
                color: COLORS.text,
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            {[
              { l: "Aujourd'hui", d: 0 },
              { l: "Hier", d: 1 },
              { l: "Avant-hier", d: 2 },
            ].map(({ l, d }) => {
              const dd = new Date();
              dd.setDate(dd.getDate() - d);
              const ds = dd.toISOString().split("T")[0];
              const active = date === ds;
              return (
                <button
                  key={d}
                  onClick={() => setDate(ds)}
                  style={{
                    flex: 1,
                    padding: "5px 4px",
                    borderRadius: 6,
                    border: `1px solid ${active ? COLORS.teal : COLORS.border}`,
                    background: active ? `${COLORS.teal}18` : "white",
                    color: active ? COLORS.teal : COLORS.muted,
                    cursor: "pointer",
                    fontSize: 11,
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  {l}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {date !== todayStr() && (
        <div
          style={{
            padding: "8px 14px",
            background: "#e8f4ff",
            borderRadius: 8,
            marginBottom: 14,
            fontSize: 12,
            color: COLORS.blue,
          }}
        >
          📅 Saisie en cours pour le{" "}
          <strong>
            {new Date(date + "T12:00").toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </strong>{" "}
          — les ventes seront enregistrees a cette date
        </div>
      )}

      {bId && zeroStock.length > 0 && (
        <div
          style={{
            padding: "9px 14px",
            background: "#fff8f0",
            borderRadius: 8,
            marginBottom: 14,
            fontSize: 12,
            color: COLORS.orange,
          }}
        >
          <AlertTriangle
            size={12}
            style={{ marginRight: 6, verticalAlign: "middle" }}
          />
          <strong>{zeroStock.length} rupture(s):</strong>{" "}
          {zeroStock
            .slice(0, 5)
            .map((p) => `${p.brand} ${p.name}`)
            .join(" • ")}
          {zeroStock.length > 5 ? ` +${zeroStock.length - 5}...` : ""}
        </div>
      )}

      {bId && (
        <div
          style={{ display: "grid", gridTemplateColumns: "2fr 1fr, gap: 16" }}
        >
          {/* LEFT: product browser */}
          <div>
            <div
              style={{
                display: "flex",
                gap: 10,
                marginBottom: 12,
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: 1, position: "relative", minWidth: 180 }}>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="🔍  Rechercher un produit..."
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 9,
                    border: `1px solid ${COLORS.border}`,
                    fontSize: 13,
                    outline: "none",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                    color: COLORS.text,
                  }}
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    style={{
                      position: "absolute",
                      right: 8,
                      top: "50%",
                      transform: "translateY(-50%)",
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      color: COLORS.muted,
                      fontSize: 16,
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
              {["all", "telephone", "accessoire"].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterCat(t)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 7,
                    border: `1px solid ${filterCat === t ? COLORS.navy : COLORS.border}`,
                    background: filterCat === t ? COLORS.navy : "white",
                    color: filterCat === t ? "white" : COLORS.text,
                    fontSize: 12,
                    fontWeight: filterCat === t ? 600 : 400,
                  }}
                >
                  {{ all: "Tout", telephone: "Tel", accessoire: "Acc" }[t]}
                </button>
              ))}
            </div>

            <Card
              style={{
                padding: 0,
                overflow: "hidden",
                maxHeight: 500,
                overflowY: "auto",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 13,
                }}
              >
                <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                  <tr
                    style={{
                      background: "linear-gradient(135deg,#121f56,#16279b)",
                    }}
                  >
                    {["Produit", "Stock", "PA", "Qte", "Prix vente", ""].map(
                      (h, i) => (
                        <th
                          key={i}
                          style={{
                            padding: "9px 10px",
                            textAlign: i >= 1 ? "center" : "left",
                            color: "white",
                            fontSize: 11,
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {displayed.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        style={{
                          padding: 24,
                          textAlign: "center",
                          color: COLORS.muted,
                        }}
                      >
                        Aucun produit trouve
                      </td>
                    </tr>
                  )}
                  {displayed.map((p, i) => {
                    const inp = inputs[p.pid] || { qty: "", price: "" };
                    const inCart = cartQtyFor(p.pid);
                    const noStock = p.qty === 0;
                    const rowBg = noStock
                      ? "#fff8f0"
                      : i % 2 === 0
                        ? "white"
                        : "#fafafa";
                    const canAdd =
                      parseInt(inp.qty) > 0 && parseFloat(inp.price) > 0;
                    return (
                      <tr
                        key={p.pid}
                        style={{
                          borderBottom: `1px solid ${COLORS.border}`,
                          background: rowBg,
                        }}
                      >
                        <td style={{ padding: "7px 10px" }}>
                          <div style={{ fontWeight: 500, fontSize: 12 }}>
                            {p.brand}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: COLORS.muted,
                              maxWidth: 130,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {p.name}
                          </div>
                        </td>
                        <td style={{ padding: "7px 8px", textAlign: "center" }}>
                          <span
                            style={{
                              fontWeight: 700,
                              color:
                                p.qty === 0
                                  ? COLORS.red
                                  : p.qty <= 2
                                    ? COLORS.orange
                                    : COLORS.teal,
                              fontSize: 13,
                            }}
                          >
                            {p.qty}
                          </span>
                          {inCart > 0 && (
                            <div style={{ fontSize: 10, color: COLORS.orange }}>
                              -{inCart} panier
                            </div>
                          )}
                        </td>
                        <td
                          style={{
                            padding: "7px 8px",
                            textAlign: "center",
                            fontSize: 11,
                            color: COLORS.muted,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {fmt(p.costPrice)} F
                        </td>
                        <td style={{ padding: "5px 6px", textAlign: "center" }}>
                          <input
                            type="number"
                            min="1"
                            value={inp.qty}
                            onChange={(e) =>
                              setInput(p.pid, "qty", e.target.value)
                            }
                            disabled={noStock}
                            placeholder="Qte"
                            style={{
                              width: 52,
                              padding: "5px 6px",
                              borderRadius: 6,
                              border: `1px solid ${COLORS.border}`,
                              textAlign: "center",
                              fontSize: 12,
                              fontFamily: "inherit",
                              background: noStock ? "#f8f9fa" : "white",
                            }}
                          />
                        </td>
                        <td style={{ padding: "5px 6px", textAlign: "center" }}>
                          <input
                            type="number"
                            min="0"
                            value={inp.price}
                            onChange={(e) =>
                              setInput(p.pid, "price", e.target.value)
                            }
                            disabled={noStock}
                            placeholder="Prix vte"
                            style={{
                              width: 88,
                              padding: "5px 6px",
                              borderRadius: 6,
                              border: `1px solid ${COLORS.border}`,
                              textAlign: "right",
                              fontSize: 12,
                              fontFamily: "inherit",
                              background: noStock ? "#f8f9fa" : "white",
                            }}
                          />
                        </td>
                        <td style={{ padding: "5px 8px", textAlign: "center" }}>
                          <button
                            onClick={() => addToCart(p)}
                            disabled={noStock || !canAdd}
                            style={{
                              padding: "5px 10px",
                              borderRadius: 6,
                              border: "none",
                              background:
                                noStock || !canAdd
                                  ? COLORS.light
                                  : `linear-gradient(135deg,${COLORS.teal},#0d9b78)`,
                              color:
                                noStock || !canAdd ? COLORS.muted : "white",
                              cursor: noStock ? "not-allowed" : "pointer",
                              fontSize: 12,
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                            }}
                          >
                            + Panier
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
            {msg && <AM type={msg.t}>{msg.m}</AM>}
          </div>

          {/* RIGHT: cart */}
          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                marginBottom: 10,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              🛒 Panier{" "}
              <span
                style={{ fontSize: 12, fontWeight: 400, color: COLORS.muted }}
              >
                ({cart.length} ligne{cart.length > 1 ? "s" : ""})
              </span>
            </div>

            {cart.length === 0 ? (
              <div
                style={{
                  padding: 32,
                  textAlign: "center",
                  background: COLORS.card,
                  borderRadius: 12,
                  border: `2px dashed ${COLORS.border}`,
                  color: COLORS.muted,
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 8 }}>🛒</div>
                <div style={{ fontSize: 13 }}>
                  Ajoutez des ventes depuis la liste
                </div>
              </div>
            ) : (
              <>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    maxHeight: 360,
                    overflowY: "auto",
                    marginBottom: 12,
                  }}
                >
                  {cart.map((c) => {
                    const p = products.find((pr) => pr.pid === COLORS.pid);
                    const s = getS(stock, bId, COLORS.pid);
                    const marg = (COLORS.price - s.costPrice) * COLORS.qty;
                    return (
                      <div
                        key={COLORS.id}
                        style={{
                          background: COLORS.card,
                          borderRadius: 10,
                          padding: "10px 12px",
                          border: `1px solid ${marg >= 0 ? "#e8f8f4" : COLORS.border}`,
                          display: "flex",
                          gap: 10,
                          alignItems: "center",
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {p?.brand} {p?.name}
                          </div>
                          <div style={{ fontSize: 11, color: COLORS.muted }}>
                            {COLORS.qty} u. @ {fmt(COLORS.price)} F
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              color: marg >= 0 ? COLORS.teal : COLORS.red,
                            }}
                          >
                            Marge:{fmt(marg)} F
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(COLORS.id)}
                          style={{
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            color: COLORS.red,
                            padding: 4,
                            borderRadius: 4,
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div
                  style={{
                    padding: "12px 14px",
                    background: `linear-gradient(135deg, ${COLORS.navy},#0c1f5e)`,
                    borderRadius: 10,
                    color: "white",
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <span styles={{ fontSize: 11, opacity: 0.7 }}>
                      Total ventes
                    </span>
                    <span style={{ fontWeight: 700 }}>{fmt(totV)} F</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <span style={{ fontSize: 11, opacity: 0.7 }}>
                      Total marges
                    </span>
                    <span
                      style={{
                        fontWeight: 700,
                        color: totM >= 0 ? "#55efc4" : "#ff7675",
                      }}
                    >
                      {fmt(totM)} F
                    </span>
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span style={{ fontSize: 11, opacity: 0.7 }}>
                      Taux moyen
                    </span>
                    <span style={{ fontWeight: 600 }}>
                      {totV > 0 ? Math.round((totM / totV) * 100) + "%" : "—"}
                    </span>
                  </div>
                </div>
                <Btn
                  onClick={validate}
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    fontSize: 14,
                    padding: "12px",
                  }}
                >
                  <Check size={16} />
                  Valider {cart.length} vente{cart.length > 1 ? "s" : ""}
                </Btn>
              </>
            )}
          </div>
        </div>
      )}

      {!bId && (
        <div
          style={{
            padding: 40,
            textAlign: "center",
            background: COLORS.card,
            borderRadius: 12,
            border: `1px solid ${COLORS.border}`,
          }}
        >
          <Store size={40} color={COLORS.muted} style={{ marginBottom: 12 }} />
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: COLORS.text,
              marginBottom: 6,
            }}
          >
            Selectionnez une boutique
          </div>
          <div style={{ fontSize: 13, color: COLORS.muted }}>
            Choisissez la boutique pour commencer la saisie des ventes
          </div>
        </div>
      )}
    </div>
  );
}
