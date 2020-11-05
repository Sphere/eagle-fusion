import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { AppSetupHomeComponent } from './app-setup-home.component'
import { HomeComponent } from '../app-setup/components/home/home.component'
import { LangSelectComponent } from './components/lang-select/lang-select.component'
import { AboutVideoComponent } from '../info/about-video/about-video.component'
import { TncAppResolverService } from '../../../../../../../src/app/services/tnc-app-resolver.service'
import { TncComponent } from './components/tnc/tnc.component'
import { PageResolve } from '../../../../../../../library/ws-widget/utils/src/public-api'
import { InterestComponent } from './module/interest/interest/interest.component'

const routes: Routes = []

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: AppSetupHomeComponent,
        children: routes,
      },
      {
        path: 'home',
        component: HomeComponent,
        children: [{
          path: '',
          redirectTo: 'lang',
          pathMatch: 'full',
        }, {
          path: 'lang',
          component: LangSelectComponent,
        }, {
          path: 'tnc',
          component: TncComponent,
          resolve: {
            tnc: TncAppResolverService,
          },
        }, {
          path: 'about-video',
          component: AboutVideoComponent,
        }, {
          path: 'interest',
          component: InterestComponent,
          data: {
            pageType: 'feature',
            pageKey: 'interest',
          },
          resolve: {
            pageData: PageResolve,
          },
        }],

      },
    ]),
  ],
  exports: [RouterModule],
})
export class AppSetupRoutingModule { }
