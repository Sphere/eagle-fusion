import { Component, OnInit, Input } from '@angular/core'
import { fromEvent } from 'rxjs'
import { first, tap } from 'rxjs/operators'
import { LeadershipService } from '../../services/leadership.service'

let tweetScriptId = 'tweetScript'

@Component({
  selector: 'ws-tweets',
  templateUrl: './tweets.component.html',
  styleUrls: ['./tweets.component.scss'],
})
export class TweetsComponent implements OnInit {
  @Input() twitterUrl = ''
  hasTweetScriptLoaded = false
  twitterScriptUrl = 'https://platform.twitter.com/widgets.js'

  constructor(private leaderSvc: LeadershipService) {}

  ngOnInit() {
    this.loadScript(true)
  }

  loadScript(forced = false) {
    if (forced) {
      tweetScriptId += `_${this.leaderSvc.randomId}`
    }
    if (this.hasTweetScriptLoaded) {
      return
    }
    const existingScriptElement = document.getElementById(tweetScriptId)
    if (existingScriptElement) {
      return fromEvent(existingScriptElement, 'load')
        .pipe(
          first(),
          tap(() => (this.hasTweetScriptLoaded = true)),
        )
        .toPromise()
    }

    const newScriptElement = document.createElement('script')
    newScriptElement.setAttribute('id', tweetScriptId)
    newScriptElement.setAttribute('src', this.twitterScriptUrl)
    document.body.appendChild(newScriptElement)
    return fromEvent(newScriptElement, 'load')
      .pipe(
        first(),
        tap(() => (this.hasTweetScriptLoaded = true)),
      )
      .toPromise()
  }
}
