import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { SearchRootComponent } from './routes/search-root/search-root.component'
import { LearningComponent } from './routes/learning/learning.component'
import { KnowledgeComponent } from './routes/knowledge/knowledge.component'
import { ProjectComponent } from './routes/project/project.component'
import { SocialComponent } from './routes/social/social.component'
import { HomeComponent } from './routes/home/home.component'
import { PeopleComponent } from './routes/people/people.component'
import { PageResolve } from '@ws-widget/utils'
import { GeneralGuard } from 'src/app/guards/general.guard'

const routes: Routes = [
  {
    path: '',
    redirectTo: 'learning',
    pathMatch: 'full',
  },
  {
    path: 'knowledge',
    component: KnowledgeComponent,
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
  {
    path: 'people',
    component: PeopleComponent,
    data: {
      pageType: 'feature',
      pageKey: 'search',
      pageroute: 'people',
      requiredFeatures: ['peopleSearch'],
    },
    canActivate: [GeneralGuard],
    resolve: {
      pageData: PageResolve,
    },
  },
  {
    path: 'project',
    component: ProjectComponent,
  },
  {
    path: 'social',
    component: SocialComponent,
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
