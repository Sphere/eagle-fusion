import { Directive, OnDestroy, OnInit, TemplateRef, ViewContainerRef } from '@angular/core'
import { GlobalPositionStrategy, Overlay, OverlayRef } from '@angular/cdk/overlay'
import { TemplatePortal } from '@angular/cdk/portal'
import { DraggableDirective } from './draggable.directive'
import { Subscription } from 'rxjs'

@Directive({
  selector: '[wsAuthDraggableHelper]',
  exportAs: 'wsAuthDraggableHelper',
})
export class DraggableHelperDirective implements OnInit, OnDestroy {
  private overlayRef!: OverlayRef
  private positionStrategy = new GlobalPositionStrategy()
  private startPosition?: { x: number; y: number }
  subscriptions: Subscription[] = []

  constructor(
    private draggable: DraggableDirective,
    private templateRef: TemplateRef<any>,
    private viewContainerRef: ViewContainerRef,
    private overlay: Overlay,
  ) { }

  ngOnInit(): void {
    this.subscriptions.push(this.draggable.dragStart.subscribe((event: any) => this.onDragStart(event)))
    this.subscriptions.push(this.draggable.dragMove.subscribe((event: any) => this.onDragMove(event)))
    this.subscriptions.push(this.draggable.dragEnd.subscribe(() => this.onDragEnd()))

    this.overlayRef = this.overlay.create({
      positionStrategy: this.positionStrategy,
    })
  }

  unSubscribeEvents() {
    this.subscriptions.forEach(s => s.unsubscribe())
  }

  ngOnDestroy(): void {
    this.unSubscribeEvents()
    this.overlayRef.dispose()
  }

  private onDragStart(event: PointerEvent): void {
    const clientRect = this.draggable.element.nativeElement.getBoundingClientRect()

    this.startPosition = {
      x: event.clientX - clientRect.left,
      y: event.clientY - clientRect.top,
    }

    this.overlayRef.overlayElement.style.width = `${clientRect.width}px`
  }

  private onDragMove(event: PointerEvent): void {
    if (!this.overlayRef.hasAttached()) {
      this.overlayRef.attach(new TemplatePortal(this.templateRef, this.viewContainerRef))
      const rootElement = this.overlayRef.overlayElement.firstChild as HTMLElement
      rootElement.style.width = '100%'
      rootElement.style.boxSizing = 'border-box'
    }
    if (this.startPosition) {
      this.positionStrategy.left(`${event.clientX - this.startPosition.x}px`)
      this.positionStrategy.top(`${event.clientY - this.startPosition.y}px`)
      this.positionStrategy.apply()
    }
  }

  private onDragEnd(): void {
    this.overlayRef.detach()
  }
}
