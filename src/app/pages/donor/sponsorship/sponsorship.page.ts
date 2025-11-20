import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { AuthService, BeneficiaryService, DonationService } from '../../../services';
import { Beneficiary, DonationType, DonationStatus } from '../../../models';

@Component({
  standalone: false,
  selector: 'app-sponsorship',
  templateUrl: './sponsorship.page.html',
  styleUrls: ['./sponsorship.page.scss'],
})
export class SponsorshipPage implements OnInit {
  availableBeneficiaries: Beneficiary[] = [];
  sponsoredBeneficiaries: Beneficiary[] = [];
  selectedSegment: 'available' | 'sponsored' = 'available';
  loading: boolean = true;

  // Modal para iniciar apadrinamiento
  showSponsorModal: boolean = false;
  selectedBeneficiary: Beneficiary | null = null;

  // Formulario de apadrinamiento
  sponsorshipAmount: number = 30; // Monto mensual por defecto
  sponsorshipFrequency: 'monthly' | 'quarterly' | 'annual' = 'monthly';
  sponsorshipMessage: string = '';

  // Montos sugeridos
  suggestedAmounts = [20, 30, 50, 75, 100];

  constructor(
    private authService: AuthService,
    private beneficiaryService: BeneficiaryService,
    private donationService: DonationService,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadData();
  }

  ionViewWillEnter() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    const user = this.authService.currentUserValue;

    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    // Cargar beneficiarios disponibles
    this.beneficiaryService.getActiveBeneficiaries().subscribe(beneficiaries => {
      // Filtrar los que ya están apadrinados por este donante
      this.beneficiaryService.getSponsoredBeneficiaries(user.id).subscribe(sponsored => {
        const sponsoredIds = new Set(sponsored.map(b => b.id));
        this.availableBeneficiaries = beneficiaries.filter(b => !sponsoredIds.has(b.id));
        this.sponsoredBeneficiaries = sponsored;
        this.loading = false;
      });
    });
  }

  onSegmentChange(event: any) {
    this.selectedSegment = event.detail.value;
  }

  openSponsorModal(beneficiary: Beneficiary) {
    this.selectedBeneficiary = beneficiary;
    this.sponsorshipAmount = 30;
    this.sponsorshipFrequency = 'monthly';
    this.sponsorshipMessage = '';
    this.showSponsorModal = true;
  }

  closeSponsorModal() {
    this.showSponsorModal = false;
    this.selectedBeneficiary = null;
  }

  selectAmount(amount: number) {
    this.sponsorshipAmount = amount;
  }

  async startSponsorship() {
    if (!this.selectedBeneficiary) return;

    // Validaciones
    if (this.sponsorshipAmount < 10) {
      await this.showAlert('Error', 'El monto mínimo de apadrinamiento es 10€');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Iniciando apadrinamiento...',
      spinner: 'crescent'
    });
    await loading.present();

    const user = this.authService.currentUserValue;
    if (!user) {
      await loading.dismiss();
      return;
    }

    // Calcular fecha de próxima donación
    const nextDonationDate = this.calculateNextDonationDate();

    // Crear donación recurrente
    this.donationService.createDonation({
      type: DonationType.SPONSORSHIP,
      amount: this.sponsorshipAmount,
      description: this.sponsorshipMessage || `Apadrinamiento de ${this.selectedBeneficiary.profileName}`,
      beneficiaryId: this.selectedBeneficiary.id,
      isRecurring: true,
      recurringFrequency: this.sponsorshipFrequency
    }, user.id, user.name).subscribe({
      next: async (donation) => {
        await loading.dismiss();
        await this.showSuccessToast();
        this.closeSponsorModal();
        this.loadData();
      },
      error: async (error) => {
        await loading.dismiss();
        await this.showAlert('Error', 'No se pudo iniciar el apadrinamiento. Inténtalo de nuevo.');
      }
    });
  }

  async cancelSponsorship(beneficiary: Beneficiary) {
    const alert = await this.alertController.create({
      header: 'Cancelar Apadrinamiento',
      message: `¿Estás seguro de que deseas cancelar el apadrinamiento de ${beneficiary.profileName}?`,
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        },
        {
          text: 'Sí, cancelar',
          role: 'destructive',
          handler: async () => {
            await this.performCancelSponsorship(beneficiary);
          }
        }
      ]
    });

    await alert.present();
  }

  private async performCancelSponsorship(beneficiary: Beneficiary) {
    const loading = await this.loadingController.create({
      message: 'Cancelando apadrinamiento...',
      spinner: 'crescent'
    });
    await loading.present();

    const user = this.authService.currentUserValue;
    if (!user) {
      await loading.dismiss();
      return;
    }

    // Buscar la donación recurrente activa para este beneficiario
    this.donationService.getDonationsByDonor(user.id).subscribe({
      next: async (donations) => {
        const sponsorshipDonation = donations.find(d =>
          d.type === DonationType.SPONSORSHIP &&
          d.beneficiaryId === beneficiary.id &&
          d.recurring?.active
        );

        if (sponsorshipDonation && sponsorshipDonation.recurring) {
          // Desactivar la donación recurrente
          sponsorshipDonation.recurring.active = false;
          sponsorshipDonation.recurring.endDate = new Date();

          await loading.dismiss();
          await this.showToast('Apadrinamiento cancelado correctamente', 'warning');
          this.loadData();
        } else {
          await loading.dismiss();
          await this.showAlert('Error', 'No se encontró el apadrinamiento activo');
        }
      },
      error: async (error) => {
        await loading.dismiss();
        await this.showAlert('Error', 'No se pudo cancelar el apadrinamiento');
      }
    });
  }

  viewBeneficiaryDetails(beneficiary: Beneficiary) {
    // Aquí se podría abrir un modal con más detalles o navegar a una página de detalles
    // Por ahora, abrimos el modal de apadrinamiento
    this.openSponsorModal(beneficiary);
  }

  private calculateNextDonationDate(): Date {
    const today = new Date();
    const nextDate = new Date(today);

    switch (this.sponsorshipFrequency) {
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'quarterly':
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case 'annual':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }

    return nextDate;
  }

  getFrequencyText(frequency: 'monthly' | 'quarterly' | 'annual'): string {
    switch (frequency) {
      case 'monthly':
        return 'Mensual';
      case 'quarterly':
        return 'Trimestral';
      case 'annual':
        return 'Anual';
      default:
        return frequency;
    }
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('es-EC', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  private async showSuccessToast() {
    const toast = await this.toastController.create({
      message: '¡Apadrinamiento iniciado con éxito! Gracias por tu generosidad.',
      duration: 3000,
      position: 'top',
      color: 'success',
      icon: 'heart'
    });
    await toast.present();
  }

  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color
    });
    await toast.present();
  }

  goBack() {
    this.router.navigate(['/donor/dashboard']);
  }
}
