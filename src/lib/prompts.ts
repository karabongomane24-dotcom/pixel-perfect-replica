// Structured prompt construction — kept separate from UI so an LLM API can consume these directly.
export type PromptSpec = {
  role: string;
  objective: string;
  context: string;
  input: string;
  instructions: string[];
  constraints: string[];
  output: string[];
};

export function renderPrompt(p: PromptSpec): string {
  return [
    `SYSTEM ROLE\nYou are an ${p.role}.`,
    `USER OBJECTIVE\n${p.objective}`,
    `CONTEXT\n${p.context || "(none)"}`,
    `INPUT\n${p.input || "(none)"}`,
    `INSTRUCTIONS\n${p.instructions.map((i) => `- ${i}`).join("\n")}`,
    `CONSTRAINTS\n${p.constraints.map((i) => `- ${i}`).join("\n")}`,
    `OUTPUT FORMAT\n${p.output.map((o, i) => `${i + 1}. ${o}`).join("\n")}`,
  ].join("\n\n");
}

export type Refinement = "shorter" | "professional" | "friendlier" | "simplify" | "expand" | null;

export type EmailInput = { audience: string; purpose: string; context: string; tone: string; length: string; cta: string };
export function buildEmailPrompt(i: EmailInput, r: Refinement = null): PromptSpec {
  return {
    role: "expert professional business writer",
    objective: `Create a clear, professional email to communicate: ${i.purpose}`,
    context: `Audience: ${i.audience}. ${i.context}`,
    input: i.purpose,
    instructions: [`Use a ${i.tone.toLowerCase()} tone`, `Length: ${i.length}`, `Call to action: ${i.cta || "infer one"}`, ...(r ? [`Refine: make it ${r}`] : [])],
    constraints: ["Clear", "Concise", "Professional", "Grammatically correct"],
    output: ["Subject line", "Greeting", "Email body", "Call to action", "Professional sign-off"],
  };
}

export type MeetingInput = { type: string; notes: string; style: string };
export function buildMeetingPrompt(i: MeetingInput, r: Refinement = null): PromptSpec {
  return {
    role: "meeting intelligence assistant",
    objective: "Analyze and organize meeting notes",
    context: `Meeting type: ${i.type}. Summary style: ${i.style}`,
    input: i.notes,
    instructions: ["Summarize the discussion", "Identify major topics", "Extract decisions", "Extract action items", "Identify owners", "Identify deadlines", "Identify risks", "Identify unresolved questions", ...(r ? [`Refine: make it ${r}`] : [])],
    constraints: ["Do not invent information", "Preserve important facts", "Clearly distinguish decisions from suggestions", "Flag missing owners or deadlines"],
    output: ["Executive Summary", "Key Discussion Topics", "Decisions", "Action Items", "Owners", "Deadlines", "Risks", "Open Questions"],
  };
}

export type ResearchInput = { mode: string; topic: string; goal: string; audience: string; style: string };
export function buildResearchPrompt(i: ResearchInput, r: Refinement = null): PromptSpec {
  return {
    role: "expert research analyst",
    objective: i.goal || "Analyze and synthesize the supplied research topic or source",
    context: `Mode: ${i.mode}. Audience: ${i.audience}. Style: ${i.style}`,
    input: i.topic,
    instructions: ["Summarize the topic", "Identify key themes", "Extract important findings", "Identify supporting evidence", "Highlight assumptions", "Identify gaps", "Explain implications", "Provide insights", "Provide recommendations", "Suggest follow-up questions", ...(r ? [`Refine: ${r}`] : [])],
    constraints: ["Separate facts from interpretation", "Avoid unsupported claims", "Be concise but informative", "Clearly identify uncertainty", "Do not fabricate sources"],
    output: ["Executive Summary", "Key Themes", "Important Findings", "Insights", "Implications", "Recommendations", "Knowledge Gaps", "Follow-up Questions"],
  };
}
