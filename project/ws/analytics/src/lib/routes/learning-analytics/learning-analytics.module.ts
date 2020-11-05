import { CommonModule, DatePipe } from '@angular/common'
import { NgModule } from '@angular/core'
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
  MatAutocompleteModule,
  MatChipsModule,
  MatMenuModule,
  MatDialogModule,
  MatSlideToggleModule,
  MatPaginatorModule,
  MatRadioModule,
  MatNativeDateModule,
} from '@angular/material'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { BtnPageBackModule, PageModule } from '@ws-widget/collection'
import { WidgetResolverModule } from '@ws-widget/resolver'
import { ClientAnalyticsComponent } from './components/client-analytics/client-analytics.component'
import { ContentComponent } from './components/content/content.component'
import { HomeComponent } from './components/home/home.component'
import { QuarterFiltersComponent } from './components/quarter-filters/quarter-filters.component'
import { LearningAnalyticsRoutingModule } from './learning-analytics-routing.module'
import { AnalyticsComponent } from './routes/analytics/analytics.component'
import { AnalyticsDirective } from './routes/analytics/analytics.directive'
import { ContentCardComponent } from './components/content-card/content-card.component'
import { ProgressRadialComponent } from './components/progress-radial/progress-radial.component'
import { AnalyticsTileComponent } from './components/analytics-tile/analytics-tile.component'
import { QuarterServiceService } from './services/quarter-filter.service'

@NgModule({
  declarations: [
    AnalyticsComponent,
    ClientAnalyticsComponent,
    AnalyticsDirective,
    QuarterFiltersComponent,
    HomeComponent,
    ContentComponent,
    ContentCardComponent,
    ProgressRadialComponent,
    AnalyticsTileComponent,
  ],
  imports: [
    CommonModule,
    LearningAnalyticsRoutingModule,
    WidgetResolverModule,
    PageModule,
    BtnPageBackModule,

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
    MatAutocompleteModule,
    MatChipsModule,
    MatMenuModule,
    MatDialogModule,
    MatSlideToggleModule,
    MatPaginatorModule,
    MatRadioModule,
    FormsModule,
    ReactiveFormsModule,
    MatNativeDateModule,
  ],
  entryComponents: [ClientAnalyticsComponent],
  providers: [DatePipe, QuarterServiceService],
})
export class LearningAnalyticsModule { }
