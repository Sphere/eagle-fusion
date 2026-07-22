// public-api.ts is a pure re-export barrel. Importing the full NgModule graph under Jest
// triggers unrelated circular NgModule compilation errors (same reason sibling specs
// jest.mock('@ws-widget/collection') instead of importing it directly), so the heavy
// NgModule-decorated files are stubbed here purely to allow the barrel's non-Angular
// exports (services, pipes, models) to load and be smoke-tested.
jest.mock('./lib/btn-content-share/btn-content-share.module', () => ({}))
jest.mock('./lib/btn-feature/btn-feature.module', () => ({}))
jest.mock('./lib/btn-fullscreen/btn-fullscreen.module', () => ({}))
jest.mock('./lib/btn-page-back/btn-page-back.module', () => ({}))
jest.mock('./lib/btn-profile/btn-profile.module', () => ({}))
jest.mock('./lib/card-content/card-content.module', () => ({}))
jest.mock('./lib/content-strip-multiple/content-strip-multiple.module', () => ({}))
jest.mock('./lib/discussion-forum/actionBtn/btn-social-like/btn-social-like.module', () => ({}))
jest.mock('./lib/discussion-forum/actionBtn/btn-social-vote/btn-social-vote.module', () => ({}))
jest.mock('./lib/discussion-forum/dialog/dialog-social-activity-user/dialog-social-activity-user.module', () => ({}))
jest.mock('./lib/discussion-forum/dialog/dialog-social-delete-post/dialog-social-delete-post.module', () => ({}))
jest.mock('./lib/discussion-forum/discussion-forum.module', () => ({}))
jest.mock('./lib/error-resolver/error-resolver.module', () => ({}))
jest.mock('./lib/grid-layout/grid-layout.module', () => ({}))
jest.mock('./lib/page/page.module', () => ({}))
jest.mock('./lib/player-audio/player-audio.module', () => ({}))
jest.mock('./lib/player-pdf/player-pdf.module', () => ({}))
jest.mock('./lib/player-video/player-video.module', () => ({}))
jest.mock('./lib/player-youtube/player-youtube.module', () => ({}))
jest.mock('./lib/sliders/sliders.module', () => ({}))
jest.mock('./lib/_common/content-progress/content-progress.module', () => ({}))
jest.mock('./lib/_common/display-content-type/display-content-type.module', () => ({}))
jest.mock('./lib/_common/pipe-content-route/pipe-content-route.module', () => ({}))
jest.mock('./lib/_common/user-image/user-image.module', () => ({}))
jest.mock('./lib/player-video-popup/player-video-popup.module', () => ({}))

import * as PublicApi from './public-api'

describe('public-api', () => {
  it('should export module members without error', () => {
    expect(PublicApi).toBeTruthy()
    expect(Object.keys(PublicApi).length).toBeGreaterThan(0)
  })

  it('should export BtnPageBackService', () => {
    expect(PublicApi.BtnPageBackService).toBeDefined()
  })

  it('should export PipeContentRoutePipe', () => {
    expect((PublicApi as any).PipeContentRoutePipe).toBeDefined()
  })

  it('should export WidgetContentService', () => {
    expect(PublicApi.WidgetContentService).toBeDefined()
  })

  it('should export ErrorResolverComponent', () => {
    expect(PublicApi.ErrorResolverComponent).toBeDefined()
  })

  it('should export PageComponent', () => {
    expect(PublicApi.PageComponent).toBeDefined()
  })

  it('should export DialogSocialActivityUserComponent', () => {
    expect(PublicApi.DialogSocialActivityUserComponent).toBeDefined()
  })

  it('should export DialogSocialDeletePostComponent', () => {
    expect(PublicApi.DialogSocialDeletePostComponent).toBeDefined()
  })
})
