import { Component, Directive, Input, NgModule } from '@angular/core'

@Component({
  selector: 'mde-popover',
  template: '<ng-content></ng-content>',
  exportAs: 'mdePopover'
})
export class MdePopover {
  @Input() mdePopoverOverlapTrigger: boolean = false;
  @Input() mdeFocusTrapEnabled: boolean = true;
  @Input() mdePopoverEnterDelay: number = 0;
  @Input() mdePopoverLeaveDelay: number = 0;
  @Input() mdePopoverArrowWidth: number = 0;
  @Input() mdePopoverOffsetX: number = 0;
  @Input() mdePopoverOffsetY: number = 0;
}

@Directive({
  selector: '[mdePopoverTriggerFor]',
  exportAs: 'mdePopoverTrigger'
})
export class MdePopoverTrigger {
  @Input('mdePopoverTriggerFor') popover: any
  @Input() mdePopoverTriggerOn: string = 'click';
  @Input() mdePopoverEnterDelay: number = 0;
  @Input() mdePopoverLeaveDelay: number = 0;
  @Input() mdePopoverArrowWidth: number = 0;
  @Input() mdePopoverOffsetX: number = 0;
  @Input() mdePopoverOffsetY: number = 0;
}

@NgModule({
  declarations: [MdePopover, MdePopoverTrigger],
  exports: [MdePopover, MdePopoverTrigger]
})
export class MdePopoverModule { }
