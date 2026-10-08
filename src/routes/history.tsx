import { createFileRoute } from "@tanstack/react-router";
import { History } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { HistoryList } from "@/components/HistoryList";
import { useHistory } from "@/lib/store";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "History — ClarityAI" },
      { name: "description", content: "Browse, search and reuse your previous AI generations." },
      { property: "og:title", content: "History — ClarityAI" },
      { property: "og:description", content: "Every email, meeting summary and research report you've generated." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => {
    const items = useHistory();
    return <><PageHeader icon={History} title="History" subtitle="Everything you've generated, in one place." /><HistoryList items={items} /></>;
  },
});
