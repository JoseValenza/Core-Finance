import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { Toolbar, DataTable } from "@/components/CrudTable";
import { StatusBadge } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { useData, type Pagamento, type PagamentoStatus } from "@/context/DataContext";
import { brl, dateBR } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/pagamentos")({ component: Page });

function Page() {
  const { pagamentos, acordos, dividas, clientes, confirmarPagamento, updatePagamentoStatus } = useData();
  const [q, setQ] = useState("");

  const rows = useMemo(() => pagamentos.filter((p) => {
    const ac = acordos.find((a) => a.id_acordo === p.id_acordo);
    const cli = clientes.find((c) => c.id_cliente === ac?.id_cliente)?.nome || "";
    const dv = dividas.find((d) => d.id_divida === ac?.id_divida)?.numero || "";
    return `${cli} ${dv} ${p.tipo_pagamento}`.toLowerCase().includes(q.toLowerCase());
  }), [pagamentos, acordos, dividas, clientes, q]);

  const setStatus = (p: Pagamento, status: PagamentoStatus) => {
    if (status === "Pago") confirmarPagamento(p.id_pagamento);
    else updatePagamentoStatus(p.id_pagamento, status);
    toast.success(`Pagamento ${status.toLowerCase()}.`);
  };

  return (
    <div>
      <PageHeader title="Gestão de Pagamentos" subtitle="Confirme recebimentos e gerencie o status financeiro." />
      <Toolbar q={q} setQ={setQ} />
      <DataTable
        columns={[
          { key: "cliente", label: "Cliente", render: (r) => {
            const ac = acordos.find((a) => a.id_acordo === (r as unknown as Pagamento).id_acordo);
            return clientes.find((c) => c.id_cliente === ac?.id_cliente)?.nome || "—";
          } },
          { key: "divida", label: "Dívida", render: (r) => {
            const ac = acordos.find((a) => a.id_acordo === (r as unknown as Pagamento).id_acordo);
            return dividas.find((d) => d.id_divida === ac?.id_divida)?.numero || "—";
          } },
          { key: "tipo", label: "Tipo", render: (r) => (r as unknown as Pagamento).tipo_pagamento },
          { key: "valor", label: "Valor", align: "right", render: (r) => brl((r as unknown as Pagamento).valor) },
          { key: "data", label: "Data", render: (r) => dateBR((r as unknown as Pagamento).data_pagamento) },
          { key: "status", label: "Status", render: (r) => <StatusBadge status={(r as unknown as Pagamento).status} /> },
        ]}
        rows={rows as unknown as Record<string, unknown>[]}
        actions={(r) => {
          const p = r as unknown as Pagamento;
          if (p.status !== "Pendente") return null;
          return (
            <div className="inline-flex gap-2">
              <Button size="sm" onClick={() => setStatus(p, "Pago")}>Confirmar</Button>
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setStatus(p, "Cancelado")}>Cancelar</Button>
            </div>
          );
        }}
      />
    </div>
  );
}
