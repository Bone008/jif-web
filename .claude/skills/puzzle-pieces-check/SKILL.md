---
name: puzzle-pieces-check
description: Verify changes to the Interface Puzzle Pieces (InterfaceJaggedPiece component) by taking automated Playwright screenshots and showing them inline. ACTIVATE whenever the user asks to work on, change, redesign, restyle, or modify the contents of the puzzle pieces — including layout, colors, shapes, typography, the jagged edge SVG, or what data they display. Run this AFTER applying the requested code change so the screenshots reflect the new state.
---

# Puzzle Pieces Visual Check

Use this skill to capture before/after-style verification screenshots whenever the user is iterating on the Interface Puzzle Pieces UI (`src/components/InterfaceJaggedPiece.tsx` and its SCSS). It bypasses saving screenshots into the repo by routing them through `/tmp` and then reading them back inline so the user sees the result in chat.

## When to use

Trigger this skill whenever the work touches the puzzle pieces — design tweaks, content changes, label/font changes, shape/edge changes, hover states, copy-button changes, or anything inside `InterfaceJaggedPiece.tsx` / `InterfaceJaggedPiece.scss`. Run it AFTER the code edit, so the screenshot reflects the new state.

Skip it if the user explicitly says "no need to verify" or is only asking a question (not making a change).

## Default test inputs

Unless the user specifies otherwise, always test with these two siteswaps, each entered TWICE (concatenated with itself — see `feedback_siteswap_doubling` memory):

1. `778686778686` (originally `778686`)
2. `679752679752` (originally `679752`)

The puzzle pieces only render for 2-juggler patterns where each juggler returns to itself, so siteswap input via `?q=` is the right path.

## Procedure

1. **Start the dev server if it isn't running.** Use `npm start > /tmp/jif-vite.log 2>&1 &` and then read `/tmp/jif-vite.log` to discover the port (Vite increments if 5173 is taken). Don't kill an existing server — reuse it.

2. **Spawn a subagent** (general-purpose) to do the Playwright work in isolation, keeping screenshot bytes out of the main agent's context until they're needed. Pass it the dev-server URL and the list of siteswaps. Tell it to:
   - For each siteswap, navigate to `http://localhost:<PORT>/?q=<siteswap>` (the doubled form).
   - Use `mcp__playwright__browser_snapshot` to find the `ref` of the "Interface Puzzle Pieces" section heading's parent container.
   - Call `mcp__playwright__browser_take_screenshot` with `element` + `ref` + `filename: "/tmp/puzzle-<siteswap>.png"` (absolute path keeps it out of the repo).
   - Close the browser at the end with `mcp__playwright__browser_close`.
   - Report back the list of `/tmp/puzzle-*.png` paths it produced and any visual issues it noticed (clipped text, broken layout, console errors).

3. **Read each screenshot back** with the `Read` tool — Read renders PNGs inline, which is how the image reaches the user-visible output. Do this in the main agent, not the subagent (subagent text summaries don't pass image bytes back to the parent).

4. **Summarise** in one or two sentences: which siteswaps you rendered and whether the change looks correct. Don't restate what the user can already see in the embedded images.

## Cleanup

`/tmp/puzzle-*.png` and `/tmp/jif-vite.log` are outside the repo, so no cleanup is required. Do NOT save screenshots into the project tree (no `.playwright-mcp/`, no root-level PNGs) — both have happened before and had to be deleted.

## Subagent prompt template

```
Take Playwright screenshots of the Interface Puzzle Pieces section of the jif-web app.

Dev server: http://localhost:<PORT>/
Siteswaps to test (each is the user-facing siteswap doubled — use as-is in the URL):
  - 778686778686
  - 679752679752  (or the user-overridden list)

For each one:
1. browser_navigate to http://localhost:<PORT>/?q=<siteswap>
2. browser_snapshot to find the ref of the "Interface Puzzle Pieces" container (the <div> wrapping the <h3>"Interface Puzzle Pieces"</h3> and the puzzle piece imgs)
3. browser_take_screenshot with element="Interface Puzzle Pieces section", ref=<that ref>, filename="/tmp/puzzle-<siteswap>.png"

Then browser_close.

Report: the list of /tmp paths you produced, plus anything visually off (clipped text, layout breakage, console errors).

Do NOT save screenshots anywhere under the project directory — only /tmp.
```
