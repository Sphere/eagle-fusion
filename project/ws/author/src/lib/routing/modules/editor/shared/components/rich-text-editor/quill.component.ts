import { Component, ElementRef, OnInit, OnDestroy, Input, AfterViewInit } from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import quill from 'quill'

@Component({
  selector: 'ws-auth-root-ws-quill',
  template: '',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: QuillComponent,
      multi: true,
    },
  ],
})
export class QuillComponent implements OnInit, OnDestroy, AfterViewInit, ControlValueAccessor {

  @Input()
  public theme = 'snow'

  @Input()
  public options: any = null

  protected editor: any

  private defaultContents: any | undefined

  constructor(
    private $el: ElementRef,
  ) { }

  public ngOnInit(): void {
    const toolbarOptions = [
      [{ font: [] }],

      [{ header: [1, 2, 3, 4, 5, 6, false] }],

      ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
      ['blockquote', 'code-block'],

      [{ align: [] }],

      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ script: 'sub' }, { script: 'super' }],      // superscript/subscript
      // [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
      [{ direction: 'rtl' }],                         // text direction

      // [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown

      [{ color: [] }, { background: [] }],          // dropdown with defaults from theme

      ['link', 'image', 'video', 'formula'],
      ['clean'],                                    // remove formatting button
    ]
    const options = {
      ...(this.options || {}),
      modules: { toolbar: toolbarOptions },
    }

    if (typeof options.theme === 'undefined') {
      options.theme = this.theme
    }

    this.editor = new quill(this.$el.nativeElement, options)

    if (typeof this.defaultContents !== 'undefined') {
      // this.editor.setContents(this.defaultContents)
      const editor = document.getElementsByClassName('ql-editor')
      if (editor && editor[0]) {
        editor[0].innerHTML = this.defaultContents
      }
    }

    this.editor.on('text-change', () => {
      this.onChange(this.getValue())
    })

    this.$el.nativeElement.querySelector('.ql-editor').addEventListener('blur', () => {
      this.onTouched()
    })
  }

  public ngOnDestroy(): void {
  }

  ngAfterViewInit(): void {
    if (typeof this.defaultContents !== 'undefined') {
      // this.editor.setContents(this.defaultContents)
      const editor = document.getElementsByClassName('ql-editor')
      if (editor && editor[0]) {
        editor[0].innerHTML = this.defaultContents
      }
    }
  }

  public writeValue(contents: any): void {
    if (this.editor) {
      const editor = document.getElementsByClassName('ql-editor')
      editor[0].innerHTML = contents
      // this.editor.setContents(contents)
    } else {
      this.defaultContents = contents
    }
  }

  public registerOnChange(fn: any): void {
    this.onChange = fn
  }

  public registerOnTouched(fn: any): void {
    this.onTouched = fn
  }

  protected getValue(): any | undefined {
    if (!this.editor) {
      return undefined
    }

    // const contents: any = this.editor.getContents()
    let contents: any
    const editor = document.getElementsByClassName('ql-editor')

    if (editor) {
      contents = editor[0].innerHTML
    }
    // if (this.isEmpty(contents)) {
    //   return undefined
    // }

    if (!contents) {
      return undefined
    }

    return contents
  }

  protected isEmpty(contents: any): boolean {
    if (contents.ops.length > 1) {
      return false
    }

    const opsTypes: string[] = Object.keys(contents.ops[0])

    if (opsTypes.length > 1) {
      return false
    }

    if (opsTypes[0] !== 'insert') {
      return false
    }

    if (contents.ops[0].insert !== '\n') {
      return false
    }

    return true
  }

  protected onTouched = () => { }

  private onChange = (_: any) => { }

}
