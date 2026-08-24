import { foldMindGarden } from "@deepseek-ai/dsh-mind-garden/core";
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
//#region lib/types/invariant.js
/** Package-owned safety-event invariants. @module @deepseek-ai/dsh-mind-garden/safety/invariant */
const PACKAGE_NAME = "@deepseek-ai/dsh-mind-garden/safety";
const OUTPUT_VIOLATIONS = new Set([
	"exclusive-dependence",
	"diagnosis",
	"medication-direction",
	"forced-life-decision",
	"trauma-exposure",
	"delusion-confirmation",
	"user-blame",
	"risk-deflection"
]);
/** Cordis companion plugin name. */
const name = "mind-garden-safety-invariant";
/** Service required before the companion can reserve package ownership. */
const inject = ["invariants"];
/** Resolve the open step at one precommit history boundary. */
function openStep(history) {
	for (let index = history.length - 1; index >= 0; index -= 1) {
		const event = history[index];
		if (event?.type === "step/end") return void 0;
		if (event?.type === "step/start") return {
			turn: event.data.turn,
			step: event.data.step,
			startSeq: event.seq
		};
	}
}
/** Extract the human messages owned by one open step. */
function enteredHumanMessages(history, step) {
	return history.slice(step.startSeq + 1).flatMap((event) => event.type === "user/message" && event.data.source.kind === "user" ? [event.data] : []);
}
/** Join the same text blocks the runtime classifier consumes. */
function humanText(messages) {
	return messages.flatMap((message) => message.content.flatMap((block) => block.type === "text" ? [block.text] : [])).join("\n");
}
/** Find the prior assessment record at one history boundary. */
function previousAssessment(history) {
	for (let index = history.length - 1; index >= 0; index -= 1) {
		const event = history[index];
		if (event?.type === "mind-garden/safety-assessment") return event.data;
	}
}
/** Compare lossless JSON values whose creation order is fixed by this package. */
function sameJson(left, right) {
	return JSON.stringify(left) === JSON.stringify(right);
}
/** Validate an assessment against exact entered messages and prior state. */
function validateAssessment(history, data, fail) {
	if (foldMindGarden(history) === null) fail("Mind Garden safety assessment requires an activated session");
	const step = openStep(history);
	if (step === void 0 || step.turn !== data.turn || step.step !== data.step) fail("Mind Garden safety assessment must belong to the open step");
	const messages = enteredHumanMessages(history, step);
	if (messages.length === 0 || !sameJson(messages.map((message) => message.id), data.inputMessageIds)) fail("Mind Garden safety assessment must cite the exact entered human messages");
	const text = humanText(messages);
	const expected = recoverMindGardenSafetyState(assessMindGardenInput(text), previousAssessment(history)?.assessment, text);
	if (data.version !== 1 || !sameJson(data.assessment, expected)) fail("Mind Garden safety assessment must equal the deterministic classifier result");
	const response = data.assessment.level > 0 ? "local" : "model-guarded";
	if (data.response !== response) fail("Mind Garden safety response route must match its intervention level");
}
/** Validate structural ownership of one output-guard record. */
function validateOutputGuard(history, event, fail) {
	if (foldMindGarden(history) === null) fail("Mind Garden output guard requires an activated session");
	const step = openStep(history);
	if (step === void 0 || step.turn !== event.data.turn || step.step !== event.data.step) fail("Mind Garden output guard must belong to the open step");
	const assessment = previousAssessment(history);
	if (assessment === void 0 || assessment.turn !== step.turn || assessment.response !== "model-guarded") fail("Mind Garden output guard requires the current turn to have a model-guarded assessment");
	const version = event.data.version;
	const reason = event.data.reason;
	const violations = event.data.violations;
	if (version !== 1 || reason !== "policy-violation" && reason !== "buffer-limit" || reason === "policy-violation" && violations.length === 0 || reason === "buffer-limit" && violations.length !== 0 || new Set(violations).size !== violations.length || violations.some((violation) => typeof violation !== "string" || !OUTPUT_VIOLATIONS.has(violation))) fail("Mind Garden output guard must carry a valid reason and violation set");
}
/** Validate all package-owned records in one session. */
function validateSession(session, fail) {
	for (const [index, event] of session.events.entries()) {
		const history = session.events.slice(0, index);
		if (event.type === "mind-garden/safety-assessment") validateAssessment(history, event.data, fail);
		if (event.type === "mind-garden/output-guarded") validateOutputGuard(history, event, fail);
	}
}
/** Install loaded-session and precommit validation. */
const install = Object.assign((ctx, fail) => {
	for (const session of ctx.sessions.list()) validateSession(session, fail);
	ctx.on("session/created", (session) => {
		validateSession(session, fail);
	}, { global: true });
	ctx.on("internal/dispatch", (_mode, eventName, args) => {
		if (eventName !== "session/event") return;
		const [session, event] = args;
		if (event.type === "mind-garden/safety-assessment") validateAssessment(session.events, event.data, fail);
		if (event.type === "mind-garden/output-guarded") validateOutputGuard(session.events, event, fail);
	}, { global: true });
}, { inject: ["sessions"] });
/** Register the invariant installer. */
const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
//#endregion
export { apply, inject, name };
