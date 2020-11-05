import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core'
import { ICustomCreateEntity } from './../../interface/create-menu'

@Component({
  selector: 'ws-auth-collection-matmenu',
  templateUrl: './auth-collection-matmenu.component.html',
  styleUrls: ['./auth-collection-matmenu.component.scss'],
})
export class AuthCollectionMatmenuComponent implements OnInit {
  @Output() action = new EventEmitter<{ action: string; type?: string }>()
  @Input() type!: string
  @Input() childType!: ICustomCreateEntity[]
  @ViewChild('childMenu', { static: true }) public childMenu!: any

  constructor() {}

  ngOnInit() {}

  click(action: string, type?: string) {
    this.action.emit({ action, type })
  }
}
