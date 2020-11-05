import { BreakpointObserver } from '@angular/cdk/layout'
import { Directive, HostBinding, Input, OnChanges, OnDestroy } from '@angular/core'
import { Subscription } from 'rxjs'
import { distinctUntilChanged } from 'rxjs/operators'

export interface IImageResponsiveUnit {
  [key: string]: string
}

const customBreakPoints = {
  xs: '(max-width: 450px)',
  s: '(min-width: 450.001px) and (max-width: 768px)',
  m: '(min-width: 768.001px) and (max-width: 1024px)',
  l: '(min-width: 1024.001px) and (max-width: 1400px)',
  xl: '(min-width: 1400.001px) and (max-width: 1920px)',
  xxl: '(min-width: 1920.001px)',
}

@Directive({
  selector: '[wsUtilsImageResponsive]',
})
export class ImageResponsiveDirective implements OnChanges, OnDestroy {

  @Input() src: IImageResponsiveUnit | null = null
  @HostBinding('src') srcBindUrl = ''

  currentSize = ''
  breakpointSubscription: Subscription | null = null
  constructor(
    private breakpointObserver: BreakpointObserver,
  ) {
    this.breakpointSubscription = this.breakpointObserver
      .observe([
        customBreakPoints.xs,
        customBreakPoints.s,
        customBreakPoints.m,
        customBreakPoints.l,
        customBreakPoints.xl,
        customBreakPoints.xxl,
      ])
      .pipe(distinctUntilChanged())
      .subscribe(data => {
        // //console.log('data >',  data)
        if (data.breakpoints[customBreakPoints.xxl]) {
          this.currentSize = 'xxl'
        } else if (data.breakpoints[customBreakPoints.xl]) {
          this.currentSize = 'xl'
        } else if (data.breakpoints[customBreakPoints.l]) {
          this.currentSize = 'l'
        } else if (data.breakpoints[customBreakPoints.m]) {
          this.currentSize = 'm'
        } else if (data.breakpoints[customBreakPoints.s]) {
          this.currentSize = 's'
        } else if (data.breakpoints[customBreakPoints.xs]) {
          this.currentSize = 'xs'
        } else {
          this.currentSize = 'xl'
        }
        this.setSrc()
      })
  }

  ngOnChanges() {
    if (this.src) {
      this.setSrc()
    }
  }

  ngOnDestroy() {
    if (this.breakpointSubscription) {
      this.breakpointSubscription.unsubscribe()
    }
  }

  private setSrc() {
    if (
      this.currentSize &&
      this.src &&
      this.src[this.currentSize]
    ) {
      this.srcBindUrl = this.src[this.currentSize]
    }
  }

}
