import assert from "node:assert/strict";
import test from "node:test";

import { selectRoute } from "./select-route.mjs";

const profile = (overrides = {}) => ({
  taskType: "implementation",
  difficulty: "normal",
  risk: "normal",
  parallelizable: false,
  ...overrides,
});

test("selects the preferred baseline routes", () => {
  const cases = [
    [
      profile({ taskType: "mechanical", difficulty: "easy" }),
      "gpt-5.6-luna",
      "low",
    ],
    [profile(), "gpt-5.6-terra", "medium"],
    [
      profile({ taskType: "investigation", difficulty: "hard" }),
      "gpt-5.6-sol",
      "xhigh",
    ],
    [
      profile({ taskType: "architecture", difficulty: "extreme" }),
      "gpt-5.6-sol",
      "max",
    ],
  ];

  for (const [input, model, effort] of cases) {
    assert.deepEqual(selectRoute(input).effective, { model, effort });
  }
});

test("uses Sol Ultra only for hard parallel work", () => {
  const result = selectRoute(
    profile({
      taskType: "investigation",
      difficulty: "hard",
      parallelizable: true,
    }),
  );
  assert.deepEqual(result.effective, {
    model: "gpt-5.6-sol",
    effort: "ultra",
  });
});

test("enforces the automatic high-risk floor", () => {
  const result = selectRoute(
    profile({
      taskType: "mechanical",
      difficulty: "easy",
      risk: "high",
    }),
  );
  assert.deepEqual(result.effective, {
    model: "gpt-5.6-sol",
    effort: "high",
  });
});

test("normalizes mini to the selected model's lowest supported effort", () => {
  const result = selectRoute(profile({ override: { effort: "mini" } }));
  assert.deepEqual(result.effective, {
    model: "gpt-5.6-terra",
    effort: "low",
  });
  assert.match(result.warnings[0], /alias/);
});

test("falls forward from unavailable Luna to Terra", () => {
  const result = selectRoute(
    profile({
      taskType: "mechanical",
      difficulty: "easy",
      capabilities: {
        "gpt-5.6-terra": ["low", "medium"],
        "gpt-5.6-sol": ["high"],
      },
    }),
  );
  assert.deepEqual(result.recommended, {
    model: "gpt-5.6-luna",
    effort: "low",
  });
  assert.deepEqual(result.effective, {
    model: "gpt-5.6-terra",
    effort: "low",
  });
});

test("rejects unsupported explicit routes and Sol downgrades", () => {
  assert.throws(
    () =>
      selectRoute(
        profile({
          taskType: "mechanical",
          difficulty: "easy",
          override: { model: "gpt-5.6-luna", effort: "ultra" },
        }),
      ),
    /does not support effort ultra/,
  );

  assert.throws(
    () =>
      selectRoute(
        profile({
          taskType: "investigation",
          difficulty: "hard",
          capabilities: { "gpt-5.6-terra": ["high"] },
        }),
      ),
    /gpt-5.6-sol is required but unavailable/,
  );
});
