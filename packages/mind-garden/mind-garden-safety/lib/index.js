import z from "@deepseek-ai/schemastery";
import { isAgentLoopRequest } from "@deepseek-ai/dsh-llm";
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
	if (clause.includes("不想活在") || matches(NEGATED_RISK_PATTERNS, clause) || matches(BENIGN_CONTEXT_PATTERNS, clause)) return result(0, "ordinary", [], 0, locale);
	if (matches(URGENT_PATTERNS, clause)) return result(3, "urgent", ["immediate-danger"], 0, locale);
	if (matches(SUBSTANCE_DANGER_PATTERNS, clause)) return result(3, "substance-emergency", ["overdose-or-withdrawal"], 0, locale);
	if (matches(ABUSE_DANGER_PATTERNS, clause)) return result(2, "abuse-danger", ["abuse-or-child-safety"], 0, locale);
	if (matches(REALITY_OR_SLEEP_PATTERNS, clause)) return result(2, "reality-or-sleep-danger", ["mania-or-psychosis-danger"], 0, locale);
	if (matches(HIGH_RISK_PATTERNS, clause)) return result(2, "high-risk", ["self-or-other-harm"], 0, locale);
	if (matches(VULNERABLE_PATTERNS, clause)) return result(1, "vulnerable", ["severe-distress"], 0, locale);
	return result(0, "ordinary", [], 0, locale);
}
/** Infer the deterministic safety-copy locale from the entered text. */
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
//#endregion
//#region lib/types/output-guard.js
/** Pure local response rendering and assistant-output policy checks. */
const OUTPUT_RULES = [
	["exclusive-dependence", /只有我.{0,6}(?:懂你|能理解你|会陪你)|你只需要我|不要再找(?:朋友|家人|咨询师|医生)|如果你离开我|\bonly i (?:understand|can help) you\b/iu],
	["diagnosis", /你(?:一定|就是|显然)?患有.{0,12}(?:症|障碍)|你就是.{0,10}(?:人格|型的人)|(?:你|这)(?:一定|就是|显然|典型地).{0,8}(?:抑郁症|焦虑症|双相|躁郁|精神分裂|人格障碍|创伤后应激)|\byou (?:definitely|clearly) have (?:depression|bipolar disorder|schizophrenia|a personality disorder)\b/iu],
	["medication-direction", /(?:停掉|停止|加量|减量|换掉).{0,8}(?:药|服药|处方)|\b(?:stop|increase|decrease|double) (?:your )?(?:medication|dose|prescription)\b/iu],
	["forced-life-decision", /你必须(?:立刻)?(?:辞职|离婚|分手|断绝关系)/iu],
	["trauma-exposure", /我来(?:治疗|治好)你|这是给你的治疗计划|(?:跟着我|闭上眼).{0,12}(?:重新经历|回到创伤|想起每个细节)/iu],
	["delusion-confirmation", /(?:他们确实|这证明).{0,10}(?:监视你|控制你思想|在传递暗号)|\b(?:they really are|this proves they are) (?:watching|monitoring|controlling) you\b/iu],
	["user-blame", /都是因为你(?:想太多|认知有问题|不够努力)/iu]
];
/**
* Return every deterministic output rule matched by complete assistant text.
* @param text - complete buffered text and reasoning output.
* @param assessment - effective input assessment for this step.
* @returns unique stable violations in policy order.
*/
function assessMindGardenOutput(text, assessment) {
	const violations = OUTPUT_RULES.flatMap(([kind, pattern]) => pattern.test(text) ? [kind] : []);
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
	maxModelOutputTokens: z.number().default(4096),
	maxBufferedCharacters: z.number().default(524288),
	maxBufferedChunks: z.number().default(16384)
});
/** Resolve defaults and reject programmatic callers that bypass the schema. */
function resolveConfig(config) {
	const maxModelOutputTokens = config.maxModelOutputTokens ?? 4096;
	const maxBufferedCharacters = config.maxBufferedCharacters ?? 524288;
	const maxBufferedChunks = config.maxBufferedChunks ?? 16384;
	if (!Number.isSafeInteger(maxModelOutputTokens) || maxModelOutputTokens < 1) throw new Error("mind-garden-safety: maxModelOutputTokens must be a positive safe integer");
	if (!Number.isSafeInteger(maxBufferedCharacters) || maxBufferedCharacters < 1) throw new Error("mind-garden-safety: maxBufferedCharacters must be a positive safe integer");
	if (!Number.isSafeInteger(maxBufferedChunks) || maxBufferedChunks < 1) throw new Error("mind-garden-safety: maxBufferedChunks must be a positive safe integer");
	return {
		maxModelOutputTokens,
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
function textStream(text, usage) {
	return [
		{
			type: "block-start",
			index: 0,
			blockType: "text"
		},
		{
			type: "text-delta",
			index: 0,
			text
		},
		{
			type: "block-end",
			index: 0,
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
/** Extract complete text/reasoning blocks and the provider's last usage record. */
function bufferedResult(chunks) {
	const text = chunks.flatMap((chunk) => chunk.type === "block-end" && (chunk.block.type === "text" || chunk.block.type === "reasoning") ? [chunk.block.text] : []).join("\n");
	let usage;
	for (const chunk of chunks) if (chunk.type === "usage") usage = chunk.usage;
	return {
		text,
		...usage === void 0 ? {} : { usage }
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
* Buffer one downstream stream, then publish either the original chunks or a
* deterministic replacement. Downstream construction stays after the caller's
* safety-assessment flush.
*/
function guardedModelStream(ctx, agent, step, assessment, next, config, signal) {
	return (async function* () {
		const chunks = [];
		let characters = 0;
		let limitExceeded = false;
		for await (const chunk of next()) {
			signal?.throwIfAborted();
			chunks.push(chunk);
			characters += JSON.stringify(chunk).length;
			if (chunks.length > config.maxBufferedChunks || characters > config.maxBufferedCharacters) {
				limitExceeded = true;
				break;
			}
		}
		signal?.throwIfAborted();
		const buffered = bufferedResult(chunks);
		const violations = limitExceeded ? [] : assessMindGardenOutput(buffered.text, assessment);
		if (limitExceeded || violations.length > 0) {
			const reason = limitExceeded ? "buffer-limit" : "policy-violation";
			await recordOutputGuard(ctx, agent, step, reason, violations);
			signal?.throwIfAborted();
			yield* textStream(renderMindGardenGuardReplacement(reason, violations, assessment?.locale), buffered.usage);
			return;
		}
		yield* chunks;
	})();
}
/**
* Install deterministic safety routing. Elevated entered-human input is
* answered locally without constructing the downstream model stream. Ordinary
* responses remain buffered until the complete output passes policy checks.
* @param ctx - plugin context carrying live Agent, Session, LLM, and Mind Garden services.
* @param config - pre-publication buffering limits.
*/
function apply(ctx, config) {
	const resolved = resolveConfig(config);
	ctx.on("agent/request", async ({ agent }, next) => {
		const request = await next();
		if (ctx.mindGarden.current(agent.session) === null) return request;
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
