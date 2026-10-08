import { createFileRoute } from "@tanstack/react-router";
import { Bookmark } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { HistoryList } from "@/components/HistoryList";
import { useHistory } from "@/lib/store";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "Saved Results — ClarityAI" },
      { name: "description", content: "Your bookmarked emails, meeting notes and research reports." },
      { property: "og:title", content: "Saved Results — ClarityAI" },
      { property: "og:description", content: "Keep your most useful AI outputs close." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => {
    const items = useHistory().filter((h) => h.saved);
    return <><PageHeader icon={Bookmark} title="Saved Results" subtitle="Bookmarked outputs, organized by category." /><HistoryList items={items} savedMode /></>;
  },
});
