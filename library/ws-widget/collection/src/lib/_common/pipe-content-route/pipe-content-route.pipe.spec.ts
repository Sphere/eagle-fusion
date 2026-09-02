import { PipeContentRoutePipe } from './pipe-content-route.pipe'

describe('PipeContentRoutePipe', () => {
  let pipe: PipeContentRoutePipe

  const content = (overrides: any = {}) => ({ identifier: 'c1', ...overrides }) as any

  beforeEach(() => {
    pipe = new PipeContentRoutePipe()
  })

  it('should create', () => {
    expect(pipe).toBeTruthy()
  })

  describe('Knowledge Board', () => {
    it('should route to the knowledge-board page in the app', () => {
      expect(pipe.transform(content({ contentType: 'Knowledge Board' }))).toEqual({
        url: '/app/knowledge-board/c1',
        queryParams: {},
      })
    })

    it('should route to the toc overview in preview mode', () => {
      expect(pipe.transform(content({ contentType: 'Knowledge Board' }), true).url)
        .toBe('/author/toc/c1/overview')
    })
  })

  describe('Channel', () => {
    it('should route to the page in the app', () => {
      expect(pipe.transform(content({ contentType: 'Channel' })).url).toBe('/page/c1')
    })

    it('should route to the channel viewer in preview mode', () => {
      expect(pipe.transform(content({ contentType: 'Channel' }), true).url)
        .toBe('/author/viewer/channel/c1')
    })
  })

  describe('Learning Journeys', () => {
    it('should route a dynamic learning path to the dlp route', () => {
      expect(pipe.transform(content({
        contentType: 'Learning Journeys',
        resourceType: 'Dynamic Learning Paths',
      })).url).toBe('/app/learning-journey/dlp/c1/0')
    })

    it('should route any other journey to the cdp route', () => {
      expect(pipe.transform(content({
        contentType: 'Learning Journeys',
        resourceType: 'Curated',
      })).url).toBe('/app/learning-journey/cdp/c1')
    })
  })

  describe('playlist continue-learning context', () => {
    it('should route back to the playlist', () => {
      expect(pipe.transform(content({
        continueLearningData: { contextType: 'playlist', contextPathId: 'pl-1' },
      })).url).toBe('/app/playlist/me/pl-1')
    })

    it('should ignore a playlist context with no path id', () => {
      expect(pipe.transform(content({
        continueLearningData: { contextType: 'playlist' },
      })).url).toBe('/app/toc/c1/overview')
    })

    it('should ignore a non-playlist context', () => {
      expect(pipe.transform(content({
        continueLearningData: { contextType: 'course', contextPathId: 'x' },
      })).url).toBe('/app/toc/c1/overview')
    })
  })

  describe('default toc route', () => {
    it('should route to the toc overview with the primary category', () => {
      expect(pipe.transform(content({ primaryCategory: 'Course' }))).toEqual({
        url: '/app/toc/c1/overview',
        queryParams: { primaryCategory: 'Course' },
      })
    })

    it('should route into /author in preview mode', () => {
      expect(pipe.transform(content(), true).url).toBe('/author/toc/c1/overview')
    })
  })
})
