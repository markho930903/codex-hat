---
name: codex-hat
description: Enforce Sol High or above for supervision and Luna Max for bounded implementation on every task. Use automatically for all tasks and when the user explicitly invokes $codex-hat:codex-hat or asks about model routing.
---

# Codex Hat

Route the requested work without changing its scope, permissions, or success criteria.

## Workflow

1. Enforce the phase route. Accept an explicit model or effort override only when it matches that route exactly.
2. Read [references/routing-policy.md](references/routing-policy.md).
3. Start every task in `supervision`. Lifecycle hooks inject this requirement on session start, every user prompt, and every subagent start. Sol owns request understanding, investigation, planning, design, decomposition, decisions, and result review.
4. When local facts decide the profile, perform the smallest authorized read-only inspection first. Classify once from that evidence; do not guess from repository size or domain words.
5. Discover the host's model and effort combinations from `model/list` or the available tool schema when possible. Otherwise let the selector use its bundled baseline.
6. Run the selector with profile metadata only. Do not include the user's prompt, code, paths, secrets, or other task content in the JSON argument.

```bash
node <skill-dir>/scripts/select-route.mjs '{"phase":"supervision","taskType":"implementation","difficulty":"normal","risk":"normal","parallelizable":false}'
```

Pass an optional `capabilities` object when the host exposes current values. Pass an optional `override` object only to confirm the mandatory route exactly.

7. Inspect both `recommended` and `effective`. Report the route when the user asks or when an automatic route is unavailable.
8. Execute through the narrowest native mechanism available:
   - Continue directly only when the current task already has the effective route.
   - Prefer a native subagent with the exact model and effort for delegated work.
   - Create a separate user-owned task only when the user explicitly authorizes that behavior.
   - Return the recommendation without dispatch when the host cannot select the effective route.
9. Sol must define each implementation unit's scope, constraints, context, and completion checks. Only then route that unit as `implementation` with `supervisionComplete: true` and all four matching `handoff` flags set to `true`, then delegate it to Luna Max. Luna must not expand or redesign the unit.
10. After Luna returns, route back to `supervision`. Sol inspects the changes and checks, decides whether the unit is accepted, and defines any follow-up implementation unit.
11. For hard parallel work, Sol Ultra may split only genuinely independent units. Route each clear implementation unit separately to Luna Max, cap the lanes, wait for them, and let Sol synthesize the result.

## Failure Rules

- Do not substitute another model for an automatic Sol supervision route or Luna Max implementation route; return the selector error.
- Do not set `supervisionComplete: true` until Sol has produced the bounded implementation unit.
- Do not accept a model or effort override that differs from the mandatory phase route.
- Do not use `ultra` as a synonym for deeper serial reasoning; it is only for hard parallel supervision.
- Do not spawn agents when project, host, or user instructions prohibit delegation.
