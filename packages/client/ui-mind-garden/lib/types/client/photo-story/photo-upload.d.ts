/** Browser-side admission preparation for deployment-bounded photo stories. */
/** Attachment limits needed before one photo enters the Host Remote. */
export interface PhotoUploadLimits {
    readonly maxImageBytes: number;
    readonly maxImagePixels: number;
    readonly maxImageDimension: number;
    readonly mediaTypes: readonly string[];
}
/** User-actionable photo admission failures resolved before Host storage. */
export type PhotoUploadFailureReason = 'UNSUPPORTED_MEDIA_TYPE' | 'IMAGE_TOO_LARGE' | 'IMAGE_DIMENSION_TOO_LARGE' | 'INVALID_IMAGE' | 'BROWSER_TRANSCODE_FAILED';
/** Prepared file or stable user-actionable failure returned by photo intake. */
export type PreparedPhotoUpload = {
    readonly ok: true;
    readonly file: File;
    readonly optimized: boolean;
} | {
    readonly ok: false;
    readonly reason: PhotoUploadFailureReason;
};
/**
 * Keep an admitted file unchanged or produce a bounded high-quality WebP.
 * Animated GIF files are never flattened; an oversized GIF is rejected with
 * a specific recovery reason.
 * @param file - browser-selected PNG, JPEG, WebP, or GIF.
 * @param limits - live attachment limits projected by the Host.
 * @returns the original file, an optimized WebP, or an actionable failure.
 */
export declare function preparePhotoUpload(file: File, limits: PhotoUploadLimits): Promise<PreparedPhotoUpload>;
//# sourceMappingURL=photo-upload.d.ts.map