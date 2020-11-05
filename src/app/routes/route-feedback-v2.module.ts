import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FeedbackV2Module } from '@ws/app'

@NgModule({
  imports: [CommonModule, FeedbackV2Module],
  exports: [FeedbackV2Module],
})
export class RouteFeedbackV2Module {}
