import { Component, Inject, OnInit } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'
import { forEach } from 'lodash'

@Component({
  selector: 'ws-app-app-toc-desktop-modal',
  templateUrl: './app-toc-desktop-modal.component.html',
  styleUrls: ['./app-toc-desktop-modal.component.scss'],
})
export class AppTocDesktopModalComponent implements OnInit {
  cometencyData: { name: any; levels: string }[] = []
  constructor(
    public dialogRef: MatDialogRef<AppTocDesktopModalComponent>,
    @Inject(MAT_DIALOG_DATA) public content: any,
  ) { }

  ngOnInit() {
    if (this.content.type === 'COMPETENCY') {
      this.competencyData(this.content.competency)
    }
  }

  competencyData(data: any) {
    // let competencyData: { name: any; levels: string }[] = []
    forEach(JSON.parse(data), (value: any) => {
      this.cometencyData.push(
        {
          name: value.competencyName,

          levels: value.level ? ` Level ${value.level}` : `Levels data not found!`,
        }
      )
    })
    console.log('inside', this.cometencyData, 'name')
    return this.cometencyData
  }

}
