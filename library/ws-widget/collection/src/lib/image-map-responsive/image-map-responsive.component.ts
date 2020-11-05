import { Component, OnInit, AfterViewInit, OnDestroy, Input, ViewChild, ElementRef } from '@angular/core'
import { fromEvent, Subscription } from 'rxjs'
import { SafeHtml, DomSanitizer } from '@angular/platform-browser'
import { debounceTime } from 'rxjs/operators'
import { WidgetBaseComponent, NsWidgetResolver } from '../../../../resolver/src/public-api'
import { IWidgetImageMap, IWidgetMapMeta, IWidgetScale, IWidgetMapCoords } from './image-map-responsive.model'

@Component({
  selector: 'ws-widget-image-map-responsive',
  templateUrl: './image-map-responsive.component.html',
  styleUrls: ['./image-map-responsive.component.scss'],
})
export class ImageMapResponsiveComponent extends WidgetBaseComponent
  implements OnInit, AfterViewInit, OnDestroy, NsWidgetResolver.IWidgetData<IWidgetImageMap> {
  scale: IWidgetScale = {
    height: 1,
    width: 1,
  }
  htmlContent!: SafeHtml
  initialCoords!: IWidgetMapCoords[]
  coords!: IWidgetMapCoords[]
  isUpdateCoords = true
  private resizeObserver: Subscription | null = null
  interval: any

  @ViewChild('map', { static: false }) mapElem!: ElementRef
  @Input() widgetData!: IWidgetImageMap

  constructor(private domSanitizer: DomSanitizer) {
    super()
  }

  updateCoords() {
    const currentWidth = this.mapElem.nativeElement.width
    const currentHeight = this.mapElem.nativeElement.height
    if (currentHeight) {
      clearInterval(this.interval)
    }
    this.scale.height = currentHeight / this.widgetData.imageHeight
    this.scale.width = currentWidth / this.widgetData.imageWidth
    this.coords.forEach((item, index) => {
      item.x1 = this.initialCoords[index].x1 * this.scale.width
      item.y1 = this.initialCoords[index].y1 * this.scale.height
      item.x2 = this.initialCoords[index].x2 * this.scale.width
      item.y2 = this.initialCoords[index].y2 * this.scale.height
    })
  }

  getInitialCoords() {
    this.initialCoords = this.widgetData.map.map((item: IWidgetMapMeta) => {
      return {
        x1: item.coords[0],
        y1: item.coords[1],
        x2: item.coords[2],
        y2: item.coords[3],
      }
    })
    this.coords = JSON.parse(JSON.stringify(this.initialCoords))
  }

  ngOnInit() {
    if (this.widgetData.externalData) {
      const regex = new RegExp('<map(.*?)>((.|\n)*?)<\/map>', 'gm')
      this.htmlContent =
        this.domSanitizer.bypassSecurityTrustHtml((regex.exec(this.widgetData.externalData as string) as any)[2])
    } else {
      this.getInitialCoords()
    }
  }

  ngAfterViewInit() {
    setTimeout(
      () => {
        if (!this.widgetData.externalData) {
          this.interval = setInterval(() => { this.updateCoords() }, 100)
        }
      },
      500)
    this.resizeObserver = fromEvent(window, 'resize').pipe(debounceTime(500)).subscribe(() => {
      if (!this.widgetData.externalData) {
        this.interval = setInterval(() => { this.updateCoords() }, 100)
      }
    })
  }

  ngOnDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.unsubscribe()
    }
  }

}
