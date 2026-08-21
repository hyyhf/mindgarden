/** Responsive personal orrery for the Today observatory. */
import type { ReactNode } from 'react';
import type { MindGardenOpenQuestion, MindGardenPeriodReview } from '@deepseek-ai/dsh-mind-garden/reflection/types';
import type { MindGardenMode } from '@deepseek-ai/dsh-mind-garden/core/client';
import type { MindGardenKey } from './locales.ts';
/** Render real reflection records inside a responsive, non-authoritative spatial instrument. */
export declare function EditorialOrbit({ questions, reviews, mode, t, children, }: {
    readonly questions: readonly MindGardenOpenQuestion[];
    readonly reviews: readonly MindGardenPeriodReview[];
    readonly mode: MindGardenMode;
    readonly t: (key: MindGardenKey) => string;
    readonly children?: ReactNode;
}): import("react").JSX.Element;
//# sourceMappingURL=EditorialOrbit.d.ts.map