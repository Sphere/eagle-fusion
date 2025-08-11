import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button'
import { MatIconModule } from '@angular/material/icon'
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu'
import { MatRippleModule } from '@angular/material/core'
import { WidgetResolverModule } from '@ws-widget/resolver'
import { AvatarPhotoComponent } from './avatar-photo.component'

@NgModule({
    declarations: [AvatarPhotoComponent],
    imports: [
        CommonModule,
        RouterModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatRippleModule,
        WidgetResolverModule,
    ],
    exports: [AvatarPhotoComponent]
})
export class AvatarPhotoModule { }
