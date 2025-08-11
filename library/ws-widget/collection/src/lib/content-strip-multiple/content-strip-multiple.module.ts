import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { ContentStripMultipleComponent } from './content-strip-multiple.component'
import { HorizontalScrollerModule } from '@ws-widget/utils'
import { WidgetResolverModule } from '@ws-widget/resolver'
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button'
import { MatIconModule } from '@angular/material/icon'
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip'
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner'
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips'
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card'

@NgModule({
    declarations: [ContentStripMultipleComponent],
    imports: [
        CommonModule,
        RouterModule,
        HorizontalScrollerModule,
        WidgetResolverModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatProgressSpinnerModule,
        MatChipsModule,
        MatCardModule,
    ]
})
export class ContentStripMultipleModule { }
