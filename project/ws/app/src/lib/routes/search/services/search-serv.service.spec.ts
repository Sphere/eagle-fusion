import { of, throwError } from 'rxjs'
import { SearchServService } from './search-serv.service'

jest.mock('@ws-widget/utils', () => ({
  WsEvents: {
    WsEventType: { Telemetry: 'TELEMETRY' },
    WsEventLogLevel: { Warn: 'WARN' },
    EnumTelemetrySubType: { Interact: 'INTERACT', Search: 'SEARCH' },
  },
}))

describe('SearchServService', () => {
  let service: SearchServService
  let eventsMock: any
  let searchApiMock: any
  let configSrvMock: any
  let httpMock: any
  let loggerMock: any

  beforeEach(() => {
    eventsMock = { dispatchEvent: jest.fn() }
    searchApiMock = {
      getSearchAutoCompleteResults: jest.fn(),
      getSearchV7Results: jest.fn(),
      getSearchV6Results: jest.fn(),
      getSearchResults: jest.fn(),
    }
    configSrvMock = { activeOrg: 'org1', rootOrg: 'root1' }
    httpMock = { get: jest.fn() }
    loggerMock = { log: jest.fn(), error: jest.fn() }
    service = new SearchServService(eventsMock, searchApiMock, configSrvMock, httpMock, loggerMock)
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('defaultFiltersTranslated should return default object', () => {
    expect(service.defaultFiltersTranslated).toEqual({ en: {}, all: {} })
  })

  describe('getSearchConfig', () => {
    it('should fetch and cache config when not present', async () => {
      const config = { search: { tabs: [{}] } }
      httpMock.get.mockReturnValue(of(config))
      const result = await service.getSearchConfig()
      expect(result).toEqual(config)
      expect(service.searchConfig).toEqual(config)
    })

    it('should return cached config on subsequent calls', async () => {
      const config = { search: { tabs: [{}] } }
      httpMock.get.mockReturnValue(of(config))
      await service.getSearchConfig()
      httpMock.get.mockClear()
      const result = await service.getSearchConfig()
      expect(result).toEqual(config)
      expect(httpMock.get).not.toHaveBeenCalled()
    })

    it('should log error when fetch fails', async () => {
      httpMock.get.mockReturnValue(throwError(() => new Error('fail')))
      await service.getSearchConfig()
      expect(loggerMock.error).toHaveBeenCalled()
    })
  })

  describe('getApplyPhraseSearch', () => {
    it('should return true when phraseSearch is true', async () => {
      httpMock.get.mockReturnValue(of({ search: { tabs: [{ phraseSearch: true }] } }))
      expect(await service.getApplyPhraseSearch()).toBe(true)
    })
    it('should return true when phraseSearch is undefined', async () => {
      httpMock.get.mockReturnValue(of({ search: { tabs: [{}] } }))
      expect(await service.getApplyPhraseSearch()).toBe(true)
    })
    it('should return false when phraseSearch is false', async () => {
      httpMock.get.mockReturnValue(of({ search: { tabs: [{ phraseSearch: false }] } }))
      expect(await service.getApplyPhraseSearch()).toBe(false)
    })
  })

  describe('searchAutoComplete', () => {
    it('should call api when single non-all language', async () => {
      searchApiMock.getSearchAutoCompleteResults.mockReturnValue({ toPromise: () => Promise.resolve([{ q: 'x' }]) })
      const result = await service.searchAutoComplete({ q: 'Test', l: 'en' } as any)
      expect(result).toEqual([{ q: 'x' }])
      expect(searchApiMock.getSearchAutoCompleteResults).toHaveBeenCalled()
    })

    it('should resolve empty array for multiple languages', async () => {
      const result = await service.searchAutoComplete({ q: 'Test', l: 'en,hi' } as any)
      expect(result).toEqual([])
    })

    it('should resolve empty array for "all" language', async () => {
      const result = await service.searchAutoComplete({ q: 'Test', l: 'all' } as any)
      expect(result).toEqual([])
    })
  })

  describe('getLearning / getsearchLearning', () => {
    it('getLearning should delegate to searchV6Wrapper', () => {
      const spy = jest.spyOn(service, 'searchV6Wrapper').mockReturnValue(of({} as any))
      const request: any = { request: { query: '', filters: {}, sort_by: {} } }
      service.getLearning(request)
      expect(spy).toHaveBeenCalledWith(request)
    })

    it('getsearchLearning should delegate to searchV7Wrapper', () => {
      const spy = jest.spyOn(service, 'searchV7Wrapper').mockReturnValue(of({} as any))
      const request: any = { query: 'abc' }
      service.getsearchLearning(request)
      expect(spy).toHaveBeenCalledWith(request)
    })
  })

  describe('searchV7Wrapper', () => {
    it('should build request without language', () => {
      searchApiMock.getSearchV7Results.mockReturnValue(of({}))
      service.searchV7Wrapper({ query: 'abc' } as any)
      expect(searchApiMock.getSearchV7Results).toHaveBeenCalledWith(expect.objectContaining({
        query: 'abc',
        request: expect.objectContaining({ query: 'abc' }),
      }))
    })

    it('should build request with language', () => {
      searchApiMock.getSearchV7Results.mockReturnValue(of({}))
      service.searchV7Wrapper({ query: 'abc', language: 'en' } as any)
      const arg = searchApiMock.getSearchV7Results.mock.calls[0][0]
      expect(arg.request.filters.lang).toBe('en')
    })

    it('should default query to empty string when missing', () => {
      searchApiMock.getSearchV7Results.mockReturnValue(of({}))
      service.searchV7Wrapper({} as any)
      const arg = searchApiMock.getSearchV7Results.mock.calls[0][0]
      expect(arg.query).toBe('')
    })
  })

  describe('searchV6Wrapper', () => {
    it('should build request when query present', () => {
      searchApiMock.getSearchV6Results.mockReturnValue(of({}))
      const request: any = {
        request: { query: 'abc', filters: { lang: 'en' }, sort_by: { lastUpdatedOn: 'desc' }, fields: [] },
      }
      service.searchV6Wrapper(request)
      const arg = searchApiMock.getSearchV6Results.mock.calls[0][0]
      expect(arg.request.filters.contentType).toEqual(['Course'])
      expect(request.request.filters.status).toEqual(['Live'])
    })

    it('should use raw filters when no query', () => {
      searchApiMock.getSearchV6Results.mockReturnValue(of({}))
      const request: any = {
        request: { query: '', filters: { foo: ['bar'] }, sort_by: { lastUpdatedOn: 'desc' }, fields: [] },
      }
      service.searchV6Wrapper(request)
      const arg = searchApiMock.getSearchV6Results.mock.calls[0][0]
      expect(arg.request.filters).toEqual(request.request.filters)
    })
  })

  it('fetchSocialSearchUsers should include org and rootOrg', () => {
    searchApiMock.getSearchResults.mockReturnValue(of({}))
    service.fetchSocialSearchUsers({ query: 'abc' } as any)
    expect(searchApiMock.getSearchResults).toHaveBeenCalledWith(expect.objectContaining({
      org: 'org1',
      rootOrg: 'root1',
      query: 'abc',
    }))
  })

  describe('updateSelectedFiltersSet', () => {
    it('should build set for tags with nested path parts', () => {
      const result = service.updateSelectedFiltersSet({ tags: ['a/b/c'] })
      expect(result.filterReset).toBe(true)
      expect(result.filterSet.has('a')).toBe(true)
      expect(result.filterSet.has('a/b')).toBe(true)
      expect(result.filterSet.has('a/b/c')).toBe(true)
    })

    it('should build set for non-tag keys', () => {
      const result = service.updateSelectedFiltersSet({ contentType: ['Course', 'Video'] })
      expect(result.filterSet.has('Course')).toBe(true)
      expect(result.filterSet.has('Video')).toBe(true)
      expect(result.filterReset).toBe(true)
    })

    it('should return filterReset false when all filters empty', () => {
      const result = service.updateSelectedFiltersSet({ contentType: [] })
      expect(result.filterReset).toBe(false)
    })

    it('should handle undefined filters', () => {
      const result = service.updateSelectedFiltersSet(undefined as any)
      expect(result.filterReset).toBe(false)
      expect(result.filterSet.size).toBe(0)
    })
  })

  describe('transformSearchV6Filters', () => {
    it('should flatten andFilters into single object', () => {
      const result = service.transformSearchV6Filters([
        { andFilters: [{ a: '1' }, { b: '2' }] },
      ] as any)
      expect(result).toEqual({ a: '1', b: '2' })
    })

    it('should return empty object when no andFilters', () => {
      const result = service.transformSearchV6Filters([{} as any])
      expect(result).toEqual({})
    })
  })

  describe('handleFilters', () => {
    it('should extract concepts and exclude dtLastModified', () => {
      const filters: any = [
        { type: 'concepts', content: new Array(15).fill({ id: 'c' }) },
        { type: 'dtLastModified', content: [] },
        { type: 'contentType', content: [{ type: 'course', children: [{ type: 'sub' }] }] },
      ]
      const result = service.handleFilters(filters, new Set(['course', 'sub']), { contentType: ['course'] })
      expect(result.concept.length).toBe(10)
      expect(result.filtersRes.length).toBe(1)
      expect(result.filtersRes[0].checked).toBe(true)
      expect(result.filtersRes[0].content[0].checked).toBe(true)
      expect(result.filtersRes[0].content[0].children[0].checked).toBe(true)
    })

    it('should exclude contentType when showContentType true', () => {
      const filters: any = [
        { type: 'contentType', content: [] },
      ]
      const result = service.handleFilters(filters, new Set(), {}, true)
      expect(result.filtersRes.length).toBe(0)
    })

    it('should handle content without children array', () => {
      const filters: any = [
        { type: 'topics', content: [{ type: 't1' }] },
      ]
      const result = service.handleFilters(filters, new Set(), {})
      expect(result.filtersRes[0].content[0].children).toEqual([])
    })
  })

  describe('formatFilterForSearch', () => {
    it('should format filters into string', () => {
      const result = service.formatFilterForSearch({ tags: ['a', 'b'] })
      expect(result).toBe('"tags":["a","b"]')
    })

    it('should skip keys with empty arrays', () => {
      const result = service.formatFilterForSearch({ tags: [] })
      expect(result).toBe('')
    })

    it('should join multiple keys with $', () => {
      const result = service.formatFilterForSearch({ tags: ['a'], status: ['Live'] })
      expect(result).toBe('"tags":["a"]$"status":["Live"]')
    })
  })

  describe('getDisplayName', () => {
    const cases: Array<[string, string]> = [
      ['automationcentral', 'Tools'],
      ['autogeneratedtopic', 'Topics'],
      ['topics', 'Topics'],
      ['kshopdocument', 'Kshop Document'],
      ['project', 'Project References'],
      ['kshop', 'Documents'],
      ['itemtype', 'Item Type'],
      ['authors.mailid', 'Authors'],
      ['mstlocation', 'Location'],
      ['status', 'Project Status'],
      ['marketing', 'Marketing'],
      ['unknownType', 'unknownType'],
    ]
    it.each(cases)('should map %s to %s', (input, expected) => {
      expect(service.getDisplayName(input)).toBe(expected)
    })
  })

  describe('getLanguageSearchIndex', () => {
    it('should map zh-CN to zh', () => {
      expect(service.getLanguageSearchIndex('zh-CN')).toBe('zh')
    })
    it('should return input for other languages', () => {
      expect(service.getLanguageSearchIndex('en')).toBe('en')
    })
  })

  it('raiseSearchEvent should dispatch telemetry event', () => {
    service.raiseSearchEvent('q', {}, 'en')
    expect(eventsMock.dispatchEvent).toHaveBeenCalled()
  })

  it('raiseSearchResponseEvent should dispatch telemetry event', () => {
    service.raiseSearchResponseEvent('q', {}, 5, 'en')
    expect(eventsMock.dispatchEvent).toHaveBeenCalled()
  })

  it('raiseNewSearchResponseEvent should dispatch telemetry event', () => {
    service.raiseNewSearchResponseEvent('q', 5, 'en')
    expect(eventsMock.dispatchEvent).toHaveBeenCalled()
  })

  describe('translateSearchFilters', () => {
    beforeEach(() => {
      localStorage.clear()
    })

    it('should fetch and cache translation for a single language not yet cached', async () => {
      httpMock.get.mockReturnValue(of({ SOME_KEY: 'value' }))
      const result = await service.translateSearchFilters('fr')
      expect(result).toEqual({ SOME_KEY: 'value' })
    })

    it('should return cached translation without calling http again', async () => {
      httpMock.get.mockReturnValue(of({ SOME_KEY: 'value' }))
      await service.translateSearchFilters('fr')
      httpMock.get.mockClear()
      const result = await service.translateSearchFilters('fr')
      expect(result).toEqual({ SOME_KEY: 'value' })
      expect(httpMock.get).not.toHaveBeenCalled()
    })

    it('should return en translation for multi-language input', async () => {
      localStorage.setItem('filtersTranslation', JSON.stringify({ en: { A: '1' }, all: {} }))
      const result = await service.translateSearchFilters('en,hi')
      expect(result).toEqual({ A: '1' })
    })

    it('should return empty object when no en translation exists for multi-language', async () => {
      const result = await service.translateSearchFilters('en,hi')
      expect(result).toEqual({})
    })
  })
})
