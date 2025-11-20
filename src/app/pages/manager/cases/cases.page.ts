import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { AuthService, CaseService } from '../../../services';
import { Case, CaseStatus, CasePriority } from '../../../models';

@Component({
  standalone: false,
  selector: 'app-cases',
  templateUrl: './cases.page.html',
  styleUrls: ['./cases.page.scss'],
})
export class CasesPage implements OnInit {
  allCases: Case[] = [];
  filteredCases: Case[] = [];
  selectedFilter: 'all' | 'open' | 'in_progress' | 'completed' = 'all';
  loading: boolean = true;

  // Case detail modal
  showDetailModal: boolean = false;
  selectedCase: Case | null = null;
  newNote: string = '';

  // Expose enum for template
  CaseStatus = CaseStatus;

  constructor(
    private authService: AuthService,
    private caseService: CaseService,
    private router: Router,
    private route: ActivatedRoute,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadCases();

    // Check if there's a specific case ID in query params
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        const caseId = params['id'];
        setTimeout(() => {
          const caseItem = this.allCases.find(c => c.id === caseId);
          if (caseItem) {
            this.openDetailModal(caseItem);
          }
        }, 500);
      }
    });
  }

  ionViewWillEnter() {
    this.loadCases();
  }

  loadCases() {
    this.loading = true;
    const user = this.authService.currentUserValue;

    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    this.caseService.getCasesByManager(user.id).subscribe(cases => {
      this.allCases = cases.sort((a, b) => {
        // Sort by priority first, then by date
        const priorityOrder: { [key: string]: number } = {
          'urgent': 1,
          'high': 2,
          'medium': 3,
          'low': 4
        };

        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;

        return b.createdAt.getTime() - a.createdAt.getTime();
      });
      this.applyFilter();
      this.loading = false;
    });
  }

  applyFilter() {
    if (this.selectedFilter === 'all') {
      this.filteredCases = this.allCases;
    } else {
      this.filteredCases = this.allCases.filter(
        c => c.status === this.selectedFilter
      );
    }
  }

  onFilterChange(event: any) {
    this.selectedFilter = event.detail.value;
    this.applyFilter();
  }

  openDetailModal(caseItem: Case) {
    this.selectedCase = caseItem;
    this.newNote = '';
    this.showDetailModal = true;
  }

  closeDetailModal() {
    this.showDetailModal = false;
    this.selectedCase = null;
  }

  async updateCaseStatus(status: CaseStatus) {
    if (!this.selectedCase) return;

    const loading = await this.loadingController.create({
      message: 'Actualizando caso...',
      spinner: 'crescent'
    });
    await loading.present();

    this.caseService.updateCaseStatus(this.selectedCase.id, status).subscribe({
      next: async (updatedCase) => {
        await loading.dismiss();
        await this.showToast('Estado actualizado correctamente', 'success');
        this.selectedCase = updatedCase;
        this.loadCases();
      },
      error: async (error) => {
        await loading.dismiss();
        await this.showAlert('Error', 'No se pudo actualizar el estado del caso');
      }
    });
  }

  async addNoteToCase() {
    if (!this.selectedCase || !this.newNote.trim()) {
      await this.showAlert('Error', 'Por favor ingresa una nota');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Agregando nota...',
      spinner: 'crescent'
    });
    await loading.present();

    const user = this.authService.currentUserValue;
    if (!user) {
      await loading.dismiss();
      return;
    }

    this.caseService.addNote(this.selectedCase.id, {
      authorId: user.id,
      authorName: user.name,
      content: this.newNote
    }).subscribe({
      next: async (note) => {
        await loading.dismiss();
        await this.showToast('Nota agregada correctamente', 'success');

        // Reload case details
        this.caseService.getCaseById(this.selectedCase!.id).subscribe(updatedCase => {
          if (updatedCase) {
            this.selectedCase = updatedCase;
          }
          this.newNote = '';
          this.loadCases();
        });
      },
      error: async (error) => {
        await loading.dismiss();
        await this.showAlert('Error', 'No se pudo agregar la nota');
      }
    });
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'urgent': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'primary';
      case 'low': return 'success';
      default: return 'medium';
    }
  }

  getPriorityText(priority: string): string {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return priority;
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'open': return 'warning';
      case 'in_progress': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      default: return 'medium';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'open': return 'Abierto';
      case 'in_progress': return 'En Progreso';
      case 'completed': return 'Completado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('es-EC', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  formatDateTime(date: Date): string {
    return date.toLocaleDateString('es-EC', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
