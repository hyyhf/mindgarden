/** Pure local response rendering and assistant-output policy checks. */

import {
  MIND_GARDEN_RESOURCE_FALLBACK,
  MIND_GARDEN_RESOURCE_FALLBACK_EN,
} from './resources.ts'
import type {
  MindGardenOutputGuardReason,
  MindGardenOutputViolation,
  MindGardenSafetyAssessment,
  MindGardenSafetyLocale,
} from './types.ts'

const OUTPUT_RULES: ReadonlyArray<readonly [MindGardenOutputViolation, RegExp]> = [
  ['exclusive-dependence', /只有我.{0,6}(?:懂你|能理解你|会陪你)|你只需要我|不要再找(?:朋友|家人|咨询师|医生)|如果你离开我|\bonly i (?:understand|can help) you\b/iu],
  ['diagnosis', /你(?:一定|就是|显然)?患有.{0,12}(?:症|障碍)|你就是.{0,10}(?:人格|型的人)|(?:你|这)(?:一定|就是|显然|典型地).{0,8}(?:抑郁症|焦虑症|双相|躁郁|精神分裂|人格障碍|创伤后应激)|\byou (?:definitely|clearly) have (?:depression|bipolar disorder|schizophrenia|a personality disorder)\b/iu],
  ['medication-direction', /(?:停掉|停止|加量|减量|换掉).{0,8}(?:药|服药|处方)|\b(?:stop|increase|decrease|double) (?:your )?(?:medication|dose|prescription)\b/iu],
  ['forced-life-decision', /你必须(?:立刻)?(?:辞职|离婚|分手|断绝关系)/iu],
  ['trauma-exposure', /我来(?:治疗|治好)你|这是给你的治疗计划|(?:跟着我|闭上眼).{0,12}(?:重新经历|回到创伤|想起每个细节)/iu],
  ['delusion-confirmation', /(?:他们确实|这证明).{0,10}(?:监视你|控制你思想|在传递暗号)|\b(?:they really are|this proves they are) (?:watching|monitoring|controlling) you\b/iu],
  ['user-blame', /都是因为你(?:想太多|认知有问题|不够努力)/iu],
] as const

/**
 * Return every deterministic output rule matched by complete assistant text.
 * @param text - complete buffered text and reasoning output.
 * @param assessment - effective input assessment for this step.
 * @returns unique stable violations in policy order.
 */
export function assessMindGardenOutput(
  text: string,
  assessment: MindGardenSafetyAssessment | undefined,
): MindGardenOutputViolation[] {
  const violations = OUTPUT_RULES.flatMap(([kind, pattern]) => pattern.test(text) ? [kind] : [])
  if ((assessment?.level ?? 0) >= 2 && /哲学|斯多葛|存在主义|中道/iu.test(text)) {
    violations.push('risk-deflection')
  }
  return [...new Set(violations)]
}

/**
 * Render the deterministic local response for an elevated input assessment.
 * @param assessment - effective level-one through level-three assessment.
 * @returns a calm mainland-China support response containing verified contacts.
 */
