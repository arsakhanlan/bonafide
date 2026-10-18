const LABELS: Record<string, string> = {
  READER: 'Paper reader',
  WRITER: 'Letter writer',
  CHECKER: 'Fact checker',
  RULES: 'Law check',
  MONEY: 'Money check',
  SORTER: 'Safety check',
  CASE_BOSS: 'Case manager',
  CLOCK: 'Deadline tracker',
  SYSTEM: 'Bonafide',
};

export function agentLabel(agent?: string): string {
  if (!agent) return 'Bonafide';
  return LABELS[agent] ?? agent;
}
