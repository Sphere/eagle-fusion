import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatTooltipModule } from '@angular/material/tooltip'
import { RouterModule } from '@angular/router'
import { WidgetResolverModule } from '@ws-widget/resolver'
import { BtnPageBackModule } from '../btn-page-back/btn-page-back.module'
import { PageComponent } from './page.component'
import { BtnFeatureModule } from '../btn-feature/btn-feature.module'
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
        BtnFeatureModule,
        ContentStripMultipleModule,
    ],
    exports: [PageComponent],
})
export class PageModule { }
