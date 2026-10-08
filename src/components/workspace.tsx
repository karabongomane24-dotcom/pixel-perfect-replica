import { useState, type ReactNode } from "react";
import { ChevronDown, Sparkles, Loader2, Copy, RefreshCw, Download, Pencil, AlertTriangle, Wand2, Check, Bookmark } from "lucide-react";
import { toast } from "sonner";
import { renderPrompt, type PromptSpec } from "@/lib/prompts";

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="field-label">{label}{hint && <span className="ml-1 font-normal text-muted-foreground">{hint}</span>}</span>
      {children}
    </label>
  );
}

export function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return <select className="field" value={value} onChange={(e) => onChange(e.target.value)}>{options.map((o) => <option key={o}>{o}</option>)}</select>;
}

export function Chips({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => <button type="button" key={o} className="chip" data-active={value === o} onClick={() => onChange(o)}>{o}</button>)}
    </div>
  );
}

export function PromptStructure({ spec }: { spec: PromptSpec }) {
  const [open, setOpen] = useState(false);
  const [raw, setRaw] = useState(false);
  return (
    <div className="rounded-xl border bg-muted/50">
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold">
        <span className="flex items-center gap-2"><Wand2 className="h-4 w-4 text-primary" />Prompt Structure</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="animate-in fade-in space-y-3 border-t px-4 py-4 text-sm">
          <div className="flex justify-end"><button type="button" className="btn btn-ghost btn-sm" onClick={() => setRaw(!raw)}>{raw ? "Structured view" : "Raw prompt"}</button></div>
          {raw ? <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-lg bg-card p-3 text-xs">{renderPrompt(spec)}</pre> : (
            <dl className="space-y-2.5">
              <Row k="Role" v={cap(spec.role)} />
              <Row k="Goal" v={spec.objective} />
              <Row k="Context" v={spec.context} />
              <Row k="Tasks" v={<ul className="list-disc pl-4">{spec.instructions.map((i) => <li key={i}>{i}</li>)}</ul>} />
              <Row k="Constraints" v={spec.constraints.join(" · ")} />
              <Row k="Output" v={<ol className="list-decimal pl-4">{spec.output.map((i) => <li key={i}>{i}</li>)}</ol>} />
            </dl>
          )}
        </div>
      )}
    </div>
  );
}
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
function Row({ k, v }: { k: string; v: ReactNode }) {
  return <div className="grid grid-cols-[90px_1fr] gap-2"><dt className="font-semibold text-muted-foreground">{k}</dt><dd className="min-w-0 break-words">{v}</dd></div>;
}

export function GenerateButton({ loading, children, onClick }: { loading: boolean; children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" className="btn btn-primary btn-lg w-full" disabled={loading} onClick={onClick}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
      {loading ? "Generating…" : children}
    </button>
  );
}

export function LoadingState() {
  return (
    <div className="space-y-4" aria-busy>
      <div className="flex items-center gap-2 text-sm font-medium text-primary"><Loader2 className="h-4 w-4 animate-spin" />Thinking through your request…</div>
      <div className="skeleton h-6 w-2/3" />
      {[0, 1, 2].map((i) => <div key={i} className="space-y-2 rounded-xl border p-4"><div className="skeleton h-4 w-1/3" /><div className="skeleton h-3 w-full" /><div className="skeleton h-3 w-5/6" /></div>)}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, text }: { icon: typeof Sparkles; title: string; text: string }) {
  return (
    <div className="flex h-full min-h-72 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-primary"><Icon className="h-6 w-6" /></div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive-soft p-5 text-sm">
      <div className="flex items-center gap-2 font-semibold text-destructive"><AlertTriangle className="h-4 w-4" />Something went wrong</div>
      <p className="mt-1 text-muted-foreground">{message}</p>
      <button className="btn btn-outline btn-sm mt-3" onClick={onRetry}><RefreshCw className="h-3.5 w-3.5" />Try again</button>
    </div>
  );
}

export function ResultCard({ title, badge, children, tone = "default" }: { title: string; badge?: ReactNode; children: ReactNode; tone?: "default" | "highlight" }) {
  return (
    <section className={`rounded-xl border p-4 ${tone === "highlight" ? "border-primary/30 bg-primary-soft" : "bg-card"}`}>
      <div className="mb-2 flex items-center justify-between gap-2"><h3 className="text-sm font-bold">{title}</h3>{badge}</div>
      <div className="text-sm leading-relaxed">{children}</div>
    </section>
  );
}

export function List({ items, empty = "None identified." }: { items: string[]; empty?: string }) {
  if (!items.length) return <p className="text-muted-foreground">{empty}</p>;
  return <ul className="space-y-1.5">{items.map((i, k) => <li key={k} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />{i}</li>)}</ul>;
}

const badgeTones = {
  Decision: "bg-secondary-soft text-secondary", Action: "bg-primary-soft text-primary", Deadline: "bg-warning-soft text-warning",
  Risk: "bg-destructive-soft text-destructive", "Open Question": "bg-muted text-muted-foreground", Success: "bg-success-soft text-success",
} as const;
export function Badge({ kind, children }: { kind: keyof typeof badgeTones; children?: ReactNode }) {
  return <span className={`badge ${badgeTones[kind]}`}>{children ?? kind}</span>;
}

export function copyText(t: string) {
  navigator.clipboard.writeText(t).then(() => toast.success("Copied to clipboard"));
}
export function exportText(name: string, t: string) {
  const url = URL.createObjectURL(new Blob([t], { type: "text/markdown" }));
  const a = document.createElement("a"); a.href = url; a.download = `${name}.md`; a.click(); URL.revokeObjectURL(url);
  toast.success("Exported");
}

export type Action = { label: string; icon?: typeof Copy; onClick: () => void };
export function ResultActions({ text, name, onRegenerate, onEdit, onSave, saved, extra = [] }: { text: string; name: string; onRegenerate: () => void; onEdit?: () => void; onSave?: () => void; saved?: boolean; extra?: Action[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button className="btn btn-outline btn-sm" onClick={() => copyText(text)}><Copy className="h-3.5 w-3.5" />Copy</button>
      <button className="btn btn-outline btn-sm" onClick={onRegenerate}><RefreshCw className="h-3.5 w-3.5" />Regenerate</button>
      {onEdit && <button className="btn btn-outline btn-sm" onClick={onEdit}><Pencil className="h-3.5 w-3.5" />Edit</button>}
      <button className="btn btn-outline btn-sm" onClick={() => exportText(name, text)}><Download className="h-3.5 w-3.5" />Export</button>
      {onSave && <button className="btn btn-outline btn-sm" onClick={onSave}>{saved ? <Check className="h-3.5 w-3.5 text-success" /> : <Bookmark className="h-3.5 w-3.5" />}{saved ? "Saved" : "Save"}</button>}
      {extra.map((e) => <button key={e.label} className="btn btn-ghost btn-sm" onClick={e.onClick}>{e.icon && <e.icon className="h-3.5 w-3.5" />}{e.label}</button>)}
    </div>
  );
}

export function WorkspaceLayout({ input, result }: { input: ReactNode; result: ReactNode }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <div className="surface space-y-5 p-5 sm:p-6">{input}</div>
      <div className="surface p-5 sm:p-6 lg:sticky lg:top-6 lg:self-start">{result}</div>
    </div>
  );
}
