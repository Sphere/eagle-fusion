import { Component, OnInit, Inject } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material'
import { ResourceCollectionService } from 'project/ws/viewer/src/lib/plugins/resource-collection/resource-collection.service'

@Component({
  selector: 'viewer-view-submission',
  templateUrl: './view-submission.component.html',
  styleUrls: ['./view-submission.component.scss'],
})
export class ViewSubmissionComponent implements OnInit {
  submissionUrl = ''

  supportedFormatsHash: { [key: string]: string } = {
    'video/mp4': 'mp4',
    'application/pdf': 'pdf',
    input: 'txt',
  }
  pdfData:
    {
      pdfUrl: string,
      hideControls: boolean
    } | null = null
  videoData: { url: string, disableTelemetry: boolean } | null = null
  submissionType = ''
  submissionAnswerText: string[] = []

  constructor(
    private dialogRef: MatDialogRef<ViewSubmissionComponent>,
    private resourceSvc: ResourceCollectionService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) data: { url: string, type: string },
  ) {
    if (data.url) {
      this.submissionUrl = data.url
    }
    if (data.type) {
      this.submissionType = this.supportedFormatsHash[data.type]
    }
  }

  ngOnInit() {
    if (this.submissionUrl) {
      if (this.submissionType === 'txt' && this.submissionUrl) {
        this.resourceSvc.readContentTextFile(this.submissionUrl).subscribe((data: any) => {
          const answers = data
          const submissionarray = answers.split('\n')
          this.submissionAnswerText = submissionarray.filter((answer: String) => answer !== '')
        })
      } else if (this.submissionType === 'mp4' && this.submissionUrl) {
        this.videoData = {
          url: this.submissionUrl,
          disableTelemetry: true,
        }
      } else if (this.submissionType === 'pdf' && this.submissionUrl) {
        this.pdfData = {
          pdfUrl: this.submissionUrl,
          hideControls: true,
        }
      } else {
        this.snackBar.open('Invalid Type', undefined, {
          duration: 1000,
        })
        this.close()
      }
    } else {
      this.snackBar.open('Invalid Content', undefined, {
        duration: 1000,
      })
      this.close()
    }
  }
  close(): void {
    this.pdfData = null
    this.videoData = null
    this.dialogRef.close()
  }

}
