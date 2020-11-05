import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CounterEntityComponent } from './components/counter-entity/counter-entity.component'

@NgModule({
  declarations: [CounterEntityComponent],
  imports: [
    CommonModule,
  ],
})
export class CounterModule { }
