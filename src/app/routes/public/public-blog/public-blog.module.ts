import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { PublicBlogListComponent } from './public-blog-list.component'
import { PublicBlogArticleComponent } from './public-blog-article.component'

@NgModule({
  declarations: [PublicBlogListComponent, PublicBlogArticleComponent],
  imports: [CommonModule, RouterModule],
  exports: [PublicBlogListComponent, PublicBlogArticleComponent],
})
export class PublicBlogModule {}
