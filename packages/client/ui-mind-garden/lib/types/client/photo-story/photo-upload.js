/** Browser-side admission preparation for deployment-bounded photo stories. */
const WEBP_QUALITY_STEPS = [0.92, 0.84, 0.76, 0.68, 0.6, 0.52];
function targetScale(width, height, limits) {
    return Math.min(1, limits.maxImageDimension / width, limits.maxImageDimension / height, Math.sqrt(limits.maxImagePixels / (width * height)));
}
function webpName(name) {
    const base = name.replace(/\.[^.]+$/, '') || 'photo';
    return `${base}.webp`;
}
function encodeWebp(canvas, quality) {
    return new Promise((resolve) => {
        canvas.toBlob((blob) => { resolve(blob?.type === 'image/webp' ? blob : null); }, 'image/webp', quality);
    });
}
/**
 * Keep an admitted file unchanged or produce a bounded high-quality WebP.
 * Animated GIF files are never flattened; an oversized GIF is rejected with
 * a specific recovery reason.
 * @param file - browser-selected PNG, JPEG, WebP, or GIF.
 * @param limits - live attachment limits projected by the Host.
 * @returns the original file, an optimized WebP, or an actionable failure.
 */
export async function preparePhotoUpload(file, limits) {
    if (!limits.mediaTypes.includes(file.type))
        return { ok: false, reason: 'UNSUPPORTED_MEDIA_TYPE' };
    if (typeof createImageBitmap !== 'function') {
        return file.size <= limits.maxImageBytes
            ? { ok: true, file, optimized: false }
            : { ok: false, reason: 'IMAGE_TOO_LARGE' };
    }
    let bitmap;
    try {
        bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    }
    catch {
        return { ok: false, reason: 'INVALID_IMAGE' };
    }
    try {
        if (bitmap.width < 1 || bitmap.height < 1)
            return { ok: false, reason: 'INVALID_IMAGE' };
        const scale = targetScale(bitmap.width, bitmap.height, limits);
        const withinDimensions = scale >= 1;
        if (withinDimensions && file.size <= limits.maxImageBytes) {
            return { ok: true, file, optimized: false };
        }
        if (file.type === 'image/gif') {
            return {
                ok: false,
                reason: withinDimensions ? 'IMAGE_TOO_LARGE' : 'IMAGE_DIMENSION_TOO_LARGE',
            };
        }
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d', { alpha: true });
        if (context === null)
            return { ok: false, reason: 'BROWSER_TRANSCODE_FAILED' };
        for (let index = 0; index < WEBP_QUALITY_STEPS.length; index += 1) {
            const reduction = Math.pow(0.88, Math.floor(index / 2));
            canvas.width = Math.max(1, Math.floor(bitmap.width * scale * reduction));
            canvas.height = Math.max(1, Math.floor(bitmap.height * scale * reduction));
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
            const blob = await encodeWebp(canvas, WEBP_QUALITY_STEPS[index] ?? 0.52);
            if (blob !== null && blob.size <= limits.maxImageBytes) {
                return {
                    ok: true,
                    file: new File([blob], webpName(file.name), { type: 'image/webp', lastModified: file.lastModified }),
                    optimized: true,
                };
            }
        }
        return { ok: false, reason: 'IMAGE_TOO_LARGE' };
    }
    finally {
        bitmap.close();
    }
}
//# sourceMappingURL=photo-upload.js.map