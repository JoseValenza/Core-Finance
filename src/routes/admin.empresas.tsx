import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { Toolbar, DataTable, RowActions, FormDialog, useCrudDialog } from "@/components/CrudTable";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useData, type Empresa } from "@/context/DataContext";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/empresas")({ component: Page });

function Page() {
  const { empresas, addEmpresa, updateEmpresa, removeEmpresa } = useData();
  const [q, setQ] = useState("");
  const d = useCrudDialog<Empresa>();
  const [form, setForm] = useState({ nome: "", cnpj: "", email: "" });

  const rows = useMemo(
    () => empresas.filter((c) => `${c.nome} ${c.cnpj} ${c.email}`.toLowerCase().includes(q.toLowerCase())),
    [empresas, q],
  );

  const open = (c?: Empresa) => {
    setForm(c ? { nome: c.nome, cnpj: c.cnpj, email: c.email } : { nome: "", cnpj: "", email: "" });
    c ? d.openEdit(c) : d.openCreate();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome) return toast.error("Informe o nome da empresa.");
    if (d.editing) { updateEmpresa(d.editing.id_empresa, form); toast.success("Empresa atualizada."); }
    else { addEmpresa(form); toast.success("Empresa cadastrada."); }
    d.close();
  };

  return (
    <div>
      <PageHeader title="Empresas Credoras" subtitle="Gerencie as empresas conectadas à plataforma." />
      <Toolbar q={q} setQ={setQ} onAdd={() => open()} addLabel="Nova empresa" />
      <DataTable
        columns={[
          { key: "nome", label: "Empresa" },
          { key: "cnpj", label: "CNPJ" },
          { key: "email", label: "E-mail" },
        ]}
        rows={rows as unknown as Record<string, unknown>[]}
        actions={(r) => (
          <RowActions
            onEdit={() => open(r as unknown as Empresa)}
            onDelete={() => { if (confirm("Excluir esta empresa?")) { removeEmpresa((r as unknown as Empresa).id_empresa); toast.success("Empresa excluída."); } }}
          />
        )}
      />
      <FormDialog open={d.open} onOpenChange={d.setOpen} title={d.editing ? "Editar empresa" : "Nova empresa"} onSubmit={submit}>
        <div className="space-y-1.5"><Label>Nome</Label><Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></div>
        <div className="space-y-1.5"><Label>CNPJ</Label><Input value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} placeholder="00.000.000/0000-00" /></div>
        <div className="space-y-1.5"><Label>E-mail</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
      </FormDialog>
    </div>
  );
}
