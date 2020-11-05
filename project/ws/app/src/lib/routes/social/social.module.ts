import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { SocialRoutingModule } from './social-routing.module'
import { BlogsModule } from './routes/blogs/blogs.module'
import { QnaModule } from './routes/qna/qna.module'
import { PostFetchResolverService } from './resolvers/post-fetch-resolver.service'
import { SocialTimelineResolverService } from './resolvers/social-timeline-resolver.service'

@NgModule({
  declarations: [],
  imports: [CommonModule, SocialRoutingModule, BlogsModule, QnaModule],
  providers: [PostFetchResolverService, SocialTimelineResolverService],
})
export class SocialModule { }
