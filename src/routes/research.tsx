import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Lightbulb, Minimize2, Maximize2, Target } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";
import { Field, Select, Chips, PromptStructure, GenerateButton, LoadingState, EmptyState, ErrorState, ResultCard, ResultActions, WorkspaceLayout, List } from "@/components/workspace";
import { buildResearchPrompt, type ResearchInput } from "@/lib/prompts";
import { analyzeResearch, type ResearchResult } from "@/lib/ai";
import { useGeneration } from "@/lib/use-generation";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — ClarityAI" },
      { name: "description", content: "Analyze topics and articles into key insights, findings and recommendations." },
      { property: "og:title", content: "AI Research Assistant — ClarityAI" },
      { property: "og:description", content: "Ask a question and turn information into an actionable answer." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResearchPage,
});

const EXAMPLE: ResearchInput = {
  mode: "Decision Support", audience: "Executive", style: "Executive",
  topic: "Should our 40-person company adopt a four-day work week?",
  goal: "Decide whether to run a pilot next quarter",
};

const toText = (r: ResearchResult) => [
  `# Key Takeaway\n${r.takeaway}`, `## Summary\n${r.summary}`,
  ...([["Key Insights", r.insights], ["Important Findings", r.findings], ["Recommendations", r.recommendations], ["Risks / Limitations", r.risks], ["Open Questions", r.questions]] as const).map(([h, l]) => `## ${h}\n${l.map((x) => `- ${x}`).join("\n")}`),
].join("\n\n");

function ResearchPage() {
  const [f, setF] = useState<ResearchInput>({ mode: "Topic Overview", topic: "", goal: "", audience: "Business Professional", style: "Concise" });
  const set = <K extends keyof ResearchInput>(k: K) => (v: ResearchInput[K]) => setF({ ...f, [k]: v });
  const g = useGeneration("research", (r) => analyzeResearch(f, buildResearchPrompt(f, r), r), (r) => ({ title: f.topic.slice(0, 70), preview: r.takeaway, content: toText(r) }));
  const run = (r: "simplify" | "expand" | null = null) => {
    if (!f.topic.trim()) return toast.error("Enter a topic, question or article to analyze.");
    g.generate(r);
  };
  const r = g.result;

  return (
    <>
      <PageHeader icon={Search} title="AI Research Assistant" subtitle="Ask a question and turn information into an actionable answer."
        action={<button className="btn btn-outline" onClick={() => setF(EXAMPLE)}><Lightbulb className="h-4 w-4" />Use Example</button>} />
      <WorkspaceLayout
        input={<>
          <Field label="Research Mode"><Chips value={f.mode} onChange={set("mode")} options={["Topic Overview", "Article Summary", "Compare Viewpoints", "Decision Support", "Deep Research"]} /></Field>
          <Field label="Research Topic / Article"><textarea className="field min-h-40" value={f.topic} onChange={(e) => set("topic")(e.target.value)} placeholder="Enter a topic, question, article, or paste source material..." /></Field>
          <Field label="Research Goal"><textarea className="field min-h-20" value={f.goal} onChange={(e) => set("goal")(e.target.value)} placeholder="What do you want to understand or decide?" /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Audience"><Select value={f.audience} onChange={set("audience")} options={["Business Professional", "Executive", "Student", "Researcher", "General Reader"]} /></Field>
            <Field label="Output Style"><Select value={f.style} onChange={set("style")} options={["Concise", "Detailed", "Executive", "Academic", "Practical"]} /></Field>
          </div>
          <PromptStructure spec={buildResearchPrompt(f)} />
          <GenerateButton loading={g.status === "loading"} onClick={() => run()}>Analyze Research</GenerateButton>
        </>}
        result={
          g.status === "loading" ? <LoadingState /> :
          g.status === "error" ? <ErrorState message={g.error} onRetry={() => run()} /> :
          r ? (
            <div className="animate-in fade-in space-y-4">
              <section className="brand-mark rounded-xl p-5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider opacity-90"><Target className="h-4 w-4" />Key Takeaway</div>
                <p className="mt-2 text-sm leading-relaxed sm:text-base">{r.takeaway}</p>
              </section>
              <ResultCard title="Summary">{r.summary}</ResultCard>
              <div className="grid gap-4 sm:grid-cols-2">
                <ResultCard title="Key Insights"><List items={r.insights} /></ResultCard>
                <ResultCard title="Important Findings"><List items={r.findings} /></ResultCard>
              </div>
              <ResultCard title="Recommendations" tone="highlight"><ol className="list-decimal space-y-1.5 pl-5">{r.recommendations.map((x) => <li key={x}>{x}</li>)}</ol></ResultCard>
              <div className="grid gap-4 sm:grid-cols-2">
                <ResultCard title="Risks / Limitations"><List items={r.risks} /></ResultCard>
                <ResultCard title="Open Questions"><List items={r.questions} /></ResultCard>
              </div>
              <ResultActions text={toText(r)} name="research-report" onRegenerate={() => run()} onSave={g.save} saved={g.saved}
                extra={[{ label: "Simplify", icon: Minimize2, onClick: () => run("simplify") }, { label: "Expand Analysis", icon: Maximize2, onClick: () => run("expand") }]} />
            </div>
          ) : <EmptyState icon={Search} title="Your research report will appear here" text="Key takeaway, insights, findings and recommendations — clearly separated." />
        }
      />
    </>
  );
}
