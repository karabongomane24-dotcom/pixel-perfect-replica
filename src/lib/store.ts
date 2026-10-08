import { useSyncExternalStore } from "react";

export type Tool = "email" | "meeting" | "research";
export type HistoryItem = { id: string; tool: Tool; title: string; createdAt: number; preview: string; content: string; saved: boolean; status: "Completed" };

const KEY = "clarity-history-v1";
const EMPTY: HistoryItem[] = [];
let cache: HistoryItem[] | null = null;
const listeners = new Set<() => void>();

function read(): HistoryItem[] {
  if (cache) return cache;
  try { cache = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { cache = []; }
  return cache!;
}
function write(items: HistoryItem[]) {
  cache = items;
  localStorage.setItem(KEY, JSON.stringify(items));
  listeners.forEach((l) => l());
}

export function useHistory() {
  return useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l); }, read, () => EMPTY);
}
export function addHistory(i: Omit<HistoryItem, "id" | "createdAt" | "saved" | "status">) {
  const item: HistoryItem = { ...i, id: crypto.randomUUID(), createdAt: Date.now(), saved: false, status: "Completed" };
  write([item, ...read()].slice(0, 200));
  return item.id;
}
export const toggleSaved = (id: string) => write(read().map((h) => (h.id === id ? { ...h, saved: !h.saved } : h)));
export const removeHistory = (id: string) => write(read().filter((h) => h.id !== id));
export const clearHistory = () => write([]);

export const toolMeta: Record<Tool, { label: string; to: "/email" | "/meetings" | "/research"; category: string }> = {
  email: { label: "Smart Email Generator", to: "/email", category: "Emails" },
  meeting: { label: "Meeting Notes Summarizer", to: "/meetings", category: "Meeting Notes" },
  research: { label: "AI Research Assistant", to: "/research", category: "Research" },
};
