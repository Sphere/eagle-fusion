import { Component, Inject, OnInit } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'

@Component({
  selector: 'ws-app-app-toc-desktop-modal',
  templateUrl: './app-toc-desktop-modal.component.html',
  styleUrls: ['./app-toc-desktop-modal.component.scss']
})
export class AppTocDesktopModalComponent implements OnInit {
  cometencyData: any
  constructor(
    public dialogRef: MatDialogRef<AppTocDesktopModalComponent>,
    @Inject(MAT_DIALOG_DATA) public content: any,
  ) { }

  ngOnInit() {

    if (this.content.type === 'COMPETENCY') {

      this.cometencyData = {
        name: this.content.competency[0].competencyName,
        levels: this.content.levels
      }
    }
  }

}
