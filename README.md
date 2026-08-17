# Codex Hat

A small Codex plugin that separates task supervision from implementation. Sol
High or above owns understanding, planning, design, decomposition, and result
review. Clear implementation units run on Luna Max.

Codex Hat applies to every task through lifecycle hooks. Explicit invocation is
still available, but is not required.

## Install

```bash
codex plugin marketplace add markho930903/codex-hat
codex plugin add codex-hat@codex-hat
```

Start a new Codex task after installation so the skill is loaded.

## Use

The router runs automatically. You can also invoke it explicitly:

```text
$codex-hat:codex-hat Review this branch for correctness and security risks.
```

Codex namespaces plugin skills as `<plugin>:<skill>`, so both parts are
required when invoking the router explicitly.

The plugin starts every task under Sol supervision. Once Sol defines a bounded
implementation unit with completion checks, it delegates that unit to Luna Max,
then returns the result to Sol for review. It does not change task permissions
or create a separate task unless the user authorizes it.

The selector rejects an implementation phase unless the Sol handoff includes
`supervisionComplete: true` plus confirmation that scope, constraints, context,
and completion checks are defined. If either required route is unavailable, the
task stops instead of substituting another model.

Routing happens before each materially different phase of work. The plugin may
delegate that phase to a new agent, but it does not change the current agent's
model or effort in place. Model and effort overrides are accepted only when they
match the mandatory route exactly.

`ultra` is reserved for hard parallel supervision.

## Update

```bash
codex plugin marketplace upgrade codex-hat
codex plugin add codex-hat@codex-hat
```
