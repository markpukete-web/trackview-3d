# Working Agreements

Last updated: 2026-05-25

This file is the shared execution baseline for Codex work in this repo. It is inspired by `multica-ai/andrej-karpathy-skills` as reviewed on 2026-05-25, but project-specific rules in `AGENTS.md`, source docs, and Mark's latest instruction always win.

## Authority

- Follow Mark's latest instruction first.
- Follow `AGENTS.md`, Cesium/Google 3D Tiles gotchas, API-key rules, and multi-track architecture rules before this baseline.
- If this file conflicts with a project-specific rule, stop and report the conflict.
- Do not use this baseline to widen scope, add process churn, or rewrite working architecture.

## Universal execution baseline

- Think before coding: restate the goal, surface material assumptions, and ask only when ambiguity would make the work risky or materially different.
- Simplicity first: solve the current task with the smallest clear change; avoid speculative abstractions, configuration, dependencies, or future-proofing.
- Surgical changes: touch only the files and lines needed for the request, match local style, and clean up only the unused pieces introduced by the change.
- Goal-driven execution: name the verifier, run the relevant check, and report the result or residual risk before calling the work complete.
- Source-of-truth discipline: prefer current repo docs, explicit user instructions, and active plans over inferred memory or old chat history.

## Closeout

- Keep changed files intentional.
- Report validation performed and checks skipped with reasons.
- Report rendering, mobile/touch, performance, attribution, API-key, and deployment impacts when relevant.
- Do not push unless Mark explicitly asks.
