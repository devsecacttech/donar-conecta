import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SponsorshipPage } from './sponsorship.page';

const routes: Routes = [
  {
    path: '',
    component: SponsorshipPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SponsorshipPageRoutingModule {}
