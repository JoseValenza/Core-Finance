import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/esqueci-senha")({ component: ForgotPage });

function ForgotPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Voltar ao login
        </Link>
        <div className="mt-6 rounded-2xl border bg-card p-8 shadow-xl">
          <h1 className="text-2xl font-semibold">Recuperar senha</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Informe seu e-mail cadastrado para receber as instruções de redefinição.
          </p>
          {!sent ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                  toast.error("E-mail inválido.");
                  return;
                }
                setSent(true);
                toast.success("Instruções enviadas para o e-mail informado.");
              }}
              className="mt-6 space-y-4"
            >
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input type="email" className="h-11" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" />
              </div>
              <Button className="w-full h-11">Enviar instruções</Button>
            </form>
          ) : (
            <div className="mt-6 rounded-lg border border-success/30 bg-success/10 p-4 flex gap-3">
              <Mail className="h-5 w-5 text-success mt-0.5" />
              <div className="text-sm">Se houver uma conta associada a <strong>{email}</strong>, você receberá um link em instantes.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
