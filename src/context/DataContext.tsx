import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { uid } from "@/lib/format";

export type DividaStatus = "Em Aberto" | "Em Negociação" | "Quitada";
export type AcordoStatus = "Pendente" | "Ativo" | "Pago" | "Cancelado";
export type PagamentoStatus = "Pendente" | "Pago" | "Cancelado";
export type TipoPagamento = "Pix" | "Boleto";

export interface Cliente {
  id_cliente: string;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
}
export interface Empresa {
  id_empresa: string;
  nome: string;
  cnpj: string;
  email: string;
}
export interface Divida {
  id_divida: string;
  numero: string;
  id_cliente: string;
  id_empresa: string;
  valor_original: number;
  juros: number;
  data_vencimento: string;
  status: DividaStatus;
}
export interface Proposta {
  id_proposta: string;
  id_divida: string;
  percentual_desconto: number;
  valor_com_desconto: number;
  quantidade_parcelas: number;
  valor_parcela: number;
  validade: string;
}
export interface Acordo {
  id_acordo: string;
  id_cliente: string;
  id_divida: string;
  id_proposta: string;
  data_acordo: string;
  status: AcordoStatus;
}
export interface Pagamento {
  id_pagamento: string;
  id_acordo: string;
  tipo_pagamento: TipoPagamento;
  valor: number;
  codigo_pagamento: string;
  data_pagamento: string;
  status: PagamentoStatus;
}

interface State {
  clientes: Cliente[];
  empresas: Empresa[];
  dividas: Divida[];
  propostas: Proposta[];
  acordos: Acordo[];
  pagamentos: Pagamento[];
}

const KEY = "cf_data_v1";

const seed = (): State => {
  const e1 = { id_empresa: uid("emp"), nome: "Banco Sentinela S.A.", cnpj: "12.345.678/0001-90", email: "contato@sentinela.com.br" };
  const e2 = { id_empresa: uid("emp"), nome: "Crédito Vértice", cnpj: "98.765.432/0001-12", email: "ri@vertice.com.br" };
  const e3 = { id_empresa: uid("emp"), nome: "Fomento Atlas", cnpj: "55.444.333/0001-22", email: "atendimento@atlas.com.br" };

  const c1 = { id_cliente: uid("cli"), nome: "Marina Albuquerque", cpf: "123.456.789-00", telefone: "(11) 98123-4521", email: "marina.albuquerque@corefin.app" };
  const c2 = { id_cliente: uid("cli"), nome: "Rafael Monteiro", cpf: "987.654.321-00", telefone: "(21) 99654-8810", email: "rafael.monteiro@corefin.app" };
  const c3 = { id_cliente: uid("cli"), nome: "Juliana Tavares", cpf: "456.789.123-00", telefone: "(31) 99812-3344", email: "juliana.tavares@corefin.app" };
  const c4 = { id_cliente: uid("cli"), nome: "André Lacerda", cpf: "321.654.987-00", telefone: "(41) 99311-2200", email: "andre.lacerda@corefin.app" };

  const today = new Date();
  const dt = (offsetDays: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString();
  };

  const mkDiv = (id_cliente: string, id_empresa: string, valor: number, juros: number, vencOffset: number, status: DividaStatus, n: string): Divida => ({
    id_divida: uid("div"), numero: n, id_cliente, id_empresa, valor_original: valor, juros, data_vencimento: dt(vencOffset), status,
  });

  const dividas: Divida[] = [
    mkDiv(c1.id_cliente, e1.id_empresa, 4820.5, 612.3, -45, "Em Aberto", "DIV-2041"),
    mkDiv(c1.id_cliente, e2.id_empresa, 1250, 110.4, -10, "Em Aberto", "DIV-2042"),
    mkDiv(c1.id_cliente, e3.id_empresa, 8900, 1320, -120, "Em Negociação", "DIV-2043"),
    mkDiv(c2.id_cliente, e1.id_empresa, 3200, 280, -30, "Em Aberto", "DIV-2044"),
    mkDiv(c2.id_cliente, e2.id_empresa, 540, 32, 5, "Quitada", "DIV-2045"),
    mkDiv(c3.id_cliente, e3.id_empresa, 15400, 2120, -60, "Em Negociação", "DIV-2046"),
    mkDiv(c4.id_cliente, e1.id_empresa, 980, 88, -15, "Em Aberto", "DIV-2047"),
    mkDiv(c4.id_cliente, e2.id_empresa, 6700, 940, -90, "Em Aberto", "DIV-2048"),
  ];

  return {
    clientes: [c1, c2, c3, c4],
    empresas: [e1, e2, e3],
    dividas,
    propostas: [],
    acordos: [],
    pagamentos: [],
  };
};

interface Ctx extends State {
  // generic
  setState: (updater: (s: State) => State) => void;
  // clientes
  addCliente: (c: Omit<Cliente, "id_cliente">) => void;
  updateCliente: (id: string, patch: Partial<Cliente>) => void;
  removeCliente: (id: string) => void;
  // empresas
  addEmpresa: (e: Omit<Empresa, "id_empresa">) => void;
  updateEmpresa: (id: string, patch: Partial<Empresa>) => void;
  removeEmpresa: (id: string) => void;
  // dividas
  addDivida: (d: Omit<Divida, "id_divida" | "numero"> & { numero?: string }) => void;
  updateDivida: (id: string, patch: Partial<Divida>) => void;
  removeDivida: (id: string) => void;
  // propostas
  addProposta: (p: Omit<Proposta, "id_proposta">) => Proposta;
  updateProposta: (id: string, patch: Partial<Proposta>) => void;
  removeProposta: (id: string) => void;
  // acordos
  createAcordo: (id_cliente: string, id_divida: string, id_proposta: string) => Acordo;
  updateAcordoStatus: (id: string, status: AcordoStatus) => void;
  // pagamentos
  createPagamento: (id_acordo: string, tipo: TipoPagamento, valor: number) => Pagamento;
  confirmarPagamento: (id_pagamento: string) => void;
  updatePagamentoStatus: (id: string, status: PagamentoStatus) => void;
}

