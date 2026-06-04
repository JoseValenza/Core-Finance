export const brl = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n || 0);

export const dateBR = (d: string | Date) => {
  const x = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(x.getTime())) return "—";
  return x.toLocaleDateString("pt-BR");
};

export const uid = (p = "id") => `${p}_${Math.random().toString(36).slice(2, 10)}`;
