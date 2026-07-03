import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { IapComponent } from './iap.component'
import { IapRoutingModule } from './iap-routing.module'
import { WidgetResolverModule } from '@ws-widget/resolver'
import { IapModule as IapViewContainerModule } from '../../route-view-container/iap/iap.module'

import { MatCardModule } from '@angular/material/card'
import { MatDividerModule } from '@angular/material/divider'
import { MatButtonModule } from '@angular/material/button'
import { MatSnackBarModule } from '@angular/material/snack-bar'


import {
  BtnContentShareModule,
  DisplayContentTypeModule,
  UserImageModule,
} from '@ws-widget/collection'

import {
  PipeDurationTransformModule,
  PipeLimitToModule,
  PipePartialContentModule,
} from '@ws-widget/utils'
@NgModule({
  declarations: [IapComponent],
  imports: [
    CommonModule,
    IapViewContainerModule,
    IapRoutingModule,
    WidgetResolverModule,
    PipeDurationTransformModule,
    PipeLimitToModule,
    PipePartialContentModule,
    BtnContentShareModule,
    DisplayContentTypeModule,
    UserImageModule,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
})
export class IapModule { }
