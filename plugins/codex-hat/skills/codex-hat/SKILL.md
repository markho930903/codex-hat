---
name: codex-hat
description: Select and execute an available Codex model and reasoning effort from task type, difficulty, risk, and parallelism. Use when the user explicitly invokes $codex-hat:codex-hat, asks Codex to choose a model or effort, or requests task routing across Sol, Terra, and Luna.
---

# Codex Hat

Route the requested work without changing its scope, permissions, or success criteria.

## Workflow

1. Preserve an explicit user model or effort override. Never silently replace it.
2. Read [references/routing-policy.md](references/routing-policy.md), then classify the next phase of work into its four profile fields.
3. When local facts decide the classification, perform the smallest authorized read-only inspection first. Classify once from that evidence; do not guess from repository size or domain words.
4. Discover the host's model and effort combinations from `model/list` or the available tool schema when possible. Otherwise let the selector use its bundled baseline.
5. Run the selector with profile metadata only. Do not include the user's prompt, code, paths, secrets, or other task content in the JSON argument.

```bash
node <skill-dir>/scripts/select-route.mjs '{"taskType":"implementation","difficulty":"normal","risk":"normal","parallelizable":false}'
```

Pass an optional `capabilities` object when the host exposes current values. Pass an optional `override` object only for an explicit user choice.

6. Inspect both `recommended` and `effective`. Report the route when the user asks, when an override applies, or when a fallback changes the recommendation.
7. Execute through the narrowest native mechanism available:
   - Continue directly only when the current task already has the effective route.
   - Prefer a native subagent with the exact model and effort for delegated work.
   - Create a separate user-owned task only when the user explicitly authorizes that behavior.
   - Return the recommendation without dispatch when the host cannot select the effective route.
8. Give the selected agent the original request, constraints, working context, and completion criteria. Preserve authorization boundaries.
9. If the task moves to a materially different phase, classify and route that next phase before executing it. This may dispatch a new agent; it never changes the current agent's effort in place.
10. For `ultra`, split only genuinely independent work, cap the lanes, wait for them, and synthesize one result.

## Failure Rules

- Do not downgrade a Sol policy route when Sol is unavailable; return the selector error.
- Do not retry an unsupported explicit model or effort with another value.
- Treat `mini` and `minimal` as input aliases only. Use the selector's returned native effort.
- Do not use `ultra` as a synonym for deeper serial reasoning; use `max` for that case.
- Do not spawn agents when project, host, or user instructions prohibit delegation.
