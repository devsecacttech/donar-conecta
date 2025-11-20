import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ImpactStoriesPage } from './impact-stories.page';

const routes: Routes = [
  {
    path: '',
    component: ImpactStoriesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ImpactStoriesPageRoutingModule {}
