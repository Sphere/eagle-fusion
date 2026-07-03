import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SlidersComponent } from './sliders.component'
import { RouterModule } from '@angular/router'
import { ImageResponsiveModule } from '@ws-widget/utils'

// eslint-disable-next-line max-classes-per-file
@NgModule({
    declarations: [SlidersComponent],
    imports: [
        CommonModule,
        RouterModule,
        // NavigationModule,
        ImageResponsiveModule,
    ],
    providers: [],
})
export class SlidersModule { }
