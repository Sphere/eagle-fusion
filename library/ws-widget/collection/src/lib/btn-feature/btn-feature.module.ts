import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { BtnFeatureComponent } from './btn-feature.component'
import { RouterModule } from '@angular/router'
import {
  MatIconModule,
  MatButtonModule,
  MatTooltipModule,
  MatCardModule,
  MatMenuModule,
  MatRippleModule,
  MatBadgeModule,
} from '@angular/material'
import { WidgetUrlResolverDirective } from './widget-url-resolver.directive'
import { AvatarPhotoModule } from '../_common/avatar-photo/avatar-photo.module'
@NgModule({
  declarations: [BtnFeatureComponent, WidgetUrlResolverDirective],
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatCardModule,
    MatMenuModule,
    MatRippleModule,
    MatBadgeModule,
    AvatarPhotoModule,
  ],
  exports: [BtnFeatureComponent],
  entryComponents: [BtnFeatureComponent],
})
export class BtnFeatureModule { }
