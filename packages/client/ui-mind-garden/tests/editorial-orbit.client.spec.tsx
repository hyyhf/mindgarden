// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import type { MindGardenOpenQuestion, MindGardenPeriodReview } from '@deepseek-ai/dsh-mind-garden-reflection/types'
import { EditorialOrbit } from '../src/client/EditorialOrbit.tsx'
import { GardenMarkIcon } from '../src/client/GardenIcons.tsx'
import { zh, type MindGardenKey } from '../src/client/locales.ts'

afterEach(cleanup)

const t = (key: MindGardenKey) => zh[key]

function question(id: string, status: 'open' | 'resolved'): MindGardenOpenQuestion {
  return { id, question: `问题 ${id}`, status } as unknown as MindGardenOpenQuestion
}

function review(id: string, status: 'saved' | 'proposed'): MindGardenPeriodReview {
  return {
    id,
    content: `回望 ${id}`,
    status,
    endStamp: { localDate: '2026-08-20' },
  } as unknown as MindGardenPeriodReview
}

describe('EditorialOrbit', () => {
  it('keeps a complete six-point instrument before any records exist', () => {
    const view = render(<EditorialOrbit questions={[]} reviews={[]} mode="serenity" t={t} />)

    expect(view.getAllByRole('listitem')).toHaveLength(6)
    expect(view.getByText(zh['orbit.fallback.today'])).toBeTruthy()
    expect(view.getByText(zh['orbit.fallback.return'])).toBeTruthy()
    expect(view.getByText('0 个开放问题 · 0 段已保存回望')).toBeTruthy()
  })

  it('uses only open questions and saved reviews as truthful orbital records', () => {
    const view = render(
      <EditorialOrbit
        questions={[question('open', 'open'), question('closed', 'resolved')]}
        reviews={[review('saved', 'saved'), review('draft', 'proposed')]}
        mode="clarity"
        t={t}
      />,
    )

    expect(view.getByText('问题 open')).toBeTruthy()
    expect(view.queryByText('问题 closed')).toBeNull()
    expect(view.getByText('回望 saved')).toBeTruthy()
    expect(view.queryByText('回望 draft')).toBeNull()
    expect(view.getByText('1 个开放问题 · 1 段已保存回望')).toBeTruthy()
    expect(view.getByText(zh['mode.clarity'])).toBeTruthy()
  })

  it('keeps the garden mark usable at its default icon size', () => {
    const view = render(<GardenMarkIcon />)
    expect(view.container.querySelector('svg')?.getAttribute('width')).toBe('18')
  })
})
