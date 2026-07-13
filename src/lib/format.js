export const fmt = (n) =>
  n == null || isNaN(n)
    ? "—"
    : new Intl.NumberFormat("fr-FR").format(Math.round(n));
export const fmtS = (n) => (n >= 0 ? `+${fmt(n)} F` : `${fmt(n)} F`);
export const uid = () =>
  crypto.randomUUID
    ? crypto.randomUUID()
    : Date.now().toString(36) + Math.random().toString(36).slice(2);
export const todayStr = () => new Date().toISOString().split("T")[0];
