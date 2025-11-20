import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { AuthService } from '../../../services';
import { User, UserRole, Donor, Manager, Admin } from '../../../models';

interface UserStats {
  totalUsers: number;
  donors: number;
  managers: number;
  admins: number;
  beneficiaries: number;
}

@Component({
  standalone: false,
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
})
export class UsersPage implements OnInit {
  allUsers: User[] = [];
  filteredUsers: User[] = [];
  selectedRole: string = 'all';
  searchTerm: string = '';
  loading: boolean = true;
  stats: UserStats | null = null;

  // Para el modal de detalles
  showDetailsModal: boolean = false;
  selectedUser: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  ionViewWillEnter() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;

    // En un sistema real, esto vendría de un UserService
    // Por ahora, accedemos a los mock users del AuthService
    // Simulamos una llamada async
    setTimeout(() => {
      this.allUsers = this.getMockUsers();
      this.calculateStats();
      this.filterUsers();
      this.loading = false;
    }, 500);
  }

  private getMockUsers(): User[] {
    // Mock users - en producción vendría de un servicio
    return [
      {
        id: '1',
        name: 'María García',
        email: 'maria@donor.com',
        role: UserRole.DONOR,
        avatar: 'assets/avatars/maria.jpg',
        phone: '+34 600 000 001',
        createdAt: new Date('2024-01-15'),
        totalDonated: 5420,
        donationCount: 28,
        sponsoredBeneficiaries: ['b1', 'b2'],
        preferredCategories: ['education', 'food']
      } as Donor,
      {
        id: '2',
        name: 'Carlos Rodríguez',
        email: 'carlos@manager.com',
        role: UserRole.MANAGER,
        avatar: 'assets/avatars/carlos.jpg',
        phone: '+34 600 000 002',
        createdAt: new Date('2023-11-10'),
        assignedCases: ['c1', 'c2', 'c3'],
        completedDeliveries: 156,
        activeDeliveries: 8,
        zone: 'Madrid Centro'
      } as Manager,
      {
        id: '3',
        name: 'Ana Martínez',
        email: 'ana@admin.com',
        role: UserRole.ADMIN,
        avatar: 'assets/avatars/ana.jpg',
        phone: '+34 600 000 003',
        createdAt: new Date('2023-06-01'),
        permissions: ['all']
      } as Admin,
      {
        id: '4',
        name: 'Pedro López',
        email: 'pedro@donor.com',
        role: UserRole.DONOR,
        avatar: 'assets/avatars/pedro.jpg',
        phone: '+34 600 000 004',
        createdAt: new Date('2024-03-20'),
        totalDonated: 2150,
        donationCount: 12,
        sponsoredBeneficiaries: ['b3'],
        preferredCategories: ['health', 'clothing']
      } as Donor,
      {
        id: '5',
        name: 'Laura Sánchez',
        email: 'laura@manager.com',
        role: UserRole.MANAGER,
        avatar: 'assets/avatars/laura.jpg',
        phone: '+34 600 000 005',
        createdAt: new Date('2023-08-15'),
        assignedCases: ['c4', 'c5'],
        completedDeliveries: 89,
        activeDeliveries: 5,
        zone: 'Barcelona Sur'
      } as Manager,
      {
        id: '6',
        name: 'Javier Fernández',
        email: 'javier@donor.com',
        role: UserRole.DONOR,
        avatar: 'assets/avatars/javier.jpg',
        phone: '+34 600 000 006',
        createdAt: new Date('2024-05-10'),
        totalDonated: 850,
        donationCount: 5,
        sponsoredBeneficiaries: [],
        preferredCategories: ['food']
      } as Donor,
      {
        id: '7',
        name: 'Carmen Díaz',
        email: 'carmen@manager.com',
        role: UserRole.MANAGER,
        avatar: 'assets/avatars/carmen.jpg',
        phone: '+34 600 000 007',
        createdAt: new Date('2024-02-01'),
        assignedCases: ['c6'],
        completedDeliveries: 42,
        activeDeliveries: 3,
        zone: 'Valencia Este'
      } as Manager
    ];
  }

  private calculateStats() {
    this.stats = {
      totalUsers: this.allUsers.length,
      donors: this.allUsers.filter(u => u.role === UserRole.DONOR).length,
      managers: this.allUsers.filter(u => u.role === UserRole.MANAGER).length,
      admins: this.allUsers.filter(u => u.role === UserRole.ADMIN).length,
      beneficiaries: this.allUsers.filter(u => u.role === UserRole.BENEFICIARY).length
    };
  }

  onRoleFilterChange(event: any) {
    this.selectedRole = event.detail.value;
    this.filterUsers();
  }

  onSearchChange(event: any) {
    this.searchTerm = event.detail.value;
    this.filterUsers();
  }

  filterUsers() {
    let filtered = [...this.allUsers];

    // Filtrar por rol
    if (this.selectedRole !== 'all') {
      filtered = filtered.filter(u => u.role === this.selectedRole);
    }

    // Filtrar por término de búsqueda
    if (this.searchTerm && this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(u =>
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        (u.phone && u.phone.includes(term))
      );
    }

    this.filteredUsers = filtered;
  }

  getRoleName(role: UserRole): string {
    const roles: { [key in UserRole]: string } = {
      [UserRole.DONOR]: 'Donante',
      [UserRole.MANAGER]: 'Gestor',
      [UserRole.ADMIN]: 'Administrador',
      [UserRole.BENEFICIARY]: 'Beneficiario'
    };
    return roles[role] || role;
  }

  getRoleColor(role: UserRole): string {
    const colors: { [key in UserRole]: string } = {
      [UserRole.DONOR]: 'success',
      [UserRole.MANAGER]: 'primary',
      [UserRole.ADMIN]: 'danger',
      [UserRole.BENEFICIARY]: 'warning'
    };
    return colors[role] || 'medium';
  }

  getRoleIcon(role: UserRole): string {
    const icons: { [key in UserRole]: string } = {
      [UserRole.DONOR]: 'heart',
      [UserRole.MANAGER]: 'briefcase',
      [UserRole.ADMIN]: 'shield-checkmark',
      [UserRole.BENEFICIARY]: 'people'
    };
    return icons[role] || 'person';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-EC', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  viewUserDetails(user: User) {
    this.selectedUser = user;
    this.showDetailsModal = true;
  }

  closeDetailsModal() {
    this.showDetailsModal = false;
    this.selectedUser = null;
  }

  async showDeleteConfirmation(user: User) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de que deseas eliminar al usuario ${user.name}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.deleteUser(user);
          }
        }
      ]
    });

    await alert.present();
  }

  private async deleteUser(user: User) {
    // Simulación de eliminación
    this.allUsers = this.allUsers.filter(u => u.id !== user.id);
    this.calculateStats();
    this.filterUsers();

    const toast = await this.toastController.create({
      message: `Usuario ${user.name} eliminado correctamente`,
      duration: 2000,
      position: 'bottom',
      color: 'success'
    });
    await toast.present();
  }

  isDonor(user: User): user is Donor {
    return user.role === UserRole.DONOR;
  }

  isManager(user: User): user is Manager {
    return user.role === UserRole.MANAGER;
  }

  isAdmin(user: User): user is Admin {
    return user.role === UserRole.ADMIN;
  }

  goBack() {
    this.router.navigate(['/admin/dashboard']);
  }
}
