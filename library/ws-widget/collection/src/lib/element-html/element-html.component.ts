import { Component, OnInit, Input } from '@angular/core'
import { NsWidgetResolver, WidgetBaseComponent } from '@ws-widget/resolver'
import { IWidgetElementHtml } from './element-html.model'
import { SafeHtml, DomSanitizer } from '@angular/platform-browser'
import mustache from 'mustache'
import { HttpClient, HttpHeaders } from '@angular/common/http'
@Component({
  selector: 'ws-widget-element-html',
  templateUrl: './element-html.component.html',
  styleUrls: ['./element-html.component.scss'],
})
export class ElementHtmlComponent extends WidgetBaseComponent
  implements OnInit, NsWidgetResolver.IWidgetData<IWidgetElementHtml> {
  @Input() widgetData!: IWidgetElementHtml
  html: SafeHtml | null = null
  constructor(private domSanitizer: DomSanitizer, private http: HttpClient) {
    super()
  }

  async ngOnInit() {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8')
    if (this.widgetData.html) {
      this.html = this.domSanitizer.bypassSecurityTrustHtml(this.widgetData.html)
    } else if (this.widgetData.template && this.widgetData.templateData) {
      this.render(this.widgetData.template, this.widgetData.templateData)
    } else if (this.widgetData.template && this.widgetData.templateDataUrl) {
      try {
        const data = await this.http.get<any>(this.widgetData.templateDataUrl).toPromise()
        this.render(this.widgetData.template, data)
      } catch (er) { }
    } else if (this.widgetData.templateUrl && this.widgetData.templateData) {
      // For template, response needs to be modiefed
      const template = await this.http
        .get<string>(this.widgetData.templateUrl, {
          headers,
        })
        .toPromise()
      this.render(template, this.widgetData.templateData)
    } else if (this.widgetData.templateUrl && this.widgetData.templateDataUrl) {
      try {
        const [template, data] = await Promise.all([
          this.http.get<string>(this.widgetData.templateUrl, { headers }).toPromise(),
          this.http.get<any>(this.widgetData.templateDataUrl).toPromise(),
        ])
        this.render(template, data)
      } catch (er) { }
    }
  }

  render(template: string, templateData: any) {
    const data = {
      ...templateData,
      __pageBase: `.${location.pathname}`.split('#')[0],
    }
    this.html = this.domSanitizer.bypassSecurityTrustHtml(mustache.render(template, data))
  }
}
