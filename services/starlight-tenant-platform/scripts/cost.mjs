import { estimateMonthlyUsd } from '../dispatcher/src/core.ts';

// Scenarios, not forecasts. 60 container hours = 2 active hours a day.
const scenarios = [
  { label: '10 tenants, no sandbox', tenants: 10, requestsPerTenant: 50_000, avgCpuMsPerRequest: 20, containerHoursPerTenant: 0 },
  { label: '10 tenants, 2 h/day sandbox', tenants: 10, requestsPerTenant: 50_000, avgCpuMsPerRequest: 20, containerHoursPerTenant: 60 },
  { label: '100 tenants, 2 h/day sandbox', tenants: 100, requestsPerTenant: 50_000, avgCpuMsPerRequest: 20, containerHoursPerTenant: 60 },
  { label: '1,000 tenants, 2 h/day sandbox', tenants: 1_000, requestsPerTenant: 50_000, avgCpuMsPerRequest: 20, containerHoursPerTenant: 60 },
];

for (const { label, ...inputs } of scenarios) {
  const r = estimateMonthlyUsd(inputs);
  console.log(`${label.padEnd(32)} total $${r.total.toFixed(2).padStart(9)}  per tenant $${r.perTenant.toFixed(2)}`);
}
