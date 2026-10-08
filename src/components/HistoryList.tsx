import { useMemo, useState } from "react";
import { Copy, Trash2, Bookmark, BookmarkCheck, Search, X, Eye } from "lucide-react";
import { removeHistory, toggleSaved, toolMeta, type HistoryItem, type Tool } from "@/lib/store";
import { copyText, EmptyState } from "./workspace";

export function HistoryList({ items, savedMode = false }: { items: HistoryItem[]; savedMode?: boolean }) {
  const [q, setQ] = useState("");
  const [tool, setTool] = useState<Tool | "all">("all");
  const [sort, setSort] = useState<"new" | "old" | "az">("new");
  const [open, setOpen] = useState<HistoryItem | null>(null);

  const list = useMemo(() => {
    const f = items.filter((h) => (tool === "all" || h.tool === tool) && (h.title + h.preview).toLowerCase().includes(q.toLowerCase()));
    return [...f].sort((a, b) => sort === "new" ? b.createdAt - a.createdAt : sort === "old" ? a.createdAt - b.createdAt : a.title.localeCompare(b.title));
  }, [items, q, tool, sort]);

  return (
    <div className="space-y-4">
      <div className="surface flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input className="field pl-9" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <div className="flex flex-wrap gap-2">
          {(["all", "email", "meeting", "research"] as const).map((t) => (
            <button key={t} className="chip" data-active={tool === t} onClick={() => setTool(t)}>{t === "all" ? "All" : savedMode ? toolMeta[t].category : toolMeta[t].label.split(" ").slice(-1)[0]}</button>
          ))}
        </div>
        <select className="field sm:w-36" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}><option value="new">Newest</option><option value="old">Oldest</option><option value="az">A–Z</option></select>
      </div>

      {list.length === 0 ? <EmptyState icon={savedMode ? Bookmark : Search} title={savedMode ? "No saved results yet" : "No history yet"} text={savedMode ? "Bookmark any result to keep it here." : "Your generations will appear here automatically."} /> : (
        <div className={savedMode ? "grid gap-4 md:grid-cols-2" : "space-y-3"}>
          {list.map((h) => (
            <div key={h.id} className="surface surface-hover flex flex-col gap-3 p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="badge bg-primary-soft text-primary">{savedMode ? toolMeta[h.tool].category : toolMeta[h.tool].label}</span>
                    <span>{new Date(h.createdAt).toLocaleString()}</span>
                    {!savedMode && <span className="badge bg-success-soft text-success">{h.status}</span>}
                  </div>
                  <h3 className="mt-2 truncate font-semibold">{h.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{h.preview}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="btn btn-outline btn-sm" onClick={() => setOpen(h)}><Eye className="h-3.5 w-3.5" />Open</button>
                <button className="btn btn-outline btn-sm" onClick={() => copyText(h.content)}><Copy className="h-3.5 w-3.5" />Copy</button>
                <button className="btn btn-outline btn-sm" onClick={() => toggleSaved(h.id)}>{h.saved ? <BookmarkCheck className="h-3.5 w-3.5 text-primary" /> : <Bookmark className="h-3.5 w-3.5" />}{h.saved ? "Saved" : "Save"}</button>
                <button className="btn btn-ghost btn-sm" onClick={() => removeHistory(h.id)}><Trash2 className="h-3.5 w-3.5" />Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <div className="absolute inset-0 bg-foreground/30" onClick={() => setOpen(null)} />
          <div className="surface animate-in zoom-in-95 relative flex max-h-[85vh] w-full max-w-2xl flex-col p-6">
            <div className="mb-4 flex items-start justify-between gap-4"><h2 className="font-bold">{open.title}</h2><button className="btn btn-ghost p-1.5" aria-label="Close" onClick={() => setOpen(null)}><X className="h-4 w-4" /></button></div>
            <pre className="flex-1 overflow-auto whitespace-pre-wrap rounded-lg bg-muted p-4 font-sans text-sm">{open.content}</pre>
            <div className="mt-4 flex gap-2"><button className="btn btn-primary btn-sm" onClick={() => copyText(open.content)}><Copy className="h-3.5 w-3.5" />Copy</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
