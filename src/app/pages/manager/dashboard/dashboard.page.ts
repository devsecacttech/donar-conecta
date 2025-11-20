import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, MetricsService, DonationService, CaseService } from '../../../services';
import { ManagerMetrics, Donation, Case, ImpactStory } from '../../../models';

@Component({
  standalone: false,
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  metrics: ManagerMetrics | null = null;
  pendingDeliveries: Donation[] = [];
  assignedCases: Case[] = [];
  recentImpactStories: ImpactStory[] = [];
  managerName: string = '';
  loading: boolean = true;

  constructor(
    private authService: AuthService,
    private metricsService: MetricsService,
    private donationService: DonationService,
    private caseService: CaseService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  ionViewWillEnter() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;
    const user = this.authService.currentUserValue;

    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    this.managerName = user.name;

    // Cargar métricas del gestor
    this.metricsService.getManagerMetrics(user.id).subscribe(metrics => {
      this.metrics = metrics;
      this.loading = false;
    });

    // Cargar donaciones pendientes asignadas al gestor
    this.donationService.getDonationsByManager(user.id).subscribe(donations => {
      this.pendingDeliveries = donations
        .filter(d => d.status === 'pending' || d.status === 'in_process')
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5); // Solo las 5 más recientes
    });

    // Cargar casos asignados
    this.caseService.getCasesByManager(user.id).subscribe(cases => {
      this.assignedCases = cases
        .filter(c => c.status === 'open' || c.status === 'in_progress')
        .sort((a, b) => {
          // Ordenar por prioridad (urgent > high > medium > low)
          const priorityOrder: { [key: string]: number } = {
            'urgent': 1,
            'high': 2,
            'medium': 3,
            'low': 4
          };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        })
        .slice(0, 5);
    });

    // Cargar historias de impacto recientes creadas por este gestor
    this.donationService.getImpactStories().subscribe(stories => {
      this.recentImpactStories = stories
        .filter(s => s.managerId === user.id)
        .sort((a, b) => b.deliveryDate.getTime() - a.deliveryDate.getTime())
        .slice(0, 3);
    });
  }

  navigateToDeliveries() {
    this.router.navigate(['/manager/deliveries']);
  }

  navigateToCases() {
    this.router.navigate(['/manager/cases']);
  }

  navigateToDelivery(donationId: string) {
    this.router.navigate(['/manager/deliveries'], { queryParams: { id: donationId } });
  }

  navigateToCase(caseId: string) {
    this.router.navigate(['/manager/cases'], { queryParams: { id: caseId } });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'in_process':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'danger';
      default:
        return 'medium';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'in_process':
        return 'En Proceso';
      case 'delivered':
        return 'Entregado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'urgent':
        return 'danger';
      case 'high':
        return 'warning';
      case 'medium':
        return 'primary';
      case 'low':
        return 'success';
      default:
        return 'medium';
    }
  }

  getPriorityText(priority: string): string {
    switch (priority) {
      case 'urgent':
        return 'Urgente';
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Media';
      case 'low':
        return 'Baja';
      default:
        return priority;
    }
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  getDonationTypeText(type: string): string {
    switch (type) {
      case 'money':
        return 'Monetaria';
      case 'in_kind':
        return 'En Especie';
      case 'sponsorship':
        return 'Apadrinamiento';
      default:
        return type;
    }
  }
}
