import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, MetricsService } from '../../../services';
import { AdminMetrics } from '../../../models';

@Component({
  standalone: false,
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  metrics: AdminMetrics | null = null;
  loading: boolean = true;
  adminName: string = '';

  // Datos para gráficas
  selectedChartView: 'donations' | 'categories' = 'donations';

  constructor(
    private authService: AuthService,
    private metricsService: MetricsService,
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

    this.adminName = user.name;

    // Cargar métricas del administrador
    this.metricsService.getAdminMetrics().subscribe(metrics => {
      this.metrics = metrics;
      this.loading = false;
    });
  }

  onChartViewChange(event: any) {
    this.selectedChartView = event.detail.value;
  }

  navigateToUsers() {
    // Navegar a gestión de usuarios
    this.router.navigate(['/admin/users']);
  }

  navigateToCases() {
    // Navegar a gestión de casos
    this.router.navigate(['/admin/cases']);
  }

  navigateToReports() {
    // Navegar a reportes
    this.router.navigate(['/admin/reports']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('es-ES').format(num);
  }

  formatPercent(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  getCategoryName(category: string): string {
    const categories: { [key: string]: string } = {
      'food': 'Alimentos',
      'clothing': 'Ropa',
      'education': 'Educación',
      'health': 'Salud',
      'hygiene': 'Higiene',
      'other': 'Otros'
    };
    return categories[category] || category;
  }

  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      'food': 'success',
      'clothing': 'primary',
      'education': 'tertiary',
      'health': 'danger',
      'hygiene': 'warning',
      'other': 'medium'
    };
    return colors[category] || 'medium';
  }

  getMonthLabel(monthStr: string): string {
    // El formato viene como "nov 2024", extraer solo el mes abreviado
    return monthStr.split(' ')[0];
  }

  getMaxMonthlyAmount(): number {
    if (!this.metrics?.financialMetrics.monthlyTrend) return 0;
    return Math.max(...this.metrics.financialMetrics.monthlyTrend.map(m => m.amount));
  }

  getBarHeight(amount: number): number {
    const max = this.getMaxMonthlyAmount();
    return max > 0 ? (amount / max) * 100 : 0;
  }
}
