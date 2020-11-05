import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { BlogsEditModule } from './blogs-edit/blogs-edit.module'
import { BlogsViewModule } from './blogs-view/blogs-view.module'
import { MyBlogsModule } from './my-blogs/my-blogs.module'
import { RecentBlogsModule } from './recent-blogs/recent-blogs.module'

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    BlogsEditModule,
    BlogsViewModule,
    MyBlogsModule,
    RecentBlogsModule,

  ],
})
export class BlogsModule { }
