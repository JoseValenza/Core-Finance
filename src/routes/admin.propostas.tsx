import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { Toolbar, DataTable, RowActions, FormDialog, useCrudDialog } from "@/components/CrudTable";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useData, valorAtualizado, type Proposta } from "@/context/DataContext";
import { brl, dateBR } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/propostas")({ component: Page });

function Page() {
  const { propostas, dividas, addProposta, updateProposta, removeProposta } = useData();
  const [q, setQ] = useState("");
  const dlg = useCrudDialog<Proposta>();
  const [form, setForm] = useState({
    id_divida: "", percentual_desconto: 10, quantidade_parcelas: 6,
    validade: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
  });

  const rows = useMemo(() => propostas.filter((p) => {
    const dv = dividas.find((d) => d.id_divida === p.id_divida);
    return `${dv?.numero || ""}`.toLowerCase().includes(q.toLowerCase());
  }), [propostas, dividas, q]);

  const open = (p?: Proposta) => {
    setForm(p ? {
      id_divida: p.id_divida, percentual_desconto: p.percentual_desconto,
      quantidade_parcelas: p.quantidade_parcelas, validade: p.validade.slice(0, 10),
    } : {
      id_divida: dividas[0]?.id_divida || "", percentual_desconto: 10, quantidade_parcelas: 6,
      validade: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
    });
    p ? dlg.openEdit(p) : dlg.openCreate();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const dv = dividas.find((d) => d.id_divida === form.id_divida);
    if (!dv) return toast.error("Selecione uma dívida.");
    const total = valorAtualizado(dv);
    const valorDesc = +(total * (1 - form.percentual_desconto / 100)).toFixed(2);
    const valorParc = +(valorDesc / form.quantidade_parcelas).toFixed(2);
    const payload = {
      id_divida: form.id_divida,
      percentual_desconto: +form.percentual_desconto,
      valor_com_desconto: valorDesc,
      quantidade_parcelas: +form.quantidade_parcelas,
      valor_parcela: valorParc,
      validade: new Date(form.validade).toISOString(),
    };
    if (dlg.editing) { updateProposta(dlg.editing.id_proposta, payload); toast.success("Proposta atualizada."); }
    else { addProposta(payload); toast.success("Proposta criada."); }
    dlg.close();
  };

  return (
    <div>
      <PageHeader title="Gestão de Propostas" subtitle="Crie propostas de renegociação para dívidas existentes." />
      <Toolbar q={q} setQ={setQ} onAdd={() => open()} addLabel="Nova proposta" />
      <DataTable
        columns={[
          { key: "divida", label: "Dívida", render: (r) => dividas.find((d) => d.id_divida === (r as unknown as Proposta).id_divida)?.numero || "—" },
          { key: "desc", label: "Desconto", align: "right", render: (r) => `${(r as unknown as Proposta).percentual_desconto}%` },
          { key: "valor", label: "Valor c/ desconto", align: "right", render: (r) => brl((r as unknown as Proposta).valor_com_desconto) },
          { key: "parc", label: "Parcelas", align: "right", render: (r) => `${(r as unknown as Proposta).quantidade_parcelas}x` },
          { key: "vparc", label: "Valor parcela", align: "right", render: (r) => brl((r as unknown as Proposta).valor_parcela) },
          { key: "validade", label: "Validade", render: (r) => dateBR((r as unknown as Proposta).validade) },
        ]}
        rows={rows as unknown as Record<string, unknown>[]}
        actions={(r) => (
          <RowActions
            onEdit={() => open(r as unknown as Proposta)}
            onDelete={() => { if (confirm("Excluir esta proposta?")) { removeProposta((r as unknown as Proposta).id_proposta); toast.success("Proposta excluída."); } }}
          />
        )}
      />
      <FormDialog open={dlg.open} onOpenChange={dlg.setOpen} title={dlg.editing ? "Editar proposta" : "Nova proposta"} onSubmit={submit}>
        <div className="space-y-1.5">
          <Label>Dívida</Label>
          <select value={form.id_divida} onChange={(e) => setForm({ ...form, id_divida: e.target.value })}
            className="w-full h-10 rounded-md bg-input border px-3 text-sm outline-none">
            {dividas.map((d) => <option key={d.id_divida} value={d.id_divida}>{d.numero} — {brl(valorAtualizado(d))}</option>)}
          </select>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="space-y-1.5"><Label>Desconto (%)</Label><Input type="number" min={0} max={100} value={form.percentual_desconto} onChange={(e) => setForm({ ...form, percentual_desconto: +e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Parcelas</Label><Input type="number" min={1} max={36} value={form.quantidade_parcelas} onChange={(e) => setForm({ ...form, quantidade_parcelas: +e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Validade</Label><Input type="date" value={form.validade} onChange={(e) => setForm({ ...form, validade: e.target.value })} /></div>
        </div>
      </FormDialog>
    </div>
  );
}
