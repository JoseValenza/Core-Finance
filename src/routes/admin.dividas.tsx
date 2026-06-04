import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { Toolbar, DataTable, RowActions, FormDialog, useCrudDialog } from "@/components/CrudTable";
import { StatusBadge } from "@/components/StatCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useData, valorAtualizado, type Divida, type DividaStatus } from "@/context/DataContext";
import { brl, dateBR } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/dividas")({ component: Page });

interface FormState {
  id_cliente: string;
  id_empresa: string;
  valor_original: number;
  juros: number;
  data_vencimento: string;
  status: DividaStatus;
}

function Page() {
  const { dividas, clientes, empresas, addDivida, updateDivida, removeDivida } = useData();
  const [q, setQ] = useState("");
  const d = useCrudDialog<Divida>();
  const [form, setForm] = useState<FormState>({
    id_cliente: "", id_empresa: "", valor_original: 0, juros: 0,
    data_vencimento: new Date().toISOString().slice(0, 10), status: "Em Aberto",
  });

  const rows = useMemo(() => dividas.filter((dv) => {
    const cli = clientes.find((c) => c.id_cliente === dv.id_cliente)?.nome || "";
    const emp = empresas.find((e) => e.id_empresa === dv.id_empresa)?.nome || "";
    return `${dv.numero} ${cli} ${emp}`.toLowerCase().includes(q.toLowerCase());
  }), [dividas, clientes, empresas, q]);

  const open = (dv?: Divida) => {
    setForm(dv ? {
      id_cliente: dv.id_cliente, id_empresa: dv.id_empresa,
      valor_original: dv.valor_original, juros: dv.juros,
      data_vencimento: dv.data_vencimento.slice(0, 10), status: dv.status,
    } : {
      id_cliente: clientes[0]?.id_cliente || "", id_empresa: empresas[0]?.id_empresa || "",
      valor_original: 0, juros: 0,
      data_vencimento: new Date().toISOString().slice(0, 10), status: "Em Aberto",
    });
    dv ? d.openEdit(dv) : d.openCreate();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.id_cliente || !form.id_empresa) return toast.error("Selecione cliente e empresa.");
    const payload = {
      ...form,
      valor_original: Number(form.valor_original),
      juros: Number(form.juros),
      data_vencimento: new Date(form.data_vencimento).toISOString(),
    };
    if (d.editing) { updateDivida(d.editing.id_divida, payload); toast.success("Dívida atualizada."); }
    else { addDivida(payload); toast.success("Dívida cadastrada."); }
    d.close();
  };

  return (
    <div>
      <PageHeader title="Gestão de Dívidas" subtitle="Vincule dívidas a clientes e empresas credoras." />
      <Toolbar q={q} setQ={setQ} onAdd={() => open()} addLabel="Nova dívida" />
      <DataTable
        columns={[
          { key: "numero", label: "Número" },
          { key: "cliente", label: "Cliente", render: (r) => clientes.find((c) => c.id_cliente === (r as unknown as Divida).id_cliente)?.nome || "—" },
          { key: "empresa", label: "Empresa", render: (r) => empresas.find((e) => e.id_empresa === (r as unknown as Divida).id_empresa)?.nome || "—" },
          { key: "valor_original", label: "Original", align: "right", render: (r) => brl((r as unknown as Divida).valor_original) },
          { key: "juros", label: "Juros", align: "right", render: (r) => brl((r as unknown as Divida).juros) },
          { key: "atualizado", label: "Atualizado", align: "right", render: (r) => <span className="font-semibold">{brl(valorAtualizado(r as unknown as Divida))}</span> },
          { key: "venc", label: "Vencimento", render: (r) => dateBR((r as unknown as Divida).data_vencimento) },
          { key: "status", label: "Status", render: (r) => <StatusBadge status={(r as unknown as Divida).status} /> },
        ]}
        rows={rows as unknown as Record<string, unknown>[]}
        actions={(r) => (
          <RowActions
            onEdit={() => open(r as unknown as Divida)}
            onDelete={() => { if (confirm("Excluir esta dívida?")) { removeDivida((r as unknown as Divida).id_divida); toast.success("Dívida excluída."); } }}
          />
        )}
      />
      <FormDialog open={d.open} onOpenChange={d.setOpen} title={d.editing ? "Editar dívida" : "Nova dívida"} onSubmit={submit}>
        <div className="grid sm:grid-cols-2 gap-3">
          <Sel label="Cliente" value={form.id_cliente} onChange={(v) => setForm({ ...form, id_cliente: v })}
            options={clientes.map((c) => ({ value: c.id_cliente, label: c.nome }))} />
          <Sel label="Empresa Credora" value={form.id_empresa} onChange={(v) => setForm({ ...form, id_empresa: v })}
            options={empresas.map((e) => ({ value: e.id_empresa, label: e.nome }))} />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Valor original</Label><Input type="number" step="0.01" value={form.valor_original} onChange={(e) => setForm({ ...form, valor_original: +e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Juros</Label><Input type="number" step="0.01" value={form.juros} onChange={(e) => setForm({ ...form, juros: +e.target.value })} /></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Vencimento</Label><Input type="date" value={form.data_vencimento} onChange={(e) => setForm({ ...form, data_vencimento: e.target.value })} /></div>
          <Sel label="Status" value={form.status} onChange={(v) => setForm({ ...form, status: v as DividaStatus })}
            options={[{ value: "Em Aberto", label: "Em Aberto" }, { value: "Em Negociação", label: "Em Negociação" }, { value: "Quitada", label: "Quitada" }]} />
        </div>
      </FormDialog>
    </div>
  );
}

function Sel({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 rounded-md bg-input border px-3 text-sm outline-none focus:ring-2 focus:ring-ring">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
