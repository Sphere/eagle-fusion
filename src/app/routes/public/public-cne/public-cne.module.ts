import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { PublicCneComponent } from './public-cne.component'

@NgModule({
  declarations: [PublicCneComponent],
  imports: [CommonModule, RouterModule],
  exports: [PublicCneComponent],
})
export class PublicCneModule { }
