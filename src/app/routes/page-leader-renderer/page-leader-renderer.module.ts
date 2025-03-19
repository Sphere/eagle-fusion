import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { PageLeaderRendererRoutingModule } from './page-leader-renderer-routing.module'
import { AboutComponent } from './components/about/about.component'
import { ArticlesComponent } from './components/articles/articles.component'
import { CommunicationsComponent } from './components/communications/communications.component'
import { ConversationsComponent } from './components/conversations/conversations.component'
import { DiscussComponent } from './components/discuss/discuss.component'
import { LandingComponent } from './components/landing/landing.component'
import { SendMailDialogComponent } from './components/send-mail-dialog/send-mail-dialog.component'
import { TweetsComponent } from './components/tweets/tweets.component'
import { FormsModule } from '@angular/forms'
import { BtnPageBackModule, DiscussionForumModule } from '@ws-widget/collection'

import { MatIconModule } from '@angular/material/icon'
import { MatCardModule } from '@angular/material/card'
import { MatDividerModule } from '@angular/material/divider'
import { MatTabsModule } from '@angular/material/tabs'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatDialogModule } from '@angular/material/dialog'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { MatInputModule } from '@angular/material/input'

import { WidgetResolverModule } from '../../../../library/ws-widget/resolver/src/public-api'

@NgModule({
  declarations: [
    AboutComponent,
    ArticlesComponent,
    CommunicationsComponent,
    ConversationsComponent,
    DiscussComponent,
    LandingComponent,
    SendMailDialogComponent,
    TweetsComponent,
  ],
  imports: [
    CommonModule,
    PageLeaderRendererRoutingModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatTabsModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatDialogModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatInputModule,
    FormsModule,
    WidgetResolverModule,
    BtnPageBackModule,
    DiscussionForumModule,
  ],
  exports: [LandingComponent],
  entryComponents: [SendMailDialogComponent],
})
export class PageLeaderRendererModule { }
