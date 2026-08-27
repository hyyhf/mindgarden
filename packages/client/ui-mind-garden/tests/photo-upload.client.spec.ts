// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { preparePhotoUpload, type PhotoUploadLimits } from '../src/client/photo-story/photo-upload.ts'

const limits: PhotoUploadLimits = {
  maxImageBytes: 50,
  maxImagePixels: 4_000_000,
  maxImageDimension: 2_000,
  mediaTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
}

function bitmap(width: number, height: number) {
  return { width, height, close: vi.fn() }
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('photo upload preparation', () => {
  it('keeps an admitted image byte-for-byte', async () => {
    const decoded = bitmap(1_200, 800)
    vi.stubGlobal('createImageBitmap', vi.fn(() => Promise.resolve(decoded)))
    const file = new File(['original'], 'morning.png', { type: 'image/png', lastModified: 12 })

    await expect(preparePhotoUpload(file, limits)).resolves.toEqual({ ok: true, file, optimized: false })
    expect(decoded.close).toHaveBeenCalledOnce()
  })

  it('fits an oversized still image into a high-quality WebP', async () => {
    const decoded = bitmap(4_000, 3_000)
    vi.stubGlobal('createImageBitmap', vi.fn(() => Promise.resolve(decoded)))
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      clearRect: vi.fn(), drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D)
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback) => {
      callback(new Blob([new Uint8Array(40)], { type: 'image/webp' }))
    })
    const file = new File([new Uint8Array(80)], 'summer.jpg', { type: 'image/jpeg', lastModified: 34 })

    const result = await preparePhotoUpload(file, limits)
    expect(result).toMatchObject({ ok: true, optimized: true })
    if (!result.ok) throw new Error('expected an optimized photo')
    expect(result.file).not.toBe(file)
    expect(result.file.name).toBe('summer.webp')
    expect(result.file.type).toBe('image/webp')
    expect(result.file.size).toBe(40)
    expect(decoded.close).toHaveBeenCalledOnce()
  })

  it('does not flatten an animated GIF to satisfy deployment limits', async () => {
    const decoded = bitmap(4_000, 3_000)
    vi.stubGlobal('createImageBitmap', vi.fn(() => Promise.resolve(decoded)))
    const file = new File([new Uint8Array(80)], 'memory.gif', { type: 'image/gif' })

    await expect(preparePhotoUpload(file, limits)).resolves.toEqual({
      ok: false,
      reason: 'IMAGE_DIMENSION_TOO_LARGE',
    })
    expect(decoded.close).toHaveBeenCalledOnce()
  })

  it('rejects undecodable and unsupported files with stable reasons', async () => {
    vi.stubGlobal('createImageBitmap', vi.fn(() => Promise.reject(new Error('decode failed'))))
    await expect(preparePhotoUpload(
      new File(['bad'], 'bad.png', { type: 'image/png' }),
      limits,
    )).resolves.toEqual({ ok: false, reason: 'INVALID_IMAGE' })
    await expect(preparePhotoUpload(
      new File(['text'], 'note.txt', { type: 'text/plain' }),
      limits,
    )).resolves.toEqual({ ok: false, reason: 'UNSUPPORTED_MEDIA_TYPE' })
  })
})
