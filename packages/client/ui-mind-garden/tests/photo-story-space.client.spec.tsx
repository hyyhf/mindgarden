// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react'
import type { MindGardenPhotoParticleConfig, MindGardenPhotoStory } from '@deepseek-ai/dsh-mind-garden-media/types'
import { PhotoStorySpace } from '../src/client/photo-story/PhotoStorySpace.tsx'
import { DEFAULT_PHOTO_PARTICLE_CONFIG } from '../src/client/photo-story/presets.ts'
import type { MindGardenViewActions } from '../src/client/slots.ts'
import { zh, type MindGardenKey } from '../src/client/locales.ts'

vi.mock('../src/client/photo-story/PhotoParticleScene.tsx', () => ({
  PhotoParticleScene: ({ alt, onCount }: { alt: string; onCount?: (count: number) => void }) => (
    <button type="button" aria-label={alt} data-testid="particle-scene" onClick={() => { onCount?.(43_210) }}>particle scene</button>
  ),
}))

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

const t = (key: MindGardenKey) => zh[key]
const stamp = { localDate: '2026-08-19', timeZone: 'Asia/Shanghai', utcOffsetMinutes: 480 }

function story(index = 1, overrides: Partial<MindGardenPhotoStory> = {}): MindGardenPhotoStory {
  return {
    type: 'photo-story', id: `10000000-0000-4000-8000-${String(index).padStart(12, '0')}`,
    version: `20000000-0000-4000-8000-${String(index).padStart(12, '0')}`,
    attachment: {
      attachmentId: `sha256:${String(index).padStart(64, 'a')}`, mediaType: 'image/png', bytes: 3, width: 2, height: 1,
    },
    title: `Frame ${index}`, note: `Note ${index}`, stamp,
    observation: null, turns: [], quickReplies: [],
    particleConfig: DEFAULT_PHOTO_PARTICLE_CONFIG, createdAt: index, updatedAt: index,
    ...overrides,
  } as unknown as MindGardenPhotoStory
}

type PhotoActions = Pick<
  MindGardenViewActions,
  | 'onListPhotoStories'
  | 'onCreatePhotoStory'
  | 'onReadPhotoStory'
  | 'onObservePhotoStory'
  | 'onContinuePhotoStory'
  | 'onUpdatePhotoStory'
  | 'onDeletePhotoStory'
>

function actions(overrides: Partial<PhotoActions> = {}): PhotoActions {
  return {
    onListPhotoStories: vi.fn(() => Promise.resolve({ ok: true as const, value: [] })),
    onCreatePhotoStory: vi.fn(() => Promise.resolve({ ok: true as const, value: story() })),
    onReadPhotoStory: vi.fn(() => Promise.resolve({ ok: true as const, value: 'data:image/png;base64,AQID' })),
    onObservePhotoStory: vi.fn((item: MindGardenPhotoStory) => Promise.resolve({ ok: true as const, value: item })),
    onContinuePhotoStory: vi.fn((item: MindGardenPhotoStory) => Promise.resolve({ ok: true as const, value: item })),
    onUpdatePhotoStory: vi.fn((
      item: MindGardenPhotoStory,
      title: string,
      note: string,
      particleConfig: MindGardenPhotoParticleConfig,
    ) => Promise.resolve({
      ok: true as const, value: { ...item, title, note, particleConfig, version: 'next-version' } as MindGardenPhotoStory,
    })),
    onDeletePhotoStory: vi.fn(() => Promise.resolve({ ok: true as const, value: true as const })),
    ...overrides,
  }
}

