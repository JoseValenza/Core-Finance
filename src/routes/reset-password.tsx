import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({ component: ResetPage });

function ResetPage() {
  const nav = useNavigate();
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd.length < 6) return toast.error("A senha deve ter pelo menos 6 caracteres.");
    if (pwd !== confirm) return toast.error("As senhas não coincidem.");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pwd });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Senha atualizada. Faça login novamente.");
    await supabase.auth.signOut();
    nav({ to: "/" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-xl">
        <h1 className="text-2xl font-semibold">Definir nova senha</h1>
        <p className="text-sm text-muted-foreground mt-1">Escolha uma senha forte para sua conta.</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label>Nova senha</Label>
            <Input type="password" className="h-11" value={pwd} onChange={(e) => setPwd(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Confirmar senha</Label>
            <Input type="password" className="h-11" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
          <Button disabled={busy} className="w-full h-11">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar nova senha"}
          </Button>
        </form>
      </div>
    </div>
  );
}
