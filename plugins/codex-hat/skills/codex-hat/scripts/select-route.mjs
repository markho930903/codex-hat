#!/usr/bin/env node

import { pathToFileURL } from "node:url";

const MODELS = ["gpt-5.6-luna", "gpt-5.6-terra", "gpt-5.6-sol"];
const EFFORTS = ["low", "medium", "high", "xhigh", "max", "ultra"];
const PHASES = ["supervision", "implementation"];
const TASK_TYPES = [
  "mechanical",
  "knowledge",
  "implementation",
  "investigation",
  "architecture",
];
const DIFFICULTIES = ["easy", "normal", "hard", "extreme"];
const RISKS = ["low", "normal", "high"];

export const DEFAULT_CAPABILITIES = {
  "gpt-5.6-sol": ["low", "medium", "high", "xhigh", "max", "ultra"],
  "gpt-5.6-terra": ["low", "medium", "high", "xhigh", "max", "ultra"],
  "gpt-5.6-luna": ["low", "medium", "high", "xhigh", "max"],
};

const SUPERVISION_EFFORTS = {
  easy: "high",
  normal: "high",
  hard: "xhigh",
  extreme: "max",
};

function requireObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  return value;
}

function requireEnum(value, allowed, label) {
  if (!allowed.includes(value)) {
    throw new Error(`${label} must be one of: ${allowed.join(", ")}`);
  }
  return value;
}

function normalizeCapabilities(value) {
  const input = requireObject(value, "capabilities");
  const capabilities = {};

  for (const model of MODELS) {
    if (input[model] === undefined) continue;
    if (!Array.isArray(input[model])) {
      throw new Error(`capabilities.${model} must be an array`);
    }

    const efforts = [...new Set(input[model])];
    for (const effort of efforts) {
      requireEnum(effort, EFFORTS, `capabilities.${model} effort`);
    }
    capabilities[model] = efforts.sort(
      (left, right) => EFFORTS.indexOf(left) - EFFORTS.indexOf(right),
    );
  }

  if (!Object.values(capabilities).some((efforts) => efforts.length > 0)) {
    throw new Error("capabilities must include at least one supported Codex model");
  }
  return capabilities;
}

function policyRoute(profile) {
  if (profile.phase === "implementation") {
    return {
      route: { model: "gpt-5.6-luna", effort: "max" },
      reasons: ["explicit implementation phase"],
    };
  }

  const route = {
    model: "gpt-5.6-sol",
    effort: SUPERVISION_EFFORTS[profile.difficulty],
  };
  const reasons = [
    `${profile.taskType}/${profile.difficulty} supervision`,
    "Sol High minimum",
  ];

  if (
    profile.parallelizable &&
    ["hard", "extreme"].includes(profile.difficulty)
  ) {
    route.model = "gpt-5.6-sol";
    route.effort = "ultra";
    reasons.push("hard parallel work");
  }

  return { route, reasons };
}

function resolveModel(target, capabilities) {
  if (capabilities[target]?.length) return target;
  throw new Error(`${target} is required but unavailable`);
}

function resolveEffort(target, efforts, options, warnings) {
  if (["mini", "minimal"].includes(target)) {
    warnings.push(`${target} is an alias; using the lowest supported effort`);
    return efforts[0];
  }

  requireEnum(target, EFFORTS, "effort");
  if (efforts.includes(target)) return target;
  if (options.strict) {
    throw new Error(`${options.model} does not support effort ${target}`);
  }

  const minimum = options.minimum ? EFFORTS.indexOf(options.minimum) : 0;
  const maximum = options.maximum
    ? EFFORTS.indexOf(options.maximum)
    : EFFORTS.length - 1;
  const candidates = efforts.filter(
    (effort) => {
      const index = EFFORTS.indexOf(effort);
      return index >= minimum && index <= maximum;
    },
  );
  if (!candidates.length) {
    throw new Error(`${options.model} has no effort meeting the required range`);
  }

  const targetIndex = EFFORTS.indexOf(target);
  candidates.sort((left, right) => {
    const leftIndex = EFFORTS.indexOf(left);
    const rightIndex = EFFORTS.indexOf(right);
    return (
      Math.abs(leftIndex - targetIndex) -
        Math.abs(rightIndex - targetIndex) || rightIndex - leftIndex
    );
  });
  warnings.push(
    `${options.model} does not support ${target}; using ${candidates[0]}`,
  );
  return candidates[0];
}

