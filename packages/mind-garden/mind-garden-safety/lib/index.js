import z from "@deepseek-ai/schemastery";
import { BlockAssembler, isAgentLoopRequest } from "@deepseek-ai/dsh-llm";
//#region lib/types/resources.js
/** Versioned mainland-China support resources used by deterministic responses. */
const SUPPORT_RESOURCE = Object.freeze({
	id: "cn-12356",
	label: "全国统一心理援助热线",
	value: "12356",
	kind: "support",
	sourceUrl: "https://www.nhc.gov.cn/yzygj/c100068/202412/49a1a65386cd4be582d4702fd0926ee8.shtml",
	verifiedAt: "2026-08-18",
	reviewAfter: "2027-02-18"
});
const EMERGENCY_RESOURCES = Object.freeze([Object.freeze({
	id: "cn-110",
	label: "公安报警",
	value: "110",
	kind: "emergency",
	sourceUrl: "https://bjca.miit.gov.cn/zwgk/tzgg/art/2022/art_8d4eb93ee3424f30826c97ee400e8937.html",
	verifiedAt: "2026-08-18",
	reviewAfter: "2027-02-18"
}), Object.freeze({
	id: "cn-120",
	label: "医疗急救",
	value: "120",
	kind: "emergency",
	sourceUrl: "https://bjca.miit.gov.cn/zwgk/tzgg/art/2022/art_8d4eb93ee3424f30826c97ee400e8937.html",
	verifiedAt: "2026-08-18",
	reviewAfter: "2027-02-18"
})]);
/**
* Return detached resources appropriate to an intervention level.
* @param urgent - whether immediate emergency contacts are required.
* @param locale - locale whose verified resource registry may be returned.
* @returns the support line plus emergency contacts when requested.
*/
function mindGardenSafetyResources(urgent, locale = "zh-CN") {
	if (locale !== "zh-CN") return [];
	return structuredClone(urgent ? [SUPPORT_RESOURCE, ...EMERGENCY_RESOURCES] : [SUPPORT_RESOURCE]);
}
/** Fallback used when a listed contact cannot be reached. */
const MIND_GARDEN_RESOURCE_FALLBACK = "若号码暂时无法接通，请立即联系身边可信任的人，并在紧急危险时联系当地公安或医疗急救服务。";
/** Region-neutral fallback for locales without a verified resource registry. */
const MIND_GARDEN_RESOURCE_FALLBACK_EN = "If a local support line is unavailable, contact someone you trust and use your local emergency services when danger is immediate.";
//#endregion
//#region lib/types/safety-signals.js
/** Structured local signals used by deterministic Mind Garden safety policy. */
const SELF_TERMS = [
	"我",
	"自己",
	"本人",
	"i",
	"me",
	"myself",
	"my life"
];
const ACTIVE_INTENT_TERMS = [
	"想",
	"打算",
	"计划",
	"决定",
	"准备",
	"马上要",
	"将要",
	"want to",
	"plan to",
	"intend to",
	"going to",
	"about to",
	"ready to"
];
const SELF_HARM_TERMS = [
	"自杀",
	"轻生",
	"结束生命",
	"结束自己的生命",
	"伤害自己",
	"自残",
	"割腕",
	"想死",
	"不想活",
	"kill myself",
	"end my life",
	"hurt myself",
	"self-harm",
	"want to die",
	"suicidal"
];
const OTHER_HARM_TERMS = [
	"杀了他",
	"杀了她",
	"杀了他们",
	"杀人",
	"伤害他",
	"伤害她",
	"伤害他们",
	"伤害别人",
	"kill him",
	"kill her",
	"kill them",
	"hurt him",
	"hurt her",
	"hurt them",
	"hurt someone"
];
const PASSIVE_DEATH_TERMS = [
	"活不下去",
	"死了算了",
	"不想活了",
	"不想活下去",
	"不想活着",
	"活着没有意义",
	"活着没意思",
	"别醒来",
	"不再醒来",
	"永远睡过去",
	"消失就好",
	"don't want to live",
	"do not want to live",
	"no reason to live",
	"wouldn't wake up",
	"would not wake up",
	"never wake up"
];
const IMMEDIATE_INTENT_TERMS = [
	"现在要",
	"马上要",
	"今晚打算",
	"今晚计划",
	"今晚准备",
	"已经准备",
	"准备自杀",
	"准备轻生",
	"准备伤害",
	"准备跳",
	"准备结束生命",
	"准备结束自己的生命",
	"going to",
	"about to",
	"ready to",
	"immediately going to"
];
const ACTION_TAKEN_TERMS = [
	"已经",
	"刚刚",
	"刚才",
	"正",
	"just",
	"already"
];
const COMPLETED_HARM_TERMS = [
	"割腕",
	"吞药",
	"吞了",
	"吃了一把",
	"吃了一瓶",
	"注射了",
	"跳下",
	"伤害了自己",
	"伤害了他人",
	"捅了",
	"砍了",
	"took an overdose",
	"swallowed",
	"injected",
	"hurt myself",
	"hurt someone"
];
const MEANS_TERMS = [
	"刀",
	"药",
	"绳",
	"煤气",
	"枪",
	"毒品",
	"knife",
	"pills",
	"medication",
	"rope",
	"gun",
	"gas",
	"drugs"
];
const ACCESS_TERMS = [
	"就在身边",
	"身边",
	"准备好",
	"拿着",
	"握着",
	"拿到",
	"伸手就能",
	"手里",
	"with me",
	"next to me",
	"in my hand",
	"have access",
	"within reach",
	"ready"
];
const DANGEROUS_LOCATION_TERMS = [
	"楼顶",
	"桥边",
	"铁轨",
	"悬崖",
	"rooftop",
	"roof",
	"bridge",
	"railway track",
	"train tracks",
	"cliff"
];
const LOCATION_ACCESS_TERMS = [
	"站在",
	"到了",
	"已经到",
	"就在",
	"正走向",
	"standing on",
	"at the",
	"arrived at",
	"walking toward"
];
const BENIGN_CONTEXT_TERMS = [
	"新闻",
	"报道",
	"论文",
	"小说",
	"电影",
	"电视剧",
	"游戏",
	"角色",
	"台词",
	"剧本",
	"研究",
	"科普",
	"课程",
	"标题",
	"关键词",
	"测试样例",
	"公共政策",
	"预防",
	"如果有人",
	"假如有人",
	"news",
	"article",
	"paper",
	"novel",
	"movie",
	"script",
	"quote",
	"quoted",
	"research",
	"training",
	"prevention",
	"if someone",
	"suppose someone",
	"fictional character"
];
const METAPHOR_TERMS = [
	"杀死拖延症",
	"砍掉重做",
	"结束这份工作",
	"结束这个项目",
	"楼顶的风景",
	"准备切菜",
	"感冒吃药",
	"kill this process",
	"kill the task",
	"cut the project"
];
const NEGATED_RISK_TERMS = [
	"没有想自杀",
	"并没有想自杀",
	"从没想过自杀",
	"不会自杀",
	"不想自杀",
	"不打算自杀",
	"没有想轻生",
	"从没想过轻生",
	"不会轻生",
	"不想轻生",
	"没有想自残",
	"从没想过自残",
	"不会自残",
	"不想自残",
	"没有伤害自己的打算",
	"并非想结束生命",
	"不会伤害自己",
	"不打算伤害自己",
	"不会杀人",
	"不打算杀人",
	"已放弃轻生",
	"已放弃自杀",
	"取消了轻生",
	"not suicidal",
	"don't want to die",
	"do not want to die",
	"don't plan to hurt myself",
	"do not plan to hurt myself",
	"not going to hurt myself"
];
const ABUSE_TERMS = [
	"打我",
	"掐我",
	"锁着我",
	"威胁杀我",
	"不让我离开",
	"孩子正在被虐待",
	"小孩正在被虐待",
	"未成年人正在被虐待",
	"孩子正在被性侵",
	"child is being abused",
	"kid is being abused",
	"hitting me",
	"strangling me",
	"locking me up",
	"threatening to kill me"
];
const REALITY_OR_SLEEP_TERMS = [
	"声音命令我",
	"有人命令我",
	"声音逼我",
	"有人逼我",
	"声音叫我伤人",
	"声音叫我自杀",
	"voices telling me to kill",
	"voices telling me to hurt",
	"voices commanding me"
];
const PROLONGED_SLEEP_TERMS = [
	"连续三天没睡",
	"连续四天没睡",
	"连续五天没睡",
	"连续3天没睡",
	"连续4天没睡",
	"连续5天没睡",
	"三天不睡",
	"四天不睡",
	"五天不睡",
	"three days without sleep",
	"four days without sleep",
	"five days without sleep",
	"haven't slept for three days",
	"haven't slept for four days"
];
const AGITATION_TERMS = [
	"停不下来",
	"控制不了",
	"无所不能",
	"无敌",
	"unstoppable",
	"invincible",
	"out of control"
];
const SUBSTANCE_TERMS = [
	"停酒",
	"戒酒",
	"停药",
	"戒断",
	"吸毒",
	"用药",
	"喝酒",
	"过量",
	"overdose",
	"overdosed",
	"alcohol withdrawal",
	"benzodiazepine withdrawal",
	"benzo withdrawal"
];
const SUBSTANCE_DANGER_TERMS = [
	"抽搐",
	"意识不清",
	"看见不存在",
	"严重发抖",
	"失去意识",
	"叫不醒",
	"呼吸很慢",
	"seizure",
	"hallucination",
	"confusion",
	"unconscious",
	"won't wake",
	"not breathing",
	"breathing slowly"
];
const VULNERABLE_TERMS = [
	"彻底绝望",
	"非常绝望",
	"特别绝望",
	"绝望",
	"撑不下去",
	"连续七天失眠",
	"连续两周睡不着",
	"can't go on",
	"cannot go on",
	"no reason to live"
];
function quotedPolicyText(value) {
	return [...value.matchAll(/[“"「『]([^”"」』]+)[”"」』]/gu)].map((match) => match[1] ?? "").join(" ");
}
function unquotedPolicyText(value) {
	return value.replace(/[“"「『][^”"」』]+[”"」』]/gu, " ");
}
function hasDirectRiskEvidence(text) {
	const directSelf = hasAnyPolicyPhrase(text, SELF_TERMS);
	const activeIntent = hasAnyPolicyPhrase(text, ACTIVE_INTENT_TERMS);
	const selfHarm = hasAnyPolicyPhrase(text, SELF_HARM_TERMS);
	const otherHarm = hasAnyPolicyPhrase(text, OTHER_HARM_TERMS);
	const completedHarm = hasAnyPolicyPhrase(text, COMPLETED_HARM_TERMS);
	const dangerousLocation = hasAnyPolicyPhrase(text, DANGEROUS_LOCATION_TERMS) && hasAnyPolicyPhrase(text, LOCATION_ACCESS_TERMS);
	return directSelf && (selfHarm || completedHarm || hasAnyPolicyPhrase(text, PASSIVE_DEATH_TERMS)) || activeIntent && otherHarm || dangerousLocation;
}
/**
* Normalize text for literal policy-phrase matching.
* @param value - User or assistant text.
* @returns NFKC, lowercase, punctuation-separated text.
*/
function normalizePolicyText(value) {
	return value.normalize("NFKC").toLocaleLowerCase("en-US").replace(/[‘’]/gu, "'").replace(/[“”"「」『』()[\]{}，,。.！!？?；;：:]/gu, " ").replace(/\s+/gu, " ").trim();
}
/**
* Match one policy phrase with word boundaries for Latin text.
* @param value - Normalized policy text.
* @param phrase - Normalized literal phrase.
* @returns Whether the phrase is present.
*/
function hasPolicyPhrase(value, phrase) {
	if (/[a-z]/u.test(phrase)) return ` ${value} `.includes(` ${phrase} `);
	return value.includes(phrase);
}
/**
* Match any phrase in one local policy lexicon.
* @param value - Normalized policy text.
* @param phrases - Literal policy phrases.
* @returns Whether at least one phrase is present.
*/
function hasAnyPolicyPhrase(value, phrases) {
	return phrases.some((phrase) => hasPolicyPhrase(value, phrase));
}
/**
* Extract local safety facts without selecting a response or risk level.
* @param clause - One normalized punctuation-bounded clause.
* @returns Structured facts for deterministic policy evaluation.
*/
function extractMindGardenSafetySignals(clause) {
	const text = normalizePolicyText(clause);
	const quoted = normalizePolicyText(quotedPolicyText(clause));
	const unquoted = normalizePolicyText(unquotedPolicyText(clause));
	const directSelf = hasAnyPolicyPhrase(text, SELF_TERMS);
	const activeIntent = hasAnyPolicyPhrase(text, ACTIVE_INTENT_TERMS);
	const harmSelf = hasAnyPolicyPhrase(text, SELF_HARM_TERMS);
	const harmOther = hasAnyPolicyPhrase(text, OTHER_HARM_TERMS);
	const means = hasAnyPolicyPhrase(text, MEANS_TERMS);
	const access = hasAnyPolicyPhrase(text, ACCESS_TERMS);
	const dangerousLocation = hasAnyPolicyPhrase(text, DANGEROUS_LOCATION_TERMS) && hasAnyPolicyPhrase(text, LOCATION_ACCESS_TERMS);
	const benignContext = hasAnyPolicyPhrase(text, BENIGN_CONTEXT_TERMS) || hasAnyPolicyPhrase(text, METAPHOR_TERMS);
	return Object.freeze({
		directSelf,
		benignContext,
		protectedContext: benignContext && hasDirectRiskEvidence(quoted) && !hasDirectRiskEvidence(unquoted),
		negatedRisk: text.includes("不想活在") || hasAnyPolicyPhrase(text, NEGATED_RISK_TERMS),
		activeSelfHarm: directSelf && activeIntent && harmSelf,
		activeOtherHarm: activeIntent && harmOther,
		passiveDeathWish: directSelf && hasAnyPolicyPhrase(text, PASSIVE_DEATH_TERMS),
		immediateIntent: hasAnyPolicyPhrase(text, IMMEDIATE_INTENT_TERMS),
		actionTaken: directSelf && hasAnyPolicyPhrase(text, ACTION_TAKEN_TERMS) && hasAnyPolicyPhrase(text, COMPLETED_HARM_TERMS),
		meansAccess: means && access,
		dangerousLocation,
		abuseDanger: hasAnyPolicyPhrase(text, ABUSE_TERMS),
		realityOrSleepDanger: hasAnyPolicyPhrase(text, REALITY_OR_SLEEP_TERMS) || hasAnyPolicyPhrase(text, PROLONGED_SLEEP_TERMS) && hasAnyPolicyPhrase(text, AGITATION_TERMS),
		substanceDanger: hasAnyPolicyPhrase(text, SUBSTANCE_TERMS) && hasAnyPolicyPhrase(text, SUBSTANCE_DANGER_TERMS),
		vulnerable: hasAnyPolicyPhrase(text, VULNERABLE_TERMS)
	});
}
//#endregion
//#region lib/types/classifier.js
/** Pure deterministic input classifier and follow-up state transition. */
const URGENT_PATTERNS = [
	/(?:我)?(?:现在|马上|今晚|已经).{0,10}(?:想|要|准备|打算)(?:自杀|轻生|跳楼|割腕|上吊|伤害自己|紫砂)/iu,
	/(?:现在|马上|今晚|已经).{0,12}(?:拿着|握着).{0,6}(?:刀|药|绳).{0,12}(?:准备|要|打算).{0,6}(?:伤害自己|自杀|轻生)/iu,
	/(?:我)?(?:已经|刚刚)(?:割腕|吞药|跳下|伤害自己|伤害他人|捅了|砍了)/iu,
	/(?:药|刀|绳|煤气|楼顶).{0,12}(?:就在身边|已经准备好|已经拿到|伸手就能拿到)/iu,
	/(?:我)?(?:现在|马上|今晚).{0,8}(?:要|准备|打算)(?:杀了|伤害)(?:他|她|他们|别人)/iu,
	/(?:我)?(?:已经|刚刚).{0,8}(?:吞了|吃了|注射了).{0,8}(?:一把|一瓶|一整瓶|很多|过量|全部)(?:药|毒品|酒)/iu,
	/(?:我)?(?:(?:正|已经)?站在|已经到了|就在).{0,8}(?:楼顶|桥边|铁轨|悬崖)/iu,
	/\b(?:i am|i'm|im)\s+(?:going to|about to|ready to)\s+(?:kill myself|end my life|hurt myself)\b/iu,
	/\b(?:i|we)\s+(?:just|already)\s+(?:took|swallowed|injected).{0,18}(?:overdose|all the pills|a bottle of pills)\b/iu,
	/\b(?:tonight|right now|now).{0,18}(?:kill myself|end my life|kill (?:him|her|them))\b/iu
];
const HIGH_RISK_PATTERNS = [
	/(?:我)?(?:想|打算|计划|决定).{0,8}(?:自杀|轻生|结束生命|伤害自己|自残|紫砂)/iu,
	/(?:我)?(?:不想活(?:了|下去|着|[，。！？\s]|$)|活不下去|想死|死了算了|结束自己的生命)/iu,
	/(?:我)?(?:想|打算|计划|决定).{0,8}(?:杀了|伤害)(?:他|她|他们|别人)/iu,
	/(?:遗书|告别信).{0,8}(?:写好|写完|已经写)|(?:东西|财物|宠物).{0,8}(?:送走|送人).{0,8}(?:不回来了|最后)/iu,
	/\b(?:i want to die|i want to kill myself|i plan to kill myself|i don't want to live|i do not want to live)\b/iu,
	/\b(?:wrote|finished).{0,12}(?:suicide note|goodbye letter)\b/iu
];
const VULNERABLE_PATTERNS = [
	/(?:彻底|非常|特别)?绝望/iu,
	/(?:真的|快要)?撑不下去/iu,
	/连续.{0,6}(?:天|周).{0,4}(?:睡不着|失眠)/iu,
	/活着.{0,5}(?:没意思|没有意义)/iu,
	/(?:希望|最好|要是).{0,8}(?:睡着.{0,4}(?:就)?别醒|明天别醒来|消失就好)/iu,
	/\b(?:can't go on|cannot go on|no reason to live|wish i would not wake up|wish i wouldn't wake up)\b/iu
];
const ABUSE_DANGER_PATTERNS = [
	/(?:正在|现在|今晚).{0,8}(?:打我|掐我|锁着我|威胁杀我|不让我离开)/iu,
	/(?:孩子|小孩|未成年人).{0,8}(?:正在|经常).{0,8}(?:被打|被性侵|被虐待|被关起来)/iu,
	/\b(?:he|she|they)\s+(?:is|are)\s+(?:hitting|strangling|locking up|threatening to kill)\s+me\b/iu,
	/\b(?:child|kid|minor).{0,12}(?:is being abused|is being assaulted|is locked up)\b/iu
];
const REALITY_OR_SLEEP_PATTERNS = [
	/(?:连续|已经).{0,5}(?:三|3|四|4|五|5).{0,3}(?:天|晚).{0,8}(?:没睡|不睡).{0,12}(?:停不下来|控制不了|无所不能)/iu,
	/(?:声音|有人).{0,8}(?:命令|叫|逼).{0,8}(?:我)?(?:自杀|伤人|杀人|跳下去)/iu,
	/\b(?:voices?|someone)\s+(?:is|are)?\s*(?:telling|ordering|commanding)\s+me\s+to\s+(?:kill|hurt|jump)\b/iu,
	/\b(?:three|four|five|3|4|5)\s+(?:days|nights).{0,18}(?:without sleep|haven't slept).{0,18}(?:unstoppable|invincible|out of control)\b/iu
];
const SUBSTANCE_DANGER_PATTERNS = [
	/(?:停酒|戒酒|停药|戒断).{0,12}(?:抽搐|意识不清|看见不存在|严重发抖)/iu,
	/(?:吸毒|用药|喝酒).{0,12}(?:过量|失去意识|叫不醒|呼吸很慢)/iu,
	/\b(?:overdose|overdosed).{0,16}(?:unconscious|won't wake|not breathing|breathing slowly)\b/iu,
	/\b(?:alcohol|benzodiazepine|benzo)\s+withdrawal.{0,16}(?:seizure|hallucination|confusion)\b/iu
];
const BENIGN_CONTEXT_PATTERNS = [
	/(?:新闻|报道|论文|小说|电影|电视剧|游戏|角色|台词|剧本).{0,30}(?:自杀|轻生|跳楼|割腕|杀人)/iu,
	/(?:讨论|分析|研究|科普).{0,20}(?:自杀|轻生|自残|他伤)/iu,
	/(?:如果|假如).{0,8}(?:有人|一个人).{0,12}(?:自杀|轻生|自残)/iu,
	/(?:课程|标题|关键词|测试样例).{0,20}(?:自杀|轻生|自残|杀人)/iu,
	/\b(?:news|article|paper|novel|movie|script|research|training).{0,30}(?:suicide|self-harm|murder)\b/iu,
	/\b(?:if|suppose).{0,10}(?:someone|a person).{0,16}(?:suicide|self-harm)\b/iu
];
const NEGATED_RISK_PATTERNS = [
	/(?:我)?(?:没有|并没有|从没|不会|不想|不打算).{0,5}(?:自杀|轻生|自残|伤害自己|杀人)/iu,
	/(?:我)?(?:已放弃|取消了).{0,5}(?:自杀|轻生|自残|伤害自己)的?(?:想法|计划)?/iu,
	/\b(?:i am not|i'm not|im not)\s+(?:suicidal|going to hurt myself)\b/iu,
	/\b(?:i don't|i do not)\s+(?:want|plan|intend)\s+to\s+(?:die|kill myself|hurt myself)\b/iu
];
const SAFETY_CONFIRMED_TERMS = [
	"我现在安全",
	"现在是安全的",
	"已经联系到",
	"有人陪着我",
	"危险已经过去",
	"已经离开楼顶",
	"已经离开桥边",
	"刀已经交给",
	"药已经交给",
	"救护车到了",
	"警察到了",
	"已经到急诊",
	"门已经锁好",
	"施暴者已经离开"
];
function matches(patterns, text) {
	return patterns.some((pattern) => pattern.test(text));
}
function result(level, state, categories, normalTurns = 0, locale = "zh-CN") {
	return {
		locale,
		level,
		state,
		categories,
		resources: level === 0 ? [] : mindGardenSafetyResources(level >= 3, locale),
		normalTurns
	};
}
function splitSafetyClauses(text) {
	return text.split(/(?:[。！？!?；;\n]+|(?<!不)(?:但是|不过|然而|可是|但|却)|\b(?:but|however|although|though|yet)\b)/iu).map((clause) => clause.trim()).filter(Boolean);
}
function assessClause(clause, locale) {
	const signals = extractMindGardenSafetySignals(clause);
	const concreteDanger = signals.actionTaken || signals.dangerousLocation || (signals.activeSelfHarm || signals.activeOtherHarm) && (signals.immediateIntent || signals.meansAccess);
	if (signals.protectedContext) return result(0, "ordinary", [], 0, locale);
	if (concreteDanger) return result(3, "urgent", ["immediate-danger"], 0, locale);
	if (signals.substanceDanger) return result(3, "substance-emergency", ["overdose-or-withdrawal"], 0, locale);
	if (signals.abuseDanger) return result(2, "abuse-danger", ["abuse-or-child-safety"], 0, locale);
	if (signals.realityOrSleepDanger) return result(2, "reality-or-sleep-danger", ["mania-or-psychosis-danger"], 0, locale);
	if (signals.benignContext || signals.negatedRisk) return result(0, "ordinary", [], 0, locale);
	if (signals.activeSelfHarm || signals.activeOtherHarm || signals.passiveDeathWish) return result(2, "high-risk", ["self-or-other-harm"], 0, locale);
	if (signals.vulnerable) return result(1, "vulnerable", ["severe-distress"], 0, locale);
	if (clause.includes("不想活在") || matches(NEGATED_RISK_PATTERNS, clause) || matches(BENIGN_CONTEXT_PATTERNS, clause)) return result(0, "ordinary", [], 0, locale);
	if (matches(URGENT_PATTERNS, clause)) return result(3, "urgent", ["immediate-danger"], 0, locale);
	if (matches(SUBSTANCE_DANGER_PATTERNS, clause)) return result(3, "substance-emergency", ["overdose-or-withdrawal"], 0, locale);
	if (matches(ABUSE_DANGER_PATTERNS, clause)) return result(2, "abuse-danger", ["abuse-or-child-safety"], 0, locale);
	if (matches(REALITY_OR_SLEEP_PATTERNS, clause)) return result(2, "reality-or-sleep-danger", ["mania-or-psychosis-danger"], 0, locale);
	if (matches(HIGH_RISK_PATTERNS, clause)) return result(2, "high-risk", ["self-or-other-harm"], 0, locale);
	if (matches(VULNERABLE_PATTERNS, clause)) return result(1, "vulnerable", ["severe-distress"], 0, locale);
	return result(0, "ordinary", [], 0, locale);
}
/**
* Infer the deterministic safety-copy locale from the entered text.
* @param text - complete entered human text.
* @returns locale for deterministic safety copy.
*/
function detectMindGardenSafetyLocale(text) {
	const hanCount = text.match(/\p{Script=Han}/gu)?.length ?? 0;
	const latinWordCount = text.match(/\b[A-Za-z]+\b/gu)?.length ?? 0;
	return latinWordCount > 0 && latinWordCount * 2 > hanCount ? "en" : "zh-CN";
}
/**
* Normalize common spacing, traditional characters, and obfuscations.
* @param text - entered user text.
* @returns normalized text used only for deterministic matching.
*/
function normalizeMindGardenSafetyText(text) {
	return text.trim().replace(/\s+/gu, " ").replaceAll("殺", "杀").replaceAll("傷", "伤").replaceAll("輕", "轻").replaceAll("藥", "药").replaceAll("覺", "觉").replace(/自[\s·._-]*杀/giu, "自杀").replace(/轻[\s·._-]*生/giu, "轻生").replace(/割[\s·._-]*腕/giu, "割腕").replace(/紫[\s·._-]*砂/giu, "紫砂").replace(/s[\s·._-]*u[\s·._-]*i[\s·._-]*c[\s·._-]*i[\s·._-]*d[\s·._-]*e/giu, "suicide").replace(/k[\s·._-]*i[\s·._-]*l[\s·._-]*l/giu, "kill").replace(/z[\s·._-]*i[\s·._-]*s[\s·._-]*h[\s·._-]*a/giu, "自杀");
}
/**
* Classify one user text without a model or network call.
* @param text - complete entered human text.
* @param locale - locale for deterministic assessment copy and resources.
* @returns a detached deterministic assessment.
*/
function assessMindGardenInput(text, locale = detectMindGardenSafetyLocale(text)) {
	return splitSafetyClauses(normalizeMindGardenSafetyText(text)).flatMap((clause) => {
		const commaClauses = clause.split(/[，,、]+/u).map((part) => part.trim()).filter(Boolean);
		return commaClauses.length > 1 ? [clause, ...commaClauses] : [clause];
	}).map((clause) => assessClause(clause, locale)).reduce((highest, assessment) => assessment.level > highest.level ? assessment : highest, result(0, "ordinary", [], 0, locale));
}
/**
* Carry a previous intervention forward until concrete safety information or
* two ordinary level-one turns allow a step down.
* @param current - classification of the latest text alone.
* @param previous - previous entered-human assessment in this session.
* @param text - latest complete human text.
* @returns effective assessment for this response.
*/
function recoverMindGardenSafetyState(current, previous, text) {
	if (current.level > 0 || previous === void 0 || previous.level === 0) return current;
	const normalized = normalizeMindGardenSafetyText(text);
	const safetyConfirmed = SAFETY_CONFIRMED_TERMS.some((term) => normalized.includes(term));
	if (previous.level === 3) return safetyConfirmed ? result(2, "support-follow-up", ["immediate-danger-reduced"], 0, current.locale) : result(3, "support-follow-up", ["urgent-follow-up"], previous.normalTurns, current.locale);
	if (previous.level === 2) return safetyConfirmed ? result(1, "support-follow-up", ["safety-confirmed"], 0, current.locale) : result(2, "support-follow-up", ["safety-follow-up"], previous.normalTurns, current.locale);
	const normalTurns = previous.normalTurns + 1;
	return normalTurns >= 2 ? result(0, "ordinary", [], 0, current.locale) : result(1, "support-follow-up", ["safety-follow-up"], normalTurns, current.locale);
}
const EXCLUSIVE_CONTROL_TERMS = [
	"只有我",
	"只需要我",
	"唯一能",
	"不要再找",
	"别再找",
	"不需要其他人",
	"only i",
	"you only need me",
	"no one else",
	"don't seek",
	"do not seek"
];
const DEPENDENCE_TERMS = [
	"懂你",
	"理解你",
	"陪你",
	"帮你",
	"朋友",
	"家人",
	"咨询师",
	"医生",
	"understand you",
	"help you",
	"support you",
	"friends",
	"family",
	"therapist",
	"doctor"
];
const EXCLUSIVE_DEPENDENCE_DISCLAIMERS = [
	"不能说只有我",
	"不该说只有我",
	"不会说只有我",
	"不要声称只有我",
	"不能声称只有我",
	"cannot say only i",
	"can't say only i",
	"should not say only i",
	"must not say only i",
	"avoid saying only i"
];
const DIAGNOSIS_CERTAINTY_TERMS = [
	"你一定",
	"你就是",
	"你显然",
	"这就是",
	"这一定",
	"这是典型",
	"可以断定",
	"能够断定",
	"证明你有",
	"you definitely",
	"you clearly",
	"you have",
	"this is clearly",
	"this proves",
	"must have"
];
const DIAGNOSIS_TERMS = [
	"抑郁症",
	"焦虑症",
	"双相",
	"躁郁",
	"精神分裂",
	"人格障碍",
	"创伤后应激",
	"depression",
	"anxiety disorder",
	"bipolar",
	"schizophrenia",
	"personality disorder",
	"ptsd"
];
const DIAGNOSIS_DISCLAIMERS = [
	"不能诊断",
	"无法诊断",
	"不能断定",
	"无法断定",
	"不能根据这段对话",
	"cannot diagnose",
	"can't diagnose",
	"cannot determine",
	"can't determine"
];
const MEDICATION_ACTION_TERMS = [
	"停药",
	"停掉药",
	"停掉处方药",
	"停掉所有处方药",
	"停止服药",
	"加量",
	"减量",
	"换药",
	"剂量翻倍",
	"剂量直接翻倍",
	"双倍剂量",
	"stop medication",
	"stop your medication",
	"increase your dose",
	"decrease your dose",
	"double your dose",
	"change your prescription"
];
const MEDICATION_DISCLAIMERS = [
	"不要停药",
	"不能建议你停药",
	"不能建议你换药",
	"不能建议你调整剂量",
	"请联系开具处方的医生",
	"do not stop your medication",
	"cannot advise you to stop",
	"can't advise you to stop",
	"contact the prescribing clinician"
];
const OBLIGATION_TERMS = [
	"你必须",
	"唯一能做的",
	"只能立刻",
	"没有别的选择",
	"you must",
	"your only option",
	"you have no choice"
];
const LIFE_DECISION_TERMS = [
	"辞职",
	"离婚",
	"分手",
	"断绝关系",
	"搬走",
	"quit your job",
	"divorce",
	"break up",
	"cut off contact",
	"move out"
];
const FORCED_DECISION_DISCLAIMERS = [
	"不应该告诉你必须",
	"不能告诉你必须",
	"不会告诉你必须",
	"不该说你必须",
	"should not tell you that you must",
	"cannot tell you that you must",
	"can't tell you that you must",
	"must not tell you that you must"
];
const TRAUMA_DIRECTIVE_TERMS = [
	"跟着我",
	"闭上眼",
	"我来治疗你",
	"我来治好你",
	"治疗计划",
	"follow me",
	"close your eyes",
	"i will heal you",
	"treatment plan"
];
const TRAUMA_EXPOSURE_TERMS = [
	"重新经历",
	"回到创伤",
	"想起每个细节",
	"重现创伤",
	"relive",
	"return to the trauma",
	"remember every detail"
];
const REALITY_CERTAINTY_TERMS = [
	"他们确实",
	"这证明",
	"肯定有人",
	"毫无疑问",
	"they really are",
	"this proves",
	"definitely someone",
	"without doubt"
];
const DELUSION_TERMS = [
	"监视你",
	"控制你思想",
	"传递暗号",
	"读取你的思想",
	"watching you",
	"monitoring you",
	"controlling your thoughts",
	"sending you messages",
	"reading your mind"
];
const REALITY_DISCLAIMERS = [
	"不能确认",
	"无法确认",
	"先关注能确认的",
	"cannot confirm",
	"can't confirm",
	"focus on what you can verify"
];
const USER_BLAME_CAUSES = [
	"都是因为你",
	"问题就在于你",
	"归根结底是你",
	"this is all because you"
];
const USER_BLAME_TERMS = [
	"想太多",
	"认知有问题",
	"不够努力",
	"太敏感",
	"自己造成的",
	"overthink",
	"faulty thinking",
	"not trying hard enough",
	"too sensitive",
	"your own fault"
];
function normalizeOutputPolicyText(value) {
	return value.normalize("NFKC").toLocaleLowerCase("en-US").replace(/[‘’]/gu, "'").replace(/[“”"「」『』()[\]{}，,。.！!？?；;：:]/gu, " ");
}
function latinTokens(value) {
	return [...value.matchAll(/[a-z0-9']+/gu)].map((match) => ({
		value: match[0],
		start: match.index,
		end: match.index + match[0].length
	}));
}
function phraseMatches(value, phrases, tokens) {
	const matches = [];
	for (const phrase of phrases) {
		if (/[a-z]/u.test(phrase)) {
			const phraseTokens = phrase.match(/[a-z0-9']+/gu) ?? [];
			for (let index = 0; index <= tokens.length - phraseTokens.length; index += 1) {
				const candidate = tokens.slice(index, index + phraseTokens.length);
				if (!candidate.every((token, offset) => token.value === phraseTokens[offset])) continue;
				const first = candidate[0];
				const last = candidate.at(-1);
				if (first !== void 0 && last !== void 0) matches.push({
					start: first.start,
					end: last.end
				});
			}
			continue;
		}
		let index = value.indexOf(phrase);
		while (index >= 0) {
			matches.push({
				start: index,
				end: index + phrase.length
			});
			index = value.indexOf(phrase, index + 1);
		}
	}
	return [...new Map(matches.map((match) => [`${match.start}:${match.end}`, match])).values()].sort((left, right) => left.start - right.start || left.end - right.end);
}
function firstMatchAtOrAfter(matches, start) {
	let low = 0;
	let high = matches.length;
	while (low < high) {
		const middle = Math.floor((low + high) / 2);
		if ((matches[middle]?.start ?? Number.POSITIVE_INFINITY) < start) low = middle + 1;
		else high = middle;
	}
	return low;
}
function structuredRuleMatches(value, tokens, requiredGroups, excludedPhrases = []) {
	const groups = requiredGroups.map((group) => phraseMatches(value, group, tokens));
	if (groups.some((group) => group.length === 0)) return false;
	const excluded = phraseMatches(value, excludedPhrases, tokens);
	const accepted = (start, end) => {
		if (end - start > 64) return false;
		const excludedStart = firstMatchAtOrAfter(excluded, start - 64);
		for (let index = excludedStart; index < excluded.length; index += 1) {
			const match = excluded[index];
			if (match === void 0 || match.start > end + 64) break;
			if (Math.max(end, match.end) - Math.min(start, match.start) <= 64) return false;
		}
		return true;
	};
	const firstGroup = groups[0] ?? [];
	if (groups.length === 1) return firstGroup.some((match) => accepted(match.start, match.end));
	const secondGroup = groups[1] ?? [];
	for (const first of firstGroup) {
		const nearbyStart = firstMatchAtOrAfter(secondGroup, first.start - 64);
		for (let index = nearbyStart; index < secondGroup.length; index += 1) {
			const second = secondGroup[index];
			if (second === void 0 || second.start > first.end + 64) break;
			if (accepted(Math.min(first.start, second.start), Math.max(first.end, second.end))) return true;
		}
	}
	return false;
}
function structuredOutputViolations(text) {
	const normalized = normalizeOutputPolicyText(text);
	const tokens = latinTokens(normalized);
	const violations = [];
	if (structuredRuleMatches(normalized, tokens, [EXCLUSIVE_CONTROL_TERMS, DEPENDENCE_TERMS], EXCLUSIVE_DEPENDENCE_DISCLAIMERS)) violations.push("exclusive-dependence");
	if (structuredRuleMatches(normalized, tokens, [DIAGNOSIS_CERTAINTY_TERMS, DIAGNOSIS_TERMS], DIAGNOSIS_DISCLAIMERS)) violations.push("diagnosis");
	if (structuredRuleMatches(normalized, tokens, [MEDICATION_ACTION_TERMS], MEDICATION_DISCLAIMERS)) violations.push("medication-direction");
	if (structuredRuleMatches(normalized, tokens, [OBLIGATION_TERMS, LIFE_DECISION_TERMS], FORCED_DECISION_DISCLAIMERS)) violations.push("forced-life-decision");
	if (structuredRuleMatches(normalized, tokens, [TRAUMA_DIRECTIVE_TERMS, TRAUMA_EXPOSURE_TERMS])) violations.push("trauma-exposure");
	if (structuredRuleMatches(normalized, tokens, [REALITY_CERTAINTY_TERMS, DELUSION_TERMS], REALITY_DISCLAIMERS)) violations.push("delusion-confirmation");
	if (structuredRuleMatches(normalized, tokens, [USER_BLAME_CAUSES, USER_BLAME_TERMS])) violations.push("user-blame");
	return violations;
}
/**
* Return every deterministic output rule matched by complete assistant text.
* @param text - complete buffered user-visible assistant text.
* @param assessment - effective input assessment for this step.
* @returns unique stable violations in policy order.
*/
function assessMindGardenOutput(text, assessment) {
	const violations = structuredOutputViolations(text);
	if ((assessment?.level ?? 0) >= 2 && /哲学|斯多葛|存在主义|中道/iu.test(text)) violations.push("risk-deflection");
	return [...new Set(violations)];
}
/**
* Render the deterministic local response for an elevated input assessment.
* @param assessment - effective level-one through level-three assessment.
* @returns a calm mainland-China support response containing verified contacts.
*/
function renderMindGardenSupportResponse(assessment) {
	if (assessment.locale === "en") {
		const safetyCheck = "Are you safe right now, have you already hurt yourself or someone else, and can you reach anything that could cause harm?";
		if (assessment.level >= 3) return `I am concerned about the immediate danger you described. Pause everything else, move away from anything or anywhere that could cause harm, and ask someone you trust to stay with you. ${safetyCheck} If danger is happening now, contact your local emergency services immediately. ${MIND_GARDEN_RESOURCE_FALLBACK_EN} I cannot provide real-time rescue, so bringing in people and emergency help nearby matters most right now.`;
		if (assessment.level === 2) return `Thank you for telling me. I will pause the rest of the conversation and focus on safety. ${safetyCheck} Please ask someone you trust to stay with you and contact a qualified local crisis or health service. If the danger becomes immediate, contact your local emergency services. I cannot replace emergency or professional help, but I can help you work out the next step for reaching support.`;
		return "It sounds like you are carrying a great deal right now. I will not rush to analyse it. Please consider letting someone you trust know what is happening and contacting a qualified local support service. I cannot replace professional help. Would it help more if I listened quietly, or if we worked out a safer plan for today?";
	}
	const support = assessment.resources.find((resource) => resource.kind === "support");
	const emergency = assessment.resources.filter((resource) => resource.kind === "emergency");
	const supportClause = support === void 0 ? MIND_GARDEN_RESOURCE_FALLBACK : `你也可以联系${support.label} ${support.value}。`;
	const emergencyClause = emergency.length === 0 ? "当地公安或医疗急救服务" : emergency.map((resource) => `${resource.label} ${resource.value}`).join("；");
	const safetyCheck = "你现在是否安全、是否已经做了伤害自己或他人的事、身边是否能接触到可能造成伤害的物品？";
	if (assessment.level >= 3) return `我很在意你刚才提到的即时危险。先暂停其他讨论，离开可能造成伤害的物品或地点，并立即联系一位可信任的人陪着你。${safetyCheck}如果危险正在发生，请立即联系${emergencyClause}。${supportClause}我不能提供实时救援，此刻最重要的是让现实中的人和紧急服务介入。`;
	if (assessment.level === 2) return `谢谢你把这件事说出来。我先暂停其他讨论，也不和你争辩。${safetyCheck}请尽快联系一位可信任的人陪着你。${supportClause}危险变得紧迫时，请联系${emergencyClause}我不能替代紧急或专业帮助，但可以陪你把联系现实支持的下一步说清楚。`;
	return `听起来你正承受很重的压力。我不会急着分析。可以先让一位你信任的人知道近况，让现实中的支持靠近一些。${supportClause}我不能替代专业帮助。此刻更需要我安静听你说，还是一起确认今天怎样更稳妥地过下去？`;
}
/**
* Render a safe replacement for blocked or unbounded assistant output.
* @param reason - whether content policy or configured buffering caused replacement.
* @param violations - matched rules when content policy caused replacement.
* @param locale - locale for the visible replacement copy.
* @returns user-visible replacement text with no unsafe output quotation.
*/
function renderMindGardenGuardReplacement(reason, violations, locale = "zh-CN") {
	if (locale === "en") {
		if (reason === "buffer-limit") return "This response exceeded the amount Mind Garden can check safely, so it was not shown. We can break the topic into a smaller part and continue carefully.";
		if (violations.includes("medication-direction")) return "I cannot advise you to stop, switch, or change the dose of medication. Please contact the prescribing clinician or a local health service; I can help you organise what you want to tell them.";
		if (violations.includes("delusion-confirmation")) return "I cannot confirm that a threat or hidden message is definitely real. We can focus on what you can verify around you and on your immediate safety. If anyone may be in danger, contact someone you trust and your local emergency services.";
		if (violations.includes("diagnosis")) return "I cannot diagnose you or assign a personality label from this conversation. I can listen to the specific experience and help you prepare questions for a qualified professional.";
		return "I want to put that more safely: I can help you think this through, but I cannot replace relationships, professional care, or emergency support in your life. Let us return to the part you most wanted understood.";
	}
	if (reason === "buffer-limit") return "这次回复超出了心智庭院能够安全检查的范围，因此没有继续显示。我们可以把刚才的话题拆小一些，再稳妥地继续。";
	if (violations.includes("medication-direction")) return "我不能建议你停药、换药或调整剂量。涉及处方和用药安全，请联系开具处方的医生或当地医疗服务；我可以帮你整理想向医生说明的感受和问题。";
	if (violations.includes("delusion-confirmation")) return "我不能确认某种威胁或暗示一定真实存在。我们可以先关注你此刻能确认的环境与安全；如果你感到自己或他人可能有危险，请尽快联系可信任的人和当地紧急服务。";
	if (violations.includes("diagnosis")) return "我不能根据这段对话给你下诊断或贴人格标签。我可以继续听你描述具体经历，也可以帮你整理需要向合格专业人士咨询的问题。";
	return "我想换一种更稳妥的说法：我可以在这里陪你梳理，但不能替代现实中的关系、专业照护或紧急支持。我们先回到你刚才最想被理解的部分。";
}
//#endregion
//#region lib/types/index.js
/**
* Deterministic input triage and pre-publication output guard for activated
* Mind Garden sessions.
* @module @deepseek-ai/dsh-mind-garden/safety
*/
/** Cordis plugin name used by Loader diagnostics. */
const name = "mind-garden-safety";
/** Services needed to resolve exact live sessions and flush safety decisions. */
const inject = [
	"agents",
	"llm",
	"mindGarden",
	"sessions"
];
/** Schemastery validation for {@link Config}. */
const Config = z.object({
	maxModelOutputTokens: z.number(),
	maxBufferedCharacters: z.number().default(524288),
	maxBufferedChunks: z.number().default(16384)
});
/** Resolve defaults and reject programmatic callers that bypass the schema. */
function resolveConfig(config) {
	const maxModelOutputTokens = config.maxModelOutputTokens;
	const maxBufferedCharacters = config.maxBufferedCharacters ?? 524288;
	const maxBufferedChunks = config.maxBufferedChunks ?? 16384;
	if (maxModelOutputTokens !== void 0 && (!Number.isSafeInteger(maxModelOutputTokens) || maxModelOutputTokens < 1)) throw new Error("mind-garden-safety: maxModelOutputTokens must be a positive safe integer");
	if (!Number.isSafeInteger(maxBufferedCharacters) || maxBufferedCharacters < 1) throw new Error("mind-garden-safety: maxBufferedCharacters must be a positive safe integer");
	if (!Number.isSafeInteger(maxBufferedChunks) || maxBufferedChunks < 1) throw new Error("mind-garden-safety: maxBufferedChunks must be a positive safe integer");
	return {
		...maxModelOutputTokens === void 0 ? {} : { maxModelOutputTokens },
		maxBufferedCharacters,
		maxBufferedChunks
	};
}
/** Find the step whose request is currently entering `llm/stream`. */
function openStep(session) {
	for (let index = session.events.length - 1; index >= 0; index -= 1) {
		const event = session.events[index];
		if (event?.type === "step/end") return void 0;
		if (event?.type === "step/start") return {
			turn: event.data.turn,
			step: event.data.step,
			startSeq: event.seq
		};
	}
}
/** Human messages entered after the current step boundary. */
function enteredHumanMessages(session, step) {
	return session.events.slice(step.startSeq + 1).flatMap((event) => event.type === "user/message" && event.data.source.kind === "user" ? [event.data] : []);
}
/** Concatenate only plain-text blocks from an entered human batch. */
function humanText(messages) {
	return messages.flatMap((message) => message.content.flatMap((block) => block.type === "text" ? [block.text] : [])).join("\n");
}
/** Last recorded assessment before the current step's idempotent append. */
function latestAssessment(events) {
	for (let index = events.length - 1; index >= 0; index -= 1) {
		const event = events[index];
		if (event?.type !== "mind-garden/safety-assessment") continue;
		return event.data;
	}
}
/** Existing idempotent assessment for a retried request in this step. */
function stepAssessment(events, step) {
	for (let index = events.length - 1; index >= 0; index -= 1) {
		const event = events[index];
		if (event?.type !== "mind-garden/safety-assessment") continue;
		if (event.data.turn === step.turn && event.data.step === step.step) return event.data;
	}
}
/** Create and append the assessment for a step's exact entered human batch. */
function assessStep(session, step, messages) {
	const existing = stepAssessment(session.events, step);
	if (existing !== void 0) return existing;
	const text = humanText(messages);
	const previous = latestAssessment(session.events)?.assessment;
	const assessment = recoverMindGardenSafetyState(assessMindGardenInput(text), previous, text);
	const data = {
		version: 1,
		turn: step.turn,
		step: step.step,
		inputMessageIds: messages.map((message) => message.id),
		assessment,
		response: assessment.level > 0 ? "local" : "model-guarded"
	};
	session.append("mind-garden/safety-assessment", data);
	return data;
}
/** Canonical successful text stream used for local and replacement responses. */
function textStream(text, usage, index = 0) {
	return [
		{
			type: "block-start",
			index,
			blockType: "text"
		},
		{
			type: "text-delta",
			index,
			text
		},
		{
			type: "block-end",
			index,
			block: {
				type: "text",
				text
			}
		},
		...usage === void 0 ? [] : [{
			type: "usage",
			usage
		}],
		{
			type: "finish",
			reason: { kind: "stop" }
		}
	];
}
function guardedDeltaText(chunk) {
	return chunk.type === "text-delta" || chunk.type === "reasoning-delta" ? chunk.text : void 0;
}
function replaceDeltaText(chunk, text) {
	if (chunk.type === "text-delta") return {
		...chunk,
		text
	};
	if (chunk.type === "reasoning-delta") return {
		...chunk,
		text
	};
	throw new TypeError("mind-garden-safety: only text and reasoning deltas can be split");
}
function inspectedText(assembler) {
	return assembler.interruptedBlocks().flatMap((block) => block.type === "text" ? [block.text] : []).join("\n");
}
function recordPublishedChunk(blocks, chunk) {
	if (chunk.type === "block-start" && (chunk.blockType === "text" || chunk.blockType === "reasoning")) {
		if (!blocks.has(chunk.index)) blocks.set(chunk.index, {
			type: chunk.blockType,
			text: "",
			closed: false
		});
		return;
	}
	if (chunk.type === "text-delta" || chunk.type === "reasoning-delta") {
		const type = chunk.type === "text-delta" ? "text" : "reasoning";
		const block = blocks.get(chunk.index) ?? {
			type,
			text: "",
			closed: false
		};
		block.text += chunk.text;
		blocks.set(chunk.index, block);
		return;
	}
	if (chunk.type === "block-end" && (chunk.block.type === "text" || chunk.block.type === "reasoning")) blocks.set(chunk.index, {
		type: chunk.block.type,
		text: chunk.block.text,
		closed: true
	});
}
function publishablePrefix(pending, pendingGuardedCharacters) {
	const chunks = [];
	let guardedCharacters = pendingGuardedCharacters;
	let releasable = Math.max(0, guardedCharacters - 64);
	while (pending.length > 0) {
		const chunk = pending[0];
		if (chunk === void 0) break;
		const text = guardedDeltaText(chunk);
		if (text !== void 0) {
			if (releasable === 0) break;
			const count = Math.min(text.length, releasable);
			const released = text.slice(0, count);
			const retained = text.slice(count);
			chunks.push(replaceDeltaText(chunk, released));
			guardedCharacters -= count;
			releasable -= count;
			if (retained.length === 0) pending.shift();
			else pending[0] = replaceDeltaText(chunk, retained);
			continue;
		}
		if (chunk.type === "tool-call-delta" || chunk.type === "block-start" && chunk.blockType === "tool-call") break;
		if (chunk.type === "block-start" && releasable === 0) break;
		chunks.push(chunk);
		pending.shift();
	}
	return {
		chunks,
		pendingGuardedCharacters: guardedCharacters
	};
}
/** Append and flush the audit event before publishing its replacement chunks. */
async function recordOutputGuard(ctx, agent, step, reason, violations) {
	agent.session.append("mind-garden/output-guarded", {
		version: 1,
		turn: step.turn,
		step: step.step,
		reason,
		violations
	});
	await ctx.sessions.flush(agent.session);
}
/**
* Inspect one downstream stream while retaining a policy-sized suffix. Safe
* prefixes preserve provider chunk timing; a violation discards the private
* suffix, closes published blocks, and appends a deterministic replacement.
*/
function guardedModelStream(ctx, agent, step, assessment, next, config, signal) {
	return (async function* () {
		const pending = [];
		const assembler = new BlockAssembler();
		const publishedBlocks = /* @__PURE__ */ new Map();
		let pendingGuardedCharacters = 0;
		let characters = 0;
		let chunkCount = 0;
		let maxIndex = -1;
		let usage;
		let guardReason;
		let guardViolations = [];
		for await (const chunk of next()) {
			signal?.throwIfAborted();
			assembler.push(chunk);
			pending.push(chunk);
			const deltaText = guardedDeltaText(chunk);
			if (deltaText !== void 0) pendingGuardedCharacters += deltaText.length;
			if ("index" in chunk) maxIndex = Math.max(maxIndex, chunk.index);
			if (chunk.type === "usage") usage = chunk.usage;
			chunkCount += 1;
			characters += JSON.stringify(chunk).length;
			if (chunkCount > config.maxBufferedChunks || characters > config.maxBufferedCharacters) {
				guardReason = "buffer-limit";
				break;
			}
			const violations = assessMindGardenOutput(inspectedText(assembler), assessment);
			if (violations.length > 0) {
				guardReason = "policy-violation";
				guardViolations = violations;
				break;
			}
			const publishable = publishablePrefix(pending, pendingGuardedCharacters);
			pendingGuardedCharacters = publishable.pendingGuardedCharacters;
			for (const released of publishable.chunks) {
				recordPublishedChunk(publishedBlocks, released);
				yield released;
			}
		}
		signal?.throwIfAborted();
		if (guardReason !== void 0) {
			await recordOutputGuard(ctx, agent, step, guardReason, guardViolations);
			signal?.throwIfAborted();
			for (const [index, block] of publishedBlocks) {
				if (block.closed) continue;
				yield {
					type: "block-end",
					index,
					block: {
						type: block.type,
						text: block.text
					}
				};
			}
			yield* textStream(renderMindGardenGuardReplacement(guardReason, guardViolations, assessment?.locale), usage, maxIndex + 1);
			return;
		}
		for (const chunk of pending) {
			recordPublishedChunk(publishedBlocks, chunk);
			yield chunk;
		}
	})();
}
/**
* Install deterministic safety routing. Elevated entered-human input is
* answered locally without constructing the downstream model stream. Ordinary
* responses stream after a bounded private suffix passes policy checks.
* @param ctx - plugin context carrying live Agent, Session, LLM, and Mind Garden services.
* @param config - incremental inspection limits.
*/
function apply(ctx, config) {
	const resolved = resolveConfig(config);
	ctx.on("agent/pre-step", async ({ agent, messages, signal }, next) => {
		if (ctx.mindGarden.current(agent.session) === null || signal.aborted) return next();
		const humanMessages = messages.filter((message) => message.source.kind === "user");
		if (humanMessages.length === 0) return next();
		const text = humanText(humanMessages);
		const previous = latestAssessment(agent.session.events)?.assessment;
		if (recoverMindGardenSafetyState(assessMindGardenInput(text), previous, text).level > 0) return {
			kind: "enter",
			messages
		};
		return next();
	}, { prepend: true });
	ctx.on("agent/request", async ({ agent }, next) => {
		const request = await next();
		if (ctx.mindGarden.current(agent.session) === null) return request;
		if (resolved.maxModelOutputTokens === void 0) return request;
		const maxTokens = request.maxTokens === void 0 ? resolved.maxModelOutputTokens : Math.min(request.maxTokens, resolved.maxModelOutputTokens);
		return request.maxTokens === maxTokens ? request : {
			...request,
			maxTokens
		};
	});
	ctx.on("llm/stream", (options, next) => {
		if (!isAgentLoopRequest(options) || options.sessionId === void 0) return next();
		const agent = ctx.agents.get(options.sessionId);
		if (agent === void 0 || ctx.mindGarden.current(agent.session) === null) return next();
		const step = openStep(agent.session);
		if (step === void 0) return next();
		return (async function* () {
			const messages = enteredHumanMessages(agent.session, step);
			const assessmentEvent = messages.length === 0 ? stepAssessment(agent.session.events, step) : assessStep(agent.session, step, messages);
			if (assessmentEvent !== void 0) await ctx.sessions.flush(agent.session);
			options.signal?.throwIfAborted();
			if (assessmentEvent !== void 0 && assessmentEvent.assessment.level > 0) {
				yield* textStream(renderMindGardenSupportResponse(assessmentEvent.assessment));
				return;
			}
			yield* guardedModelStream(ctx, agent, step, assessmentEvent?.assessment, next, resolved, options.signal);
		})();
	});
}
//#endregion
export { Config, MIND_GARDEN_RESOURCE_FALLBACK, MIND_GARDEN_RESOURCE_FALLBACK_EN, apply, assessMindGardenInput, assessMindGardenOutput, detectMindGardenSafetyLocale, inject, mindGardenSafetyResources, name, normalizeMindGardenSafetyText, recoverMindGardenSafetyState, renderMindGardenGuardReplacement, renderMindGardenSupportResponse };
