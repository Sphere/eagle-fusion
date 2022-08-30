import { Component, OnInit } from '@angular/core'

@Component({
  selector: 'ws-language-dialog',
  templateUrl: './language-dialog.component.html',
  styleUrls: ['./language-dialog.component.scss']
})
export class LanguageDialogComponent implements OnInit {

  preferredLanguage: string[] = ['English', 'हिंदी', 'বাংলা', 'मराठी', 'தமிழ்', 'Urdu'];
  languageCheckbox = false;

  constructor() { }

  ngOnInit() {
  }

}
