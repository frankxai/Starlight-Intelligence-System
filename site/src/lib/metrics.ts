import metricsLedger from "../../../metrics/current.json";

type Metric = {
  value: number;
  last_verified: string;
  source: string;
  stale?: boolean;
};

function metric(name: keyof typeof metricsLedger.metrics): Metric {
  const value = metricsLedger.metrics[name] as Metric;
  if (!value || !Number.isFinite(value.value) || value.stale) {
    throw new Error(`Canonical metric "${name}" is missing, invalid, or stale`);
  }
  return value;
}

const agents = metric("registered_agents");
const skills = metric("skill_activation_rules");
const vaults = metric("starlight_vaults");
const horizon = metric("horizon_letters");

export const CURRENT_METRICS = Object.freeze({
  registeredAgents: agents.value,
  skillRules: skills.value,
  vaults: vaults.value,
  horizonLetters: horizon.value,
});

export const METRICS_AS_OF = [agents, skills, vaults, horizon]
  .map((entry) => entry.last_verified)
  .sort()
  .at(0)!;
