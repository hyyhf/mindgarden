/** Constellation derivation from open questions and period reviews. */

import { describe, expect, it } from 'vitest'
import type { MindGardenOpenQuestion, MindGardenPeriodReview } from '@deepseek-ai/dsh-mind-garden-reflection/types'
import { createGardenStarMap, type GardenStarMapLabels } from '../src/client/star-map/model.ts'

const stamp = { localDate: '2026-08-19', timeZone: 'Asia/Shanghai', utcOffsetMinutes: 480 }
const labels: GardenStarMapLabels = {
  center: 'center',
  serenity: 'serenity detail',
  clarity: 'clarity detail',
  since: 'since {date}',
  unnamedReview: 'unnamed',
  reviewDetail: '{start}/{end}/{count}',
  traitDetail: 'self-authored',
}

function question(index: number, status: 'open' | 'resolved' = 'open', withSource = false): MindGardenOpenQuestion {
  return {
    id: `q-${index}`,
    question: `Question ${index}`,
    status,
    source: withSource ? { evidenceQuote: `Evidence ${index}` } : null,
    createdStamp: stamp,
  } as unknown as MindGardenOpenQuestion
}

function review(index: number, status: 'proposed' | 'saved' | 'archived', content = `Review ${index}`): MindGardenPeriodReview {
  return {
    id: `r-${index}`,
    status,
    content,
    startStamp: stamp,
    endStamp: { ...stamp, localDate: '2026-08-20' },
    sources: Array.from({ length: index % 3 }, (_, sourceIndex) => ({ id: `source-${sourceIndex}` })),
  } as unknown as MindGardenPeriodReview
}

describe('createGardenStarMap', () => {
  it('maps live records, localized fallbacks, radii, and continuity links', () => {
    const model = createGardenStarMap(
      [question(1, 'open', true), question(2), question(3, 'resolved')],
      [review(1, 'proposed', '\nbody'), review(2, 'saved'), review(3, 'archived')],
      'serenity',
      labels,
    )

    expect(model.nodes).toHaveLength(5)
    expect(model.nodes[0]).toMatchObject({ id: 'center', detail: 'serenity detail', radius: 2.2 })
    expect(model.nodes[1]).toMatchObject({ title: 'Question 1', detail: 'Evidence 1', radius: 0.76 })
    expect(model.nodes[2]).toMatchObject({ detail: 'since 2026-08-19' })
    expect(model.nodes[3]).toMatchObject({ title: 'unnamed', detail: '2026-08-19/2026-08-20/1', radius: 0.92 })
    expect(model.nodes[4]).toMatchObject({ title: 'Review 2', radius: 1.12 })
    expect(model.links).toContainEqual({
      id: 'continuity:r-1:r-2',
      source: 'review:r-1',
      target: 'review:r-2',
      kind: 'continuity',
    })
    expect(Number.isFinite(model.nodes[1]!.x)).toBe(true)
  })

  it('is deterministic, bounds dense skies, and represents clarity without records', () => {
    const questions = Array.from({ length: 22 }, (_, index) => question(index))
    const reviews = Array.from({ length: 15 }, (_, index) => review(index, 'saved'))
    const first = createGardenStarMap(questions, reviews, 'clarity', labels)
    const second = createGardenStarMap(questions, reviews, 'clarity', labels)

    expect(first).toEqual(second)
    expect(first.nodes).toHaveLength(31)
    expect(first.nodes[0].detail).toBe('clarity detail')
    expect(first.links).toHaveLength(41)
    expect(createGardenStarMap([], [], 'clarity', labels)).toEqual({
      nodes: [expect.objectContaining({ id: 'center', detail: 'clarity detail' })],
      links: [],
    })
  })
})
