import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { GeneralGuard } from '../../../../../../../src/app/guards/general.guard'
import { PostFetchResolverService } from './resolvers/post-fetch-resolver.service'
import { SocialTimelineResolverService } from './resolvers/social-timeline-resolver.service'
import { BlogEditComponent } from './routes/blogs/blogs-edit/components/blog-edit.component'
import { BlogViewComponent } from './routes/blogs/blogs-view/components/blog-view.component'
import { MyBlogComponent } from './routes/blogs/my-blogs/components/my-blog.component'
import { RecentBlogComponent } from './routes/blogs/recent-blogs/components/recent-blog.component'
import { QnaEditComponent } from './routes/qna/qna-edit/components/qna-edit/qna-edit.component'
import { QnaHomeComponent } from './routes/qna/qna-home/components/qna-home/qna-home.component'
import { QnaViewComponent } from './routes/qna/qna-view/components/qna-view/qna-view.component'

const routes: Routes = [
  {
    path: 'blogs',
    component: RecentBlogComponent,
    data: {
      requiredFeatures: ['BLOGS'],
    },
    canActivate: [GeneralGuard],
  },
  {
    path: 'blogs/edit',
    component: BlogEditComponent,
    data: {
      requiredFeatures: ['BLOGS'],
    },
    canActivate: [GeneralGuard],
  },
  {
    path: 'blogs/edit/:id',
    component: BlogEditComponent,
    data: {
      requiredFeatures: ['BLOGS'],
    },
    canActivate: [GeneralGuard],
  },
  {
    path: 'blogs/me',
    pathMatch: 'full',
    redirectTo: 'blogs/me/drafts',
    data: {
      requiredFeatures: ['BLOGS'],
    },
    canActivate: [GeneralGuard],
  },
  {
    path: 'blogs/me/:tab',
    component: MyBlogComponent,
    data: {
      requiredFeatures: ['BLOGS'],
    },
    canActivate: [GeneralGuard],
  },
  {
    path: 'blogs/:id',
    component: BlogViewComponent,
    data: {
      requiredFeatures: ['BLOGS'],
    },
    canActivate: [GeneralGuard],
  },
  {
    path: 'qna',
    component: QnaHomeComponent,
    resolve: {
      resolveData: SocialTimelineResolverService,
    },
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
    data: {
      postKind: ['Query'],
      type: 'all',
      requiredFeatures: ['QUESTION_AND_ANSWER'],
    },
    canActivate: [GeneralGuard],
  },
  {
    path: 'qna/edit',
    component: QnaEditComponent,
    data: {
      requiredFeatures: ['QUESTION_AND_ANSWER'],
    },
    canActivate: [GeneralGuard],
  },
  {
    path: 'qna/edit/:id',
    component: QnaEditComponent,
    resolve: {
      resolveData: PostFetchResolverService,
    },
    data: {
      requiredFeatures: ['QUESTION_AND_ANSWER'],
    },
    canActivate: [GeneralGuard],
  },
  {
    path: 'forums',
    loadChildren: () => import('./routes/forums/forum-home.module').then(u => u.ForumHomeModule),
    // component: ForumHomeComponent
  },
  {
    path: 'socialSearch',
    loadChildren: () =>
      import('./routes/socialSearch/social-search.module').then(u => u.SocialSearchModule),
    // component: ForumHomeComponent
  },
  {
    path: 'qna/:id',
    component: QnaViewComponent,
    resolve: {
      resolveData: PostFetchResolverService,
    },
    data: {
      requiredFeatures: ['QUESTION_AND_ANSWER'],
    },
    canActivate: [GeneralGuard],
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SocialRoutingModule {}
