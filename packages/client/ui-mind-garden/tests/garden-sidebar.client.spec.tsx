// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/react'
import { GardenSidebar } from '../src/client/GardenSidebar.tsx'
import { zh, type MindGardenKey } from '../src/client/locales.ts'

afterEach(cleanup)

const t = (key: MindGardenKey) => zh[key]

describe('GardenSidebar', () => {
  it('keeps all nine destinations reachable through five clear regions', () => {
    const onSelect = vi.fn()
    const onToggle = vi.fn()
    const onSettings = vi.fn()
    const view = render(
      <GardenSidebar
        activeSpace="today"
        collapsed={false}
        starState="new-dust"
        starCount={4}
        onSelect={onSelect}
        onSettings={onSettings}
        onToggle={onToggle}
        t={t}
      />,
    )

    for (const label of [
      'space.region.now',
      'space.region.innerLife',
      'space.region.time',
      'space.region.keepsakes',
      'space.region.starGarden',
    ] as const) expect(view.getByRole('button', { name: zh[label] })).toBeTruthy()
    expect(view.getByRole('button', { name: zh['space.today'] }).getAttribute('aria-current')).toBe('page')

    const destinations = [
      { active: 'today', labels: [['space.today', 'today']] },
      { active: 'concerns', labels: [['space.concerns', 'concerns'], ['space.growth', 'growth']] },
      { active: 'calendar', labels: [['space.calendar', 'calendar'], ['space.life', 'life']] },
      { active: 'photo-story', labels: [['space.photoStory', 'photo-story'], ['space.memory', 'memory']] },
      { active: 'star-map', labels: [['space.starMap', 'star-map'], ['space.philosophy', 'philosophy']] },
    ] as const
    for (const region of destinations) {
      view.rerender(
        <GardenSidebar
          activeSpace={region.active}
          collapsed={false}
          starState="new-dust"
          starCount={4}
          onSelect={onSelect}
          onSettings={onSettings}
          onToggle={onToggle}
          t={t}
        />,
      )
      for (const [label, id] of region.labels) {
        const destination = view.getByRole('button', { name: zh[label] })
        fireEvent.click(destination)
        expect(onSelect).toHaveBeenLastCalledWith(id)
      }
    }

    fireEvent.click(view.getByRole('button', { name: zh['space.collapse'] }))
    expect(onToggle).toHaveBeenCalledOnce()
    fireEvent.click(view.getByRole('button', { name: new RegExp(zh['star.sidebar.title']) }))
    expect(onSelect).toHaveBeenCalledWith('star-map')
    fireEvent.click(view.getByRole('button', { name: zh['garden.settings'] }))
    expect(onSettings).toHaveBeenCalledOnce()
  })

  it('keeps compact navigation labelled and opens the constellation space', () => {
    const onSelect = vi.fn()
    const view = render(
      <GardenSidebar
        activeSpace="star-map"
        collapsed
        starState="ritual"
        starCount={0}
        onSelect={onSelect}
        onSettings={vi.fn()}
        onToggle={vi.fn()}
        t={t}
      />,
    )

    expect(view.getByRole('button', { name: zh['space.expand'] })).toBeTruthy()
    fireEvent.click(view.getByRole('button', { name: zh['space.region.now'] }))
    expect(onSelect).toHaveBeenLastCalledWith('today')
    const constellation = view.getByRole('button', { name: zh['space.starMap'] })
    fireEvent.click(constellation)
    expect(onSelect).toHaveBeenCalledWith('star-map')
  })
})
