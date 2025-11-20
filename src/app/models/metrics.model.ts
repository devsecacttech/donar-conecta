export interface DashboardMetrics {
  totalDonations: number;
  totalAmount: number;
  activeCases: number;
  beneficiariesHelped: number;
  impactStories: number;
  activeSponsorship: number;
}

export interface DonorMetrics {
  totalDonated: number;
  donationCount: number;
  impactStoriesGenerated: number;
  sponsoredBeneficiaries: number;
  lastDonationDate?: Date;
  donationsByCategory: CategoryMetric[];
  donationHistory: MonthlyMetric[];
}

export interface ManagerMetrics {
  assignedCases: number;
  completedDeliveries: number;
  pendingDeliveries: number;
  impactStoriesCreated: number;
  beneficiariesServed: number;
  averageDeliveryTime: number; // en días
}

export interface AdminMetrics {
  overview: DashboardMetrics;
  donorMetrics: {
    totalDonors: number;
    activeDonors: number;
    newDonorsThisMonth: number;
    topDonors: TopDonor[];
  };
  managerMetrics: {
    totalManagers: number;
    activeManagers: number;
    averageResponseTime: number;
    topManagers: TopManager[];
  };
  financialMetrics: {
    totalRevenue: number;
    monthlyTrend: MonthlyMetric[];
    byCategory: CategoryMetric[];
  };
}

export interface CategoryMetric {
  category: string;
  count: number;
  amount: number;
  percentage: number;
}

export interface MonthlyMetric {
  month: string;
  count: number;
  amount: number;
}

export interface TopDonor {
  id: string;
  name: string;
  totalDonated: number;
  donationCount: number;
}

export interface TopManager {
  id: string;
  name: string;
  completedDeliveries: number;
  averageRating: number;
}
