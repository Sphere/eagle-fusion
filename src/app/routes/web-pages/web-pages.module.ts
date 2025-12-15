import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { TranslateModule } from '@ngx-translate/core'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatIconModule } from '@angular/material/icon'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatMenuModule } from '@angular/material/menu'
import { MatListModule } from '@angular/material/list'
import { MatChipsModule } from '@angular/material/chips'
import { MatTabsModule } from '@angular/material/tabs'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatProgressBarModule } from '@angular/material/progress-bar'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatExpansionModule } from '@angular/material/expansion'

import { WebDashboardComponent } from '../web-dashboard/web-dashboard.component'
import { WebHowDoesWorkComponent } from '../web-how-does-work/web-how-does-work.component'
import { WebTrustedByPageComponent } from '../web-trusted-by-page/web-trusted-by-page.component'
import { WebPublicComponent } from '../web-public-container/web-public-container.component'
import { WebFeaturedCourseComponent } from '../web-featured-course/web-featured-course.component'
import { WebNavLinkPageComponent } from '../web-nav-link/web-nav-link-page.component'
import { WebCourseViewComponent } from '../web-course-view/web-course-view.component'
import { WebCourseCardComponent } from '../web-course-card/web-course-card.component'
import { WIDGET_REGISTERED_MODULES } from '@ws-widget/collection'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

@NgModule({
  declarations: [
    WebDashboardComponent,
    WebHowDoesWorkComponent,
    WebTrustedByPageComponent,
    WebPublicComponent,
    WebFeaturedCourseComponent,
    WebNavLinkPageComponent,
    WebCourseViewComponent,
    WebCourseCardComponent,
  ],
  imports: [
    CommonModule,
    TranslateModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatToolbarModule,
    MatMenuModule,
    MatListModule,
    MatChipsModule,
    MatTabsModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    ...WIDGET_REGISTERED_MODULES,
  ],
  exports: [
    WebDashboardComponent,
    WebHowDoesWorkComponent,
    WebTrustedByPageComponent,
    WebPublicComponent,
    WebFeaturedCourseComponent,
    WebNavLinkPageComponent,
    WebCourseViewComponent,
    WebCourseCardComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class WebPagesModule { }
