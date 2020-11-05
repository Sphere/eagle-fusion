import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { IActionButtonConfig } from '@ws/author/src/lib/interface/action-button'

/**
 * @description
 * Display the action buttons in the editor which allows user to click save or send for review or preview and so many other options
 *
 * @export
 * @class AuthEditorActionButtonsComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'ws-auth-editor-action-buttons',
  templateUrl: './auth-editor-action-buttons.component.html',
  styleUrls: ['./auth-editor-action-buttons.component.scss'],
})
export class AuthEditorActionButtonsComponent implements OnInit {
  @Input() buttonConfig: IActionButtonConfig | null = null
  @Output() action = new EventEmitter<string>()
  showSettingButtons = true
  constructor() {}

  ngOnInit() {
    this.showSettingButtons = this.buttonConfig && this.buttonConfig.enabled ? true : false
  }
}
