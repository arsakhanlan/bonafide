export type DeadlineStatus = 'PENDING' | 'MET' | 'EXPIRED' | 'CANCELLED';

export interface Deadline {
  id: string;
  clock: string;
  title: string;
  description: string;
  status: DeadlineStatus;
  dueOn: string;
  daysRemaining?: number;
  statuteRef?: string;
}

