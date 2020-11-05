import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SocialModule } from '@ws/app'

@NgModule({
  declarations: [],
  imports: [CommonModule, SocialModule],
  exports: [SocialModule],
})
export class RouteSocialAppModule {}
