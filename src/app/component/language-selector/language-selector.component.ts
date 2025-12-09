import { Component } from '@angular/core'
import { LanguageService } from 'src/app/services/language.service'

@Component({
  selector: 'app-language-selector',
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.scss']
})
export class LanguageSelectorComponent {
  languages: any[]
  currentLanguage$ = this.languageService.currentLanguage$

  constructor(private languageService: LanguageService) {
    this.languages = this.languageService.getAvailableLanguages()
  }

  onLanguageChange(event: any): void {
    this.languageService.setLanguage(event.target.value)
  }
}
