import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CompletionSpinnerComponent } from './completion-spinner.component'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'

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
