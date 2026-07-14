import { buildVirtualStock } from "./lib/engine";

const events = [
  {
    id: "e1",
    type: "entry",
    date: "2026-07-01",
    boutiqueId: "w0",
    productId: "p1",
    quantity: 10,
    purchasePrice: 45000,
  },

  {
    id: "t1",
    type: "transfer",
    date: "2026-07-02",
    from: "w0",
    to: "b1",
    productId: "p1",
    quantity: 4,
  },

  {
    id: "e2",
    type: "entry",
    date: "2026-07-05",
    boutiqueId: "w0",
    productId: "p1",
    quantity: 5,
    purchasePrice: 48000,
  },

  {
    id: "s1",
    type: "sale",
    date: "2026-07-06",
    boutiqueId: "b1",
    productId: "p1",
    quantity: 1,
    salePrice: 55000,
  },
];

export default function App() {
  const eng = buildVirtualStock(events);
  return (
    <pre style={{ padding: 20 }}>{JSON.stringify(eng.virtualLog, null, 2)}</pre>
  );
}
