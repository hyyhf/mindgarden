# Mind Garden improvement execution plan

Date: 2026-08-25
Status: in progress
Scope: Mind Garden production packages in DeepSeek Harness, projected into the standalone `@deepseek-ai/dsh-mind-garden` release repository

## Objective

Move Mind Garden from a feature-rich reflection plugin toward a dependable companion Agent without weakening any of its nine spaces, user-governed records, Photo Story particle and ripple experience, Constellation 3D experience, backup and recovery flows, or explicit handoff to the resident Harness conversation.

The work must preserve Mind Garden as an installable DeepSeek Harness plugin. Mind Garden-owned packages, bundle fixtures, and integration tests inside the Harness checkout are the production source of record; the standalone repository is a deterministic release projection. The work may use documented Cordis services, events, Remotes, client slots, providers, and package exports, but it must not modify unrelated Harness framework source, fork the Harness conversation loop, create a second composer, or take ownership of Harness models, Sessions, credentials, attachments, or storage providers.

## 本轮执行状态

本文件是持续更新的真实执行清单：`[x]` 代表已经实现并通过对应测试，`[ ]` 代表仍需后续完成，不把“已经开始”写成“已经完成”。当前批次已经完成安全与信任阻断项、首次授权、记忆删除与防复活、照片故事并发隔离、照片故事/星图语言约束、星图数据披露，以及第一轮移动端和无障碍加固。对话策略现已明确让当前消息和显式纠正压过历史材料，并优先呈现同等授权条件下的 `support-preference` 记忆。照片故事与星图观察台的关键正文、输入与操作字号已提高，Unicode 伪图标已替换为现有图标体系。照片粒子、水波纹、原图回退、功能栏、九个空间、星图 WebGL 与 Harness 唯一对话输入框均保留。

权威工作流已经重建：Harness 正式 `ui-mind-garden` 与十个 Host 插件目录承载生产源码，独立仓库通过 `sync-from-harness.mjs` 做确定性包名投影，并以只读门禁阻止源码漂移。重复的 QA 包不会进入同步、构建、截图或发行路径；其获批准图片已完整进入正式生产包并受哈希防删测试保护。独立插件根入口通过标准 Cordis Loader 与聚合 Typert face 接入 Harness，客户端注册使用同一个发行根包身份。当前 npm 发布包已经收窄到 216 个文件，压缩后约 3.36 MB、解包约 8.5 MB；它已在空目录完成安装，47 个公开导出均可解析，12 个 Host face 已实际导入。桌面与 390 × 844 手机端各 18 张生产 UI 交互图已从隔离 Harness 重新录制并抽检。另一个全新 Session 已完成 `deepseek-v4-flash` 陪伴对话与 `deepseek-v4-flash-vision-exp` 照片观察的真实在线旅程，并保存对话、问题落地、粒子重构、已验证原图、星图仪式和手机端结果图；测试同时断言了持久事件中的提供方与模型来源。

## Non-negotiable boundaries

- Modify only Mind Garden-owned package, bundle, test, and release-projection paths; leave unrelated Harness framework source unchanged.
- Keep all nine existing spaces and their current records and actions.
- Keep Photo Story particles, verified original-image fallback, ripple/cinematic interaction, and its existing control bar.
- Keep Constellation WebGL, semantic node list, correction flow, evidence provenance, and reduced-motion fallback.
- Keep the ordinary Harness composer as the only conversation composer. Garden records may populate it only after an explicit user action.
- Keep model-visible material logged and reconstructable through plugin-owned events.
- Keep unconfirmed model output distinguishable from user-confirmed facts.
- Do not promise no-trace or physical attachment erasure that the configured Harness providers cannot guarantee.
- Do not introduce a parallel tenant platform, notification system, hidden relationship score, or plugin-level skill router without product evidence.

## Phase 0 — source and release authority

