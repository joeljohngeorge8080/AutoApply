# Graph Report - AutoApply  (2026-08-23)

## Corpus Check
- 47 files · ~24,547 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 306 nodes · 335 edges · 36 communities (27 shown, 9 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `157e0b75`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- AutoApply — Design Spec
- Wiki Index
- Recent Context
- Log
- _index.md
- _index.md
- _index.md
- overview.md
- ADR Format
- Codex-Build — Codex Types, Claude Verifies
- Codex-Review — Adversarial Plan-Review Loop
- Steps to Test AutoApply Extension
- fill.ts
- Obsidian Vault
- graphify reference: extra exports and benchmark
- Process
- graphify reference: query, path, explain
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- Third-Party Notices
- Third-Party Notices
- extraction-spec.md
- .mcp.json
- README.md
- vite.config.ts
- dictionary.ts

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 14 edges
2. `What You Must Do When Invoked` - 12 edges
3. `Codex-Build — Codex Types, Claude Verifies` - 11 edges
4. `/graphify` - 10 edges
5. `ACT 2 — REVIEW (Claude ↔ Codex)` - 9 edges
6. `renderListView()` - 8 edges
7. `graphify reference: extra exports and benchmark` - 8 edges
8. `During the session` - 8 edges
9. `ACT 2 — REVIEW (Claude ↔ Codex)` - 8 edges
10. `Grill-with-Docs-Codex — Grill Against Your Domain, Then Get Reviewed` - 7 edges

## Surprising Connections (you probably didn't know these)
- `run()` --calls--> `matchFields()`  [EXTRACTED]
  src/content/fill.ts → src/lib/matching/match.ts
- `refreshProfiles()` --calls--> `listProfiles()`  [EXTRACTED]
  src/popup/popup.ts → src/lib/storage/storage.ts
- `handleFill()` --calls--> `getProfile()`  [EXTRACTED]
  src/popup/popup.ts → src/lib/storage/storage.ts
- `renderListView()` --calls--> `getProfile()`  [EXTRACTED]
  src/popup/popup.ts → src/lib/storage/storage.ts
- `handleSave()` --calls--> `saveProfile()`  [EXTRACTED]
  src/popup/popup.ts → src/lib/storage/storage.ts

## Import Cycles
- None detected.

## Communities (36 total, 9 thin omitted)

### Community 0 - "AutoApply — Design Spec"
Cohesion: 0.17
Nodes (23): SAMPLE_PROFILE, deleteProfile(), getProfile(), listProfiles(), readProfiles(), saveProfile(), FakeChromeStorage, writeProfiles() (+15 more)

### Community 1 - "Wiki Index"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 2 - "Recent Context"
Cohesion: 0.08
Nodes (23): chrome, DOM, ES2020, src, vite.config.ts, vite.content.config.ts, vitest.config.ts, vitest/globals (+15 more)

### Community 3 - "Log"
Cohesion: 0.16
Nodes (20): applyValue(), extractSignals(), Fillable, FillResult, isFillable(), labelTextFor(), NON_FILLABLE_INPUT_TYPES, run() (+12 more)

### Community 4 - "_index.md"
Cohesion: 0.09
Nodes (22): ACT 1 — GRILL WITH DOCS (you ↔ Claude), ACT 2 — REVIEW (Claude ↔ Codex), Challenge against the glossary, Cross-reference with code, Discuss concrete scenarios, Domain awareness, During the session, Each round (+14 more)

### Community 5 - "_index.md"
Cohesion: 0.10
Nodes (20): devDependencies, @types/chrome, @types/node, typescript, vite, vitest, name, private (+12 more)

### Community 6 - "_index.md"
Cohesion: 0.11
Nodes (18): action, default_icon, default_popup, 128, 16, 48, description, icons (+10 more)

### Community 7 - "overview.md"
Cohesion: 0.14
Nodes (13): ACT 1 — GRILL (you ↔ Claude), ACT 2 — REVIEW (Claude ↔ Codex), ACT 3 (optional) — BUILD (Codex ↔ Claude, roles flipped), Each round, after Codex returns, Grill-Me-Codex — Get Grilled, Then Get Reviewed, Hard rules, Prerequisites (verify once, fast), Resolution (you sign off — final gate) (+5 more)

### Community 8 - "ADR Format"
Cohesion: 0.15
Nodes (10): ADR Format, Numbering, Optional sections, Template, What qualifies, When to offer an ADR, CONTEXT.md Format, Rules (+2 more)

### Community 9 - "Codex-Build — Codex Types, Claude Verifies"
Cohesion: 0.17
Nodes (11): Codex-Build — Codex Types, Claude Verifies, Hard rules, Prerequisites (verify once, fast), Step 0 — Gates (before any Codex launch), Step 1 — The build prompt (contract, via temp file), Step 2 — Launch Codex (fresh session, capture `thread_id`), Step 3 — Verify (Claude, always, never delegated), Step 4 — Fix loop (same session, bounded) (+3 more)

### Community 10 - "Codex-Review — Adversarial Plan-Review Loop"
Cohesion: 0.18
Nodes (10): Codex-Review — Adversarial Plan-Review Loop, Flow, Hard rules, Prerequisites (verify once, fast), Step 0 — Kickoff (human gate #1), Step 1 — Claude plans, Step 2 — The loop, Step 3 — Resolution (human gate #2) (+2 more)

### Community 11 - "Steps to Test AutoApply Extension"
Cohesion: 0.18
Nodes (10): 1. Load Extension into Chrome, 2. Create a Test Profile, 3. Test on a Real Application Form, 4. Verify Behavior, 5. Edge Cases to Test, AutoApply E2E Testing Plan, Known Limitations, Status (+2 more)

### Community 12 - "fill.ts"
Cohesion: 0.48
Nodes (5): ageFromDob(), DateFormat, dateReformat(), fullNameFromParts(), parseKnownDateFormat()

### Community 13 - "Obsidian Vault"
Cohesion: 0.20
Nodes (9): Create a new note, Find index notes, Find related notes, Linking, Naming conventions, Obsidian Vault, Search for notes, Vault location (+1 more)

### Community 14 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 15 - "Process"
Cohesion: 0.25
Nodes (7): 1. Pin the fixed point, 2. Identify the spec source, 3. Identify the standards sources, 4. Spawn both sub-agents in parallel, 5. Aggregate, Process, Why two axes

### Community 16 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 17 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 18 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 19 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

## Knowledge Gaps
- **181 isolated node(s):** `MatchConfidence`, `FieldMatch`, `FUZZY_ENTRIES`, `SIGNAL_PRIORITY`, `supabase` (+176 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Grill-with-Docs-Codex — Grill Against Your Domain, Then Get Reviewed` connect `_index.md` to `ADR Format`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Why does `Profile` connect `AutoApply — Design Spec` to `Log`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **What connects `MatchConfidence`, `FieldMatch`, `FUZZY_ENTRIES` to the rest of the system?**
  _181 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Wiki Index` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Recent Context` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._
- **Should `_index.md` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._
- **Should `_index.md` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._