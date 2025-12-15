import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { TranslateModule } from '@ngx-translate/core'
import { RouterModule } from '@angular/router'

// Material Modules
import { MatListModule } from '@angular/material/list'
import { MatMenuModule } from '@angular/material/menu'
import { MatIconModule } from '@angular/material/icon'
import { MatDialogModule } from '@angular/material/dialog'
import { MatTabsModule } from '@angular/material/tabs'
import { MatButtonModule } from '@angular/material/button'
import { MatInputModule } from '@angular/material/input'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatSelectModule } from '@angular/material/select'

// Library Modules
import { BtnFeatureModule, PlayerVideoPopupModule } from '@ws-widget/collection'

// Components
import { AppNavBarComponent } from '../component/app-nav-bar/app-nav-bar.component'
import { AppPublicNavBarComponent } from '../component/app-public-nav-bar/app-public-nav-bar.component'
import { TncRendererComponent } from '../component/tnc-renderer/tnc-renderer.component'
import { AppFooterComponent } from '../component/app-footer/app-footer.component'
import { DialogConfirmComponent } from '../component/dialog-confirm/dialog-confirm.component'
import { TnnmcConfirmComponent } from '../component/tnnmc-dialog-confirm/tnnmc-confirm.component'
import { NotificationsComponent } from '../routes/notification/notification.component'
import { MobileFooterComponent } from '../routes/mobile-footer/mobile-footer.component'
import { DropdownDobComponent } from '../component/dropdown-dob/dropdown-dob.component'
import { VideoPopupComponent } from '../routes/how-does-it-works-popup/how-does-it-works-popup.component'
import { MyCoursesComponent } from '../component/my-courses/my-courses.component'
import { BnrcmodalComponent } from '../routes/bnrc-popup/bnrc-modal-component'

@NgModule({
  declarations: [
    AppNavBarComponent,
    AppPublicNavBarComponent,
    TncRendererComponent,
    AppFooterComponent,
    DialogConfirmComponent,
    TnnmcConfirmComponent,
    NotificationsComponent,
    MobileFooterComponent,
    DropdownDobComponent,
    VideoPopupComponent,
    MyCoursesComponent,
    BnrcmodalComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    RouterModule,
    MatListModule,
    MatMenuModule,
    MatIconModule,
    MatDialogModule,
    MatTabsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    BtnFeatureModule,
    PlayerVideoPopupModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    AppNavBarComponent,
    AppPublicNavBarComponent,
    TncRendererComponent,
    AppFooterComponent,
    DialogConfirmComponent,
    TnnmcConfirmComponent,
    NotificationsComponent,
    MobileFooterComponent,
    DropdownDobComponent,
    VideoPopupComponent,
    MyCoursesComponent,
    BnrcmodalComponent
  ]
})
export class CoreModule { }
