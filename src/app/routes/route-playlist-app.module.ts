import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PlaylistModule } from '@ws/app'

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    PlaylistModule,
  ],
  exports: [
    PlaylistModule,
  ],
})
export class RoutePlaylistAppModule { }
