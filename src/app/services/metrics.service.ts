import { Injectable } from '@angular/core';
import { Observable, combineLatest, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';
import {
  DashboardMetrics,
  DonorMetrics,
  ManagerMetrics,
  AdminMetrics,
  CategoryMetric,
  MonthlyMetric
} from '../models';
import { DonationService } from './donation.service';
import { BeneficiaryService } from './beneficiary.service';
import { CaseService } from './case.service';
import { AuthService } from './auth.service';
import { UserRole } from '../models';

@Injectable({
  providedIn: 'root'
})
export class MetricsService {

  constructor(
    private donationService: DonationService,
    private beneficiaryService: BeneficiaryService,
    private caseService: CaseService,
    private authService: AuthService
  ) {}

  getDashboardMetrics(): Observable<DashboardMetrics> {
    return combineLatest([
      this.donationService.getDonations(),
      this.caseService.getCases(),
      this.beneficiaryService.getBeneficiaries(),
      this.donationService.getImpactStories()
    ]).pipe(
      map(([donations, cases, beneficiaries, impactStories]) => {
        const totalAmount = donations
          .filter(d => d.amount)
          .reduce((sum, d) => sum + (d.amount || 0), 0);

        const activeCases = cases.filter(c =>
          c.status === 'open' || c.status === 'in_progress'
        ).length;

        const activeSponsorship = donations.filter(d =>
          d.recurring && d.recurring.active
        ).length;

        return {
          totalDonations: donations.length,
          totalAmount,
          activeCases,
          beneficiariesHelped: beneficiaries.length,
          impactStories: impactStories.length,
          activeSponsorship
        };
      }),
      delay(300)
    );
  }

  getDonorMetrics(donorId: string): Observable<DonorMetrics> {
    return this.donationService.getDonationsByDonor(donorId).pipe(
      map(donations => {
        const totalDonated = donations
          .filter(d => d.amount)
          .reduce((sum, d) => sum + (d.amount || 0), 0);

        const impactStoriesGenerated = donations.filter(d => d.impactStory).length;

        const sponsoredBeneficiaries = new Set(
          donations
            .filter(d => d.recurring && d.recurring.active)
            .map(d => d.beneficiaryId)
            .filter(id => id !== undefined)
        ).size;

        const lastDonation = donations.length > 0
          ? donations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]
          : null;

        // Donaciones por categoría
        const categoryMap = new Map<string, { count: number; amount: number }>();
        donations.forEach(d => {
          const category = d.category || 'other';
          const existing = categoryMap.get(category) || { count: 0, amount: 0 };
          categoryMap.set(category, {
            count: existing.count + 1,
            amount: existing.amount + (d.amount || 0)
          });
        });

        const donationsByCategory: CategoryMetric[] = Array.from(categoryMap.entries()).map(([category, data]) => ({
          category,
          count: data.count,
          amount: data.amount,
          percentage: (data.amount / totalDonated) * 100
        }));

        // Histórico mensual (últimos 6 meses)
        const monthlyMap = new Map<string, { count: number; amount: number }>();
        const now = new Date();

        for (let i = 5; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthKey = date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
          monthlyMap.set(monthKey, { count: 0, amount: 0 });
        }

        donations.forEach(d => {
          const monthKey = d.createdAt.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
          const existing = monthlyMap.get(monthKey);
          if (existing) {
            monthlyMap.set(monthKey, {
              count: existing.count + 1,
              amount: existing.amount + (d.amount || 0)
            });
          }
        });

        const donationHistory: MonthlyMetric[] = Array.from(monthlyMap.entries()).map(([month, data]) => ({
          month,
          count: data.count,
          amount: data.amount
        }));

        return {
          totalDonated,
          donationCount: donations.length,
          impactStoriesGenerated,
          sponsoredBeneficiaries,
          lastDonationDate: lastDonation?.createdAt,
          donationsByCategory,
          donationHistory
        };
      }),
      delay(300)
    );
  }

  getManagerMetrics(managerId: string): Observable<ManagerMetrics> {
    return combineLatest([
      this.caseService.getCasesByManager(managerId),
      this.donationService.getDonationsByManager(managerId),
      this.beneficiaryService.getBeneficiariesByManager(managerId)
    ]).pipe(
      map(([cases, donations, beneficiaries]) => {
        const assignedCases = cases.filter(c =>
          c.status === 'open' || c.status === 'in_progress'
        ).length;

        const completedDeliveries = donations.filter(d =>
          d.status === 'delivered'
        ).length;

        const pendingDeliveries = donations.filter(d =>
          d.status === 'pending' || d.status === 'in_process'
        ).length;

        const impactStoriesCreated = donations.filter(d => d.impactStory).length;

        // Calcular tiempo promedio de entrega
        const deliveredDonations = donations.filter(d =>
          d.deliveredAt && d.createdAt
        );
        const totalDays = deliveredDonations.reduce((sum, d) => {
          const days = Math.floor(
            (d.deliveredAt!.getTime() - d.createdAt.getTime()) / (1000 * 60 * 60 * 24)
          );
          return sum + days;
        }, 0);
        const averageDeliveryTime = deliveredDonations.length > 0
          ? Math.round(totalDays / deliveredDonations.length)
          : 0;

        return {
          assignedCases,
          completedDeliveries,
          pendingDeliveries,
          impactStoriesCreated,
          beneficiariesServed: beneficiaries.length,
          averageDeliveryTime
        };
      }),
      delay(300)
    );
  }

  getAdminMetrics(): Observable<AdminMetrics> {
    return combineLatest([
      this.getDashboardMetrics(),
      this.donationService.getDonations(),
      of(this.authService.getUsersByRole(UserRole.DONOR)),
      of(this.authService.getUsersByRole(UserRole.MANAGER))
    ]).pipe(
      map(([overview, donations, donors, managers]) => {
        // Métricas de donantes
        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const activeDonorIds = new Set(
          donations
            .filter(d => d.createdAt >= new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000))
            .map(d => d.donorId)
        );

        const newDonorsThisMonth = donors.filter(d =>
          d.createdAt >= thisMonth
        ).length;

        // Top donantes
        const donorTotals = new Map<string, { name: string; total: number; count: number }>();
        donations.forEach(d => {
          const existing = donorTotals.get(d.donorId) || { name: d.donorName, total: 0, count: 0 };
          donorTotals.set(d.donorId, {
            name: d.donorName,
            total: existing.total + (d.amount || 0),
            count: existing.count + 1
          });
        });

        const topDonors = Array.from(donorTotals.entries())
          .map(([id, data]) => ({
            id,
            name: data.name,
            totalDonated: data.total,
            donationCount: data.count
          }))
          .sort((a, b) => b.totalDonated - a.totalDonated)
          .slice(0, 5);

        // Top gestores
        const managerDeliveries = new Map<string, { name: string; deliveries: number }>();
        donations
          .filter(d => d.assignedManagerId && d.status === 'delivered')
          .forEach(d => {
            const existing = managerDeliveries.get(d.assignedManagerId!) ||
              { name: d.assignedManagerName!, deliveries: 0 };
            managerDeliveries.set(d.assignedManagerId!, {
              name: d.assignedManagerName!,
              deliveries: existing.deliveries + 1
            });
          });

        const topManagers = Array.from(managerDeliveries.entries())
          .map(([id, data]) => ({
            id,
            name: data.name,
            completedDeliveries: data.deliveries,
            averageRating: 4.5 // Mock rating
          }))
          .sort((a, b) => b.completedDeliveries - a.completedDeliveries)
          .slice(0, 5);

        // Métricas financieras por categoría
        const categoryMap = new Map<string, { count: number; amount: number }>();
        const totalAmount = donations
          .filter(d => d.amount)
          .reduce((sum, d) => sum + (d.amount || 0), 0);

        donations.forEach(d => {
          const category = d.category || 'other';
          const existing = categoryMap.get(category) || { count: 0, amount: 0 };
          categoryMap.set(category, {
            count: existing.count + 1,
            amount: existing.amount + (d.amount || 0)
          });
        });

        const byCategory: CategoryMetric[] = Array.from(categoryMap.entries()).map(([category, data]) => ({
          category,
          count: data.count,
          amount: data.amount,
          percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0
        }));

        // Tendencia mensual (últimos 6 meses)
        const monthlyMap = new Map<string, { count: number; amount: number }>();

        for (let i = 5; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthKey = date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
          monthlyMap.set(monthKey, { count: 0, amount: 0 });
        }

        donations.forEach(d => {
          const monthKey = d.createdAt.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
          const existing = monthlyMap.get(monthKey);
          if (existing) {
            monthlyMap.set(monthKey, {
              count: existing.count + 1,
              amount: existing.amount + (d.amount || 0)
            });
          }
        });

        const monthlyTrend: MonthlyMetric[] = Array.from(monthlyMap.entries()).map(([month, data]) => ({
          month,
          count: data.count,
          amount: data.amount
        }));

        return {
          overview,
          donorMetrics: {
            totalDonors: donors.length,
            activeDonors: activeDonorIds.size,
            newDonorsThisMonth,
            topDonors
          },
          managerMetrics: {
            totalManagers: managers.length,
            activeManagers: managers.length, // Simplificado
            averageResponseTime: 24, // Mock - horas
            topManagers
          },
          financialMetrics: {
            totalRevenue: totalAmount,
            monthlyTrend,
            byCategory
          }
        };
      }),
      delay(300)
    );
  }
}
