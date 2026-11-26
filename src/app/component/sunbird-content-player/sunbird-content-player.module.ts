import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { TranslateModule } from '@ngx-translate/core'
import { SunbirdContentPlayerComponent } from './sunbird-content-player.component'

@NgModule({
  declarations: [SunbirdContentPlayerComponent],
  imports: [CommonModule, TranslateModule],
  exports: [SunbirdContentPlayerComponent],
})
export class SunbirdContentPlayerModule { }
