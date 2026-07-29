# Routing Policy

Build a task profile before selecting a route. Classify the work itself, not the wording style of the request.

## Task Type

- `mechanical`: extraction, classification, formatting, translation, or other deterministic transformation.
- `knowledge`: search, summarization, documentation, or synthesis with a clear output contract.
- `implementation`: coding, tests, configuration, or a scoped fix with an identifiable owner.
- `investigation`: debugging, root-cause analysis, review, or research that must test competing explanations.
- `architecture`: cross-system design, migration, security, financial, production, or other judgment-heavy work.

## Difficulty

- `easy`: one clear outcome, local scope, few dependencies, and an obvious validation path.
- `normal`: several dependent steps or files, but established patterns and bounded validation.
- `hard`: material ambiguity, multiple modules, subtle edge cases, or substantial verification.
- `extreme`: cross-system reasoning, a large context, competing constraints, or unusually deep validation.

Do not raise difficulty merely because a deterministic task has many records. Volume affects execution shape; it does not necessarily require a stronger model.

## Risk

- `low`: read-only or readily reversible work with limited impact.
- `normal`: ordinary local edits and validation.
- `high`: security, financial, production, destructive, permission, migration, or irreversible consequences.

High risk sets a Sol High floor for automatic routing. An explicit user override remains effective but must produce a warning when it falls below that floor.

## Parallelism

Set `parallelizable` to `true` only when the task has at least two independent work units with clear ownership and return contracts. Shared-file edits, serial dependencies, and one difficult proof are not parallel work.

`ultra` is selected only for hard or extreme parallel work. Use `max` for extreme serial reasoning.

## Overrides And Capabilities

Use these exact model IDs when supported:

- `gpt-5.6-sol`
- `gpt-5.6-terra`
- `gpt-5.6-luna`

Use only efforts returned by the current host. `mini` is not a native effort; the selector accepts `mini` or `minimal` as an override alias for the selected model's lowest supported effort.

User overrides take precedence over the policy when valid. Automatic fallbacks may move Luna to Terra or Terra to Sol, but never silently downgrade a Sol policy route. Always use the selector's `effective` result for execution.
