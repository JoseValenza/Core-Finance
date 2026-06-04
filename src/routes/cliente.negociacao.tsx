import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Sparkles, Calculator, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useData, valorAtualizado, type Divida } from "@/context/DataContext";
import { PageHeader } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { brl, dateBR } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/cliente/negociacao")({ component: Page });

function Page() {
  const { user } = useAuth();
  const { clientes, dividas, propostas, empresas, addProposta, createAcordo } = useData();
  const cliente = clientes.find((c) => c.email.toLowerCase() === user?.email.toLowerCase()) || clientes[0];
  const nav = useNavigate();

  const minhas = dividas.filter((d) => d.id_cliente === cliente?.id_cliente && d.status !== "Quitada");
  const [selectedId, setSelectedId] = useState<string | null>(minhas[0]?.id_divida ?? null);
  const selected = minhas.find((d) => d.id_divida === selectedId) || null;

  const dispProps = useMemo(
    () => (selected ? propostas.filter((p) => p.id_divida === selected.id_divida) : []),
    [propostas, selected],
  );

  // Auto-generate proposals on-demand if none exist
  const ensureProposals = (d: Divida) => {
    if (propostas.some((p) => p.id_divida === d.id_divida)) return;
    const total = valorAtualizado(d);
    const validade = new Date();
    validade.setDate(validade.getDate() + 15);
    const tiers = [
      { desc: 30, parc: 1 },
      { desc: 20, parc: 6 },
      { desc: 10, parc: 12 },
    ];
    tiers.forEach((t) => {
      const valorDesc = +(total * (1 - t.desc / 100)).toFixed(2);
      addProposta({
        id_divida: d.id_divida,
        percentual_desconto: t.desc,
        valor_com_desconto: valorDesc,
        quantidade_parcelas: t.parc,
        valor_parcela: +(valorDesc / t.parc).toFixed(2),
        validade: validade.toISOString(),
      });
    });
    toast.success("Propostas atualizadas para esta dívida.");
  };

  const aceitar = (propId: string) => {
    if (!selected || !cliente) return;
    createAcordo(cliente.id_cliente, selected.id_divida, propId);
    toast.success("Acordo criado! Prossiga para o pagamento.");
    nav({ to: "/cliente/pagamentos" });
  };

  return (
    <div>
      <PageHeader title="Negociação" subtitle="Selecione uma dívida e escolha a melhor condição para você." />

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 rounded-2xl border bg-card p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Dívidas elegíveis</div>
          <div className="space-y-2">
            {minhas.map((d) => {
              const active = selectedId === d.id_divida;
              return (
                <button
                  key={d.id_divida} onClick={() => setSelectedId(d.id_divida)}
                  className={`w-full text-left p-3 rounded-lg border transition ${
                    active ? "border-primary bg-primary/10" : "hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{d.numero}</span>
                    <StatusBadge status={d.status} />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {empresas.find((e) => e.id_empresa === d.id_empresa)?.nome}
                  </div>
                  <div className="text-sm font-semibold mt-2">{brl(valorAtualizado(d))}</div>
                </button>
              );
            })}
            {minhas.length === 0 && (
              <div className="text-sm text-muted-foreground p-4 text-center">Sem dívidas pendentes.</div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {selected ? (
            <>
              <div className="rounded-2xl border bg-gradient-to-br from-primary/10 to-chart-4/10 p-6">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-primary font-medium">Dívida selecionada</div>
                    <div className="text-2xl font-semibold mt-1">{selected.numero}</div>
                    <div className="text-sm text-muted-foreground">
                      Vencimento original: {dateBR(selected.data_vencimento)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Valor atualizado</div>
                    <div className="text-2xl font-semibold">{brl(valorAtualizado(selected))}</div>
                  </div>
                </div>
                {dispProps.length === 0 && (
                  <Button className="mt-4" onClick={() => ensureProposals(selected)}>
                    <Sparkles className="h-4 w-4 mr-2" /> Gerar propostas personalizadas
                  </Button>
                )}
              </div>

              {dispProps.length > 0 && (
                <div className="grid sm:grid-cols-3 gap-4">
                  {dispProps.map((p, i) => {
                    const featured = i === 1;
                    return (
                      <div
                        key={p.id_proposta}
                        className={`rounded-2xl border p-5 flex flex-col ${
                          featured ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" : "bg-card"
                        }`}
                      >
                        {featured && (
                          <div className="text-[10px] uppercase tracking-wider text-primary font-semibold mb-2">Mais escolhida</div>
                        )}
                        <div className="text-3xl font-semibold">{p.percentual_desconto}%</div>
                        <div className="text-xs text-muted-foreground">de desconto</div>
                        <div className="mt-4 space-y-1 text-sm">
                          <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-medium">{brl(p.valor_com_desconto)}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Parcelas</span><span className="font-medium">{p.quantidade_parcelas}x</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Parcela</span><span className="font-medium">{brl(p.valor_parcela)}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Validade</span><span className="font-medium">{dateBR(p.validade)}</span></div>
                        </div>
                        <Button className="mt-5" variant={featured ? "default" : "secondary"} onClick={() => aceitar(p.id_proposta)}>
                          Aceitar <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}

              <Simulador divida={selected} />
            </>
          ) : (
            <div className="rounded-2xl border bg-card p-10 text-center text-muted-foreground">
              Selecione uma dívida ao lado para iniciar a negociação.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Simulador({ divida }: { divida: Divida }) {
  const [parcelas, setParcelas] = useState(6);
  const total = valorAtualizado(divida);
  const desconto = parcelas === 1 ? 30 : parcelas <= 6 ? 20 : parcelas <= 12 ? 10 : 5;
  const valorDesc = total * (1 - desconto / 100);
  const valorParc = valorDesc / parcelas;

  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="h-4 w-4 text-primary" />
        <h3 className="font-semibold">Simulador de parcelamento</h3>
      </div>
      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <label className="text-xs uppercase tracking-wider text-muted-foreground">Quantidade de parcelas: <span className="text-foreground font-semibold">{parcelas}x</span></label>
          <input
            type="range" min={1} max={24} value={parcelas}
            onChange={(e) => setParcelas(+e.target.value)}
            className="w-full mt-3 accent-primary"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>1x</span><span>12x</span><span>24x</span>
          </div>
        </div>
        <div className="rounded-xl border bg-muted/30 p-4 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Desconto aplicado</span><span className="font-medium text-success">{desconto}%</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Total com desconto</span><span className="font-semibold">{brl(valorDesc)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Valor por parcela</span><span className="font-semibold text-primary">{brl(valorParc)}</span></div>
        </div>
      </div>
    </div>
  );
}
