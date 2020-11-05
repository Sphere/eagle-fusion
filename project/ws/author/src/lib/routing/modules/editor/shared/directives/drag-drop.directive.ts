import {
  Directive,
  Output,
  EventEmitter,
  HostListener,
  HostBinding,
} from '@angular/core'

@Directive({
  selector: '[wsAuthDragDrop]',
})
export class DragDropDirective {
  @Output() fileDropped = new EventEmitter<any>()
  @HostBinding('style.opacity') public opacity = '1'

  // Dragover listener
  @HostListener('dragover', ['$event']) onDragOver(evt: Event) {
    evt.preventDefault()
    evt.stopPropagation()
    this.opacity = '0.4'

  }
  // Dragleave listener
  @HostListener('dragleave', ['$event']) public onDragLeave(evt: Event) {
    evt.preventDefault()
    evt.stopPropagation()
    this.opacity = '1.0'

  }
  // Drop listener
  @HostListener('drop', ['$event']) public ondrop(evt: any) {
    evt.preventDefault()
    evt.stopPropagation()
    const files = evt.dataTransfer.files[0]
    this.opacity = '1.0'

    if (files) {
      this.fileDropped.emit(files)
    }
  }
}
