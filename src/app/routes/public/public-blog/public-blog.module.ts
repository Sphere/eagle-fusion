import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { PublicBlogListComponent } from './public-blog-list.component'
import { PublicBlogArticleComponent } from './public-blog-article.component'
import { PublicCourseBlogComponent } from '../public-course-blog/public-course-blog.component'

@NgModule({
  declarations: [PublicBlogListComponent, PublicBlogArticleComponent, PublicCourseBlogComponent],
  imports: [CommonModule, RouterModule],
  exports: [PublicBlogListComponent, PublicBlogArticleComponent, PublicCourseBlogComponent],
})
export class PublicBlogModule {}
