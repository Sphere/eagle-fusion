import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { KhubViewComponent } from './routes/khub-view/khub-view.component'
import { KhubHomeComponent } from './routes/khub-home/khub-home.component'

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: KhubHomeComponent,
  },
  {
    path: 'view/:category/:itemId/:source',
    component: KhubViewComponent,
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class KnowledgeHubRoutingModule {}
