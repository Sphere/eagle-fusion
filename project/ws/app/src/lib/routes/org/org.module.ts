import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { CommonModule } from '@angular/common'
import { HorizontalScrollerModule } from '@ws-widget/utils'
import { WidgetResolverModule } from '@ws-widget/resolver'
import { CardContentModule, PipeContentRoutePipe } from '@ws-widget/collection'
import { InfiniteScrollModule } from 'ngx-infinite-scroll'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import { MatCardModule } from '@angular/material/card'
import { MatChipsModule } from '@angular/material/chips'
import { MatIconModule } from '@angular/material/icon'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatDividerModule } from '@angular/material/divider'
import { MatButtonModule } from '@angular/material/button'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatTabsModule } from '@angular/material/tabs'
import { AllCoursesComponent } from './components/all-courses/all-courses.component'
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
  declarations: [AllCoursesComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatDatepickerModule,
    MatDividerModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatTabsModule,
    HorizontalScrollerModule,
    WidgetResolverModule,
    CardContentModule,
    InfiniteScrollModule,
    TranslateModule
  ],
  exports: [],
  providers: [PipeContentRoutePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class OrgModule { }
