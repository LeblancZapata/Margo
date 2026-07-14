import { buildVirtualStock } from "./lib/engine";

import { Sidebar, Card, Stat } from "./components/ui";

import { ShoppingCart } from "lucide-react";

export default function App() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar page="vente" onNav={(id) => alert(id)} col={false} badge={3} />
      <div
        style={{
          padding: 22,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <Stat
          label="Ventes du jour"
          value="1 250 000 F"
          sub="12 transactions"
          Icon={ShoppingCart}
          color="#0fae86"
        />
        <Card>
          Le panneau de gauche est le vrai menu de Margo — cliquez dessus.
        </Card>
      </div>
    </div>
  );
}