describe('PhotoStorySpace', () => {
  it('observes only after disclosure and continues from frozen grounding', async () => {
    const original = story()
    const observed = story(1, {
      version: 'observed-version' as MindGardenPhotoStory['version'],
      observation: {
        id: 'observation-1',
        grounding: {
          visualSummary: 'Warm afternoon light falls across a shared table.',
          visibleElements: ['table', 'two cups'],
          textInImage: [],
          uncertainDetails: ['who is outside the frame'],
          source: 'model-observation-unconfirmed',
        },
        opening: 'What do you remember about this light?',
        provider: 'test', model: 'vision', promptVersion: 'mind-garden-photo-observe-v1', createdAt: 2,
      },
      turns: [{
        id: 'turn-1', role: 'assistant', content: 'What do you remember about this light?',
        quickReplyKind: '', createdAt: 2,
      }],
      quickReplies: [{ kind: 'remember', label: 'I remember the quiet after lunch.' }],
    } as unknown as Partial<MindGardenPhotoStory>)
    const continued = story(1, {
      ...observed,
      version: 'continued-version' as MindGardenPhotoStory['version'],
      turns: [
        ...observed.turns,
        { id: 'turn-2', role: 'user', content: 'I remember the quiet after lunch.', quickReplyKind: 'remember', createdAt: 3 },
      ],
    } as Partial<MindGardenPhotoStory>)
    const api = actions({
      onListPhotoStories: vi.fn(() => Promise.resolve({ ok: true as const, value: [original] })),
      onObservePhotoStory: vi.fn(() => Promise.resolve({ ok: true as const, value: observed })),
      onContinuePhotoStory: vi.fn(() => Promise.resolve({ ok: true as const, value: continued })),
    })
    const view = render(<PhotoStorySpace today="2026-08-19" {...api} t={t} />)
    await view.findByText(original.title)
    fireEvent.click(view.getByRole('button', { name: `${zh['photo.open']} · ${original.title}` }))
    await view.findByText(zh['photo.observe.title'])
    expect(api.onObservePhotoStory).not.toHaveBeenCalled()
    fireEvent.click(view.getByRole('button', { name: zh['photo.observe.action'] }))
    await view.findByText('Warm afternoon light falls across a shared table.')
    expect(api.onObservePhotoStory).toHaveBeenCalledWith(original)
    fireEvent.click(view.getByRole('button', { name: 'I remember the quiet after lunch.' }))
    await waitFor(() => {
      expect(api.onContinuePhotoStory).toHaveBeenCalledWith(
        observed,
        'I remember the quiet after lunch.',
        'remember',
      )
    })
  })

  it('uploads multiple verified images and switches between classic pages and the 3D ring', async () => {
    const stories = Array.from({ length: 11 }, (_, index) => story(index + 1))
    const api = actions({
      onListPhotoStories: vi.fn()
        .mockResolvedValueOnce({ ok: true as const, value: [] })
        .mockResolvedValue({ ok: true as const, value: stories }),
      onCreatePhotoStory: vi.fn()
        .mockResolvedValueOnce({ ok: true as const, value: stories[0] })
        .mockResolvedValueOnce({ ok: false as const, code: 'attachment-rejected' }),
    })
    const view = render(<PhotoStorySpace today="2026-08-19" {...api} t={t} />)
    await waitFor(() => { expect(view.getByText(zh['photo.empty.title'])).toBeTruthy() })

    const input = view.container.querySelector('input[type="file"]') as HTMLInputElement
    const files = [new File(['one'], 'one.png', { type: 'image/png' }), new File(['two'], 'two.png', { type: 'image/png' })]
    fireEvent.change(input, { target: { files } })
    await waitFor(() => { expect(api.onCreatePhotoStory).toHaveBeenCalledTimes(2) })
    await waitFor(() => { expect(view.getByText('Frame 1')).toBeTruthy() })
    expect(view.getByRole('alert')).toBeTruthy()
    expect(api.onReadPhotoStory).toHaveBeenCalledTimes(9)

    fireEvent.click(view.getByRole('button', { name: zh['photo.pageNext'] }))
    await waitFor(() => { expect(view.getByText('Frame 10')).toBeTruthy() })
    fireEvent.click(view.getByRole('button', { name: zh['photo.pagePrevious'] }))
    expect(view.getByText('Frame 1')).toBeTruthy()
    fireEvent.click(view.getByRole('tab', { name: zh['photo.dynamic'] }))
    expect(view.getByText(zh['photo.dynamicHint'])).toBeTruthy()
    expect(view.container.querySelectorAll('button[class*="dynamicCard"]')).toHaveLength(10)
    const firstFrame = view.getByRole('button', { name: `${zh['photo.open']} · Frame 1` })
    const livePosition = view.container.querySelector('[aria-live]')
    expect(firstFrame.tabIndex).toBe(0)
    expect(livePosition?.getAttribute('aria-live')).toBe('off')
    firstFrame.focus()
    fireEvent.keyDown(firstFrame, { key: 'ArrowRight' })
    const secondFrame = view.getByRole('button', { name: `${zh['photo.open']} · Frame 2` })
    await waitFor(() => { expect(document.activeElement).toBe(secondFrame) })
    expect(firstFrame.getAttribute('aria-hidden')).toBe('true')
    fireEvent.click(view.getByRole('button', { name: zh['photo.carouselPause'] }))
    expect(view.getByRole('button', { name: zh['photo.carouselPlay'] })).toBeTruthy()
    expect(livePosition?.getAttribute('aria-live')).toBe('polite')
    fireEvent.click(view.getByRole('button', { name: zh['photo.carouselPrevious'] }))
    fireEvent.click(view.getByRole('button', { name: `${zh['photo.open']} · Frame 1` }))
    await waitFor(() => { expect(view.getByTestId('particle-scene')).toBeTruthy() })
    fireEvent.click(view.getByRole('button', { name: zh['photo.back'] }))
    fireEvent.click(view.getByRole('tab', { name: zh['photo.classic'] }))
    expect(view.getByText('Frame 1')).toBeTruthy()
  })

  it('edits a live particle story, previews the original, saves under CAS, and confirms deletion inline', async () => {
    const original = story()
    const sibling = story(2)
    const api = actions({
      onListPhotoStories: vi.fn()
        .mockResolvedValueOnce({ ok: true as const, value: [original, sibling] })
        .mockResolvedValueOnce({ ok: true as const, value: [] }),
    })
    const view = render(<PhotoStorySpace today="2026-08-19" {...api} t={t} />)
    await waitFor(() => { expect(view.getByText(original.title)).toBeTruthy() })
    fireEvent.click(view.getByRole('button', { name: `${zh['photo.open']} · ${original.title}` }))
    await waitFor(() => { expect(view.getByTestId('particle-scene')).toBeTruthy() })
    fireEvent.click(view.getByTestId('particle-scene'))
    expect(view.getByText(/43,210 粒子/)).toBeTruthy()

    fireEvent.change(view.getByLabelText(zh['photo.storyTitle']), { target: { value: 'Renamed frame' } })
    fireEvent.change(view.getByLabelText(zh['photo.storyNote']), { target: { value: 'A private story' } })
    fireEvent.click(view.getByRole('button', { name: zh['photo.particle.nebula'] }))
    fireEvent.change(view.getByRole('slider', { name: zh['photo.pointSize'] }), { target: { value: '3.2' } })
    fireEvent.change(view.getByRole('slider', { name: zh['photo.depth'] }), { target: { value: '40' } })
    fireEvent.change(view.getByRole('slider', { name: zh['photo.interaction'] }), { target: { value: '6.5' } })
    fireEvent.change(view.getByRole('slider', { name: zh['photo.motion'] }), { target: { value: '0.7' } })
    fireEvent.click(view.getByRole('button', { name: zh['photo.save'] }))
    await waitFor(() => { expect(view.getByText(zh['photo.saved'])).toBeTruthy() })
    expect(api.onUpdatePhotoStory).toHaveBeenCalledWith(
      original, 'Renamed frame', 'A private story',
      expect.objectContaining({
        preset: 'nebula',
        rendering: expect.objectContaining({ pointSize: 3.2 }) as MindGardenPhotoParticleConfig['rendering'],
      }) as MindGardenPhotoParticleConfig,
    )

    fireEvent.change(view.getByLabelText(zh['photo.storyTitle']), { target: { value: '' } })
    expect(view.getByTestId('particle-scene').getAttribute('aria-label')).toBe(zh['photo.scene'])
    fireEvent.click(view.getByRole('button', { name: zh['photo.preview'] }))
    expect(view.getByRole('dialog', { name: zh['photo.previewDialog'] })).toBeTruthy()
    fireEvent.click(view.getByRole('button', { name: zh['photo.previewClose'] }))
    fireEvent.click(view.getByRole('button', { name: zh['photo.delete'] }))
    expect(view.getByText(zh['photo.deleteHint'])).toBeTruthy()
    fireEvent.click(view.getByRole('button', { name: zh['photo.deleteConfirm'] }))
    await waitFor(() => { expect(api.onDeletePhotoStory).toHaveBeenCalledOnce() })
    await waitFor(() => { expect(view.getByText(zh['photo.empty.title'])).toBeTruthy() })
  })

  it('recovers list failures and contains browser, read, save, and delete failures', async () => {
    const original = story()
    const api = actions({
      onListPhotoStories: vi.fn()
        .mockResolvedValueOnce({ ok: false as const, code: 'unavailable' })
        .mockResolvedValue({ ok: true as const, value: [original] }),
      onCreatePhotoStory: vi.fn(() => Promise.reject(new Error('file read failed'))),
      onReadPhotoStory: vi.fn()
        .mockResolvedValueOnce({ ok: false as const, code: 'attachment-unavailable' })
        .mockResolvedValue({ ok: true as const, value: 'data:image/png;base64,AQID' }),
      onUpdatePhotoStory: vi.fn()
        .mockResolvedValueOnce({ ok: false as const, code: 'photo-story-version-conflict' })
        .mockRejectedValueOnce(new Error('transport failed')),
      onDeletePhotoStory: vi.fn()
        .mockResolvedValueOnce({ ok: false as const, code: 'photo-story-version-conflict' })
        .mockRejectedValueOnce(new Error('transport failed')),
    })
    const view = render(<PhotoStorySpace today="2026-08-19" {...api} t={t} />)
    await waitFor(() => { expect(view.getByRole('alert')).toBeTruthy() })
    fireEvent.click(view.getByRole('button', { name: zh['photo.retry'] }))
    await waitFor(() => { expect(view.getByText(original.title)).toBeTruthy() })
    const input = view.container.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(input, { target: { files: [new File(['x'], 'x.png', { type: 'image/png' })] } })
    await waitFor(() => { expect(api.onCreatePhotoStory).toHaveBeenCalledOnce() })

    fireEvent.click(view.getByRole('button', { name: `${zh['photo.open']} · ${original.title}` }))
    expect(view.getByText(zh['photo.sceneLoading'])).toBeTruthy()
    fireEvent.click(view.getByRole('button', { name: zh['photo.retry'] }))
    await waitFor(() => { expect(view.getByTestId('particle-scene')).toBeTruthy() })
    fireEvent.click(view.getByRole('button', { name: zh['photo.save'] }))
    await waitFor(() => { expect(api.onUpdatePhotoStory).toHaveBeenCalledOnce() })
    fireEvent.click(view.getByRole('button', { name: zh['photo.save'] }))
    await waitFor(() => { expect(api.onUpdatePhotoStory).toHaveBeenCalledTimes(2) })
    fireEvent.click(view.getByRole('button', { name: zh['photo.delete'] }))
    fireEvent.click(view.getByRole('button', { name: zh['photo.deleteConfirm'] }))
    await waitFor(() => { expect(api.onDeletePhotoStory).toHaveBeenCalledOnce() })
    fireEvent.click(view.getByRole('button', { name: zh['photo.delete'] }))
    fireEvent.click(view.getByRole('button', { name: zh['photo.deleteConfirm'] }))
    await waitFor(() => { expect(api.onDeletePhotoStory).toHaveBeenCalledTimes(2) })
    expect(view.getByRole('alert')).toBeTruthy()
    fireEvent.click(view.getByRole('button', { name: zh['photo.back'] }))
  })

  it('opens both file pickers, ignores an empty selection, and completes an accepted upload', async () => {
    const api = actions()
    const view = render(<PhotoStorySpace today="2026-08-19" {...api} t={t} />)
    await waitFor(() => { expect(view.getByText(zh['photo.empty.title'])).toBeTruthy() })
    const input = view.container.querySelector('input[type="file"]') as HTMLInputElement
    const click = vi.spyOn(input, 'click')
    fireEvent.click(view.getByRole('button', { name: zh['photo.upload'] }))
    fireEvent.click(view.getByRole('button', { name: zh['photo.empty.action'] }))
    expect(click).toHaveBeenCalledTimes(2)

    fireEvent.change(input, { target: { files: null } })
    expect(api.onCreatePhotoStory).not.toHaveBeenCalled()
    fireEvent.change(input, { target: { files: [new File(['ok'], 'ok.png', { type: 'image/png' })] } })
    await waitFor(() => { expect(api.onCreatePhotoStory).toHaveBeenCalledOnce() })
    await waitFor(() => { expect(api.onListPhotoStories).toHaveBeenCalledTimes(2) })
    expect(view.queryByRole('alert')).toBeNull()
  })

  it('discards obsolete metadata and image reads while keeping the dynamic placeholder interactive', async () => {
    const deferredList = Promise.withResolvers<Awaited<ReturnType<PhotoActions['onListPhotoStories']>>>()
    const listApi = actions({ onListPhotoStories: vi.fn(() => deferredList.promise) })
    const listView = render(<PhotoStorySpace today="2026-08-19" {...listApi} t={t} />)
    listView.unmount()
    deferredList.resolve({ ok: true, value: [story()] })
    await deferredList.promise

    const deferredImage = Promise.withResolvers<Awaited<ReturnType<PhotoActions['onReadPhotoStory']>>>()
    const imageApi = actions({
      onListPhotoStories: vi.fn(() => Promise.resolve({ ok: true as const, value: [story()] })),
      onReadPhotoStory: vi.fn(() => deferredImage.promise),
    })
    const imageView = render(<PhotoStorySpace today="2026-08-19" {...imageApi} t={t} />)
    await imageView.findByText('Frame 1')
    fireEvent.click(imageView.getByRole('tab', { name: zh['photo.dynamic'] }))
    expect(imageView.container.querySelector('[class*="shimmer"]')).toBeTruthy()
    fireEvent.click(imageView.getByRole('button', { name: `${zh['photo.open']} · Frame 1` }))
    expect(imageView.getByText(zh['photo.sceneLoading'])).toBeTruthy()
    deferredImage.resolve({ ok: true, value: 'data:image/png;base64,AQID' })
    await deferredImage.promise
    await Promise.resolve()
    imageView.unmount()
  })
})
