import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { GamificationModule } from '../../../project/ws/app/src/lib/routes/gamification/gamification.module'

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    GamificationModule
    ,
  ],
  exports: [
    GamificationModule,
  ],
})
export class RouteGamificationModule { }
