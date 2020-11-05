import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { AdminTimelineComponent } from './forum-admin/components/admin-timeline.component'
import { ViewForumService } from '../../resolvers/view-forum.service'
import { ForumHomeComponent } from './forum-home.component'
import { ModeratorTimelineComponent } from './forum-moderator/components/moderator-timeline.component'
import { ForumPostViewComponent } from './forum-post-view/components/forum-post-view.component'
import { ForumViewComponent } from './forum-view/components/forum-view.component'
import { MyforumPostComponent } from './myforum-post/components/myforum-post.component'
// import { ForumHomeComponent } from './forum-home.component'
// import { RecentForumPostModule } from './recent-forum-post/recent-forum-post.module'
import { RecentForumPostComponent } from './recent-forum-post/components/recent-forum-post.component'
import { PostViewComponent } from './post-view/post-view.component'
import { PostCreateComponent } from './post-create/post-create.component'
import { ModeratorTimelineService } from '../../resolvers/moderator-timeline.service'
import { ForumEditComponent } from './forum-edit/forum-edit.component'
import { EditForumService } from '../../resolvers/edit-forum.service'

const forumroutes: Routes = [
  {
    path: '',
    redirectTo: 'view-forum',
    pathMatch: 'full',

  },
  {
    path: 'forum-post-view',
    component: ForumPostViewComponent,
  },
  {
    path: 'edit',
    component: ForumEditComponent,

  },
  {
    path: 'edit/:id',
    component: ForumEditComponent,
    resolve: {
      content: EditForumService,
    },

  },
  {
    path: 'recent-forumpost',
    component: RecentForumPostComponent,
  },
  {
    path: 'moderator-timeline',
    component: ModeratorTimelineComponent,
  },
  {
    path: 'admin-timeline',
    component: AdminTimelineComponent,
  },
  {
    path: 'my-forum-post',
    component: MyforumPostComponent,
  }
  ,
  {
    path: 'view/:id',
    component: ForumPostViewComponent,
    resolve: {
      content: ViewForumService,
    },
  },
  {
    path: 'view-forum',
    component: ForumViewComponent,

    resolve: {
      content: ViewForumService,
    },
  },
]

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: 'post/edit',
        component: PostCreateComponent,
        resolve: {
          content: ViewForumService,
        },
      },
      {
        path: 'post/edit/:id',
        component: PostCreateComponent,

      },

      {
        path: 'post/:id',
        component: PostViewComponent,
      },
      {
        path: '',
        component: ForumHomeComponent,
        resolve: {
          content: ModeratorTimelineService,
        },
        children: forumroutes,
      },

    ]),
  ],
  exports: [RouterModule],
})
export class ForumHomeRoutingModule {
  constructor() {
    // console.log('Forum Home routing module is working')
  }
}
