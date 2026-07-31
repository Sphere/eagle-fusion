import { Component } from '@angular/core'
import { S3_END_POINTS } from '../../constants/apiConstants'

export interface IHelpVideo {
  id: string
  url: string
  titleHi: string
  titleEn: string
}

/**
 * This page deliberately shows Hindi and English together rather than switching
 * on the active locale — it is shared directly with Uttar Pradesh health workers,
 * so both readings are always on screen. That is also why the copy lives here as
 * plain strings instead of going through ngx-translate.
 */
@Component({
  standalone: false,
  selector: 'ws-app-help-videos',
  templateUrl: './help-videos.component.html',
  styleUrls: ['./help-videos.component.scss'],
})
export class HelpVideosComponent {
  readonly aastrikaLogo = '/fusion-assets/images/aastrika-foundation-logo.svg'
  readonly upLogo = S3_END_POINTS.UP_GOV_LOGO

  readonly pageTitleHi = 'ई-क्षमता सहायता वीडियो'
  readonly pageTitleEn = 'eKshamata Help Videos'
  readonly pageSubtitleHi = 'रजिस्टर करने और ऐप का उपयोग करने का तरीका जानने के लिए ये वीडियो देखें।'
  readonly pageSubtitleEn = 'Watch these short videos to learn how to register and use eKshamata.'

  readonly videos: IHelpVideo[] = [
    {
      id: 'aPNR0V0ezow',
      url: 'https://youtu.be/aPNR0V0ezow?si=fiR8pClD-Zxcigjb',
      titleHi: 'ई-क्षमता पर रजिस्टर कैसे करें',
      titleEn: 'How to Register on eKshamata',
    },
    {
      id: '747ExeI6krU',
      url: 'https://youtu.be/747ExeI6krU?si=1D3yLBUt59fQt1KY',
      titleHi: 'रजिस्टर करने के बाद ई-क्षमता ऐप का उपयोग कैसे करें',
      titleEn: 'How to use the E-Kshamata app after registration',
    },
  ]

  thumbnail(video: IHelpVideo): string {
    return `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`
  }
}
