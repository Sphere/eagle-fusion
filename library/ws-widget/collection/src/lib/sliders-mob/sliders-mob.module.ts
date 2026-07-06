import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { ImageResponsiveModule } from '@ws-widget/utils'
import { SlidersMobComponent } from './sliders-mob.component'

// eslint-disable-next-line max-classes-per-file
@NgModule({
    declarations: [SlidersMobComponent],
    imports: [CommonModule, RouterModule,
        // NavigationModule,
        ImageResponsiveModule],
    providers: [],
})
export class SlidersMobModule { }
