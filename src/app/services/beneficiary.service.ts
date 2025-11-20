import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Beneficiary, ProgressUpdate } from '../models';

@Injectable({
  providedIn: 'root'
})
export class BeneficiaryService {
  private beneficiariesSubject = new BehaviorSubject<Beneficiary[]>(this.getMockBeneficiaries());
  public beneficiaries$ = this.beneficiariesSubject.asObservable();

  constructor() {}

  private getMockBeneficiaries(): Beneficiary[] {
    return [
      {
        id: 'b1',
        profileName: 'Niño Juan - Familia López',
        age: 10,
        familySize: 4,
        location: 'Madrid, España',
        situation: 'Familia monoparental con dificultades económicas. La madre trabaja limpiando casas pero el sueldo no alcanza para cubrir todas las necesidades.',
        needs: ['Material escolar', 'Alimentación', 'Ropa de invierno'],
        photo: 'assets/beneficiaries/family1.jpg',
        status: 'active',
        assignedManager: '2',
        createdAt: new Date('2024-09-01'),
        lastUpdate: new Date('2024-11-05'),
        progress: {
          education: 'Juan ha mejorado sus notas gracias al apoyo recibido. Ahora tiene todo el material necesario.',
          health: 'Buena. Revisiones médicas al día.',
          housing: 'Alquiler estable pero con dificultades para pagar algunos meses.',
          notes: 'La familia está muy agradecida por el apoyo. Juan es un niño muy aplicado.',
          updates: [
            {
              id: 'u1',
              date: new Date('2024-11-05'),
              title: 'Material escolar entregado',
              description: 'Se entregó todo el material escolar necesario para este curso. Juan está muy contento.',
              photos: ['assets/updates/update1.jpg'],
              addedBy: '2'
            },
            {
              id: 'u2',
              date: new Date('2024-10-15'),
              title: 'Mejora en las notas',
              description: 'Juan ha sacado buenas notas en el primer trimestre. Su profesora está muy contenta.',
              addedBy: '2'
            }
          ]
        }
      },
      {
        id: 'b2',
        profileName: 'Familia García',
        familySize: 5,
        location: 'Barcelona, España',
        situation: 'Familia con tres niños menores. El padre perdió su trabajo hace 6 meses y están en situación de vulnerabilidad.',
        needs: ['Alimentos básicos', 'Ropa de invierno', 'Ayuda para el alquiler'],
        photo: 'assets/beneficiaries/family2.jpg',
        status: 'active',
        assignedManager: '5',
        createdAt: new Date('2024-08-15'),
        lastUpdate: new Date('2024-11-12'),
        progress: {
          education: 'Los tres niños están escolarizados. Necesitan material escolar.',
          health: 'El hijo menor tiene asma, necesita medicación periódica.',
          housing: 'Riesgo de desahucio. Deben 2 meses de alquiler.',
          notes: 'Familia muy unida. El padre está buscando activamente trabajo.',
          updates: [
            {
              id: 'u3',
              date: new Date('2024-11-12'),
              title: 'Entrega de alimentos',
              description: 'Se entregaron alimentos básicos para un mes. La familia está muy agradecida.',
              photos: ['assets/updates/update2.jpg'],
              addedBy: '5'
            }
          ]
        }
      },
      {
        id: 'b3',
        profileName: 'Señora Ana - Familia Martínez',
        age: 65,
        familySize: 2,
        location: 'Valencia, España',
        situation: 'Pensionista con pensión mínima. Vive con su nieta de 8 años tras el fallecimiento de su hija.',
        needs: ['Ayuda alimentaria', 'Material escolar para la niña', 'Medicamentos'],
        photo: 'assets/beneficiaries/family3.jpg',
        status: 'active',
        assignedManager: '2',
        createdAt: new Date('2024-07-20'),
        lastUpdate: new Date('2024-11-18'),
        progress: {
          education: 'La niña va bien en el colegio. Es muy aplicada.',
          health: 'La Sra. Ana tiene diabetes y necesita medicación regular.',
          housing: 'Vivienda propia pero con gastos de comunidad atrasados.',
          notes: 'La Sra. Ana es una mujer muy digna. Cuida muy bien de su nieta.',
          updates: [
            {
              id: 'u4',
              date: new Date('2024-11-18'),
              title: 'Visita de seguimiento',
              description: 'Todo va bien. La nieta ha sacado muy buenas notas.',
              addedBy: '2'
            }
          ]
        }
      },
      {
        id: 'b4',
        profileName: 'Familia Rodríguez',
        familySize: 6,
        location: 'Sevilla, España',
        situation: 'Familia numerosa con cuatro hijos. Ambos padres tienen trabajos precarios con salarios bajos.',
        needs: ['Ropa para los niños', 'Alimentos', 'Apoyo escolar'],
        photo: 'assets/beneficiaries/family4.jpg',
        status: 'active',
        assignedManager: '5',
        createdAt: new Date('2024-10-01'),
        lastUpdate: new Date('2024-11-10'),
        progress: {
          education: 'Los cuatro niños van al colegio regularmente.',
          health: 'Todos están sanos.',
          housing: 'Viven en un piso de alquiler social.',
          notes: 'Padres muy trabajadores que hacen todo lo posible por sus hijos.',
          updates: []
        }
      },
      {
        id: 'b5',
        profileName: 'Niña María - Familia Fernández',
        age: 7,
        familySize: 3,
        location: 'Bilbao, España',
        situation: 'Familia refugiada llegada hace un año. Los padres no hablan bien español y tienen dificultades para encontrar trabajo.',
        needs: ['Cursos de español', 'Ropa de invierno', 'Material escolar'],
        photo: 'assets/beneficiaries/family5.jpg',
        status: 'active',
        assignedManager: '2',
        createdAt: new Date('2024-09-15'),
        lastUpdate: new Date('2024-11-01'),
        progress: {
          education: 'María se está adaptando bien al colegio y aprende rápido español.',
          health: 'Buena.',
          housing: 'Viven en un centro de acogida temporal.',
          notes: 'La familia está muy motivada para integrarse.',
          updates: [
            {
              id: 'u5',
              date: new Date('2024-11-01'),
              title: 'Progreso en el idioma',
              description: 'María ya habla bastante bien español. Sus padres también están mejorando.',
              addedBy: '2'
            }
          ]
        }
      }
    ];
  }

