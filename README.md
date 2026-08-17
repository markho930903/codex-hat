# Codex Hat

A small Codex plugin that separates task supervision from implementation. Sol
High or above owns understanding, planning, design, decomposition, and result
review. Clear implementation units run on Luna Max.

## Install

```bash
codex plugin marketplace add markho930903/codex-hat
codex plugin add codex-hat@codex-hat
```

Start a new Codex task after installation so the skill is loaded.

## Use

Invoke the router explicitly:

```text
$codex-hat:codex-hat Review this branch for correctness and security risks.
```

Codex namespaces plugin skills as `<plugin>:<skill>`, so both parts are
required when invoking the router explicitly.

The plugin starts every task under Sol supervision. Once Sol defines a bounded
implementation unit with completion checks, it delegates that unit to Luna Max,
then returns the result to Sol for review. It does not change task permissions
or create a separate task unless the user authorizes it.

Routing happens before each materially different phase of work. The plugin may
delegate that phase to a new agent, but it does not change the current agent's
model or effort in place. Explicit model and effort choices remain overrides;
Terra remains available only through an explicit override.

`mini` and `minimal` are accepted as input aliases for the selected model's
lowest supported effort. `ultra` is reserved for hard parallel supervision.

## Update

```bash
codex plugin marketplace upgrade codex-hat
codex plugin add codex-hat@codex-hat
```
