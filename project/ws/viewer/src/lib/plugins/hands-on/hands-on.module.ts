import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import {
  MatCardModule,
  MatIconModule,
  MatProgressBarModule,
  MatExpansionModule,
  MatButtonModule,
  MatDialogModule,
  MatProgressSpinnerModule,
} from '@angular/material'

import { AceEditorModule } from 'ng2-ace-editor'

import { PipeSafeSanitizerModule, PipeDurationTransformModule } from '@ws-widget/utils'
import { CompletionSpinnerModule } from '@ws-widget/collection'

import { HandsOnComponent } from './hands-on.component'
import { HandsOnDialogComponent } from './components/hands-on-dialog/hands-on-dialog.component'
@NgModule({
  declarations: [HandsOnComponent, HandsOnDialogComponent],
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatExpansionModule,
    MatButtonModule,
    MatDialogModule,
    AceEditorModule,
    MatProgressSpinnerModule,
    PipeSafeSanitizerModule,
    PipeDurationTransformModule,
    CompletionSpinnerModule,
  ],
  exports: [
    HandsOnComponent,
  ],
  entryComponents: [HandsOnDialogComponent],
})
export class HandsOnModule { }
