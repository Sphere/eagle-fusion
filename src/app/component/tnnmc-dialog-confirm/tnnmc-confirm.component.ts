import { Component, Inject } from '@angular/core'
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog'
import { Router } from '@angular/router'

@Component({
  selector: 'ws-tnnmc-confirm',
  templateUrl: './tnnmc-confirm.component.html',
  styleUrls: ['./tnnmc-confirm.component.scss'],
})
export class TnnmcConfirmComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { title: string, body: string },
    private dialogRef: MatDialogRef<TnnmcConfirmComponent>,
    private router: Router,
  ) { }

  confirmed() {
    this.router.navigate(['public/login'])
    this.dialogRef.close(true)
  }
}
