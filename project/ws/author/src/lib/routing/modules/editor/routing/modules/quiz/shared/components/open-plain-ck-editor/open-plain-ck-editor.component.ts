import { Component, OnInit, Inject } from '@angular/core'
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog'

interface IData {
  type?: string,
  index?: number,
  content: string,
  identifier: string
}

@Component({
  selector: 'ws-auth-open-plain-ck-editor',
  templateUrl: './open-plain-ck-editor.component.html',
  styleUrls: ['./open-plain-ck-editor.component.scss'],
})
export class OpenPlainCkEditorComponent implements OnInit {

  result = ''

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: IData,
  ) { }

  ngOnInit() {
  }

}
