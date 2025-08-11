import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CompletionSpinnerComponent } from './completion-spinner.component'
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner'

@NgModule({
  declarations: [CompletionSpinnerComponent],
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
  ],
  exports: [
    CompletionSpinnerComponent,
  ],
})
export class CompletionSpinnerModule { }
