import { useState } from "react";
import type { Refinement } from "./prompts";
import { addHistory, toggleSaved, useHistory, type Tool } from "./store";

type Status = "idle" | "loading" | "success" | "error";

export function useGeneration<T>(tool: Tool, run: (r: Refinement) => Promise<T>, describe: (r: T) => { title: string; preview: string; content: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [historyId, setHistoryId] = useState<string | null>(null);
  const history = useHistory();
  const saved = !!history.find((h) => h.id === historyId)?.saved;

  async function generate(r: Refinement = null) {
    setStatus("loading"); setError("");
    try {
      const res = await run(r);
      setResult(res); setStatus("success");
      setHistoryId(addHistory({ tool, ...describe(res) }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "The AI could not complete this request."); setStatus("error");
    }
  }
  return { status, result, error, generate, saved, save: () => historyId && toggleSaved(historyId), setResult };
}
