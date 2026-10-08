<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- AI prompt construction lives in src/lib/prompts.ts and model calls in src/lib/ai.ts (currently demo responses); UI never builds prompts — so a real LLM can be swapped in without touching pages.
- Generation history/saved results are stored in browser localStorage via src/lib/store.ts — no backend yet.
