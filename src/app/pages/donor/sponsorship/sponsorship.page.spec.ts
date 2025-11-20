import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SponsorshipPage } from './sponsorship.page';

describe('SponsorshipPage', () => {
  let component: SponsorshipPage;
  let fixture: ComponentFixture<SponsorshipPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SponsorshipPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
