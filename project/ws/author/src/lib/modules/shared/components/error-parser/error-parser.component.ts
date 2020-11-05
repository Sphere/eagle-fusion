import { Component, Inject, OnInit } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'
import { NSContent } from '@ws/author/src/lib/interface/content'

interface IMessage {
  [key: string]: string[]
}

interface IErrorParser {
  errorFromBackendData: {
    errors: {
      code: string
      message: string | IMessage
    }[]
  }
  dataMapping?: Map<string, NSContent.IContentMeta>
  processErrorData?: IProcessedMultiError[]
}

interface IProcessedMultiError {
  id: string | number
  name: string
  message: string[]
}

@Component({
  selector: 'ws-auth-error-parser',
  templateUrl: './error-parser.component.html',
  styleUrls: ['./error-parser.component.scss'],
})
export class ErrorParserComponent implements OnInit {
  processErrorData: IProcessedMultiError[] | null = null
  errorMsg: string | null = null
  constructor(
    public dialogRef: MatDialogRef<ErrorParserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IErrorParser,
  ) {}

  ngOnInit() {
    if (
      this.data.errorFromBackendData &&
      this.data.errorFromBackendData.errors &&
      this.data.errorFromBackendData.errors[0] &&
      this.data.errorFromBackendData.errors[0].message
    ) {
      if (typeof this.data.errorFromBackendData.errors[0].message === 'string') {
        this.errorMsg = this.data.errorFromBackendData.errors[0].message
      } else if (typeof this.data.errorFromBackendData.errors[0].message === 'object') {
        try {
          const processErrorData: IProcessedMultiError[] = []
          Object.keys(this.data.errorFromBackendData.errors[0].message).forEach(v => {
            const contentData = this.data.dataMapping
              ? (this.data.dataMapping.get(v) as NSContent.IContentMeta)
              : ({} as NSContent.IContentMeta)
            const processedMsg: IProcessedMultiError = {
              id: v,
              name: contentData.name || '',
              message: (this.data.errorFromBackendData.errors[0].message as any)[v],
            }
            processErrorData.push(processedMsg)
          })
          this.processErrorData = processErrorData
        } catch {
          this.processErrorData = null
        }
      }
    } else if (this.data.processErrorData) {
      this.processErrorData = this.data.processErrorData
    }
  }

  close(id?: string) {
    this.dialogRef.close(id)
  }
}
