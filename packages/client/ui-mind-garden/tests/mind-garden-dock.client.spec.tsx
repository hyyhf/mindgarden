// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react'
import type { MindGardenSessionProjection } from '@deepseek-ai/dsh-mind-garden/core/client'
import type { LocaleKeysOf } from '@deepseek-ai/dsh-client-ui-slots'
import { MindGardenDock, MindGardenPanel } from '../src/client/MindGardenDock.tsx'
import type { MindGardenDockActions } from '../src/client/slots.ts'
import { zh, type MindGardenKey } from '../src/client/locales.ts'

afterEach(cleanup)

const t = (key: LocaleKeysOf<'mindGarden'>) => zh[key as MindGardenKey] ?? key

const active = (revision = 2): MindGardenSessionProjection => ({
  state: {
    revision,
    activatedAt: 1,
    updatedAt: 2,
    mode: 'serenity',
    supportIntent: 'auto',
    privacy: 'durable',
    contractVersion: 1,
    modelDisclosureAccepted: true,
  },
})

function actions(overrides: Partial<MindGardenDockActions> = {}): MindGardenDockActions {
  return {
    onActivate: () => Promise.resolve({ ok: true, value: undefined }),
    onSelectMode: () => Promise.resolve({ ok: true, value: undefined }),
    onSelectSupportIntent: () => Promise.resolve({ ok: true, value: undefined }),
    ...overrides,
  }
}

