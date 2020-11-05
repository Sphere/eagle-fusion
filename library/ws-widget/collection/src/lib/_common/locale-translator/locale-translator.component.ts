import { Component, OnInit, Input } from '@angular/core'

@Component({
  selector: 'ws-widget-locale-translator',
  templateUrl: './locale-translator.component.html',
  styleUrls: ['./locale-translator.component.scss'],
})
export class LocaleTranslatorComponent implements OnInit {

  @Input() langCode = ''
  constructor() { }

  ngOnInit() {
  }

}
