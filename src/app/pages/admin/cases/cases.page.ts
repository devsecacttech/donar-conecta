import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { AuthService, CaseService } from '../../../services';
import { Case, CaseStatus, CasePriority, User, UserRole } from '../../../models';

interface CaseStats {
  total: number;
  open: number;
  inProgress: number;
  completed: number;
  closed: number;
  urgent: number;
  unassigned: number;
}

@Component({
  standalone: false,
  selector: 'app-cases',
  templateUrl: './cases.page.html',
  styleUrls: ['./cases.page.scss'],
})
export class CasesPage implements OnInit {
  allCases: Case[] = [];
  filteredCases: Case[] = [];
  availableManagers: User[] = [];

  loading: boolean = true;
  stats: CaseStats = {
    total: 0,
    open: 0,
    inProgress: 0,
    completed: 0,
    closed: 0,
    urgent: 0,
    unassigned: 0
  };

  // Filters
  selectedStatusFilter: string = 'all';
  selectedPriorityFilter: string = 'all';
  selectedManagerFilter: string = 'all';
  searchTerm: string = '';

  // Case detail modal
  showDetailModal: boolean = false;
  selectedCase: Case | null = null;
  newNote: string = '';
  selectedManagerId: string = '';

  // Assign manager modal
  showAssignModal: boolean = false;
  caseToAssign: Case | null = null;

  // Expose enums for template
  CaseStatus = CaseStatus;
  CasePriority = CasePriority;

  constructor(
    private authService: AuthService,
    private caseService: CaseService,
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

    // Load all cases (admin can see all)
    this.caseService.getAllCases().subscribe(cases => {
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

      this.calculateStats();
      this.applyFilters();
      this.loading = false;
    });

    // Load available managers
    this.availableManagers = this.authService.getUsersByRole(UserRole.MANAGER);
  }

  calculateStats() {
    this.stats = {
      total: this.allCases.length,
      open: this.allCases.filter(c => c.status === CaseStatus.OPEN).length,
      inProgress: this.allCases.filter(c => c.status === CaseStatus.IN_PROGRESS).length,
      completed: this.allCases.filter(c => c.status === CaseStatus.COMPLETED).length,
      closed: this.allCases.filter(c => c.status === CaseStatus.CLOSED).length,
      urgent: this.allCases.filter(c => c.priority === CasePriority.URGENT).length,
      unassigned: this.allCases.filter(c => !c.assignedManagerId).length
    };
  }

  applyFilters() {
    let filtered = this.allCases;

    // Status filter
    if (this.selectedStatusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === this.selectedStatusFilter);
    }

    // Priority filter
    if (this.selectedPriorityFilter !== 'all') {
      filtered = filtered.filter(c => c.priority === this.selectedPriorityFilter);
    }

    // Manager filter
    if (this.selectedManagerFilter !== 'all') {
      if (this.selectedManagerFilter === 'unassigned') {
        filtered = filtered.filter(c => !c.assignedManagerId);
      } else {
        filtered = filtered.filter(c => c.assignedManagerId === this.selectedManagerFilter);
      }
    }