- [x] Establish `packages/mind-garden/*` and `packages/client/ui-mind-garden` in Harness as the production source authority.
- [x] Keep `hyyhf/mindgarden` as the only GitHub push and standalone installation target.
- [x] Leave unrelated DeepSeek Harness framework source unchanged.
- [x] Add deterministic Harness-to-standalone source sync and a read-only drift gate.
- [x] Remove duplicated QA-source authority from sync, build, screenshot, and release paths; preserve its approved resources in the production package.
- [x] Add a reproducible runtime dependency lock and frozen root install path.
- [x] Build source, run package tests, and rebuild committed runtime artifacts from the canonical standalone tree.
- [ ] Make the standalone development checkout self-contained for source typecheck and browser rebundling instead of borrowing Harness workspace build presets in the isolated verification tree.
- [ ] Add a CI artifact-drift gate that rebuilds in a clean checkout and fails when committed output changes.
- [x] Pack and install the produced tarball in a clean smoke environment.
- [x] Narrow the npm file set so source tests, build configs, and repository-only demo assets do not inflate the installable plugin.
- [ ] Protect `main` with required checks as a repository-setting follow-up.

Acceptance:

- One source tree determines the published UI and the browser E2E result.
- A clean checkout can reproduce the package without relying on uncommitted Harness files.
- Every public export resolves from the packed artifact.

## Phase 1 — safety and trust blockers

### Crisis input

- [x] Replace whole-message benign and negation early returns with clause-local evaluation.
- [x] Make the highest-risk clause win across contrastive and mixed-language text.
- [x] Add must-pass Chinese and English cases for negation followed by immediate danger.
- [x] Keep deterministic output guarding and complete pre-publication buffering intact.

### Locale and support resources

- [x] Return English local safety responses for English input instead of Chinese-only copy.
- [x] Do not present mainland-China phone numbers as globally applicable resources.
- [x] Document the supported region and safe generic fallback for other regions.

### Activation consent

- [x] Separate the durable-storage/model disclosure confirmation from the Serenity/Clarity choice.
- [x] Raise disclosure copy and touch targets to readable, mobile-safe sizes.
- [x] Retain the existing contract version and add an explicit acceptance timestamp and locale where the durable event format permits it.
- [x] Do not advertise a session-only mode until Session and attachment providers can truthfully provide it.

### Memory deletion

- [x] Stop describing primary-record removal as universal or physical erasure.
- [x] Remove or redact known extraction-run copies associated with a deleted memory.
- [x] Bound extraction-run retention by count and/or age.
- [x] Add deletion-integrity and backup/restore non-revival tests.
- [x] Return a deletion receipt that distinguishes recalled memory, plugin audit data, Session history, attachments, and provider-controlled copies.

Acceptance:

- Mixed-clause imminent-risk cases never enter the ordinary model path.
- English safety intervention is readable and geographically honest.
- Activation requires a dedicated, legible confirmation action.
- Deleted content cannot be recalled or silently restored, and the UI states the remaining provider boundaries accurately.

## Phase 2 — companion continuity and repair

- [ ] Let ordinary dialogue consume only explicitly authorized, relevant Reflection material under strict count and byte budgets.
- [ ] Log the exact context plan before it enters a model request.
- [ ] Show a compact “used this turn” explanation with per-source temporary exclusion.
- [x] Give the current message and explicit corrections priority over historical material.
- [x] Reuse governed `support-preference` memory for “listen instead of advise” repairs.
- [ ] Add explicit correction actions such as “this is not me” and “do not give advice this time”.
- [ ] Add multi-turn behavior fixtures for listening, correction, conflicting memory, dependency language, and context refusal.

Acceptance:

- Authorized garden material can improve the resident conversation without automatic record sending.
- A user can inspect and override every historical source used in a turn.
- A correction changes the current response immediately and becomes durable only after confirmation.

## Phase 3 — performance and concurrency

- [ ] Lazy-load each space; load Constellation, Photo Story, and Three.js only on entry or deliberate prefetch.
- [ ] Move large generated images out of the synchronous client module into cacheable, space-owned assets.
- [x] Stop refreshing Constellation and unrelated Reflection projections on every space change.
- [ ] Split pending and error state by operation and cancel or ignore stale requests.
- [x] Partition Photo Story model operations by story/session while retaining a global rate limit.
- [ ] Add attachment failure reconciliation and truthful physical-retention reporting.
- [x] Bound browser image caches and release inactive Base64/data URLs.
- [ ] Measure cold-load bytes, first usable render, WebGL memory, and 1k/10k memory-recall preparation before setting budgets.
- [ ] Keep the output guard; add a calm safety-checking wait state rather than exposing unsafe partial model output.

Acceptance:

- Opening ordinary Mind Garden surfaces does not download or initialize either WebGL world.
- Hidden or unmounted scenes do not render or retain GPU resources.
- One Photo Story request does not block an unrelated story.
- Mobile browsing does not retain every previously visited full-resolution story image.

