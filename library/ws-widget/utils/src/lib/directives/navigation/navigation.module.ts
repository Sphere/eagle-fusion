import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { NavigationDirective } from './navigation.directive'

@NgModule({
  declarations: [NavigationDirective],
  imports: [
    CommonModule,
  ],
  exports: [NavigationDirective],
})
export class NavigationModule { }
