import { useState, useMemo } from "react";

import { buildVirtualStock } from "./lib/engine";

import { Sidebar } from "./components/ui";

import { BOUTIQUES_SEED, PRODUCTS_SEED, EVENTS_SEED } from "./data/seed";

import DashPage from "./pages/Dashboard";

import VentePage from "./pages/Ventes";

import ApproPage from "./pages/Appro";

import BoutiquesPage from "./pages/Boutiques";

import AvancesPage from "./pages/Avances";

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [boutiques, setBoutiques] = useState(BOUTIQUES_SEED);
  const [products, setProducts] = useState(PRODUCTS_SEED);
  const [events, setEvents] = useState(EVENTS_SEED);
  const [avances, setAvances] = useState([]);

  const eng = useMemo(() => buildVirtualStock(events), [events]);
  const addEv = (ev) => setEvents((es) => [...es, ev]);
  const pendingAv = avances.filter((a) => a.status === "pending").length;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar page={page} onNav={setPage} col={false} badge={pendingAv} />
      <div
        key={page}
        className="m-page"
        style={{ flex: 1, overflowY: "auto", padding: 22 }}
      >
        {page === "dashboard" ? (
          <DashPage
            events={events}
            boutiques={boutiques}
            products={products}
            eng={eng}
          />
        ) : page === "vente" ? (
          <VentePage
            boutiques={boutiques}
            products={products}
            eng={eng}
            onEvent={addEv}
          />
        ) : page === "appro" ? (
          <ApproPage
            boutiques={boutiques}
            products={products}
            eng={eng}
            onEvent={addEv}
            setProducts={setProducts}
          />
        ) : page === "boutiques" ? (
          <BoutiquesPage
            boutiques={boutiques}
            setBoutiques={setBoutiques}
            products={products}
            setProducts={setProducts}
            eng={eng}
          />
        ) : page === "avances" ? (
          <AvancesPage
            boutiques={boutiques}
            products={products}
            eng={eng}
            avances={avances}
            setAvances={setAvances}
            onEvent={addEv}
          />
        ) : (
          <h2>À venir : {page}</h2>
        )}
      </div>
    </div>
  );
}
