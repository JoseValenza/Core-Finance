import { Link, useNavigate, useRouterState, Outlet } from "@tanstack/react-router";
import { useEffect, useState, type ComponentType } from "react";
import {
  LayoutDashboard, Receipt, Handshake, CreditCard, History,
  Building2, Users, FileText, BadgeCheck, LogOut, Menu, X, Bell, Search,
} from "lucide-react";
import { useAuth, type Role } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

interface NavItem { to: string; label: string; icon: ComponentType<{ className?: string }> }

const clienteNav: NavItem[] = [
  { to: "/cliente/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/cliente/dividas", label: "Minhas Dívidas", icon: Receipt },
  { to: "/cliente/negociacao", label: "Negociação", icon: Handshake },
  { to: "/cliente/pagamentos", label: "Pagamentos", icon: CreditCard },
  { to: "/cliente/historico", label: "Histórico", icon: History },
];
const adminNav: NavItem[] = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/clientes", label: "Clientes", icon: Users },
  { to: "/admin/empresas", label: "Empresas Credoras", icon: Building2 },
  { to: "/admin/dividas", label: "Dívidas", icon: Receipt },
  { to: "/admin/propostas", label: "Propostas", icon: FileText },
  { to: "/admin/acordos", label: "Acordos", icon: BadgeCheck },
  { to: "/admin/pagamentos", label: "Pagamentos", icon: CreditCard },
];

export function AppShell({ role }: { role: Role }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const path = useRouterState({ select: (r) => r.location.pathname });
  const [openMobile, setOpenMobile] = useState(false);

  useEffect(() => {
    if (!user) nav({ to: "/" });
    else if (user.role !== role) nav({ to: user.role === "admin" ? "/admin/dashboard" : "/cliente/dashboard" });
  }, [user, role, nav]);

  useEffect(() => { setOpenMobile(false); }, [path]);

  const items = role === "admin" ? adminNav : clienteNav;

  if (!user) return null;

  return (
    <div className="min-h-screen flex w-full">
      {/* Sidebar - desktop */}
      <aside className="hidden lg:flex w-64 flex-col bg-sidebar border-r border-sidebar-border">
        <SidebarContent items={items} path={path} />
      </aside>

      {/* Sidebar - mobile */}
      {openMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-background/80 backdrop-blur" onClick={() => setOpenMobile(false)} />
          <aside className="relative w-72 bg-sidebar border-r border-sidebar-border flex flex-col">
            <button onClick={() => setOpenMobile(false)} className="absolute top-4 right-4 text-muted-foreground">
              <X className="h-5 w-5" />
            </button>
            <SidebarContent items={items} path={path} />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 border-b bg-card/40 backdrop-blur flex items-center px-4 lg:px-6 gap-3">
          <button className="lg:hidden" onClick={() => setOpenMobile(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <div className="relative flex-1 max-w-md hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Pesquisar…"
              className="w-full h-10 rounded-lg bg-muted/40 border border-border pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex-1 md:hidden" />
          <button className="relative h-10 w-10 rounded-lg border border-border flex items-center justify-center hover:bg-muted/50">
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
          </button>
          <div className="flex items-center gap-3 pl-3 ml-1 border-l">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium leading-tight">{user.name}</div>
              <div className="text-xs text-muted-foreground capitalize">{role === "admin" ? "Administrador" : "Cliente"}</div>
            </div>
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-chart-4 flex items-center justify-center text-sm font-semibold text-primary-foreground">
              {user.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
            </div>
            <Button variant="ghost" size="icon" onClick={() => { logout(); nav({ to: "/" }); }} aria-label="Sair">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ items, path }: { items: NavItem[]; path: string }) {
  return (
    <>
      <div className="h-16 px-5 flex items-center gap-3 border-b border-sidebar-border">
        <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-chart-4 flex items-center justify-center shadow-lg shadow-primary/30">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 18V6m0 0 8 8 8-8m0 0v12" />
          </svg>
        </div>
        <div>
          <div className="text-sm font-semibold leading-tight">Core Finance</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Renegociação</div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const active = path === item.to || path.startsWith(item.to + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.to} to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition relative ${
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
            >
              {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r bg-primary" />}
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-sidebar-border">
        <div className="rounded-lg p-3 bg-gradient-to-br from-primary/15 to-chart-4/10 border border-primary/20">
          <div className="text-xs font-medium">Suporte Premium</div>
          <div className="text-[11px] text-muted-foreground mt-1">Atendimento dedicado 24/7</div>
        </div>
      </div>
    </>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
