import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SocialSearchComponent } from './social-search.component'
import { FormsModule } from '@angular/forms'
import { MatIconModule, MatRadioModule, MatCardModule, MatSidenavModule, MatToolbarModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatRippleModule, MatMenuModule, MatExpansionModule, MatCheckboxModule, MatListModule, MatTabsModule, MatButtonToggleModule, MatDividerModule, MatProgressSpinnerModule } from '@angular/material'
import { RouterModule } from '@angular/router'
import { SocialSearchRoutingModule } from './social-search-routing.module'

import { BtnPageBackModule, BtnSocialVoteModule, BtnSocialLikeModule } from '../../../../../../../../../library/ws-widget/collection/src/public-api'
import { ForumHandlerService } from '../forums/service/EmitterService/forum-handler.service'
import { SearchFilterDisplayComponent } from './widgets/search-filter-display/search-filter-display.component'

@NgModule({
  declarations: [SocialSearchComponent, SearchFilterDisplayComponent],
  imports: [
    FormsModule,
    CommonModule,
    MatIconModule,
    MatRadioModule,
    MatCardModule,
    BtnSocialVoteModule,
    BtnSocialLikeModule,
    SocialSearchRoutingModule,
    MatProgressSpinnerModule,
    BtnPageBackModule,
    MatSidenavModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatRippleModule,
    MatMenuModule,
    MatExpansionModule,
    MatCheckboxModule,
    MatListModule,
    RouterModule,
    MatTabsModule,
    MatButtonToggleModule,
    MatDividerModule,

  ],
  providers: [ForumHandlerService],
  exports: [SocialSearchComponent],
})
export class SocialSearchModule {
  constructor() {
    // console.log('Social Search Module Called')
  }

}
