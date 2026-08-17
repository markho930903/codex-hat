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

test("starts every task in Sol supervision by default", () => {
  const result = selectRoute(profile());
  assert.equal(result.profile.phase, "supervision");
  assert.deepEqual(result.effective, {
    model: "gpt-5.6-sol",
    effort: "high",
  });
});

test("keeps all supervision work on Sol High or above", () => {
  const taskTypes = [
    "mechanical",
    "knowledge",
    "implementation",
    "investigation",
    "architecture",
  ];
  const expectedEfforts = {
    easy: "high",
    normal: "high",
    hard: "xhigh",
    extreme: "max",
  };

  for (const taskType of taskTypes) {
    for (const [difficulty, effort] of Object.entries(expectedEfforts)) {
      assert.deepEqual(
        selectRoute(profile({ taskType, difficulty })).effective,
        { model: "gpt-5.6-sol", effort },
      );
    }
  }
});

test("routes every explicit implementation phase to Luna Max", () => {
  for (const difficulty of ["easy", "normal", "hard", "extreme"]) {
    for (const risk of ["low", "normal", "high"]) {
      const result = selectRoute(
        profile({
          phase: "implementation",
          difficulty,
          risk,
          parallelizable: true,
        }),
      );
      assert.deepEqual(result.effective, {
        model: "gpt-5.6-luna",
        effort: "max",
      });
    }
  }
});

test("uses Sol Ultra only for hard parallel supervision", () => {
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

  assert.deepEqual(
    selectRoute(
      profile({
        phase: "implementation",
        difficulty: "hard",
        parallelizable: true,
      }),
    ).effective,
    { model: "gpt-5.6-luna", effort: "max" },
  );
});

test("requires the automatic phase model and Luna Max capability", () => {
  assert.throws(
    () =>
      selectRoute(
        profile({ capabilities: { "gpt-5.6-terra": ["high"] } }),
      ),
    /gpt-5.6-sol is required but unavailable/,
  );

  assert.throws(
    () =>
      selectRoute(
        profile({
          phase: "implementation",
          capabilities: { "gpt-5.6-luna": ["high"] },
        }),
      ),
    /does not support effort max/,
  );
});

test("preserves explicit overrides and warns when they cross phase policy", () => {
  const supervision = selectRoute(
    profile({ override: { model: "gpt-5.6-terra", effort: "medium" } }),
  );
  assert.deepEqual(supervision.effective, {
    model: "gpt-5.6-terra",
    effort: "medium",
  });
  assert.match(supervision.warnings.at(-1), /supervision Sol High floor/);

  const implementation = selectRoute(
    profile({
      phase: "implementation",
      override: { model: "gpt-5.6-sol", effort: "high" },
    }),
  );
  assert.deepEqual(implementation.effective, {
    model: "gpt-5.6-sol",
    effort: "high",
  });
  assert.match(implementation.warnings.at(-1), /implementation Luna Max/);
});

test("normalizes mini to the explicitly selected model's lowest effort", () => {
  const result = selectRoute(
    profile({ override: { model: "gpt-5.6-terra", effort: "mini" } }),
  );
  assert.deepEqual(result.effective, {
    model: "gpt-5.6-terra",
    effort: "low",
  });
  assert.match(result.warnings[0], /alias/);
});

test("preserves an explicit Ultra override and marks invalid phase use", () => {
  const result = selectRoute(
    profile({
      phase: "implementation",
      override: { model: "gpt-5.6-sol", effort: "ultra" },
    }),
  );
  assert.deepEqual(result.effective, {
    model: "gpt-5.6-sol",
    effort: "ultra",
  });
  assert.match(result.warnings.at(-1), /outside hard parallel work/);
});

test("rejects invalid phases and unsupported explicit routes", () => {
  assert.throws(
    () => selectRoute(profile({ phase: "review" })),
    /phase must be one of/,
  );
  assert.throws(
    () =>
      selectRoute(
        profile({
          override: { model: "gpt-5.6-luna", effort: "ultra" },
        }),
      ),
    /does not support effort ultra/,
  );
});
