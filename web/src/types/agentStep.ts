export interface AgentStep {
  id: string;
  agent: 'SYSTEM' | 'READER' | 'CHECKER' | 'CASE_BOSS' | 'CLOCK' | 'SORTER' | string;
  message: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  timestamp: string;
}

