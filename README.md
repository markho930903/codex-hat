# Codex Hat

A small Codex plugin that acts like a sorting hat for tasks. It selects Sol,
Terra, or Luna and a supported reasoning effort from the task type, difficulty,
risk, and parallelism.

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

The plugin returns the recommended and effective routes, then delegates through
native Codex tools when the selected model and effort are available. It does not
change task permissions or create a separate task unless the user authorizes it.

Routing happens before each materially different phase of work. The plugin may
delegate that phase to a new agent, but it does not change the current agent's
model or effort in place. Explicit model and effort choices remain overrides.

`mini` and `minimal` are accepted as input aliases for the selected model's
lowest supported effort. `ultra` is reserved for hard work with independent
parallel lanes; `max` is used for deep serial reasoning.

## Update

```bash
codex plugin marketplace upgrade codex-hat
codex plugin add codex-hat@codex-hat
```
