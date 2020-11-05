import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { NotificationV2Module } from '@ws/app'

@NgModule({
  declarations: [],
  imports: [CommonModule, NotificationV2Module],
  exports: [NotificationV2Module],
})
export class RouteNotificationAppModule {}
