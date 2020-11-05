import { Component, Input, OnInit, OnDestroy } from '@angular/core'
import { EventService } from '@ws-widget/utils'
import 'brace'
import 'brace/ext/language_tools'
import 'brace/mode/css'
import 'brace/mode/html'
import 'brace/mode/javascript'
import 'brace/mode/text'
import 'brace/snippets/css'
import 'brace/snippets/html'
import 'brace/snippets/javascript'
import 'brace/snippets/text'
import 'brace/theme/cobalt'
import 'brace/worker/css'
import 'brace/worker/html'
import 'brace/worker/javascript'
import { IHtmlPicker } from './html-picker.model'

@Component({
  selector: 'viewer-plugin-html-picker',
  templateUrl: './html-picker.component.html',
  styleUrls: ['./html-picker.component.scss'],
})
export class HtmlPickerComponent implements OnInit, OnDestroy {
  @Input() identifier: string | null = null
  @Input() newData: IHtmlPicker = {
    question: '',
    htmlPresent: false,
    cssPresent: false,
    javascriptPresent: false,
    html: '',
    css: '',
    javascript: '',
    cdnLinks: [],
  }
  options: any = {
    maxLines: 1000,
    printMargin: false,
    enableBasicAutocompletion: true,
    enableSnippets: true,
    enableLiveAutocompletion: true,
    showInvisibles: true,
  }
  firstInput = true
  isInput = false
  inputInterval: any
  firstClick = true
  isClick = false
  clickInterval: any
  constructor(
    private eventSvc: EventService,
  ) { }

  ngOnInit() {
    // //console.log(this.newData)
  }
  ngOnDestroy() {
    if (this.inputInterval) {
      clearInterval(this.inputInterval)
    }
    if (this.clickInterval) {
      clearInterval(this.clickInterval)
    }
  }

  onChange() {
    this.update()
  }

  raiseInputChange() {
    this.isInput = true
    if (this.isInput && this.firstInput) {
      this.raiseInteractTelemetry('editor', 'codeinput')
      this.startInputTimer()
    }
    this.firstInput = false
  }
  raiseClickEvent() {
    this.isClick = true
    if (this.isClick && this.firstClick) {
      this.raiseInteractTelemetry('editor', 'buttonclick')
      this.startClickTimer()
    }
    this.firstClick = false

  }
  update() {
    let htmlContent = ''
    let cssContent = ''
    let jsContent = ''
    let cdnLinks = []
    if (this.newData) {
      htmlContent = this.newData.html || ''
      cssContent = this.newData.css || ''
      jsContent = this.newData.javascript || ''
      cdnLinks = this.newData.cdnLinks || []
    }
    if (this.newData && (!this.newData.htmlPresent)) {
      htmlContent = ''
    }
    if (this.newData && (!this.newData.cssPresent)) {
      cssContent = ''
    }
    if (this.newData && (!this.newData.javascriptPresent)) {
      jsContent = ''
    }
    while (htmlContent.indexOf('//') !== -1) {
      htmlContent =
        htmlContent.slice(0, htmlContent.indexOf('//')) +
        htmlContent.slice(htmlContent.indexOf('\n', htmlContent.indexOf('//')))
    }
    for (let i = 0; i < htmlContent.length; i += 1) {
      htmlContent = htmlContent.replace('\'', 'replacedPlaceHolder')
    }
    for (let i = 0; i < htmlContent.length; i += 1) {
      htmlContent = htmlContent.replace('replacedPlaceHolder', '\\\'')
    }
    for (let i = 0; i < cssContent.length; i += 1) {
      cssContent = cssContent.replace('\'', 'replacedPlaceHolder')
    }
    for (let i = 0; i < cssContent.length; i += 1) {
      cssContent = cssContent.replace('replacedPlaceHolder', '\\\'')
    }
    while (jsContent.indexOf('//') !== -1) {
      jsContent =
        jsContent.slice(0, jsContent.indexOf('//')) + jsContent.slice(jsContent.indexOf('\n', jsContent.indexOf('//')))
    }
    for (let i = 0; i < jsContent.length; i += 1) {
      jsContent = jsContent.replace('\'', 'replacedPlaceHolder')
    }
    for (let i = 0; i < jsContent.length; i += 1) {
      jsContent = jsContent.replace('replacedPlaceHolder', '\\\'')
    }
    // const htmlContentNew = htmlContent.replace('<', '<style>' + cssContent + '</style><');
    // const doc: HTMLIFrameElement = <HTMLIFrameElement>document.getElementById('my-output');
    // doc.src = 'javascript:\'' + htmlContentNew + '\<script>' + jsContent + '\<\/script>' + '\'';
    const doc: HTMLIFrameElement = document.getElementById('my-output') as HTMLIFrameElement
    doc.src = `javascript:\'${htmlContent}\'`
    let iframeDoc: Document = new Document()
    if (doc.contentWindow) {
      iframeDoc = doc.contentWindow.document
    }
    cdnLinks.forEach(ele => {
      if (ele.src) {
        const src = ele.src
        // if ((document.getElementsByTagName('base')[0] || {})['href'].indexOf('localhost') < 0) {
        //   if (src.startsWith('http://')) {
        //     src.replace('http://', `${(document.getElementsByTagName('base')[0] || {})['href']}cdn/`);
        //   } else {
        //     src.replace('https://', `${(document.getElementsByTagName('base')[0] || {})['href']}cdn/`);
        //   }
        // }
        const child = iframeDoc.createElement(ele.type === 'css' ? 'link' : 'script')
        child.setAttribute(ele.type === 'css' ? 'href' : 'src', src); if (ele.type === 'css') {
          child.setAttribute('rel', 'stylesheet')
        }
        setTimeout(() => {
          iframeDoc.head.appendChild(child)
        })
      }
    }); if (jsContent) {
      const executeJS = iframeDoc.createElement('script')
      let inlineScript = new Text
      if (this.newData) {
        inlineScript = iframeDoc.createTextNode(this.newData.javascript)
      }
      executeJS.appendChild(inlineScript)
      iframeDoc.body.appendChild(executeJS)
    }
    if (cssContent) {
      const css = iframeDoc.createElement('style')
      // css.type = 'text/css'
      css.innerHTML = cssContent
      iframeDoc.head.appendChild(css)
    }
  }
  raiseInteractTelemetry(action: string, event: string) {
    if (this.identifier) {
      this.eventSvc.raiseInteractTelemetry(action, event, {
        contentId: this.identifier,
      })
    }
    if (event === 'codeinput') {
      this.isInput = false
    }
    if (event === 'buttonclick') {
      this.isClick = false
    }
  }
  startInputTimer() {
    this.inputInterval = setInterval(() => {
      if (this.isInput) {
        this.raiseInteractTelemetry('editor', 'codeinput')
      }
    },                               2 * 60000)
  }
  startClickTimer() {
    this.clickInterval = setInterval(() => {
      if (this.isClick) {
        this.raiseInteractTelemetry('editor', 'buttonclick')
      }
    },                               2 * 60000)
  }

}
