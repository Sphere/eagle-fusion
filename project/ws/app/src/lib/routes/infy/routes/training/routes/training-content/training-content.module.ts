import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
  MatDividerModule,
  MatButtonModule,
  MatIconModule,
  MatMenuModule,
  MatCardModule,
  MatDialogModule,
  MatFormFieldModule,
  MatSelectModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatInputModule,
  MatCheckboxModule,
  MatProgressSpinnerModule,
  MatBadgeModule,
  MatTooltipModule,
  MatChipsModule,
} from '@angular/material'

import { DisplayContentTypeModule, UserAutocompleteModule } from '@ws-widget/collection'
import { PipeConciseDateRangeModule } from '@ws-widget/utils'

import { TrainingContentRoutingModule } from './training-content-routing.module'
import { HomeComponent } from './components/home/home.component'
import { TrainingHeaderComponent } from './components/training-header/training-header.component'
import { TrainingsListComponent } from './components/trainings-list/trainings-list.component'
import { TrainingDetailsComponent } from './components/training-details/training-details.component'
import { TrainingsRegisteredComponent } from './components/trainings-registered/trainings-registered.component'
import { TrainingCardComponent } from './components/training-card/training-card.component'
import { TrainingsUpcomingComponent } from './components/trainings-upcoming/trainings-upcoming.component'
import { TrainingFilterDialogComponent } from './components/training-filter-dialog/training-filter-dialog.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { TrainingContentService } from './services/training-content.service'
import { TrainingModule } from '../../training.module'
import { TrainingShareDialogComponent } from './components/training-share-dialog/training-share-dialog.component'
import { TrainingNominateDialogComponent } from './components/training-nominate-dialog/training-nominate-dialog.component'
import { TrainingCountResolver } from './resolvers/training-count.resolver'
import { TrainingPrivilegesResolver } from '../../resolvers/training-privileges.resolver'

@NgModule({
  declarations: [
    HomeComponent,
    TrainingHeaderComponent,
    TrainingsListComponent,
    TrainingDetailsComponent,
    TrainingsRegisteredComponent,
    TrainingCardComponent,
    TrainingsUpcomingComponent,
    TrainingFilterDialogComponent,
    TrainingShareDialogComponent,
    TrainingNominateDialogComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TrainingContentRoutingModule,
    TrainingModule,
    DisplayContentTypeModule,
    PipeConciseDateRangeModule,
    UserAutocompleteModule,
    MatDividerModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatMenuModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatBadgeModule,
    MatTooltipModule,
    MatChipsModule,
  ],
  entryComponents: [
    TrainingFilterDialogComponent,
    TrainingShareDialogComponent,
    TrainingNominateDialogComponent,
  ],
  providers: [TrainingContentService, TrainingCountResolver, TrainingPrivilegesResolver],
})
export class TrainingContentModule {}
