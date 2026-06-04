import { brl } from "@/lib/format";
import type { ReactNode } from "react";

export function StatCard({
  label, value, hint, icon, accent = "primary",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  accent?: "primary" | "success" | "warning" | "destructive";
}) {
  const tone = {
    primary: "from-primary/20 to-primary/5 text-primary",
    success: "from-success/20 to-success/5 text-success",
    warning: "from-warning/20 to-warning/5 text-warning",
    destructive: "from-destructive/20 to-destructive/5 text-destructive",
  }[accent];
  return (
    <div className="rounded-2xl border bg-card p-5 hover:border-primary/40 transition">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
          {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
        </div>
        {icon && (
          <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${tone} flex items-center justify-center border border-current/20`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

export function MoneyStat(props: Omit<Parameters<typeof StatCard>[0], "value"> & { value: number }) {
  return <StatCard {...props} value={brl(props.value)} />;
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    "Em Aberto": "bg-warning/15 text-warning border-warning/30",
    "Em Negociação": "bg-primary/15 text-primary border-primary/30",
    "Quitada": "bg-success/15 text-success border-success/30",
    "Pago": "bg-success/15 text-success border-success/30",
    "Pendente": "bg-warning/15 text-warning border-warning/30",
    "Ativo": "bg-primary/15 text-primary border-primary/30",
    "Cancelado": "bg-destructive/15 text-destructive border-destructive/30",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${map[status] || "bg-muted text-muted-foreground border-border"}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
