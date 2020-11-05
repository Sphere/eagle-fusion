// imports for Angular library
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

// import for custom routing module
import { WsLearningHubRoutingModule } from './ws-learning-hub-routing.module'

// import for custom service
import { WsLearningHubService } from './ws-learning-hub.service'

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    WsLearningHubRoutingModule,
  ],
  exports: [],
  providers: [WsLearningHubService],
})
export class WsLearningHubRootModule { }
