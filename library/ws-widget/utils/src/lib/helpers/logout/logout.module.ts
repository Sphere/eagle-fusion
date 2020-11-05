import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatButtonModule, MatDialogModule } from '@angular/material'

import { LogoutComponent } from './logout.component'

@NgModule({
  declarations: [LogoutComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
  ],
  entryComponents: [LogoutComponent],
})
export class LogoutModule { }
