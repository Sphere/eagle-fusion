import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatButtonModule, MatIconModule, MatMenuModule, MatTooltipModule, MatSlideToggleModule, MatDialogModule } from '@angular/material'
import { BtnProfileComponent } from './btn-profile.component'
import { WidgetResolverModule } from '@ws-widget/resolver/src/public-api'
import { RouterModule } from '@angular/router'
import { LogoutModule } from '@ws-widget/utils'
import { UserProfileService } from './../../../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { AvatarPhotoModule } from '../_common/avatar-photo/avatar-photo.module'

// import { TreeCatalogModule } from '../tree-catalog/tree-catalog.module'

@NgModule({
  declarations: [BtnProfileComponent],
  imports: [
    CommonModule,
    LogoutModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatSlideToggleModule,
    RouterModule,
    WidgetResolverModule,
    AvatarPhotoModule,
  ],
  providers: [UserProfileService],
  entryComponents: [BtnProfileComponent],
})
export class BtnProfileModule { }
