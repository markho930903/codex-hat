#!/usr/bin/env node

const event = process.argv[2];
if (![
  "SessionStart",
  "UserPromptSubmit",
  "SubagentStart",
].includes(event)) {
  process.exit(1);
}

const context = [
  "CODEX HAT ROUTING REQUIRED FOR EVERY TASK.",
  "Before doing task work, route or delegate understanding, investigation, planning, design, decomposition, coordination, and result review to gpt-5.6-sol with reasoning effort high or above. Continue directly only when the current agent already has that route.",
  "Before implementation, Sol must define a bounded unit with scope, constraints, relevant context, and completion checks.",
  "Delegate only that unit to gpt-5.6-luna with reasoning effort max. If capabilities show gpt-5.6-luna max is unavailable, use only gpt-5.6-terra with reasoning effort xhigh. Stop and report implementation routing unavailable only when both exact routes are unavailable. Set supervisionComplete=true and mark scopeDefined, constraintsDefined, contextDefined, and completionChecksDefined true in the selector handoff.",
  "After the implementation agent returns, Sol must review the changes and checks. Do not implement directly under Sol and do not let the implementation agent redesign or expand scope.",
  "Do not substitute another model for Sol supervision or use any implementation fallback other than gpt-5.6-terra xhigh when gpt-5.6-luna max is unavailable.",
].join("\n");

process.stdout.write(
  JSON.stringify({
    systemMessage: "CODEX-HAT:ENFORCED",
    hookSpecificOutput: {
      hookEventName: event,
      additionalContext: context,
    },
  }),
);
