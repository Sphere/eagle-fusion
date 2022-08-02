import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'

@Component({
  selector: 'viewer-toc-modal-component',
  templateUrl: './viewer-toc-modal-component.html',
  styleUrls: ['./viewer-toc-modal-component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class Viewertocmodalcomponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<Viewertocmodalcomponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
  }

}
