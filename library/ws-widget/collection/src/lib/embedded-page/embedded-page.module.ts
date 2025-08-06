import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { EmbeddedPageComponent } from './embedded-page.component'
import { MatIconModule } from '@angular/material/icon'
import { MatToolbarModule } from '@angular/material/toolbar'
import { BtnPageBackModule } from '../btn-page-back/btn-page-back.module'

@NgModule({
    declarations: [EmbeddedPageComponent],
    imports: [CommonModule, BtnPageBackModule, MatIconModule, MatToolbarModule],
    exports: [EmbeddedPageComponent]
})
export class EmbeddedPageModule { }
