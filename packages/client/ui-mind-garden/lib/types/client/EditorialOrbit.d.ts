/** Responsive paper corridor for the Today workspace. */
import type { ReactNode } from 'react';
import type { MindGardenOpenQuestion, MindGardenPeriodReview } from '@deepseek-ai/dsh-mind-garden/reflection/types';
import type { MindGardenMode } from '@deepseek-ai/dsh-mind-garden/core/client';
import type { MindGardenKey } from './locales.ts';
/** Render truthful records as three navigable stations in the morning paper corridor. */
export declare function EditorialOrbit({ questions, reviews, mode, t, children, }: {
    readonly questions: readonly MindGardenOpenQuestion[];
    readonly reviews: readonly MindGardenPeriodReview[];
    readonly mode: MindGardenMode;
    readonly t: (key: MindGardenKey) => string;
    readonly children?: ReactNode;
}): import("react").JSX.Element;
//# sourceMappingURL=EditorialOrbit.d.ts.map