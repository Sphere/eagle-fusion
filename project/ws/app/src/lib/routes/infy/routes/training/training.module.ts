import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatToolbarModule } from '@angular/material'

import { BtnPageBackModule } from '@ws-widget/collection'

import { TrainingRoutingModule } from './training-routing.module'
import { HomeComponent } from './components/home/home.component'
import { TrainingTypeComponent } from './components/training-type/training-type.component'

@NgModule({
  declarations: [HomeComponent, TrainingTypeComponent],
  imports: [CommonModule, TrainingRoutingModule, MatToolbarModule, BtnPageBackModule],
  exports: [TrainingTypeComponent],
})
export class TrainingModule {}
