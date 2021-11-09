import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { UserProfileComponent } from './components/user-profile/user-profile.component'
import { ProfileResolverService } from './resolvers/profile-resolver.service'
import { PageResolve } from '../../../../../../../library/ws-widget/utils/src/public-api'
import { ChatbotComponent } from './chatbot/chatbot/chatbot.component'

const routes: Routes = [
  {
    path: 'details',
    component: UserProfileComponent,
    data: {
      pageType: 'feature',
      pageKey: 'edit-profile',
    },
    resolve: {
      profileData: ProfileResolverService,
      pageData: PageResolve,
    },
  },
  {
    path: 'chatbot',
    component: ChatbotComponent,
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [ProfileResolverService],
})
export class UserProfileRoutingModule { }