    // Search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(term) ||
        c.beneficiaryName.toLowerCase().includes(term) ||
        c.description.toLowerCase().includes(term)
      );
    }

    this.filteredCases = filtered;
  }

  onStatusFilterChange(event: any) {
    this.selectedStatusFilter = event.detail.value;
    this.applyFilters();
  }

  onPriorityFilterChange(event: any) {
    this.selectedPriorityFilter = event.detail.value;
    this.applyFilters();
  }

  onManagerFilterChange(event: any) {
    this.selectedManagerFilter = event.detail.value;
    this.applyFilters();
  }

  onSearchChange(event: any) {
    this.searchTerm = event.detail.value || '';
    this.applyFilters();
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

  openAssignModal(caseItem: Case) {
    this.caseToAssign = caseItem;
    this.selectedManagerId = caseItem.assignedManagerId || '';
    this.showAssignModal = true;
  }

  closeAssignModal() {
    this.showAssignModal = false;
    this.caseToAssign = null;
    this.selectedManagerId = '';
  }

  async assignManager() {
    if (!this.caseToAssign || !this.selectedManagerId) {
      await this.showToast('Por favor selecciona un gestor', 'warning');
      return;
    }

    const selectedManager = this.availableManagers.find(m => m.id === this.selectedManagerId);
    if (!selectedManager) {
      await this.showToast('Gestor no encontrado', 'danger');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Asignando gestor...',
      spinner: 'crescent'
    });
    await loading.present();

    this.caseService.assignManager(this.caseToAssign.id, this.selectedManagerId, selectedManager.name).subscribe({
      next: async () => {
        await loading.dismiss();
        await this.showToast('Gestor asignado correctamente', 'success');
        this.closeAssignModal();
        this.loadData();
      },
      error: async (error) => {
        await loading.dismiss();
        await this.showAlert('Error', 'No se pudo asignar el gestor');
      }
    });
  }

  async updateCaseStatus(status: CaseStatus) {
    if (!this.selectedCase) return;

    const loading = await this.loadingController.create({
      message: 'Actualizando estado...',
      spinner: 'crescent'
    });
    await loading.present();

    this.caseService.updateCaseStatus(this.selectedCase.id, status).subscribe({
      next: async (updatedCase) => {
        await loading.dismiss();
        await this.showToast('Estado actualizado correctamente', 'success');
        this.selectedCase = updatedCase;
        this.loadData();
      },
      error: async (error) => {
        await loading.dismiss();
        await this.showAlert('Error', 'No se pudo actualizar el estado');
      }
    });
  }

  async updateCasePriority(priority: CasePriority) {
    if (!this.selectedCase) return;

    const loading = await this.loadingController.create({
      message: 'Actualizando prioridad...',
      spinner: 'crescent'
    });
    await loading.present();

    this.caseService.updateCasePriority(this.selectedCase.id, priority).subscribe({
      next: async (updatedCase) => {
        await loading.dismiss();
        await this.showToast('Prioridad actualizada correctamente', 'success');
        this.selectedCase = updatedCase;
        this.loadData();
      },
      error: async (error) => {
        await loading.dismiss();
        await this.showAlert('Error', 'No se pudo actualizar la prioridad');
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
          this.loadData();
        });
      },
      error: async (error) => {
        await loading.dismiss();
        await this.showAlert('Error', 'No se pudo agregar la nota');
      }
    });
  }

  async deleteCase(caseItem: Case) {
    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: `¿Estás seguro de que deseas eliminar el caso "${caseItem.title}"? Esta acción no se puede deshacer.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Eliminando caso...',
              spinner: 'crescent'
            });
            await loading.present();

            this.caseService.deleteCase(caseItem.id).subscribe({
              next: async () => {
                await loading.dismiss();
                await this.showToast('Caso eliminado correctamente', 'success');
                this.closeDetailModal();
                this.loadData();
              },
              error: async (error) => {
                await loading.dismiss();
                await this.showAlert('Error', 'No se pudo eliminar el caso');
              }
            });
          }
        }
      ]
    });

    await alert.present();
  }

  getManagerName(managerId: string | undefined): string {
    if (!managerId) return 'Sin asignar';
    const manager = this.availableManagers.find(m => m.id === managerId);
    return manager ? manager.name : 'Desconocido';
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
      case 'closed': return 'danger';
      default: return 'medium';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'open': return 'Abierto';
      case 'in_progress': return 'En Progreso';
      case 'completed': return 'Completado';
      case 'closed': return 'Cerrado';
      default: return status;
    }
  }

  getManagerZone(manager: User): string {
    // Type guard to check if the user is a Manager
    if ('zone' in manager) {
      return `Zona: ${(manager as any).zone}`;
    }
    return 'Zona no asignada';
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
    this.router.navigate(['/admin/dashboard']);
  }
}
