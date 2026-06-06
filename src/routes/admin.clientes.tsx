import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { Toolbar, DataTable, RowActions, FormDialog, useCrudDialog } from "@/components/CrudTable";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useData, type Cliente } from "@/context/DataContext";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/clientes")({ component: Page });

function Page() {
  const { clientes, updateCliente, removeCliente } = useData();
  const [q, setQ] = useState("");
  const d = useCrudDialog<Cliente>();
  const [form, setForm] = useState({ nome: "", cpf: "", telefone: "", email: "" });

  const rows = useMemo(
    () => clientes.filter((c) => `${c.nome} ${c.cpf} ${c.email}`.toLowerCase().includes(q.toLowerCase())),
    [clientes, q],
  );

  const open = (c?: Cliente) => {
    setForm(c ? { nome: c.nome, cpf: c.cpf, telefone: c.telefone, email: c.email } : { nome: "", cpf: "", telefone: "", email: "" });
    if (c) d.openEdit(c);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!d.editing) return;
    if (!form.nome) return toast.error("Informe o nome.");
    await updateCliente(d.editing.id_cliente, form);
    toast.success("Cliente atualizado.");
    d.close();
  };

  return (
    <div>
      <PageHeader title="Gestão de Clientes" subtitle="Clientes cadastrados via auto-cadastro na plataforma." />
      <Toolbar q={q} setQ={setQ} />

      <DataTable
        columns={[
          { key: "nome", label: "Nome" },
          { key: "cpf", label: "CPF" },
          { key: "telefone", label: "Telefone" },
          { key: "email", label: "E-mail" },
        ]}
        rows={rows as unknown as Record<string, unknown>[]}
        actions={(r) => (
          <RowActions
            onEdit={() => open(r as unknown as Cliente)}
            onDelete={() => {
              if (confirm("Excluir este cliente? Isso removerá apenas o perfil interno.")) {
                removeCliente((r as unknown as Cliente).id_cliente).then(() => toast.success("Cliente excluído."));
              }
            }}
          />
        )}
      />
      <FormDialog open={d.open} onOpenChange={d.setOpen} title={d.editing ? "Editar cliente" : "Novo cliente"} onSubmit={submit}>
        <Field label="Nome"><Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></Field>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="CPF"><Input value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} placeholder="000.000.000-00" /></Field>
          <Field label="Telefone"><Input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} placeholder="(00) 00000-0000" /></Field>
        </div>
        <Field label="E-mail"><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
      </FormDialog>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}
