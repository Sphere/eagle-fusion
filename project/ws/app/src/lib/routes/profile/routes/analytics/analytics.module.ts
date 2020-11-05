import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { LearningComponent } from './routes/learning/learning.component'
import { WidgetResolverModule } from '@ws-widget/resolver'
// material modules
import {
  MatButtonModule,
  MatCardModule,
  MatIconModule,
  MatListModule,
  MatRippleModule,
  MatSidenavModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
  MatGridListModule,
  MatSnackBarModule,
  MatExpansionModule,
  MatSelectModule,
  MatProgressSpinnerModule,
  MatDatepickerModule,
  MatStepperModule,
  MatTableModule,
  MatFormFieldModule,
  MatInputModule,
} from '@angular/material'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import {
  HorizontalScrollerModule,
  DefaultThumbnailModule,
  PipeLimitToModule,
} from '@ws-widget/utils'
import { TileComponent } from './components/tile/tile.component'
import { FeatureUsageComponent } from './routes/feature-usage/feature-usage.component'
import { ProgressSpinnerComponent } from './components/progress-spinner/progress-spinner.component'
import { PlansComponent } from './routes/plans/plans.component'
@NgModule({
  declarations: [
    LearningComponent,
    TileComponent,
    FeatureUsageComponent,
    ProgressSpinnerComponent,
    PlansComponent],
  imports: [
    CommonModule,
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
    MatRippleModule,
    MatSidenavModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatGridListModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatSelectModule,
    RouterModule,
    WidgetResolverModule,
    FormsModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    HorizontalScrollerModule,
    DefaultThumbnailModule,
    MatStepperModule,
    MatTableModule,
    PipeLimitToModule,
    MatFormFieldModule,
    MatInputModule,
  ],
})
export class AnalyticsModule { }
