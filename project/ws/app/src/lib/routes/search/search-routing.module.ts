import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { SearchRootComponent } from './routes/search-root/search-root.component'
import { LearningComponent } from './routes/learning/learning.component'
import { ViewAllComponent } from './routes/view-all/view-all.component'
import { HomeComponent } from './routes/home/home.component'
import { PageResolve } from '@ws-widget/utils'

const routes: Routes = [
  {
    path: '',
    redirectTo: 'learning',
    pathMatch: 'full',
  },
  {
    path: 'learning',
    component: LearningComponent,
    data: {
      pageType: 'feature',
      pageKey: 'search',
      pageroute: 'learning',
    },
    resolve: {
      pageData: PageResolve,
    },
  },
  {
    path: 'learningBoard',
    component: LearningComponent,
    data: {
      pageType: 'feature',
      pageKey: 'search',
      pageroute: 'learningBoard',
    },
    resolve: {
      pageData: PageResolve,
    },
  },
  {
    path: 'topCourse',
    component: ViewAllComponent,
    data: {
      pageType: 'topCourse',
      pageKey: 'toc',
    },
    resolve: {
      pageData: PageResolve,
      content: PageResolve,
    },
  },
  {
    path: 'learningJourneys',
    component: LearningComponent,
    data: {
      pageType: 'feature',
      pageKey: 'search',
      pageroute: 'learningJourneys',
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
        component: SearchRootComponent,
        children: routes,
      },
      {
        path: 'home',
        component: HomeComponent,
        data: {
          pageType: 'feature',
          pageKey: 'search',
        },
        resolve: {
          pageData: PageResolve,
        },
      },
    ]),
  ],
  exports: [RouterModule],
})
export class SearchRoutingModule { }
