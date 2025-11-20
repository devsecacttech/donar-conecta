import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { AuthService, DonationService } from '../../../services';
import { ImpactStory } from '../../../models';

@Component({
  standalone: false,
  selector: 'app-impact-stories',
  templateUrl: './impact-stories.page.html',
  styleUrls: ['./impact-stories.page.scss'],
})
export class ImpactStoriesPage implements OnInit {
  allStories: ImpactStory[] = [];
  filteredStories: ImpactStory[] = [];
  myStories: ImpactStory[] = [];
  selectedSegment: 'all' | 'my' = 'my';
  loading: boolean = true;

  constructor(
    private authService: AuthService,
    private donationService: DonationService,
    private router: Router,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.loadStories();
  }

  ionViewWillEnter() {
    this.loadStories();
  }

  loadStories() {
    this.loading = true;
    const user = this.authService.currentUserValue;

    // Cargar todas las historias
    this.donationService.getImpactStories().subscribe(stories => {
      this.allStories = stories.sort((a, b) =>
        b.deliveryDate.getTime() - a.deliveryDate.getTime()
      );
      this.filteredStories = [...this.allStories];
    });

    // Cargar mis historias
    if (user) {
      this.donationService.getImpactStoriesByDonor(user.id).subscribe(stories => {
        this.myStories = stories.sort((a, b) =>
          b.deliveryDate.getTime() - a.deliveryDate.getTime()
        );
        this.loading = false;
      });
    }
  }

  onSegmentChange(event: any) {
    this.selectedSegment = event.detail.value;
  }

  getDisplayedStories(): ImpactStory[] {
    return this.selectedSegment === 'my' ? this.myStories : this.filteredStories;
  }

  viewStoryDetail(story: ImpactStory) {
    // Incrementar vistas
    this.donationService.incrementStoryViews(story.id);

    // En una implementación completa, abriríamos un modal con más detalles
    // Por ahora, mostraremos un alert básico
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-EC', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  goBack() {
    this.router.navigate(['/donor/dashboard']);
  }
}
