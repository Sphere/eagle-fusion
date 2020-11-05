import {
  Directive,
  EventEmitter,
  HostBinding,
  HostListener,
  Output,
  ElementRef,
} from '@angular/core'

@Directive({
  selector: '[wsAuthDraggable]',
})
export class DraggableDirective {
  @Output() dragStart = new EventEmitter<PointerEvent>()
  @Output() dragMove = new EventEmitter<PointerEvent>()
  @Output() dragEnd = new EventEmitter<PointerEvent>()
  @HostBinding('class.dragging') dragging = false
  pointerId?: number

  @HostListener('pointerdown', ['$event'])
  onPointerDown(event: PointerEvent): void {
    event.preventDefault()
    if (event.button !== 0) {
      return
    }
    this.pointerId = event.pointerId
    this.dragging = true
    this.dragStart.emit(event)
  }

  @HostListener('document:pointermove', ['$event'])
  onPointerMove(event: PointerEvent): void {
    if (!this.dragging || event.pointerId !== this.pointerId) {
      return
    }

    this.dragMove.emit(event)
  }

  @HostListener('document:pointerup', ['$event'])
  onPointerUp(event: PointerEvent): void {
    event.preventDefault()
    if (!this.dragging || event.pointerId !== this.pointerId) {
      return
    }
    this.dragging = false
    this.dragEnd.emit(event)
  }
  constructor(public element: ElementRef) {}
}
