import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertController, LoadingController, ToastController, ModalController } from '@ionic/angular';
import { AuthService, DonationService } from '../../../services';
import { Donation, DonationStatus, ImpactStory } from '../../../models';

@Component({
  standalone: false,
  selector: 'app-deliveries',
  templateUrl: './deliveries.page.html',
  styleUrls: ['./deliveries.page.scss'],
})
export class DeliveriesPage implements OnInit {
  allDeliveries: Donation[] = [];
  filteredDeliveries: Donation[] = [];
  selectedFilter: 'all' | 'pending' | 'in_process' | 'delivered' = 'all';
  loading: boolean = true;

  // Modal para reportar entrega
  showReportModal: boolean = false;
  selectedDelivery: Donation | null = null;

  // Formulario de reporte
  reportLocation: string = '';
  beneficiaryMessage: string = '';
  deliveryNotes: string = '';
  uploadedPhotos: string[] = []; // Base64 o URLs simuladas

  constructor(
    private authService: AuthService,
    private donationService: DonationService,
    private router: Router,
    private route: ActivatedRoute,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadDeliveries();

    // Check if there's a specific delivery ID in query params
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        const deliveryId = params['id'];
        setTimeout(() => {
          const delivery = this.allDeliveries.find(d => d.id === deliveryId);
          if (delivery) {
            this.openReportModal(delivery);
          }
        }, 500);
      }
    });
  }

  ionViewWillEnter() {
    this.loadDeliveries();
  }

  loadDeliveries() {
    this.loading = true;
    const user = this.authService.currentUserValue;

    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    this.donationService.getDonationsByManager(user.id).subscribe(deliveries => {
      this.allDeliveries = deliveries.sort((a, b) =>
        b.createdAt.getTime() - a.createdAt.getTime()
      );
      this.applyFilter();
      this.loading = false;
    });
  }

  applyFilter() {
    if (this.selectedFilter === 'all') {
      this.filteredDeliveries = this.allDeliveries;
    } else {
      this.filteredDeliveries = this.allDeliveries.filter(
        d => d.status === this.selectedFilter
      );
    }
  }

  onFilterChange(event: any) {
    this.selectedFilter = event.detail.value;
    this.applyFilter();
  }

  openReportModal(delivery: Donation) {
    this.selectedDelivery = delivery;
    this.reportLocation = '';
    this.beneficiaryMessage = '';
    this.deliveryNotes = '';
    this.uploadedPhotos = [];
    this.showReportModal = true;
  }

  closeReportModal() {
    this.showReportModal = false;
    this.selectedDelivery = null;
  }

  async simulatePhotoUpload() {
    // Simular selección de archivo
    const photoUrls = [
      'assets/impact/delivery1.jpg',
      'assets/impact/delivery2.jpg',
      'assets/impact/delivery3.jpg'
    ];

    const randomPhoto = photoUrls[Math.floor(Math.random() * photoUrls.length)];
    this.uploadedPhotos.push(randomPhoto);

    const toast = await this.toastController.create({
      message: 'Foto agregada correctamente',
      duration: 2000,
      position: 'bottom',
      color: 'success',
      icon: 'checkmark-circle'
    });
    await toast.present();
  }

  removePhoto(index: number) {
    this.uploadedPhotos.splice(index, 1);
  }

  async submitDeliveryReport() {
    if (!this.selectedDelivery) return;

    // Validaciones
    if (!this.reportLocation.trim()) {
      await this.showAlert('Error', 'Por favor ingresa la ubicación de la entrega');
      return;
    }

    if (this.uploadedPhotos.length === 0) {
      await this.showAlert('Error', 'Por favor sube al menos una foto de comprobante');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Procesando entrega...',
      spinner: 'crescent'
    });
    await loading.present();

    // Actualizar estado de la donación a "entregado"
    this.donationService.updateDonationStatus(
      this.selectedDelivery.id,
      DonationStatus.DELIVERED
    ).subscribe({
      next: async (updatedDonation) => {
        // Crear historia de impacto
        const user = this.authService.currentUserValue;
        if (!user) return;

        this.donationService.createImpactStory(
          this.selectedDelivery!.id,
          this.uploadedPhotos,
          this.deliveryNotes || this.selectedDelivery!.description,
          this.beneficiaryMessage,
          this.reportLocation,
          user.id,
          user.name
        ).subscribe({
          next: async (story) => {
            await loading.dismiss();
            await this.showSuccessToast();
            this.closeReportModal();
            this.loadDeliveries();
          },
          error: async (error) => {
            await loading.dismiss();
            await this.showAlert('Error', 'No se pudo crear la historia de impacto');
          }
        });
      },
      error: async (error) => {
        await loading.dismiss();
        await this.showAlert('Error', 'No se pudo actualizar el estado de la donación');
      }
    });
  }

  async markAsInProcess(delivery: Donation) {
    const loading = await this.loadingController.create({
      message: 'Actualizando estado...',
      spinner: 'crescent'
    });
    await loading.present();

    this.donationService.updateDonationStatus(
      delivery.id,
      DonationStatus.IN_PROCESS
    ).subscribe({
      next: async () => {
        await loading.dismiss();
        await this.showToast('Estado actualizado a "En Proceso"', 'primary');
        this.loadDeliveries();
      },
      error: async () => {
        await loading.dismiss();
        await this.showAlert('Error', 'No se pudo actualizar el estado');
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'pending': return 'warning';
      case 'in_process': return 'primary';
      case 'delivered': return 'success';
      case 'cancelled': return 'danger';
      default: return 'medium';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'in_process': return 'En Proceso';
      case 'delivered': return 'Entregado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  }

  getDonationTypeText(type: string): string {
    switch (type) {
      case 'money': return 'Monetaria';
      case 'in_kind': return 'En Especie';
      case 'sponsorship': return 'Apadrinamiento';
      default: return type;
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
      message: '¡Entrega reportada con éxito! Se creó la historia de impacto.',
      duration: 3000,
      position: 'top',
      color: 'success',
      icon: 'checkmark-circle'
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
    this.router.navigate(['/manager/dashboard']);
  }
}
