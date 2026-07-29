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

test("falls forward from Terra to Sol but never backward to Luna", () => {
  const result = selectRoute(
    profile({
      capabilities: { "gpt-5.6-sol": ["medium"] },
    }),
  );
  assert.deepEqual(result.effective, {
    model: "gpt-5.6-sol",
    effort: "medium",
  });

  assert.throws(
    () =>
      selectRoute(
        profile({
          capabilities: { "gpt-5.6-luna": ["medium"] },
        }),
      ),
    /no allowed fallback/,
  );
});

test("preserves an explicit Ultra override outside hard parallel work", () => {
  const result = selectRoute(
    profile({
      override: { model: "gpt-5.6-sol", effort: "ultra" },
    }),
  );
  assert.deepEqual(result.effective, {
    model: "gpt-5.6-sol",
    effort: "ultra",
  });
  assert.match(result.warnings.at(-1), /outside hard parallel work/);
});

test("does not select Ultra automatically for serial work", () => {
  assert.throws(
    () =>
      selectRoute(
        profile({
          taskType: "architecture",
          difficulty: "extreme",
          capabilities: { "gpt-5.6-sol": ["ultra"] },
        }),
      ),
    /required range/,
  );
});

test("keeps automatic policy routes monotonic and within their floors", () => {
  const taskTypes = [
    "mechanical",
    "knowledge",
    "implementation",
    "investigation",
    "architecture",
  ];
  const difficulties = ["easy", "normal", "hard", "extreme"];
  const risks = ["low", "normal", "high"];
  const efforts = ["low", "medium", "high", "xhigh", "max", "ultra"];
  const models = ["gpt-5.6-luna", "gpt-5.6-terra", "gpt-5.6-sol"];

  for (const taskType of taskTypes) {
    for (const risk of risks) {
      for (const parallelizable of [false, true]) {
        let previous;
        for (const difficulty of difficulties) {
          const input = { taskType, difficulty, risk, parallelizable };
          const { recommended } = selectRoute(input);

          if (risk === "high") {
            assert.equal(recommended.model, "gpt-5.6-sol");
            assert.ok(
              efforts.indexOf(recommended.effort) >= efforts.indexOf("high"),
            );
          }
          if (recommended.effort === "ultra") {
            assert.equal(parallelizable, true);
            assert.ok(["hard", "extreme"].includes(difficulty));
          }
          if (previous) {
            assert.ok(
              models.indexOf(recommended.model) >=
                models.indexOf(previous.model),
            );
            assert.ok(
              efforts.indexOf(recommended.effort) >=
                efforts.indexOf(previous.effort),
            );
          }
          previous = recommended;
        }
      }
    }
  }
});
