import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Case, CaseStatus, CasePriority, CaseNote } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CaseService {
  private casesSubject = new BehaviorSubject<Case[]>(this.getMockCases());
  public cases$ = this.casesSubject.asObservable();

  constructor() {}

  private getMockCases(): Case[] {
    return [
      {
        id: 'c1',
        title: 'Material escolar urgente - Familia López',
        beneficiaryId: 'b1',
        beneficiaryName: 'Niño Juan - Familia López',
        description: 'Niño de 10 años necesita material escolar para el nuevo curso. La familia no puede costearlo.',
        priority: CasePriority.HIGH,
        status: CaseStatus.COMPLETED,
        assignedManagerId: '2',
        assignedManagerName: 'Carlos Rodríguez',
        createdAt: new Date('2024-10-15'),
        updatedAt: new Date('2024-11-05'),
        completedAt: new Date('2024-11-05'),
        requiredDonations: [
          {
            category: 'Material escolar',
            description: 'Cuadernos, lápices, mochilas',
            estimatedCost: 150,
            fulfilled: true
          }
        ],
        receivedDonations: ['d1'],
        photos: ['assets/cases/case1.jpg'],
        notes: [
          {
            id: 'n1',
            authorId: '2',
            authorName: 'Carlos Rodríguez',
            content: 'Material entregado con éxito. La familia muy agradecida.',
            createdAt: new Date('2024-11-05')
          }
        ]
      },
      {
        id: 'c2',
        title: 'Ayuda alimentaria - Familia García',
        beneficiaryId: 'b2',
        beneficiaryName: 'Familia García',
        description: 'Familia de 5 miembros en situación de vulnerabilidad necesita alimentos básicos.',
        priority: CasePriority.URGENT,
        status: CaseStatus.IN_PROGRESS,
        assignedManagerId: '5',
        assignedManagerName: 'Laura Sánchez',
        createdAt: new Date('2024-11-10'),
        updatedAt: new Date('2024-11-12'),
        requiredDonations: [
          {
            category: 'Alimentos',
            description: 'Arroz, pasta, aceite, conservas',
            estimatedCost: 100,
            fulfilled: true
          },
          {
            category: 'Productos de higiene',
            description: 'Jabón, champú, pasta dental',
            estimatedCost: 50,
            fulfilled: false
          }
        ],
        receivedDonations: ['d4'],
        photos: ['assets/cases/case2.jpg'],
        notes: [
          {
            id: 'n2',
            authorId: '5',
            authorName: 'Laura Sánchez',
            content: 'Alimentos entregados. Aún necesitan productos de higiene.',
            createdAt: new Date('2024-11-12')
          }
        ]
      },
      {
        id: 'c3',
        title: 'Medicamentos - Sra. Ana',
        beneficiaryId: 'b3',
        beneficiaryName: 'Señora Ana - Familia Martínez',
        description: 'Pensionista con diabetes necesita ayuda para medicación mensual.',
        priority: CasePriority.HIGH,
        status: CaseStatus.IN_PROGRESS,
        assignedManagerId: '2',
        assignedManagerName: 'Carlos Rodríguez',
        createdAt: new Date('2024-11-15'),
        updatedAt: new Date('2024-11-18'),
        requiredDonations: [
          {
            category: 'Medicamentos',
            description: 'Insulina y medidor de glucosa',
            estimatedCost: 80,
            fulfilled: false
          }
        ],
        receivedDonations: [],
        photos: [],
        notes: [
          {
            id: 'n3',
            authorId: '2',
            authorName: 'Carlos Rodríguez',
            content: 'Contactado con farmacia solidaria. Pendiente de donación.',
            createdAt: new Date('2024-11-18')
          }
        ]
      },
      {
        id: 'c4',
        title: 'Ropa de invierno - Familia Rodríguez',
        beneficiaryId: 'b4',
        beneficiaryName: 'Familia Rodríguez',
        description: 'Familia numerosa necesita ropa de invierno para los 4 niños.',
        priority: CasePriority.MEDIUM,
        status: CaseStatus.OPEN,
        createdAt: new Date('2024-11-18'),
        updatedAt: new Date('2024-11-18'),
        requiredDonations: [
          {
            category: 'Ropa de invierno',
            description: 'Abrigos, pantalones, zapatos para niños de 5, 8, 10 y 12 años',
            estimatedCost: 200,
            fulfilled: false
          }
        ],
        receivedDonations: [],
        photos: ['assets/cases/case4.jpg']
      },
      {
        id: 'c5',
        title: 'Clases de español - Familia Fernández',
        beneficiaryId: 'b5',
        beneficiaryName: 'Niña María - Familia Fernández',
        description: 'Familia refugiada necesita clases de español para integrarse mejor.',
        priority: CasePriority.MEDIUM,
        status: CaseStatus.OPEN,
        createdAt: new Date('2024-11-16'),
        updatedAt: new Date('2024-11-16'),
        requiredDonations: [
          {
            category: 'Educación',
            description: 'Clases de español para adultos',
            estimatedCost: 150,
            fulfilled: false
          }
        ],
        receivedDonations: [],
        photos: []
      }
    ];
  }

  getCases(): Observable<Case[]> {
    return this.cases$;
  }

  // Admin method: Get all cases in the system
  getAllCases(): Observable<Case[]> {
    return of(this.casesSubject.value).pipe(delay(300));
  }

  getCaseById(id: string): Observable<Case | undefined> {
    return of(this.casesSubject.value.find(c => c.id === id)).pipe(delay(300));
  }

  getCasesByManager(managerId: string): Observable<Case[]> {
    return of(this.casesSubject.value.filter(c => c.assignedManagerId === managerId)).pipe(delay(300));
  }

  getCasesByBeneficiary(beneficiaryId: string): Observable<Case[]> {
    return of(this.casesSubject.value.filter(c => c.beneficiaryId === beneficiaryId)).pipe(delay(300));
  }

  getCasesByStatus(status: CaseStatus): Observable<Case[]> {
    return of(this.casesSubject.value.filter(c => c.status === status)).pipe(delay(300));
  }

  createCase(caseData: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>): Observable<Case> {
    return new Observable(observer => {
      setTimeout(() => {
        const newCase: Case = {
          ...caseData,
          id: 'c' + (this.casesSubject.value.length + 1),
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const cases = [...this.casesSubject.value, newCase];
        this.casesSubject.next(cases);
        observer.next(newCase);
        observer.complete();
      }, 500);
    });
  }

  updateCaseStatus(caseId: string, status: CaseStatus): Observable<Case> {
    return new Observable(observer => {
      setTimeout(() => {
        const cases = this.casesSubject.value;
        const index = cases.findIndex(c => c.id === caseId);

        if (index !== -1) {
          cases[index].status = status;
          cases[index].updatedAt = new Date();

          if (status === CaseStatus.COMPLETED) {
            cases[index].completedAt = new Date();
          }

          this.casesSubject.next([...cases]);
          observer.next(cases[index]);
          observer.complete();
        } else {
          observer.error({ message: 'Caso no encontrado' });
        }
      }, 500);
    });
  }

  updateCasePriority(caseId: string, priority: CasePriority): Observable<Case> {
    return new Observable(observer => {
      setTimeout(() => {
        const cases = this.casesSubject.value;
        const index = cases.findIndex(c => c.id === caseId);

        if (index !== -1) {
          cases[index].priority = priority;
          cases[index].updatedAt = new Date();

          this.casesSubject.next([...cases]);
          observer.next(cases[index]);
          observer.complete();
        } else {
          observer.error({ message: 'Caso no encontrado' });
        }
      }, 500);
    });
  }

  deleteCase(caseId: string): Observable<boolean> {
    return new Observable(observer => {
      setTimeout(() => {
        const cases = this.casesSubject.value;
        const index = cases.findIndex(c => c.id === caseId);

        if (index !== -1) {
          cases.splice(index, 1);
          this.casesSubject.next([...cases]);
          observer.next(true);
          observer.complete();
        } else {
          observer.error({ message: 'Caso no encontrado' });
        }
      }, 500);
    });
  }

  assignManager(caseId: string, managerId: string, managerName: string): Observable<Case> {
    return new Observable(observer => {
      setTimeout(() => {
        const cases = this.casesSubject.value;
        const index = cases.findIndex(c => c.id === caseId);

        if (index !== -1) {
          cases[index].assignedManagerId = managerId;
          cases[index].assignedManagerName = managerName;
          cases[index].status = CaseStatus.IN_PROGRESS;
          cases[index].updatedAt = new Date();

          this.casesSubject.next([...cases]);
          observer.next(cases[index]);
          observer.complete();
        } else {
          observer.error({ message: 'Caso no encontrado' });
        }
      }, 500);
    });
  }

  addNote(caseId: string, note: Omit<CaseNote, 'id' | 'createdAt'>): Observable<CaseNote> {
    return new Observable(observer => {
      setTimeout(() => {
        const cases = this.casesSubject.value;
        const index = cases.findIndex(c => c.id === caseId);

        if (index !== -1) {
          const newNote: CaseNote = {
            ...note,
            id: 'n' + Date.now(),
            createdAt: new Date()
          };

          if (!cases[index].notes) {
            cases[index].notes = [];
          }

          cases[index].notes!.unshift(newNote);
          cases[index].updatedAt = new Date();

          this.casesSubject.next([...cases]);
          observer.next(newNote);
          observer.complete();
        } else {
          observer.error({ message: 'Caso no encontrado' });
        }
      }, 500);
    });
  }

  addDonationToCase(caseId: string, donationId: string): Observable<Case> {
    return new Observable(observer => {
      setTimeout(() => {
        const cases = this.casesSubject.value;
        const index = cases.findIndex(c => c.id === caseId);

        if (index !== -1) {
          cases[index].receivedDonations.push(donationId);
          cases[index].updatedAt = new Date();

          this.casesSubject.next([...cases]);
          observer.next(cases[index]);
          observer.complete();
        } else {
          observer.error({ message: 'Caso no encontrado' });
        }
      }, 500);
    });
  }
}
