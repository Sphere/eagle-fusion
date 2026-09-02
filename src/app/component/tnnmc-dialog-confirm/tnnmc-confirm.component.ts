import { Component, Inject } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { Router } from '@angular/router'

@Component({
    standalone: false,
    selector: 'ws-tnnmc-confirm',
    templateUrl: './tnnmc-confirm.component.html',
    styleUrls: ['./tnnmc-confirm.component.scss'],
    
})
export class TnnmcConfirmComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { title: string, body: string },
    private readonly dialogRef: MatDialogRef<TnnmcConfirmComponent>,
    private readonly router: Router,
  ) { }

  confirmed() {
    this.router.navigate(['public/login'])
    this.dialogRef.close(true)
  }
}
