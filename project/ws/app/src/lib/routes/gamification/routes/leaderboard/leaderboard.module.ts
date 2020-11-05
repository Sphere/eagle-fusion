import { NgModule } from '@angular/core'
import { CommonModule, DatePipe } from '@angular/common'
import { LeaderboardRoutingModule } from './leaderboard-routing.module'
import { LeaderboardHomeComponent } from './components/leaderboard-home/leaderboard-home.component'
import {
  MatTabsModule,
  MatCardModule,
  MatDividerModule,
  MatButtonModule,
  MatToolbarModule,
  MatIconModule,
  MatProgressBarModule,
  MatProgressSpinnerModule, MatButtonToggleModule,
  MatSelectModule, MatFormFieldModule, MatInputModule, MatSidenavModule, MatMenuModule,
  MatDatepickerModule, MatNativeDateModule,
} from '@angular/material'
import { LeaderboardItemComponent } from '../leaderboard-item/leaderboard-item.component'
import { CardListComponent } from '../card-list/card-list.component'
import { CardListItemComponent } from '../card-list-item/card-list-item.component'
import { UserImageModule } from '@ws-widget/collection'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { PipeNameTransformModule, PipeCountTransformModule } from '@ws-widget/utils'

@NgModule({
  declarations: [LeaderboardHomeComponent,
    LeaderboardItemComponent,
    CardListComponent,
    CardListItemComponent,
  ],
  imports: [
    CommonModule,
    LeaderboardRoutingModule,
    MatTabsModule,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatTabsModule,
    MatToolbarModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    UserImageModule,
    PipeNameTransformModule,
    FormsModule,
    ReactiveFormsModule,
    PipeCountTransformModule,
    MatFormFieldModule,
    MatInputModule,
    MatSidenavModule,
    MatMenuModule,
    MatButtonToggleModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  providers: [DatePipe],
})
export class LeaderboardModule { }
