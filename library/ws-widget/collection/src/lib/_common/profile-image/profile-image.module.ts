import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ProfileImageComponent } from './profile-image/profile-image.component'
import { MatIconModule } from '@angular/material/icon'

@NgModule({
  declarations: [ProfileImageComponent],
  imports: [
    CommonModule,
    MatIconModule,
  ],
  exports: [
    ProfileImageComponent,
  ],
})
export class ProfileImageModule { }
