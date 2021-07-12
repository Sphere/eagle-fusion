import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ChatbotComponent } from './chatbot/chatbot.component'
import { FormsModule } from '@angular/forms'

@NgModule({
  declarations: [ChatbotComponent],
  imports: [CommonModule,
    FormsModule],
  exports: [ChatbotComponent],
})
export class ChatbotModule { }
