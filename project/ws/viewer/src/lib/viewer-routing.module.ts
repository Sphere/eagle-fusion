import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { ViewerComponent } from './viewer.component'
import { ViewerResolve } from './viewer.resolve'
import { HtmlComponent } from './routes/html/html.component'
import { HtmlModule } from './routes/html/html.module'
import { PdfComponent } from './routes/pdf/pdf.component'
import { PdfModule } from './routes/pdf/pdf.module'
import { VideoComponent } from './routes/video/video.component'
import { VideoModule } from './routes/video/video.module'
import { YoutubeComponent } from './routes/youtube/youtube.component'
import { YoutubeModule } from './routes/youtube/youtube.module'

const routes: Routes = [
  {
    path: 'html/:resourceId',
    component: HtmlComponent,
    data: {
      resourceType: 'html',
    },
    resolve: {
      content: ViewerResolve,
    },
  },
  {
    path: 'pdf/:resourceId',
    component: PdfComponent,
    data: {
      resourceType: 'pdf',
    },
    resolve: {
      content: ViewerResolve,
    },
  },
  {
    path: 'quiz',
    data: {
      resourceType: 'quiz',
    },
    loadChildren: () =>
      import('./routes/quiz/quiz.module').then(u => u.QuizModule),
  },
  {
    path: 'resource-collection',
    data: {
      resourceType: 'resource-collection',
    },
    loadChildren: () => import('./routes/resource-collection/resource-collection.module')
      .then(u => u.ResourceCollectionModule),
  },
  {
    path: 'video/:resourceId',
    component: VideoComponent,
    data: {
      resourceType: 'video',
    },
    resolve: {
      content: ViewerResolve,
    },
  },
  {
    path: 'web-module',
    data: {
      resourceType: 'web-module',
    },
    loadChildren: () =>
      import('./routes/web-module/web-module.module').then(u => u.WebModuleModule),
  },
  {
    path: 'youtube/:resourceId',
    component: YoutubeComponent,
    data: {
      resourceType: 'youtube',
    },
    resolve: {
      content: ViewerResolve,
    },
  },
  {
    path: ':resourceId',
    component: ViewerComponent,
    data: {
      resourceType: 'unknown',
    },
    resolve: {
      content: ViewerResolve,
    },
  },
  {
    path: '**',
    component: ViewerComponent,
    data: {
      resourceType: 'error',
    },
    resolve: {
      content: ViewerResolve,
    },
  },
]

@NgModule({
  imports: [
    HtmlModule,
    PdfModule,
    VideoModule,
    YoutubeModule,
    RouterModule.forChild([
      {
        path: '',
        component: ViewerComponent,
        children: routes,
      },
    ])],
  exports: [RouterModule],
  providers: [
    ViewerResolve,
  ],
})
export class ViewerRoutingModule { }
