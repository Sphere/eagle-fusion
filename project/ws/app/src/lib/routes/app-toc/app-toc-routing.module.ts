import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { PageResolve } from '@ws-widget/utils'
import { AppTocResolverService } from './resolvers/app-toc-resolver.service'
import { AppTocContentsComponent } from './routes/app-toc-contents/app-toc-contents.component'
import { AppTocReferencesComponent } from './routes/app-toc-references/app-toc-references.component'
import { AppTocHomeComponent } from './routes/app-toc-home/app-toc-home.component'
import { AppTocOverviewComponent as AppTocOverviewRootComponent } from './routes/app-toc-overview/app-toc-overview.component'
import { AppTocCohortsComponent } from './components/app-toc-cohorts/app-toc-cohorts.component'
import { LicenseComponent } from './components/license/license.component'
import { AllDiscussionWidgetComponent } from './routes/widget/all-discussion-widget/all-discussion-widget.component'
import { DiscussConfigResolve } from '../../../../../../../src/app/routes/discussion-forum/wrapper/resolvers/discuss-config-resolve'
const routes: Routes = [
  {
    path: ':id',
    component: AppTocHomeComponent,
    data: {
      pageType: 'feature',
      pageKey: 'toc',
    },
    resolve: {
      pageData: PageResolve,
      content: AppTocResolverService,
    },
    runGuardsAndResolvers: 'paramsChange',
    children: [
      {
        path: 'chapters',
        component: AppTocContentsComponent,
      },
      {
        path: 'references',
        component: AppTocReferencesComponent,
      },
      {
        path: 'overview',
        component: AppTocOverviewRootComponent,
      },
      {
        path: 'discussion-forum',
        component: AllDiscussionWidgetComponent,
        resolve: {
          data: DiscussConfigResolve,
        },
      },
      {
        path: 'details',
        component: AppTocCohortsComponent,
      },
      {
        path: 'license',
        component: LicenseComponent,
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'overview',
      },
    ],
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AppTocRoutingModule { }
