import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { Receipt, Wallet, BadgeCheck, CheckCircle2, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useData, valorAtualizado } from "@/context/DataContext";
import { PageHeader } from "@/components/AppShell";
import { MoneyStat, StatCard, StatusBadge } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { brl, dateBR } from "@/lib/format";

export const Route = createFileRoute("/cliente/dashboard")({ component: ClienteDashboard });

function ClienteDashboard() {
  const { user } = useAuth();
  const { clientes, dividas, acordos } = useData();
  const nav = useNavigate();

  // Map session email → cliente (fallback to first cliente)
  const cliente = useMemo(
    () => clientes.find((c) => c.email.toLowerCase() === user?.email.toLowerCase()) || clientes[0],
    [clientes, user],
  );

  const minhas = dividas.filter((d) => d.id_cliente === cliente?.id_cliente);
  const meusAcordos = acordos.filter((a) => a.id_cliente === cliente?.id_cliente);

  const total = minhas.length;
  const aberto = minhas.filter((d) => d.status !== "Quitada").reduce((s, d) => s + valorAtualizado(d), 0);
  const ativos = meusAcordos.filter((a) => a.status === "Ativo").length;
  const quitadas = minhas.filter((d) => d.status === "Quitada").length;

  return (
    <div>
      <PageHeader
        title={`Olá, ${user?.name.split(" ")[0]}`}
        subtitle="Acompanhe seu panorama financeiro e renegocie suas pendências com poucos cliques."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total de dívidas" value={total} hint="Registros vinculados ao CPF" icon={<Receipt className="h-5 w-5" />} />
        <MoneyStat label="Valor em aberto" value={aberto} hint="Soma atualizada com juros" icon={<Wallet className="h-5 w-5" />} accent="warning" />
        <StatCard label="Acordos ativos" value={ativos} hint="Em andamento" icon={<BadgeCheck className="h-5 w-5" />} accent="primary" />
        <StatCard label="Dívidas quitadas" value={quitadas} hint="Histórico positivo" icon={<CheckCircle2 className="h-5 w-5" />} accent="success" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-6">
        <div className="lg:col-span-2 rounded-2xl border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Dívidas em destaque</h2>
            <Button variant="ghost" size="sm" onClick={() => nav({ to: "/cliente/dividas" })}>
              Ver todas <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="space-y-3">
            {minhas.slice(0, 4).map((d) => (
              <div key={d.id_divida} className="flex items-center justify-between gap-4 p-3 rounded-lg border hover:border-primary/40 transition">
                <div className="min-w-0">
                  <div className="font-medium truncate">{d.numero}</div>
                  <div className="text-xs text-muted-foreground">Vence em {dateBR(d.data_vencimento)}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{brl(valorAtualizado(d))}</div>
                  <div className="mt-1"><StatusBadge status={d.status} /></div>
                </div>
              </div>
            ))}
            {minhas.length === 0 && <div className="text-sm text-muted-foreground">Nenhuma dívida registrada.</div>}
          </div>
        </div>

        <div className="rounded-2xl border bg-gradient-to-br from-primary/10 to-chart-4/10 p-6 flex flex-col">
          <div className="text-xs uppercase tracking-wider text-primary font-medium">Oportunidade</div>
          <h3 className="mt-2 text-lg font-semibold">Renegocie com desconto</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Acesse propostas exclusivas e parcele suas dívidas em condições especiais.
          </p>
          <Button className="mt-auto" onClick={() => nav({ to: "/cliente/negociacao" })}>
            Iniciar negociação
          </Button>
        </div>
      </div>
    </div>
  );
}
