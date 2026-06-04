import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { Toolbar, DataTable } from "@/components/CrudTable";
import { StatusBadge } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { useData, type Acordo, type AcordoStatus } from "@/context/DataContext";
import { dateBR } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/acordos")({ component: Page });

function Page() {
  const { acordos, clientes, dividas, updateAcordoStatus } = useData();
  const [q, setQ] = useState("");

  const rows = useMemo(() => acordos.filter((a) => {
    const c = clientes.find((x) => x.id_cliente === a.id_cliente)?.nome || "";
    const d = dividas.find((x) => x.id_divida === a.id_divida)?.numero || "";
    return `${c} ${d}`.toLowerCase().includes(q.toLowerCase());
  }), [acordos, clientes, dividas, q]);

  const setStatus = (a: Acordo, status: AcordoStatus) => {
    updateAcordoStatus(a.id_acordo, status);
    toast.success(`Acordo ${status.toLowerCase()}.`);
  };

  return (
    <div>
      <PageHeader title="Gestão de Acordos" subtitle="Aprove e acompanhe os acordos firmados." />
      <Toolbar q={q} setQ={setQ} />
      <DataTable
        columns={[
          { key: "cliente", label: "Cliente", render: (r) => clientes.find((c) => c.id_cliente === (r as unknown as Acordo).id_cliente)?.nome || "—" },
          { key: "divida", label: "Dívida", render: (r) => dividas.find((d) => d.id_divida === (r as unknown as Acordo).id_divida)?.numero || "—" },
          { key: "data", label: "Data do acordo", render: (r) => dateBR((r as unknown as Acordo).data_acordo) },
          { key: "status", label: "Status", render: (r) => <StatusBadge status={(r as unknown as Acordo).status} /> },
        ]}
        rows={rows as unknown as Record<string, unknown>[]}
        actions={(r) => {
          const a = r as unknown as Acordo;
          return (
            <div className="inline-flex gap-2">
              {a.status === "Pendente" && <Button size="sm" onClick={() => setStatus(a, "Ativo")}>Aprovar</Button>}
              {a.status !== "Cancelado" && a.status !== "Pago" && (
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setStatus(a, "Cancelado")}>Cancelar</Button>
              )}
            </div>
          );
        }}
      />
    </div>
  );
}
