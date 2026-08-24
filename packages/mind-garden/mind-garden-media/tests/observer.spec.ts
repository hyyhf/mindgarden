import { describe, expect, it } from 'vitest'
import {
  buildPhotoDialogueEnvelope,
  buildPhotoObservationEnvelope,
  decodePhotoDialogueOutput,
  decodePhotoObservationOutput,
  defaultPhotoParticleConfig,
  type MindGardenPhotoStory,
} from '../src/index.ts'

const observation = {
  grounding: {
    visualSummary: '暖色灯光下，一只白色杯子放在木桌靠近窗边的位置。',
    visibleElements: ['白色杯子', '木桌', '窗边的暖色光影'],
    textInImage: [],
    uncertainDetails: ['杯中内容不可见'],
  },
  opening: '我先把它看作一个仍待你确认的画面：暖光落在窗边木桌与白色杯子上，杯中内容并不可见。那束光对你来说更像清晨还是傍晚？',
  quickReplies: [
    { kind: 'remember', label: '我想起了拍下它时的心情' },
    { kind: 'detail', label: '我想先聊聊那只白色杯子' },
    { kind: 'correct', label: '我想纠正一处画面细节' },
  ],
}

const story = (turns: MindGardenPhotoStory['turns'] = []): MindGardenPhotoStory => ({
  type: 'photo-story',
  id: '10000000-0000-4000-8000-000000000001' as never,
  version: '20000000-0000-4000-8000-000000000002' as never,
  attachment: {
    attachmentId: `sha256:${'a'.repeat(64)}` as never,
    mediaType: 'image/png', bytes: 3, width: 2, height: 1,
  },
  title: '窗边',
  note: '私人故事',
  stamp: { localDate: '2026-08-19', timeZone: 'Asia/Shanghai', utcOffsetMinutes: 480 },
  particleConfig: defaultPhotoParticleConfig(),
  observation: {
    id: '30000000-0000-4000-8000-000000000003' as never,
    grounding: { ...observation.grounding, source: 'model-observation-unconfirmed' },
    opening: observation.opening,
    provider: 'vision', model: 'garden-eye', promptVersion: 'mind-garden-photo-observe-v1', createdAt: 1,
  },
  turns,
  quickReplies: [],
  createdAt: 1,
  updatedAt: 1,
})

describe('Mind Garden photo observer contracts', () => {
  it('builds a bounded image envelope without story copy or attachment identifiers', () => {
    const envelope = buildPhotoObservationEnvelope(24 * 1024, 'zh-CN')
    expect(envelope).not.toBeNull()
    expect(envelope?.prompt).toContain('separately attached private image')
    expect(envelope?.prompt).not.toContain('sha256:')
    expect(envelope?.prompt).not.toContain('窗边')
    expect(JSON.parse(envelope!.prompt)).toMatchObject({ responseLanguage: 'zh-CN' })
    expect(buildPhotoObservationEnvelope(1)).toBeNull()
  })

  it('accepts only strict grounded observations with one final question and first-person continuations', () => {
    expect(decodePhotoObservationOutput(JSON.stringify(observation))).toMatchObject(observation)
    expect(decodePhotoObservationOutput(`\`\`\`json\n${JSON.stringify(observation)}\n\`\`\``)).toMatchObject(observation)
    expect(decodePhotoObservationOutput(JSON.stringify({
      ...observation, opening: `${observation.opening} 还想看哪里？`,
    }))).toBeNull()
    expect(decodePhotoObservationOutput(JSON.stringify({
      ...observation,
      quickReplies: observation.quickReplies.map((reply, index) => index === 0
        ? { ...reply, label: 'Continue the story' }
        : reply),
    }))).toBeNull()
    expect(decodePhotoObservationOutput(JSON.stringify({ ...observation, hidden: true }))).toBeNull()
  })

  it('uses frozen grounding and only the ten newest prior turns for follow-up dialogue', () => {
    const turns: MindGardenPhotoStory['turns'] = Array.from(
      { length: 12 },
      (_, index): MindGardenPhotoStory['turns'][number] => ({
        id: `${String(index + 10).padStart(8, '0')}-0000-4000-8000-000000000001` as never,
        role: index % 2 === 0 ? 'assistant' : 'user',
        content: `turn-${index}`,
        quickReplyKind: '' as const,
        createdAt: index + 1,
      }),
    )
    const envelope = buildPhotoDialogueEnvelope(story(turns), '这是傍晚。', 'remember', 24 * 1024, 'zh-CN')
    expect(envelope).not.toBeNull()
    expect(envelope?.prompt).toContain('model-observation-unconfirmed')
    const prompt = JSON.parse(envelope?.prompt ?? '{}') as {
      priorTurns?: { content: string }[]
      responseLanguage?: string
    }
    expect(prompt.responseLanguage).toBe('zh-CN')
    expect(prompt.priorTurns?.map(turn => turn.content)).toEqual([
      'turn-2', 'turn-3', 'turn-4', 'turn-5', 'turn-6',
      'turn-7', 'turn-8', 'turn-9', 'turn-10', 'turn-11',
    ])
    expect(envelope?.prompt).toContain('这是傍晚。')
    expect(envelope?.prompt).not.toContain('sha256:')
    expect(buildPhotoDialogueEnvelope(story(turns), '这是傍晚。', 'remember', 1)).toBeNull()
  })

  it('rejects malformed or internally revealing dialogue output', () => {
    const valid = {
      reply: '画面只能确认暖色光影，而傍晚来自你的记忆。',
      quickReplies: observation.quickReplies,
    }
    expect(decodePhotoDialogueOutput(JSON.stringify(valid))).toMatchObject(valid)
    expect(decodePhotoDialogueOutput(JSON.stringify({ ...valid, reply: 'attachmentId is hidden' }))).toBeNull()
    expect(decodePhotoDialogueOutput(JSON.stringify({ ...valid, extra: true }))).toBeNull()
  })
})
