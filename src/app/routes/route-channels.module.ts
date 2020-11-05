import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ChannelsModule } from '@ws/app'

@NgModule({
  declarations: [],
  imports: [CommonModule, ChannelsModule],
  exports: [ChannelsModule],
})
export class RouteChannelsModule { }
