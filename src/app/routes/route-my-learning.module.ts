import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { MyLearningModule } from '@ws/app'

@NgModule({
  declarations: [],
  imports: [CommonModule, MyLearningModule],
  exports: [MyLearningModule],
})
export class RouteMyLearningModule {}
