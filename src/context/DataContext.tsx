import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

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

// mappers — Supabase row -> domain shape used across the UI
type Row = Record<string, unknown>;
const num = (v: unknown) => Number(v ?? 0);
const str = (v: unknown) => (v == null ? "" : String(v));

const mapCliente = (p: Row): Cliente => ({
  id_cliente: str(p.id),
  nome: str(p.nome),
  cpf: str(p.cpf),
  telefone: str(p.telefone),
  email: str(p.email),
});
const mapEmpresa = (e: Row): Empresa => ({
  id_empresa: str(e.id),
  nome: str(e.nome),
  cnpj: str(e.cnpj),
  email: str(e.email),
});
const mapDivida = (d: Row): Divida => ({
  id_divida: str(d.id),
  numero: str(d.numero),
  id_cliente: str(d.cliente_id),
  id_empresa: str(d.empresa_id),
  valor_original: num(d.valor_original),
  juros: num(d.juros),
  data_vencimento: str(d.data_vencimento),
  status: (d.status as DividaStatus) || "Em Aberto",
});
const mapProposta = (p: Row): Proposta => ({
  id_proposta: str(p.id),
  id_divida: str(p.divida_id),
  percentual_desconto: num(p.percentual_desconto),
  valor_com_desconto: num(p.valor_com_desconto),
  quantidade_parcelas: Number(p.quantidade_parcelas ?? 1),
  valor_parcela: num(p.valor_parcela),
  validade: str(p.validade),
});
const mapAcordo = (a: Row): Acordo => ({
  id_acordo: str(a.id),
  id_cliente: str(a.cliente_id),
  id_divida: str(a.divida_id),
  id_proposta: str(a.proposta_id),
  data_acordo: str(a.data_acordo),
  status: (a.status as AcordoStatus) || "Ativo",
});
const mapPagamento = (p: Row): Pagamento => ({
  id_pagamento: str(p.id),
  id_acordo: str(p.acordo_id),
  tipo_pagamento: (p.tipo_pagamento as TipoPagamento) || "Pix",
  valor: num(p.valor),
  codigo_pagamento: str(p.codigo_pagamento),
  data_pagamento: str(p.data_pagamento),
  status: (p.status as PagamentoStatus) || "Pendente",
});

interface Ctx extends State {
  loading: boolean;
  refresh: () => Promise<void>;

  // clientes (profiles) — admin manages existing signups
  addCliente: (c: Omit<Cliente, "id_cliente">) => Promise<void>;
  updateCliente: (id: string, patch: Partial<Cliente>) => Promise<void>;
  removeCliente: (id: string) => Promise<void>;

  addEmpresa: (e: Omit<Empresa, "id_empresa">) => Promise<void>;
  updateEmpresa: (id: string, patch: Partial<Empresa>) => Promise<void>;
  removeEmpresa: (id: string) => Promise<void>;

  addDivida: (d: Omit<Divida, "id_divida" | "numero"> & { numero?: string }) => Promise<void>;
  updateDivida: (id: string, patch: Partial<Divida>) => Promise<void>;
  removeDivida: (id: string) => Promise<void>;

  addProposta: (p: Omit<Proposta, "id_proposta">) => Promise<Proposta | null>;
  updateProposta: (id: string, patch: Partial<Proposta>) => Promise<void>;
  removeProposta: (id: string) => Promise<void>;

  createAcordo: (id_cliente: string, id_divida: string, id_proposta: string) => Promise<Acordo | null>;
  updateAcordoStatus: (id: string, status: AcordoStatus) => Promise<void>;

  createPagamento: (id_acordo: string, tipo: TipoPagamento, valor: number) => Promise<Pagamento | null>;
  confirmarPagamento: (id_pagamento: string) => Promise<void>;
  updatePagamentoStatus: (id: string, status: PagamentoStatus) => Promise<void>;
}

const C = createContext<Ctx | null>(null);

