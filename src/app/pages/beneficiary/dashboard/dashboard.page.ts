import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, BeneficiaryService, DonationService } from '../../../services';
import { Beneficiary, Donation, DonationType } from '../../../models';

interface DashboardStats {
  totalDonationsReceived: number;
  totalDonationCount: number;
  activeSponsorships: number;
  recentDonations: Donation[];
}

@Component({
  standalone: false,
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  beneficiary: Beneficiary | null = null;
  stats: DashboardStats | null = null;
  loading: boolean = true;
  selectedView: 'overview' | 'donations' | 'progress' = 'overview';

  constructor(
    private authService: AuthService,
    private beneficiaryService: BeneficiaryService,
    private donationService: DonationService,
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

    // En un sistema real, el usuario tendría un beneficiaryId asociado
    // Por ahora, usamos el primer beneficiario como ejemplo
    this.beneficiaryService.getBeneficiaryById('b1').subscribe(beneficiary => {
      if (beneficiary) {
        this.beneficiary = beneficiary;
        this.loadDonations(beneficiary.id);
      } else {
        this.loading = false;
      }
    });
  }

  private loadDonations(beneficiaryId: string) {
    this.donationService.getDonationsByBeneficiary(beneficiaryId).subscribe(donations => {
      this.calculateStats(donations);
      this.loading = false;
    });
  }

  private calculateStats(donations: Donation[]) {
    const totalAmount = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
    const sponsorships = donations.filter(d =>
      d.type === DonationType.SPONSORSHIP && d.recurring?.active
    );

    this.stats = {
      totalDonationsReceived: totalAmount,
      totalDonationCount: donations.length,
      activeSponsorships: sponsorships.length,
      recentDonations: donations.slice(0, 5).sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    };
  }

  onViewChange(event: any) {
    this.selectedView = event.detail.value;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('es-EC').format(num);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-EC', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  getDonationType(type: DonationType): string {
    const types: { [key in DonationType]: string } = {
      [DonationType.MONEY]: 'Donación Monetaria',
      [DonationType.IN_KIND]: 'Donación Material',
      [DonationType.SPONSORSHIP]: 'Apadrinamiento'
    };
    return types[type] || type;
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

  getNeedIcon(need: string): string {
    const needLower = need.toLowerCase();
    if (needLower.includes('aliment') || needLower.includes('comida')) return 'restaurant';
    if (needLower.includes('ropa') || needLower.includes('vestir')) return 'shirt';
    if (needLower.includes('escolar') || needLower.includes('educación')) return 'school';
    if (needLower.includes('salud') || needLower.includes('médic')) return 'medkit';
    if (needLower.includes('vivienda') || needLower.includes('alquiler')) return 'home';
    return 'cube';
  }

  getNeedColor(need: string): string {
    const needLower = need.toLowerCase();
    if (needLower.includes('aliment') || needLower.includes('comida')) return 'success';
    if (needLower.includes('ropa') || needLower.includes('vestir')) return 'primary';
    if (needLower.includes('escolar') || needLower.includes('educación')) return 'tertiary';
    if (needLower.includes('salud') || needLower.includes('médic')) return 'danger';
    if (needLower.includes('vivienda') || needLower.includes('alquiler')) return 'warning';
    return 'medium';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
