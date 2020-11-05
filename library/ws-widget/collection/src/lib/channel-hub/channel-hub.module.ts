import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { ChannelHubComponent } from './channel-hub.component'
import { MatCardModule, MatIconModule } from '@angular/material'

@NgModule({
  declarations: [ChannelHubComponent],
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
  ],
  entryComponents: [ChannelHubComponent],
})
export class ChannelHubModule { }
