// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { cleanup } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { GardenPortabilityPanel } from '../src/client/GardenPortabilityPanel.tsx'
import { zh, type MindGardenKey } from '../src/client/locales.ts'

const t = (key: MindGardenKey) => zh[key]
const VALUE = {
  formatVersion: 1 as const,
  filename: 'mind-garden-20260820T120000Z.mgarden',
  mediaType: 'application/vnd.deepseek-harness.mind-garden-backup' as const,
  data: 'AQID',
  bytes: 3,
  createdAt: 1,
  records: { memories: 1, reflections: 2, media: 3, stars: 4, attachments: 3 },
}
const ROTATED = {
  fromKeyId: 'old-key',
  toKeyId: 'new-key-fingerprint',
  records: 10,
  startedAt: 1,
  completedAt: 2,
}
const INSPECTED = {
  formatVersion: 1 as const,
  sourceFormat: 'deepseek-harness-v1' as const,
  scope: 'full-profile' as const,
  archiveCreatedAt: 1,
  bytes: 4096,
  records: { memories: 3, reflections: 2, media: 1, stars: 1, attachments: 1 },
  willAdd: { memories: 2, reflections: 2, media: 1, stars: 1 },
  willKeep: { memories: 1, reflections: 0, media: 0, stars: 0 },
}
const RESTORED = {
  sourceFormat: 'deepseek-harness-v1' as const,
  scope: 'full-profile' as const,
  archiveCreatedAt: 1,
  restoredAt: 2,
  added: INSPECTED.willAdd,
  kept: INSPECTED.willKeep,
  attachments: 1,
}
const unusedRotation = () => Promise.resolve({ ok: false as const, code: 'unused' })
const unusedInspect = () => Promise.resolve({ ok: false as const, code: 'unused' })
const unusedRestore = () => Promise.resolve({ ok: false as const, code: 'unused' })

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('Mind Garden portability panel', () => {
  it('requires a confirmed strong passphrase and hands only encrypted bytes to the browser', async () => {
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mind-garden')
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    const onExportBackup = vi.fn(() => Promise.resolve({ ok: true as const, value: VALUE }))
    render(<GardenPortabilityPanel
      t={t}
      onExportBackup={onExportBackup}
      onInspectBackup={unusedInspect}
      onRestoreBackup={unusedRestore}
      onRotateVaultKey={unusedRotation}
    />)

    const action = screen.getByRole('button', { name: zh['backup.action'] }) as HTMLButtonElement
    expect(action.disabled).toBe(true)
    fireEvent.change(screen.getByLabelText(zh['backup.passphrase']), {
      target: { value: 'paper lantern river stone' },
    })
    fireEvent.change(screen.getByLabelText(zh['backup.confirm']), {
      target: { value: 'different phrase entirely' },
    })
    expect(screen.getByText(zh['backup.hint.match'])).toBeTruthy()
    expect(action.disabled).toBe(true)
    fireEvent.change(screen.getByLabelText(zh['backup.confirm']), {
      target: { value: 'paper lantern river stone' },
    })
    expect(action.disabled).toBe(false)
    fireEvent.click(action)

    await waitFor(() => { expect(onExportBackup).toHaveBeenCalledWith('paper lantern river stone') })
    await waitFor(() => { expect(screen.getByText(zh['backup.success'])).toBeTruthy() })
    expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob))
    expect(click).toHaveBeenCalledOnce()
    await waitFor(() => { expect(revokeObjectURL).toHaveBeenCalledWith('blob:mind-garden') })
  })

  it('keeps a failed whole-profile export visible without starting a download', async () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    const onExportBackup = vi.fn(() => Promise.resolve({
      ok: false as const,
      code: 'attachment-unavailable',
    }))
    render(<GardenPortabilityPanel
      t={t}
      onExportBackup={onExportBackup}
      onInspectBackup={unusedInspect}
      onRestoreBackup={unusedRestore}
      onRotateVaultKey={unusedRotation}
    />)
    fireEvent.change(screen.getByLabelText(zh['backup.passphrase']), {
      target: { value: 'paper lantern river stone' },
    })
    fireEvent.change(screen.getByLabelText(zh['backup.confirm']), {
      target: { value: 'paper lantern river stone' },
    })
    fireEvent.click(screen.getByRole('button', { name: zh['backup.action'] }))
    await waitFor(() => { expect(screen.getByText(zh['backup.error.attachment'])).toBeTruthy() })
    expect(click).not.toHaveBeenCalled()
  })

  it('requires a second explicit action before rotating the profile key', async () => {
    const onRotateVaultKey = vi.fn(() => Promise.resolve({ ok: true as const, value: ROTATED }))
    render(<GardenPortabilityPanel
      t={t}
      onExportBackup={() => Promise.resolve({ ok: false, code: 'unused' })}
      onInspectBackup={unusedInspect}
      onRestoreBackup={unusedRestore}
      onRotateVaultKey={onRotateVaultKey}
    />)
    fireEvent.click(screen.getByRole('button', { name: zh['rotation.action'] }))
    expect(onRotateVaultKey).not.toHaveBeenCalled()
    expect(screen.getByText(zh['rotation.confirm.body'])).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: zh['rotation.confirm.action'] }))
    await waitFor(() => { expect(onRotateVaultKey).toHaveBeenCalledOnce() })
    await waitFor(() => { expect(screen.getByText(new RegExp(zh['rotation.success']))).toBeTruthy() })
  })

  it('authenticates and previews a restore before a second explicit merge action', async () => {
    const file = new File(['encrypted archive'], 'garden.mgarden', {
      type: 'application/vnd.deepseek-harness.mind-garden-backup',
    })
    const onInspectBackup = vi.fn(() => Promise.resolve({ ok: true as const, value: INSPECTED }))
    const onRestoreBackup = vi.fn(() => Promise.resolve({ ok: true as const, value: RESTORED }))
    render(<GardenPortabilityPanel
      t={t}
      onExportBackup={() => Promise.resolve({ ok: false, code: 'unused' })}
      onInspectBackup={onInspectBackup}
      onRestoreBackup={onRestoreBackup}
      onRotateVaultKey={unusedRotation}
    />)
    fireEvent.change(screen.getByLabelText(zh['restore.file']), { target: { files: [file] } })
    fireEvent.change(screen.getByLabelText(zh['restore.passphrase']), {
      target: { value: 'paper lantern river stone' },
    })
    fireEvent.click(screen.getByRole('button', { name: zh['restore.inspect'] }))
    await waitFor(() => {
      expect(onInspectBackup).toHaveBeenCalledWith(file, 'paper lantern river stone')
      expect(screen.getByText(zh['restore.preview.ready'])).toBeTruthy()
    })
    expect(onRestoreBackup).not.toHaveBeenCalled()
    expect(screen.getByText(zh['restore.preview.rule'])).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: zh['restore.action'] }))
    await waitFor(() => {
      expect(onRestoreBackup).toHaveBeenCalledWith(file, 'paper lantern river stone')
      expect(screen.getByText(zh['restore.success'])).toBeTruthy()
    })
  })

  it('labels original archives as bounded private-profile conversions and accepts their legacy passphrase floor', async () => {
    const file = new File(['original encrypted archive'], 'old-garden.mgarden')
    const inspected = {
      ...INSPECTED,
      sourceFormat: 'fun-garden-v1' as const,
      scope: 'legacy-private-profile' as const,
      records: { memories: 0, reflections: 0, media: 1, stars: 0, attachments: 1 },
      willAdd: { memories: 0, reflections: 0, media: 1, stars: 0 },
      willKeep: { memories: 0, reflections: 0, media: 0, stars: 0 },
    }
    const restored = {
      ...RESTORED,
      sourceFormat: 'fun-garden-v1' as const,
      scope: 'legacy-private-profile' as const,
      added: inspected.willAdd,
      kept: inspected.willKeep,
    }
    const onInspectBackup = vi.fn(() => Promise.resolve({ ok: true as const, value: inspected }))
    const onRestoreBackup = vi.fn(() => Promise.resolve({ ok: true as const, value: restored }))
    render(<GardenPortabilityPanel
      t={t}
      onExportBackup={() => Promise.resolve({ ok: false, code: 'unused' })}
      onInspectBackup={onInspectBackup}
      onRestoreBackup={onRestoreBackup}
      onRotateVaultKey={unusedRotation}
    />)
    fireEvent.change(screen.getByLabelText(zh['restore.file']), { target: { files: [file] } })
    fireEvent.change(screen.getByLabelText(zh['restore.passphrase']), { target: { value: '12345678' } })
    fireEvent.click(screen.getByRole('button', { name: zh['restore.inspect'] }))
    await waitFor(() => { expect(screen.getByText(zh['restore.preview.legacy'])).toBeTruthy() })
    expect(screen.getByText(zh['restore.preview.legacy.rule'])).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: zh['restore.action'] }))
    await waitFor(() => { expect(screen.getByText(zh['restore.success.legacy.body'])).toBeTruthy() })
  })
})
