import { buildPlayerStateForResource, IPlayerQueueNode } from './player-state.service'

/**
 * Covers the Next-button completion sync. buildPlayerStateForResource() is the pure
 * core extracted from ViewerTocComponent's resource-change handler; testing it here
 * avoids the heavy TOC component import graph (project/ specs can't load it under Jest).
 *
 * Regression: revisiting an already-completed resource used to blank currentPercentage
 * to null, leaving Next disabled even though the resource showed a completion tick.
 */
describe('buildPlayerStateForResource', () => {
  const node = (identifier: string, completionPercentage?: number): IPlayerQueueNode => ({
    identifier,
    viewerUrl: `/viewer/pdf/${identifier}`,
    title: identifier,
    completionPercentage,
  })

  const queue = [node('res-1', 100), node('res-2', 100), node('res-3', 40)]

  it('reports 100% for an already-completed resource so Next is enabled', () => {
    const state = buildPlayerStateForResource(queue, 'res-2', true)
    expect(state.currentPercentage).toBe(100)
    expect(state.prevPercentage).toBe(100)
    expect(state.prev).toBe('/viewer/pdf/res-1')
    expect(state.next).toBe('/viewer/pdf/res-3')
    expect(state.nextContentId).toBe('res-3')
    expect(state.isValid).toBe(true)
  })

  it('reports the resource own progress when incomplete (Next stays gated)', () => {
    const state = buildPlayerStateForResource(queue, 'res-3', true)
    expect(state.currentPercentage).toBe(40)
    // last leaf — no next
    expect(state.next).toBeNull()
    expect(state.nextTitle).toBeNull()
    expect(state.nextContentId).toBeNull()
  })

  it('never inherits the previous resource percentage — indexes by resourceId', () => {
    expect(buildPlayerStateForResource(queue, 'res-2', true).currentPercentage).toBe(100)
    expect(buildPlayerStateForResource(queue, 'res-3', true).currentPercentage).toBe(40)
  })

  it('collapses an undefined completionPercentage to null (not undefined)', () => {
    const state = buildPlayerStateForResource([node('res-x')], 'res-x', true)
    expect(state.currentPercentage).toBeNull()
  })

  it('returns null current/prev/next when the resource is not in the queue', () => {
    const state = buildPlayerStateForResource(queue, 'unknown', true)
    expect(state.currentPercentage).toBeNull()
    expect(state.prev).toBeNull()
    expect(state.next).toBeNull()
    // firstResource is still surfaced for fallback navigation
    expect(state.firstResource).toBe('/viewer/pdf/res-1')
  })

  it('has no previous resource for the first item', () => {
    const state = buildPlayerStateForResource(queue, 'res-1', true)
    expect(state.prev).toBeNull()
    expect(state.prevTitle).toBeNull()
    expect(state.prevPercentage).toBeNull()
    expect(state.next).toBe('/viewer/pdf/res-2')
  })

  it('is resilient to an empty/undefined queue', () => {
    const state = buildPlayerStateForResource(undefined as any, 'res-1', false)
    expect(state.currentPercentage).toBeNull()
    expect(state.firstResource).toBeNull()
    expect(state.isValid).toBe(false)
  })
})
