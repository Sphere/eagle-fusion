import { Directive, ElementRef, Input, OnInit } from '@angular/core'
// import * as $ from 'jquery'
declare var $: any

@Directive({
  selector: '[viewerSlide]'
})
export class SlideDirective implements OnInit {
  feedbackState: any
  constructor(public el: ElementRef) {
    this.feedbackState = {
      slides: [],
      active_slide_index: 0
    }
  }
  @Input() slideIndex!: number
  ngOnInit(): void {
    const index = this.slideIndex
    this.feedbackState.slides[index] = this.el.nativeElement
    $(this.el.nativeElement).hide()
    if (index === 0) {
      $(this.el.nativeElement).show()
    }
    console.log(this.feedbackState)
  }

  // constructor() { }

}
