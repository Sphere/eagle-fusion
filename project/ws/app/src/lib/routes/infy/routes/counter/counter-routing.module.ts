import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { CounterResolve } from './resolvers/ counter.resolve'
import { CounterInfyMeResolve } from './resolvers/counter-infyme.resolve'

const routes: Routes = [
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [CounterResolve, CounterInfyMeResolve],
})
export class CounterRoutingModule { }
