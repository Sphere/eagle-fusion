import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PermissionDirective } from './permission.directive'

@NgModule({
  declarations: [PermissionDirective],
  imports: [
    CommonModule,
  ],
  exports: [PermissionDirective],
})
export class PermissionModule { }
