import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { LanguageSelectorComponent } from './language-selector.component'
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field'
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

@NgModule({
    declarations: [LanguageSelectorComponent],
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatSelectModule,
        FormsModule,
        ReactiveFormsModule,
    ],
    exports: [LanguageSelectorComponent]
})
export class LanguageSelectorModule { }