export function selectRoute(input) {
  const value = requireObject(input, "profile");
  const profile = {
    phase: requireEnum(value.phase ?? "supervision", PHASES, "phase"),
    taskType: requireEnum(value.taskType, TASK_TYPES, "taskType"),
    difficulty: requireEnum(
      value.difficulty,
      DIFFICULTIES,
      "difficulty",
    ),
    risk: requireEnum(value.risk ?? "normal", RISKS, "risk"),
    parallelizable: value.parallelizable ?? false,
  };
  if (typeof profile.parallelizable !== "boolean") {
    throw new Error("parallelizable must be a boolean");
  }

  const capabilities = normalizeCapabilities(
    value.capabilities ?? DEFAULT_CAPABILITIES,
  );
  const { route: recommended, reasons } = policyRoute(profile);
  const override = value.override ?? {};
  requireObject(override, "override");
  const hasModelOverride = Object.hasOwn(override, "model");
  const hasEffortOverride = Object.hasOwn(override, "effort");

  if (hasModelOverride) requireEnum(override.model, MODELS, "override.model");
  if (hasEffortOverride && typeof override.effort !== "string") {
    throw new Error("override.effort must be a string");
  }

  const warnings = [];
  const targetModel = hasModelOverride ? override.model : recommended.model;
  const targetEffort = hasEffortOverride
    ? override.effort
    : recommended.effort;
  const model = resolveModel(targetModel, capabilities);
  const effort = resolveEffort(
    targetEffort,
    capabilities[model],
    {
      model,
      strict:
        (hasEffortOverride && !["mini", "minimal"].includes(targetEffort)) ||
        (!hasModelOverride &&
          !hasEffortOverride &&
          profile.phase === "implementation"),
      minimum:
        !hasEffortOverride && profile.phase === "supervision"
          ? "high"
          : undefined,
      maximum:
        !hasEffortOverride && recommended.effort !== "ultra"
          ? "max"
          : undefined,
    },
    warnings,
  );

  if (
    profile.phase === "supervision" &&
    (model !== "gpt-5.6-sol" ||
      EFFORTS.indexOf(effort) < EFFORTS.indexOf("high"))
  ) {
    warnings.push("explicit override is below the supervision Sol High floor");
  }
  if (
    profile.phase === "implementation" &&
    (model !== "gpt-5.6-luna" || effort !== "max")
  ) {
    warnings.push("explicit override differs from the implementation Luna Max route");
  }
  if (
    effort === "ultra" &&
    (profile.phase !== "supervision" ||
      !profile.parallelizable ||
      !["hard", "extreme"].includes(profile.difficulty))
  ) {
    warnings.push("ultra was explicitly selected outside hard parallel work");
  }

  return {
    profile,
    recommended,
    effective: { model, effort },
    source: hasModelOverride || hasEffortOverride ? "override" : "policy",
    reasons,
    warnings,
  };
}

function printHelp() {
  console.log(`Usage: node select-route.mjs '<profile-json>'

Required: taskType, difficulty
Optional: phase (defaults to supervision), risk, parallelizable, capabilities, override`);
}

const isMain =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  try {
    if (process.argv.includes("--help") || process.argv.length < 3) {
      printHelp();
      process.exitCode = process.argv.includes("--help") ? 0 : 1;
    } else {
      console.log(JSON.stringify(selectRoute(JSON.parse(process.argv[2])), null, 2));
    }
  } catch (error) {
    console.error(`codex-hat: ${error.message}`);
    process.exitCode = 1;
  }
}
