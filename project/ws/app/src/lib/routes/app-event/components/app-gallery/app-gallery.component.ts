import { Component, OnInit, OnDestroy } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { ValueService } from '@ws-widget/utils'
import { Subscription } from 'rxjs'

@Component({
  selector: 'ws-app-app-gallery',
  templateUrl: './app-gallery.component.html',
  styleUrls: ['./app-gallery.component.scss'],
})
export class AppGalleryComponent implements OnInit, OnDestroy {
  data: any
  imageData =
    [
      ['https://www.gstatic.com/webp/gallery/5.webp',
        'https://www.gstatic.com/webp/gallery/1.webp',
      ],
      [
        'https://www.gstatic.com/webp/gallery/3.webp',
        'https://www.gstatic.com/webp/gallery/4.webp',
      ],
    ]
  imageGallery: string[] = []
  error = false
  screenSubscription: Subscription | null = null
  noOfCol = 2
  isOpened = false
  currentIndex = 0
  constructor(
    private activatedRoute: ActivatedRoute,
    private valSvc: ValueService,
  ) { }
  ngOnInit() {
    this.screenSubscription = this.valSvc.isLtMedium$.subscribe(isLtSMed => {
      if (isLtSMed) {
        this.noOfCol = 1
      } else {
        this.noOfCol = 2
      }
    })
    this.activatedRoute.data.subscribe((data: any) => {
      if (data.eventdata && data.eventdata.data) {
        this.data = data.eventdata.data.Home
        this.imageData = data.eventdata.data.Gallery
      } else if (!data.eventdata || data.eventdata.error) {
        this.error = true
      }
    })
  }

  ngOnDestroy() {
    if (this.screenSubscription) {
      this.screenSubscription.unsubscribe()
    }
  }

  slideTo(index: number) {
    if (index >= 0 && index < this.imageGallery.length) {
      this.currentIndex = index
    } else
      if (index === this.imageGallery.length) {
        this.currentIndex = 0
      } else {
        this.currentIndex = this.imageGallery.length + index
      }
  }

  openGallery(action: boolean, imageArray?: string[]) {
    this.isOpened = action
    if (imageArray && imageArray.length > 0) {
      this.imageGallery = imageArray
    }
  }
}
