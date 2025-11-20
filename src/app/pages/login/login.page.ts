import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { UserRole } from '../../models';

@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  email: string = '';
  password: string = '';

  // Usuarios de demostración
  demoUsers = [
    { role: 'Donante', email: 'maria@donor.com', name: 'María García' },
    { role: 'Donante', email: 'pedro@donor.com', name: 'Pedro López' },
    { role: 'Gestor', email: 'carlos@manager.com', name: 'Carlos Rodríguez' },
    { role: 'Gestor', email: 'laura@manager.com', name: 'Laura Sánchez' },
    { role: 'Admin', email: 'ana@admin.com', name: 'Ana Martínez' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    // Si ya está autenticado, redirigir al dashboard correspondiente
    if (this.authService.isAuthenticated()) {
      this.redirectToDashboard();
    }
  }

  async login() {
    if (!this.email || !this.password) {
      await this.showAlert('Error', 'Por favor ingresa email y contraseña');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Iniciando sesión...',
      spinner: 'crescent'
    });
    await loading.present();

    this.authService.login(this.email, this.password).subscribe({
      next: async (user) => {
        await loading.dismiss();
        await this.showAlert('¡Bienvenido!', `Hola ${user.name}`);
        this.redirectToDashboard();
      },
      error: async (error) => {
        await loading.dismiss();
        await this.showAlert('Error de autenticación', error.message);
      }
    });
  }

  async loginAsDemo(email: string) {
    this.email = email;
    this.password = 'demo123';
    await this.login();
  }

  private redirectToDashboard() {
    const user = this.authService.currentUserValue;
    if (!user) return;

    switch (user.role) {
      case UserRole.DONOR:
        this.router.navigate(['/donor/dashboard']);
        break;
      case UserRole.MANAGER:
        this.router.navigate(['/manager/dashboard']);
        break;
      case UserRole.ADMIN:
        this.router.navigate(['/admin/dashboard']);
        break;
      default:
        this.router.navigate(['/home']);
    }
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
