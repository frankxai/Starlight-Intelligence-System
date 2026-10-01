export interface ReviewInput {
  repository: string;
  pull_request: number;
  base_sha: string;
  head_sha: string;
  reviewer: 'claude-github' | 'claude-cloud' | 'claude-local';
  max_minutes: number;
  focus: string[];
}
export function getAgentInterfaces(): Record<string, unknown>;
export function prepareReviewHandoff(input: ReviewInput, now?: Date): Record<string, unknown>;
