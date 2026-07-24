
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { TranslateModule } from '@ngx-translate/core'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatDividerModule } from '@angular/material/divider'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatIconModule } from '@angular/material/icon'
import { MatCardModule } from '@angular/material/card'
import { MatButtonModule } from '@angular/material/button'
import { MatTabsModule } from '@angular/material/tabs'
import { BtnPageBackModule, UserImageModule } from '@ws-widget/collection'
import { HorizontalScrollerModule, PipeSafeSanitizerModule, PipeDurationTransformModule, RetainScrollModule } from '@ws-widget/utils'
import { PublicHomeComponent } from './public-home.component'
import { WidgetResolverModule } from '@ws-widget/resolver/src/public-api'
import { MatProgressBarModule } from '@angular/material/progress-bar'
import { MatSnackBarModule } from '@angular/material/snack-bar'

import { PublicTocComponent } from '../public-toc/public-toc.component'
import { PublicTocBannerComponent } from '../public-toc-banner/public-toc-banner.component'
import { PublicTocOverviewComponent } from '../public-toc-overview/public-toc-overview.component'
import { PublicLicenseComponent } from '../public-license/public-license.component'
import { KeycloakCallbackComponent } from '../keycloak-callback/keycloak-callback.component'
import { WebHomeComponent } from '../../../routes/web-home/web-home.component'
import { WebEkshamataPublicComponent } from '../../web-ekshamata-public-container/web-ekshamata-public-container.component'
import { RegisterComponent } from '../../register/register.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { NotificationsComponent } from '../../notification/notification.component'
import { SelfAssessmentComponent } from '../../self-assessment/self-assessment.component'
import { MobileLoginComponent } from '../../mobile-login/mobile-login.component'
import { MobileCourseViewComponent } from '../../mobile-course-view/mobile-course-view.component'
import { WebCourseCardComponent } from '../../web-course-card/web-course-card.component'
import { LoginOtpComponent } from '../../login-otp/login-otp.component'
import { TncRendererComponent } from '../../../component/tnc-renderer/tnc-renderer.component'
import { AlmostDoneComponent } from '../../almost-done/almost-done.component'
import { BnrcLoginOtpComponent } from '../../bnrc-login-otp/bnrc-login-otp.component'
import { TnnmcConfirmComponent } from '../../../component/tnnmc-dialog-confirm/tnnmc-confirm.component'
import { MatDialogModule } from '@angular/material/dialog'
import { MatMenuModule } from '@angular/material/menu'

@NgModule({
  declarations: [
    PublicHomeComponent,
    WebEkshamataPublicComponent,
    PublicTocComponent,
    PublicTocBannerComponent,
    PublicTocOverviewComponent,
    PublicLicenseComponent,
    KeycloakCallbackComponent,
    WebHomeComponent,
    RegisterComponent,
    NotificationsComponent,
    SelfAssessmentComponent,
    MobileLoginComponent,
    MobileCourseViewComponent,
    WebCourseCardComponent,
    LoginOtpComponent,
    TncRendererComponent,
    AlmostDoneComponent,
    BnrcLoginOtpComponent,
    TnnmcConfirmComponent,
  ],
  imports: [
    MatProgressBarModule,
    MatSnackBarModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MatToolbarModule,
    MatDividerModule,
    MatExpansionModule,
    MatIconModule,
    MatCardModule,
    MatTabsModule,
    BtnPageBackModule,
    MatDialogModule,
    MatMenuModule,
    MatButtonModule,
    HorizontalScrollerModule,
    PipeSafeSanitizerModule,
    WidgetResolverModule,
    PipeDurationTransformModule,
    RouterModule,
    UserImageModule,
    RetainScrollModule,
  ],
  exports: [
    PublicHomeComponent,
    WebEkshamataPublicComponent,
    PublicTocComponent,
    PublicTocBannerComponent,
    PublicTocOverviewComponent,
    PublicLicenseComponent,
    KeycloakCallbackComponent,
    WebHomeComponent,
    RegisterComponent,
    NotificationsComponent,
    SelfAssessmentComponent,
    MobileLoginComponent,
    MobileCourseViewComponent,
    WebCourseCardComponent,
    LoginOtpComponent,
    TncRendererComponent,
    AlmostDoneComponent,
    BnrcLoginOtpComponent,
    TnnmcConfirmComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PublicHomeModule { }
