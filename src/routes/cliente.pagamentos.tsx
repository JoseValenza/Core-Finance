import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { QrCode, Barcode, Copy, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useData, type TipoPagamento } from "@/context/DataContext";
import { PageHeader } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { brl, dateBR } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/cliente/pagamentos")({ component: Page });

function Page() {
  const { user } = useAuth();
  const { clientes, acordos, propostas, dividas, pagamentos, createPagamento, confirmarPagamento } = useData();
  const cliente = clientes.find((c) => c.email.toLowerCase() === user?.email.toLowerCase()) || clientes[0];

  const meusAcordos = acordos.filter((a) => a.id_cliente === cliente?.id_cliente);
  const [tipo, setTipo] = useState<TipoPagamento>("Pix");
  const [selectedAcordo, setSelectedAcordo] = useState<string | null>(
    meusAcordos.find((a) => a.status === "Ativo")?.id_acordo ?? null,
  );

  const ac = meusAcordos.find((a) => a.id_acordo === selectedAcordo);
  const prop = ac ? propostas.find((p) => p.id_proposta === ac.id_proposta) : null;
  const div = ac ? dividas.find((d) => d.id_divida === ac.id_divida) : null;
  const pagAtual = pagamentos.filter((p) => p.id_acordo === selectedAcordo).slice(-1)[0];

  const gerar = () => {
    if (!ac || !prop) return;
    createPagamento(ac.id_acordo, tipo, prop.valor_com_desconto);
    toast.success(`${tipo} gerado com sucesso.`);
  };

  return (
    <div>
      <PageHeader title="Pagamentos" subtitle="Gere Pix ou boleto e confirme suas parcelas." />

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="rounded-2xl border bg-card p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Acordos ativos</div>
          <div className="space-y-2">
            {meusAcordos.map((a) => {
              const d = dividas.find((x) => x.id_divida === a.id_divida);
              const p = propostas.find((x) => x.id_proposta === a.id_proposta);
              const active = selectedAcordo === a.id_acordo;
              return (
                <button
                  key={a.id_acordo} onClick={() => setSelectedAcordo(a.id_acordo)}
                  className={`w-full text-left p-3 rounded-lg border transition ${active ? "border-primary bg-primary/10" : "hover:border-primary/40"}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{d?.numero}</span>
                    <StatusBadge status={a.status} />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Acordo de {dateBR(a.data_acordo)}</div>
                  <div className="text-sm font-semibold mt-2">{brl(p?.valor_com_desconto || 0)}</div>
                </button>
              );
            })}
            {meusAcordos.length === 0 && (
              <div className="text-sm text-muted-foreground p-4 text-center">Nenhum acordo. Inicie uma negociação.</div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 rounded-2xl border bg-card p-6">
          {ac && prop && div ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Pagamento</div>
                  <div className="text-xl font-semibold">{div.numero}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Total</div>
                  <div className="text-2xl font-semibold">{brl(prop.valor_com_desconto)}</div>
                  <div className="text-xs text-muted-foreground">{prop.quantidade_parcelas}x de {brl(prop.valor_parcela)}</div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-2 p-1 rounded-xl bg-muted/40 border w-full sm:w-fit">
                {(["Pix", "Boleto"] as const).map((t) => {
                  const ActiveIcon = t === "Pix" ? QrCode : Barcode;
                  const active = tipo === t;
                  return (
                    <button
                      key={t} onClick={() => setTipo(t)}
                      className={`px-5 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2 ${
                        active ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                      }`}
                    >
                      <ActiveIcon className="h-4 w-4" /> {t}
                    </button>
                  );
                })}
              </div>

              {!pagAtual || pagAtual.status !== "Pendente" ? (
                <div className="mt-6">
                  <Button onClick={gerar}>Gerar {tipo}</Button>
                </div>
              ) : (
                <div className="mt-6 rounded-xl border bg-muted/30 p-5">
                  <div className="flex items-center gap-3">
                    {pagAtual.tipo_pagamento === "Pix" ? <QrCode className="h-5 w-5 text-primary" /> : <Barcode className="h-5 w-5 text-primary" />}
                    <div className="font-medium">Código de pagamento ({pagAtual.tipo_pagamento})</div>
                  </div>
                  {pagAtual.tipo_pagamento === "Pix" && (
                    <div className="mt-4 flex justify-center">
                      <div className="h-44 w-44 rounded-lg bg-foreground/95 grid grid-cols-12 gap-px p-2">
                        {Array.from({ length: 144 }).map((_, i) => (
                          <div key={i} className={(i * 7 + pagAtual.codigo_pagamento.charCodeAt(i % pagAtual.codigo_pagamento.length)) % 3 === 0 ? "bg-background" : ""} />
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="mt-4 flex gap-2">
                    <code className="flex-1 break-all text-xs bg-background border rounded-lg p-3">{pagAtual.codigo_pagamento}</code>
                    <Button variant="secondary" onClick={() => { navigator.clipboard.writeText(pagAtual.codigo_pagamento); toast.success("Código copiado."); }}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button className="mt-4 w-full" onClick={() => { confirmarPagamento(pagAtual.id_pagamento); toast.success("Pagamento confirmado!"); }}>
                    <CheckCircle2 className="h-4 w-4 mr-2" /> Confirmar pagamento
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-muted-foreground py-16">
              Selecione um acordo para gerar o pagamento.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
