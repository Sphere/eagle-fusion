import { Component, OnDestroy, OnInit } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { Subject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'
import { S3_END_POINTS } from '../../constants/apiConstants'
import { LanguageService } from '../../services/language.service'

export interface IHelpVideo {
  id: string
  url: string
  title: string
}

/**
 * Page-scoped translations.
 *
 * These are seeded into the translate store instead of living only in
 * src/assets/i18n/*.json because the dev proxy serves /assets/** from the
 * production host — local i18n edits are never picked up while running
 * `yarn start`. Seeding keeps this standalone page correct in both places.
 */
const HELP_VIDEO_TRANSLATIONS: { [lang: string]: { [key: string]: string } } = {
  en: {
    HELP_VIDEOS_TITLE: 'Help Videos',
    HELP_VIDEOS_SUBTITLE: 'Watch these short videos to learn how to register and use eKshamata.',
    WATCH_ON_YOUTUBE: 'Watch on YouTube',
    HELP_VIDEO_HOW_TO_REGISTER: 'How to Register on eKshamata',
    HELP_VIDEO_HOW_TO_USE_APP: 'How to use the E-Kshamata app after registration',
  },
  hi: {
    HELP_VIDEOS_TITLE: 'सहायता वीडियो',
    HELP_VIDEOS_SUBTITLE: 'ई-क्षमता पर पंजीकरण और उपयोग करने का तरीका जानने के लिए ये छोटे वीडियो देखें।',
    WATCH_ON_YOUTUBE: 'यूट्यूब पर देखें',
    HELP_VIDEO_HOW_TO_REGISTER: 'ई-क्षमता पर पंजीकरण कैसे करें',
    HELP_VIDEO_HOW_TO_USE_APP: 'पंजीकरण के बाद ई-क्षमता ऐप का उपयोग कैसे करें',
  },
}

@Component({
  standalone: false,
  selector: 'ws-app-help-videos',
  templateUrl: './help-videos.component.html',
  styleUrls: ['./help-videos.component.scss'],
})
export class HelpVideosComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>()

  readonly aastrikaLogo = '/fusion-assets/images/aastrika-foundation-logo.svg'
  readonly upLogo = S3_END_POINTS.UP_GOV_LOGO

  readonly videos: IHelpVideo[] = [
    {
      id: 'aPNR0V0ezow',
      url: 'https://youtu.be/aPNR0V0ezow?si=fiR8pClD-Zxcigjb',
      title: 'HELP_VIDEO_HOW_TO_REGISTER',
    },
    {
      id: '747ExeI6krU',
      url: 'https://youtu.be/747ExeI6krU?si=1D3yLBUt59fQt1KY',
      title: 'HELP_VIDEO_HOW_TO_USE_APP',
    },
  ]

  constructor(
    private readonly langSvc: LanguageService,
    private readonly translate: TranslateService,
  ) { }

  ngOnInit(): void {
    // This page can be opened directly (no app shell bootstrap), so make sure a
    // language is active before the translate pipe runs.
    this.langSvc.setLanguage(this.langSvc.getCurrentLanguage())
    this.seedTranslations()
    // A completed i18n fetch replaces the store for that language, which would
    // drop the seeded keys — put them back whenever the language (re)loads.
    this.translate.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.seedTranslations())
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  thumbnail(video: IHelpVideo): string {
    return `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`
  }

  /** Merge page strings on top of whatever the i18n loader fetched. */
  private seedTranslations(): void {
    Object.keys(HELP_VIDEO_TRANSLATIONS).forEach(lang => {
      this.translate.setTranslation(lang, HELP_VIDEO_TRANSLATIONS[lang], true)
    })
  }
}
