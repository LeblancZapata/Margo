// ENGINE — VIRTUAL MARGINS & VIRTUAL LOSSES
//
// SINGLE NATIONAL PRICE per product: the same product has the same
// purchase price in ALL boutiques. When a new batch arrives at a
// different price, every existing unit in every boutique is
// re-valued at the new price — each boutique records its own
// virtual gain/loss. Consequence: a transfer never creates a
// price adjustment.

export function buildVirtualStock(rawEvents) {
  const events = rawEvents
    .map((e, i) => ({ e, i }))
    .sort((a, b) =>
      a.e.date < b.e.date ? -1 : a.e.date > b.e.date ? 1 : a.i - b.i,
    )
    .map((x) => x.e);
  const stock = {}; // {bId: {pId: {qty, costPrice}}}
  const prices = {}; // {pId: current national purchase price}
  const saleResults = {}; // {eventId: {costPerUnit, margin, totalMargin, cancelled}}
  const virtualLog = []; //virtual gains/losses, one line PER affected boutique
  const anomalies = []; //detected oversells

  const ensure = (b, p) => {
    if (!stock[b]) stock[b] = {};
    if (!stock[b][p]) stock[b][p] = { qty: 0, costPrice: prices[p] || 0 };
    return stock[b][p];
  };

  // sets the national price and propagates it to every store
  const setPrice = (p, price) => {
    prices[p] = price;
    for (const b of Object.keys(stock))
      if (stock[b][p]) stock[b][p].costPrice = price;
  };

  for (const e of events) {
    if (e.type === "entry") {
      const newP = e.purchasePrice;
      const oldP = prices[e.productId] || 0;

      // Different price → virtual adjustment in EVERY boutique holding stock
      if (oldP > 0 && Math.round(oldP) !== Math.round(newP)) {
        for (const [bId, bs] of Object.entries(stock)) {
          const cell = bs[e.productId];
          if (cell && cell.qty > 0) {
            const delta = cell.qty * (newP - oldP);
            virtualLog.push({
              id: `${e.id}_v_${bId}`,
              date: e.date,
              boutiqueId: bId,
              productId: e.productId,
              prevPrice: oldP,
              newPrice: newP,
              qtyAdjusted: cell.qty,
              qtyNew: bId === e.boutiqueId ? e.quantity : 0,
              amount: delta,
              type: delta > 0 ? "gain" : "loss",
              source: "entry",
            });
          }
        }
      }
      ensure(e.boutiqueId, e.productId).qty += e.quantity;
      setPrice(e.productId, newP);
    } else if (e.type === "sale") {
      const s = ensure(e.boutiqueId, e.productId);
      if (e.quantity > s.qty) {
        anomalies.push({
          id: e.id,
          date: e.date,
          boutiqueId: e.boutiqueId,
          productId: e.productId,
          asked: e.quantity,
          available: s.qty,
        });
      }
      const cpu = prices[e.productId] || 0;
      s.qty = Math.max(0, s.qty - e.quantity);
      const margin = e.salePrice - cpu;
      saleResults[e.id] = {
        costPerUnit: cpu,
        margin,
        totalMargin: margin * e.quantity,
        cancelled: false,
      };
    } else if (e.type === "transfer") {
      const src = ensure(e.from, e.productId);
      const dst = ensure(e.to, e.productId);
      if (e.quantity > src.qty) {
        anomalies.push({
          id: e.id,
          date: e.date,
          boutiqueId: e.from,
          productId: e.productId,
          asked: e.quantity,
          available: src.qty,
          transfer: true,
        });
      }
      src.qty = Math.max(0, src.qty - e.quantity);
      dst.qty += e.quantity;
      // same price everywhere: a transfer never creates a virtual adjustment
    } else if (e.type === "cancel_sale") {
      const orig = saleResults[e.originalId];
      if (orig && !orig.cancelled) {
        orig.cancelled = true;
        const s = ensure(e.boutiqueId, e.productId);
        s.qty += e.quantity;
      }
    } else if (e.type === "cancel_entry") {
      const s = ensure(e.boutiqueId, e.productId);
      s.qty = Math.max(0, s.qty - e.quantity);
    }
  }
  return { stock, prices, saleResults, virtualLog, anomalies };
}

export function getS(stock, bId, pId) {
  const s = stock?.[bId]?.[pId] || { qty: 0, costPrice: 0 };
  return { ...s, costVal: s.qty * s.costPrice };
}

//total quantity of a product accross all stores
export function totalQty(stock, pId) {
  return Object.values(stock).reduce((s, bs) => s + (bs[pId]?.qty || 0), 0);
}

export function totalCostVal(stock, bIds) {
  return bIds.reduce((tot, b) => {
    if (!stock[b]) return tot;
    return (
      tot +
      Object.values(stock[b]).reduce((s, st) => s + st.qty * st.costPrice, 0)
    );
  }, 0);
}
