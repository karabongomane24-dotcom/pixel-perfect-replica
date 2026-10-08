// AI service layer. Each function receives the structured prompt; today it returns a
// realistic demo response. Replace `runModel` bodies with a real LLM call later.
import type { EmailInput, MeetingInput, ResearchInput, Refinement, PromptSpec } from "./prompts";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const sentences = (t: string) => t.replace(/\n+/g, ". ").split(/(?<=[.!?])\s+|\.\s/).map((s) => s.trim().replace(/^[-*•\d.)\s]+/, "")).filter((s) => s.length > 3);
const cap = (s = "") => s.charAt(0).toUpperCase() + s.slice(1);
const trimEnd = (s = "") => s.replace(/[.\s]+$/, "");

export type EmailResult = { subject: string; greeting: string; body: string[]; cta: string; signoff: string };
export type ActionItem = { action: string; owner: string; deadline: string; status: string };
export type MeetingResult = { summary: string; topics: string[]; decisions: string[]; actions: ActionItem[]; risks: string[]; questions: string[] };
export type ResearchResult = { takeaway: string; summary: string; insights: string[]; findings: string[]; recommendations: string[]; risks: string[]; questions: string[] };

const greetings: Record<string, string> = { Client: "Dear", Manager: "Hi", Colleague: "Hi", Customer: "Dear", Team: "Hi team", Other: "Hello" };
const toneOpen: Record<string, string> = {
  Professional: "I hope this message finds you well.",
  Friendly: "Hope you're having a great week!",
  Formal: "I am writing to you regarding the following matter.",
  Concise: "",
  Persuasive: "I'd like to share an opportunity I believe is worth your attention.",
  Apologetic: "Please accept my sincere apologies for any inconvenience caused.",
  Appreciative: "Thank you so much for your continued support.",
  Assertive: "I'm writing to address an important matter directly.",
};
const toneClose: Record<string, string> = {
  Professional: "Best regards,", Friendly: "Cheers,", Formal: "Yours sincerely,", Concise: "Thanks,",
  Persuasive: "Looking forward to your response,", Apologetic: "With apologies,", Appreciative: "With gratitude,", Assertive: "Regards,",
};

export async function generateEmail(i: EmailInput, _p: PromptSpec, r: Refinement): Promise<EmailResult> {
  await wait(1400);
  let tone = i.tone;
  if (r === "professional") tone = "Professional";
  if (r === "friendlier") tone = "Friendly";
  const purpose = trimEnd(i.purpose);
  const ctx = sentences(i.context);
  const body: string[] = [];
  if (toneOpen[tone]) body.push(toneOpen[tone]);
  body.push(`I'm reaching out to ${purpose.charAt(0).toLowerCase() + purpose.slice(1)}.`);
  const len = r === "shorter" ? "Short" : i.length;
  if (ctx.length && len !== "Short") body.push(ctx.slice(0, len === "Detailed" ? 4 : 2).map((s) => trimEnd(s) + ".").join(" "));
  if (len === "Detailed") body.push("I've outlined the key points above so we can align quickly, and I'm happy to provide any additional detail that would be helpful.");
  const cta = i.cta ? `Could you please ${trimEnd(i.cta.charAt(0).toLowerCase() + i.cta.slice(1))}?` : "Please let me know your thoughts at your earliest convenience.";
  const g = greetings[i.audience] ?? "Hello";
  return {
    subject: cap((purpose.split(/[,.]/)[0] ?? "").slice(0, 70)),
    greeting: g.includes("team") ? `${g},` : `${g} [Name],`,
    body,
    cta,
    signoff: `${toneClose[tone] ?? "Best regards,"}\n[Your name]`,
  };
}

const DEADLINE = /\b(by|before|due|on)\s+((mon|tues|wednes|thurs|fri|satur|sun)day|tomorrow|next week|end of (the )?(week|month|day)|eod|eow|\w+ \d{1,2}(st|nd|rd|th)?|\d{1,2}[/-]\d{1,2})/i;
const OWNER = /^([A-Z][a-z]+)\b|@([A-Za-z]+)/;

