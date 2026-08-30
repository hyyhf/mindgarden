/** Pure local response rendering and assistant-output policy checks. */
import { MIND_GARDEN_RESOURCE_FALLBACK, MIND_GARDEN_RESOURCE_FALLBACK_EN, } from "./resources.js";
/** Private suffix that keeps every structured output-policy match unpublished. */
export const MIND_GARDEN_OUTPUT_GUARD_LOOKBEHIND_CHARACTERS = 64;
const EXCLUSIVE_CONTROL_TERMS = [
    '只有我', '只需要我', '唯一能', '不要再找', '别再找', '不需要其他人',
    'only i', 'you only need me', 'no one else', "don't seek", 'do not seek',
];
const DEPENDENCE_TERMS = [
    '懂你', '理解你', '陪你', '帮你', '朋友', '家人', '咨询师', '医生',
    'understand you', 'help you', 'support you', 'friends', 'family', 'therapist', 'doctor',
];
const EXCLUSIVE_DEPENDENCE_DISCLAIMERS = [
    '不能说只有我', '不该说只有我', '不会说只有我', '不要声称只有我', '不能声称只有我',
    'cannot say only i', "can't say only i", 'should not say only i', 'must not say only i',
    'avoid saying only i',
];
const DIAGNOSIS_CERTAINTY_TERMS = [
    '你一定', '你就是', '你显然', '这就是', '这一定', '这是典型', '可以断定', '能够断定', '证明你有',
    'you definitely', 'you clearly', 'you have', 'this is clearly', 'this proves', 'must have',
];
const DIAGNOSIS_TERMS = [
    '抑郁症', '焦虑症', '双相', '躁郁', '精神分裂', '人格障碍', '创伤后应激',
    'depression', 'anxiety disorder', 'bipolar', 'schizophrenia', 'personality disorder', 'ptsd',
];
const DIAGNOSIS_DISCLAIMERS = [
    '不能诊断', '无法诊断', '不能断定', '无法断定', '不能根据这段对话',
    'cannot diagnose', "can't diagnose", 'cannot determine', "can't determine",
];
const MEDICATION_ACTION_TERMS = [
    '停药', '停掉药', '停掉处方药', '停掉所有处方药', '停止服药', '加量', '减量', '换药',
    '剂量翻倍', '剂量直接翻倍', '双倍剂量',
    'stop medication', 'stop your medication', 'increase your dose', 'decrease your dose',
    'double your dose', 'change your prescription',
];
const MEDICATION_DISCLAIMERS = [
    '不要停药', '不能建议你停药', '不能建议你换药', '不能建议你调整剂量', '请联系开具处方的医生',
    'do not stop your medication', 'cannot advise you to stop', "can't advise you to stop",
    'contact the prescribing clinician',
];
const OBLIGATION_TERMS = [
    '你必须', '唯一能做的', '只能立刻', '没有别的选择',
    'you must', 'your only option', 'you have no choice',
];
const LIFE_DECISION_TERMS = [
    '辞职', '离婚', '分手', '断绝关系', '搬走',
    'quit your job', 'divorce', 'break up', 'cut off contact', 'move out',
];
const FORCED_DECISION_DISCLAIMERS = [
    '不应该告诉你必须', '不能告诉你必须', '不会告诉你必须', '不该说你必须',
    'should not tell you that you must', 'cannot tell you that you must',
    "can't tell you that you must", 'must not tell you that you must',
];
const TRAUMA_DIRECTIVE_TERMS = [
    '跟着我', '闭上眼', '我来治疗你', '我来治好你', '治疗计划',
    'follow me', 'close your eyes', 'i will heal you', 'treatment plan',
];
const TRAUMA_EXPOSURE_TERMS = [
    '重新经历', '回到创伤', '想起每个细节', '重现创伤',
    'relive', 'return to the trauma', 'remember every detail',
];
const REALITY_CERTAINTY_TERMS = [
    '他们确实', '这证明', '肯定有人', '毫无疑问',
    'they really are', 'this proves', 'definitely someone', 'without doubt',
];
const DELUSION_TERMS = [
    '监视你', '控制你思想', '传递暗号', '读取你的思想',
    'watching you', 'monitoring you', 'controlling your thoughts', 'sending you messages', 'reading your mind',
];
const REALITY_DISCLAIMERS = [
    '不能确认', '无法确认', '先关注能确认的',
    'cannot confirm', "can't confirm", 'focus on what you can verify',
];
const USER_BLAME_CAUSES = ['都是因为你', '问题就在于你', '归根结底是你', 'this is all because you'];
const USER_BLAME_TERMS = [
    '想太多', '认知有问题', '不够努力', '太敏感', '自己造成的',
    'overthink', 'faulty thinking', 'not trying hard enough', 'too sensitive', 'your own fault',
];
function normalizeOutputPolicyText(value) {
    return value.normalize('NFKC')
        .toLocaleLowerCase('en-US')
        .replace(/[‘’]/gu, "'")
        .replace(/[“”"「」『』()[\]{}，,。.！!？?；;：:]/gu, ' ');
}
function latinTokens(value) {
    return [...value.matchAll(/[a-z0-9']+/gu)].map(match => ({
        value: match[0],
        start: match.index,
        end: match.index + match[0].length,
    }));
}
function phraseMatches(value, phrases, tokens) {
    const matches = [];
    for (const phrase of phrases) {
        if (/[a-z]/u.test(phrase)) {
            const phraseTokens = phrase.match(/[a-z0-9']+/gu) ?? [];
            for (let index = 0; index <= tokens.length - phraseTokens.length; index += 1) {
                const candidate = tokens.slice(index, index + phraseTokens.length);
                if (!candidate.every((token, offset) => token.value === phraseTokens[offset]))
                    continue;
                const first = candidate[0];
                const last = candidate.at(-1);
                if (first !== undefined && last !== undefined)
                    matches.push({ start: first.start, end: last.end });
            }
            continue;
        }
        let index = value.indexOf(phrase);
        while (index >= 0) {
            matches.push({ start: index, end: index + phrase.length });
            index = value.indexOf(phrase, index + 1);
        }
    }
    return [...new Map(matches.map(match => [`${match.start}:${match.end}`, match])).values()]
        .sort((left, right) => left.start - right.start || left.end - right.end);
}
function firstMatchAtOrAfter(matches, start) {
    let low = 0;
    let high = matches.length;
    while (low < high) {
        const middle = Math.floor((low + high) / 2);
        if ((matches[middle]?.start ?? Number.POSITIVE_INFINITY) < start)
            low = middle + 1;
        else
            high = middle;
    }
    return low;
}
function structuredRuleMatches(value, tokens, requiredGroups, excludedPhrases = []) {
    const groups = requiredGroups.map(group => phraseMatches(value, group, tokens));
    if (groups.some(group => group.length === 0))
        return false;
    const excluded = phraseMatches(value, excludedPhrases, tokens);
    const accepted = (start, end) => {
        if (end - start > MIND_GARDEN_OUTPUT_GUARD_LOOKBEHIND_CHARACTERS)
            return false;
        const excludedStart = firstMatchAtOrAfter(excluded, start - MIND_GARDEN_OUTPUT_GUARD_LOOKBEHIND_CHARACTERS);
        for (let index = excludedStart; index < excluded.length; index += 1) {
            const match = excluded[index];
            if (match === undefined || match.start > end + MIND_GARDEN_OUTPUT_GUARD_LOOKBEHIND_CHARACTERS)
                break;
            if (Math.max(end, match.end) - Math.min(start, match.start)
                <= MIND_GARDEN_OUTPUT_GUARD_LOOKBEHIND_CHARACTERS)
                return false;
        }
        return true;
    };
    const firstGroup = groups[0] ?? [];
    if (groups.length === 1)
        return firstGroup.some(match => accepted(match.start, match.end));
    const secondGroup = groups[1] ?? [];
    for (const first of firstGroup) {
        const nearbyStart = firstMatchAtOrAfter(secondGroup, first.start - MIND_GARDEN_OUTPUT_GUARD_LOOKBEHIND_CHARACTERS);
        for (let index = nearbyStart; index < secondGroup.length; index += 1) {
            const second = secondGroup[index];
            if (second === undefined
                || second.start > first.end + MIND_GARDEN_OUTPUT_GUARD_LOOKBEHIND_CHARACTERS)
                break;
            if (accepted(Math.min(first.start, second.start), Math.max(first.end, second.end)))
                return true;
        }
    }
    return false;
}
function structuredOutputViolations(text) {
    const normalized = normalizeOutputPolicyText(text);
    const tokens = latinTokens(normalized);
    const violations = [];
    if (structuredRuleMatches(normalized, tokens, [EXCLUSIVE_CONTROL_TERMS, DEPENDENCE_TERMS], EXCLUSIVE_DEPENDENCE_DISCLAIMERS)) {
        violations.push('exclusive-dependence');
    }
    if (structuredRuleMatches(normalized, tokens, [DIAGNOSIS_CERTAINTY_TERMS, DIAGNOSIS_TERMS], DIAGNOSIS_DISCLAIMERS)) {
        violations.push('diagnosis');
    }
    if (structuredRuleMatches(normalized, tokens, [MEDICATION_ACTION_TERMS], MEDICATION_DISCLAIMERS)) {
        violations.push('medication-direction');
    }
    if (structuredRuleMatches(normalized, tokens, [OBLIGATION_TERMS, LIFE_DECISION_TERMS], FORCED_DECISION_DISCLAIMERS)) {
        violations.push('forced-life-decision');
    }
    if (structuredRuleMatches(normalized, tokens, [TRAUMA_DIRECTIVE_TERMS, TRAUMA_EXPOSURE_TERMS])) {
        violations.push('trauma-exposure');
    }
    if (structuredRuleMatches(normalized, tokens, [REALITY_CERTAINTY_TERMS, DELUSION_TERMS], REALITY_DISCLAIMERS)) {
        violations.push('delusion-confirmation');
    }
    if (structuredRuleMatches(normalized, tokens, [USER_BLAME_CAUSES, USER_BLAME_TERMS])) {
        violations.push('user-blame');
    }
    return violations;
}
/**
 * Return every deterministic output rule matched by complete assistant text.
 * @param text - complete buffered user-visible assistant text.
 * @param assessment - effective input assessment for this step.
 * @returns unique stable violations in policy order.
 */
export function assessMindGardenOutput(text, assessment) {
    const violations = structuredOutputViolations(text);
    if ((assessment?.level ?? 0) >= 2 && /哲学|斯多葛|存在主义|中道/iu.test(text)) {
        violations.push('risk-deflection');
    }
    return [...new Set(violations)];
}
/**
 * Render the deterministic local response for an elevated input assessment.
 * @param assessment - effective level-one through level-three assessment.
 * @returns a calm mainland-China support response containing verified contacts.
 */
export function renderMindGardenSupportResponse(assessment) {
    if (assessment.locale === 'en') {
        const safetyCheck = 'Are you safe right now, have you already hurt yourself or someone else, and can you reach anything that could cause harm?';
        if (assessment.level >= 3) {
            return 'I am concerned about the immediate danger you described. Pause everything else, move away from anything or anywhere that could cause harm, and ask someone you trust to stay with you. '
                + `${safetyCheck} If danger is happening now, contact your local emergency services immediately. `
                + `${MIND_GARDEN_RESOURCE_FALLBACK_EN} I cannot provide real-time rescue, so bringing in people and emergency help nearby matters most right now.`;
        }
        if (assessment.level === 2) {
            return 'Thank you for telling me. I will pause the rest of the conversation and focus on safety. '
                + `${safetyCheck} Please ask someone you trust to stay with you and contact a qualified local crisis or health service. `
                + 'If the danger becomes immediate, contact your local emergency services. I cannot replace emergency or professional help, but I can help you work out the next step for reaching support.';
        }
        return 'It sounds like you are carrying a great deal right now. I will not rush to analyse it. '
            + 'Please consider letting someone you trust know what is happening and contacting a qualified local support service. '
            + 'I cannot replace professional help. Would it help more if I listened quietly, or if we worked out a safer plan for today?';
    }
    const support = assessment.resources.find(resource => resource.kind === 'support');
    const emergency = assessment.resources.filter(resource => resource.kind === 'emergency');
    const supportClause = support === undefined
        ? MIND_GARDEN_RESOURCE_FALLBACK
        : `你也可以联系${support.label} ${support.value}。`;
    const emergencyClause = emergency.length === 0
        ? '当地公安或医疗急救服务'
        : emergency.map(resource => `${resource.label} ${resource.value}`).join('；');
    const safetyCheck = '你现在是否安全、是否已经做了伤害自己或他人的事、身边是否能接触到可能造成伤害的物品？';
    if (assessment.level >= 3) {
        return '我很在意你刚才提到的即时危险。先暂停其他讨论，离开可能造成伤害的物品或地点，'
            + `并立即联系一位可信任的人陪着你。${safetyCheck}`
            + `如果危险正在发生，请立即联系${emergencyClause}。${supportClause}`
            + '我不能提供实时救援，此刻最重要的是让现实中的人和紧急服务介入。';
    }
    if (assessment.level === 2) {
        return '谢谢你把这件事说出来。我先暂停其他讨论，也不和你争辩。'
            + `${safetyCheck}请尽快联系一位可信任的人陪着你。${supportClause}`
            + `危险变得紧迫时，请联系${emergencyClause}`
            + '我不能替代紧急或专业帮助，但可以陪你把联系现实支持的下一步说清楚。';
    }
    return '听起来你正承受很重的压力。我不会急着分析。'
        + `可以先让一位你信任的人知道近况，让现实中的支持靠近一些。${supportClause}`
        + '我不能替代专业帮助。此刻更需要我安静听你说，还是一起确认今天怎样更稳妥地过下去？';
}
/**
 * Render a safe replacement for blocked or unbounded assistant output.
 * @param reason - whether content policy or configured buffering caused replacement.
 * @param violations - matched rules when content policy caused replacement.
 * @param locale - locale for the visible replacement copy.
 * @returns user-visible replacement text with no unsafe output quotation.
 */
export function renderMindGardenGuardReplacement(reason, violations, locale = 'zh-CN') {
    if (locale === 'en') {
        if (reason === 'buffer-limit') {
            return 'This response exceeded the amount Mind Garden can check safely, so it was not shown. We can break the topic into a smaller part and continue carefully.';
        }
        if (violations.includes('medication-direction')) {
            return 'I cannot advise you to stop, switch, or change the dose of medication. Please contact the prescribing clinician or a local health service; I can help you organise what you want to tell them.';
        }
        if (violations.includes('delusion-confirmation')) {
            return 'I cannot confirm that a threat or hidden message is definitely real. We can focus on what you can verify around you and on your immediate safety. If anyone may be in danger, contact someone you trust and your local emergency services.';
        }
        if (violations.includes('diagnosis')) {
            return 'I cannot diagnose you or assign a personality label from this conversation. I can listen to the specific experience and help you prepare questions for a qualified professional.';
        }
        return 'I want to put that more safely: I can help you think this through, but I cannot replace relationships, professional care, or emergency support in your life. Let us return to the part you most wanted understood.';
    }
    if (reason === 'buffer-limit') {
        return '这次回复超出了心智庭院能够安全检查的范围，因此没有继续显示。我们可以把刚才的话题拆小一些，再稳妥地继续。';
    }
    if (violations.includes('medication-direction')) {
        return '我不能建议你停药、换药或调整剂量。涉及处方和用药安全，请联系开具处方的医生或当地医疗服务；我可以帮你整理想向医生说明的感受和问题。';
    }
    if (violations.includes('delusion-confirmation')) {
        return '我不能确认某种威胁或暗示一定真实存在。我们可以先关注你此刻能确认的环境与安全；如果你感到自己或他人可能有危险，请尽快联系可信任的人和当地紧急服务。';
    }
    if (violations.includes('diagnosis')) {
        return '我不能根据这段对话给你下诊断或贴人格标签。我可以继续听你描述具体经历，也可以帮你整理需要向合格专业人士咨询的问题。';
    }
    return '我想换一种更稳妥的说法：我可以在这里陪你梳理，但不能替代现实中的关系、专业照护或紧急支持。我们先回到你刚才最想被理解的部分。';
}
//# sourceMappingURL=output-guard.js.map