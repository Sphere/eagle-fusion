import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'
import { DialogSocialDeletePostComponent } from '../../dialog/dialog-social-delete-post/dialog-social-delete-post.component'

@Component({
  selector: 'ws-widget-btn-social-delete',
  templateUrl: './btn-social-delete.component.html',
  styleUrls: ['./btn-social-delete.component.scss'],
})
export class BtnSocialDeleteComponent implements OnInit {
  @Input() postId = ''
  @Output() deleteStatus = new EventEmitter<'success' | 'failure'>()
  constructor(public dialog: MatDialog) { }

  ngOnInit() { }

  confirmDelete() {
    const dialogRef = this.dialog.open(DialogSocialDeletePostComponent, {
      data: { postId: this.postId },
    })
    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        this.deleteStatus.emit('success')
      } else {
        this.deleteStatus.emit('failure')
      }
    })
  }
}