export function renderMindGardenSupportResponse(assessment: MindGardenSafetyAssessment): string {
  if (assessment.locale === 'en') {
    const safetyCheck = 'Are you safe right now, have you already hurt yourself or someone else, and can you reach anything that could cause harm?'
    if (assessment.level >= 3) {
      return 'I am concerned about the immediate danger you described. Pause everything else, move away from anything or anywhere that could cause harm, and ask someone you trust to stay with you. '
        + `${safetyCheck} If danger is happening now, contact your local emergency services immediately. `
        + `${MIND_GARDEN_RESOURCE_FALLBACK_EN} I cannot provide real-time rescue, so bringing in people and emergency help nearby matters most right now.`
    }
    if (assessment.level === 2) {
      return 'Thank you for telling me. I will pause the rest of the conversation and focus on safety. '
        + `${safetyCheck} Please ask someone you trust to stay with you and contact a qualified local crisis or health service. `
        + 'If the danger becomes immediate, contact your local emergency services. I cannot replace emergency or professional help, but I can help you work out the next step for reaching support.'
    }
    return 'It sounds like you are carrying a great deal right now. I will not rush to analyse it. '
      + 'Please consider letting someone you trust know what is happening and contacting a qualified local support service. '
      + 'I cannot replace professional help. Would it help more if I listened quietly, or if we worked out a safer plan for today?'
  }
  const support = assessment.resources.find(resource => resource.kind === 'support')
  const emergency = assessment.resources.filter(resource => resource.kind === 'emergency')
  const supportClause = support === undefined
    ? MIND_GARDEN_RESOURCE_FALLBACK
    : `你也可以联系${support.label} ${support.value}。`
  const emergencyClause = emergency.length === 0
    ? '当地公安或医疗急救服务'
    : emergency.map(resource => `${resource.label} ${resource.value}`).join('；')
  const safetyCheck = '你现在是否安全、是否已经做了伤害自己或他人的事、身边是否能接触到可能造成伤害的物品？'
  if (assessment.level >= 3) {
    return '我很在意你刚才提到的即时危险。先暂停其他讨论，离开可能造成伤害的物品或地点，'
      + `并立即联系一位可信任的人陪着你。${safetyCheck}`
      + `如果危险正在发生，请立即联系${emergencyClause}。${supportClause}`
      + '我不能提供实时救援，此刻最重要的是让现实中的人和紧急服务介入。'
  }
  if (assessment.level === 2) {
    return '谢谢你把这件事说出来。我先暂停其他讨论，也不和你争辩。'
      + `${safetyCheck}请尽快联系一位可信任的人陪着你。${supportClause}`
      + `危险变得紧迫时，请联系${emergencyClause}`
      + '我不能替代紧急或专业帮助，但可以陪你把联系现实支持的下一步说清楚。'
  }
  return '听起来你正承受很重的压力。我不会急着分析。'
    + `可以先让一位你信任的人知道近况，让现实中的支持靠近一些。${supportClause}`
    + '我不能替代专业帮助。此刻更需要我安静听你说，还是一起确认今天怎样更稳妥地过下去？'
}

/**
 * Render a safe replacement for blocked or unbounded assistant output.
 * @param reason - whether content policy or configured buffering caused replacement.
 * @param violations - matched rules when content policy caused replacement.
 * @returns user-visible replacement text with no unsafe output quotation.
 */
export function renderMindGardenGuardReplacement(
  reason: MindGardenOutputGuardReason,
  violations: readonly MindGardenOutputViolation[],
  locale: MindGardenSafetyLocale = 'zh-CN',
): string {
  if (locale === 'en') {
    if (reason === 'buffer-limit') {
      return 'This response exceeded the amount Mind Garden can check safely, so it was not shown. We can break the topic into a smaller part and continue carefully.'
    }
    if (violations.includes('medication-direction')) {
      return 'I cannot advise you to stop, switch, or change the dose of medication. Please contact the prescribing clinician or a local health service; I can help you organise what you want to tell them.'
    }
    if (violations.includes('delusion-confirmation')) {
      return 'I cannot confirm that a threat or hidden message is definitely real. We can focus on what you can verify around you and on your immediate safety. If anyone may be in danger, contact someone you trust and your local emergency services.'
    }
    if (violations.includes('diagnosis')) {
      return 'I cannot diagnose you or assign a personality label from this conversation. I can listen to the specific experience and help you prepare questions for a qualified professional.'
    }
    return 'I want to put that more safely: I can help you think this through, but I cannot replace relationships, professional care, or emergency support in your life. Let us return to the part you most wanted understood.'
  }
  if (reason === 'buffer-limit') {
    return '这次回复超出了心智庭院能够安全检查的范围，因此没有继续显示。我们可以把刚才的话题拆小一些，再稳妥地继续。'
  }
  if (violations.includes('medication-direction')) {
    return '我不能建议你停药、换药或调整剂量。涉及处方和用药安全，请联系开具处方的医生或当地医疗服务；我可以帮你整理想向医生说明的感受和问题。'
  }
  if (violations.includes('delusion-confirmation')) {
    return '我不能确认某种威胁或暗示一定真实存在。我们可以先关注你此刻能确认的环境与安全；如果你感到自己或他人可能有危险，请尽快联系可信任的人和当地紧急服务。'
  }
  if (violations.includes('diagnosis')) {
    return '我不能根据这段对话给你下诊断或贴人格标签。我可以继续听你描述具体经历，也可以帮你整理需要向合格专业人士咨询的问题。'
  }
  return '我想换一种更稳妥的说法：我可以在这里陪你梳理，但不能替代现实中的关系、专业照护或紧急支持。我们先回到你刚才最想被理解的部分。'
}
