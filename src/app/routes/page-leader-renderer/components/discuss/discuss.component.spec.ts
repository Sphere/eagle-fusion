jest.mock('@ws-widget/collection', () => ({
  NsDiscussionForum: {
    EDiscussionType: { LEARNING: 'LEARNING' },
  },
}))

jest.mock('@ws-widget/resolver', () => ({
  NsWidgetResolver: {},
}))

import { DiscussComponent } from './discuss.component'

describe('DiscussComponent', () => {
  let component: DiscussComponent

  beforeEach(() => {
    component = new DiscussComponent()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should default discussionForumWidget to null', () => {
    expect(component.discussionForumWidget).toBeNull()
  })

  it('should default discussionFetchStatus to "none"', () => {
    expect(component.discussionFetchStatus).toBe('none')
  })

  it('should not set discussionForumWidget when leaderProfile is null', () => {
    component.leaderProfile = null
    component.ngOnInit()
    expect(component.discussionForumWidget).toBeNull()
    expect(component.discussionFetchStatus).toBe('none')
  })

  it('should set discussionForumWidget when leaderProfile is truthy', () => {
    component.leaderProfile = { name: 'Dr. Smith' } as any
    component.pageId = 'leader-page-123'
    component.ngOnInit()
    expect(component.discussionForumWidget).not.toBeNull()
    expect(component.discussionFetchStatus).toBe('done')
  })

  it('should set widgetData.id to pageId', () => {
    component.leaderProfile = { name: 'Leader' } as any
    component.pageId = 'my-page-id'
    component.ngOnInit()
    expect(component.discussionForumWidget?.widgetData.id).toBe('my-page-id')
  })

  it('should set widgetType and widgetSubType to discussionForum', () => {
    component.leaderProfile = { name: 'Leader' } as any
    component.ngOnInit()
    expect(component.discussionForumWidget?.widgetType).toBe('discussionForum')
    expect(component.discussionForumWidget?.widgetSubType).toBe('discussionForum')
  })
})
