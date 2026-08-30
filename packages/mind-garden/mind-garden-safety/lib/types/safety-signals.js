/** Structured local signals used by deterministic Mind Garden safety policy. */
const SELF_TERMS = ['我', '自己', '本人', 'i', 'me', 'myself', 'my life'];
const ACTIVE_INTENT_TERMS = [
    '想', '打算', '计划', '决定', '准备', '马上要', '将要',
    'want to', 'plan to', 'intend to', 'going to', 'about to', 'ready to',
];
const SELF_HARM_TERMS = [
    '自杀', '轻生', '结束生命', '结束自己的生命', '伤害自己', '自残', '割腕', '想死', '不想活',
    'kill myself', 'end my life', 'hurt myself', 'self-harm', 'want to die', 'suicidal',
];
const OTHER_HARM_TERMS = [
    '杀了他', '杀了她', '杀了他们', '杀人', '伤害他', '伤害她', '伤害他们', '伤害别人',
    'kill him', 'kill her', 'kill them', 'hurt him', 'hurt her', 'hurt them', 'hurt someone',
];
const PASSIVE_DEATH_TERMS = [
    '活不下去', '死了算了', '不想活了', '不想活下去', '不想活着', '活着没有意义', '活着没意思',
    '别醒来', '不再醒来', '永远睡过去', '消失就好',
    "don't want to live", 'do not want to live', 'no reason to live', "wouldn't wake up",
    'would not wake up', 'never wake up',
];
const IMMEDIATE_INTENT_TERMS = [
    '现在要', '马上要', '今晚打算', '今晚计划', '今晚准备', '已经准备', '准备自杀', '准备轻生',
    '准备伤害', '准备跳', '准备结束生命', '准备结束自己的生命',
    'going to', 'about to', 'ready to', 'immediately going to',
];
const ACTION_TAKEN_TERMS = ['已经', '刚刚', '刚才', '正', 'just', 'already'];
const COMPLETED_HARM_TERMS = [
    '割腕', '吞药', '吞了', '吃了一把', '吃了一瓶', '注射了', '跳下', '伤害了自己', '伤害了他人',
    '捅了', '砍了', 'took an overdose', 'swallowed', 'injected', 'hurt myself', 'hurt someone',
];
const MEANS_TERMS = [
    '刀', '药', '绳', '煤气', '枪', '毒品',
    'knife', 'pills', 'medication', 'rope', 'gun', 'gas', 'drugs',
];
const ACCESS_TERMS = [
    '就在身边', '身边', '准备好', '拿着', '握着', '拿到', '伸手就能', '手里',
    'with me', 'next to me', 'in my hand', 'have access', 'within reach', 'ready',
];
const DANGEROUS_LOCATION_TERMS = [
    '楼顶', '桥边', '铁轨', '悬崖',
    'rooftop', 'roof', 'bridge', 'railway track', 'train tracks', 'cliff',
];
const LOCATION_ACCESS_TERMS = [
    '站在', '到了', '已经到', '就在', '正走向',
    'standing on', 'at the', 'arrived at', 'walking toward',
];
const BENIGN_CONTEXT_TERMS = [
    '新闻', '报道', '论文', '小说', '电影', '电视剧', '游戏', '角色', '台词', '剧本', '研究', '科普',
    '课程', '标题', '关键词', '测试样例', '公共政策', '预防', '如果有人', '假如有人',
    'news', 'article', 'paper', 'novel', 'movie', 'script', 'quote', 'quoted', 'research', 'training', 'prevention',
    'if someone', 'suppose someone', 'fictional character',
];
const METAPHOR_TERMS = [
    '杀死拖延症', '砍掉重做', '结束这份工作', '结束这个项目', '楼顶的风景', '准备切菜', '感冒吃药',
    'kill this process', 'kill the task', 'cut the project',
];
const NEGATED_RISK_TERMS = [
    '没有想自杀', '并没有想自杀', '从没想过自杀', '不会自杀', '不想自杀', '不打算自杀',
    '没有想轻生', '从没想过轻生', '不会轻生', '不想轻生', '没有想自残', '从没想过自残',
    '不会自残', '不想自残',
    '没有伤害自己的打算', '并非想结束生命', '不会伤害自己', '不打算伤害自己', '不会杀人',
    '不打算杀人', '已放弃轻生', '已放弃自杀', '取消了轻生',
    'not suicidal', "don't want to die", 'do not want to die', "don't plan to hurt myself",
    'do not plan to hurt myself', 'not going to hurt myself',
];
const ABUSE_TERMS = [
    '打我', '掐我', '锁着我', '威胁杀我', '不让我离开', '孩子正在被虐待', '小孩正在被虐待',
    '未成年人正在被虐待', '孩子正在被性侵', 'child is being abused', 'kid is being abused',
    'hitting me', 'strangling me', 'locking me up', 'threatening to kill me',
];
const REALITY_OR_SLEEP_TERMS = [
    '声音命令我', '有人命令我', '声音逼我', '有人逼我', '声音叫我伤人', '声音叫我自杀',
    'voices telling me to kill', 'voices telling me to hurt', 'voices commanding me',
];
const PROLONGED_SLEEP_TERMS = [
    '连续三天没睡', '连续四天没睡', '连续五天没睡', '连续3天没睡', '连续4天没睡', '连续5天没睡',
    '三天不睡', '四天不睡', '五天不睡', 'three days without sleep', 'four days without sleep',
    'five days without sleep', "haven't slept for three days", "haven't slept for four days",
];
const AGITATION_TERMS = [
    '停不下来', '控制不了', '无所不能', '无敌', 'unstoppable', 'invincible', 'out of control',
];
const SUBSTANCE_TERMS = [
    '停酒', '戒酒', '停药', '戒断', '吸毒', '用药', '喝酒', '过量', 'overdose', 'overdosed',
    'alcohol withdrawal', 'benzodiazepine withdrawal', 'benzo withdrawal',
];
const SUBSTANCE_DANGER_TERMS = [
    '抽搐', '意识不清', '看见不存在', '严重发抖', '失去意识', '叫不醒', '呼吸很慢',
    'seizure', 'hallucination', 'confusion', 'unconscious', "won't wake", 'not breathing', 'breathing slowly',
];
const VULNERABLE_TERMS = [
    '彻底绝望', '非常绝望', '特别绝望', '绝望', '撑不下去', '连续七天失眠', '连续两周睡不着',
    "can't go on", 'cannot go on', 'no reason to live',
];
function quotedPolicyText(value) {
    return [...value.matchAll(/[“"「『]([^”"」』]+)[”"」』]/gu)]
        .map(match => match[1] ?? '')
        .join(' ');
}
function unquotedPolicyText(value) {
    return value.replace(/[“"「『][^”"」』]+[”"」』]/gu, ' ');
}
function hasDirectRiskEvidence(text) {
    const directSelf = hasAnyPolicyPhrase(text, SELF_TERMS);
    const activeIntent = hasAnyPolicyPhrase(text, ACTIVE_INTENT_TERMS);
    const selfHarm = hasAnyPolicyPhrase(text, SELF_HARM_TERMS);
    const otherHarm = hasAnyPolicyPhrase(text, OTHER_HARM_TERMS);
    const completedHarm = hasAnyPolicyPhrase(text, COMPLETED_HARM_TERMS);
    const dangerousLocation = hasAnyPolicyPhrase(text, DANGEROUS_LOCATION_TERMS)
        && hasAnyPolicyPhrase(text, LOCATION_ACCESS_TERMS);
    return (directSelf && (selfHarm || completedHarm || hasAnyPolicyPhrase(text, PASSIVE_DEATH_TERMS)))
        || (activeIntent && otherHarm)
        || dangerousLocation;
}
/**
 * Normalize text for literal policy-phrase matching.
 * @param value - User or assistant text.
 * @returns NFKC, lowercase, punctuation-separated text.
 */
export function normalizePolicyText(value) {
    return value.normalize('NFKC')
        .toLocaleLowerCase('en-US')
        .replace(/[‘’]/gu, "'")
        .replace(/[“”"「」『』()[\]{}，,。.！!？?；;：:]/gu, ' ')
        .replace(/\s+/gu, ' ')
        .trim();
}
/**
 * Match one policy phrase with word boundaries for Latin text.
 * @param value - Normalized policy text.
 * @param phrase - Normalized literal phrase.
 * @returns Whether the phrase is present.
 */
export function hasPolicyPhrase(value, phrase) {
    if (/[a-z]/u.test(phrase))
        return ` ${value} `.includes(` ${phrase} `);
    return value.includes(phrase);
}
/**
 * Match any phrase in one local policy lexicon.
 * @param value - Normalized policy text.
 * @param phrases - Literal policy phrases.
 * @returns Whether at least one phrase is present.
 */
export function hasAnyPolicyPhrase(value, phrases) {
    return phrases.some(phrase => hasPolicyPhrase(value, phrase));
}
/**
 * Extract local safety facts without selecting a response or risk level.
 * @param clause - One normalized punctuation-bounded clause.
 * @returns Structured facts for deterministic policy evaluation.
 */
export function extractMindGardenSafetySignals(clause) {
    const text = normalizePolicyText(clause);
    const quoted = normalizePolicyText(quotedPolicyText(clause));
    const unquoted = normalizePolicyText(unquotedPolicyText(clause));
    const directSelf = hasAnyPolicyPhrase(text, SELF_TERMS);
    const activeIntent = hasAnyPolicyPhrase(text, ACTIVE_INTENT_TERMS);
    const harmSelf = hasAnyPolicyPhrase(text, SELF_HARM_TERMS);
    const harmOther = hasAnyPolicyPhrase(text, OTHER_HARM_TERMS);
    const means = hasAnyPolicyPhrase(text, MEANS_TERMS);
    const access = hasAnyPolicyPhrase(text, ACCESS_TERMS);
    const dangerousLocation = hasAnyPolicyPhrase(text, DANGEROUS_LOCATION_TERMS)
        && hasAnyPolicyPhrase(text, LOCATION_ACCESS_TERMS);
    const benignContext = hasAnyPolicyPhrase(text, BENIGN_CONTEXT_TERMS)
        || hasAnyPolicyPhrase(text, METAPHOR_TERMS);
    return Object.freeze({
        directSelf,
        benignContext,
        protectedContext: benignContext
            && hasDirectRiskEvidence(quoted)
            && !hasDirectRiskEvidence(unquoted),
        negatedRisk: text.includes('不想活在') || hasAnyPolicyPhrase(text, NEGATED_RISK_TERMS),
        activeSelfHarm: directSelf && activeIntent && harmSelf,
        activeOtherHarm: activeIntent && harmOther,
        passiveDeathWish: directSelf && hasAnyPolicyPhrase(text, PASSIVE_DEATH_TERMS),
        immediateIntent: hasAnyPolicyPhrase(text, IMMEDIATE_INTENT_TERMS),
        actionTaken: directSelf
            && hasAnyPolicyPhrase(text, ACTION_TAKEN_TERMS)
            && hasAnyPolicyPhrase(text, COMPLETED_HARM_TERMS),
        meansAccess: means && access,
        dangerousLocation,
        abuseDanger: hasAnyPolicyPhrase(text, ABUSE_TERMS),
        realityOrSleepDanger: hasAnyPolicyPhrase(text, REALITY_OR_SLEEP_TERMS)
            || (hasAnyPolicyPhrase(text, PROLONGED_SLEEP_TERMS) && hasAnyPolicyPhrase(text, AGITATION_TERMS)),
        substanceDanger: hasAnyPolicyPhrase(text, SUBSTANCE_TERMS)
            && hasAnyPolicyPhrase(text, SUBSTANCE_DANGER_TERMS),
        vulnerable: hasAnyPolicyPhrase(text, VULNERABLE_TERMS),
    });
}
//# sourceMappingURL=safety-signals.js.map