/** Local natural-language decisions that never grant memory authority by themselves. */

type CorrectionDecisionIntent = 'confirm' | 'cancel' | 'unclear'

/** Evidence summary consumed by the correction state machine. */
interface CorrectionDecision {
  readonly intent: CorrectionDecisionIntent
  readonly explicitApproval: boolean
  readonly explicitCancellation: boolean
  readonly ambiguous: boolean
}

type ForbiddenInferenceKind = 'clinical-diagnosis' | 'personality-label' | 'hidden-cause'

interface Clause {
  readonly text: string
  readonly question: boolean
}

const APPROVAL_STANDALONE = [
  '对', '对的', '是的', '没错', '可以', '可以的', '确认', '同意',
  'yes', 'confirm', 'confirmed', 'agreed',
] as const

const APPROVAL_PHRASES = [
  '我确认', '我同意', '就这样改', '按这个改', '按你说的改', '照这个改', '改吧', '保存吧', '记下来吧',
  "that's right", 'that is right', 'i confirm', 'i agree', 'do it', 'go ahead', 'make that change',
  'save it', 'change it',
] as const

const CANCELLATION_STANDALONE = [
  '取消', '算了', '先别', '等等', '停一下', '以后再说', '稍后再说', '再想想',
  'cancel', 'stop', 'wait', 'hold on', 'never mind', 'not now',
] as const

const CANCELLATION_PHRASES = [
  '别这样改', '别改', '别保存', '别记录', '别记下来', '不要改', '不要保存', '不要记录', '不要记',
  '不必改', '不必保存', '不用改', '不用保存', '无需改', '无需保存', '不需要改', '不需要保存',
  '不想改', '不想保存', '不愿意改', '不愿意保存', '我还没同意', '我没有同意',
  'do not change', "don't change", 'do not save', "don't save", 'do not remember', "don't remember",
  'do not want it changed', "don't want it changed", 'do not want it saved', "don't want it saved",
  'cannot confirm', "can't confirm", 'will not confirm', "won't confirm", 'rather not',
] as const

const DECLINE_STANDALONE = ['不对', '错了', '否', 'no', 'nope'] as const
const DECLINE_PHRASES = ['不是这样', '不是这个意思', '并不正确', 'that is wrong', "that's wrong"] as const

const AMBIGUITY_PHRASES = [
  '也许', '可能吧', '大概', '不确定', '随便', '都行', '看情况', '我想想', '让我想想', '之后再决定',
  'maybe', 'perhaps', 'not sure', "i'm not sure", 'i am not sure', 'whatever', 'i guess', 'let me think',
] as const

const NON_DIRECT_PHRASES = [
  '他说', '她说', '他们说', '对方说', '比如', '例如', '假如', '如果', '你是说', '你刚才说',
  'he said', 'she said', 'they said', 'for example', 'suppose', 'if yes', 'you said', 'are you saying',
] as const

const CLINICAL_DIAGNOSIS_PHRASES = [
  '诊断', '确诊', '患有', '抑郁症', '焦虑症', '双相情感障碍', '躁郁症', '精神分裂', '创伤后应激',
  'diagnosis', 'diagnosed', 'clinical disorder', 'depression', 'anxiety disorder', 'bipolar disorder',
  'schizophrenia', 'post-traumatic stress disorder', 'ptsd',
] as const

const PERSONALITY_LABEL_PHRASES = [
  '人格障碍', '依恋类型', '依恋风格', '创伤类型', '人格类型', '回避型依恋', '焦虑型依恋', '自恋型人格',
  'personality disorder', 'attachment style', 'attachment type', 'trauma type', 'personality type',
  'avoidant attachment', 'anxious attachment', 'narcissist',
] as const

const HIDDEN_CAUSE_PHRASES = [
  '潜意识', '无意识欲望', '被压抑的记忆', '内在小孩', '深层创伤导致', '风险评分', '危险等级',
  'subconscious', 'unconscious desire', 'repressed memory', 'inner child', 'hidden trauma',
  'risk score', 'risk level',
] as const

function normalizedText(value: string): string {
  return value.normalize('NFKC')
    .toLocaleLowerCase('en-US')
    .replace(/[‘’]/gu, "'")
    .replace(/[“”"「」『』()[\]{}，,。.！!？?；;：:]/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim()
}

function splitClauses(value: string): Clause[] {
  const separated = value.normalize('NFKC')
    .replace(/(?:但是|不过|然而|可是|但|却|\bbut\b|\bhowever\b|\balthough\b|\bthough\b|\byet\b)/giu, '\n')
  return [...separated.matchAll(/([^。！？!?；;\n]+)([。！？!?；;\n]*)/gu)].flatMap((match) => {
    const text = normalizedText(match[1] ?? '')
    if (text.length === 0) return []
    return [{ text, question: (match[2] ?? '').includes('?') || (match[2] ?? '').includes('？') }]
  })
}

function containsPhrase(value: string, phrase: string): boolean {
  if (/[a-z]/u.test(phrase)) return ` ${value} `.includes(` ${phrase} `)
  return value.includes(phrase)
}

function containsAnyPhrase(value: string, phrases: readonly string[]): boolean {
  return phrases.some(phrase => containsPhrase(value, phrase))
}

function containsStandalone(value: string, phrases: readonly string[]): boolean {
  const padded = ` ${value} `
  return phrases.some(phrase => value === phrase || padded.includes(` ${phrase} `))
}

/**
 * Interpret one complete human message without selecting or mutating a proposal.
 * @param value - Complete entered human text.
 * @returns Conservative decision evidence; ambiguous language remains unclear.
 */
export function interpretCorrectionDecision(value: string): CorrectionDecision {
  let explicitApproval = false
  let explicitCancellation = false
  let ambiguous = false
  for (const clause of splitClauses(value)) {
    const nonDirect = containsAnyPhrase(clause.text, NON_DIRECT_PHRASES)
    const cancellation = containsStandalone(clause.text, CANCELLATION_STANDALONE)
      || containsAnyPhrase(clause.text, CANCELLATION_PHRASES)
    const decline = containsStandalone(clause.text, DECLINE_STANDALONE)
      || containsAnyPhrase(clause.text, DECLINE_PHRASES)
    const approval = containsStandalone(clause.text, APPROVAL_STANDALONE)
      || containsAnyPhrase(clause.text, APPROVAL_PHRASES)
    const clauseAmbiguous = clause.question || nonDirect || containsAnyPhrase(clause.text, AMBIGUITY_PHRASES)
    explicitCancellation ||= cancellation || (decline && !clauseAmbiguous)
    explicitApproval ||= approval && !clauseAmbiguous
    ambiguous ||= clauseAmbiguous || (approval && decline)
  }
  const intent: CorrectionDecisionIntent = explicitCancellation
    ? 'cancel'
    : explicitApproval && !ambiguous
      ? 'confirm'
      : 'unclear'
  return Object.freeze({ intent, explicitApproval, explicitCancellation, ambiguous })
}

/**
 * Classify non-user-authored claims that automatic extraction must not retain.
 * @param value - Proposed memory content.
 * @returns Rejected claim category, or null for no deterministic match.
 */
export function forbiddenInferenceKind(value: string): ForbiddenInferenceKind | null {
  const normalized = normalizedText(value)
  if (containsAnyPhrase(normalized, CLINICAL_DIAGNOSIS_PHRASES)) return 'clinical-diagnosis'
  if (containsAnyPhrase(normalized, PERSONALITY_LABEL_PHRASES)) return 'personality-label'
  if (containsAnyPhrase(normalized, HIDDEN_CAUSE_PHRASES)) return 'hidden-cause'
  return null
}
