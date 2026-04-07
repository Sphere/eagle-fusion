import { Component, Inject, OnInit } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { LoggerService } from '../../../../library/ws-widget/utils/src/public-api'

@Component({
    standalone: false,
    selector: 'ws-language-dialog',
    templateUrl: './language-dialog.component.html',
    styleUrls: ['./language-dialog.component.scss'],
    
})
export class LanguageDialogComponent implements OnInit {

  preferredLanguageList: any[] = [{ id: 'en', lang: 'English' }, { id: 'hi', lang: 'हिंदी' }]
  languageCheckbox = false
  preferredLanguage = ''

  constructor(
    public dialogRef: MatDialogRef<LanguageDialogComponent>,
    private logger: LoggerService,
    @Inject(MAT_DIALOG_DATA) public selectedData: any
  ) {
  }

  ngOnInit() {
    this.preferredLanguage = this.selectedData.selected
    this.languageCheckbox = this.selectedData.checkbox
  }

  chooseLanguage(data: any) {
    // tslint:disable-next-line:no-console
    this.logger.log(data)
    this.dialogRef.close(data)
  }
  multiLanguage(data: any) {
    // tslint:disable-next-line:no-console
    this.logger.log(data)
    this.dialogRef.close(data)
  }

  onNgModelChange(event: any) {
    // tslint:disable-next-line:no-console
    this.logger.log(event)
    this.preferredLanguage = event
  }
}
