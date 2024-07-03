import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'

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

  ) {
    dialogRef.disableClose = true
    console.log("yes here", this.data.from)
  }

  ngOnInit() {
    console.log("yes here", this.data.from)
  }





  done(value: string) {
    if (value === 'download') {
      window.location.href = 'https://bit.ly/E-kshamataApp'
    } else {
      if (this.data.from === 'Upsmf') {
        window.location.href = 'https://upsmf.aastrika.org/'
      } else {
        window.location.href = 'https://bnrc.aastrika.org/'
      }
    }
  }


}
