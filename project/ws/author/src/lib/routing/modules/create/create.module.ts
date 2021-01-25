import { SharedModule } from '@ws/author/src/lib/modules/shared/shared.module'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CreateComponent } from './components/create/create.component'
import { EntityCardComponent } from './components/entity-card/entity-card.component'
import { RouterModule } from '@angular/router'
import { CreateService } from './components/create/create.service'

@NgModule({
  declarations: [
    CreateComponent,
    EntityCardComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule,
  ],
  providers: [CreateService],
})

export class CreateModule { }
