import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { PageResolve } from '@ws-widget/utils'
import { GeneralGuard } from '../../../../../../../src/app/guards/general.guard'
// import { AppTocCohortsComponent } from './components/app-toc-cohorts/app-toc-cohorts.component'

import { KnowledgeArtifactDetailsComponent } from './components/knowledge-artifact-details/knowledge-artifact-details.component'
import { AppTocResolverService } from './resolvers/app-toc-resolver.service'
import { AppTocAnalyticsComponent } from './routes/app-toc-analytics/app-toc-analytics.component'
import { CertificationMetaResolver } from './routes/app-toc-certification/resolvers/certification-meta.resolver'
import { ContentCertificationResolver } from './routes/app-toc-certification/resolvers/content-certification.resolver'
import { AppTocContentsComponent } from './routes/app-toc-contents/app-toc-contents.component'
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
        path: 'analytics',
        component: AppTocAnalyticsComponent,
        data: {
          pageType: 'feature',
          pageKey: 'toc',
          requiredFeatures: ['tocAnalytics'],
        },
        resolve: {
          pageData: PageResolve,
        },
        canActivate: [GeneralGuard],
        runGuardsAndResolvers: 'always',
      },
      {
        path: 'chapters',
        component: AppTocContentsComponent,
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
        path: 'certification',
        loadChildren: () =>
          import('./routes/app-toc-certification/app-toc-certification.module').then(
            u => u.AppTocCertificationModule,
          ),
        canActivate: [GeneralGuard],
        resolve: {
          certificationMetaResolve: CertificationMetaResolver,
          contentMetaResolve: ContentCertificationResolver,
        },
        runGuardsAndResolvers: 'always',
        data: {
          requiredFeatures: ['certificationLHub'],
        },
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
  {
    path: 'knowledge-artifact/:id',
    component: KnowledgeArtifactDetailsComponent,
    resolve: {
      content: AppTocResolverService,
    },
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AppTocRoutingModule { }
