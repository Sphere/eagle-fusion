import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { MarketingComponent } from './marketing.component'
import { MarketingServicesComponent } from './marketing-services/marketing-services.component'
import { PageResolve, MarketingOfferingResolve } from '@ws-widget/utils'
import { PageComponent } from '@ws-widget/collection'

const BASE_URL = `assets/configurations/${location.host.replace(':', '_')}`
const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'brandAssets',
  },
  {
    path: 'offering/:tag',
    component: PageComponent,
    data: {
      pageUrl: `${BASE_URL}/page/marketing-offering.json`,
    },
    resolve: {
      pageData: MarketingOfferingResolve,
    },
  },
  {
    path: 'services',
    component: MarketingServicesComponent,
  },
  {
    path: ':tab',
    component: PageComponent,
    data: {
      pageType: 'page',
      pageKey: 'tab',
    },
    resolve: {
      pageData: PageResolve,
    },
  },
]

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: MarketingComponent,
        children: routes,
      },
    ]),
  ],
  exports: [RouterModule],
})
export class MarketingRoutingModule { }
