# Routing Policy

Build a profile for the work that happens next. Every user request begins in
`supervision`; never treat a raw request as an already-defined implementation
unit.

Use this order:

1. Select the current phase.
2. Identify the primary deliverable and select the task type.
3. Estimate difficulty from known scope and dependencies.
4. Estimate risk from the consequences of acting on the result.
5. Mark parallelism only when independent work units can be named now.

When repository facts decide a boundary, perform the smallest authorized
read-only inspection before selecting a route.

## Phase

- `supervision`: request understanding, investigation, planning, design,
  decomposition, decisions, coordination, verification, or result review. Route
  to Sol with at least `high` effort.
- `implementation`: a bounded execution unit already defined by Sol, including
  its scope, constraints, relevant context, and completion checks. Recommend
  Luna `max`. When capabilities show Luna `max` is unavailable, the effective
  route is Terra `xhigh`. Implementation routing fails only when both exact
  routes are unavailable. The selector requires `supervisionComplete: true`
  plus `handoff` flags confirming all four items for this phase.

After an implementation unit returns, switch back to `supervision`. Sol reviews
the result and either accepts it or defines another bounded implementation unit.
Luna does not redesign the task or expand its scope.

Lifecycle hooks inject this policy on session start, every user prompt, and
every subagent start. The skill is also eligible for implicit invocation, so an
explicit `$codex-hat:codex-hat` mention is not required.

## Task Type

- `mechanical`: extraction, classification, formatting, translation, or another deterministic transformation or operation.
- `knowledge`: search, summarization, documentation, or synthesis with a clear output contract.
- `implementation`: coding, tests, configuration, or a scoped fix with an identifiable owner.
- `investigation`: debugging, root-cause analysis, review, proof, or research that must test competing explanations.
- `architecture`: system design, migration strategy, trust boundaries, or another decision-heavy design task.

Task type describes the deliverable; it does not select the model. For example,
planning an implementation deliverable is still the `supervision` phase, while
editing the files in an approved unit is the `implementation` phase.

## Difficulty

- `easy`: one clear outcome, local scope, few dependencies, and an obvious validation path.
- `normal`: several dependent steps or files, but established patterns and bounded validation.
- `hard`: material ambiguity, multiple modules, subtle edge cases, or substantial verification.
- `extreme`: cross-system reasoning, a large context, competing constraints, or unusually deep validation.

Difficulty controls Sol supervision effort:

| Difficulty | Sol effort |
| --- | --- |
| `easy` | `high` |
| `normal` | `high` |
| `hard` | `xhigh` |
| `extreme` | `max` |

Hard or extreme parallel supervision may use `ultra`. Every implementation unit
recommends Luna `max` regardless of difficulty, with Terra `xhigh` only when
Luna `max` is unavailable.

## Risk

- `low`: read-only or readily reversible work with limited downstream impact.
- `normal`: ordinary local edits, validation, or reversible non-production changes.
- `high`: an authorized action can affect production, money, permissions, a security boundary, persistent data, or an irreversible outcome; or the result directly governs such an action and an error would have material consequences.

Keep difficulty independent from risk. High-risk work still follows the same
phase routes: Sol defines and reviews the unit, while Luna Max, or Terra Extra
High when Luna Max is unavailable, executes only the bounded implementation.

## Parallelism

Set `parallelizable` to `true` only when the task has at least two independent
work units with clear ownership and return contracts, and delegation can reduce
the critical path. Shared-file edits, ordered migrations, one root-cause proof,
and one difficult invariant are not parallel work.

Sol may use `ultra` only for hard or extreme parallel supervision. Route each
independent implementation unit separately to Luna Max, or Terra Extra High
only when Luna Max is unavailable.

## Phase Examples

| Next work | Phase | Automatic route |
| --- | --- | --- |
| Understand a bug report and inspect its call path | `supervision` | Sol High or above |
| Design a migration and split its execution units | `supervision` | Sol High or above |
| Apply one defined code change with stated checks | `implementation` | Luna Max, or Terra Extra High fallback |
| Review an implementation agent's diff and test output | `supervision` | Sol High or above |
| Coordinate three independent hard work units | `supervision` | Sol Ultra |

## Overrides And Capabilities

Use these exact model IDs when supported:

- `gpt-5.6-sol`
- `gpt-5.6-terra`
- `gpt-5.6-luna`

Use only efforts returned by the current host.

Automatic Sol supervision requires Sol. Implementation recommends Luna `max`.
When host capabilities show Luna `max` is missing, the only fallback is Terra
`xhigh`; without either exact route, stop. A Sol supervision effort may move
within the supported `high` through `max` range.

An explicit override is accepted only when it matches the mandatory phase route
exactly. Reject every cross-model or cross-effort override.
