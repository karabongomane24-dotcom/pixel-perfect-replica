import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";
import { Field, Select } from "@/components/workspace";
import { clearHistory } from "@/lib/store";
import { useState } from "react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — ClarityAI" },
      { name: "description", content: "Manage your ClarityAI profile, defaults and data." },
      { property: "og:title", content: "Settings — ClarityAI" },
      { property: "og:description", content: "Profile, defaults and workspace preferences." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [tone, setTone] = useState("Professional");
  return (
    <>
      <PageHeader icon={Settings} title="Settings" subtitle="Profile, defaults and data." />
      <div className="grid max-w-3xl gap-5">
        <section className="surface space-y-4 p-6">
          <h2 className="font-bold">Profile</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name"><input className="field" defaultValue="Karabo Ngomane" /></Field>
            <Field label="Email signature"><input className="field" defaultValue="Karabo" /></Field>
          </div>
        </section>
        <section className="surface space-y-4 p-6">
          <h2 className="font-bold">Defaults</h2>
          <Field label="Default email tone"><Select value={tone} onChange={setTone} options={["Professional", "Friendly", "Formal", "Concise"]} /></Field>
          <button className="btn btn-primary" onClick={() => toast.success("Settings saved")}>Save changes</button>
        </section>
        <section className="surface space-y-3 p-6">
          <h2 className="font-bold">Data</h2>
          <p className="text-sm text-muted-foreground">History is stored in this browser.</p>
          <button className="btn btn-outline text-destructive" onClick={() => { clearHistory(); toast.success("History cleared"); }}>Clear all history</button>
        </section>
      </div>
    </>
  );
}
