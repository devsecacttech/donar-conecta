import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { AuthService, DonationService, BeneficiaryService } from '../../../services';
import { DonationType, InKindCategory, DonationRequest, Beneficiary } from '../../../models';

@Component({
  standalone: false,
  selector: 'app-donate',
  templateUrl: './donate.page.html',
  styleUrls: ['./donate.page.scss'],
})
export class DonatePage implements OnInit {
  // Tipo de donación seleccionado
  donationType: DonationType = DonationType.MONEY;
  donationTypes = DonationType;

  // Formulario de donación monetaria
  amount: number = 0;
  description: string = '';

  // Formulario de donación en especie
  category: InKindCategory = InKindCategory.FOOD;
  categories = InKindCategory;
  items: { name: string; quantity: number; unit: string }[] = [];
  newItem = { name: '', quantity: 1, unit: 'unidades' };

  // Apadrinamiento
  isRecurring: boolean = false;
  recurringFrequency: 'monthly' | 'quarterly' | 'annual' = 'monthly';

  // Beneficiario
  selectedBeneficiaryId?: string;
  beneficiaries: Beneficiary[] = [];
  showBeneficiarySelector: boolean = false;

  // Métodos de pago
  paymentMethod: 'cash' | 'deuna' | 'transfer' | 'crypto' = 'cash';
  selectedCrypto?: 'bnb' | 'busd' | 'usdt' | 'bitcoin';
  showPaymentConfirmation: boolean = false;

  loading: boolean = false;

  constructor(
    private authService: AuthService,
    private donationService: DonationService,
    private beneficiaryService: BeneficiaryService,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadBeneficiaries();
  }

  loadBeneficiaries() {
    this.beneficiaryService.getActiveBeneficiaries().subscribe(beneficiaries => {
      this.beneficiaries = beneficiaries;
    });
  }

  onDonationTypeChange(type: DonationType) {
    this.donationType = type;
    // Resetear formulario
    this.amount = 0;
    this.description = '';
    this.items = [];
    this.isRecurring = false;
  }

  async addItem() {
    // Validar que el nombre no esté vacío
    if (!this.newItem.name || !this.newItem.name.trim()) {
      const toast = await this.toastController.create({
        message: 'Por favor ingresa el nombre del artículo',
        duration: 2000,
        position: 'bottom',
        color: 'warning',
        icon: 'alert-circle'
      });
      await toast.present();
      return;
    }

    // Validar que la cantidad sea mayor a 0
    if (!this.newItem.quantity || this.newItem.quantity <= 0) {
      const toast = await this.toastController.create({
        message: 'Por favor ingresa una cantidad válida',
        duration: 2000,
        position: 'bottom',
        color: 'warning',
        icon: 'alert-circle'
      });
      await toast.present();
      return;
    }

    // Agregar el artículo a la lista
    this.items.push({ ...this.newItem });

    // Mostrar mensaje de éxito
    const toast = await this.toastController.create({
      message: `"${this.newItem.name}" agregado correctamente`,
      duration: 1500,
      position: 'bottom',
      color: 'success',
      icon: 'checkmark-circle'
    });
    await toast.present();

    // Resetear el formulario
    this.newItem = { name: '', quantity: 1, unit: 'unidades' };
  }

  removeItem(index: number) {
    this.items.splice(index, 1);
  }

  async submitDonation() {
    // Validaciones
    if (!this.validateForm()) {
      await this.showAlert('Error de Validación', 'Por favor completa todos los campos requeridos.');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Procesando donación...',
      spinner: 'crescent'
    });
    await loading.present();

    const user = this.authService.currentUserValue;
    if (!user) {
      await loading.dismiss();
      return;
    }

    // Construir el objeto de donación
    const donationRequest: DonationRequest = {
      type: this.donationType,
      description: this.description,
      beneficiaryId: this.selectedBeneficiaryId
    };

    if (this.donationType === DonationType.MONEY || this.donationType === DonationType.SPONSORSHIP) {
      donationRequest.amount = this.amount;
    }

    if (this.donationType === DonationType.IN_KIND) {
      donationRequest.category = this.category;
      donationRequest.items = this.items;
    }

    if (this.donationType === DonationType.SPONSORSHIP) {
      donationRequest.isRecurring = this.isRecurring;
      donationRequest.recurringFrequency = this.recurringFrequency;
    }

