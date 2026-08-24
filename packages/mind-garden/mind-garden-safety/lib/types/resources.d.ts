/** Versioned mainland-China support resources used by deterministic responses. */
import type { MindGardenSafetyLocale, MindGardenSafetyResource } from './types.ts';
/**
 * Return detached resources appropriate to an intervention level.
 * @param urgent - whether immediate emergency contacts are required.
 * @returns the support line plus emergency contacts when requested.
 */
export declare function mindGardenSafetyResources(urgent: boolean, locale?: MindGardenSafetyLocale): MindGardenSafetyResource[];
/** Fallback used when a listed contact cannot be reached. */
export declare const MIND_GARDEN_RESOURCE_FALLBACK = "\u82E5\u53F7\u7801\u6682\u65F6\u65E0\u6CD5\u63A5\u901A\uFF0C\u8BF7\u7ACB\u5373\u8054\u7CFB\u8EAB\u8FB9\u53EF\u4FE1\u4EFB\u7684\u4EBA\uFF0C\u5E76\u5728\u7D27\u6025\u5371\u9669\u65F6\u8054\u7CFB\u5F53\u5730\u516C\u5B89\u6216\u533B\u7597\u6025\u6551\u670D\u52A1\u3002";
/** Region-neutral fallback for locales without a verified resource registry. */
export declare const MIND_GARDEN_RESOURCE_FALLBACK_EN = "If a local support line is unavailable, contact someone you trust and use your local emergency services when danger is immediate.";
//# sourceMappingURL=resources.d.ts.map