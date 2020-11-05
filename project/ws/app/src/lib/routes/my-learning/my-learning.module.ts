import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import {
  MatButtonModule,
  MatIconModule,
  MatProgressSpinnerModule,
  MatToolbarModule,
} from '@angular/material'
import { MatCardModule } from '@angular/material/card'
import { MatSidenavModule } from '@angular/material/sidenav'
import { BtnPageBackModule, CardContentModule } from '@ws-widget/collection'
import { WidgetResolverModule } from '@ws-widget/resolver'
import { MyLearningRoutingModule } from './my-learning-routing.module'
import { HomeComponent } from './routes/home/home.component'
@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    MyLearningRoutingModule,
    MatCardModule,
    MatSidenavModule,
    CardContentModule,
    MatToolbarModule,
    WidgetResolverModule,
    MatButtonModule,
    MatIconModule,
    BtnPageBackModule,
    MatProgressSpinnerModule,
  ],
})
export class MyLearningModule {}
