// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/react'
import { GardenSidebar } from '../src/client/GardenSidebar.tsx'
import { zh, type MindGardenKey } from '../src/client/locales.ts'

afterEach(cleanup)

const t = (key: MindGardenKey) => zh[key]

describe('GardenSidebar', () => {
  it('renders all original groups and opens every migrated destination', () => {
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

    expect(view.getAllByRole('region')).toHaveLength(3)
    for (const label of [
      'space.today',
      'space.concerns',
      'space.calendar',
      'space.photoStory',
      'space.memory',
      'space.growth',
      'space.starMap',
      'space.life',
      'space.philosophy',
    ] as const) expect(view.getByText(zh[label])).toBeTruthy()
    expect(view.getByRole('button', { name: zh['space.today'] }).getAttribute('aria-current')).toBe('page')
    const photoStory = view.getByRole('button', { name: new RegExp(zh['space.photoStory']) })
    expect(photoStory).toHaveProperty('disabled', false)

    fireEvent.click(view.getByRole('button', { name: zh['space.memory'] }))
    expect(onSelect).toHaveBeenCalledWith('memory')
    fireEvent.click(photoStory)
    expect(onSelect).toHaveBeenCalledWith('photo-story')
    fireEvent.click(view.getByRole('button', { name: zh['space.collapse'] }))
    expect(onToggle).toHaveBeenCalledOnce()
    expect(view.getByText('4 颗星尘等待判断')).toBeTruthy()
    fireEvent.click(view.getByRole('button', { name: zh['star.sidebar.title'] }))
    expect(onSelect).toHaveBeenCalledWith('star-map')
    fireEvent.click(view.getByRole('button', { name: zh['garden.settings'] }))
    expect(onSettings).toHaveBeenCalledOnce()
  })

  it('keeps icon-only navigation accessible and opens the constellation space', () => {
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
    expect(view.getByRole('button', { name: zh['space.today'] })).toBeTruthy()
    const constellation = view.getByRole('button', { name: zh['space.starMap'] })
    fireEvent.click(constellation)
    expect(onSelect).toHaveBeenCalledWith('star-map')
  })
})
