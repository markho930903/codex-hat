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
const handoff = {
  scopeDefined: true,
  constraintsDefined: true,
  contextDefined: true,
  completionChecksDefined: true,
};

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
          supervisionComplete: true,
          handoff,
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
        supervisionComplete: true,
        handoff,
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
          supervisionComplete: true,
          handoff,
          capabilities: { "gpt-5.6-luna": ["high"] },
        }),
      ),
    /does not support effort max/,
  );
});

test("allows only overrides identical to the mandatory route", () => {
  assert.deepEqual(
    selectRoute(
      profile({
        override: { model: "gpt-5.6-sol", effort: "high" },
      }),
    ).effective,
    { model: "gpt-5.6-sol", effort: "high" },
  );

  for (const override of [
    { model: "gpt-5.6-terra" },
    { effort: "medium" },
    { effort: "mini" },
  ]) {
    assert.throws(
      () => selectRoute(profile({ override })),
      /supervision route cannot be overridden/,
    );
  }
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
          override: { model: "gpt-5.6-luna", effort: "max" },
        }),
      ),
    /supervision route cannot be overridden/,
  );
});

test("rejects implementation before Sol supervision completes", () => {
  assert.throws(
    () => selectRoute(profile({ phase: "implementation" })),
    /implementation requires supervisionComplete=true/,
  );
  assert.throws(
    () =>
      selectRoute(
        profile({
          phase: "implementation",
          supervisionComplete: "yes",
        }),
      ),
    /supervisionComplete must be a boolean/,
  );
});

test("requires a complete Sol handoff before implementation", () => {
  assert.throws(
    () =>
      selectRoute(
        profile({
          phase: "implementation",
          supervisionComplete: true,
        }),
      ),
    /handoff must be an object/,
  );

  for (const field of Object.keys(handoff)) {
    assert.throws(
      () =>
        selectRoute(
          profile({
            phase: "implementation",
            supervisionComplete: true,
            handoff: { ...handoff, [field]: false },
          }),
        ),
      new RegExp(`handoff\\.${field} must be true`),
    );
  }
});
