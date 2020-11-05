import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { BlogEditComponent } from './components/blog-edit.component'
import {
  MatButtonModule,
  MatCardModule,
  MatIconModule,
  MatInputModule,
  MatToolbarModule,
  MatChipsModule,
  MatAutocompleteModule,
  MatDividerModule,
  MatSlideToggleModule,
  MatTooltipModule,
  MatTabsModule,
  MatMenuModule,
  MatSnackBarModule,
  MatExpansionModule,
  MatProgressSpinnerModule,
} from '@angular/material'
import { EditorQuillModule, BtnPageBackModule } from '@ws-widget/collection'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

@NgModule({
  declarations: [BlogEditComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatToolbarModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatDividerModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatTabsModule,
    MatMenuModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    FormsModule,
    ReactiveFormsModule,

    EditorQuillModule,
    BtnPageBackModule,
  ],
  exports: [BlogEditComponent],
})
export class BlogsEditModule {}
