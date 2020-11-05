import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RecentBlogComponent } from './components/recent-blog.component'
import { BtnSocialLikeModule, BtnPageBackModule, BtnSocialVoteModule } from '@ws-widget/collection'
import {
  MatIconModule,
  MatMenuModule,
  MatToolbarModule,
  MatCardModule,
  MatProgressSpinnerModule,
  MatButtonModule,
  MatFormFieldModule,
  MatInputModule,
} from '@angular/material'
import { RouterModule } from '@angular/router'
import { FormsModule } from '@angular/forms'

@NgModule({
  declarations: [RecentBlogComponent],
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatMenuModule,
    BtnSocialLikeModule,
    RouterModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    BtnPageBackModule,
    BtnSocialVoteModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
  ],
  exports: [RecentBlogComponent],
})
export class RecentBlogsModule { }
