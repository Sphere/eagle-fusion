import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { UserImageComponent } from './user-image.component'
import { MatIconModule } from '@angular/material/icon'

@NgModule({
  declarations: [UserImageComponent],
  imports: [
    CommonModule,
    MatIconModule,
  ],
  exports: [UserImageComponent],
})
export class UserImageModule { }
