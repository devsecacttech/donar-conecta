import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ImpactStoriesPageRoutingModule } from './impact-stories-routing.module';

import { ImpactStoriesPage } from './impact-stories.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ImpactStoriesPageRoutingModule
  ],
  declarations: [ImpactStoriesPage]
})
export class ImpactStoriesPageModule {}
