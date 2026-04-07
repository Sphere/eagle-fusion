import { Component, Directive, Input, NgModule } from '@angular/core'

@Component({
    standalone: false,
    selector: 'mde-popover',
    template: '<ng-content></ng-content>',
    exportAs: 'mdePopover',
})
export class MdePopover {
  @Input() mdePopoverOverlapTrigger = false
  @Input() mdeFocusTrapEnabled = true
  @Input() mdePopoverEnterDelay = 0
  @Input() mdePopoverLeaveDelay = 0
  @Input() mdePopoverArrowWidth = 0
  @Input() mdePopoverOffsetX = 0
  @Input() mdePopoverOffsetY = 0
}

@Directive({
    standalone: false,
    selector: '[mdePopoverTriggerFor]',
    exportAs: 'mdePopoverTrigger',
})
export class MdePopoverTrigger {
  @Input('mdePopoverTriggerFor') popover: any
  @Input() mdePopoverTriggerOn = 'click'
  @Input() mdePopoverEnterDelay = 0
  @Input() mdePopoverLeaveDelay = 0
  @Input() mdePopoverArrowWidth = 0
  @Input() mdePopoverOffsetX = 0
  @Input() mdePopoverOffsetY = 0
}

@NgModule({
  declarations: [MdePopover, MdePopoverTrigger],
  exports: [MdePopover, MdePopoverTrigger],
})
export class MdePopoverModule { }
