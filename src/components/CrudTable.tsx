import { useState, type ReactNode } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export function Toolbar({ q, setQ, onAdd, addLabel }: { q: string; setQ: (v: string) => void; onAdd?: () => void; addLabel?: string }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={q} onChange={(e) => setQ(e.target.value)} placeholder="Pesquisar…"
          className="w-full h-11 rounded-lg bg-muted/40 border pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      {onAdd && (
        <Button onClick={onAdd} className="h-11">
          <Plus className="h-4 w-4 mr-1" /> {addLabel || "Adicionar"}
        </Button>
      )}
    </div>
  );
}

export function DataTable({ columns, rows, actions, empty }: {
  columns: { key: string; label: string; align?: "left" | "right"; render?: (row: Record<string, unknown>) => ReactNode }[];
  rows: Record<string, unknown>[];
  actions?: (row: Record<string, unknown>) => ReactNode;
  empty?: string;
}) {
  return (
    <div className="rounded-2xl border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className={`px-4 py-3 ${c.align === "right" ? "text-right" : "text-left"}`}>{c.label}</th>
              ))}
              {actions && <th className="px-4 py-3 text-right">Ações</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={(r.id as string) || i} className="border-t hover:bg-muted/20">
                {columns.map((c) => (
                  <td key={c.key} className={`px-4 py-3 ${c.align === "right" ? "text-right" : "text-left"}`}>
                    {c.render ? c.render(r) : String(r[c.key] ?? "—")}
                  </td>
                ))}
                {actions && <td className="px-4 py-3 text-right">{actions(r)}</td>}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-10 text-center text-muted-foreground">{empty || "Nenhum registro encontrado."}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function RowActions({ onEdit, onDelete }: { onEdit?: () => void; onDelete?: () => void }) {
  return (
    <div className="inline-flex gap-1">
      {onEdit && <Button size="icon" variant="ghost" onClick={onEdit} aria-label="Editar"><Pencil className="h-4 w-4" /></Button>}
      {onDelete && <Button size="icon" variant="ghost" onClick={onDelete} aria-label="Excluir" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>}
    </div>
  );
}

export function FormDialog({ open, onOpenChange, title, onSubmit, children, submitLabel }: {
  open: boolean; onOpenChange: (v: boolean) => void; title: string;
  onSubmit: (e: React.FormEvent) => void; children: ReactNode; submitLabel?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          {children}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">{submitLabel || "Salvar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function useCrudDialog<T>() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  return {
    open, setOpen, editing,
    openCreate: () => { setEditing(null); setOpen(true); },
    openEdit: (item: T) => { setEditing(item); setOpen(true); },
    close: () => setOpen(false),
  };
}
