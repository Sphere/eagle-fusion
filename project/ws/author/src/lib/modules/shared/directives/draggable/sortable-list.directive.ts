import {
  Directive,
  AfterContentInit,
  QueryList,
  EventEmitter,
  Output,
  ChangeDetectorRef,
  OnDestroy,
  ContentChildren,
  AfterViewInit,
  ElementRef,
} from '@angular/core'
import { SortableDirective } from './sortable.directive'
import { ScrollHelperService } from './scroll-helper.service'
import { Subscription } from 'rxjs'

export interface ISortEvent {
  currentIndex: number
  newIndex: number
}

export interface IClientRect {
  x: number
  y: number
  width: number
  height: number
  top: number
  right: number
  bottom: number
  left: number
}

const distance = (rectA: ClientRect, rectB: ClientRect): number => {
  return Math.sqrt(Math.pow(rectB.top - rectA.top, 2) + Math.pow(rectB.left - rectA.left, 2))
}

const hCenter = (rect: ClientRect): number => {
  return rect.left + rect.width / 2
}

const vCenter = (rect: ClientRect): number => {
  return rect.top + rect.height / 2
}

@Directive({
  selector: '[wsAuthSortableList]',
})
export class SortableListDirective implements AfterContentInit, OnDestroy, AfterViewInit {
  @ContentChildren(SortableDirective) sortables!: QueryList<SortableDirective>

  @Output() sort = new EventEmitter<ISortEvent>()
  newClientRect: IClientRect = this.resetIClientRect()
  clientRects: ClientRect[] = []
  numberOfSortable = 0
  subscriptions: Subscription[] = []

  constructor(
    private changeDetector: ChangeDetectorRef,
    private elementRef: ElementRef,
    private scrollHelper: ScrollHelperService,

  ) { }

  ngOnDestroy(): void {
    this.changeDetector.detach()
    this.unSubscribeEvents()
  }

  ngAfterViewInit() {
    this.numberOfSortable = this.sortables.length
    this.sortables.changes.subscribe(() => {
      if (this.sortables.length !== this.numberOfSortable) {
        this.unSubscribeEvents()
        this.changeDetector.detectChanges()
        this.numberOfSortable = this.sortables.length
        this.initializeSortable()
      }
    })
  }

  ngAfterContentInit(): void {
    this.initializeSortable()
  }

  initializeSortable() {
    this.sortables.forEach(sortable => {
      this.subscriptions.push(sortable.dragStart.subscribe(() => this.measureClientRects()))
      this.subscriptions.push(sortable.dragMove.subscribe((event: any) => {
        this.scrollHelper.scrollIfNecessary(this.elementRef, event)
        this.detectSorting(sortable, event)
      }))
    })
  }

  unSubscribeEvents() {
    this.subscriptions.forEach(s => s.unsubscribe())
  }

  private measureClientRects() {
    this.clientRects = this.sortables.map(
      (sortable): ClientRect => {
        const clientRect = sortable.element.nativeElement.getBoundingClientRect()
        this.newClientRect = this.resetIClientRect()
        // this.newClientRect = { ...clientRect }
        this.newClientRect.width = clientRect.width
        this.newClientRect.height = clientRect.height
        this.newClientRect.x =
          clientRect.x + this.elementRef.nativeElement.children[0].children[1].scrollLeft
        this.newClientRect.right =
          clientRect.right + this.elementRef.nativeElement.children[0].children[1].scrollLeft
        this.newClientRect.left =
          clientRect.left + this.elementRef.nativeElement.children[0].children[1].scrollLeft
        this.newClientRect.y =
          clientRect.y + this.elementRef.nativeElement.children[0].children[1].scrollTop
        this.newClientRect.top =
          clientRect.top + this.elementRef.nativeElement.children[0].children[1].scrollTop
        this.newClientRect.bottom =
          clientRect.bottom + this.elementRef.nativeElement.children[0].children[1].scrollTop
        return this.newClientRect
      }
    )
  }

  private resetIClientRect(): IClientRect {
    return {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    }
  }

  private detectSorting(sortable: SortableDirective, event: PointerEvent) {
    const currentIndex = this.sortables.toArray().indexOf(sortable)
    const currentRect = this.clientRects[currentIndex]

    this.clientRects
      .slice()
      .sort((rectA, rectB) => distance(rectA, currentRect) - distance(rectB, currentRect))
      .filter(rect => rect !== currentRect)
      .some(rect => {
        const isHorizontal = rect.top === currentRect.top
        const isBefore = isHorizontal ? rect.left < currentRect.left : rect.top < currentRect.top

        const moveBack =
          isBefore && (isHorizontal
            ? event.pageX + this.elementRef.nativeElement.children[0].children[1].scrollLeft <
            hCenter(rect)
            : event.pageY + this.elementRef.nativeElement.children[0].children[1].scrollTop <
            vCenter(rect))

        const moveForward =
          !isBefore &&
          (isHorizontal
            ? event.pageX + this.elementRef.nativeElement.children[0].children[1].scrollLeft >
            hCenter(rect)
            : event.pageY + this.elementRef.nativeElement.children[0].children[1].scrollTop >
            vCenter(rect))

        if (moveBack || moveForward) {
          this.sort.emit({
            currentIndex,
            newIndex: this.clientRects.indexOf(rect),
          })

          return true
        }

        return false
      })
  }
}
