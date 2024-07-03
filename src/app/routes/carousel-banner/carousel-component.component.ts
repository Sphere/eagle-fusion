import { Component, Input, OnInit } from '@angular/core'
import { ScrollService } from '../../services/scroll.service'

@Component({
  selector: 'app-carousel-component',
  templateUrl: './carousel-component.component.html',
  styleUrls: ['./carousel-component.component.scss'],
})
export class CarouselComponentComponent implements OnInit {

  dataCarousel: any = [
    {
      "title": "Check out courses with CNE Hours",
      "titleHi": "सीएनई आवर्स के साथ पाठ्यक्रम देखें",
      "img": "/fusion-assets/images/banner_1_cne.png",
      "scrollEmit": "scrollToCneCourses",
      "bg-color": "#D7AC5C;"
    },
    {
      "title": "Watch tutorials on how sphere works",
      "titleHi": "जानिए स्फीयर कैसे काम करता है",
      "img": "/fusion-assets/images/banner_2.png",
      "scrollEmit": "scrollToHowSphereWorks",
      "bg-color": "#469788;;"
    }
  ]
  @Input() lang: any
  currentIndex = 0;
  private intervalId: any

  // images: string[] = [
  //   'https://example.com/image1.jpg',
  //   'https://example.com/image2.jpg',
  //   'https://example.com/image3.jpg'
  // ];

  currentSlideIndex = 0;

  constructor(
    public scrollService: ScrollService
  ) { }

  ngOnInit(): void {
    this.startCarousel()
  }

  ngOnDestroy(): void {
    this.clearInterval()
  }

  startCarousel(): void {
    this.intervalId = setInterval(() => {
      this.nextSlide()
    }, 3000) // Change slide every 3 seconds (adjust as needed)
  }

  clearInterval(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
    }
  }


  nextSlide(): void {
    this.currentSlideIndex = (this.currentSlideIndex + 1) % this.dataCarousel.length
  }

  prevSlide(): void {
    this.currentSlideIndex = (this.currentSlideIndex - 1 + this.dataCarousel.length) % this.dataCarousel.length
  }

  // scrollToContent(data) {
  //   console.log("emit data", data)
  //   this.scrollService.scrollToDivEvent.emit(data)
  // }

  goToSlide(index: number): void {
    this.currentIndex = index
    this.clearInterval() // Stop automatic sliding when manually navigating
    setTimeout(() => {
      this.currentSlideIndex = index // Set the current slide index manually after a short delay
    }, 0)
  }
  scrollToHowSphereWorks(value: string) {
    this.scrollService.scrollToDivEvent.emit(value)
  }
}