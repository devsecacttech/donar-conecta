import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  // Verificar rol si está especificado en la ruta
  const expectedRoles = route.data['roles'] as UserRole[];
  if (expectedRoles && !authService.hasRole(expectedRoles)) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};
