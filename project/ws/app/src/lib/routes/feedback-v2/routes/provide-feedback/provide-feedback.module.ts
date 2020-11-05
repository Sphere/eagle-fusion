import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatBadgeModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatProgressSpinnerModule, MatSnackBarModule, MatTabsModule } from '@angular/material'
import { BtnContentFeedbackV2Module } from '@ws-widget/collection'
import { FeedbackApiService } from '../../apis/feedback-api.service'
import { FeedbackConfigResolver } from '../../resolvers/feedback-config.resolver'
import { FeedbackSummaryResolver } from '../../resolvers/feedback-summary.resolver'
import { ContentRequestComponent } from './components/content-request/content-request.component'
import { FeedbackComponent } from './components/feedback/feedback.component'
import { HomeComponent } from './components/home/home.component'
import { ServiceRequestComponent } from './components/service-request/service-request.component'
import { ProvideFeedbackRoutingModule } from './provide-feedback-routing.module'

@NgModule({
  declarations: [
    HomeComponent,
    FeedbackComponent,
    ContentRequestComponent,
    ServiceRequestComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ProvideFeedbackRoutingModule,
    BtnContentFeedbackV2Module,
    MatButtonModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatBadgeModule,
  ],
  providers: [FeedbackApiService, FeedbackSummaryResolver, FeedbackConfigResolver],
})
export class ProvideFeedbackModule { }
