# Graph Report - AutoApply  (2026-07-19)

## Corpus Check
- 29 files · ~20,795 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 12 nodes · 11 edges · 1 communities
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1a03e0a2`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- AutoApply — Design Spec

## God Nodes (most connected - your core abstractions)
1. `AutoApply — Design Spec` - 11 edges
2. `Problem` - 1 edges
3. `Goal` - 1 edges
4. `Scope (v1)` - 1 edges
5. `Out of scope for v1` - 1 edges
6. `Architecture` - 1 edges
7. `Data model` - 1 edges
8. `Field matching` - 1 edges
9. `Fill flow` - 1 edges
10. `Error handling` - 1 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Communities (1 total, 0 thin omitted)

### Community 0 - "AutoApply — Design Spec"
Cohesion: 0.17
Nodes (11): Architecture, AutoApply — Design Spec, Data model, Error handling, Field matching, Fill flow, Goal, Out of scope for v1 (+3 more)

## Knowledge Gaps
- **10 isolated node(s):** `Problem`, `Goal`, `Scope (v1)`, `Out of scope for v1`, `Architecture` (+5 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `Problem`, `Goal`, `Scope (v1)` to the rest of the system?**
  _10 weakly-connected nodes found - possible documentation gaps or missing edges._