    // Enviar donación
    this.donationService.createDonation(donationRequest, user.id, user.name).subscribe({
      next: async (donation) => {
        await loading.dismiss();
        await this.showSuccessToast();
        this.router.navigate(['/donor/dashboard']);
      },
      error: async (error) => {
        await loading.dismiss();
        await this.showAlert('Error', 'No se pudo procesar la donación. Por favor intenta de nuevo.');
      }
    });
  }

  validateForm(): boolean {
    if (!this.description.trim()) {
      return false;
    }

    if (this.donationType === DonationType.MONEY || this.donationType === DonationType.SPONSORSHIP) {
      if (!this.amount || this.amount <= 0) {
        return false;
      }
    }

    if (this.donationType === DonationType.IN_KIND) {
      if (this.items.length === 0) {
        return false;
      }
    }

    return true;
  }

  getCategoryText(category: string): string {
    const categoryMap: { [key: string]: string } = {
      'food': 'Alimentos',
      'clothing': 'Ropa',
      'education': 'Educación',
      'health': 'Salud',
      'hygiene': 'Higiene',
      'other': 'Otro'
    };
    return categoryMap[category] || category;
  }

  getDonationTypeText(type: DonationType): string {
    switch (type) {
      case DonationType.MONEY: return 'Donación Monetaria';
      case DonationType.IN_KIND: return 'Donación en Especie';
      case DonationType.SPONSORSHIP: return 'Apadrinamiento';
      default: return '';
    }
  }

  getFrequencyText(freq: string): string {
    const freqMap: { [key: string]: string } = {
      'monthly': 'Mensual',
      'quarterly': 'Trimestral',
      'annual': 'Anual'
    };
    return freqMap[freq] || freq;
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
      message: '¡Donación realizada con éxito! Pronto recibirás actualizaciones.',
      duration: 3000,
      position: 'top',
      color: 'success',
      icon: 'checkmark-circle'
    });
    await toast.present();
  }

  selectCrypto(crypto: 'bnb' | 'busd' | 'usdt' | 'bitcoin') {
    this.selectedCrypto = crypto;
  }

  async confirmPayment() {
    const methodText = this.getPaymentMethodText();

    const loading = await this.loadingController.create({
      message: `Confirmando pago por ${methodText}...`,
      spinner: 'crescent'
    });
    await loading.present();

    // Simular proceso de confirmación
    setTimeout(async () => {
      await loading.dismiss();

      const toast = await this.toastController.create({
        message: `¡Pago por ${methodText} confirmado exitosamente!`,
        duration: 2500,
        position: 'bottom',
        color: 'success',
        icon: 'checkmark-circle'
      });
      await toast.present();

      this.showPaymentConfirmation = false;

      // Proceder con la donación
      this.submitDonation();
    }, 1500);
  }

  getPaymentMethodText(): string {
    switch (this.paymentMethod) {
      case 'cash': return 'Efectivo';
      case 'deuna': return 'DeUna (QR)';
      case 'transfer': return 'Transferencia Bancaria';
      case 'crypto':
        if (this.selectedCrypto) {
          return this.getCryptoText(this.selectedCrypto);
        }
        return 'Criptomoneda';
      default: return 'Pago';
    }
  }

  getCryptoText(crypto: string): string {
    const cryptoMap: { [key: string]: string } = {
      'bnb': 'BNB',
      'busd': 'BUSD',
      'usdt': 'USDT',
      'bitcoin': 'Bitcoin'
    };
    return cryptoMap[crypto] || crypto.toUpperCase();
  }

  goBack() {
    this.router.navigate(['/donor/dashboard']);
  }

  getSelectedBeneficiaryName(): string {
    if (!this.selectedBeneficiaryId) {
      return 'Seleccionar Beneficiario';
    }
    const beneficiary = this.beneficiaries.find(b => b.id === this.selectedBeneficiaryId);
    return beneficiary ? beneficiary.profileName : 'Seleccionar Beneficiario';
  }

  getBeneficiarySummary(): string {
    if (!this.selectedBeneficiaryId) {
      return 'Asignación automática';
    }
    const beneficiary = this.beneficiaries.find(b => b.id === this.selectedBeneficiaryId);
    return beneficiary ? beneficiary.profileName : 'Asignación automática';
  }
}
