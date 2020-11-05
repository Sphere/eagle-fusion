import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { LocaleTranslatorComponent } from './locale-translator.component'

@NgModule({
  declarations: [LocaleTranslatorComponent],
  imports: [
    CommonModule,
  ], entryComponents: [LocaleTranslatorComponent],
  exports: [LocaleTranslatorComponent],
})
export class LocaleTranslatorModule { }
