export enum UserRole {
  DONOR = 'donor',
  MANAGER = 'manager',
  ADMIN = 'admin',
  BENEFICIARY = 'beneficiary'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  createdAt: Date;
}

export interface Donor extends User {
  role: UserRole.DONOR;
  totalDonated: number;
  donationCount: number;
  sponsoredBeneficiaries: string[]; // IDs de beneficiarios apadrinados
  preferredCategories?: string[];
}

export interface Manager extends User {
  role: UserRole.MANAGER;
  assignedCases: string[]; // IDs de casos asignados
  completedDeliveries: number;
  activeDeliveries: number;
  zone?: string;
}

export interface Admin extends User {
  role: UserRole.ADMIN;
  permissions: string[];
}

export interface Beneficiary {
  id: string;
  profileName: string; // Nombre anónimo como "Familia López" o "Niño Juan"
  age?: number;
  familySize?: number;
  location: string;
  situation: string; // Descripción de la situación
  needs: string[]; // Necesidades específicas
  photo?: string; // Foto anónima o ilustración
  status: 'active' | 'inactive';
  assignedManager?: string; // ID del gestor asignado
  createdAt: Date;
  lastUpdate: Date;
  progress?: BeneficiaryProgress;
}

export interface BeneficiaryProgress {
  education?: string;
  health?: string;
  housing?: string;
  notes?: string;
  updates: ProgressUpdate[];
}

export interface ProgressUpdate {
  id: string;
  date: Date;
  title: string;
  description: string;
  photos?: string[];
  addedBy: string; // ID del gestor
}
