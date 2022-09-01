import { Component, Inject, OnInit } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'

@Component({
  selector: 'ws-language-dialog',
  templateUrl: './language-dialog.component.html',
  styleUrls: ['./language-dialog.component.scss']
})
export class LanguageDialogComponent implements OnInit {

  preferredLanguageList: string[] = ['english', 'हिंदी', 'বাংলা', 'मराठी', 'தமிழ்', 'urdu'];
  languageCheckbox = false;
  preferredLanguage = ''

  constructor(
    public dialogRef: MatDialogRef<LanguageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public selectedData: any,
  ) { }

  ngOnInit() {
    this.preferredLanguage = this.selectedData.selected
  }

  chooseLanguage(data: any) {
    this.dialogRef.close(data)
  }
}
