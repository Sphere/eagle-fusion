import { Component, OnInit, Input } from '@angular/core'

@Component({
  selector: 'viewer-plugin-audio-native',
  templateUrl: './audio-native.component.html',
  styleUrls: ['./audio-native.component.scss'],
})
export class AudioNativeComponent implements OnInit {
  @Input() artifactUrl: string | null = null
  constructor() { }

  ngOnInit() {
  }

}
