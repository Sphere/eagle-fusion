import { Component, OnInit, Inject } from '@angular/core'
import { MAT_SNACK_BAR_DATA } from '@angular/material'

@Component({
  selector: 'ws-app-multiline-snackbar',
  templateUrl: './multiline-snackbar.component.html',
  styleUrls: ['./multiline-snackbar.component.scss'],
})
export class MultilineSnackbarComponent implements OnInit {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public snackbarLines: any[]) {}

  ngOnInit() {}
}