  getBeneficiaries(): Observable<Beneficiary[]> {
    return this.beneficiaries$;
  }

  getActiveBeneficiaries(): Observable<Beneficiary[]> {
    return of(this.beneficiariesSubject.value.filter(b => b.status === 'active')).pipe(delay(300));
  }

  getBeneficiaryById(id: string): Observable<Beneficiary | undefined> {
    return of(this.beneficiariesSubject.value.find(b => b.id === id)).pipe(delay(300));
  }

  getBeneficiariesByManager(managerId: string): Observable<Beneficiary[]> {
    return of(this.beneficiariesSubject.value.filter(b => b.assignedManager === managerId)).pipe(delay(300));
  }

  getSponsoredBeneficiaries(donorId: string): Observable<Beneficiary[]> {
    // En un caso real, esto vendría de la relación entre donantes y beneficiarios
    // Por ahora devolvemos algunos beneficiarios de ejemplo
    return of(this.beneficiariesSubject.value.slice(0, 2)).pipe(delay(300));
  }

  addProgressUpdate(beneficiaryId: string, update: Omit<ProgressUpdate, 'id'>): Observable<ProgressUpdate> {
    return new Observable(observer => {
      setTimeout(() => {
        const beneficiaries = this.beneficiariesSubject.value;
        const index = beneficiaries.findIndex(b => b.id === beneficiaryId);

        if (index !== -1) {
          const newUpdate: ProgressUpdate = {
            ...update,
            id: 'u' + Date.now()
          };

          if (!beneficiaries[index].progress) {
            beneficiaries[index].progress = {
              updates: []
            };
          }

          beneficiaries[index].progress!.updates.unshift(newUpdate);
          beneficiaries[index].lastUpdate = new Date();

          this.beneficiariesSubject.next([...beneficiaries]);
          observer.next(newUpdate);
          observer.complete();
        } else {
          observer.error({ message: 'Beneficiario no encontrado' });
        }
      }, 500);
    });
  }

  updateBeneficiaryProgress(
    beneficiaryId: string,
    progress: Partial<Beneficiary['progress']>
  ): Observable<Beneficiary> {
    return new Observable(observer => {
      setTimeout(() => {
        const beneficiaries = this.beneficiariesSubject.value;
        const index = beneficiaries.findIndex(b => b.id === beneficiaryId);

        if (index !== -1) {
          beneficiaries[index].progress = {
            ...beneficiaries[index].progress,
            ...progress,
            updates: beneficiaries[index].progress?.updates || []
          };
          beneficiaries[index].lastUpdate = new Date();

          this.beneficiariesSubject.next([...beneficiaries]);
          observer.next(beneficiaries[index]);
          observer.complete();
        } else {
          observer.error({ message: 'Beneficiario no encontrado' });
        }
      }, 500);
    });
  }

  createBeneficiary(beneficiary: Omit<Beneficiary, 'id' | 'createdAt' | 'lastUpdate'>): Observable<Beneficiary> {
    return new Observable(observer => {
      setTimeout(() => {
        const newBeneficiary: Beneficiary = {
          ...beneficiary,
          id: 'b' + (this.beneficiariesSubject.value.length + 1),
          createdAt: new Date(),
          lastUpdate: new Date()
        };

        const beneficiaries = [...this.beneficiariesSubject.value, newBeneficiary];
        this.beneficiariesSubject.next(beneficiaries);
        observer.next(newBeneficiary);
        observer.complete();
      }, 500);
    });
  }
}
