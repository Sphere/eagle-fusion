import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatToolbarModule } from '@angular/material'

import { BtnPageBackModule } from '@ws-widget/collection'

import { FeedbackV2RoutingModule } from './feedback-v2-routing.module'
import { HomeComponent } from './components/home/home.component'

@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    FeedbackV2RoutingModule,
    BtnPageBackModule,
    MatToolbarModule,
  ],
})
export class FeedbackV2Module { }
