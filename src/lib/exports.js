//EXCEL EXPORTS of stock sheets & period performance reports
// All amounts are in FCFA.

import * as XLSX from "xlsx";
import { todayStr } from "./format";

const sheetName = (s) => s.replace(/[\\/?*[\]:]/g, "").slice(0, 31);
const frDate = (d) =>
  new Date(d + "T12:00").toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

//-----CURRENT STOCK
export function exportStock({
  stock,
  prices,
  products,
  boutiques,
  boutiqueId = null,
}) {
  const wb = XLSX.utils.book_new();
  const today = todayStr();
  const actifs = products.filter((p) => !p.archived);
  const cols = [
    { wch: 16 },
    { wch: 26 },
    { wch: 12 },
    { wch: 8 },
    { wch: 14 },
    { wch: 16 },
  ];

  if (!boutiqueId) {
    const rows = actifs
      .map((p) => ({
        p,
        q: Object.values(stock).reduce((s, bs) => s + (bs[p.pid]?.qty || 0), 0),
      }))
      .filter((x) => x.q > 0)
      .sort((a, b) =>
        (a.p.brand + a.p.name).localeCompare(b.p.brand + b.p.name),
      );
    const totQ = rows.reduce((s, x) => s + x.q, 0);
    const totV = rows.reduce((s, x) => s + x.q * (prices[x.p.pid] || 0), 0);
    const ws = XLSX.utils.aoa_to_sheet([
      ["STOCK GLOBAL — TOUTES BOUTIQUES"],
      [`Date: ${frDate(today)} — Montants en FCFA`],
      [],
      ["MARQUE", "MODELE", "CATEGORIE", "QTE", "PRIX ACHAT", "VALEUR"],
      ...rows.map(({ p, q }) => [
        p.brand,
        p.name,
        p.category,
        q,
        prices[p.pid] || 0,
        q * (prices[p.pid] || 0),
      ]),
      [],
      ["TOTAL", "", "", totQ, "", totV],
    ]);
    ws["!cols"] = cols;
    XLSX.utils.book_append_sheet(wb, ws, "Global");
  }

  const list = boutiqueId
    ? boutiques.filter((b) => b.id === boutiqueId)
    : boutiques;
  for (const b of list) {
    const bs = stock[b.id] || {};
    const rows = actifs
      .filter((p) => bs[p.pid]?.qty > 0)
      .map((p) => ({ p, q: bs[p.pid].qty }))
      .sort((a, x) =>
        (a.p.brand + a.p.name).localeCompare(x.p.brand + x.p.name),
      );
    const totQ = rows.reduce((s, x) => s + x.q, 0);
    const totV = rows.reduce((s, x) => s + x.q * (prices[x.p.pid] || 0), 0);
    const ws = XLSX.utils.aoa_to_sheet([
      [`STOCK — ${b.name.toUpperCase()}`],
      [
        `Responsable: ${b.responsible} — Date: ${frDate(today)} — Montants en FCFA`,
      ],
      [],
      ["MARQUE", "MODELE", "CATEGORIE", "QTE", "PRIX ACHAT", "VALEUR"],
      ...rows.map(({ p, q }) => [
        p.brand,
        p.name,
        p.category,
        q,
        prices[p.pid] || 0,
        q * (prices[p.pid] || 0),
      ]),
      [],
      ["TOTAL", "", "", totQ, "", totV],
    ]);
    ws["!cols"] = cols;
    XLSX.utils.book_append_sheet(wb, ws, sheetName(b.name));
  }
  const suffix = boutiqueId
    ? sheetName(list[0].name).replace(/\s+/g, "_")
    : "Global";
  XLSX.writeFile(wb, `Margo_Stock_${suffix}_${today}.xlsx`);
}
