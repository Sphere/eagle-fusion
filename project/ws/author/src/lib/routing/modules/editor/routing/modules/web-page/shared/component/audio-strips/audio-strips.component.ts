import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { Subscription, fromEvent } from 'rxjs'
import { AUTHORING_CONTENT_BASE } from '../../../../../../../../../constants/apiEndpoints'
import { ConfirmDialogComponent } from '@ws/author/src/lib/modules/shared/components/confirm-dialog/confirm-dialog.component'
import { IAudioObj } from '../../../interface/page-interface'

@Component({
  selector: 'ws-auth-audio-strips',
  templateUrl: './audio-strips.component.html',
  styleUrls: ['./audio-strips.component.scss'],
})
export class AudioStripsComponent implements OnInit, OnDestroy {

  @Input() set data(val: IAudioObj[]) {
    this.audioData = this.doRegex ? val.map((obj: IAudioObj) => {
      return JSON.parse(JSON.stringify(obj).replace(this.downloadRegex, this.regexDownloadReplace))
    }) : []
    // this.durations = []
    // this.audioData.forEach(aud=>{
    //   this.getDuration(aud.URL)
    // })
  }
  @Input() doRegex = true
  @Output() audioDeleted = new EventEmitter<number>()
  audioData!: IAudioObj[]
  showStatusForCard?: number
  isAudioPlaying = false
  // durations: number[] = []
  listener?: Subscription
  downloadRegex = new RegExp(`(/content-store/.*?)(\\\)?\\\\?['"])`, 'gm')

  constructor(
    public dialog: MatDialog,
  ) { }

  regexDownloadReplace(_str = '', group1: string, group2: string): string {
    return `${AUTHORING_CONTENT_BASE}${encodeURIComponent(group1)}${group2}`
  }

  ngOnInit() { }

  /**
   * Used to play or stop audio
   * @param id of the audio element
   */
  audioControl(id: string) {
    const audio = <HTMLAudioElement>document.getElementById(id)
    if (!this.isAudioPlaying) {
      audio.play()
    } else {
      audio.pause()
      audio.currentTime = 0
    }
    this.isAudioPlaying = !this.isAudioPlaying
    this.listener = fromEvent(audio, 'ended').subscribe(() => {
      this.isAudioPlaying = false
    })
  }

  deleteAudio(index: number) {
    const confirmDelete = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      data: 'deleteAudio',
    })
    confirmDelete.afterClosed().subscribe(confirm => {
      if (confirm) {
        this.audioData.splice(index, 1)
        this.audioDeleted.emit(index)
      }
    })
  }

  ngOnDestroy() {
    if (this.listener) {
      this.listener.unsubscribe()
    }
  }

  // getDuration(url: string){

  // }

}
