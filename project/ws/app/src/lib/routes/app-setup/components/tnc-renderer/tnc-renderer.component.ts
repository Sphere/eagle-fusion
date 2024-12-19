import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core'
import { NsTnc } from '../../../../../../../../../src/app/models/tnc.model'
import { MatSelectChange } from '@angular/material/select'

@Component({
  selector: 'ws-app-tnc-renderer',
  templateUrl: './tnc-renderer.component.html',
  styleUrls: ['./tnc-renderer.component.scss'],
})
export class TncRendererComponent implements OnInit, OnChanges {

  @Input() tncData: NsTnc.ITnc | null = null
  @Output() tncChange = new EventEmitter<string>()
  @Output() dpChange = new EventEmitter<string>()

  generalTnc: NsTnc.ITncUnit | null = null
  dpTnc: NsTnc.ITncUnit | null = null

  // UI Vars
  currentPanel: 'tnc' | 'dp' = 'tnc'
  constructor() { }

  ngOnInit() {
    if (this.tncData) {
      const tncData = this.tncData
      this.assignGeneralAndDp()
      if (!tncData.isAccepted && this.dpTnc && !this.dpTnc.isAccepted) {
        this.currentPanel = 'dp'
      }
      if (!tncData.isAccepted && this.generalTnc && !this.generalTnc.isAccepted) {
        this.currentPanel = 'tnc'
      }
    }
  }
  isLocaleAvailable(code: string) {
    if (this.generalTnc && this.generalTnc.availableLanguages && this.generalTnc.availableLanguages.includes(code)) {
      return true
    } return false
  }

  ngOnChanges() {
    if (this.tncData) {
      this.assignGeneralAndDp()
    }
  }
  private assignGeneralAndDp() {
    if (this.tncData) {

      this.tncData.termsAndConditions.forEach(tnc => {
        if (tnc.name === 'Generic T&C') {
          this.generalTnc = tnc
        } else {
          this.dpTnc = tnc
        }
      })
    }
  }

  reCenterPanel() {
    const tncPointer = document.getElementById('tnc')
    if (tncPointer) {
      tncPointer.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }

  changeTncLang(locale: MatSelectChange) {
    this.tncChange.emit(locale.value)
    // this.dpChange.emit(locale.value)
  }

}
