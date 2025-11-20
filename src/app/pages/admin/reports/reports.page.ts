import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { MetricsService } from '../../../services';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface ReportData {
  period: string;
  totalRevenue: number;
  totalDonations: number;
  averageDonation: number;
  donorGrowth: number;
  completionRate: number;
}

@Component({
  standalone: false,
  selector: 'app-reports',
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
})
export class ReportsPage implements OnInit {
  loading: boolean = true;
  selectedPeriod: string = '30days';
  dateRange: DateRange = {
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date()
  };

  // Datos del reporte
  reportData: ReportData | null = null;

  // Datos para gráficos
  revenueComparison: { month: string; current: number; previous: number; }[] = [];
  donationsByCategory: { category: string; amount: number; count: number; percentage: number; }[] = [];
  managerPerformance: { name: string; deliveries: number; rating: number; efficiency: number; }[] = [];
  topDonors: { name: string; amount: number; count: number; }[] = [];

  selectedView: 'overview' | 'financial' | 'donations' | 'managers' = 'overview';

  constructor(
    private metricsService: MetricsService,
    private router: Router,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadReportData();
  }

  ionViewWillEnter() {
    this.loadReportData();
  }

  loadReportData() {
    this.loading = true;

    this.metricsService.getAdminMetrics().subscribe(metrics => {
      this.calculateReportData(metrics);
      this.generateChartData(metrics);
      this.loading = false;
    });
  }

  private calculateReportData(metrics: any) {
    const totalRevenue = metrics.financialMetrics.totalRevenue;
    const totalDonations = metrics.overview.totalDonations;
    const averageDonation = totalDonations > 0 ? totalRevenue / totalDonations : 0;

    // Calcular crecimiento de donantes (comparando mes actual vs anterior)
    const currentMonthDonors = metrics.donorMetrics.newDonorsThisMonth;
    const donorGrowth = 15.5; // Mock - en producción se calcularía comparando periodos

    // Tasa de completación (donaciones entregadas vs totales)
    const completionRate = 92.3; // Mock

    this.reportData = {
      period: this.getPeriodLabel(),
      totalRevenue,
      totalDonations,
      averageDonation,
      donorGrowth,
      completionRate
    };
  }

  private generateChartData(metrics: any) {
    // Revenue comparison (últimos 6 meses)
    this.revenueComparison = [
      { month: 'Jun', current: 18500, previous: 15200 },
      { month: 'Jul', current: 22100, previous: 18500 },
      { month: 'Ago', current: 19800, previous: 19200 },
      { month: 'Sep', current: 24300, previous: 21500 },
      { month: 'Oct', current: 26700, previous: 23100 },
      { month: 'Nov', current: 28900, previous: 24800 }
    ];

    // Donations by category
    this.donationsByCategory = metrics.financialMetrics.byCategory;

    // Manager performance
    this.managerPerformance = [
      { name: 'Carlos Rodríguez', deliveries: 156, rating: 4.8, efficiency: 94 },
      { name: 'Laura Sánchez', deliveries: 89, rating: 4.6, efficiency: 88 },
      { name: 'Carmen Díaz', deliveries: 42, rating: 4.9, efficiency: 96 }
    ];

    // Top donors
    this.topDonors = metrics.donorMetrics.topDonors;
  }

  onPeriodChange(event: any) {
    this.selectedPeriod = event.detail.value;
    this.updateDateRange();
    this.loadReportData();
  }

  onViewChange(event: any) {
    this.selectedView = event.detail.value;
  }

  private updateDateRange() {
    const now = new Date();
    const endDate = new Date(now);
    let startDate = new Date(now);

    switch (this.selectedPeriod) {
      case '7days':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(now.getDate() - 30);
        break;
      case '3months':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6months':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'custom':
        // Se manejaría con un date picker
        break;
    }

    this.dateRange = { startDate, endDate };
  }

  getPeriodLabel(): string {
    const labels: { [key: string]: string } = {
      '7days': 'Últimos 7 días',
      '30days': 'Últimos 30 días',
      '3months': 'Últimos 3 meses',
      '6months': 'Últimos 6 meses',
      'year': 'Último año',
      'custom': 'Personalizado'
    };
    return labels[this.selectedPeriod] || this.selectedPeriod;
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

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
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

  getComparisonBarHeight(value: number, maxValue: number): number {
    return maxValue > 0 ? (value / maxValue) * 100 : 0;
  }

  getMaxComparisonValue(): number {
    const values: number[] = [];
    this.revenueComparison.forEach(item => {
      values.push(item.current, item.previous);
    });
    return Math.max(...values);
  }

  async exportReport(format: 'pdf' | 'excel' | 'csv') {
    // Mock de exportación - en producción se generaría el archivo real
    const toast = await this.toastController.create({
      message: `Exportando reporte en formato ${format.toUpperCase()}...`,
      duration: 2000,
      position: 'bottom',
      color: 'success',
      icon: 'download'
    });
    await toast.present();

    // Simular descarga
    setTimeout(async () => {
      const successToast = await this.toastController.create({
        message: `Reporte exportado exitosamente como ${format.toUpperCase()}`,
        duration: 2000,
        position: 'bottom',
        color: 'success',
        icon: 'checkmark-circle'
      });
      await successToast.present();
    }, 1500);
  }

  goBack() {
    this.router.navigate(['/admin/dashboard']);
  }
}
