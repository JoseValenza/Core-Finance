import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Users, Receipt, BadgeCheck, CreditCard, TrendingUp, Wallet, PiggyBank } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import { useData, valorAtualizado } from "@/context/DataContext";
import { PageHeader } from "@/components/AppShell";
import { MoneyStat, StatCard } from "@/components/StatCard";
import { brl } from "@/lib/format";

export const Route = createFileRoute("/admin/dashboard")({ component: AdminDashboard });

const CHART_COLORS = ["oklch(0.72 0.16 240)", "oklch(0.7 0.16 155)", "oklch(0.78 0.15 75)", "oklch(0.62 0.22 25)"];

function AdminDashboard() {
  const { clientes, dividas, acordos, pagamentos } = useData();

  const stats = useMemo(() => {
    const recuperado = pagamentos.filter((p) => p.status === "Pago").reduce((s, p) => s + p.valor, 0);
    const pendente = dividas.filter((d) => d.status !== "Quitada").reduce((s, d) => s + valorAtualizado(d), 0);
    const total = pendente + recuperado;
    const taxa = total > 0 ? (recuperado / total) * 100 : 0;
    return { recuperado, pendente, taxa };
  }, [pagamentos, dividas]);

  const porStatus = useMemo(() => {
    const m: Record<string, number> = {};
    dividas.forEach((d) => { m[d.status] = (m[d.status] || 0) + 1; });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [dividas]);

  const acordosMes = useMemo(() => {
    const labels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const now = new Date();
    const arr = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return { mes: labels[d.getMonth()], acordos: 0, recuperado: 0 };
    });
    acordos.forEach((a) => {
      const d = new Date(a.data_acordo);
      const diff = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
      if (diff >= 0 && diff < 6) arr[5 - diff].acordos += 1;
    });
    pagamentos.filter((p) => p.status === "Pago").forEach((p) => {
      const d = new Date(p.data_pagamento);
      const diff = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
      if (diff >= 0 && diff < 6) arr[5 - diff].recuperado += p.valor;
    });
    // Add some baseline so chart is alive even with no acordos
    if (arr.every((x) => x.acordos === 0 && x.recuperado === 0)) {
      arr.forEach((x, i) => { x.acordos = 0; x.recuperado = 0; void i; });
    }
    return arr;
  }, [acordos, pagamentos]);

  return (
    <div>
      <PageHeader title="Painel Gerencial" subtitle="Visão consolidada da recuperação financeira." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Clientes" value={clientes.length} icon={<Users className="h-5 w-5" />} />
        <StatCard label="Dívidas" value={dividas.length} icon={<Receipt className="h-5 w-5" />} accent="warning" />
        <StatCard label="Acordos" value={acordos.length} icon={<BadgeCheck className="h-5 w-5" />} accent="primary" />
        <StatCard label="Pagamentos" value={pagamentos.length} icon={<CreditCard className="h-5 w-5" />} accent="success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <MoneyStat label="Valor Recuperado" value={stats.recuperado} icon={<PiggyBank className="h-5 w-5" />} accent="success" hint="Total liquidado" />
        <MoneyStat label="Valor Pendente" value={stats.pendente} icon={<Wallet className="h-5 w-5" />} accent="warning" hint="A receber" />
        <StatCard label="Taxa de Recuperação" value={`${stats.taxa.toFixed(1)}%`} icon={<TrendingUp className="h-5 w-5" />} accent="primary" hint="Recuperado / total" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-6">
        <div className="lg:col-span-2 rounded-2xl border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold">Recuperação financeira</h2>
              <p className="text-xs text-muted-foreground">Últimos 6 meses</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={acordosMes}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS[0]} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={CHART_COLORS[0]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.04 260)" />
                <XAxis dataKey="mes" stroke="oklch(0.72 0.03 255)" />
                <YAxis stroke="oklch(0.72 0.03 255)" tickFormatter={(v) => `R$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ background: "oklch(0.22 0.045 260)", border: "1px solid oklch(0.3 0.04 260)", borderRadius: 12 }}
                  formatter={(v: number) => brl(v)}
                />
                <Area type="monotone" dataKey="recuperado" stroke={CHART_COLORS[0]} fill="url(#g1)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5">
          <h2 className="font-semibold mb-1">Dívidas por status</h2>
          <p className="text-xs text-muted-foreground mb-4">Distribuição atual</p>
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={porStatus} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={3}>
                  {porStatus.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "oklch(0.22 0.045 260)", border: "1px solid oklch(0.3 0.04 260)", borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {porStatus.map((s, i) => (
              <div key={s.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <span>{s.name}</span>
                </div>
                <span className="font-medium">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-5 mt-4">
        <h2 className="font-semibold mb-1">Acordos por período</h2>
        <p className="text-xs text-muted-foreground mb-4">Volume mensal</p>
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={acordosMes}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.04 260)" />
              <XAxis dataKey="mes" stroke="oklch(0.72 0.03 255)" />
              <YAxis stroke="oklch(0.72 0.03 255)" allowDecimals={false} />
              <Tooltip contentStyle={{ background: "oklch(0.22 0.045 260)", border: "1px solid oklch(0.3 0.04 260)", borderRadius: 12 }} />
              <Bar dataKey="acordos" fill={CHART_COLORS[0]} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
