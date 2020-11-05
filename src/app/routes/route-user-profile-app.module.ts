import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { UserProfileModule } from '@ws/app'

@NgModule({
  declarations: [],
  imports: [CommonModule, UserProfileModule],
  exports: [UserProfileModule],
})
export class RouteUserProfileAppModule { }
