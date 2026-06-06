import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export const Route = createFileRoute("/")({ component: LoginPage });

type Mode = "login" | "signup";

function LoginPage() {
  const nav = useNavigate();
  const { user, login, signup, loading } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) nav({ to: user.role === "admin" ? "/admin/dashboard" : "/cliente/dashboard" });
  }, [user, nav]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !pwd.trim()) return toast.error("Informe e-mail e senha.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast.error("E-mail inválido.");
    if (pwd.length < 6) return toast.error("A senha deve ter pelo menos 6 caracteres.");
    if (mode === "signup" && !nome.trim()) return toast.error("Informe seu nome.");

    setBusy(true);
    const res = mode === "login"
      ? await login(email.trim(), pwd)
      : await signup(email.trim(), pwd, nome.trim());
    setBusy(false);

    if (res.error) {
      toast.error(res.error);
      return;
    }
    if (mode === "signup") {
      toast.success("Cadastro realizado. Verifique seu e-mail para confirmar a conta.");
      setMode("login");
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden bg-sidebar">
        <div className="flex items-center gap-3">
          <LogoMark />
          <span className="text-xl font-semibold tracking-tight">Core Finance</span>
        </div>
        <div className="relative z-10 max-w-md">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium border border-primary/20">
            <Sparkles className="h-3.5 w-3.5" /> Plataforma de renegociação digital
          </div>
          <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight">
            Recupere crédito.<br />Renegocie com inteligência.
          </h1>
          <p className="mt-4 text-muted-foreground">
            Conecte empresas credoras e clientes em um ambiente seguro, com acordos digitais,
            cobrança automatizada e visibilidade total sobre a recuperação financeira.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { k: "98%", v: "Disponibilidade" },
              { k: "256-bit", v: "Criptografia" },
              { k: "LGPD", v: "Conformidade" },
            ].map((s) => (
              <div key={s.v} className="rounded-xl border bg-card/60 backdrop-blur p-4">
                <div className="text-lg font-semibold text-foreground">{s.k}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="text-xs text-muted-foreground relative z-10">
          © {new Date().getFullYear()} Core Finance. Todos os direitos reservados.
        </div>
        <div aria-hidden className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div aria-hidden className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-chart-4/20 blur-3xl" />
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <LogoMark />
            <span className="text-xl font-semibold tracking-tight">Core Finance</span>
          </div>

          <h2 className="text-2xl font-semibold tracking-tight">
            {mode === "login" ? "Acesse sua conta" : "Crie sua conta"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "login"
              ? "Informe suas credenciais para entrar na plataforma."
              : "Cadastre-se para começar a gerenciar suas renegociações."}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-2 p-1 rounded-xl bg-muted/40 border">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`rounded-lg py-2.5 text-sm font-medium transition ${
                  mode === m ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "login" ? "Entrar" : "Cadastrar"}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="nome">Nome completo</Label>
                <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" className="h-11" />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email" type="email" autoComplete="email" value={email}
                onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" className="h-11"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="pwd">Senha</Label>
                {mode === "login" && (
                  <a href="/esqueci-senha" className="text-xs text-primary hover:underline">Esqueci minha senha</a>
                )}
              </div>
              <div className="relative">
                <Input
                  id="pwd" type={show ? "text" : "password"}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="••••••••" className="h-11 pr-10"
                />
                <button
                  type="button" onClick={() => setShow((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={show ? "Ocultar senha" : "Mostrar senha"}
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={busy || loading} className="w-full h-11 text-base">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "login" ? "Entrar" : "Criar conta"}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Ambiente protegido por autenticação criptografada.
          </p>
        </div>
      </div>
    </div>
  );
}

function LogoMark() {
  return (
    <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-chart-4 flex items-center justify-center shadow-lg shadow-primary/30">
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 18V6m0 0 8 8 8-8m0 0v12" />
      </svg>
    </div>
  );
}
