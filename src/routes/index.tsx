import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, FileText, Search, ArrowRight, Sparkles, Clock, Bookmark } from "lucide-react";
import { useHistory, toolMeta } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — ClarityAI" },
      { name: "description", content: "Work smarter with AI: emails, meeting summaries and research in one workspace." },
      { property: "og:title", content: "ClarityAI — Work smarter with AI" },
      { property: "og:description", content: "Generate professional communication, transform meeting notes and turn research into insights." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const tools = [
  { to: "/email", icon: Mail, title: "Smart Email Generator", text: "Create polished, professional emails in seconds with the right tone and structure.", cta: "Generate Email", tone: "bg-primary-soft text-primary" },
  { to: "/meetings", icon: FileText, title: "Meeting Notes Summarizer", text: "Turn long meeting notes into concise summaries, decisions, action items, owners, and deadlines.", cta: "Summarize Notes", tone: "bg-secondary-soft text-secondary" },
  { to: "/research", icon: Search, title: "AI Research Assistant", text: "Summarize topics and articles, identify key insights, and generate useful recommendations.", cta: "Start Research", tone: "bg-success-soft text-success" },
] as const;

function Dashboard() {
  const history = useHistory();
  return (
    <div className="space-y-10">
      <section className="surface relative overflow-hidden p-8 sm:p-12">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary-soft blur-2xl" />
        <div className="pointer-events-none absolute -bottom-32 right-32 h-64 w-64 rounded-full bg-secondary-soft blur-2xl" />
        <div className="relative max-w-2xl">
          <span className="badge bg-primary-soft text-primary"><Sparkles className="h-3 w-3" />Turn information into action</span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">Work smarter with <span className="text-brand">AI</span></h1>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">Generate professional communication, transform meeting notes, and turn complex research into clear insights — all in one workspace.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/email" className="btn btn-primary btn-lg">Get Started<ArrowRight className="h-4 w-4" /></Link>
            <a href="#tools" className="btn btn-outline btn-lg">Explore Tools</a>
          </div>
        </div>
      </section>

      <section id="tools" className="scroll-mt-6">
        <h2 className="mb-4 text-lg font-bold">Your AI tools</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {tools.map((t) => (
            <Link key={t.to} to={t.to} className="surface surface-hover group flex flex-col p-6">
              <div className={`grid h-12 w-12 place-items-center rounded-2xl ${t.tone}`}><t.icon className="h-6 w-6" /></div>
              <h3 className="mt-5 text-lg font-bold">{t.title}</h3>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{t.text}</p>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">{t.cta}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-[2fr_1fr]">
        <div className="surface p-6">
          <div className="mb-4 flex items-center justify-between"><h2 className="font-bold">Recent activity</h2><Link to="/history" className="text-sm font-semibold text-primary">View all</Link></div>
          {history.length === 0 ? <p className="text-sm text-muted-foreground">No generations yet. Pick a tool above and hit "Use Example" to see it in action.</p> : (
            <ul className="divide-y">
              {history.slice(0, 4).map((h) => (
                <li key={h.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div className="min-w-0"><div className="truncate font-semibold">{h.title}</div><div className="text-xs text-muted-foreground">{toolMeta[h.tool].label}</div></div>
                  <span className="shrink-0 text-xs text-muted-foreground">{new Date(h.createdAt).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="grid gap-5">
          <Stat icon={Clock} label="Generations" value={history.length} />
          <Stat icon={Bookmark} label="Saved results" value={history.filter((h) => h.saved).length} />
        </div>
      </section>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: number }) {
  return (
    <div className="surface flex items-center gap-4 p-5">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-accent-foreground"><Icon className="h-5 w-5" /></div>
      <div><div className="text-2xl font-extrabold">{value}</div><div className="text-xs text-muted-foreground">{label}</div></div>
    </div>
  );
}
