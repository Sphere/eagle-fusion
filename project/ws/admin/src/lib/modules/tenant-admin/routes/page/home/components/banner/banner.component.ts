import { Component, OnInit, Input } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { EditBannersDialogComponent } from '../edit-banners-dialog/edit-banners-dialog.component'

@Component({
  selector: 'ws-admin-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss'],
})
export class BannerComponent implements OnInit {

  @Input()
  bannerData!: any
  constructor(
    public editBannersDialog: MatDialog,
  ) { }

  openEditBannerDialog(banner: any): void {
    const dialogRef = this.editBannersDialog.open(EditBannersDialogComponent, {
      height: '600px',
      width: '800px',
      data: { banner },
    })

    dialogRef.afterClosed().subscribe(_result => {
    })
  }

  ngOnInit() {
  }

}
