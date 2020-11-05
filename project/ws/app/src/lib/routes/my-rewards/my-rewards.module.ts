import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { MatButtonModule, MatCardModule, MatIconModule, MatToolbarModule } from '@angular/material'
import { BtnPageBackModule } from '../../../../../../../library/ws-widget/collection/src/public-api'
import { MyRewardsHomeComponent } from './components/my-rewards-home/my-rewards-home.component'
import { MyRewardsRoutingModule } from './my-rewards-routing.module'

@NgModule({
  declarations: [MyRewardsHomeComponent],
  imports: [
    CommonModule,
    MyRewardsRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    BtnPageBackModule,
  ], exports: [MyRewardsHomeComponent],
})
export class MyRewardsModule { }
