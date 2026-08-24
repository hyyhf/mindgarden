/** Versioned mainland-China support resources used by deterministic responses. */
const SUPPORT_RESOURCE = Object.freeze({
    id: 'cn-12356',
    label: '全国统一心理援助热线',
    value: '12356',
    kind: 'support',
    sourceUrl: 'https://www.nhc.gov.cn/yzygj/c100068/202412/49a1a65386cd4be582d4702fd0926ee8.shtml',
    verifiedAt: '2026-08-18',
    reviewAfter: '2027-02-18',
});
const EMERGENCY_RESOURCES = Object.freeze([
    Object.freeze({
        id: 'cn-110',
        label: '公安报警',
        value: '110',
        kind: 'emergency',
        sourceUrl: 'https://bjca.miit.gov.cn/zwgk/tzgg/art/2022/art_8d4eb93ee3424f30826c97ee400e8937.html',
        verifiedAt: '2026-08-18',
        reviewAfter: '2027-02-18',
    }),
    Object.freeze({
        id: 'cn-120',
        label: '医疗急救',
        value: '120',
        kind: 'emergency',
        sourceUrl: 'https://bjca.miit.gov.cn/zwgk/tzgg/art/2022/art_8d4eb93ee3424f30826c97ee400e8937.html',
        verifiedAt: '2026-08-18',
        reviewAfter: '2027-02-18',
    }),
]);
/**
 * Return detached resources appropriate to an intervention level.
 * @param urgent - whether immediate emergency contacts are required.
 * @returns the support line plus emergency contacts when requested.
 */
export function mindGardenSafetyResources(urgent, locale = 'zh-CN') {
    if (locale !== 'zh-CN')
        return [];
    return structuredClone(urgent ? [SUPPORT_RESOURCE, ...EMERGENCY_RESOURCES] : [SUPPORT_RESOURCE]);
}
/** Fallback used when a listed contact cannot be reached. */
export const MIND_GARDEN_RESOURCE_FALLBACK = '若号码暂时无法接通，请立即联系身边可信任的人，并在紧急危险时联系当地公安或医疗急救服务。';
/** Region-neutral fallback for locales without a verified resource registry. */
export const MIND_GARDEN_RESOURCE_FALLBACK_EN = 'If a local support line is unavailable, contact someone you trust and use your local emergency services when danger is immediate.';
//# sourceMappingURL=resources.js.map