export enum CaseStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CLOSED = 'closed'
}

export enum CasePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface Case {
  id: string;
  title: string;
  beneficiaryId: string;
  beneficiaryName: string;
  description: string;
  priority: CasePriority;
  status: CaseStatus;
  assignedManagerId?: string;
  assignedManagerName?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  requiredDonations: CaseNeed[];
  receivedDonations: string[]; // IDs de donaciones recibidas
  photos?: string[];
  notes?: CaseNote[];
}

export interface CaseNeed {
  category: string;
  description: string;
  quantity?: number;
  estimatedCost?: number;
  fulfilled: boolean;
}

export interface CaseNote {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: Date;
  attachments?: string[];
}
