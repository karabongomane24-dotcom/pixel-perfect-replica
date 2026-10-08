import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileText, Lightbulb, Scissors } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";
import { Field, Select, Chips, PromptStructure, GenerateButton, LoadingState, EmptyState, ErrorState, ResultCard, ResultActions, WorkspaceLayout, List, Badge } from "@/components/workspace";
import { buildMeetingPrompt, type MeetingInput } from "@/lib/prompts";
import { summarizeMeeting, type MeetingResult } from "@/lib/ai";
import { useGeneration } from "@/lib/use-generation";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — ClarityAI" },
      { name: "description", content: "Turn meeting notes into summaries, decisions, action items, owners and deadlines." },
      { property: "og:title", content: "Meeting Notes Summarizer — ClarityAI" },
      { property: "og:description", content: "Paste your notes — we'll identify what matters." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MeetingsPage,
});

const EXAMPLE: MeetingInput = {
  type: "Project Review", style: "Executive Summary",
  notes: `Q4 mobile app review.
We decided to delay the Android release by two weeks to fix performance issues.
Agreed to keep the iOS launch on schedule.
Thandi will prepare the updated roadmap by Friday.
Sipho will follow up with the payments vendor about API limits.
Need to send release notes to support team.
Concern: QA team capacity is tight in November and may cause a delay.
Who owns the onboarding redesign?
Budget for user testing is still unclear.`,
};

const toText = (r: MeetingResult) => [
  `# Executive Summary\n${r.summary}`, `## Key Topics\n${r.topics.map((t) => `- ${t}`).join("\n")}`,
  `## Decisions\n${r.decisions.map((t) => `- ${t}`).join("\n")}`,
  `## Action Items\n| Action | Owner | Deadline | Status |\n|---|---|---|---|\n${r.actions.map((a) => `| ${a.action} | ${a.owner} | ${a.deadline} | ${a.status} |`).join("\n")}`,
  `## Risks\n${r.risks.map((t) => `- ${t}`).join("\n")}`, `## Open Questions\n${r.questions.map((t) => `- ${t}`).join("\n")}`,
].join("\n\n");

function MeetingsPage() {
  const [f, setF] = useState<MeetingInput>({ type: "Team Meeting", notes: "", style: "Executive Summary" });
  const set = <K extends keyof MeetingInput>(k: K) => (v: MeetingInput[K]) => setF({ ...f, [k]: v });
  const g = useGeneration("meeting", (r) => summarizeMeeting(f, buildMeetingPrompt(f, r), r), (r) => ({ title: `${f.type}: ${r.topics.slice(0, 2).join(", ") || "Summary"}`, preview: r.summary, content: toText(r) }));
  const run = (r: "shorter" | null = null) => {
    if (f.notes.trim().length < 20) { toast.error("Paste a bit more of your meeting notes first."); return; }
    g.generate(r);
  };
  const r = g.result;

  return (
    <>
      <PageHeader icon={FileText} title="Meeting Notes Summarizer" subtitle="Paste your notes — we'll identify what matters."
        action={<button className="btn btn-outline" onClick={() => setF(EXAMPLE)}><Lightbulb className="h-4 w-4" />Use Example</button>} />
      <WorkspaceLayout
        input={<>
          <Field label="Meeting Type"><Select value={f.type} onChange={set("type")} options={["Team Meeting", "Client Meeting", "Project Review", "Brainstorming", "1-on-1", "Board Meeting", "Interview", "Other"]} /></Field>
          <Field label="Meeting Notes" hint={`${f.notes.length} chars`}><textarea className="field min-h-72" value={f.notes} onChange={(e) => set("notes")(e.target.value)} placeholder="Paste your meeting notes, transcript, or discussion notes here..." /></Field>
          <Field label="Summary Style"><Chips value={f.style} onChange={set("style")} options={["Executive Summary", "Detailed Summary", "Bullet Points", "Action-Focused", "Concise"]} /></Field>
          <PromptStructure spec={buildMeetingPrompt(f)} />
          <GenerateButton loading={g.status === "loading"} onClick={() => run()}>Summarize Meeting</GenerateButton>
        </>}
        result={
          g.status === "loading" ? <LoadingState /> :
          g.status === "error" ? <ErrorState message={g.error} onRetry={() => run()} /> :
          r ? (
            <div className="animate-in fade-in space-y-4">
              <ResultCard title="Executive Summary" tone="highlight">{r.summary}</ResultCard>
              <ResultCard title="Key Topics"><div className="flex flex-wrap gap-2">{r.topics.map((t) => <span key={t} className="chip">{t}</span>)}</div></ResultCard>
              <ResultCard title="Decisions" badge={<Badge kind="Decision" />}><List items={r.decisions} /></ResultCard>
              <ResultCard title="Action Items" badge={<Badge kind="Action">{r.actions.length} actions</Badge>}>
                {r.actions.length ? (
                  <div className="-mx-1 overflow-x-auto">
                    <table className="w-full min-w-[480px] text-left text-sm">
                      <thead className="text-xs text-muted-foreground"><tr>{["Action", "Owner", "Deadline", "Status"].map((h) => <th key={h} className="px-1 pb-2 font-semibold">{h}</th>)}</tr></thead>
                      <tbody className="divide-y">{r.actions.map((a, i) => (
                        <tr key={i}>
                          <td className="px-1 py-2">{a.action}</td>
                          <td className="px-1 py-2">{a.owner.startsWith("⚠") ? <Badge kind="Risk">Unassigned</Badge> : a.owner}</td>
                          <td className="px-1 py-2">{a.deadline.startsWith("⚠") ? <Badge kind="Open Question">Not set</Badge> : <Badge kind="Deadline">{a.deadline}</Badge>}</td>
                          <td className="px-1 py-2"><Badge kind="Action">{a.status}</Badge></td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                ) : <p className="text-muted-foreground">No action items found.</p>}
              </ResultCard>
              <div className="grid gap-4 sm:grid-cols-2">
                <ResultCard title="Risks" badge={<Badge kind="Risk" />}><List items={r.risks} /></ResultCard>
                <ResultCard title="Open Questions" badge={<Badge kind="Open Question" />}><List items={r.questions} /></ResultCard>
              </div>
              <ResultActions text={toText(r)} name="meeting-summary" onRegenerate={() => run()} onSave={g.save} saved={g.saved}
                extra={[{ label: "Make Shorter", icon: Scissors, onClick: () => run("shorter") }]} />
            </div>
          ) : <EmptyState icon={FileText} title="Your summary will appear here" text="Decisions, action items, owners and deadlines — organized automatically." />
        }
      />
    </>
  );
}