## Phase 4 — responsive UI, accessibility, and language quality

- [x] Make first-run disclosure and settings true mobile sheets with focus containment and return.
- [x] Reserve the live Harness composer height and safe area so it cannot cover garden content or controls.
- [x] Preserve the five-region/two-level navigation; improve narrow-screen overflow cues without hiding any space.
- [ ] Use 16px mobile inputs, 14–16px body/critical copy, and reserve 10–11px for non-essential metadata.
- [x] Bring frequent touch targets toward 44px while retaining compact desktop density.
- [x] Complete Photo Story tab semantics and keyboard behavior.
- [x] React to runtime operating-system reduced-motion changes in Constellation.
- [x] Pass output language explicitly to Photo Story and Constellation model contracts.
- [x] Distinguish the Constellation self-description profile sent on every draw from separately authorized historical sources.
- [ ] Localize displayed civil dates with `Intl` while retaining canonical stored dates.
- [x] Replace Photo Story's generic failures with operation-specific load, upload, save, observation, route, dialogue, and deletion recovery copy.
- [ ] Extend operation-specific recovery and no-duplicate-write guidance to the remaining record spaces.
- [ ] Collapse technical Think/Skill traces by default through an available Harness presentation seam; retain an explicit audit view.

Acceptance:

- Desktop and 390 × 844 mobile flows remain fully usable at 100% and 200% zoom.
- Keyboard-only users can enter, operate, and leave every dialog, tab set, and immersive scene.
- Chinese UI model-generated controls and observations remain Chinese; English remains English.
- Photo Story and Constellation keep their distinct cinematic worlds without leaking their heavy rendering cost into routine spaces.

## Phase 5 — visual-system consolidation

- [x] Preserve the warm New Chinese daily world and the bounded dark Photo Story/Constellation ritual worlds.
- [ ] Consolidate late CSS overrides into tokens and explicit component variants with visual regression coverage.
- [x] Keep Noto Sans SC for body/UI and the existing restrained serif display voice.
- [x] Remove the identified unexplained divider lines, optical icon misalignment, fragile mobile overlays, and redundant header/container patterns without removing approved controls.
- [ ] Keep semantic color, focus, error, permission, and destructive states consistent across all worlds.
- [x] Protect every approved shipping raster and display font against silent deletion or replacement while still allowing versioned additions.

Acceptance:

- No page returns to the repeated “large title, long explanation, large container, secondary explanation, record list” template.
- No decorative line appears without semantic purpose.
- Icon, label, and control baselines remain aligned across desktop and mobile.
- Visual regression confirms that no feature, particle control, original-image view, ripple effect, 3D node, record action, or recovery state disappeared.

## Phase 6 — verification and release gates

- [x] Run package unit/service tests and focused adversarial safety tests.
- [x] Run source typecheck/build across all Mind Garden projects and rebuild the committed browser/service output.
- [ ] Add the deterministic clean-checkout artifact-drift check to repository CI.
- [x] Run clean tarball install, resolve all 47 public exports, and import all 12 Host faces.
- [x] Run real Harness integration externally against the unmodified Harness checkout.
- [x] Capture 18 desktop and 18 mobile screenshots from the canonical production UI, not a manually maintained fork.
- [x] Complete live provider runs with `deepseek-v4-flash` and `deepseek-v4-flash-vision-exp`, then capture the resulting conversation, photo observation, particle reconstruction, original-image view, and star ritual.
- [ ] Run keyboard, axe, 200% zoom, reduced-motion, no-WebGL, slow-network, and failure-path checks.
- [x] Run the Impeccable detector once after UI edits, then fix actionable source findings.
- [x] Run one bounded visual inspection round for desktop and mobile, one batched fix, and one confirmation round.

## Execution order for this change set

1. Safety mixed-clause handling and localized fallback.
2. Activation consent and critical disclosure readability.
3. Memory deletion truth and extraction-run retention.
4. Photo Story output language and Constellation data-use disclosure.
5. Mobile composer reservation, sheets, touch targets, tabs, and reduced-motion updates.
6. Space/WebGL/asset lazy loading and request scoping.
7. Dialogue Reflection context plan and repair behavior.
8. Release CI, pack smoke, artifact drift, browser verification, and screenshot refresh.

Items may land in smaller commits, but the acceptance criteria above remain release gates. A later item may not weaken an earlier safety, privacy, or user-authority guarantee.
