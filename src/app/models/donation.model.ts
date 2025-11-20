export enum DonationType {
  MONEY = 'money',
  IN_KIND = 'in_kind', // En especie
  SPONSORSHIP = 'sponsorship' // Apadrinamiento
}

export enum DonationStatus {
  PENDING = 'pending',
  IN_PROCESS = 'in_process',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export enum InKindCategory {
  FOOD = 'food',
  CLOTHING = 'clothing',
  EDUCATION = 'education',
  HEALTH = 'health',
  HYGIENE = 'hygiene',
  OTHER = 'other'
}

export interface Donation {
  id: string;
  donorId: string;
  donorName: string;
  type: DonationType;
  amount?: number; // Para donaciones monetarias
  currency?: string;
  description: string;
  category?: InKindCategory; // Para donaciones en especie
  items?: DonationItem[]; // Detalles de artículos en especie
  beneficiaryId?: string; // Si es donación dirigida
  status: DonationStatus;
  assignedManagerId?: string;
  assignedManagerName?: string;
  createdAt: Date;
  processedAt?: Date;
  deliveredAt?: Date;
  impactStory?: ImpactStory;
  recurring?: RecurringDonation; // Si es apadrinamiento
}

export interface DonationItem {
  name: string;
  quantity: number;
  unit: string;
  estimatedValue?: number;
}

export interface RecurringDonation {
  frequency: 'monthly' | 'quarterly' | 'annual';
  nextDonationDate: Date;
  endDate?: Date;
  active: boolean;
}

export interface ImpactStory {
  id: string;
  donationId: string;
  photos: string[]; // URLs de las fotos de entrega
  deliveryDate: Date;
  location: string;
  managerId: string;
  managerName: string;
  beneficiaryMessage?: string;
  description: string;
  views: number;
}

export interface DonationRequest {
  type: DonationType;
  amount?: number;
  description: string;
  category?: InKindCategory;
  items?: DonationItem[];
  beneficiaryId?: string;
  isRecurring?: boolean;
  recurringFrequency?: 'monthly' | 'quarterly' | 'annual';
}