describe('MindGardenPanel', () => {
  it('renders nothing when the projection capability is absent', () => {
    const view = render(<MindGardenPanel projection={undefined} {...actions()} t={t} />)
    expect(view.container.firstChild).toBeNull()
  })

  it('opens the disclosure and activates exactly once despite rapid clicks', async () => {
    const deferred = Promise.withResolvers<{ ok: true; value: undefined }>()
    const onActivate = vi.fn(() => deferred.promise)
    const view = render(<MindGardenPanel projection={null} {...actions({ onActivate })} t={t} />)
    fireEvent.click(view.getByRole('button', { name: zh['entry.open'] }))
    expect(view.getByText(zh['disclosure.body'])).toBeTruthy()
    expect(view.getByText(zh['disclosure.profile.title'])).toBeTruthy()
    expect(view.getByText(zh['disclosure.model.title'])).toBeTruthy()
    expect(view.getByText(zh['disclosure.authority.title'])).toBeTruthy()
    expect(view.getByText(zh['disclosure.default'])).toBeTruthy()
    expect(view.queryByRole('button', { name: new RegExp(zh['mode.serenity']) })).toBeNull()
    expect(view.queryByRole('button', { name: new RegExp(zh['mode.clarity']) })).toBeNull()
    const start = view.getByRole('button', { name: zh['disclosure.start'] })
    expect(start).toHaveProperty('disabled', true)
    fireEvent.click(view.getByRole('checkbox', { name: zh['disclosure.consent'] }))
    expect(start).toHaveProperty('disabled', false)
    fireEvent.click(start)
    fireEvent.click(start)
    expect(onActivate).toHaveBeenCalledTimes(1)
    expect(onActivate).toHaveBeenCalledWith('serenity')
    deferred.resolve({ ok: true, value: undefined })
    await waitFor(() => { expect(view.getByText(zh['entry.hint'])).toBeTruthy() })
  })

  it('can close disclosure and explains activation on a nonblank session', async () => {
    const onActivate = vi.fn(() => Promise.resolve({
      ok: false as const,
      error: { code: 'MIND_GARDEN_SESSION_NOT_BLANK', message: 'raw', details: {} },
    }))
    const view = render(<MindGardenPanel projection={null} {...actions({ onActivate })} t={t} />)
    fireEvent.click(view.getByRole('button', { name: zh['entry.open'] }))
    fireEvent.click(view.getByRole('checkbox', { name: zh['disclosure.consent'] }))
    fireEvent.click(view.getByRole('button', { name: zh['disclosure.start'] }))
    expect((await view.findByRole('alert')).textContent).toBe(zh['error.notBlank'])
    fireEvent.click(view.getByRole('button', { name: zh['entry.close'] }))
    expect(view.queryByText(zh['disclosure.title'])).toBeNull()
  })

  it('contains first-run focus and returns it to the disclosure trigger', async () => {
    const view = render(<MindGardenPanel projection={null} {...actions()} t={t} />)
    const trigger = view.getByRole('button', { name: zh['entry.open'] })
    fireEvent.click(trigger)
    const dialog = view.getByRole('dialog', { name: zh['disclosure.title'] })
    await waitFor(() => { expect(document.activeElement).toBe(dialog) })
    const close = view.getByRole('button', { name: zh['entry.close'] })
    const consent = view.getByRole('checkbox', { name: zh['disclosure.consent'] })
    consent.focus()
    fireEvent.keyDown(dialog, { key: 'Tab' })
    expect(document.activeElement).toBe(close)
    fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(consent)
    fireEvent.keyDown(document, { key: 'Escape' })
    await waitFor(() => { expect(document.activeElement).toBe(trigger) })
  })

  it('uses the localized fallback when a Remote failure has no message', async () => {
    const onActivate = vi.fn(() => Promise.resolve({
      ok: false as const,
      error: { code: 'internal', message: '', details: {} },
    }))
    const view = render(<MindGardenPanel projection={null} {...actions({ onActivate })} t={t} />)
    fireEvent.click(view.getByRole('button', { name: zh['entry.open'] }))
    fireEvent.click(view.getByRole('checkbox', { name: zh['disclosure.consent'] }))
    fireEvent.click(view.getByRole('button', { name: zh['disclosure.start'] }))
    expect((await view.findByRole('alert')).textContent).toBe(zh['error.generic'])
  })

  it('changes active preferences with projected CAS revisions and shows Remote failures', async () => {
    const onSelectMode = vi.fn(() => Promise.resolve({ ok: true as const, value: undefined }))
    const onSelectSupportIntent = vi.fn(() => Promise.resolve({
      ok: false as const,
      error: { code: 'MIND_GARDEN_STALE_REVISION', message: 'stale setting', details: {} },
    }))
    const view = render(<MindGardenPanel
      projection={active(7)}
      {...actions({ onSelectMode, onSelectSupportIntent })}
      t={t}
    />)
    const trigger = view.getByRole('button', { name: zh['garden.expand'] })
    expect(trigger.getAttribute('title')).toBe(`${zh['intent.auto']} · ${zh['mode.serenity']}`)
    expect(view.getByText(zh['intent.auto'])).toBeTruthy()
    fireEvent.click(trigger)
    fireEvent.click(view.getByRole('button', { name: zh['mode.clarity'] }))
    await waitFor(() => { expect(onSelectMode).toHaveBeenCalledWith(7, 'clarity') })
    expect(view.getByRole('button', { name: zh['garden.expand'] })).toBeTruthy()
    fireEvent.click(view.getByRole('button', { name: zh['garden.expand'] }))
    fireEvent.click(view.getByRole('button', { name: zh['intent.listen'] }))
    expect((await view.findByRole('alert')).textContent).toBe('stale setting')
    expect(onSelectSupportIntent).toHaveBeenCalledWith(7, 'listen')
    fireEvent.click(view.getByRole('button', { name: zh['garden.collapse'] }))
  })

  it('contains thrown action failures and clears an error when projection revision changes', async () => {
    const onSelectSupportIntent = vi.fn(() => Promise.reject(new Error('offline')))
    const props = actions({ onSelectSupportIntent })
    const view = render(<MindGardenPanel projection={active(2)} {...props} t={t} />)
    fireEvent.click(view.getByRole('button', { name: zh['garden.expand'] }))
    fireEvent.click(view.getByRole('button', { name: zh['intent.settle'] }))
    expect((await view.findByRole('alert')).textContent).toBe(zh['error.generic'])
    view.rerender(<MindGardenPanel projection={active(3)} {...props} t={t} />)
    await waitFor(() => { expect(view.queryByRole('alert')).toBeNull() })
  })

  it('dismisses the compact posture popover with Escape and restores trigger focus', async () => {
    const view = render(<MindGardenPanel projection={active()} {...actions()} t={t} />)
    const trigger = view.getByRole('button', { name: zh['garden.expand'] })
    fireEvent.click(trigger)
    expect(view.getByRole('group', { name: zh['section.mode'] })).toBeTruthy()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(view.queryByRole('group', { name: zh['section.mode'] })).toBeNull()
    await waitFor(() => { expect(document.activeElement).toBe(trigger) })
  })

  it('keeps the dedicated settings instrument open after a successful calibration', async () => {
    const onSelectMode = vi.fn(() => Promise.resolve({ ok: true as const, value: undefined }))
    const view = render(<MindGardenPanel
      projection={active(9)}
      defaultOpen
      {...actions({ onSelectMode })}
      t={t}
    />)
    expect(view.getByText(zh['garden.dialogue.body'])).toBeTruthy()
    fireEvent.click(view.getByRole('button', { name: new RegExp(zh['mode.clarity']) }))
    await waitFor(() => { expect(onSelectMode).toHaveBeenCalledWith(9, 'clarity') })
    expect(view.getByRole('group', { name: zh['section.mode'] })).toBeTruthy()
    expect(view.queryByRole('button', { name: zh['garden.expand'] })).toBeNull()
  })

  it('holds posture controls stable while a response is running', () => {
    const onSelectMode = vi.fn(() => Promise.resolve({ ok: true as const, value: undefined }))
    const onSelectSupportIntent = vi.fn(() => Promise.resolve({ ok: true as const, value: undefined }))
    const view = render(<MindGardenPanel
      projection={active(9)}
      defaultOpen
      running
      {...actions({ onSelectMode, onSelectSupportIntent })}
      t={t}
    />)

    const mode = view.getByRole('button', { name: new RegExp(zh['mode.clarity']) }) as HTMLButtonElement
    const intent = view.getByRole('button', { name: zh['intent.listen'] }) as HTMLButtonElement
    expect(mode.disabled).toBe(true)
    expect(intent.disabled).toBe(true)
    fireEvent.click(mode)
    fireEvent.click(intent)
    expect(onSelectMode).not.toHaveBeenCalled()
    expect(onSelectSupportIntent).not.toHaveBeenCalled()
  })
})

describe('MindGardenDock adapter', () => {
  it('reads the mind-garden projection through the standard slot kit', () => {
    const useProjection = vi.fn(() => active())
    const useSession = vi.fn((selector: (state: { running: boolean }) => unknown) => selector({ running: false }))
    const props = { useProjection, useSession, ...actions(), t } as unknown as Parameters<typeof MindGardenDock>[0]
    const view = render(<MindGardenDock {...props} />)
    expect(useProjection).toHaveBeenCalledWith('mind-garden')
    expect(useSession).toHaveBeenCalledOnce()
    expect(view.getByRole('button', { name: zh['garden.expand'] }).getAttribute('title'))
      .toBe(`${zh['intent.auto']} · ${zh['mode.serenity']}`)
  })
})
