import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MyBlogComponent } from './components/my-blog.component'
import { MatToolbarModule, MatIconModule, MatTabsModule, MatButtonModule } from '@angular/material'
import { RouterModule } from '@angular/router'
import { BlogsResultModule } from '../blogs-result/blogs-result.module'
import { BtnPageBackModule } from '@ws-widget/collection'

@NgModule({
  declarations: [MyBlogComponent],
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    RouterModule,
    MatTabsModule,
    BlogsResultModule,
    MatButtonModule,
    BtnPageBackModule,
  ],
  exports: [MyBlogComponent],
})
export class MyBlogsModule { }
