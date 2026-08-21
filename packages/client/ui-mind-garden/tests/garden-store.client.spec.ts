/** Mind Garden view store: session navigation and collapsed-rail persistence shape. */

import { describe, expect, it } from 'vitest'
import { createMindGardenViewStore } from '../src/client/garden-store.ts'

describe('createMindGardenViewStore', () => {
  it('starts in today with the full garden rail', () => {
    const store = createMindGardenViewStore().create()
    expect(store.getSnapshot()).toEqual({ activeSpace: 'today', sidebarCollapsed: false })
  })

  it('selects every declared space and toggles the rail', () => {
    const store = createMindGardenViewStore().create()
    store.actions.selectSpace('star-map')
    store.actions.toggleSidebar()
    expect(store.getSnapshot()).toEqual({ activeSpace: 'star-map', sidebarCollapsed: true })
    store.actions.selectSpace('photo-story')
    store.actions.toggleSidebar()
    expect(store.getSnapshot()).toEqual({ activeSpace: 'photo-story', sidebarCollapsed: false })
  })
})
