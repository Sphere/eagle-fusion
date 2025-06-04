import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { LocaleTranslatorComponent } from './locale-translator.component'

@NgModule({
    declarations: [LocaleTranslatorComponent],
    imports: [
        CommonModule,
    ],
    exports: [LocaleTranslatorComponent]
})
export class LocaleTranslatorModule { }
