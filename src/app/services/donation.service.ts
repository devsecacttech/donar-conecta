import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  Donation,
  DonationType,
  DonationStatus,
  InKindCategory,
  DonationRequest,
  ImpactStory
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class DonationService {
  private donationsSubject = new BehaviorSubject<Donation[]>(this.getMockDonations());
  public donations$ = this.donationsSubject.asObservable();

  private impactStoriesSubject = new BehaviorSubject<ImpactStory[]>(this.getMockImpactStories());
  public impactStories$ = this.impactStoriesSubject.asObservable();

  constructor() {}

  private getMockDonations(): Donation[] {
    return [
      {
        id: 'd1',
        donorId: '1',
        donorName: 'María García',
        type: DonationType.MONEY,
        amount: 250,
        currency: 'EUR',
        description: 'Donación para material escolar',
        category: InKindCategory.EDUCATION,
        status: DonationStatus.DELIVERED,
        assignedManagerId: '2',
        assignedManagerName: 'Carlos Rodríguez',
        beneficiaryId: 'b1',
        createdAt: new Date('2024-11-01'),
        processedAt: new Date('2024-11-02'),
        deliveredAt: new Date('2024-11-05'),
        impactStory: {
          id: 'is1',
          donationId: 'd1',
          photos: ['assets/impact/delivery1.jpg'],
          deliveryDate: new Date('2024-11-05'),
          location: 'Madrid, España',
          managerId: '2',
          managerName: 'Carlos Rodríguez',
          beneficiaryMessage: '¡Muchas gracias! Los niños están muy contentos con sus nuevos cuadernos y lápices.',
          description: 'Se entregaron mochilas, cuadernos, lápices y material escolar a la familia López.',
          views: 45
        }
      },
      {
        id: 'd2',
        donorId: '4',
        donorName: 'Pedro López',
        type: DonationType.IN_KIND,
        description: 'Donación de ropa de invierno',
        category: InKindCategory.CLOTHING,
        items: [
          { name: 'Abrigos', quantity: 5, unit: 'unidades', estimatedValue: 150 },
          { name: 'Mantas', quantity: 3, unit: 'unidades', estimatedValue: 75 },
          { name: 'Bufandas', quantity: 8, unit: 'unidades', estimatedValue: 40 }
        ],
        status: DonationStatus.IN_PROCESS,
        assignedManagerId: '5',
        assignedManagerName: 'Laura Sánchez',
        beneficiaryId: 'b2',
        createdAt: new Date('2024-11-15'),
        processedAt: new Date('2024-11-16')
      },
      {
        id: 'd3',
        donorId: '1',
        donorName: 'María García',
        type: DonationType.SPONSORSHIP,
        amount: 50,
        currency: 'EUR',
        description: 'Apadrinamiento mensual para educación',
        category: InKindCategory.EDUCATION,
        status: DonationStatus.DELIVERED,
        assignedManagerId: '2',
        assignedManagerName: 'Carlos Rodríguez',
        beneficiaryId: 'b1',
        createdAt: new Date('2024-10-01'),
        deliveredAt: new Date('2024-10-05'),
        recurring: {
          frequency: 'monthly',
          nextDonationDate: new Date('2024-12-01'),
          active: true
        }
      },
      {
        id: 'd4',
        donorId: '4',
        donorName: 'Pedro López',
        type: DonationType.IN_KIND,
        description: 'Alimentos no perecederos',
        category: InKindCategory.FOOD,
        items: [
          { name: 'Arroz', quantity: 10, unit: 'kg', estimatedValue: 15 },
          { name: 'Pasta', quantity: 8, unit: 'kg', estimatedValue: 12 },
          { name: 'Aceite', quantity: 4, unit: 'litros', estimatedValue: 20 },
          { name: 'Conservas', quantity: 20, unit: 'latas', estimatedValue: 30 }
        ],
        status: DonationStatus.DELIVERED,
        assignedManagerId: '2',
        assignedManagerName: 'Carlos Rodríguez',
        beneficiaryId: 'b3',
        createdAt: new Date('2024-11-10'),
        processedAt: new Date('2024-11-11'),
        deliveredAt: new Date('2024-11-12'),
        impactStory: {
          id: 'is2',
          donationId: 'd4',
          photos: ['assets/impact/delivery2.jpg', 'assets/impact/delivery2b.jpg'],
          deliveryDate: new Date('2024-11-12'),
          location: 'Barcelona, España',
          managerId: '2',
          managerName: 'Carlos Rodríguez',
          beneficiaryMessage: 'Estamos muy agradecidos por esta ayuda que tanto necesitábamos.',
          description: 'Entrega de alimentos básicos a la familia García. La despensa ahora está bien surtida para el mes.',
          views: 32
        }
      },
      {
        id: 'd5',
        donorId: '1',
        donorName: 'María García',
        type: DonationType.MONEY,
        amount: 100,
        currency: 'EUR',
        description: 'Donación para medicinas',
        category: InKindCategory.HEALTH,
        status: DonationStatus.PENDING,
        createdAt: new Date('2024-11-18')
      }
    ];
  }

  private getMockImpactStories(): ImpactStory[] {
    return [
      {
        id: 'is1',
        donationId: 'd1',
        photos: ['assets/impact/delivery1.jpg'],
        deliveryDate: new Date('2024-11-05'),
        location: 'Madrid, España',
        managerId: '2',
        managerName: 'Carlos Rodríguez',
        beneficiaryMessage: '¡Muchas gracias! Los niños están muy contentos con sus nuevos cuadernos y lápices.',
        description: 'Se entregaron mochilas, cuadernos, lápices y material escolar a la familia López.',
        views: 45
      },
      {
        id: 'is2',
        donationId: 'd4',
        photos: ['assets/impact/delivery2.jpg', 'assets/impact/delivery2b.jpg'],
        deliveryDate: new Date('2024-11-12'),
        location: 'Barcelona, España',
        managerId: '2',
        managerName: 'Carlos Rodríguez',
        beneficiaryMessage: 'Estamos muy agradecidos por esta ayuda que tanto necesitábamos.',
        description: 'Entrega de alimentos básicos a la familia García. La despensa ahora está bien surtida para el mes.',
        views: 32
      },
      {
        id: 'is3',
        donationId: 'd3',
        photos: ['assets/impact/delivery3.jpg'],
        deliveryDate: new Date('2024-10-05'),
        location: 'Madrid, España',
        managerId: '2',
        managerName: 'Carlos Rodríguez',
        beneficiaryMessage: 'Juan está muy emocionado de poder seguir estudiando. ¡Gracias!',
        description: 'Pago de matrícula escolar para Juan. Podrá continuar sus estudios este curso.',
        views: 28
      }
    ];
  }

  getDonations(): Observable<Donation[]> {
    return this.donations$;
  }

  getDonationsByDonor(donorId: string): Observable<Donation[]> {
    return of(this.donationsSubject.value.filter(d => d.donorId === donorId)).pipe(delay(300));
  }

  getDonationsByManager(managerId: string): Observable<Donation[]> {
    return of(this.donationsSubject.value.filter(d => d.assignedManagerId === managerId)).pipe(delay(300));
  }

  getDonationsByBeneficiary(beneficiaryId: string): Observable<Donation[]> {
    return of(this.donationsSubject.value.filter(d => d.beneficiaryId === beneficiaryId)).pipe(delay(300));
  }

  getDonationById(id: string): Observable<Donation | undefined> {
    return of(this.donationsSubject.value.find(d => d.id === id)).pipe(delay(300));
  }

  createDonation(request: DonationRequest, donorId: string, donorName: string): Observable<Donation> {
    return new Observable(observer => {
      setTimeout(() => {
        const newDonation: Donation = {
          id: 'd' + (this.donationsSubject.value.length + 1),
          donorId,
          donorName,
          type: request.type,
          amount: request.amount,
          currency: request.amount ? 'EUR' : undefined,
          description: request.description,
          category: request.category,
          items: request.items,
          beneficiaryId: request.beneficiaryId,
          status: DonationStatus.PENDING,
          createdAt: new Date(),
          recurring: request.isRecurring ? {
            frequency: request.recurringFrequency || 'monthly',
            nextDonationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            active: true
          } : undefined
        };

        const donations = [...this.donationsSubject.value, newDonation];
        this.donationsSubject.next(donations);
        observer.next(newDonation);
        observer.complete();
      }, 500);
    });
  }

  updateDonationStatus(donationId: string, status: DonationStatus, managerId?: string, managerName?: string): Observable<Donation> {
    return new Observable(observer => {
      setTimeout(() => {
        const donations = this.donationsSubject.value;
        const index = donations.findIndex(d => d.id === donationId);

        if (index !== -1) {
          const updatedDonation = { ...donations[index] };
          updatedDonation.status = status;

          if (managerId && managerName) {
            updatedDonation.assignedManagerId = managerId;
            updatedDonation.assignedManagerName = managerName;
          }

          if (status === DonationStatus.IN_PROCESS && !updatedDonation.processedAt) {
            updatedDonation.processedAt = new Date();
          }

          if (status === DonationStatus.DELIVERED) {
            updatedDonation.deliveredAt = new Date();
          }

          donations[index] = updatedDonation;
          this.donationsSubject.next([...donations]);
          observer.next(updatedDonation);
          observer.complete();
        } else {
          observer.error({ message: 'Donación no encontrada' });
        }
      }, 500);
    });
  }

  getImpactStories(): Observable<ImpactStory[]> {
    return this.impactStories$;
  }

  getImpactStoriesByDonor(donorId: string): Observable<ImpactStory[]> {
    const donations = this.donationsSubject.value.filter(d => d.donorId === donorId);
    const stories = this.impactStoriesSubject.value.filter(s =>
      donations.some(d => d.id === s.donationId)
    );
    return of(stories).pipe(delay(300));
  }

  createImpactStory(
    donationId: string,
    photos: string[],
    description: string,
    beneficiaryMessage: string,
    location: string,
    managerId: string,
    managerName: string
  ): Observable<ImpactStory> {
    return new Observable(observer => {
      setTimeout(() => {
        const newStory: ImpactStory = {
          id: 'is' + (this.impactStoriesSubject.value.length + 1),
          donationId,
          photos,
          deliveryDate: new Date(),
          location,
          managerId,
          managerName,
          beneficiaryMessage,
          description,
          views: 0
        };

        const stories = [...this.impactStoriesSubject.value, newStory];
        this.impactStoriesSubject.next(stories);

        // Actualizar la donación con la historia de impacto
        const donations = this.donationsSubject.value;
        const donationIndex = donations.findIndex(d => d.id === donationId);
        if (donationIndex !== -1) {
          donations[donationIndex].impactStory = newStory;
          donations[donationIndex].status = DonationStatus.DELIVERED;
          donations[donationIndex].deliveredAt = new Date();
          this.donationsSubject.next([...donations]);
        }

        observer.next(newStory);
        observer.complete();
      }, 500);
    });
  }

  incrementStoryViews(storyId: string): void {
    const stories = this.impactStoriesSubject.value;
    const index = stories.findIndex(s => s.id === storyId);
    if (index !== -1) {
      stories[index].views++;
      this.impactStoriesSubject.next([...stories]);
    }
  }
}
