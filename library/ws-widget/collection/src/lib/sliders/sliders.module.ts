import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SlidersComponent } from './sliders.component'
import { RouterModule } from '@angular/router'
import { NavigationModule, ImageResponsiveModule } from '@ws-widget/utils'

import { HAMMER_GESTURE_CONFIG, HammerGestureConfig } from '@angular/platform-browser'
export class MyHammerConfig extends HammerGestureConfig {
  buildHammer(element: HTMLElement) {
    const mc = new Hammer(element, {
      touchAction: 'pan-y',
    })
    return mc
  }
}

// tslint:disable-next-line: max-classes-per-file
@NgModule({
  declarations: [SlidersComponent],
  imports: [
    CommonModule,
    RouterModule,
    NavigationModule,
    ImageResponsiveModule,
  ],
  entryComponents: [SlidersComponent],
  providers: [
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: MyHammerConfig,
    },
  ],
})
export class SlidersModule { }
