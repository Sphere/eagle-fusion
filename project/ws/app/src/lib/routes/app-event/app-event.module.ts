import { EventResolverService } from './services/event-resolver.service'
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AppEventRoutingModule } from './app-event-routing.module'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatGridListModule } from '@angular/material/grid-list'
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'
import { MatSelectModule } from '@angular/material/select'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatTabsModule } from '@angular/material/tabs'
import { MatDividerModule } from '@angular/material/divider'
import { MatCardModule } from '@angular/material/card'
import { HorizontalScrollerModule } from '@ws-widget/utils/src/lib/helpers/horizontal-scroller/horizontal-scroller.module'
import { EventService } from './services/event.service'
import { MatToolbarModule } from '@angular/material/toolbar'
import { BtnPageBackModule, BtnFullscreenModule } from '@ws-widget/collection'

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    AppEventRoutingModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatGridListModule,
    MatDividerModule,
    MatIconModule,
    MatCardModule,
    HorizontalScrollerModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    BtnPageBackModule,
    MatSelectModule,
    MatTabsModule,
    BtnFullscreenModule,
  ],
  providers: [
    EventResolverService,
    EventService,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppEventModule { }
