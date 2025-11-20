import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { UserRole } from './models';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  // Rutas para Donantes
  {
    path: 'donor',
    canActivate: [authGuard],
    data: { roles: [UserRole.DONOR] },
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./pages/donor/dashboard/dashboard.module').then( m => m.DashboardPageModule)
      },
      {
        path: 'donate',
        loadChildren: () => import('./pages/donor/donate/donate.module').then( m => m.DonatePageModule)
      },
      {
        path: 'impact-stories',
        loadChildren: () => import('./pages/donor/impact-stories/impact-stories.module').then( m => m.ImpactStoriesPageModule)
      },
      {
        path: 'sponsorship',
        loadChildren: () => import('./pages/donor/sponsorship/sponsorship.module').then( m => m.SponsorshipPageModule)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  // Rutas para Gestores
  {
    path: 'manager',
    canActivate: [authGuard],
    data: { roles: [UserRole.MANAGER] },
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./pages/manager/dashboard/dashboard.module').then( m => m.DashboardPageModule)
      },
      {
        path: 'deliveries',
        loadChildren: () => import('./pages/manager/deliveries/deliveries.module').then( m => m.DeliveriesPageModule)
      },
      {
        path: 'cases',
        loadChildren: () => import('./pages/manager/cases/cases.module').then( m => m.CasesPageModule)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  // Rutas para Administradores
  {
    path: 'admin',
    canActivate: [authGuard],
    data: { roles: [UserRole.ADMIN] },
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./pages/admin/dashboard/dashboard.module').then( m => m.DashboardPageModule)
      },
      {
        path: 'users',
        loadChildren: () => import('./pages/admin/users/users.module').then( m => m.UsersPageModule)
      },
      {
        path: 'reports',
        loadChildren: () => import('./pages/admin/reports/reports.module').then( m => m.ReportsPageModule)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