const C = createContext<Ctx | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, setStateRaw] = useState<State>(() => {
    if (typeof window === "undefined") return seed();
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw) as State;
    } catch {}
    const s = seed();
    localStorage.setItem(KEY, JSON.stringify(s));
    return s;
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);

  const setState = (updater: (s: State) => State) => setStateRaw((s) => updater(s));

  const api: Ctx = useMemo(
    () => ({
      ...state,
      setState,
      addCliente: (c) => setState((s) => ({ ...s, clientes: [...s.clientes, { ...c, id_cliente: uid("cli") }] })),
      updateCliente: (id, patch) =>
        setState((s) => ({ ...s, clientes: s.clientes.map((x) => (x.id_cliente === id ? { ...x, ...patch } : x)) })),
      removeCliente: (id) => setState((s) => ({ ...s, clientes: s.clientes.filter((x) => x.id_cliente !== id) })),

      addEmpresa: (e) => setState((s) => ({ ...s, empresas: [...s.empresas, { ...e, id_empresa: uid("emp") }] })),
      updateEmpresa: (id, patch) =>
        setState((s) => ({ ...s, empresas: s.empresas.map((x) => (x.id_empresa === id ? { ...x, ...patch } : x)) })),
      removeEmpresa: (id) => setState((s) => ({ ...s, empresas: s.empresas.filter((x) => x.id_empresa !== id) })),

      addDivida: (d) =>
        setState((s) => ({
          ...s,
          dividas: [...s.dividas, { ...d, id_divida: uid("div"), numero: d.numero || `DIV-${2000 + s.dividas.length + 1}` }],
        })),
      updateDivida: (id, patch) =>
        setState((s) => ({ ...s, dividas: s.dividas.map((x) => (x.id_divida === id ? { ...x, ...patch } : x)) })),
      removeDivida: (id) => setState((s) => ({ ...s, dividas: s.dividas.filter((x) => x.id_divida !== id) })),

      addProposta: (p) => {
        const np: Proposta = { ...p, id_proposta: uid("prop") };
        setState((s) => ({ ...s, propostas: [...s.propostas, np] }));
        return np;
      },
      updateProposta: (id, patch) =>
        setState((s) => ({ ...s, propostas: s.propostas.map((x) => (x.id_proposta === id ? { ...x, ...patch } : x)) })),
      removeProposta: (id) => setState((s) => ({ ...s, propostas: s.propostas.filter((x) => x.id_proposta !== id) })),

      createAcordo: (id_cliente, id_divida, id_proposta) => {
        const a: Acordo = {
          id_acordo: uid("acd"),
          id_cliente,
          id_divida,
          id_proposta,
          data_acordo: new Date().toISOString(),
          status: "Ativo",
        };
        setState((s) => ({
          ...s,
          acordos: [...s.acordos, a],
          dividas: s.dividas.map((d) => (d.id_divida === id_divida ? { ...d, status: "Em Negociação" } : d)),
        }));
        return a;
      },
      updateAcordoStatus: (id, status) =>
        setState((s) => ({ ...s, acordos: s.acordos.map((x) => (x.id_acordo === id ? { ...x, status } : x)) })),

      createPagamento: (id_acordo, tipo, valor) => {
        const code =
          tipo === "Pix"
            ? `00020126${Math.random().toString(36).slice(2, 10).toUpperCase()}5204000053039865802BR`
            : `34191.79001 01043.510047 91020.150008 ${Math.floor(Math.random() * 9)} ${Math.floor(Math.random() * 90000000)}`;
        const p: Pagamento = {
          id_pagamento: uid("pag"),
          id_acordo,
          tipo_pagamento: tipo,
          valor,
          codigo_pagamento: code,
          data_pagamento: new Date().toISOString(),
          status: "Pendente",
        };
        setState((s) => ({ ...s, pagamentos: [...s.pagamentos, p] }));
        return p;
      },
      confirmarPagamento: (id_pagamento) =>
        setState((s) => {
          const pag = s.pagamentos.find((x) => x.id_pagamento === id_pagamento);
          if (!pag) return s;
          const acordo = s.acordos.find((a) => a.id_acordo === pag.id_acordo);
          return {
            ...s,
            pagamentos: s.pagamentos.map((x) => (x.id_pagamento === id_pagamento ? { ...x, status: "Pago" } : x)),
            acordos: s.acordos.map((a) => (a.id_acordo === pag.id_acordo ? { ...a, status: "Pago" } : a)),
            dividas: acordo
              ? s.dividas.map((d) => (d.id_divida === acordo.id_divida ? { ...d, status: "Quitada" } : d))
              : s.dividas,
          };
        }),
      updatePagamentoStatus: (id, status) =>
        setState((s) => ({ ...s, pagamentos: s.pagamentos.map((x) => (x.id_pagamento === id ? { ...x, status } : x)) })),
    }),
    [state],
  );

  return <C.Provider value={api}>{children}</C.Provider>;
}

export const useData = () => {
  const v = useContext(C);
  if (!v) throw new Error("DataProvider missing");
  return v;
};

export const valorAtualizado = (d: Divida) => d.valor_original + d.juros;
