import { CommonModule } from '@angular/common'
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatChipsModule } from '@angular/material/chips'
import { MatDividerModule } from '@angular/material/divider'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { MatTooltipModule } from '@angular/material/tooltip'
import { RouterModule } from '@angular/router'
import { MdePopoverModule } from '../../../../../../src/app/mocks/mde-popover.mock'
import { DefaultThumbnailModule, PipeCountTransformModule, PipeDurationTransformModule, PipeHtmlTagRemovalModule, PipePartialContentModule } from '@ws-widget/utils'
import { ContentProgressModule } from '../_common/content-progress/content-progress.module'
import { DisplayContentTypeModule } from '../_common/display-content-type/display-content-type.module'
import { PipeContentRouteModule } from '../_common/pipe-content-route/pipe-content-route.module'
import { UserImageModule } from '../_common/user-image/user-image.module'
import { CardContentComponent } from './card-content.component'
import { BtnContentShareModule } from '../btn-content-share/btn-content-share.module'

@NgModule({
    declarations: [CardContentComponent],
    imports: [
        CommonModule,
        RouterModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        MdePopoverModule,
        MatMenuModule,
        MatChipsModule,
        MatDividerModule,
        DefaultThumbnailModule,
        DisplayContentTypeModule,
        PipeDurationTransformModule,
        PipePartialContentModule,
        PipeContentRouteModule,
        PipeCountTransformModule,
        PipeHtmlTagRemovalModule,
        ContentProgressModule,
        BtnContentShareModule,
        UserImageModule,
    ],
    exports: [CardContentComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CardContentModule { }
