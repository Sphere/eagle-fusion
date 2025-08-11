import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button'
import { MatIconModule } from '@angular/material/icon'
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list'
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip'
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card'
import { MatDividerModule } from '@angular/material/divider'
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner'
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog'
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs'
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator'
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar'

import { PersonProfileRoutingModule } from './person-profile-routing.module'
import { PersonProfileComponent } from './components/person-profile/person-profile.component'
import { UserDetailsComponent } from './components/user-details/user-details.component'
import { HorizontalScrollerModule } from '@ws-widget/utils/src/lib/helpers/horizontal-scroller/horizontal-scroller.module'
import { UserKbComponent } from './components/user-kb/user-kb.component'
import { DefaultThumbnailModule, PipeLimitToModule } from '@ws-widget/utils'
import { UserPlaylistComponent } from './components/user-playlist/user-playlist.component'
import { ProfileBlogComponent } from './components/profile-blog/profile-blog.component'
import { ContentReviewedComponent } from './components/content-reviewed/content-reviewed.component'
import { UserQnaComponent } from './components/user-qna/user-qna.component'
import { UserdetailallComponent } from './components/userdetailall/userdetailall.component'
import { UserGoalsComponent } from './components/user-goals/user-goals.component'
import { BtnPageBackModule } from '@ws-widget/collection/src/lib/btn-page-back/btn-page-back.module'
// import { BtnFollowModule } from '@ws-widget/collection/src/public-api'
import { LastLearntComponent } from './components/last-learnt/last-learnt.component'
import { ViewFollowpersonComponent } from './components/view-followperson/view-followperson.component'
import { FollowListComponent } from './components/follow-list/follow-list.component'
import { ProfileSettingsComponent } from './module/profile-settings/profile-settings.component'
import { ContentAuthoredComponent } from './components/content-authored/content-authored.component'
import { MyContentService } from '../../../../../author/src/lib/routing/modules/my-content/services/my-content.service'
import { AuthInitService } from '../../../../../author/src/lib/services/init.service'
import { ApiService, AccessControlService } from '../../../../../author/src/public-api'
import { FollowingListComponent } from './components/following-list/following-list.component'

@NgModule({
    declarations: [
        PersonProfileComponent,
        UserKbComponent,
        UserPlaylistComponent,
        UserDetailsComponent,
        ProfileBlogComponent,
        ContentReviewedComponent,
        UserQnaComponent,
        UserdetailallComponent,
        UserGoalsComponent,
        LastLearntComponent,
        ViewFollowpersonComponent,
        FollowListComponent,
        ProfileSettingsComponent,
        ContentAuthoredComponent,
        FollowingListComponent,
    ],
    imports: [
        CommonModule,
        PersonProfileRoutingModule,
        MatButtonModule,
        MatTooltipModule,
        MatIconModule,
        MatListModule,
        MatSidenavModule,
        MatToolbarModule,
        BtnPageBackModule,
        MatCardModule,
        MatChipsModule,
        MatDialogModule,
        MatDividerModule,
        MatTabsModule,
        MatPaginatorModule,
        MatSlideToggleModule,
        MatExpansionModule,
        MatSnackBarModule,
        HorizontalScrollerModule,
        DefaultThumbnailModule,
        PipeLimitToModule,
        MatProgressSpinnerModule,
        // BtnFollowModule,
    ],
    exports: [UserdetailallComponent, ProfileSettingsComponent],
    providers: [MyContentService, AuthInitService, ApiService, AccessControlService]
})
export class PersonProfileModule { }
