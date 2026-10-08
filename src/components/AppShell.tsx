import { Link, useLocation } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { LayoutDashboard, Mail, FileText, Search, History, Bookmark, Settings, Menu, X, ChevronsUpDown } from "lucide-react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, short: "Home" },
  { to: "/email", label: "Smart Email Generator", icon: Mail, short: "Email" },
  { to: "/meetings", label: "Meeting Notes Summarizer", icon: FileText, short: "Notes" },
  { to: "/research", label: "AI Research Assistant", icon: Search, short: "Research" },
  { to: "/history", label: "History", icon: History, short: "History" },
  { to: "/saved", label: "Saved Results", icon: Bookmark, short: "Saved" },
  { to: "/settings", label: "Settings", icon: Settings, short: "Settings" },
] as const;

export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="brand-mark grid h-9 w-9 place-items-center rounded-xl text-sm font-extrabold">C</div>
      <div className="leading-tight">
        <div className="font-bold tracking-tight">ClarityAI</div>
        <div className="text-[11px] text-muted-foreground">Productivity Suite</div>
      </div>
    </div>
  );
}

function NavList({ onNavigate, compact = false }: { onNavigate?: () => void; compact?: boolean }) {
  const { pathname } = useLocation();
  return (
    <nav className="flex flex-col gap-1">
      {nav.map((n) => {
        const active = n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
        return (
          <Link key={n.to} to={n.to} onClick={onNavigate} title={n.label}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${compact ? "lg:justify-start justify-center" : ""} ${active ? "bg-primary-soft text-primary" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}>
            <n.icon className="h-4 w-4 shrink-0" />
            <span className={compact ? "hidden lg:inline" : ""}>{n.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`mt-auto space-y-3 ${compact ? "hidden lg:block" : ""}`}>
      <div className="rounded-xl bg-primary-soft p-4">
        <div className="text-sm font-bold text-primary">ClarityAI</div>
        <div className="text-xs text-muted-foreground">Work smarter with AI.</div>
      </div>
      <div className="flex items-center gap-3 rounded-lg border p-2.5">
        <div className="grid h-8 w-8 place-items-center rounded-full bg-secondary-soft text-xs font-bold text-secondary">KN</div>
        <div className="min-w-0 flex-1 text-sm">
          <div className="truncate font-semibold">Karabo N.</div>
          <div className="truncate text-xs text-muted-foreground">Pro plan</div>
        </div>
      </div>
    </div>
  );
}

function Workspace() {
  return (
    <button className="flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm hover:bg-accent">
      <span><span className="block text-[11px] text-muted-foreground">Workspace</span><span className="font-semibold">Personal</span></span>
      <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen">
      {/* Desktop / tablet sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-20 flex-col gap-6 border-r bg-sidebar p-4 md:flex lg:w-72">
        <div className="hidden lg:block"><Logo /></div>
        <div className="brand-mark mx-auto grid h-9 w-9 place-items-center rounded-xl text-sm font-extrabold lg:hidden">C</div>
        <div className="hidden lg:block"><Workspace /></div>
        <NavList compact />
        <SidebarFooter compact />
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-sidebar/90 px-4 py-3 backdrop-blur md:hidden">
        <Logo />
        <button className="btn btn-ghost p-2" aria-label="Open menu" onClick={() => setOpen(true)}><Menu className="h-5 w-5" /></button>
      </header>
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-foreground/30" onClick={() => setOpen(false)} />
          <div className="animate-in slide-in-from-left absolute inset-y-0 left-0 flex w-72 flex-col gap-6 bg-sidebar p-4">
            <div className="flex items-center justify-between"><Logo /><button className="btn btn-ghost p-2" aria-label="Close menu" onClick={() => setOpen(false)}><X className="h-5 w-5" /></button></div>
            <Workspace />
            <NavList onNavigate={() => setOpen(false)} />
            <SidebarFooter />
          </div>
        </div>
      )}

      <main className="pb-24 md:pb-0 md:pl-20 lg:pl-72">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</div>
      </main>

      {/* Mobile bottom nav */}
      <MobileBottomNav />
    </div>
  );
}

function MobileBottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t bg-sidebar md:hidden">
      {nav.slice(0, 5).map((n) => {
        const active = n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
        return (
          <Link key={n.to} to={n.to} className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${active ? "text-primary" : "text-muted-foreground"}`}>
            <n.icon className="h-5 w-5" />{n.short}
          </Link>
        );
      })}
    </nav>
  );
}

export function PageHeader({ icon: Icon, title, subtitle, action }: { icon?: typeof Mail; title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-start gap-3">
        {Icon && <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"><Icon className="h-5 w-5" /></div>}
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