const EMPTY: State = { clientes: [], empresas: [], dividas: [], propostas: [], acordos: [], pagamentos: [] };

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<State>(EMPTY);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    if (!user) { setState(EMPTY); return; }
    setLoading(true);
    const [profiles, empresas, dividas, propostas, acordos, pagamentos] = await Promise.all([
      supabase.from("profiles").select("*"),
      supabase.from("empresas").select("*").order("nome"),
      supabase.from("dividas").select("*").order("created_at", { ascending: false }),
      supabase.from("propostas").select("*").order("created_at", { ascending: false }),
      supabase.from("acordos").select("*").order("created_at", { ascending: false }),
      supabase.from("pagamentos").select("*").order("created_at", { ascending: false }),
    ]);
    setState({
      clientes: (profiles.data || []).map(mapCliente),
      empresas: (empresas.data || []).map(mapEmpresa),
      dividas: (dividas.data || []).map(mapDivida),
      propostas: (propostas.data || []).map(mapProposta),
      acordos: (acordos.data || []).map(mapAcordo),
      pagamentos: (pagamentos.data || []).map(mapPagamento),
    });
    setLoading(false);
  };

  useEffect(() => { refresh(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [user?.id]);

  const api: Ctx = useMemo(() => ({
    ...state,
    loading,
    refresh,

    addCliente: async () => {
      // Clients self-sign-up via the login screen. Admin cannot create auth users from the UI.
      throw new Error("Clientes são criados via cadastro próprio.");
    },
    updateCliente: async (id, patch) => {
      await supabase.from("profiles").update({
        nome: patch.nome, cpf: patch.cpf, telefone: patch.telefone, email: patch.email,
      }).eq("id", id);
      await refresh();
    },
    removeCliente: async (id) => {
      await supabase.from("profiles").delete().eq("id", id);
      await refresh();
    },

    addEmpresa: async (e) => {
      await supabase.from("empresas").insert({ nome: e.nome, cnpj: e.cnpj, email: e.email });
      await refresh();
    },
    updateEmpresa: async (id, patch) => {
      const { id_empresa: _ignore, ...rest } = patch;
      void _ignore;
      await supabase.from("empresas").update(rest as never).eq("id", id);
      await refresh();
    },
    removeEmpresa: async (id) => {
      await supabase.from("empresas").delete().eq("id", id);
      await refresh();
    },

    addDivida: async (d) => {
      const numero = d.numero || `DIV-${2000 + state.dividas.length + 1}`;
      await supabase.from("dividas").insert({
        numero,
        cliente_id: d.id_cliente,
        empresa_id: d.id_empresa,
        valor_original: d.valor_original,
        juros: d.juros,
        data_vencimento: d.data_vencimento,
        status: d.status,
      });
      await refresh();
    },
    updateDivida: async (id, patch) => {
      const payload: Row = {};
      if (patch.numero !== undefined) payload.numero = patch.numero;
      if (patch.id_cliente !== undefined) payload.cliente_id = patch.id_cliente;
      if (patch.id_empresa !== undefined) payload.empresa_id = patch.id_empresa;
      if (patch.valor_original !== undefined) payload.valor_original = patch.valor_original;
      if (patch.juros !== undefined) payload.juros = patch.juros;
      if (patch.data_vencimento !== undefined) payload.data_vencimento = patch.data_vencimento;
      if (patch.status !== undefined) payload.status = patch.status;
      await supabase.from("dividas").update(payload as never).eq("id", id);
      await refresh();
    },
    removeDivida: async (id) => {
      await supabase.from("dividas").delete().eq("id", id);
      await refresh();
    },

    addProposta: async (p) => {
      const { data } = await supabase.from("propostas").insert({
        divida_id: p.id_divida,
        percentual_desconto: p.percentual_desconto,
        valor_com_desconto: p.valor_com_desconto,
        quantidade_parcelas: p.quantidade_parcelas,
        valor_parcela: p.valor_parcela,
        validade: p.validade,
      }).select().single();
      await refresh();
      return data ? mapProposta(data as Row) : null;
    },
    updateProposta: async (id, patch) => {
      const payload: Row = {};
      if (patch.id_divida !== undefined) payload.divida_id = patch.id_divida;
      if (patch.percentual_desconto !== undefined) payload.percentual_desconto = patch.percentual_desconto;
      if (patch.valor_com_desconto !== undefined) payload.valor_com_desconto = patch.valor_com_desconto;
      if (patch.quantidade_parcelas !== undefined) payload.quantidade_parcelas = patch.quantidade_parcelas;
      if (patch.valor_parcela !== undefined) payload.valor_parcela = patch.valor_parcela;
      if (patch.validade !== undefined) payload.validade = patch.validade;
      await supabase.from("propostas").update(payload as never).eq("id", id);
      await refresh();
    },
    removeProposta: async (id) => {
      await supabase.from("propostas").delete().eq("id", id);
      await refresh();
    },

    createAcordo: async (id_cliente, id_divida, id_proposta) => {
      const { data } = await supabase.from("acordos").insert({
        cliente_id: id_cliente,
        divida_id: id_divida,
        proposta_id: id_proposta,
        status: "Ativo",
      }).select().single();
      // mark divida as "Em Negociação" (admin-only; ignore if user lacks rights)
      await supabase.from("dividas").update({ status: "Em Negociação" }).eq("id", id_divida);
      await refresh();
      return data ? mapAcordo(data as Row) : null;
    },
    updateAcordoStatus: async (id, status) => {
      await supabase.from("acordos").update({ status }).eq("id", id);
      await refresh();
    },

    createPagamento: async (id_acordo, tipo, valor) => {
      const code = tipo === "Pix"
        ? `00020126${Math.random().toString(36).slice(2, 10).toUpperCase()}5204000053039865802BR`
        : `34191.79001 01043.510047 91020.150008 ${Math.floor(Math.random() * 9)} ${Math.floor(Math.random() * 90000000)}`;
      const { data } = await supabase.from("pagamentos").insert({
        acordo_id: id_acordo,
        tipo_pagamento: tipo,
        valor,
        codigo_pagamento: code,
        status: "Pendente",
      }).select().single();
      await refresh();
      return data ? mapPagamento(data as Row) : null;
    },
    confirmarPagamento: async (id_pagamento) => {
      const pag = state.pagamentos.find((x) => x.id_pagamento === id_pagamento);
      await supabase.from("pagamentos").update({ status: "Pago" }).eq("id", id_pagamento);
      if (pag) {
        const ac = state.acordos.find((a) => a.id_acordo === pag.id_acordo);
        await supabase.from("acordos").update({ status: "Pago" }).eq("id", pag.id_acordo);
        if (ac) await supabase.from("dividas").update({ status: "Quitada" }).eq("id", ac.id_divida);
      }
      await refresh();
    },
    updatePagamentoStatus: async (id, status) => {
      await supabase.from("pagamentos").update({ status }).eq("id", id);
      await refresh();
    },
  }), [state, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  return <C.Provider value={api}>{children}</C.Provider>;
}

export const useData = () => {
  const v = useContext(C);
  if (!v) throw new Error("DataProvider missing");
  return v;
};

export const valorAtualizado = (d: Divida) => d.valor_original + d.juros;
