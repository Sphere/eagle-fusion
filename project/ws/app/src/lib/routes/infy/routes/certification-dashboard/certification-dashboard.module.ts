import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule, FormsModule } from '@angular/forms'
import {
  MatTabsModule,
  MatToolbarModule,
  MatIconModule,
  MatFormFieldModule,
  MatSelectModule,
  MatCardModule,
  MatButtonModule,
  MatDialogModule,
  MatSnackBarModule,
  MatProgressSpinnerModule,
  MatInputModule,
  MatDatepickerModule,
} from '@angular/material'

import { BtnPageBackModule } from '@ws-widget/collection'
import { PipeDateConcatModule } from '@ws-widget/utils'

import { CertificationDashboardRoutingModule } from './certification-dashboard-routing.module'
import { ApprovalCardComponent } from './components/approval-card/approval-card.component'
import { CertificationHomeComponent } from './components/certification-home/certification-home.component'
import { CertificationRequestsComponent } from './components/certification-requests/certification-requests.component'
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component'
import { MyRequestsComponent } from './components/my-requests/my-requests.component'
import { PastCertificationsComponent } from './components/past-certifications/past-certifications.component'
import { RequestFilterDialogComponent } from './components/request-filter-dialog/request-filter-dialog.component'
import { RequestItemTypeComponent } from './components/request-item-type/request-item-type.component'
import { UserActionConfirmDialogComponent } from './components/user-action-confirm-dialog/user-action-confirm-dialog.component'
import { UserRequestCardComponent } from './components/user-request-card/user-request-card.component'
import { CertificationApiService } from '../../../app-toc/routes/app-toc-certification/apis/certification-api.service'
import { CertificationDashboardService } from './services/certification-dashboard.service'
import { WINDOW_PROVIDERS } from '../../../app-toc/routes/app-toc-certification/services/window.service'
import { FileDownloadService } from '../../../app-toc/routes/app-toc-certification/services/file-download.service'
import { AppTocCertificationModule } from '../../../app-toc/routes/app-toc-certification/app-toc-certification.module'

@NgModule({
  declarations: [
    ApprovalCardComponent,
    CertificationHomeComponent,
    CertificationRequestsComponent,
    ConfirmDialogComponent,
    MyRequestsComponent,
    PastCertificationsComponent,
    RequestFilterDialogComponent,
    RequestItemTypeComponent,
    UserActionConfirmDialogComponent,
    UserRequestCardComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CertificationDashboardRoutingModule,
    PipeDateConcatModule,
    AppTocCertificationModule,
    BtnPageBackModule,
    MatToolbarModule,
    MatIconModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
  ],
  providers: [
    CertificationApiService,
    WINDOW_PROVIDERS,
    FileDownloadService,
    CertificationDashboardService,
  ],
  entryComponents: [
    ConfirmDialogComponent,
    RequestFilterDialogComponent,
    UserActionConfirmDialogComponent,
  ],
})
export class CertificationDashboardModule {}
