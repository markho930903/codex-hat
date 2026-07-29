# Routing Policy

Build a task profile from the work that will happen next, not from keywords in
the request. Use this order:

1. Identify the primary deliverable and select the task type.
2. Estimate difficulty from known scope and dependencies.
3. Estimate risk from the consequences of acting on the result.
4. Mark parallelism only when independent work units can be named now.

When repository facts decide a boundary, perform the smallest authorized
read-only inspection before selecting a route. For a mixed-phase task, classify
the current phase and classify again only when the work moves to a materially
different phase, such as investigation to implementation.

## Task Type

- `mechanical`: extraction, classification, formatting, translation, or another deterministic transformation or operation.
- `knowledge`: search, summarization, documentation, or synthesis with a clear output contract.
- `implementation`: coding, tests, configuration, or a scoped fix with an identifiable owner.
- `investigation`: debugging, root-cause analysis, review, proof, or research that must test competing explanations.
- `architecture`: system design, migration strategy, trust boundaries, or another decision-heavy design task.

Choose the type from the requested deliverable. Security, financial,
production, permission, and migration terms do not make a task `architecture`
by themselves. For an operational request, use `mechanical` for a deterministic
operation, `implementation` for a code or configuration change,
`investigation` for diagnosis, and `architecture` for designing the operation.

## Difficulty

- `easy`: one clear outcome, local scope, few dependencies, and an obvious validation path.
- `normal`: several dependent steps or files, but established patterns and bounded validation.
- `hard`: material ambiguity, multiple modules, subtle edge cases, or substantial verification.
- `extreme`: cross-system reasoning, a large context, competing constraints, or unusually deep validation.

Do not raise difficulty merely because a deterministic task has many records. Volume affects execution shape; it does not necessarily require a stronger model.

Keep difficulty independent from risk. A dangerous but well-defined operation
can be easy or normal; a read-only proof can be hard or extreme. Do not use
`extreme` for a single subtle problem unless it requires unusually deep or
cross-system reasoning.

## Risk

- `low`: read-only or readily reversible work with limited downstream impact.
- `normal`: ordinary local edits, validation, or reversible non-production changes.
- `high`: an authorized action can affect production, money, permissions, a security boundary, persistent data, or an irreversible outcome; or the result directly governs such an action and an error would have material consequences.

Judge impact, target, and reversibility rather than matching domain words. A
public security-paper summary, formatting a supplied production log, or testing
a financial helper without deployment is not high risk. A production deletion,
permission change, financial calculation used for decisions, or executable
migration plan is high risk.

High risk sets a Sol High floor for automatic routing. An explicit user override remains effective but must produce a warning when it falls below that floor.

## Parallelism

Set `parallelizable` to `true` only when the task has at least two independent
work units with clear ownership and return contracts, and delegation can reduce
the critical path. If those units cannot be named, use `false`. Shared-file
edits, ordered migrations, one root-cause proof, and one difficult invariant are
not parallel work. Volume alone does not make a task parallel.

`ultra` is selected only for hard or extreme parallel work. Use `max` for extreme serial reasoning.

## Boundary Examples

| Request | Profile |
| --- | --- |
| Summarize a public security whitepaper | `knowledge/easy/low/false` |
| Write tests for a financial rounding helper without deployment | `implementation/normal/normal/false` |
| Format a supplied production audit log without system access | `mechanical/easy/low/false` |
| Find one distributed race root cause across three services | `investigation/extreme/low/false` |
| Design a financial zero-downtime migration used for rollout | `architecture/extreme/high/false` |
| Delete one production tenant and revoke its credentials | `mechanical/normal/high/false` |
| Review two unrelated packages and return separate reports | `investigation/hard/low/true` |
| Prove one subtle lock-free queue invariant | `investigation/hard/low/false` |

## Overrides And Capabilities

Use these exact model IDs when supported:

- `gpt-5.6-sol`
- `gpt-5.6-terra`
- `gpt-5.6-luna`

Use only efforts returned by the current host. `mini` is not a native effort; the selector accepts `mini` or `minimal` as an override alias for the selected model's lowest supported effort.

User overrides take precedence over the policy when valid. Automatic fallbacks may move Luna to Terra or Terra to Sol, but never silently downgrade a Sol policy route. Always use the selector's `effective` result for execution.
