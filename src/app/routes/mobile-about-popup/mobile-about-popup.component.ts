import { Component, Inject, OnInit } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'

@Component({
  selector: 'ws-mobile-about-popup',
  templateUrl: './mobile-about-popup.component.html',
  styleUrls: ['./mobile-about-popup.component.scss']
})
export class MobileAboutPopupComponent implements OnInit {
  saveBtn = true
  textExceed = true
  aboutForm: FormGroup

  constructor(public dialogRef: MatDialogRef<MobileAboutPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.aboutForm = new FormGroup({
      about: new FormControl()
    })
  }

  ngOnInit() {
    this.aboutForm.patchValue({
      about: this.data
    })
  }

  textChange() {
    this.saveBtn = false
    if (this.aboutForm.value.about.length > 500) {
      this.saveBtn = true
      this.textExceed = false
    }
  }

  onSubmit() {

  }

  closeClick() {
    this.dialogRef.close()
  }
}
