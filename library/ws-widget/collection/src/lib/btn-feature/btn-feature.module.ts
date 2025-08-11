import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { BtnFeatureComponent } from './btn-feature.component'
import { RouterModule } from '@angular/router'
import { MatIconModule } from '@angular/material/icon'
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button'
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip'
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card'
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu'
import { MatRippleModule } from '@angular/material/core' // MatRippleModule is part of @angular/material/core
import { MatBadgeModule } from '@angular/material/badge'

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
    exports: [BtnFeatureComponent]
})
export class BtnFeatureModule { }
