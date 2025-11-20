import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImpactStoriesPage } from './impact-stories.page';

describe('ImpactStoriesPage', () => {
  let component: ImpactStoriesPage;
  let fixture: ComponentFixture<ImpactStoriesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ImpactStoriesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
