import { Component, Inject, OnInit, Renderer2 } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'
import { DOCUMENT } from '@angular/common'

@Component({
  selector: 'ws-create-account-dialog',
  templateUrl: './create-account-dialog.component.html',
  styleUrls: ['./create-account-dialog.component.scss'],
})
export class CreateAccountDialogComponent implements OnInit {

  name = ''
  firstName: string = '';
  lastName: string = '';
  constructor(
    public dialogRef: MatDialogRef<CreateAccountDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public selectedData: any,
    @Inject(DOCUMENT) private _document: Document,
    private _renderer2: Renderer2,
  ) {
  }

  ngOnInit() {
    if (this.selectedData.selected === 'help') {
      this.showSocialChats()
    }
    this.name = this.selectedData.selected
    if (this.selectedData.selected === 'name') {
      console.log("this.selectedData.details.firstName", this.selectedData.details)
      this.firstName = this.selectedData.details.firstname
      this.lastName = this.selectedData.details.lastname
    }


  }

  showSocialChats() {
    try {
      setTimeout(() => {
        window.fcWidget.init()
        window.fcWidget.setConfig({ headerProperty: { hideChatButton: false } })
        window.fcWidget.setConfig({ headerProperty: { direction: 'ltr' } })
      }, 300)
      const script = this._renderer2.createElement('script')
      script.src = '//in.fw-cdn.com/30492305/271953.js'
      this._renderer2.appendChild(this._document.body, script)
    } catch (error) {
      // tslint:disable-next-line:no-console
      console.log(error)
    }
  }
  backToChatIcon() {
    try {
      window.fcWidget.setConfig({ headerProperty: { hideChatButton: true } })
      window.fcWidget.init()
    } catch (error) {
      // tslint:disable-next-line:no-console
      console.log(error)
    }
  }

  confirm(data: any) {
    // tslint:disable-next-line:no-console
    console.log(data)
    this.dialogRef.close(data)
  }

}