export async function summarizeMeeting(i: MeetingInput, _p: PromptSpec, r: Refinement): Promise<MeetingResult> {
  await wait(1700);
  const lines = i.notes.split(/\n|(?<=[.!?])\s+/).map((l) => l.trim().replace(/^[-*•\d.)\s]+/, "")).filter(Boolean);
  const decisions = lines.filter((l) => /decid|agreed|approved|confirmed|will go with/i.test(l));
  const actionLines = lines.filter((l) => /\bwill\b|to do|action|follow up|send|prepare|owner|assign|needs? to/i.test(l) && !decisions.includes(l));
  const actions: ActionItem[] = actionLines.map((l) => {
    const o = l.match(OWNER);
    const owner = o ? (o[1] ?? o[2]) : "";
    const d = l.match(DEADLINE);
    return { action: cap(trimEnd(l)), owner: owner && !/^(We|The|This|It|They|Need)$/.test(owner) ? owner : "⚠ Unassigned", deadline: d ? cap(d[2]) : "⚠ Not set", status: "Open" };
  });
  const risks = lines.filter((l) => /risk|concern|block|delay|issue|worried|tight/i.test(l));
  const questions = lines.filter((l) => /\?|unclear|tbd|unknown|not sure/i.test(l));
  const words = i.notes.toLowerCase().match(/\b[a-z]{5,}\b/g) ?? [];
  const stop = new Set(["about", "there", "their", "which", "would", "should", "could", "agreed", "decided", "meeting", "will", "needs", "going", "think"]);
  const freq = new Map<string, number>();
  words.forEach((w) => !stop.has(w) && freq.set(w, (freq.get(w) ?? 0) + 1));
  const topics = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, r === "shorter" ? 3 : 5).map(([w]) => cap(w));
  const summary = `This ${i.type.toLowerCase()} covered ${topics.slice(0, 3).join(", ").toLowerCase() || "several topics"}. The group reached ${decisions.length} decision${decisions.length === 1 ? "" : "s"} and identified ${actions.length} action item${actions.length === 1 ? "" : "s"}${risks.length ? `, with ${risks.length} risk${risks.length === 1 ? "" : "s"} flagged` : ""}.${questions.length ? ` ${questions.length} question${questions.length === 1 ? " remains" : "s remain"} open.` : ""}`;
  const lim = r === "shorter" ? 3 : 99;
  return { summary, topics, decisions: decisions.slice(0, lim).map(trimEnd), actions: actions.slice(0, lim), risks: risks.slice(0, lim).map(trimEnd), questions: questions.slice(0, lim).map(trimEnd) };
}

export async function analyzeResearch(i: ResearchInput, _p: PromptSpec, r: Refinement): Promise<ResearchResult> {
  await wait(1900);
  const s = sentences(i.topic);
  const subject = trimEnd(s[0] ?? i.topic).slice(0, 120);
  const n = r === "simplify" ? 2 : r === "expand" ? 6 : i.style === "Concise" ? 3 : 4;
  const findings = s.length > 1 ? s.slice(0, n).map(trimEnd) : [
    `Current evidence on "${subject}" is mixed and depends heavily on context`,
    "Early adopters report measurable efficiency gains, though sample sizes are small",
    "Costs and implementation effort are frequently underestimated",
    "Outcomes improve markedly when goals and metrics are defined upfront",
  ].slice(0, n);
  const goal = trimEnd(i.goal || "understand the topic");
  return {
    takeaway: `For a ${i.audience.toLowerCase()}, the most useful framing of "${subject}" is as a trade-off: clear upside, but success depends on scoping and measurement — which directly serves your goal to ${goal.charAt(0).toLowerCase() + goal.slice(1)}.`,
    summary: `${i.mode}: ${subject}. The material points to ${findings.length} core findings. Interpretations below are separated from stated facts, and uncertainty is flagged where evidence is thin.`,
    insights: ["The strongest claims rest on a narrow evidence base (interpretation)", "Context and implementation quality matter more than the idea itself", "There is a gap between reported intent and measured outcomes", ...(r === "expand" ? ["Second-order effects (cost, culture, skills) are rarely discussed"] : [])].slice(0, n),
    findings,
    recommendations: ["Define 2–3 measurable success criteria before committing", "Run a small, time-boxed pilot to validate assumptions", "Revisit the decision with real data after the pilot", ...(r === "expand" ? ["Assign a single owner accountable for outcomes"] : [])].slice(0, n),
    risks: ["Source material may be incomplete or one-sided", "No independent sources were verified — validate before citing", "Findings may not generalize to your context"],
    questions: [`What would change your view on ${subject.slice(0, 50)}?`, "Which stakeholders are most affected, and how?", "What does a successful outcome look like in 6 months?"],
  };
}
