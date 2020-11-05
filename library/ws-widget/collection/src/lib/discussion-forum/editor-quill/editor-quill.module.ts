import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { EditorQuillComponent } from '../editor-quill/component/editor-quill/editor-quill.component'
import { EditorQuillImageComponent } from './component/editor-quill-image/editor-quill-image.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { QuillModule } from 'ngx-quill'
import { HttpClientModule } from '@angular/common/http'
import { NotificationComponent } from './component/notification/notification.component'
import { ApiService } from '@ws/author/src/lib/modules/shared/services/api.service'
import { MatIconModule } from '@angular/material/icon'

const SUPPORTED_FORMATS = [
  'background',
  'bold',
  'color',
  'font',
  'code',
  'italic',
  'link',
  'size',
  'strike',
  'script',
  'underline',
  'blockquote',
  'header',
  'indent',
  'list',
  'align',
  'direction',
  'code-block',
  'image',
]

@NgModule({
  declarations: [EditorQuillComponent, EditorQuillImageComponent, NotificationComponent],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatIconModule,
    QuillModule.forRoot({
      formats: SUPPORTED_FORMATS,
      modules: {
        toolbar: [
          ['blockquote', 'code-block'], ['bold', 'italic', 'underline', 'link'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ indent: '-1' }, { indent: '+1' }],          // outdent/indent

          [{ size: ['small', false, 'large', 'huge'] }],  // custom dropdown
          [{ header: [1, 2, 3, 4, 5, 6, false] }],

          [{ color: [] }, { background: [] }],          // dropdown with defaults from theme
          [{ font: [] }],
          [{ align: [] }],
          ['image'],
      ],
        history: {
          delay: 1500,
          userOnly: true,
        },
        syntax: false,
      },
      // placeholder: 'Ask a question, or add something you found helpful',
      theme: 'snow',
    }),
  ],
  exports: [EditorQuillComponent, EditorQuillImageComponent, NotificationComponent],
  providers: [ApiService],
  entryComponents: [NotificationComponent],
})
export class EditorQuillModule { }
