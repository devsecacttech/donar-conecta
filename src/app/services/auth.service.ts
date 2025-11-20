import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User, UserRole, Donor, Manager, Admin } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  // Mock users para demo - Ecuador
  private mockUsers: User[] = [
    {
      id: '1',
      name: 'María Quishpe',
      email: 'maria@donor.com',
      role: UserRole.DONOR,
      avatar: 'assets/avatars/maria.jpg',
      phone: '+593 98 765 4321',
      createdAt: new Date('2024-01-15'),
      totalDonated: 5420,
      donationCount: 28,
      sponsoredBeneficiaries: ['b1', 'b2'],
      preferredCategories: ['education', 'food']
    } as Donor,
    {
      id: '2',
      name: 'Carlos Ponce',
      email: 'carlos@manager.com',
      role: UserRole.MANAGER,
      avatar: 'assets/avatars/carlos.jpg',
      phone: '+593 98 123 4567',
      createdAt: new Date('2023-11-10'),
      assignedCases: ['c1', 'c2', 'c3'],
      completedDeliveries: 156,
      activeDeliveries: 8,
      zone: 'Quito Centro'
    } as Manager,
    {
      id: '3',
      name: 'Ana Villavicencio',
      email: 'ana@admin.com',
      role: UserRole.ADMIN,
      avatar: 'assets/avatars/ana.jpg',
      phone: '+593 99 234 5678',
      createdAt: new Date('2023-06-01'),
      permissions: ['all']
    } as Admin,
    {
      id: '4',
      name: 'Pedro Morales',
      email: 'pedro@donor.com',
      role: UserRole.DONOR,
      avatar: 'assets/avatars/pedro.jpg',
      phone: '+593 98 345 6789',
      createdAt: new Date('2024-03-20'),
      totalDonated: 2150,
      donationCount: 12,
      sponsoredBeneficiaries: ['b3'],
      preferredCategories: ['health', 'clothing']
    } as Donor,
    {
      id: '5',
      name: 'Laura Zambrano',
      email: 'laura@manager.com',
      role: UserRole.MANAGER,
      avatar: 'assets/avatars/laura.jpg',
      phone: '+593 99 456 7890',
      createdAt: new Date('2023-08-15'),
      assignedCases: ['c4', 'c5'],
      completedDeliveries: 89,
      activeDeliveries: 5,
      zone: 'Guayaquil Norte'
    } as Manager
  ];

  constructor() {
    const storedUser = localStorage.getItem('currentUser');
    const user = storedUser ? JSON.parse(storedUser) : null;
    this.currentUserSubject = new BehaviorSubject<User | null>(user);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<User> {
    return new Observable(observer => {
      // Mock authentication - en producción esto sería una llamada HTTP
      setTimeout(() => {
        const user = this.mockUsers.find(u => u.email === email);

        if (user && password === 'demo123') {
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          observer.next(user);
          observer.complete();
        } else {
          observer.error({ message: 'Usuario o contraseña incorrectos' });
        }
      }, 500);
    });
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return this.currentUserValue !== null;
  }

  hasRole(roles: UserRole[]): boolean {
    const user = this.currentUserValue;
    return user ? roles.includes(user.role) : false;
  }

  getUsersByRole(role: UserRole): User[] {
    return this.mockUsers.filter(u => u.role === role);
  }
}
