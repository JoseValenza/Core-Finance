import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useData, valorAtualizado } from "@/context/DataContext";
import { PageHeader } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatCard";
import { brl, dateBR } from "@/lib/format";

export const Route = createFileRoute("/cliente/dividas")({ component: Page });

function Page() {
  const { user } = useAuth();
  const { clientes, dividas, empresas } = useData();
  const cliente = clientes.find((c) => c.email.toLowerCase() === user?.email.toLowerCase()) || clientes[0];
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("Todos");

  const rows = useMemo(() => {
    return dividas
      .filter((d) => d.id_cliente === cliente?.id_cliente)
      .filter((d) => (status === "Todos" ? true : d.status === status))
      .filter((d) => {
        const emp = empresas.find((e) => e.id_empresa === d.id_empresa)?.nome || "";
        const hay = `${d.numero} ${emp}`.toLowerCase();
        return hay.includes(q.toLowerCase());
      });
  }, [dividas, cliente, q, status, empresas]);

  return (
    <div>
      <PageHeader title="Minhas Dívidas" subtitle="Acompanhe valores atualizados e status de cada pendência." />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por número ou empresa…"
            className="w-full h-11 rounded-lg bg-muted/40 border pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)}
          className="h-11 rounded-lg bg-muted/40 border px-3 text-sm outline-none">
          {["Todos", "Em Aberto", "Em Negociação", "Quitada"].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">Número</th>
                <th className="text-left px-4 py-3">Empresa</th>
                <th className="text-right px-4 py-3">Valor Original</th>
                <th className="text-right px-4 py-3">Juros</th>
                <th className="text-right px-4 py-3">Atualizado</th>
                <th className="text-left px-4 py-3">Vencimento</th>
                <th className="text-left px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr key={d.id_divida} className="border-t hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">{d.numero}</td>
                  <td className="px-4 py-3">{empresas.find((e) => e.id_empresa === d.id_empresa)?.nome || "—"}</td>
                  <td className="px-4 py-3 text-right">{brl(d.valor_original)}</td>
                  <td className="px-4 py-3 text-right">{brl(d.juros)}</td>
                  <td className="px-4 py-3 text-right font-semibold">{brl(valorAtualizado(d))}</td>
                  <td className="px-4 py-3">{dateBR(d.data_vencimento)}</td>
                  <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">Nenhuma dívida encontrada.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
