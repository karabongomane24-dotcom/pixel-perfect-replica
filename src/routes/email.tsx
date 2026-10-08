import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Lightbulb, Scissors, Briefcase, Smile } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";
import { Field, Select, Chips, PromptStructure, GenerateButton, LoadingState, EmptyState, ErrorState, ResultCard, ResultActions, WorkspaceLayout } from "@/components/workspace";
import { buildEmailPrompt, type EmailInput } from "@/lib/prompts";
import { generateEmail, type EmailResult } from "@/lib/ai";
import { useGeneration } from "@/lib/use-generation";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — ClarityAI" },
      { name: "description", content: "Write polished, professional emails in seconds with the right tone and structure." },
      { property: "og:title", content: "Smart Email Generator — ClarityAI" },
      { property: "og:description", content: "Give me the context and I'll handle the structure." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EmailPage,
});

const EXAMPLE: EmailInput = {
  audience: "Client", purpose: "Share an update that the website launch is moving to next Friday",
  context: "QA found two checkout bugs late on Tuesday. Fixes are in progress and expected by Wednesday. All other features are complete and tested.",
  tone: "Professional", length: "Medium", cta: "confirm the new launch date works for your marketing team",
};
const blank: EmailInput = { audience: "Client", purpose: "", context: "", tone: "Professional", length: "Medium", cta: "" };

const toText = (r: EmailResult) => `Subject: ${r.subject}\n\n${r.greeting}\n\n${r.body.join("\n\n")}\n\n${r.cta}\n\n${r.signoff}`;

function EmailPage() {
  const [f, setF] = useState<EmailInput>(blank);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const set = <K extends keyof EmailInput>(k: K) => (v: EmailInput[K]) => setF({ ...f, [k]: v });
  const spec = buildEmailPrompt(f);
  const g = useGeneration("email", (r) => generateEmail(f, buildEmailPrompt(f, r), r), (r) => ({ title: r.subject, preview: r.body.join(" ").slice(0, 140), content: toText(r) }));

  const run = (r: Parameters<typeof g.generate>[0] = null) => {
    if (!f.purpose.trim()) { toast.error("Tell me what the email should communicate."); return; }
    setEditing(false); g.generate(r);
  };

  return (
    <>
      <PageHeader icon={Mail} title="Smart Email Generator" subtitle="Give me the context and I'll handle the structure."
        action={<button className="btn btn-outline" onClick={() => setF(EXAMPLE)}><Lightbulb className="h-4 w-4" />Use Example</button>} />
      <WorkspaceLayout
        input={<>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Recipient / Audience"><Select value={f.audience} onChange={set("audience")} options={["Client", "Manager", "Colleague", "Customer", "Team", "Other"]} /></Field>
            <Field label="Tone"><Select value={f.tone} onChange={set("tone")} options={["Professional", "Friendly", "Formal", "Concise", "Persuasive", "Apologetic", "Appreciative", "Assertive"]} /></Field>
          </div>
          <Field label="Email Purpose"><input className="field" value={f.purpose} onChange={(e) => set("purpose")(e.target.value)} placeholder="What do you want this email to communicate?" /></Field>
          <Field label="Context"><textarea className="field min-h-32" value={f.context} onChange={(e) => set("context")(e.target.value)} placeholder="Add background information, important details, deadlines, or previous conversation context." /></Field>
          <Field label="Length"><Chips value={f.length} onChange={set("length")} options={["Short", "Medium", "Detailed"]} /></Field>
          <Field label="Call to Action"><input className="field" value={f.cta} onChange={(e) => set("cta")(e.target.value)} placeholder="What should the recipient do after reading this email?" /></Field>
          <PromptStructure spec={spec} />
          <GenerateButton loading={g.status === "loading"} onClick={() => run()}>Generate Email</GenerateButton>
        </>}
        result={
          g.status === "loading" ? <LoadingState /> :
          g.status === "error" ? <ErrorState message={g.error} onRetry={() => run()} /> :
          g.result ? (
            <div className="animate-in fade-in space-y-4">
              <div className="flex items-center justify-between"><h2 className="font-bold">Your email</h2><span className="badge bg-success-soft text-success">Ready</span></div>
              {editing ? (
                <div className="space-y-2">
                  <textarea className="field min-h-96 font-mono text-xs" value={draft} onChange={(e) => setDraft(e.target.value)} />
                  <button className="btn btn-primary btn-sm" onClick={() => setEditing(false)}>Done editing</button>
                </div>
              ) : <>
                <ResultCard title="Subject">{g.result.subject}</ResultCard>
                <ResultCard title="Email body"><div className="space-y-3"><p>{g.result.greeting}</p>{g.result.body.map((p, i) => <p key={i}>{p}</p>)}</div></ResultCard>
                <ResultCard title="Call to action" tone="highlight">{g.result.cta}</ResultCard>
                <ResultCard title="Suggested sign-off"><p className="whitespace-pre-line">{g.result.signoff}</p></ResultCard>
              </>}
              <ResultActions text={editing || draft ? draft || toText(g.result) : toText(g.result)} name="email" onRegenerate={() => { setDraft(""); run(); }}
                onEdit={() => { setDraft(draft || toText(g.result!)); setEditing(true); }} onSave={g.save} saved={g.saved}
                extra={[{ label: "Make Shorter", icon: Scissors, onClick: () => { setDraft(""); run("shorter"); } }, { label: "More Professional", icon: Briefcase, onClick: () => { setDraft(""); run("professional"); } }, { label: "Friendlier", icon: Smile, onClick: () => { setDraft(""); run("friendlier"); } }]} />
            </div>
          ) : <EmptyState icon={Mail} title="Your email will appear here" text="Fill in the purpose and context, or click Use Example to try it instantly." />
        }
      />
    </>
  );
}
