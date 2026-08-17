const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const path = require("node:path");
const test = require("node:test");

test("injects mandatory routing into every supported lifecycle event", () => {
  for (const hookEventName of [
    "SessionStart",
    "UserPromptSubmit",
    "SubagentStart",
  ]) {
    const result = spawnSync(process.execPath, [path.join(__dirname, "enforce-routing.cjs")], {
      input: JSON.stringify({ hook_event_name: hookEventName }),
      encoding: "utf8",
    });
    assert.equal(result.status, 0);
    const output = JSON.parse(result.stdout);
    assert.equal(output.systemMessage, "CODEX-HAT:ENFORCED");
    assert.equal(output.hookSpecificOutput.hookEventName, hookEventName);
    assert.match(output.hookSpecificOutput.additionalContext, /gpt-5\.6-sol/);
    assert.match(output.hookSpecificOutput.additionalContext, /gpt-5\.6-luna/);
    assert.match(output.hookSpecificOutput.additionalContext, /supervisionComplete=true/);
  }
});
