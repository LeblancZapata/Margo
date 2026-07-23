import { useState, useMemo } from "react";
import {
  Package,
  Plus,
  X,
  Check,
  Pencil,
  Warehouse,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  Eye,
  EyeOff,
  Download,
} from "lucide-react";
import { COLORS } from "../theme";
import { fmt, uid } from "../lib/format";
import { getS, totalCostVal } from "../lib/engine";
import { exportStock } from "../lib/exports";
import { Card, Stat, FIn, Btn, PH } from "../components/ui";

export default function BoutiquesPage({
  boutiques,
  setBoutiques,
  products,
  setProducts,
  eng,
}) {
  const { stock } = eng;
  const [selected, setSelected] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [filterCat, setFilterCat] = useState("all");
  const [showArch, setShowArch] = useState(false);
  const [addForm, setAddForm] = useState(null);
  const [stockSearch, setStockSearch] = useState("");

  const boutique = boutiques.find((b) => b.id === selected);
  const allB = [
    ...boutiques.filter((b) => b.type === "boutique"),
    boutiques.find((b) => b.type === "warehouse"),
  ].filter(Boolean);

  const stockRows = useMemo(() => {
    if (!selected) return [];
    return products
      .filter((p) => showArch || !p.archived)
      .filter((p) => stock[selected]?.[p.pid])
      .map((p) => {
        const s = getS(stock, selected, p.pid);
        return { ...p, ...s };
      })
      .filter(
        (r) =>
          filterCat === "all" ||
          (filterCat === "telephone" && r.category === "telephone") ||
          (filterCat === "accessoire" && r.category === "accessoire"),
      )
      .filter(
        (r) =>
          !stockSearch ||
          r.name.toLowerCase().includes(stockSearch.toLowerCase()) ||
          r.brand.toLowerCase().includes(stockSearch.toLowerCase()),
      )
      .sort((a, b) => {
        if (a.qty === 0 && b.qty > 0) return 1;
        if (b.qty === 0 && a.qty > 0) return -1;
        return a.brand.localeCompare(b.brand) || a.name.localeCompare(b.name);
      });
  }, [selected, stock, products, filterCat, showArch, stockSearch]);

  const totalCV = stockRows.reduce((s, r) => s + r.costVal, 0);
  const zeroCount = stockRows.filter((r) => r.qty === 0 && !r.archived).length;
  const toggleArchive = (pid) =>
    setProducts((ps) =>
      ps.map((p) => (p.pid === pid ? { ...p, archived: !p.archived } : p)),
    );

  if (selected && boutique) {
    return (
      <div>
        <div
          style={{
            marginBottom: 18,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <button
            onClick={() => setSelected(null)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 12px",
              borderRadius: 8,
              border: `1px solid ${COLORS.border}`,
              background: "white",
              cursor: "pointer",
              fontSize: 13,
              color: COLORS.text,
            }}
          >
            <ChevronLeft size={16} />
            Retour
          </button>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.text }}>
              {boutique.name}
            </div>
            <div style={{ fontSize: 13, color: COLORS.muted }}>
              {boutique.responsible}
            </div>
          </div>
          <Btn
            variant="navy"
            onClick={() =>
              exportStock({
                stock,
                prices: eng.prices,
                products,
                boutiques,
                boutiqueId: selected,
              })
            }
          >
            <Download size={13} />
            Exporter Excel
          </Btn>
          <button
            onClick={() =>
              setEditForm({
                name: boutique.name,
                responsible: boutique.responsible,
              })
            }
            title="Modifier nom / responsable"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "7px 12px",
              borderRadius: 8,
              border: `1px solid ${COLORS.border}`,
              background: "white",
              cursor: "pointer",
              fontSize: 12,
              color: COLORS.muted,
            }}
          >
            <Pencil size={13} />
            Modifier
          </button>
        </div>

        {editForm && (
          <Card
            style={{
              marginBottom: 18,
              maxWidth: 480,
              border: `1px solid ${COLORS.teal}`,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>
              Modifier la boutique
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              <FIn
                label="Nom de la boutique"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
              />
              <FIn
                label="Vendeur / Responsable"
                value={editForm.responsible}
                onChange={(e) =>
                  setEditForm({ ...editForm, responsible: e.target.value })
                }
              />
            </div>
            <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
              <Btn
                onClick={() => {
                  if (!editForm.name.trim()) return;
                  setBoutiques((bs) =>
                    bs.map((b) =>
                      b.id === selected
                        ? {
                            ...b,
                            name: editForm.name.trim(),
                            responsible: editForm.responsible.trim(),
                          }
                        : b,
                    ),
                  );
                  setEditForm(null);
                }}
              >
                <Check size={14} />
                Enregistrer
              </Btn>
              <Btn variant="light" onClick={() => setEditForm(null)}>
                <X size={14} />
                Annuler
              </Btn>
            </div>
          </Card>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
            gap: 12,
            marginBottom: 18,
          }}
        >
          <Stat
            label="Articles en stock"
            value={stockRows.filter((r) => r.qty > 0).length}
            Icon={Package}
            color={COLORS.navy}
          />

          <Stat
            label="Valeur fond (PA)"
            value={`${fmt(totalCV)} F`}
            Icon={Warehouse}
            color={COLORS.teal}
          />
          {zeroCount > 0 && (
            <Stat
              label="Ruptures"
              value={zeroCount}
              sub="articles a 0"
              Icon={AlertTriangle}
              color={COLORS.red}
            />
          )}
        </div>

        {zeroCount > 0 && (
          <div
            style={{
              padding: "10px 14px",
              background: "#fff5f5",
              border: `1px solid ${COLORS.red}20`,
              borderRadius: 8,
              marginBottom: 14,
              fontSize: 12,
              color: COLORS.red,
            }}
          >
            <strong>⚠ Ruptures:</strong>{" "}
            {stockRows
              .filter((r) => r.qty === 0 && !r.archived)
              .map((r) => `${r.brand} ${r.name}`)
              .slice(0, 8)
              .join(" • ")}
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <div style={{ position: "relative" }}>
              <input
                value={stockSearch || ""}
                onChange={(e) => setStockSearch(e.target.value)}
                placeholder="🔍 Rechercher..."
                style={{
                  padding: "6px 12px",
                  borderRadius: 7,
                  border: `1px solid ${COLORS.border}`,
                  fontSize: 12,
                  outline: "none",
                  fontFamily: "inherit",
                  width: 160,
                }}
              />
              {stockSearch && (
                <button
                  onClick={() => setStockSearch("")}
                  style={{
                    position: "absolute",
                    right: 6,
                    top: "50%",
                    transform: "translateY(-50%)",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    color: COLORS.muted,
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
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: filterCat === t ? 600 : 400,
                }}
              >
                {
                  {
                    all: "Tout",
                    telephone: "Telephones",
                    accessoire: "Accessoires",
                  }[t]
                }
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowArch(!showArch)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 7,
              border: `1px solid ${COLORS.border}`,
              background: showArch ? `${COLORS.orange}15` : "white",
              color: showArch ? COLORS.orange : COLORS.muted,
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            {showArch ? <Eye size={13} /> : <EyeOff size={13} />}
            {showArch ? "Cacher archives" : "Voir archives"}
          </button>
        </div>

        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "linear-gradient(135deg,#121f56,#16279b)",
                  }}
                >
                  {[
                    "Marque",
                    "Modèle",
                    "Cat.",
                    "Qte",
                    "Prix achat actuel",
                    "Valeur PA",
                    "Action",
                  ].map((h, i) => (
                    <th
                      key={i}
                      style={{
                        padding: "10px 12px",
                        textAlign: i >= 2 ? "center" : "left",
                        color: "white",
                        fontSize: 11,
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stockRows.map((r, i) => {
                  const isZero = r.qty === 0;
                  const isLow = r.qty > 0 && r.qty <= 2;
                  return (
                    <tr
                      key={r.pid}
                      style={{
                        borderBottom: `1px solid ${COLORS.border}`,
                        background: r.archived
                          ? "#f8f9fa"
                          : isZero
                            ? "#fff5f5"
                            : i % 2 === 0
                              ? "white"
                              : "#fafafa",
                        opacity: r.archived ? 0.6 : 1,
                      }}
                    >
                      <td style={{ padding: "8px 12px", fontWeight: 500 }}>
                        {r.brand}
                      </td>
                      <td
                        style={{
                          padding: "8px 12px",
                          maxWidth: 180,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {r.name}
                      </td>
                      <td style={{ padding: "8px 12px", textAlign: "center" }}>
                        <span
                          style={{
                            fontSize: 11,
                            padding: "2px 6px",
                            borderRadius: 12,
                            background:
                              r.category === "telephone"
                                ? "#e8f4ff"
                                : "#f0fff4",
                            color:
                              r.category === "telephone"
                                ? COLORS.navy
                                : COLORS.teal,
                          }}
                        >
                          {r.category === "telephone" ? "Tel" : "Acc"}
                        </span>
                      </td>
                      <td style={{ padding: "8px 12px", textAlign: "center" }}>
                        <span
                          style={{
                            fontWeight: 700,
                            color: isZero
                              ? COLORS.red
                              : isLow
                                ? COLORS.orange
                                : COLORS.teal,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 3,
                          }}
                        >
                          {isZero && <AlertTriangle size={11} />}
                          {r.qty}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "8px 12px",
                          textAlign: "center",
                          color: COLORS.muted,
                        }}
                      >
                        {r.costPrice > 0 ? fmt(r.costPrice) + " F" : "—"}
                      </td>
                      <td
                        style={{
                          padding: "8px 12px",
                          textAlign: "center",
                          fontWeight: 600,
                          color: COLORS.navy,
                        }}
                      >
                        {r.costVal > 0 ? fmt(r.costVal) + " F" : "—"}
                      </td>
                      <td style={{ padding: "8px 12px", textAlign: "center" }}>
                        <button
                          onClick={() => toggleArchive(r.pid)}
                          style={{
                            padding: "3px 8px",
                            borderRadius: 5,
                            border: `1px solid ${r.archived ? COLORS.teal : COLORS.border}`,
                            background: r.archived
                              ? `${COLORS.teal}15`
                              : "white",
                            cursor: "pointer",
                            fontSize: 11,
                            color: r.archived ? COLORS.teal : COLORS.muted,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 3,
                          }}
                        >
                          {r.archived ? (
                            <>
                              <Eye size={10} />
                              Restaurer
                            </>
                          ) : (
                            <>
                              <EyeOff size={10} />
                              Archiver
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {stockRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        padding: 32,
                        textAlign: "center",
                        color: COLORS.muted,
                      }}
                    >
                      Aucun article
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  }
}
