import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { LanguageSelectorComponent } from './language-selector.component'
import { MatFormFieldModule, MatSelectModule } from '@angular/material'
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
  exports: [LanguageSelectorComponent],
  entryComponents: [LanguageSelectorComponent],
})
export class LanguageSelectorModule { }
