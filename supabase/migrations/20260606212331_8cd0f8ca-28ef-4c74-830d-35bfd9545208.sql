
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'cliente');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL DEFAULT '',
  cpf TEXT,
  telefone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Profiles policies
CREATE POLICY "Profiles: self select" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Profiles: self update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Profiles: admin insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Profiles: admin delete" ON public.profiles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- User_roles policies
CREATE POLICY "Roles: read own" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Roles: admin manage" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Auto-create profile + default cliente role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'cliente');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Empresas
CREATE TABLE public.empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  cnpj TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.empresas TO authenticated;
GRANT ALL ON public.empresas TO service_role;
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Empresas: read authenticated" ON public.empresas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Empresas: admin write" ON public.empresas FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Empresas: admin update" ON public.empresas FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Empresas: admin delete" ON public.empresas FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_empresas_updated BEFORE UPDATE ON public.empresas FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Dividas
CREATE TYPE public.divida_status AS ENUM ('Em Aberto', 'Em Negociação', 'Quitada');
CREATE TABLE public.dividas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero TEXT NOT NULL,
  cliente_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE RESTRICT,
  valor_original NUMERIC(14,2) NOT NULL DEFAULT 0,
  juros NUMERIC(14,2) NOT NULL DEFAULT 0,
  data_vencimento TIMESTAMPTZ NOT NULL,
  status public.divida_status NOT NULL DEFAULT 'Em Aberto',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dividas TO authenticated;
GRANT ALL ON public.dividas TO service_role;
ALTER TABLE public.dividas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Dividas: cliente read own" ON public.dividas FOR SELECT TO authenticated USING (cliente_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Dividas: admin insert" ON public.dividas FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Dividas: admin update" ON public.dividas FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Dividas: admin delete" ON public.dividas FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_dividas_updated BEFORE UPDATE ON public.dividas FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Propostas
CREATE TABLE public.propostas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  divida_id UUID NOT NULL REFERENCES public.dividas(id) ON DELETE CASCADE,
  percentual_desconto NUMERIC(5,2) NOT NULL DEFAULT 0,
  valor_com_desconto NUMERIC(14,2) NOT NULL DEFAULT 0,
  quantidade_parcelas INTEGER NOT NULL DEFAULT 1,
  valor_parcela NUMERIC(14,2) NOT NULL DEFAULT 0,
  validade TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.propostas TO authenticated;
GRANT ALL ON public.propostas TO service_role;
ALTER TABLE public.propostas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Propostas: read own/admin" ON public.propostas FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(), 'admin') OR EXISTS (SELECT 1 FROM public.dividas d WHERE d.id = divida_id AND d.cliente_id = auth.uid())
);
CREATE POLICY "Propostas: cliente/admin insert" ON public.propostas FOR INSERT TO authenticated WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR EXISTS (SELECT 1 FROM public.dividas d WHERE d.id = divida_id AND d.cliente_id = auth.uid())
);
CREATE POLICY "Propostas: admin update" ON public.propostas FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Propostas: admin delete" ON public.propostas FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Acordos
CREATE TYPE public.acordo_status AS ENUM ('Pendente', 'Ativo', 'Pago', 'Cancelado');
CREATE TABLE public.acordos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  divida_id UUID NOT NULL REFERENCES public.dividas(id) ON DELETE CASCADE,
  proposta_id UUID NOT NULL REFERENCES public.propostas(id) ON DELETE RESTRICT,
  data_acordo TIMESTAMPTZ NOT NULL DEFAULT now(),
  status public.acordo_status NOT NULL DEFAULT 'Ativo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.acordos TO authenticated;
GRANT ALL ON public.acordos TO service_role;
ALTER TABLE public.acordos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acordos: read own/admin" ON public.acordos FOR SELECT TO authenticated USING (cliente_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Acordos: cliente insert own" ON public.acordos FOR INSERT TO authenticated WITH CHECK (cliente_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Acordos: admin update" ON public.acordos FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Acordos: admin delete" ON public.acordos FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_acordos_updated BEFORE UPDATE ON public.acordos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Pagamentos
CREATE TYPE public.pagamento_status AS ENUM ('Pendente', 'Pago', 'Cancelado');
CREATE TYPE public.tipo_pagamento AS ENUM ('Pix', 'Boleto');
CREATE TABLE public.pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  acordo_id UUID NOT NULL REFERENCES public.acordos(id) ON DELETE CASCADE,
  tipo_pagamento public.tipo_pagamento NOT NULL,
  valor NUMERIC(14,2) NOT NULL DEFAULT 0,
  codigo_pagamento TEXT NOT NULL,
  data_pagamento TIMESTAMPTZ NOT NULL DEFAULT now(),
  status public.pagamento_status NOT NULL DEFAULT 'Pendente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pagamentos TO authenticated;
GRANT ALL ON public.pagamentos TO service_role;
ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pagamentos: read own/admin" ON public.pagamentos FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(), 'admin') OR EXISTS (SELECT 1 FROM public.acordos a WHERE a.id = acordo_id AND a.cliente_id = auth.uid())
);
CREATE POLICY "Pagamentos: cliente insert own" ON public.pagamentos FOR INSERT TO authenticated WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR EXISTS (SELECT 1 FROM public.acordos a WHERE a.id = acordo_id AND a.cliente_id = auth.uid())
);
CREATE POLICY "Pagamentos: update own/admin" ON public.pagamentos FOR UPDATE TO authenticated USING (
  public.has_role(auth.uid(), 'admin') OR EXISTS (SELECT 1 FROM public.acordos a WHERE a.id = acordo_id AND a.cliente_id = auth.uid())
);
CREATE POLICY "Pagamentos: admin delete" ON public.pagamentos FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_pagamentos_updated BEFORE UPDATE ON public.pagamentos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Indexes
CREATE INDEX idx_dividas_cliente ON public.dividas(cliente_id);
CREATE INDEX idx_dividas_empresa ON public.dividas(empresa_id);
CREATE INDEX idx_propostas_divida ON public.propostas(divida_id);
CREATE INDEX idx_acordos_cliente ON public.acordos(cliente_id);
CREATE INDEX idx_acordos_divida ON public.acordos(divida_id);
CREATE INDEX idx_pagamentos_acordo ON public.pagamentos(acordo_id);
