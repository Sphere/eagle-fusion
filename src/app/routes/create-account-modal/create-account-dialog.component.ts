import { Component, Inject, OnInit } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { DOCUMENT } from '@angular/common'
import { LoggerService } from '../../../../library/ws-widget/utils/src/public-api'

@Component({
  selector: 'ws-create-account-dialog',
  templateUrl: './create-account-dialog.component.html',
  styleUrls: ['./create-account-dialog.component.scss'],
})
export class CreateAccountDialogComponent implements OnInit {

  name = ''
  firstName = ''
  lastName = ''
  userNotExistEkshamta = false
  constructor(
    public dialogRef: MatDialogRef<CreateAccountDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public selectedData: any,
    @Inject(DOCUMENT) private readonly _document: Document,
    private logger: LoggerService
  ) {
  }

  ngOnInit() {
    this.name = this.selectedData.selected
    this.userNotExistEkshamta = this.selectedData.userNotExistEkshamta
    if (this.selectedData.selected === 'name') {
      this.firstName = this.selectedData.details.firstname
      this.lastName = this.selectedData.details.lastname
    }
  }
  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
    }
  }
  showChat() {
    const el = this._document.getElementById('widget')
    if (el) {
      el.style.display = 'block'

      setTimeout(() => {
        const btn = el.querySelector('button') as HTMLElement
        if (btn) {
          const ariaLabel = btn.getAttribute('aria-label')
          if (ariaLabel === 'Open chat') {
            btn.click()
            this.dialogRef.close()
            this.logger.log('Chat opened')
          }
        } else {
          this.logger.warn('Button not found inside widget yet')
        }
      }, 300)
    }
  }


  /* istanbul ignore next */
  backToChatIcon() {
    try {
      const el = this._document.getElementById('widget')
      if (el) {
        el.style.display = 'none'
      }
    } catch (error) {
      // tslint:disable-next-line:no-console
      this.logger.log(error)
    }
  }

  confirm(data: any) {
    // tslint:disable-next-line:no-console
    this.logger.log(data)
    this.dialogRef.close(data)
  }

}
