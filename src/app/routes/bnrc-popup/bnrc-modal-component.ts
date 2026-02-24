import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { LoggerService } from '../../../../library/ws-widget/utils/src/public-api'

@Component({
  selector: 'bnrc-modal-component',
  templateUrl: './bnrc-modal-component.html',
  styleUrls: ['./bnrc-modal-component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class BnrcmodalComponent implements OnInit {

  isMobile = false

  constructor(
    public snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<BnrcmodalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private logger: LoggerService
  ) {
    dialogRef.disableClose = true
    this.logger.log("yes here", this.data.from)
  }

  ngOnInit() {
    this.logger.log("yes here", this.data.from)
  }





  done(value: string) {
    if (value === 'download') {
      window.location.href = 'https://links-ekshamata.aastrika.org'
    } else {
      if (this.data.from === 'Upsmf') {
        window.location.href = 'https://upsmf.aastrika.org/'
      } else {
        window.location.href = 'https://bnrc.aastrika.org/'
      }
    }
  }


}
