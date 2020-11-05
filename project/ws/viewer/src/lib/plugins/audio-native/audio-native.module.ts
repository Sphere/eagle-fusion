import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { AudioNativeComponent } from './audio-native.component'

@NgModule({
  declarations: [AudioNativeComponent],
  imports: [
    CommonModule,
  ],
  exports: [
    AudioNativeComponent,
  ],
})
export class AudioNativeModule { }
