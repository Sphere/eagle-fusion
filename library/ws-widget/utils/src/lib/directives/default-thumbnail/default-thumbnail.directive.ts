import { Directive, Input, HostListener, HostBinding, OnChanges } from '@angular/core'

@Directive({
  selector: '[wsUtilsDefaultThumbnail]',
})
export class DefaultThumbnailDirective implements OnChanges {

  @Input() wsUtilsDefaultThumbnail = ''
  @Input() src = ''
  isSrcUpdateAttemptedForDefault = false

  @HostBinding('src') srcUrl = ''
  @HostListener('error') updateSrc() {
    if (!this.isSrcUpdateAttemptedForDefault) {
      this.srcUrl = this.wsUtilsDefaultThumbnail
      this.isSrcUpdateAttemptedForDefault = true
    }
  }

  ngOnChanges() {
    if (this.src) {
      this.srcUrl = this.src
    }
  }

}
