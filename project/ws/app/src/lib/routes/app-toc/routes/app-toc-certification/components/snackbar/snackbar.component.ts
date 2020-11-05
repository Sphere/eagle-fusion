import { Component, OnInit, Inject } from '@angular/core'
import { MAT_SNACK_BAR_DATA } from '@angular/material'

@Component({
  selector: 'ws-app-certification-snackbar',
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.scss'],
})
export class SnackbarComponent implements OnInit {
  constructor(
    @Inject(MAT_SNACK_BAR_DATA)
    public snackbarData: {
      action: string;
      code: string;
    },
  ) {}

  ngOnInit() {
    if (!this.snackbarData) {
      this.snackbarData = {
        action: '',
        code: '',
      }
    }
  }
}
