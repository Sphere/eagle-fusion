import { Component, Input, Output, EventEmitter, OnChanges, OnInit } from '@angular/core'
import { NsTnc } from '../../models/tnc.model'
import { ConfigurationsService } from '../../../../library/ws-widget/utils/src/lib/services/configurations.service'

@Component({
  selector: 'ws-tnc-renderer',
  templateUrl: './tnc-renderer.component.html',
  styleUrls: ['./tnc-renderer.component.scss'],
})
export class TncRendererComponent implements OnInit, OnChanges {

  @Input() tncData: NsTnc.ITnc | null = null
  @Output() tncChange = new EventEmitter<string>()
  @Output() dpChange = new EventEmitter<string>()

  generalTnc: NsTnc.ITncUnit | null = null
  dpTnc: NsTnc.ITncUnit | null = null
  termsOfUser = true

  // UI Vars
  currentPanel: 'tnc' | 'dp' = 'tnc'
  constructor(private configSvc: ConfigurationsService) {
    if (this.configSvc.restrictedFeatures) {
      if (this.configSvc.restrictedFeatures.has('termsOfUser')) {
        this.termsOfUser = false
      }
    }
  }

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

  changeTncLang(locale: string) {
    this.tncChange.emit(locale)
  }
  changeDpLang(locale: string) {
    this.dpChange.emit(locale)
  }

}
