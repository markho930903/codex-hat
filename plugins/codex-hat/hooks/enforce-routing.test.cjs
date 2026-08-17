const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

test("injects mandatory routing into every supported lifecycle event", () => {
  for (const hookEventName of [
    "SessionStart",
    "UserPromptSubmit",
    "SubagentStart",
  ]) {
    const result = spawnSync(process.execPath, [path.join(__dirname, "enforce-routing.cjs"), hookEventName], {
      encoding: "utf8",
    });
    assert.equal(result.status, 0);
    const output = JSON.parse(result.stdout);
    assert.equal(output.systemMessage, "CODEX-HAT:ENFORCED");
    assert.equal(output.hookSpecificOutput.hookEventName, hookEventName);
    assert.match(output.hookSpecificOutput.additionalContext, /gpt-5\.6-sol/);
    assert.match(output.hookSpecificOutput.additionalContext, /gpt-5\.6-luna/);
    assert.match(output.hookSpecificOutput.additionalContext, /gpt-5\.6-terra/);
    assert.match(output.hookSpecificOutput.additionalContext, /xhigh/);
    assert.match(output.hookSpecificOutput.additionalContext, /supervisionComplete=true/);
  }
});

test("rejects missing and unsupported lifecycle events", () => {
  for (const hookEventName of [undefined, "PreToolUse"]) {
    const args = [path.join(__dirname, "enforce-routing.cjs")];
    if (hookEventName) args.push(hookEventName);
    const result = spawnSync(process.execPath, args, { encoding: "utf8" });
    assert.notEqual(result.status, 0);
  }
});

test("keeps plugin discovery prompts aligned", () => {
  const prompt = "Use $codex-hat:codex-hat: Sol supervises; Luna Max implements, with Terra Extra High fallback when unavailable.";
  const plugin = JSON.parse(
    fs.readFileSync(path.join(__dirname, "..", ".codex-plugin", "plugin.json"), "utf8"),
  );
  const yaml = fs.readFileSync(
    path.join(__dirname, "..", "skills", "codex-hat", "agents", "openai.yaml"),
    "utf8",
  );
  const yamlPrompt = yaml.match(/^  default_prompt: "(.*)"$/m)?.[1];

  assert.equal(plugin.version, "0.2.3");
  assert.equal(plugin.interface.defaultPrompt[0], prompt);
  assert.ok(plugin.interface.defaultPrompt[0].length <= 128);
  assert.equal(yamlPrompt, prompt);
});
