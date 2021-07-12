import { Component, OnInit } from '@angular/core'
import { HttpClient } from '@angular/common/http'

@Component({
  selector: 'ws-app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss'],
})
export class ChatbotComponent implements OnInit {

  nextId: any
  _chatFormValue: any
  chatUrl = '/fusion-assets/files/Registation-chatbot-model.json'
  chatObj: any = []
  chatArray: any = []
  outputArea: any

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.http.get(this.chatUrl).subscribe(data => {
      this.chatObj = data
      this.chatArray = this.chatObj.regOption.profiledetails[0]
    })
    this.outputArea = document.getElementById('#chat-output') as unknown as HTMLDocument

  }
  getChatResponse(_chatFormValue: { replymsg: any }) {
    const v = this.validateResponse()
    const message = _chatFormValue.replymsg
    this.outputArea.appendchild(`<div class='bot-message'><div class='message'>
          ${message}
        </div>
      </div>`)
    if (v) {
      this.nextId = this.chatArray.action['submit']
      const currentData = this.chatObj.regOption.profiledetails.filter((data: { id: any }) => data.id === this.nextId)
      this.chatArray = currentData
    }
    this.sendQuestion()
  }
  sendQuestion() {
    // send next question use chatArray.title
  }
  validateResponse() {
    if (this._chatFormValue.replymsg) {
      return true
    }
    return false
  }
}
