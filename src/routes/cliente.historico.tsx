import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { PageHeader } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatCard";
import { brl, dateBR } from "@/lib/format";

export const Route = createFileRoute("/cliente/historico")({ component: Page });

function Page() {
  const { user } = useAuth();
  const { clientes, acordos, dividas, pagamentos, propostas } = useData();
  const cliente = clientes.find((c) => c.email.toLowerCase() === user?.email.toLowerCase()) || clientes[0];

  const meusAc = acordos.filter((a) => a.id_cliente === cliente?.id_cliente);
  const meusPag = pagamentos.filter((p) => meusAc.some((a) => a.id_acordo === p.id_acordo));

  return (
    <div>
      <PageHeader title="Histórico" subtitle="Consulte acordos e pagamentos realizados." />

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border bg-card overflow-hidden">
          <div className="px-5 py-3 border-b font-semibold">Acordos</div>
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="text-left px-4 py-2">Dívida</th><th className="text-left px-4 py-2">Data</th><th className="text-left px-4 py-2">Status</th></tr>
            </thead>
            <tbody>
              {meusAc.map((a) => {
                const d = dividas.find((x) => x.id_divida === a.id_divida);
                return (
                  <tr key={a.id_acordo} className="border-t">
                    <td className="px-4 py-2 font-medium">{d?.numero}</td>
                    <td className="px-4 py-2">{dateBR(a.data_acordo)}</td>
                    <td className="px-4 py-2"><StatusBadge status={a.status} /></td>
                  </tr>
                );
              })}
              {meusAc.length === 0 && <tr><td colSpan={3} className="text-center text-muted-foreground py-8">Sem acordos.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="rounded-2xl border bg-card overflow-hidden">
          <div className="px-5 py-3 border-b font-semibold">Pagamentos</div>
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="text-left px-4 py-2">Tipo</th><th className="text-left px-4 py-2">Data</th><th className="text-right px-4 py-2">Valor</th><th className="text-left px-4 py-2">Status</th></tr>
            </thead>
            <tbody>
              {meusPag.map((p) => (
                <tr key={p.id_pagamento} className="border-t">
                  <td className="px-4 py-2">{p.tipo_pagamento}</td>
                  <td className="px-4 py-2">{dateBR(p.data_pagamento)}</td>
                  <td className="px-4 py-2 text-right font-medium">{brl(p.valor)}</td>
                  <td className="px-4 py-2"><StatusBadge status={p.status} /></td>
                </tr>
              ))}
              {meusPag.length === 0 && <tr><td colSpan={4} className="text-center text-muted-foreground py-8">Sem pagamentos.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status overview of dívidas */}
      <div className="mt-4 rounded-2xl border bg-card overflow-hidden">
        <div className="px-5 py-3 border-b font-semibold">Minhas dívidas — status atual</div>
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="text-left px-4 py-2">Número</th><th className="text-right px-4 py-2">Valor original</th><th className="text-left px-4 py-2">Vencimento</th><th className="text-left px-4 py-2">Status</th></tr>
          </thead>
          <tbody>
            {dividas.filter((d) => d.id_cliente === cliente?.id_cliente).map((d) => (
              <tr key={d.id_divida} className="border-t">
                <td className="px-4 py-2 font-medium">{d.numero}</td>
                <td className="px-4 py-2 text-right">{brl(d.valor_original)}</td>
                <td className="px-4 py-2">{dateBR(d.data_vencimento)}</td>
                <td className="px-4 py-2"><StatusBadge status={d.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {void propostas}
    </div>
  );
}
