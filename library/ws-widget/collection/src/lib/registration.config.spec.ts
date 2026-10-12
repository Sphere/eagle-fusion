class BtnContentShareComponent { }
class BtnFeatureComponent { }
class BtnFullscreenComponent { }
class BtnPageBackComponent { }
class BtnProfileComponent { }
class CardContentComponent { }
class ContentStripMultipleComponent { }
class DiscussionForumComponent { }
class ErrorResolverComponent { }
class GridLayoutComponent { }
class PageComponent { }
class PlayerAudioComponent { }
class PlayerPdfComponent { }
class PlayerVideoComponent { }
class PlayerYoutubeComponent { }
class SlidersComponent { }

jest.mock('./btn-content-share/btn-content-share.component', () => ({ BtnContentShareComponent }))
jest.mock('./btn-content-share/btn-content-share.module', () => ({ BtnContentShareModule: class { } }))
jest.mock('./btn-feature/btn-feature.component', () => ({ BtnFeatureComponent }))
jest.mock('./btn-feature/btn-feature.module', () => ({ BtnFeatureModule: class { } }))
jest.mock('./btn-fullscreen/btn-fullscreen.component', () => ({ BtnFullscreenComponent }))
jest.mock('./btn-fullscreen/btn-fullscreen.module', () => ({ BtnFullscreenModule: class { } }))
jest.mock('./btn-page-back/btn-page-back.component', () => ({ BtnPageBackComponent }))
jest.mock('./btn-page-back/btn-page-back.module', () => ({ BtnPageBackModule: class { } }))
jest.mock('./btn-profile/btn-profile.component', () => ({ BtnProfileComponent }))
jest.mock('./btn-profile/btn-profile.module', () => ({ BtnProfileModule: class { } }))
jest.mock('./card-content/card-content.component', () => ({ CardContentComponent }))
jest.mock('./card-content/card-content.module', () => ({ CardContentModule: class { } }))
jest.mock('./content-strip-multiple/content-strip-multiple.component', () => ({ ContentStripMultipleComponent }))
jest.mock('./content-strip-multiple/content-strip-multiple.module', () => ({ ContentStripMultipleModule: class { } }))
jest.mock('./discussion-forum/components/discussion-forum/discussion-forum.component', () => ({ DiscussionForumComponent }))
jest.mock('./discussion-forum/discussion-forum.module', () => ({ DiscussionForumModule: class { } }))
jest.mock('./error-resolver/error-resolver.component', () => ({ ErrorResolverComponent }))
jest.mock('./error-resolver/error-resolver.module', () => ({ ErrorResolverModule: class { } }))
jest.mock('./grid-layout/grid-layout.component', () => ({ GridLayoutComponent }))
jest.mock('./grid-layout/grid-layout.module', () => ({ GridLayoutModule: class { } }))
jest.mock('./page/page.component', () => ({ PageComponent }))
jest.mock('./page/page.module', () => ({ PageModule: class { } }))
jest.mock('./player-audio/player-audio.component', () => ({ PlayerAudioComponent }))
jest.mock('./player-audio/player-audio.module', () => ({ PlayerAudioModule: class { } }))
jest.mock('./player-pdf/player-pdf.component', () => ({ PlayerPdfComponent }))
jest.mock('./player-pdf/player-pdf.module', () => ({ PlayerPdfModule: class { } }))
jest.mock('./player-video/player-video.component', () => ({ PlayerVideoComponent }))
jest.mock('./player-video/player-video.module', () => ({ PlayerVideoModule: class { } }))
jest.mock('./player-youtube/player-youtube.component', () => ({ PlayerYoutubeComponent }))
jest.mock('./player-youtube/player-youtube.module', () => ({ PlayerYoutubeModule: class { } }))
jest.mock('./sliders/sliders.component', () => ({ SlidersComponent }))
jest.mock('./sliders/sliders.module', () => ({ SlidersModule: class { } }))

// eslint-disable-next-line import/first
import { WIDGET_REGISTERED_MODULES, WIDGET_REGISTRATION_CONFIG } from './registration.config'

describe('registration.config', () => {
  it('should export a non-empty list of registered modules', () => {
    expect(Array.isArray(WIDGET_REGISTERED_MODULES)).toBe(true)
    expect(WIDGET_REGISTERED_MODULES.length).toBeGreaterThan(0)
  })

  it('should export a non-empty registration config with widgetType, widgetSubType and component on every entry', () => {
    expect(Array.isArray(WIDGET_REGISTRATION_CONFIG)).toBe(true)
    expect(WIDGET_REGISTRATION_CONFIG.length).toBeGreaterThan(0)
    WIDGET_REGISTRATION_CONFIG.forEach(entry => {
      expect(entry.widgetType).toBeTruthy()
      expect(entry.widgetSubType).toBeTruthy()
      expect(entry.component).toBeTruthy()
    })
  })

  it('should include an entry for the content share button', () => {
    const found = WIDGET_REGISTRATION_CONFIG.some(
      entry => entry.component === BtnContentShareComponent,
    )
    expect(found).toBe(true)
  })

  it('should include an entry for the discussion forum widget', () => {
    const found = WIDGET_REGISTRATION_CONFIG.some(
      entry => entry.component === DiscussionForumComponent,
    )
    expect(found).toBe(true)
  })
})
