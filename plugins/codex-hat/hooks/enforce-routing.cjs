#!/usr/bin/env node

let input = "";

process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  input += chunk;
});
process.stdin.on("end", () => {
  let event = "UserPromptSubmit";
  try {
    event = JSON.parse(input || "{}").hook_event_name || event;
  } catch {}

  const context = [
    "CODEX HAT ROUTING REQUIRED FOR EVERY TASK.",
    "Before doing task work, route or delegate understanding, investigation, planning, design, decomposition, coordination, and result review to gpt-5.6-sol with reasoning effort high or above. Continue directly only when the current agent already has that route.",
    "Before implementation, Sol must define a bounded unit with scope, constraints, relevant context, and completion checks.",
    "Delegate only that unit to gpt-5.6-luna with reasoning effort max. Set supervisionComplete=true and mark scopeDefined, constraintsDefined, contextDefined, and completionChecksDefined true in the selector handoff.",
    "After Luna returns, Sol must review the changes and checks. Do not implement directly under Sol and do not let Luna redesign or expand scope.",
    "If the required model or effort is unavailable, stop and report the route as unavailable; never substitute another model.",
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
});
