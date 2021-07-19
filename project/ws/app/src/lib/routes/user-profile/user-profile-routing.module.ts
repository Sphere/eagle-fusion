import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { ChatbotComponent } from './chatbot/chatbot/chatbot.component'
import { UserProfileComponent } from './components/user-profile/user-profile.component'

const routes: Routes = [
  {
    path: 'details',
    component: UserProfileComponent,
  },
  {
    path: 'chatbot',
    component: ChatbotComponent,
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserProfileRoutingModule { }
