import { NgModule } from '@angular/core'

import { Routes, RouterModule } from '@angular/router'
import { SocialSearchComponent } from './social-search.component'

const forumroutes: Routes = [
  {
    path: '',
    redirectTo: 'view-search',
    pathMatch: 'full',

  },

  {
    path: 'view-search',
    component: SocialSearchComponent,

    // resolve: {
    //   content: ViewForumService,
    // },
  },
]

@NgModule({
  imports: [
    RouterModule.forChild([

      {
        path: '',
        component: SocialSearchComponent,
        // resolve: {
        //   content: ModeratorTimelineService,
        // },
        children: forumroutes,
      },

    ]),
  ],
  exports: [RouterModule],
})

export class SocialSearchRoutingModule { }
