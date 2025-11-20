import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, DonationService, MetricsService, BeneficiaryService } from '../../../services';
import { Donor, Donation, DonorMetrics, ImpactStory, Beneficiary } from '../../../models';

@Component({
  standalone: false,
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  donor: Donor | null = null;
  metrics: DonorMetrics | null = null;
  recentDonations: Donation[] = [];
  recentImpactStories: ImpactStory[] = [];
  sponsoredBeneficiaries: Beneficiary[] = [];
  loading = true;

  constructor(
    private authService: AuthService,
    private donationService: DonationService,
    private metricsService: MetricsService,
    private beneficiaryService: BeneficiaryService,
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

    if (user) {
      this.donor = user as Donor;

      // Cargar métricas
      this.metricsService.getDonorMetrics(user.id).subscribe(metrics => {
        this.metrics = metrics;
      });

      // Cargar donaciones recientes
      this.donationService.getDonationsByDonor(user.id).subscribe(donations => {
        this.recentDonations = donations
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, 5);
      });

      // Cargar historias de impacto recientes
      this.donationService.getImpactStoriesByDonor(user.id).subscribe(stories => {
        this.recentImpactStories = stories
          .sort((a, b) => b.deliveryDate.getTime() - a.deliveryDate.getTime())
          .slice(0, 3);
      });

      // Cargar beneficiarios apadrinados
      this.beneficiaryService.getSponsoredBeneficiaries(user.id).subscribe(beneficiaries => {
        this.sponsoredBeneficiaries = beneficiaries;
        this.loading = false;
      });
    }
  }

  navigateToDonate() {
    this.router.navigate(['/donor/donate']);
  }

  navigateToImpactStories() {
    this.router.navigate(['/donor/impact-stories']);
  }

  navigateToSponsorship() {
    this.router.navigate(['/donor/sponsorship']);
  }

  viewImpactStory(story: ImpactStory) {
    this.donationService.incrementStoryViews(story.id);
    // Aquí podrías abrir un modal con los detalles de la historia
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getDonationStatusColor(status: string): string {
    switch (status) {
      case 'delivered': return 'success';
      case 'in_process': return 'warning';
      case 'pending': return 'medium';
      case 'cancelled': return 'danger';
      default: return 'medium';
    }
  }

  getDonationStatusText(status: string): string {
    switch (status) {
      case 'delivered': return 'Entregada';
      case 'in_process': return 'En Proceso';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  }

  getDonationTypeText(type: string): string {
    switch (type) {
      case 'money': return 'Donación Monetaria';
      case 'in_kind': return 'Donación en Especie';
      case 'sponsorship': return 'Apadrinamiento';
      default: return type;
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-EC', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
}
