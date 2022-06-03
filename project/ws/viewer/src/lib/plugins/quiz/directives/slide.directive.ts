import { Directive, ElementRef, Input, OnInit } from '@angular/core'
declare var $: any
import { QuizService } from '../quiz.service'
/* tslint:disable */
@Directive({
  selector: '[questionSlide]',
})
/* tslint:enable */
export class SlideDirective implements OnInit {

  constructor(public el: ElementRef, public quizService: QuizService) {
    this.quizService.questionState = {
      slides: [],
      active_slide_index: 0,
    }

  }
  @Input() slideIndex!: number
  ngOnInit(): void {
    const index = this.slideIndex
    this.quizService.questionState.slides[index] = this.el.nativeElement
    $(this.el.nativeElement).hide()
    if (index === 0) {
      $(this.el.nativeElement).show()
    }
  }

  // constructor() { }

}
