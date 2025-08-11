import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button'
import { MatIconModule } from '@angular/material/icon'
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip'
import { RouterModule } from '@angular/router'
import { WidgetResolverModule } from '@ws-widget/resolver'
import { BtnPageBackModule } from '../btn-page-back/btn-page-back.module'
// import { TourModule } from '../_common/tour-guide/tour-guide.module'
import { PageComponent } from './page.component'
import { BtnFeatureModule } from '../btn-feature/btn-feature.module'
// simport { CardBreadcrumbModule } from './../card-breadcrumb/card-breadcrumb.module'
import { ContentStripMultipleModule } from './../content-strip-multiple/content-strip-multiple.module'

@NgModule({
    declarations: [PageComponent],
    imports: [
        CommonModule,
        RouterModule,
        WidgetResolverModule,
        BtnPageBackModule,
        MatButtonModule,
        MatToolbarModule,
        MatIconModule,
        MatTooltipModule,
        MatMenuModule,
        // TourModule,
        BtnFeatureModule,
        // CardBreadcrumbModule,
        ContentStripMultipleModule,
    ],
    exports: [PageComponent]
})
export class PageModule { }
