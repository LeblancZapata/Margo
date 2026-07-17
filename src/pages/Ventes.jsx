import { useState, useMemo } from "react";
import { Store, Check, X, AlertTriangle } from "lucide-react";
import { C } from "../theme";
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
    cart.filter((c) => c.pid === pid).reduce((s, c) => s + c.qty, 0);

  const addToCard = (p) => {
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

  const removeFromCart = (cid) => setCard((c) => c.filter((x) => x.id !== cid));

  const totV = cart.reduce((t, c) => t + c.qty * c.price, 0);
  const totM = cart.reduce((t, c) => {
    const s = getS(stock, bId, c.pid);
    return t + (c.price - s.costPrice) * c.qty;
  }, 0);

  const validate = () => {
    if (!cart.length) return setMsg({ t: "error", m: "Le panier est vide" });
    cart.forEach((c) =>
      onEvent({
        id: uid(),
        type: "sale",
        date,
        boutiqueId: bId,
        productId: c.pid,
        quantity: c.qty,
        salePrice: c.price,
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
}
