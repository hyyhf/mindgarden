window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-mind-garden",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react_dom = require("react-dom");
		let _deepseek_ai_dsh_client_runtime_client = require("@deepseek-ai/dsh-client-runtime/client");
		//#region lib/types/client/GardenIcons.js
		function IconFrame({ size = 18, className, children }) {
			return (0, react_jsx_runtime.jsx)("svg", {
				width: size,
				height: size,
				className,
				viewBox: "0 0 20 20",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.45",
				strokeLinecap: "round",
				strokeLinejoin: "round",
				"aria-hidden": "true",
				children
			});
		}
		const GardenMarkIcon = (props) => (0, react_jsx_runtime.jsxs)(IconFrame, {
			...props,
			children: [(0, react_jsx_runtime.jsx)("rect", {
				x: "2.5",
				y: "2.5",
				width: "15",
				height: "15",
				rx: "3"
			}), (0, react_jsx_runtime.jsx)("path", { d: "M10 16V8.6M10 11.2c-2.9-.2-4.5-1.7-4.7-4.4 2.9-.2 4.5 1.3 4.7 4.4ZM10 9.5c.2-2.7 1.8-4.1 4.6-4 .1 2.6-1.5 4-4.6 4Z" })]
		});
		const TodayIcon = (props) => (0, react_jsx_runtime.jsxs)(IconFrame, {
			...props,
			children: [(0, react_jsx_runtime.jsx)("circle", {
				cx: "10",
				cy: "10",
				r: "3.1"
			}), (0, react_jsx_runtime.jsx)("path", { d: "M10 2v2M10 16v2M2 10h2M16 10h2M4.35 4.35l1.4 1.4M14.25 14.25l1.4 1.4M15.65 4.35l-1.4 1.4M5.75 14.25l-1.4 1.4" })]
		});
		const ConcernsIcon = (props) => (0, react_jsx_runtime.jsxs)(IconFrame, {
			...props,
			children: [(0, react_jsx_runtime.jsx)("path", { d: "M10 16.7 4.2 11.3C1.2 8.5 3 3.5 6.7 3.5c1.5 0 2.6.8 3.3 2 .7-1.2 1.8-2 3.3-2 3.7 0 5.5 5 2.5 7.8L10 16.7Z" }), (0, react_jsx_runtime.jsx)("path", { d: "M7.5 9.2h5" })]
		});
		const CalendarIcon = (props) => (0, react_jsx_runtime.jsxs)(IconFrame, {
			...props,
			children: [(0, react_jsx_runtime.jsx)("rect", {
				x: "3",
				y: "4.3",
				width: "14",
				height: "12.7",
				rx: "2.2"
			}), (0, react_jsx_runtime.jsx)("path", { d: "M6.2 2.5v3.3M13.8 2.5v3.3M3 8h14M6.4 11h2M11.6 11h2M6.4 14h2" })]
		});
		const PhotoStoryIcon = (props) => (0, react_jsx_runtime.jsxs)(IconFrame, {
			...props,
			children: [
				(0, react_jsx_runtime.jsx)("rect", {
					x: "2.8",
					y: "3.2",
					width: "14.4",
					height: "13.6",
					rx: "2.2"
				}),
				(0, react_jsx_runtime.jsx)("circle", {
					cx: "7",
					cy: "7.4",
					r: "1.3"
				}),
				(0, react_jsx_runtime.jsx)("path", { d: "m4.5 14 3.1-3.2 2.2 2.1 2.1-2.4 3.6 3.5" })
			]
		});
		const MemoryIcon = (props) => (0, react_jsx_runtime.jsxs)(IconFrame, {
			...props,
			children: [(0, react_jsx_runtime.jsx)("path", { d: "M4.2 5.2c0-1.4 2.6-2.5 5.8-2.5s5.8 1.1 5.8 2.5-2.6 2.5-5.8 2.5-5.8-1.1-5.8-2.5Z" }), (0, react_jsx_runtime.jsx)("path", { d: "M4.2 5.2v4.8c0 1.4 2.6 2.5 5.8 2.5s5.8-1.1 5.8-2.5V5.2M4.2 10v4.8c0 1.4 2.6 2.5 5.8 2.5s5.8-1.1 5.8-2.5V10" })]
		});
		const GrowthIcon = (props) => (0, react_jsx_runtime.jsx)(IconFrame, {
			...props,
			children: (0, react_jsx_runtime.jsx)("path", { d: "M10 17V9.3M10 11.2c-3.7-.1-5.9-2-6.2-5.5 3.7-.2 5.9 1.7 6.2 5.5ZM10 8.7c.3-3.5 2.5-5.3 6.2-5.1.2 3.4-2 5.1-6.2 5.1Z" })
		});
		const StarMapIcon = (props) => (0, react_jsx_runtime.jsxs)(IconFrame, {
			...props,
			children: [(0, react_jsx_runtime.jsx)("path", { d: "m10 2.3 1.2 5.2L16.6 10l-5.4 2.5L10 17.7l-1.2-5.2L3.4 10l5.4-2.5L10 2.3Z" }), (0, react_jsx_runtime.jsx)("path", { d: "M2.8 5.7h1.8M15.4 14.3h1.8" })]
		});
		const LifeReviewIcon = (props) => (0, react_jsx_runtime.jsxs)(IconFrame, {
			...props,
			children: [(0, react_jsx_runtime.jsx)("path", { d: "M5 2.8h10M5 17.2h10M6 2.8c0 3 1.3 4.8 4 7.2-2.7 2.4-4 4.2-4 7.2M14 2.8c0 3-1.3 4.8-4 7.2 2.7 2.4 4 4.2 4 7.2" }), (0, react_jsx_runtime.jsx)("path", { d: "M7.4 15.3h5.2" })]
		});
		const PhilosophyIcon = (props) => (0, react_jsx_runtime.jsxs)(IconFrame, {
			...props,
			children: [(0, react_jsx_runtime.jsx)("path", { d: "M6.1 11.9A6 6 0 1 1 13.9 12c-1.1.8-1.5 1.6-1.6 2.3H7.7c-.1-.8-.5-1.6-1.6-2.4Z" }), (0, react_jsx_runtime.jsx)("path", { d: "M7.8 17h4.4M8 7.7l1.5 1.5 2.8-3" })]
		});
		const PrivateIcon = (props) => (0, react_jsx_runtime.jsxs)(IconFrame, {
			...props,
			children: [(0, react_jsx_runtime.jsx)("rect", {
				x: "4.2",
				y: "8.5",
				width: "11.6",
				height: "8.7",
				rx: "2"
			}), (0, react_jsx_runtime.jsx)("path", { d: "M6.7 8.5V6.3a3.3 3.3 0 0 1 6.6 0v2.2M10 12v1.8" })]
		});
		const CheckinIcon = (props) => (0, react_jsx_runtime.jsxs)(IconFrame, {
			...props,
			children: [
				(0, react_jsx_runtime.jsx)("circle", {
					cx: "10",
					cy: "10",
					r: "6.8"
				}),
				(0, react_jsx_runtime.jsx)("circle", {
					cx: "10",
					cy: "10",
					r: "2.2"
				}),
				(0, react_jsx_runtime.jsx)("path", { d: "M10 1.8v2M10 16.2v2M1.8 10h2M16.2 10h2" })
			]
		});
		const JournalIcon = (props) => (0, react_jsx_runtime.jsxs)(IconFrame, {
			...props,
			children: [(0, react_jsx_runtime.jsx)("path", { d: "M4 3.2h8.2A2.8 2.8 0 0 1 15 6v10.8H6.8A2.8 2.8 0 0 1 4 14V3.2Z" }), (0, react_jsx_runtime.jsx)("path", { d: "M4 13.8c0-1.5 1.2-2.7 2.8-2.7H15M7.2 6.5h4.6" })]
		});
		//#endregion
		//#region \0dsh-css:E:\test code\deepseekharness_modified\deepseek-harness\packages\client\ui-mind-garden\src\client\MindGardenDock.module.css.mjs
		const css$18 = "._1xn-PW_dock{box-sizing:border-box;color:var(--dsw-alias-label-primary);font-family:\"Noto Sans SC\", var(--dsw-font-family), \"PingFang SC\", \"Microsoft YaHei\", sans-serif;flex:none;align-items:center;display:inline-flex;position:relative}._1xn-PW_entry,._1xn-PW_activeHeader{box-sizing:border-box;height:28px;color:var(--dsw-alias-label-secondary);font:inherit;white-space:nowrap;cursor:pointer;background:0 0;border:0;border-radius:7px;align-items:center;gap:6px;padding:0 7px 0 5px;transition:color .12s,background-color .12s;display:inline-flex}._1xn-PW_entry:hover,._1xn-PW_activeHeader:hover,._1xn-PW_entry[aria-expanded=true],._1xn-PW_activeHeader[aria-expanded=true]{color:var(--dsw-alias-label-primary);background:color-mix(in srgb, var(--dsw-alias-state-warn-secondary) 8%, var(--dsw-alias-interactive-bg-hover))}._1xn-PW_mark,._1xn-PW_markActive,._1xn-PW_optionIcon{flex:none;place-items:center;display:inline-grid}._1xn-PW_mark,._1xn-PW_markActive{width:19px;height:19px;color:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 54%, var(--dsw-alias-label-primary))}._1xn-PW_entryTitle,._1xn-PW_activeTitle{color:currentColor;font-size:11px;font-weight:600;line-height:16px}._1xn-PW_activeTitle{letter-spacing:.01em}._1xn-PW_postureSignal{background:var(--dsw-alias-state-business-primary);width:4px;height:4px;box-shadow:0 0 0 2px color-mix(in srgb, var(--dsw-alias-state-business-secondary) 24%, transparent);border-radius:50%}._1xn-PW_visuallyHidden{clip:rect(0, 0, 0, 0);white-space:nowrap;border:0;width:1px;height:1px;margin:-1px;padding:0;position:absolute;overflow:hidden}._1xn-PW_chevron,._1xn-PW_chevronOpen{color:var(--dsw-alias-label-tertiary);flex:none;transition:transform .16s cubic-bezier(.2,.8,.2,1)}._1xn-PW_chevronOpen{transform:rotate(180deg)}._1xn-PW_panel,._1xn-PW_controls{z-index:80;box-sizing:border-box;overscroll-behavior:contain;background:linear-gradient(145deg, color-mix(in srgb, var(--dsw-alias-state-warn-secondary) 8%, transparent), transparent 44%), color-mix(in srgb, var(--dsw-alias-bg-layer-1,#fffdf9) 96%, #fffdf9);box-shadow:var(--dsw-shadow-lv3);--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);scrollbar-color:var(--dsw-alias-scrollbar-bg-l2) transparent;border:0;border-radius:11px;animation:.15s cubic-bezier(.16,1,.3,1) both _1xn-PW_posturePopoverIn;position:fixed;overflow:auto}._1xn-PW_dock:has(._1xn-PW_panel):before{z-index:79;background:color-mix(in srgb, var(--dsw-alias-label-primary) 22%, transparent);content:\"\";position:fixed;inset:0}._1xn-PW_panel[data-positioned=false],._1xn-PW_controls[data-positioned=false]{visibility:hidden}._1xn-PW_panel{padding:18px}._1xn-PW_panelHeader,._1xn-PW_popoverHeader{align-items:flex-start;gap:14px;display:flex}._1xn-PW_panelHeader>div,._1xn-PW_popoverHeader>span{flex:1;min-width:0}._1xn-PW_title{color:var(--dsw-alias-label-primary);letter-spacing:-.015em;margin:0 0 6px;font-family:Mind Garden Display,Noto Serif SC,Songti SC,serif;font-size:18px;font-weight:520;line-height:1.4}._1xn-PW_disclosure,._1xn-PW_acceptance,._1xn-PW_error{margin:0;font-size:12px;line-height:1.65}._1xn-PW_disclosure{max-width:64ch;color:var(--dsw-alias-label-secondary)}._1xn-PW_acceptance{color:var(--dsw-alias-label-tertiary);margin-block-start:13px}._1xn-PW_close{width:36px;height:36px;color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:0;border-radius:6px;flex:none;place-items:center;padding:0;display:grid}._1xn-PW_close:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}._1xn-PW_contract{grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:16px 0 0;padding:0;list-style:none;display:grid}._1xn-PW_contract li{color:color-mix(in srgb, var(--dsw-alias-state-business-primary) 55%, var(--dsw-alias-label-primary));grid-template-columns:18px minmax(0,1fr);align-items:start;gap:8px;display:grid}._1xn-PW_contract li>span{gap:2px;display:grid}._1xn-PW_contract strong{color:var(--dsw-alias-label-primary);font-size:12px;font-weight:650;line-height:1.5}._1xn-PW_contract small{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:1.55}._1xn-PW_consent{color:var(--dsw-alias-label-primary);background:color-mix(in srgb, var(--dsw-alias-state-warn-secondary) 8%, var(--dsw-alias-bg-layer-2));cursor:pointer;border-radius:8px;grid-template-columns:20px minmax(0,1fr);align-items:start;gap:10px;margin-block-start:16px;padding:12px;display:grid}._1xn-PW_consent input{width:18px;height:18px;accent-color:var(--dsw-alias-state-business-primary);margin:1px 0 0}._1xn-PW_consent>span{gap:3px;display:grid}._1xn-PW_consent strong{font-size:12px;font-weight:650;line-height:1.5}._1xn-PW_consent small{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:1.55}._1xn-PW_activationActions{align-items:center;gap:12px;margin-block-start:16px;display:flex}._1xn-PW_activationActions>small{max-width:30ch;color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:1.55}._1xn-PW_activate{min-height:40px;color:var(--dsw-alias-label-primary-inverted,#fff);background:var(--dsw-alias-state-business-primary);font:inherit;cursor:pointer;border:0;border-radius:8px;flex:none;justify-content:center;align-items:center;gap:8px;padding:8px 16px;font-size:13px;font-weight:650;transition:background-color .12s;display:inline-flex}._1xn-PW_activate:hover{background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 88%, var(--dsw-alias-label-primary))}._1xn-PW_activate:disabled{cursor:not-allowed;opacity:.48}._1xn-PW_optionIcon{width:28px;height:28px;color:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 58%, var(--dsw-alias-label-primary));background:color-mix(in srgb, var(--dsw-alias-state-warn-secondary) 10%, transparent);border-radius:50%}._1xn-PW_activePanel{align-items:center;display:inline-flex;position:relative}._1xn-PW_controls{padding:14px}._1xn-PW_popoverHeader{align-items:center;margin-block-end:14px}._1xn-PW_popoverHeader>span{gap:2px;display:grid}._1xn-PW_popoverHeader strong{color:var(--dsw-alias-label-primary);font-family:Mind Garden Display,Noto Serif SC,Songti SC,serif;font-size:16px;font-weight:520;line-height:1.4}._1xn-PW_popoverHeader small{color:var(--dsw-alias-label-tertiary);font-size:10px;line-height:1.5}._1xn-PW_controlSection+._1xn-PW_controlSection{margin-block-start:14px}._1xn-PW_controlLabel{color:var(--dsw-alias-label-tertiary);letter-spacing:.06em;margin-block-end:7px;font-size:9px;font-weight:650;line-height:15px;display:block}._1xn-PW_segmented{grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;display:grid}._1xn-PW_intentList{flex-wrap:wrap;gap:5px;display:flex}._1xn-PW_segment,._1xn-PW_segmentActive,._1xn-PW_intent,._1xn-PW_intentActive{min-height:32px;color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;background:0 0;border:1px solid #0000;border-radius:7px;padding:5px 9px;font-size:11px;line-height:18px;transition:color .12s,border-color .12s,background-color .12s}._1xn-PW_segment,._1xn-PW_segmentActive{text-align:start;align-items:center;gap:7px;min-width:0;display:inline-flex}._1xn-PW_segment:hover,._1xn-PW_intent:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}._1xn-PW_segmentActive,._1xn-PW_intentActive{border-color:color-mix(in srgb, var(--dsw-alias-state-business-primary) 22%, transparent);color:color-mix(in srgb, var(--dsw-alias-state-business-primary) 72%, var(--dsw-alias-label-primary));background:color-mix(in srgb, var(--dsw-alias-state-business-secondary) 8%, transparent)}._1xn-PW_optionIcon{color:currentColor;background:color-mix(in srgb, currentColor 6%, transparent);width:24px;height:24px}._1xn-PW_optionCopy{text-align:start;min-width:0;display:grid}._1xn-PW_optionCopy strong{font-size:11px;font-weight:650}._1xn-PW_optionCopy small{color:var(--dsw-alias-label-tertiary);font-size:9px;line-height:1.5}._1xn-PW_storage{color:var(--dsw-alias-label-caption);align-items:center;gap:6px;margin-block-start:13px;font-size:9px;line-height:15px;display:flex}._1xn-PW_error{color:var(--dsw-alias-state-error-primary);background:color-mix(in srgb, var(--dsw-alias-state-error-secondary) 10%, transparent);border-radius:7px;margin-block-start:10px;padding:8px 9px}._1xn-PW_settingsIdentity{grid-template-columns:40px minmax(0,1fr);align-items:center;gap:12px;padding-block-end:18px;display:grid}._1xn-PW_settingsIdentity>span:last-child{gap:3px;display:grid}._1xn-PW_settingsIdentity strong{font-family:Mind Garden Display,Noto Serif SC,Songti SC,serif;font-size:22px;font-weight:520;line-height:1.35}._1xn-PW_settingsIdentity small{color:var(--dsw-alias-label-secondary);font-size:11px;line-height:1.6}._1xn-PW_dock[data-surface=settings],._1xn-PW_dock[data-surface=settings] ._1xn-PW_activePanel{width:100%;display:block}._1xn-PW_dock[data-surface=settings] ._1xn-PW_markActive{width:38px;height:38px;color:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 68%, var(--dsw-alias-label-primary));background:color-mix(in srgb, var(--dsw-alias-state-warn-secondary) 10%, transparent);border-radius:50%}._1xn-PW_dock[data-surface=settings] ._1xn-PW_controls{background:color-mix(in srgb, var(--dsw-alias-bg-layer-2) 46%, transparent);width:auto;max-height:none;box-shadow:none;border-radius:8px;grid-template-columns:minmax(230px,.8fr) minmax(0,1.2fr);gap:0;padding:0;animation:none;display:grid;position:static;overflow:visible}._1xn-PW_dock[data-surface=settings] ._1xn-PW_controlSection{margin:0;padding:18px}._1xn-PW_dock[data-surface=settings] ._1xn-PW_controlSection+._1xn-PW_controlSection{border-inline-start:1px solid var(--dsw-alias-border-l2)}._1xn-PW_dock[data-surface=settings] ._1xn-PW_controlLabel{color:color-mix(in srgb, var(--dsw-alias-state-success-primary) 58%, var(--dsw-alias-label-primary));letter-spacing:.08em;margin-block-end:11px;font-size:9px}._1xn-PW_dock[data-surface=settings] ._1xn-PW_segmented{grid-template-columns:1fr;gap:7px}._1xn-PW_dock[data-surface=settings] ._1xn-PW_segment,._1xn-PW_dock[data-surface=settings] ._1xn-PW_segmentActive{border-color:var(--dsw-alias-border-l2);border-radius:6px;min-height:58px;padding:9px 10px}._1xn-PW_dock[data-surface=settings] ._1xn-PW_segmentActive{border-color:color-mix(in srgb, var(--dsw-alias-state-success-primary) 34%, var(--dsw-alias-border-l2));background:linear-gradient(90deg, color-mix(in srgb, var(--dsw-alias-state-success-secondary) 10%, transparent), transparent), color-mix(in srgb, var(--dsw-alias-bg-base) 96%, var(--dsw-alias-state-warn-secondary))}._1xn-PW_dock[data-surface=settings] ._1xn-PW_intentList{grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;display:grid}._1xn-PW_dock[data-surface=settings] ._1xn-PW_intent,._1xn-PW_dock[data-surface=settings] ._1xn-PW_intentActive{text-align:start;min-height:38px;padding:7px 9px}._1xn-PW_dock[data-surface=settings] ._1xn-PW_storage{color:var(--dsw-alias-label-tertiary);grid-column:1/-1;margin:0;padding:12px 18px}._1xn-PW_dock[data-surface=settings] ._1xn-PW_error{grid-column:1/-1;margin:0 18px 14px}._1xn-PW_entry:focus-visible,._1xn-PW_close:focus-visible,._1xn-PW_activeHeader:focus-visible,._1xn-PW_activate:focus-visible,._1xn-PW_segment:focus-visible,._1xn-PW_segmentActive:focus-visible,._1xn-PW_intent:focus-visible,._1xn-PW_intentActive:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px}._1xn-PW_segment:disabled,._1xn-PW_segmentActive:disabled,._1xn-PW_intent:disabled,._1xn-PW_intentActive:disabled,._1xn-PW_activate:disabled,._1xn-PW_close:disabled{cursor:default;opacity:.5}@keyframes _1xn-PW_posturePopoverIn{0%{opacity:.01;transform:translateY(4px)scale(.992)}to{opacity:1;transform:translateY(0)scale(1)}}@container (width<=500px){._1xn-PW_entry,._1xn-PW_activeHeader{padding-inline:4px}._1xn-PW_entryTitle{text-overflow:ellipsis;max-width:76px;overflow:hidden}}@media (width<=620px){._1xn-PW_contract{grid-template-columns:1fr;gap:8px}._1xn-PW_dock[data-surface=settings] ._1xn-PW_controls{grid-template-columns:1fr;gap:6px}._1xn-PW_dock[data-surface=settings] ._1xn-PW_controlSection+._1xn-PW_controlSection{border-inline-start:0}}@media (width<=430px){._1xn-PW_dock:has(._1xn-PW_panel):before{background:color-mix(in srgb, var(--dsw-alias-label-primary) 36%, transparent)}._1xn-PW_panel{padding:18px 16px calc(18px + env(safe-area-inset-bottom,0px));background:linear-gradient(145deg, color-mix(in srgb, var(--dsw-alias-state-warn-primary) 18%, transparent), transparent 44%), var(--dsw-alias-bg-base);border-radius:11px 11px 7px 7px;width:100%!important;max-height:calc(100dvh - 12px)!important;inset:auto 0 0!important}._1xn-PW_close{width:44px;height:44px}._1xn-PW_disclosure,._1xn-PW_acceptance,._1xn-PW_contract small,._1xn-PW_consent small{font-size:12px}._1xn-PW_consent strong{font-size:14px}._1xn-PW_activate:disabled{opacity:.7}._1xn-PW_activationActions{flex-direction:column;align-items:stretch}._1xn-PW_activate{min-height:46px}._1xn-PW_dock[data-surface=settings] ._1xn-PW_intentList{grid-template-columns:1fr}}@media (prefers-reduced-motion:reduce){._1xn-PW_panel,._1xn-PW_controls{animation:none}._1xn-PW_entry,._1xn-PW_activeHeader,._1xn-PW_chevron,._1xn-PW_chevronOpen,._1xn-PW_activate,._1xn-PW_segment,._1xn-PW_segmentActive,._1xn-PW_intent,._1xn-PW_intentActive{transition:none}}";
		const tagId$18 = "@deepseek-ai/dsh-mind-garden/MindGardenDock.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$18) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-mind-garden";
			tag.dataset.pluginCss = tagId$18;
			tag.textContent = css$18;
			document.head.appendChild(tag);
		}
		var MindGardenDock_module_css_default = {
			"acceptance": "_1xn-PW_acceptance",
			"activate": "_1xn-PW_activate",
			"activationActions": "_1xn-PW_activationActions",
			"activeHeader": "_1xn-PW_activeHeader",
			"activePanel": "_1xn-PW_activePanel",
			"activeTitle": "_1xn-PW_activeTitle",
			"chevron": "_1xn-PW_chevron",
			"chevronOpen": "_1xn-PW_chevronOpen",
			"close": "_1xn-PW_close",
			"consent": "_1xn-PW_consent",
			"contract": "_1xn-PW_contract",
			"controlLabel": "_1xn-PW_controlLabel",
			"controlSection": "_1xn-PW_controlSection",
			"controls": "_1xn-PW_controls",
			"disclosure": "_1xn-PW_disclosure",
			"dock": "_1xn-PW_dock",
			"entry": "_1xn-PW_entry",
			"entryTitle": "_1xn-PW_entryTitle",
			"error": "_1xn-PW_error",
			"intent": "_1xn-PW_intent",
			"intentActive": "_1xn-PW_intentActive",
			"intentList": "_1xn-PW_intentList",
			"mark": "_1xn-PW_mark",
			"markActive": "_1xn-PW_markActive",
			"optionCopy": "_1xn-PW_optionCopy",
			"optionIcon": "_1xn-PW_optionIcon",
			"panel": "_1xn-PW_panel",
			"panelHeader": "_1xn-PW_panelHeader",
			"popoverHeader": "_1xn-PW_popoverHeader",
			"posturePopoverIn": "_1xn-PW_posturePopoverIn",
			"postureSignal": "_1xn-PW_postureSignal",
			"segment": "_1xn-PW_segment",
			"segmentActive": "_1xn-PW_segmentActive",
			"segmented": "_1xn-PW_segmented",
			"settingsIdentity": "_1xn-PW_settingsIdentity",
			"storage": "_1xn-PW_storage",
			"title": "_1xn-PW_title",
			"visuallyHidden": "_1xn-PW_visuallyHidden"
		};
		//#endregion
		//#region lib/types/client/MindGardenDock.js
		/** Mind Garden entry, disclosure, and live preference controls. */
		const MODES = ["serenity", "clarity"];
		const INTENTS = [
			"auto",
			"listen",
			"settle",
			"clarify",
			"next-step"
		];
		const DEFAULT_MODE = "serenity";
		/** Render a stable localized failure without exposing transport internals by default. */
		function errorText(result, t) {
			if (result.ok) return null;
			return result.error.code === "MIND_GARDEN_SESSION_NOT_BLANK" ? t("error.notBlank") : result.error.message || t("error.generic");
		}
		/** The visual Mind Garden dock surface. */
		function MindGardenPanel({ projection, onActivate, onSelectMode, onSelectSupportIntent, defaultOpen = false, running = false, t }) {
			const [open, setOpen] = (0, react.useState)(defaultOpen);
			const [consentAccepted, setConsentAccepted] = (0, react.useState)(false);
			const [pending, setPending] = (0, react.useState)(false);
			const [error, setError] = (0, react.useState)(null);
			const pendingRef = (0, react.useRef)(false);
			const surfaceRef = (0, react.useRef)(null);
			const disclosureRef = (0, react.useRef)(null);
			const triggerRef = (0, react.useRef)(null);
			const disclosureId = (0, react.useId)();
			const consentId = (0, react.useId)();
			const controlsId = (0, react.useId)();
			const [popoverPosition, setPopoverPosition] = (0, react.useState)();
			const revision = projection?.state.revision;
			(0, react.useEffect)(() => {
				setError(null);
			}, [revision]);
			const closeAndRestoreFocus = (0, react.useCallback)(() => {
				setOpen(false);
				setConsentAccepted(false);
				queueMicrotask(() => {
					triggerRef.current?.focus();
				});
			}, []);
			(0, react.useEffect)(() => {
				if (!open || defaultOpen) return;
				const closeOnEscape = (event) => {
					if (event.key !== "Escape") return;
					event.preventDefault();
					closeAndRestoreFocus();
				};
				const closeOutside = (event) => {
					if (!(event.target instanceof Node) || surfaceRef.current?.contains(event.target)) return;
					closeAndRestoreFocus();
				};
				document.addEventListener("keydown", closeOnEscape);
				document.addEventListener("pointerdown", closeOutside, true);
				return () => {
					document.removeEventListener("keydown", closeOnEscape);
					document.removeEventListener("pointerdown", closeOutside, true);
				};
			}, [
				closeAndRestoreFocus,
				defaultOpen,
				open
			]);
			(0, react.useEffect)(() => {
				if (!open || projection !== null || defaultOpen) return;
				const disclosure = disclosureRef.current;
				if (disclosure === null) return;
				disclosure.focus({ preventScroll: true });
				const containFocus = (event) => {
					if (event.key !== "Tab") return;
					const focusable = [...disclosure.querySelectorAll("button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex=\"-1\"])")];
					const first = focusable[0];
					const last = focusable.at(-1);
					if (first === void 0 || last === void 0) return;
					if (event.shiftKey && (document.activeElement === first || document.activeElement === disclosure)) {
						event.preventDefault();
						last.focus();
					} else if (!event.shiftKey && document.activeElement === last) {
						event.preventDefault();
						first.focus();
					}
				};
				disclosure.addEventListener("keydown", containFocus);
				return () => {
					disclosure.removeEventListener("keydown", containFocus);
				};
			}, [
				defaultOpen,
				open,
				projection
			]);
			const positionPopover = (0, react.useCallback)(() => {
				if (!open || defaultOpen || triggerRef.current === null) return;
				const rect = triggerRef.current.getBoundingClientRect();
				const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
				const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
				const edge = 16;
				const gap = 9;
				const idealWidth = projection === null ? 520 : 340;
				const idealHeight = projection === null ? 430 : 330;
				const availableWidth = viewportWidth - edge * 2;
				const width = viewportWidth < 480 ? availableWidth : Math.max(280, Math.min(idealWidth, availableWidth));
				const left = Math.min(Math.max(rect.left, edge), viewportWidth - width - edge);
				const above = rect.top - edge - gap;
				const below = viewportHeight - rect.bottom - edge - gap;
				const placeAbove = above >= Math.min(idealHeight, viewportHeight * .56) || above >= below;
				const maxHeight = Math.max(180, Math.min(idealHeight, placeAbove ? above : below));
				setPopoverPosition(placeAbove ? {
					left,
					width,
					maxHeight,
					bottom: viewportHeight - rect.top + gap,
					top: "auto"
				} : {
					left,
					width,
					maxHeight,
					top: rect.bottom + gap,
					bottom: "auto"
				});
			}, [
				defaultOpen,
				open,
				projection
			]);
			(0, react.useLayoutEffect)(() => {
				if (!open || defaultOpen) return;
				positionPopover();
				const visualViewport = window.visualViewport;
				window.addEventListener("resize", positionPopover);
				window.addEventListener("scroll", positionPopover, true);
				visualViewport?.addEventListener("resize", positionPopover);
				visualViewport?.addEventListener("scroll", positionPopover);
				return () => {
					window.removeEventListener("resize", positionPopover);
					window.removeEventListener("scroll", positionPopover, true);
					visualViewport?.removeEventListener("resize", positionPopover);
					visualViewport?.removeEventListener("scroll", positionPopover);
				};
			}, [
				defaultOpen,
				open,
				positionPopover
			]);
			const run = (0, react.useCallback)(async (action) => {
				/* v8 ignore next -- React synchronously disables every action after the first click; the ref closes the smaller pre-render window. */
				if (pendingRef.current || running) return;
				pendingRef.current = true;
				setPending(true);
				setError(null);
				try {
					const result = await action();
					setError(errorText(result, t));
					if (result.ok && !defaultOpen) closeAndRestoreFocus();
				} catch {
					setError(t("error.generic"));
				} finally {
					pendingRef.current = false;
					setPending(false);
				}
			}, [
				closeAndRestoreFocus,
				defaultOpen,
				running,
				t
			]);
			if (projection === void 0) return null;
			if (projection === null) return (0, react_jsx_runtime.jsxs)("div", {
				ref: surfaceRef,
				className: MindGardenDock_module_css_default.dock,
				"data-mind-garden-state": "inactive",
				"data-surface": "composer",
				children: [(0, react_jsx_runtime.jsxs)("button", {
					ref: triggerRef,
					type: "button",
					className: MindGardenDock_module_css_default.entry,
					onClick: () => {
						setOpen((value) => !value);
					},
					"aria-label": t("entry.open"),
					"aria-expanded": open,
					"aria-controls": disclosureId,
					children: [
						(0, react_jsx_runtime.jsx)("span", {
							className: MindGardenDock_module_css_default.mark,
							children: (0, react_jsx_runtime.jsx)(GardenMarkIcon, { size: 16 })
						}),
						(0, react_jsx_runtime.jsx)("span", {
							className: MindGardenDock_module_css_default.entryTitle,
							children: t("entry.open")
						}),
						(0, react_jsx_runtime.jsx)("span", {
							className: MindGardenDock_module_css_default.visuallyHidden,
							children: t("entry.hint")
						}),
						(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutline14, { className: open ? MindGardenDock_module_css_default.chevronOpen : MindGardenDock_module_css_default.chevron })
					]
				}), open && (0, react_jsx_runtime.jsxs)("section", {
					ref: disclosureRef,
					id: disclosureId,
					className: MindGardenDock_module_css_default.panel,
					style: popoverPosition,
					"data-positioned": popoverPosition === void 0 ? "false" : "true",
					role: "dialog",
					"aria-modal": "true",
					"aria-labelledby": `${disclosureId}-title`,
					tabIndex: -1,
					children: [
						(0, react_jsx_runtime.jsxs)("div", {
							className: MindGardenDock_module_css_default.panelHeader,
							children: [(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("h3", {
								id: `${disclosureId}-title`,
								className: MindGardenDock_module_css_default.title,
								children: t("disclosure.title")
							}), (0, react_jsx_runtime.jsx)("p", {
								className: MindGardenDock_module_css_default.disclosure,
								children: t("disclosure.body")
							})] }), (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: MindGardenDock_module_css_default.close,
								onClick: closeAndRestoreFocus,
								disabled: pending,
								"aria-label": t("entry.close"),
								children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseOutline16, { size: 15 })
							})]
						}),
						(0, react_jsx_runtime.jsx)("p", {
							className: MindGardenDock_module_css_default.acceptance,
							children: t("disclosure.accept")
						}),
						(0, react_jsx_runtime.jsxs)("ul", {
							className: MindGardenDock_module_css_default.contract,
							"aria-label": t("disclosure.contract"),
							children: [
								(0, react_jsx_runtime.jsxs)("li", { children: [(0, react_jsx_runtime.jsx)(PrivateIcon, { size: 16 }), (0, react_jsx_runtime.jsxs)("span", { children: [(0, react_jsx_runtime.jsx)("strong", { children: t("disclosure.profile.title") }), (0, react_jsx_runtime.jsx)("small", { children: t("disclosure.profile.body") })] })] }),
								(0, react_jsx_runtime.jsxs)("li", { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconDataOutline16, { size: 16 }), (0, react_jsx_runtime.jsxs)("span", { children: [(0, react_jsx_runtime.jsx)("strong", { children: t("disclosure.model.title") }), (0, react_jsx_runtime.jsx)("small", { children: t("disclosure.model.body") })] })] }),
								(0, react_jsx_runtime.jsxs)("li", { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutline16, { size: 16 }), (0, react_jsx_runtime.jsxs)("span", { children: [(0, react_jsx_runtime.jsx)("strong", { children: t("disclosure.authority.title") }), (0, react_jsx_runtime.jsx)("small", { children: t("disclosure.authority.body") })] })] })
							]
						}),
						(0, react_jsx_runtime.jsxs)("label", {
							className: MindGardenDock_module_css_default.consent,
							htmlFor: consentId,
							children: [(0, react_jsx_runtime.jsx)("input", {
								id: consentId,
								type: "checkbox",
								checked: consentAccepted,
								disabled: pending,
								"aria-label": t("disclosure.consent"),
								"aria-describedby": `${consentId}-hint`,
								onChange: (event) => {
									setConsentAccepted(event.target.checked);
								}
							}), (0, react_jsx_runtime.jsxs)("span", { children: [(0, react_jsx_runtime.jsx)("strong", { children: t("disclosure.consent") }), (0, react_jsx_runtime.jsx)("small", {
								id: `${consentId}-hint`,
								children: t("disclosure.consent.hint")
							})] })]
						}),
						(0, react_jsx_runtime.jsxs)("div", {
							className: MindGardenDock_module_css_default.activationActions,
							children: [(0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: MindGardenDock_module_css_default.activate,
								disabled: pending || !consentAccepted,
								"aria-describedby": `${consentId}-hint`,
								onClick: () => {
									run(() => onActivate(DEFAULT_MODE));
								},
								children: [(0, react_jsx_runtime.jsx)(GardenMarkIcon, { size: 17 }), (0, react_jsx_runtime.jsx)("span", { children: t(pending ? "disclosure.starting" : "disclosure.start") })]
							}), (0, react_jsx_runtime.jsx)("small", { children: t("disclosure.default") })]
						}),
						error !== null && (0, react_jsx_runtime.jsx)("p", {
							className: MindGardenDock_module_css_default.error,
							role: "alert",
							children: error
						})
					]
				})]
			});
			const state = projection.state;
			return (0, react_jsx_runtime.jsx)("div", {
				ref: surfaceRef,
				className: MindGardenDock_module_css_default.dock,
				"data-mind-garden-state": "active",
				"data-surface": defaultOpen ? "settings" : "composer",
				children: (0, react_jsx_runtime.jsxs)("section", {
					className: MindGardenDock_module_css_default.activePanel,
					children: [defaultOpen ? (0, react_jsx_runtime.jsxs)("div", {
						className: MindGardenDock_module_css_default.settingsIdentity,
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: MindGardenDock_module_css_default.markActive,
							children: (0, react_jsx_runtime.jsx)(GardenMarkIcon, { size: 18 })
						}), (0, react_jsx_runtime.jsxs)("span", { children: [(0, react_jsx_runtime.jsx)("strong", { children: t("garden.dialogue.title") }), (0, react_jsx_runtime.jsx)("small", { children: t("garden.dialogue.body") })] })]
					}) : (0, react_jsx_runtime.jsxs)("button", {
						ref: triggerRef,
						type: "button",
						className: MindGardenDock_module_css_default.activeHeader,
						onClick: () => {
							setOpen((value) => !value);
						},
						"aria-expanded": open,
						"aria-controls": controlsId,
						"aria-label": open ? t("garden.collapse") : t("garden.expand"),
						title: `${t(`intent.${state.supportIntent}`)} · ${t(`mode.${state.mode}`)}`,
						children: [
							(0, react_jsx_runtime.jsx)("span", {
								className: MindGardenDock_module_css_default.markActive,
								children: (0, react_jsx_runtime.jsx)(GardenMarkIcon, { size: 15 })
							}),
							(0, react_jsx_runtime.jsx)("span", {
								className: MindGardenDock_module_css_default.activeTitle,
								children: t(`intent.${state.supportIntent}`)
							}),
							(0, react_jsx_runtime.jsx)("span", {
								className: MindGardenDock_module_css_default.postureSignal,
								"aria-hidden": "true"
							}),
							(0, react_jsx_runtime.jsxs)("span", {
								className: MindGardenDock_module_css_default.visuallyHidden,
								children: [
									t("garden.title"),
									" · ",
									t(`intent.${state.supportIntent}`)
								]
							}),
							(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutline14, { className: open ? MindGardenDock_module_css_default.chevronOpen : MindGardenDock_module_css_default.chevron })
						]
					}), open && (0, react_jsx_runtime.jsxs)("div", {
						id: controlsId,
						className: MindGardenDock_module_css_default.controls,
						style: defaultOpen ? void 0 : popoverPosition,
						"data-positioned": defaultOpen || popoverPosition !== void 0 ? "true" : "false",
						children: [
							!defaultOpen && (0, react_jsx_runtime.jsxs)("div", {
								className: MindGardenDock_module_css_default.popoverHeader,
								children: [(0, react_jsx_runtime.jsxs)("span", { children: [(0, react_jsx_runtime.jsx)("strong", { children: t("garden.dialogue.title") }), (0, react_jsx_runtime.jsxs)("small", { children: [
									t(`mode.${state.mode}`),
									" · ",
									t(`intent.${state.supportIntent}`)
								] })] }), (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: MindGardenDock_module_css_default.close,
									onClick: closeAndRestoreFocus,
									disabled: pending,
									"aria-label": t("garden.close"),
									children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseOutline16, { size: 15 })
								})]
							}),
							(0, react_jsx_runtime.jsx)(ControlSection, {
								label: t("section.intent"),
								children: (0, react_jsx_runtime.jsx)("div", {
									className: MindGardenDock_module_css_default.intentList,
									role: "group",
									"aria-label": t("section.intent"),
									children: INTENTS.map((intent) => (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: state.supportIntent === intent ? MindGardenDock_module_css_default.intentActive : MindGardenDock_module_css_default.intent,
										"aria-pressed": state.supportIntent === intent,
										disabled: pending || running,
										onClick: () => {
											run(() => onSelectSupportIntent(state.revision, intent));
										},
										children: t(`intent.${intent}`)
									}, intent))
								})
							}),
							(0, react_jsx_runtime.jsx)(ControlSection, {
								label: t("section.mode"),
								children: (0, react_jsx_runtime.jsx)("div", {
									className: MindGardenDock_module_css_default.segmented,
									role: "group",
									"aria-label": t("section.mode"),
									children: MODES.map((mode) => (0, react_jsx_runtime.jsxs)("button", {
										type: "button",
										className: state.mode === mode ? MindGardenDock_module_css_default.segmentActive : MindGardenDock_module_css_default.segment,
										"aria-pressed": state.mode === mode,
										disabled: pending || running,
										onClick: () => {
											run(() => onSelectMode(state.revision, mode));
										},
										children: [(0, react_jsx_runtime.jsx)("span", {
											className: MindGardenDock_module_css_default.optionIcon,
											children: mode === "serenity" ? (0, react_jsx_runtime.jsx)(ConcernsIcon, { size: 17 }) : (0, react_jsx_runtime.jsx)(PhilosophyIcon, { size: 17 })
										}), (0, react_jsx_runtime.jsxs)("span", {
											className: MindGardenDock_module_css_default.optionCopy,
											children: [(0, react_jsx_runtime.jsx)("strong", { children: t(`mode.${mode}`) }), defaultOpen && (0, react_jsx_runtime.jsx)("small", { children: t(`mode.${mode}.desc`) })]
										})]
									}, mode))
								})
							}),
							(0, react_jsx_runtime.jsxs)("div", {
								className: MindGardenDock_module_css_default.storage,
								children: [(0, react_jsx_runtime.jsx)(PrivateIcon, { size: 14 }), t("garden.storage")]
							}),
							error !== null && (0, react_jsx_runtime.jsx)("p", {
								className: MindGardenDock_module_css_default.error,
								role: "alert",
								children: error
							})
						]
					})]
				})
			});
		}
		/** Small labeled control group. */
		function ControlSection({ label, children }) {
			return (0, react_jsx_runtime.jsxs)("div", {
				className: MindGardenDock_module_css_default.controlSection,
				children: [(0, react_jsx_runtime.jsx)("span", {
					className: MindGardenDock_module_css_default.controlLabel,
					children: label
				}), children]
			});
		}
		/** Read the typed projection and adapt it to the compact composer control. */
		function MindGardenDock({ useProjection, useSession, ...props }) {
			return (0, react_jsx_runtime.jsx)(MindGardenPanel, {
				projection: useProjection("mind-garden"),
				running: useSession((state) => state.running),
				...props
			});
		}
		//#endregion
		//#region lib/types/client/calendar.js
		/** Browser-local date helpers for explicit Mind Garden calendar operations. */
		/**
		* Format one local civil date without allowing UTC conversion to shift the day.
		* @param date - Date observed in the browser's local calendar.
		* @returns The corresponding `YYYY-MM-DD` civil date.
		*/
		function localDate(date) {
			return `${String(date.getFullYear()).padStart(4, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
		}
		/**
		* Capture browser zone metadata for one selected local date.
		* @param value - Selected `YYYY-MM-DD` civil date.
		* @returns The explicit civil date, IANA zone, and offset at local midnight.
		*/
		function calendarStamp(value) {
			const [year, month, day] = value.split("-").map(Number);
			const localMidnight = new Date(year, month - 1, day);
			return {
				localDate: value,
				timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
				utcOffsetMinutes: -localMidnight.getTimezoneOffset()
			};
		}
		/**
		* Return the inclusive current week, month, or year in browser-local dates.
		* @param periodType - Calendar scale to derive.
		* @param now - Instant whose local period contains the range.
		* @returns Inclusive local start and end dates.
		*/
		function currentPeriod(periodType, now = /* @__PURE__ */ new Date()) {
			const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
			const end = new Date(start);
			if (periodType === "week") {
				start.setDate(start.getDate() - (start.getDay() + 6) % 7);
				end.setTime(start.getTime());
				end.setDate(start.getDate() + 6);
			} else if (periodType === "month") {
				start.setDate(1);
				end.setFullYear(start.getFullYear(), start.getMonth() + 1, 0);
			} else {
				start.setMonth(0, 1);
				end.setFullYear(start.getFullYear(), 11, 31);
			}
			return {
				start: localDate(start),
				end: localDate(end)
			};
		}
		//#endregion
		//#region \0dsh-css:E:\test code\deepseekharness_modified\deepseek-harness\packages\client\ui-mind-garden\src\client\GardenSidebar.module.css.mjs
		const css$17 = ".Q1g24G_sidebar{z-index:20;width:100%;min-width:0;color:var(--mg-ink,#352e29);border-block-end:1px solid color-mix(in srgb, var(--mg-ink,#352e29) 13%, transparent);background:linear-gradient(100deg, #fffdf8d1, #f8f0e5eb), var(--mg-xuan-texture);isolation:isolate;background-size:auto,520px;display:grid;position:relative;box-shadow:0 12px 34px #4d3a2a14}.Q1g24G_sidebar:after{content:\"\";pointer-events:none;background:linear-gradient(90deg,#0000 3%,#9a77467a 31%,#445c7c3d 73%,#0000 97%);height:1px;position:absolute;inset:auto 0 -1px}.Q1g24G_topbar{grid-template-columns:minmax(150px,.75fr) minmax(460px,2.6fr) minmax(210px,1fr);align-items:center;gap:22px;min-height:66px;padding:0 28px;display:grid}.Q1g24G_identity{min-width:0;color:var(--mg-ink,#352e29);align-items:center;gap:10px;display:inline-flex}.Q1g24G_identity svg{color:var(--mg-indigo,#445c7c);flex:none}.Q1g24G_identity strong{font-family:var(--mg-font-reflection,\"Noto Serif SC\", \"Songti SC\", serif);letter-spacing:.08em;text-overflow:ellipsis;white-space:nowrap;font-size:14px;font-weight:620;overflow:hidden}.Q1g24G_regionNavigation{grid-template-columns:repeat(5,minmax(72px,1fr));justify-self:center;gap:5px;width:100%;max-width:700px;display:grid}.Q1g24G_region,.Q1g24G_space,.Q1g24G_utility,.Q1g24G_settings,.Q1g24G_constellationStatus{color:inherit;font:inherit;cursor:pointer;background:0 0;border:0}.Q1g24G_region{min-height:42px;color:color-mix(in srgb, var(--mg-ink,#352e29) 66%, transparent);white-space:nowrap;border-radius:7px;justify-content:center;align-items:center;gap:7px;padding:5px 9px;font-size:13px;transition:color .14s ease-out,background .14s ease-out,transform .18s ease-out;display:inline-flex;position:relative}.Q1g24G_region:after{background:var(--mg-indigo,#445c7c);content:\"\";opacity:0;border-radius:2px;height:2px;transition:opacity .14s ease-out,transform .18s ease-out;position:absolute;inset:auto 18px -12px;transform:scaleX(.4)}.Q1g24G_region:hover{color:var(--mg-ink,#352e29);background:#ffffff70}.Q1g24G_region[data-active=true]{color:var(--mg-indigo,#445c7c);background:#ffffff94;font-weight:650}.Q1g24G_region[data-active=true]:after{opacity:1;transform:scaleX(1)}.Q1g24G_utilities{justify-content:flex-end;align-items:center;gap:7px;min-width:0;display:flex}.Q1g24G_utility,.Q1g24G_constellationStatus,.Q1g24G_settings{border:1px solid color-mix(in srgb, var(--mg-ink,#352e29) 12%, transparent);min-height:34px;color:color-mix(in srgb, var(--mg-ink,#352e29) 70%, transparent);background:#fffdf885;border-radius:7px;justify-content:center;align-items:center;gap:7px;transition:color .14s ease-out,border-color .14s ease-out,background .14s ease-out;display:inline-flex}.Q1g24G_utility{width:34px;padding:0}.Q1g24G_sidebar[data-compact=true] .Q1g24G_utility svg{transform:rotate(180deg)}.Q1g24G_constellationStatus{min-width:42px;color:var(--mg-indigo,#445c7c);padding:0 9px}.Q1g24G_constellationStatus span{text-overflow:ellipsis;white-space:nowrap;max-width:58px;font-size:11px;overflow:hidden}.Q1g24G_settings{padding:0 10px;font-size:12px}.Q1g24G_utility:hover,.Q1g24G_constellationStatus:hover,.Q1g24G_settings:hover{color:var(--mg-indigo,#445c7c);border-color:color-mix(in srgb, var(--mg-indigo,#445c7c) 38%, transparent);background:#fffc}.Q1g24G_spaceNavigation{background:#f7eddf85;border-block-start:1px solid #4a392b12;align-items:center;gap:6px;min-height:46px;padding:7px 28px;display:flex}.Q1g24G_regionContext{min-width:112px;color:color-mix(in srgb, var(--mg-ink,#352e29) 48%, transparent);letter-spacing:.08em;padding-inline-start:1px;font-size:11px;font-weight:650}.Q1g24G_space{min-height:32px;color:color-mix(in srgb, var(--mg-ink,#352e29) 66%, transparent);border-radius:6px;align-items:center;gap:7px;padding:5px 12px;font-size:12px;display:inline-flex}.Q1g24G_space:hover{color:var(--mg-ink,#352e29);background:#ffffff80}.Q1g24G_space[data-active=true]{color:#fffdf8;background:var(--mg-indigo,#445c7c);font-weight:630;box-shadow:0 5px 14px #445c7c2b}.Q1g24G_privateNote{color:color-mix(in srgb, var(--mg-ink,#352e29) 43%, transparent);align-items:center;gap:6px;margin-inline-start:auto;font-size:10px;display:inline-flex}.Q1g24G_region:focus-visible,.Q1g24G_space:focus-visible,.Q1g24G_utility:focus-visible,.Q1g24G_constellationStatus:focus-visible,.Q1g24G_settings:focus-visible{outline:2px solid var(--mg-indigo,#445c7c);outline-offset:2px}.Q1g24G_sidebar[data-compact=true] .Q1g24G_identity strong,.Q1g24G_sidebar[data-compact=true] .Q1g24G_settings span,.Q1g24G_sidebar[data-compact=true] .Q1g24G_privateNote,.Q1g24G_sidebar[data-compact=true] .Q1g24G_constellationStatus span{display:none}.Q1g24G_sidebar[data-compact=true] .Q1g24G_topbar{grid-template-columns:30px minmax(420px,1fr) auto}@media (width<=980px){.Q1g24G_topbar{grid-template-columns:minmax(0,1fr) auto;gap:10px;padding:9px 16px 7px}.Q1g24G_identity{display:none}.Q1g24G_regionNavigation{justify-self:stretch;max-width:none}.Q1g24G_region{min-height:38px;padding-inline:7px}.Q1g24G_region:after{inset-block-end:-8px}.Q1g24G_settings span,.Q1g24G_constellationStatus span,.Q1g24G_utility{display:none}.Q1g24G_spaceNavigation{padding-inline:16px}.Q1g24G_regionContext{min-width:72px}}@media (width<=620px){.Q1g24G_topbar{padding:6px 8px 5px;display:block}.Q1g24G_regionNavigation{grid-template-columns:repeat(5,minmax(0,1fr));gap:1px}.Q1g24G_region{flex-direction:column;gap:2px;min-width:0;min-height:45px;padding:4px 2px;font-size:10px}.Q1g24G_region:after{inset:auto 12px -6px}.Q1g24G_utilities{position:absolute;inset:57px 8px auto auto}.Q1g24G_constellationStatus{display:none}.Q1g24G_settings{background:0 0;border-color:#0000;width:34px;padding:0}.Q1g24G_spaceNavigation{gap:4px;min-height:43px;padding:6px 50px 6px 8px;overflow-x:auto}.Q1g24G_regionContext,.Q1g24G_privateNote{display:none}.Q1g24G_space{min-width:max-content;min-height:31px;padding-inline:10px}}@media (prefers-reduced-motion:reduce){.Q1g24G_region,.Q1g24G_region:after,.Q1g24G_space,.Q1g24G_utility,.Q1g24G_constellationStatus,.Q1g24G_settings{transition:none}}.Q1g24G_sidebar{color:var(--mg-ink,#342d27);background:linear-gradient(100deg, #fffdf8f0, #f7eddeeb), var(--mg-xuan-texture);font-family:var(--mg-font-ui,\"Noto Sans SC\", sans-serif);background-size:auto,560px;border-block-end-color:#533e2d21;box-shadow:0 10px 30px #46311f12}.Q1g24G_topbar{grid-template-columns:minmax(170px,.78fr) minmax(480px,2.5fr) minmax(230px,1fr);min-height:70px;padding-inline:30px}.Q1g24G_identity svg{color:var(--mg-brass,#a77d43)}.Q1g24G_identity strong{font-family:var(--mg-font-reflection,\"Mind Garden Display\", \"Noto Serif SC\", serif);letter-spacing:.04em;font-size:16px;font-weight:560}.Q1g24G_region{border-radius:9px;min-height:44px}.Q1g24G_region:hover{background:#ffffff5c}.Q1g24G_region[data-active=true]{color:var(--mg-indigo,#405f87);background:0 0}.Q1g24G_region:after{background:var(--mg-indigo,#405f87);inset-block-end:-13px}.Q1g24G_utilities{gap:6px}.Q1g24G_utility,.Q1g24G_constellationStatus,.Q1g24G_settings{background:#fffcf67a;border-color:#533e2d21;border-radius:9px}.Q1g24G_settings{white-space:nowrap;min-width:max-content}.Q1g24G_spaceNavigation{background:#f1e4d161;border-block-start-color:#533e2d12;min-height:44px}.Q1g24G_space{min-height:31px;color:var(--mg-muted,#76695e);background:0 0;position:relative}.Q1g24G_space[data-active=true]{color:var(--mg-indigo,#405f87);box-shadow:none;background:0 0}.Q1g24G_space[data-active=true]:after{background:var(--mg-indigo,#405f87);content:\"\";border-radius:2px;height:2px;position:absolute;inset:auto 12px -7px}.Q1g24G_privateNote,.Q1g24G_regionContext{color:var(--mg-muted,#76695e)}@media (width<=980px){.Q1g24G_topbar{grid-template-columns:minmax(0,1fr) auto}}@media (width<=620px){.Q1g24G_region[data-active=true]{background:#ffffff5c}.Q1g24G_space[data-active=true]:after{inset-block-end:-6px}}.Q1g24G_topbar{grid-template-columns:auto minmax(420px,1fr) auto;gap:clamp(16px,2.2vw,30px);min-height:64px;padding-inline:clamp(18px,2.4vw,30px)}.Q1g24G_identity{min-width:132px}.Q1g24G_identity>svg,.Q1g24G_region>svg,.Q1g24G_space>svg,.Q1g24G_utility>svg,.Q1g24G_constellationStatus>svg,.Q1g24G_settings>svg,.Q1g24G_privateNote>svg{flex:none;display:block;overflow:visible}.Q1g24G_region,.Q1g24G_space,.Q1g24G_utility,.Q1g24G_constellationStatus,.Q1g24G_settings{line-height:1}.Q1g24G_region>svg,.Q1g24G_space>svg{flex-basis:18px;width:18px;height:18px}.Q1g24G_region>span,.Q1g24G_space>span{line-height:1.2;display:block}.Q1g24G_region{gap:8px;min-height:42px;padding:6px 10px}.Q1g24G_region:after{inset-block-end:-12px}.Q1g24G_utilities{flex-wrap:nowrap}.Q1g24G_utility,.Q1g24G_settings,.Q1g24G_constellationStatus{min-height:40px}.Q1g24G_utility{width:40px}.Q1g24G_constellationStatus{padding-inline:11px}.Q1g24G_constellationStatus span{max-width:112px}.Q1g24G_settings{padding-inline:11px}.Q1g24G_spaceNavigation{min-height:46px;padding-block:7px}.Q1g24G_space{gap:8px;min-height:38px;padding:6px 11px}.Q1g24G_space[data-active=true]:after{inset-block-end:-5px}@media (width<=1040px){.Q1g24G_topbar{grid-template-columns:minmax(0,1fr) auto;padding-block:7px}.Q1g24G_identity,.Q1g24G_settings>svg:last-child,.Q1g24G_constellationStatus span{display:none}.Q1g24G_constellationStatus{width:40px;padding:0}}@media (width<=620px){.Q1g24G_topbar{min-height:58px;padding:5px 6px 4px}.Q1g24G_regionNavigation{gap:2px}.Q1g24G_region{border-radius:9px;gap:4px;min-height:49px;padding:5px 1px;font-size:11px}.Q1g24G_region>svg{flex-basis:17px;width:17px;height:17px}.Q1g24G_region:after{inset:auto 12px -4px}.Q1g24G_utilities{z-index:2;inset:62px 7px auto auto}.Q1g24G_settings{width:40px;min-height:40px}.Q1g24G_spaceNavigation{scrollbar-width:none;min-height:48px;padding:5px 50px 5px 8px}.Q1g24G_spaceNavigation::-webkit-scrollbar{display:none}.Q1g24G_space{gap:7px;min-height:40px;padding-inline:10px;font-size:12px}.Q1g24G_space>svg{flex-basis:17px;width:17px;height:17px}.Q1g24G_space[data-active=true]:after{inset-block-end:-4px}}.Q1g24G_sidebar{border-block-end:0;box-shadow:0 10px 30px #4d3a2a0f}.Q1g24G_sidebar:after,.Q1g24G_region:after,.Q1g24G_space[data-active=true]:after{display:none}.Q1g24G_spaceNavigation{background:#f1e4d13d;border-block-start:0}.Q1g24G_space[data-active=true]{color:var(--mg-indigo,#405f87);background:#fffcf6b8;box-shadow:0 8px 22px #4a362512}@media (width<=620px){.Q1g24G_space,.Q1g24G_settings,.Q1g24G_utility,.Q1g24G_constellationStatus{min-height:44px}.Q1g24G_utility,.Q1g24G_constellationStatus,.Q1g24G_settings{width:44px}.Q1g24G_spaceNavigation{padding-inline-end:54px;mask-image:linear-gradient(90deg,#000 0 calc(100% - 22px),#0000 100%)}}";
		const tagId$17 = "@deepseek-ai/dsh-mind-garden/GardenSidebar.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$17) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-mind-garden";
			tag.dataset.pluginCss = tagId$17;
			tag.textContent = css$17;
			document.head.appendChild(tag);
		}
		var GardenSidebar_module_css_default = {
			"constellationStatus": "Q1g24G_constellationStatus",
			"identity": "Q1g24G_identity",
			"privateNote": "Q1g24G_privateNote",
			"region": "Q1g24G_region",
			"regionContext": "Q1g24G_regionContext",
			"regionNavigation": "Q1g24G_regionNavigation",
			"settings": "Q1g24G_settings",
			"sidebar": "Q1g24G_sidebar",
			"space": "Q1g24G_space",
			"spaceNavigation": "Q1g24G_spaceNavigation",
			"topbar": "Q1g24G_topbar",
			"utilities": "Q1g24G_utilities",
			"utility": "Q1g24G_utility"
		};
		//#endregion
		//#region lib/types/client/GardenSidebar.js
		const NAV_REGIONS = [
			{
				id: "now",
				label: "space.region.now",
				icon: TodayIcon,
				items: [{
					id: "today",
					label: "space.today",
					icon: TodayIcon
				}]
			},
			{
				id: "inner-life",
				label: "space.region.innerLife",
				icon: ConcernsIcon,
				items: [{
					id: "concerns",
					label: "space.concerns",
					icon: ConcernsIcon
				}, {
					id: "growth",
					label: "space.growth",
					icon: GrowthIcon
				}]
			},
			{
				id: "time",
				label: "space.region.time",
				icon: CalendarIcon,
				items: [{
					id: "calendar",
					label: "space.calendar",
					icon: CalendarIcon
				}, {
					id: "life",
					label: "space.life",
					icon: LifeReviewIcon
				}]
			},
			{
				id: "keepsakes",
				label: "space.region.keepsakes",
				icon: PhotoStoryIcon,
				items: [{
					id: "photo-story",
					label: "space.photoStory",
					icon: PhotoStoryIcon
				}, {
					id: "memory",
					label: "space.memory",
					icon: MemoryIcon
				}]
			},
			{
				id: "star-garden",
				label: "space.region.starGarden",
				icon: StarMapIcon,
				items: [{
					id: "star-map",
					label: "space.starMap",
					icon: StarMapIcon
				}, {
					id: "philosophy",
					label: "space.philosophy",
					icon: PhilosophyIcon
				}]
			}
		];
		/** Render the five garden regions and the exact spaces inside the active region. */
		function GardenSidebar({ activeSpace, collapsed, starState, starCount, onSelect, onSettings, onToggle, t }) {
			const activeRegion = NAV_REGIONS.find((region) => region.items.some((item) => item.id === activeSpace)) ?? NAV_REGIONS[0];
			return (0, react_jsx_runtime.jsxs)("header", {
				className: GardenSidebar_module_css_default.sidebar,
				"data-compact": collapsed,
				"aria-label": t("space.navigation"),
				children: [(0, react_jsx_runtime.jsxs)("div", {
					className: GardenSidebar_module_css_default.topbar,
					children: [
						(0, react_jsx_runtime.jsxs)("span", {
							className: GardenSidebar_module_css_default.identity,
							"aria-label": t("space.title"),
							children: [(0, react_jsx_runtime.jsx)(GardenMarkIcon, { size: 23 }), (0, react_jsx_runtime.jsx)("strong", { children: t("space.title") })]
						}),
						(0, react_jsx_runtime.jsx)("nav", {
							className: GardenSidebar_module_css_default.regionNavigation,
							"aria-label": t("space.regions"),
							children: NAV_REGIONS.map((region) => {
								const RegionIcon = region.icon;
								const active = region.id === activeRegion.id;
								return (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: GardenSidebar_module_css_default.region,
									"data-active": active,
									"aria-pressed": active,
									onClick: () => {
										onSelect(region.items[0].id);
									},
									children: [(0, react_jsx_runtime.jsx)(RegionIcon, { size: 17 }), (0, react_jsx_runtime.jsx)("span", { children: t(region.label) })]
								}, region.id);
							})
						}),
						(0, react_jsx_runtime.jsxs)("div", {
							className: GardenSidebar_module_css_default.utilities,
							children: [
								(0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: GardenSidebar_module_css_default.constellationStatus,
									onClick: () => {
										onSelect("star-map");
									},
									"aria-label": `${t("star.sidebar.title")} · ${t(`star.sidebar.${starState}.title`)}`,
									title: t(`star.sidebar.${starState}.detail`),
									children: [(0, react_jsx_runtime.jsx)(StarMapIcon, { size: 17 }), (0, react_jsx_runtime.jsx)("span", { children: starCount > 0 ? starCount : t(`star.sidebar.${starState}.title`) })]
								}),
								(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: GardenSidebar_module_css_default.utility,
									onClick: onToggle,
									"aria-label": collapsed ? t("space.expand") : t("space.collapse"),
									title: collapsed ? t("space.expand") : t("space.collapse"),
									children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPanelLeftOutline16, { size: 16 })
								}),
								(0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: GardenSidebar_module_css_default.settings,
									onClick: (event) => {
										onSettings(event.currentTarget);
									},
									"aria-label": t("garden.settings"),
									children: [
										(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSettingsOutline16, { size: 16 }),
										(0, react_jsx_runtime.jsx)("span", { children: t("garden.settings") }),
										(0, react_jsx_runtime.jsx)(PrivateIcon, { size: 13 })
									]
								})
							]
						})
					]
				}), (0, react_jsx_runtime.jsxs)("nav", {
					className: GardenSidebar_module_css_default.spaceNavigation,
					"aria-label": t(activeRegion.label),
					children: [
						(0, react_jsx_runtime.jsx)("span", {
							className: GardenSidebar_module_css_default.regionContext,
							children: t(activeRegion.label)
						}),
						activeRegion.items.map((item) => {
							const ItemIcon = item.icon;
							return (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: GardenSidebar_module_css_default.space,
								"data-active": activeSpace === item.id,
								"aria-current": activeSpace === item.id ? "page" : void 0,
								onClick: () => {
									onSelect(item.id);
								},
								children: [(0, react_jsx_runtime.jsx)(ItemIcon, { size: 16 }), (0, react_jsx_runtime.jsx)("span", { children: t(item.label) })]
							}, item.id);
						}),
						(0, react_jsx_runtime.jsxs)("span", {
							className: GardenSidebar_module_css_default.privateNote,
							children: [(0, react_jsx_runtime.jsx)(PrivateIcon, { size: 13 }), t("space.private")]
						})
					]
				})]
			});
		}
		//#endregion
		//#region lib/types/client/generated-assets.js
		/** Generated package resource URLs for raster assets. Do not edit by hand. */
		/** Package-owned garden threshold warm image. */
		const GARDEN_THRESHOLD_WARM = "/plugins/@deepseek-ai/dsh-mind-garden/assets/garden-threshold-warm.webp";
		/** Package-owned concern paper lattice image. */
		const CONCERN_PAPER_LATTICE_V3 = "/plugins/@deepseek-ai/dsh-mind-garden/assets/concern-paper-lattice-v3.webp";
		/** Package-owned memory archive alcove image. */
		const MEMORY_ARCHIVE_ALCOVE_V3 = "/plugins/@deepseek-ai/dsh-mind-garden/assets/memory-archive-alcove-v3.webp";
		/** Package-owned growth observation bench image. */
		const GROWTH_OBSERVATION_BENCH_V3 = "/plugins/@deepseek-ai/dsh-mind-garden/assets/growth-observation-bench-v3.webp";
		/** Package-owned philosophy folio room image. */
		const PHILOSOPHY_FOLIO_ROOM_V3 = "/plugins/@deepseek-ai/dsh-mind-garden/assets/philosophy-folio-room-v3.webp";
		/** Package-owned life time corridor image. */
		const LIFE_TIME_CORRIDOR_V3 = "/plugins/@deepseek-ai/dsh-mind-garden/assets/life-time-corridor-v3.webp";
		/** Package-owned open-album rainy-night memory theatre image. */
		const PHOTO_MEMORY_STAGE_V5 = "/plugins/@deepseek-ai/dsh-mind-garden/assets/photo-memory-stage-v5.webp";
		/** Package-owned deep mist-lake New Chinese observatory image. */
		const STAR_MIST_COURTYARD_V5 = "/plugins/@deepseek-ai/dsh-mind-garden/assets/star-mist-courtyard-v5.webp";
		/** Package-owned immersive morning New Chinese home courtyard image. */
		const GARDEN_HOME_COURTYARD_V4 = "/plugins/@deepseek-ai/dsh-mind-garden/assets/garden-home-courtyard-v4.webp";
		//#endregion
		//#region \0dsh-css:E:\test code\deepseekharness_modified\deepseek-harness\packages\client\ui-mind-garden\src\client\EditorialOrbit.module.css.mjs
		const css$16 = ".cL3SbW_corridor{--corridor-tilt-x:0deg;--corridor-tilt-y:0deg;--corridor-light-x:28%;width:100%;min-height:clamp(520px,100svh - 150px,660px);color:var(--mg-ink,#342d27);isolation:isolate;perspective:1600px;touch-action:pan-y;background:#ead7bc;margin:0;position:relative;overflow:hidden}.cL3SbW_entry{z-index:6;background:linear-gradient(90deg,#fffaf1e0 0 58%,#fffaf147 84%,#0000),linear-gradient(#fffcf661,#0000 34% 72%,#5c3e240f);align-content:center;width:min(46%,610px);padding:clamp(46px,6vw,82px) clamp(30px,5vw,70px);display:grid;position:absolute;inset:0 auto 0 0}.cL3SbW_defaultEntry{gap:6px;display:grid}.cL3SbW_defaultEntry strong{font-family:var(--mg-font-reflection,\"Mind Garden Display\", \"Noto Serif SC\", serif);font-size:32px}.cL3SbW_defaultEntry small{color:var(--mg-muted,#76695e)}.cL3SbW_scene{z-index:1;background:var(--mg-courtyard-scene) 50% 50% / cover no-repeat;transform:rotateX(var(--corridor-tilt-x)) rotateY(var(--corridor-tilt-y)) scale(1.016);transform-origin:54%;transform-style:preserve-3d;transition:transform .6s cubic-bezier(.16,1,.3,1);position:absolute;inset:0;overflow:hidden}.cL3SbW_scene:before,.cL3SbW_scene:after{z-index:0;content:\"\";pointer-events:none;position:absolute;inset:0}.cL3SbW_scene:before{background:linear-gradient(90deg,#fffaf157,#0000 45%),linear-gradient(#0000 69%,#36271b2e),linear-gradient(#4a311d0f,#0000 24%)}.cL3SbW_scene:after{background:radial-gradient(at 69% 48%,#0000 0 35%,#30221814 100%)}.cL3SbW_morningLight{z-index:1;inset:-20% auto auto calc(var(--corridor-light-x) - 28%);pointer-events:none;background:linear-gradient(108deg,#0000 5%,#fff5d22b 43%,#0000 75%);width:58%;height:108%;transition:inset-inline-start .18s linear;position:absolute;transform:skew(-10deg)}.cL3SbW_path{display:none}.cL3SbW_stations{z-index:4;margin:0;padding:0;list-style:none;position:absolute;inset:0}.cL3SbW_stations li{width:clamp(178px,18vw,236px);position:absolute}.cL3SbW_stations li[data-position=\"1\"]{inset:auto auto 8% 43%}.cL3SbW_stations li[data-position=\"2\"]{inset:auto 17% 17% auto}.cL3SbW_stations li[data-position=\"3\"]{inset:14% 3.5% auto auto}.cL3SbW_station{color:inherit;align-items:center;gap:10px;text-decoration:none;transition:transform .24s cubic-bezier(.16,1,.3,1);display:flex;position:relative;transform:translateZ(30px)}.cL3SbW_station:before{background:var(--mg-brass,#a77d43);content:\"\";border:2px solid #fffaf1e0;border-radius:50%;flex:0 0 9px;width:9px;height:9px;box-shadow:0 5px 14px #432f1d47}.cL3SbW_station:hover{transform:translate3d(0,-5px,42px)}.cL3SbW_material{display:none}.cL3SbW_stationCopy{min-width:0;color:var(--mg-ink,#342d27);background:linear-gradient(125deg, #fffdf7f0, #f7ecdce0), var(--mg-xuan-texture);background-size:auto,340px;border-radius:10px;gap:3px;padding:11px 13px 10px;display:grid;box-shadow:7px 13px 30px #3f2c1e2b}.cL3SbW_stationCopy small,.cL3SbW_stationCopy em{color:var(--mg-muted,#76695e);font-size:10px;font-style:normal;line-height:1.35}.cL3SbW_stationCopy strong{font-family:var(--mg-font-ui,\"Noto Sans SC\", sans-serif);-webkit-line-clamp:2;-webkit-box-orient:vertical;font-size:13px;font-weight:650;line-height:1.45;display:-webkit-box;overflow:hidden}.cL3SbW_stationCopy em{color:var(--mg-indigo,#405f87);font-weight:650}.cL3SbW_station:focus-visible{outline:3px solid var(--mg-indigo,#405f87);outline-offset:4px;border-radius:11px}.cL3SbW_sceneNote{z-index:4;color:#fffaf2;background:#2c3844ad;border-radius:8px;align-items:center;gap:8px;padding:7px 10px;display:flex;position:absolute;inset:26px 28px auto auto;box-shadow:5px 10px 24px #281f1926}.cL3SbW_sceneNote strong{white-space:nowrap;font-size:10px}.cL3SbW_sceneNote span{color:#fffaf2b8;font-size:9px}@container cL3SbW_mind-garden-workspace (width<=980px){.cL3SbW_corridor{min-height:700px}.cL3SbW_entry{background:linear-gradient(#fffaf1f5 0 64%,#fffaf19e 82%,#0000);align-content:start;width:auto;height:330px;padding:42px 34px;inset:0 0 auto}.cL3SbW_scene{background-position:58%}.cL3SbW_scene:before{background:linear-gradient(#0000 58%,#36271b38)}.cL3SbW_stations li[data-position=\"1\"]{inset:auto auto 4% 4%}.cL3SbW_stations li[data-position=\"2\"]{inset:auto 34% 7% auto}.cL3SbW_stations li[data-position=\"3\"]{inset:auto 4% 12% auto}.cL3SbW_sceneNote{display:none}}@container cL3SbW_mind-garden-workspace (width<=620px){.cL3SbW_corridor{min-height:650px}.cL3SbW_entry{background:linear-gradient(#fffaf1f7 0 65%,#fffaf1b8 82%,#0000);height:318px;padding:30px 20px}.cL3SbW_scene{background-position:61%;transform:none}.cL3SbW_morningLight{display:none}.cL3SbW_stations{gap:7px;display:grid;inset:auto 10px 10px}.cL3SbW_stations li,.cL3SbW_stations li[data-position=\"1\"],.cL3SbW_stations li[data-position=\"2\"],.cL3SbW_stations li[data-position=\"3\"]{width:100%;position:static}.cL3SbW_station{gap:7px;transform:none}.cL3SbW_station:before{flex-basis:7px;width:7px;height:7px}.cL3SbW_stationCopy{grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:2px 8px;width:100%;padding:8px 10px;box-shadow:4px 8px 18px #3f2c1e24}.cL3SbW_stationCopy small,.cL3SbW_stationCopy strong{grid-column:1}.cL3SbW_stationCopy strong{-webkit-line-clamp:1;font-size:12px}.cL3SbW_stationCopy em{grid-area:1/2/3}}@container cL3SbW_mind-garden-workspace (width<=390px){.cL3SbW_corridor{min-height:620px}.cL3SbW_entry{height:304px;padding-inline:16px}.cL3SbW_stationCopy em{display:none}}@media (width<=620px){.cL3SbW_corridor{min-height:610px}.cL3SbW_entry{background:linear-gradient(#fffaf1fa 0 70%,#fffaf1ad 88%,#0000);align-content:start;width:auto;height:300px;padding:24px 18px;inset:0 0 auto}.cL3SbW_scene{background-position:61%;transform:none}.cL3SbW_scene:before{background:linear-gradient(#0000 58%,#36271b38)}.cL3SbW_morningLight,.cL3SbW_sceneNote{display:none}.cL3SbW_stations{gap:7px;display:grid;inset:auto 10px 10px}.cL3SbW_stations li,.cL3SbW_stations li[data-position=\"1\"],.cL3SbW_stations li[data-position=\"2\"],.cL3SbW_stations li[data-position=\"3\"]{width:100%;position:static}.cL3SbW_station{gap:7px;transform:none}.cL3SbW_station:before{flex-basis:7px;width:7px;height:7px}.cL3SbW_stationCopy{grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:2px 8px;width:100%;padding:8px 10px;box-shadow:4px 8px 18px #3f2c1e24}.cL3SbW_stationCopy small,.cL3SbW_stationCopy strong{grid-column:1}.cL3SbW_stationCopy strong{-webkit-line-clamp:1;font-size:12px}.cL3SbW_stationCopy em{grid-area:1/2/3}}@media (width<=390px){.cL3SbW_corridor{min-height:590px}.cL3SbW_entry{height:288px;padding-inline:16px}.cL3SbW_stationCopy em{display:none}}@media (prefers-reduced-motion:reduce){.cL3SbW_scene,.cL3SbW_station,.cL3SbW_morningLight{transition:none;transform:none}}";
		const tagId$16 = "@deepseek-ai/dsh-mind-garden/EditorialOrbit.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$16) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-mind-garden";
			tag.dataset.pluginCss = tagId$16;
			tag.textContent = css$16;
			document.head.appendChild(tag);
		}
		var EditorialOrbit_module_css_default = {
			"corridor": "cL3SbW_corridor",
			"defaultEntry": "cL3SbW_defaultEntry",
			"entry": "cL3SbW_entry",
			"material": "cL3SbW_material",
			"mind-garden-workspace": "cL3SbW_mind-garden-workspace",
			"morningLight": "cL3SbW_morningLight",
			"path": "cL3SbW_path",
			"scene": "cL3SbW_scene",
			"sceneNote": "cL3SbW_sceneNote",
			"station": "cL3SbW_station",
			"stationCopy": "cL3SbW_stationCopy",
			"stations": "cL3SbW_stations"
		};
		//#endregion
		//#region lib/types/client/EditorialOrbit.js
		/** Responsive paper corridor for the Today workspace. */
		/** Render truthful records as three navigable stations in the morning paper corridor. */
		function EditorialOrbit({ questions, reviews, mode, t, children }) {
			const modeLabel = mode === "serenity" ? t("mode.serenity") : t("mode.clarity");
			const currentQuestion = questions.find((item) => item.status === "open");
			const currentReview = reviews.find((item) => item.status === "saved");
			const openCount = questions.filter((item) => item.status === "open").length;
			const savedCount = reviews.filter((item) => item.status === "saved").length;
			const corridorRef = (0, react.useRef)(null);
			const tiltFrame = (0, react.useRef)(void 0);
			const pointerPosition = (0, react.useRef)({
				x: 0,
				y: 0
			});
			const stations = [
				{
					id: "checkin",
					href: "#mind-garden-today-title",
					label: t("today.observatory.checkin"),
					meta: modeLabel,
					kind: "porcelain"
				},
				{
					id: "question",
					href: "#mind-garden-questions-title",
					label: currentQuestion?.question ?? t("orbit.fallback.stillness"),
					meta: t("today.echo.question"),
					kind: "paper"
				},
				{
					id: "review",
					href: "#mind-garden-reviews-title",
					label: currentReview?.content ?? t("orbit.fallback.memory"),
					meta: t("today.echo.review"),
					kind: "stone"
				}
			];
			(0, react.useEffect)(() => () => {
				if (tiltFrame.current !== void 0) window.cancelAnimationFrame(tiltFrame.current);
			}, []);
			function tiltCorridor(event) {
				if (event.pointerType === "touch") return;
				const bounds = event.currentTarget.getBoundingClientRect();
				pointerPosition.current = {
					x: (event.clientX - bounds.left) / bounds.width - .5,
					y: (event.clientY - bounds.top) / bounds.height - .5
				};
				if (tiltFrame.current !== void 0) return;
				tiltFrame.current = window.requestAnimationFrame(() => {
					tiltFrame.current = void 0;
					const target = corridorRef.current;
					/* v8 ignore next -- a scheduled frame can outlive HMR disposal. */
					if (target === null) return;
					const next = pointerPosition.current;
					target.style.setProperty("--corridor-tilt-x", `${(-next.y * 1.8).toFixed(2)}deg`);
					target.style.setProperty("--corridor-tilt-y", `${(next.x * 2.4).toFixed(2)}deg`);
					target.style.setProperty("--corridor-light-x", `${((next.x + .5) * 100).toFixed(1)}%`);
				});
			}
			function settleCorridor() {
				if (tiltFrame.current !== void 0) window.cancelAnimationFrame(tiltFrame.current);
				tiltFrame.current = void 0;
				const target = corridorRef.current;
				if (target === null) return;
				target.style.setProperty("--corridor-tilt-x", "0deg");
				target.style.setProperty("--corridor-tilt-y", "0deg");
				target.style.setProperty("--corridor-light-x", "28%");
			}
			return (0, react_jsx_runtime.jsxs)("figure", {
				ref: corridorRef,
				className: EditorialOrbit_module_css_default.corridor,
				style: { "--mg-courtyard-scene": `url("${GARDEN_HOME_COURTYARD_V4}")` },
				"aria-label": t("orbit.label"),
				onPointerMove: tiltCorridor,
				onPointerLeave: settleCorridor,
				children: [(0, react_jsx_runtime.jsx)("div", {
					className: EditorialOrbit_module_css_default.entry,
					children: children ?? (0, react_jsx_runtime.jsxs)("span", {
						className: EditorialOrbit_module_css_default.defaultEntry,
						children: [(0, react_jsx_runtime.jsx)("strong", { children: t("orbit.center") }), (0, react_jsx_runtime.jsx)("small", { children: modeLabel })]
					})
				}), (0, react_jsx_runtime.jsxs)("div", {
					className: EditorialOrbit_module_css_default.scene,
					children: [
						(0, react_jsx_runtime.jsx)("span", {
							className: EditorialOrbit_module_css_default.morningLight,
							"aria-hidden": "true"
						}),
						(0, react_jsx_runtime.jsxs)("svg", {
							className: EditorialOrbit_module_css_default.path,
							viewBox: "0 0 760 330",
							preserveAspectRatio: "none",
							"aria-hidden": "true",
							children: [
								(0, react_jsx_runtime.jsx)("path", { d: "M38 260 C155 180 240 238 336 152 S530 148 722 56" }),
								(0, react_jsx_runtime.jsx)("circle", {
									cx: "62",
									cy: "244",
									r: "4"
								}),
								(0, react_jsx_runtime.jsx)("circle", {
									cx: "346",
									cy: "142",
									r: "4"
								}),
								(0, react_jsx_runtime.jsx)("circle", {
									cx: "700",
									cy: "68",
									r: "4"
								})
							]
						}),
						(0, react_jsx_runtime.jsx)("ol", {
							className: EditorialOrbit_module_css_default.stations,
							children: stations.map((station, index) => (0, react_jsx_runtime.jsx)("li", {
								"data-kind": station.kind,
								"data-position": index + 1,
								children: (0, react_jsx_runtime.jsxs)("a", {
									href: station.href,
									className: EditorialOrbit_module_css_default.station,
									children: [(0, react_jsx_runtime.jsxs)("span", {
										className: EditorialOrbit_module_css_default.material,
										"aria-hidden": "true",
										children: [
											station.kind === "porcelain" && (0, react_jsx_runtime.jsx)("span", { className: EditorialOrbit_module_css_default.porcelainToken }),
											station.kind === "paper" && (0, react_jsx_runtime.jsx)("span", { className: EditorialOrbit_module_css_default.paperFold }),
											station.kind === "stone" && (0, react_jsx_runtime.jsx)("span", { className: EditorialOrbit_module_css_default.stoneSeal })
										]
									}), (0, react_jsx_runtime.jsxs)("span", {
										className: EditorialOrbit_module_css_default.stationCopy,
										children: [
											(0, react_jsx_runtime.jsx)("small", { children: station.meta }),
											(0, react_jsx_runtime.jsx)("strong", { children: station.label }),
											(0, react_jsx_runtime.jsxs)("em", { children: [t("orbit.fallback.return"), " →"] })
										]
									})]
								})
							}, station.id))
						}),
						(0, react_jsx_runtime.jsxs)("aside", {
							className: EditorialOrbit_module_css_default.sceneNote,
							children: [(0, react_jsx_runtime.jsx)("strong", { children: t("today.echo.title") }), (0, react_jsx_runtime.jsx)("span", { children: t("orbit.summary").replace("{questions}", String(openCount)).replace("{reviews}", String(savedCount)) })]
						})
					]
				})]
			});
		}
		//#endregion
		//#region lib/types/client/settle-action.js
		/** Local failure boundary for presentation callbacks supplied by the Host adapter. */
		/**
		* Convert an unexpected rejected callback into the same settled result shape
		* that ordinary Remote failures use, so loading and pending UI can always recover.
		* @param operation - Host-backed action to invoke once.
		* @returns The action result, or an unavailable result when the action rejects.
		*/
		async function settleMindGardenAction(operation) {
			try {
				return await operation();
			} catch {
				return {
					ok: false,
					code: "unavailable"
				};
			}
		}
		//#endregion
		//#region lib/types/client/star-map/model.js
		/** Deterministic constellation model derived from encrypted reflection records. */
		function hash(value) {
			let result = 2166136261;
			for (const character of value) {
				result ^= character.charCodeAt(0);
				result = Math.imul(result, 16777619);
			}
			return result >>> 0;
		}
		function position(id, index, count) {
			const seed = hash(id) / 4294967295;
			const fraction = (index + .5) / Math.max(1, count);
			const inclination = Math.acos(1 - 2 * fraction);
			const azimuth = Math.PI * (1 + Math.sqrt(5)) * index + seed * Math.PI;
			const distance = 19 + index % 4 * 4 + seed * 5;
			return {
				x: Math.sin(inclination) * Math.cos(azimuth) * distance,
				y: Math.cos(inclination) * distance * .72,
				z: Math.sin(inclination) * Math.sin(azimuth) * distance
			};
		}
		/**
		* Build a bounded, repeatable 3D constellation from records already available to the view.
		* @param questions - open and closed questions in service display order.
		* @param reviews - proposed, saved, and archived reviews in service display order.
		* @param mode - current dialogue posture represented by the center star.
		* @param labels - localized labels and interpolation templates.
		* @param profile - optional completed private profile represented by the center star.
		* @param traits - governed private traits represented as first-ring stars.
		* @returns the constellation nodes and links.
		*/
		function createGardenStarMap(questions, reviews, mode, labels, profile, traits = []) {
			const visibleTraits = traits.filter((item) => item.status !== "retired").slice(0, 16);
			const visibleQuestions = questions.filter((item) => item.status === "open").slice(0, 18);
			const visibleReviews = reviews.filter((item) => item.status !== "archived").slice(0, 12);
			const total = visibleTraits.length + visibleQuestions.length + visibleReviews.length;
			const nodes = [{
				id: "center",
				kind: "center",
				title: profile?.displayName || labels.center,
				detail: mode === "serenity" ? labels.serenity : labels.clarity,
				status: mode,
				x: 0,
				y: 0,
				z: 0,
				radius: 2.2
			}];
			visibleTraits.forEach((trait, index) => {
				nodes.push({
					id: `trait:${String(trait.id)}`,
					kind: "trait",
					title: trait.label,
					detail: trait.description || labels.traitDetail,
					status: trait.status,
					...position(String(trait.id), index, total),
					radius: trait.status === "confirmed" ? 1.2 : 1
				});
			});
			visibleQuestions.forEach((question, index) => {
				nodes.push({
					id: `question:${String(question.id)}`,
					kind: "question",
					title: question.question,
					detail: question.source?.evidenceQuote ?? labels.since.replace("{date}", question.createdStamp.localDate),
					status: question.status,
					...position(String(question.id), visibleTraits.length + index, total),
					radius: .76
				});
			});
			visibleReviews.forEach((review, reviewIndex) => {
				const index = visibleTraits.length + visibleQuestions.length + reviewIndex;
				nodes.push({
					id: `review:${String(review.id)}`,
					kind: "review",
					title: review.content.split("\n", 1)[0]?.slice(0, 72) || labels.unnamedReview,
					detail: labels.reviewDetail.replace("{start}", review.startStamp.localDate).replace("{end}", review.endStamp.localDate).replace("{count}", String(review.sources.length)),
					status: review.status,
					...position(String(review.id), index, total),
					radius: review.status === "saved" ? 1.12 : .92
				});
			});
			const links = nodes.slice(1).map((node) => ({
				id: `orbit:${node.id}`,
				source: "center",
				target: node.id,
				kind: "orbit"
			}));
			let previousReview;
			for (const review of visibleReviews) {
				if (previousReview !== void 0) links.push({
					id: `continuity:${String(previousReview.id)}:${String(review.id)}`,
					source: `review:${String(previousReview.id)}`,
					target: `review:${String(review.id)}`,
					kind: "continuity"
				});
				previousReview = review;
			}
			return {
				nodes,
				links
			};
		}
		//#endregion
		//#region lib/types/client/scene-loader.js
		/** Lazy boundary for GPU renderers that are unnecessary in ordinary conversation. */
		var __rewriteRelativeImportExtension = function(path, preserveJsx) {
			if (typeof path === "string" && /^\.\.?\//.test(path)) return path.replace(/\.(tsx)$|((?:\.d)?)((?:\.[^./]+?)?)\.([cm]?)ts$/i, function(m, tsx, d, ext, cm) {
				return tsx ? preserveJsx ? ".jsx" : ".js" : d && (!ext || !cm) ? m : d + ext + "." + cm.toLowerCase() + "js";
			});
			return path;
		};
		const HEAVY_SCENES_URL = "/plugins/@deepseek-ai/dsh-mind-garden/heavy-scenes.js";
		let scenesPromise;
		/**
		* Download and evaluate Three.js only after a GPU-backed garden space is visible.
		* A failed import is not cached, so a later mount can retry it.
		* @returns The shared renderer-module import; rejects when download or evaluation fails.
		*/
		function loadMindGardenScenes() {
			scenesPromise ??= import(__rewriteRelativeImportExtension(
				/* @vite-ignore */
				HEAVY_SCENES_URL
			)).catch((error) => {
				scenesPromise = void 0;
				throw error;
			});
			return scenesPromise;
		}
		//#endregion
		//#region \0dsh-css:E:\test code\deepseekharness_modified\deepseek-harness\packages\client\ui-mind-garden\src\client\star-map\StarField.module.css.mjs
		const css$15 = ".qozxNq_scene{--mg-star-bg:#07101a;--mg-star-center:#efbd70;--mg-star-trait:#d68867;--mg-star-question:#a8c4e4;--mg-star-review:#b4cbc5;--mg-star-orbit:#f4e5cd;--mg-star-continuity:#c7bcae;z-index:2;background:0 0;position:absolute;inset:0;overflow:hidden}.qozxNq_scene:before,.qozxNq_scene:after{content:\"\";pointer-events:none;position:absolute}.qozxNq_scene:before{z-index:0;opacity:.34;filter:blur(30px);background:radial-gradient(at 50% 48%,#e8b86c1c,#0000 18%),radial-gradient(at 50% 52%,#93b5d012,#0000 36%);inset:20% 12% 14%}.qozxNq_scene:after{z-index:3;background:linear-gradient(#04090e24 0,#0000 26% 76%,#04080b2e),radial-gradient(at 52% 46%,#0000 50%,#03070b2e 94%);inset:0}.qozxNq_host,.qozxNq_host canvas{width:100%;height:100%;display:block}.qozxNq_host{z-index:1;position:relative}.qozxNq_host canvas{cursor:grab;filter:contrast(1.04)saturate(1.08)brightness(1.08);touch-action:none}.qozxNq_host canvas:active{cursor:grabbing}.qozxNq_fallback{z-index:5;color:#d9d0c2;text-align:center;background:#081117c7;border-radius:12px;width:min(340px,100% - 40px);padding:15px 18px;font-size:11px;line-height:1.65;position:absolute;inset:50% auto auto 50%;transform:translate(-50%,-50%);box-shadow:0 20px 54px #0000004d}.qozxNq_tooltip{z-index:6;top:clamp(12px, calc(var(--mg-star-y) + 14px), calc(100% - 126px));left:clamp(12px, calc(var(--mg-star-x) + 14px), calc(100% - 264px));pointer-events:none;color:#fff2df;backdrop-filter:blur(14px);background:#081117d1;border-radius:11px;gap:4px;width:min(240px,100% - 24px);padding:11px 13px;display:grid;position:absolute;box-shadow:0 18px 48px #00000052}.qozxNq_tooltip strong{font-size:13px;font-weight:620}.qozxNq_tooltip p{color:#e5dbcbc2;margin:0;font-size:10px;line-height:1.5}@media (width<=560px){.qozxNq_scene:before{inset:24% 2% 18%}.qozxNq_host canvas{filter:contrast(1.03)saturate(1.06)brightness(1.08)}.qozxNq_tooltip{backdrop-filter:none}}@media (prefers-reduced-motion:reduce){.qozxNq_host canvas{cursor:default;filter:contrast(1.02)brightness(1.06)}.qozxNq_tooltip{backdrop-filter:none}}";
		const tagId$15 = "@deepseek-ai/dsh-mind-garden/StarField.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$15) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-mind-garden";
			tag.dataset.pluginCss = tagId$15;
			tag.textContent = css$15;
			document.head.appendChild(tag);
		}
		var StarField_module_css_default = {
			"fallback": "qozxNq_fallback",
			"host": "qozxNq_host",
			"scene": "qozxNq_scene",
			"tooltip": "qozxNq_tooltip"
		};
		//#endregion
		//#region lib/types/client/star-map/StarFieldView.js
		/** Lightweight React adapter for the lazily loaded constellation renderer. */
		/** Display the live WebGL constellation, with the surrounding space owning accessible nodes. */
		function StarField({ model, fallback, reducedMotion = false, selectedId = "center", onSelect }) {
			const [host, setHost] = (0, react.useState)(null);
			const [state, setState] = (0, react.useState)("loading");
			const [systemReducedMotion, setSystemReducedMotion] = (0, react.useState)(() => typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
			const [hovered, setHovered] = (0, react.useState)(null);
			(0, react.useEffect)(() => {
				if (typeof window.matchMedia !== "function") return;
				const query = window.matchMedia("(prefers-reduced-motion: reduce)");
				const update = () => {
					setSystemReducedMotion(query.matches);
				};
				update();
				query.addEventListener("change", update);
				return () => {
					query.removeEventListener("change", update);
				};
			}, []);
			(0, react.useEffect)(() => {
				if (host === null) return;
				let disposed = false;
				let teardown;
				setState("loading");
				loadMindGardenScenes().then((scenes) => {
					if (disposed) return;
					teardown = scenes.mountGardenStarField(host, model, reducedMotion || systemReducedMotion, selectedId, onSelect, (id, x, y) => {
						const node = model.nodes.find((candidate) => candidate.id === id);
						setHovered(node === void 0 ? null : {
							node,
							x,
							y
						});
					});
					setState("ready");
				}).catch(() => {
					if (disposed) return;
					host.replaceChildren();
					setState("fallback");
				});
				return () => {
					disposed = true;
					teardown?.();
					host.replaceChildren();
				};
			}, [
				host,
				model,
				onSelect,
				reducedMotion,
				selectedId,
				systemReducedMotion
			]);
			return (0, react_jsx_runtime.jsxs)("div", {
				className: StarField_module_css_default.scene,
				"data-render-state": state,
				children: [
					(0, react_jsx_runtime.jsx)("div", {
						className: StarField_module_css_default.host,
						ref: setHost,
						"aria-hidden": "true"
					}),
					hovered !== null && (0, react_jsx_runtime.jsxs)("div", {
						className: StarField_module_css_default.tooltip,
						style: {
							"--mg-star-x": `${hovered.x}px`,
							"--mg-star-y": `${hovered.y}px`
						},
						children: [(0, react_jsx_runtime.jsx)("strong", { children: hovered.node.title }), (0, react_jsx_runtime.jsx)("p", { children: hovered.node.detail })]
					}),
					state === "fallback" && (0, react_jsx_runtime.jsx)("div", {
						className: StarField_module_css_default.fallback,
						role: "status",
						children: fallback
					})
				]
			});
		}
		//#endregion
		//#region \0dsh-css:E:\test code\deepseekharness_modified\deepseek-harness\packages\client\ui-mind-garden\src\client\star-map\StarProfilePanel.module.css.mjs
		const css$14 = ".PTCz4a_panel{--dsw-alias-label-primary:#f3eddd;--dsw-alias-label-secondary:#c2c0b9;--dsw-alias-label-inverse:#0c1420;--dsw-alias-bg-base:#0c1420;--dsw-alias-bg-layer-1:#172232;--dsw-alias-bg-layer-2:#202d40;--dsw-alias-border-l2:#3a4658;--dsw-alias-state-business-primary:#c89b52;--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);z-index:4;box-sizing:border-box;border:1px solid color-mix(in srgb, var(--dsw-alias-state-business-primary) 28%, var(--dsw-alias-border-l2));background:color-mix(in srgb, var(--dsw-alias-bg-layer-2) 94%, transparent);width:min(410px,100% - 36px);max-height:calc(100% - 130px);box-shadow:7px 12px 40px color-mix(in srgb, var(--dsw-alias-bg-mask-drop) 38%, transparent);backdrop-filter:blur(20px);border-radius:8px;padding:18px;position:absolute;top:92px;right:clamp(18px,3vw,38px);overflow:auto}.PTCz4a_panel header{justify-content:space-between;align-items:flex-start;gap:16px;display:flex}.PTCz4a_panel h2{margin:0 0 6px;font-size:18px}.PTCz4a_panel header p{color:var(--dsw-alias-label-secondary);margin:0;font-size:10px;line-height:1.6}.PTCz4a_panel header button{color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;background:0 0;border:0;flex:none;font-size:10px}.PTCz4a_panel form{gap:14px;margin-top:18px;display:grid}.PTCz4a_intent{color:var(--dsw-alias-label-secondary);gap:6px;font-size:10px;display:grid}.PTCz4a_intent textarea{resize:vertical;border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1);font:inherit;border-radius:6px;padding:9px;font-size:11px;line-height:1.5}.PTCz4a_panel fieldset{border:1px solid var(--dsw-alias-border-l2);border-radius:6px;margin:0;padding:12px}.PTCz4a_panel legend{color:var(--dsw-alias-label-secondary);padding:0 5px;font-size:10px}.PTCz4a_tones{grid-template-columns:repeat(3,1fr);gap:6px;display:grid}.PTCz4a_tones label{color:var(--dsw-alias-label-secondary);text-align:center;cursor:pointer;border:1px solid #0000;border-radius:6px;justify-items:center;gap:5px;padding:8px 4px;font-size:9px;display:grid}.PTCz4a_tones label[data-selected=true]{border-color:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-label-primary);background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 11%, transparent)}.PTCz4a_permissions{grid-template-columns:1fr 1fr;gap:9px;display:grid}.PTCz4a_permissions label,.PTCz4a_motion{color:var(--dsw-alias-label-secondary);align-items:center;gap:7px;font-size:10px;display:flex}.PTCz4a_save{color:var(--dsw-alias-label-inverse);background:var(--dsw-alias-state-business-primary);font:inherit;cursor:pointer;border:0;border-radius:6px;justify-self:end;padding:9px 14px;font-size:11px}.PTCz4a_save:disabled{opacity:.5;cursor:not-allowed}.PTCz4a_saved,.PTCz4a_error{margin:0;font-size:10px}.PTCz4a_saved{color:var(--dsw-alias-state-success-primary)}.PTCz4a_error{color:var(--dsw-alias-state-error-primary)}@media (width<=720px){.PTCz4a_panel{width:auto;max-height:calc(100% - 96px);top:76px;left:12px;right:12px}}@media (prefers-reduced-motion:reduce){.PTCz4a_panel{backdrop-filter:none}}.PTCz4a_panel{z-index:10;color:#f6ecde;backdrop-filter:blur(22px)saturate(.86);background:#081116e6;border:0;border-radius:14px;top:104px;box-shadow:0 28px 86px #0000006b}.PTCz4a_panel h2{color:#fff2df;font-family:var(--mg-font-display,\"Noto Serif SC\", serif);font-size:21px;font-weight:540}.PTCz4a_intent textarea{caret-color:#e3b667;background:#03090d7a;border:0;border-radius:10px;outline:1px solid #f5e4cb24}.PTCz4a_panel fieldset{background:#fff4e20d;border:0;border-radius:10px}.PTCz4a_tones label{border:0;border-radius:9px}.PTCz4a_tones label[data-selected=true]{color:#fff0d8;background:#e2b3612b;border-color:#0000}.PTCz4a_save{color:#20170f;background:#e3b667;border-radius:10px;min-height:40px}@media (width<=720px){.PTCz4a_panel{backdrop-filter:none;top:84px}}";
		const tagId$14 = "@deepseek-ai/dsh-mind-garden/StarProfilePanel.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$14) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-mind-garden";
			tag.dataset.pluginCss = tagId$14;
			tag.textContent = css$14;
			document.head.appendChild(tag);
		}
		var StarProfilePanel_module_css_default = {
			"error": "PTCz4a_error",
			"intent": "PTCz4a_intent",
			"motion": "PTCz4a_motion",
			"panel": "PTCz4a_panel",
			"permissions": "PTCz4a_permissions",
			"save": "PTCz4a_save",
			"saved": "PTCz4a_saved",
			"tones": "PTCz4a_tones"
		};
		//#endregion
		//#region lib/types/client/star-map/StarProfilePanel.js
		/** User-controlled Star Map authorizations and observation preferences. */
		/** Edit the privacy-sensitive subset that governs future Star Observer work. */
		function StarProfilePanel({ profile, t, onSave, onCommit, onClose }) {
			const [permissions, setPermissions] = (0, react.useState)(profile.permissions);
			const [tone, setTone] = (0, react.useState)(profile.observerTone);
			const [intent, setIntent] = (0, react.useState)(profile.observationIntent);
			const [reducedMotion, setReducedMotion] = (0, react.useState)(profile.reducedMotion);
			const [pending, setPending] = (0, react.useState)(false);
			const [notice, setNotice] = (0, react.useState)(null);
			(0, react.useEffect)(() => {
				setPermissions(profile.permissions);
				setTone(profile.observerTone);
				setIntent(profile.observationIntent);
				setReducedMotion(profile.reducedMotion);
			}, [profile]);
			const submit = async (event) => {
				event.preventDefault();
				if (pending) return;
				setPending(true);
				setNotice(null);
				const result = await settleMindGardenAction(() => onSave(profile, permissions, tone, intent, reducedMotion));
				setPending(false);
				if (!result.ok) {
					setNotice("error");
					return;
				}
				onCommit(result.value);
				setNotice("saved");
			};
			return (0, react_jsx_runtime.jsxs)("aside", {
				className: StarProfilePanel_module_css_default.panel,
				"aria-label": t("star.profile.title"),
				children: [(0, react_jsx_runtime.jsxs)("header", { children: [(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("h2", { children: t("star.profile.title") }), (0, react_jsx_runtime.jsx)("p", { children: t("star.profile.subtitle") })] }), (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onClose,
					children: t("star.profile.close")
				})] }), (0, react_jsx_runtime.jsxs)("form", {
					onSubmit: (event) => {
						submit(event);
					},
					children: [
						(0, react_jsx_runtime.jsxs)("label", {
							className: StarProfilePanel_module_css_default.intent,
							children: [(0, react_jsx_runtime.jsx)("span", { children: t("star.profile.intent") }), (0, react_jsx_runtime.jsx)("textarea", {
								rows: 3,
								value: intent,
								onChange: (event) => {
									setIntent(event.target.value);
								}
							})]
						}),
						(0, react_jsx_runtime.jsxs)("fieldset", { children: [(0, react_jsx_runtime.jsx)("legend", { children: t("star.profile.tone") }), (0, react_jsx_runtime.jsx)("div", {
							className: StarProfilePanel_module_css_default.tones,
							children: [
								"gentle",
								"direct",
								"mystic"
							].map((value) => (0, react_jsx_runtime.jsxs)("label", {
								"data-selected": tone === value,
								children: [(0, react_jsx_runtime.jsx)("input", {
									type: "radio",
									name: "profile-tone",
									checked: tone === value,
									onChange: () => {
										setTone(value);
									}
								}), (0, react_jsx_runtime.jsx)("span", { children: t(`star.profile.tone.${value}`) })]
							}, value))
						})] }),
						(0, react_jsx_runtime.jsxs)("fieldset", { children: [(0, react_jsx_runtime.jsx)("legend", { children: t("star.profile.permissions") }), (0, react_jsx_runtime.jsx)("div", {
							className: StarProfilePanel_module_css_default.permissions,
							children: [
								["dailyReflections", "reflections"],
								["confirmedMemories", "memories"],
								["openQuestions", "questions"],
								["periodReviews", "reviews"]
							].map(([key, label]) => (0, react_jsx_runtime.jsxs)("label", { children: [(0, react_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: permissions[key],
								onChange: (event) => {
									setPermissions((current) => ({
										...current,
										[key]: event.target.checked
									}));
								}
							}), (0, react_jsx_runtime.jsx)("span", { children: t(`star.profile.permission.${label}`) })] }, key))
						})] }),
						(0, react_jsx_runtime.jsxs)("label", {
							className: StarProfilePanel_module_css_default.motion,
							children: [(0, react_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: reducedMotion,
								onChange: (event) => {
									setReducedMotion(event.target.checked);
								}
							}), (0, react_jsx_runtime.jsx)("span", { children: t("star.profile.motion") })]
						}),
						notice !== null && (0, react_jsx_runtime.jsx)("p", {
							className: StarProfilePanel_module_css_default[notice],
							role: "status",
							children: t(`star.profile.${notice}`)
						}),
						(0, react_jsx_runtime.jsx)("button", {
							className: StarProfilePanel_module_css_default.save,
							type: "submit",
							disabled: pending,
							children: pending ? t("star.ritual.saving") : t("star.profile.save")
						})
					]
				})]
			});
		}
		//#endregion
		//#region \0dsh-css:E:\test code\deepseekharness_modified\deepseek-harness\packages\client\ui-mind-garden\src\client\star-map\StarRitual.module.css.mjs
		const css$13 = ".mHDIDG_ritual{--dsw-alias-label-primary:#f3eddd;--dsw-alias-label-secondary:#c2c0b9;--dsw-alias-label-inverse:#0c1420;--dsw-alias-bg-base:#0c1420;--dsw-alias-bg-layer-1:#172232;--dsw-alias-bg-layer-2:#202d40;--dsw-alias-border-l2:#3a4658;--dsw-alias-state-business-primary:#c89b52;box-sizing:border-box;min-height:100%;color:var(--dsw-alias-label-primary);background:radial-gradient(circle at 52% 44%, color-mix(in srgb, var(--dsw-alias-state-business-primary) 9%, transparent), transparent 28rem), var(--dsw-alias-bg-base);padding:32px clamp(20px,5vw,72px) 56px;position:relative;overflow:hidden auto}.mHDIDG_sky{pointer-events:none;position:absolute;inset:0}.mHDIDG_sky:before,.mHDIDG_sky:after{background-image:radial-gradient(circle, color-mix(in srgb, var(--dsw-alias-label-primary) 58%, transparent) 0 1px, transparent 1.6px);content:\"\";opacity:.22;background-size:57px 57px;animation:28s linear infinite mHDIDG_drift;position:absolute;inset:-30%}.mHDIDG_sky:after{opacity:.14;background-size:103px 103px;animation-duration:43s;animation-direction:reverse}.mHDIDG_sky i{background:var(--dsw-alias-state-business-primary);width:7px;height:7px;box-shadow:0 0 20px 5px color-mix(in srgb, var(--dsw-alias-state-business-primary) 42%, transparent);border-radius:50%;animation:3.8s ease-in-out infinite mHDIDG_breathe;position:absolute}.mHDIDG_sky i:first-child{top:16%;left:8%}.mHDIDG_sky i:nth-child(2){animation-delay:-1.2s;top:27%;right:12%}.mHDIDG_sky i:nth-child(3){animation-delay:-2.4s;bottom:14%;right:22%}.mHDIDG_sky i:nth-child(4){animation-delay:-.7s;bottom:22%;left:13%}.mHDIDG_sky i:nth-child(5){animation-delay:-3.1s;top:7%;left:64%}.mHDIDG_header,.mHDIDG_card{z-index:1;width:min(880px,100%);margin-inline:auto;position:relative}.mHDIDG_header{justify-content:space-between;align-items:flex-start;gap:24px;margin-bottom:24px;display:flex}.mHDIDG_header>div{max-width:690px}.mHDIDG_header h1{letter-spacing:-.04em;margin:8px 0;font-family:Mind Garden Display,Noto Serif SC,Songti SC,serif;font-size:clamp(28px,4vw,44px);font-weight:560}.mHDIDG_header p{color:var(--dsw-alias-label-secondary);margin:0;font-size:13px;line-height:1.7}.mHDIDG_header button,.mHDIDG_actions button{border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);background:color-mix(in srgb, var(--dsw-alias-bg-layer-2) 88%, transparent);font:inherit;cursor:pointer;border-radius:6px;padding:9px 14px}.mHDIDG_card{--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);border:1px solid color-mix(in srgb, var(--dsw-alias-state-business-primary) 24%, var(--dsw-alias-border-l2));background:color-mix(in srgb, var(--dsw-alias-bg-layer-2) 91%, transparent);box-shadow:9px 16px 54px color-mix(in srgb, var(--dsw-alias-bg-mask-drop) 32%, transparent);backdrop-filter:blur(20px);border-radius:8px;overflow:hidden}.mHDIDG_progress{border-bottom:1px solid var(--dsw-alias-border-l2);grid-template-columns:repeat(3,1fr);margin:0;padding:18px 22px;list-style:none;display:grid}.mHDIDG_progress li{color:var(--dsw-alias-label-secondary);align-items:center;gap:8px;font-size:11px;display:flex}.mHDIDG_progress i{border:1px solid var(--dsw-alias-border-l2);border-radius:50%;place-items:center;width:24px;height:24px;font-style:normal;display:grid}.mHDIDG_progress li[data-active=true],.mHDIDG_progress li[data-complete=true]{color:var(--dsw-alias-label-primary)}.mHDIDG_progress li[data-active=true] i,.mHDIDG_progress li[data-complete=true] i{border-color:var(--dsw-alias-state-business-primary);background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 18%, transparent)}.mHDIDG_stage{gap:18px;padding:clamp(24px,5vw,46px);display:grid}.mHDIDG_intro h2{margin:0 0 8px;font-size:clamp(21px,3vw,29px)}.mHDIDG_intro p{max-width:690px;color:var(--dsw-alias-label-secondary);margin:0;font-size:12px;line-height:1.75}.mHDIDG_wide,.mHDIDG_row3 label,.mHDIDG_optional{color:var(--dsw-alias-label-secondary);gap:7px;font-size:11px;display:grid}.mHDIDG_row3{grid-template-columns:2fr 1fr 1fr;gap:12px;display:grid}.mHDIDG_split{grid-template-columns:1fr 1fr;gap:12px;display:grid}.mHDIDG_optional>span{align-items:center;gap:7px;min-height:30px;display:flex}.mHDIDG_stage input:not([type=checkbox],[type=radio]),.mHDIDG_stage textarea{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);width:100%;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1);font:inherit;border-radius:6px;padding:10px 11px;font-size:13px}.mHDIDG_stage textarea{resize:vertical;line-height:1.6}.mHDIDG_choiceGrid{grid-template-columns:repeat(3,1fr);gap:10px;display:grid}.mHDIDG_choiceGrid label,.mHDIDG_scenes label{border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 82%, transparent);cursor:pointer;border-radius:6px;align-items:center;gap:8px;padding:11px;font-size:11px;display:flex}.mHDIDG_choiceGrid label[data-selected=true],.mHDIDG_scenes label[data-selected=true]{border-color:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-label-primary);background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 12%, var(--dsw-alias-bg-layer-1))}.mHDIDG_scenes{grid-template-columns:1fr 1fr;gap:12px;display:grid}.mHDIDG_scenes fieldset{border:1px solid var(--dsw-alias-border-l2);border-radius:6px;gap:7px;margin:0;padding:12px;display:grid}.mHDIDG_scenes legend{color:var(--dsw-alias-label-primary);padding:0 6px;font-size:11px}.mHDIDG_permissionBox{border:1px solid var(--dsw-alias-border-l2);border-radius:6px;margin:0;padding:16px}.mHDIDG_permissionBox legend{color:var(--dsw-alias-label-primary);padding:0 7px;font-size:11px}.mHDIDG_permissionBox>div{grid-template-columns:repeat(2,1fr);gap:10px;display:grid}.mHDIDG_permissionBox label,.mHDIDG_motion{color:var(--dsw-alias-label-secondary);align-items:center;gap:8px;font-size:11px;display:flex}.mHDIDG_permissionBox small{color:var(--dsw-alias-label-secondary);margin-top:12px;font-size:10px;line-height:1.6;display:block}.mHDIDG_error{color:var(--dsw-alias-state-error-primary);margin:0 46px;font-size:11px}.mHDIDG_actions{border-top:1px solid var(--dsw-alias-border-l2);justify-content:flex-end;gap:10px;padding:18px 24px;display:flex}.mHDIDG_actions button:disabled{opacity:.45;cursor:not-allowed}.mHDIDG_actions .mHDIDG_primary{color:var(--dsw-alias-label-inverse);background:var(--dsw-alias-state-business-primary);border-color:#0000}@keyframes mHDIDG_drift{to{transform:translate(8%,4%)rotate(8deg)}}@keyframes mHDIDG_breathe{50%{opacity:.38;transform:scale(.72)}}@media (width<=720px){.mHDIDG_ritual{padding:20px 14px 36px}.mHDIDG_header{display:grid}.mHDIDG_header button{justify-self:start}.mHDIDG_row3,.mHDIDG_split,.mHDIDG_choiceGrid,.mHDIDG_scenes{grid-template-columns:1fr}.mHDIDG_progress span{display:none}.mHDIDG_permissionBox>div{grid-template-columns:1fr}}@media (prefers-reduced-motion:reduce){.mHDIDG_sky:before,.mHDIDG_sky:after,.mHDIDG_sky i{animation:none}.mHDIDG_card{backdrop-filter:none}}.mHDIDG_ritual{background-color:#07101a;background-image:linear-gradient(180deg, #03080d6b, #03080dad), var(--mg-star-courtyard);background-position:50%;background-size:cover;min-height:max(720px,100dvh - 126px)}.mHDIDG_sky:before,.mHDIDG_sky:after{opacity:.1}.mHDIDG_header h1{color:#fff3e2;letter-spacing:-.03em;text-shadow:0 12px 42px #000000b8;font-weight:520}.mHDIDG_header p{color:#e9dfd0c2;text-shadow:0 5px 18px #000}.mHDIDG_header button,.mHDIDG_actions button{color:#e1d6c7;background:#081116b8;border:0;border-radius:10px;min-height:42px}.mHDIDG_card{background:#081116e0;border:0;border-radius:14px;box-shadow:0 28px 84px #0006}.mHDIDG_progress{border-bottom:0}.mHDIDG_progress i{background:#fff4e214;border:0}.mHDIDG_progress li[data-active=true] i,.mHDIDG_progress li[data-complete=true] i{background:#e2b36133;border-color:#0000}.mHDIDG_stage input:not([type=checkbox],[type=radio]),.mHDIDG_stage textarea{caret-color:#e3b667;background:#03090d7a;border:0;border-radius:10px;outline:1px solid #f5e4cb24}.mHDIDG_choiceGrid label,.mHDIDG_scenes label{background:#fff4e20f;border:0;border-radius:10px}.mHDIDG_choiceGrid label[data-selected=true],.mHDIDG_scenes label[data-selected=true]{color:#fff0d8;background:#e2b3612b;border-color:#0000}.mHDIDG_actions{border-top:0}@media (width<=720px){.mHDIDG_ritual{min-height:max(760px,100dvh - 116px);padding:24px 14px 40px}.mHDIDG_card{backdrop-filter:none}}";
		const tagId$13 = "@deepseek-ai/dsh-mind-garden/StarRitual.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$13) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-mind-garden";
			tag.dataset.pluginCss = tagId$13;
			tag.textContent = css$13;
			document.head.appendChild(tag);
		}
		var StarRitual_module_css_default = {
			"actions": "mHDIDG_actions",
			"breathe": "mHDIDG_breathe",
			"card": "mHDIDG_card",
			"choiceGrid": "mHDIDG_choiceGrid",
			"drift": "mHDIDG_drift",
			"error": "mHDIDG_error",
			"header": "mHDIDG_header",
			"intro": "mHDIDG_intro",
			"motion": "mHDIDG_motion",
			"optional": "mHDIDG_optional",
			"permissionBox": "mHDIDG_permissionBox",
			"primary": "mHDIDG_primary",
			"progress": "mHDIDG_progress",
			"ritual": "mHDIDG_ritual",
			"row3": "mHDIDG_row3",
			"scenes": "mHDIDG_scenes",
			"sky": "mHDIDG_sky",
			"split": "mHDIDG_split",
			"stage": "mHDIDG_stage",
			"wide": "mHDIDG_wide"
		};
		//#endregion
		//#region lib/types/client/star-map/StarRitual.js
		/** Resumable, encrypted first-observation ritual for the Star Map. */
		const SCENES = [
			1,
			2,
			3,
			4,
			5,
			6
		];
		const DEFAULT_SCENE_ANSWERS = [
			"1a",
			"2a",
			"3a",
			"4a",
			"5a",
			"6a"
		];
		function inputFromProfile(profile) {
			return {
				displayName: profile.displayName,
				birthMonth: profile.birthMonth,
				birthDay: profile.birthDay,
				birthYear: profile.birthYear,
				birthTime: profile.birthTime,
				birthTimeKnown: profile.birthTimeKnown,
				birthCity: profile.birthCity,
				birthCityKnown: profile.birthCityKnown,
				mbtiMode: profile.mbtiMode,
				mbtiType: profile.mbtiType,
				mbtiAnswers: profile.mbtiAnswers.length === 6 ? profile.mbtiAnswers : DEFAULT_SCENE_ANSWERS,
				selfWords: profile.selfWords,
				observationIntent: profile.observationIntent,
				observerTone: profile.observerTone,
				permissions: profile.permissions,
				reducedMotion: profile.reducedMotion
			};
		}
		function optionalNumber(value) {
			return value === "" ? null : Number(value);
		}
		/** Render the three-stage ritual and persist each forward checkpoint. */
		function StarRitual({ profile, t, onSave, onComplete, onCommit, onExit }) {
			const [step, setStep] = (0, react.useState)(Math.min(profile.onboardingStage, 2));
			const [draft, setDraft] = (0, react.useState)(() => inputFromProfile(profile));
			const [words, setWords] = (0, react.useState)(profile.selfWords.join("，"));
			const [pending, setPending] = (0, react.useState)(false);
			const [error, setError] = (0, react.useState)(false);
			(0, react.useEffect)(() => {
				setDraft(inputFromProfile(profile));
				setWords(profile.selfWords.join("，"));
				setStep(Math.min(profile.onboardingStage, 2));
			}, [profile]);
			const updatePermission = (key, checked) => {
				setDraft((current) => ({
					...current,
					permissions: {
						...current.permissions,
						[key]: checked
					}
				}));
			};
			const updateScene = (index, value) => {
				setDraft((current) => {
					const answers = [...current.mbtiAnswers];
					answers[index] = value;
					return {
						...current,
						mbtiAnswers: answers
					};
				});
			};
			const submit = async (event) => {
				event.preventDefault();
				if (pending) return;
				setPending(true);
				setError(false);
				const normalized = {
					...draft,
					selfWords: words.split(/[，,]/u).map((word) => word.trim()).filter(Boolean)
				};
				const result = step < 2 ? await settleMindGardenAction(() => onSave(normalized, step === 0 ? 1 : 2, profile.version)) : await settleMindGardenAction(() => onComplete(normalized, profile.version));
				setPending(false);
				if (!result.ok) {
					setError(true);
					return;
				}
				onCommit(result.value);
			};
			return (0, react_jsx_runtime.jsxs)("main", {
				className: StarRitual_module_css_default.ritual,
				"data-mind-garden-star-ritual": `stage-${step}`,
				style: { "--mg-star-courtyard": `url("${STAR_MIST_COURTYARD_V5}")` },
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: StarRitual_module_css_default.sky,
						"aria-hidden": "true",
						children: [
							(0, react_jsx_runtime.jsx)("i", {}),
							(0, react_jsx_runtime.jsx)("i", {}),
							(0, react_jsx_runtime.jsx)("i", {}),
							(0, react_jsx_runtime.jsx)("i", {}),
							(0, react_jsx_runtime.jsx)("i", {})
						]
					}),
					(0, react_jsx_runtime.jsxs)("header", {
						className: StarRitual_module_css_default.header,
						children: [(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("h1", { children: t("star.ritual.title") }), (0, react_jsx_runtime.jsx)("p", { children: t("star.ritual.subtitle") })] }), (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: onExit,
							children: t("star.ritual.exit")
						})]
					}),
					(0, react_jsx_runtime.jsxs)("form", {
						className: StarRitual_module_css_default.card,
						onSubmit: (event) => {
							submit(event);
						},
						children: [
							(0, react_jsx_runtime.jsx)("ol", {
								className: StarRitual_module_css_default.progress,
								"aria-label": t("star.ritual.progress"),
								children: [
									"identity",
									"self",
									"consent"
								].map((name, index) => (0, react_jsx_runtime.jsxs)("li", {
									"data-active": index === step,
									"data-complete": index < step,
									children: [(0, react_jsx_runtime.jsx)("i", { children: index + 1 }), (0, react_jsx_runtime.jsx)("span", { children: t(`star.ritual.step.${name}`) })]
								}, name))
							}),
							step === 0 && (0, react_jsx_runtime.jsxs)("section", {
								className: StarRitual_module_css_default.stage,
								children: [
									(0, react_jsx_runtime.jsxs)("div", {
										className: StarRitual_module_css_default.intro,
										children: [(0, react_jsx_runtime.jsx)("h2", { children: t("star.ritual.identity.title") }), (0, react_jsx_runtime.jsx)("p", { children: t("star.ritual.identity.body") })]
									}),
									(0, react_jsx_runtime.jsxs)("label", {
										className: StarRitual_module_css_default.wide,
										children: [(0, react_jsx_runtime.jsx)("span", { children: t("star.ritual.displayName") }), (0, react_jsx_runtime.jsx)("input", {
											value: draft.displayName,
											maxLength: 80,
											placeholder: t("star.ritual.displayName.placeholder"),
											onChange: (event) => {
												setDraft((current) => ({
													...current,
													displayName: event.target.value
												}));
											}
										})]
									}),
									(0, react_jsx_runtime.jsxs)("div", {
										className: StarRitual_module_css_default.row3,
										children: [
											(0, react_jsx_runtime.jsxs)("label", { children: [(0, react_jsx_runtime.jsx)("span", { children: t("star.ritual.birthYear") }), (0, react_jsx_runtime.jsx)("input", {
												type: "number",
												min: "1900",
												max: "2200",
												value: draft.birthYear ?? "",
												onChange: (event) => {
													setDraft((current) => ({
														...current,
														birthYear: optionalNumber(event.target.value)
													}));
												}
											})] }),
											(0, react_jsx_runtime.jsxs)("label", { children: [(0, react_jsx_runtime.jsx)("span", { children: t("star.ritual.birthMonth") }), (0, react_jsx_runtime.jsx)("input", {
												type: "number",
												min: "1",
												max: "12",
												value: draft.birthMonth ?? "",
												onChange: (event) => {
													setDraft((current) => ({
														...current,
														birthMonth: optionalNumber(event.target.value)
													}));
												}
											})] }),
											(0, react_jsx_runtime.jsxs)("label", { children: [(0, react_jsx_runtime.jsx)("span", { children: t("star.ritual.birthDay") }), (0, react_jsx_runtime.jsx)("input", {
												type: "number",
												min: "1",
												max: "31",
												value: draft.birthDay ?? "",
												onChange: (event) => {
													setDraft((current) => ({
														...current,
														birthDay: optionalNumber(event.target.value)
													}));
												}
											})] })
										]
									}),
									(0, react_jsx_runtime.jsxs)("div", {
										className: StarRitual_module_css_default.split,
										children: [(0, react_jsx_runtime.jsxs)("label", {
											className: StarRitual_module_css_default.optional,
											children: [(0, react_jsx_runtime.jsxs)("span", { children: [(0, react_jsx_runtime.jsx)("input", {
												type: "checkbox",
												checked: draft.birthTimeKnown,
												onChange: (event) => {
													setDraft((current) => ({
														...current,
														birthTimeKnown: event.target.checked,
														birthTime: event.target.checked ? current.birthTime : ""
													}));
												}
											}), t("star.ritual.timeKnown")] }), draft.birthTimeKnown && (0, react_jsx_runtime.jsx)("input", {
												"aria-label": t("star.ritual.birthTime"),
												type: "time",
												value: draft.birthTime,
												onChange: (event) => {
													setDraft((current) => ({
														...current,
														birthTime: event.target.value
													}));
												}
											})]
										}), (0, react_jsx_runtime.jsxs)("label", {
											className: StarRitual_module_css_default.optional,
											children: [(0, react_jsx_runtime.jsxs)("span", { children: [(0, react_jsx_runtime.jsx)("input", {
												type: "checkbox",
												checked: draft.birthCityKnown,
												onChange: (event) => {
													setDraft((current) => ({
														...current,
														birthCityKnown: event.target.checked,
														birthCity: event.target.checked ? current.birthCity : ""
													}));
												}
											}), t("star.ritual.cityKnown")] }), draft.birthCityKnown && (0, react_jsx_runtime.jsx)("input", {
												"aria-label": t("star.ritual.birthCity"),
												value: draft.birthCity,
												onChange: (event) => {
													setDraft((current) => ({
														...current,
														birthCity: event.target.value
													}));
												}
											})]
										})]
									})
								]
							}),
							step === 1 && (0, react_jsx_runtime.jsxs)("section", {
								className: StarRitual_module_css_default.stage,
								children: [
									(0, react_jsx_runtime.jsxs)("div", {
										className: StarRitual_module_css_default.intro,
										children: [(0, react_jsx_runtime.jsx)("h2", { children: t("star.ritual.self.title") }), (0, react_jsx_runtime.jsx)("p", { children: t("star.ritual.self.body") })]
									}),
									(0, react_jsx_runtime.jsx)("div", {
										className: StarRitual_module_css_default.choiceGrid,
										children: [
											"known",
											"scenes",
											"observe"
										].map((mode) => (0, react_jsx_runtime.jsxs)("label", {
											"data-selected": draft.mbtiMode === mode,
											children: [(0, react_jsx_runtime.jsx)("input", {
												type: "radio",
												name: "mbti-mode",
												checked: draft.mbtiMode === mode,
												onChange: () => {
													setDraft((current) => ({
														...current,
														mbtiMode: mode
													}));
												}
											}), (0, react_jsx_runtime.jsx)("span", { children: t(`star.ritual.mbti.${mode}`) })]
										}, mode))
									}),
									draft.mbtiMode === "known" && (0, react_jsx_runtime.jsxs)("label", {
										className: StarRitual_module_css_default.wide,
										children: [(0, react_jsx_runtime.jsx)("span", { children: t("star.ritual.mbti.type") }), (0, react_jsx_runtime.jsx)("input", {
											value: draft.mbtiType,
											maxLength: 4,
											placeholder: "INFP",
											onChange: (event) => {
												setDraft((current) => ({
													...current,
													mbtiType: event.target.value.toUpperCase()
												}));
											}
										})]
									}),
									draft.mbtiMode === "scenes" && (0, react_jsx_runtime.jsx)("div", {
										className: StarRitual_module_css_default.scenes,
										children: SCENES.map((number, index) => (0, react_jsx_runtime.jsxs)("fieldset", { children: [(0, react_jsx_runtime.jsx)("legend", { children: t(`star.ritual.scene.${number}`) }), ["a", "b"].map((side) => {
											const value = `${number}${side}`;
											return (0, react_jsx_runtime.jsxs)("label", {
												"data-selected": draft.mbtiAnswers[index] === value,
												children: [(0, react_jsx_runtime.jsx)("input", {
													type: "radio",
													name: `scene-${number}`,
													checked: draft.mbtiAnswers[index] === value,
													onChange: () => {
														updateScene(index, value);
													}
												}), (0, react_jsx_runtime.jsx)("span", { children: t(`star.ritual.scene.${number}${side}`) })]
											}, side);
										})] }, number))
									})
								]
							}),
							step === 2 && (0, react_jsx_runtime.jsxs)("section", {
								className: StarRitual_module_css_default.stage,
								children: [
									(0, react_jsx_runtime.jsxs)("div", {
										className: StarRitual_module_css_default.intro,
										children: [(0, react_jsx_runtime.jsx)("h2", { children: t("star.ritual.consent.title") }), (0, react_jsx_runtime.jsx)("p", { children: t("star.ritual.consent.body") })]
									}),
									(0, react_jsx_runtime.jsxs)("label", {
										className: StarRitual_module_css_default.wide,
										children: [(0, react_jsx_runtime.jsx)("span", { children: t("star.ritual.words") }), (0, react_jsx_runtime.jsx)("input", {
											value: words,
											placeholder: t("star.ritual.words.placeholder"),
											onChange: (event) => {
												setWords(event.target.value);
											}
										})]
									}),
									(0, react_jsx_runtime.jsxs)("label", {
										className: StarRitual_module_css_default.wide,
										children: [(0, react_jsx_runtime.jsx)("span", { children: t("star.ritual.intent") }), (0, react_jsx_runtime.jsx)("textarea", {
											rows: 3,
											value: draft.observationIntent,
											placeholder: t("star.ritual.intent.placeholder"),
											onChange: (event) => {
												setDraft((current) => ({
													...current,
													observationIntent: event.target.value
												}));
											}
										})]
									}),
									(0, react_jsx_runtime.jsxs)("fieldset", {
										className: StarRitual_module_css_default.permissionBox,
										children: [
											(0, react_jsx_runtime.jsx)("legend", { children: t("star.ritual.permissions") }),
											(0, react_jsx_runtime.jsx)("div", { children: [
												["dailyReflections", "reflections"],
												["confirmedMemories", "memories"],
												["openQuestions", "questions"],
												["periodReviews", "reviews"]
											].map(([key, label]) => (0, react_jsx_runtime.jsxs)("label", { children: [(0, react_jsx_runtime.jsx)("input", {
												type: "checkbox",
												checked: draft.permissions[key],
												onChange: (event) => {
													updatePermission(key, event.target.checked);
												}
											}), (0, react_jsx_runtime.jsx)("span", { children: t(`star.profile.permission.${label}`) })] }, key)) }),
											(0, react_jsx_runtime.jsx)("small", { children: t("star.ritual.private") })
										]
									}),
									(0, react_jsx_runtime.jsx)("div", {
										className: StarRitual_module_css_default.choiceGrid,
										children: [
											"gentle",
											"direct",
											"mystic"
										].map((tone) => (0, react_jsx_runtime.jsxs)("label", {
											"data-selected": draft.observerTone === tone,
											children: [(0, react_jsx_runtime.jsx)("input", {
												type: "radio",
												name: "observer-tone",
												checked: draft.observerTone === tone,
												onChange: () => {
													setDraft((current) => ({
														...current,
														observerTone: tone
													}));
												}
											}), (0, react_jsx_runtime.jsx)("span", { children: t(`star.profile.tone.${tone}`) })]
										}, tone))
									}),
									(0, react_jsx_runtime.jsxs)("label", {
										className: StarRitual_module_css_default.motion,
										children: [(0, react_jsx_runtime.jsx)("input", {
											type: "checkbox",
											checked: draft.reducedMotion,
											onChange: (event) => {
												setDraft((current) => ({
													...current,
													reducedMotion: event.target.checked
												}));
											}
										}), (0, react_jsx_runtime.jsx)("span", { children: t("star.profile.motion") })]
									})
								]
							}),
							error && (0, react_jsx_runtime.jsx)("p", {
								className: StarRitual_module_css_default.error,
								role: "alert",
								children: t("star.ritual.error")
							}),
							(0, react_jsx_runtime.jsxs)("footer", {
								className: StarRitual_module_css_default.actions,
								children: [(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									disabled: pending || step === 0,
									onClick: () => {
										setStep((current) => Math.max(0, current - 1));
									},
									children: t("star.ritual.back")
								}), (0, react_jsx_runtime.jsx)("button", {
									type: "submit",
									className: StarRitual_module_css_default.primary,
									disabled: pending,
									children: pending ? t("star.ritual.saving") : t(step === 2 ? "star.ritual.complete" : "star.ritual.next")
								})]
							})
						]
					})
				]
			});
		}
		//#endregion
		//#region \0dsh-css:E:\test code\deepseekharness_modified\deepseek-harness\packages\client\ui-mind-garden\src\client\star-map\StarObserver.module.css.mjs
		const css$12 = ".h0ftKq_observatory{--dsw-alias-label-primary:#f3eddd;--dsw-alias-label-secondary:#c2c0b9;--dsw-alias-bg-base:#0c1420;--dsw-alias-bg-layer-1:#172232;--dsw-alias-bg-layer-2:#202d40;--dsw-alias-border-l2:#3a4658;--dsw-alias-state-business-primary:#c89b52;--dsw-alias-state-warn-primary:#d0aa67;z-index:5;width:min(600px,100% - 36px);color:var(--dsw-alias-label-primary);position:absolute;bottom:26px;left:50%;transform:translate(-50%)}.h0ftKq_summon{border:1px solid color-mix(in srgb, var(--dsw-alias-state-warn-primary) 32%, transparent);color:#15191b;background:linear-gradient(135deg, #f2d28b, var(--dsw-alias-state-warn-primary));min-width:286px;font:inherit;text-align:left;cursor:pointer;border-radius:10px;align-items:center;gap:11px;margin:0 auto;padding:11px 16px;transition:filter .16s,transform .18s cubic-bezier(.16,1,.3,1);display:flex;box-shadow:0 14px 38px #00000061}.h0ftKq_summon:hover{filter:brightness(1.06);transform:translateY(-2px)}.h0ftKq_summon>svg{color:#15211f;flex:none;animation:3s ease-in-out infinite h0ftKq_observerPulse}.h0ftKq_summon>span:nth-child(2){flex:1;gap:2px;display:grid}.h0ftKq_summon strong{font-size:12px}.h0ftKq_summon small{color:#15191bb8;font-size:11px;line-height:1.45}.h0ftKq_summon b{color:#15211f;text-align:center;min-width:18px;font-size:11px}.h0ftKq_desk{--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);border:1px solid color-mix(in srgb, var(--dsw-alias-label-primary) 18%, transparent);backdrop-filter:blur(28px)saturate(.9);background:linear-gradient(145deg,#e6f4f00a,#0000 36%),#05141deb;border-radius:11px;width:100%;max-height:min(72vh,700px);animation:.26s ease-out h0ftKq_observerRise;position:absolute;bottom:58px;left:0;overflow:auto;box-shadow:12px 26px 70px #0000008f}.h0ftKq_deskHeader{justify-content:space-between;align-items:flex-start;padding:18px 20px 12px;display:flex}.h0ftKq_deskHeader h2{margin:4px 0 0;font-size:18px}.h0ftKq_deskHeader button{width:28px;height:28px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:0;border-radius:6px;place-items:center;display:grid}.h0ftKq_cardShelf{scrollbar-width:thin;gap:7px;padding:10px 15px 0;display:flex;overflow-x:auto}.h0ftKq_cardShelf button{border:1px solid var(--dsw-alias-border-l2);max-width:190px;color:var(--dsw-alias-label-secondary);background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 75%, transparent);font:inherit;text-overflow:ellipsis;white-space:nowrap;cursor:pointer;border-radius:6px;flex:none;align-items:center;gap:6px;padding:7px 9px;font-size:11px;display:flex;overflow:hidden}.h0ftKq_cardShelf button[data-selected=true]{border-color:var(--dsw-alias-state-warn-primary);color:var(--dsw-alias-label-primary)}.h0ftKq_cardShelf svg{color:var(--dsw-alias-state-warn-primary);flex:none}.h0ftKq_drawDesk{gap:15px;padding:18px 20px;display:grid}.h0ftKq_drawDesk>p{color:var(--dsw-alias-label-secondary);margin:0;font-size:13px;line-height:1.65}.h0ftKq_drawDesk fieldset{border:0;min-width:0;margin:0;padding:0}.h0ftKq_drawDesk legend,.h0ftKq_question>span{color:var(--dsw-alias-label-secondary);margin-bottom:8px;font-size:12px;font-weight:650;display:block}.h0ftKq_decks{grid-template-columns:repeat(3,1fr);gap:7px;display:grid}.h0ftKq_decks button{border:1px solid var(--dsw-alias-border-l2);min-height:64px;color:var(--dsw-alias-label-secondary);background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 75%, transparent);font:inherit;cursor:pointer;border-radius:6px;place-content:center;justify-items:center;gap:7px;padding:8px;font-size:11px;display:grid}.h0ftKq_decks i{border:1px solid;width:13px;height:13px;transform:rotate(45deg)}.h0ftKq_decks button[data-selected=true]{border-color:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-label-primary);background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 12%, transparent)}.h0ftKq_question textarea,.h0ftKq_calibration textarea{box-sizing:border-box;resize:vertical;border:1px solid var(--dsw-alias-border-l2);width:100%;min-height:64px;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1);font:inherit;border-radius:6px;padding:10px 11px;font-size:13px;line-height:1.55}.h0ftKq_permissionLine{background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 6%, transparent);border-radius:10px;align-items:flex-start;gap:9px;padding:10px;display:flex}.h0ftKq_permissionLine>span{color:var(--dsw-alias-state-business-primary);align-items:center;gap:4px;display:inline-flex}.h0ftKq_permissionLine p{color:var(--dsw-alias-label-secondary);margin:0;font-size:11px;line-height:1.6}.h0ftKq_permissionLine strong{color:var(--dsw-alias-label-secondary);display:block}.h0ftKq_draw,.h0ftKq_save{border:1px solid color-mix(in srgb, var(--dsw-alias-state-business-primary) 55%, transparent);min-height:38px;color:var(--dsw-alias-bg-base);background:var(--dsw-alias-state-business-primary);font:inherit;cursor:pointer;border-radius:6px;font-size:11px;font-weight:700}.h0ftKq_draw i{border:1px solid;border-top-color:#0000;border-radius:50%;width:10px;height:10px;margin-right:8px;animation:.8s linear infinite h0ftKq_observerSpin;display:inline-block}.h0ftKq_card{border:1px solid color-mix(in srgb, var(--dsw-alias-state-warn-primary) 25%, var(--dsw-alias-border-l2));background:var(--dsw-alias-bg-layer-1);transform-origin:bottom;border-radius:8px;gap:14px;margin:15px;padding:20px;animation:.5s cubic-bezier(.2,.8,.2,1) h0ftKq_cardReveal;display:grid;position:relative;overflow:hidden}.h0ftKq_cardGlow{background:var(--dsw-alias-state-warn-primary);pointer-events:none;width:2px;position:absolute;top:0;bottom:0;left:0}.h0ftKq_cardMeta{color:var(--dsw-alias-label-secondary);letter-spacing:.04em;justify-content:space-between;gap:10px;font-size:11px;display:flex;position:relative}.h0ftKq_card h3{margin:0;font-family:Mind Garden Display,Noto Serif SC,Songti SC,serif;font-size:22px;line-height:1.25;position:relative}.h0ftKq_frontText{color:var(--dsw-alias-label-secondary);margin:0;font-size:14px;line-height:1.75;position:relative}.h0ftKq_analysis{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-border-l2);border-radius:6px;grid-template-columns:1fr 1fr;gap:1px;margin:0;display:grid;overflow:hidden}.h0ftKq_analysis div{background:color-mix(in srgb, var(--dsw-alias-bg-layer-2) 94%, transparent);padding:10px}.h0ftKq_analysis dt{color:var(--dsw-alias-state-business-primary);letter-spacing:.06em;font-size:10px;font-weight:700}.h0ftKq_analysis dd{color:var(--dsw-alias-label-secondary);margin:5px 0 0;font-size:12px;line-height:1.6}.h0ftKq_evidence{background:color-mix(in srgb, var(--dsw-alias-state-success-primary) 7%, transparent);color:var(--dsw-alias-label-secondary);border-radius:9px;padding:10px 11px;font-size:11px}.h0ftKq_evidence summary{cursor:pointer}.h0ftKq_evidence p{margin:8px 0 0;padding-top:4px;line-height:1.6}.h0ftKq_imagination{color:var(--dsw-alias-label-secondary);background:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 7%, transparent);border-radius:9px;margin:0;padding:10px 11px;font-size:11px;line-height:1.55}.h0ftKq_card blockquote{color:var(--dsw-alias-label-primary);background:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 6%, transparent);border-radius:9px;margin:0;padding:11px 13px;font-family:Mind Garden Display,Noto Serif SC,Songti SC,serif;font-size:14px;line-height:1.65}.h0ftKq_dialogue{gap:11px;padding-top:8px;display:grid}.h0ftKq_dialogueHeader{justify-content:space-between;align-items:center;gap:12px;display:flex}.h0ftKq_dialogueHeader>div{align-items:center;gap:7px;display:flex}.h0ftKq_dialogueHeader span{color:var(--dsw-alias-state-warn-primary);filter:drop-shadow(0 0 6px);justify-content:center;align-items:center;display:inline-flex}.h0ftKq_dialogueHeader strong{font-size:13px;line-height:1.45}.h0ftKq_dialogueHeader small{color:var(--dsw-alias-label-secondary);font-size:11px}.h0ftKq_transcript{border:1px solid var(--dsw-alias-border-l2);background:color-mix(in srgb, var(--dsw-alias-bg-base) 62%, transparent);scrollbar-width:thin;border-radius:6px;gap:9px;max-height:260px;padding:11px;display:grid;overflow:auto}.h0ftKq_transcript article{border-radius:6px;gap:4px;max-width:88%;padding:8px 10px;display:grid}.h0ftKq_transcript article[data-role=user]{color:var(--dsw-alias-label-primary);background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 13%, var(--dsw-alias-bg-layer-1));border-bottom-right-radius:4px;justify-self:end}.h0ftKq_transcript article[data-role=assistant]{border:1px solid var(--dsw-alias-border-l2);background:color-mix(in srgb, var(--dsw-alias-bg-layer-2) 88%, transparent);border-bottom-left-radius:4px;justify-self:start}.h0ftKq_transcript article[data-pending=true]{opacity:.65}.h0ftKq_transcript article small{color:var(--dsw-alias-label-secondary);letter-spacing:.05em;font-size:10px}.h0ftKq_transcript article p{color:inherit;white-space:pre-wrap;margin:0;font-size:13px;line-height:1.65}.h0ftKq_assistantMarkdown{color:var(--dsw-alias-label-secondary);font-size:13px;line-height:1.65}.h0ftKq_assistantMarkdown p{margin:0 0 7px}.h0ftKq_assistantMarkdown p:last-child{margin-bottom:0}.h0ftKq_assistantMarkdown ul,.h0ftKq_assistantMarkdown ol{margin:5px 0;padding-left:18px}.h0ftKq_assistantMarkdown h1,.h0ftKq_assistantMarkdown h2,.h0ftKq_assistantMarkdown h3{margin:8px 0 5px;font-size:13px}.h0ftKq_dialogueWelcome{color:var(--dsw-alias-label-secondary);text-align:center;justify-items:center;gap:5px;padding:16px;display:grid}.h0ftKq_dialogueWelcome strong{color:var(--dsw-alias-label-secondary);font-size:13px}.h0ftKq_dialogueWelcome span{max-width:320px;font-size:12px;line-height:1.6}.h0ftKq_thinking{color:var(--dsw-alias-label-secondary);align-items:center;gap:4px;margin:0;font-size:11px;display:flex}.h0ftKq_thinking i{background:var(--dsw-alias-state-business-primary);border-radius:50%;width:4px;height:4px;animation:1.1s ease-in-out infinite h0ftKq_observerDots}.h0ftKq_thinking i:nth-child(2){animation-delay:.15s}.h0ftKq_thinking i:nth-child(3){margin-right:4px;animation-delay:.3s}.h0ftKq_revision{border:1px solid color-mix(in srgb, var(--dsw-alias-state-warn-primary) 32%, var(--dsw-alias-border-l2));background:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 6%, transparent);border-radius:6px;gap:6px;padding:11px;display:grid}.h0ftKq_revision>span{color:var(--dsw-alias-state-warn-primary);letter-spacing:.08em;font-size:10px}.h0ftKq_revision strong{font-size:13px}.h0ftKq_revision p{color:var(--dsw-alias-label-secondary);margin:0;font-size:12px;line-height:1.6}.h0ftKq_revision small{color:var(--dsw-alias-label-secondary);font-size:11px;line-height:1.5}.h0ftKq_revision button{border:1px solid var(--dsw-alias-state-warn-primary);min-height:36px;color:var(--dsw-alias-state-warn-primary);font:inherit;cursor:pointer;background:0 0;border-radius:8px;justify-self:end;padding:7px 11px;font-size:11px}.h0ftKq_quickReplies{scrollbar-width:thin;gap:6px;padding-bottom:2px;display:flex;overflow-x:auto}.h0ftKq_quickReplies button{border:1px solid var(--dsw-alias-border-l2);max-width:280px;min-height:36px;color:var(--dsw-alias-label-secondary);font:inherit;text-overflow:ellipsis;white-space:nowrap;cursor:pointer;background:0 0;border-radius:8px;flex:none;padding:7px 10px;font-size:11px;overflow:hidden}.h0ftKq_composer{grid-template-columns:minmax(0,1fr) 38px;align-items:end;gap:8px;display:grid}.h0ftKq_composer label{gap:5px;display:grid}.h0ftKq_composer label>span{color:var(--dsw-alias-label-secondary);font-size:11px}.h0ftKq_composer textarea{box-sizing:border-box;resize:vertical;border:1px solid var(--dsw-alias-border-l2);width:100%;min-height:58px;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1);font:inherit;border-radius:8px;padding:10px 11px;font-size:13px;line-height:1.55}.h0ftKq_composer>button{border:1px solid var(--dsw-alias-state-business-primary);width:38px;height:38px;color:var(--dsw-alias-bg-base);background:var(--dsw-alias-state-business-primary);font:inherit;cursor:pointer;border-radius:50%;justify-content:center;align-items:center;display:inline-flex}.h0ftKq_savedState{border:1px solid color-mix(in srgb, var(--dsw-alias-state-success-primary) 38%, var(--dsw-alias-border-l2));color:var(--dsw-alias-state-success-primary);background:color-mix(in srgb, var(--dsw-alias-state-success-primary) 7%, transparent);text-align:center;border-radius:6px;justify-content:center;align-items:center;gap:6px;margin:0;padding:8px 10px;font-size:9px;display:flex}.h0ftKq_calibration{gap:8px;padding-top:4px;display:grid}.h0ftKq_calibration>strong{font-size:12px}.h0ftKq_calibration>div,.h0ftKq_card footer{gap:7px;display:flex}.h0ftKq_calibration button,.h0ftKq_card footer button{border:1px solid var(--dsw-alias-border-l2);min-height:38px;color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;background:0 0;border-radius:8px;flex:1;font-size:11px}.h0ftKq_calibration button[data-selected=true]{border-color:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-state-business-primary);background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 9%, transparent)}.h0ftKq_card footer .h0ftKq_save{color:var(--dsw-alias-bg-base);background:var(--dsw-alias-state-business-primary)}.h0ftKq_boundary{color:var(--dsw-alias-label-secondary);padding:0 20px 16px;font-size:11px;line-height:1.55;display:block}.h0ftKq_error{margin:0;color:var(--dsw-alias-state-danger-primary)!important;font-size:12px!important}button:disabled{cursor:not-allowed;opacity:.48}button:focus-visible,textarea:focus-visible,summary:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px}@keyframes h0ftKq_observerRise{0%{opacity:0;transform:translateY(12px)scale(.98)}}@keyframes h0ftKq_cardReveal{0%{opacity:0;transform:perspective(700px)rotateY(-12deg)translateY(10px)}}@keyframes h0ftKq_observerPulse{50%{opacity:.45;transform:scale(.82)rotate(12deg)}}@keyframes h0ftKq_observerSpin{to{transform:rotate(360deg)}}@keyframes h0ftKq_observerDots{0%,60%,to{opacity:.25;transform:translateY(0)}30%{opacity:1;transform:translateY(-3px)}}@media (width<=820px){.h0ftKq_observatory{width:calc(100% - 36px);bottom:18px;left:50%;right:auto}.h0ftKq_desk{max-height:min(70vh,620px)}.h0ftKq_analysis{grid-template-columns:1fr}}@media (prefers-reduced-motion:reduce){.h0ftKq_summon>svg,.h0ftKq_desk,.h0ftKq_card,.h0ftKq_draw i,.h0ftKq_thinking i{animation:none}.h0ftKq_desk,.h0ftKq_summon{backdrop-filter:none}}.h0ftKq_observatory{z-index:8;width:min(760px,100% - 40px);bottom:18px}.h0ftKq_summon{color:#20170f;background:#e3b667;border:0;border-radius:999px;min-width:218px;min-height:52px;padding:8px 15px;box-shadow:0 18px 48px #00000057}.h0ftKq_summon small{color:#20170fa8}.h0ftKq_desk{color:#f6ecde;backdrop-filter:blur(24px)saturate(.86);background:#081116eb;border:0;border-radius:14px;max-height:min(72vh,680px);bottom:64px;box-shadow:0 30px 90px #0000007a}.h0ftKq_deskHeader{align-items:center;padding:17px 20px 10px}.h0ftKq_deskHeader h2{font-family:var(--mg-font-display,\"Noto Serif SC\", serif);font-size:21px;font-weight:540}.h0ftKq_deskHeader button{border-radius:9px;width:36px;height:36px}.h0ftKq_cardShelf{scrollbar-color:#e1b1654d transparent;padding:6px 16px 0}.h0ftKq_cardShelf button{background:#fff4e212;border:0;border-radius:9px;min-height:34px}.h0ftKq_cardShelf button[data-selected=true]{color:#fff1db;background:#e4b56629}.h0ftKq_drawDesk{gap:16px;padding:16px 20px 20px}.h0ftKq_decks button{background:#fff4e20f;border:0;border-radius:11px;min-height:62px}.h0ftKq_decks button[data-selected=true]{color:#fff1db;background:#e2b36129}.h0ftKq_question textarea,.h0ftKq_calibration textarea,.h0ftKq_composer textarea{color:#f8eee0;caret-color:#e3b667;background:#03090d7a;border:0;border-radius:10px;outline:1px solid #f6e5cd24}.h0ftKq_permissionLine{background:#e3b66714;padding:11px 12px}.h0ftKq_draw,.h0ftKq_save{color:#20170f;background:#e3b667;border:0;border-radius:10px;min-height:42px}.h0ftKq_card{background:#fff4e20f;border:0;border-radius:13px;gap:14px;margin:10px 16px 16px;padding:20px}.h0ftKq_cardGlow{display:none}.h0ftKq_card h3{color:#fff2df;font-weight:540}.h0ftKq_analysis{background:0 0;border:0;gap:8px;overflow:visible}.h0ftKq_analysis div{background:#03090d66;border-radius:10px}.h0ftKq_evidence,.h0ftKq_imagination,.h0ftKq_card blockquote{border-left:0;border-radius:10px}.h0ftKq_transcript{background:#03090d57;border:0;border-radius:10px}.h0ftKq_transcript article[data-role=assistant]{background:#fff4e212;border:0}.h0ftKq_revision{border:0;border-radius:10px}.h0ftKq_quickReplies button{background:#fff4e212;border:0;border-radius:9px}.h0ftKq_composer>button{background:#e3b667;border:0}.h0ftKq_calibration button,.h0ftKq_card footer button{background:#fff4e212;border:0;border-radius:9px}.h0ftKq_calibration button[data-selected=true]{color:#f1c47c;background:#e2b36124}.h0ftKq_savedState{border:0;border-radius:10px}@media (width<=560px){.h0ftKq_observatory{width:calc(100% - 20px);bottom:10px}.h0ftKq_summon{min-width:196px;min-height:48px}.h0ftKq_desk{backdrop-filter:none;max-height:64vh;bottom:58px}.h0ftKq_deskHeader{padding:14px 15px 8px}.h0ftKq_drawDesk{padding:13px 15px 16px}.h0ftKq_decks{gap:5px}.h0ftKq_decks button{min-height:56px}.h0ftKq_question textarea,.h0ftKq_calibration textarea,.h0ftKq_composer textarea{font-size:16px}.h0ftKq_composer{grid-template-columns:minmax(0,1fr) 44px}.h0ftKq_composer>button{width:44px;height:44px}}";
		const tagId$12 = "@deepseek-ai/dsh-mind-garden/StarObserver.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$12) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-mind-garden";
			tag.dataset.pluginCss = tagId$12;
			tag.textContent = css$12;
			document.head.appendChild(tag);
		}
		var StarObserver_module_css_default = {
			"analysis": "h0ftKq_analysis",
			"assistantMarkdown": "h0ftKq_assistantMarkdown",
			"boundary": "h0ftKq_boundary",
			"calibration": "h0ftKq_calibration",
			"card": "h0ftKq_card",
			"cardGlow": "h0ftKq_cardGlow",
			"cardMeta": "h0ftKq_cardMeta",
			"cardReveal": "h0ftKq_cardReveal",
			"cardShelf": "h0ftKq_cardShelf",
			"composer": "h0ftKq_composer",
			"decks": "h0ftKq_decks",
			"desk": "h0ftKq_desk",
			"deskHeader": "h0ftKq_deskHeader",
			"dialogue": "h0ftKq_dialogue",
			"dialogueHeader": "h0ftKq_dialogueHeader",
			"dialogueWelcome": "h0ftKq_dialogueWelcome",
			"draw": "h0ftKq_draw",
			"drawDesk": "h0ftKq_drawDesk",
			"error": "h0ftKq_error",
			"evidence": "h0ftKq_evidence",
			"frontText": "h0ftKq_frontText",
			"imagination": "h0ftKq_imagination",
			"observatory": "h0ftKq_observatory",
			"observerDots": "h0ftKq_observerDots",
			"observerPulse": "h0ftKq_observerPulse",
			"observerRise": "h0ftKq_observerRise",
			"observerSpin": "h0ftKq_observerSpin",
			"permissionLine": "h0ftKq_permissionLine",
			"question": "h0ftKq_question",
			"quickReplies": "h0ftKq_quickReplies",
			"revision": "h0ftKq_revision",
			"save": "h0ftKq_save",
			"savedState": "h0ftKq_savedState",
			"summon": "h0ftKq_summon",
			"thinking": "h0ftKq_thinking",
			"transcript": "h0ftKq_transcript"
		};
		//#endregion
		//#region lib/types/client/star-map/StarObserverDialogue.js
		/** Recoverable card-owned conversation and explicit revision acceptance surface. */
		/** Render bounded encrypted turns without owning session or Remote context. */
		function StarObserverDialogue({ card, t, onContinue, onApplyRevision }) {
			const [input, setInput] = (0, react.useState)("");
			const [pendingMessage, setPendingMessage] = (0, react.useState)("");
			const [pending, setPending] = (0, react.useState)(null);
			const [error, setError] = (0, react.useState)(false);
			const transcriptRef = (0, react.useRef)(null);
			(0, react.useEffect)(() => {
				setInput("");
				setPendingMessage("");
				setPending(null);
				setError(false);
			}, [card.id]);
			(0, react.useEffect)(() => {
				const transcript = transcriptRef.current;
				if (transcript !== null) transcript.scrollTop = transcript.scrollHeight;
			}, [
				card.turns.length,
				pendingMessage,
				pending
			]);
			const send = async (content, quickReplyKind = "") => {
				const message = content.trim();
				if (message.length === 0 || pending !== null) return;
				setInput("");
				setPendingMessage(message);
				setPending("continue");
				setError(false);
				const result = await settleMindGardenAction(() => onContinue({
					id: card.id,
					ifVersion: card.version,
					content: message,
					quickReplyKind
				}));
				setPending(null);
				setPendingMessage("");
				if (!result.ok) setError(true);
			};
			const applyRevision = async () => {
				const revision = card.pendingRevision;
				if (revision === null || pending !== null) return;
				setPending("revision");
				setError(false);
				const result = await settleMindGardenAction(() => onApplyRevision({
					id: card.id,
					ifVersion: card.version,
					revisionId: revision.id
				}));
				setPending(null);
				if (!result.ok) setError(true);
			};
			return (0, react_jsx_runtime.jsxs)("section", {
				className: StarObserver_module_css_default.dialogue,
				"aria-label": t("star.observer.dialogue.title"),
				children: [
					(0, react_jsx_runtime.jsxs)("header", {
						className: StarObserver_module_css_default.dialogueHeader,
						children: [(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("span", {
							"aria-hidden": "true",
							children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSparkle16, { size: 15 })
						}), (0, react_jsx_runtime.jsx)("strong", { children: t("star.observer.dialogue.title") })] }), (0, react_jsx_runtime.jsx)("small", {
							role: "status",
							"aria-live": "polite",
							children: pending === "continue" ? t("star.observer.dialogue.thinking") : t("star.observer.dialogue.ready")
						})]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: StarObserver_module_css_default.transcript,
						ref: transcriptRef,
						"aria-live": "polite",
						"aria-busy": pending === "continue",
						children: [
							card.turns.length === 0 && pendingMessage.length === 0 ? (0, react_jsx_runtime.jsxs)("div", {
								className: StarObserver_module_css_default.dialogueWelcome,
								children: [(0, react_jsx_runtime.jsx)("strong", { children: t("star.observer.dialogue.welcome") }), (0, react_jsx_runtime.jsx)("span", { children: t("star.observer.dialogue.welcome.body") })]
							}) : null,
							card.turns.map((turn) => (0, react_jsx_runtime.jsxs)("article", {
								"data-role": turn.role,
								children: [(0, react_jsx_runtime.jsx)("small", { children: turn.role === "user" ? t("star.observer.dialogue.me") : t("star.observer.dialogue.observer") }), turn.role === "assistant" ? (0, react_jsx_runtime.jsx)("div", {
									className: StarObserver_module_css_default.assistantMarkdown,
									children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MarkdownText, { text: turn.content })
								}) : (0, react_jsx_runtime.jsx)("p", { children: turn.content })]
							}, turn.id)),
							pendingMessage.length > 0 && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsxs)("article", {
								"data-role": "user",
								"data-pending": "true",
								children: [(0, react_jsx_runtime.jsx)("small", { children: t("star.observer.dialogue.me") }), (0, react_jsx_runtime.jsx)("p", { children: pendingMessage })]
							}), (0, react_jsx_runtime.jsxs)("p", {
								className: StarObserver_module_css_default.thinking,
								children: [
									(0, react_jsx_runtime.jsx)("i", { "aria-hidden": "true" }),
									(0, react_jsx_runtime.jsx)("i", { "aria-hidden": "true" }),
									(0, react_jsx_runtime.jsx)("i", { "aria-hidden": "true" }),
									t("star.observer.dialogue.thinking.detail")
								]
							})] })
						]
					}),
					card.pendingRevision !== null && (0, react_jsx_runtime.jsxs)("aside", {
						className: StarObserver_module_css_default.revision,
						children: [
							(0, react_jsx_runtime.jsx)("span", { children: t("star.observer.revision.eyebrow") }),
							(0, react_jsx_runtime.jsx)("strong", { children: card.pendingRevision.title }),
							(0, react_jsx_runtime.jsx)("p", { children: card.pendingRevision.frontText }),
							(0, react_jsx_runtime.jsx)("small", { children: t("star.observer.revision.disclosure") }),
							(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								disabled: pending !== null,
								onClick: () => {
									applyRevision();
								},
								children: pending === "revision" ? t("star.observer.revision.applying") : t("star.observer.revision.apply")
							})
						]
					}),
					card.quickReplies.length > 0 && (0, react_jsx_runtime.jsx)("div", {
						className: StarObserver_module_css_default.quickReplies,
						"aria-label": t("star.observer.dialogue.suggestions"),
						children: card.quickReplies.map((reply) => (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							disabled: pending !== null,
							onClick: () => {
								send(reply.label, reply.kind);
							},
							children: reply.label
						}, reply.kind))
					}),
					(0, react_jsx_runtime.jsxs)("form", {
						className: StarObserver_module_css_default.composer,
						onSubmit: (event) => {
							event.preventDefault();
							send(input);
						},
						children: [(0, react_jsx_runtime.jsxs)("label", { children: [(0, react_jsx_runtime.jsx)("span", { children: t("star.observer.dialogue.input") }), (0, react_jsx_runtime.jsx)("textarea", {
							value: input,
							maxLength: 1200,
							rows: 2,
							disabled: pending !== null,
							placeholder: t("star.observer.dialogue.placeholder"),
							onChange: (event) => {
								setInput(event.target.value);
							}
						})] }), (0, react_jsx_runtime.jsx)("button", {
							type: "submit",
							disabled: pending !== null || input.trim().length === 0,
							"aria-label": t("star.observer.dialogue.send"),
							children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSendOutline14, { size: 16 })
						})]
					}),
					error && (0, react_jsx_runtime.jsx)("p", {
						className: StarObserver_module_css_default.error,
						role: "alert",
						children: t("star.observer.dialogue.error")
					})
				]
			});
		}
		//#endregion
		//#region lib/types/client/star-map/StarObserver.js
		/** Evidence-bound card draw and human calibration surface for the Star Observer. */
		const DECKS = [
			"current-self",
			"unfolded-self",
			"inner-debate"
		];
		function browserLocalDate(now = /* @__PURE__ */ new Date()) {
			return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
		}
		function confidenceLabel(card, t) {
			if (card.cardKind === "imagination") return t("star.observer.kind.imagination");
			if (card.confidence >= .65) return t("star.observer.confidence.grounded");
			return t("star.observer.confidence.tentative");
		}
		/** Render one resumable observer desk without owning Remote or session context. */
		function StarObserver({ profile, cards, activeCard, t, onDraw, onCalibrate, onFinalize, onContinue, onApplyRevision }) {
			const authorizedSourceCount = Object.values(profile.permissions).filter(Boolean).length;
			const [open, setOpen] = (0, react.useState)(activeCard !== null);
			const [selectedId, setSelectedId] = (0, react.useState)(activeCard === null ? null : String(activeCard.id));
			const [deck, setDeck] = (0, react.useState)("current-self");
			const [question, setQuestion] = (0, react.useState)("");
			const card = activeCard ?? cards.find((item) => String(item.id) === selectedId) ?? null;
			const savedCards = cards.filter((item) => item.status === "saved");
			const [correction, setCorrection] = (0, react.useState)(card?.calibration?.correction ?? "");
			const [pending, setPending] = (0, react.useState)(null);
			const [error, setError] = (0, react.useState)(false);
			(0, react.useEffect)(() => {
				if (activeCard !== null) {
					setOpen(true);
					setSelectedId(String(activeCard.id));
				} else if (selectedId !== null && !cards.some((item) => String(item.id) === selectedId)) setSelectedId(null);
				setCorrection(card?.calibration?.correction ?? "");
			}, [
				activeCard,
				card,
				cards,
				selectedId
			]);
			const draw = async () => {
				if (pending !== null) return;
				setPending("draw");
				setError(false);
				const result = await settleMindGardenAction(() => onDraw({
					deck,
					question: question.trim(),
					observedLocalDate: browserLocalDate()
				}));
				setPending(null);
				if (!result.ok) setError(true);
			};
			const calibrate = async (verdict) => {
				if (card === null || pending !== null) return;
				setPending("calibrate");
				setError(false);
				const result = await settleMindGardenAction(() => onCalibrate({
					id: card.id,
					ifVersion: card.version,
					verdict,
					...correction.trim().length === 0 ? {} : { correction: correction.trim() }
				}));
				setPending(null);
				if (!result.ok) setError(true);
			};
			const finalize = async (action) => {
				if (card === null || pending !== null) return;
				setPending("finalize");
				setError(false);
				const result = await settleMindGardenAction(() => onFinalize({
					id: card.id,
					ifVersion: card.version,
					action
				}));
				setPending(null);
				if (!result.ok) {
					setError(true);
					return;
				}
				if (action === "dissolve") setSelectedId(null);
			};
			return (0, react_jsx_runtime.jsxs)("aside", {
				className: StarObserver_module_css_default.observatory,
				"data-open": open,
				"data-active-card": card !== null,
				children: [(0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: StarObserver_module_css_default.summon,
					"aria-expanded": open,
					onClick: () => {
						setOpen((value) => !value);
					},
					children: [
						(0, react_jsx_runtime.jsx)(StarMapIcon, { size: 17 }),
						(0, react_jsx_runtime.jsxs)("span", { children: [(0, react_jsx_runtime.jsx)("strong", { children: t("star.observer.summon") }), (0, react_jsx_runtime.jsx)("small", { children: card === null ? t("star.observer.summon.hint") : t("star.observer.awaiting") })] }),
						savedCards.length > 0 && (0, react_jsx_runtime.jsx)("b", { children: savedCards.length })
					]
				}), open && (0, react_jsx_runtime.jsxs)("section", {
					className: StarObserver_module_css_default.desk,
					"aria-label": t("star.observer.title"),
					"aria-live": "polite",
					children: [
						(0, react_jsx_runtime.jsxs)("header", {
							className: StarObserver_module_css_default.deskHeader,
							children: [(0, react_jsx_runtime.jsx)("h2", { children: t("star.observer.title") }), (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => {
									setOpen(false);
								},
								"aria-label": t("star.observer.close"),
								children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseOutline16, { size: 15 })
							})]
						}),
						activeCard === null && savedCards.length > 0 && (0, react_jsx_runtime.jsxs)("nav", {
							className: StarObserver_module_css_default.cardShelf,
							"aria-label": t("star.observer.saved.title"),
							children: [(0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								"data-selected": card === null,
								onClick: () => {
									setSelectedId(null);
								},
								children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlusOutline16, { size: 14 }), t("star.observer.saved.new")]
							}), savedCards.map((saved) => (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								"data-selected": card?.id === saved.id,
								onClick: () => {
									setSelectedId(String(saved.id));
								},
								children: [(0, react_jsx_runtime.jsx)(StarMapIcon, { size: 14 }), saved.title]
							}, saved.id))]
						}),
						card === null ? (0, react_jsx_runtime.jsxs)("div", {
							className: StarObserver_module_css_default.drawDesk,
							children: [
								(0, react_jsx_runtime.jsx)("p", { children: t("star.observer.disclosure") }),
								(0, react_jsx_runtime.jsxs)("fieldset", { children: [(0, react_jsx_runtime.jsx)("legend", { children: t("star.observer.deck") }), (0, react_jsx_runtime.jsx)("div", {
									className: StarObserver_module_css_default.decks,
									children: DECKS.map((value) => (0, react_jsx_runtime.jsxs)("button", {
										type: "button",
										"data-selected": deck === value,
										"aria-pressed": deck === value,
										onClick: () => {
											setDeck(value);
										},
										children: [(0, react_jsx_runtime.jsx)("i", { "aria-hidden": "true" }), (0, react_jsx_runtime.jsx)("span", { children: t(`star.observer.deck.${value}`) })]
									}, value))
								})] }),
								(0, react_jsx_runtime.jsxs)("label", {
									className: StarObserver_module_css_default.question,
									children: [(0, react_jsx_runtime.jsx)("span", { children: t("star.observer.question") }), (0, react_jsx_runtime.jsx)("textarea", {
										value: question,
										maxLength: 1200,
										placeholder: t("star.observer.question.placeholder"),
										onChange: (event) => {
											setQuestion(event.target.value);
										}
									})]
								}),
								(0, react_jsx_runtime.jsxs)("div", {
									className: StarObserver_module_css_default.permissionLine,
									children: [(0, react_jsx_runtime.jsxs)("span", { children: [
										(0, react_jsx_runtime.jsx)(PrivateIcon, { size: 15 }),
										authorizedSourceCount,
										"/4"
									] }), (0, react_jsx_runtime.jsxs)("p", { children: [(0, react_jsx_runtime.jsx)("strong", { children: t("star.observer.permission.title") }), t("star.observer.permission.body").replace("{count}", String(authorizedSourceCount))] })]
								}),
								error && (0, react_jsx_runtime.jsx)("p", {
									className: StarObserver_module_css_default.error,
									role: "alert",
									children: t("star.observer.error")
								}),
								(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: StarObserver_module_css_default.draw,
									disabled: pending !== null,
									onClick: () => {
										draw();
									},
									children: pending === "draw" ? (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("i", { "aria-hidden": "true" }), t("star.observer.drawing")] }) : t("star.observer.draw")
								})
							]
						}) : (0, react_jsx_runtime.jsxs)("article", {
							className: StarObserver_module_css_default.card,
							"data-kind": card.cardKind,
							children: [
								(0, react_jsx_runtime.jsx)("div", {
									className: StarObserver_module_css_default.cardGlow,
									"aria-hidden": "true"
								}),
								(0, react_jsx_runtime.jsxs)("div", {
									className: StarObserver_module_css_default.cardMeta,
									children: [(0, react_jsx_runtime.jsx)("span", { children: t(`star.observer.deck.${card.deck}`) }), (0, react_jsx_runtime.jsxs)("span", { children: [
										confidenceLabel(card, t),
										" · ",
										Math.round(card.confidence * 100),
										"%"
									] })]
								}),
								(0, react_jsx_runtime.jsx)("h3", { children: card.title }),
								(0, react_jsx_runtime.jsx)("p", {
									className: StarObserver_module_css_default.frontText,
									children: card.frontText
								}),
								(0, react_jsx_runtime.jsxs)("dl", {
									className: StarObserver_module_css_default.analysis,
									children: [
										(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("star.observer.analysis.situation") }), (0, react_jsx_runtime.jsx)("dd", { children: card.analysis.situation })] }),
										(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("star.observer.analysis.core") }), (0, react_jsx_runtime.jsx)("dd", { children: card.analysis.coreIssue })] }),
										(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("star.observer.analysis.tradeoff") }), (0, react_jsx_runtime.jsx)("dd", { children: card.analysis.tradeoff })] }),
										(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("star.observer.analysis.guidance") }), (0, react_jsx_runtime.jsx)("dd", { children: card.analysis.guidance })] })
									]
								}),
								card.evidence.length > 0 ? (0, react_jsx_runtime.jsxs)("details", {
									className: StarObserver_module_css_default.evidence,
									children: [(0, react_jsx_runtime.jsxs)("summary", { children: [
										t("star.observer.evidence"),
										" · ",
										card.evidence.length
									] }), card.evidence.map((item) => (0, react_jsx_runtime.jsx)("p", { children: item.summary }, item.id))]
								}) : (0, react_jsx_runtime.jsx)("p", {
									className: StarObserver_module_css_default.imagination,
									children: t("star.observer.imagination")
								}),
								(0, react_jsx_runtime.jsx)("blockquote", { children: card.openQuestion }),
								(0, react_jsx_runtime.jsx)(StarObserverDialogue, {
									card,
									t,
									onContinue,
									onApplyRevision
								}),
								(0, react_jsx_runtime.jsxs)("div", {
									className: StarObserver_module_css_default.calibration,
									children: [
										(0, react_jsx_runtime.jsx)("strong", { children: t("star.observer.calibrate") }),
										(0, react_jsx_runtime.jsx)("textarea", {
											value: correction,
											placeholder: t("star.observer.correction.placeholder"),
											onChange: (event) => {
												setCorrection(event.target.value);
											}
										}),
										(0, react_jsx_runtime.jsxs)("div", { children: [
											(0, react_jsx_runtime.jsx)("button", {
												type: "button",
												disabled: pending !== null,
												"data-selected": card.calibration?.verdict === "resonates",
												onClick: () => {
													calibrate("resonates");
												},
												children: t("star.observer.resonates")
											}),
											(0, react_jsx_runtime.jsx)("button", {
												type: "button",
												disabled: pending !== null,
												"data-selected": card.calibration?.verdict === "uncertain",
												onClick: () => {
													calibrate("uncertain");
												},
												children: t("star.observer.uncertain")
											}),
											(0, react_jsx_runtime.jsx)("button", {
												type: "button",
												disabled: pending !== null || correction.trim().length === 0,
												"data-selected": card.calibration?.verdict === "rejects",
												onClick: () => {
													calibrate("rejects");
												},
												children: t("star.observer.rejects")
											})
										] })
									]
								}),
								error && (0, react_jsx_runtime.jsx)("p", {
									className: StarObserver_module_css_default.error,
									role: "alert",
									children: t("star.observer.error")
								}),
								card.status === "draft" ? (0, react_jsx_runtime.jsxs)("footer", { children: [(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									disabled: pending !== null,
									onClick: () => {
										finalize("dissolve");
									},
									children: t("star.observer.dissolve")
								}), (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: StarObserver_module_css_default.save,
									disabled: pending !== null,
									onClick: () => {
										finalize("save");
									},
									children: t("star.observer.save")
								})] }) : (0, react_jsx_runtime.jsxs)("p", {
									className: StarObserver_module_css_default.savedState,
									children: [(0, react_jsx_runtime.jsx)(StarMapIcon, { size: 14 }), t("star.observer.saved.state")]
								})
							]
						}),
						(0, react_jsx_runtime.jsx)("small", {
							className: StarObserver_module_css_default.boundary,
							children: t("star.observer.boundary")
						})
					]
				})]
			});
		}
		//#endregion
		//#region \0dsh-css:E:\test code\deepseekharness_modified\deepseek-harness\packages\client\ui-mind-garden\src\client\star-map\StarMapSpace.module.css.mjs
		const css$11 = "._2mWe8G_space{--mg-star-night:#07101a;--mg-star-night-soft:#111c26;--mg-star-ivory:#f8efe1;--mg-star-muted:#c8c1b7;--mg-star-brass:#e0ad61;--mg-star-teal:#8d9f9d;--mg-star-blue:#95afd0;box-sizing:border-box;width:100%;height:max(700px,100dvh - 126px);min-height:700px;color:var(--mg-star-ivory);background-color:var(--mg-star-night);background-image:var(--mg-star-courtyard);isolation:isolate;background-position:50%;background-size:cover;position:relative;overflow:hidden}._2mWe8G_space:before,._2mWe8G_space:after{z-index:1;content:\"\";pointer-events:none;position:absolute;inset:0}._2mWe8G_space:before{background:radial-gradient(at 52% 45%,#0000 32%,#040b121a 70%,#04080c57 100%),linear-gradient(#03080d3d 0,#0000 30%,#04080c1a 72%,#04070a57)}._2mWe8G_space:after{opacity:.3;mix-blend-mode:screen;background:radial-gradient(at 52% 45%,#ddae6514,#0000 28%)}._2mWe8G_space ::selection{color:#111a20;background:#edbd72}._2mWe8G_header,._2mWe8G_metrics,._2mWe8G_codex,._2mWe8G_controls{z-index:5;position:absolute}._2mWe8G_header{pointer-events:none;background:linear-gradient(#04090e9e,#04090e38 58%,#0000);justify-content:space-between;align-items:flex-start;gap:24px;padding:26px clamp(22px,3.5vw,48px) 72px;display:flex;inset:0 0 auto}._2mWe8G_header>div:first-child{pointer-events:auto;max-width:590px}._2mWe8G_header h1{color:#fff4e4;max-width:18ch;font-family:var(--mg-font-display,\"Noto Serif SC\", serif);letter-spacing:-.03em;text-shadow:0 14px 48px #000000c7;text-wrap:balance;margin:0;font-size:clamp(32px,3.15vw,44px);font-weight:500;line-height:1.07}._2mWe8G_header p{color:#e2dacdbd;text-shadow:0 5px 20px #000c;-webkit-line-clamp:2;-webkit-box-orient:vertical;max-width:60ch;margin:9px 0 0;font-size:11px;line-height:1.6;display:-webkit-box;overflow:hidden}._2mWe8G_headerActions{pointer-events:auto;flex:none;gap:7px;display:flex}._2mWe8G_back{color:#d9d1c5;min-height:42px;font:inherit;cursor:pointer;backdrop-filter:blur(14px);background:#081118a3;border:0;border-radius:11px;padding:0 14px;font-size:10px;transition:color .17s,background .17s,transform .17s;box-shadow:0 12px 34px #0000003d}._2mWe8G_back:hover{color:#fff5e7;background:#1f262ad1;transform:translateY(-1px)}._2mWe8G_metrics{pointer-events:none;gap:20px;width:fit-content;display:flex;top:132px;left:clamp(22px,3.5vw,48px)}._2mWe8G_metrics span{color:#ddd5c894;white-space:nowrap;text-shadow:0 5px 18px #000;gap:2px;font-size:8px;line-height:1.2;display:grid}._2mWe8G_metrics strong{color:#efbd70;font-variant-numeric:tabular-nums;font-size:15px;font-weight:620}._2mWe8G_state{color:#d8cdbf;background:radial-gradient(circle at 50% 44%,#d3a45b21,#0000 28%),#07111a;place-content:center;justify-items:center;gap:14px;min-height:max(680px,100dvh - 126px);display:grid}._2mWe8G_state>div{gap:8px;display:flex}._2mWe8G_state button{color:#f8efe1;cursor:pointer;background:#17232e;border:0;border-radius:10px;min-height:40px;padding:0 13px}._2mWe8G_pulse{background:var(--mg-star-brass);border-radius:50%;width:18px;height:18px;animation:1.8s ease-in-out infinite _2mWe8G_pulse;box-shadow:0 8px 28px 8px #d9a45840}._2mWe8G_codex{color:#f8efe2;width:min(292px,100% - 56px);max-height:min(54vh,430px);box-shadow:none;pointer-events:none;background:0 0;flex-direction:column;display:flex;top:46%;right:clamp(28px,8vw,120px);overflow:visible;transform:translateY(-30%)}._2mWe8G_selected{filter:drop-shadow(0 12px 28px #000000c7);pointer-events:auto;padding:16px 2px 18px}._2mWe8G_selected>span{color:#ecc078;font-size:8px;font-weight:650}._2mWe8G_selected h2{color:#fff4e3;font-family:var(--mg-font-display,\"Noto Serif SC\", serif);margin:7px 0 6px;font-size:22px;font-weight:540;line-height:1.32}._2mWe8G_selected p{color:#dfd7c9c7;-webkit-line-clamp:4;-webkit-box-orient:vertical;margin:0;font-size:10px;line-height:1.65;display:-webkit-box;overflow:hidden}._2mWe8G_selected small{color:#d5ccbf7a;margin-top:9px;font-size:8px;line-height:1.45;display:block}._2mWe8G_nodeList{backdrop-filter:blur(16px)saturate(.9);pointer-events:auto;scrollbar-color:#e2b26457 transparent;scrollbar-width:thin;background:#070f148f;border-radius:13px;gap:5px;padding:6px 7px;display:flex;overflow-x:auto;box-shadow:0 18px 46px #00000047}._2mWe8G_nodeList button{color:#ded6c99e;min-width:max-content;min-height:34px;font:inherit;cursor:pointer;background:0 0;border:0;border-radius:9px;align-items:center;gap:6px;padding:0 10px;font-size:9px;display:inline-flex}._2mWe8G_nodeList button:hover,._2mWe8G_nodeList button[data-selected=true]{color:#fff4e4;background:#ecbe711f}._2mWe8G_nodeList button i{background:var(--mg-star-blue);border-radius:50%;flex:none;width:5px;height:5px;box-shadow:0 3px 10px}._2mWe8G_nodeList button[data-kind=center] i{background:var(--mg-star-brass)}._2mWe8G_nodeList button[data-kind=trait] i{background:#d78a6a}._2mWe8G_nodeList button[data-kind=review] i{background:#adc1bd}._2mWe8G_nodeList button span{text-overflow:ellipsis;white-space:nowrap;max-width:112px;overflow:hidden}._2mWe8G_retire{color:#e8b8a8;font:inherit;cursor:pointer;background:#85402f33;border:0;border-radius:8px;margin-top:10px;padding:7px 10px;font-size:9px}._2mWe8G_retire:disabled{opacity:.45;cursor:not-allowed}._2mWe8G_controls{color:#dcd3c66b;text-shadow:0 4px 14px #000;max-width:300px;margin:0;font-size:8px;line-height:1.5;bottom:18px;left:clamp(18px,3vw,38px)}._2mWe8G_back:focus-visible,._2mWe8G_nodeList button:focus-visible,._2mWe8G_retire:focus-visible{outline-offset:3px;outline:2px solid #efbd70}@keyframes _2mWe8G_pulse{50%{opacity:.4;transform:scale(.76)}}@media (width<=820px){._2mWe8G_space{height:max(760px,100dvh - 116px);min-height:760px}._2mWe8G_header{gap:14px;padding:22px 18px 68px}._2mWe8G_header h1{font-size:clamp(30px,7vw,42px)}._2mWe8G_header p{max-width:42ch}._2mWe8G_metrics{gap:13px;top:126px;left:18px}._2mWe8G_codex{width:auto;max-height:230px;inset:auto 16px 72px;transform:none}._2mWe8G_selected{padding:14px 16px 12px}._2mWe8G_selected p{-webkit-line-clamp:2}._2mWe8G_controls{display:none}}@media (width<=560px){._2mWe8G_space{background-position:50%;height:max(810px,100dvh - 108px);min-height:810px}._2mWe8G_header{padding:18px 14px 72px;display:block}._2mWe8G_header h1{max-width:9ch;font-size:33px}._2mWe8G_header p{-webkit-line-clamp:2;max-width:30ch;font-size:10px}._2mWe8G_headerActions{position:absolute;top:18px;right:14px}._2mWe8G_headerActions ._2mWe8G_back:first-child{white-space:nowrap;width:42px;padding:0 8px;overflow:hidden}._2mWe8G_back{backdrop-filter:none;min-height:42px}._2mWe8G_metrics{flex-wrap:wrap;gap:7px 14px;max-width:calc(100% - 28px);top:128px}._2mWe8G_metrics span{align-items:baseline;gap:4px;display:flex}._2mWe8G_codex{max-height:252px;bottom:64px;left:10px;right:10px}._2mWe8G_nodeList{backdrop-filter:none;padding-bottom:7px}}@media (prefers-reduced-motion:reduce){._2mWe8G_pulse{animation:none}._2mWe8G_back,._2mWe8G_codex{backdrop-filter:none}._2mWe8G_back{transition:none}}";
		const tagId$11 = "@deepseek-ai/dsh-mind-garden/StarMapSpace.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$11) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-mind-garden";
			tag.dataset.pluginCss = tagId$11;
			tag.textContent = css$11;
			document.head.appendChild(tag);
		}
		var StarMapSpace_module_css_default = {
			"back": "_2mWe8G_back",
			"codex": "_2mWe8G_codex",
			"controls": "_2mWe8G_controls",
			"header": "_2mWe8G_header",
			"headerActions": "_2mWe8G_headerActions",
			"metrics": "_2mWe8G_metrics",
			"nodeList": "_2mWe8G_nodeList",
			"pulse": "_2mWe8G_pulse",
			"retire": "_2mWe8G_retire",
			"selected": "_2mWe8G_selected",
			"space": "_2mWe8G_space",
			"state": "_2mWe8G_state"
		};
		//#endregion
		//#region lib/types/client/star-map/StarMapSpace.js
		/** Harness-native constellation space backed by an encrypted Star Map profile. */
		function profileRequest(profile, changes) {
			if (profile.version === null) return null;
			return {
				displayName: profile.displayName,
				birthMonth: profile.birthMonth,
				birthDay: profile.birthDay,
				birthYear: profile.birthYear,
				birthTime: profile.birthTime,
				birthTimeKnown: profile.birthTimeKnown,
				birthCity: profile.birthCity,
				birthCityKnown: profile.birthCityKnown,
				mbtiMode: profile.mbtiMode,
				mbtiType: profile.mbtiType,
				mbtiAnswers: profile.mbtiAnswers,
				selfWords: profile.selfWords,
				...changes,
				ifVersion: profile.version
			};
		}
		/** Render the resumable ritual or the durable interactive 3D constellation and codex. */
		function StarMapSpace({ questions, reviews, mode, t, onBack, onOverview, onSaveRitual, onCompleteRitual, onUpdateProfile, onUpdateTrait, onDrawCard, onCalibrateCard, onFinalizeCard, onContinueCard, onApplyCardRevision }) {
			const [overview, setOverview] = (0, react.useState)(null);
			const [loading, setLoading] = (0, react.useState)(true);
			const [loadError, setLoadError] = (0, react.useState)(false);
			const [profileOpen, setProfileOpen] = (0, react.useState)(false);
			const [selectedId, setSelectedId] = (0, react.useState)("center");
			const [traitPending, setTraitPending] = (0, react.useState)(false);
			const refresh = (0, react.useCallback)(async () => {
				setLoading(true);
				setLoadError(false);
				const result = await settleMindGardenAction(onOverview);
				setLoading(false);
				if (!result.ok) {
					setLoadError(true);
					return;
				}
				setOverview(result.value);
			}, [onOverview]);
			(0, react.useEffect)(() => {
				refresh();
			}, [refresh]);
			const runCardAction = (0, react.useCallback)(async (operation) => {
				const result = await settleMindGardenAction(operation);
				if (!result.ok) return result;
				const latest = await settleMindGardenAction(onOverview);
				if (latest.ok) setOverview(latest.value);
				return result;
			}, [onOverview]);
			if (loading && overview === null) return (0, react_jsx_runtime.jsxs)("main", {
				className: StarMapSpace_module_css_default.state,
				children: [
					(0, react_jsx_runtime.jsx)("span", {
						className: StarMapSpace_module_css_default.pulse,
						"aria-hidden": "true"
					}),
					(0, react_jsx_runtime.jsx)("p", { children: t("star.loading") }),
					(0, react_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onBack,
						children: t("star.back")
					})
				]
			});
			if (loadError || overview === null) return (0, react_jsx_runtime.jsxs)("main", {
				className: StarMapSpace_module_css_default.state,
				children: [(0, react_jsx_runtime.jsx)("p", { children: t("star.error") }), (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						refresh();
					},
					children: t("review.retry")
				}), (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onBack,
					children: t("star.back")
				})] })]
			});
			if (!overview.profile.onboardingCompleted) return (0, react_jsx_runtime.jsx)(StarRitual, {
				profile: overview.profile,
				t,
				onSave: async (input, stage, version) => await settleMindGardenAction(() => onSaveRitual({
					...input,
					onboardingStage: stage,
					ifVersion: version
				})),
				onComplete: async (input, version) => await settleMindGardenAction(() => onCompleteRitual({
					...input,
					ifVersion: version
				})),
				onCommit: setOverview,
				onExit: onBack
			});
			return (0, react_jsx_runtime.jsx)(CompletedStarMap, {
				overview,
				questions,
				reviews,
				mode,
				t,
				onBack,
				profileOpen,
				setProfileOpen,
				selectedId,
				setSelectedId,
				traitPending,
				setTraitPending,
				onCommit: setOverview,
				onUpdateProfile: async (profile, permissions, observerTone, observationIntent, reducedMotion) => {
					const request = profileRequest(profile, {
						permissions,
						observerTone,
						observationIntent,
						reducedMotion
					});
					return request === null ? {
						ok: false,
						code: "star-ritual-required"
					} : await settleMindGardenAction(() => onUpdateProfile(request));
				},
				onUpdateTrait,
				onDrawCard: (request) => runCardAction(() => onDrawCard(request)),
				onCalibrateCard: (request) => runCardAction(() => onCalibrateCard(request)),
				onFinalizeCard: (request) => runCardAction(() => onFinalizeCard(request)),
				onContinueCard: (request) => runCardAction(() => onContinueCard(request)),
				onApplyCardRevision: (request) => runCardAction(() => onApplyCardRevision(request))
			});
		}
		function CompletedStarMap({ overview, questions, reviews, mode, t, onBack, profileOpen, setProfileOpen, selectedId, setSelectedId, traitPending, setTraitPending, onCommit, onUpdateProfile, onUpdateTrait, onDrawCard, onCalibrateCard, onFinalizeCard, onContinueCard, onApplyCardRevision }) {
			const visibleQuestions = overview.profile.permissions.openQuestions ? questions : [];
			const visibleReviews = overview.profile.permissions.periodReviews ? reviews : [];
			const model = (0, react.useMemo)(() => createGardenStarMap(visibleQuestions, visibleReviews, mode, {
				center: t("star.center"),
				serenity: t("star.center.serenity"),
				clarity: t("star.center.clarity"),
				since: t("star.question.since"),
				unnamedReview: t("star.review.unnamed"),
				reviewDetail: t("star.review.detail"),
				traitDetail: t("star.trait.detail")
			}, overview.profile, overview.traits), [
				mode,
				overview,
				t,
				visibleQuestions,
				visibleReviews
			]);
			const selected = model.nodes.find((node) => node.id === selectedId) ?? model.nodes[0];
			const selectedTrait = selected.kind === "trait" ? overview.traits.find((trait) => `trait:${String(trait.id)}` === selected.id) : void 0;
			const questionsInSky = model.nodes.filter((node) => node.kind === "question").length;
			const reviewsInSky = model.nodes.filter((node) => node.kind === "review").length;
			const traitsInSky = model.nodes.filter((node) => node.kind === "trait").length;
			const retireTrait = async () => {
				if (selectedTrait === void 0 || traitPending) return;
				setTraitPending(true);
				const result = await settleMindGardenAction(() => onUpdateTrait({
					id: selectedTrait.id,
					ifVersion: selectedTrait.version,
					status: "retired"
				}));
				setTraitPending(false);
				if (!result.ok) return;
				onCommit({
					...overview,
					traits: overview.traits.filter((trait) => trait.id !== result.value.id)
				});
				setSelectedId("center");
			};
			return (0, react_jsx_runtime.jsxs)("main", {
				className: StarMapSpace_module_css_default.space,
				"data-mind-garden-star-map": "active",
				"data-profile-open": profileOpen,
				style: { "--mg-star-courtyard": `url("${STAR_MIST_COURTYARD_V5}")` },
				children: [
					(0, react_jsx_runtime.jsx)(StarField, {
						model,
						fallback: t("star.fallback"),
						onSelect: setSelectedId,
						reducedMotion: overview.profile.reducedMotion,
						selectedId: selected.id
					}),
					(0, react_jsx_runtime.jsxs)("header", {
						className: StarMapSpace_module_css_default.header,
						children: [(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("h1", { children: t("space.starMap") }), (0, react_jsx_runtime.jsx)("p", { children: t("star.subtitle") })] }), (0, react_jsx_runtime.jsxs)("div", {
							className: StarMapSpace_module_css_default.headerActions,
							children: [(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: StarMapSpace_module_css_default.back,
								onClick: () => {
									setProfileOpen(!profileOpen);
								},
								children: t("star.profile.open")
							}), (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: StarMapSpace_module_css_default.back,
								onClick: onBack,
								children: t("star.back")
							})]
						})]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: StarMapSpace_module_css_default.metrics,
						"aria-label": t("star.metrics"),
						children: [
							(0, react_jsx_runtime.jsxs)("span", { children: [(0, react_jsx_runtime.jsx)("strong", { children: traitsInSky }), t("star.metric.traits")] }),
							(0, react_jsx_runtime.jsxs)("span", { children: [(0, react_jsx_runtime.jsx)("strong", { children: questionsInSky }), t("star.metric.questions")] }),
							(0, react_jsx_runtime.jsxs)("span", { children: [(0, react_jsx_runtime.jsx)("strong", { children: reviewsInSky }), t("star.metric.reviews")] }),
							(0, react_jsx_runtime.jsxs)("span", { children: [(0, react_jsx_runtime.jsx)("strong", { children: model.links.length }), t("star.metric.links")] })
						]
					}),
					(0, react_jsx_runtime.jsx)(StarObserver, {
						profile: overview.profile,
						cards: overview.cards,
						activeCard: overview.activeCard,
						t,
						onDraw: onDrawCard,
						onCalibrate: onCalibrateCard,
						onFinalize: onFinalizeCard,
						onContinue: onContinueCard,
						onApplyRevision: onApplyCardRevision
					}),
					profileOpen && (0, react_jsx_runtime.jsx)(StarProfilePanel, {
						profile: overview.profile,
						t,
						onSave: onUpdateProfile,
						onCommit,
						onClose: () => {
							setProfileOpen(false);
						}
					}),
					(0, react_jsx_runtime.jsxs)("section", {
						className: StarMapSpace_module_css_default.codex,
						"aria-label": t("star.codex"),
						children: [(0, react_jsx_runtime.jsxs)("div", {
							className: StarMapSpace_module_css_default.selected,
							"data-kind": selected.kind,
							children: [
								(0, react_jsx_runtime.jsx)("span", { children: t(`star.kind.${selected.kind}`) }),
								(0, react_jsx_runtime.jsx)("h2", { children: selected.title }),
								(0, react_jsx_runtime.jsx)("p", { children: selected.detail }),
								selectedTrait !== void 0 && (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: StarMapSpace_module_css_default.retire,
									disabled: traitPending,
									onClick: () => {
										retireTrait();
									},
									children: t("star.trait.retire")
								}),
								(0, react_jsx_runtime.jsx)("small", { children: t("star.selected.hint") })
							]
						}), (0, react_jsx_runtime.jsx)("div", {
							className: StarMapSpace_module_css_default.nodeList,
							children: model.nodes.map((node) => (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								"data-kind": node.kind,
								"data-selected": node.id === selected.id,
								"aria-pressed": node.id === selected.id,
								onClick: () => {
									setSelectedId(node.id);
								},
								children: [(0, react_jsx_runtime.jsx)("i", { "aria-hidden": "true" }), (0, react_jsx_runtime.jsx)("span", { children: node.title })]
							}, node.id))
						})]
					}),
					(0, react_jsx_runtime.jsx)("p", {
						className: StarMapSpace_module_css_default.controls,
						children: t("star.controls")
					})
				]
			});
		}
		//#endregion
		//#region \0dsh-css:E:\test code\deepseekharness_modified\deepseek-harness\packages\client\ui-mind-garden\src\client\spaces\GardenSpace.module.css.mjs
		const css$10 = "._78Eciq_space{box-sizing:border-box;width:100%;height:100%;min-height:100%;color:var(--dsw-alias-label-primary);background:radial-gradient(circle at 6% 0%, color-mix(in srgb, var(--dsw-alias-state-warn-secondary) 20%, transparent), transparent 26rem), linear-gradient(160deg, color-mix(in srgb, var(--dsw-alias-bg-base) 86%, transparent), var(--dsw-alias-bg-base)), var(--mg-xuan-texture);scrollbar-color:var(--dsw-alias-border-l2) transparent;scrollbar-width:thin;background-size:auto,auto,680px;padding:clamp(28px,4vw,58px);overflow:auto}._78Eciq_space ::selection{color:var(--dsw-alias-label-primary);background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 22%, transparent)}._78Eciq_header{justify-content:space-between;align-items:flex-start;gap:24px;max-width:1180px;margin:0 auto 40px;padding:6px 0 28px 18px;display:flex;position:relative}._78Eciq_header:before{background:linear-gradient(180deg, var(--dsw-alias-state-warn-primary), var(--dsw-alias-state-business-primary));width:2px;height:48px;box-shadow:0 0 14px color-mix(in srgb, var(--dsw-alias-state-warn-primary) 20%, transparent);content:\"\";border-radius:2px;position:absolute;inset:9px auto auto 0}._78Eciq_eyebrow{color:color-mix(in srgb, var(--dsw-alias-state-success-primary) 70%, var(--dsw-alias-label-primary));letter-spacing:.14em;text-transform:uppercase;margin-block-end:9px;font-size:9px;font-weight:650;display:none}._78Eciq_header h1{max-width:22ch;font-family:var(--mg-font-reflection,\"Mind Garden Display\", \"Noto Serif SC\", \"Songti SC\", serif);letter-spacing:-.03em;text-wrap:balance;margin:0;font-size:clamp(28px,3.7vw,44px);font-weight:560;line-height:1.08}._78Eciq_header p{max-width:68ch;color:var(--dsw-alias-label-secondary);margin:13px 0 0;font-size:14px;line-height:1.65}._78Eciq_panel{box-shadow:none;background:0 0;border:0;border-radius:0}._78Eciq_notice,._78Eciq_error,._78Eciq_empty{border-block:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);background:0 0;border-radius:0;padding:12px 0}._78Eciq_error{color:var(--dsw-alias-state-error-primary);border-color:var(--dsw-alias-state-error-secondary)}._78Eciq_button,._78Eciq_quietButton,._78Eciq_dangerButton{min-height:38px;font:inherit;cursor:pointer;border:1px solid #0000;border-radius:8px;padding:7px 13px;font-size:12px;font-weight:600}._78Eciq_quietButton{color:var(--dsw-alias-label-secondary);border-color:var(--dsw-alias-border-l2);background:0 0}._78Eciq_dangerButton{color:var(--dsw-alias-state-error-primary);border-color:var(--dsw-alias-state-error-secondary);background:0 0}._78Eciq_button:disabled,._78Eciq_quietButton:disabled,._78Eciq_dangerButton:disabled{cursor:not-allowed;opacity:.52}._78Eciq_input,._78Eciq_textarea{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);width:100%;color:var(--dsw-alias-label-primary);background:color-mix(in srgb, var(--dsw-alias-bg-base) 92%, var(--dsw-alias-state-warn-secondary));box-shadow:inset 0 1px 3px color-mix(in srgb, var(--dsw-alias-label-primary) 4%, transparent);caret-color:var(--dsw-alias-state-business-primary);font:inherit;border-radius:8px}._78Eciq_input{min-height:40px;padding:7px 10px}._78Eciq_textarea{resize:vertical;min-height:104px;padding:10px;line-height:1.6}@media (width<=680px){._78Eciq_space{padding:24px 14px 40px}._78Eciq_header{margin-block-end:26px;display:block}}@media (prefers-reduced-motion:reduce){._78Eciq_space *,._78Eciq_space :before,._78Eciq_space :after{scroll-behavior:auto!important;animation-duration:.001ms!important;animation-iteration-count:1!important}}._78Eciq_space{height:auto;min-height:100%;color:var(--mg-ink,#342d27);background:linear-gradient(145deg, #fffdf7c2, #f8eee1e0), var(--mg-xuan-texture);font-family:var(--mg-font-ui,\"Noto Sans SC\", \"Source Han Sans SC\", \"PingFang SC\", \"Microsoft YaHei UI\", system-ui, sans-serif);background-size:auto,720px;overflow:visible}._78Eciq_button,._78Eciq_quietButton,._78Eciq_dangerButton{border-radius:9px}._78Eciq_button{color:#fffaf2;background:var(--mg-indigo,#405f87);box-shadow:5px 10px 20px #304c7026}._78Eciq_quietButton{color:var(--mg-indigo,#405f87);background:#405f870f;border-color:#405f872e}._78Eciq_dangerButton{color:var(--mg-plum,#8d5a5e);background:#8d5a5e0d;border-color:#8d5a5e33}._78Eciq_input,._78Eciq_textarea{color:var(--mg-ink,#342d27);background:#fffcf7b8;border-color:#533e2d2b;border-radius:9px;box-shadow:inset 0 1px 3px #46311f0a}._78Eciq_button:focus-visible,._78Eciq_quietButton:focus-visible,._78Eciq_dangerButton:focus-visible,._78Eciq_input:focus-visible,._78Eciq_textarea:focus-visible{outline:3px solid var(--mg-indigo,#405f87);outline-offset:2px}._78Eciq_notice,._78Eciq_error,._78Eciq_empty{color:var(--mg-muted,#76695e);border-color:#533e2d24}._78Eciq_error{color:var(--mg-plum,#8d5a5e)}._78Eciq_space{text-rendering:optimizelegibility;padding:clamp(22px,3vw,42px)}._78Eciq_button,._78Eciq_quietButton,._78Eciq_dangerButton{justify-content:center;align-items:center;gap:7px;min-height:42px;padding:8px 14px;line-height:1.25;transition:color .16s ease-out,border-color .16s ease-out,background .16s ease-out,box-shadow .18s ease-out,transform .18s cubic-bezier(.16,1,.3,1);display:inline-flex}._78Eciq_button>svg,._78Eciq_quietButton>svg,._78Eciq_dangerButton>svg{flex:0 0 16px;width:16px;height:16px;display:block}._78Eciq_button:hover:not(:disabled),._78Eciq_quietButton:hover:not(:disabled),._78Eciq_dangerButton:hover:not(:disabled){transform:translateY(-1px)}._78Eciq_button:hover:not(:disabled){background:var(--mg-indigo-deep,#304c70);box-shadow:6px 12px 24px #304c7030}._78Eciq_quietButton:hover:not(:disabled){background:#405f871a;border-color:#405f8752}._78Eciq_dangerButton:hover:not(:disabled){background:#8d5a5e1a;border-color:#8d5a5e57}._78Eciq_button:active:not(:disabled),._78Eciq_quietButton:active:not(:disabled),._78Eciq_dangerButton:active:not(:disabled){transform:translateY(0)}._78Eciq_input,._78Eciq_textarea,._78Eciq_space select{min-height:42px;color:var(--mg-ink,#342d27);font:inherit;font-size:13px}._78Eciq_space label>span,._78Eciq_space label:not(:has(>span)){line-height:1.45}@media (width<=680px){._78Eciq_space{padding:20px 12px 38px}._78Eciq_button,._78Eciq_quietButton,._78Eciq_dangerButton{min-height:44px}._78Eciq_input,._78Eciq_textarea,._78Eciq_space select{min-height:44px;font-size:16px}}@media (prefers-reduced-motion:reduce){._78Eciq_button,._78Eciq_quietButton,._78Eciq_dangerButton{transition:none}}";
		const tagId$10 = "@deepseek-ai/dsh-mind-garden/GardenSpace.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$10) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-mind-garden";
			tag.dataset.pluginCss = tagId$10;
			tag.textContent = css$10;
			document.head.appendChild(tag);
		}
		var GardenSpace_module_css_default = {
			"button": "_78Eciq_button",
			"dangerButton": "_78Eciq_dangerButton",
			"empty": "_78Eciq_empty",
			"error": "_78Eciq_error",
			"eyebrow": "_78Eciq_eyebrow",
			"header": "_78Eciq_header",
			"input": "_78Eciq_input",
			"notice": "_78Eciq_notice",
			"panel": "_78Eciq_panel",
			"quietButton": "_78Eciq_quietButton",
			"space": "_78Eciq_space",
			"textarea": "_78Eciq_textarea"
		};
		//#endregion
		//#region \0dsh-css:E:\test code\deepseekharness_modified\deepseek-harness\packages\client\ui-mind-garden\src\client\spaces\ConcernsSpace.module.css.mjs
		const css$9 = ".jpyVRq_threshold{background:var(--mg-concern-scene) center / cover no-repeat;isolation:isolate;grid-template-rows:auto 1fr;grid-template-columns:minmax(320px,.72fr) minmax(420px,1.28fr);gap:24px 50px;min-height:clamp(560px,56vw,690px);margin:calc(-1*clamp(28px,4vw,58px)) calc(-1*clamp(28px,4vw,58px)) 64px;padding:clamp(46px,6vw,82px);display:grid;position:relative;overflow:hidden;box-shadow:0 28px 72px #48332124}.jpyVRq_threshold:before{z-index:-1;content:\"\";background:linear-gradient(90deg,#fffbf4fa 0 30%,#fffbf4d1 42%,#0000 64%);position:absolute;inset:0}.jpyVRq_intro{z-index:1;grid-column:1;align-items:flex-start;gap:18px;display:grid}.jpyVRq_intro h1{max-width:12ch;font-family:var(--mg-font-reflection,\"Mind Garden Display\", \"Noto Serif SC\", serif);letter-spacing:-.035em;text-wrap:balance;margin:0;font-size:clamp(38px,4vw,52px);font-weight:560;line-height:1.1}.jpyVRq_intro p{max-width:34ch;color:var(--mg-muted,#76695e);margin:16px 0 0;font-size:13px;line-height:1.75}.jpyVRq_privacy{color:var(--mg-muted,#76695e);flex:none;justify-self:start;align-items:center;gap:6px;padding-block-start:8px;font-size:10px;display:inline-flex}.jpyVRq_composer{z-index:1;background:linear-gradient(130deg, #fffdf7f5, #f7eddeeb), var(--mg-xuan-texture);background-size:auto,420px;border:1px solid #503a2826;border-radius:14px;grid-column:1;align-self:end;gap:16px;padding:20px;display:grid;box-shadow:8px 16px 34px #44301f26}.jpyVRq_composerIntro{align-items:center;gap:10px;display:flex}.jpyVRq_composerIntro h2{letter-spacing:-.02em;margin:0;font-size:16px;font-weight:700}.jpyVRq_composerSeal{aspect-ratio:1;width:34px;color:var(--mg-plum,#8d5a5e);background:#fffbf5bd;border:1px solid #8d5a5e47;border-radius:50%;place-items:center;display:grid}.jpyVRq_composerFields{gap:13px;display:grid}.jpyVRq_concernField{color:var(--mg-muted,#76695e);gap:7px;font-size:11px;display:grid}.jpyVRq_concernField textarea{background:#fffcf7bd;min-height:112px}.jpyVRq_composerFooter{grid-template-columns:minmax(132px,.8fr) minmax(160px,1.2fr) auto;align-items:end;gap:10px;display:grid}.jpyVRq_reminderField{color:var(--mg-muted,#76695e);gap:6px;font-size:10px;display:grid}.jpyVRq_retrieval{min-height:40px;color:var(--mg-muted,#76695e);align-items:center;gap:8px;font-size:10px;line-height:1.4;display:flex}.jpyVRq_retrieval input{width:15px;height:15px;accent-color:var(--mg-indigo,#405f87)}.jpyVRq_collection{width:min(1120px,100%);margin:0 auto}.jpyVRq_collectionHeader{border-block-end:1px solid #533e2d29;justify-content:space-between;align-items:baseline;gap:24px;margin-block-end:28px;padding-block-end:17px;display:flex}.jpyVRq_collectionHeader h2{font-family:var(--mg-font-reflection,\"Mind Garden Display\", \"Noto Serif SC\", serif);letter-spacing:-.03em;margin:0;font-size:clamp(26px,3vw,38px);font-weight:560}.jpyVRq_collectionHeader strong{color:var(--mg-plum,#8d5a5e);font-size:11px}.jpyVRq_list{grid-template-columns:repeat(2,minmax(0,1fr));gap:18px 28px;margin:0;padding:0;list-style:none;display:grid}.jpyVRq_card{background:linear-gradient(130deg, #fffdf8e8, #f6ebdcd4), var(--mg-xuan-texture);background-size:auto,430px;border:1px solid #533e2d21;border-radius:10px 14px 11px 13px;grid-template-columns:18px minmax(0,1fr);gap:13px;min-width:0;padding:20px 18px 17px 12px;display:grid;position:relative;box-shadow:6px 12px 26px #46311f1a}.jpyVRq_card:nth-child(2n){transform:translateY(12px)rotate(.18deg)}.jpyVRq_card[data-status=completed]{opacity:.68}.jpyVRq_thread{width:18px;display:block;position:relative}.jpyVRq_thread:before{background:var(--mg-plum,#8d5a5e);content:\"\";opacity:.48;width:1px;position:absolute;inset:-30px auto 8px 8px}.jpyVRq_thread:after{background:var(--mg-brass,#a77d43);content:\"\";border:2px solid #fff9ef;border-radius:50%;width:7px;height:7px;position:absolute;inset:3px auto auto 4px;box-shadow:0 3px 7px #402c1c30}.jpyVRq_thread i{display:none}.jpyVRq_cardBody{min-width:0}.jpyVRq_cardBody>p{color:var(--mg-ink,#342d27);font-family:var(--mg-font-reflection,\"Mind Garden Display\", serif);margin:0;font-size:17px;line-height:1.72}.jpyVRq_meta{color:var(--mg-muted,#76695e);flex-wrap:wrap;gap:6px 12px;margin-block-start:13px;font-size:10px;display:flex}.jpyVRq_meta span:first-child{color:var(--mg-plum,#8d5a5e);font-weight:700}.jpyVRq_actions{border-block-start:1px solid #533e2d1c;flex-wrap:wrap;grid-column:2;gap:6px;margin-block-start:14px;padding-block-start:12px;display:flex}.jpyVRq_actions button{border-color:#0000;min-height:31px;padding:4px 8px}.jpyVRq_editor{gap:10px;display:grid}.jpyVRq_editorActions{flex-wrap:wrap;gap:8px;display:flex}.jpyVRq_emptyState{min-height:170px;color:var(--mg-muted,#76695e);border-block:1px solid #533e2d1f;justify-content:center;align-items:center;gap:12px;display:flex}.jpyVRq_emptyState p{margin:0}@media (width<=980px){.jpyVRq_threshold{background-position:58%;grid-template-columns:minmax(280px,.82fr) minmax(300px,1.18fr);min-height:820px;padding:48px 34px}.jpyVRq_threshold:before{background:linear-gradient(90deg,#fffbf4f7 0 34%,#fffbf4b3 52%,#0000 72%)}.jpyVRq_composerFooter{grid-template-columns:1fr 1fr}.jpyVRq_retrieval{grid-column:1}.jpyVRq_composerFooter>button{grid-area:2/2}}@media (width<=680px){.jpyVRq_threshold{background-position:68%;grid-template-rows:auto 1fr auto;grid-template-columns:1fr;gap:0;min-height:940px;margin:-24px -14px 42px;padding:34px 18px 22px}.jpyVRq_threshold:before{background:linear-gradient(#fffbf4f7 0 31%,#fffbf442 57%,#fffbf4e0 76%)}.jpyVRq_intro{grid-column:1}.jpyVRq_intro h1{font-size:43px}.jpyVRq_privacy{display:none}.jpyVRq_composer{grid-area:3/1;padding:17px}.jpyVRq_composerFooter{grid-template-columns:1fr}.jpyVRq_retrieval,.jpyVRq_composerFooter>button{grid-area:auto/1}.jpyVRq_list{grid-template-columns:1fr}.jpyVRq_card:nth-child(2n){transform:none}.jpyVRq_actions{grid-column:1/-1}}@media (prefers-reduced-motion:reduce){.jpyVRq_card:nth-child(2n){transform:none}}.jpyVRq_threshold{background-position:58%;border-radius:18px;grid-template-rows:auto 1fr;grid-template-columns:minmax(320px,.72fr) minmax(520px,1.28fr);gap:20px 44px;min-height:clamp(500px,48vw,570px);margin-block-end:48px;padding:clamp(38px,4.5vw,58px);box-shadow:0 26px 68px #44301f21}.jpyVRq_threshold:before{background:linear-gradient(90deg,#fffbf4fa 0 31%,#fffbf4c7 45%,#0000 65%)}.jpyVRq_intro{align-self:start;gap:10px}.jpyVRq_intro h1{letter-spacing:-.03em;max-width:10ch;font-size:clamp(34px,3.2vw,43px);line-height:1.12}.jpyVRq_intro p{max-width:32ch;margin-block-start:12px;font-size:12px;line-height:1.7}.jpyVRq_privacy{padding-block-start:2px}.jpyVRq_privacy>svg{flex:0 0 15px;width:15px;height:15px;display:block}.jpyVRq_composer{border:0;gap:13px;padding:17px 18px 18px;box-shadow:7px 14px 30px #44301f21}.jpyVRq_composerIntro{gap:9px}.jpyVRq_composerIntro h2{font-size:15px}.jpyVRq_composerSeal{width:30px}.jpyVRq_composerSeal>svg{width:16px;height:16px;display:block}.jpyVRq_composerFields{gap:10px}.jpyVRq_concernField textarea{min-height:82px}.jpyVRq_composerFooter{grid-template-columns:minmax(130px,1fr) auto}.jpyVRq_retrieval{grid-column:1}.jpyVRq_composerFooter>button{white-space:nowrap;grid-area:1/2/span 2;min-width:112px}.jpyVRq_collectionHeader{border-block-end:0;margin-block-end:20px;padding-block-end:4px}.jpyVRq_collectionHeader h2{font-size:clamp(24px,2.5vw,31px)}.jpyVRq_list{gap:16px 22px}.jpyVRq_card{border:0;border-radius:12px;padding:18px 18px 17px 12px;box-shadow:0 13px 34px #44301f12}.jpyVRq_cardBody>p{font-size:16px}.jpyVRq_actions button{min-height:38px}.jpyVRq_actions button>svg,.jpyVRq_editorActions button>svg{flex:0 0 15px;width:15px;height:15px;display:block}@container jpyVRq_mind-garden-workspace (width<=820px){.jpyVRq_threshold{grid-template-columns:minmax(270px,.8fr) minmax(330px,1.2fr);min-height:560px;padding:36px 28px}.jpyVRq_composerFooter{grid-template-columns:1fr 1fr}.jpyVRq_retrieval{grid-column:1}.jpyVRq_composerFooter>button{grid-area:1/2/span 2}}@container jpyVRq_mind-garden-workspace (width<=620px){.jpyVRq_threshold{background-position:62% 58%;border-radius:0 0 18px 18px;grid-template-rows:auto 150px auto;grid-template-columns:1fr;gap:0;min-height:0;margin:-20px -12px 34px;padding:26px 12px 12px}.jpyVRq_threshold:before{background:linear-gradient(#fffbf4fa 0 30%,#fffbf429 49%,#fffbf4f0 68%)}.jpyVRq_intro{grid-area:1/1;padding-inline:6px}.jpyVRq_intro h1{max-width:12ch;font-size:clamp(31px,10vw,37px)}.jpyVRq_intro p{-webkit-line-clamp:2;-webkit-box-orient:vertical;max-width:35ch;margin-block-start:9px;font-size:12px;display:-webkit-box;overflow:hidden}.jpyVRq_privacy{display:none}.jpyVRq_composer{grid-area:3/1;padding:16px}.jpyVRq_composerFooter{grid-template-columns:1fr}.jpyVRq_retrieval,.jpyVRq_composerFooter>button{grid-area:auto/1}.jpyVRq_composerFooter>button{width:100%}.jpyVRq_collectionHeader{align-items:center}.jpyVRq_collectionHeader h2{font-size:25px}.jpyVRq_list{grid-template-columns:1fr}.jpyVRq_card:nth-child(2n){transform:none}.jpyVRq_actions{grid-column:1/-1}.jpyVRq_actions button{min-height:42px}}@media (width<=620px){.jpyVRq_threshold{background-position:62% 58%;border-radius:0 0 18px 18px;grid-template-rows:auto 140px auto;grid-template-columns:1fr;gap:0;min-height:0;margin:-20px -12px 34px;padding:26px 12px 12px}.jpyVRq_threshold:before{background:linear-gradient(#fffbf4fc 0 37%,#fffbf447 51%,#fffbf4f2 68%)}.jpyVRq_intro{grid-area:1/1;padding-inline:6px}.jpyVRq_intro h1{max-width:11ch;font-size:clamp(31px,10vw,37px)}.jpyVRq_intro p{-webkit-line-clamp:2;-webkit-box-orient:vertical;max-width:27ch;margin-block-start:9px;font-size:12px;display:-webkit-box;overflow:hidden}.jpyVRq_privacy{display:none}.jpyVRq_composer{grid-area:3/1;padding:16px}.jpyVRq_composerFooter{grid-template-columns:1fr}.jpyVRq_retrieval,.jpyVRq_composerFooter>button{grid-area:auto/1}.jpyVRq_composerFooter>button{width:100%}}";
		const tagId$9 = "@deepseek-ai/dsh-mind-garden/ConcernsSpace.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$9) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-mind-garden";
			tag.dataset.pluginCss = tagId$9;
			tag.textContent = css$9;
			document.head.appendChild(tag);
		}
		var ConcernsSpace_module_css_default = {
			"actions": "jpyVRq_actions",
			"card": "jpyVRq_card",
			"cardBody": "jpyVRq_cardBody",
			"collection": "jpyVRq_collection",
			"collectionHeader": "jpyVRq_collectionHeader",
			"composer": "jpyVRq_composer",
			"composerFields": "jpyVRq_composerFields",
			"composerFooter": "jpyVRq_composerFooter",
			"composerIntro": "jpyVRq_composerIntro",
			"composerSeal": "jpyVRq_composerSeal",
			"concernField": "jpyVRq_concernField",
			"editor": "jpyVRq_editor",
			"editorActions": "jpyVRq_editorActions",
			"emptyState": "jpyVRq_emptyState",
			"intro": "jpyVRq_intro",
			"list": "jpyVRq_list",
			"meta": "jpyVRq_meta",
			"mind-garden-workspace": "jpyVRq_mind-garden-workspace",
			"privacy": "jpyVRq_privacy",
			"reminderField": "jpyVRq_reminderField",
			"retrieval": "jpyVRq_retrieval",
			"thread": "jpyVRq_thread",
			"threshold": "jpyVRq_threshold"
		};
		//#endregion
		//#region lib/types/client/spaces/ConcernsSpace.js
		/** Private concern basket backed by encrypted reflection records. */
		/** Render create, complete, and journal-conversion flows for private concerns. */
		function ConcernsSpace({ today, onListConcerns, onCreateConcern, onUpdateConcern, onCompleteConcern, onConvertConcern, onDraftConversation = () => void 0, t }) {
			const [concerns, setConcerns] = (0, react.useState)([]);
			const [content, setContent] = (0, react.useState)("");
			const [reminder, setReminder] = (0, react.useState)("");
			const [allowRetrieval, setAllowRetrieval] = (0, react.useState)(false);
			const [editingId, setEditingId] = (0, react.useState)(null);
			const [editingContent, setEditingContent] = (0, react.useState)("");
			const [editingReminder, setEditingReminder] = (0, react.useState)("");
			const [loading, setLoading] = (0, react.useState)(true);
			const [pending, setPending] = (0, react.useState)(false);
			const [error, setError] = (0, react.useState)(false);
			const [notice, setNotice] = (0, react.useState)(null);
			const requestRef = (0, react.useRef)(0);
			const refresh = (0, react.useCallback)(async () => {
				const request = ++requestRef.current;
				const result = await settleMindGardenAction(onListConcerns);
				if (request !== requestRef.current) return;
				if (result.ok) {
					setConcerns(result.value);
					setError(false);
				} else setError(true);
				setLoading(false);
			}, [onListConcerns]);
			(0, react.useEffect)(() => {
				refresh();
				return () => {
					requestRef.current++;
				};
			}, [refresh]);
			async function submit(event) {
				event.preventDefault();
				const value = content.trim();
				if (value === "" || pending) return;
				setPending(true);
				setError(false);
				setNotice(null);
				const result = await settleMindGardenAction(() => onCreateConcern(value, calendarStamp(today), reminder === "" ? void 0 : calendarStamp(reminder)));
				setPending(false);
				if (!result.ok) {
					setError(true);
					return;
				}
				setContent("");
				setReminder("");
				setNotice("concern.notice.created");
				await refresh();
			}
			async function complete(item) {
				setPending(true);
				setError(false);
				setNotice(null);
				const result = await settleMindGardenAction(() => onCompleteConcern(item));
				setPending(false);
				if (!result.ok) {
					setError(true);
					return;
				}
				setNotice("concern.notice.completed");
				await refresh();
			}
			function beginEdit(item) {
				setEditingId(String(item.id));
				setEditingContent(item.content);
				setEditingReminder(item.reminder?.localDate ?? "");
				setNotice(null);
				setError(false);
			}
			async function update(item) {
				const value = editingContent.trim();
				if (value === "" || pending) return;
				setPending(true);
				setError(false);
				setNotice(null);
				const result = await settleMindGardenAction(() => onUpdateConcern(item, value, today, editingReminder === "" ? void 0 : calendarStamp(editingReminder)));
				setPending(false);
				if (!result.ok) {
					setError(true);
					return;
				}
				setEditingId(null);
				setNotice("concern.notice.updated");
				await refresh();
			}
			function draftConversation(item) {
				onDraftConversation(t("concern.conversation.draft").replace("{content}", item.content));
				setNotice("concern.notice.drafted");
				setError(false);
			}
			async function convert(item) {
				setPending(true);
				setError(false);
				setNotice(null);
				const result = await settleMindGardenAction(() => onConvertConcern(item, calendarStamp(today), allowRetrieval));
				setPending(false);
				if (!result.ok) {
					setError(true);
					return;
				}
				setNotice("concern.notice.converted");
				await refresh();
			}
			return (0, react_jsx_runtime.jsxs)("main", {
				className: GardenSpace_module_css_default.space,
				"data-mind-garden-space": "concerns",
				children: [
					(0, react_jsx_runtime.jsxs)("section", {
						className: ConcernsSpace_module_css_default.threshold,
						style: { "--mg-concern-scene": `url("${CONCERN_PAPER_LATTICE_V3}")` },
						children: [(0, react_jsx_runtime.jsxs)("header", {
							className: ConcernsSpace_module_css_default.intro,
							children: [(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("h1", { children: t("concern.title") }), (0, react_jsx_runtime.jsx)("p", { children: t("concern.subtitle") })] }), (0, react_jsx_runtime.jsxs)("aside", {
								className: ConcernsSpace_module_css_default.privacy,
								children: [(0, react_jsx_runtime.jsx)(PrivateIcon, { size: 17 }), (0, react_jsx_runtime.jsx)("span", { children: t("space.private") })]
							})]
						}), (0, react_jsx_runtime.jsxs)("form", {
							className: `${GardenSpace_module_css_default.panel} ${ConcernsSpace_module_css_default.composer}`,
							onSubmit: (event) => {
								submit(event);
							},
							children: [(0, react_jsx_runtime.jsxs)("div", {
								className: ConcernsSpace_module_css_default.composerIntro,
								children: [(0, react_jsx_runtime.jsx)("span", {
									className: ConcernsSpace_module_css_default.composerSeal,
									children: (0, react_jsx_runtime.jsx)(ConcernsIcon, { size: 18 })
								}), (0, react_jsx_runtime.jsx)("h2", { children: t("concern.compose.title") })]
							}), (0, react_jsx_runtime.jsxs)("div", {
								className: ConcernsSpace_module_css_default.composerFields,
								children: [(0, react_jsx_runtime.jsxs)("label", {
									className: ConcernsSpace_module_css_default.concernField,
									children: [(0, react_jsx_runtime.jsx)("span", { children: t("concern.input") }), (0, react_jsx_runtime.jsx)("textarea", {
										className: GardenSpace_module_css_default.textarea,
										value: content,
										placeholder: t("concern.placeholder"),
										onChange: (event) => {
											setContent(event.target.value);
										}
									})]
								}), (0, react_jsx_runtime.jsxs)("div", {
									className: ConcernsSpace_module_css_default.composerFooter,
									children: [
										(0, react_jsx_runtime.jsxs)("label", {
											className: ConcernsSpace_module_css_default.reminderField,
											children: [(0, react_jsx_runtime.jsx)("span", { children: t("concern.reminder") }), (0, react_jsx_runtime.jsx)("input", {
												className: GardenSpace_module_css_default.input,
												type: "date",
												min: today,
												value: reminder,
												onChange: (event) => {
													setReminder(event.target.value);
												}
											})]
										}),
										(0, react_jsx_runtime.jsxs)("label", {
											className: ConcernsSpace_module_css_default.retrieval,
											children: [(0, react_jsx_runtime.jsx)("input", {
												type: "checkbox",
												checked: allowRetrieval,
												onChange: (event) => {
													setAllowRetrieval(event.target.checked);
												}
											}), (0, react_jsx_runtime.jsx)("span", { children: t("concern.retrieval") })]
										}),
										(0, react_jsx_runtime.jsx)("button", {
											className: GardenSpace_module_css_default.button,
											type: "submit",
											disabled: pending || content.trim() === "",
											children: t("concern.add")
										})
									]
								})]
							})]
						})]
					}),
					notice !== null && (0, react_jsx_runtime.jsx)("p", {
						className: GardenSpace_module_css_default.notice,
						role: "status",
						children: t(notice)
					}),
					error && (0, react_jsx_runtime.jsx)("p", {
						className: GardenSpace_module_css_default.error,
						role: "alert",
						children: t("concern.error")
					}),
					(0, react_jsx_runtime.jsxs)("section", {
						className: ConcernsSpace_module_css_default.collection,
						"aria-labelledby": "mind-garden-concern-collection",
						children: [(0, react_jsx_runtime.jsxs)("header", {
							className: ConcernsSpace_module_css_default.collectionHeader,
							children: [(0, react_jsx_runtime.jsx)("div", { children: (0, react_jsx_runtime.jsx)("h2", {
								id: "mind-garden-concern-collection",
								children: t("concern.collection.title")
							}) }), (0, react_jsx_runtime.jsx)("strong", { children: concerns.length === 0 ? t("concern.collection.emptyCount") : t("concern.collection.count").replace("{count}", String(concerns.length)) })]
						}), loading ? (0, react_jsx_runtime.jsx)("p", {
							className: GardenSpace_module_css_default.empty,
							role: "status",
							children: t("concern.loading")
						}) : concerns.length === 0 ? (0, react_jsx_runtime.jsxs)("div", {
							className: ConcernsSpace_module_css_default.emptyState,
							children: [(0, react_jsx_runtime.jsx)(ConcernsIcon, { size: 24 }), (0, react_jsx_runtime.jsx)("p", { children: t("concern.empty") })]
						}) : (0, react_jsx_runtime.jsx)("ul", {
							className: ConcernsSpace_module_css_default.list,
							children: concerns.map((item) => (0, react_jsx_runtime.jsxs)("li", {
								className: `${GardenSpace_module_css_default.panel} ${ConcernsSpace_module_css_default.card}`,
								"data-status": item.status,
								children: [
									(0, react_jsx_runtime.jsx)("span", {
										className: ConcernsSpace_module_css_default.thread,
										"aria-hidden": "true",
										children: (0, react_jsx_runtime.jsx)("i", {})
									}),
									(0, react_jsx_runtime.jsxs)("div", {
										className: ConcernsSpace_module_css_default.cardBody,
										children: [editingId === String(item.id) ? (0, react_jsx_runtime.jsxs)("form", {
											className: ConcernsSpace_module_css_default.editor,
											onSubmit: (event) => {
												event.preventDefault();
												update(item);
											},
											children: [
												(0, react_jsx_runtime.jsx)("textarea", {
													className: GardenSpace_module_css_default.textarea,
													value: editingContent,
													"aria-label": t("concern.edit"),
													onChange: (event) => {
														setEditingContent(event.target.value);
													}
												}),
												(0, react_jsx_runtime.jsx)("input", {
													className: GardenSpace_module_css_default.input,
													type: "date",
													min: today,
													value: editingReminder,
													"aria-label": t("concern.reminder"),
													onChange: (event) => {
														setEditingReminder(event.target.value);
													}
												}),
												(0, react_jsx_runtime.jsxs)("div", {
													className: ConcernsSpace_module_css_default.editorActions,
													children: [(0, react_jsx_runtime.jsxs)("button", {
														className: GardenSpace_module_css_default.button,
														type: "submit",
														disabled: pending || editingContent.trim() === "",
														children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutline16, { size: 14 }), t("concern.edit.save")]
													}), (0, react_jsx_runtime.jsx)("button", {
														className: GardenSpace_module_css_default.quietButton,
														type: "button",
														onClick: () => {
															setEditingId(null);
														},
														children: t("concern.edit.cancel")
													})]
												})
											]
										}) : (0, react_jsx_runtime.jsx)("p", { children: item.content }), (0, react_jsx_runtime.jsxs)("div", {
											className: ConcernsSpace_module_css_default.meta,
											children: [
												(0, react_jsx_runtime.jsx)("span", { children: t(`concern.status.${item.status}`) }),
												(0, react_jsx_runtime.jsx)("span", { children: item.createdStamp.localDate }),
												item.reminder !== null && (0, react_jsx_runtime.jsx)("span", { children: t("concern.reminds").replace("{date}", item.reminder.localDate) })
											]
										})]
									}),
									item.status === "active" && editingId !== String(item.id) && (0, react_jsx_runtime.jsxs)("div", {
										className: ConcernsSpace_module_css_default.actions,
										children: [
											(0, react_jsx_runtime.jsxs)("button", {
												className: GardenSpace_module_css_default.quietButton,
												type: "button",
												onClick: () => {
													draftConversation(item);
												},
												children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSendOutline14, {}), t("concern.conversation")]
											}),
											(0, react_jsx_runtime.jsxs)("button", {
												className: GardenSpace_module_css_default.quietButton,
												type: "button",
												onClick: () => {
													beginEdit(item);
												},
												children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconEditOutline16, { size: 14 }), t("concern.edit")]
											}),
											(0, react_jsx_runtime.jsxs)("button", {
												className: GardenSpace_module_css_default.quietButton,
												type: "button",
												disabled: pending,
												onClick: () => {
													convert(item);
												},
												children: [(0, react_jsx_runtime.jsx)(JournalIcon, { size: 14 }), t("concern.convert")]
											}),
											(0, react_jsx_runtime.jsxs)("button", {
												className: GardenSpace_module_css_default.dangerButton,
												type: "button",
												disabled: pending,
												onClick: () => {
													complete(item);
												},
												children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutline16, { size: 14 }), t("concern.complete")]
											})
										]
									})
								]
							}, String(item.id)))
						})]
					})
				]
			});
		}
		//#endregion
		//#region \0dsh-css:E:\test code\deepseekharness_modified\deepseek-harness\packages\client\ui-mind-garden\src\client\spaces\CalendarSpace.module.css.mjs
		const css$8 = ".ec2V7a_atlasSeal{aspect-ratio:1;border:1px solid color-mix(in srgb, var(--dsw-alias-state-warn-primary) 38%, var(--dsw-alias-border-l2));width:46px;color:var(--dsw-alias-state-business-primary);background:color-mix(in srgb, var(--dsw-alias-state-warn-secondary) 18%, transparent);box-shadow:inset 0 0 0 5px color-mix(in srgb, var(--dsw-alias-state-warn-secondary) 18%, transparent);border-radius:42% 48% 45% 52%;place-items:center;display:grid}.ec2V7a_atlas{border:1px solid color-mix(in srgb, var(--dsw-alias-state-warn-primary) 24%, var(--dsw-alias-border-l2));background:color-mix(in srgb, var(--dsw-alias-bg-base) 94%, var(--dsw-alias-state-warn-secondary));max-width:1180px;box-shadow:0 22px 60px color-mix(in srgb, var(--dsw-alias-label-primary) 8%, transparent);border-radius:11px 11px 5px 5px;margin:0 auto;overflow:hidden}.ec2V7a_toolbar{min-height:70px;color:var(--dsw-alias-label-primary-inverted);background:radial-gradient(circle at 16% -60%, color-mix(in srgb, var(--dsw-alias-state-warn-primary) 26%, transparent), transparent 19rem), linear-gradient(128deg, var(--dsw-alias-state-business-primary), var(--dsw-alias-label-primary));justify-content:space-between;align-items:center;gap:18px;padding:13px 18px;display:flex}.ec2V7a_monthControls,.ec2V7a_modeSwitch{align-items:center;gap:7px;display:flex}.ec2V7a_monthControls>button,.ec2V7a_modeSwitch button{border:1px solid color-mix(in srgb, var(--dsw-alias-label-primary-inverted) 18%, transparent);min-height:34px;color:color-mix(in srgb, var(--dsw-alias-label-primary-inverted) 76%, transparent);background:color-mix(in srgb, var(--dsw-alias-label-primary) 18%, transparent);font:inherit;cursor:pointer;border-radius:6px;font-size:11px}.ec2V7a_monthControls>button{place-items:center;min-width:34px;display:grid}.ec2V7a_monthControls label{border-inline:1px solid color-mix(in srgb, var(--dsw-alias-state-warn-secondary) 30%, transparent);gap:1px;min-width:156px;padding:4px 11px;display:grid;position:relative}.ec2V7a_monthControls label span{color:color-mix(in srgb, var(--dsw-alias-state-warn-secondary) 72%, white);letter-spacing:.11em;text-transform:uppercase;font-size:9px}.ec2V7a_monthControls input{width:100%;color:var(--dsw-alias-label-primary-inverted);color-scheme:dark;background:0 0;border:0;outline:0;padding:0;font:520 17px/1.4 Mind Garden Display,Noto Serif SC,Songti SC,serif}.ec2V7a_monthControls .ec2V7a_todayButton{width:auto;color:color-mix(in srgb, var(--dsw-alias-state-warn-secondary) 78%, white);padding-inline:11px;display:inline-flex}.ec2V7a_modeSwitch{border:1px solid color-mix(in srgb, var(--dsw-alias-label-primary-inverted) 14%, transparent);background:color-mix(in srgb, var(--dsw-alias-label-primary) 22%, transparent);border-radius:8px;padding:3px}.ec2V7a_modeSwitch button{background:0 0;border:0;padding:5px 10px}.ec2V7a_monthControls button:hover,.ec2V7a_modeSwitch button:hover{border-color:color-mix(in srgb, var(--dsw-alias-state-warn-secondary) 52%, transparent);color:var(--dsw-alias-label-primary-inverted)}.ec2V7a_monthControls button:focus-visible,.ec2V7a_modeSwitch button:focus-visible,.ec2V7a_filters button:focus-visible,.ec2V7a_day:focus-visible,.ec2V7a_event>button:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px}.ec2V7a_filters{border-block-end:1px solid color-mix(in srgb, var(--dsw-alias-state-success-primary) 16%, var(--dsw-alias-border-l2));scrollbar-width:thin;gap:4px;padding:10px 18px;display:flex;overflow-x:auto}.ec2V7a_filters button{min-height:30px;color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;background:0 0;border:0;border-radius:999px;flex:none;padding:5px 10px;font-size:10px}.ec2V7a_filters button:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}.ec2V7a_filters button[aria-pressed=true]{color:color-mix(in srgb, var(--dsw-alias-state-success-primary) 72%, var(--dsw-alias-label-primary));background:color-mix(in srgb, var(--dsw-alias-state-success-secondary) 18%, transparent)}.ec2V7a_layout{grid-template-columns:minmax(500px,1fr) minmax(300px,.43fr);min-height:570px;display:grid}.ec2V7a_calendar{border-inline-end:1px solid color-mix(in srgb, var(--dsw-alias-state-success-primary) 16%, var(--dsw-alias-border-l2));padding:20px 22px 26px}.ec2V7a_weekdays,.ec2V7a_grid{grid-template-columns:repeat(7,minmax(0,1fr));display:grid}.ec2V7a_weekdays{gap:6px;margin-block-end:7px}.ec2V7a_weekdays span{color:var(--dsw-alias-label-tertiary);letter-spacing:.08em;text-align:center;text-transform:uppercase;padding:5px;font-size:9px;font-weight:650}.ec2V7a_grid{gap:6px}.ec2V7a_day,.ec2V7a_blank{border-radius:7px;min-height:80px}.ec2V7a_day{border:1px solid color-mix(in srgb, var(--dsw-alias-state-warn-primary) 12%, var(--dsw-alias-border-l2));color:var(--dsw-alias-label-primary);background:color-mix(in srgb, var(--dsw-alias-bg-base) 96%, var(--dsw-alias-state-warn-secondary));font:inherit;cursor:pointer;align-content:space-between;justify-items:start;padding:9px;transition:border-color .14s ease-out,background .14s ease-out,transform .18s cubic-bezier(.16,1,.3,1);display:grid;position:relative;overflow:hidden}.ec2V7a_day:before{content:\"\";background:0 0;width:2px;position:absolute;inset:0 auto 0 0}.ec2V7a_day:hover{border-color:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 36%, var(--dsw-alias-border-l2));background:color-mix(in srgb, var(--dsw-alias-state-warn-secondary) 16%, var(--dsw-alias-bg-base));transform:translateY(-1px)}.ec2V7a_day[data-selected=true]{border-color:color-mix(in srgb, var(--dsw-alias-state-business-primary) 58%, var(--dsw-alias-state-warn-primary));color:var(--dsw-alias-label-primary-inverted);background:linear-gradient(145deg, var(--dsw-alias-state-business-primary), var(--dsw-alias-label-primary));box-shadow:0 10px 26px color-mix(in srgb, var(--dsw-alias-label-primary) 13%, transparent)}.ec2V7a_day[data-selected=true]:before{background:var(--dsw-alias-state-warn-secondary)}.ec2V7a_day[data-today=true] .ec2V7a_dayNumber:after{aspect-ratio:1;background:var(--dsw-alias-state-warn-primary);width:5px;box-shadow:0 0 9px color-mix(in srgb, var(--dsw-alias-state-warn-primary) 42%, transparent);content:\"\";vertical-align:middle;border-radius:50%;margin-inline-start:5px;display:inline-block}.ec2V7a_dayNumber{font-family:Mind Garden Display,Noto Serif SC,Songti SC,serif;font-size:17px;font-weight:560}.ec2V7a_day small{color:var(--dsw-alias-label-tertiary);font-size:9px}.ec2V7a_day[data-selected=true] small{color:color-mix(in srgb, var(--dsw-alias-label-primary-inverted) 58%, transparent)}.ec2V7a_signals{flex-wrap:wrap;gap:3px;min-height:4px;display:flex}.ec2V7a_signals i{background:var(--dsw-alias-state-business-primary);border-radius:999px;width:10px;height:3px}.ec2V7a_signals i[data-kind=checkin]{background:var(--dsw-alias-state-success-primary)}.ec2V7a_signals i[data-kind=journal]{background:var(--dsw-alias-state-warn-primary)}.ec2V7a_signals i[data-kind=concern]{background:var(--dsw-alias-state-error-primary)}.ec2V7a_signals i[data-kind=principle]{background:var(--dsw-alias-state-business-primary)}.ec2V7a_signals i[data-kind=experiment]{background:color-mix(in srgb, var(--dsw-alias-state-success-primary) 54%, var(--dsw-alias-state-warn-primary))}.ec2V7a_signals i[data-kind=question]{background:var(--dsw-alias-label-tertiary)}.ec2V7a_day[data-selected=true] .ec2V7a_signals i{filter:saturate(.72)brightness(1.45)}.ec2V7a_detail{min-width:0;color:var(--dsw-alias-label-primary-inverted);background:radial-gradient(circle at 100% 0%, color-mix(in srgb, var(--dsw-alias-state-warn-primary) 16%, transparent), transparent 18rem), linear-gradient(155deg, color-mix(in srgb, var(--dsw-alias-state-success-primary) 42%, var(--dsw-alias-label-primary)), color-mix(in srgb, var(--dsw-alias-label-primary) 97%, var(--dsw-alias-state-success-primary)));padding:24px 22px;position:relative}.ec2V7a_detailHeader,.ec2V7a_trend header{justify-content:space-between;align-items:end;gap:16px;padding-block-end:14px;display:flex}.ec2V7a_detailHeader small,.ec2V7a_trend header small{color:color-mix(in srgb, var(--dsw-alias-state-warn-secondary) 72%, white);letter-spacing:.11em;text-transform:uppercase;font-size:9px}.ec2V7a_detailHeader h2,.ec2V7a_trend h2{margin:4px 0 0;font-family:Mind Garden Display,Noto Serif SC,Songti SC,serif;font-size:22px;font-weight:520}.ec2V7a_detailHeader strong{color:color-mix(in srgb, var(--dsw-alias-label-primary-inverted) 54%, transparent);font-size:10px;font-weight:500}.ec2V7a_draftNotice{border-inline-start:2px solid var(--dsw-alias-state-warn-secondary);color:color-mix(in srgb, var(--dsw-alias-state-warn-secondary) 76%, white);background:color-mix(in srgb, var(--dsw-alias-label-primary) 22%, transparent);margin:12px 0 0;padding:9px 10px;font-size:10px;line-height:1.5}.ec2V7a_events{margin:0;padding:6px 0 0;list-style:none;display:grid}.ec2V7a_event{grid-template-columns:34px minmax(0,1fr) 30px;align-items:start;gap:10px;padding:15px 0;display:grid}.ec2V7a_eventIcon{aspect-ratio:1;border:1px solid color-mix(in srgb, var(--dsw-alias-state-warn-secondary) 30%, transparent);width:32px;color:var(--dsw-alias-state-warn-secondary);background:color-mix(in srgb, var(--dsw-alias-label-primary) 22%, transparent);border-radius:50%;place-items:center;display:grid}.ec2V7a_event small{color:color-mix(in srgb, var(--dsw-alias-state-warn-secondary) 66%, white);letter-spacing:.06em;font-size:9px}.ec2V7a_event p{color:color-mix(in srgb, var(--dsw-alias-label-primary-inverted) 78%, transparent);white-space:pre-wrap;margin:5px 0 0;font-size:12px;line-height:1.58}.ec2V7a_event>button{aspect-ratio:1;width:30px;color:color-mix(in srgb, var(--dsw-alias-label-primary-inverted) 46%, transparent);cursor:pointer;background:0 0;border:1px solid #0000;border-radius:6px;place-items:center;display:grid}.ec2V7a_event>button:hover{border-color:color-mix(in srgb, var(--dsw-alias-state-warn-secondary) 34%, transparent);color:var(--dsw-alias-state-warn-secondary);background:color-mix(in srgb, var(--dsw-alias-label-primary) 24%, transparent)}.ec2V7a_emptyDay{min-height:260px;color:color-mix(in srgb, var(--dsw-alias-label-primary-inverted) 48%, transparent);text-align:center;place-items:center;margin:0;font-size:12px;line-height:1.6;display:grid}.ec2V7a_trend{min-height:100%}.ec2V7a_trend header{display:block}.ec2V7a_trend svg{width:100%;height:230px;margin-block-start:40px;overflow:visible}.ec2V7a_trend line{stroke:color-mix(in srgb, var(--dsw-alias-label-primary-inverted) 18%, transparent);stroke-dasharray:1.5 2.5;stroke-width:.35px}.ec2V7a_trend polyline{fill:none;stroke:var(--dsw-alias-state-warn-secondary);stroke-linecap:round;stroke-linejoin:round;stroke-width:1.25px;filter:drop-shadow(0 0 5px color-mix(in srgb, var(--dsw-alias-state-warn-secondary) 26%, transparent))}.ec2V7a_trend circle{fill:color-mix(in srgb, var(--dsw-alias-state-success-primary) 60%, var(--dsw-alias-label-primary));stroke:var(--dsw-alias-state-warn-secondary);stroke-width:.8px}.ec2V7a_trendScale{color:color-mix(in srgb, var(--dsw-alias-label-primary-inverted) 36%, transparent);justify-content:space-between;font-size:9px;display:flex}@container ec2V7a_mind-garden-workspace (width<=1040px){.ec2V7a_layout{grid-template-columns:1fr}.ec2V7a_calendar{border-inline-end:0;border-block-end:1px solid color-mix(in srgb, var(--dsw-alias-state-success-primary) 16%, var(--dsw-alias-border-l2))}.ec2V7a_detail{min-height:420px}}@container ec2V7a_mind-garden-workspace (width<=720px){.ec2V7a_toolbar{flex-direction:column;align-items:stretch}.ec2V7a_monthControls{flex-wrap:wrap}.ec2V7a_modeSwitch{align-self:flex-start}.ec2V7a_calendar{padding:14px 10px 18px}.ec2V7a_grid,.ec2V7a_weekdays{gap:3px}.ec2V7a_day,.ec2V7a_blank{min-height:62px}.ec2V7a_day{padding:6px}.ec2V7a_day small{display:none}.ec2V7a_signals i{width:5px}}@container ec2V7a_mind-garden-workspace (width<=480px){.ec2V7a_atlasSeal{display:none}.ec2V7a_monthControls label{min-width:136px}.ec2V7a_filters{padding-inline:10px}.ec2V7a_day,.ec2V7a_blank{border-radius:5px;min-height:50px}.ec2V7a_dayNumber{font-size:14px}.ec2V7a_signals{gap:2px}.ec2V7a_detail{padding:20px 16px}}@media (prefers-reduced-motion:reduce){.ec2V7a_day{transition:none}.ec2V7a_day:hover{transform:none}}.ec2V7a_atlas{width:min(1240px,100%);color:var(--mg-ink,#342d27);box-shadow:none;font-family:var(--mg-font-ui,\"Noto Sans SC\", sans-serif);background:0 0;border:0;border-radius:0;margin:0 auto}.ec2V7a_atlasIntro{border-block-end:1px solid #533e2d24;grid-template-columns:minmax(0,1fr) auto;align-items:end;gap:24px;margin-block-end:24px;padding:4px 0 22px;display:grid}.ec2V7a_atlasIntro h1{font-family:var(--mg-font-reflection,\"Mind Garden Display\", \"Noto Serif SC\", serif);letter-spacing:-.035em;margin:0;font-size:clamp(34px,4vw,52px);font-weight:560;line-height:1.08}.ec2V7a_atlasIntro p{max-width:52ch;color:var(--mg-muted,#76695e);margin:11px 0 0;font-size:11px;line-height:1.65}.ec2V7a_atlasSeal{aspect-ratio:1;width:46px;color:var(--mg-brass,#a77d43);background:#fffbf4ad;border:1px solid #a77d434d;border-radius:50%;place-items:center;display:grid}.ec2V7a_toolbar{min-height:66px;color:var(--mg-ink,#342d27);background:#fffbf48a;border-block:1px solid #533e2d24;padding:12px 16px}.ec2V7a_monthControls button,.ec2V7a_modeSwitch button,.ec2V7a_todayButton{color:var(--mg-indigo,#405f87);background:0 0;border-color:#533e2d29;border-radius:8px}.ec2V7a_monthControls input{color:var(--mg-ink,#342d27)}.ec2V7a_modeSwitch button[aria-pressed=true]{color:#fffaf2;background:var(--mg-indigo,#405f87)}.ec2V7a_filters{background:0 0;border:0;gap:6px;padding:12px 0 16px}.ec2V7a_filters button{min-height:31px;color:var(--mg-muted,#76695e);background:0 0;border:1px solid #0000;border-radius:999px;padding:4px 9px}.ec2V7a_filters button[aria-pressed=true]{color:var(--mg-indigo,#405f87);background:#405f8712;border-color:#405f8738}.ec2V7a_layout{border-block:1px solid #533e2d24;grid-template-columns:minmax(0,1.35fr) minmax(320px,.65fr);gap:0}.ec2V7a_calendar{background:linear-gradient(130deg, #fffdf7e0, #f5e8d6b8), var(--mg-xuan-texture);background-size:auto,520px;border:0;border-radius:0;padding:clamp(18px,3vw,34px)}.ec2V7a_weekdays{color:var(--mg-muted,#76695e)}.ec2V7a_grid{background:#533e2d1a;gap:1px}.ec2V7a_day{min-height:86px;color:var(--mg-ink,#342d27);background:#fffcf6bd;border:0;border-radius:0}.ec2V7a_day:hover{background:#fffaf2}.ec2V7a_day[data-selected=true]{color:#fffaf2;background:var(--mg-indigo,#405f87);box-shadow:inset 0 0 0 2px #fffaf229}.ec2V7a_day[data-today=true]:not([data-selected=true]){box-shadow:inset 0 0 0 1px var(--mg-brass,#a77d43)}.ec2V7a_dayNumber{font-family:var(--mg-font-reflection);font-size:18px}.ec2V7a_signals i{box-shadow:none}.ec2V7a_detail{color:#fffaf2;background:#384f6e;border:0;border-radius:0;min-height:100%;padding:clamp(22px,3vw,36px);box-shadow:8px 16px 38px #304c7029}.ec2V7a_detailHeader{border-block-end-color:#fffaf22b}.ec2V7a_detailHeader h2{color:#fffaf2;font-family:var(--mg-font-reflection)}.ec2V7a_detailHeader small,.ec2V7a_detailHeader strong{color:#fffaf2a6}.ec2V7a_events{gap:0}.ec2V7a_event{background:0 0;border-block-start:1px solid #fffaf226;border-radius:0;padding:15px 0}.ec2V7a_events>.ec2V7a_event:first-child{border-block-start:0}.ec2V7a_event small{color:#d9b378}.ec2V7a_event p{color:#fffaf2d4}.ec2V7a_event button{color:#fffaf2;background:0 0;border-color:#fffaf230}.ec2V7a_emptyDay{color:#fffaf2a8}.ec2V7a_trend header h2{color:#fffaf2}.ec2V7a_trend svg line{stroke:#fffaf238}.ec2V7a_trend svg polyline{stroke:#d9b378}.ec2V7a_trend svg circle{fill:#fffaf2}.ec2V7a_trendScale{color:#fffaf27a}@media (width<=900px){.ec2V7a_layout{grid-template-columns:1fr}.ec2V7a_detail{min-height:360px}}@media (width<=620px){.ec2V7a_atlasIntro{align-items:start}.ec2V7a_atlasSeal{width:40px}.ec2V7a_toolbar{align-items:stretch}.ec2V7a_day{min-height:66px}.ec2V7a_calendar{padding:10px}}.ec2V7a_atlasIntro{border-block-end:0;align-items:center;gap:18px;margin-block-end:14px;padding:0 2px 8px}.ec2V7a_atlasIntro h1{letter-spacing:-.03em;max-width:18ch;font-size:clamp(29px,3vw,38px);line-height:1.12}.ec2V7a_atlasIntro p{-webkit-line-clamp:2;-webkit-box-orient:vertical;max-width:68ch;margin-block-start:7px;font-size:11px;display:-webkit-box;overflow:hidden}.ec2V7a_atlasSeal{width:42px}.ec2V7a_atlasSeal>svg{width:20px;height:20px;display:block}.ec2V7a_toolbar{background:#fffbf4b8;border:0;border-radius:14px;min-height:58px;padding:9px 12px;box-shadow:0 14px 36px #44301f14}.ec2V7a_monthControls,.ec2V7a_modeSwitch{min-width:0}.ec2V7a_monthControls>button,.ec2V7a_modeSwitch button{min-height:40px}.ec2V7a_monthControls>button>svg{width:16px;height:16px;display:block}.ec2V7a_monthControls label{min-width:150px}.ec2V7a_modeSwitch{flex:none}.ec2V7a_filters{padding-block:9px 12px}.ec2V7a_filters button{min-height:36px}.ec2V7a_layout{border:0;border-radius:18px;min-height:520px;overflow:hidden;box-shadow:0 24px 64px #44301f1c}.ec2V7a_day{min-height:78px;padding:8px}.ec2V7a_event{grid-template-columns:28px minmax(0,1fr) 40px}.ec2V7a_eventIcon{place-items:center;width:28px;height:28px;display:grid}.ec2V7a_eventIcon>svg,.ec2V7a_event>button>svg{width:15px;height:15px;display:block}.ec2V7a_event>button{place-items:center;width:40px;min-height:40px;display:grid}@container ec2V7a_mind-garden-workspace (width<=860px){.ec2V7a_layout{grid-template-columns:1fr}.ec2V7a_detail{min-height:320px}}@container ec2V7a_mind-garden-workspace (width<=620px){.ec2V7a_atlasIntro{grid-template-columns:minmax(0,1fr) 38px;gap:10px;margin-block-end:10px}.ec2V7a_atlasIntro h1{font-size:clamp(27px,9vw,33px)}.ec2V7a_atlasIntro p{-webkit-line-clamp:2;font-size:10px}.ec2V7a_atlasSeal{width:38px}.ec2V7a_toolbar{grid-template-columns:1fr;gap:9px;display:grid}.ec2V7a_monthControls{grid-template-columns:40px minmax(0,1fr) 40px;gap:6px;display:grid}.ec2V7a_monthControls label{min-width:0;padding-inline:9px}.ec2V7a_monthControls .ec2V7a_todayButton{grid-column:1/-1;width:100%}.ec2V7a_modeSwitch{grid-template-columns:1fr 1fr;display:grid}.ec2V7a_filters{gap:3px;margin-inline:-2px;overflow-x:auto}.ec2V7a_filters button{min-height:38px;padding-inline:10px}.ec2V7a_calendar{padding:7px;overflow:hidden}.ec2V7a_weekdays{gap:1px}.ec2V7a_weekdays span{padding-inline:1px;font-size:8px}.ec2V7a_day,.ec2V7a_blank{min-height:54px}.ec2V7a_day{padding:6px 5px}.ec2V7a_dayNumber{font-size:15px}.ec2V7a_day small{display:none}.ec2V7a_signals{gap:2px}.ec2V7a_detail{min-height:280px;padding:22px 16px}}@media (width<=620px){.ec2V7a_atlasIntro{grid-template-columns:minmax(0,1fr) 38px;gap:10px;margin-block-end:10px}.ec2V7a_atlasIntro h1{font-size:clamp(27px,9vw,33px)}.ec2V7a_atlasIntro p{-webkit-line-clamp:2;font-size:10px}.ec2V7a_atlasSeal{width:38px;display:grid}.ec2V7a_toolbar{grid-template-columns:minmax(0,1fr);gap:9px;display:grid}.ec2V7a_monthControls{grid-template-columns:40px minmax(0,1fr) 40px;gap:6px;display:grid}.ec2V7a_monthControls label{min-width:0;padding-inline:9px}.ec2V7a_monthControls .ec2V7a_todayButton{grid-column:1/-1;width:100%}.ec2V7a_modeSwitch{grid-template-columns:1fr 1fr;width:100%;display:grid}.ec2V7a_filters{gap:3px;margin-inline:-2px;padding-inline:0;overflow-x:auto}.ec2V7a_filters button{min-height:38px;padding-inline:10px}.ec2V7a_calendar{padding:7px;overflow:hidden}.ec2V7a_weekdays{gap:1px}.ec2V7a_weekdays span{padding-inline:1px;font-size:8px}.ec2V7a_day,.ec2V7a_blank{min-height:54px}.ec2V7a_day{padding:6px 5px}.ec2V7a_dayNumber{font-size:15px}.ec2V7a_day small{display:none}.ec2V7a_detail{min-height:280px;padding:22px 16px}}";
		const tagId$8 = "@deepseek-ai/dsh-mind-garden/CalendarSpace.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$8) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-mind-garden";
			tag.dataset.pluginCss = tagId$8;
			tag.textContent = css$8;
			document.head.appendChild(tag);
		}
		var CalendarSpace_module_css_default = {
			"atlas": "ec2V7a_atlas",
			"atlasIntro": "ec2V7a_atlasIntro",
			"atlasSeal": "ec2V7a_atlasSeal",
			"blank": "ec2V7a_blank",
			"calendar": "ec2V7a_calendar",
			"day": "ec2V7a_day",
			"dayNumber": "ec2V7a_dayNumber",
			"detail": "ec2V7a_detail",
			"detailHeader": "ec2V7a_detailHeader",
			"draftNotice": "ec2V7a_draftNotice",
			"emptyDay": "ec2V7a_emptyDay",
			"event": "ec2V7a_event",
			"eventIcon": "ec2V7a_eventIcon",
			"events": "ec2V7a_events",
			"filters": "ec2V7a_filters",
			"grid": "ec2V7a_grid",
			"layout": "ec2V7a_layout",
			"mind-garden-workspace": "ec2V7a_mind-garden-workspace",
			"modeSwitch": "ec2V7a_modeSwitch",
			"monthControls": "ec2V7a_monthControls",
			"signals": "ec2V7a_signals",
			"todayButton": "ec2V7a_todayButton",
			"toolbar": "ec2V7a_toolbar",
			"trend": "ec2V7a_trend",
			"trendScale": "ec2V7a_trendScale",
			"weekdays": "ec2V7a_weekdays"
		};
		//#endregion
		//#region lib/types/client/spaces/CalendarSpace.js
		/** Calendar atlas, filtering, conversation handoff, and trend projection. */
		const FILTERS = [
			"all",
			"checkin",
			"journal",
			"concern",
			"principle",
			"experiment",
			"question"
		];
		/** Build a Sunday-first grid with complete weeks. */
		function gardenCalendarCells(month) {
			const match = /^(\d{4})-(\d{2})$/.exec(month);
			if (match === null) return [];
			const year = Number(match[1]);
			const monthNumber = Number(match[2]);
			if (monthNumber < 1 || monthNumber > 12) return [];
			const offset = new Date(Date.UTC(year, monthNumber - 1, 1)).getUTCDay();
			const days = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
			const count = Math.ceil((offset + days) / 7) * 7;
			return Array.from({ length: count }, (_, index) => {
				const day = index - offset + 1;
				if (day < 1 || day > days) return {
					date: null,
					day: null
				};
				return {
					date: `${month}-${String(day).padStart(2, "0")}`,
					day
				};
			});
		}
		function adjacentMonth(month, amount) {
			const [year, monthNumber] = month.split("-").map(Number);
			const date = new Date(Date.UTC(year ?? 0, (monthNumber ?? 1) - 1 + amount, 1));
			return `${String(date.getUTCFullYear()).padStart(4, "0")}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
		}
		function eventCopy(event, t) {
			switch (event.type) {
				case "checkin": return {
					kind: t("calendar.event.checkin"),
					detail: event.emotionWords.join(" · ") || t("calendar.event.noWords")
				};
				case "journal": return {
					kind: t("calendar.event.journal"),
					detail: event.title || event.body
				};
				case "concern-reminder": return {
					kind: t("calendar.event.concern"),
					detail: event.concern.content
				};
				case "principle": return {
					kind: t("calendar.event.principle"),
					detail: event.version.content.expression
				};
				case "experiment-review": return {
					kind: t("calendar.event.experimentReview"),
					detail: event.experiment.title
				};
				case "experiment-observation": return {
					kind: t("calendar.event.experimentObservation"),
					detail: event.observation.observation
				};
				case "open-question": return {
					kind: t("calendar.event.question"),
					detail: event.question
				};
			}
		}
		function eventMatches(event, filter) {
			if (filter === "all") return true;
			if (filter === "concern") return event.type === "concern-reminder";
			if (filter === "experiment") return event.type === "experiment-review" || event.type === "experiment-observation";
			if (filter === "question") return event.type === "open-question";
			return event.type === filter;
		}
		function eventIcon(event) {
			switch (event.type) {
				case "checkin": return (0, react_jsx_runtime.jsx)(CheckinIcon, { size: 17 });
				case "journal": return (0, react_jsx_runtime.jsx)(JournalIcon, { size: 17 });
				case "concern-reminder": return (0, react_jsx_runtime.jsx)(ConcernsIcon, { size: 17 });
				case "principle": return (0, react_jsx_runtime.jsx)(PhilosophyIcon, { size: 17 });
				case "experiment-review":
				case "experiment-observation": return (0, react_jsx_runtime.jsx)(GrowthIcon, { size: 17 });
				case "open-question": return (0, react_jsx_runtime.jsx)(StarMapIcon, { size: 17 });
			}
		}
		function trendCoordinates(trend) {
			const count = Math.max(1, trend.points.length - 1);
			return trend.points.map((point, index) => {
				const x = 4 + index / count * 92;
				const y = 44 - (point.mood + 2) / 4 * 36;
				return {
					id: String(point.id),
					x: x.toFixed(2),
					y: y.toFixed(2)
				};
			});
		}
		/** Render a tactile month atlas, complete selected-day ledger, filters, and mood trail. */
		function CalendarSpace({ today, onCalendarMonth, onCalendarDay, onReflectionTrend, onDraftConversation = () => void 0, t }) {
			const [month, setMonth] = (0, react.useState)(today.slice(0, 7));
			const [selectedDate, setSelectedDate] = (0, react.useState)(today);
			const [monthValue, setMonthValue] = (0, react.useState)(null);
			const [dayValue, setDayValue] = (0, react.useState)(null);
			const [trend, setTrend] = (0, react.useState)(null);
			const [filter, setFilter] = (0, react.useState)("all");
			const [sideMode, setSideMode] = (0, react.useState)("day");
			const [notice, setNotice] = (0, react.useState)(false);
			const [error, setError] = (0, react.useState)(false);
			const requestRef = (0, react.useRef)(0);
			const cells = (0, react.useMemo)(() => gardenCalendarCells(month), [month]);
			const activity = (0, react.useMemo)(() => new Map(monthValue?.days.map((day) => [day.date, day]) ?? []), [monthValue]);
			const filteredEvents = (0, react.useMemo)(() => dayValue?.events.filter((event) => eventMatches(event, filter)) ?? [], [dayValue, filter]);
			const plottedTrendCoordinates = (0, react.useMemo)(() => trend === null ? [] : trendCoordinates(trend), [trend]);
			const loadMonth = (0, react.useCallback)(async (nextMonth) => {
				const request = ++requestRef.current;
				const result = await settleMindGardenAction(() => onCalendarMonth(nextMonth));
				if (request !== requestRef.current) return;
				if (result.ok) {
					setMonthValue(result.value);
					setError(false);
				} else setError(true);
			}, [onCalendarMonth]);
			const loadDay = (0, react.useCallback)(async (date) => {
				const result = await settleMindGardenAction(() => onCalendarDay(date));
				if (result.ok) {
					setDayValue(result.value);
					setError(false);
				} else setError(true);
			}, [onCalendarDay]);
			(0, react.useEffect)(() => {
				loadMonth(month);
				return () => {
					requestRef.current++;
				};
			}, [loadMonth, month]);
			(0, react.useEffect)(() => {
				loadDay(selectedDate);
			}, [loadDay, selectedDate]);
			(0, react.useEffect)(() => {
				let current = true;
				settleMindGardenAction(() => onReflectionTrend(30, today)).then((result) => {
					if (!current) return;
					if (result.ok) setTrend(result.value);
					else setError(true);
				});
				return () => {
					current = false;
				};
			}, [onReflectionTrend, today]);
			function selectDate(date) {
				setSelectedDate(date);
				setSideMode("day");
				setNotice(false);
			}
			function selectMonth(nextMonth, date = `${nextMonth}-01`) {
				setMonth(nextMonth);
				setSelectedDate(date);
				setSideMode("day");
				setNotice(false);
			}
			function draftConversation(event) {
				const copy = eventCopy(event, t);
				onDraftConversation(t("calendar.conversation.draft").replace("{date}", selectedDate).replace("{kind}", copy.kind).replace("{detail}", copy.detail));
				setNotice(true);
			}
			return (0, react_jsx_runtime.jsx)("main", {
				className: GardenSpace_module_css_default.space,
				"data-mind-garden-space": "calendar",
				children: (0, react_jsx_runtime.jsxs)("section", {
					className: CalendarSpace_module_css_default.atlas,
					children: [
						(0, react_jsx_runtime.jsxs)("header", {
							className: CalendarSpace_module_css_default.atlasIntro,
							children: [(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("h1", { children: t("calendar.title") }), (0, react_jsx_runtime.jsx)("p", { children: t("calendar.subtitle") })] }), (0, react_jsx_runtime.jsx)("span", {
								className: CalendarSpace_module_css_default.atlasSeal,
								"aria-hidden": "true",
								children: (0, react_jsx_runtime.jsx)(CalendarIcon, { size: 22 })
							})]
						}),
						(0, react_jsx_runtime.jsxs)("header", {
							className: CalendarSpace_module_css_default.toolbar,
							children: [(0, react_jsx_runtime.jsxs)("div", {
								className: CalendarSpace_module_css_default.monthControls,
								children: [
									(0, react_jsx_runtime.jsx)("button", {
										type: "button",
										"aria-label": t("calendar.previous"),
										onClick: () => {
											selectMonth(adjacentMonth(month, -1));
										},
										children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronLeftOutline14, {})
									}),
									(0, react_jsx_runtime.jsxs)("label", { children: [(0, react_jsx_runtime.jsx)("span", { children: t("calendar.month") }), (0, react_jsx_runtime.jsx)("input", {
										type: "month",
										value: month,
										onChange: (event) => {
											selectMonth(event.target.value);
										}
									})] }),
									(0, react_jsx_runtime.jsx)("button", {
										type: "button",
										"aria-label": t("calendar.next"),
										onClick: () => {
											selectMonth(adjacentMonth(month, 1));
										},
										children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutline14, {})
									}),
									(0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: CalendarSpace_module_css_default.todayButton,
										onClick: () => {
											selectMonth(today.slice(0, 7), today);
										},
										children: t("calendar.today")
									})
								]
							}), (0, react_jsx_runtime.jsxs)("div", {
								className: CalendarSpace_module_css_default.modeSwitch,
								role: "group",
								"aria-label": t("calendar.dayDetail"),
								children: [(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									"aria-pressed": sideMode === "day",
									onClick: () => {
										setSideMode("day");
									},
									children: t("calendar.showDay")
								}), (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									"aria-pressed": sideMode === "trend",
									onClick: () => {
										setSideMode("trend");
									},
									children: t("calendar.showTrend")
								})]
							})]
						}),
						(0, react_jsx_runtime.jsx)("div", {
							className: CalendarSpace_module_css_default.filters,
							role: "group",
							"aria-label": t("calendar.filter"),
							children: FILTERS.map((item) => (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-pressed": filter === item,
								onClick: () => {
									setFilter(item);
									setSideMode("day");
								},
								children: t(`calendar.filter.${item}`)
							}, item))
						}),
						error && (0, react_jsx_runtime.jsx)("p", {
							className: GardenSpace_module_css_default.error,
							role: "alert",
							children: t("calendar.error")
						}),
						(0, react_jsx_runtime.jsxs)("div", {
							className: CalendarSpace_module_css_default.layout,
							children: [(0, react_jsx_runtime.jsxs)("section", {
								className: CalendarSpace_module_css_default.calendar,
								"aria-label": t("calendar.grid"),
								children: [(0, react_jsx_runtime.jsx)("div", {
									className: CalendarSpace_module_css_default.weekdays,
									"aria-hidden": "true",
									children: [
										"sun",
										"mon",
										"tue",
										"wed",
										"thu",
										"fri",
										"sat"
									].map((day) => (0, react_jsx_runtime.jsx)("span", { children: t(`calendar.weekday.${day}`) }, day))
								}), (0, react_jsx_runtime.jsx)("div", {
									className: CalendarSpace_module_css_default.grid,
									children: cells.map((cell, index) => {
										if (cell.date === null || cell.day === null) return (0, react_jsx_runtime.jsx)("span", { className: CalendarSpace_module_css_default.blank }, `blank-${index}`);
										const date = cell.date;
										const summary = activity.get(date);
										return (0, react_jsx_runtime.jsxs)("button", {
											type: "button",
											className: CalendarSpace_module_css_default.day,
											"data-selected": date === selectedDate,
											"data-today": date === today,
											"aria-label": t("calendar.dayLabel").replace("{date}", date).replace("{count}", String(summary?.eventCount ?? 0)),
											onClick: () => {
												selectDate(date);
											},
											children: [(0, react_jsx_runtime.jsx)("span", {
												className: CalendarSpace_module_css_default.dayNumber,
												children: cell.day
											}), summary === void 0 ? (0, react_jsx_runtime.jsx)("small", { children: "—" }) : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("small", { children: t("calendar.eventCount").replace("{count}", String(summary.eventCount)) }), (0, react_jsx_runtime.jsxs)("span", {
												className: CalendarSpace_module_css_default.signals,
												"aria-hidden": "true",
												children: [
													summary.checkinCount > 0 && (0, react_jsx_runtime.jsx)("i", { "data-kind": "checkin" }),
													summary.journalCount > 0 && (0, react_jsx_runtime.jsx)("i", { "data-kind": "journal" }),
													summary.concernCount > 0 && (0, react_jsx_runtime.jsx)("i", { "data-kind": "concern" }),
													summary.principleCount > 0 && (0, react_jsx_runtime.jsx)("i", { "data-kind": "principle" }),
													summary.experimentCount > 0 && (0, react_jsx_runtime.jsx)("i", { "data-kind": "experiment" }),
													summary.openQuestionCount > 0 && (0, react_jsx_runtime.jsx)("i", { "data-kind": "question" })
												]
											})] })]
										}, date);
									})
								})]
							}), (0, react_jsx_runtime.jsx)("aside", {
								className: CalendarSpace_module_css_default.detail,
								"aria-label": sideMode === "day" ? t("calendar.dayDetail") : t("calendar.trend"),
								children: sideMode === "day" ? (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
									(0, react_jsx_runtime.jsxs)("header", {
										className: CalendarSpace_module_css_default.detailHeader,
										children: [(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("small", { children: month }), (0, react_jsx_runtime.jsx)("h2", { children: selectedDate })] }), (0, react_jsx_runtime.jsx)("strong", { children: t("calendar.eventCount").replace("{count}", String(filteredEvents.length)) })]
									}),
									notice && (0, react_jsx_runtime.jsx)("p", {
										className: CalendarSpace_module_css_default.draftNotice,
										role: "status",
										children: t("calendar.notice.drafted")
									}),
									dayValue === null ? (0, react_jsx_runtime.jsx)("p", {
										className: GardenSpace_module_css_default.empty,
										children: t("calendar.loading")
									}) : filteredEvents.length === 0 ? (0, react_jsx_runtime.jsx)("p", {
										className: CalendarSpace_module_css_default.emptyDay,
										children: t("calendar.emptyDay")
									}) : (0, react_jsx_runtime.jsx)("ul", {
										className: CalendarSpace_module_css_default.events,
										children: filteredEvents.map((event, index) => {
											const copy = eventCopy(event, t);
											return (0, react_jsx_runtime.jsxs)("li", {
												className: CalendarSpace_module_css_default.event,
												"data-kind": event.type,
												children: [
													(0, react_jsx_runtime.jsx)("span", {
														className: CalendarSpace_module_css_default.eventIcon,
														children: eventIcon(event)
													}),
													(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("small", { children: copy.kind }), (0, react_jsx_runtime.jsx)("p", { children: copy.detail })] }),
													(0, react_jsx_runtime.jsx)("button", {
														type: "button",
														"aria-label": t("calendar.conversation"),
														title: t("calendar.conversation"),
														onClick: () => {
															draftConversation(event);
														},
														children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSendOutline14, {})
													})
												]
											}, `${event.type}-${index}`);
										})
									})
								] }) : (0, react_jsx_runtime.jsxs)("section", {
									className: CalendarSpace_module_css_default.trend,
									"aria-label": t("calendar.trend"),
									children: [(0, react_jsx_runtime.jsxs)("header", { children: [(0, react_jsx_runtime.jsx)("small", { children: t("calendar.showTrend") }), (0, react_jsx_runtime.jsx)("h2", { children: t("calendar.trend") })] }), trend?.canPlot === true ? (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsxs)("svg", {
										viewBox: "0 0 100 48",
										role: "img",
										"aria-label": t("calendar.trendChart"),
										children: [
											(0, react_jsx_runtime.jsx)("line", {
												x1: "4",
												x2: "96",
												y1: "26",
												y2: "26"
											}),
											(0, react_jsx_runtime.jsx)("polyline", { points: plottedTrendCoordinates.map((point) => `${point.x},${point.y}`).join(" ") }),
											plottedTrendCoordinates.map((point) => (0, react_jsx_runtime.jsx)("circle", {
												cx: point.x,
												cy: point.y,
												r: "1.8"
											}, point.id))
										]
									}), (0, react_jsx_runtime.jsxs)("div", {
										className: CalendarSpace_module_css_default.trendScale,
										"aria-hidden": "true",
										children: [
											(0, react_jsx_runtime.jsx)("span", { children: "−2" }),
											(0, react_jsx_runtime.jsx)("span", { children: "0" }),
											(0, react_jsx_runtime.jsx)("span", { children: "+2" })
										]
									})] }) : (0, react_jsx_runtime.jsx)("p", {
										className: CalendarSpace_module_css_default.emptyDay,
										children: t("calendar.trendEmpty")
									})]
								})
							})]
						})
					]
				})
			});
		}
		//#endregion
		//#region \0dsh-css:E:\test code\deepseekharness_modified\deepseek-harness\packages\client\ui-mind-garden\src\client\spaces\GrowthSpace.module.css.mjs
		const css$7 = ".Gv2DuW_growth{color:var(--mg-ink,#342d27);font-family:var(--mg-font-ui,\"Noto Sans SC\", sans-serif)}.Gv2DuW_workshop{background:var(--mg-growth-scene) center / cover no-repeat;isolation:isolate;grid-template-columns:minmax(310px,.72fr) minmax(430px,1.28fr);gap:48px;min-height:clamp(620px,61vw,740px);margin:calc(-1*clamp(28px,4vw,58px)) calc(-1*clamp(28px,4vw,58px)) 70px;padding:clamp(50px,6vw,84px);display:grid;position:relative;overflow:hidden;box-shadow:0 28px 72px #47322024}.Gv2DuW_workshop:before{z-index:-1;content:\"\";background:linear-gradient(90deg,#fffbf4f7 0 26%,#fffbf499 43%,#0000 67%),linear-gradient(#0000 69%,#3a2b1f1a);position:absolute;inset:0}.Gv2DuW_hero{z-index:1;grid-column:1;align-content:center;gap:24px;display:grid}.Gv2DuW_heroCopy{justify-items:start;display:grid}.Gv2DuW_heroCopy>svg{color:var(--mg-plum,#8d5a5e);margin-block-end:23px}.Gv2DuW_heroCopy h1{max-width:12ch;font-family:var(--mg-font-reflection,\"Mind Garden Display\", \"Noto Serif SC\", serif);letter-spacing:-.035em;text-wrap:balance;margin:0;font-size:clamp(39px,4vw,52px);font-weight:560;line-height:1.08}.Gv2DuW_heroCopy p{max-width:34ch;color:var(--mg-muted,#76695e);margin:19px 0;font-size:13px;line-height:1.8}.Gv2DuW_privateLine{color:var(--mg-muted,#76695e);align-items:center;gap:6px;font-size:10px;display:inline-flex}.Gv2DuW_fieldInstrument{margin:0}.Gv2DuW_fieldInstrument figcaption{background:#fffbf4c7;width:fit-content;display:flex;box-shadow:6px 12px 24px #45301f1c}.Gv2DuW_fieldInstrument figcaption span{min-width:112px;color:var(--mg-muted,#76695e);border-inline-start:1px solid #533e2d21;gap:2px;padding:12px 15px;font-size:10px;display:grid}.Gv2DuW_fieldInstrument figcaption span:first-child{border-inline-start:0}.Gv2DuW_fieldInstrument figcaption strong{color:var(--mg-ink,#342d27);font-family:var(--mg-font-reflection);font-size:22px;font-weight:560}.Gv2DuW_composerDeck{z-index:1;color:var(--mg-ink,#342d27);background:linear-gradient(130deg, #fffdf7f5, #f6ebdae8), var(--mg-xuan-texture);background-size:auto,440px;border:1px solid #513c2b26;border-radius:14px;grid-column:2;align-self:end;gap:16px;padding:22px 24px 24px;display:grid;box-shadow:9px 18px 40px #44301f29}.Gv2DuW_composerDeck>header{color:var(--mg-indigo,#405f87);align-items:center;gap:9px;display:flex}.Gv2DuW_composerDeck>header h2{color:var(--mg-ink,#342d27);letter-spacing:-.02em;margin:0;font-size:17px;font-weight:700}.Gv2DuW_composer{grid-template-columns:1fr .72fr;gap:12px;display:grid}.Gv2DuW_composer label{color:var(--mg-muted,#76695e);gap:6px;font-size:10px;display:grid}.Gv2DuW_composer .Gv2DuW_wide{grid-column:1/-1}.Gv2DuW_composer input,.Gv2DuW_composer textarea{background:#fffcf7b3}.Gv2DuW_composerFooter{grid-column:1/-1;justify-content:space-between;align-items:center;gap:16px;padding-block-start:4px;display:flex}.Gv2DuW_composerFooter>span{max-width:38ch;color:var(--mg-muted,#76695e);font-size:9px;line-height:1.5}.Gv2DuW_fieldJournal{width:min(1120px,100%);margin:0 auto}.Gv2DuW_fieldJournal>header{border-block-end:1px solid #533e2d26;justify-content:space-between;align-items:end;gap:28px;margin-block-end:28px;padding-block-end:16px;display:flex}.Gv2DuW_fieldJournal>header>div>span{display:none}.Gv2DuW_fieldJournal>header h2{font-family:var(--mg-font-reflection,\"Mind Garden Display\", \"Noto Serif SC\", serif);letter-spacing:-.03em;margin:0;font-size:clamp(28px,3.2vw,40px);font-weight:560}.Gv2DuW_fieldJournal>header p{max-width:42ch;color:var(--mg-muted,#76695e);text-align:end;margin:0;font-size:11px;line-height:1.65}.Gv2DuW_list{gap:0;margin:0;padding:0;list-style:none;display:grid}.Gv2DuW_card{border-block-start:1px solid #533e2d21;grid-template-columns:58px minmax(0,1fr);gap:22px;padding:28px 0;display:grid;position:relative}.Gv2DuW_list>.Gv2DuW_card:first-child{border-block-start:0}.Gv2DuW_card:before{content:\"\";background:#a77d4357;width:1px;position:absolute;inset:0 auto 0 28px}.Gv2DuW_sequence{z-index:1;width:42px;height:42px;color:var(--mg-brass,#a77d43);font-family:var(--mg-font-reflection);background:#f9efe2;border:1px solid #a77d4361;border-radius:50%;place-items:center;font-size:13px;display:grid;position:relative}.Gv2DuW_card>article{min-width:0}.Gv2DuW_card article>header{justify-content:space-between;align-items:baseline;gap:18px;display:flex}.Gv2DuW_card article>header>div{gap:5px;display:grid}.Gv2DuW_card h3{color:var(--mg-ink,#342d27);font-family:var(--mg-font-reflection);margin:0;font-size:22px;font-weight:560;line-height:1.4}.Gv2DuW_status{color:var(--mg-plum,#8d5a5e);font-size:10px;font-weight:700}.Gv2DuW_card time{color:var(--mg-muted,#76695e);font-size:10px}.Gv2DuW_meaning{grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;margin:18px 0 0;display:grid}.Gv2DuW_meaning div{background:#fffbf480;padding:15px 17px}.Gv2DuW_meaning dt{color:var(--mg-muted,#76695e);font-size:9px}.Gv2DuW_meaning dd{color:var(--mg-ink,#342d27);margin:7px 0 0;font-size:12px;line-height:1.65}.Gv2DuW_observations{gap:8px;margin:17px 0 0;padding:0;list-style:none;display:grid}.Gv2DuW_observations li{color:var(--mg-muted,#76695e);align-items:flex-start;gap:8px;font-size:11px;line-height:1.6;display:flex}.Gv2DuW_observations svg{color:var(--mg-sage,#71806e);flex:none;margin-block-start:2px}.Gv2DuW_observationForm{background:#ebdac266;grid-template-columns:minmax(0,1fr) auto;gap:8px 12px;margin-block-start:17px;padding:17px;display:grid}.Gv2DuW_observationForm label{color:var(--mg-muted,#76695e);grid-column:1/-1;font-size:10px}.Gv2DuW_observationForm textarea{min-height:78px}.Gv2DuW_actions{flex-wrap:wrap;gap:7px;margin-block-start:18px;display:flex}.Gv2DuW_actions button{background:#405f8712;border-color:#0000;min-height:32px;padding:4px 9px}.Gv2DuW_empty{min-height:140px;color:var(--mg-muted,#76695e);text-align:center;border-block:1px solid #533e2d21;margin:0;padding:40px 0}@media (width<=980px){.Gv2DuW_workshop{background-position:48%;grid-template-columns:minmax(270px,.72fr) minmax(340px,1.28fr);min-height:880px;padding:48px 34px}.Gv2DuW_workshop:before{background:linear-gradient(90deg,#fffbf4f5 0 30%,#fffbf46b 53%,#0000 74%)}.Gv2DuW_composer{grid-template-columns:1fr}.Gv2DuW_composer .Gv2DuW_wide{grid-column:1}}@media (width<=680px){.Gv2DuW_workshop{background-position:38%;grid-template-rows:auto 1fr auto;grid-template-columns:1fr;gap:0;min-height:1040px;margin:-24px -14px 44px;padding:34px 16px 20px}.Gv2DuW_workshop:before{background:linear-gradient(#fffbf4f7 0 30%,#fffbf41f 58%,#fffbf4e8 77%)}.Gv2DuW_hero{grid-area:1/1}.Gv2DuW_heroCopy h1{font-size:44px}.Gv2DuW_fieldInstrument{display:none}.Gv2DuW_composerDeck{grid-area:3/1;padding:18px}.Gv2DuW_composer{grid-template-columns:1fr}.Gv2DuW_composerFooter{flex-direction:column;align-items:stretch}.Gv2DuW_composerFooter button{width:100%}.Gv2DuW_fieldJournal>header{flex-direction:column;align-items:stretch}.Gv2DuW_fieldJournal>header p{text-align:start}.Gv2DuW_card{grid-template-columns:44px minmax(0,1fr);gap:12px}.Gv2DuW_card:before{inset-inline-start:21px}.Gv2DuW_sequence{width:34px;height:34px}.Gv2DuW_card article>header,.Gv2DuW_meaning{grid-template-columns:1fr}.Gv2DuW_card article>header{flex-direction:column;align-items:flex-start}.Gv2DuW_observationForm{grid-template-columns:1fr}}.Gv2DuW_workshop{background-position:53%;border-radius:18px;grid-template-columns:minmax(290px,.72fr) minmax(500px,1.28fr);gap:38px;min-height:clamp(500px,47vw,560px);margin-block-end:50px;padding:clamp(38px,4.6vw,60px);box-shadow:0 26px 68px #44301f21}.Gv2DuW_workshop:before{background:linear-gradient(90deg,#fffbf4fa 0 27%,#fffbf494 44%,#0000 68%)}.Gv2DuW_hero{align-content:start;gap:18px}.Gv2DuW_heroCopy>svg{display:none}.Gv2DuW_heroCopy h1{letter-spacing:-.03em;max-width:11ch;font-size:clamp(34px,3.25vw,43px);line-height:1.11}.Gv2DuW_heroCopy p{max-width:32ch;margin:13px 0;font-size:12px;line-height:1.7}.Gv2DuW_privateLine{gap:6px}.Gv2DuW_privateLine>svg{flex:0 0 14px;width:14px;height:14px;display:block}.Gv2DuW_fieldInstrument figcaption{box-shadow:none;background:#fffbf48a;border-block:1px solid #533e2d24}.Gv2DuW_fieldInstrument figcaption span{min-width:96px;padding:9px 12px}.Gv2DuW_fieldInstrument figcaption strong{font-size:18px}.Gv2DuW_composerDeck{border:0;gap:13px;padding:18px 20px 20px;box-shadow:8px 16px 34px #44301f24}.Gv2DuW_composerDeck>header>svg{flex:0 0 17px;width:17px;height:17px;display:block}.Gv2DuW_composerDeck>header h2{font-size:16px}.Gv2DuW_composer{gap:10px}.Gv2DuW_composer textarea{min-height:72px}.Gv2DuW_composerFooter>button>svg{width:16px;height:16px;display:block}.Gv2DuW_fieldJournal>header{border-block-end:0;margin-block-end:20px;padding-block-end:4px}.Gv2DuW_fieldJournal>header h2{font-size:clamp(25px,2.7vw,32px)}.Gv2DuW_fieldJournal>header p{max-width:38ch}.Gv2DuW_card{padding:24px 0}.Gv2DuW_actions button{min-height:38px}.Gv2DuW_actions button>svg,.Gv2DuW_observations svg{flex:0 0 15px;width:15px;height:15px;display:block}@container Gv2DuW_mind-garden-workspace (width<=820px){.Gv2DuW_workshop{grid-template-columns:minmax(250px,.68fr) minmax(360px,1.32fr);min-height:610px;padding:34px 28px}.Gv2DuW_composer{grid-template-columns:1fr}.Gv2DuW_composer .Gv2DuW_wide{grid-column:1}}@container Gv2DuW_mind-garden-workspace (width<=620px){.Gv2DuW_workshop{background-position:44% 54%;border-radius:0 0 18px 18px;grid-template-rows:auto 28px auto;grid-template-columns:1fr;gap:0;min-height:0;margin:-20px -12px 36px;padding:26px 12px 12px}.Gv2DuW_workshop:before{background:linear-gradient(#fffbf4fa 0 29%,#fffbf41f 48%,#fffbf4f0 67%)}.Gv2DuW_hero{grid-area:1/1;padding-inline:6px}.Gv2DuW_heroCopy h1{max-width:12ch;font-size:clamp(31px,10vw,37px)}.Gv2DuW_heroCopy p{-webkit-line-clamp:2;-webkit-box-orient:vertical;margin-block:10px;display:-webkit-box;overflow:hidden}.Gv2DuW_fieldInstrument{display:none}.Gv2DuW_composerDeck{grid-area:3/1;padding:16px}.Gv2DuW_composer{grid-template-columns:1fr}.Gv2DuW_composerFooter{flex-direction:column;align-items:stretch}.Gv2DuW_composerFooter button{width:100%}.Gv2DuW_fieldJournal>header{flex-direction:column;align-items:stretch;gap:8px}.Gv2DuW_fieldJournal>header p{text-align:start}.Gv2DuW_card{grid-template-columns:40px minmax(0,1fr);gap:11px}.Gv2DuW_card:before{inset-inline-start:19px}.Gv2DuW_sequence{width:34px;height:34px}.Gv2DuW_card article>header{flex-direction:column;align-items:flex-start;gap:8px}.Gv2DuW_meaning{grid-template-columns:1fr;gap:8px}.Gv2DuW_observationForm{grid-template-columns:1fr}.Gv2DuW_actions button{min-height:42px}}@media (width<=620px){.Gv2DuW_workshop{background-position:20% 56%;border-radius:0 0 18px 18px;grid-template-rows:auto 28px auto;grid-template-columns:1fr;gap:0;min-height:0;margin:-20px -12px 36px;padding:26px 12px 12px}.Gv2DuW_workshop:before{background:linear-gradient(#fffbf4fc 0 39%,#fffbf42e 52% 63%,#fffbf4f2 74%)}.Gv2DuW_hero{grid-area:1/1;padding-inline:6px}.Gv2DuW_heroCopy h1{max-width:100%;font-size:clamp(29px,8.2vw,32px);line-height:1.08}.Gv2DuW_heroCopy p{-webkit-line-clamp:2;-webkit-box-orient:vertical;max-width:28ch;margin-block:10px;display:-webkit-box;overflow:hidden}.Gv2DuW_fieldInstrument{display:none}.Gv2DuW_composerDeck{grid-area:3/1;padding:16px}.Gv2DuW_composer{grid-template-columns:1fr}.Gv2DuW_composerFooter{flex-direction:column;align-items:stretch}.Gv2DuW_composerFooter button{width:100%}}";
		const tagId$7 = "@deepseek-ai/dsh-mind-garden/GrowthSpace.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$7) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-mind-garden";
			tag.dataset.pluginCss = tagId$7;
			tag.textContent = css$7;
			document.head.appendChild(tag);
		}
		var GrowthSpace_module_css_default = {
			"actions": "Gv2DuW_actions",
			"card": "Gv2DuW_card",
			"composer": "Gv2DuW_composer",
			"composerDeck": "Gv2DuW_composerDeck",
			"composerFooter": "Gv2DuW_composerFooter",
			"empty": "Gv2DuW_empty",
			"fieldInstrument": "Gv2DuW_fieldInstrument",
			"fieldJournal": "Gv2DuW_fieldJournal",
			"growth": "Gv2DuW_growth",
			"hero": "Gv2DuW_hero",
			"heroCopy": "Gv2DuW_heroCopy",
			"list": "Gv2DuW_list",
			"meaning": "Gv2DuW_meaning",
			"mind-garden-workspace": "Gv2DuW_mind-garden-workspace",
			"observationForm": "Gv2DuW_observationForm",
			"observations": "Gv2DuW_observations",
			"privateLine": "Gv2DuW_privateLine",
			"sequence": "Gv2DuW_sequence",
			"status": "Gv2DuW_status",
			"wide": "Gv2DuW_wide",
			"workshop": "Gv2DuW_workshop"
		};
		//#endregion
		//#region lib/types/client/spaces/GrowthSpace.js
		/** Reality-experiment workspace for life themes that need observation. */
		/** Render user-governed, unscored reality experiments and their observations. */
		function GrowthSpace({ today, onListExperiments, onCreateExperiment, onStartExperiment, onObserveExperiment, onStopExperiment, onDraftConversation = () => void 0, t }) {
			const [experiments, setExperiments] = (0, react.useState)([]);
			const [title, setTitle] = (0, react.useState)("");
			const [hypothesis, setHypothesis] = (0, react.useState)("");
			const [action, setAction] = (0, react.useState)("");
			const [reviewDate, setReviewDate] = (0, react.useState)("");
			const [observingId, setObservingId] = (0, react.useState)(null);
			const [observation, setObservation] = (0, react.useState)("");
			const [loading, setLoading] = (0, react.useState)(true);
			const [pending, setPending] = (0, react.useState)(false);
			const [error, setError] = (0, react.useState)(false);
			const [notice, setNotice] = (0, react.useState)(null);
			const requestRef = (0, react.useRef)(0);
			const refresh = (0, react.useCallback)(async () => {
				const request = ++requestRef.current;
				const result = await settleMindGardenAction(onListExperiments);
				if (request !== requestRef.current) return;
				if (result.ok) {
					setExperiments(result.value);
					setError(false);
				} else setError(true);
				setLoading(false);
			}, [onListExperiments]);
			(0, react.useEffect)(() => {
				refresh();
				return () => {
					requestRef.current++;
				};
			}, [refresh]);
			async function mutate(actionRequest, success) {
				setPending(true);
				setError(false);
				setNotice(null);
				const result = await settleMindGardenAction(actionRequest);
				setPending(false);
				if (!result.ok) {
					setError(true);
					return false;
				}
				setNotice(success);
				await refresh();
				return true;
			}
			async function submit(event) {
				event.preventDefault();
				const nextTitle = title.trim();
				const nextAction = action.trim();
				if (nextTitle === "" || nextAction === "") return;
				if (await mutate(async () => await onCreateExperiment(nextTitle, hypothesis.trim(), nextAction, calendarStamp(today), reviewDate === "" ? void 0 : calendarStamp(reviewDate)), "growth.notice.created")) {
					setTitle("");
					setHypothesis("");
					setAction("");
					setReviewDate("");
				}
			}
			async function recordObservation(item) {
				const value = observation.trim();
				if (await mutate(async () => await onObserveExperiment(item, value, calendarStamp(today)), "growth.notice.observed")) {
					setObservation("");
					setObservingId(null);
				}
			}
			function draftConversation(item) {
				onDraftConversation(t("growth.draft.template").replace("{title}", item.title).replace("{action}", item.action));
				setNotice("growth.notice.drafted");
			}
			const activeCount = experiments.filter((item) => item.status === "trying" || item.status === "revised").length;
			const observedCount = experiments.filter((item) => item.status === "observed").length;
			return (0, react_jsx_runtime.jsxs)("main", {
				className: `${GardenSpace_module_css_default.space} ${GrowthSpace_module_css_default.growth}`,
				"data-mind-garden-space": "growth",
				children: [
					(0, react_jsx_runtime.jsxs)("section", {
						className: GrowthSpace_module_css_default.workshop,
						style: { "--mg-growth-scene": `url("${GROWTH_OBSERVATION_BENCH_V3}")` },
						children: [(0, react_jsx_runtime.jsxs)("header", {
							className: GrowthSpace_module_css_default.hero,
							children: [(0, react_jsx_runtime.jsxs)("div", {
								className: GrowthSpace_module_css_default.heroCopy,
								children: [
									(0, react_jsx_runtime.jsx)(GrowthIcon, { size: 22 }),
									(0, react_jsx_runtime.jsx)("h1", { children: t("growth.title") }),
									(0, react_jsx_runtime.jsx)("p", { children: t("growth.subtitle") }),
									(0, react_jsx_runtime.jsxs)("span", {
										className: GrowthSpace_module_css_default.privateLine,
										children: [(0, react_jsx_runtime.jsx)(PrivateIcon, { size: 15 }), t("growth.private")]
									})
								]
							}), (0, react_jsx_runtime.jsx)("figure", {
								className: GrowthSpace_module_css_default.fieldInstrument,
								"aria-label": t("growth.instrument.label"),
								children: (0, react_jsx_runtime.jsxs)("figcaption", { children: [(0, react_jsx_runtime.jsxs)("span", { children: [(0, react_jsx_runtime.jsx)("strong", { children: activeCount }), t("growth.instrument.active")] }), (0, react_jsx_runtime.jsxs)("span", { children: [(0, react_jsx_runtime.jsx)("strong", { children: observedCount }), t("growth.instrument.observed")] })] })
							})]
						}), (0, react_jsx_runtime.jsxs)("section", {
							className: GrowthSpace_module_css_default.composerDeck,
							"aria-labelledby": "mind-garden-growth-composer-title",
							children: [(0, react_jsx_runtime.jsxs)("header", { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlusOutline16, {}), (0, react_jsx_runtime.jsx)("h2", {
								id: "mind-garden-growth-composer-title",
								children: t("growth.composer.title")
							})] }), (0, react_jsx_runtime.jsxs)("form", {
								className: GrowthSpace_module_css_default.composer,
								onSubmit: (event) => {
									submit(event);
								},
								children: [
									(0, react_jsx_runtime.jsxs)("label", { children: [(0, react_jsx_runtime.jsx)("span", { children: t("growth.input.title") }), (0, react_jsx_runtime.jsx)("input", {
										className: GardenSpace_module_css_default.input,
										value: title,
										onChange: (event) => {
											setTitle(event.target.value);
										}
									})] }),
									(0, react_jsx_runtime.jsxs)("label", { children: [(0, react_jsx_runtime.jsx)("span", { children: t("growth.input.reviewDate") }), (0, react_jsx_runtime.jsx)("input", {
										className: GardenSpace_module_css_default.input,
										type: "date",
										min: today,
										value: reviewDate,
										onChange: (event) => {
											setReviewDate(event.target.value);
										}
									})] }),
									(0, react_jsx_runtime.jsxs)("label", {
										className: GrowthSpace_module_css_default.wide,
										children: [(0, react_jsx_runtime.jsx)("span", { children: t("growth.input.hypothesis") }), (0, react_jsx_runtime.jsx)("input", {
											className: GardenSpace_module_css_default.input,
											value: hypothesis,
											placeholder: t("growth.input.hypothesisPlaceholder"),
											onChange: (event) => {
												setHypothesis(event.target.value);
											}
										})]
									}),
									(0, react_jsx_runtime.jsxs)("label", {
										className: GrowthSpace_module_css_default.wide,
										children: [(0, react_jsx_runtime.jsx)("span", { children: t("growth.input.action") }), (0, react_jsx_runtime.jsx)("textarea", {
											className: GardenSpace_module_css_default.textarea,
											value: action,
											placeholder: t("growth.input.actionPlaceholder"),
											onChange: (event) => {
												setAction(event.target.value);
											}
										})]
									}),
									(0, react_jsx_runtime.jsxs)("div", {
										className: GrowthSpace_module_css_default.composerFooter,
										children: [(0, react_jsx_runtime.jsx)("span", { children: t("growth.composer.boundary") }), (0, react_jsx_runtime.jsxs)("button", {
											className: GardenSpace_module_css_default.button,
											type: "submit",
											disabled: pending || title.trim() === "" || action.trim() === "",
											children: [(0, react_jsx_runtime.jsx)(GrowthIcon, { size: 16 }), t("growth.create")]
										})]
									})
								]
							})]
						})]
					}),
					notice !== null && (0, react_jsx_runtime.jsx)("p", {
						className: GardenSpace_module_css_default.notice,
						role: "status",
						children: t(notice)
					}),
					error && (0, react_jsx_runtime.jsx)("p", {
						className: GardenSpace_module_css_default.error,
						role: "alert",
						children: t("growth.error")
					}),
					(0, react_jsx_runtime.jsxs)("section", {
						className: GrowthSpace_module_css_default.fieldJournal,
						"aria-labelledby": "mind-garden-growth-journal-title",
						children: [(0, react_jsx_runtime.jsxs)("header", { children: [(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("span", { children: t("growth.journal.label") }), (0, react_jsx_runtime.jsx)("h2", {
							id: "mind-garden-growth-journal-title",
							children: t("growth.journal.title")
						})] }), (0, react_jsx_runtime.jsx)("p", { children: t("growth.journal.subtitle") })] }), loading ? (0, react_jsx_runtime.jsx)("p", {
							className: GrowthSpace_module_css_default.empty,
							role: "status",
							children: t("growth.loading")
						}) : experiments.length === 0 ? (0, react_jsx_runtime.jsx)("p", {
							className: GrowthSpace_module_css_default.empty,
							children: t("growth.empty")
						}) : (0, react_jsx_runtime.jsx)("ol", {
							className: GrowthSpace_module_css_default.list,
							children: experiments.map((item, index) => (0, react_jsx_runtime.jsxs)("li", {
								className: GrowthSpace_module_css_default.card,
								"data-status": item.status,
								children: [(0, react_jsx_runtime.jsx)("span", {
									className: GrowthSpace_module_css_default.sequence,
									"aria-hidden": "true",
									children: String(index + 1).padStart(2, "0")
								}), (0, react_jsx_runtime.jsxs)("article", { children: [
									(0, react_jsx_runtime.jsxs)("header", { children: [(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("span", {
										className: GrowthSpace_module_css_default.status,
										children: t(`growth.status.${item.status}`)
									}), (0, react_jsx_runtime.jsx)("h3", { children: item.title })] }), item.reviewStamp !== null && (0, react_jsx_runtime.jsxs)("time", {
										dateTime: item.reviewStamp.localDate,
										children: [(0, react_jsx_runtime.jsxs)("span", { children: [t("growth.reviewDate"), " · "] }), (0, react_jsx_runtime.jsx)("b", { children: item.reviewStamp.localDate })]
									})] }),
									(0, react_jsx_runtime.jsxs)("dl", {
										className: GrowthSpace_module_css_default.meaning,
										children: [item.hypothesis !== "" && (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("growth.hypothesis") }), (0, react_jsx_runtime.jsx)("dd", { children: item.hypothesis })] }), (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("growth.action") }), (0, react_jsx_runtime.jsx)("dd", { children: item.action })] })]
									}),
									item.observations.length > 0 && (0, react_jsx_runtime.jsx)("ol", {
										className: GrowthSpace_module_css_default.observations,
										"aria-label": t("growth.observations"),
										children: item.observations.map((entry) => (0, react_jsx_runtime.jsxs)("li", { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutline16, {}), entry.observation] }, String(entry.id)))
									}),
									observingId === String(item.id) && (0, react_jsx_runtime.jsxs)("div", {
										className: GrowthSpace_module_css_default.observationForm,
										children: [
											(0, react_jsx_runtime.jsx)("label", {
												htmlFor: `observation-${String(item.id)}`,
												children: t("growth.observation")
											}),
											(0, react_jsx_runtime.jsx)("textarea", {
												id: `observation-${String(item.id)}`,
												className: GardenSpace_module_css_default.textarea,
												value: observation,
												onChange: (event) => {
													setObservation(event.target.value);
												}
											}),
											(0, react_jsx_runtime.jsxs)("button", {
												className: GardenSpace_module_css_default.button,
												type: "button",
												disabled: pending || observation.trim() === "",
												onClick: () => {
													recordObservation(item);
												},
												children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutline16, {}), t("growth.record")]
											})
										]
									}),
									(0, react_jsx_runtime.jsxs)("footer", {
										className: GrowthSpace_module_css_default.actions,
										children: [
											(item.status === "proposed" || item.status === "revised") && (0, react_jsx_runtime.jsxs)("button", {
												className: GardenSpace_module_css_default.button,
												type: "button",
												disabled: pending,
												onClick: () => {
													mutate(async () => await onStartExperiment(item, today), "growth.notice.started");
												},
												children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutline16, {}), t("growth.start")]
											}),
											(item.status === "trying" || item.status === "observed") && (0, react_jsx_runtime.jsxs)("button", {
												className: GardenSpace_module_css_default.quietButton,
												type: "button",
												disabled: pending,
												onClick: () => {
													setObservingId((current) => current === String(item.id) ? null : String(item.id));
												},
												children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlusOutline16, {}), t("growth.observe")]
											}),
											(0, react_jsx_runtime.jsxs)("button", {
												className: GardenSpace_module_css_default.quietButton,
												type: "button",
												onClick: () => {
													draftConversation(item);
												},
												children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSendOutline14, {}), t("growth.continue")]
											}),
											item.status !== "stopped" && (0, react_jsx_runtime.jsxs)("button", {
												className: GardenSpace_module_css_default.dangerButton,
												type: "button",
												disabled: pending,
												onClick: () => {
													mutate(async () => await onStopExperiment(item), "growth.notice.stopped");
												},
												children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconStopFill16, {}), t("growth.stop")]
											})
										]
									})
								] })]
							}, String(item.id)))
						})]
					})
				]
			});
		}
		//#endregion
		//#region \0dsh-css:E:\test code\deepseekharness_modified\deepseek-harness\packages\client\ui-mind-garden\src\client\spaces\PhilosophySpace.module.css.mjs
		const css$6 = ".QqtdKa_philosophy{color:var(--mg-ink,#342d27);font-family:var(--mg-font-ui,\"Noto Sans SC\", sans-serif)}.QqtdKa_hero{background:var(--mg-philosophy-scene) center / cover no-repeat;isolation:isolate;grid-template-columns:minmax(310px,.68fr) minmax(500px,1.32fr);align-items:center;min-height:clamp(560px,57vw,700px);margin:calc(-1*clamp(28px,4vw,58px)) calc(-1*clamp(28px,4vw,58px)) 70px;padding:clamp(50px,7vw,92px);display:grid;position:relative;overflow:hidden;box-shadow:0 28px 72px #46311f24}.QqtdKa_hero:before{z-index:-1;content:\"\";background:linear-gradient(90deg,#fffbf4fa 0 29%,#fffbf4b8 44%,#0000 66%);position:absolute;inset:0}.QqtdKa_heroCopy{z-index:1;grid-column:1;justify-items:start;display:grid}.QqtdKa_heroCopy>svg{color:var(--mg-plum,#8d5a5e);margin-block-end:24px}.QqtdKa_heroCopy h1{max-width:12ch;font-family:var(--mg-font-reflection,\"Mind Garden Display\", \"Noto Serif SC\", serif);letter-spacing:-.035em;text-wrap:balance;margin:0;font-size:clamp(39px,4vw,52px);font-weight:560;line-height:1.08}.QqtdKa_heroCopy p{max-width:34ch;color:var(--mg-muted,#76695e);margin:20px 0;font-size:13px;line-height:1.8}.QqtdKa_privateLine{color:var(--mg-muted,#76695e);align-items:center;gap:6px;font-size:10px;display:inline-flex}.QqtdKa_specimen{z-index:2;margin:0;position:absolute;inset:auto clamp(36px,5vw,72px) clamp(30px,4vw,58px) auto}.QqtdKa_specimen figcaption{background:#fffbf4d1;display:flex;box-shadow:7px 14px 30px #44301f21}.QqtdKa_specimen figcaption span{min-width:116px;color:var(--mg-muted,#76695e);border-inline-start:1px solid #533e2d21;gap:2px;padding:13px 16px;font-size:10px;display:grid}.QqtdKa_specimen figcaption span:first-child{border-inline-start:0}.QqtdKa_specimen figcaption strong{color:var(--mg-ink,#342d27);font-family:var(--mg-font-reflection);font-size:22px;font-weight:560}.QqtdKa_loading{width:min(1160px,100%);color:var(--mg-muted,#76695e);border-block:1px solid #533e2d21;margin:0 auto;padding:44px 0}.QqtdKa_sections{grid-template-columns:repeat(12,minmax(0,1fr));gap:56px 34px;width:min(1160px,100%);margin:0 auto;display:grid}.QqtdKa_section{min-width:0;box-shadow:none;background:0 0;border:0;border-radius:0;padding:0}.QqtdKa_contemplationSection{grid-column:1/span 7}.QqtdKa_proposalSection{color:#fffaf2;background:#3d5779;border-radius:14px;grid-column:8/-1;align-self:start;padding:26px 28px 30px;box-shadow:9px 18px 42px #304c702e}.QqtdKa_principleSection{grid-column:1/-1}.QqtdKa_sectionHeader{border-block-end:1px solid #533e2d24;align-items:flex-start;gap:12px;margin-block-end:24px;padding-block-end:15px;display:flex}.QqtdKa_sectionHeader>span{aspect-ratio:1;width:34px;color:var(--mg-indigo,#405f87);border:1px solid #405f873b;border-radius:50%;flex:none;place-items:center;display:grid}.QqtdKa_sectionHeader h2{font-family:var(--mg-font-reflection);letter-spacing:-.025em;margin:0;font-size:27px;font-weight:560}.QqtdKa_sectionHeader p{max-width:46ch;color:var(--mg-muted,#76695e);margin:5px 0 0;font-size:10px;line-height:1.6}.QqtdKa_sectionHeader>button{flex:none;min-height:36px;margin-inline-start:auto}.QqtdKa_proposalSection .QqtdKa_sectionHeader{border-block-end-color:#fffaf22e}.QqtdKa_proposalSection .QqtdKa_sectionHeader>span{color:#d9b378;border-color:#d9b37859}.QqtdKa_proposalSection .QqtdKa_sectionHeader h2{color:#fffaf2}.QqtdKa_proposalSection .QqtdKa_sectionHeader p{color:#fffaf2a6}.QqtdKa_empty{min-height:130px;color:var(--mg-muted,#76695e);margin:0;padding:32px 0;line-height:1.7}.QqtdKa_proposalSection .QqtdKa_empty{color:#fffaf2ad}.QqtdKa_list,.QqtdKa_proposalList,.QqtdKa_principles{gap:0;margin:0;padding:0;list-style:none;display:grid}.QqtdKa_note{border-block-start:1px solid #533e2d1f;grid-template-columns:42px minmax(0,1fr);gap:16px;padding:22px 0;display:grid}.QqtdKa_list>.QqtdKa_note:first-child{border-block-start:0}.QqtdKa_sequence{color:var(--mg-brass,#a77d43);font-family:var(--mg-font-reflection);font-size:13px}.QqtdKa_note article{min-width:0}.QqtdKa_note article>header{color:var(--mg-muted,#76695e);justify-content:space-between;gap:14px;font-size:10px;display:flex}.QqtdKa_note article>header small{color:var(--mg-plum,#8d5a5e);font-weight:700}.QqtdKa_note article>p{color:var(--mg-ink,#342d27);font-family:var(--mg-font-reflection);margin:12px 0;font-size:18px;line-height:1.75}.QqtdKa_note footer{flex-wrap:wrap;justify-content:flex-end;gap:7px;display:flex}.QqtdKa_inlineComposer,.QqtdKa_principleComposer{background:#fffcf6a8;border:1px solid #533e2d21;border-radius:10px;gap:10px;margin:12px 0 18px;padding:14px;display:grid}.QqtdKa_inlineComposer label,.QqtdKa_principleComposer label{color:var(--mg-muted,#76695e);font-size:10px;line-height:1.6}.QqtdKa_inlineComposer textarea,.QqtdKa_principleComposer input{width:100%;min-width:0;color:var(--mg-ink,#342d27);font:inherit;background:#fffdf8;border:1px solid #533e2d2e;border-radius:8px;line-height:1.65}.QqtdKa_inlineComposer textarea{resize:vertical;min-height:108px;padding:10px 12px}.QqtdKa_principleComposer input{min-height:42px;padding:8px 11px}.QqtdKa_inlineComposer>div,.QqtdKa_principleComposer>div,.QqtdKa_deleteConfirmation{flex-wrap:wrap;justify-content:flex-end;align-items:center;gap:7px;display:flex}.QqtdKa_deleteConfirmation{color:var(--mg-muted,#76695e);margin:10px 0;font-size:10px}.QqtdKa_deleteConfirmation>span{margin-inline-end:auto}.QqtdKa_proposalList{gap:14px}.QqtdKa_proposal{border-block-start:1px solid #fffaf229;padding:18px 0}.QqtdKa_proposalList>.QqtdKa_proposal:first-child{border-block-start:0}.QqtdKa_proposal>header{gap:7px;display:grid}.QqtdKa_proposal>header small{color:#d9b378;font-size:9px;font-weight:700}.QqtdKa_proposal>header strong{color:#fffaf2;font-family:var(--mg-font-reflection);font-size:18px;font-weight:560;line-height:1.55}.QqtdKa_proposalMeaning{gap:9px;margin:15px 0 0;display:grid}.QqtdKa_proposalMeaning div{grid-template-columns:78px minmax(0,1fr);gap:10px;display:grid}.QqtdKa_proposalMeaning dt{color:#fffaf280;font-size:9px}.QqtdKa_proposalMeaning dd{color:#fffaf2c2;margin:0;font-size:10px;line-height:1.55}.QqtdKa_proposalActions{flex-wrap:wrap;gap:8px;margin-block-start:16px;display:flex}.QqtdKa_proposalActions button:first-child{color:var(--mg-indigo,#405f87);background:#fff7eb}.QqtdKa_proposalActions button:last-child{color:#fff4ed;border-color:#fff4ed3d}.QqtdKa_principleSection .QqtdKa_sectionHeader{align-items:center}.QqtdKa_principles{grid-template-columns:repeat(2,minmax(0,1fr));gap:22px 28px}.QqtdKa_principle{background:linear-gradient(135deg, #fffdf8f0, #f5eadad6), var(--mg-xuan-texture);background-size:auto,440px;border:1px solid #533e2d21;border-radius:10px 14px 11px 13px;grid-template-columns:44px minmax(0,1fr);gap:18px;min-width:0;padding:24px;display:grid;position:relative;box-shadow:6px 12px 28px #46311f17}.QqtdKa_principle:after{background:var(--mg-plum,#8d5a5e);content:\"\";opacity:.78;width:6px;position:absolute;inset:0 12px 0 auto}.QqtdKa_folioNumber{color:var(--mg-brass,#a77d43);font-family:var(--mg-font-reflection);font-size:14px}.QqtdKa_principle article{min-width:0;padding-inline-end:12px}.QqtdKa_principle article>header{justify-content:space-between;align-items:start;gap:14px;display:flex}.QqtdKa_principle h3{color:var(--mg-ink,#342d27);font-family:var(--mg-font-reflection);margin:0;font-size:20px;font-weight:560;line-height:1.5}.QqtdKa_statusSelect{max-width:112px;min-height:34px;color:var(--mg-indigo,#405f87);font:inherit;background:#fffcf6b3;border:1px solid #533e2d2b;border-radius:8px;font-size:10px}.QqtdKa_meaning{gap:10px;margin:18px 0;display:grid}.QqtdKa_meaning div{grid-template-columns:82px minmax(0,1fr);gap:10px;display:grid}.QqtdKa_meaning dt{color:var(--mg-muted,#76695e);font-size:9px}.QqtdKa_meaning dd{color:var(--mg-ink,#342d27);margin:0;font-size:10px;line-height:1.55}.QqtdKa_tags{flex-wrap:wrap;gap:6px;margin:0;padding:0;list-style:none;display:flex}.QqtdKa_tags li{color:var(--mg-plum,#8d5a5e);background:#8d5a5e14;border-radius:999px;padding:4px 7px;font-size:9px}.QqtdKa_versions{border-block-start:1px solid #533e2d1f;margin-block-start:16px}.QqtdKa_versions summary{color:var(--mg-indigo,#405f87);cursor:pointer;padding:12px 0;font-size:10px}.QqtdKa_versions ol{gap:9px;margin:0;padding:0;list-style:none;display:grid}.QqtdKa_versions li{color:var(--mg-muted,#76695e);grid-template-columns:84px 1fr;gap:10px;font-size:9px;display:grid}.QqtdKa_versions p{color:var(--mg-ink,#342d27);margin:0}.QqtdKa_principle footer{justify-content:flex-end;margin-block-start:15px;display:flex}@media (width<=980px){.QqtdKa_hero{background-position:65%;min-height:760px;padding:48px 34px}.QqtdKa_hero:before{background:linear-gradient(#fffbf4f7 0 34%,#fffbf473 58%,#0000 76%)}.QqtdKa_specimen{inset:auto 34px 28px}.QqtdKa_contemplationSection,.QqtdKa_proposalSection{grid-column:1/-1}}@media (width<=680px){.QqtdKa_hero{background-position:70%;min-height:820px;margin:-24px -14px 44px;padding:34px 20px}.QqtdKa_heroCopy h1{font-size:44px}.QqtdKa_specimen{width:calc(100% - 28px);inset:auto 14px 18px;overflow-x:auto}.QqtdKa_specimen figcaption span{min-width:104px;padding:11px 12px}.QqtdKa_sections{gap:42px}.QqtdKa_proposalSection{padding:23px 18px}.QqtdKa_principles{grid-template-columns:1fr}.QqtdKa_principle{grid-template-columns:32px minmax(0,1fr);padding:19px 16px}.QqtdKa_principle article>header{flex-direction:column}.QqtdKa_meaning div{grid-template-columns:1fr}}.QqtdKa_hero{background-position:57%;border-radius:18px;grid-template-columns:minmax(300px,.68fr) minmax(520px,1.32fr);min-height:clamp(350px,33vw,410px);margin-block-end:50px;padding:clamp(38px,4.8vw,62px);box-shadow:0 26px 68px #44301f21}.QqtdKa_hero:before{background:linear-gradient(90deg,#fffbf4fa 0 30%,#fffbf4b3 44%,#0000 65%)}.QqtdKa_heroCopy>svg{display:none}.QqtdKa_heroCopy h1{letter-spacing:-.03em;max-width:11ch;font-size:clamp(34px,3.2vw,43px);line-height:1.11}.QqtdKa_heroCopy p{-webkit-line-clamp:3;-webkit-box-orient:vertical;max-width:32ch;margin:14px 0;font-size:12px;line-height:1.7;display:-webkit-box;overflow:hidden}.QqtdKa_privateLine>svg{flex:0 0 14px;width:14px;height:14px;display:block}.QqtdKa_specimen{inset:auto clamp(30px,4vw,52px) clamp(24px,3vw,34px) auto}.QqtdKa_specimen figcaption{background:#fffbf4bd;border:0;border-radius:12px;box-shadow:0 12px 32px #44301f14}.QqtdKa_specimen figcaption span{min-width:104px;padding:10px 13px}.QqtdKa_specimen figcaption strong{font-size:19px}.QqtdKa_sections{gap:44px 30px}.QqtdKa_sectionHeader{border-block-end:0;gap:10px;margin-block-end:18px;padding-block-end:4px}.QqtdKa_sectionHeader>span{width:32px}.QqtdKa_sectionHeader>span>svg{width:16px;height:16px;display:block}.QqtdKa_sectionHeader h2{font-size:24px}.QqtdKa_note{padding:19px 0}.QqtdKa_proposalSection{padding:23px 24px 26px}.QqtdKa_principles{gap:18px 22px}.QqtdKa_principle{border:0;padding:21px;box-shadow:0 14px 36px #44301f14}.QqtdKa_principle:after{display:none}.QqtdKa_proposalActions button,.QqtdKa_note footer button,.QqtdKa_principle footer button{min-height:38px}.QqtdKa_proposalActions button>svg,.QqtdKa_note footer button>svg,.QqtdKa_principle footer button>svg{flex:0 0 15px;width:15px;height:15px;display:block}@container QqtdKa_mind-garden-workspace (width<=820px){.QqtdKa_hero{background-position:63%;min-height:450px;padding:32px 28px}.QqtdKa_hero:before{background:linear-gradient(#fffbf4f7 0 36%,#fffbf457 61%,#0000 78%)}.QqtdKa_specimen{inset:auto 28px 22px}.QqtdKa_contemplationSection,.QqtdKa_proposalSection{grid-column:1/-1}}@container QqtdKa_mind-garden-workspace (width<=620px){.QqtdKa_hero{background-position:68% 58%;border-radius:0 0 18px 18px;min-height:390px;margin:-20px -12px 34px;padding:26px 18px 18px}.QqtdKa_hero:before{background:linear-gradient(#fffbf4fa 0 43%,#fffbf438 68%,#fffbf4a3 100%)}.QqtdKa_heroCopy h1{max-width:12ch;font-size:clamp(31px,10vw,37px)}.QqtdKa_heroCopy p{-webkit-line-clamp:2;margin-block:10px}.QqtdKa_specimen{width:calc(100% - 24px);inset:auto 12px 12px;overflow:visible}.QqtdKa_specimen figcaption{width:100%}.QqtdKa_specimen figcaption span{flex:1;min-width:0;padding:9px 8px}.QqtdKa_sections{gap:34px}.QqtdKa_proposalSection{padding:21px 16px}.QqtdKa_principles{grid-template-columns:1fr}.QqtdKa_principle{grid-template-columns:30px minmax(0,1fr);padding:17px 15px}.QqtdKa_principle article>header{flex-direction:column}.QqtdKa_meaning div{grid-template-columns:1fr}.QqtdKa_proposalActions button,.QqtdKa_note footer button,.QqtdKa_inlineComposer button,.QqtdKa_principleComposer button,.QqtdKa_principle footer button{min-height:42px}}@media (width<=620px){.QqtdKa_hero{background-position:70% 58%;border-radius:0 0 18px 18px;min-height:390px;margin:-20px -12px 34px;padding:26px 18px 18px}.QqtdKa_hero:before{background:linear-gradient(90deg,#fffbf4fc 0 57%,#fffbf4b8 72%,#0000 92%)}.QqtdKa_heroCopy{max-width:76%}.QqtdKa_heroCopy h1{max-width:11ch;font-size:clamp(31px,10vw,37px)}.QqtdKa_heroCopy p{-webkit-line-clamp:2;max-width:28ch;margin-block:10px}.QqtdKa_specimen{width:calc(100% - 24px);inset:auto 12px 12px;overflow:visible}.QqtdKa_specimen figcaption{width:100%}.QqtdKa_specimen figcaption span{flex:1;min-width:0;padding:9px 8px}}";
		const tagId$6 = "@deepseek-ai/dsh-mind-garden/PhilosophySpace.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$6) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-mind-garden";
			tag.dataset.pluginCss = tagId$6;
			tag.textContent = css$6;
			document.head.appendChild(tag);
		}
		var PhilosophySpace_module_css_default = {
			"contemplationSection": "QqtdKa_contemplationSection",
			"deleteConfirmation": "QqtdKa_deleteConfirmation",
			"empty": "QqtdKa_empty",
			"folioNumber": "QqtdKa_folioNumber",
			"hero": "QqtdKa_hero",
			"heroCopy": "QqtdKa_heroCopy",
			"inlineComposer": "QqtdKa_inlineComposer",
			"list": "QqtdKa_list",
			"loading": "QqtdKa_loading",
			"meaning": "QqtdKa_meaning",
			"mind-garden-workspace": "QqtdKa_mind-garden-workspace",
			"note": "QqtdKa_note",
			"philosophy": "QqtdKa_philosophy",
			"principle": "QqtdKa_principle",
			"principleComposer": "QqtdKa_principleComposer",
			"principleSection": "QqtdKa_principleSection",
			"principles": "QqtdKa_principles",
			"privateLine": "QqtdKa_privateLine",
			"proposal": "QqtdKa_proposal",
			"proposalActions": "QqtdKa_proposalActions",
			"proposalList": "QqtdKa_proposalList",
			"proposalMeaning": "QqtdKa_proposalMeaning",
			"proposalSection": "QqtdKa_proposalSection",
			"section": "QqtdKa_section",
			"sectionHeader": "QqtdKa_sectionHeader",
			"sections": "QqtdKa_sections",
			"sequence": "QqtdKa_sequence",
			"specimen": "QqtdKa_specimen",
			"statusSelect": "QqtdKa_statusSelect",
			"tags": "QqtdKa_tags",
			"versions": "QqtdKa_versions"
		};
		//#endregion
		//#region lib/types/client/spaces/PhilosophySpace.js
		/** Confirmation-gated contemplations and life principles. */
		const PRINCIPLE_STATUSES = [
			"trying",
			"adopted",
			"questioning",
			"retired"
		];
		const MAX_CONTEMPLATION_CHARACTERS = 3e4;
		const MAX_PRINCIPLE_CHARACTERS = 3e3;
		function exactQuote(markdown) {
			return Array.from(markdown.trim()).slice(0, 1e3).join("");
		}
		/** Render contemplation evidence, inert proposals, and user-governed principle histories. */
		function PhilosophySpace({ today, onListContemplations, onCreateContemplation, onUpdateContemplation, onConfirmContemplation, onDeleteContemplation, onProposePrinciple, onListPrincipleProposals, onListPrinciples, onAcceptPrincipleProposal, onRejectPrincipleProposal, onRevisePrincipleStatus, onDraftConversation = () => void 0, t }) {
			const [contemplations, setContemplations] = (0, react.useState)([]);
			const [proposals, setProposals] = (0, react.useState)([]);
			const [principles, setPrinciples] = (0, react.useState)([]);
			const [loading, setLoading] = (0, react.useState)(true);
			const [pending, setPending] = (0, react.useState)(false);
			const [error, setError] = (0, react.useState)(null);
			const [notice, setNotice] = (0, react.useState)(null);
			const [creating, setCreating] = (0, react.useState)(false);
			const [newContemplation, setNewContemplation] = (0, react.useState)("");
			const [editingId, setEditingId] = (0, react.useState)(null);
			const [editingMarkdown, setEditingMarkdown] = (0, react.useState)("");
			const [deletingId, setDeletingId] = (0, react.useState)(null);
			const [proposalSourceId, setProposalSourceId] = (0, react.useState)(null);
			const [proposalExpression, setProposalExpression] = (0, react.useState)("");
			const requestRef = (0, react.useRef)(0);
			const refresh = (0, react.useCallback)(async () => {
				const request = ++requestRef.current;
				const [contemplationResult, proposalResult, principleResult] = await Promise.all([
					settleMindGardenAction(onListContemplations),
					settleMindGardenAction(onListPrincipleProposals),
					settleMindGardenAction(onListPrinciples)
				]);
				if (request !== requestRef.current) return;
				if (!contemplationResult.ok || !proposalResult.ok || !principleResult.ok) {
					setError("philosophy.error");
					setLoading(false);
					return;
				}
				setContemplations(contemplationResult.value);
				setProposals(proposalResult.value);
				setPrinciples(principleResult.value);
				setError(null);
				setLoading(false);
			}, [
				onListContemplations,
				onListPrincipleProposals,
				onListPrinciples
			]);
			(0, react.useEffect)(() => {
				refresh();
				return () => {
					requestRef.current++;
				};
			}, [refresh]);
			async function mutate(action, success) {
				setPending(true);
				setError(null);
				setNotice(null);
				let result;
				try {
					result = await action();
				} catch {
					setPending(false);
					setError("philosophy.error");
					return false;
				}
				setPending(false);
				if (!result.ok) {
					setError(result.code === "contemplation-source-unavailable" ? "philosophy.sourceUnavailable" : "philosophy.error");
					return false;
				}
				setNotice(success);
				await refresh();
				return true;
			}
			async function createContemplation() {
				const markdown = newContemplation.trim();
				if (markdown === "") return;
				if (await mutate(async () => await onCreateContemplation(markdown), "philosophy.notice.created")) {
					setNewContemplation("");
					setCreating(false);
				}
			}
			async function updateContemplation(item) {
				const markdown = editingMarkdown.trim();
				if (markdown === "") return;
				if (await mutate(async () => await onUpdateContemplation(item, markdown), "philosophy.notice.updated")) {
					setEditingId(null);
					setEditingMarkdown("");
				}
			}
			async function confirmContemplation(item) {
				if (await mutate(async () => await onConfirmContemplation(item), "philosophy.notice.confirmed")) {
					setEditingId(null);
					setDeletingId(null);
				}
			}
			async function deleteContemplation(item) {
				if (await mutate(async () => await onDeleteContemplation(item), "philosophy.notice.deleted")) {
					setEditingId(null);
					setDeletingId(null);
				}
			}
			async function proposePrinciple(item) {
				const expression = proposalExpression.trim();
				if (expression === "") return;
				const content = {
					expression,
					formationContext: t("philosophy.formation.manual"),
					userQuote: exactQuote(item.markdown),
					supportingExperiences: [],
					counterexample: "",
					appliesTo: [],
					notAppliesTo: [],
					lastChallenged: today,
					status: "trying"
				};
				if (await mutate(async () => await onProposePrinciple(item, content), "philosophy.notice.proposed")) {
					setProposalSourceId(null);
					setProposalExpression("");
				}
			}
			function reviseStatus(principle, status) {
				mutate(async () => await onRevisePrincipleStatus(principle, status, calendarStamp(today)), "philosophy.notice.revised");
			}
			function draftContemplation(item) {
				onDraftConversation(t("philosophy.draft.contemplation").replace("{content}", item.markdown));
				setNotice("philosophy.notice.drafted");
			}
			function draftPrinciple(item) {
				onDraftConversation(t("philosophy.draft.principle").replace("{expression}", item.current.expression).replace("{counterexample}", item.current.counterexample));
				setNotice("philosophy.notice.drafted");
			}
			const confirmedContemplations = contemplations.filter((item) => item.status === "confirmed").length;
			const pendingProposals = proposals.filter((item) => item.status === "proposed").length;
			const activePrinciples = principles.filter((item) => item.status !== "retired").length;
			return (0, react_jsx_runtime.jsxs)("main", {
				className: `${GardenSpace_module_css_default.space} ${PhilosophySpace_module_css_default.philosophy}`,
				"data-mind-garden-space": "philosophy",
				children: [
					(0, react_jsx_runtime.jsxs)("header", {
						className: PhilosophySpace_module_css_default.hero,
						style: { "--mg-philosophy-scene": `url("${PHILOSOPHY_FOLIO_ROOM_V3}")` },
						children: [(0, react_jsx_runtime.jsxs)("div", {
							className: PhilosophySpace_module_css_default.heroCopy,
							children: [
								(0, react_jsx_runtime.jsx)(PhilosophyIcon, { size: 22 }),
								(0, react_jsx_runtime.jsx)("h1", { children: t("philosophy.title") }),
								(0, react_jsx_runtime.jsx)("p", { children: t("philosophy.subtitle") }),
								(0, react_jsx_runtime.jsxs)("span", {
									className: PhilosophySpace_module_css_default.privateLine,
									children: [(0, react_jsx_runtime.jsx)(PrivateIcon, { size: 15 }), t("philosophy.private")]
								})
							]
						}), (0, react_jsx_runtime.jsx)("figure", {
							className: PhilosophySpace_module_css_default.specimen,
							"aria-label": t("philosophy.instrument.label"),
							children: (0, react_jsx_runtime.jsxs)("figcaption", { children: [
								(0, react_jsx_runtime.jsxs)("span", { children: [(0, react_jsx_runtime.jsx)("strong", { children: confirmedContemplations }), t("philosophy.instrument.notes")] }),
								(0, react_jsx_runtime.jsxs)("span", { children: [(0, react_jsx_runtime.jsx)("strong", { children: pendingProposals }), t("philosophy.instrument.proposals")] }),
								(0, react_jsx_runtime.jsxs)("span", { children: [(0, react_jsx_runtime.jsx)("strong", { children: activePrinciples }), t("philosophy.instrument.principles")] })
							] })
						})]
					}),
					notice !== null && (0, react_jsx_runtime.jsx)("p", {
						className: GardenSpace_module_css_default.notice,
						role: "status",
						children: t(notice)
					}),
					error !== null && (0, react_jsx_runtime.jsx)("p", {
						className: GardenSpace_module_css_default.error,
						role: "alert",
						children: t(error)
					}),
					loading ? (0, react_jsx_runtime.jsx)("p", {
						className: PhilosophySpace_module_css_default.loading,
						role: "status",
						children: t("philosophy.loading")
					}) : (0, react_jsx_runtime.jsxs)("div", {
						className: PhilosophySpace_module_css_default.sections,
						children: [
							(0, react_jsx_runtime.jsxs)("section", {
								className: `${PhilosophySpace_module_css_default.section} ${PhilosophySpace_module_css_default.contemplationSection}`,
								"aria-labelledby": "garden-contemplations",
								children: [
									(0, react_jsx_runtime.jsxs)("div", {
										className: PhilosophySpace_module_css_default.sectionHeader,
										children: [
											(0, react_jsx_runtime.jsx)("span", { children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSparkle16, {}) }),
											(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("h2", {
												id: "garden-contemplations",
												children: t("philosophy.contemplations")
											}), (0, react_jsx_runtime.jsx)("p", { children: t("philosophy.contemplationsHint") })] }),
											(0, react_jsx_runtime.jsx)("button", {
												className: GardenSpace_module_css_default.quietButton,
												type: "button",
												"aria-expanded": creating,
												disabled: pending,
												onClick: () => {
													setCreating((value) => !value);
													setEditingId(null);
													setDeletingId(null);
												},
												children: t("philosophy.add")
											})
										]
									}),
									creating && (0, react_jsx_runtime.jsxs)("form", {
										className: PhilosophySpace_module_css_default.inlineComposer,
										onSubmit: (event) => {
											event.preventDefault();
											createContemplation();
										},
										children: [
											(0, react_jsx_runtime.jsx)("label", {
												htmlFor: "garden-new-contemplation",
												children: t("philosophy.addLabel")
											}),
											(0, react_jsx_runtime.jsx)("textarea", {
												id: "garden-new-contemplation",
												value: newContemplation,
												maxLength: MAX_CONTEMPLATION_CHARACTERS,
												autoFocus: true,
												onChange: (event) => {
													setNewContemplation(event.target.value);
												}
											}),
											(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("button", {
												className: GardenSpace_module_css_default.button,
												type: "submit",
												disabled: pending || newContemplation.trim() === "",
												children: t("philosophy.saveDraft")
											}), (0, react_jsx_runtime.jsx)("button", {
												className: GardenSpace_module_css_default.quietButton,
												type: "button",
												disabled: pending,
												onClick: () => {
													setCreating(false);
													setNewContemplation("");
												},
												children: t("philosophy.cancel")
											})] })
										]
									}),
									contemplations.length === 0 ? (0, react_jsx_runtime.jsx)("p", {
										className: PhilosophySpace_module_css_default.empty,
										children: t("philosophy.emptyContemplations")
									}) : (0, react_jsx_runtime.jsx)("ol", {
										className: PhilosophySpace_module_css_default.list,
										children: contemplations.map((item, index) => (0, react_jsx_runtime.jsxs)("li", {
											className: PhilosophySpace_module_css_default.note,
											"data-status": item.status,
											children: [(0, react_jsx_runtime.jsx)("span", {
												className: PhilosophySpace_module_css_default.sequence,
												"aria-hidden": "true",
												children: String(index + 1).padStart(2, "0")
											}), (0, react_jsx_runtime.jsxs)("article", { children: [
												(0, react_jsx_runtime.jsxs)("header", { children: [(0, react_jsx_runtime.jsx)("small", { children: t(`philosophy.contemplation.${item.status}`) }), (0, react_jsx_runtime.jsx)("time", { children: new Date(item.updatedAt).toLocaleDateString() })] }),
												(0, react_jsx_runtime.jsx)("p", { children: item.markdown }),
												editingId === String(item.id) && (0, react_jsx_runtime.jsxs)("form", {
													className: PhilosophySpace_module_css_default.inlineComposer,
													onSubmit: (event) => {
														event.preventDefault();
														updateContemplation(item);
													},
													children: [
														(0, react_jsx_runtime.jsx)("label", {
															htmlFor: `garden-edit-${String(item.id)}`,
															children: t("philosophy.editLabel")
														}),
														(0, react_jsx_runtime.jsx)("textarea", {
															id: `garden-edit-${String(item.id)}`,
															value: editingMarkdown,
															maxLength: MAX_CONTEMPLATION_CHARACTERS,
															autoFocus: true,
															onChange: (event) => {
																setEditingMarkdown(event.target.value);
															}
														}),
														(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("button", {
															className: GardenSpace_module_css_default.button,
															type: "submit",
															disabled: pending || editingMarkdown.trim() === "",
															children: t("philosophy.save")
														}), (0, react_jsx_runtime.jsx)("button", {
															className: GardenSpace_module_css_default.quietButton,
															type: "button",
															disabled: pending,
															onClick: () => {
																setEditingId(null);
																setEditingMarkdown("");
															},
															children: t("philosophy.cancel")
														})] })
													]
												}),
												proposalSourceId === String(item.id) && (0, react_jsx_runtime.jsxs)("form", {
													className: PhilosophySpace_module_css_default.principleComposer,
													onSubmit: (event) => {
														event.preventDefault();
														proposePrinciple(item);
													},
													children: [
														(0, react_jsx_runtime.jsx)("label", {
															htmlFor: `garden-principle-${String(item.id)}`,
															children: t("philosophy.extractLabel")
														}),
														(0, react_jsx_runtime.jsx)("input", {
															id: `garden-principle-${String(item.id)}`,
															value: proposalExpression,
															maxLength: MAX_PRINCIPLE_CHARACTERS,
															autoFocus: true,
															onChange: (event) => {
																setProposalExpression(event.target.value);
															}
														}),
														(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("button", {
															className: GardenSpace_module_css_default.button,
															type: "submit",
															disabled: pending || proposalExpression.trim() === "",
															children: t("philosophy.propose")
														}), (0, react_jsx_runtime.jsx)("button", {
															className: GardenSpace_module_css_default.quietButton,
															type: "button",
															disabled: pending,
															onClick: () => {
																setProposalSourceId(null);
																setProposalExpression("");
															},
															children: t("philosophy.cancel")
														})] })
													]
												}),
												deletingId === String(item.id) && (0, react_jsx_runtime.jsxs)("div", {
													className: PhilosophySpace_module_css_default.deleteConfirmation,
													role: "group",
													"aria-label": t("philosophy.deleteQuestion"),
													children: [
														(0, react_jsx_runtime.jsx)("span", { children: t("philosophy.deleteQuestion") }),
														(0, react_jsx_runtime.jsx)("button", {
															className: GardenSpace_module_css_default.dangerButton,
															type: "button",
															disabled: pending,
															onClick: () => {
																deleteContemplation(item);
															},
															children: t("philosophy.deleteConfirm")
														}),
														(0, react_jsx_runtime.jsx)("button", {
															className: GardenSpace_module_css_default.quietButton,
															type: "button",
															disabled: pending,
															onClick: () => {
																setDeletingId(null);
															},
															children: t("philosophy.cancel")
														})
													]
												}),
												(0, react_jsx_runtime.jsx)("footer", { children: item.status === "draft" ? (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
													(0, react_jsx_runtime.jsx)("button", {
														className: GardenSpace_module_css_default.quietButton,
														type: "button",
														disabled: pending,
														onClick: () => {
															setEditingId(String(item.id));
															setEditingMarkdown(item.markdown);
															setDeletingId(null);
														},
														children: t("philosophy.edit")
													}),
													(0, react_jsx_runtime.jsxs)("button", {
														className: GardenSpace_module_css_default.button,
														type: "button",
														disabled: pending,
														onClick: () => {
															confirmContemplation(item);
														},
														children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutline16, {}), t("philosophy.confirm")]
													}),
													(0, react_jsx_runtime.jsx)("button", {
														className: GardenSpace_module_css_default.quietButton,
														type: "button",
														disabled: pending,
														onClick: () => {
															setDeletingId(String(item.id));
															setEditingId(null);
														},
														children: t("philosophy.delete")
													})
												] }) : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [!proposals.some((proposal) => proposal.sourceContemplationId === item.id && proposal.status === "proposed") && (0, react_jsx_runtime.jsx)("button", {
													className: GardenSpace_module_css_default.quietButton,
													type: "button",
													disabled: pending,
													onClick: () => {
														setProposalSourceId(String(item.id));
														setProposalExpression("");
													},
													children: t("philosophy.extract")
												}), (0, react_jsx_runtime.jsxs)("button", {
													className: GardenSpace_module_css_default.quietButton,
													type: "button",
													onClick: () => {
														draftContemplation(item);
													},
													children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSendOutline14, {}), t("philosophy.continue")]
												})] }) })
											] })]
										}, String(item.id)))
									})
								]
							}),
							(0, react_jsx_runtime.jsxs)("section", {
								className: `${PhilosophySpace_module_css_default.section} ${PhilosophySpace_module_css_default.proposalSection}`,
								"aria-labelledby": "garden-proposals",
								children: [(0, react_jsx_runtime.jsxs)("div", {
									className: PhilosophySpace_module_css_default.sectionHeader,
									children: [(0, react_jsx_runtime.jsx)("span", { children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSparkle16, {}) }), (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("h2", {
										id: "garden-proposals",
										children: t("philosophy.proposals")
									}), (0, react_jsx_runtime.jsx)("p", { children: t("philosophy.proposalsHint") })] })]
								}), proposals.length === 0 ? (0, react_jsx_runtime.jsx)("p", {
									className: PhilosophySpace_module_css_default.empty,
									children: t("philosophy.emptyProposals")
								}) : (0, react_jsx_runtime.jsx)("ul", {
									className: PhilosophySpace_module_css_default.proposalList,
									children: proposals.map((item) => (0, react_jsx_runtime.jsxs)("li", {
										className: PhilosophySpace_module_css_default.proposal,
										"data-status": item.status,
										children: [
											(0, react_jsx_runtime.jsxs)("header", { children: [(0, react_jsx_runtime.jsx)("small", { children: t(`philosophy.proposal.${item.status}`) }), (0, react_jsx_runtime.jsx)("strong", { children: item.content.expression })] }),
											(0, react_jsx_runtime.jsxs)("dl", {
												className: PhilosophySpace_module_css_default.proposalMeaning,
												children: [
													(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("philosophy.formation") }), (0, react_jsx_runtime.jsx)("dd", { children: item.content.formationContext })] }),
													(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("philosophy.quote") }), (0, react_jsx_runtime.jsx)("dd", { children: item.content.userQuote })] }),
													(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("philosophy.counterexample") }), (0, react_jsx_runtime.jsx)("dd", { children: item.content.counterexample })] })
												]
											}),
											item.status === "proposed" && (0, react_jsx_runtime.jsxs)("div", {
												className: PhilosophySpace_module_css_default.proposalActions,
												children: [(0, react_jsx_runtime.jsxs)("button", {
													className: GardenSpace_module_css_default.button,
													type: "button",
													disabled: pending,
													onClick: () => {
														mutate(async () => await onAcceptPrincipleProposal(item, calendarStamp(today)), "philosophy.notice.accepted");
													},
													children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutline16, {}), t("philosophy.accept")]
												}), (0, react_jsx_runtime.jsxs)("button", {
													className: GardenSpace_module_css_default.dangerButton,
													type: "button",
													disabled: pending,
													onClick: () => {
														mutate(async () => await onRejectPrincipleProposal(item), "philosophy.notice.rejected");
													},
													children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseOutline16, {}), t("philosophy.reject")]
												})]
											})
										]
									}, String(item.id)))
								})]
							}),
							(0, react_jsx_runtime.jsxs)("section", {
								className: `${PhilosophySpace_module_css_default.section} ${PhilosophySpace_module_css_default.principleSection}`,
								"aria-labelledby": "garden-principles",
								children: [(0, react_jsx_runtime.jsxs)("div", {
									className: PhilosophySpace_module_css_default.sectionHeader,
									children: [(0, react_jsx_runtime.jsx)("span", { children: (0, react_jsx_runtime.jsx)(PhilosophyIcon, { size: 17 }) }), (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("h2", {
										id: "garden-principles",
										children: t("philosophy.principles")
									}), (0, react_jsx_runtime.jsx)("p", { children: t("philosophy.principlesHint") })] })]
								}), principles.length === 0 ? (0, react_jsx_runtime.jsx)("p", {
									className: PhilosophySpace_module_css_default.empty,
									children: t("philosophy.emptyPrinciples")
								}) : (0, react_jsx_runtime.jsx)("ol", {
									className: PhilosophySpace_module_css_default.principles,
									children: principles.map((item, index) => (0, react_jsx_runtime.jsxs)("li", {
										className: PhilosophySpace_module_css_default.principle,
										"data-status": item.status,
										children: [(0, react_jsx_runtime.jsx)("span", {
											className: PhilosophySpace_module_css_default.folioNumber,
											children: String(index + 1).padStart(2, "0")
										}), (0, react_jsx_runtime.jsxs)("article", { children: [
											(0, react_jsx_runtime.jsxs)("header", { children: [(0, react_jsx_runtime.jsx)("h3", { children: item.current.expression }), (0, react_jsx_runtime.jsx)("select", {
												className: PhilosophySpace_module_css_default.statusSelect,
												"aria-label": t("philosophy.statusFor").replace("{principle}", item.current.expression),
												value: item.status,
												disabled: pending,
												onChange: (event) => {
													reviseStatus(item, event.target.value);
												},
												children: PRINCIPLE_STATUSES.map((status) => (0, react_jsx_runtime.jsx)("option", {
													value: status,
													children: t(`philosophy.principle.${status}`)
												}, status))
											})] }),
											(0, react_jsx_runtime.jsxs)("dl", {
												className: PhilosophySpace_module_css_default.meaning,
												children: [
													(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("philosophy.formation") }), (0, react_jsx_runtime.jsx)("dd", { children: item.current.formationContext })] }),
													(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("philosophy.quote") }), (0, react_jsx_runtime.jsx)("dd", { children: item.current.userQuote })] }),
													(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("philosophy.counterexample") }), (0, react_jsx_runtime.jsx)("dd", { children: item.current.counterexample })] })
												]
											}),
											(0, react_jsx_runtime.jsx)("ul", {
												className: PhilosophySpace_module_css_default.tags,
												"aria-label": t("philosophy.appliesTo"),
												children: item.current.appliesTo.map((scope) => (0, react_jsx_runtime.jsx)("li", { children: scope }, scope))
											}),
											(0, react_jsx_runtime.jsxs)("details", {
												className: PhilosophySpace_module_css_default.versions,
												children: [(0, react_jsx_runtime.jsx)("summary", { children: t("philosophy.versionCount").replace("{count}", String(item.versions.length)) }), (0, react_jsx_runtime.jsx)("ol", { children: item.versions.map((version) => (0, react_jsx_runtime.jsxs)("li", { children: [(0, react_jsx_runtime.jsx)("time", { children: version.stamp.localDate }), (0, react_jsx_runtime.jsx)("p", { children: version.content.expression })] }, version.number)) })]
											}),
											(0, react_jsx_runtime.jsx)("footer", { children: (0, react_jsx_runtime.jsxs)("button", {
												className: GardenSpace_module_css_default.quietButton,
												type: "button",
												onClick: () => {
													draftPrinciple(item);
												},
												children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSendOutline14, {}), t("philosophy.continue")]
											}) })
										] })]
									}, String(item.id)))
								})]
							})
						]
					})
				]
			});
		}
		//#endregion
		//#region \0dsh-css:E:\test code\deepseekharness_modified\deepseek-harness\packages\client\ui-mind-garden\src\client\spaces\MemoryGovernance.module.css.mjs
		const css$5 = ".VK5vBa_governance{--archive-ink:var(--dsw-alias-label-primary);--archive-green:var(--dsw-alias-state-business-primary);--archive-green-soft:color-mix(in srgb, var(--dsw-alias-label-primary) 82%, var(--dsw-alias-state-business-primary));--archive-paper:color-mix(in srgb, var(--dsw-alias-bg-base) 95%, var(--dsw-alias-state-warn-secondary));--archive-brass:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 74%, #9b713b);--archive-oxblood:color-mix(in srgb, var(--dsw-alias-state-error-primary) 56%, var(--dsw-alias-label-primary));--archive-line:color-mix(in srgb, var(--archive-brass) 21%, var(--dsw-alias-border-l2));gap:26px;width:min(100%,1180px);margin:22px auto 0;display:grid;container:VK5vBa_memory-governance/inline-size}.VK5vBa_header{isolation:isolate;border:1px solid color-mix(in srgb, var(--archive-brass) 33%, transparent);color:var(--archive-ink);background:radial-gradient(circle at 82% 34%, color-mix(in srgb, var(--dsw-alias-state-business-secondary) 42%, transparent), transparent 25%), linear-gradient(128deg, #fffdf8cc, #e7d7c0d1), var(--mg-limestone-texture);background-size:auto,auto,560px;border-radius:11px;grid-template-columns:minmax(0,1.35fr) minmax(280px,.65fr);gap:clamp(28px,5vw,68px);padding:clamp(28px,4.5vw,54px);display:grid;position:relative;overflow:hidden;box-shadow:inset 0 1px #ffffff9e,0 28px 72px #4c37241c}.VK5vBa_header:before,.VK5vBa_header:after{z-index:-1;content:\"\";position:absolute}.VK5vBa_header:before{border:1px solid color-mix(in srgb, var(--archive-brass) 14%, transparent);pointer-events:none;border-radius:7px;inset:18px}.VK5vBa_header:after{border:1px solid color-mix(in srgb, var(--archive-brass) 22%, transparent);border-radius:50%;width:290px;height:290px;top:-86px;right:4%;box-shadow:0 0 0 34px #e2ca8b0b,0 0 0 72px #e2ca8b07}.VK5vBa_header>div:first-child{align-self:center;max-width:720px}.VK5vBa_header>div:first-child>span{color:var(--archive-brass);letter-spacing:.14em;align-items:center;gap:8px;font-size:9px;font-weight:680;display:inline-flex}.VK5vBa_header h2{max-width:17ch;color:var(--archive-ink);letter-spacing:-.045em;text-wrap:balance;margin:12px 0 13px;font-family:Mind Garden Display,Noto Serif SC,Songti SC,serif;font-size:clamp(28px,5vw,44px);font-weight:540;line-height:1.07}.VK5vBa_counters{z-index:1;align-self:end;display:grid;position:relative}.VK5vBa_counters span{color:var(--dsw-alias-label-secondary);grid-template-columns:48px minmax(0,1fr);align-items:baseline;gap:12px;padding:13px 2px;font-size:10px;display:grid}.VK5vBa_counters strong{color:var(--archive-green);font-variant-numeric:tabular-nums;font-family:Mind Garden Display,Noto Serif SC,Songti SC,serif;font-size:22px;font-weight:540}.VK5vBa_auditStrip{border-block:1px solid var(--archive-line);background:color-mix(in srgb, var(--archive-paper) 74%, transparent);grid-template-columns:minmax(0,1fr) minmax(0,1fr) auto;align-items:center;gap:0;display:grid;overflow:hidden}.VK5vBa_auditStrip>div{border-right:1px solid var(--archive-line);grid-template-columns:36px minmax(0,1fr);align-items:center;gap:12px;min-width:0;padding:17px 20px;display:grid}.VK5vBa_auditStrip>div>svg{color:color-mix(in srgb, var(--archive-green-soft) 74%, var(--dsw-alias-label-primary))}.VK5vBa_auditStrip p{color:var(--dsw-alias-label-secondary);gap:3px;margin:0;font-size:11px;line-height:1.5;display:grid}.VK5vBa_auditStrip strong{color:var(--archive-ink);font-size:12px}.VK5vBa_auditStrip>button{margin-inline:18px}.VK5vBa_automation,.VK5vBa_proposal{border:1px solid var(--archive-line);border-radius:9px;gap:18px 24px;padding:clamp(22px,3vw,32px);display:grid}.VK5vBa_automation{background:linear-gradient(105deg, color-mix(in srgb, var(--archive-green-soft) 6%, transparent), transparent 48%), color-mix(in srgb, var(--archive-paper) 86%, var(--dsw-alias-bg-layer-1));grid-template-columns:minmax(0,1fr) auto}.VK5vBa_automationLead{align-items:flex-start;gap:13px;display:flex}.VK5vBa_automationLead>svg{color:color-mix(in srgb, var(--archive-green-soft) 76%, var(--dsw-alias-label-primary));flex:none;margin-top:2px}.VK5vBa_automationLead h3,.VK5vBa_sectionHeading h3{color:var(--archive-ink);letter-spacing:-.02em;margin:0;font-family:Mind Garden Display,Noto Serif SC,Songti SC,serif;font-size:19px;font-weight:550}.VK5vBa_automationLead p,.VK5vBa_sectionHeading p{color:var(--dsw-alias-label-secondary);margin:6px 0 0;font-size:11px;line-height:1.65}.VK5vBa_automationToggle{cursor:pointer;align-self:start;align-items:center;gap:9px;display:flex;position:relative}.VK5vBa_automationToggle input{opacity:0;width:1px;height:1px;position:absolute}.VK5vBa_automationToggle>span{border:1px solid var(--archive-line);background:color-mix(in srgb, var(--dsw-alias-label-secondary) 15%, var(--archive-paper));border-radius:999px;width:42px;height:24px;transition:background .18s,border-color .18s;position:relative}.VK5vBa_automationToggle>span:after{background:var(--dsw-alias-label-tertiary);content:\"\";border-radius:50%;width:16px;height:16px;transition:background .18s,transform .18s;position:absolute;top:3px;left:3px}.VK5vBa_automationToggle input:checked+span{border-color:color-mix(in srgb, var(--archive-green-soft) 48%, var(--archive-line));background:color-mix(in srgb, var(--archive-green-soft) 20%, var(--archive-paper))}.VK5vBa_automationToggle input:checked+span:after{background:var(--archive-green-soft);transform:translate(18px)}.VK5vBa_automationToggle input:focus-visible+span{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px}.VK5vBa_automationToggle input:disabled~*{cursor:default;opacity:.5}.VK5vBa_automationToggle strong{color:var(--archive-ink);font-size:11px}.VK5vBa_automationControls{grid-column:1/-1;grid-template-columns:minmax(210px,.65fr) minmax(0,1fr);align-items:end;gap:24px;padding-top:4px;display:grid}.VK5vBa_automationControls label,.VK5vBa_proposalGrid label,.VK5vBa_reviewPanel label{color:var(--dsw-alias-label-secondary);gap:7px;font-size:11px;display:grid}.VK5vBa_automationControls select,.VK5vBa_proposalGrid input,.VK5vBa_proposalGrid select,.VK5vBa_proposalGrid textarea,.VK5vBa_reviewPanel input,.VK5vBa_reviewPanel select,.VK5vBa_reviewPanel textarea{border:1px solid var(--archive-line);min-width:0;color:var(--archive-ink);background:color-mix(in srgb, var(--archive-paper) 82%, var(--dsw-alias-bg-base));font:inherit;border-radius:8px;outline:0;padding:10px 11px}.VK5vBa_automationControls :is(select,input):focus-visible,.VK5vBa_proposalGrid :is(input,select,textarea):focus-visible,.VK5vBa_reviewPanel :is(input,select,textarea):focus-visible{border-color:var(--dsw-alias-state-business-primary);outline:2px solid color-mix(in srgb, var(--dsw-alias-state-business-primary) 24%, transparent);outline-offset:1px}.VK5vBa_automationStatus{grid-template-columns:auto 1fr auto;align-items:baseline;gap:10px;min-height:38px;padding:9px 0;display:grid}.VK5vBa_automationStatus span,.VK5vBa_automationStatus small{color:var(--dsw-alias-label-tertiary);font-size:10px}.VK5vBa_automationStatus strong{color:var(--archive-ink);font-size:11px}.VK5vBa_automationDisclosure{color:var(--dsw-alias-label-secondary);grid-column:1/-1;gap:5px;margin:0;padding:14px 0 0;font-size:10px;line-height:1.6;list-style:none;display:grid}.VK5vBa_automationDisclosure li:before{color:var(--archive-brass);content:\"·\";margin-right:7px}.VK5vBa_proposal{background:linear-gradient(90deg, color-mix(in srgb, var(--archive-brass) 5%, transparent), transparent 45%), color-mix(in srgb, var(--archive-paper) 88%, var(--dsw-alias-bg-base))}.VK5vBa_sectionHeading{justify-content:space-between;align-items:end;gap:28px;display:flex}.VK5vBa_sectionHeading>div>svg{color:color-mix(in srgb, var(--archive-green-soft) 76%, var(--dsw-alias-label-primary));flex:none}.VK5vBa_sectionHeading p{text-align:right;max-width:52ch;margin:0}.VK5vBa_proposalGrid{grid-template-columns:repeat(2,minmax(0,1fr));gap:13px 16px;display:grid}.VK5vBa_proposalGrid .VK5vBa_wide{grid-column:1/-1}.VK5vBa_proposalGrid textarea,.VK5vBa_reviewPanel textarea{resize:vertical;min-height:92px;line-height:1.6}.VK5vBa_formFooter{color:var(--dsw-alias-label-secondary);justify-content:space-between;align-items:center;gap:18px;padding-top:2px;font-size:10px;display:flex}.VK5vBa_section{gap:17px;padding-top:22px;display:grid}.VK5vBa_cardList{gap:0;display:grid}.VK5vBa_memoryCard{background:0 0;border:0;gap:14px;padding:22px 0 24px 22px;display:grid;position:relative;overflow:hidden}.VK5vBa_memoryCard:before{background:linear-gradient(var(--archive-brass), var(--archive-green-soft));content:\"\";border-radius:2px;width:3px;height:38px;position:absolute;inset:22px auto auto 0}.VK5vBa_memoryCard[data-relationship=pending]:before{background:var(--dsw-alias-state-warn-primary);box-shadow:0 0 14px color-mix(in srgb, var(--dsw-alias-state-warn-primary) 32%, transparent)}.VK5vBa_summary{gap:9px;display:grid}.VK5vBa_meta{flex-wrap:wrap;align-items:center;gap:7px;display:flex}.VK5vBa_meta span,.VK5vBa_recallBadge{color:color-mix(in srgb, var(--archive-green-soft) 74%, var(--dsw-alias-label-secondary));letter-spacing:.06em;font-size:9px;font-weight:650}.VK5vBa_meta span+span:before{color:var(--archive-line);content:\"/\";margin-right:7px}.VK5vBa_meta time{color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums;margin-left:auto;font-size:9px}.VK5vBa_summary>p{max-width:76ch;color:var(--archive-ink);white-space:pre-wrap;margin:0;font-family:Mind Garden Display,Noto Serif SC,Songti SC,serif;font-size:clamp(17px,1.8vw,21px);font-weight:520;line-height:1.62}.VK5vBa_summary>small{color:var(--dsw-alias-label-secondary);line-height:1.6}.VK5vBa_summary>blockquote,.VK5vBa_sources blockquote{border-left:2px solid var(--archive-line);color:var(--dsw-alias-label-secondary);margin:0;padding-left:11px;line-height:1.6}.VK5vBa_recallBadge{justify-self:start;padding-top:2px}.VK5vBa_conflict{border-left:2px solid var(--dsw-alias-state-warn-primary);background:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 6%, transparent);gap:11px;padding:15px 16px;display:grid}.VK5vBa_conflict>strong{color:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 78%, var(--archive-ink));font-size:11px}.VK5vBa_conflict>p{color:var(--dsw-alias-label-secondary);margin:0;font-size:11px}.VK5vBa_conflict>div{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;display:grid}.VK5vBa_conflict blockquote{border:1px solid color-mix(in srgb, var(--dsw-alias-state-warn-primary) 18%, var(--archive-line));background:color-mix(in srgb, var(--archive-paper) 74%, transparent);border-radius:7px;margin:0;padding:12px 13px;line-height:1.55}.VK5vBa_conflict small{color:var(--dsw-alias-label-tertiary);margin-bottom:6px;font-size:9px;display:block}.VK5vBa_actions,.VK5vBa_decisionActions{flex-wrap:wrap;justify-content:flex-end;gap:8px;display:flex}.VK5vBa_actions button,.VK5vBa_decisionActions button{border:1px solid var(--archive-line);min-height:34px;color:var(--archive-ink);font:inherit;cursor:pointer;background:0 0;border-radius:7px;align-items:center;gap:6px;padding:6px 10px;font-size:10px;display:inline-flex}.VK5vBa_actions button:hover,.VK5vBa_decisionActions button:hover{border-color:color-mix(in srgb, var(--archive-green-soft) 42%, var(--archive-line));background:color-mix(in srgb, var(--archive-green-soft) 5%, transparent)}.VK5vBa_actions button:focus-visible,.VK5vBa_decisionActions button:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px}.VK5vBa_actions button:disabled,.VK5vBa_decisionActions button:disabled{cursor:default;opacity:.45}.VK5vBa_reviewPanel{border:1px solid color-mix(in srgb, var(--archive-green-soft) 24%, var(--archive-line));background:color-mix(in srgb, var(--archive-green-soft) 4%, var(--archive-paper));border-radius:8px;gap:12px;padding:17px 18px;display:grid}.VK5vBa_policyRow{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;display:grid}.VK5vBa_sources{border-top:1px solid var(--archive-line);color:var(--dsw-alias-label-secondary);padding-top:9px;font-size:10px}.VK5vBa_sources summary,.VK5vBa_archive>summary{cursor:pointer;width:max-content}.VK5vBa_sources>div{gap:5px;padding:10px 0 0 11px;display:grid}.VK5vBa_revisions{border-top:1px solid var(--archive-line);gap:0;padding-top:6px;display:grid}.VK5vBa_revisions>p{color:var(--dsw-alias-label-secondary);margin:0;font-size:10px}.VK5vBa_revisions article{border-bottom:1px solid var(--archive-line);background:0 0;gap:6px;padding:11px 0;display:grid}.VK5vBa_revisions article>div{color:var(--dsw-alias-label-secondary);justify-content:space-between;font-size:9px;display:flex}.VK5vBa_revisions p{color:var(--archive-ink);margin:0;font-size:11px}.VK5vBa_revisions small{color:var(--dsw-alias-label-tertiary)}.VK5vBa_archive{border-top:1px solid var(--archive-line);color:var(--dsw-alias-label-secondary);padding-top:16px;font-size:11px}.VK5vBa_archive>div{margin-top:13px}@container VK5vBa_memory-governance (width<=860px){.VK5vBa_header,.VK5vBa_automation{grid-template-columns:1fr}.VK5vBa_counters{grid-template-columns:repeat(3,minmax(0,1fr))}.VK5vBa_counters span{border-right:1px solid color-mix(in srgb, var(--archive-brass) 14%, transparent);border-bottom:0;grid-template-columns:1fr}.VK5vBa_auditStrip{grid-template-columns:1fr}.VK5vBa_auditStrip>div{border-right:0;border-bottom:1px solid var(--archive-line)}.VK5vBa_auditStrip>button{justify-self:start;margin-block:14px}.VK5vBa_automationToggle{justify-self:start}}@container VK5vBa_memory-governance (width<=620px){.VK5vBa_header{padding:25px 22px}.VK5vBa_counters,.VK5vBa_automationControls,.VK5vBa_proposalGrid,.VK5vBa_policyRow,.VK5vBa_conflict>div{grid-template-columns:1fr}.VK5vBa_counters span{border-right:0;grid-template-columns:42px 1fr}.VK5vBa_proposalGrid .VK5vBa_wide{grid-column:auto}.VK5vBa_sectionHeading,.VK5vBa_formFooter{flex-direction:column;align-items:stretch}.VK5vBa_sectionHeading p{text-align:left}.VK5vBa_memoryCard{padding-left:16px}.VK5vBa_meta time{width:100%;margin-left:0}}@media (prefers-reduced-motion:reduce){.VK5vBa_automationToggle>span,.VK5vBa_automationToggle>span:after{transition:none}}.VK5vBa_governance{--archive-paper:#fbf3e7;--archive-ink:var(--mg-ink,#342d27);--archive-muted:var(--mg-muted,#76695e);--archive-brass:var(--mg-brass,#a77d43);--archive-indigo:var(--mg-indigo,#405f87);--archive-line:#533e2d24;width:100%;color:var(--archive-ink);font-family:var(--mg-font-ui,\"Noto Sans SC\", sans-serif);background:0 0;padding:0 0 78px;display:block}.VK5vBa_header{background:var(--mg-memory-scene) center / cover no-repeat;isolation:isolate;grid-template-columns:minmax(300px,.64fr) minmax(500px,1.36fr);align-items:center;min-height:clamp(530px,54vw,670px);margin:0 0 54px;padding:clamp(50px,7vw,92px);display:grid;position:relative;overflow:hidden;box-shadow:0 28px 72px #46311f24}.VK5vBa_header:before{z-index:-1;content:\"\";background:linear-gradient(90deg,#fffbf4fa 0 29%,#fffbf4c7 43%,#0000 65%);position:absolute;inset:0}.VK5vBa_header>div:first-child{z-index:1;max-width:430px;position:relative}.VK5vBa_header .VK5vBa_kicker{max-width:34ch;color:var(--archive-brass);letter-spacing:.06em;margin-block-end:14px;font-size:10px;font-weight:650;line-height:1.65;display:block}.VK5vBa_header h1{max-width:12ch;color:var(--archive-ink);font-family:var(--mg-font-reflection,\"Mind Garden Display\", \"Noto Serif SC\", serif);letter-spacing:-.035em;text-wrap:balance;margin:0;font-size:clamp(39px,4vw,52px);font-weight:560;line-height:1.08}.VK5vBa_header p{max-width:34ch;color:var(--archive-muted);margin:20px 0 0;font-size:13px;line-height:1.8}.VK5vBa_counters{z-index:2;background:#fffbf4d1;gap:0;display:flex;position:absolute;inset:auto auto clamp(38px,5vw,70px) clamp(50px,7vw,92px);box-shadow:7px 14px 30px #44301f21}.VK5vBa_counters span{border:0;border-inline-start:1px solid var(--archive-line);min-width:116px;color:var(--archive-muted);grid-template-columns:auto;gap:2px;padding:12px 16px;font-size:10px;display:grid}.VK5vBa_counters span:first-child{border-inline-start:0}.VK5vBa_counters strong{color:var(--archive-ink);font-family:var(--mg-font-reflection);font-size:22px;font-weight:560}.VK5vBa_governance>.VK5vBa_auditStrip,.VK5vBa_governance>.VK5vBa_automation,.VK5vBa_governance>.VK5vBa_proposal,.VK5vBa_governance>.VK5vBa_section,.VK5vBa_governance>.VK5vBa_archive,.VK5vBa_governance>[role=status],.VK5vBa_governance>[role=alert]{width:min(1160px,100% - 56px);margin-inline:auto}.VK5vBa_auditStrip{border-block:1px solid var(--archive-line);background:#fffbf470;grid-template-columns:1fr 1fr auto;align-items:stretch;margin-block-end:26px;display:grid}.VK5vBa_auditStrip>div{border-inline-end:1px solid var(--archive-line);min-height:76px;padding:17px 20px}.VK5vBa_auditStrip>div svg{color:var(--archive-indigo)}.VK5vBa_auditStrip p{line-height:1.5}.VK5vBa_auditStrip p strong{color:var(--archive-ink)}.VK5vBa_auditStrip>button{align-self:center;margin-inline:16px}.VK5vBa_automation{border-block:1px solid var(--archive-line);background:0 0;grid-template-columns:minmax(220px,.8fr) auto minmax(300px,1.2fr);align-items:center;gap:20px 30px;margin-block-end:36px;padding:24px 0;display:grid}.VK5vBa_automationLead{padding-inline-start:2px}.VK5vBa_automationLead h3{color:var(--archive-ink);font-size:16px}.VK5vBa_automationLead p{color:var(--archive-muted);margin-block-start:4px}.VK5vBa_automationToggle{justify-self:center}.VK5vBa_automationControls{grid-template-columns:1fr 1fr}.VK5vBa_automationDisclosure{border-block-start:1px solid var(--archive-line);color:var(--archive-muted);flex-wrap:wrap;grid-column:1/-1;gap:7px 20px;margin:0;padding:12px 0 0;font-size:10px;display:flex}.VK5vBa_automationDisclosure li{margin-inline-start:16px}.VK5vBa_proposal{color:#fffaf2;background:#3d5779;border:0;border-radius:14px;grid-template-columns:minmax(210px,.5fr) minmax(0,1.5fr);gap:24px 36px;margin-block-end:58px;padding:30px 34px;display:grid;box-shadow:9px 18px 42px #304c702e}.VK5vBa_proposal .VK5vBa_sectionHeading{margin:0;display:block}.VK5vBa_proposal .VK5vBa_sectionHeading>div{align-items:center}.VK5vBa_proposal .VK5vBa_sectionHeading svg{color:#d8b277}.VK5vBa_proposal .VK5vBa_sectionHeading h3{color:#fffaf2;font-family:var(--mg-font-reflection);font-size:24px;font-weight:560}.VK5vBa_proposal .VK5vBa_sectionHeading p{color:#fffaf2ad;text-align:start;margin:12px 0 0}.VK5vBa_proposalGrid{grid-area:1/2/span 2}.VK5vBa_proposalGrid label{color:#fffaf2b8}.VK5vBa_proposalGrid input,.VK5vBa_proposalGrid select,.VK5vBa_proposalGrid textarea{color:#fffaf2;background:#1c304a6b;border-color:#fffaf233}.VK5vBa_proposal .VK5vBa_formFooter{color:#fffaf29e;flex-direction:column;grid-column:1;align-self:end;align-items:stretch}.VK5vBa_proposal .VK5vBa_formFooter button{width:100%;color:var(--archive-indigo);background:#fff7eb}.VK5vBa_section{background:0 0;margin-block-end:62px;padding:0}.VK5vBa_sectionHeading{border-block-end:1px solid var(--archive-line);justify-content:space-between;align-items:end;gap:24px;margin-block-end:24px;padding-block-end:15px;display:flex}.VK5vBa_sectionHeading>div{align-items:center;gap:9px;display:flex}.VK5vBa_sectionHeading h3{color:var(--archive-ink);font-family:var(--mg-font-reflection);letter-spacing:-.025em;margin:0;font-size:28px;font-weight:560}.VK5vBa_sectionHeading p{max-width:42ch;color:var(--archive-muted);text-align:end;margin:0;font-size:11px;line-height:1.6}.VK5vBa_cardList{grid-template-columns:repeat(2,minmax(0,1fr));gap:18px 24px;display:grid}.VK5vBa_memoryCard{border:1px solid var(--archive-line);background:linear-gradient(135deg, #fffdf8f0, #f5eadad6), var(--mg-xuan-texture);background-size:auto,440px;border-radius:10px 14px 11px 13px;min-width:0;padding:22px;box-shadow:6px 12px 28px #46311f17}.VK5vBa_summary>p{color:var(--archive-ink);font-family:var(--mg-font-reflection);font-size:17px;line-height:1.72}.VK5vBa_summary>small,.VK5vBa_meta{color:var(--archive-muted)}.VK5vBa_recallBadge{color:var(--archive-indigo);background:#405f8712;border-color:#405f872e}.VK5vBa_actions{border-block-start-color:var(--archive-line)}.VK5vBa_actions button{color:var(--archive-indigo);background:#405f8712;border-color:#0000}.VK5vBa_reviewPanel{background:#fffbf49e;border-color:#405f872b}.VK5vBa_archive{border-block-start:1px solid var(--archive-line);padding-block-start:20px}.VK5vBa_archive>summary{color:var(--archive-indigo);cursor:pointer;font-weight:650}@container VK5vBa_memory-governance (width<=860px){.VK5vBa_header{background-position:64%;grid-template-columns:1fr;align-items:start;min-height:760px;padding:48px 34px}.VK5vBa_header:before{background:linear-gradient(#fffbf4f7 0 32%,#fffbf46e 58%,#0000 76%)}.VK5vBa_counters{inset:auto 34px 30px}.VK5vBa_automation{grid-template-columns:1fr 1fr}.VK5vBa_automationLead{grid-column:1/-1}.VK5vBa_proposal{grid-template-columns:1fr}.VK5vBa_proposalGrid,.VK5vBa_proposal .VK5vBa_formFooter{grid-area:auto/1}}@container VK5vBa_memory-governance (width<=620px){.VK5vBa_header{background-position:70%;min-height:820px;padding:34px 20px}.VK5vBa_header>div:first-child{align-self:start}.VK5vBa_header:before{background:linear-gradient(#fffbf4fa 0 38%,#fffbf475 60%,#0000 79%)}.VK5vBa_header h1{font-size:40px}.VK5vBa_counters{width:calc(100% - 28px);inset:auto 14px 18px;overflow-x:auto}.VK5vBa_counters span{min-width:104px}.VK5vBa_governance>.VK5vBa_auditStrip,.VK5vBa_governance>.VK5vBa_automation,.VK5vBa_governance>.VK5vBa_proposal,.VK5vBa_governance>.VK5vBa_section,.VK5vBa_governance>.VK5vBa_archive,.VK5vBa_governance>[role=status],.VK5vBa_governance>[role=alert]{width:calc(100% - 28px)}.VK5vBa_automation,.VK5vBa_automationControls,.VK5vBa_cardList{grid-template-columns:1fr}.VK5vBa_proposal{padding:24px 18px}.VK5vBa_sectionHeading{flex-direction:column;align-items:stretch}.VK5vBa_sectionHeading p{text-align:start}.VK5vBa_memoryCard{padding:18px}}.VK5vBa_header{background-position:58%;border-radius:18px;grid-template-columns:minmax(300px,.7fr) minmax(520px,1.3fr);min-height:clamp(360px,34vw,420px);margin-block-end:34px;padding:clamp(38px,4.8vw,62px);box-shadow:0 26px 68px #44301f21}.VK5vBa_header:before{background:linear-gradient(90deg,#fffbf4fa 0 30%,#fffbf4ba 44%,#0000 65%)}.VK5vBa_header>div:first-child{max-width:390px}.VK5vBa_header .VK5vBa_kicker{display:none}.VK5vBa_header h1{letter-spacing:-.03em;max-width:11ch;font-size:clamp(34px,3.2vw,43px);line-height:1.11}.VK5vBa_header p{-webkit-line-clamp:3;-webkit-box-orient:vertical;max-width:32ch;margin-block-start:14px;font-size:12px;line-height:1.7;display:-webkit-box;overflow:hidden}.VK5vBa_counters{background:#fffbf4a8;border:0;border-radius:12px;inset:auto clamp(38px,4.8vw,62px) clamp(30px,3.5vw,42px) auto;box-shadow:0 12px 32px #44301f14}.VK5vBa_counters span{min-width:104px;padding:10px 13px}.VK5vBa_counters strong{font-size:19px}.VK5vBa_governance>.VK5vBa_auditStrip,.VK5vBa_governance>.VK5vBa_automation,.VK5vBa_governance>.VK5vBa_proposal,.VK5vBa_governance>.VK5vBa_section,.VK5vBa_governance>.VK5vBa_archive,.VK5vBa_governance>[role=status],.VK5vBa_governance>[role=alert]{width:min(1120px,100% - 48px)}.VK5vBa_auditStrip{margin-block-end:20px}.VK5vBa_auditStrip>div{min-height:68px;padding:14px 16px}.VK5vBa_auditStrip>div>svg{flex:0 0 16px;width:16px;height:16px;display:block}.VK5vBa_auditStrip>button{min-height:40px}.VK5vBa_automation{margin-block-end:30px;padding:20px 0}.VK5vBa_automationLead>svg{flex:0 0 18px;width:18px;height:18px;display:block}.VK5vBa_proposal{margin-block-end:46px;padding:26px 30px}.VK5vBa_section{margin-block-end:48px}.VK5vBa_sectionHeading{border-block-end:0;margin-block-end:18px;padding-block-end:4px}.VK5vBa_sectionHeading h3{font-size:25px}.VK5vBa_sectionHeading svg{flex:0 0 17px;width:17px;height:17px;display:block}.VK5vBa_memoryCard{border:0;padding:20px;box-shadow:0 14px 36px #44301f14}.VK5vBa_actions button{min-height:38px}.VK5vBa_actions button>svg{flex:0 0 15px;width:15px;height:15px;display:block}@container VK5vBa_memory-governance (width<=820px){.VK5vBa_header{background-position:62%;grid-template-columns:1fr;align-items:start;min-height:460px;padding:32px 28px}.VK5vBa_header:before{background:linear-gradient(#fffbf4f7 0 35%,#fffbf44d 60%,#0000 78%)}.VK5vBa_counters{inset:auto 28px 24px}.VK5vBa_automation{grid-template-columns:1fr 1fr}.VK5vBa_automationLead{grid-column:1/-1}.VK5vBa_proposal{grid-template-columns:1fr}.VK5vBa_proposalGrid,.VK5vBa_proposal .VK5vBa_formFooter{grid-area:auto/1}}@container VK5vBa_memory-governance (width<=620px){.VK5vBa_header{background-position:67% 60%;border-radius:0 0 18px 18px;min-height:390px;padding:26px 18px 18px}.VK5vBa_header:before{background:linear-gradient(#fffbf4fa 0 41%,#fffbf438 66%,#fffbf4a6 100%)}.VK5vBa_header h1{max-width:12ch;font-size:clamp(31px,10vw,37px)}.VK5vBa_header p{-webkit-line-clamp:2;margin-block-start:10px}.VK5vBa_counters{width:calc(100% - 24px);inset:auto 12px 12px;overflow:visible}.VK5vBa_counters span{flex:1;min-width:0;padding:9px 8px}.VK5vBa_counters strong{font-size:17px}.VK5vBa_governance>.VK5vBa_auditStrip,.VK5vBa_governance>.VK5vBa_automation,.VK5vBa_governance>.VK5vBa_proposal,.VK5vBa_governance>.VK5vBa_section,.VK5vBa_governance>.VK5vBa_archive,.VK5vBa_governance>[role=status],.VK5vBa_governance>[role=alert]{width:calc(100% - 24px)}.VK5vBa_auditStrip{grid-template-columns:1fr}.VK5vBa_auditStrip>div{border-inline-end:0;border-block-end:1px solid var(--archive-line);min-height:0}.VK5vBa_auditStrip>button{width:calc(100% - 24px);margin:12px}.VK5vBa_automation,.VK5vBa_automationControls,.VK5vBa_cardList{grid-template-columns:1fr}.VK5vBa_proposal{padding:22px 16px}.VK5vBa_sectionHeading{flex-direction:column;align-items:stretch;gap:8px}.VK5vBa_sectionHeading p{text-align:start}.VK5vBa_memoryCard{padding:17px}.VK5vBa_actions button{min-height:42px}}.VK5vBa_sources,.VK5vBa_revisions,.VK5vBa_archive,.VK5vBa_revisions article{border-top:0;border-bottom:0}.VK5vBa_revisions{gap:7px}.VK5vBa_revisions article{background:#fffcf694;border-radius:9px;padding:11px 12px}";
		const tagId$5 = "@deepseek-ai/dsh-mind-garden/MemoryGovernance.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$5) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-mind-garden";
			tag.dataset.pluginCss = tagId$5;
			tag.textContent = css$5;
			document.head.appendChild(tag);
		}
		var MemoryGovernance_module_css_default = {
			"actions": "VK5vBa_actions",
			"archive": "VK5vBa_archive",
			"auditStrip": "VK5vBa_auditStrip",
			"automation": "VK5vBa_automation",
			"automationControls": "VK5vBa_automationControls",
			"automationDisclosure": "VK5vBa_automationDisclosure",
			"automationLead": "VK5vBa_automationLead",
			"automationStatus": "VK5vBa_automationStatus",
			"automationToggle": "VK5vBa_automationToggle",
			"cardList": "VK5vBa_cardList",
			"conflict": "VK5vBa_conflict",
			"counters": "VK5vBa_counters",
			"decisionActions": "VK5vBa_decisionActions",
			"formFooter": "VK5vBa_formFooter",
			"governance": "VK5vBa_governance",
			"header": "VK5vBa_header",
			"kicker": "VK5vBa_kicker",
			"memory-governance": "VK5vBa_memory-governance",
			"memoryCard": "VK5vBa_memoryCard",
			"meta": "VK5vBa_meta",
			"policyRow": "VK5vBa_policyRow",
			"proposal": "VK5vBa_proposal",
			"proposalGrid": "VK5vBa_proposalGrid",
			"recallBadge": "VK5vBa_recallBadge",
			"reviewPanel": "VK5vBa_reviewPanel",
			"revisions": "VK5vBa_revisions",
			"section": "VK5vBa_section",
			"sectionHeading": "VK5vBa_sectionHeading",
			"sources": "VK5vBa_sources",
			"summary": "VK5vBa_summary",
			"wide": "VK5vBa_wide"
		};
		//#endregion
		//#region lib/types/client/spaces/MemoryGovernance.js
		/** User-authoritative review and lifecycle controls for governed memory. */
		const KINDS = [
			"fact",
			"preference",
			"value",
			"support-preference",
			"decision",
			"emotion",
			"episode"
		];
		const POLICIES = [
			"never",
			"relevant",
			"always"
		];
		const AUTOMATION_INTERVALS = [
			1,
			3,
			5
		];
		const emptyDraft = {
			kind: "fact",
			sensitivity: "normal",
			content: "",
			reason: "",
			scope: ""
		};
		function dateOf(value) {
			return new Date(value).toISOString().slice(0, 10);
		}
		function temporaryDays(value) {
			const parsed = Number(value);
			return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : void 0;
		}
		function errorKey$2(code) {
			if (code === "version-conflict" || code === "relationship-stale" || code === "automation-version-conflict") return "governance.error.stale";
			if (code === "high-sensitivity-recall-forbidden") return "governance.error.sensitive";
			if (code.startsWith("extraction-")) return "governance.error.extraction";
			return "governance.error.generic";
		}
		/** Render candidate review, conflict decisions, active memory, provenance, and audit. */
		function MemoryGovernance({ onListMemories, onProposeMemory, onConfirmMemory, onUpdateMemory, onRejectMemory, onResolveMemoryRelationship, onListMemoryRevisions, onExtractMemories, onLatestMemoryExtraction, onMemoryAutomationPolicy, onSetMemoryAutomationPolicy, onDeleteMemory, onLatestMemoryAudit, onDraftConversation = () => void 0, t }) {
			const [items, setItems] = (0, react.useState)([]);
			const [extraction, setExtraction] = (0, react.useState)(null);
			const [automation, setAutomation] = (0, react.useState)(null);
			const [audit, setAudit] = (0, react.useState)(null);
			const [draft, setDraft] = (0, react.useState)(emptyDraft);
			const [reviewing, setReviewing] = (0, react.useState)(null);
			const [reviewContent, setReviewContent] = (0, react.useState)("");
			const [reviewScope, setReviewScope] = (0, react.useState)("");
			const [reviewPolicy, setReviewPolicy] = (0, react.useState)("relevant");
			const [reviewDays, setReviewDays] = (0, react.useState)("");
			const [editing, setEditing] = (0, react.useState)(null);
			const [editDraft, setEditDraft] = (0, react.useState)(emptyDraft);
			const [editPolicy, setEditPolicy] = (0, react.useState)("never");
			const [revisions, setRevisions] = (0, react.useState)({});
			const [deleteArmed, setDeleteArmed] = (0, react.useState)(null);
			const [loading, setLoading] = (0, react.useState)(true);
			const [pending, setPending] = (0, react.useState)(false);
			const [error, setError] = (0, react.useState)(null);
			const [notice, setNotice] = (0, react.useState)(null);
			const requestRef = (0, react.useRef)(0);
			const pendingRef = (0, react.useRef)(false);
			const refresh = (0, react.useCallback)(async () => {
				const request = ++requestRef.current;
				const [listed, latest, recalled, automated] = await Promise.allSettled([
					onListMemories(),
					onLatestMemoryExtraction(),
					onLatestMemoryAudit(),
					onMemoryAutomationPolicy()
				]);
				if (request !== requestRef.current) return;
				if (listed.status === "rejected" || !listed.value.ok) {
					setError("governance.error.load");
					setLoading(false);
					return;
				}
				setItems(listed.value.value);
				setExtraction(latest.status === "fulfilled" && latest.value.ok ? latest.value.value : null);
				setAudit(recalled.status === "fulfilled" && recalled.value.ok ? recalled.value.value : null);
				setAutomation(automated.status === "fulfilled" && automated.value.ok ? automated.value.value : null);
				setError(null);
				setLoading(false);
			}, [
				onLatestMemoryAudit,
				onLatestMemoryExtraction,
				onListMemories,
				onMemoryAutomationPolicy
			]);
			(0, react.useEffect)(() => {
				refresh();
				return () => {
					requestRef.current++;
				};
			}, [refresh]);
			async function mutate(operation, success) {
				if (pendingRef.current) return null;
				pendingRef.current = true;
				setPending(true);
				setError(null);
				setNotice(null);
				try {
					const result = await operation();
					if (!result.ok) {
						setError(errorKey$2(result.code));
						if (result.code === "version-conflict" || result.code === "relationship-stale" || result.code === "automation-version-conflict") await refresh();
						return null;
					}
					await refresh();
					setNotice(success);
					return result.value;
				} catch {
					setError("governance.error.generic");
					return null;
				} finally {
					pendingRef.current = false;
					setPending(false);
				}
			}
			function beginReview(item) {
				setReviewing(item);
				setReviewContent(item.content);
				setReviewScope(item.scope ?? "");
				setReviewPolicy(item.sensitivity === "high" ? "never" : "relevant");
				setReviewDays("");
				setDeleteArmed(null);
				setNotice(null);
			}
			function beginEdit(item) {
				setEditing(item);
				setEditDraft({
					kind: item.kind,
					sensitivity: item.sensitivity,
					content: item.content,
					reason: item.reason,
					scope: item.scope ?? ""
				});
				setEditPolicy(item.recallPolicy);
				setDeleteArmed(null);
				setNotice(null);
			}
			async function submitProposal(event) {
				event.preventDefault();
				const content = draft.content.trim();
				const reason = draft.reason.trim();
				if (content === "" || reason === "") return;
				if (await mutate(() => onProposeMemory({
					kind: draft.kind,
					sensitivity: draft.sensitivity,
					content,
					reason,
					...draft.scope.trim() === "" ? {} : { scope: draft.scope.trim() }
				}), "governance.notice.proposed") !== null) setDraft(emptyDraft);
			}
			async function confirmCandidate(item) {
				const days = temporaryDays(reviewDays);
				if (await mutate(() => onConfirmMemory(item, {
					recallPolicy: item.sensitivity === "high" ? "never" : reviewPolicy,
					content: reviewContent.trim(),
					scope: reviewScope.trim(),
					...days === void 0 ? {} : { temporaryDays: days }
				}), "governance.notice.confirmed") !== null) setReviewing(null);
			}
			async function resolveCandidate(item, resolution) {
				const days = temporaryDays(reviewDays);
				const policy = item.sensitivity === "high" ? "never" : reviewPolicy;
				const request = resolution === "keep-existing" ? { resolution } : {
					resolution,
					recallPolicy: policy,
					scope: reviewScope.trim(),
					...days === void 0 ? {} : { temporaryDays: days }
				};
				if (await mutate(() => onResolveMemoryRelationship(item, request), "governance.notice.resolved") !== null) setReviewing(null);
			}
			async function saveEdit(event) {
				event.preventDefault();
				if (editing === null || editDraft.content.trim() === "" || editDraft.reason.trim() === "") return;
				if (await mutate(() => onUpdateMemory(editing, {
					content: editDraft.content.trim(),
					reason: editDraft.reason.trim(),
					scope: editDraft.scope.trim(),
					sensitivity: editDraft.sensitivity,
					recallPolicy: editDraft.sensitivity === "high" ? "never" : editPolicy
				}), "governance.notice.updated") !== null) setEditing(null);
			}
			async function loadRevisions(item) {
				const id = String(item.id);
				if (revisions[id] !== void 0) {
					setRevisions((current) => {
						const next = { ...current };
						Reflect.deleteProperty(next, id);
						return next;
					});
					return;
				}
				setPending(true);
				setError(null);
				try {
					const result = await onListMemoryRevisions(item);
					if (!result.ok) {
						setError(errorKey$2(result.code));
						return;
					}
					setRevisions((current) => ({
						...current,
						[id]: result.value
					}));
				} catch {
					setError("governance.error.generic");
				} finally {
					setPending(false);
				}
			}
			async function remove(item) {
				const id = String(item.id);
				if (deleteArmed !== id) {
					setDeleteArmed(id);
					return;
				}
				if (await mutate(() => onDeleteMemory(item), "governance.notice.deleted") !== null) {
					setDeleteArmed(null);
					if (editing?.id === item.id) setEditing(null);
					if (reviewing?.id === item.id) setReviewing(null);
				}
			}
			async function saveAutomation(enabled, minimumCompletedTurns) {
				if (automation === null) return;
				await mutate(() => onSetMemoryAutomationPolicy(automation, enabled, minimumCompletedTurns), enabled ? "governance.notice.automationEnabled" : "governance.notice.automationDisabled");
			}
			const candidates = items.filter((item) => item.status === "candidate");
			const active = items.filter((item) => item.status === "confirmed" || item.status === "temporary");
			const history = items.filter((item) => item.status === "rejected" || item.status === "superseded" || item.status === "expired");
			const relationships = candidates.filter((item) => item.relationship?.status === "pending").length;
			return (0, react_jsx_runtime.jsxs)("section", {
				className: MemoryGovernance_module_css_default.governance,
				"data-mind-garden-memory-governance": "active",
				"aria-labelledby": "mind-garden-governance-title",
				children: [
					(0, react_jsx_runtime.jsxs)("header", {
						className: MemoryGovernance_module_css_default.header,
						style: { "--mg-memory-scene": `url("${MEMORY_ARCHIVE_ALCOVE_V3}")` },
						children: [(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("h1", {
							id: "mind-garden-governance-title",
							children: t("governance.title")
						}), (0, react_jsx_runtime.jsx)("p", { children: t("governance.subtitle") })] }), (0, react_jsx_runtime.jsxs)("div", {
							className: MemoryGovernance_module_css_default.counters,
							"aria-label": t("governance.summary"),
							children: [
								(0, react_jsx_runtime.jsxs)("span", { children: [(0, react_jsx_runtime.jsx)("strong", { children: active.length }), t("governance.active")] }),
								(0, react_jsx_runtime.jsxs)("span", { children: [(0, react_jsx_runtime.jsx)("strong", { children: candidates.length }), t("governance.candidates")] }),
								(0, react_jsx_runtime.jsxs)("span", { children: [(0, react_jsx_runtime.jsx)("strong", { children: relationships }), t("governance.relationships")] })
							]
						})]
					}),
					notice !== null && (0, react_jsx_runtime.jsx)("p", {
						className: GardenSpace_module_css_default.notice,
						role: "status",
						children: t(notice)
					}),
					error !== null && (0, react_jsx_runtime.jsx)("p", {
						className: GardenSpace_module_css_default.error,
						role: "alert",
						children: t(error)
					}),
					loading ? (0, react_jsx_runtime.jsx)("p", {
						className: GardenSpace_module_css_default.empty,
						role: "status",
						children: t("governance.loading")
					}) : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
						(0, react_jsx_runtime.jsxs)("section", {
							className: MemoryGovernance_module_css_default.auditStrip,
							"aria-label": t("governance.audit.title"),
							children: [
								(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconDataOutline16, {}), (0, react_jsx_runtime.jsxs)("p", { children: [(0, react_jsx_runtime.jsx)("strong", { children: t("governance.audit.title") }), audit === null ? t("governance.audit.empty") : t(audit.sentToModel ? "governance.audit.sent" : "governance.audit.local").replace("{count}", String(audit.matches.length))] })] }),
								(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSparkle16, {}), (0, react_jsx_runtime.jsxs)("p", { children: [(0, react_jsx_runtime.jsx)("strong", { children: t("governance.extraction.title") }), extraction === null ? t("governance.extraction.empty") : `${t(`governance.extraction.trigger.${extraction.trigger}`)} · ${t(`governance.extraction.${extraction.status}`).replace("{count}", String(extraction.candidateIds.length))}`] })] }),
								(0, react_jsx_runtime.jsx)("button", {
									className: GardenSpace_module_css_default.quietButton,
									type: "button",
									disabled: pending,
									onClick: () => {
										mutate(onExtractMemories, "governance.notice.extracted");
									},
									children: t("governance.extraction.run")
								})
							]
						}),
						(0, react_jsx_runtime.jsxs)("section", {
							className: `${GardenSpace_module_css_default.panel} ${MemoryGovernance_module_css_default.automation}`,
							"data-memory-automation": automation?.enabled === true ? "enabled" : "disabled",
							"aria-labelledby": "mind-garden-memory-automation-title",
							children: [
								(0, react_jsx_runtime.jsxs)("div", {
									className: MemoryGovernance_module_css_default.automationLead,
									children: [(0, react_jsx_runtime.jsx)(MemoryIcon, { size: 18 }), (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("h3", {
										id: "mind-garden-memory-automation-title",
										children: t("governance.automation.title")
									}), (0, react_jsx_runtime.jsx)("p", { children: t("governance.automation.subtitle") })] })]
								}),
								(0, react_jsx_runtime.jsxs)("label", {
									className: MemoryGovernance_module_css_default.automationToggle,
									children: [
										(0, react_jsx_runtime.jsx)("input", {
											type: "checkbox",
											checked: automation?.enabled ?? false,
											disabled: pending || automation === null,
											onChange: (event) => {
												saveAutomation(event.target.checked, automation?.minimumCompletedTurns ?? 3);
											}
										}),
										(0, react_jsx_runtime.jsx)("span", { "aria-hidden": "true" }),
										(0, react_jsx_runtime.jsx)("strong", { children: t(automation?.enabled === true ? "governance.automation.enabled" : "governance.automation.disabled") })
									]
								}),
								(0, react_jsx_runtime.jsxs)("div", {
									className: MemoryGovernance_module_css_default.automationControls,
									children: [(0, react_jsx_runtime.jsxs)("label", { children: [t("governance.automation.interval"), (0, react_jsx_runtime.jsx)("select", {
										value: automation?.minimumCompletedTurns ?? 3,
										disabled: pending || automation === null,
										onChange: (event) => {
											saveAutomation(automation?.enabled ?? false, Number(event.target.value));
										},
										children: AUTOMATION_INTERVALS.map((interval) => (0, react_jsx_runtime.jsx)("option", {
											value: interval,
											children: t(`governance.automation.interval.${interval}`)
										}, interval))
									})] }), (0, react_jsx_runtime.jsxs)("div", {
										className: MemoryGovernance_module_css_default.automationStatus,
										children: [
											(0, react_jsx_runtime.jsx)("span", { children: t("governance.automation.status") }),
											(0, react_jsx_runtime.jsx)("strong", { children: automation === null ? t("governance.automation.unavailable") : t(`governance.automation.outcome.${automation.lastOutcome ?? "never"}`) }),
											automation?.lastAttemptAt !== null && automation?.lastAttemptAt !== void 0 && (0, react_jsx_runtime.jsx)("small", { children: dateOf(automation.lastAttemptAt) })
										]
									})]
								}),
								(0, react_jsx_runtime.jsxs)("ul", {
									className: MemoryGovernance_module_css_default.automationDisclosure,
									children: [
										(0, react_jsx_runtime.jsx)("li", { children: t("governance.automation.disclosure.model") }),
										(0, react_jsx_runtime.jsx)("li", { children: t("governance.automation.disclosure.candidates") }),
										(0, react_jsx_runtime.jsx)("li", { children: t("governance.automation.disclosure.safety") })
									]
								})
							]
						}),
						(0, react_jsx_runtime.jsxs)("form", {
							className: `${GardenSpace_module_css_default.panel} ${MemoryGovernance_module_css_default.proposal}`,
							onSubmit: (event) => {
								submitProposal(event);
							},
							children: [
								(0, react_jsx_runtime.jsxs)("div", {
									className: MemoryGovernance_module_css_default.sectionHeading,
									children: [(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlusOutline16, {}), (0, react_jsx_runtime.jsx)("h3", { children: t("governance.propose.title") })] }), (0, react_jsx_runtime.jsx)("p", { children: t("governance.propose.subtitle") })]
								}),
								(0, react_jsx_runtime.jsxs)("div", {
									className: MemoryGovernance_module_css_default.proposalGrid,
									children: [
										(0, react_jsx_runtime.jsxs)("label", { children: [t("governance.kind"), (0, react_jsx_runtime.jsx)("select", {
											value: draft.kind,
											onChange: (event) => {
												setDraft((current) => ({
													...current,
													kind: event.target.value
												}));
											},
											children: KINDS.map((kind) => (0, react_jsx_runtime.jsx)("option", {
												value: kind,
												children: t(`governance.kind.${kind}`)
											}, kind))
										})] }),
										(0, react_jsx_runtime.jsxs)("label", { children: [t("governance.sensitivity"), (0, react_jsx_runtime.jsxs)("select", {
											value: draft.sensitivity,
											onChange: (event) => {
												setDraft((current) => ({
													...current,
													sensitivity: event.target.value
												}));
											},
											children: [(0, react_jsx_runtime.jsx)("option", {
												value: "normal",
												children: t("governance.sensitivity.normal")
											}), (0, react_jsx_runtime.jsx)("option", {
												value: "high",
												children: t("governance.sensitivity.high")
											})]
										})] }),
										(0, react_jsx_runtime.jsxs)("label", {
											className: MemoryGovernance_module_css_default.wide,
											children: [t("governance.content"), (0, react_jsx_runtime.jsx)("textarea", {
												value: draft.content,
												maxLength: 2e3,
												onChange: (event) => {
													setDraft((current) => ({
														...current,
														content: event.target.value
													}));
												},
												placeholder: t("governance.content.placeholder")
											})]
										}),
										(0, react_jsx_runtime.jsxs)("label", { children: [t("governance.reason"), (0, react_jsx_runtime.jsx)("input", {
											value: draft.reason,
											maxLength: 500,
											onChange: (event) => {
												setDraft((current) => ({
													...current,
													reason: event.target.value
												}));
											},
											placeholder: t("governance.reason.placeholder")
										})] }),
										(0, react_jsx_runtime.jsxs)("label", { children: [t("governance.scope"), (0, react_jsx_runtime.jsx)("input", {
											value: draft.scope,
											maxLength: 300,
											onChange: (event) => {
												setDraft((current) => ({
													...current,
													scope: event.target.value
												}));
											},
											placeholder: t("governance.scope.placeholder")
										})] })
									]
								}),
								(0, react_jsx_runtime.jsxs)("div", {
									className: MemoryGovernance_module_css_default.formFooter,
									children: [(0, react_jsx_runtime.jsx)("span", { children: t("governance.propose.hint") }), (0, react_jsx_runtime.jsx)("button", {
										className: GardenSpace_module_css_default.button,
										type: "submit",
										disabled: pending || draft.content.trim() === "" || draft.reason.trim() === "",
										children: t("governance.propose.save")
									})]
								})
							]
						}),
						(0, react_jsx_runtime.jsxs)("section", {
							className: MemoryGovernance_module_css_default.section,
							"aria-labelledby": "mind-garden-candidates-title",
							children: [(0, react_jsx_runtime.jsxs)("div", {
								className: MemoryGovernance_module_css_default.sectionHeading,
								children: [(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconQueueOutline14, {}), (0, react_jsx_runtime.jsx)("h3", {
									id: "mind-garden-candidates-title",
									children: t("governance.queue.title")
								})] }), (0, react_jsx_runtime.jsx)("p", { children: t("governance.queue.subtitle") })]
							}), candidates.length === 0 ? (0, react_jsx_runtime.jsx)("p", {
								className: GardenSpace_module_css_default.empty,
								children: t("governance.queue.empty")
							}) : (0, react_jsx_runtime.jsx)("div", {
								className: MemoryGovernance_module_css_default.cardList,
								children: candidates.map((item) => {
									const target = item.relationship === void 0 ? void 0 : items.find((candidate) => candidate.id === item.relationship?.targetMemoryId);
									const open = reviewing?.id === item.id;
									return (0, react_jsx_runtime.jsxs)("article", {
										className: `${GardenSpace_module_css_default.panel} ${MemoryGovernance_module_css_default.memoryCard}`,
										"data-relationship": item.relationship?.status ?? "none",
										children: [
											(0, react_jsx_runtime.jsx)(MemorySummary, {
												item,
												t
											}),
											item.relationship?.status === "pending" && (0, react_jsx_runtime.jsxs)("div", {
												className: MemoryGovernance_module_css_default.conflict,
												children: [
													(0, react_jsx_runtime.jsx)("strong", { children: t(`governance.relationship.${item.relationship.type}`) }),
													(0, react_jsx_runtime.jsx)("p", { children: item.relationship.rationale }),
													(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsxs)("blockquote", { children: [(0, react_jsx_runtime.jsx)("small", { children: t("governance.relationship.existing") }), target?.content ?? t("governance.relationship.missing")] }), (0, react_jsx_runtime.jsxs)("blockquote", { children: [(0, react_jsx_runtime.jsx)("small", { children: t("governance.relationship.incoming") }), item.content] })] })
												]
											}),
											(0, react_jsx_runtime.jsx)("div", {
												className: MemoryGovernance_module_css_default.actions,
												children: (0, react_jsx_runtime.jsx)("button", {
													className: GardenSpace_module_css_default.button,
													type: "button",
													disabled: pending,
													onClick: () => {
														if (open) setReviewing(null);
														else beginReview(item);
													},
													children: open ? t("governance.review.close") : t("governance.review.open")
												})
											}),
											open && (0, react_jsx_runtime.jsxs)("div", {
												className: MemoryGovernance_module_css_default.reviewPanel,
												children: [
													(0, react_jsx_runtime.jsxs)("label", { children: [t("governance.content"), (0, react_jsx_runtime.jsx)("textarea", {
														value: reviewContent,
														onChange: (event) => {
															setReviewContent(event.target.value);
														},
														disabled: item.relationship?.status === "pending"
													})] }),
													(0, react_jsx_runtime.jsxs)("label", { children: [t("governance.scope"), (0, react_jsx_runtime.jsx)("input", {
														value: reviewScope,
														onChange: (event) => {
															setReviewScope(event.target.value);
														}
													})] }),
													(0, react_jsx_runtime.jsxs)("div", {
														className: MemoryGovernance_module_css_default.policyRow,
														children: [(0, react_jsx_runtime.jsxs)("label", { children: [t("governance.recall"), (0, react_jsx_runtime.jsx)("select", {
															value: reviewPolicy,
															disabled: item.sensitivity === "high",
															onChange: (event) => {
																setReviewPolicy(event.target.value);
															},
															children: POLICIES.map((policy) => (0, react_jsx_runtime.jsx)("option", {
																value: policy,
																children: t(`governance.recall.${policy}`)
															}, policy))
														})] }), (0, react_jsx_runtime.jsxs)("label", { children: [t("governance.temporary"), (0, react_jsx_runtime.jsx)("input", {
															type: "number",
															min: "1",
															max: "365",
															value: reviewDays,
															onChange: (event) => {
																setReviewDays(event.target.value);
															},
															placeholder: t("governance.temporary.placeholder")
														})] })]
													}),
													item.relationship?.status === "pending" ? (0, react_jsx_runtime.jsxs)("div", {
														className: MemoryGovernance_module_css_default.decisionActions,
														children: [
															(0, react_jsx_runtime.jsx)("button", {
																type: "button",
																disabled: pending,
																onClick: () => {
																	resolveCandidate(item, "keep-existing");
																},
																children: t("governance.relationship.keepExisting")
															}),
															(0, react_jsx_runtime.jsx)("button", {
																type: "button",
																disabled: pending,
																onClick: () => {
																	resolveCandidate(item, "keep-both");
																},
																children: t("governance.relationship.keepBoth")
															}),
															(0, react_jsx_runtime.jsx)("button", {
																className: GardenSpace_module_css_default.button,
																type: "button",
																disabled: pending,
																onClick: () => {
																	resolveCandidate(item, "replace-existing");
																},
																children: t("governance.relationship.replace")
															})
														]
													}) : (0, react_jsx_runtime.jsxs)("div", {
														className: MemoryGovernance_module_css_default.decisionActions,
														children: [(0, react_jsx_runtime.jsx)("button", {
															type: "button",
															disabled: pending,
															onClick: () => {
																mutate(() => onRejectMemory(item), "governance.notice.rejected").then((value) => {
																	if (value !== null) setReviewing(null);
																});
															},
															children: t("governance.reject")
														}), (0, react_jsx_runtime.jsx)("button", {
															className: GardenSpace_module_css_default.button,
															type: "button",
															disabled: pending || reviewContent.trim() === "",
															onClick: () => {
																confirmCandidate(item);
															},
															children: t("governance.confirm")
														})]
													})
												]
											})
										]
									}, String(item.id));
								})
							})]
						}),
						(0, react_jsx_runtime.jsxs)("section", {
							className: MemoryGovernance_module_css_default.section,
							"aria-labelledby": "mind-garden-active-memory-title",
							children: [(0, react_jsx_runtime.jsxs)("div", {
								className: MemoryGovernance_module_css_default.sectionHeading,
								children: [(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)(MemoryIcon, { size: 16 }), (0, react_jsx_runtime.jsx)("h3", {
									id: "mind-garden-active-memory-title",
									children: t("governance.library.title")
								})] }), (0, react_jsx_runtime.jsx)("p", { children: t("governance.library.subtitle") })]
							}), active.length === 0 ? (0, react_jsx_runtime.jsx)("p", {
								className: GardenSpace_module_css_default.empty,
								children: t("governance.library.empty")
							}) : (0, react_jsx_runtime.jsx)("div", {
								className: MemoryGovernance_module_css_default.cardList,
								children: active.map((item) => {
									const itemRevisions = revisions[String(item.id)];
									const isEditing = editing?.id === item.id;
									return (0, react_jsx_runtime.jsxs)("article", {
										className: `${GardenSpace_module_css_default.panel} ${MemoryGovernance_module_css_default.memoryCard}`,
										children: [
											(0, react_jsx_runtime.jsx)(MemorySummary, {
												item,
												t
											}),
											(0, react_jsx_runtime.jsx)(MemorySources, {
												item,
												t
											}),
											(0, react_jsx_runtime.jsxs)("div", {
												className: MemoryGovernance_module_css_default.actions,
												children: [
													(0, react_jsx_runtime.jsxs)("button", {
														type: "button",
														onClick: () => {
															onDraftConversation(t("governance.draft.template").replace("{content}", item.content));
															setNotice("governance.notice.drafted");
														},
														children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSendOutline14, {}), t("governance.continue")]
													}),
													(0, react_jsx_runtime.jsx)("button", {
														type: "button",
														disabled: pending,
														onClick: () => {
															loadRevisions(item);
														},
														children: itemRevisions === void 0 ? t("governance.history.open") : t("governance.history.close")
													}),
													(0, react_jsx_runtime.jsx)("button", {
														type: "button",
														disabled: pending,
														onClick: () => {
															if (isEditing) setEditing(null);
															else beginEdit(item);
														},
														children: isEditing ? t("governance.edit.close") : t("governance.edit.open")
													}),
													(0, react_jsx_runtime.jsx)("button", {
														className: GardenSpace_module_css_default.dangerButton,
														type: "button",
														disabled: pending,
														onClick: () => {
															remove(item);
														},
														children: deleteArmed === String(item.id) ? t("governance.delete.confirm") : t("governance.delete")
													})
												]
											}),
											itemRevisions !== void 0 && (0, react_jsx_runtime.jsx)(RevisionList, {
												revisions: itemRevisions,
												t
											}),
											isEditing && (0, react_jsx_runtime.jsxs)("form", {
												className: MemoryGovernance_module_css_default.reviewPanel,
												onSubmit: (event) => {
													saveEdit(event);
												},
												children: [
													(0, react_jsx_runtime.jsxs)("label", { children: [t("governance.content"), (0, react_jsx_runtime.jsx)("textarea", {
														value: editDraft.content,
														onChange: (event) => {
															setEditDraft((current) => ({
																...current,
																content: event.target.value
															}));
														}
													})] }),
													(0, react_jsx_runtime.jsxs)("label", { children: [t("governance.reason"), (0, react_jsx_runtime.jsx)("input", {
														value: editDraft.reason,
														onChange: (event) => {
															setEditDraft((current) => ({
																...current,
																reason: event.target.value
															}));
														}
													})] }),
													(0, react_jsx_runtime.jsxs)("label", { children: [t("governance.scope"), (0, react_jsx_runtime.jsx)("input", {
														value: editDraft.scope,
														onChange: (event) => {
															setEditDraft((current) => ({
																...current,
																scope: event.target.value
															}));
														}
													})] }),
													(0, react_jsx_runtime.jsxs)("div", {
														className: MemoryGovernance_module_css_default.policyRow,
														children: [(0, react_jsx_runtime.jsxs)("label", { children: [t("governance.sensitivity"), (0, react_jsx_runtime.jsxs)("select", {
															value: editDraft.sensitivity,
															onChange: (event) => {
																const sensitivity = event.target.value;
																setEditDraft((current) => ({
																	...current,
																	sensitivity
																}));
																if (sensitivity === "high") setEditPolicy("never");
															},
															children: [(0, react_jsx_runtime.jsx)("option", {
																value: "normal",
																children: t("governance.sensitivity.normal")
															}), (0, react_jsx_runtime.jsx)("option", {
																value: "high",
																children: t("governance.sensitivity.high")
															})]
														})] }), (0, react_jsx_runtime.jsxs)("label", { children: [t("governance.recall"), (0, react_jsx_runtime.jsx)("select", {
															value: editPolicy,
															disabled: editDraft.sensitivity === "high",
															onChange: (event) => {
																setEditPolicy(event.target.value);
															},
															children: POLICIES.map((policy) => (0, react_jsx_runtime.jsx)("option", {
																value: policy,
																children: t(`governance.recall.${policy}`)
															}, policy))
														})] })]
													}),
													(0, react_jsx_runtime.jsx)("div", {
														className: MemoryGovernance_module_css_default.decisionActions,
														children: (0, react_jsx_runtime.jsx)("button", {
															className: GardenSpace_module_css_default.button,
															type: "submit",
															disabled: pending || editDraft.content.trim() === "" || editDraft.reason.trim() === "",
															children: t("governance.edit.save")
														})
													})
												]
											})
										]
									}, String(item.id));
								})
							})]
						}),
						history.length > 0 && (0, react_jsx_runtime.jsxs)("details", {
							className: MemoryGovernance_module_css_default.archive,
							children: [(0, react_jsx_runtime.jsx)("summary", { children: t("governance.archive.title").replace("{count}", String(history.length)) }), (0, react_jsx_runtime.jsx)("div", {
								className: MemoryGovernance_module_css_default.cardList,
								children: history.map((item) => {
									const itemRevisions = revisions[String(item.id)];
									return (0, react_jsx_runtime.jsxs)("article", {
										className: `${GardenSpace_module_css_default.panel} ${MemoryGovernance_module_css_default.memoryCard}`,
										children: [
											(0, react_jsx_runtime.jsx)(MemorySummary, {
												item,
												t
											}),
											(0, react_jsx_runtime.jsx)(MemorySources, {
												item,
												t
											}),
											(0, react_jsx_runtime.jsxs)("div", {
												className: MemoryGovernance_module_css_default.actions,
												children: [(0, react_jsx_runtime.jsx)("button", {
													type: "button",
													disabled: pending,
													onClick: () => {
														loadRevisions(item);
													},
													children: itemRevisions === void 0 ? t("governance.history.open") : t("governance.history.close")
												}), (0, react_jsx_runtime.jsx)("button", {
													className: GardenSpace_module_css_default.dangerButton,
													type: "button",
													disabled: pending,
													onClick: () => {
														remove(item);
													},
													children: deleteArmed === String(item.id) ? t("governance.delete.confirm") : t("governance.delete")
												})]
											}),
											itemRevisions !== void 0 && (0, react_jsx_runtime.jsx)(RevisionList, {
												revisions: itemRevisions,
												t
											})
										]
									}, String(item.id));
								})
							})]
						})
					] })
				]
			});
		}
		function MemorySummary({ item, t }) {
			return (0, react_jsx_runtime.jsxs)("div", {
				className: MemoryGovernance_module_css_default.summary,
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: MemoryGovernance_module_css_default.meta,
						children: [
							(0, react_jsx_runtime.jsx)("span", { children: t(`governance.status.${item.status}`) }),
							(0, react_jsx_runtime.jsx)("span", { children: t(`governance.kind.${item.kind}`) }),
							(0, react_jsx_runtime.jsx)("span", { children: t(`governance.sensitivity.${item.sensitivity}`) }),
							(0, react_jsx_runtime.jsx)("time", {
								dateTime: dateOf(item.updatedAt),
								children: dateOf(item.updatedAt)
							})
						]
					}),
					(0, react_jsx_runtime.jsx)("p", { children: item.content }),
					(0, react_jsx_runtime.jsx)("small", { children: item.reason }),
					item.scope !== void 0 && (0, react_jsx_runtime.jsxs)("blockquote", { children: [t("governance.scope.label"), item.scope] }),
					(0, react_jsx_runtime.jsxs)("div", {
						className: MemoryGovernance_module_css_default.recallBadge,
						children: [t(`governance.recall.${item.recallPolicy}`), item.status === "temporary" && item.expiresAt !== void 0 ? ` · ${t("governance.expires").replace("{date}", dateOf(item.expiresAt))}` : ""]
					})
				]
			});
		}
		function MemorySources({ item, t }) {
			return (0, react_jsx_runtime.jsxs)("details", {
				className: MemoryGovernance_module_css_default.sources,
				children: [(0, react_jsx_runtime.jsx)("summary", { children: t("governance.sources").replace("{count}", String(item.sources.length)) }), item.sources.map((source, index) => (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("span", { children: String(source.sessionId).slice(0, 12) }), source.evidenceQuote !== void 0 && (0, react_jsx_runtime.jsx)("blockquote", { children: source.evidenceQuote })] }, `${String(source.sessionId)}:${index}`))]
			});
		}
		function RevisionList({ revisions, t }) {
			return (0, react_jsx_runtime.jsx)("div", {
				className: MemoryGovernance_module_css_default.revisions,
				children: revisions.length === 0 ? (0, react_jsx_runtime.jsx)("p", { children: t("governance.history.empty") }) : revisions.map((revision) => (0, react_jsx_runtime.jsxs)("article", { children: [
					(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("strong", { children: t(`governance.revision.${revision.action}`) }), (0, react_jsx_runtime.jsx)("time", {
						dateTime: dateOf(revision.createdAt),
						children: dateOf(revision.createdAt)
					})] }),
					(0, react_jsx_runtime.jsx)("p", { children: revision.content }),
					(0, react_jsx_runtime.jsx)("small", { children: t(`governance.recall.${revision.recallPolicy}`) })
				] }, String(revision.id)))
			});
		}
		//#endregion
		//#region \0dsh-css:E:\test code\deepseekharness_modified\deepseek-harness\packages\client\ui-mind-garden\src\client\spaces\TodayPractice.module.css.mjs
		const css$4 = ".hW-6Da_practice{width:min(1240px,100% - 56px);color:var(--mg-ink,#342d27);font-family:var(--mg-font-ui,\"Noto Sans SC\", sans-serif);margin:0 auto 70px}.hW-6Da_header{justify-content:space-between;align-items:baseline;gap:24px;margin-block-end:18px;padding-inline:4px;display:flex}.hW-6Da_header h2{letter-spacing:-.02em;margin:0;font-size:18px;font-weight:700}.hW-6Da_header time{color:var(--mg-muted,#76695e);font-variant-numeric:tabular-nums;font-size:11px}.hW-6Da_grid{background:#fffaf2;border-radius:18px;grid-template-columns:minmax(0,.92fr) minmax(0,1.08fr);grid-template-areas:\"hW-6Da_checkin hW-6Da_journal\"\"hW-6Da_shelf hW-6Da_shelf\";gap:0;display:grid;overflow:hidden;box-shadow:0 24px 64px #44301f1a}.hW-6Da_checkin,.hW-6Da_journalComposer{box-shadow:none;background:#fffbf4e0;border:0;border-radius:0;align-content:start;gap:18px;padding:clamp(26px,3.5vw,44px);display:grid}.hW-6Da_checkin{grid-area:hW-6Da_checkin}.hW-6Da_journalComposer{background:#ebdbc57a;border-inline-start:0;grid-area:hW-6Da_journal}.hW-6Da_cardHeading{align-items:flex-start;gap:11px;display:flex}.hW-6Da_cardHeading>span{aspect-ratio:1;width:34px;color:var(--mg-indigo,#405f87);border:1px solid #405f873b;border-radius:50%;flex:none;place-items:center;display:grid}.hW-6Da_cardHeading h3{letter-spacing:-.02em;margin:1px 0 0;font-size:17px;font-weight:700}.hW-6Da_cardHeading p{max-width:44ch;color:var(--mg-muted,#76695e);margin:5px 0 0;font-size:10px;line-height:1.6}.hW-6Da_checkin fieldset{border:0;min-width:0;margin:0;padding:0}.hW-6Da_checkin legend,.hW-6Da_field>span{color:var(--mg-muted,#76695e);margin-block-end:8px;font-size:10px;font-weight:650}.hW-6Da_scale,.hW-6Da_energy{grid-template-columns:repeat(5,minmax(0,1fr));gap:7px;display:grid}.hW-6Da_scale button,.hW-6Da_energy button{min-height:58px;color:var(--mg-muted,#76695e);background:linear-gradient(145deg, #fffffcdb, #efe2cfb3), var(--mg-limestone-texture);font:inherit;cursor:pointer;background-size:auto,230px;border:1px solid #533e2d26;border-radius:10px;place-items:center;gap:3px;padding:6px 3px;font-size:12px;display:grid;box-shadow:3px 7px 13px #46311f12}.hW-6Da_scale button[aria-pressed=true],.hW-6Da_energy button[aria-pressed=true]{color:#fffaf2;border-color:var(--mg-indigo,#405f87);background:var(--mg-indigo,#405f87);box-shadow:5px 10px 20px #304c702e}.hW-6Da_scale button span{font-size:15px}.hW-6Da_scale button small,.hW-6Da_energy button small{font-size:9px}.hW-6Da_field{gap:6px;display:grid}.hW-6Da_field input,.hW-6Da_field textarea{background:#fffcf7b8}.hW-6Da_field>small{color:var(--mg-muted,#76695e);font-size:9px}.hW-6Da_checkin>button{width:100%}.hW-6Da_checkinTrail{flex-wrap:wrap;gap:6px;padding-block-start:5px;display:flex}.hW-6Da_checkinTrail span{color:var(--mg-muted,#76695e);background:#a77d4314;border-radius:999px;padding:4px 7px;font-size:9px}.hW-6Da_retrieval{align-items:flex-start;gap:9px;padding:12px 0;display:flex}.hW-6Da_retrieval input{width:15px;height:15px;accent-color:var(--mg-indigo,#405f87);margin-block-start:2px}.hW-6Da_retrieval span{gap:3px;display:grid}.hW-6Da_retrieval strong{font-size:10px}.hW-6Da_retrieval small{color:var(--mg-muted,#76695e);font-size:9px;line-height:1.5}.hW-6Da_composerActions{flex-wrap:wrap;gap:8px;display:flex}.hW-6Da_journalShelf{background:#f8eee161;grid-area:hW-6Da_shelf;padding:34px 34px 38px}.hW-6Da_shelfHeading{justify-content:space-between;align-items:baseline;gap:20px;padding:0 0 16px;display:flex}.hW-6Da_shelfHeading h3{font-family:var(--mg-font-reflection,\"Mind Garden Display\", \"Noto Serif SC\", serif);letter-spacing:-.025em;margin:0;font-size:26px;font-weight:560}.hW-6Da_shelfHeading span{color:var(--mg-plum,#8d5a5e);font-size:10px}.hW-6Da_journalShelf>ul{grid-template-columns:repeat(2,minmax(0,1fr));gap:16px 24px;margin:0;padding:0;list-style:none;display:grid}.hW-6Da_journalCard{background:#fffcf6cc;border:0;border-radius:12px;grid-template-columns:minmax(0,1fr) auto;gap:18px;padding:20px;display:grid;box-shadow:0 12px 32px #44301f12}.hW-6Da_journalCard:nth-child(-n+2){border-block-start:0}.hW-6Da_journalMeta{color:var(--mg-plum,#8d5a5e);font-size:9px;font-weight:700}.hW-6Da_journalCard h4{color:var(--mg-ink,#342d27);font-family:var(--mg-font-reflection);margin:7px 0;font-size:17px;font-weight:560}.hW-6Da_journalCard p{color:var(--mg-muted,#76695e);-webkit-line-clamp:3;-webkit-box-orient:vertical;margin:0;font-size:11px;line-height:1.65;display:-webkit-box;overflow:hidden}.hW-6Da_journalActions{align-items:flex-start;gap:5px;display:flex}.hW-6Da_journalActions button{border-color:#0000;min-height:31px;padding:4px 8px}@media (width<=820px){.hW-6Da_grid{grid-template-columns:1fr;grid-template-areas:\"hW-6Da_checkin\"\"hW-6Da_journal\"\"hW-6Da_shelf\"}.hW-6Da_journalComposer{border-block-start:0;border-inline-start:0}}@media (width<=620px){.hW-6Da_practice{width:calc(100% - 24px);margin-block-end:44px}.hW-6Da_checkin,.hW-6Da_journalComposer{padding:26px 14px}.hW-6Da_scale,.hW-6Da_energy{gap:4px}.hW-6Da_scale button,.hW-6Da_energy button{min-height:54px}.hW-6Da_journalShelf>ul{grid-template-columns:1fr}.hW-6Da_journalCard:nth-child(2){border-block-start:0}.hW-6Da_journalCard{grid-template-columns:1fr}.hW-6Da_journalShelf{padding:28px 14px 30px}}";
		const tagId$4 = "@deepseek-ai/dsh-mind-garden/TodayPractice.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$4) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-mind-garden";
			tag.dataset.pluginCss = tagId$4;
			tag.textContent = css$4;
			document.head.appendChild(tag);
		}
		var TodayPractice_module_css_default = {
			"cardHeading": "hW-6Da_cardHeading",
			"checkin": "hW-6Da_checkin",
			"checkinTrail": "hW-6Da_checkinTrail",
			"composerActions": "hW-6Da_composerActions",
			"energy": "hW-6Da_energy",
			"field": "hW-6Da_field",
			"grid": "hW-6Da_grid",
			"header": "hW-6Da_header",
			"journal": "hW-6Da_journal",
			"journalActions": "hW-6Da_journalActions",
			"journalCard": "hW-6Da_journalCard",
			"journalComposer": "hW-6Da_journalComposer",
			"journalMeta": "hW-6Da_journalMeta",
			"journalShelf": "hW-6Da_journalShelf",
			"practice": "hW-6Da_practice",
			"retrieval": "hW-6Da_retrieval",
			"scale": "hW-6Da_scale",
			"shelf": "hW-6Da_shelf",
			"shelfHeading": "hW-6Da_shelfHeading"
		};
		//#endregion
		//#region lib/types/client/spaces/TodayPractice.js
		/** Daily check-in and encrypted journal composition for the Today space. */
		const MOODS = [
			-2,
			-1,
			0,
			1,
			2
		];
		const ENERGIES = [
			1,
			2,
			3,
			4,
			5
		];
		/** Normalize a free-form emotion list into the service's bounded unique words. */
		function emotionWords(value) {
			return [...new Set(value.split(/[\s,，、]+/u).map((word) => word.trim()).filter(Boolean))].slice(0, 3);
		}
		/** Render immutable check-ins and user-governed encrypted journal entries. */
		function TodayPractice({ today, onCalendarDay, onCreateCheckin, onCreateJournal, onUpdateJournal, onDeleteJournal, t }) {
			const [checkins, setCheckins] = (0, react.useState)([]);
			const [journals, setJournals] = (0, react.useState)([]);
			const [mood, setMood] = (0, react.useState)(0);
			const [energy, setEnergy] = (0, react.useState)(3);
			const [emotions, setEmotions] = (0, react.useState)("");
			const [title, setTitle] = (0, react.useState)("");
			const [body, setBody] = (0, react.useState)("");
			const [allowRetrieval, setAllowRetrieval] = (0, react.useState)(false);
			const [editing, setEditing] = (0, react.useState)(null);
			const [deleteArmed, setDeleteArmed] = (0, react.useState)(null);
			const [loading, setLoading] = (0, react.useState)(true);
			const [pending, setPending] = (0, react.useState)(false);
			const [error, setError] = (0, react.useState)(false);
			const [notice, setNotice] = (0, react.useState)(null);
			const requestRef = (0, react.useRef)(0);
			const refresh = (0, react.useCallback)(async () => {
				const request = ++requestRef.current;
				try {
					const result = await onCalendarDay(today);
					if (request !== requestRef.current) return;
					if (!result.ok) {
						setError(true);
						setLoading(false);
						return;
					}
					setCheckins(result.value.events.filter((event) => event.type === "checkin"));
					setJournals(result.value.events.filter((event) => event.type === "journal").reverse());
					setError(false);
					setLoading(false);
				} catch {
					if (request !== requestRef.current) return;
					setError(true);
					setLoading(false);
				}
			}, [onCalendarDay, today]);
			(0, react.useEffect)(() => {
				refresh();
				return () => {
					requestRef.current++;
				};
			}, [refresh]);
			function resetJournal() {
				setEditing(null);
				setTitle("");
				setBody("");
				setAllowRetrieval(false);
			}
			async function submitCheckin(event) {
				event.preventDefault();
				if (pending) return;
				setPending(true);
				setError(false);
				setNotice(null);
				try {
					const result = await onCreateCheckin(mood, energy, emotionWords(emotions), calendarStamp(today));
					if (!result.ok) {
						setError(true);
						return;
					}
					setCheckins((current) => [...current, result.value]);
					setEmotions("");
					setNotice("today.checkin.notice");
				} catch {
					setError(true);
				} finally {
					setPending(false);
				}
			}
			async function submitJournal(event) {
				event.preventDefault();
				const nextTitle = title.trim();
				const nextBody = body.trim();
				if (pending || nextBody === "") return;
				setPending(true);
				setError(false);
				setNotice(null);
				try {
					const result = editing === null ? await onCreateJournal(nextTitle, nextBody, allowRetrieval, calendarStamp(today)) : await onUpdateJournal(editing, nextTitle, nextBody, allowRetrieval);
					if (!result.ok) {
						setError(true);
						return;
					}
					if (editing === null) {
						setJournals((current) => [result.value, ...current]);
						setNotice("today.journal.notice.created");
					} else {
						setJournals((current) => current.map((item) => item.id === result.value.id ? result.value : item));
						setNotice("today.journal.notice.updated");
					}
					resetJournal();
				} catch {
					setError(true);
				} finally {
					setPending(false);
				}
			}
			function editJournal(journal) {
				setEditing(journal);
				setTitle(journal.title);
				setBody(journal.body);
				setAllowRetrieval(journal.allowRetrieval);
				setDeleteArmed(null);
				setNotice(null);
			}
			async function deleteJournal(journal) {
				const id = String(journal.id);
				if (deleteArmed !== id) {
					setDeleteArmed(id);
					return;
				}
				setPending(true);
				setError(false);
				setNotice(null);
				try {
					if (!(await onDeleteJournal(journal)).ok) {
						setError(true);
						return;
					}
					setJournals((current) => current.filter((item) => item.id !== journal.id));
					if (editing?.id === journal.id) resetJournal();
					setDeleteArmed(null);
					setNotice("today.journal.notice.deleted");
				} catch {
					setError(true);
				} finally {
					setPending(false);
				}
			}
			return (0, react_jsx_runtime.jsxs)("section", {
				className: TodayPractice_module_css_default.practice,
				"data-mind-garden-today-practice": "active",
				"aria-labelledby": "mind-garden-today-title",
				children: [
					(0, react_jsx_runtime.jsxs)("header", {
						className: TodayPractice_module_css_default.header,
						children: [(0, react_jsx_runtime.jsx)("div", { children: (0, react_jsx_runtime.jsx)("h2", {
							id: "mind-garden-today-title",
							children: t("today.practice.title")
						}) }), (0, react_jsx_runtime.jsx)("time", {
							dateTime: today,
							children: today
						})]
					}),
					notice !== null && (0, react_jsx_runtime.jsx)("p", {
						className: GardenSpace_module_css_default.notice,
						role: "status",
						children: t(notice)
					}),
					error && (0, react_jsx_runtime.jsx)("p", {
						className: GardenSpace_module_css_default.error,
						role: "alert",
						children: t("today.error")
					}),
					loading ? (0, react_jsx_runtime.jsx)("p", {
						className: GardenSpace_module_css_default.empty,
						role: "status",
						children: t("today.loading")
					}) : (0, react_jsx_runtime.jsxs)("div", {
						className: TodayPractice_module_css_default.grid,
						children: [
							(0, react_jsx_runtime.jsxs)("form", {
								className: `${GardenSpace_module_css_default.panel} ${TodayPractice_module_css_default.checkin}`,
								onSubmit: (event) => {
									submitCheckin(event);
								},
								children: [
									(0, react_jsx_runtime.jsxs)("div", {
										className: TodayPractice_module_css_default.cardHeading,
										children: [(0, react_jsx_runtime.jsx)("span", {
											"aria-hidden": "true",
											children: (0, react_jsx_runtime.jsx)(CheckinIcon, { size: 19 })
										}), (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("h3", { children: t("today.checkin.title") }), (0, react_jsx_runtime.jsx)("p", { children: t("today.checkin.subtitle") })] })]
									}),
									(0, react_jsx_runtime.jsxs)("fieldset", { children: [(0, react_jsx_runtime.jsx)("legend", { children: t("today.checkin.mood") }), (0, react_jsx_runtime.jsx)("div", {
										className: TodayPractice_module_css_default.scale,
										children: MOODS.map((value) => (0, react_jsx_runtime.jsxs)("button", {
											type: "button",
											"aria-pressed": mood === value,
											onClick: () => {
												setMood(value);
											},
											children: [(0, react_jsx_runtime.jsx)("span", {
												"aria-hidden": "true",
												children: t(`today.mood.${value}.glyph`)
											}), (0, react_jsx_runtime.jsx)("small", { children: t(`today.mood.${value}`) })]
										}, value))
									})] }),
									(0, react_jsx_runtime.jsxs)("fieldset", { children: [(0, react_jsx_runtime.jsx)("legend", { children: t("today.checkin.energy") }), (0, react_jsx_runtime.jsx)("div", {
										className: TodayPractice_module_css_default.energy,
										children: ENERGIES.map((value) => (0, react_jsx_runtime.jsxs)("button", {
											type: "button",
											"aria-pressed": energy === value,
											onClick: () => {
												setEnergy(value);
											},
											children: [value, (0, react_jsx_runtime.jsx)("small", { children: t(`today.energy.${value}`) })]
										}, value))
									})] }),
									(0, react_jsx_runtime.jsxs)("label", {
										className: TodayPractice_module_css_default.field,
										children: [
											(0, react_jsx_runtime.jsx)("span", { children: t("today.checkin.emotions") }),
											(0, react_jsx_runtime.jsx)("input", {
												"aria-label": t("today.checkin.emotions"),
												className: GardenSpace_module_css_default.input,
												value: emotions,
												placeholder: t("today.checkin.emotions.placeholder"),
												onChange: (event) => {
													setEmotions(event.target.value);
												}
											}),
											(0, react_jsx_runtime.jsx)("small", { children: t("today.checkin.emotions.hint") })
										]
									}),
									(0, react_jsx_runtime.jsx)("button", {
										className: GardenSpace_module_css_default.button,
										type: "submit",
										disabled: pending,
										children: t("today.checkin.save")
									}),
									checkins.length > 0 && (0, react_jsx_runtime.jsx)("div", {
										className: TodayPractice_module_css_default.checkinTrail,
										"aria-label": t("today.checkin.saved"),
										children: checkins.map((item) => (0, react_jsx_runtime.jsxs)("span", {
											title: item.emotionWords.join(" · "),
											children: [
												t(`today.mood.${item.mood}.glyph`),
												" ",
												item.energy,
												"/5"
											]
										}, String(item.id)))
									})
								]
							}),
							(0, react_jsx_runtime.jsxs)("form", {
								className: `${GardenSpace_module_css_default.panel} ${TodayPractice_module_css_default.journalComposer}`,
								onSubmit: (event) => {
									submitJournal(event);
								},
								children: [
									(0, react_jsx_runtime.jsxs)("div", {
										className: TodayPractice_module_css_default.cardHeading,
										children: [(0, react_jsx_runtime.jsx)("span", {
											"aria-hidden": "true",
											children: (0, react_jsx_runtime.jsx)(JournalIcon, { size: 19 })
										}), (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("h3", { children: editing === null ? t("today.journal.title") : t("today.journal.editing") }), (0, react_jsx_runtime.jsx)("p", { children: t("today.journal.subtitle") })] })]
									}),
									(0, react_jsx_runtime.jsxs)("label", {
										className: TodayPractice_module_css_default.field,
										children: [(0, react_jsx_runtime.jsx)("span", { children: t("today.journal.name") }), (0, react_jsx_runtime.jsx)("input", {
											"aria-label": t("today.journal.name"),
											className: GardenSpace_module_css_default.input,
											value: title,
											maxLength: 160,
											placeholder: t("today.journal.name.placeholder"),
											onChange: (event) => {
												setTitle(event.target.value);
											}
										})]
									}),
									(0, react_jsx_runtime.jsxs)("label", {
										className: TodayPractice_module_css_default.field,
										children: [(0, react_jsx_runtime.jsx)("span", { children: t("today.journal.body") }), (0, react_jsx_runtime.jsx)("textarea", {
											"aria-label": t("today.journal.body"),
											className: GardenSpace_module_css_default.textarea,
											value: body,
											maxLength: 8e3,
											placeholder: t("today.journal.body.placeholder"),
											onChange: (event) => {
												setBody(event.target.value);
											}
										})]
									}),
									(0, react_jsx_runtime.jsxs)("label", {
										className: TodayPractice_module_css_default.retrieval,
										children: [(0, react_jsx_runtime.jsx)("input", {
											type: "checkbox",
											checked: allowRetrieval,
											onChange: (event) => {
												setAllowRetrieval(event.target.checked);
											}
										}), (0, react_jsx_runtime.jsxs)("span", { children: [(0, react_jsx_runtime.jsx)("strong", { children: t("today.journal.retrieval") }), (0, react_jsx_runtime.jsx)("small", { children: t("today.journal.retrieval.hint") })] })]
									}),
									(0, react_jsx_runtime.jsxs)("div", {
										className: TodayPractice_module_css_default.composerActions,
										children: [(0, react_jsx_runtime.jsx)("button", {
											className: GardenSpace_module_css_default.button,
											type: "submit",
											disabled: pending || body.trim() === "",
											children: editing === null ? t("today.journal.create") : t("today.journal.update")
										}), editing !== null && (0, react_jsx_runtime.jsx)("button", {
											className: GardenSpace_module_css_default.quietButton,
											type: "button",
											disabled: pending,
											onClick: resetJournal,
											children: t("today.journal.cancel")
										})]
									})
								]
							}),
							(0, react_jsx_runtime.jsxs)("section", {
								className: TodayPractice_module_css_default.journalShelf,
								"aria-labelledby": "mind-garden-journal-shelf",
								children: [(0, react_jsx_runtime.jsxs)("div", {
									className: TodayPractice_module_css_default.shelfHeading,
									children: [(0, react_jsx_runtime.jsx)("h3", {
										id: "mind-garden-journal-shelf",
										children: t("today.journal.shelf")
									}), (0, react_jsx_runtime.jsx)("span", { children: t("today.journal.count").replace("{count}", String(journals.length)) })]
								}), journals.length === 0 ? (0, react_jsx_runtime.jsx)("p", {
									className: GardenSpace_module_css_default.empty,
									children: t("today.journal.empty")
								}) : (0, react_jsx_runtime.jsx)("ul", { children: journals.map((journal) => (0, react_jsx_runtime.jsxs)("li", {
									className: `${GardenSpace_module_css_default.panel} ${TodayPractice_module_css_default.journalCard}`,
									children: [(0, react_jsx_runtime.jsxs)("div", { children: [
										(0, react_jsx_runtime.jsx)("span", {
											className: TodayPractice_module_css_default.journalMeta,
											children: journal.allowRetrieval ? t("today.journal.retrievable") : t("today.journal.private")
										}),
										(0, react_jsx_runtime.jsx)("h4", { children: journal.title || t("today.journal.untitled") }),
										(0, react_jsx_runtime.jsx)("p", { children: journal.body })
									] }), (0, react_jsx_runtime.jsxs)("div", {
										className: TodayPractice_module_css_default.journalActions,
										children: [(0, react_jsx_runtime.jsx)("button", {
											className: GardenSpace_module_css_default.quietButton,
											type: "button",
											disabled: pending,
											onClick: () => {
												editJournal(journal);
											},
											children: t("today.journal.edit")
										}), (0, react_jsx_runtime.jsx)("button", {
											className: GardenSpace_module_css_default.dangerButton,
											type: "button",
											disabled: pending,
											onClick: () => {
												deleteJournal(journal);
											},
											children: deleteArmed === String(journal.id) ? t("today.journal.delete.confirm") : t("today.journal.delete")
										})]
									})]
								}, String(journal.id))) })]
							})
						]
					})
				]
			});
		}
		const PRESETS$1 = {
			soft: {
				version: 1,
				preset: "soft",
				rendering: {
					quality: "high",
					pointSize: 2.45,
					density: .94,
					opacity: .98,
					preserveColors: true,
					background: "#100f14"
				},
				depth: {
					strength: 28,
					randomness: 4
				},
				interaction: {
					mode: "repel",
					radius: 1.25,
					strength: 2.8,
					velocityInfluence: .55,
					vortexStrength: 0,
					clickBurst: true
				},
				physics: {
					spring: 5.5,
					damping: .94,
					maxVelocity: 7,
					maxDistance: 8,
					turbulence: .12
				},
				animation: {
					idleStrength: .56,
					idleSpeed: .42,
					paperStrength: .55,
					paperSpeed: .28
				},
				effects: {
					saturation: 1.02,
					exposure: 1.02,
					tint: "#ffffff",
					tintMix: 0,
					bloom: .34,
					vignette: .28
				}
			},
			dust: {
				preset: "dust",
				depth: {
					strength: 28,
					randomness: 9
				},
				interaction: {
					mode: "repel",
					radius: 2.4,
					strength: 7.5,
					velocityInfluence: 1,
					vortexStrength: 0,
					clickBurst: true
				},
				physics: {
					spring: 2.8,
					damping: .975,
					maxVelocity: 8,
					maxDistance: 12,
					turbulence: .5
				},
				animation: {
					idleStrength: .52,
					idleSpeed: .72,
					paperStrength: .22,
					paperSpeed: .46
				},
				effects: {
					saturation: .92,
					exposure: 1.08,
					tint: "#ffe7cf",
					tintMix: .12,
					bloom: .4,
					vignette: .5
				}
			},
			fluid: {
				preset: "fluid",
				depth: {
					strength: 32,
					randomness: 7
				},
				interaction: {
					mode: "vortex",
					radius: 3.2,
					strength: 6.5,
					velocityInfluence: 1.4,
					vortexStrength: 4.2,
					clickBurst: true
				},
				physics: {
					spring: 1.8,
					damping: .987,
					maxVelocity: 10,
					maxDistance: 15,
					turbulence: .36
				},
				animation: {
					idleStrength: .3,
					idleSpeed: .55,
					paperStrength: .82,
					paperSpeed: .52
				},
				effects: {
					saturation: 1.1,
					exposure: 1.02,
					tint: "#d8edff",
					tintMix: .08,
					bloom: .48,
					vignette: .42
				}
			},
			nebula: {
				preset: "nebula",
				depth: {
					strength: 48,
					randomness: 18
				},
				interaction: {
					mode: "wave",
					radius: 3.8,
					strength: 9,
					velocityInfluence: 1.2,
					vortexStrength: 2.4,
					clickBurst: true
				},
				physics: {
					spring: 3.8,
					damping: .97,
					maxVelocity: 12,
					maxDistance: 18,
					turbulence: .72
				},
				animation: {
					idleStrength: .62,
					idleSpeed: .32,
					paperStrength: .38,
					paperSpeed: .22
				},
				effects: {
					saturation: 1.32,
					exposure: .92,
					tint: "#c6b8ff",
					tintMix: .22,
					bloom: .75,
					vignette: .7
				}
			}
		};
		/**
		* Merge one complete preset without discarding caller-adjusted unrelated groups.
		*
		* @param current - Current particle configuration.
		* @param preset - Preset to apply.
		* @returns A new particle configuration containing the preset values.
		*/
		function applyPhotoParticlePreset(current, preset) {
			const values = PRESETS$1[preset];
			return {
				...current,
				...values,
				preset,
				rendering: {
					...current.rendering,
					...values.rendering
				},
				depth: {
					...current.depth,
					...values.depth
				},
				interaction: {
					...current.interaction,
					...values.interaction
				},
				physics: {
					...current.physics,
					...values.physics
				},
				animation: {
					...current.animation,
					...values.animation
				},
				effects: {
					...current.effects,
					...values.effects
				}
			};
		}
		//#endregion
		//#region \0dsh-css:E:\test code\deepseekharness_modified\deepseek-harness\packages\client\ui-mind-garden\src\client\photo-story\PhotoParticleScene.module.css.mjs
		const css$3 = "._4J_DnG_scene{background:var(--mg-photo-bg,var(--dsw-alias-label-primary));isolation:isolate;border:0;border-radius:0;height:100%;min-height:clamp(44rem,100vh,64rem);margin:0;position:relative;overflow:hidden}._4J_DnG_host,._4J_DnG_host canvas,._4J_DnG_fallback,._4J_DnG_fallback img,._4J_DnG_vignette{width:100%;height:100%;position:absolute;inset:0}._4J_DnG_host canvas{cursor:grab;touch-action:none;display:block}._4J_DnG_host canvas:active{cursor:grabbing}._4J_DnG_status,._4J_DnG_fallback span{z-index:3;border:1px solid color-mix(in srgb, var(--dsw-alias-label-primary-inverted) 14%, transparent);color:color-mix(in srgb, var(--dsw-alias-label-primary-inverted) 78%, transparent);background:color-mix(in srgb, var(--dsw-alias-bg-mask-drop) 48%, transparent);backdrop-filter:blur(14px);border-radius:6px;padding:.5rem .75rem;font-size:.72rem;position:absolute;inset:auto 50% 1rem auto;transform:translate(50%)}._4J_DnG_fallback img{object-fit:contain;background:var(--mg-photo-bg,var(--dsw-alias-label-primary))}._4J_DnG_vignette{z-index:2;pointer-events:none;background:radial-gradient(ellipse at 52% 48%, transparent 34%, color-mix(in srgb, var(--dsw-alias-bg-mask-drop) 36%, transparent) 76%, color-mix(in srgb, var(--dsw-alias-bg-mask-drop) 82%, transparent) 132%), linear-gradient(90deg, color-mix(in srgb, var(--dsw-alias-bg-mask-drop) 58%, transparent), transparent 24% 70%, color-mix(in srgb, var(--dsw-alias-bg-mask-drop) 52%, transparent))}@media (width<=720px){._4J_DnG_scene{min-height:min(68vh,38rem)}}@media (prefers-reduced-motion:reduce){._4J_DnG_host canvas{cursor:default}}";
		const tagId$3 = "@deepseek-ai/dsh-mind-garden/PhotoParticleScene.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$3) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-mind-garden";
			tag.dataset.pluginCss = tagId$3;
			tag.textContent = css$3;
			document.head.appendChild(tag);
		}
		var PhotoParticleScene_module_css_default = {
			"fallback": "_4J_DnG_fallback",
			"host": "_4J_DnG_host",
			"scene": "_4J_DnG_scene",
			"status": "_4J_DnG_status",
			"vignette": "_4J_DnG_vignette"
		};
		//#endregion
		//#region lib/types/client/photo-story/PhotoParticleSceneView.js
		/** Lightweight React adapter for the lazily loaded photo particle renderer. */
		function loadImage(src) {
			return new Promise((resolve, reject) => {
				const image = new Image();
				image.decoding = "async";
				image.onload = () => {
					resolve(image);
				};
				image.onerror = () => {
					reject(/* @__PURE__ */ new Error("photo-decode-failed"));
				};
				image.src = src;
			});
		}
		/** Keep a verified-image fallback visible while the optional WebGL renderer loads. */
		function PhotoParticleScene({ src, alt, config, labels, onCount, recomposeToken = 0 }) {
			const [host, setHost] = (0, react.useState)(null);
			const [state, setState] = (0, react.useState)("loading");
			const [reducedMotion, setReducedMotion] = (0, react.useState)(() => typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
			const controllerRef = (0, react.useRef)(null);
			const configRef = (0, react.useRef)(config);
			const onCountRef = (0, react.useRef)(onCount);
			const recomposeRef = (0, react.useRef)(recomposeToken);
			configRef.current = config;
			onCountRef.current = onCount;
			(0, react.useEffect)(() => {
				if (typeof window.matchMedia !== "function") return;
				const query = window.matchMedia("(prefers-reduced-motion: reduce)");
				const update = () => {
					setReducedMotion(query.matches);
				};
				update();
				query.addEventListener("change", update);
				return () => {
					query.removeEventListener("change", update);
				};
			}, []);
			(0, react.useEffect)(() => {
				controllerRef.current?.update(config);
			}, [config]);
			(0, react.useEffect)(() => {
				if (recomposeRef.current === recomposeToken) return;
				recomposeRef.current = recomposeToken;
				controllerRef.current?.recompose();
			}, [recomposeToken]);
			(0, react.useEffect)(() => {
				if (host === null) return;
				if (reducedMotion) {
					controllerRef.current?.dispose();
					controllerRef.current = null;
					host.replaceChildren();
					onCountRef.current?.(0);
					setState("reduced");
					return;
				}
				let disposed = false;
				setState("loading");
				Promise.all([loadImage(src), loadMindGardenScenes()]).then(([image, scenes]) => {
					if (disposed) return;
					const controller = scenes.mountPhotoParticleScene(host, image, configRef.current, false);
					controllerRef.current = controller;
					onCountRef.current?.(controller.count);
					setState("ready");
				}).catch(() => {
					if (!disposed) setState("fallback");
				});
				return () => {
					disposed = true;
					controllerRef.current?.dispose();
					controllerRef.current = null;
					host.replaceChildren();
				};
			}, [
				host,
				reducedMotion,
				src
			]);
			return (0, react_jsx_runtime.jsxs)("figure", {
				className: PhotoParticleScene_module_css_default.scene,
				"data-render-state": state,
				style: { "--mg-photo-bg": config.rendering.background },
				children: [
					(0, react_jsx_runtime.jsx)("div", {
						className: PhotoParticleScene_module_css_default.host,
						ref: setHost,
						"aria-label": labels.scene,
						role: "img"
					}),
					state === "loading" && (0, react_jsx_runtime.jsx)("span", {
						className: PhotoParticleScene_module_css_default.status,
						role: "status",
						children: labels.loading
					}),
					(state === "fallback" || state === "reduced") && (0, react_jsx_runtime.jsxs)("div", {
						className: PhotoParticleScene_module_css_default.fallback,
						children: [(0, react_jsx_runtime.jsx)("img", {
							src,
							alt
						}), (0, react_jsx_runtime.jsx)("span", {
							role: "status",
							children: state === "reduced" ? labels.reduced : labels.fallback
						})]
					}),
					(0, react_jsx_runtime.jsx)("i", {
						className: PhotoParticleScene_module_css_default.vignette,
						"aria-hidden": "true",
						style: { opacity: config.effects.vignette }
					})
				]
			});
		}
		//#endregion
		//#region lib/types/client/photo-story/photo-upload.js
		/** Browser-side admission preparation for deployment-bounded photo stories. */
		const WEBP_QUALITY_STEPS = [
			.92,
			.84,
			.76,
			.68,
			.6,
			.52
		];
		function targetScale(width, height, limits) {
			return Math.min(1, limits.maxImageDimension / width, limits.maxImageDimension / height, Math.sqrt(limits.maxImagePixels / (width * height)));
		}
		function webpName(name) {
			return `${name.replace(/\.[^.]+$/, "") || "photo"}.webp`;
		}
		function encodeWebp(canvas, quality) {
			return new Promise((resolve) => {
				canvas.toBlob((blob) => {
					resolve(blob?.type === "image/webp" ? blob : null);
				}, "image/webp", quality);
			});
		}
		/**
		* Keep an admitted file unchanged or produce a bounded high-quality WebP.
		* Animated GIF files are never flattened; an oversized GIF is rejected with
		* a specific recovery reason.
		* @param file - browser-selected PNG, JPEG, WebP, or GIF.
		* @param limits - live attachment limits projected by the Host.
		* @returns the original file, an optimized WebP, or an actionable failure.
		*/
		async function preparePhotoUpload(file, limits) {
			if (!limits.mediaTypes.includes(file.type)) return {
				ok: false,
				reason: "UNSUPPORTED_MEDIA_TYPE"
			};
			if (typeof createImageBitmap !== "function") return file.size <= limits.maxImageBytes ? {
				ok: true,
				file,
				optimized: false
			} : {
				ok: false,
				reason: "IMAGE_TOO_LARGE"
			};
			let bitmap;
			try {
				bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
			} catch {
				return {
					ok: false,
					reason: "INVALID_IMAGE"
				};
			}
			try {
				if (bitmap.width < 1 || bitmap.height < 1) return {
					ok: false,
					reason: "INVALID_IMAGE"
				};
				const scale = targetScale(bitmap.width, bitmap.height, limits);
				const withinDimensions = scale >= 1;
				if (withinDimensions && file.size <= limits.maxImageBytes) return {
					ok: true,
					file,
					optimized: false
				};
				if (file.type === "image/gif") return {
					ok: false,
					reason: withinDimensions ? "IMAGE_TOO_LARGE" : "IMAGE_DIMENSION_TOO_LARGE"
				};
				const canvas = document.createElement("canvas");
				const context = canvas.getContext("2d", { alpha: true });
				if (context === null) return {
					ok: false,
					reason: "BROWSER_TRANSCODE_FAILED"
				};
				for (let index = 0; index < WEBP_QUALITY_STEPS.length; index += 1) {
					const reduction = Math.pow(.88, Math.floor(index / 2));
					canvas.width = Math.max(1, Math.floor(bitmap.width * scale * reduction));
					canvas.height = Math.max(1, Math.floor(bitmap.height * scale * reduction));
					context.clearRect(0, 0, canvas.width, canvas.height);
					context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
					const blob = await encodeWebp(canvas, WEBP_QUALITY_STEPS[index] ?? .52);
					if (blob !== null && blob.size <= limits.maxImageBytes) return {
						ok: true,
						file: new File([blob], webpName(file.name), {
							type: "image/webp",
							lastModified: file.lastModified
						}),
						optimized: true
					};
				}
				return {
					ok: false,
					reason: "IMAGE_TOO_LARGE"
				};
			} finally {
				bitmap.close();
			}
		}
		//#endregion
		//#region \0dsh-css:E:\test code\deepseekharness_modified\deepseek-harness\packages\client\ui-mind-garden\src\client\photo-story\PhotoStorySpace.module.css.mjs
		const css$2 = "._2tggoa_album,._2tggoa_story{--photo-ink:#f7efe2;--photo-paper:#f4eadb;--photo-muted:#c9b9a5;--photo-amber:#d7a55c;--photo-amber-strong:#efbd70;--photo-umber:#1a130f;--photo-night:#0d0c0d;--photo-surface:#1d1612d6;box-sizing:border-box;width:100%;min-height:max(680px,100dvh - 126px);color:var(--photo-ink);background:var(--photo-night);font-family:var(--mg-font-sans,\"Noto Sans SC\", sans-serif);isolation:isolate;position:relative;overflow:hidden}._2tggoa_album ::selection,._2tggoa_story ::selection{color:#17110d;background:#e6b86f}._2tggoa_album button,._2tggoa_album input,._2tggoa_album textarea,._2tggoa_story button,._2tggoa_story input,._2tggoa_story textarea{font:inherit}._2tggoa_album button,._2tggoa_story button{-webkit-tap-highlight-color:transparent}._2tggoa_fileInput{clip:rect(0, 0, 0, 0);white-space:nowrap;clip-path:inset(50%);width:1px;height:1px;position:absolute;overflow:hidden}._2tggoa_album{background:radial-gradient(circle at 86% 8%,#b576371f,#0000 28%),#100d0b;min-height:max(720px,100dvh - 126px);padding:118px clamp(20px,3.2vw,48px) 42px}._2tggoa_album:before,._2tggoa_album:after{z-index:-1;content:\"\";pointer-events:none;position:absolute;inset:0}._2tggoa_album:before{opacity:0;background-image:var(--mg-photo-stage);background-position:50%;background-size:cover;transition:opacity .48s ease-out}._2tggoa_album:after{background:linear-gradient(#08070759,#0000 28%,#0807078a)}._2tggoa_album[data-empty=true]:before{opacity:1}._2tggoa_album[data-empty=true]:after{background:linear-gradient(90deg,#0a08079e 0,#0000 42%,#0a080747 100%),linear-gradient(#0a08076b,#0000 38%,#0a080794)}._2tggoa_aurora{display:none}._2tggoa_albumHeader{z-index:4;box-sizing:border-box;background:linear-gradient(#0a0807eb,#0a0807a8 68%,#0000);justify-content:space-between;align-items:center;gap:28px;min-height:94px;padding:18px clamp(20px,3.2vw,48px);display:flex;position:absolute;top:0;left:0;right:0}._2tggoa_albumHeader>div:first-child{min-width:0}._2tggoa_albumHeader h1,._2tggoa_storyHeader h1{color:#fff8eb;font-family:var(--mg-font-display,\"Noto Serif SC\", serif);letter-spacing:-.03em;text-wrap:balance;margin:0;font-weight:520}._2tggoa_albumHeader h1{font-size:clamp(30px,3vw,42px);line-height:1.05}._2tggoa_albumHeader p{max-width:54ch;color:color-mix(in srgb, var(--photo-muted) 88%, white 12%);-webkit-line-clamp:1;-webkit-box-orient:vertical;margin:7px 0 0;font-size:13px;line-height:1.55;display:-webkit-box;overflow:hidden}._2tggoa_albumHeader strong{color:var(--photo-amber-strong);margin-top:5px;font-size:12px;font-weight:600;display:block}._2tggoa_headerActions,._2tggoa_viewSwitch,._2tggoa_sceneTools,._2tggoa_editorActions,._2tggoa_carouselControls{align-items:center;display:flex}._2tggoa_headerActions{backdrop-filter:blur(16px)saturate(.9);background:#16110ec7;border-radius:14px;flex:none;gap:8px;padding:5px;box-shadow:0 14px 38px #0000003d}._2tggoa_viewSwitch{gap:3px}._2tggoa_viewSwitch button,._2tggoa_upload,._2tggoa_back,._2tggoa_preview,._2tggoa_pagination button,._2tggoa_carouselControls button{min-height:40px;color:var(--photo-muted);cursor:pointer;background:0 0;border:0;border-radius:10px;transition:color .17s,background .17s,transform .17s}._2tggoa_viewSwitch button{min-width:74px;padding:0 13px;font-size:12px}._2tggoa_viewSwitch button[aria-selected=true]{color:#21170f;background:var(--photo-amber-strong)}._2tggoa_upload{color:#21170f;background:#f2e6d4;justify-content:center;align-items:center;gap:7px;min-width:112px;padding:0 15px;font-size:12px;font-weight:650;display:inline-flex}._2tggoa_upload>svg,._2tggoa_preview>svg{flex:0 0 16px;width:16px;height:16px;display:block}._2tggoa_viewSwitch button:hover,._2tggoa_back:hover,._2tggoa_preview:hover,._2tggoa_carouselControls button:hover:not(:disabled){color:#fff8eb;background:#fff8eb1a}._2tggoa_upload:hover:not(:disabled){background:#fff5e6;transform:translateY(-1px)}._2tggoa_uploadHint{z-index:2;color:#ecdecc94;max-width:54ch;margin:0;font-size:11px;line-height:1.5;position:absolute;bottom:18px;right:clamp(20px,3.2vw,48px)}._2tggoa_uploadNotice{z-index:8;box-sizing:border-box;color:#f8e8cf;background:#424633e6;border-radius:12px;width:min(620px,100% - 32px);min-height:42px;margin:0 auto 16px;padding:11px 16px;font-size:12px;line-height:1.55;position:relative;box-shadow:0 16px 44px #00000038}._2tggoa_error{z-index:8;box-sizing:border-box;color:#ffe7d7;background:#692e21e0;border-radius:12px;justify-content:space-between;align-items:center;gap:16px;width:min(560px,100% - 32px);min-height:44px;margin:0 auto 18px;padding:9px 12px 9px 16px;font-size:13px;display:flex;position:relative;box-shadow:0 16px 44px #0000003d}._2tggoa_error button{color:#3a1a12;cursor:pointer;background:#ffe2cf;border:0;border-radius:8px;min-height:34px;padding:0 12px}._2tggoa_empty{z-index:2;align-content:end;justify-items:end;min-height:calc(max(720px,100dvh - 126px) - 160px);padding:0 clamp(12px,3vw,34px) 58px;display:grid;position:relative}._2tggoa_emptyCopy{backdrop-filter:blur(18px);background:#18110dc7;border-radius:14px;justify-items:start;gap:12px;width:min(410px,100%);padding:25px 28px 28px;display:grid;box-shadow:0 24px 70px #00000052}._2tggoa_emptyCopy h2{color:#fff7ea;max-width:11ch;font-family:var(--mg-font-display,\"Noto Serif SC\", serif);letter-spacing:-.03em;margin:0;font-size:clamp(28px,3vw,42px);font-weight:520;line-height:1.12}._2tggoa_emptyCopy p{color:#d8c8b4;max-width:46ch;margin:0;font-size:12px;line-height:1.7}._2tggoa_emptyCopy button,._2tggoa_save,._2tggoa_dialogueForm button,._2tggoa_observationGate button{color:#20160f;background:var(--photo-amber-strong);cursor:pointer;border:0;border-radius:10px;min-height:42px;padding:0 17px;font-weight:650}._2tggoa_grid{z-index:2;grid-template-columns:repeat(12,minmax(0,1fr));grid-auto-rows:166px;gap:16px;width:min(1320px,100%);min-height:548px;margin:0 auto;display:grid;position:relative}._2tggoa_card{min-width:0;min-height:0}._2tggoa_card:first-child{grid-area:span 3/span 7}._2tggoa_card:nth-child(2){grid-area:span 2/span 5}._2tggoa_card:nth-child(3){grid-column:span 3}._2tggoa_card:nth-child(4){grid-column:span 2}._2tggoa_card:nth-child(n+5){grid-column:span 3}._2tggoa_card>button{color:#fff8eb;cursor:pointer;background:#211914;border:0;border-radius:13px;width:100%;height:100%;padding:0;display:block;position:relative;overflow:hidden;transform:translateZ(0);box-shadow:0 18px 42px #00000038}._2tggoa_card img,._2tggoa_dynamicCard img,._2tggoa_memoryRail img{object-fit:cover;width:100%;height:100%;display:block}._2tggoa_card img{transition:filter .42s,transform .68s cubic-bezier(.16,1,.3,1)}._2tggoa_card>button:hover img,._2tggoa_card>button:focus-visible img{filter:saturate(1.05)brightness(1.04);transform:scale(1.025)}._2tggoa_shimmer{background:#30231b;width:100%;height:100%;animation:1.6s ease-in-out infinite alternate _2tggoa_shimmer;display:block}._2tggoa_cardShade{pointer-events:none;background:linear-gradient(#0000 44%,#070504c7 100%);position:absolute;inset:0}._2tggoa_index{z-index:2;color:#f4c878;font-variant-numeric:tabular-nums;text-shadow:0 2px 12px #000c;font-size:9px;position:absolute;top:13px;left:14px}._2tggoa_cardCopy{z-index:2;text-align:left;gap:3px;display:grid;position:absolute;bottom:15px;left:16px;right:16px}._2tggoa_cardCopy strong{font-family:var(--mg-font-display,\"Noto Serif SC\", serif);text-overflow:ellipsis;white-space:nowrap;font-size:clamp(15px,1.7vw,23px);font-weight:520;line-height:1.25;overflow:hidden}._2tggoa_cardCopy small{color:#f4eadac7;font-size:11px}._2tggoa_pagination{z-index:3;color:#c9b7a1;background:#1b1410c2;border-radius:12px;align-items:center;gap:10px;width:fit-content;margin:22px auto 0;padding:5px;display:flex;position:relative}._2tggoa_pagination button{padding:0 13px;font-size:12px}._2tggoa_pagination span{text-align:center;font-variant-numeric:tabular-nums;min-width:74px;font-size:11px}._2tggoa_pagination button:disabled,._2tggoa_carouselControls button:disabled,._2tggoa_upload:disabled{opacity:.42;cursor:not-allowed}._2tggoa_dynamic{z-index:2;touch-action:pan-y;background:#18120f;border-radius:14px;width:min(1180px,100%);min-height:570px;margin:0 auto;position:relative;overflow:hidden;box-shadow:0 24px 70px #00000057}._2tggoa_ring{perspective:none;position:absolute;inset:0}._2tggoa_dynamicCard{color:#fff6e8;cursor:pointer;opacity:0;pointer-events:none;background:#1b1511;border:0;width:100%;height:100%;padding:0;transition:opacity .52s ease-out,transform .9s cubic-bezier(.16,1,.3,1);display:block;position:absolute;inset:0;overflow:hidden;transform:scale(1.035)}._2tggoa_dynamicCard[data-active=true]{z-index:1;opacity:1;pointer-events:auto;transform:scale(1)}._2tggoa_dynamicCard:after{content:\"\";background:linear-gradient(#0000 52%,#080605b8);position:absolute;inset:0}._2tggoa_dynamicCard>span:last-child{z-index:2;font-family:var(--mg-font-display,\"Noto Serif SC\", serif);letter-spacing:-.03em;text-overflow:ellipsis;text-shadow:0 12px 36px #000000b8;white-space:nowrap;font-size:clamp(24px,4vw,46px);font-weight:520;line-height:1.18;position:absolute;bottom:34px;left:32px;right:32px;overflow:hidden}._2tggoa_carouselControls{z-index:5;color:#d9c8b1;backdrop-filter:blur(14px);background:#110d0bc2;border-radius:12px;gap:3px;padding:5px;position:absolute;top:20px;right:20px}._2tggoa_carouselControls button{place-items:center;width:38px;min-height:38px;padding:0;display:grid}._2tggoa_carouselControls span{text-overflow:ellipsis;white-space:nowrap;max-width:280px;padding:0 10px;font-size:12px;overflow:hidden}._2tggoa_dynamic>p{z-index:4;color:#f4e8d7ad;margin:0;font-size:11px;position:absolute;bottom:14px;left:20px}._2tggoa_story{background:#09090b;height:max(680px,100dvh - 126px)}._2tggoa_story:after{z-index:1;content:\"\";pointer-events:none;background:linear-gradient(#0606079e 0,#0000 22% 70%,#0706067a 100%),linear-gradient(90deg,#07060638,#0000 27% 76%,#07060657);position:absolute;inset:0}._2tggoa_storyHeader{z-index:8;pointer-events:none;justify-content:space-between;align-items:flex-start;gap:24px;padding:24px clamp(20px,3.4vw,48px);display:flex;position:absolute;top:0;left:0;right:0}._2tggoa_storyHeading{pointer-events:auto;align-items:center;gap:16px;min-width:0;display:flex}._2tggoa_storyHeader h1{letter-spacing:-.035em;text-shadow:0 12px 44px #000000d1;max-width:17ch;font-size:clamp(30px,3.35vw,49px);line-height:1.08}._2tggoa_back,._2tggoa_preview{color:#e4d5c2;backdrop-filter:blur(14px);background:#140f0da8;justify-content:center;align-items:center;gap:7px;min-width:0;padding:0 13px;font-size:12px;display:inline-flex;box-shadow:0 10px 34px #00000038}._2tggoa_storyMeta{color:#eadecdc2;backdrop-filter:blur(14px);pointer-events:auto;background:#0f0c0b8a;border-radius:11px;flex-wrap:wrap;justify-content:flex-end;gap:5px 14px;max-width:390px;padding:10px 13px;font-size:11px;display:flex;box-shadow:0 10px 32px #0003}._2tggoa_story>._2tggoa_error{z-index:14;margin:0;position:absolute;top:98px;left:50%;transform:translate(-50%)}._2tggoa_storyGrid{animation:.72s cubic-bezier(.16,1,.3,1) both _2tggoa_memoryStageIn;position:absolute;inset:0}._2tggoa_sceneColumn{background:#0c0b0c;position:absolute;inset:0;overflow:hidden}._2tggoa_sceneColumn>:first-child:not(._2tggoa_sceneTools){width:100%;height:100%}._2tggoa_sceneLoading{color:#d9c9b3;background:linear-gradient(90deg, #0b090861, transparent 50%), var(--mg-photo-stage,#17110e) center / cover no-repeat;place-items:center;height:100%;font-size:12px;display:grid}._2tggoa_sceneTools{z-index:10;backdrop-filter:blur(18px)saturate(.86);background:#100c0ab8;border-radius:14px;gap:3px;padding:6px;position:absolute;bottom:clamp(220px,26vh,280px);left:clamp(18px,3vw,42px);box-shadow:0 18px 52px #00000057}._2tggoa_preview{min-height:42px}._2tggoa_sceneTools ._2tggoa_preview{color:#d9cab7;box-shadow:none;background:0 0;padding-inline:12px}._2tggoa_sceneTools ._2tggoa_preview:hover,._2tggoa_sceneTools ._2tggoa_preview[aria-pressed=true]{color:#21170f;background:#e3b66d}._2tggoa_editor{z-index:9;color:#f5eadc;width:min(356px,100% - 36px);max-height:calc(100% - 236px);box-shadow:none;background:0 0;border-radius:14px;flex-direction:column;gap:6px;display:flex;position:absolute;top:132px;right:clamp(18px,2.8vw,40px);overflow:visible}._2tggoa_editorForm,._2tggoa_photoDialogue{backdrop-filter:blur(20px)saturate(.86);scrollbar-color:#ddb4706b transparent;scrollbar-width:thin;background:#16110ea3;border-radius:14px;min-height:0;max-height:100%;padding:18px 20px 20px;overflow:auto;box-shadow:0 24px 72px #00000047}._2tggoa_editorForm[hidden],._2tggoa_photoDialogue[hidden]{display:none}._2tggoa_editorForm{gap:15px}._2tggoa_editorForm,._2tggoa_editorForm label,._2tggoa_particleEditor,._2tggoa_photoDialogue,._2tggoa_photoDialogue header,._2tggoa_grounding,._2tggoa_dialogueTurns,._2tggoa_dialogueTurns article,._2tggoa_dialogueForm,._2tggoa_range{display:grid}._2tggoa_editorForm label,._2tggoa_dialogueForm{gap:7px}._2tggoa_editorForm label>span,._2tggoa_dialogueForm>label,._2tggoa_range>span{color:#d8c7b2;font-size:11px;font-weight:600;line-height:1.45}._2tggoa_editorForm input,._2tggoa_editorForm textarea,._2tggoa_dialogueForm textarea{box-sizing:border-box;color:#fff8ec;width:100%;min-height:40px;caret-color:var(--photo-amber-strong);resize:vertical;background:#08070761;border:0;border-radius:10px;outline:1px solid #f8e7ce24;padding:10px 12px;font-size:13px;line-height:1.6}._2tggoa_editorForm textarea{min-height:82px}._2tggoa_particleEditor{gap:12px;padding-top:3px}._2tggoa_particleEditor h2,._2tggoa_photoDialogue h2,._2tggoa_observationGate h3{color:#fff7e9;font-family:var(--mg-font-display,\"Noto Serif SC\", serif);margin:0;font-weight:540}._2tggoa_particleEditor h2,._2tggoa_photoDialogue h2{font-size:19px}._2tggoa_presets,._2tggoa_quickReplies{flex-wrap:wrap;gap:6px;display:flex}._2tggoa_presets button,._2tggoa_quickReplies button,._2tggoa_delete{color:#d4c3af;cursor:pointer;background:#fff8eb12;border:0;border-radius:9px;min-height:38px;padding:0 11px;font-size:11px}._2tggoa_presets button[data-active=true]{color:#24180f;background:#dfb268}._2tggoa_range{gap:6px}._2tggoa_range>span{justify-content:space-between;display:flex}._2tggoa_range output{color:var(--photo-amber-strong);font-variant-numeric:tabular-nums}._2tggoa_range input{accent-color:#d8a95f;outline:none;min-height:22px;padding:0}._2tggoa_saved,._2tggoa_deleteHint{color:#e7c483;margin:0;font-size:11px;line-height:1.5}._2tggoa_editorActions{gap:8px}._2tggoa_save,._2tggoa_delete{flex:1}._2tggoa_delete{color:#efc1b4;background:#7e372647}._2tggoa_photoDialogue{gap:16px}._2tggoa_photoDialogue header{gap:6px}._2tggoa_photoDialogue>header h2{display:none}._2tggoa_photoDialogue header p,._2tggoa_observationGate p,._2tggoa_grounding p,._2tggoa_dialogueTurns p{color:#d4c4b1;margin:0;font-size:13px;line-height:1.65}._2tggoa_observationGate{background:0 0;gap:12px;padding:2px 0 0;display:grid}._2tggoa_observationGate h3{margin-bottom:6px;font-size:15px}._2tggoa_grounding{gap:9px;padding:15px 0}._2tggoa_grounding>span,._2tggoa_dialogueTurns article>span{color:#e7c07d;font-size:10px;font-weight:650}._2tggoa_grounding ul{flex-wrap:wrap;gap:5px;margin:0;padding:0;list-style:none;display:flex}._2tggoa_grounding li{color:#dfceb9;background:#fff8eb12;border-radius:999px;padding:5px 8px;font-size:10px}._2tggoa_grounding details{color:#c8b6a0;font-size:11px}._2tggoa_dialogueTurns{gap:12px}._2tggoa_dialogueTurns article{background:#fff8eb12;border-radius:12px 12px 12px 4px;gap:4px;max-width:92%;padding:12px 14px}._2tggoa_dialogueTurns article[data-role=user]{background:#d3a0522b;border-radius:12px 12px 4px;justify-self:end}._2tggoa_dialogueForm>div{grid-template-columns:1fr auto;gap:8px;display:grid}._2tggoa_dialogueForm textarea{min-height:70px}._2tggoa_dialogueForm button{align-self:end}._2tggoa_memoryRail{z-index:10;backdrop-filter:blur(16px);scrollbar-width:none;background:#0f0c0ab3;border-radius:13px;gap:7px;width:min(540px,100% - 500px);padding:7px;display:flex;position:absolute;bottom:22px;left:clamp(18px,3vw,42px);overflow-x:auto;box-shadow:0 18px 54px #0000004d}._2tggoa_memoryRail::-webkit-scrollbar{display:none}._2tggoa_memoryRail button{cursor:pointer;opacity:.56;background:#241b16;border:0;border-radius:8px;outline:1px solid #0000;flex:0 0 72px;width:72px;height:52px;padding:0;transition:opacity .17s,outline-color .17s,transform .17s;position:relative;overflow:hidden}._2tggoa_memoryRail button:hover,._2tggoa_memoryRail button[data-active=true]{opacity:1;outline-color:#e6b96f;transform:translateY(-2px)}._2tggoa_memoryRail button>span:last-child{color:#fff1dc;text-shadow:0 2px 8px #000;font-size:7px;position:absolute;bottom:4px;right:5px}._2tggoa_previewModal._2tggoa_previewModal{--dsw-alias-label-primary:#fff7e9;--dsw-alias-label-secondary:#e5d2b8;--dsw-alias-interactive-bg-hover:#efbd7024;background:#0c0b0b;border-color:#efbd7047;border-radius:18px;width:min(920px,100vw - 40px);max-width:calc(100vw - 40px);max-height:calc(100dvh - 40px);padding-block-end:0;box-shadow:0 34px 100px #0000008f}._2tggoa_previewModalContent{color:#fff7e9;background:#0c0b0b;width:100%;max-height:calc(100dvh - 40px);overflow:hidden}._2tggoa_previewModalContent>:last-child{align-items:center;margin-block-start:0;padding:0 20px 20px}._2tggoa_previewImage._2tggoa_previewImage{object-fit:contain;background:#090909;border-radius:10px;width:100%;max-width:100%;height:auto;max-height:calc(100dvh - 120px);display:block}._2tggoa_album button:focus-visible,._2tggoa_story button:focus-visible,._2tggoa_story input:focus-visible,._2tggoa_story textarea:focus-visible{outline-offset:3px;outline:2px solid #efbd70}._2tggoa_story input:focus-visible,._2tggoa_story textarea:focus-visible{outline-offset:1px}@keyframes _2tggoa_memoryStageIn{0%{filter:blur(8px);opacity:.82;transform:scale(1.018)}to{filter:blur();opacity:1;transform:scale(1)}}@keyframes _2tggoa_shimmer{0%{filter:brightness(.78)}to{filter:brightness(1.08)}}@media (width<=980px){._2tggoa_grid{grid-auto-rows:154px}._2tggoa_card:first-child{grid-column:span 8}._2tggoa_card:nth-child(2),._2tggoa_card:nth-child(3),._2tggoa_card:nth-child(n+4){grid-column:span 4}._2tggoa_editor{width:min(350px,100% - 32px)}._2tggoa_memoryRail{width:min(420px,100% - 410px)}}@media (width<=720px){._2tggoa_album,._2tggoa_story{min-height:max(740px,100dvh - 116px)}._2tggoa_album{padding:154px 13px 34px}._2tggoa_albumHeader{align-content:start;align-items:stretch;gap:11px;min-height:140px;padding:15px 14px;display:grid}._2tggoa_albumHeader h1{font-size:30px}._2tggoa_albumHeader p,._2tggoa_albumHeader strong{display:none}._2tggoa_headerActions{box-sizing:border-box;gap:4px;width:100%;padding:4px}._2tggoa_viewSwitch{flex:1}._2tggoa_viewSwitch button{flex:1;min-width:0;padding:0 9px}._2tggoa_upload{min-width:44px;padding:0 11px;font-size:0}._2tggoa_upload>svg{margin:0}._2tggoa_grid{grid-template-columns:repeat(2,minmax(0,1fr));grid-auto-rows:152px;gap:10px;min-height:0}._2tggoa_card:first-child{grid-area:span 2/span 2}._2tggoa_card:nth-child(n+2){grid-area:span 1/span 1}._2tggoa_cardCopy strong{font-size:15px}._2tggoa_empty{align-content:end;min-height:calc(max(740px,100dvh - 116px) - 128px);padding:0 0 32px}._2tggoa_emptyCopy{backdrop-filter:none;width:min(360px,100% - 4px);padding:21px 20px 23px}._2tggoa_dynamic{min-height:600px}._2tggoa_carouselControls{backdrop-filter:none;justify-content:center;top:12px;left:12px;right:12px}._2tggoa_carouselControls span{flex:1}._2tggoa_story{height:max(760px,100dvh - 116px)}._2tggoa_storyHeader{padding:16px 14px;display:block}._2tggoa_storyHeading{justify-content:space-between;align-items:flex-start}._2tggoa_storyHeader h1{max-width:10ch;font-size:30px}._2tggoa_storyMeta{display:none}._2tggoa_back,._2tggoa_preview{backdrop-filter:none;min-height:42px}._2tggoa_sceneTools{backdrop-filter:none;scrollbar-width:none;padding:4px;inset:100px 14px auto;overflow-x:auto}._2tggoa_sceneTools::-webkit-scrollbar{display:none}._2tggoa_sceneTools ._2tggoa_preview{min-width:max-content;padding-inline:10px;font-size:10px}._2tggoa_editor{width:auto;max-height:46%;inset:auto 12px 12px}._2tggoa_editorForm,._2tggoa_photoDialogue{padding:14px 16px 17px}._2tggoa_editorForm input,._2tggoa_editorForm textarea,._2tggoa_dialogueForm textarea{font-size:16px}._2tggoa_memoryRail{display:none}._2tggoa_dialogueForm>div{grid-template-columns:1fr}._2tggoa_dialogueForm button{justify-self:stretch}._2tggoa_uploadHint{display:none}}@media (width<=420px){._2tggoa_albumHeader h1,._2tggoa_storyHeader h1{font-size:27px}._2tggoa_viewSwitch button{text-overflow:clip;white-space:nowrap;width:38px;padding:0 7px;overflow:hidden}._2tggoa_grid{grid-auto-rows:138px}._2tggoa_sceneTools{box-sizing:border-box;grid-template-columns:repeat(4,minmax(0,1fr));width:calc(100% - 28px);display:grid}._2tggoa_sceneTools ._2tggoa_preview{gap:4px;min-width:0;padding-inline:4px;overflow:hidden}._2tggoa_sceneTools ._2tggoa_preview span{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}._2tggoa_editor{max-height:49%}}@media (prefers-reduced-motion:reduce){._2tggoa_storyGrid,._2tggoa_shimmer{animation:none}._2tggoa_card img,._2tggoa_dynamicCard,._2tggoa_memoryRail button{transition:none}._2tggoa_headerActions,._2tggoa_emptyCopy,._2tggoa_carouselControls,._2tggoa_back,._2tggoa_preview,._2tggoa_sceneTools,._2tggoa_editorForm,._2tggoa_photoDialogue,._2tggoa_storyMeta,._2tggoa_memoryRail{backdrop-filter:none}}";
		const tagId$2 = "@deepseek-ai/dsh-mind-garden/PhotoStorySpace.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$2) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-mind-garden";
			tag.dataset.pluginCss = tagId$2;
			tag.textContent = css$2;
			document.head.appendChild(tag);
		}
		var PhotoStorySpace_module_css_default = {
			"album": "_2tggoa_album",
			"albumHeader": "_2tggoa_albumHeader",
			"aurora": "_2tggoa_aurora",
			"back": "_2tggoa_back",
			"card": "_2tggoa_card",
			"cardCopy": "_2tggoa_cardCopy",
			"cardShade": "_2tggoa_cardShade",
			"carouselControls": "_2tggoa_carouselControls",
			"delete": "_2tggoa_delete",
			"deleteHint": "_2tggoa_deleteHint",
			"dialogueForm": "_2tggoa_dialogueForm",
			"dialogueTurns": "_2tggoa_dialogueTurns",
			"dynamic": "_2tggoa_dynamic",
			"dynamicCard": "_2tggoa_dynamicCard",
			"editor": "_2tggoa_editor",
			"editorActions": "_2tggoa_editorActions",
			"editorForm": "_2tggoa_editorForm",
			"empty": "_2tggoa_empty",
			"emptyCopy": "_2tggoa_emptyCopy",
			"error": "_2tggoa_error",
			"fileInput": "_2tggoa_fileInput",
			"grid": "_2tggoa_grid",
			"grounding": "_2tggoa_grounding",
			"headerActions": "_2tggoa_headerActions",
			"index": "_2tggoa_index",
			"memoryRail": "_2tggoa_memoryRail",
			"memoryStageIn": "_2tggoa_memoryStageIn",
			"observationGate": "_2tggoa_observationGate",
			"pagination": "_2tggoa_pagination",
			"particleEditor": "_2tggoa_particleEditor",
			"photoDialogue": "_2tggoa_photoDialogue",
			"presets": "_2tggoa_presets",
			"preview": "_2tggoa_preview",
			"previewImage": "_2tggoa_previewImage",
			"previewModal": "_2tggoa_previewModal",
			"previewModalContent": "_2tggoa_previewModalContent",
			"quickReplies": "_2tggoa_quickReplies",
			"range": "_2tggoa_range",
			"ring": "_2tggoa_ring",
			"save": "_2tggoa_save",
			"saved": "_2tggoa_saved",
			"sceneColumn": "_2tggoa_sceneColumn",
			"sceneLoading": "_2tggoa_sceneLoading",
			"sceneTools": "_2tggoa_sceneTools",
			"shimmer": "_2tggoa_shimmer",
			"story": "_2tggoa_story",
			"storyGrid": "_2tggoa_storyGrid",
			"storyHeader": "_2tggoa_storyHeader",
			"storyHeading": "_2tggoa_storyHeading",
			"storyMeta": "_2tggoa_storyMeta",
			"upload": "_2tggoa_upload",
			"uploadHint": "_2tggoa_uploadHint",
			"uploadNotice": "_2tggoa_uploadNotice",
			"viewSwitch": "_2tggoa_viewSwitch"
		};
		//#endregion
		//#region lib/types/client/photo-story/PhotoStorySpace.js
		/** Harness-native photo archive with a real 3D particle story surface. */
		const PAGE_SIZE = 9;
		const DYNAMIC_LIMIT = 10;
		const MAX_IMAGE_CACHE_ENTRIES = 14;
		const PRESETS = [
			"soft",
			"dust",
			"fluid",
			"nebula"
		];
		const ALBUM_VIEWS = ["classic", "dynamic"];
		function useReducedMotion() {
			const [reduced, setReduced] = (0, react.useState)(() => typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
			(0, react.useEffect)(() => {
				if (typeof window.matchMedia !== "function") return;
				const query = window.matchMedia("(prefers-reduced-motion: reduce)");
				const update = () => {
					setReduced(query.matches);
				};
				update();
				query.addEventListener("change", update);
				return () => {
					query.removeEventListener("change", update);
				};
			}, []);
			return reduced;
		}
		function storyKey(story) {
			return String(story.id);
		}
		function updateConfigGroup(config, group, patch) {
			return {
				...config,
				[group]: {
					...config[group],
					...patch
				}
			};
		}
		function replaceCount(copy, count) {
			return copy.replace("{count}", new Intl.NumberFormat().format(count));
		}
		function observationErrorKey(code) {
			if (code === "photo-model-failed") return "photo.error.observe.model";
			if (code === "photo-output-invalid") return "photo.error.observe.output";
			if (code === "photo-image-unsupported" || code === "photo-model-unavailable") return "photo.error.observe.route";
			if (code === "attachment-unavailable") return "photo.error.load";
			return "photo.error.observe";
		}
		function uploadErrorKey(code, reason) {
			if (reason === "IMAGE_TOO_LARGE") return "photo.error.upload.size";
			if (reason === "IMAGE_DIMENSION_TOO_LARGE" || reason === "IMAGE_TOO_MANY_PIXELS") return "photo.error.upload.dimension";
			if (reason === "UNSUPPORTED_MEDIA_TYPE" || reason === "INVALID_IMAGE" || reason === "IMAGE_TYPE_MISMATCH") return "photo.error.upload.format";
			if (reason === "BROWSER_TRANSCODE_FAILED") return "photo.error.upload.browser";
			if (code === "attachment-unavailable" || code === "unavailable") return "photo.error.upload.unavailable";
			return "photo.error.upload";
		}
		/** Render the encrypted photo-story album and its parameterized particle editor. */
		function PhotoStorySpace({ today, imageLimits, onListPhotoStories, onCreatePhotoStory, onReadPhotoStory, onObservePhotoStory, onContinuePhotoStory, onUpdatePhotoStory, onDeletePhotoStory, t }) {
			const [stories, setStories] = (0, react.useState)([]);
			const [images, setImages] = (0, react.useState)(/* @__PURE__ */ new Map());
			const [active, setActive] = (0, react.useState)(null);
			const [storyPanel, setStoryPanel] = (0, react.useState)("dialogue");
			const [view, setView] = (0, react.useState)("classic");
			const [dynamicIndex, setDynamicIndex] = (0, react.useState)(0);
			const [dynamicAutoPlay, setDynamicAutoPlay] = (0, react.useState)(true);
			const [dynamicPointerActive, setDynamicPointerActive] = (0, react.useState)(false);
			const [dynamicFocusWithin, setDynamicFocusWithin] = (0, react.useState)(false);
			const [dynamicDrag, setDynamicDrag] = (0, react.useState)(0);
			const [dynamicDragging, setDynamicDragging] = (0, react.useState)(false);
			const [page, setPage] = (0, react.useState)(1);
			const [loading, setLoading] = (0, react.useState)(true);
			const [uploading, setUploading] = (0, react.useState)(false);
			const [pending, setPending] = (0, react.useState)(false);
			const [errorKey, setErrorKey] = (0, react.useState)(null);
			const [uploadNoticeKey, setUploadNoticeKey] = (0, react.useState)(null);
			const [saved, setSaved] = (0, react.useState)(false);
			const [deleteArmed, setDeleteArmed] = (0, react.useState)(false);
			const [preview, setPreview] = (0, react.useState)(false);
			const [title, setTitle] = (0, react.useState)("");
			const [note, setNote] = (0, react.useState)("");
			const [config, setConfig] = (0, react.useState)(null);
			const [particleCount, setParticleCount] = (0, react.useState)(0);
			const [particleRecompose, setParticleRecompose] = (0, react.useState)(0);
			const [imageRetry, setImageRetry] = (0, react.useState)(0);
			const [dialoguePending, setDialoguePending] = (0, react.useState)(false);
			const [dialogueDraft, setDialogueDraft] = (0, react.useState)("");
			const inputRef = (0, react.useRef)(null);
			const viewTabRefs = (0, react.useRef)({
				classic: null,
				dynamic: null
			});
			const dynamicCardRefs = (0, react.useRef)([]);
			const dynamicFocusTargetRef = (0, react.useRef)(null);
			const dynamicGestureRef = (0, react.useRef)({
				pointerId: -1,
				lastX: 0,
				angle: 0,
				velocity: 0
			});
			const dynamicWasDraggedRef = (0, react.useRef)(false);
			const requestRef = (0, react.useRef)(0);
			const imageRequestRef = (0, react.useRef)(0);
			const requestedImagesRef = (0, react.useRef)(/* @__PURE__ */ new Set());
			const reducedMotion = useReducedMotion();
			const refresh = (0, react.useCallback)(async () => {
				const request = ++requestRef.current;
				const result = await settleMindGardenAction(onListPhotoStories);
				if (request !== requestRef.current) return;
				if (result.ok) {
					setStories(result.value);
					setPage((current) => Math.min(current, Math.max(1, Math.ceil(result.value.length / PAGE_SIZE))));
					setErrorKey(null);
				} else setErrorKey("photo.error.load");
				setLoading(false);
			}, [onListPhotoStories]);
			(0, react.useEffect)(() => {
				refresh();
				return () => {
					requestRef.current++;
				};
			}, [refresh]);
			const pageCount = Math.max(1, Math.ceil(stories.length / PAGE_SIZE));
			const pageStories = (0, react.useMemo)(() => stories.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [page, stories]);
			const dynamicStories = (0, react.useMemo)(() => stories.slice(0, DYNAMIC_LIMIT), [stories]);
			const visibleStories = view === "classic" ? pageStories : dynamicStories;
			const visibleKey = visibleStories.map(storyKey).join(":");
			(0, react.useEffect)(() => {
				setDynamicIndex((current) => Math.min(current, Math.max(0, dynamicStories.length - 1)));
			}, [dynamicStories.length]);
			(0, react.useEffect)(() => {
				if (dynamicFocusTargetRef.current !== dynamicIndex) return;
				dynamicFocusTargetRef.current = null;
				dynamicCardRefs.current[dynamicIndex]?.focus();
			}, [dynamicIndex]);
			(0, react.useEffect)(() => {
				if (reducedMotion) setDynamicAutoPlay(false);
			}, [reducedMotion]);
			(0, react.useEffect)(() => {
				if (view !== "dynamic" || dynamicStories.length < 2 || !dynamicAutoPlay || dynamicPointerActive || dynamicFocusWithin || reducedMotion) return;
				const timer = window.setInterval(() => {
					setDynamicIndex((current) => (current + 1) % dynamicStories.length);
				}, 5200);
				return () => {
					window.clearInterval(timer);
				};
			}, [
				dynamicAutoPlay,
				dynamicFocusWithin,
				dynamicPointerActive,
				dynamicStories.length,
				reducedMotion,
				view
			]);
			(0, react.useEffect)(() => {
				const candidates = active === null ? visibleStories : [...visibleStories, active];
				const missing = candidates.filter((story) => {
					const key = storyKey(story);
					return !images.has(key) && !requestedImagesRef.current.has(key);
				});
				if (missing.length === 0) return;
				missing.forEach((story) => {
					requestedImagesRef.current.add(storyKey(story));
				});
				const request = ++imageRequestRef.current;
				Promise.all(missing.map(async (story) => ({
					story,
					result: await settleMindGardenAction(() => onReadPhotoStory(story))
				}))).then((entries) => {
					if (request !== imageRequestRef.current) return;
					if (entries.some((entry) => !entry.result.ok)) setErrorKey("photo.error.load");
					entries.forEach(({ story, result }) => {
						if (!result.ok) requestedImagesRef.current.delete(storyKey(story));
					});
					setImages((current) => {
						const next = new Map(current);
						let changed = false;
						entries.forEach(({ story, result }) => {
							if (result.ok) {
								const key = storyKey(story);
								next.delete(key);
								next.set(key, result.value);
								changed = true;
							}
						});
						const protectedKeys = new Set(candidates.map(storyKey));
						for (const [key] of next) {
							if (next.size <= MAX_IMAGE_CACHE_ENTRIES) break;
							if (protectedKeys.has(key)) continue;
							next.delete(key);
							requestedImagesRef.current.delete(key);
							changed = true;
						}
						return changed ? next : current;
					});
				});
				return () => {
					imageRequestRef.current++;
				};
			}, [
				active,
				imageRetry,
				images,
				onReadPhotoStory,
				visibleKey
			]);
			(0, react.useEffect)(() => {
				if (active === null) return;
				setTitle(active.title);
				setNote(active.note);
				setConfig(active.particleConfig);
				setDeleteArmed(false);
				setPreview(false);
			}, [active]);
			async function chooseFiles(event) {
				const files = [...event.target.files ?? []];
				event.target.value = "";
				if (files.length === 0 || uploading) return;
				setUploading(true);
				setErrorKey(null);
				setUploadNoticeKey(null);
				try {
					let failure = null;
					let optimized = false;
					for (const file of files) {
						const prepared = imageLimits === void 0 ? {
							ok: true,
							file,
							optimized: false
						} : await preparePhotoUpload(file, imageLimits);
						if (!prepared.ok) {
							failure ??= uploadErrorKey("attachment-rejected", prepared.reason);
							continue;
						}
						optimized ||= prepared.optimized;
						const result = await onCreatePhotoStory(prepared.file, calendarStamp(today));
						if (!result.ok) failure ??= uploadErrorKey(result.code, result.reason);
					}
					await refresh();
					if (optimized) setUploadNoticeKey("photo.upload.optimized");
					if (failure !== null) setErrorKey(failure);
				} catch {
					setErrorKey("photo.error.upload");
				} finally {
					setUploading(false);
				}
			}
			function openStory(story) {
				setSaved(false);
				setStoryPanel("dialogue");
				setActive(story);
			}
			function moveDynamicFrame(delta, moveFocus = false) {
				if (dynamicStories.length === 0) return;
				const nextIndex = (dynamicIndex + delta + dynamicStories.length) % dynamicStories.length;
				dynamicFocusTargetRef.current = moveFocus ? nextIndex : null;
				setDynamicIndex(nextIndex);
			}
			function selectAlbumView(next, moveFocus = false) {
				setView(next);
				if (moveFocus) queueMicrotask(() => {
					viewTabRefs.current[next]?.focus();
				});
			}
			function moveAlbumView(event, current) {
				const currentIndex = ALBUM_VIEWS.indexOf(current);
				const next = event.key === "ArrowRight" ? ALBUM_VIEWS[(currentIndex + 1) % ALBUM_VIEWS.length] : event.key === "ArrowLeft" ? ALBUM_VIEWS[(currentIndex - 1 + ALBUM_VIEWS.length) % ALBUM_VIEWS.length] : event.key === "Home" ? ALBUM_VIEWS[0] : event.key === "End" ? ALBUM_VIEWS.at(-1) : void 0;
				if (next === void 0) return;
				event.preventDefault();
				selectAlbumView(next, true);
			}
			function startDynamicGesture(event) {
				if (reducedMotion || dynamicStories.length < 2 || event.button !== 0) return;
				if (event.target.closest(`.${PhotoStorySpace_module_css_default.carouselControls}`) !== null) return;
				dynamicGestureRef.current = {
					pointerId: event.pointerId,
					lastX: event.clientX,
					angle: 0,
					velocity: 0
				};
				dynamicWasDraggedRef.current = false;
				setDynamicDragging(true);
				event.currentTarget.setPointerCapture(event.pointerId);
			}
			function moveDynamicGesture(event) {
				const gesture = dynamicGestureRef.current;
				if (!dynamicDragging || gesture.pointerId !== event.pointerId) return;
				const delta = event.clientX - gesture.lastX;
				gesture.lastX = event.clientX;
				gesture.velocity = gesture.velocity * .52 + delta * .48;
				gesture.angle += delta * .24;
				if (Math.abs(gesture.angle) > 4) dynamicWasDraggedRef.current = true;
				setDynamicDrag(gesture.angle);
			}
			function finishDynamicGesture(event, cancelled = false) {
				const gesture = dynamicGestureRef.current;
				if (!dynamicDragging || gesture.pointerId !== event.pointerId) return;
				if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
				setDynamicDragging(false);
				setDynamicDrag(0);
				if (!cancelled) {
					const stepAngle = 360 / dynamicStories.length;
					const step = Math.round(-(gesture.angle + gesture.velocity * 8) / stepAngle);
					if (step !== 0) moveDynamicFrame(step);
				}
				dynamicGestureRef.current.pointerId = -1;
			}
			function retryPhotoStories() {
				requestedImagesRef.current.clear();
				setImageRetry((current) => current + 1);
				refresh();
			}
			async function saveStory(story, particleConfig) {
				setPending(true);
				setErrorKey(null);
				setSaved(false);
				try {
					const result = await onUpdatePhotoStory(story, title.trim(), note.trim(), particleConfig);
					if (result.ok) {
						setActive(result.value);
						setStories((current) => current.map((item) => storyKey(item) === storyKey(result.value) ? result.value : item));
						setSaved(true);
					} else {
						setErrorKey("photo.error.save");
						await refresh();
					}
				} catch {
					setErrorKey("photo.error.save");
				} finally {
					setPending(false);
				}
			}
			function adoptStory(story) {
				setActive(story);
				setStories((current) => current.map((item) => storyKey(item) === storyKey(story) ? story : item));
			}
			async function observeStory(story) {
				setDialoguePending(true);
				setErrorKey(null);
				try {
					const result = await onObservePhotoStory(story);
					if (result.ok) adoptStory(result.value);
					else setErrorKey(observationErrorKey(result.code));
				} catch {
					setErrorKey("photo.error.observe");
				} finally {
					setDialoguePending(false);
				}
			}
			async function continueStory(story, content, quickReplyKind = "") {
				const message = content.trim();
				if (message === "" || dialoguePending) return;
				setDialoguePending(true);
				setErrorKey(null);
				try {
					const result = await onContinuePhotoStory(story, message, quickReplyKind);
					if (result.ok) {
						adoptStory(result.value);
						setDialogueDraft("");
					} else setErrorKey("photo.error.dialogue");
				} catch {
					setErrorKey("photo.error.dialogue");
				} finally {
					setDialoguePending(false);
				}
			}
			function submitDialogue(event, story) {
				event.preventDefault();
				continueStory(story, dialogueDraft);
			}
			async function deleteStory(story) {
				if (!deleteArmed) {
					setDeleteArmed(true);
					return;
				}
				setPending(true);
				setErrorKey(null);
				try {
					if ((await onDeletePhotoStory(story)).ok) {
						const key = storyKey(story);
						setActive(null);
						setImages((current) => {
							const next = new Map(current);
							next.delete(key);
							return next;
						});
						await refresh();
					} else setErrorKey("photo.error.delete");
				} catch {
					setErrorKey("photo.error.delete");
				} finally {
					setPending(false);
					setDeleteArmed(false);
				}
			}
			const activeImage = active === null ? void 0 : images.get(storyKey(active));
			if (active !== null && config !== null) return (0, react_jsx_runtime.jsxs)("main", {
				className: PhotoStorySpace_module_css_default.story,
				"data-mind-garden-space": "photo-story",
				"data-photo-mode": "story",
				style: { "--mg-photo-stage": `url("${PHOTO_MEMORY_STAGE_V5}")` },
				children: [
					(0, react_jsx_runtime.jsxs)("header", {
						className: PhotoStorySpace_module_css_default.storyHeader,
						children: [(0, react_jsx_runtime.jsxs)("div", {
							className: PhotoStorySpace_module_css_default.storyHeading,
							children: [(0, react_jsx_runtime.jsx)("h1", { children: t("photo.dialogue.title") }), (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: PhotoStorySpace_module_css_default.back,
								onClick: () => {
									setActive(null);
								},
								children: t("photo.back")
							})]
						}), (0, react_jsx_runtime.jsxs)("div", {
							className: PhotoStorySpace_module_css_default.storyMeta,
							children: [(0, react_jsx_runtime.jsx)("span", { children: t("photo.date").replace("{date}", active.stamp.localDate) }), particleCount > 0 && (0, react_jsx_runtime.jsx)("span", { children: replaceCount(t("photo.sceneCount"), particleCount) })]
						})]
					}),
					errorKey !== null && (0, react_jsx_runtime.jsxs)("div", {
						className: PhotoStorySpace_module_css_default.error,
						role: "alert",
						children: [(0, react_jsx_runtime.jsx)("span", { children: t(errorKey) }), errorKey === "photo.error.load" && (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: retryPhotoStories,
							children: t("photo.retry")
						})]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: PhotoStorySpace_module_css_default.storyGrid,
						children: [(0, react_jsx_runtime.jsx)("section", {
							className: PhotoStorySpace_module_css_default.sceneColumn,
							children: activeImage === void 0 ? (0, react_jsx_runtime.jsx)("div", {
								className: PhotoStorySpace_module_css_default.sceneLoading,
								role: "status",
								children: t("photo.sceneLoading")
							}) : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(PhotoParticleScene, {
								src: activeImage,
								alt: title || t("photo.scene"),
								config,
								labels: {
									scene: t("photo.scene"),
									loading: t("photo.sceneLoading"),
									fallback: t("photo.sceneFallback"),
									reduced: t("photo.sceneReducedMotion")
								},
								onCount: setParticleCount,
								recomposeToken: particleRecompose
							}), (0, react_jsx_runtime.jsxs)("div", {
								className: PhotoStorySpace_module_css_default.sceneTools,
								children: [
									(0, react_jsx_runtime.jsxs)("button", {
										type: "button",
										className: PhotoStorySpace_module_css_default.preview,
										"aria-label": t("photo.preview"),
										onClick: () => {
											setPreview(true);
										},
										children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconFullscreenOutline16, { size: 15 }), (0, react_jsx_runtime.jsx)("span", {
											"aria-hidden": "true",
											children: t("photo.toolbar.original")
										})]
									}),
									(0, react_jsx_runtime.jsxs)("button", {
										type: "button",
										className: PhotoStorySpace_module_css_default.preview,
										"aria-label": t("photo.recompose"),
										onClick: () => {
											setParticleRecompose((value) => value + 1);
										},
										children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconRefreshOutline14, {}), (0, react_jsx_runtime.jsx)("span", {
											"aria-hidden": "true",
											children: t("photo.toolbar.recompose")
										})]
									}),
									(0, react_jsx_runtime.jsxs)("button", {
										type: "button",
										className: PhotoStorySpace_module_css_default.preview,
										"aria-controls": "mind-garden-photo-workbench",
										"aria-label": t("photo.panel.dialogue"),
										"aria-pressed": storyPanel === "dialogue",
										onClick: () => {
											setStoryPanel("dialogue");
										},
										children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconNewChatOutline16, { size: 15 }), (0, react_jsx_runtime.jsx)("span", {
											"aria-hidden": "true",
											children: t("photo.toolbar.dialogue")
										})]
									}),
									(0, react_jsx_runtime.jsxs)("button", {
										type: "button",
										className: PhotoStorySpace_module_css_default.preview,
										"aria-controls": "mind-garden-photo-workbench",
										"aria-label": t("photo.panel.edit"),
										"aria-pressed": storyPanel === "edit",
										onClick: () => {
											setStoryPanel("edit");
										},
										children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSettingsOutline16, { size: 15 }), (0, react_jsx_runtime.jsx)("span", {
											"aria-hidden": "true",
											children: t("photo.toolbar.particles")
										})]
									})
								]
							})] })
						}), (0, react_jsx_runtime.jsxs)("aside", {
							id: "mind-garden-photo-workbench",
							className: PhotoStorySpace_module_css_default.editor,
							"aria-label": t("photo.panel.controls"),
							children: [(0, react_jsx_runtime.jsxs)("div", {
								className: PhotoStorySpace_module_css_default.editorForm,
								hidden: storyPanel !== "edit",
								children: [
									(0, react_jsx_runtime.jsxs)("label", { children: [(0, react_jsx_runtime.jsx)("span", { children: t("photo.storyTitle") }), (0, react_jsx_runtime.jsx)("input", {
										value: title,
										maxLength: 160,
										onChange: (event) => {
											setTitle(event.target.value);
											setSaved(false);
										}
									})] }),
									(0, react_jsx_runtime.jsxs)("label", { children: [(0, react_jsx_runtime.jsx)("span", { children: t("photo.storyNote") }), (0, react_jsx_runtime.jsx)("textarea", {
										value: note,
										maxLength: 8e3,
										placeholder: t("photo.storyPlaceholder"),
										onChange: (event) => {
											setNote(event.target.value);
											setSaved(false);
										}
									})] }),
									(0, react_jsx_runtime.jsxs)("section", {
										className: PhotoStorySpace_module_css_default.particleEditor,
										children: [
											(0, react_jsx_runtime.jsx)("h2", { children: t("photo.particleTitle") }),
											(0, react_jsx_runtime.jsx)("div", {
												className: PhotoStorySpace_module_css_default.presets,
												children: PRESETS.map((preset) => (0, react_jsx_runtime.jsx)("button", {
													type: "button",
													"data-active": config.preset === preset,
													onClick: () => {
														setConfig(applyPhotoParticlePreset(config, preset));
														setSaved(false);
													},
													children: t(`photo.particle.${preset}`)
												}, preset))
											}),
											(0, react_jsx_runtime.jsx)(RangeField, {
												label: t("photo.pointSize"),
												value: config.rendering.pointSize,
												min: .7,
												max: 6,
												step: .1,
												onChange: (pointSize) => {
													setConfig(updateConfigGroup(config, "rendering", { pointSize }));
													setSaved(false);
												}
											}),
											(0, react_jsx_runtime.jsx)(RangeField, {
												label: t("photo.depth"),
												value: config.depth.strength,
												min: 0,
												max: 60,
												step: 1,
												onChange: (strength) => {
													setConfig(updateConfigGroup(config, "depth", { strength }));
													setSaved(false);
												}
											}),
											(0, react_jsx_runtime.jsx)(RangeField, {
												label: t("photo.interaction"),
												value: config.interaction.strength,
												min: 0,
												max: 16,
												step: .1,
												onChange: (strength) => {
													setConfig(updateConfigGroup(config, "interaction", { strength }));
													setSaved(false);
												}
											}),
											(0, react_jsx_runtime.jsx)(RangeField, {
												label: t("photo.motion"),
												value: config.animation.idleStrength,
												min: 0,
												max: 1.5,
												step: .01,
												onChange: (idleStrength) => {
													setConfig(updateConfigGroup(config, "animation", { idleStrength }));
													setSaved(false);
												}
											})
										]
									}),
									saved && (0, react_jsx_runtime.jsx)("p", {
										className: PhotoStorySpace_module_css_default.saved,
										role: "status",
										children: t("photo.saved")
									}),
									(0, react_jsx_runtime.jsxs)("div", {
										className: PhotoStorySpace_module_css_default.editorActions,
										children: [(0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: PhotoStorySpace_module_css_default.save,
											disabled: pending || title.trim() === "",
											onClick: () => {
												saveStory(active, config);
											},
											children: pending ? t("photo.saving") : t("photo.save")
										}), (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: PhotoStorySpace_module_css_default.delete,
											disabled: pending,
											onClick: () => {
												deleteStory(active);
											},
											children: deleteArmed ? t("photo.deleteConfirm") : t("photo.delete")
										})]
									}),
									deleteArmed && (0, react_jsx_runtime.jsx)("p", {
										className: PhotoStorySpace_module_css_default.deleteHint,
										children: t("photo.deleteHint")
									})
								]
							}), (0, react_jsx_runtime.jsxs)("section", {
								className: PhotoStorySpace_module_css_default.photoDialogue,
								hidden: storyPanel !== "dialogue",
								"aria-labelledby": "mind-garden-photo-dialogue-title",
								children: [(0, react_jsx_runtime.jsxs)("header", { children: [(0, react_jsx_runtime.jsx)("h2", {
									id: "mind-garden-photo-dialogue-title",
									children: t("photo.dialogue.title")
								}), (0, react_jsx_runtime.jsx)("p", { children: t("photo.dialogue.boundary") })] }), active.observation == null ? (0, react_jsx_runtime.jsxs)("div", {
									className: PhotoStorySpace_module_css_default.observationGate,
									children: [(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("h3", { children: t("photo.observe.title") }), (0, react_jsx_runtime.jsx)("p", { children: t("photo.observe.disclosure") })] }), (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										disabled: dialoguePending,
										onClick: () => {
											observeStory(active);
										},
										children: dialoguePending ? t("photo.observe.pending") : t("photo.observe.action")
									})]
								}) : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
									(0, react_jsx_runtime.jsxs)("article", {
										className: PhotoStorySpace_module_css_default.grounding,
										children: [
											(0, react_jsx_runtime.jsx)("span", { children: t("photo.observe.unconfirmed") }),
											(0, react_jsx_runtime.jsx)("p", { children: active.observation.grounding.visualSummary }),
											active.observation.grounding.visibleElements.length > 0 && (0, react_jsx_runtime.jsx)("ul", {
												"aria-label": t("photo.observe.visible"),
												children: active.observation.grounding.visibleElements.map((element) => (0, react_jsx_runtime.jsx)("li", { children: element }, element))
											}),
											active.observation.grounding.uncertainDetails.length > 0 && (0, react_jsx_runtime.jsxs)("details", { children: [(0, react_jsx_runtime.jsx)("summary", { children: t("photo.observe.uncertain") }), (0, react_jsx_runtime.jsx)("ul", { children: active.observation.grounding.uncertainDetails.map((detail) => (0, react_jsx_runtime.jsx)("li", { children: detail }, detail)) })] })
										]
									}),
									(0, react_jsx_runtime.jsx)("div", {
										className: PhotoStorySpace_module_css_default.dialogueTurns,
										role: "log",
										"aria-live": "polite",
										children: active.turns.map((turn) => (0, react_jsx_runtime.jsxs)("article", {
											"data-role": turn.role,
											children: [(0, react_jsx_runtime.jsx)("span", { children: turn.role === "user" ? t("photo.dialogue.me") : t("photo.dialogue.companion") }), (0, react_jsx_runtime.jsx)("p", { children: turn.content })]
										}, String(turn.id)))
									}),
									active.quickReplies.length > 0 && (0, react_jsx_runtime.jsx)("div", {
										className: PhotoStorySpace_module_css_default.quickReplies,
										"aria-label": t("photo.dialogue.suggestions"),
										children: active.quickReplies.map((reply) => (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											disabled: dialoguePending,
											onClick: () => {
												continueStory(active, reply.label, reply.kind);
											},
											children: reply.label
										}, reply.kind))
									}),
									(0, react_jsx_runtime.jsxs)("form", {
										className: PhotoStorySpace_module_css_default.dialogueForm,
										onSubmit: (event) => {
											submitDialogue(event, active);
										},
										children: [(0, react_jsx_runtime.jsx)("label", {
											htmlFor: "mind-garden-photo-dialogue-input",
											children: t("photo.dialogue.input")
										}), (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("textarea", {
											id: "mind-garden-photo-dialogue-input",
											maxLength: 8e3,
											placeholder: t("photo.dialogue.placeholder"),
											value: dialogueDraft,
											onChange: (event) => {
												setDialogueDraft(event.target.value);
											}
										}), (0, react_jsx_runtime.jsx)("button", {
											type: "submit",
											disabled: dialoguePending || dialogueDraft.trim() === "",
											children: dialoguePending ? t("photo.dialogue.pending") : t("photo.dialogue.send")
										})] })]
									})
								] })]
							})]
						})]
					}),
					stories.length > 1 && (0, react_jsx_runtime.jsx)("nav", {
						className: PhotoStorySpace_module_css_default.memoryRail,
						"aria-label": t("photo.albumView"),
						children: stories.slice(0, DYNAMIC_LIMIT).map((story, index) => {
							const key = storyKey(story);
							return (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								"data-active": key === storyKey(active),
								"aria-current": key === storyKey(active) ? "true" : void 0,
								"aria-label": `${t("photo.open")} · ${story.title}`,
								onClick: () => {
									openStory(story);
								},
								children: [images.get(key) === void 0 ? (0, react_jsx_runtime.jsx)("span", { className: PhotoStorySpace_module_css_default.shimmer }) : (0, react_jsx_runtime.jsx)("img", {
									src: images.get(key),
									alt: ""
								}), (0, react_jsx_runtime.jsx)("span", { children: String(index + 1).padStart(2, "0") })]
							}, key);
						})
					}),
					(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
						open: preview && activeImage !== void 0,
						title: t("photo.previewDialog"),
						closeLabel: t("photo.previewClose"),
						className: PhotoStorySpace_module_css_default.previewModal ?? "",
						contentClassName: PhotoStorySpace_module_css_default.previewModalContent ?? "",
						onClose: () => {
							setPreview(false);
						},
						children: activeImage !== void 0 && (0, react_jsx_runtime.jsx)("img", {
							className: PhotoStorySpace_module_css_default.previewImage,
							src: activeImage,
							alt: title || t("photo.scene")
						})
					})
				]
			});
			return (0, react_jsx_runtime.jsxs)("main", {
				className: PhotoStorySpace_module_css_default.album,
				style: { "--mg-photo-stage": `url("${PHOTO_MEMORY_STAGE_V5}")` },
				"data-mind-garden-space": "photo-story",
				"data-photo-mode": "album",
				"data-empty": stories.length === 0,
				children: [
					(0, react_jsx_runtime.jsx)("div", {
						className: PhotoStorySpace_module_css_default.aurora,
						"aria-hidden": "true"
					}),
					(0, react_jsx_runtime.jsxs)("header", {
						className: PhotoStorySpace_module_css_default.albumHeader,
						children: [(0, react_jsx_runtime.jsxs)("div", { children: [
							(0, react_jsx_runtime.jsx)("h1", { children: t("photo.title") }),
							(0, react_jsx_runtime.jsx)("p", { children: t("photo.subtitle") }),
							stories.length > 0 && (0, react_jsx_runtime.jsx)("strong", { children: t("photo.count").replace("{count}", String(stories.length)) })
						] }), (0, react_jsx_runtime.jsxs)("div", {
							className: PhotoStorySpace_module_css_default.headerActions,
							children: [
								stories.length > 0 && (0, react_jsx_runtime.jsx)("div", {
									className: PhotoStorySpace_module_css_default.viewSwitch,
									role: "tablist",
									"aria-label": t("photo.albumView"),
									children: ALBUM_VIEWS.map((option) => (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										role: "tab",
										id: `mind-garden-photo-${option}-tab`,
										"aria-controls": `mind-garden-photo-${option}-panel`,
										"aria-selected": view === option,
										tabIndex: view === option ? 0 : -1,
										ref: (node) => {
											viewTabRefs.current[option] = node;
										},
										onClick: () => {
											selectAlbumView(option);
										},
										onKeyDown: (event) => {
											moveAlbumView(event, option);
										},
										children: t(`photo.${option}`)
									}, option))
								}),
								(0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: PhotoStorySpace_module_css_default.upload,
									disabled: uploading,
									onClick: () => {
										/* v8 ignore next -- React assigns the rendered input before user click handlers can run. */
										inputRef.current?.click();
									},
									children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlusOutline16, { size: 15 }), uploading ? t("photo.uploading") : t("photo.upload")]
								}),
								(0, react_jsx_runtime.jsx)("input", {
									ref: inputRef,
									className: PhotoStorySpace_module_css_default.fileInput,
									type: "file",
									accept: "image/png,image/jpeg,image/webp,image/gif",
									multiple: true,
									onChange: (event) => {
										chooseFiles(event);
									}
								})
							]
						})]
					}),
					(0, react_jsx_runtime.jsx)("p", {
						className: PhotoStorySpace_module_css_default.uploadHint,
						children: t("photo.uploadHint")
					}),
					uploadNoticeKey !== null && (0, react_jsx_runtime.jsx)("p", {
						className: PhotoStorySpace_module_css_default.uploadNotice,
						role: "status",
						children: t(uploadNoticeKey)
					}),
					errorKey !== null && (0, react_jsx_runtime.jsxs)("div", {
						className: PhotoStorySpace_module_css_default.error,
						role: "alert",
						children: [(0, react_jsx_runtime.jsx)("span", { children: t(errorKey) }), errorKey === "photo.error.load" && (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: retryPhotoStories,
							children: t("photo.retry")
						})]
					}),
					loading ? (0, react_jsx_runtime.jsx)("div", {
						className: PhotoStorySpace_module_css_default.empty,
						role: "status",
						children: t("photo.loading")
					}) : stories.length === 0 ? (0, react_jsx_runtime.jsx)("div", {
						className: PhotoStorySpace_module_css_default.empty,
						children: (0, react_jsx_runtime.jsxs)("div", {
							className: PhotoStorySpace_module_css_default.emptyCopy,
							children: [
								(0, react_jsx_runtime.jsx)("h2", { children: t("photo.empty.title") }),
								(0, react_jsx_runtime.jsx)("p", { children: t("photo.empty.body") }),
								(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									disabled: uploading,
									onClick: () => {
										/* v8 ignore next -- React assigns the rendered input before user click handlers can run. */
										inputRef.current?.click();
									},
									children: t("photo.empty.action")
								})
							]
						})
					}) : view === "classic" ? (0, react_jsx_runtime.jsxs)("div", {
						id: "mind-garden-photo-classic-panel",
						role: "tabpanel",
						"aria-labelledby": "mind-garden-photo-classic-tab",
						children: [(0, react_jsx_runtime.jsx)("section", {
							className: PhotoStorySpace_module_css_default.grid,
							"aria-label": t("photo.albumView"),
							children: pageStories.map((story, index) => (0, react_jsx_runtime.jsx)(PhotoCard, {
								story,
								index: (page - 1) * PAGE_SIZE + index + 1,
								src: images.get(storyKey(story)),
								t,
								onOpen: openStory
							}, storyKey(story)))
						}), (0, react_jsx_runtime.jsxs)("nav", {
							className: PhotoStorySpace_module_css_default.pagination,
							"aria-label": t("photo.albumView"),
							children: [
								(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									disabled: page <= 1,
									onClick: () => {
										setPage((current) => current - 1);
									},
									children: t("photo.pagePrevious")
								}),
								(0, react_jsx_runtime.jsx)("span", { children: t("photo.page").replace("{current}", String(page)).replace("{total}", String(pageCount)) }),
								(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									disabled: page >= pageCount,
									onClick: () => {
										setPage((current) => current + 1);
									},
									children: t("photo.pageNext")
								})
							]
						})]
					}) : (0, react_jsx_runtime.jsxs)("section", {
						id: "mind-garden-photo-dynamic-panel",
						role: "tabpanel",
						"aria-labelledby": "mind-garden-photo-dynamic-tab",
						className: PhotoStorySpace_module_css_default.dynamic,
						"aria-label": t("photo.albumView"),
						onPointerEnter: () => {
							setDynamicPointerActive(true);
						},
						onPointerLeave: () => {
							setDynamicPointerActive(false);
						},
						onPointerDown: startDynamicGesture,
						onPointerMove: moveDynamicGesture,
						onPointerUp: finishDynamicGesture,
						onPointerCancel: (event) => {
							finishDynamicGesture(event, true);
						},
						onFocusCapture: () => {
							setDynamicFocusWithin(true);
						},
						onBlurCapture: (event) => {
							if (!event.currentTarget.contains(event.relatedTarget)) setDynamicFocusWithin(false);
						},
						children: [
							(0, react_jsx_runtime.jsxs)("div", {
								className: PhotoStorySpace_module_css_default.carouselControls,
								"aria-label": t("photo.carouselControls"),
								children: [
									(0, react_jsx_runtime.jsx)("button", {
										type: "button",
										"aria-label": t("photo.carouselPrevious"),
										disabled: dynamicStories.length < 2,
										onClick: () => {
											moveDynamicFrame(-1);
										},
										children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronLeftOutline14, { size: 14 })
									}),
									(0, react_jsx_runtime.jsx)("span", {
										"aria-live": dynamicAutoPlay ? "off" : "polite",
										children: t("photo.carouselPosition").replace("{current}", String(dynamicIndex + 1)).replace("{total}", String(dynamicStories.length)).replace("{title}", dynamicStories[dynamicIndex]?.title ?? "")
									}),
									(0, react_jsx_runtime.jsx)("button", {
										type: "button",
										"aria-label": dynamicAutoPlay ? t("photo.carouselPause") : t("photo.carouselPlay"),
										"aria-pressed": !dynamicAutoPlay,
										disabled: dynamicStories.length < 2 || reducedMotion,
										onClick: () => {
											setDynamicAutoPlay((current) => !current);
										},
										children: dynamicAutoPlay ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPauseOutline16, { size: 14 }) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlayOutline16, { size: 14 })
									}),
									(0, react_jsx_runtime.jsx)("button", {
										type: "button",
										"aria-label": t("photo.carouselNext"),
										disabled: dynamicStories.length < 2,
										onClick: () => {
											moveDynamicFrame(1);
										},
										children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutline14, { size: 14 })
									})
								]
							}),
							(0, react_jsx_runtime.jsx)("div", {
								className: PhotoStorySpace_module_css_default.ring,
								"data-dragging": dynamicDragging,
								style: {
									"--photo-count": dynamicStories.length,
									"--photo-active": dynamicIndex,
									"--photo-drag": `${dynamicDrag}deg`
								},
								children: dynamicStories.map((story, index) => (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: PhotoStorySpace_module_css_default.dynamicCard,
									ref: (node) => {
										dynamicCardRefs.current[index] = node;
									},
									style: { "--photo-index": index },
									"data-active": index === dynamicIndex,
									"aria-current": index === dynamicIndex ? "true" : void 0,
									"aria-hidden": index !== dynamicIndex,
									"aria-label": `${t("photo.open")} · ${story.title}`,
									tabIndex: index === dynamicIndex ? 0 : -1,
									onClick: (event) => {
										if (dynamicWasDraggedRef.current) {
											event.preventDefault();
											dynamicWasDraggedRef.current = false;
											return;
										}
										openStory(story);
									},
									onKeyDown: (event) => {
										if (event.key === "ArrowLeft") {
											event.preventDefault();
											moveDynamicFrame(-1, true);
										} else if (event.key === "ArrowRight") {
											event.preventDefault();
											moveDynamicFrame(1, true);
										}
									},
									children: [images.get(storyKey(story)) === void 0 ? (0, react_jsx_runtime.jsx)("span", { className: PhotoStorySpace_module_css_default.shimmer }) : (0, react_jsx_runtime.jsx)("img", {
										src: images.get(storyKey(story)),
										alt: ""
									}), (0, react_jsx_runtime.jsx)("span", { children: story.title })]
								}, storyKey(story)))
							}),
							(0, react_jsx_runtime.jsx)("p", { children: t("photo.dynamicHint") })
						]
					})
				]
			});
		}
		function PhotoCard({ story, index, src, t, onOpen }) {
			return (0, react_jsx_runtime.jsx)("article", {
				className: PhotoStorySpace_module_css_default.card,
				children: (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					"aria-label": `${t("photo.open")} · ${story.title}`,
					onClick: () => {
						onOpen(story);
					},
					children: [
						(0, react_jsx_runtime.jsx)("span", {
							className: PhotoStorySpace_module_css_default.index,
							children: String(index).padStart(2, "0")
						}),
						src === void 0 ? (0, react_jsx_runtime.jsx)("span", { className: PhotoStorySpace_module_css_default.shimmer }) : (0, react_jsx_runtime.jsx)("img", {
							src,
							alt: ""
						}),
						(0, react_jsx_runtime.jsx)("span", {
							className: PhotoStorySpace_module_css_default.cardShade,
							"aria-hidden": "true"
						}),
						(0, react_jsx_runtime.jsxs)("span", {
							className: PhotoStorySpace_module_css_default.cardCopy,
							children: [(0, react_jsx_runtime.jsx)("strong", { children: story.title }), (0, react_jsx_runtime.jsx)("small", { children: t("photo.date").replace("{date}", story.stamp.localDate) })]
						})
					]
				})
			});
		}
		function RangeField({ label, value, min, max, step, onChange }) {
			return (0, react_jsx_runtime.jsxs)("label", {
				className: PhotoStorySpace_module_css_default.range,
				children: [(0, react_jsx_runtime.jsxs)("span", { children: [label, (0, react_jsx_runtime.jsx)("output", { children: step < 1 ? value.toFixed(2) : value.toFixed(0) })] }), (0, react_jsx_runtime.jsx)("input", {
					"aria-label": label,
					type: "range",
					value,
					min,
					max,
					step,
					onChange: (event) => {
						onChange(Number(event.target.value));
					}
				})]
			});
		}
		//#endregion
		//#region \0dsh-css:E:\test code\deepseekharness_modified\deepseek-harness\packages\client\ui-mind-garden\src\client\GardenPortabilityPanel.module.css.mjs
		const css$1 = ".RIkHDW_archive{--archive-brass:#b99a62;--archive-brass-light:#dbc18b;--archive-teal:#304c70;--archive-ink:#1c2d45;--archive-bone:#f1eadc;--archive-bone-bright:#f4edde;--archive-bone-soft:#eee4d1;--archive-success:#a8c6b6;--archive-error:#d8a59a;--archive-oxblood:#7e312a;--archive-oxblood-deep:#57201c;border:1px solid color-mix(in srgb, var(--archive-brass) 52%, transparent);color:var(--archive-bone);background:radial-gradient(circle at 86% 8%, color-mix(in srgb, var(--archive-brass) 13%, transparent), transparent 31%), linear-gradient(145deg, #405f87fa, #1c2d45 64%);border-radius:9px 9px 5px 5px;grid-template-columns:94px minmax(0,1fr);gap:0 22px;margin:8px 12px 14px;padding:26px;display:grid;position:relative;overflow:hidden;box-shadow:inset 0 1px #ffffff0d,inset 0 0 36px #00000047,0 16px 38px #1b2a3f33}.RIkHDW_instrument{aspect-ratio:1;border:1px solid color-mix(in srgb, var(--archive-brass-light) 55%, transparent);background:radial-gradient(circle, #2a4260 0 36%, transparent 38%), conic-gradient(from 7deg, var(--archive-brass), var(--archive-brass-light), color-mix(in srgb, var(--archive-brass) 72%, var(--archive-ink)), color-mix(in srgb, var(--archive-brass-light) 72%, var(--archive-brass)), color-mix(in srgb, var(--archive-brass) 78%, var(--archive-ink)), color-mix(in srgb, var(--archive-brass-light) 88%, var(--archive-brass)));border-radius:50%;grid-row:1/span 3;align-self:start;place-items:center;width:82px;margin-top:3px;display:grid;position:relative;box-shadow:inset 0 0 0 6px #1d2f47e0,inset 0 0 0 7px #e2c99340,0 7px 18px #0000004d}.RIkHDW_instrumentTicks{border-radius:inherit;background:repeating-conic-gradient(from 0deg, color-mix(in srgb, var(--archive-brass-light) 58%, transparent) 0 1deg, transparent 1deg 15deg);animation:26s linear infinite RIkHDW_archive-calibration;position:absolute;inset:7px;mask:radial-gradient(circle,#0000 0 78%,#000 79%)}.RIkHDW_instrumentCore{aspect-ratio:1;border:1px solid color-mix(in srgb, var(--archive-brass-light) 34%, transparent);width:35px;color:var(--archive-brass-light);background:radial-gradient(circle at 38% 30%,#526f94,#1e304a 72%);border-radius:50%;place-items:center;display:grid;position:relative;box-shadow:inset 0 0 14px #00000073}.RIkHDW_intro{min-width:0}.RIkHDW_intro h3{font-family:var(--mg-font-display,serif);letter-spacing:-.02em;margin:0 0 7px;font-size:22px;font-weight:500}.RIkHDW_intro>p{color:#f0e8d7c7;max-width:48ch;margin:0;font-size:12px;line-height:1.7}.RIkHDW_assurances{flex-wrap:wrap;gap:6px;margin-top:14px;display:flex}.RIkHDW_assurances span{border:1px solid color-mix(in srgb, var(--archive-brass-light) 18%, transparent);color:color-mix(in srgb, var(--archive-bone) 84%, transparent);letter-spacing:.03em;background:#1b2c4352;border-radius:999px;padding:4px 7px;font-size:12px}.RIkHDW_form{grid-column:2;grid-template-columns:1fr 1fr;gap:14px;margin-top:20px;display:grid}.RIkHDW_form label{color:#f1eadce0;gap:6px;font-size:12px;display:grid}.RIkHDW_form input{border:1px solid color-mix(in srgb, var(--archive-brass-light) 22%, transparent);width:100%;height:44px;color:var(--archive-bone-bright);background:color-mix(in srgb, var(--archive-ink) 58%, transparent);font:inherit;border-radius:5px;outline:none;padding:0 10px;box-shadow:inset 0 1px 5px #0000003d}.RIkHDW_form input::placeholder{color:color-mix(in srgb, var(--archive-bone) 72%, transparent)}.RIkHDW_form input:focus-visible{border-color:var(--dsw-alias-state-business-primary);box-shadow:0 0 0 2px color-mix(in srgb, var(--dsw-alias-state-business-primary) 25%, transparent), inset 0 1px 5px #0000003d}.RIkHDW_formFooter{grid-column:1/-1;justify-content:space-between;align-items:center;gap:14px;display:flex}.RIkHDW_formFooter p{color:color-mix(in srgb, var(--archive-bone) 82%, transparent);margin:0;font-size:12px;line-height:1.45}.RIkHDW_formFooter .RIkHDW_validationError{color:var(--archive-error)}.RIkHDW_formFooter button{border:1px solid color-mix(in srgb, var(--archive-brass-light) 30%, transparent);color:#fff8eb;background:linear-gradient(180deg, var(--archive-oxblood), var(--archive-oxblood-deep));min-height:44px;font:inherit;cursor:pointer;border-radius:5px;justify-content:center;align-items:center;gap:7px;padding:8px 13px;font-size:12px;transition:border-color .12s,filter .12s,transform .12s;display:inline-flex;box-shadow:inset 0 1px #ffffff17,0 6px 16px #0000002e}.RIkHDW_formFooter button:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px}.RIkHDW_formFooter button:hover:not(:disabled){border-color:color-mix(in srgb, var(--archive-brass-light) 62%, transparent);filter:brightness(1.08);transform:translateY(-1px)}.RIkHDW_formFooter button:disabled{cursor:not-allowed;filter:grayscale(.4);opacity:.42}.RIkHDW_status{grid-column:2;min-height:0}.RIkHDW_status p{color:var(--archive-success);justify-content:space-between;align-items:baseline;gap:12px;margin:12px 0 0;font-size:12px;display:flex}.RIkHDW_status p span{min-width:0;color:color-mix(in srgb, var(--archive-bone) 82%, transparent);text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.RIkHDW_status .RIkHDW_error{color:var(--archive-error)}.RIkHDW_recoveryBay{background:radial-gradient(circle at 6% 12%, color-mix(in srgb, var(--archive-success) 8%, transparent), transparent 12rem), color-mix(in srgb, var(--archive-teal) 72%, var(--archive-ink));border-radius:7px;grid-column:1/-1;grid-template-columns:38px minmax(0,1fr);gap:8px 13px;margin-top:20px;padding:17px;display:grid;box-shadow:inset 0 1px #ffffff0a}.RIkHDW_recoverySeal{aspect-ratio:1;border:1px solid color-mix(in srgb, var(--archive-success) 34%, transparent);width:34px;color:color-mix(in srgb, var(--archive-success) 78%, var(--archive-bone));background:#18273c9e;border-radius:50%;place-items:center;display:grid;box-shadow:inset 0 0 12px #00000052}.RIkHDW_recoveryCopy{min-width:0}.RIkHDW_recoveryCopy h4{color:var(--archive-bone-soft);font-family:var(--mg-font-display,serif);margin:0 0 3px;font-size:14px;font-weight:500}.RIkHDW_recoveryCopy p{max-width:68ch;color:color-mix(in srgb, var(--archive-bone) 82%, transparent);margin:0;font-size:12px;line-height:1.6}.RIkHDW_recoveryControls{grid-column:2;grid-template-columns:auto minmax(0,.72fr) minmax(190px,1fr) auto;align-items:end;gap:9px;min-width:0;margin-top:7px;display:grid}.RIkHDW_fileInput{clip:rect(0, 0, 0, 0);white-space:nowrap;border:0;width:1px;height:1px;padding:0;position:absolute;overflow:hidden}.RIkHDW_fileButton,.RIkHDW_inspectButton,.RIkHDW_restoreActions button{border:1px solid color-mix(in srgb, var(--archive-success) 25%, transparent);min-height:44px;color:color-mix(in srgb, var(--archive-bone) 82%, transparent);font:inherit;cursor:pointer;background:#18273c7a;border-radius:5px;justify-content:center;align-items:center;gap:7px;padding:7px 11px;font-size:12px;transition:border-color .12s,color .12s,transform .12s;display:inline-flex}.RIkHDW_fileName{min-width:0;color:color-mix(in srgb, var(--archive-bone) 82%, transparent);text-overflow:ellipsis;white-space:nowrap;font-size:12px;overflow:hidden}.RIkHDW_restoreSecret{color:color-mix(in srgb, var(--archive-bone) 84%, transparent);gap:5px;font-size:12px;display:grid}.RIkHDW_restoreSecret input{box-sizing:border-box;border:1px solid color-mix(in srgb, var(--archive-success) 22%, transparent);width:100%;height:44px;color:var(--archive-bone-bright);background:color-mix(in srgb, var(--archive-ink) 58%, transparent);font:inherit;border-radius:5px;outline:none;padding:0 10px;box-shadow:inset 0 1px 5px #0000003d}.RIkHDW_restoreSecret input::placeholder{color:color-mix(in srgb, var(--archive-bone) 72%, transparent)}.RIkHDW_restoreSecret input:focus-visible,.RIkHDW_fileButton:focus-visible,.RIkHDW_inspectButton:focus-visible,.RIkHDW_restoreActions button:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px}.RIkHDW_fileButton:hover:not(:disabled),.RIkHDW_inspectButton:hover:not(:disabled),.RIkHDW_restoreActions button:hover:not(:disabled){border-color:color-mix(in srgb, var(--archive-success) 58%, transparent);color:#fff8e9;transform:translateY(-1px)}.RIkHDW_fileButton:disabled,.RIkHDW_inspectButton:disabled,.RIkHDW_restoreActions button:disabled{cursor:wait;opacity:.46}.RIkHDW_restorePreview{background:#18273c85;border-radius:6px;grid-column:2;gap:12px;margin-top:8px;padding:15px;display:grid;box-shadow:inset 0 0 24px #0000001f}.RIkHDW_previewHeading{justify-content:space-between;align-items:baseline;gap:14px;display:flex}.RIkHDW_previewHeading span{color:var(--archive-success);align-items:center;gap:7px;font-size:12px;font-weight:600;display:inline-flex}.RIkHDW_previewHeading time{color:color-mix(in srgb, var(--archive-bone) 78%, transparent);font-variant-numeric:tabular-nums;font-size:12px}.RIkHDW_restorePreview dl{grid-template-columns:repeat(4,minmax(0,1fr));gap:8px 18px;margin:0;display:grid}.RIkHDW_restorePreview dl>div{gap:3px;display:grid}.RIkHDW_restorePreview dt{color:color-mix(in srgb, var(--archive-bone) 78%, transparent);font-size:12px}.RIkHDW_restorePreview dd{color:var(--archive-bone-soft);font-family:var(--mg-font-display,serif);font-variant-numeric:tabular-nums;margin:0;font-size:19px}.RIkHDW_restorePreview>p{color:color-mix(in srgb, var(--archive-brass-light) 72%, var(--archive-bone));align-items:flex-start;gap:7px;margin:0;font-size:12px;line-height:1.55;display:flex}.RIkHDW_restorePreview>p svg{flex:none;margin-top:1px}.RIkHDW_restoreActions{justify-content:flex-end;gap:7px;display:flex}.RIkHDW_restoreActions .RIkHDW_restoreConfirm{border-color:color-mix(in srgb, var(--archive-success) 46%, transparent);color:var(--archive-bone-bright);background:linear-gradient(#4e6d95,#314d72)}.RIkHDW_restoreReceipt,.RIkHDW_restoreError{color:var(--archive-success);grid-column:2;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:9px;margin:8px 0 0;font-size:12px;display:grid}.RIkHDW_restoreReceipt span{color:color-mix(in srgb, var(--archive-bone) 82%, transparent);gap:2px;display:grid}.RIkHDW_restoreReceipt strong{color:var(--archive-success);font-size:12px}.RIkHDW_restoreReceipt b{color:var(--archive-bone-soft);font-family:var(--mg-font-display,serif);font-variant-numeric:tabular-nums;font-size:19px;font-weight:500}.RIkHDW_restoreError{color:var(--archive-error);grid-template-columns:auto minmax(0,1fr);line-height:1.55}.RIkHDW_rotationBay{background:color-mix(in srgb, var(--archive-teal) 64%, transparent);border-radius:6px;grid-column:1/-1;grid-template-columns:38px minmax(0,1fr) auto;align-items:center;gap:13px;margin-top:20px;padding:15px;display:grid;position:relative}.RIkHDW_rotationSeal{aspect-ratio:1;border:1px solid color-mix(in srgb, var(--archive-brass-light) 35%, transparent);width:34px;color:var(--archive-brass-light);background:#18273c9e;border-radius:50%;place-items:center;display:grid;box-shadow:inset 0 0 0 3px #b99a620d,inset 0 0 12px #00000059}.RIkHDW_rotationCopy{min-width:0}.RIkHDW_rotationCopy h4{color:var(--archive-bone-soft);font-family:var(--mg-font-display,serif);margin:0 0 3px;font-size:14px;font-weight:500}.RIkHDW_rotationCopy p{max-width:58ch;color:color-mix(in srgb, var(--archive-bone) 82%, transparent);margin:0;font-size:12px;line-height:1.55}.RIkHDW_rotationReceipt,.RIkHDW_rotationError{color:var(--archive-success);margin-top:5px;font-size:12px;display:block}.RIkHDW_rotationError{color:var(--archive-error)}.RIkHDW_rotationActions{justify-content:flex-end;align-items:center;gap:7px;display:flex}.RIkHDW_rotationActions button{border:1px solid color-mix(in srgb, var(--archive-brass-light) 23%, transparent);color:#f6eedee6;min-height:44px;font:inherit;cursor:pointer;background:#18273c80;border-radius:5px;justify-content:center;align-items:center;gap:6px;padding:6px 10px;font-size:12px;transition:border-color .12s,color .12s,transform .12s;display:inline-flex}.RIkHDW_rotationActions button:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px}.RIkHDW_rotationActions button:hover:not(:disabled){border-color:color-mix(in srgb, var(--archive-brass-light) 55%, transparent);color:#fff8e9;transform:translateY(-1px)}.RIkHDW_rotationActions button:disabled{cursor:wait;opacity:.48}.RIkHDW_rotationActions .RIkHDW_rotationConfirm{border-color:color-mix(in srgb, var(--archive-error) 42%, transparent);color:var(--archive-bone-bright);background:linear-gradient(180deg, color-mix(in srgb, var(--archive-oxblood) 90%, var(--archive-bone)), color-mix(in srgb, var(--archive-oxblood-deep) 86%, var(--archive-ink)))}.RIkHDW_rotationActions .RIkHDW_rotationCancel{background:0 0;border-color:#0000}@media (width<=560px){.RIkHDW_archive{grid-template-columns:52px minmax(0,1fr);gap:0 12px;padding:18px 15px}.RIkHDW_instrument{width:48px}.RIkHDW_instrumentCore{width:26px}.RIkHDW_form{grid-column:1/-1;grid-template-columns:1fr}.RIkHDW_formFooter,.RIkHDW_status{grid-column:1}.RIkHDW_formFooter{flex-direction:column;align-items:stretch}.RIkHDW_status p{flex-direction:column;align-items:flex-start}.RIkHDW_rotationBay{grid-template-columns:34px minmax(0,1fr)}.RIkHDW_recoveryBay{grid-template-columns:34px minmax(0,1fr);padding:15px}.RIkHDW_recoveryControls{grid-template-columns:1fr}.RIkHDW_fileButton,.RIkHDW_inspectButton{width:100%}.RIkHDW_restoreSecret input{font-size:16px}.RIkHDW_restorePreview dl{grid-template-columns:repeat(2,minmax(0,1fr))}.RIkHDW_previewHeading{flex-direction:column;align-items:flex-start}.RIkHDW_restoreActions{justify-content:stretch}.RIkHDW_restoreActions button{flex:1}.RIkHDW_rotationActions{grid-column:1/-1;justify-content:stretch}.RIkHDW_rotationActions button{flex:1}}@keyframes RIkHDW_archive-calibration{to{transform:rotate(1turn)}}@media (prefers-reduced-motion:reduce){.RIkHDW_instrumentTicks{animation:none}.RIkHDW_formFooter button,.RIkHDW_rotationActions button,.RIkHDW_fileButton,.RIkHDW_inspectButton,.RIkHDW_restoreActions button{transition:none}}";
		const tagId$1 = "@deepseek-ai/dsh-mind-garden/GardenPortabilityPanel.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$1) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-mind-garden";
			tag.dataset.pluginCss = tagId$1;
			tag.textContent = css$1;
			document.head.appendChild(tag);
		}
		var GardenPortabilityPanel_module_css_default = {
			"archive": "RIkHDW_archive",
			"archive-calibration": "RIkHDW_archive-calibration",
			"assurances": "RIkHDW_assurances",
			"error": "RIkHDW_error",
			"fileButton": "RIkHDW_fileButton",
			"fileInput": "RIkHDW_fileInput",
			"fileName": "RIkHDW_fileName",
			"form": "RIkHDW_form",
			"formFooter": "RIkHDW_formFooter",
			"inspectButton": "RIkHDW_inspectButton",
			"instrument": "RIkHDW_instrument",
			"instrumentCore": "RIkHDW_instrumentCore",
			"instrumentTicks": "RIkHDW_instrumentTicks",
			"intro": "RIkHDW_intro",
			"previewHeading": "RIkHDW_previewHeading",
			"recoveryBay": "RIkHDW_recoveryBay",
			"recoveryControls": "RIkHDW_recoveryControls",
			"recoveryCopy": "RIkHDW_recoveryCopy",
			"recoverySeal": "RIkHDW_recoverySeal",
			"restoreActions": "RIkHDW_restoreActions",
			"restoreConfirm": "RIkHDW_restoreConfirm",
			"restoreError": "RIkHDW_restoreError",
			"restorePreview": "RIkHDW_restorePreview",
			"restoreReceipt": "RIkHDW_restoreReceipt",
			"restoreSecret": "RIkHDW_restoreSecret",
			"rotationActions": "RIkHDW_rotationActions",
			"rotationBay": "RIkHDW_rotationBay",
			"rotationCancel": "RIkHDW_rotationCancel",
			"rotationConfirm": "RIkHDW_rotationConfirm",
			"rotationCopy": "RIkHDW_rotationCopy",
			"rotationError": "RIkHDW_rotationError",
			"rotationReceipt": "RIkHDW_rotationReceipt",
			"rotationSeal": "RIkHDW_rotationSeal",
			"status": "RIkHDW_status",
			"validationError": "RIkHDW_validationError"
		};
		//#endregion
		//#region lib/types/client/GardenPortabilityPanel.js
		/** Private profile archive controls inside the Mind Garden settings instrument. */
		function decodeBase64(value) {
			const binary = atob(value);
			return Uint8Array.from(binary, (character) => character.charCodeAt(0));
		}
		/** Hand already encrypted package bytes to the browser's native download flow. */
		function downloadMindGardenBackup(value) {
			const bytes = decodeBase64(value.data);
			const copy = new Uint8Array(bytes.byteLength);
			copy.set(bytes);
			const url = URL.createObjectURL(new Blob([copy.buffer], { type: value.mediaType }));
			const anchor = document.createElement("a");
			anchor.href = url;
			anchor.download = value.filename;
			anchor.rel = "noopener";
			anchor.click();
			setTimeout(() => {
				URL.revokeObjectURL(url);
			}, 0);
		}
		function codePointLength(value) {
			return Array.from(value).length;
		}
		function errorKey$1(code) {
			if (code === "invalid-passphrase") return "backup.error.passphrase";
			if (code === "backup-too-large") return "backup.error.size";
			if (code === "attachment-unavailable") return "backup.error.attachment";
			if (code === "vault-unavailable") return "backup.error.vault";
			return "backup.error.generic";
		}
		function rotationErrorKey(code) {
			if (code === "rotation-unavailable") return "rotation.error.credentials";
			if (code === "vault-unavailable") return "rotation.error.vault";
			return "rotation.error.generic";
		}
		function restoreErrorKey(code) {
			if (code === "invalid-passphrase") return "restore.error.passphrase";
			if (code === "invalid-backup") return "restore.error.invalid";
			if (code === "backup-too-large") return "restore.error.size";
			if (code === "attachment-unavailable") return "restore.error.attachment";
			if (code === "vault-unavailable") return "restore.error.vault";
			return "restore.error.generic";
		}
		function formatBytes(value) {
			if (value < 1024) return `${String(value)} B`;
			if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
			return `${(value / (1024 * 1024)).toFixed(1)} MB`;
		}
		function totalRecords(counts) {
			return counts.memories + counts.reflections + counts.media + counts.stars;
		}
		/** Render the passphrase ceremony and whole-profile encrypted download. */
		function GardenPortabilityPanel({ t, onExportBackup, onInspectBackup, onRestoreBackup, onRotateVaultKey, onRestoreSuccess = () => void 0 }) {
			const [passphrase, setPassphrase] = (0, react.useState)("");
			const [confirmation, setConfirmation] = (0, react.useState)("");
			const [state, setState] = (0, react.useState)({ kind: "idle" });
			const [rotation, setRotation] = (0, react.useState)({ kind: "idle" });
			const [restoreFile, setRestoreFile] = (0, react.useState)(null);
			const [restorePassphrase, setRestorePassphrase] = (0, react.useState)("");
			const [restore, setRestore] = (0, react.useState)({ kind: "idle" });
			const restoreInputRef = (0, react.useRef)(null);
			const validLength = codePointLength(passphrase) >= 12;
			const matches = passphrase === confirmation;
			const ready = validLength && matches && state.kind !== "working";
			const submit = async (event) => {
				event.preventDefault();
				if (!ready) return;
				setState({ kind: "working" });
				const result = await settleMindGardenAction(() => onExportBackup(passphrase));
				if (!result.ok) {
					setState({
						kind: "error",
						key: errorKey$1(result.code)
					});
					return;
				}
				try {
					downloadMindGardenBackup(result.value);
					setPassphrase("");
					setConfirmation("");
					setState({
						kind: "success",
						value: result.value
					});
				} catch {
					setState({
						kind: "error",
						key: "backup.error.download"
					});
				}
			};
			const rotate = async () => {
				setRotation({ kind: "working" });
				const result = await settleMindGardenAction(onRotateVaultKey);
				setRotation(result.ok ? {
					kind: "success",
					value: result.value
				} : {
					kind: "error",
					key: rotationErrorKey(result.code)
				});
			};
			const inspectRestore = async () => {
				if (restoreFile === null || codePointLength(restorePassphrase) < 8) return;
				setRestore({ kind: "inspecting" });
				const result = await settleMindGardenAction(() => onInspectBackup(restoreFile, restorePassphrase));
				setRestore(result.ok ? {
					kind: "preview",
					value: result.value
				} : {
					kind: "error",
					code: result.code,
					key: restoreErrorKey(result.code)
				});
			};
			const commitRestore = async () => {
				if (restoreFile === null || restore.kind !== "preview") return;
				const preview = restore.value;
				setRestore({
					kind: "restoring",
					value: preview
				});
				const result = await settleMindGardenAction(() => onRestoreBackup(restoreFile, restorePassphrase));
				if (!result.ok) {
					setRestore({
						kind: "error",
						code: result.code,
						key: restoreErrorKey(result.code)
					});
					return;
				}
				setRestorePassphrase("");
				setRestoreFile(null);
				if (restoreInputRef.current !== null) restoreInputRef.current.value = "";
				setRestore({
					kind: "success",
					value: result.value
				});
				onRestoreSuccess();
			};
			const cancelRestore = () => {
				setRestore({ kind: "idle" });
			};
			return (0, react_jsx_runtime.jsxs)("section", {
				className: GardenPortabilityPanel_module_css_default.archive,
				"aria-labelledby": "mind-garden-archive-title",
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: GardenPortabilityPanel_module_css_default.instrument,
						"aria-hidden": "true",
						children: [(0, react_jsx_runtime.jsx)("span", { className: GardenPortabilityPanel_module_css_default.instrumentTicks }), (0, react_jsx_runtime.jsx)("span", {
							className: GardenPortabilityPanel_module_css_default.instrumentCore,
							children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconDataOutline16, { size: 18 })
						})]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: GardenPortabilityPanel_module_css_default.intro,
						children: [
							(0, react_jsx_runtime.jsx)("h3", {
								id: "mind-garden-archive-title",
								children: t("backup.title")
							}),
							(0, react_jsx_runtime.jsx)("p", { children: t("backup.body") }),
							(0, react_jsx_runtime.jsxs)("div", {
								className: GardenPortabilityPanel_module_css_default.assurances,
								"aria-label": t("backup.assurances"),
								children: [
									(0, react_jsx_runtime.jsx)("span", { children: t("backup.assurance.records") }),
									(0, react_jsx_runtime.jsx)("span", { children: t("backup.assurance.photos") }),
									(0, react_jsx_runtime.jsx)("span", { children: t("backup.assurance.secret") })
								]
							})
						]
					}),
					(0, react_jsx_runtime.jsxs)("form", {
						className: GardenPortabilityPanel_module_css_default.form,
						onSubmit: (event) => {
							submit(event);
						},
						children: [
							(0, react_jsx_runtime.jsxs)("label", { children: [(0, react_jsx_runtime.jsx)("span", { children: t("backup.passphrase") }), (0, react_jsx_runtime.jsx)("input", {
								type: "password",
								autoComplete: "new-password",
								value: passphrase,
								onChange: (event) => {
									setPassphrase(event.target.value);
									setState({ kind: "idle" });
								},
								placeholder: t("backup.passphrase.placeholder"),
								disabled: state.kind === "working"
							})] }),
							(0, react_jsx_runtime.jsxs)("label", { children: [(0, react_jsx_runtime.jsx)("span", { children: t("backup.confirm") }), (0, react_jsx_runtime.jsx)("input", {
								type: "password",
								autoComplete: "new-password",
								value: confirmation,
								onChange: (event) => {
									setConfirmation(event.target.value);
									setState({ kind: "idle" });
								},
								placeholder: t("backup.confirm.placeholder"),
								disabled: state.kind === "working"
							})] }),
							(0, react_jsx_runtime.jsxs)("div", {
								className: GardenPortabilityPanel_module_css_default.formFooter,
								children: [(0, react_jsx_runtime.jsx)("p", {
									className: !matches && confirmation.length > 0 ? GardenPortabilityPanel_module_css_default.validationError : void 0,
									children: !validLength && passphrase.length > 0 ? t("backup.hint.length") : !matches && confirmation.length > 0 ? t("backup.hint.match") : t("backup.hint")
								}), (0, react_jsx_runtime.jsxs)("button", {
									type: "submit",
									disabled: !ready,
									children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconDownloadOutline16, { size: 16 }), state.kind === "working" ? t("backup.working") : t("backup.action")]
								})]
							})
						]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: GardenPortabilityPanel_module_css_default.status,
						"aria-live": "polite",
						children: [state.kind === "success" && (0, react_jsx_runtime.jsxs)("p", { children: [(0, react_jsx_runtime.jsx)("strong", { children: t("backup.success") }), (0, react_jsx_runtime.jsxs)("span", { children: [
							formatBytes(state.value.bytes),
							" · ",
							state.value.filename
						] })] }), state.kind === "error" && (0, react_jsx_runtime.jsxs)("p", {
							className: GardenPortabilityPanel_module_css_default.error,
							children: [(0, react_jsx_runtime.jsx)("strong", { children: t("backup.failed") }), (0, react_jsx_runtime.jsx)("span", { children: t(state.key) })]
						})]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: GardenPortabilityPanel_module_css_default.recoveryBay,
						children: [
							(0, react_jsx_runtime.jsx)("span", {
								className: GardenPortabilityPanel_module_css_default.recoverySeal,
								"aria-hidden": "true",
								children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconFolderOpenOutline16, { size: 16 })
							}),
							(0, react_jsx_runtime.jsxs)("div", {
								className: GardenPortabilityPanel_module_css_default.recoveryCopy,
								children: [(0, react_jsx_runtime.jsx)("h4", { children: t("restore.title") }), (0, react_jsx_runtime.jsx)("p", { children: t("restore.body") })]
							}),
							(0, react_jsx_runtime.jsxs)("div", {
								className: GardenPortabilityPanel_module_css_default.recoveryControls,
								children: [
									(0, react_jsx_runtime.jsx)("input", {
										ref: restoreInputRef,
										className: GardenPortabilityPanel_module_css_default.fileInput,
										type: "file",
										accept: ".mgarden,application/vnd.deepseek-harness.mind-garden-backup",
										"aria-label": t("restore.file"),
										disabled: restore.kind === "inspecting" || restore.kind === "restoring",
										onChange: (event) => {
											setRestoreFile(event.target.files?.[0] ?? null);
											setRestore({ kind: "idle" });
										}
									}),
									(0, react_jsx_runtime.jsxs)("button", {
										type: "button",
										className: GardenPortabilityPanel_module_css_default.fileButton,
										disabled: restore.kind === "inspecting" || restore.kind === "restoring",
										onClick: () => {
											restoreInputRef.current?.click();
										},
										children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconFolderOpenOutline16, { size: 15 }), t("restore.file.action")]
									}),
									(0, react_jsx_runtime.jsx)("span", {
										className: GardenPortabilityPanel_module_css_default.fileName,
										children: restoreFile?.name ?? t("restore.file.empty")
									}),
									(0, react_jsx_runtime.jsxs)("label", {
										className: GardenPortabilityPanel_module_css_default.restoreSecret,
										children: [(0, react_jsx_runtime.jsx)("span", { children: t("restore.passphrase") }), (0, react_jsx_runtime.jsx)("input", {
											type: "password",
											autoComplete: "current-password",
											value: restorePassphrase,
											placeholder: t("restore.passphrase.placeholder"),
											disabled: restore.kind === "inspecting" || restore.kind === "restoring",
											onChange: (event) => {
												setRestorePassphrase(event.target.value);
												setRestore({ kind: "idle" });
											}
										})]
									}),
									(0, react_jsx_runtime.jsxs)("button", {
										type: "button",
										className: GardenPortabilityPanel_module_css_default.inspectButton,
										disabled: restoreFile === null || codePointLength(restorePassphrase) < 8 || restore.kind === "inspecting" || restore.kind === "restoring",
										onClick: () => {
											inspectRestore();
										},
										children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconDataOutline16, { size: 15 }), restore.kind === "inspecting" ? t("restore.inspecting") : t("restore.inspect")]
									})
								]
							}),
							(restore.kind === "preview" || restore.kind === "restoring") && (0, react_jsx_runtime.jsxs)("div", {
								className: GardenPortabilityPanel_module_css_default.restorePreview,
								"aria-live": "polite",
								children: [
									(0, react_jsx_runtime.jsxs)("div", {
										className: GardenPortabilityPanel_module_css_default.previewHeading,
										children: [(0, react_jsx_runtime.jsxs)("span", { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutline16, { size: 15 }), t(restore.value.sourceFormat === "fun-garden-v1" ? "restore.preview.legacy" : "restore.preview.ready")] }), (0, react_jsx_runtime.jsx)("time", {
											dateTime: new Date(restore.value.archiveCreatedAt).toISOString(),
											children: new Date(restore.value.archiveCreatedAt).toLocaleString()
										})]
									}),
									(0, react_jsx_runtime.jsxs)("dl", { children: [
										(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("restore.preview.add") }), (0, react_jsx_runtime.jsx)("dd", { children: String(totalRecords(restore.value.willAdd)) })] }),
										(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("restore.preview.keep") }), (0, react_jsx_runtime.jsx)("dd", { children: String(totalRecords(restore.value.willKeep)) })] }),
										(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("restore.preview.photos") }), (0, react_jsx_runtime.jsx)("dd", { children: String(restore.value.records.attachments) })] }),
										(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("restore.preview.size") }), (0, react_jsx_runtime.jsx)("dd", { children: formatBytes(restore.value.bytes) })] })
									] }),
									(0, react_jsx_runtime.jsxs)("p", { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningOutline16, { size: 14 }), t(restore.value.scope === "legacy-private-profile" ? "restore.preview.legacy.rule" : "restore.preview.rule")] }),
									(0, react_jsx_runtime.jsxs)("div", {
										className: GardenPortabilityPanel_module_css_default.restoreActions,
										children: [(0, react_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: cancelRestore,
											disabled: restore.kind === "restoring",
											children: t("restore.cancel")
										}), (0, react_jsx_runtime.jsxs)("button", {
											type: "button",
											className: GardenPortabilityPanel_module_css_default.restoreConfirm,
											disabled: restore.kind === "restoring",
											onClick: () => {
												commitRestore();
											},
											children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutline16, { size: 15 }), restore.kind === "restoring" ? t("restore.working") : t("restore.action")]
										})]
									})
								]
							}),
							restore.kind === "success" && (0, react_jsx_runtime.jsxs)("div", {
								className: GardenPortabilityPanel_module_css_default.restoreReceipt,
								role: "status",
								children: [
									(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutline16, { size: 16 }),
									(0, react_jsx_runtime.jsxs)("span", { children: [(0, react_jsx_runtime.jsx)("strong", { children: t("restore.success") }), t(restore.value.scope === "legacy-private-profile" ? "restore.success.legacy.body" : "restore.success.body")] }),
									(0, react_jsx_runtime.jsx)("b", { children: String(totalRecords(restore.value.added)) })
								]
							}),
							restore.kind === "error" && (0, react_jsx_runtime.jsxs)("p", {
								className: GardenPortabilityPanel_module_css_default.restoreError,
								role: "alert",
								"data-error-code": restore.code,
								children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningOutline16, { size: 14 }), t(restore.key)]
							})
						]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: GardenPortabilityPanel_module_css_default.rotationBay,
						children: [
							(0, react_jsx_runtime.jsx)("span", {
								className: GardenPortabilityPanel_module_css_default.rotationSeal,
								"aria-hidden": "true",
								children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconRefreshOutline16, { size: 16 })
							}),
							(0, react_jsx_runtime.jsxs)("div", {
								className: GardenPortabilityPanel_module_css_default.rotationCopy,
								children: [
									(0, react_jsx_runtime.jsx)("h4", { children: t("rotation.title") }),
									(0, react_jsx_runtime.jsx)("p", { children: rotation.kind === "confirming" ? t("rotation.confirm.body") : t("rotation.body") }),
									rotation.kind === "success" && (0, react_jsx_runtime.jsxs)("span", {
										className: GardenPortabilityPanel_module_css_default.rotationReceipt,
										children: [
											t("rotation.success"),
											" · ",
											String(rotation.value.records),
											" ",
											t("rotation.records"),
											" · ",
											rotation.value.toKeyId.slice(0, 10),
											"…"
										]
									}),
									rotation.kind === "error" && (0, react_jsx_runtime.jsx)("span", {
										className: GardenPortabilityPanel_module_css_default.rotationError,
										children: t(rotation.key)
									})
								]
							}),
							(0, react_jsx_runtime.jsx)("div", {
								className: GardenPortabilityPanel_module_css_default.rotationActions,
								children: rotation.kind === "confirming" ? (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: GardenPortabilityPanel_module_css_default.rotationCancel,
									onClick: () => {
										setRotation({ kind: "idle" });
									},
									children: t("rotation.cancel")
								}), (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: GardenPortabilityPanel_module_css_default.rotationConfirm,
									onClick: () => {
										rotate();
									},
									children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconRefreshOutline16, { size: 15 }), t("rotation.confirm.action")]
								})] }) : (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: GardenPortabilityPanel_module_css_default.rotationPrepare,
									disabled: rotation.kind === "working",
									onClick: () => {
										setRotation({ kind: "confirming" });
									},
									children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconRefreshOutline16, { size: 15 }), rotation.kind === "working" ? t("rotation.working") : t("rotation.action")]
								})
							})
						]
					})
				]
			});
		}
		//#endregion
		//#region \0dsh-css:E:\test code\deepseekharness_modified\deepseek-harness\packages\client\ui-mind-garden\src\client\MindGardenView.module.css.mjs
		const css = "@font-face{font-family:Mind Garden Display;src:url(/plugins/@deepseek-ai/dsh-mind-garden/assets/mind-garden-display.woff2)format(\"woff2\");font-style:normal;font-weight:200 900;font-display:swap}.sXUbBq_shell{--mg-paper:color-mix(in srgb, var(--dsw-alias-bg-base) 93%, var(--dsw-alias-state-warn-secondary));--mg-paper-deep:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 90%, var(--dsw-alias-state-warn-secondary));--mg-ink:color-mix(in srgb, var(--dsw-alias-label-primary) 91%, var(--dsw-alias-state-success-primary));--mg-sage:color-mix(in srgb, var(--dsw-alias-state-success-primary) 68%, var(--dsw-alias-label-primary));--mg-brass-ui:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 68%, var(--dsw-alias-label-primary));width:100%;height:100%;min-height:0;color:var(--dsw-alias-label-primary);background:var(--mg-paper);isolation:isolate;display:flex;position:relative;overflow:hidden}.sXUbBq_workspace{flex:1;min-width:0;min-height:0;position:relative;overflow:hidden;container:sXUbBq_mind-garden-workspace/inline-size}.sXUbBq_spaceMount{width:100%;min-height:100%}.sXUbBq_settingsScrim{--mg-paper-bright:#fffaf2;--mg-paper-deep:#ead8c0;--mg-ink:#342d27;--mg-muted:#76695e;--mg-indigo:#405f87;--mg-font-ui:\"Noto Sans SC\", \"Source Han Sans SC\", \"PingFang SC\", \"Microsoft YaHei UI\", system-ui, sans-serif;--mg-font-reflection:\"Mind Garden Display\", \"Noto Serif SC\", \"Source Han Serif SC\", serif;z-index:1200;background:color-mix(in srgb, var(--dsw-alias-bg-mask-drop) 42%, transparent);backdrop-filter:blur(10px)saturate(.82);color:var(--mg-ink);font-family:var(--mg-font-ui);overscroll-behavior:contain;place-items:end center;padding:24px;display:grid;position:fixed;inset:0}.sXUbBq_settingsSheet{border:1px solid color-mix(in srgb, var(--dsw-alias-state-warn-primary) 26%, var(--dsw-alias-border-l2));background:linear-gradient(180deg, color-mix(in srgb, var(--dsw-alias-state-warn-secondary) 10%, var(--dsw-alias-bg-base)), var(--dsw-alias-bg-base));width:min(920px,100%);max-height:min(880px,100% - 24px);box-shadow:0 28px 90px color-mix(in srgb, var(--dsw-alias-bg-mask-drop) 36%, transparent), inset 0 1px color-mix(in srgb, var(--dsw-alias-label-primary-inverted) 8%, transparent);scrollbar-color:var(--dsw-alias-border-l2) transparent;scrollbar-width:thin;border-radius:11px 11px 5px 5px;padding:0;overflow:auto}.sXUbBq_settingsHeading{isolation:isolate;min-height:210px;color:var(--dsw-alias-label-primary-inverted);background:radial-gradient(circle at 14% 24%, color-mix(in srgb, var(--dsw-alias-state-success-primary) 24%, transparent), transparent 16rem), linear-gradient(126deg, color-mix(in srgb, var(--dsw-alias-label-primary) 89%, var(--dsw-alias-state-success-primary)), var(--dsw-alias-label-primary));grid-template-columns:104px minmax(0,1fr) auto;align-items:center;gap:28px;padding:30px 28px;display:grid;position:relative;overflow:hidden}.sXUbBq_settingsInstrument{aspect-ratio:1;width:96px;color:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 80%, var(--dsw-alias-label-primary-inverted));border:1px solid color-mix(in srgb, var(--dsw-alias-state-warn-primary) 42%, transparent);box-shadow:inset 0 0 24px color-mix(in srgb, var(--dsw-alias-state-success-primary) 16%, transparent), 0 0 0 9px color-mix(in srgb, var(--dsw-alias-state-warn-primary) 4%, transparent);border-radius:50%;place-items:center;display:grid;position:relative}.sXUbBq_settingsInstrument i{border:1px solid color-mix(in srgb, var(--dsw-alias-state-warn-primary) 30%, transparent);border-radius:50%;position:absolute}.sXUbBq_settingsInstrument i:first-child{aspect-ratio:1;width:72%;animation:20s linear infinite sXUbBq_settings-orbit;transform:rotateX(64deg)rotate(18deg)}.sXUbBq_settingsInstrument i:nth-child(2){width:118%;height:34%;transform:rotate(-16deg)}.sXUbBq_settingsInstrument i:nth-child(3){aspect-ratio:1;background:var(--dsw-alias-state-warn-primary);width:4px;box-shadow:0 0 12px color-mix(in srgb, var(--dsw-alias-state-warn-primary) 72%, transparent);border:0;transform:translate(41px,-14px)}.sXUbBq_settingsHeadingCopy{min-width:0}.sXUbBq_settingsHeadingCopy>span{color:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 72%, var(--dsw-alias-label-primary-inverted));letter-spacing:.13em;font-size:11px;font-weight:650}.sXUbBq_settingsHeading h2{letter-spacing:-.025em;margin:8px 0 0;font-family:Mind Garden Display,Noto Serif SC,Songti SC,serif;font-size:clamp(28px,3.2vw,43px);font-weight:520;line-height:1.22}.sXUbBq_settingsHeadingCopy>p{max-width:64ch;color:color-mix(in srgb, var(--dsw-alias-label-primary-inverted) 64%, transparent);margin:10px 0 0;font-size:12px;line-height:1.65}.sXUbBq_settingsAssurances{flex-wrap:wrap;gap:14px 22px;margin-block-start:17px;display:flex}.sXUbBq_settingsAssurances span{color:color-mix(in srgb, var(--dsw-alias-label-primary-inverted) 72%, transparent);align-items:center;gap:6px;font-size:11px;line-height:1.55;display:flex}.sXUbBq_settingsHeading button{border:1px solid color-mix(in srgb, var(--dsw-alias-label-primary-inverted) 18%, transparent);min-height:44px;color:var(--dsw-alias-label-primary-inverted);background:color-mix(in srgb, var(--dsw-alias-label-primary-inverted) 6%, transparent);font:inherit;cursor:pointer;border-radius:6px;align-self:start;align-items:center;gap:6px;padding:7px 10px;display:inline-flex}.sXUbBq_settingsHeading button:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px}.sXUbBq_settingsContent{gap:42px;padding:28px;display:grid}.sXUbBq_settingsDialogue,.sXUbBq_settingsPortability{grid-template-columns:42px minmax(0,1fr);align-items:start;padding-block-start:8px;display:grid;position:relative}.sXUbBq_settingsIndex{color:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 66%, var(--dsw-alias-label-tertiary));align-items:center;gap:4px;padding-block-start:5px;font-family:Mind Garden Display,Noto Serif SC,Songti SC,serif;font-size:14px;display:inline-flex}.sXUbBq_settingsDialogue>div,.sXUbBq_settingsPortability>section{min-width:0;margin:0}@media (width<=620px){.sXUbBq_settingsScrim{padding:12px}.sXUbBq_settingsSheet{max-height:calc(100% - 8px)}.sXUbBq_settingsHeading{grid-template-columns:58px minmax(0,1fr) auto;gap:14px;min-height:180px;padding:22px 16px}.sXUbBq_settingsInstrument{width:52px}.sXUbBq_settingsInstrument i:nth-child(3){transform:translate(22px,-8px)}.sXUbBq_settingsHeadingCopy>p{font-size:12px}.sXUbBq_settingsAssurances{grid-column:1/-1;gap:8px 12px}.sXUbBq_settingsHeading button{padding-inline:8px}.sXUbBq_settingsContent{gap:24px;padding:20px 14px}.sXUbBq_settingsDialogue,.sXUbBq_settingsPortability{grid-template-columns:1fr}.sXUbBq_settingsIndex{margin-block-end:8px}}@keyframes sXUbBq_settings-orbit{to{transform:rotateX(64deg)rotate(378deg)}}.sXUbBq_view,.sXUbBq_inactive{box-sizing:border-box;width:100%;min-height:100%;color:var(--dsw-alias-label-primary)}.sXUbBq_view{background:radial-gradient(circle at 9% 2%, color-mix(in srgb, var(--dsw-alias-state-warn-secondary) 24%, transparent), transparent 27rem), radial-gradient(circle at 92% 22%, color-mix(in srgb, var(--dsw-alias-state-success-secondary) 13%, transparent), transparent 30rem), var(--mg-paper);scrollbar-color:var(--dsw-alias-border-l2) transparent;scrollbar-width:thin;padding:0 clamp(20px,4vw,58px) 64px;overflow:auto}.sXUbBq_inactive{background:var(--dsw-alias-bg-base);grid-template-columns:minmax(280px,.78fr) minmax(420px,1.22fr);align-items:center;gap:clamp(26px,5vw,78px);max-width:1440px;margin:auto;padding:clamp(36px,6vw,84px);display:grid}.sXUbBq_inactiveContent{z-index:1;gap:28px;display:grid;position:relative}.sXUbBq_inactiveCopy{max-width:640px}.sXUbBq_inactiveArtwork{object-fit:contain;filter:saturate(.92)contrast(1.02);mix-blend-mode:multiply;justify-self:end;width:min(100%,820px);max-height:min(68vh,680px);display:block}.sXUbBq_inactiveCopy h1,.sXUbBq_hero h1{letter-spacing:-.03em;margin:0}.sXUbBq_inactiveCopy h1{font-size:clamp(28px,5vw,44px)}.sXUbBq_inactiveCopy p,.sXUbBq_hero p,.sXUbBq_sectionHeader p{color:var(--dsw-alias-label-secondary);margin:0;line-height:1.65}.sXUbBq_todayOpening{--mg-night:color-mix(in srgb, var(--dsw-alias-label-primary) 94%, var(--dsw-alias-state-success-primary));--mg-night-soft:color-mix(in srgb, var(--dsw-alias-label-primary) 84%, var(--dsw-alias-state-success-primary));--mg-bone:var(--dsw-alias-label-primary-inverted);--mg-brass:var(--dsw-alias-state-warn-primary);--mg-brass-light:var(--dsw-alias-state-warn-secondary);--mg-brass-dark:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 46%, var(--dsw-alias-label-primary));--mg-teal:color-mix(in srgb, var(--dsw-alias-state-success-primary) 42%, var(--dsw-alias-label-primary));--mg-teal-light:var(--dsw-alias-state-success-secondary);--mg-oxblood:color-mix(in srgb, var(--dsw-alias-state-error-primary) 58%, var(--dsw-alias-label-primary));--mg-oxblood-light:var(--dsw-alias-state-error-secondary);border:1px solid color-mix(in srgb, var(--mg-brass-light) 44%, transparent);max-width:1440px;min-height:clamp(640px,70vh,740px);color:var(--mg-bone);background:var(--mg-night);box-shadow:0 36px 90px color-mix(in srgb, var(--dsw-alias-label-primary) 25%, transparent), 0 8px 22px color-mix(in srgb, var(--mg-brass) 10%, transparent), inset 0 1px color-mix(in srgb, var(--mg-brass-light) 44%, transparent);isolation:isolate;border-radius:11px;grid-template-columns:minmax(0,1.7fr) minmax(260px,.68fr);align-items:center;gap:clamp(4px,1.2vw,18px);margin:22px auto 58px;padding:76px 18px 18px;display:grid;position:relative;overflow:hidden}body[data-ds-dark-theme] .sXUbBq_todayOpening{--mg-night:var(--dsw-alias-bg-base);--mg-night-soft:var(--dsw-alias-bg-layer-1);--mg-bone:var(--dsw-alias-label-primary);--mg-brass-dark:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 46%, var(--dsw-alias-bg-base));--mg-teal:color-mix(in srgb, var(--dsw-alias-state-success-primary) 42%, var(--dsw-alias-bg-base));--mg-oxblood:color-mix(in srgb, var(--dsw-alias-state-error-primary) 58%, var(--dsw-alias-bg-base))}.sXUbBq_todayOpening:before,.sXUbBq_todayOpening:after{z-index:1;content:\"\";pointer-events:none;position:absolute;inset:0}.sXUbBq_todayOpening:before{background:linear-gradient(90deg, color-mix(in srgb, var(--mg-night) 6%, transparent) 40%, color-mix(in srgb, var(--mg-night) 66%, transparent) 69%, var(--mg-night) 100%), linear-gradient(180deg, color-mix(in srgb, var(--mg-night) 58%, transparent), transparent 18%, transparent 72%, color-mix(in srgb, var(--mg-night) 46%, transparent)), radial-gradient(circle at 34% 48%, transparent 22%, color-mix(in srgb, var(--mg-night) 34%, transparent) 68%)}.sXUbBq_todayOpening:after{border:1px solid color-mix(in srgb, var(--mg-brass-light) 29%, transparent);box-shadow:inset 0 0 0 1px color-mix(in srgb, var(--mg-night) 46%, transparent), inset 0 0 42px color-mix(in srgb, var(--mg-night) 16%, transparent);border-radius:10px;inset:8px}.sXUbBq_observatoryMasthead{z-index:7;border-block-end:1px solid color-mix(in srgb, var(--mg-brass-light) 24%, transparent);justify-content:space-between;align-items:center;gap:24px;min-height:38px;padding-block-end:12px;display:flex;position:absolute;inset:18px 24px auto}.sXUbBq_observatoryIdentity,.sXUbBq_observatoryIdentity>span,.sXUbBq_observatoryMeta,.sXUbBq_observatoryMeta>span{align-items:center;display:flex}.sXUbBq_observatoryIdentity{color:color-mix(in srgb, var(--mg-brass-light) 78%, var(--mg-bone));gap:10px}.sXUbBq_observatoryIdentity>span{align-items:baseline;gap:9px}.sXUbBq_observatoryIdentity strong{color:var(--mg-bone);letter-spacing:.08em;font-family:Mind Garden Display,Noto Serif SC,Songti SC,serif;font-size:13px;font-weight:580}.sXUbBq_observatoryIdentity small,.sXUbBq_observatoryMeta{color:color-mix(in srgb, var(--mg-bone) 48%, transparent);letter-spacing:.06em;font-size:9px}.sXUbBq_observatoryMeta{font-variant-numeric:tabular-nums;gap:15px}.sXUbBq_observatoryMeta>span{color:color-mix(in srgb, var(--mg-bone) 62%, transparent);gap:5px}.sXUbBq_ambientDust{z-index:2;pointer-events:none;position:absolute;inset:0;overflow:hidden}.sXUbBq_ambientDust i{background:var(--mg-brass-light);width:2px;height:2px;box-shadow:0 0 10px color-mix(in srgb, var(--mg-brass-light) 58%, transparent);opacity:.22;border-radius:50%;animation:11s ease-in-out infinite alternate sXUbBq_gardenDustRise;position:absolute}.sXUbBq_ambientDust i:nth-child(3n){width:1px;height:1px;animation-duration:15s}.sXUbBq_ambientDust i:nth-child(4n){background:var(--mg-teal-light);animation-duration:18s}.sXUbBq_ambientDust i:nth-child(5n){animation-delay:-7s}.sXUbBq_ambientDust i:first-child{inset:16% auto auto 8%}.sXUbBq_ambientDust i:nth-child(2){inset:32% auto auto 17%}.sXUbBq_ambientDust i:nth-child(3){inset:74% auto auto 12%}.sXUbBq_ambientDust i:nth-child(4){inset:61% auto auto 27%}.sXUbBq_ambientDust i:nth-child(5){inset:20% auto auto 39%}.sXUbBq_ambientDust i:nth-child(6){inset:83% auto auto 42%}.sXUbBq_ambientDust i:nth-child(7){inset:39% auto auto 54%}.sXUbBq_ambientDust i:nth-child(8){inset:68% auto auto 59%}.sXUbBq_ambientDust i:nth-child(9){inset:23% auto auto 65%}.sXUbBq_ambientDust i:nth-child(10){inset:77% auto auto 71%}.sXUbBq_ambientDust i:nth-child(11){inset:45% auto auto 79%}.sXUbBq_ambientDust i:nth-child(12){inset:18% auto auto 88%}.sXUbBq_ambientDust i:nth-child(13){inset:88% auto auto 92%}.sXUbBq_ambientDust i:nth-child(14){inset:57% auto auto 94%}.sXUbBq_ambientDust i:nth-child(15){inset:12% auto auto 25%}.sXUbBq_ambientDust i:nth-child(16){inset:91% auto auto 31%}.sXUbBq_ambientDust i:nth-child(17){inset:48% auto auto 4%}.sXUbBq_ambientDust i:nth-child(18){inset:35% auto auto 97%}@keyframes sXUbBq_gardenDustRise{to{opacity:.64;transform:translate(8px,-14px)scale(1.35)}}.sXUbBq_observatoryMaterial{z-index:0;object-fit:cover;object-position:50% 50%;opacity:.92;filter:saturate(.9)contrast(1.03)brightness(.78);pointer-events:none;user-select:none;width:100%;height:100%;position:absolute;inset:0}.sXUbBq_orreryStage{z-index:2;align-self:center;place-items:center;min-width:0;display:grid;position:relative}.sXUbBq_orreryHero{color:var(--mg-bone);text-shadow:0 5px 22px color-mix(in srgb, var(--mg-night) 88%, transparent);justify-items:center;padding:20px;display:grid}.sXUbBq_orreryHero h1,.sXUbBq_orreryHero p{margin:0}.sXUbBq_orreryHero h1{letter-spacing:-.025em;text-wrap:balance;max-width:9ch;filter:drop-shadow(0 2px 12px color-mix(in srgb, var(--mg-brass-light) 12%, transparent));font-family:Mind Garden Display,Noto Serif SC,Songti SC,serif;font-size:clamp(28px,3.2vw,43px);font-weight:560;line-height:1.22}.sXUbBq_orreryHero p{max-width:25ch;color:color-mix(in srgb, var(--mg-bone) 72%, transparent);text-wrap:balance;margin-block-start:14px;font-size:13px;line-height:1.7}.sXUbBq_heroActions{flex-wrap:wrap;justify-content:center;align-items:center;gap:10px;margin-block-start:22px;display:flex}.sXUbBq_heroPrimary,.sXUbBq_heroSecondary{box-sizing:border-box;border-radius:5px;justify-content:center;align-items:center;min-height:40px;padding:8px 16px;font-size:13px;font-weight:600;text-decoration:none;transition:background .18s ease-out,color .18s ease-out,box-shadow .3s ease-out,transform .22s cubic-bezier(.16,1,.3,1);display:inline-flex}.sXUbBq_heroPrimary{border:1px solid color-mix(in srgb, var(--mg-brass-light) 58%, transparent);color:var(--mg-bone);background:linear-gradient(180deg, color-mix(in srgb, var(--mg-oxblood-light) 28%, transparent), transparent), var(--mg-oxblood);box-shadow:inset 0 1px color-mix(in srgb, var(--mg-bone) 14%, transparent), 0 9px 20px color-mix(in srgb, var(--mg-night) 54%, transparent)}.sXUbBq_heroSecondary{border:1px solid color-mix(in srgb, var(--mg-brass-light) 46%, transparent);color:color-mix(in srgb, var(--mg-bone) 82%, transparent);background:color-mix(in srgb, var(--mg-night-soft) 66%, transparent);backdrop-filter:blur(10px)saturate(.8)}.sXUbBq_heroPrimary:hover{box-shadow:0 12px 26px color-mix(in srgb, var(--mg-oxblood) 28%, transparent)}.sXUbBq_echoLedger{z-index:3;border:1px solid color-mix(in srgb, var(--mg-brass-light) 58%, transparent);min-width:0;color:var(--mg-bone);background:linear-gradient(145deg, color-mix(in srgb, var(--mg-bone) 5%, transparent), transparent 28%), color-mix(in srgb, var(--mg-night-soft) 78%, transparent);box-shadow:inset 0 0 0 4px color-mix(in srgb, var(--mg-night) 54%, transparent), 0 28px 52px color-mix(in srgb, var(--mg-night) 48%, transparent), 0 0 36px color-mix(in srgb, var(--mg-brass) 6%, transparent);backdrop-filter:blur(18px)saturate(.82);border-radius:5px;align-content:start;align-self:stretch;margin:20px 8px 18px 0;padding:30px 25px 22px;display:grid;position:relative}.sXUbBq_echoLedger:before{border:1px solid color-mix(in srgb, var(--mg-brass-light) 22%, transparent);content:\"\";pointer-events:none;position:absolute;inset:8px}.sXUbBq_echoLedger:after{background:linear-gradient(180deg, color-mix(in srgb, var(--mg-bone) 4%, transparent), transparent);content:\"\";pointer-events:none;height:22%;position:absolute;inset:12px 12px auto}.sXUbBq_echoLedger header{border-block-end:1px solid color-mix(in srgb, var(--mg-brass-light) 34%, transparent);align-items:center;gap:11px;padding-block-end:17px;display:flex}.sXUbBq_echoLedger h2{letter-spacing:.03em;margin:0;font-family:Mind Garden Display,Noto Serif SC,Songti SC,serif;font-size:19px;font-weight:560}.sXUbBq_ledgerMark{border:1px solid var(--mg-brass-light);border-radius:50%;flex:none;width:17px;height:17px;position:relative}.sXUbBq_ledgerMark:before,.sXUbBq_ledgerMark:after{background:var(--mg-brass-light);content:\"\";width:11px;height:1px;position:absolute;inset:50% auto auto 50%;transform:translate(-50%,-50%)}.sXUbBq_ledgerMark:after{transform:translate(-50%,-50%)rotate(90deg)}.sXUbBq_echoLedger article{z-index:1;border-block-end:1px solid color-mix(in srgb, var(--mg-brass-light) 22%, transparent);gap:7px;padding:22px 2px;display:grid;position:relative}.sXUbBq_echoLedger time,.sXUbBq_echoLedger small,.sXUbBq_echoLedger footer>span{color:color-mix(in srgb, var(--mg-bone) 50%, transparent);font-variant-numeric:tabular-nums;letter-spacing:.08em;font-size:9px}.sXUbBq_echoLedger strong{color:color-mix(in srgb, var(--mg-brass-light) 76%, var(--mg-bone));font-size:11px;font-weight:600}.sXUbBq_echoLedger article p{color:color-mix(in srgb, var(--mg-bone) 82%, transparent);-webkit-line-clamp:3;-webkit-box-orient:vertical;margin:0;font-family:Mind Garden Display,Noto Serif SC,Songti SC,serif;font-size:14px;line-height:1.75;display:-webkit-box;overflow:hidden}.sXUbBq_echoLedger footer{z-index:1;gap:10px;padding:22px 2px 0;display:grid;position:relative}.sXUbBq_echoLedger footer a{color:var(--mg-bone);justify-content:space-between;align-items:center;gap:12px;font-size:12px;font-weight:560;text-decoration:none;display:flex}.sXUbBq_echoLedger footer a i{flex:none;width:20px;height:10px;position:relative}.sXUbBq_echoLedger footer a i:before,.sXUbBq_echoLedger footer a i:after{content:\"\";position:absolute}.sXUbBq_echoLedger footer a i:before{background:currentColor;height:1px;inset:50% 0 auto}.sXUbBq_echoLedger footer a i:after{border-block-start:1px solid;border-inline-end:1px solid;width:7px;height:7px;inset:2px 0 auto auto;transform:rotate(45deg)}.sXUbBq_echoLedger footer a:hover{color:var(--mg-brass-light)}.sXUbBq_ledgerScrew{z-index:2;border:1px solid var(--mg-brass-light);background:var(--mg-brass-dark);border-radius:50%;width:7px;height:7px;position:absolute;inset-inline-end:12px}.sXUbBq_ledgerScrew[data-position=top]{inset-block-start:12px}.sXUbBq_ledgerScrew[data-position=bottom]{inset-block-end:12px}.sXUbBq_eyebrow{display:none}.sXUbBq_privacy{color:var(--dsw-alias-label-secondary);white-space:nowrap;align-items:center;gap:7px;margin-block-start:18px;font-size:11px;font-weight:520;display:inline-flex}.sXUbBq_instrumentStatus{flex-wrap:wrap;justify-content:center;align-items:center;gap:8px 12px;margin-block-start:16px;display:flex}.sXUbBq_posture{color:color-mix(in srgb, var(--mg-brass-light) 76%, var(--mg-bone));letter-spacing:.12em;font-size:9px;font-weight:600}.sXUbBq_orreryHero .sXUbBq_privacy{color:color-mix(in srgb, var(--mg-bone) 56%, transparent);margin-block-start:0;font-size:9px}.sXUbBq_privacy:before{background:var(--dsw-alias-state-success-primary);content:\"\";border-radius:50%;width:6px;height:6px}.sXUbBq_hero>.sXUbBq_privacy{margin-block-start:5px}.sXUbBq_metrics{max-width:1180px;margin:0 auto 30px;display:flex}.sXUbBq_metrics>div{align-items:baseline;gap:9px;min-width:0;padding:13px 24px 13px 0;display:flex}.sXUbBq_metrics>div+div{border-inline-start:1px solid var(--dsw-alias-border-l2);margin-inline-start:24px;padding-inline-start:24px}.sXUbBq_metrics strong{font-variant-numeric:tabular-nums;font-size:18px;font-weight:650}.sXUbBq_metrics span,.sXUbBq_sourceCount,.sXUbBq_formFooter>span{color:var(--dsw-alias-label-secondary);font-size:11px}.sXUbBq_columns{grid-template-columns:minmax(0,.92fr) minmax(0,1.08fr);align-items:start;gap:clamp(28px,4vw,64px);max-width:1180px;margin:34px auto 0;display:grid}.sXUbBq_columns[data-scope=memory],.sXUbBq_columns[data-scope=life]{grid-template-columns:minmax(0,48rem);justify-content:center}.sXUbBq_hero[data-space=life]{--life-green:color-mix(in srgb, var(--dsw-alias-label-primary) 90%, var(--dsw-alias-state-success-primary));--life-brass:var(--dsw-alias-state-warn-primary);grid-template-columns:minmax(0,1.35fr) minmax(260px,.65fr);align-items:center;gap:clamp(28px,5vw,70px);max-width:1180px;margin:0 auto;padding:42px 0 34px;display:grid}.sXUbBq_hero[data-space=life] .sXUbBq_eyebrow{color:color-mix(in srgb, var(--dsw-alias-state-success-primary) 64%, var(--dsw-alias-label-primary));letter-spacing:.13em;align-items:center;gap:8px;margin-bottom:13px;font-size:9px;font-weight:680;display:flex}.sXUbBq_hero[data-space=life] h1{text-wrap:balance;max-width:17ch;font-family:Mind Garden Display,Noto Serif SC,Songti SC,serif;font-size:clamp(28px,5vw,44px);font-weight:550;line-height:1.08}.sXUbBq_hero[data-space=life] p{max-width:66ch;margin-top:15px;font-size:13px}.sXUbBq_lifeHorizon{isolation:isolate;border:1px solid color-mix(in srgb, var(--life-brass) 32%, transparent);min-height:220px;color:var(--life-brass);background:radial-gradient(circle at 50% 45%, color-mix(in srgb, var(--dsw-alias-state-success-primary) 18%, transparent), transparent 30%), var(--life-green);box-shadow:inset 0 1px color-mix(in srgb, var(--dsw-alias-label-primary-inverted) 8%, transparent), 0 24px 62px color-mix(in srgb, var(--life-green) 15%, transparent);border-radius:11px;place-items:center;margin:0;display:grid;position:relative;overflow:hidden}.sXUbBq_lifeHorizon>svg{z-index:2;filter:drop-shadow(0 5px 10px color-mix(in srgb, var(--dsw-alias-label-primary) 28%, transparent));position:relative}.sXUbBq_lifeRings,.sXUbBq_lifeRings i{border:1px solid color-mix(in srgb, var(--life-brass) 30%, transparent);border-radius:50%;position:absolute;inset:50%;transform:translate(-50%,-50%)}.sXUbBq_lifeRings{width:178px;height:118px;animation:20s linear infinite sXUbBq_life-horizon}.sXUbBq_lifeRings i:first-child{width:132px;height:132px;transform:translate(-50%,-50%)scaleY(.38)rotate(28deg)}.sXUbBq_lifeRings i:nth-child(2){width:92px;height:92px;transform:translate(-50%,-50%)scaleY(.48)rotate(-34deg)}.sXUbBq_lifeRings i:nth-child(3){border-style:dashed;width:214px;height:62px;transform:translate(-50%,-50%)rotate(11deg)}.sXUbBq_lifeRings i:nth-child(4){border-color:color-mix(in srgb, var(--dsw-alias-label-primary-inverted) 68%, var(--life-brass));background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 56%, var(--dsw-alias-label-primary));width:8px;height:8px;transform:translate(57px,-48px)}.sXUbBq_lifeHorizon figcaption{z-index:2;border-top:1px solid color-mix(in srgb, var(--life-brass) 18%, transparent);color:color-mix(in srgb, var(--dsw-alias-label-primary-inverted) 56%, var(--life-brass));align-items:baseline;gap:7px;padding-top:10px;font-size:9px;display:flex;position:absolute;inset:auto 18px 15px}.sXUbBq_lifeHorizon figcaption strong{color:color-mix(in srgb, var(--dsw-alias-label-primary-inverted) 76%, var(--life-brass));font-family:Mind Garden Display,Noto Serif SC,Songti SC,serif;font-size:18px;font-weight:550}.sXUbBq_metrics[data-space=life]{border-color:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 24%, var(--dsw-alias-border-l2));max-width:1180px;margin-bottom:18px}.sXUbBq_columns[data-scope=life]{grid-template-columns:minmax(0,1180px);margin-top:18px}.sXUbBq_columns[data-scope=life] .sXUbBq_section{border-top:0;padding-top:10px}.sXUbBq_columns[data-scope=life] .sXUbBq_sectionHeader{justify-content:space-between;align-items:end;gap:28px;padding-bottom:19px;display:flex}.sXUbBq_columns[data-scope=life] .sXUbBq_sectionHeader h2{font-family:Mind Garden Display,Noto Serif SC,Songti SC,serif;font-size:22px;font-weight:550}.sXUbBq_columns[data-scope=life] .sXUbBq_sectionHeader p{text-align:right;max-width:50ch}.sXUbBq_columns[data-scope=life] .sXUbBq_rangePicker{border:1px solid color-mix(in srgb, var(--dsw-alias-state-warn-primary) 28%, transparent);color:var(--dsw-alias-label-primary-inverted);background:color-mix(in srgb, var(--dsw-alias-label-primary) 90%, var(--dsw-alias-state-success-primary));box-shadow:inset 0 1px color-mix(in srgb, var(--dsw-alias-label-primary-inverted) 7%, transparent), 0 24px 62px color-mix(in srgb, var(--dsw-alias-label-primary) 12%, transparent);border-radius:10px;grid-template-columns:.72fr 1fr 1fr auto;align-items:end;gap:13px;margin-top:24px;padding:24px 26px;display:grid}.sXUbBq_columns[data-scope=life] .sXUbBq_rangePicker label{color:color-mix(in srgb, var(--dsw-alias-label-primary-inverted) 64%, var(--dsw-alias-state-warn-primary));font-size:10px}.sXUbBq_columns[data-scope=life] .sXUbBq_rangePicker :is(input,select){border-color:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 20%, transparent);color:var(--dsw-alias-label-primary-inverted);background:color-mix(in srgb, var(--dsw-alias-label-primary) 68%, transparent)}.sXUbBq_columns[data-scope=life] .sXUbBq_rangePicker .sXUbBq_secondary{border-color:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 42%, transparent);min-height:34px;color:color-mix(in srgb, var(--dsw-alias-label-primary-inverted) 76%, var(--dsw-alias-state-warn-primary));grid-column:auto}.sXUbBq_columns[data-scope=life] .sXUbBq_material{border:1px solid color-mix(in srgb, var(--dsw-alias-state-warn-primary) 22%, var(--dsw-alias-border-l2));background:color-mix(in srgb, var(--mg-paper) 86%, var(--dsw-alias-bg-base));border-radius:9px;margin-top:22px;padding:24px 26px}.sXUbBq_columns[data-scope=life] .sXUbBq_cardList{margin-top:24px;padding-left:42px;position:relative}.sXUbBq_columns[data-scope=life] .sXUbBq_cardList:before{background:linear-gradient(var(--dsw-alias-state-warn-primary), color-mix(in srgb, var(--dsw-alias-state-success-primary) 34%, transparent));content:\"\";opacity:.46;width:1px;position:absolute;inset:0 auto 0 15px}.sXUbBq_columns[data-scope=life] .sXUbBq_reviewCard{border-color:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 18%, var(--dsw-alias-border-l2));padding:24px 0 27px;position:relative}.sXUbBq_columns[data-scope=life] .sXUbBq_reviewCard:before{border:1px solid color-mix(in srgb, var(--dsw-alias-state-warn-primary) 54%, var(--dsw-alias-border-l2));background:var(--mg-paper);content:\"\";border-radius:50%;width:14px;height:14px;position:absolute;top:24px;left:-34px}.sXUbBq_columns[data-scope=life] .sXUbBq_reviewText{max-width:78ch;font-family:Mind Garden Display,Noto Serif SC,Songti SC,serif;font-size:17px;line-height:1.72}.sXUbBq_cardActions button{align-items:center;gap:6px;display:inline-flex}@keyframes sXUbBq_life-horizon{to{transform:translate(-50%,-50%)rotate(360deg)}}.sXUbBq_section{min-width:0;padding-block:24px}.sXUbBq_sectionHeader h2{margin:0;font-size:19px;font-weight:620}.sXUbBq_sectionHeader p{max-width:68ch;margin-block-start:7px;font-size:12px}.sXUbBq_sectionMark{width:22px;height:22px;color:var(--dsw-alias-state-business-primary);place-items:center;font-size:12px;font-weight:650;display:inline-grid}.sXUbBq_composer,.sXUbBq_rangePicker,.sXUbBq_material{border-block:1px solid var(--dsw-alias-border-l2);margin-block-start:20px;padding-block:16px}.sXUbBq_composer>label,.sXUbBq_material>label,.sXUbBq_rangePicker label,.sXUbBq_formFooter label{color:var(--dsw-alias-label-secondary);font-size:12px;font-weight:550}.sXUbBq_composer textarea,.sXUbBq_material textarea,.sXUbBq_rangePicker input,.sXUbBq_rangePicker select,.sXUbBq_formFooter input{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-base);font:inherit;border-radius:8px;outline:0}.sXUbBq_composer textarea,.sXUbBq_material textarea{resize:vertical;width:100%;margin-block-start:8px;padding:11px 12px;line-height:1.55}.sXUbBq_composer textarea:focus,.sXUbBq_material textarea:focus,.sXUbBq_rangePicker input:focus,.sXUbBq_rangePicker select:focus,.sXUbBq_formFooter input:focus{border-color:var(--dsw-alias-state-business-primary)}.sXUbBq_formFooter{justify-content:space-between;align-items:center;gap:12px;margin-block-start:11px;display:flex}.sXUbBq_formFooter label{align-items:center;gap:8px;display:flex}.sXUbBq_formFooter input,.sXUbBq_rangePicker input,.sXUbBq_rangePicker select{min-height:34px;padding:5px 8px}.sXUbBq_primary,.sXUbBq_secondary,.sXUbBq_cardActions button,.sXUbBq_feedbackError button{min-height:35px;font:inherit;cursor:pointer;border-radius:8px;padding:6px 12px;font-size:12px;font-weight:600}.sXUbBq_primary{border:1px solid var(--dsw-alias-state-business-primary);color:var(--dsw-alias-label-inverse);background:var(--dsw-alias-state-business-primary)}.sXUbBq_secondary,.sXUbBq_cardActions button,.sXUbBq_feedbackError button{border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);background:0 0}.sXUbBq_primary:hover,.sXUbBq_secondary:hover,.sXUbBq_cardActions button:hover,.sXUbBq_feedbackError button:hover{filter:brightness(.96)}.sXUbBq_primary:disabled,.sXUbBq_secondary:disabled,.sXUbBq_cardActions button:disabled,textarea:disabled,input:disabled,select:disabled{cursor:default;opacity:.48}.sXUbBq_heroPrimary:focus-visible,.sXUbBq_heroSecondary:focus-visible,.sXUbBq_primary:focus-visible,.sXUbBq_secondary:focus-visible,.sXUbBq_cardActions button:focus-visible,.sXUbBq_feedbackError button:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px}.sXUbBq_cardList{margin-block-start:16px;display:grid}.sXUbBq_questionCard,.sXUbBq_reviewCard{padding-block:16px}.sXUbBq_questionCard+.sXUbBq_questionCard,.sXUbBq_reviewCard+.sXUbBq_reviewCard{margin-block-start:8px}.sXUbBq_questionCard[data-status=resolved],.sXUbBq_questionCard[data-status=dismissed]{opacity:.68}.sXUbBq_cardMeta{justify-content:space-between;align-items:center;gap:12px;display:flex}.sXUbBq_cardMeta time{color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums;font-size:11px}.sXUbBq_status{color:var(--dsw-alias-state-business-primary);font-size:11px;font-weight:600}.sXUbBq_questionText,.sXUbBq_reviewText{max-width:72ch;color:var(--dsw-alias-label-primary);white-space:pre-wrap;margin:12px 0;line-height:1.65}.sXUbBq_questionCard blockquote{border-inline-start:1px solid var(--dsw-alias-state-business-primary);color:var(--dsw-alias-label-secondary);margin:12px 0;padding-inline-start:12px;font-size:12px}.sXUbBq_cardActions{flex-wrap:wrap;justify-content:flex-end;gap:7px;display:flex}.sXUbBq_rangePicker{grid-template-columns:.8fr 1fr 1fr;gap:10px;display:grid}.sXUbBq_rangePicker .sXUbBq_secondary{grid-column:1/-1}.sXUbBq_materialHeader span{color:var(--dsw-alias-label-secondary);font-size:12px}.sXUbBq_materialGroup{padding-block:11px}.sXUbBq_materialGroup p{grid-template-columns:76px 1fr;gap:8px;margin:7px 0;font-size:12px;line-height:1.5;display:grid}.sXUbBq_materialGroup time{color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}.sXUbBq_materialGroup p span,.sXUbBq_materialGroup p strong{display:block}.sXUbBq_materialGroup p span{color:var(--dsw-alias-label-secondary)}.sXUbBq_materialGroup p strong{color:var(--dsw-alias-label-primary)}.sXUbBq_sourceCount,.sXUbBq_stale{margin:8px 0}.sXUbBq_stale{color:var(--dsw-alias-state-warn-label);font-size:12px}.sXUbBq_empty{color:var(--dsw-alias-label-secondary);text-align:start;gap:5px;padding-block:28px;display:grid}.sXUbBq_empty span{max-width:65ch;font-size:12px;line-height:1.5}.sXUbBq_loading,.sXUbBq_feedbackError,.sXUbBq_feedbackNotice{box-sizing:border-box;border-block:1px solid var(--dsw-alias-border-l2);max-width:1180px;margin:0 auto 16px;padding:12px 0;font-size:13px}.sXUbBq_loading,.sXUbBq_feedbackNotice{color:var(--dsw-alias-label-secondary)}.sXUbBq_feedbackError{color:var(--dsw-alias-state-error-primary);justify-content:space-between;align-items:center;gap:12px;display:flex}@media (width<=1060px){.sXUbBq_todayOpening{grid-template-columns:minmax(0,1fr) minmax(230px,.32fr);gap:4px}.sXUbBq_echoLedger{padding-inline:18px}}@container sXUbBq_mind-garden-workspace (width<=1060px){.sXUbBq_todayOpening{grid-template-columns:minmax(0,1fr) minmax(230px,.32fr);gap:4px}.sXUbBq_echoLedger{padding-inline:18px}}@media (width<=900px){.sXUbBq_shell{flex-direction:column;height:100%}.sXUbBq_workspace{flex:1;overflow:auto}.sXUbBq_inactive{grid-template-columns:1fr;align-content:start;padding:34px clamp(20px,7vw,58px) 48px}.sXUbBq_inactiveArtwork{grid-row:1;justify-self:center;width:min(100%,720px);max-height:42vh}.sXUbBq_todayOpening,.sXUbBq_columns{grid-template-columns:1fr}.sXUbBq_todayOpening{min-height:0;padding:14px}.sXUbBq_orreryStage{transform:none}.sXUbBq_echoLedger{grid-template-columns:repeat(2,minmax(0,1fr));margin:-8px 4px 4px}.sXUbBq_echoLedger header,.sXUbBq_echoLedger footer{grid-column:1/-1}.sXUbBq_echoLedger article+article{border-inline-start:1px solid color-mix(in srgb, var(--mg-brass-light) 22%, transparent);padding-inline-start:18px}}@container sXUbBq_mind-garden-workspace (width<=760px){.sXUbBq_inactive,.sXUbBq_todayOpening,.sXUbBq_columns{grid-template-columns:1fr}.sXUbBq_todayOpening{min-height:0;padding:72px 14px 14px}.sXUbBq_orreryStage{transform:none}.sXUbBq_echoLedger{grid-template-columns:repeat(2,minmax(0,1fr));margin:-8px 4px 4px}.sXUbBq_echoLedger header,.sXUbBq_echoLedger footer{grid-column:1/-1}.sXUbBq_echoLedger article+article{border-inline-start:1px solid color-mix(in srgb, var(--mg-brass-light) 22%, transparent);padding-inline-start:18px}}@media (width<=620px){.sXUbBq_view{padding:0 14px 40px}.sXUbBq_inactive{gap:20px;padding:22px 14px 34px}.sXUbBq_inactiveArtwork{max-height:34vh}.sXUbBq_todayOpening{box-shadow:0 18px 42px color-mix(in srgb, var(--dsw-alias-label-primary) 18%, transparent);border-radius:0;margin:8px 0 28px;padding:8px}.sXUbBq_todayOpening:after{inset:4px}.sXUbBq_observatoryMaterial{object-position:41% 50%;opacity:.64}.sXUbBq_orreryHero h1{font-size:clamp(21px,7.4vw,29px);line-height:1.16}.sXUbBq_orreryHero p{max-width:20ch;margin-block-start:9px;font-size:10px;line-height:1.55}.sXUbBq_heroActions{gap:7px;margin-block-start:13px}.sXUbBq_heroPrimary,.sXUbBq_heroSecondary{min-height:36px;padding:7px 11px;font-size:11px}.sXUbBq_instrumentStatus{gap:4px 8px;margin-block-start:10px}.sXUbBq_posture,.sXUbBq_orreryHero .sXUbBq_privacy{font-size:8px}.sXUbBq_echoLedger{grid-template-columns:1fr;margin:-12px 4px 4px;padding:24px 18px 18px;display:grid}.sXUbBq_echoLedger article+article{border-inline-start:0;padding-inline-start:2px}.sXUbBq_echoLedger header,.sXUbBq_echoLedger footer{grid-column:1}.sXUbBq_hero,.sXUbBq_formFooter,.sXUbBq_feedbackError{flex-direction:column;align-items:stretch}.sXUbBq_hero{padding-block-start:30px}.sXUbBq_hero h1{font-size:clamp(28px,10vw,44px)}.sXUbBq_metrics{display:grid}.sXUbBq_metrics>div,.sXUbBq_metrics>div+div{border-inline-start:0;margin:0;padding:10px 0}.sXUbBq_rangePicker{grid-template-columns:1fr}.sXUbBq_privacy{align-self:flex-start}}@container sXUbBq_mind-garden-workspace (width<=520px){.sXUbBq_view{padding:0 14px 40px}.sXUbBq_todayOpening{box-shadow:0 18px 42px color-mix(in srgb, var(--dsw-alias-label-primary) 18%, transparent);border-radius:8px;margin:8px 0 28px;padding:66px 8px 8px}.sXUbBq_observatoryMasthead{inset:14px 15px auto}.sXUbBq_observatoryIdentity small,.sXUbBq_observatoryMeta>time{display:none}.sXUbBq_observatoryMaterial{object-position:38% 50%;opacity:.74}.sXUbBq_orreryHero h1{font-size:clamp(21px,7.4vw,29px)}.sXUbBq_echoLedger{grid-template-columns:1fr;margin:-12px 4px 4px;padding:24px 18px 18px}.sXUbBq_echoLedger article+article{border-inline-start:0;padding-inline-start:2px}.sXUbBq_echoLedger header,.sXUbBq_echoLedger footer{grid-column:1}.sXUbBq_columns[data-scope=life] .sXUbBq_rangePicker{grid-template-columns:1fr;padding:20px}.sXUbBq_columns[data-scope=life] .sXUbBq_cardList{padding-left:30px}.sXUbBq_columns[data-scope=life] .sXUbBq_cardList:before{left:9px}.sXUbBq_columns[data-scope=life] .sXUbBq_reviewCard:before{left:-27px}}@container sXUbBq_mind-garden-workspace (width>=521px) and (width<=760px){.sXUbBq_hero[data-space=life]{grid-template-columns:1fr;gap:24px;padding-top:30px}.sXUbBq_lifeHorizon{min-height:196px}.sXUbBq_columns[data-scope=life] .sXUbBq_sectionHeader{flex-direction:column;align-items:stretch}.sXUbBq_columns[data-scope=life] .sXUbBq_sectionHeader p{text-align:left}.sXUbBq_columns[data-scope=life] .sXUbBq_rangePicker{grid-template-columns:repeat(2,minmax(0,1fr))}.sXUbBq_columns[data-scope=life] .sXUbBq_rangePicker .sXUbBq_secondary{grid-column:1/-1}}@media (prefers-reduced-motion:reduce){.sXUbBq_view *,.sXUbBq_heroPrimary,.sXUbBq_heroSecondary{scroll-behavior:auto;transition:none}.sXUbBq_lifeRings,.sXUbBq_settingsInstrument i:first-child{animation:none}}.sXUbBq_shell{--mg-paper:#f9efe3;--mg-paper-deep:#eadbc8;--mg-ink:#352e29;--mg-muted:#74685e;--mg-indigo:#445c7c;--mg-plum:#94655d;--mg-brass-ui:#9b7542;--mg-sage:#71806e;--mg-font-ui:Inter, \"PingFang SC\", \"Microsoft YaHei\", system-ui, sans-serif;--mg-font-reflection:\"Mind Garden Display\", \"Noto Serif SC\", \"Songti SC\", serif;--mg-xuan-texture:url(/plugins/@deepseek-ai/dsh-mind-garden/assets/morning-xuan-texture-v2.webp);--mg-limestone-texture:url(/plugins/@deepseek-ai/dsh-mind-garden/assets/warm-limestone-texture-v2.webp);--mg-wood-texture:url(/plugins/@deepseek-ai/dsh-mind-garden/assets/pale-ash-wood-texture-v2.webp);--dsw-alias-bg-base:#fbf7ef;--dsw-alias-bg-layer-1:#f4eadc;--dsw-alias-bg-layer-2:#eadbc8;--dsw-alias-label-primary:#352e29;--dsw-alias-label-secondary:#6e6258;--dsw-alias-label-tertiary:#8b7e72;--dsw-alias-label-primary-inverted:#fffaf1;--dsw-alias-border-l1:#d9c8b3;--dsw-alias-border-l2:#cdbba4;--dsw-alias-interactive-bg-hover:#eee2d2;--dsw-alias-state-business-primary:#445c7c;--dsw-alias-state-business-secondary:#dbe1e8;--dsw-alias-button-primary-fill:#445c7c;--dsw-alias-state-success-primary:#71806e;--dsw-alias-state-success-secondary:#dce1d8;--dsw-alias-state-warn-primary:#a47b46;--dsw-alias-state-warn-secondary:#ead7b9;--dsw-alias-state-error-primary:#94655d;--dsw-alias-state-error-secondary:#ead6d1;color:var(--mg-ink);background:linear-gradient(145deg, #fffefac7, #f9efe3db), var(--mg-xuan-texture);font-family:var(--mg-font-ui);background-size:auto,650px;grid-template-rows:auto minmax(0,1fr);display:grid}.sXUbBq_workspace{background:0 0}.sXUbBq_view{background:radial-gradient(circle at 13% 0%, #fffcf1c7, transparent 31rem), linear-gradient(180deg, #f9efe3b8, #fbf7eff0), var(--mg-xuan-texture);background-size:auto,auto,680px;padding:0 clamp(18px,3.2vw,46px) 70px}.sXUbBq_todayOpening{max-width:1460px;min-height:0;color:var(--mg-ink);background:#f8eee1;border:1px solid #4d3a2a26;border-radius:8px;margin:24px auto 54px;padding:52px 0 0;display:block;overflow:hidden;box-shadow:0 28px 62px #543b2521}.sXUbBq_todayOpening:before{z-index:0;background:linear-gradient(98deg, #fffdf8e0, #efe1cead), var(--mg-xuan-texture);background-size:auto,520px;height:52px}.sXUbBq_todayOpening:after{display:none}.sXUbBq_observatoryMasthead{z-index:7;border-block-end:1px solid #4d3a2a1f;min-height:52px;padding:0 22px;inset:0 0 auto}.sXUbBq_observatoryIdentity{color:var(--mg-indigo)}.sXUbBq_observatoryIdentity strong{color:var(--mg-ink);font-family:var(--mg-font-reflection)}.sXUbBq_observatoryIdentity small,.sXUbBq_observatoryMeta,.sXUbBq_observatoryMeta>span{color:var(--mg-muted)}.sXUbBq_orreryStage{z-index:2;width:100%;display:block}.sXUbBq_orreryHero{color:var(--mg-ink);text-align:start;text-shadow:none;justify-items:start;padding:0}.sXUbBq_orreryHero h1{max-width:9ch;color:var(--mg-ink);font-family:var(--mg-font-reflection);filter:none;font-size:clamp(34px,4.1vw,58px);font-weight:560;line-height:1.15}.sXUbBq_orreryHero p{max-width:27ch;color:var(--mg-muted);margin-block-start:18px;font-size:15px;line-height:1.78}.sXUbBq_heroActions{justify-content:flex-start;margin-block-start:28px}.sXUbBq_heroPrimary,.sXUbBq_heroSecondary{border-radius:6px;min-height:43px;font-size:13px}.sXUbBq_heroPrimary{color:#fffdf8;background:var(--mg-indigo);border-color:#0000;box-shadow:0 9px 20px #445c7c33}.sXUbBq_heroSecondary{color:var(--mg-indigo);backdrop-filter:none;background:#fffdf88f;border-color:#445c7c52}.sXUbBq_heroSecondary:hover{color:#fffdf8;background:var(--mg-indigo)}.sXUbBq_instrumentStatus{justify-content:flex-start;margin-block-start:20px}.sXUbBq_posture{color:var(--mg-plum)}.sXUbBq_orreryHero .sXUbBq_privacy{color:var(--mg-muted)}.sXUbBq_orreryHero .sXUbBq_privacy:before{background:var(--mg-sage);box-shadow:none}.sXUbBq_hero{max-width:1180px;margin-inline:auto;padding-block-start:48px}.sXUbBq_hero h1,.sXUbBq_sectionHeader h2,.sXUbBq_settingsHeading h2{color:var(--mg-ink);font-family:var(--mg-font-reflection)}.sXUbBq_metrics{border-block:1px solid #49392b1c}.sXUbBq_settingsScrim{backdrop-filter:none;background:#352e2947;place-items:stretch end;padding:0}.sXUbBq_settingsSheet{background:linear-gradient(130deg, #fffdf8db, #f4eadceb), var(--mg-xuan-texture);background-color:var(--mg-paper-bright,#fffaf2);background-size:auto,620px;border:0;border-inline-start:1px solid #56412f38;border-radius:0;width:min(760px,94%);height:100%;max-height:none;box-shadow:-24px 0 64px #35281d30}.sXUbBq_settingsHeading{min-height:188px;color:var(--mg-ink);background:linear-gradient(115deg, #fffdf7cc, #e5d6c1c7), var(--mg-limestone-texture);background-color:var(--mg-paper-deep,#ead8c0);background-size:auto,520px;border-block-end:1px solid #4a392b21;grid-template-columns:76px minmax(0,1fr) auto;gap:22px;padding:28px}.sXUbBq_settingsInstrument{width:72px;color:var(--mg-indigo);background:#fffdf87a;border-color:#445c7c5c;border-radius:42% 48% 45% 52%;box-shadow:0 12px 26px #4f3a271f}.sXUbBq_settingsInstrument i{border-color:#445c7c3d}.sXUbBq_settingsInstrument i:nth-child(3){background:var(--mg-indigo);box-shadow:none;transform:translate(30px,-11px)}.sXUbBq_settingsHeadingCopy>span{display:none}.sXUbBq_settingsHeading h2{margin-block-start:0;font-size:clamp(28px,3vw,40px)}.sXUbBq_settingsHeadingCopy>p,.sXUbBq_settingsAssurances span{color:var(--mg-muted)}.sXUbBq_settingsHeading button{color:var(--mg-indigo);background:#fffdf88f;border-color:#445c7c47}.sXUbBq_settingsContent{gap:34px;padding:28px 32px 48px}@media (width<=1120px){.sXUbBq_todayOpening{padding-block-start:52px}}@media (width<=620px){.sXUbBq_view{padding:0 10px 42px}.sXUbBq_todayOpening{border-radius:4px;margin:10px 0 28px;padding:48px 0 0}.sXUbBq_observatoryMasthead{min-height:48px;padding-inline:14px;inset:0 0 auto}.sXUbBq_observatoryIdentity small,.sXUbBq_observatoryMeta>time{display:none}.sXUbBq_orreryHero h1{font-size:clamp(31px,11vw,44px)}.sXUbBq_orreryHero p{max-width:30ch;font-size:13px}.sXUbBq_settingsSheet{width:100%}.sXUbBq_settingsHeading{grid-template-columns:48px minmax(0,1fr) auto;gap:13px;min-height:154px;padding:20px 14px}.sXUbBq_settingsInstrument{width:46px}.sXUbBq_settingsInstrument i:nth-child(3){transform:translate(19px,-7px)}.sXUbBq_settingsContent{padding:20px 14px 38px}}.sXUbBq_section{scroll-margin-top:22px}.sXUbBq_shell{--mg-paper:#f8eee1;--mg-paper-bright:#fffaf2;--mg-paper-deep:#ead8c0;--mg-ink:#342d27;--mg-muted:#76695e;--mg-indigo:#405f87;--mg-indigo-deep:#304c70;--mg-plum:#8d5a5e;--mg-brass:#a77d43;--mg-sage:#71806e;--mg-font-ui:\"Noto Sans SC\", \"Source Han Sans SC\", \"PingFang SC\", \"Microsoft YaHei UI\", system-ui, sans-serif;--mg-font-reflection:\"Mind Garden Display\", \"Noto Serif SC\", \"Source Han Serif SC\", serif;color:var(--mg-ink);background:var(--mg-paper);font-family:var(--mg-font-ui);grid-template-rows:auto minmax(0,1fr)}.sXUbBq_shell ::selection{color:var(--mg-ink);background:#a47c4347}.sXUbBq_shell input,.sXUbBq_shell textarea{caret-color:var(--mg-indigo)}.sXUbBq_workspace{background:linear-gradient(145deg, #fffdf7c2, #f8eee1e0), var(--mg-xuan-texture);scrollbar-color:#78604661 transparent;scrollbar-width:thin;background-size:auto,720px;overflow:auto}.sXUbBq_view{background:0 0;width:100%;min-height:100%;padding:0 0 76px}.sXUbBq_todayOpening{background:var(--mg-paper);border:0;border-radius:0;width:100%;max-width:none;min-height:0;margin:0 0 46px;padding:0;overflow:hidden;box-shadow:0 28px 76px #44301f29}.sXUbBq_todayOpening:before,.sXUbBq_todayOpening:after{display:none}.sXUbBq_orreryStage{width:100%;display:block}.sXUbBq_orreryHero{color:var(--mg-ink);text-align:start;text-shadow:none;justify-items:start;display:grid}.sXUbBq_orreryHero h1{max-width:10ch;color:var(--mg-ink);font-family:var(--mg-font-reflection);letter-spacing:-.035em;text-wrap:balance;filter:none;margin:0;font-size:clamp(42px,4.3vw,60px);font-weight:560;line-height:1.12}.sXUbBq_orreryHero p{max-width:23ch;color:var(--mg-muted);margin:18px 0 0;font-size:15px;line-height:1.75}.sXUbBq_heroActions{flex-wrap:wrap;justify-content:flex-start;gap:10px;margin-block-start:26px;display:flex}.sXUbBq_heroPrimary,.sXUbBq_heroSecondary{border:1px solid #405f8757;border-radius:9px;justify-content:center;align-items:center;min-height:44px;padding:0 18px;font-size:14px;font-weight:650;text-decoration:none;transition:transform .18s cubic-bezier(.16,1,.3,1),box-shadow .18s ease-out,background .16s ease-out;display:inline-flex}.sXUbBq_heroPrimary{color:#fffaf2;border-color:var(--mg-indigo);background:var(--mg-indigo);box-shadow:6px 12px 24px #304c7033}.sXUbBq_heroSecondary{color:var(--mg-indigo);background:#fffcf59e}.sXUbBq_heroPrimary:hover,.sXUbBq_heroSecondary:hover{transform:translateY(-2px)}.sXUbBq_heroPrimary:hover{background:var(--mg-indigo-deep);box-shadow:8px 16px 28px #304c703d}.sXUbBq_heroSecondary:hover{background:#fffaf2}.sXUbBq_heroPrimary:focus-visible,.sXUbBq_heroSecondary:focus-visible{outline:3px solid var(--mg-indigo);outline-offset:3px}.sXUbBq_instrumentStatus{color:var(--mg-muted);flex-wrap:wrap;justify-content:flex-start;gap:8px 14px;margin-block-start:16px;font-size:11px;display:flex}.sXUbBq_posture{color:var(--mg-plum);font-weight:650}.sXUbBq_privacy{color:var(--mg-muted);align-items:center;gap:5px;display:inline-flex}.sXUbBq_privacy:before{display:none}.sXUbBq_lifeOpening{min-height:clamp(500px,55vw,660px);color:var(--mg-ink);background:var(--mg-life-scene) center / cover no-repeat;isolation:isolate;grid-template-columns:minmax(310px,.68fr) minmax(420px,1.32fr);align-items:end;padding:clamp(36px,5vw,76px);display:grid;position:relative;overflow:hidden;box-shadow:0 28px 72px #47332126}.sXUbBq_lifeOpening:before{z-index:-1;content:\"\";background:linear-gradient(90deg,#fffbf3f7 0 28%,#fffbf3b8 43%,#0000 68%);position:absolute;inset:0}.sXUbBq_lifeCopy{z-index:1;align-self:center;justify-items:start;max-width:440px;display:grid;position:relative}.sXUbBq_lifeCopy>svg{color:var(--mg-plum);margin-block-end:24px}.sXUbBq_lifeCopy h1{max-width:11ch;font-family:var(--mg-font-reflection);letter-spacing:-.035em;margin:0;font-size:clamp(40px,4vw,54px);font-weight:560;line-height:1.08}.sXUbBq_lifeCopy p{max-width:34ch;color:var(--mg-muted);margin:20px 0;font-size:14px;line-height:1.85}.sXUbBq_lifeMetrics{z-index:1;background:#fffbf4d1;place-self:end;gap:1px;display:flex;position:relative;box-shadow:7px 14px 32px #45301e24}.sXUbBq_lifeMetrics span{min-width:128px;color:var(--mg-muted);border-inline-start:1px solid #56423021;gap:3px;padding:15px 18px;font-size:10px;display:grid}.sXUbBq_lifeMetrics span:first-child{border-inline-start:0}.sXUbBq_lifeMetrics strong{color:var(--mg-ink);font-family:var(--mg-font-reflection);font-size:23px;font-weight:560}.sXUbBq_columns{gap:0;width:min(1280px,100% - 56px);margin:0 auto;display:grid}.sXUbBq_columns[data-scope=today]{background:#fffaf2;border-radius:16px;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);overflow:hidden;box-shadow:0 24px 60px #44301f1a}.sXUbBq_columns[data-scope=life]{width:min(1120px,100% - 56px);margin-block-start:70px}.sXUbBq_columns[data-scope=memory]{background:linear-gradient(#faf4e9c2,#faf4e91f);border-block-start:1px solid #533e2d24;width:min(1180px,100% - 56px);margin-block-start:0;padding:22px 32px 36px}.sXUbBq_columns[data-scope=memory] .sXUbBq_section{background:0 0;padding:0}.sXUbBq_columns[data-scope=memory] .sXUbBq_sectionHeader{margin-block-end:18px}.sXUbBq_columns[data-scope=memory] .sXUbBq_composer{grid-template-columns:minmax(0,1fr) auto;align-items:end}.sXUbBq_columns[data-scope=memory] .sXUbBq_composer>label,.sXUbBq_columns[data-scope=memory] .sXUbBq_composer>textarea{grid-column:1/-1}.sXUbBq_columns[data-scope=memory] .sXUbBq_cardList{grid-template-columns:repeat(2,minmax(0,1fr))}.sXUbBq_section{min-width:0;box-shadow:none;background:#fffbf485;border:0;border-radius:0;padding:38px clamp(24px,4vw,52px) 46px;scroll-margin-top:22px}.sXUbBq_columns[data-scope=today] .sXUbBq_section+.sXUbBq_section{background:#ebdbc570;border-inline-start:0}.sXUbBq_columns[data-scope=life] .sXUbBq_section{background:0 0;padding:0}.sXUbBq_sectionHeader{justify-content:space-between;align-items:flex-start;gap:20px;margin-block-end:24px;display:flex}.sXUbBq_sectionHeader>div{align-items:center;gap:10px;display:flex}.sXUbBq_sectionMark{aspect-ratio:1;width:34px;color:var(--mg-indigo);border:1px solid #405f873d;border-radius:50%;place-items:center;display:inline-grid}.sXUbBq_sectionHeader h2{font-family:var(--mg-font-ui);letter-spacing:-.02em;margin:0;font-size:19px;font-weight:700}.sXUbBq_sectionHeader p{max-width:32ch;color:var(--mg-muted);text-align:end;margin:0;font-size:12px;line-height:1.65}.sXUbBq_composer,.sXUbBq_rangePicker,.sXUbBq_material{box-shadow:none;background:0 0;border:0;border-radius:0}.sXUbBq_composer{gap:10px;margin:0 0 28px;padding:0;display:grid}.sXUbBq_composer>label,.sXUbBq_rangePicker label,.sXUbBq_material>label{color:var(--mg-muted);font-size:11px;font-weight:620}.sXUbBq_composer textarea,.sXUbBq_material textarea,.sXUbBq_rangePicker input,.sXUbBq_rangePicker select,.sXUbBq_formFooter input{width:100%;color:var(--mg-ink);font:inherit;background:#fffcf6c7;border:1px solid #56423033;border-radius:10px}.sXUbBq_composer textarea,.sXUbBq_material textarea{resize:vertical;min-height:104px;padding:13px 14px;line-height:1.7}.sXUbBq_rangePicker input,.sXUbBq_rangePicker select,.sXUbBq_formFooter input{min-height:40px;padding:8px 10px}.sXUbBq_composer textarea:focus,.sXUbBq_material textarea:focus,.sXUbBq_rangePicker input:focus,.sXUbBq_rangePicker select:focus,.sXUbBq_formFooter input:focus{border-color:var(--mg-indigo);outline-offset:1px;outline:2px solid #405f8726}.sXUbBq_formFooter{justify-content:space-between;align-items:end;gap:14px;display:flex}.sXUbBq_formFooter label{color:var(--mg-muted);gap:5px;font-size:10px;display:grid}.sXUbBq_primary,.sXUbBq_secondary{border:1px solid var(--mg-indigo);color:#fffaf2;background:var(--mg-indigo);min-height:40px;font:inherit;cursor:pointer;border-radius:9px;padding:0 16px;font-size:12px;font-weight:650}.sXUbBq_secondary{color:var(--mg-indigo);background:0 0}.sXUbBq_primary:disabled,.sXUbBq_secondary:disabled{cursor:not-allowed;opacity:.48}.sXUbBq_primary:focus-visible,.sXUbBq_secondary:focus-visible{outline:3px solid var(--mg-indigo);outline-offset:2px}.sXUbBq_rangePicker{border-block-end:1px solid #533e2d24;grid-template-columns:.8fr 1fr 1fr auto;gap:10px;margin-block-end:28px;padding-block-end:28px;display:grid}.sXUbBq_rangePicker label{gap:6px;display:grid}.sXUbBq_rangePicker .sXUbBq_secondary{align-self:end}.sXUbBq_cardList{gap:0;display:grid}.sXUbBq_questionCard,.sXUbBq_reviewCard{box-shadow:none;background:0 0;border:0;border-block-start:1px solid #533e2d21;border-radius:0;padding:20px 0;position:relative}.sXUbBq_cardList>:first-child{border-block-start:0}.sXUbBq_questionCard[data-status=open]:before,.sXUbBq_reviewCard:before{background:var(--mg-plum);content:\"\";border-radius:50%;width:5px;height:5px;position:absolute;inset:25px auto auto -12px}.sXUbBq_reviewCard:before{background:var(--mg-brass)}.sXUbBq_cardMeta{color:var(--mg-muted);justify-content:space-between;align-items:center;gap:14px;font-size:10px;display:flex}.sXUbBq_status{color:var(--mg-plum);font-weight:700}.sXUbBq_questionText,.sXUbBq_reviewText{color:var(--mg-ink);font-family:var(--mg-font-reflection);margin:13px 0;font-size:17px;line-height:1.75}.sXUbBq_cardActions{flex-wrap:wrap;gap:8px;display:flex}.sXUbBq_cardActions button{min-height:32px;color:var(--mg-indigo);font:inherit;cursor:pointer;background:#405f8714;border:0;border-radius:7px;padding:4px 9px;font-size:11px}.sXUbBq_cardActions button:focus-visible{outline:2px solid var(--mg-indigo);outline-offset:2px}.sXUbBq_material{background:#fffcf69e;margin-block-end:28px;padding:22px;box-shadow:6px 12px 28px #4a342214}.sXUbBq_materialHeader{justify-content:space-between;gap:14px;margin-block-end:16px;display:flex}.sXUbBq_materialGroup{border-block-start:1px solid #533e2d1f;gap:8px;padding-block:13px;display:grid}.sXUbBq_materialGroup h3{color:var(--mg-plum);margin:0;font-size:11px}.sXUbBq_materialGroup p{color:var(--mg-muted);grid-template-columns:92px minmax(0,1fr);gap:12px;margin:0;font-size:11px;display:grid}.sXUbBq_materialGroup p span{display:grid}.sXUbBq_sourceCount,.sXUbBq_stale{color:var(--mg-muted);font-size:10px}.sXUbBq_empty{color:var(--mg-muted);gap:4px;padding:24px 0;font-size:12px;display:grid}.sXUbBq_empty strong{color:var(--mg-ink);font-size:14px}.sXUbBq_loading,.sXUbBq_feedbackError,.sXUbBq_feedbackNotice{width:min(1120px,100% - 56px);color:var(--mg-muted);background:#fffbf4b8;margin:18px auto;padding:12px 14px}.sXUbBq_feedbackError{color:var(--mg-plum)}.sXUbBq_settingsScrim{backdrop-filter:none;background:#342c2559}.sXUbBq_settingsSheet{font-family:var(--mg-font-ui)}.sXUbBq_settingsHeading h2{font-family:var(--mg-font-reflection)}@media (width<=920px){.sXUbBq_columns[data-scope=today]{grid-template-columns:1fr}.sXUbBq_columns[data-scope=today] .sXUbBq_section+.sXUbBq_section{border-block-start:0;border-inline-start:0}.sXUbBq_lifeOpening{background-position:58%;grid-template-columns:1fr;align-items:start;min-height:720px}.sXUbBq_lifeOpening:before{background:linear-gradient(#fffbf3f5 0 36%,#fffbf394 57%,#0000 76%)}.sXUbBq_lifeMetrics{place-self:end start}}@media (width<=620px){.sXUbBq_view{padding-block-end:44px}.sXUbBq_todayOpening{margin-block-end:40px}.sXUbBq_orreryHero h1{font-size:clamp(38px,13vw,52px)}.sXUbBq_orreryHero p{font-size:14px}.sXUbBq_heroActions{grid-template-columns:1fr 1fr;width:100%;display:grid}.sXUbBq_heroPrimary,.sXUbBq_heroSecondary{width:100%}.sXUbBq_lifeOpening{background-position:62%;min-height:790px;padding:34px 20px 26px}.sXUbBq_lifeCopy h1{font-size:45px}.sXUbBq_lifeMetrics{width:100%;overflow-x:auto}.sXUbBq_lifeMetrics span{min-width:104px;padding:12px}.sXUbBq_columns,.sXUbBq_columns[data-scope=life]{width:calc(100% - 24px)}.sXUbBq_columns[data-scope=memory]{width:calc(100% - 24px);padding-inline:0}.sXUbBq_columns[data-scope=memory] .sXUbBq_cardList{grid-template-columns:1fr}.sXUbBq_columns[data-scope=life]{margin-block-start:40px}.sXUbBq_section{padding:28px 14px 34px}.sXUbBq_sectionHeader{flex-direction:column;align-items:flex-start}.sXUbBq_sectionHeader p{text-align:start}.sXUbBq_rangePicker{grid-template-columns:1fr 1fr}.sXUbBq_rangePicker label:first-child,.sXUbBq_rangePicker .sXUbBq_secondary{grid-column:1/-1}.sXUbBq_formFooter{flex-direction:column;align-items:stretch}.sXUbBq_primary,.sXUbBq_secondary{width:100%}.sXUbBq_material{padding:16px}.sXUbBq_materialGroup p{grid-template-columns:1fr}}@media (prefers-reduced-motion:reduce){.sXUbBq_heroPrimary,.sXUbBq_heroSecondary{transition:none}}.sXUbBq_orreryHero h1{letter-spacing:-.03em;font-size:clamp(42px,4.3vw,60px)}.sXUbBq_orreryHero p{margin-block-start:17px;font-size:14px;line-height:1.75}.sXUbBq_heroActions{margin-block-start:25px}.sXUbBq_heroPrimary,.sXUbBq_heroSecondary{gap:7px;min-height:44px;line-height:1.25}.sXUbBq_instrumentStatus{align-items:center;margin-block-start:17px}.sXUbBq_instrumentStatus svg,.sXUbBq_privacy>svg{flex:0 0 14px;width:14px;height:14px;display:block}.sXUbBq_lifeOpening{background-position:56%;border-radius:18px;grid-template-columns:minmax(300px,.7fr) minmax(520px,1.3fr);align-items:center;min-height:clamp(350px,34vw,410px);padding:clamp(38px,4.8vw,62px);box-shadow:0 26px 68px #44301f21}.sXUbBq_lifeOpening:before{background:linear-gradient(90deg,#fffbf3fa 0 30%,#fffbf3b3 44%,#0000 65%)}.sXUbBq_lifeCopy{max-width:390px}.sXUbBq_lifeCopy>svg{display:none}.sXUbBq_lifeCopy h1{letter-spacing:-.03em;max-width:10ch;font-size:clamp(34px,3.2vw,43px);line-height:1.11}.sXUbBq_lifeCopy p{-webkit-line-clamp:3;-webkit-box-orient:vertical;max-width:32ch;margin:14px 0;font-size:12px;line-height:1.7;display:-webkit-box;overflow:hidden}.sXUbBq_lifeMetrics{background:#fffbf4bd;border:0;border-radius:12px;align-self:end;overflow:hidden;box-shadow:0 12px 32px #44301f14}.sXUbBq_lifeMetrics span{min-width:108px;padding:10px 13px}.sXUbBq_lifeMetrics strong{font-size:19px}.sXUbBq_columns[data-scope=life]{margin-block-start:48px}.sXUbBq_sectionHeader{align-items:center;margin-block-end:20px}.sXUbBq_sectionHeader>div{min-width:0}.sXUbBq_sectionMark{flex:0 0 32px;width:32px}.sXUbBq_sectionMark>svg{width:16px;height:16px;display:block}.sXUbBq_sectionHeader h2{font-size:18px;line-height:1.3}.sXUbBq_sectionHeader p{-webkit-line-clamp:2;-webkit-box-orient:vertical;display:-webkit-box;overflow:hidden}.sXUbBq_primary,.sXUbBq_secondary,.sXUbBq_cardActions button{justify-content:center;align-items:center;gap:7px;line-height:1.25;display:inline-flex}.sXUbBq_primary,.sXUbBq_secondary{min-height:42px}.sXUbBq_primary>svg,.sXUbBq_secondary>svg,.sXUbBq_cardActions button>svg{flex:0 0 15px;width:15px;height:15px;display:block}.sXUbBq_cardActions button{min-height:38px}@container sXUbBq_mind-garden-workspace (width<=860px){.sXUbBq_lifeOpening{background-position:61%;grid-template-columns:1fr;align-items:start;min-height:450px;padding:32px 28px}.sXUbBq_lifeOpening:before{background:linear-gradient(#fffbf3f7 0 36%,#fffbf352 61%,#0000 78%)}.sXUbBq_lifeMetrics{place-self:end start}}@container sXUbBq_mind-garden-workspace (width<=620px){.sXUbBq_todayOpening{margin-block-end:30px}.sXUbBq_orreryHero h1{max-width:10ch;font-size:clamp(34px,10.8vw,42px)}.sXUbBq_orreryHero p{max-width:24ch;margin-block-start:13px;font-size:13px}.sXUbBq_heroActions{gap:8px;margin-block-start:18px}.sXUbBq_heroPrimary,.sXUbBq_heroSecondary{min-height:44px}.sXUbBq_instrumentStatus{margin-block-start:14px}.sXUbBq_lifeOpening{background-position:67% 58%;border-radius:0 0 18px 18px;min-height:390px;padding:26px 18px 16px}.sXUbBq_lifeOpening:before{background:linear-gradient(#fffbf3fa 0 42%,#fffbf338 67%,#fffbf3a3 100%)}.sXUbBq_lifeCopy h1{max-width:12ch;font-size:clamp(31px,10vw,37px)}.sXUbBq_lifeCopy p{-webkit-line-clamp:2;margin-block:10px}.sXUbBq_lifeMetrics{justify-self:center;width:calc(100% - 24px);overflow:visible}.sXUbBq_lifeMetrics span{flex:1;min-width:0;padding:9px 8px}.sXUbBq_lifeMetrics strong{font-size:17px}.sXUbBq_columns[data-scope=life]{margin-block-start:34px}.sXUbBq_section{padding:24px 12px 30px}.sXUbBq_sectionHeader{align-items:flex-start;gap:11px}.sXUbBq_sectionHeader p{text-align:start;font-size:11px}.sXUbBq_primary,.sXUbBq_secondary{min-height:44px}.sXUbBq_cardActions button{min-height:42px}}@media (width<=620px){.sXUbBq_todayOpening{margin-block-end:30px}.sXUbBq_orreryHero h1{max-width:10ch;font-size:clamp(32px,9.6vw,38px);line-height:1.08}.sXUbBq_orreryHero p{-webkit-line-clamp:2;-webkit-box-orient:vertical;max-width:25ch;margin-block-start:10px;font-size:12px;line-height:1.65;display:-webkit-box;overflow:hidden}.sXUbBq_heroActions{gap:8px;margin-block-start:14px}.sXUbBq_heroPrimary,.sXUbBq_heroSecondary{min-height:42px}.sXUbBq_instrumentStatus{margin-block-start:11px}}@media (width<=900px){.sXUbBq_workspace{box-sizing:border-box;padding-block-end:calc(var(--dsh-composer-height,152px) + env(safe-area-inset-bottom,0px) + 12px);scroll-padding-block-end:calc(var(--dsh-composer-height,152px) + env(safe-area-inset-bottom,0px) + 24px)}}@media (width<=620px){.sXUbBq_workspace input:not([type=checkbox]):not([type=radio]):not([type=range]),.sXUbBq_workspace textarea,.sXUbBq_workspace select{font-size:16px}.sXUbBq_settingsScrim{align-items:end;padding:12px 0 0;inset:0}.sXUbBq_settingsSheet{width:100%;max-height:calc(100% - 12px);border-radius:11px 11px 0 0;padding-block-end:env(safe-area-inset-bottom,0px)}.sXUbBq_settingsHeading{padding-inline:18px}}";
		const tagId = "@deepseek-ai/dsh-mind-garden/MindGardenView.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-mind-garden";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var MindGardenView_module_css_default = {
			"ambientDust": "sXUbBq_ambientDust",
			"cardActions": "sXUbBq_cardActions",
			"cardList": "sXUbBq_cardList",
			"cardMeta": "sXUbBq_cardMeta",
			"columns": "sXUbBq_columns",
			"composer": "sXUbBq_composer",
			"echoLedger": "sXUbBq_echoLedger",
			"empty": "sXUbBq_empty",
			"eyebrow": "sXUbBq_eyebrow",
			"feedbackError": "sXUbBq_feedbackError",
			"feedbackNotice": "sXUbBq_feedbackNotice",
			"formFooter": "sXUbBq_formFooter",
			"gardenDustRise": "sXUbBq_gardenDustRise",
			"hero": "sXUbBq_hero",
			"heroActions": "sXUbBq_heroActions",
			"heroPrimary": "sXUbBq_heroPrimary",
			"heroSecondary": "sXUbBq_heroSecondary",
			"inactive": "sXUbBq_inactive",
			"inactiveArtwork": "sXUbBq_inactiveArtwork",
			"inactiveContent": "sXUbBq_inactiveContent",
			"inactiveCopy": "sXUbBq_inactiveCopy",
			"instrumentStatus": "sXUbBq_instrumentStatus",
			"ledgerMark": "sXUbBq_ledgerMark",
			"ledgerScrew": "sXUbBq_ledgerScrew",
			"life-horizon": "sXUbBq_life-horizon",
			"lifeCopy": "sXUbBq_lifeCopy",
			"lifeHorizon": "sXUbBq_lifeHorizon",
			"lifeMetrics": "sXUbBq_lifeMetrics",
			"lifeOpening": "sXUbBq_lifeOpening",
			"lifeRings": "sXUbBq_lifeRings",
			"loading": "sXUbBq_loading",
			"material": "sXUbBq_material",
			"materialGroup": "sXUbBq_materialGroup",
			"materialHeader": "sXUbBq_materialHeader",
			"metrics": "sXUbBq_metrics",
			"mind-garden-workspace": "sXUbBq_mind-garden-workspace",
			"observatoryIdentity": "sXUbBq_observatoryIdentity",
			"observatoryMasthead": "sXUbBq_observatoryMasthead",
			"observatoryMaterial": "sXUbBq_observatoryMaterial",
			"observatoryMeta": "sXUbBq_observatoryMeta",
			"orreryHero": "sXUbBq_orreryHero",
			"orreryStage": "sXUbBq_orreryStage",
			"posture": "sXUbBq_posture",
			"primary": "sXUbBq_primary",
			"privacy": "sXUbBq_privacy",
			"questionCard": "sXUbBq_questionCard",
			"questionText": "sXUbBq_questionText",
			"rangePicker": "sXUbBq_rangePicker",
			"reviewCard": "sXUbBq_reviewCard",
			"reviewText": "sXUbBq_reviewText",
			"secondary": "sXUbBq_secondary",
			"section": "sXUbBq_section",
			"sectionHeader": "sXUbBq_sectionHeader",
			"sectionMark": "sXUbBq_sectionMark",
			"settings-orbit": "sXUbBq_settings-orbit",
			"settingsAssurances": "sXUbBq_settingsAssurances",
			"settingsContent": "sXUbBq_settingsContent",
			"settingsDialogue": "sXUbBq_settingsDialogue",
			"settingsHeading": "sXUbBq_settingsHeading",
			"settingsHeadingCopy": "sXUbBq_settingsHeadingCopy",
			"settingsIndex": "sXUbBq_settingsIndex",
			"settingsInstrument": "sXUbBq_settingsInstrument",
			"settingsPortability": "sXUbBq_settingsPortability",
			"settingsScrim": "sXUbBq_settingsScrim",
			"settingsSheet": "sXUbBq_settingsSheet",
			"shell": "sXUbBq_shell",
			"sourceCount": "sXUbBq_sourceCount",
			"spaceMount": "sXUbBq_spaceMount",
			"stale": "sXUbBq_stale",
			"status": "sXUbBq_status",
			"todayOpening": "sXUbBq_todayOpening",
			"view": "sXUbBq_view",
			"workspace": "sXUbBq_workspace"
		};
		//#endregion
		//#region lib/types/client/MindGardenView.js
		/** Full-session Mind Garden review center. */
		const CATEGORIES = [
			"events",
			"ongoing",
			"changes",
			"experiments",
			"focus"
		];
		const PERIOD_TYPES = [
			"week",
			"month",
			"year"
		];
		const ignoreSpaceSelection = (_space) => void 0;
		const ignoreSidebarToggle = () => void 0;
		const ignoreConversationDraft = (_draft) => void 0;
		function mergeConversationDraft(current, addition) {
			if (current.trim() === "") return addition;
			if (addition.trim() === "" || current.endsWith(addition)) return current;
			return `${current}${current.endsWith("\n\n") ? "" : current.endsWith("\n") ? "\n" : "\n\n"}${addition}`;
		}
		function errorKey(code) {
			if (code === "open-question-version-conflict" || code === "period-review-version-conflict") return "review.error.conflict";
			if (code === "period-review-material-conflict") return "review.error.materialChanged";
			if (code === "period-review-source-required") return "review.error.noMaterial";
			return "review.error.generic";
		}
		function statusKey(status) {
			return `question.status.${status}`;
		}
		function reviewStatusKey(status) {
			return `review.status.${status}`;
		}
		/** Render the inactive gateway or the active review center. */
		function MindGardenReviewCenter({ projection, imageLimits, onExportBackup, onInspectBackup, onRestoreBackup, onRotateVaultKey, onStarMapOverview, onSaveStarRitual, onCompleteStarRitual, onUpdateStarProfile, onUpdateStarTrait, onDrawStarCard, onCalibrateStarCard, onFinalizeStarCard, onContinueStarCard, onApplyStarCardRevision, onListMemories, onProposeMemory, onConfirmMemory, onUpdateMemory, onRejectMemory, onResolveMemoryRelationship, onListMemoryRevisions, onExtractMemories, onLatestMemoryExtraction, onMemoryAutomationPolicy, onSetMemoryAutomationPolicy, onDeleteMemory, onLatestMemoryAudit, onListOpenQuestions, onCreateOpenQuestion, onUpdateOpenQuestion, onPeriodReviewMaterial, onCreatePeriodReview, onListPeriodReviews, onUpdatePeriodReview, onListConcerns, onCreateConcern, onUpdateConcern, onCompleteConcern, onConvertConcern, onCalendarMonth, onCalendarDay, onCreateCheckin, onCreateJournal, onUpdateJournal, onDeleteJournal, onReflectionTrend, onListExperiments, onCreateExperiment, onStartExperiment, onObserveExperiment, onStopExperiment, onListContemplations, onCreateContemplation, onUpdateContemplation, onConfirmContemplation, onDeleteContemplation, onProposePrinciple, onListPrincipleProposals, onListPrinciples, onAcceptPrincipleProposal, onRejectPrincipleProposal, onRevisePrincipleStatus, onListPhotoStories, onCreatePhotoStory, onReadPhotoStory, onObservePhotoStory, onContinuePhotoStory, onUpdatePhotoStory, onDeletePhotoStory, activeSpace = "today", sidebarCollapsed = false, onSelectSpace = ignoreSpaceSelection, onToggleSidebar = ignoreSidebarToggle, onDraftConversation = ignoreConversationDraft, running = false, t, ...dockActions }) {
			const today = localDate(/* @__PURE__ */ new Date());
			const initialPeriod = (0, react.useMemo)(() => currentPeriod("week"), []);
			const [questions, setQuestions] = (0, react.useState)([]);
			const [reviews, setReviews] = (0, react.useState)([]);
			const [loading, setLoading] = (0, react.useState)(false);
			const [pending, setPending] = (0, react.useState)(false);
			const [error, setError] = (0, react.useState)(null);
			const [notice, setNotice] = (0, react.useState)(null);
			const [question, setQuestion] = (0, react.useState)("");
			const [questionDate, setQuestionDate] = (0, react.useState)(today);
			const [periodType, setPeriodType] = (0, react.useState)("week");
			const [startDate, setStartDate] = (0, react.useState)(initialPeriod.start);
			const [endDate, setEndDate] = (0, react.useState)(initialPeriod.end);
			const [material, setMaterial] = (0, react.useState)(null);
			const [reviewContent, setReviewContent] = (0, react.useState)("");
			const [starSidebar, setStarSidebar] = (0, react.useState)(null);
			const [settingsOpen, setSettingsOpen] = (0, react.useState)(false);
			const [profileRevision, setProfileRevision] = (0, react.useState)(0);
			const [visitedSpaces, setVisitedSpaces] = (0, react.useState)([activeSpace]);
			const requestRef = (0, react.useRef)(0);
			const pendingRef = (0, react.useRef)(false);
			const starSidebarLoadedRef = (0, react.useRef)(false);
			const settingsSheetRef = (0, react.useRef)(null);
			const settingsScrimRef = (0, react.useRef)(null);
			const settingsTriggerRef = (0, react.useRef)(null);
			const closeSettings = (0, react.useCallback)(() => {
				setSettingsOpen(false);
				requestAnimationFrame(() => {
					settingsTriggerRef.current?.focus({ preventScroll: true });
				});
			}, []);
			(0, react.useEffect)(() => {
				if (!settingsOpen) return;
				const scrim = settingsScrimRef.current;
				const backgroundState = [...document.body.children].filter((element) => element !== scrim).map((element) => ({
					element,
					inert: element.inert,
					ariaHidden: element.getAttribute("aria-hidden")
				}));
				for (const item of backgroundState) {
					item.element.inert = true;
					item.element.setAttribute("aria-hidden", "true");
				}
				const previousOverflow = document.documentElement.style.overflow;
				document.documentElement.style.overflow = "hidden";
				const containFocus = (event) => {
					if (event.key === "Escape") {
						event.preventDefault();
						closeSettings();
						return;
					}
					if (event.key !== "Tab") return;
					const focusable = [...settingsSheetRef.current?.querySelectorAll("button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex=\"-1\"])") ?? []];
					const first = focusable[0];
					const last = focusable.at(-1);
					if (first === void 0 || last === void 0) return;
					if (event.shiftKey && document.activeElement === first) {
						event.preventDefault();
						last.focus();
					} else if (!event.shiftKey && document.activeElement === last) {
						event.preventDefault();
						first.focus();
					}
				};
				window.addEventListener("keydown", containFocus);
				return () => {
					window.removeEventListener("keydown", containFocus);
					document.documentElement.style.overflow = previousOverflow;
					for (const item of backgroundState) {
						item.element.inert = item.inert;
						if (item.ariaHidden === null) item.element.removeAttribute("aria-hidden");
						else item.element.setAttribute("aria-hidden", item.ariaHidden);
					}
				};
			}, [closeSettings, settingsOpen]);
			(0, react.useEffect)(() => {
				setVisitedSpaces((current) => current.includes(activeSpace) ? current : [...current, activeSpace]);
			}, [activeSpace]);
			(0, react.useEffect)(() => {
				if (activeSpace !== "star-map" && starSidebarLoadedRef.current) return;
				let disposed = false;
				settleMindGardenAction(onStarMapOverview).then((result) => {
					if (!disposed && result.ok) {
						starSidebarLoadedRef.current = true;
						setStarSidebar(result.value);
					}
				});
				return () => {
					disposed = true;
				};
			}, [
				activeSpace,
				onStarMapOverview,
				profileRevision
			]);
			const refresh = (0, react.useCallback)(async (showLoading = false) => {
				const request = ++requestRef.current;
				if (showLoading) setLoading(true);
				const [questionResult, reviewResult] = await Promise.all([settleMindGardenAction(onListOpenQuestions), settleMindGardenAction(onListPeriodReviews)]);
				if (request !== requestRef.current) return false;
				if (!questionResult.ok) {
					setError(errorKey(questionResult.code));
					setLoading(false);
					return false;
				}
				if (!reviewResult.ok) {
					setError(errorKey(reviewResult.code));
					setLoading(false);
					return false;
				}
				setQuestions(questionResult.value);
				setReviews(reviewResult.value);
				setError(null);
				setLoading(false);
				return true;
			}, [onListOpenQuestions, onListPeriodReviews]);
			(0, react.useEffect)(() => {
				if (projection === null || projection === void 0) return;
				refresh(true);
				return () => {
					requestRef.current++;
				};
			}, [projection, refresh]);
			const handleRestoreSuccess = (0, react.useCallback)(() => {
				starSidebarLoadedRef.current = false;
				setProfileRevision((value) => value + 1);
				refresh(true);
			}, [refresh]);
			const mutate = (0, react.useCallback)(async (action, success) => {
				/* v8 ignore next -- disabled controls close the ordinary render window; the ref closes same-tick activation. */
				if (pendingRef.current) return null;
				pendingRef.current = true;
				setPending(true);
				setError(null);
				setNotice(null);
				try {
					const result = await action();
					if (!result.ok) {
						if (result.code.includes("conflict")) {
							if (await refresh()) setError(errorKey(result.code));
						} else setError(errorKey(result.code));
						return null;
					}
					await refresh();
					setNotice(success);
					return result.value;
				} catch {
					setError("review.error.generic");
					return null;
				} finally {
					pendingRef.current = false;
					setPending(false);
				}
			}, [refresh]);
			if (projection === void 0) return (0, react_jsx_runtime.jsx)("div", {
				className: MindGardenView_module_css_default.loading,
				role: "status",
				children: t("review.loading")
			});
			if (projection === null) return (0, react_jsx_runtime.jsxs)("main", {
				className: MindGardenView_module_css_default.inactive,
				children: [(0, react_jsx_runtime.jsxs)("div", {
					className: MindGardenView_module_css_default.inactiveContent,
					children: [(0, react_jsx_runtime.jsxs)("div", {
						className: MindGardenView_module_css_default.inactiveCopy,
						children: [
							(0, react_jsx_runtime.jsx)("span", {
								className: MindGardenView_module_css_default.eyebrow,
								children: t("view.garden")
							}),
							(0, react_jsx_runtime.jsx)("h1", { children: t("review.inactive.title") }),
							(0, react_jsx_runtime.jsx)("p", { children: t("review.inactive.body") })
						]
					}), (0, react_jsx_runtime.jsx)(MindGardenPanel, {
						projection: null,
						...dockActions,
						t
					})]
				}), (0, react_jsx_runtime.jsx)("img", {
					className: MindGardenView_module_css_default.inactiveArtwork,
					src: GARDEN_THRESHOLD_WARM,
					alt: ""
				})]
			});
			const savedCount = reviews.filter((item) => item.status === "saved").length;
			const showQuestions = activeSpace === "today" || activeSpace === "memory";
			const showReviews = activeSpace === "today" || activeSpace === "life";
			const materialGroups = CATEGORIES.map((category) => ({
				category,
				items: material?.items.filter((item) => item.category === category) ?? []
			})).filter((group) => group.items.length > 0);
			const shouldMount = (space) => space === activeSpace || visitedSpaces.includes(space);
			const reviewSpaceActive = activeSpace === "today" || activeSpace === "memory" || activeSpace === "life";
			async function submitQuestion(event) {
				event.preventDefault();
				const value = question.trim();
				if (value === "") return;
				if (await mutate(() => onCreateOpenQuestion(value, calendarStamp(questionDate)), "question.notice.created") !== null) setQuestion("");
			}
			async function transitionQuestion(item, status) {
				await mutate(() => onUpdateOpenQuestion(item, item.question, status, calendarStamp(today)), status === "open" ? "question.notice.reopened" : "question.notice.closed");
			}
			async function loadMaterial() {
				/* v8 ignore next -- the invoking button is disabled for every invalid or pending state. */
				if (startDate === "" || endDate === "" || startDate > endDate || pendingRef.current) return;
				pendingRef.current = true;
				setPending(true);
				setError(null);
				setNotice(null);
				try {
					const result = await onPeriodReviewMaterial({
						periodType,
						startStamp: calendarStamp(startDate),
						endStamp: calendarStamp(endDate)
					});
					if (!result.ok) {
						setError(errorKey(result.code));
						return;
					}
					setMaterial(result.value);
					setNotice("review.notice.materialReady");
				} catch {
					setError("review.error.generic");
				} finally {
					pendingRef.current = false;
					setPending(false);
				}
			}
			async function submitReview(event) {
				event.preventDefault();
				const content = reviewContent.trim();
				if (material === null || material.sources.length === 0 || content === "") return;
				if (await mutate(() => onCreatePeriodReview(material, content), "review.notice.created") !== null) {
					setMaterial(null);
					setReviewContent("");
				}
			}
			async function transitionReview(item, status) {
				await mutate(() => onUpdatePeriodReview(item, item.content, status), status === "saved" ? "review.notice.saved" : "review.notice.archived");
			}
			function selectPeriod(value) {
				const range = currentPeriod(value);
				setPeriodType(value);
				setStartDate(range.start);
				setEndDate(range.end);
				setMaterial(null);
			}
			return (0, react_jsx_runtime.jsxs)("div", {
				className: MindGardenView_module_css_default.shell,
				"data-mind-garden-view": "active",
				"data-active-space": activeSpace,
				children: [
					(0, react_jsx_runtime.jsx)(GardenSidebar, {
						activeSpace,
						collapsed: sidebarCollapsed,
						starState: starSidebar === null || !starSidebar.profile.onboardingCompleted ? "ritual" : starSidebar.traits.some((trait) => trait.status === "pending") ? "new-dust" : starSidebar.activeCard !== null ? "continue" : "draw",
						starCount: starSidebar?.traits.filter((trait) => trait.status === "pending").length || starSidebar?.cards.filter((card) => card.status === "saved").length || 0,
						onSelect: onSelectSpace,
						onSettings: (trigger) => {
							settingsTriggerRef.current = trigger;
							setSettingsOpen(true);
						},
						onToggle: onToggleSidebar,
						t
					}),
					(0, react_jsx_runtime.jsxs)("section", {
						className: MindGardenView_module_css_default.workspace,
						children: [
							shouldMount("photo-story") && (0, react_jsx_runtime.jsx)("div", {
								className: MindGardenView_module_css_default.spaceMount,
								hidden: activeSpace !== "photo-story",
								children: (0, react_jsx_runtime.jsx)(PhotoStorySpace, {
									today,
									...imageLimits === void 0 ? {} : { imageLimits },
									onListPhotoStories,
									onCreatePhotoStory,
									onReadPhotoStory,
									onObservePhotoStory,
									onContinuePhotoStory,
									onUpdatePhotoStory,
									onDeletePhotoStory,
									t
								})
							}),
							shouldMount("star-map") && (0, react_jsx_runtime.jsx)("div", {
								className: MindGardenView_module_css_default.spaceMount,
								hidden: activeSpace !== "star-map",
								children: (0, react_jsx_runtime.jsx)(StarMapSpace, {
									questions,
									reviews,
									mode: projection.state.mode,
									onOverview: onStarMapOverview,
									onSaveRitual: onSaveStarRitual,
									onCompleteRitual: onCompleteStarRitual,
									onUpdateProfile: onUpdateStarProfile,
									onUpdateTrait: onUpdateStarTrait,
									onDrawCard: onDrawStarCard,
									onCalibrateCard: onCalibrateStarCard,
									onFinalizeCard: onFinalizeStarCard,
									onContinueCard: onContinueStarCard,
									onApplyCardRevision: onApplyStarCardRevision,
									t,
									onBack: () => {
										onSelectSpace("today");
									}
								})
							}),
							shouldMount("concerns") && (0, react_jsx_runtime.jsx)("div", {
								className: MindGardenView_module_css_default.spaceMount,
								hidden: activeSpace !== "concerns",
								children: (0, react_jsx_runtime.jsx)(ConcernsSpace, {
									today,
									onListConcerns,
									onCreateConcern,
									onUpdateConcern,
									onCompleteConcern,
									onConvertConcern,
									onDraftConversation,
									t
								})
							}),
							shouldMount("calendar") && (0, react_jsx_runtime.jsx)("div", {
								className: MindGardenView_module_css_default.spaceMount,
								hidden: activeSpace !== "calendar",
								children: (0, react_jsx_runtime.jsx)(CalendarSpace, {
									today,
									onCalendarMonth,
									onCalendarDay,
									onReflectionTrend,
									onDraftConversation,
									t
								})
							}),
							shouldMount("growth") && (0, react_jsx_runtime.jsx)("div", {
								className: MindGardenView_module_css_default.spaceMount,
								hidden: activeSpace !== "growth",
								children: (0, react_jsx_runtime.jsx)(GrowthSpace, {
									today,
									onListExperiments,
									onCreateExperiment,
									onStartExperiment,
									onObserveExperiment,
									onStopExperiment,
									onDraftConversation,
									t
								})
							}),
							shouldMount("philosophy") && (0, react_jsx_runtime.jsx)("div", {
								className: MindGardenView_module_css_default.spaceMount,
								hidden: activeSpace !== "philosophy",
								children: (0, react_jsx_runtime.jsx)(PhilosophySpace, {
									today,
									onListContemplations,
									onCreateContemplation,
									onUpdateContemplation,
									onConfirmContemplation,
									onDeleteContemplation,
									onProposePrinciple,
									onListPrincipleProposals,
									onListPrinciples,
									onAcceptPrincipleProposal,
									onRejectPrincipleProposal,
									onRevisePrincipleStatus,
									onDraftConversation,
									t
								})
							}),
							(0, react_jsx_runtime.jsx)("div", {
								className: MindGardenView_module_css_default.spaceMount,
								hidden: !reviewSpaceActive,
								children: (0, react_jsx_runtime.jsxs)("main", {
									className: MindGardenView_module_css_default.view,
									children: [
										activeSpace === "today" ? (0, react_jsx_runtime.jsx)("section", {
											className: MindGardenView_module_css_default.todayOpening,
											"data-mind-garden-space": "today",
											children: (0, react_jsx_runtime.jsx)("div", {
												className: MindGardenView_module_css_default.orreryStage,
												children: (0, react_jsx_runtime.jsx)(EditorialOrbit, {
													questions,
													reviews,
													mode: projection.state.mode,
													t,
													children: (0, react_jsx_runtime.jsxs)("header", {
														className: MindGardenView_module_css_default.orreryHero,
														children: [
															(0, react_jsx_runtime.jsx)("h1", { children: t("today.observatory.title") }),
															(0, react_jsx_runtime.jsx)("p", { children: t("today.observatory.prompt") }),
															(0, react_jsx_runtime.jsxs)("div", {
																className: MindGardenView_module_css_default.heroActions,
																children: [(0, react_jsx_runtime.jsx)("a", {
																	className: MindGardenView_module_css_default.heroPrimary,
																	href: "#mind-garden-today-title",
																	children: t("today.observatory.checkin")
																}), (0, react_jsx_runtime.jsx)("a", {
																	className: MindGardenView_module_css_default.heroSecondary,
																	href: "#mind-garden-questions-title",
																	children: t("today.observatory.question")
																})]
															}),
															(0, react_jsx_runtime.jsxs)("div", {
																className: MindGardenView_module_css_default.instrumentStatus,
																children: [(0, react_jsx_runtime.jsx)("span", {
																	className: MindGardenView_module_css_default.posture,
																	children: t(`mode.${projection.state.mode}`)
																}), (0, react_jsx_runtime.jsxs)("span", {
																	className: MindGardenView_module_css_default.privacy,
																	children: [(0, react_jsx_runtime.jsx)(PrivateIcon, { size: 13 }), t("review.private")]
																})]
															})
														]
													})
												})
											})
										}) : activeSpace === "life" ? (0, react_jsx_runtime.jsxs)("section", {
											className: MindGardenView_module_css_default.lifeOpening,
											style: { "--mg-life-scene": `url("${LIFE_TIME_CORRIDOR_V3}")` },
											"data-mind-garden-space": "life",
											children: [(0, react_jsx_runtime.jsxs)("div", {
												className: MindGardenView_module_css_default.lifeCopy,
												children: [
													(0, react_jsx_runtime.jsx)(LifeReviewIcon, { size: 24 }),
													(0, react_jsx_runtime.jsx)("h1", { children: t("life.title") }),
													(0, react_jsx_runtime.jsx)("p", { children: t("life.subtitle") }),
													(0, react_jsx_runtime.jsxs)("span", {
														className: MindGardenView_module_css_default.privacy,
														children: [(0, react_jsx_runtime.jsx)(PrivateIcon, { size: 13 }), t("review.private")]
													})
												]
											}), (0, react_jsx_runtime.jsxs)("div", {
												className: MindGardenView_module_css_default.lifeMetrics,
												"aria-label": t("review.overview"),
												children: [
													(0, react_jsx_runtime.jsxs)("span", { children: [(0, react_jsx_runtime.jsx)("strong", { children: reviews.length }), t("life.metric.reviews")] }),
													(0, react_jsx_runtime.jsxs)("span", { children: [(0, react_jsx_runtime.jsx)("strong", { children: savedCount }), t("life.metric.saved")] }),
													(0, react_jsx_runtime.jsxs)("span", { children: [(0, react_jsx_runtime.jsx)("strong", { children: t(`review.period.${periodType}`) }), t("life.metric.range")] })
												]
											})]
										}) : null,
										shouldMount("today") && (0, react_jsx_runtime.jsx)("div", {
											hidden: activeSpace !== "today",
											children: (0, react_jsx_runtime.jsx)(TodayPractice, {
												today,
												onCalendarDay,
												onCreateCheckin,
												onCreateJournal,
												onUpdateJournal,
												onDeleteJournal,
												t
											})
										}),
										shouldMount("memory") && (0, react_jsx_runtime.jsx)("div", {
											hidden: activeSpace !== "memory",
											children: (0, react_jsx_runtime.jsx)(MemoryGovernance, {
												onListMemories,
												onProposeMemory,
												onConfirmMemory,
												onUpdateMemory,
												onRejectMemory,
												onResolveMemoryRelationship,
												onListMemoryRevisions,
												onExtractMemories,
												onLatestMemoryExtraction,
												onMemoryAutomationPolicy,
												onSetMemoryAutomationPolicy,
												onDeleteMemory,
												onLatestMemoryAudit,
												onDraftConversation,
												t
											})
										}),
										loading && (0, react_jsx_runtime.jsx)("div", {
											className: MindGardenView_module_css_default.loading,
											role: "status",
											children: t("review.loading")
										}),
										error !== null && (0, react_jsx_runtime.jsxs)("div", {
											className: MindGardenView_module_css_default.feedbackError,
											role: "alert",
											children: [(0, react_jsx_runtime.jsx)("span", { children: t(error) }), (0, react_jsx_runtime.jsx)("button", {
												type: "button",
												onClick: () => {
													refresh(true);
												},
												children: t("review.retry")
											})]
										}),
										notice !== null && (0, react_jsx_runtime.jsx)("p", {
											className: MindGardenView_module_css_default.feedbackNotice,
											role: "status",
											children: t(notice)
										}),
										!loading && (showQuestions || showReviews) && (0, react_jsx_runtime.jsxs)("div", {
											className: MindGardenView_module_css_default.columns,
											"data-scope": activeSpace,
											children: [showQuestions && (0, react_jsx_runtime.jsxs)("section", {
												className: MindGardenView_module_css_default.section,
												"aria-labelledby": "mind-garden-questions-title",
												children: [
													(0, react_jsx_runtime.jsxs)("div", {
														className: MindGardenView_module_css_default.sectionHeader,
														children: [(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("span", {
															className: MindGardenView_module_css_default.sectionMark,
															"aria-hidden": "true",
															children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconQuestionOutline14, {})
														}), (0, react_jsx_runtime.jsx)("h2", {
															id: "mind-garden-questions-title",
															children: t("question.title")
														})] }), (0, react_jsx_runtime.jsx)("p", { children: t("question.subtitle") })]
													}),
													(0, react_jsx_runtime.jsxs)("form", {
														className: MindGardenView_module_css_default.composer,
														onSubmit: (event) => {
															submitQuestion(event);
														},
														children: [
															(0, react_jsx_runtime.jsx)("label", {
																htmlFor: "mind-garden-question",
																children: t("question.input.label")
															}),
															(0, react_jsx_runtime.jsx)("textarea", {
																id: "mind-garden-question",
																value: question,
																onChange: (event) => {
																	setQuestion(event.target.value);
																},
																placeholder: t("question.input.placeholder"),
																rows: 3,
																disabled: pending
															}),
															(0, react_jsx_runtime.jsxs)("div", {
																className: MindGardenView_module_css_default.formFooter,
																children: [(0, react_jsx_runtime.jsxs)("label", { children: [t("question.date"), (0, react_jsx_runtime.jsx)("input", {
																	type: "date",
																	value: questionDate,
																	onChange: (event) => {
																		setQuestionDate(event.target.value);
																	},
																	disabled: pending
																})] }), (0, react_jsx_runtime.jsx)("button", {
																	type: "submit",
																	className: MindGardenView_module_css_default.primary,
																	disabled: pending || question.trim() === "" || questionDate === "",
																	children: t("question.add")
																})]
															})
														]
													}),
													(0, react_jsx_runtime.jsxs)("div", {
														className: MindGardenView_module_css_default.cardList,
														children: [questions.length === 0 && (0, react_jsx_runtime.jsx)(EmptyState, {
															title: t("question.empty.title"),
															body: t("question.empty.body")
														}), questions.map((item) => (0, react_jsx_runtime.jsxs)("article", {
															className: MindGardenView_module_css_default.questionCard,
															"data-status": item.status,
															children: [
																(0, react_jsx_runtime.jsxs)("div", {
																	className: MindGardenView_module_css_default.cardMeta,
																	children: [(0, react_jsx_runtime.jsx)("span", {
																		className: MindGardenView_module_css_default.status,
																		children: t(statusKey(item.status))
																	}), (0, react_jsx_runtime.jsx)("time", {
																		dateTime: item.createdStamp.localDate,
																		children: item.createdStamp.localDate
																	})]
																}),
																(0, react_jsx_runtime.jsx)("p", {
																	className: MindGardenView_module_css_default.questionText,
																	children: item.question
																}),
																item.source !== null && (0, react_jsx_runtime.jsx)("blockquote", { children: item.source.evidenceQuote }),
																(0, react_jsx_runtime.jsx)("div", {
																	className: MindGardenView_module_css_default.cardActions,
																	children: item.status === "open" ? (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("button", {
																		type: "button",
																		disabled: pending,
																		onClick: () => {
																			transitionQuestion(item, "resolved");
																		},
																		children: t("question.resolve")
																	}), (0, react_jsx_runtime.jsx)("button", {
																		type: "button",
																		disabled: pending,
																		onClick: () => {
																			transitionQuestion(item, "dismissed");
																		},
																		children: t("question.dismiss")
																	})] }) : (0, react_jsx_runtime.jsx)("button", {
																		type: "button",
																		disabled: pending,
																		onClick: () => {
																			transitionQuestion(item, "open");
																		},
																		children: t("question.reopen")
																	})
																})
															]
														}, String(item.id)))]
													})
												]
											}), showReviews && (0, react_jsx_runtime.jsxs)("section", {
												className: MindGardenView_module_css_default.section,
												"aria-labelledby": "mind-garden-reviews-title",
												children: [
													(0, react_jsx_runtime.jsxs)("div", {
														className: MindGardenView_module_css_default.sectionHeader,
														children: [(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("span", {
															className: MindGardenView_module_css_default.sectionMark,
															"aria-hidden": "true",
															children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconRefreshOutline14, {})
														}), (0, react_jsx_runtime.jsx)("h2", {
															id: "mind-garden-reviews-title",
															children: t("review.period.title")
														})] }), (0, react_jsx_runtime.jsx)("p", { children: t("review.period.subtitle") })]
													}),
													(0, react_jsx_runtime.jsxs)("div", {
														className: MindGardenView_module_css_default.rangePicker,
														children: [
															(0, react_jsx_runtime.jsxs)("label", { children: [t("review.period.type"), (0, react_jsx_runtime.jsx)("select", {
																value: periodType,
																onChange: (event) => {
																	selectPeriod(event.target.value);
																},
																disabled: pending,
																children: PERIOD_TYPES.map((type) => (0, react_jsx_runtime.jsx)("option", {
																	value: type,
																	children: t(`review.period.${type}`)
																}, type))
															})] }),
															(0, react_jsx_runtime.jsxs)("label", { children: [t("review.period.start"), (0, react_jsx_runtime.jsx)("input", {
																type: "date",
																value: startDate,
																onChange: (event) => {
																	setStartDate(event.target.value);
																	setMaterial(null);
																},
																disabled: pending
															})] }),
															(0, react_jsx_runtime.jsxs)("label", { children: [t("review.period.end"), (0, react_jsx_runtime.jsx)("input", {
																type: "date",
																value: endDate,
																onChange: (event) => {
																	setEndDate(event.target.value);
																	setMaterial(null);
																},
																disabled: pending
															})] }),
															(0, react_jsx_runtime.jsx)("button", {
																type: "button",
																className: MindGardenView_module_css_default.secondary,
																onClick: () => {
																	loadMaterial();
																},
																disabled: pending || startDate === "" || endDate === "" || startDate > endDate,
																children: t("review.period.load")
															})
														]
													}),
													material !== null && (0, react_jsx_runtime.jsxs)("form", {
														className: MindGardenView_module_css_default.material,
														onSubmit: (event) => {
															submitReview(event);
														},
														children: [
															(0, react_jsx_runtime.jsxs)("div", {
																className: MindGardenView_module_css_default.materialHeader,
																children: [(0, react_jsx_runtime.jsx)("strong", { children: t("review.material.title") }), (0, react_jsx_runtime.jsx)("span", { children: t("review.material.count").replace("{count}", String(material.sources.length)) })]
															}),
															material.items.length === 0 ? (0, react_jsx_runtime.jsx)(EmptyState, {
																title: t("review.material.empty.title"),
																body: t("review.material.empty.body")
															}) : materialGroups.map((group) => (0, react_jsx_runtime.jsxs)("div", {
																className: MindGardenView_module_css_default.materialGroup,
																children: [(0, react_jsx_runtime.jsx)("h3", { children: t(`review.category.${group.category}`) }), group.items.map((item) => (0, react_jsx_runtime.jsxs)("p", { children: [(0, react_jsx_runtime.jsx)("time", {
																	dateTime: item.localDate,
																	children: item.localDate
																}), (0, react_jsx_runtime.jsxs)("span", { children: [(0, react_jsx_runtime.jsx)("strong", { children: item.title }), item.text] })] }, `${String(item.sourceId)}:${item.category}:${item.localDate}`))]
															}, group.category)),
															(0, react_jsx_runtime.jsx)("label", {
																htmlFor: "mind-garden-review",
																children: t("review.editor.label")
															}),
															(0, react_jsx_runtime.jsx)("textarea", {
																id: "mind-garden-review",
																value: reviewContent,
																onChange: (event) => {
																	setReviewContent(event.target.value);
																},
																placeholder: t("review.editor.placeholder"),
																rows: 6,
																disabled: pending || material.sources.length === 0
															}),
															(0, react_jsx_runtime.jsxs)("div", {
																className: MindGardenView_module_css_default.formFooter,
																children: [(0, react_jsx_runtime.jsx)("span", { children: t("review.editor.hint") }), (0, react_jsx_runtime.jsx)("button", {
																	type: "submit",
																	className: MindGardenView_module_css_default.primary,
																	disabled: pending || material.sources.length === 0 || reviewContent.trim() === "",
																	children: t("review.create")
																})]
															})
														]
													}),
													(0, react_jsx_runtime.jsxs)("div", {
														className: MindGardenView_module_css_default.cardList,
														children: [reviews.length === 0 && material === null && (0, react_jsx_runtime.jsx)(EmptyState, {
															title: t("review.empty.title"),
															body: t("review.empty.body")
														}), reviews.map((item) => (0, react_jsx_runtime.jsxs)("article", {
															className: MindGardenView_module_css_default.reviewCard,
															children: [
																(0, react_jsx_runtime.jsxs)("div", {
																	className: MindGardenView_module_css_default.cardMeta,
																	children: [(0, react_jsx_runtime.jsx)("span", {
																		className: MindGardenView_module_css_default.status,
																		children: t(reviewStatusKey(item.status))
																	}), (0, react_jsx_runtime.jsxs)("time", {
																		dateTime: item.startStamp.localDate,
																		children: [
																			item.startStamp.localDate,
																			" — ",
																			item.endStamp.localDate
																		]
																	})]
																}),
																(0, react_jsx_runtime.jsx)("p", {
																	className: MindGardenView_module_css_default.reviewText,
																	children: item.content
																}),
																(0, react_jsx_runtime.jsx)("p", {
																	className: MindGardenView_module_css_default.sourceCount,
																	children: t("review.sources").replace("{count}", String(item.sources.length))
																}),
																item.stale && (0, react_jsx_runtime.jsx)("p", {
																	className: MindGardenView_module_css_default.stale,
																	children: t("review.stale")
																}),
																(0, react_jsx_runtime.jsxs)("div", {
																	className: MindGardenView_module_css_default.cardActions,
																	children: [
																		(0, react_jsx_runtime.jsxs)("button", {
																			type: "button",
																			onClick: () => {
																				onDraftConversation(t("life.draft.template").replace("{start}", item.startStamp.localDate).replace("{end}", item.endStamp.localDate).replace("{content}", item.content));
																				setNotice("life.notice.drafted");
																			},
																			children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSendOutline14, {}), t("life.continue")]
																		}),
																		item.status === "proposed" && (0, react_jsx_runtime.jsx)("button", {
																			type: "button",
																			disabled: pending,
																			onClick: () => {
																				transitionReview(item, "saved");
																			},
																			children: t("review.save")
																		}),
																		item.status === "saved" && (0, react_jsx_runtime.jsx)("button", {
																			type: "button",
																			disabled: pending,
																			onClick: () => {
																				transitionReview(item, "archived");
																			},
																			children: t("review.archive")
																		})
																	]
																})
															]
														}, String(item.id)))]
													})
												]
											})]
										})
									]
								})
							})
						]
					}, profileRevision),
					settingsOpen && (0, react_dom.createPortal)((0, react_jsx_runtime.jsx)("div", {
						ref: settingsScrimRef,
						className: MindGardenView_module_css_default.settingsScrim,
						role: "dialog",
						"aria-modal": "true",
						"aria-label": t("garden.settings"),
						onMouseDown: (event) => {
							if (event.target === event.currentTarget) closeSettings();
						},
						children: (0, react_jsx_runtime.jsxs)("div", {
							ref: settingsSheetRef,
							className: MindGardenView_module_css_default.settingsSheet,
							onMouseDown: (event) => {
								event.stopPropagation();
							},
							children: [(0, react_jsx_runtime.jsxs)("header", {
								className: MindGardenView_module_css_default.settingsHeading,
								children: [
									(0, react_jsx_runtime.jsxs)("span", {
										className: MindGardenView_module_css_default.settingsInstrument,
										"aria-hidden": "true",
										children: [
											(0, react_jsx_runtime.jsx)("i", {}),
											(0, react_jsx_runtime.jsx)("i", {}),
											(0, react_jsx_runtime.jsx)("i", {}),
											(0, react_jsx_runtime.jsx)(GardenMarkIcon, { size: 25 })
										]
									}),
									(0, react_jsx_runtime.jsxs)("div", {
										className: MindGardenView_module_css_default.settingsHeadingCopy,
										children: [
											(0, react_jsx_runtime.jsx)("span", { children: t("garden.settings.kicker") }),
											(0, react_jsx_runtime.jsx)("h2", { children: t("garden.settings") }),
											(0, react_jsx_runtime.jsx)("p", { children: t("garden.settings.body") }),
											(0, react_jsx_runtime.jsxs)("div", {
												className: MindGardenView_module_css_default.settingsAssurances,
												"aria-label": t("garden.settings.assurances"),
												children: [
													(0, react_jsx_runtime.jsxs)("span", { children: [(0, react_jsx_runtime.jsx)(GardenMarkIcon, { size: 14 }), t("garden.settings.session")] }),
													(0, react_jsx_runtime.jsxs)("span", { children: [(0, react_jsx_runtime.jsx)(PrivateIcon, { size: 14 }), t("garden.settings.profile")] }),
													(0, react_jsx_runtime.jsxs)("span", { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSettingsOutline16, { size: 14 }), t("garden.settings.host")] })
												]
											})
										]
									}),
									(0, react_jsx_runtime.jsxs)("button", {
										type: "button",
										autoFocus: true,
										onClick: closeSettings,
										children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseOutline16, { size: 14 }), t("garden.settings.close")]
									})
								]
							}), (0, react_jsx_runtime.jsxs)("div", {
								className: MindGardenView_module_css_default.settingsContent,
								children: [(0, react_jsx_runtime.jsxs)("section", {
									className: MindGardenView_module_css_default.settingsDialogue,
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: MindGardenView_module_css_default.settingsIndex,
										children: "01"
									}), (0, react_jsx_runtime.jsx)(MindGardenPanel, {
										projection,
										defaultOpen: true,
										running,
										...dockActions,
										t
									})]
								}), (0, react_jsx_runtime.jsxs)("section", {
									className: MindGardenView_module_css_default.settingsPortability,
									children: [(0, react_jsx_runtime.jsxs)("span", {
										className: MindGardenView_module_css_default.settingsIndex,
										children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconDataOutline16, { size: 14 }), "02"]
									}), (0, react_jsx_runtime.jsx)(GardenPortabilityPanel, {
										onExportBackup,
										onInspectBackup,
										onRestoreBackup,
										onRotateVaultKey,
										onRestoreSuccess: handleRestoreSuccess,
										t
									})]
								})]
							})]
						})
					}), document.body)
				]
			});
		}
		function EmptyState({ title, body }) {
			return (0, react_jsx_runtime.jsxs)("div", {
				className: MindGardenView_module_css_default.empty,
				children: [(0, react_jsx_runtime.jsx)("strong", { children: title }), (0, react_jsx_runtime.jsx)("span", { children: body })]
			});
		}
		/** Read the typed session projection and adapt it to the review center. */
		function MindGardenView({ useProjection, useSession, useInput, useStore, actions, inputActions, ...props }) {
			const projection = useProjection("mind-garden");
			const imageLimits = useProjection("imageLimits");
			const running = useSession((state) => state.running);
			const inputDraft = useInput((state) => state.draft);
			const view = useStore((state) => state);
			return (0, react_jsx_runtime.jsx)(MindGardenReviewCenter, {
				projection,
				running,
				...imageLimits === void 0 ? {} : { imageLimits },
				activeSpace: view.activeSpace,
				sidebarCollapsed: view.sidebarCollapsed,
				onSelectSpace: (space) => {
					actions.selectSpace(space);
				},
				onToggleSidebar: () => {
					actions.toggleSidebar();
				},
				onDraftConversation: (draft) => {
					inputActions.setDraft(mergeConversationDraft(inputDraft, draft));
				},
				...props
			});
		}
		//#endregion
		//#region lib/types/client/garden-store.js
		/** Session-scoped viewing state for the Mind Garden workspace. */
		/**
		* Create the per-session Mind Garden navigation store.
		* @returns the store handle mounted by the conversation view registration.
		*/
		function createMindGardenViewStore() {
			return (0, _deepseek_ai_dsh_client_runtime_client.defineStore)({
				init: () => ({
					activeSpace: "today",
					sidebarCollapsed: false
				}),
				persist: "dsh.mind-garden.view.v1",
				actions: {
					selectSpace: (draft, space) => {
						draft.activeSpace = space;
					},
					toggleSidebar: (draft) => {
						draft.sidebarCollapsed = !draft.sidebarCollapsed;
					}
				}
			});
		}
		//#endregion
		//#region lib/types/client/locales.js
		/** `mindGarden` namespace dictionaries. */
		/** Simplified Chinese dictionary and key-set source. */
		const zh = {
			"entry.open": "进入心智庭院",
			"entry.hint": "留一处不必逞强的地方",
			"entry.close": "暂不进入",
			"disclosure.title": "先约定我们的边界",
			"disclosure.body": "这里由 AI 模型回应，不是人类、心理治疗或紧急服务。对话会按当前部署的持久化与模型提供方配置处理。若你正处于紧急危险，请优先联系当地紧急服务与可信任的人。",
			"disclosure.accept": "确认边界后即可开始，不需要先选择对话模式",
			"disclosure.consent": "我已阅读并理解上述 AI、数据处理与紧急支持边界",
			"disclosure.consent.hint": "这项确认只用于开启心智庭院，不会自动授权长期记忆或额外的模型整理。",
			"disclosure.contract": "进入心智庭院前的三项边界",
			"disclosure.profile.title": "私人记录属于当前 profile",
			"disclosure.profile.body": "庭院正文进入加密 vault，不写入 workspace 文件。",
			"disclosure.model.title": "沿用当前 Session 的模型配置",
			"disclosure.model.body": "提供方与普通对话一致；额外资料只通过明确授权的边界进入。",
			"disclosure.authority.title": "解释权与确认权始终属于你",
			"disclosure.authority.body": "候选记忆、特质和原则不会因为 AI 提议就自动生效。",
			"disclosure.start": "开始陪伴",
			"disclosure.starting": "正在开启……",
			"disclosure.default": "默认随你当下；想纠偏时，直接说“先听我说”。",
			"mode.serenity": "观心",
			"mode.serenity.desc": "先听见感受，慢一点，不急着解决",
			"mode.clarity": "玄思",
			"mode.clarity.desc": "看清脉络，问一个真正重要的问题",
			"garden.title": "心智庭院",
			"garden.expand": "展开庭院设置",
			"garden.collapse": "收起庭院设置",
			"garden.close": "关闭对话姿态",
			"garden.storage": "本会话使用持久存储",
			"garden.settings": "庭院设置",
			"garden.settings.eyebrow": "对话姿态与支持方式",
			"garden.settings.kicker": "PRIVATE CONTROL ROOM · PROFILE SCOPE",
			"garden.settings.body": "在这里校准当前 Session 的陪伴方式，并管理覆盖当前 Web profile 的加密私人档案。Harness 继续负责模型、Session 与附件基建。",
			"garden.settings.assurances": "庭院设置范围",
			"garden.settings.session": "对话姿态 · 当前 Session",
			"garden.settings.profile": "私人档案 · 当前 profile",
			"garden.settings.host": "模型与附件 · Harness 托管",
			"garden.settings.close": "完成",
			"garden.dialogue.title": "校准此刻的陪伴方式",
			"garden.dialogue.body": "改变只作用于当前心智庭院 Session；不会重写已经保存的记录。",
			"backup.title": "把整座庭院带在身边",
			"backup.body": "生成一份由你设定口令保护的完整私人档案。记忆、反思、星图、照片故事及已验证原图会在离开服务端前合并加密。",
			"backup.assurances": "备份内容与安全说明",
			"backup.assurance.records": "四类私人记录",
			"backup.assurance.photos": "包含已验证原图",
			"backup.assurance.secret": "不包含运行密钥",
			"backup.passphrase": "档案口令",
			"backup.passphrase.placeholder": "至少 12 个字符，建议使用多个词",
			"backup.confirm": "再次输入",
			"backup.confirm.placeholder": "确认只有你知道的口令",
			"backup.hint": "口令不会保存在 DeepSeek Harness 中；遗失后无法打开此档案。",
			"backup.hint.length": "请使用至少 12 个字符的口令。",
			"backup.hint.match": "两次输入尚不一致。",
			"backup.action": "封存并下载",
			"backup.working": "正在封存…",
			"backup.success": "私人档案已交给浏览器",
			"backup.failed": "未能生成档案",
			"backup.error.passphrase": "口令不符合安全长度要求。",
			"backup.error.size": "庭院档案超过当前部署的安全导出上限。",
			"backup.error.attachment": "至少一张照片未能通过完整性读取，未生成不完整档案。",
			"backup.error.vault": "私人存储当前未解锁或未能通过认证。",
			"backup.error.download": "浏览器未能接收下载，请检查下载权限后重试。",
			"backup.error.generic": "档案未生成，现有庭院数据没有改变。",
			"restore.title": "从私人档案恢复",
			"restore.body": "选择新版或原版心智庭院生成的 .mgarden 档案。系统会先完整认证并预览，只补入缺失记录；当前同 ID 记录始终保留。",
			"restore.file": "私人档案文件",
			"restore.file.action": "选择档案",
			"restore.file.empty": "尚未选择 .mgarden 文件",
			"restore.passphrase": "打开档案的口令",
			"restore.passphrase.placeholder": "输入创建档案时使用的口令（原版至少 8 位）",
			"restore.inspect": "检查档案",
			"restore.inspecting": "正在认证…",
			"restore.preview.ready": "档案已通过完整检查",
			"restore.preview.legacy": "原版档案已认证 · 私人资料迁移预览",
			"restore.preview.add": "将补入",
			"restore.preview.keep": "保留当前",
			"restore.preview.photos": "验证原图",
			"restore.preview.size": "档案大小",
			"restore.preview.rule": "恢复不会覆盖当前同 ID 记录；中断后可用同一档案安全重试。",
			"restore.preview.legacy.rule": "可保真的签到、日记、关切、成长实验、哲思、周期回望、开放问题、长期记忆、星图底稿与照片故事会迁入；当前同 ID 记录始终保留。原版会话与缺少证据来源的星卡仍留在原档案中。",
			"restore.action": "合并缺失记录",
			"restore.working": "正在恢复…",
			"restore.cancel": "暂不恢复",
			"restore.success": "私人档案已合入当前庭院",
			"restore.success.body": "当前记录得到保留，缺失内容已完成认证与加密存储。",
			"restore.success.legacy.body": "受支持的原版私人资料已转换为当前加密记录，照片与粒子参数也已进入 Harness 附件体系；原档案本身没有被改写。",
			"restore.error.passphrase": "口令不符合档案的安全长度要求。",
			"restore.error.invalid": "口令不正确、档案已损坏，或其中包含当前版本无法安全识别的记录。",
			"restore.error.size": "这个档案超过当前部署允许检查的安全上限。",
			"restore.error.attachment": "至少一张原图未通过当前附件存储的完整性检查，尚未合入任何私人记录。",
			"restore.error.vault": "当前私人存储未解锁或未能通过认证，请先恢复存储访问。",
			"restore.error.generic": "恢复没有完成。当前同 ID 记录没有被覆盖；请保留档案并重试。",
			"rotation.title": "更新私人存储钥匙",
			"rotation.body": "建议先下载一份最新档案。换钥会为每条私人记录重新加密，照片原图仍由附件存储保护。",
			"rotation.action": "准备换钥",
			"rotation.confirm.body": "这会轮换整个 profile 的数据钥匙。即使中途退出，下一次私人存储操作也会从安全日志继续；现在开始吗？",
			"rotation.confirm.action": "确认并轮换",
			"rotation.cancel": "暂不进行",
			"rotation.working": "正在校准密钥…",
			"rotation.success": "新钥匙已接管全部记录",
			"rotation.records": "条记录",
			"rotation.error.credentials": "主钥匙或临时钥匙位置当前不可写；私人数据没有失去恢复路径。",
			"rotation.error.vault": "私人存储当前未解锁，或上次换钥需要先恢复。",
			"rotation.error.generic": "换钥未完成；安全日志会保留恢复路径，请稍后重试。",
			"section.mode": "整体对话倾向",
			"section.intent": "此刻怎么陪你",
			"intent.auto": "随我当下",
			"intent.listen": "只听我说",
			"intent.settle": "先安顿下来",
			"intent.clarify": "帮我理清",
			"intent.next-step": "走一小步",
			"view.garden": "心智庭院",
			"space.navigation": "心智庭院空间导航",
			"space.title": "心智庭院",
			"space.expand": "退出紧凑导航",
			"space.collapse": "使用紧凑导航",
			"space.regions": "庭院五区",
			"space.private": "本地加密的私人空间",
			"space.region.now": "此刻",
			"space.region.innerLife": "心绪",
			"space.region.time": "时光",
			"space.region.keepsakes": "珍藏",
			"space.region.starGarden": "星庭",
			"space.group.now": "此刻",
			"space.group.clarity": "逐渐看清",
			"space.group.longTerm": "长程沉淀",
			"space.today": "今天",
			"space.concerns": "心事篮",
			"space.calendar": "日历",
			"space.photoStory": "照片故事",
			"space.memory": "我的记忆",
			"space.growth": "生活议题",
			"space.starMap": "我的星图",
			"space.life": "人生回望",
			"space.philosophy": "我的哲学",
			"orbit.label": "今天的反思轨道",
			"orbit.center": "此刻",
			"orbit.question.meta": "仍在延续",
			"orbit.fallback.today": "今天的心绪",
			"orbit.fallback.unnamed": "等待你命名",
			"orbit.fallback.memory": "一段值得回望的时刻",
			"orbit.fallback.unwritten": "尚未写下",
			"orbit.fallback.tomorrow": "明日可以继续",
			"orbit.fallback.choice": "由你决定",
			"orbit.fallback.stillness": "此刻的安静",
			"orbit.fallback.permission": "允许没有答案",
			"orbit.fallback.noticed": "已经被看见",
			"orbit.fallback.stay": "值得留在这里",
			"orbit.fallback.return": "下一次回望",
			"orbit.fallback.waiting": "等你回来",
			"orbit.summary": "{questions} 个开放问题 · {reviews} 段已保存回望",
			"today.eyebrow": "心智庭院 · 每日落点",
			"today.title": "先感受自己，再决定留下什么",
			"today.observatory.title": "今天，先从此刻开始",
			"today.observatory.prompt": "现在最想被好好听见的，是什么？",
			"today.observatory.checkin": "记录此刻",
			"today.observatory.question": "留一个问题",
			"today.echo.title": "今日回声",
			"today.echo.question": "仍在轨道上的问题",
			"today.echo.review": "已经留下的回望",
			"today.echo.tomorrow": "明日的延续",
			"today.echo.ledger": "私人观测 · 加密保存",
			"today.practice.title": "把此刻放在这里",
			"today.subtitle": "签到只记录你此刻选择的感受；日记由你编辑，也只在你明确允许时才能进入授权对话上下文。",
			"today.loading": "正在打开今天的庭院记录……",
			"today.error": "今天的签到与日记暂时无法打开，请稍后再试。",
			"today.checkin.title": "此刻签到",
			"today.checkin.subtitle": "不评分，也不解释，只为当下留一个坐标。",
			"today.checkin.mood": "此刻的心情",
			"today.checkin.energy": "此刻的精力",
			"today.checkin.emotions": "情绪词（可选）",
			"today.checkin.emotions.placeholder": "例如：平静、犹豫、期待",
			"today.checkin.emotions.hint": "用空格或逗号分开，最多保留 3 个不重复的词。",
			"today.checkin.save": "留下此刻",
			"today.checkin.saved": "今天的签到轨迹",
			"today.checkin.notice": "此刻已加密留在庭院里。",
			"today.mood.-2": "沉重",
			"today.mood.-2.glyph": "◔",
			"today.mood.-1": "偏低",
			"today.mood.-1.glyph": "◑",
			"today.mood.0": "平稳",
			"today.mood.0.glyph": "◉",
			"today.mood.1": "轻盈",
			"today.mood.1.glyph": "◐",
			"today.mood.2": "明亮",
			"today.mood.2.glyph": "◕",
			"today.energy.1": "很低",
			"today.energy.2": "偏低",
			"today.energy.3": "平稳",
			"today.energy.4": "充足",
			"today.energy.5": "饱满",
			"today.journal.title": "写一小段",
			"today.journal.editing": "继续修订这篇日记",
			"today.journal.subtitle": "可以只写一句话；日记不需要结论。",
			"today.journal.name": "标题（可选）",
			"today.journal.name.placeholder": "给今天这一页一个名字",
			"today.journal.body": "我想留下",
			"today.journal.body.placeholder": "什么正在发生？哪个瞬间值得被看见？",
			"today.journal.retrieval": "允许在我授权的对话中引用",
			"today.journal.retrieval.hint": "默认关闭。随时可修改，不会自动进入模型上下文。",
			"today.journal.create": "收进今天",
			"today.journal.update": "保存修订",
			"today.journal.cancel": "取消编辑",
			"today.journal.shelf": "今天的日记",
			"today.journal.count": "{count} 篇",
			"today.journal.empty": "这一页还是空白。不需要为了填满它而写什么。",
			"today.journal.retrievable": "可授权引用",
			"today.journal.private": "仅留在庭院",
			"today.journal.untitled": "未命名的一页",
			"today.journal.edit": "继续书写",
			"today.journal.delete": "移除这一页",
			"today.journal.delete.confirm": "再点一次确认移除",
			"today.journal.notice.created": "这一页已加密收进今天。",
			"today.journal.notice.updated": "日记与引用权限已保存。",
			"today.journal.notice.deleted": "这一页已从庭院中移除。",
			"memory.eyebrow": "心智庭院 · 记忆与开放问题",
			"memory.title": "让重要的问题留得住，也由你决定何时放下",
			"memory.subtitle": "这里保留你亲自写下或从对话证据形成的开放问题；状态变化可追溯，不会被模型悄悄改写。",
			"governance.eyebrow": "心智庭院 · 记忆治理",
			"governance.title": "让“懂你”保持准确，也始终能被你纠正",
			"governance.subtitle": "候选记忆不会自动进入模型上下文；冲突、检索权限、来源与修订都在你确认后才生效。",
			"governance.summary": "长期记忆治理概览",
			"governance.active": "条生效",
			"governance.candidates": "条待决定",
			"governance.relationships": "处关系",
			"governance.loading": "正在认证并整理你的加密记忆……",
			"governance.error.load": "加密记忆暂时无法读取，请稍后再试。",
			"governance.error.stale": "这条记忆已在别处变化，当前列表已重新载入，请核对后再决定。",
			"governance.error.sensitive": "高敏感记忆只能留在本地，不能设为可召回。",
			"governance.error.extraction": "本轮对话暂时无法整理为候选记忆；现有记忆没有变化。",
			"governance.error.generic": "这次记忆操作没有完成，请稍后再试。",
			"governance.notice.proposed": "候选记忆已加密保存，仍不会被召回。",
			"governance.notice.confirmed": "记忆与召回边界已按你的决定保存。",
			"governance.notice.resolved": "这组记忆关系已按你的决定处理。",
			"governance.notice.updated": "记忆内容、边界与召回权限已保存。",
			"governance.notice.rejected": "这条候选已被拒绝，不会进入模型上下文。",
			"governance.notice.deleted": "这条记忆已从加密记忆库移除；既有 Session 或模型请求中的副本不会被追溯抹除。",
			"governance.notice.drafted": "这条记忆已放入 Harness 对话输入框，尚未发送。",
			"governance.notice.extracted": "本轮整理完成；所有新内容仍只在候选队列中。",
			"governance.notice.automationEnabled": "已授权本会话在空闲时自动整理新对话。",
			"governance.notice.automationDisabled": "自动整理已关闭；正在进行的请求可能仍会完成。",
			"governance.audit.title": "本轮召回",
			"governance.audit.empty": "还没有发生记忆召回。",
			"governance.audit.sent": "有 {count} 条已确认记忆进入本轮模型上下文。",
			"governance.audit.local": "本地匹配了 {count} 条记忆，但没有发送给模型。",
			"governance.extraction.title": "对话整理",
			"governance.extraction.empty": "尚未请求模型辅助整理。",
			"governance.extraction.running": "正在读取本次符合条件的完整消息。",
			"governance.extraction.committing": "正在加密保存候选，已有 {count} 条。",
			"governance.extraction.completed": "上次整理产生 {count} 条候选。",
			"governance.extraction.failed": "上次整理未完成，现有记忆未改变。",
			"governance.extraction.run": "整理本轮对话",
			"governance.extraction.trigger.manual": "手动发起",
			"governance.extraction.trigger.automatic": "自动发起",
			"governance.automation.title": "空闲时自动整理新记忆",
			"governance.automation.subtitle": "这是本会话的单独授权。只处理开启之后正常完成的新轮次，并在 Agent 真正空闲时运行。",
			"governance.automation.enabled": "已开启",
			"governance.automation.disabled": "保持关闭",
			"governance.automation.interval": "每积累多少个符合条件的新轮次",
			"governance.automation.interval.1": "每 1 轮整理一次",
			"governance.automation.interval.3": "每 3 轮整理一次",
			"governance.automation.interval.5": "每 5 轮整理一次",
			"governance.automation.status": "最近状态",
			"governance.automation.unavailable": "授权状态暂时无法读取",
			"governance.automation.outcome.never": "尚未自动整理",
			"governance.automation.outcome.running": "正在整理",
			"governance.automation.outcome.completed": "最近一次已完成",
			"governance.automation.outcome.failed": "最近一次未完成，将等待新的轮次",
			"governance.automation.disclosure.model": "每次整理都会额外调用一次当前配置的模型；对话部分只发送本次新增且符合条件的用户消息，并可能附带普通敏感度的已确认记忆用于关系比对。",
			"governance.automation.disclosure.candidates": "模型产出的内容仍是不可召回的候选；只有你确认后才可能成为长期记忆。",
			"governance.automation.disclosure.safety": "由安全能力在本地响应的高风险轮次不会进入自动整理。",
			"governance.propose.title": "亲自留下一条候选",
			"governance.propose.subtitle": "先写成候选，再单独决定它是否值得长期保留。",
			"governance.propose.hint": "保存后默认不可召回；下一步仍需要你的确认。",
			"governance.propose.save": "放入待决定",
			"governance.kind": "记忆类型",
			"governance.kind.fact": "事实",
			"governance.kind.preference": "偏好",
			"governance.kind.value": "价值取向",
			"governance.kind.support-preference": "陪伴偏好",
			"governance.kind.decision": "决定",
			"governance.kind.emotion": "情绪经验",
			"governance.kind.episode": "生活片段",
			"governance.sensitivity": "敏感级别",
			"governance.sensitivity.normal": "普通",
			"governance.sensitivity.high": "高敏感 · 仅本地",
			"governance.content": "要保留的原话",
			"governance.content.placeholder": "例如：我更喜欢先被听见，再一起想办法。",
			"governance.reason": "未来可能有什么帮助",
			"governance.reason.placeholder": "说明保留它的具体用途",
			"governance.scope": "成立的情境（可选）",
			"governance.scope.placeholder": "例如：工作压力较大时",
			"governance.scope.label": "适用情境：",
			"governance.queue.title": "需要你决定",
			"governance.queue.subtitle": "模型只能提出候选与关系，不能替你确认哪一条代表你。",
			"governance.queue.empty": "目前没有待确认记忆。出现新候选时，它会先停在这里。",
			"governance.relationship.duplicate": "可能重复",
			"governance.relationship.contradiction": "表达发生冲突",
			"governance.relationship.refinement": "可能是更准确的补充",
			"governance.relationship.existing": "已经生效的记忆",
			"governance.relationship.incoming": "新出现的候选",
			"governance.relationship.missing": "被比较的原记忆已经不存在。",
			"governance.relationship.keepExisting": "保留原记忆",
			"governance.relationship.keepBoth": "按情境并存",
			"governance.relationship.replace": "用新表达更新",
			"governance.review.open": "审阅这条候选",
			"governance.review.close": "收起审阅",
			"governance.recall": "以后怎样召回",
			"governance.recall.never": "永不自动召回",
			"governance.recall.relevant": "相关时召回",
			"governance.recall.always": "每次都带上",
			"governance.temporary": "临时保留天数（可选）",
			"governance.temporary.placeholder": "留空为长期",
			"governance.reject": "不保留",
			"governance.confirm": "确认并保存边界",
			"governance.library.title": "由你确认的长期记忆",
			"governance.library.subtitle": "每条都可修订、查看历史或从加密记忆库删除；已进入既有 Session 或模型请求的副本仍依部署保留策略处理。",
			"governance.library.empty": "还没有已确认记忆。候选只有经过你决定后才会来到这里。",
			"governance.continue": "放到对话输入框",
			"governance.draft.template": "我想核对并继续谈谈这条由我确认的记忆：\n\n> {content}\n\n请先把它当作可以被我修正的背景，不要把它当成永久不变的定义。",
			"governance.history.open": "查看修订历史",
			"governance.history.close": "收起修订历史",
			"governance.history.empty": "这条记忆还没有更早的版本。",
			"governance.edit.open": "修订内容与边界",
			"governance.edit.close": "取消修订",
			"governance.edit.save": "保存新版本",
			"governance.delete": "删除记忆",
			"governance.delete.confirm": "再点一次：从记忆库删除",
			"governance.archive.title": "已拒绝、被替代或过期的记录 · {count} 条",
			"governance.status.candidate": "待确认",
			"governance.status.confirmed": "已确认",
			"governance.status.temporary": "临时记忆",
			"governance.status.rejected": "已拒绝",
			"governance.status.superseded": "已被替代",
			"governance.status.expired": "已过期",
			"governance.expires": "到 {date}",
			"governance.sources": "来源证据 · {count} 处",
			"governance.revision.confirmed": "确认前版本",
			"governance.revision.updated": "修订前版本",
			"governance.revision.rejected": "拒绝前版本",
			"governance.revision.superseded": "被替代前版本",
			"governance.revision.replaced": "接收新表达前版本",
			"life.eyebrow": "心智庭院 · 人生回望",
			"life.title": "把已经发生的事，连成一条可以回看的路",
			"life.subtitle": "周期回望只引用已验证的庭院记录。先核对材料，再由你写下、保存或归档属于自己的版本。",
			"life.instrument.label": "时间长廊：显示真实周期回望数量",
			"life.instrument.reviews": "段真实回望",
			"life.metric.reviews": "已经形成的版本",
			"life.metric.saved": "由你保存的版本",
			"life.metric.range": "当前回望尺度",
			"life.continue": "放到对话输入框",
			"life.draft.template": "我想从 {start} 到 {end} 的这段人生回望继续谈：\n\n> {content}\n\n请结合我现在的处境，帮我看看哪些理解仍然成立，哪些已经发生变化。",
			"life.notice.drafted": "这段回望已放入 Harness 对话输入框，尚未发送。",
			"photo.eyebrow": "心智庭院 · 光影藏馆",
			"photo.title": "让散落的时光，在这里重逢",
			"photo.subtitle": "照片由 Harness 附件存储校验并保存；故事文字、粒子参数与引用加密留在你的庭院中。",
			"photo.upload": "收藏照片",
			"photo.uploading": "正在收藏……",
			"photo.uploadHint": "支持 PNG、JPEG、WebP 与 GIF；实际大小和像素上限由当前部署决定。",
			"photo.upload.optimized": "照片超出当前部署限制，已优化为高清 WebP 后收藏；照片故事与粒子效果保持完整可用。",
			"photo.empty.title": "相册里还没有光影",
			"photo.empty.body": "从本地选择一张照片，它会成为一则可冷启动恢复的私人故事。",
			"photo.empty.action": "收藏第一张照片",
			"photo.loading": "正在打开光影藏馆……",
			"photo.error": "照片故事暂时无法打开，请稍后再试。",
			"photo.error.load": "原图暂时没有读取成功；故事记录与粒子设置没有变化。",
			"photo.error.upload": "这张照片没有收藏成功，请检查图片格式或稍后再试。",
			"photo.error.upload.size": "照片体积超过当前收藏上限，自动优化后仍然过大。请先压缩照片再试。",
			"photo.error.upload.dimension": "照片画幅或像素数超过当前上限；动态 GIF 不会被静默压平，请缩小后再收藏。",
			"photo.error.upload.format": "无法读取这张照片。请选择有效的 PNG、JPEG、WebP 或 GIF 文件。",
			"photo.error.upload.browser": "当前浏览器没有完成照片优化。请更新浏览器，或先导出为 WebP/JPEG 后再试。",
			"photo.error.upload.unavailable": "照片存储暂时不可用，文件没有被写入。请稍后再试。",
			"photo.error.save": "这一帧的故事与粒子设置没有保存，请核对后再试。",
			"photo.error.observe": "这次观察没有完成；原图、故事和粒子设置都没有改变。",
			"photo.error.observe.model": "视觉模型没有完成这次观察；没有保存半成品，可以稍后再试。",
			"photo.error.observe.output": "模型返回的观察没有通过格式与安全校验，因此没有保存。可以再观察一次。",
			"photo.error.observe.route": "当前视觉路由无法读取这张图片，请检查 Harness 中的模型配置。",
			"photo.error.dialogue": "这句话没有得到完整回应，也没有写进照片故事；可以稍后再发送。",
			"photo.error.delete": "这则照片故事没有删除，原图引用与私人记录仍然保留。",
			"photo.retry": "重新载入",
			"photo.classic": "经典卡片",
			"photo.dynamic": "动态画廊",
			"photo.albumView": "照片故事相册视图",
			"photo.count": "珍藏着 {count} 帧尚未说完的故事",
			"photo.date": "收藏于 {date}",
			"photo.open": "走进这则照片故事",
			"photo.back": "返回光影藏馆",
			"photo.panel.controls": "照片故事工作台",
			"photo.panel.dialogue": "AI 对话",
			"photo.panel.edit": "粒子调节",
			"photo.toolbar.original": "原图",
			"photo.toolbar.recompose": "重聚",
			"photo.toolbar.dialogue": "对话",
			"photo.toolbar.particles": "粒子",
			"photo.preview": "查看原图",
			"photo.recompose": "重新聚成这一帧",
			"photo.previewDialog": "照片故事原图预览",
			"photo.previewClose": "关闭原图预览",
			"photo.scene": "可旋转的 3D 照片粒子画面",
			"photo.sceneLoading": "正在重建高精度粒子……",
			"photo.sceneFallback": "粒子渲染不可用，已显示经过验证的原图。",
			"photo.sceneCount": "{count} 粒子 · 拖动旋转 · 滚轮缩放",
			"photo.storyTitle": "这一帧的名字",
			"photo.storyNote": "我想留下的故事",
			"photo.storyPlaceholder": "可以写下时间、人物或只有你知道的画外声音。这里不会替你虚构照片之外的事情。",
			"photo.particleTitle": "光影粒子",
			"photo.particle.soft": "轻柔纸页",
			"photo.particle.dust": "记忆尘埃",
			"photo.particle.fluid": "流体回声",
			"photo.particle.nebula": "深空星云",
			"photo.pointSize": "粒子尺寸",
			"photo.depth": "景深强度",
			"photo.interaction": "触碰力度",
			"photo.motion": "呼吸幅度",
			"photo.save": "保存这一帧",
			"photo.saving": "正在保存……",
			"photo.saved": "故事与粒子参数已加密保存。",
			"photo.delete": "让它散去",
			"photo.deleteConfirm": "再点一次，确认移除这则故事",
			"photo.deleteHint": "故事引用会立即消失；不可变附件字节按部署的保留策略回收。",
			"photo.pagePrevious": "上一页",
			"photo.pageNext": "下一页",
			"photo.page": "第 {current} / {total} 页",
			"photo.dynamicHint": "方向键或控制钮切换画面 · 点击走入故事",
			"photo.carouselControls": "动态画廊控制",
			"photo.carouselPrevious": "上一帧",
			"photo.carouselNext": "下一帧",
			"photo.carouselPause": "暂停自动轮播",
			"photo.carouselPlay": "继续自动轮播",
			"photo.carouselPosition": "{current} / {total} · {title}",
			"photo.sceneReducedMotion": "已按减少动态偏好显示经过验证的原图。",
			"photo.dialogue.eyebrow": "照片陪伴 · 由你开启",
			"photo.dialogue.title": "让这一帧慢慢说话",
			"photo.dialogue.boundary": "观察来自已配置的视觉模型，不是事实裁决。图像只在你点击后发送一次；后续对话只引用冻结的未确认观察。",
			"photo.observe.title": "先决定是否让模型看见这张照片",
			"photo.observe.disclosure": "点击后，经过验证的图像会发送给部署所配置的视觉模型。模型可能看错；任何描述都不会自动写成你的记忆。",
			"photo.observe.action": "观察这张照片",
			"photo.observe.pending": "正在安静地看……",
			"photo.observe.unconfirmed": "模型观察 · 尚未经你确认",
			"photo.observe.visible": "模型认为可见的元素",
			"photo.observe.uncertain": "它不确定的细节",
			"photo.dialogue.me": "我",
			"photo.dialogue.companion": "照片陪伴者",
			"photo.dialogue.suggestions": "继续这段照片故事",
			"photo.dialogue.input": "补充、纠正，或说说它让你想起什么",
			"photo.dialogue.placeholder": "比如：这里最重要的人其实没有出现在画面里……",
			"photo.dialogue.send": "继续这段故事",
			"photo.dialogue.pending": "正在回应……",
			"concern.eyebrow": "心智庭院 · 心事篮",
			"concern.title": "把心事先放在这里，不必立刻处理",
			"concern.subtitle": "心事不会自动进入对话。你可以安排提醒、完成它，或亲自将它转成日记。",
			"concern.input": "我想先放下的事",
			"concern.placeholder": "可以只写一句话。这里不要求你现在就有答案。",
			"concern.reminder": "何时再看（可选）",
			"concern.retrieval": "转成日记时，允许它在我授权的对话中被引用",
			"concern.add": "放进心事篮",
			"concern.compose.eyebrow": "先放下来",
			"concern.compose.title": "现在不处理，也是一种选择",
			"concern.compose.body": "写一句就够了。提醒日期和是否进入日记，都由你稍后决定。",
			"concern.collection.title": "留在这里的事",
			"concern.collection.emptyCount": "空着也很好",
			"concern.collection.count": "{count} 件",
			"concern.edit": "修改",
			"concern.edit.save": "保存修改",
			"concern.edit.cancel": "取消",
			"concern.conversation": "放到对话输入框",
			"concern.conversation.draft": "我想把心事篮里的这件事带回对话：\n\n> {content}",
			"concern.convert": "转成日记",
			"concern.complete": "这件事结束了",
			"concern.loading": "正在打开心事篮……",
			"concern.empty": "心事篮还是空的。不需要为了填满它而写什么。",
			"concern.error": "心事篮暂时没有回应，请稍后再试。",
			"concern.status.active": "还在心上",
			"concern.status.completed": "已结束",
			"concern.status.converted": "已转成日记",
			"concern.reminds": "{date} 再看",
			"concern.notice.created": "这件心事已经被安放好。",
			"concern.notice.updated": "心事与提醒已经更新。",
			"concern.notice.drafted": "已放到下方对话输入框；发送前你仍可以修改。",
			"concern.notice.completed": "它已经离开待办的位置，但历史仍然保留。",
			"concern.notice.converted": "这件心事已转成可继续书写的日记。",
			"calendar.eyebrow": "心智庭院 · 时间地图",
			"calendar.title": "看见时间里真正留下的痕迹",
			"calendar.subtitle": "日历只投影已验证的庭院记录：心情、日记、心事、原则、现实实验与开放问题。",
			"calendar.month": "月份",
			"calendar.today": "回到今天",
			"calendar.previous": "上个月",
			"calendar.next": "下个月",
			"calendar.filter": "筛选庭院记录",
			"calendar.filter.all": "全部",
			"calendar.filter.checkin": "心情",
			"calendar.filter.journal": "日记",
			"calendar.filter.concern": "心事",
			"calendar.filter.principle": "原则",
			"calendar.filter.experiment": "实验",
			"calendar.filter.question": "问题",
			"calendar.showDay": "当日记录",
			"calendar.showTrend": "变化轨迹",
			"calendar.grid": "月度庭院日历",
			"calendar.dayDetail": "当日庭院记录",
			"calendar.dayLabel": "{date}，{count} 条记录",
			"calendar.eventCount": "{count} 条",
			"calendar.loading": "正在读取这一天……",
			"calendar.emptyDay": "这一天没有留下庭院记录。",
			"calendar.error": "日历暂时无法读取，请稍后再试。",
			"calendar.weekday.sun": "日",
			"calendar.weekday.mon": "一",
			"calendar.weekday.tue": "二",
			"calendar.weekday.wed": "三",
			"calendar.weekday.thu": "四",
			"calendar.weekday.fri": "五",
			"calendar.weekday.sat": "六",
			"calendar.event.checkin": "心情签到",
			"calendar.event.journal": "日记",
			"calendar.event.concern": "心事提醒",
			"calendar.event.principle": "人生原则",
			"calendar.event.experimentReview": "现实实验回看",
			"calendar.event.experimentObservation": "现实实验观察",
			"calendar.event.question": "开放问题",
			"calendar.event.noWords": "当时没有写下情绪词",
			"calendar.conversation": "把这条带回对话",
			"calendar.conversation.draft": "我想从 {date} 的庭院记录继续聊起。\n\n{kind}：{detail}",
			"calendar.notice.drafted": "这条记录已放到下方对话输入框。",
			"calendar.trend": "30 天心情轨迹",
			"calendar.trendChart": "近 30 天心情变化折线图",
			"calendar.trendEmpty": "至少在 3 个不同日期签到后，轨迹才会出现。",
			"growth.eyebrow": "心智庭院 · 生活议题",
			"growth.title": "把想明白的事，变成可以在现实中观察的一小步",
			"growth.subtitle": "这里没有成功或失败分数。实验、观察与修正都由你决定，每次观察会完整保留。",
			"growth.private": "本地加密 · 只记录事实，不评价自律",
			"growth.instrument.label": "现实观察仪：显示正在尝试和已有观察的真实数量",
			"growth.instrument.active": "项正在生活里发生",
			"growth.instrument.observed": "项已有真实观察",
			"growth.composer.label": "建立一个可撤回的尝试",
			"growth.composer.title": "先把步子放小",
			"growth.composer.subtitle": "写下一个能做、能停、也能回来修正的动作。",
			"growth.composer.boundary": "它不是任务清单，也不会生成完成率；现实里发生了什么，比是否“成功”更重要。",
			"growth.journal.label": "现实观察手册",
			"growth.journal.title": "真正发生过的尝试",
			"growth.journal.subtitle": "每条观察保留原貌。状态帮助你找到它，不替你下结论。",
			"growth.input.title": "我想试试的事",
			"growth.input.reviewDate": "何时回看（可选）",
			"growth.input.hypothesis": "我的假设（可选）",
			"growth.input.hypothesisPlaceholder": "例如：如果我先说出边界，关系不一定会受损。",
			"growth.input.action": "一个足够小、可实际做到的行动",
			"growth.input.actionPlaceholder": "写下具体行动，不用写成宏大目标。",
			"growth.create": "建立现实实验",
			"growth.loading": "正在读取生活议题……",
			"growth.empty": "还没有现实实验。可以等一个真正值得观察的小问题出现。",
			"growth.error": "生活议题暂时没有回应，请稍后再试。",
			"growth.status.proposed": "待开始",
			"growth.status.trying": "正在尝试",
			"growth.status.observed": "已有观察",
			"growth.status.revised": "已修正",
			"growth.status.stopped": "已停止",
			"growth.hypothesis": "假设",
			"growth.action": "行动",
			"growth.reviewDate": "下次回看",
			"growth.observations": "实验观察",
			"growth.observation": "这次真实发生了什么？",
			"growth.start": "开始尝试",
			"growth.observe": "记下观察",
			"growth.record": "保留这次观察",
			"growth.stop": "停止实验",
			"growth.continue": "放到对话输入框",
			"growth.draft.template": "我想继续回看这次现实尝试：\n\n> {title}\n\n我准备做的是：{action}\n\n请先帮我分清实际发生的事实、我的感受，以及还值得观察什么。",
			"growth.notice.created": "现实实验已建立，它仍等待你亲自开始。",
			"growth.notice.started": "实验已开始。先生活，再回来观察。",
			"growth.notice.observed": "这次观察已完整保留，没有被评分。",
			"growth.notice.stopped": "实验已停止，原有观察仍然保留。",
			"growth.notice.drafted": "这次尝试已放入 Harness 对话输入框，尚未发送。",
			"philosophy.eyebrow": "心智庭院 · 我的哲学",
			"philosophy.title": "让人生原则从经验中长出来，也允许它被重新质疑",
			"philosophy.subtitle": "对话后沉思、AI 建议的原则和你真正采纳的信念被严格分开。只有你的明确确认会改变它们。",
			"philosophy.private": "本地加密 · 思考可以改变，不必成为定论",
			"philosophy.instrument.label": "哲思标本仪：显示真实沉淀、待决定提案与生效原则数量",
			"philosophy.instrument.notes": "篇已确认沉淀",
			"philosophy.instrument.proposals": "条待决定提案",
			"philosophy.instrument.principles": "条仍在生活中的原则",
			"philosophy.loading": "正在翻开你的哲学手记……",
			"philosophy.error": "哲学手记暂时无法读取，请稍后再试。",
			"philosophy.contemplations": "对话后沉思",
			"philosophy.contemplationsHint": "草稿不会进入模型上下文",
			"philosophy.emptyContemplations": "还没有沉思手记。",
			"philosophy.add": "记下一段",
			"philosophy.addLabel": "写下这轮对话后，你真正想留下的一段理解",
			"philosophy.saveDraft": "保存为草稿",
			"philosophy.edit": "修改",
			"philosophy.editLabel": "修正这篇沉思草稿",
			"philosophy.save": "保存",
			"philosophy.confirm": "确认是我的理解",
			"philosophy.delete": "删除草稿",
			"philosophy.deleteQuestion": "这篇草稿将被永久删除。",
			"philosophy.deleteConfirm": "确认删除",
			"philosophy.cancel": "取消",
			"philosophy.extract": "提炼一句原则",
			"philosophy.extractLabel": "用一句自己的话，写下这篇沉思可能支持的生活原则",
			"philosophy.propose": "形成待决定提案",
			"philosophy.formation.manual": "由你从一篇已确认的沉思中提炼",
			"philosophy.contemplation.draft": "待你确认",
			"philosophy.contemplation.confirmed": "已确认",
			"philosophy.proposals": "原则提案",
			"philosophy.proposalsHint": "提案默认不生效",
			"philosophy.emptyProposals": "还没有等待你判断的原则提案。",
			"philosophy.proposal.proposed": "待决定",
			"philosophy.proposal.accepted": "已采纳",
			"philosophy.proposal.rejected": "已拒绝",
			"philosophy.accept": "这是我的原则",
			"philosophy.reject": "不采纳",
			"philosophy.principles": "我的人生原则",
			"philosophy.principlesHint": "每次修正都保留历史",
			"philosophy.emptyPrinciples": "还没有由你确认的人生原则。",
			"philosophy.principle.trying": "正在尝试",
			"philosophy.principle.adopted": "已采纳",
			"philosophy.principle.questioning": "重新质疑",
			"philosophy.principle.retired": "已退役",
			"philosophy.statusFor": "调整原则“{principle}”的状态",
			"philosophy.formation": "形成背景",
			"philosophy.quote": "我当时的话",
			"philosophy.counterexample": "反例与边界",
			"philosophy.appliesTo": "这条原则适用的范围",
			"philosophy.versionCount": "已保留 {count} 个版本",
			"philosophy.continue": "放到对话输入框",
			"philosophy.draft.contemplation": "我想回到这篇由我确认的沉淀继续谈：\n\n> {content}\n\n请结合最近发生的事，帮我看看其中哪些理解仍然成立，哪些需要修正。",
			"philosophy.draft.principle": "我想重新检验这条生活原则：\n\n> {expression}\n\n已知边界或反例：{counterexample}\n\n请不要替我维护它；帮我看看现实是否仍然支持它。",
			"philosophy.notice.accepted": "这条原则已由你确认，并开始生效。",
			"philosophy.notice.rejected": "这份提案已被拒绝，不会成为你的原则。",
			"philosophy.notice.revised": "原则状态已修正，上一个版本仍完整保留。",
			"philosophy.notice.drafted": "这段哲思已放入 Harness 对话输入框，尚未发送。",
			"philosophy.notice.created": "沉思草稿已保存，确认前不会成为你的定论。",
			"philosophy.notice.updated": "沉思草稿已修正。",
			"philosophy.notice.confirmed": "这篇沉思已由你确认。",
			"philosophy.notice.deleted": "沉思草稿已删除。",
			"philosophy.notice.proposed": "原则提案已形成；在你采纳前不会生效。",
			"philosophy.sourceUnavailable": "完成一轮安宁对话后，就可以在这里留下沉思。当前内容没有被保存。",
			"star.sidebar.eyebrow": "{count} 颗星尘等待被看见",
			"star.sidebar.title": "进入我的星图",
			"star.sidebar.detail": "{count} 段回望已经点亮",
			"star.sidebar.ritual.eyebrow": "一片尚未点亮的星空",
			"star.sidebar.ritual.title": "点亮我的星图",
			"star.sidebar.ritual.detail": "完成初次观星礼",
			"star.sidebar.new-dust.eyebrow": "{count} 颗星尘等待判断",
			"star.sidebar.new-dust.title": "星图有了新变化",
			"star.sidebar.new-dust.detail": "去看看这束新微光",
			"star.sidebar.continue.eyebrow": "一张心象卡还未收束",
			"star.sidebar.continue.title": "继续观测",
			"star.sidebar.continue.detail": "沿着上次的话继续",
			"star.sidebar.draw.eyebrow": "{count} 颗星已被收藏",
			"star.sidebar.draw.title": "抽一张心象卡",
			"star.sidebar.draw.detail": "让此刻出现一个新角度",
			"star.eyebrow": "心智庭院 · 星图",
			"star.title": "让问题与回望，在同一片星空里彼此照见",
			"star.subtitle": "星图直接来自你在庭院中保留的记录。中心不是结论，而是此刻仍会变化的自己。",
			"star.back": "回到今天",
			"star.metrics": "星图概览",
			"star.metric.questions": "颗开放星尘",
			"star.metric.reviews": "段回望星体",
			"star.metric.traits": "颗自述星尘",
			"star.metric.links": "条可见轨道",
			"star.codex": "星图节点图鉴",
			"star.center": "此刻的我",
			"star.center.serenity": "正在以观心姿态靠近自己",
			"star.center.clarity": "正在以玄思姿态看清脉络",
			"star.question.since": "从 {date} 开始继续观察",
			"star.review.unnamed": "未命名回望",
			"star.review.detail": "{start} — {end} · {count} 个来源",
			"star.kind.center": "星图中心",
			"star.kind.trait": "我的星尘",
			"star.kind.question": "开放星尘",
			"star.kind.review": "回望星体",
			"star.selected.hint": "使用下方节点列表选择；星图画布可拖动旋转、滚轮缩放。",
			"star.controls": "拖动旋转 · 滚轮缩放 · 键盘浏览右侧星体图鉴",
			"star.fallback": "3D 星图暂不可用，节点列表仍可完整浏览。",
			"star.trait.detail": "这是你在观星礼中亲自写下的词。它不是模型对你的判断。",
			"star.trait.retire": "让这颗星尘退场",
			"star.profile.open": "星图底稿",
			"star.profile.title": "我的星图底稿",
			"star.profile.subtitle": "这些资料已加密保存。只有你明确允许的庭院记录，未来才可用于星图观察。",
			"star.profile.close": "收起底稿",
			"star.profile.intent": "我希望观察什么",
			"star.profile.tone": "星图观察者的语气",
			"star.profile.tone.gentle": "温柔陪伴",
			"star.profile.tone.direct": "坦率清晰",
			"star.profile.tone.mystic": "诗意玄思",
			"star.profile.permissions": "未来观察可使用的数据",
			"star.profile.permission.reflections": "每日书写",
			"star.profile.permission.memories": "已确认记忆",
			"star.profile.permission.questions": "开放问题",
			"star.profile.permission.reviews": "周期回望",
			"star.profile.motion": "减少星图动态效果",
			"star.profile.save": "保存底稿",
			"star.profile.saved": "星图底稿已保存。",
			"star.profile.error": "底稿没有保存成功，请重新载入后再试。",
			"star.loading": "正在解开你的星图……",
			"star.error": "星图暂时没有回应，请稍后再试。",
			"star.observer.summon": "抽一张心象卡",
			"star.observer.summon.hint": "让星之观察者陪你继续聊",
			"star.observer.awaiting": "有一张星卡等待你的决定",
			"star.observer.eyebrow": "证据绑定 · 由你校准",
			"star.observer.title": "星之观察者",
			"star.observer.close": "收起星之观察者",
			"star.observer.disclosure": "选择一组观察视角。观察者只会读取你在“星图底稿”中明确允许的加密资料，并把结论留成可纠正的假设。",
			"star.observer.deck": "这次从哪里开始",
			"star.observer.deck.current-self": "此刻的我",
			"star.observer.deck.unfolded-self": "未展开的我",
			"star.observer.deck.inner-debate": "内在辩论",
			"star.observer.question": "我想带着一个问题（可选）",
			"star.observer.question.placeholder": "例如：我为什么总在真正开始前反复确认？",
			"star.observer.permission.title": "本次调用边界",
			"star.observer.permission.body": "本次始终发送星图名称、MBTI 填写方式与结果、自述词、长期观察问题和所选语气；另有 {count}/4 类历史资料获准进入。确切请求、证据快照和模型原文会一并加密审计。",
			"star.observer.draw": "让星光给出一个可验证的假设",
			"star.observer.drawing": "观察者正在穿过星尘……",
			"star.observer.error": "这次观察没有完成；没有生成替代结论，也没有改变你的星图。",
			"star.observer.kind.imagination": "想象卡",
			"star.observer.confidence.grounded": "证据较充分",
			"star.observer.confidence.tentative": "暂定观察",
			"star.observer.analysis.situation": "正在发生",
			"star.observer.analysis.core": "核心未知",
			"star.observer.analysis.tradeoff": "两边代价",
			"star.observer.analysis.guidance": "可逆一步",
			"star.observer.evidence": "查看本卡引用的原始片段",
			"star.observer.imagination": "本卡没有引用个人历史资料，因此只是一种想象视角，不会自动形成特质。",
			"star.observer.calibrate": "它像你吗？你的判断高于模型。",
			"star.observer.correction.placeholder": "写下更准确的版本；选择“不像我”时必须说明哪里不对。",
			"star.observer.resonates": "很像我",
			"star.observer.uncertain": "再观察",
			"star.observer.rejects": "不像我",
			"star.observer.dissolve": "让它散去",
			"star.observer.save": "收藏这张星卡",
			"star.observer.saved.title": "已收藏的星卡",
			"star.observer.saved.new": "抽新卡",
			"star.observer.saved.state": "这张星卡已收藏；对话与修订会继续加密保存在卡片中。",
			"star.observer.dialogue.title": "与星之观察者继续聊",
			"star.observer.dialogue.ready": "可以继续追问",
			"star.observer.dialogue.thinking": "正在梳理",
			"star.observer.dialogue.thinking.detail": "正在分清事实、解释与两边代价…",
			"star.observer.dialogue.welcome": "从一件具体的事开始",
			"star.observer.dialogue.welcome.body": "补充经历、反驳判断，或让观察者把不同选择的代价说清楚。",
			"star.observer.dialogue.me": "我",
			"star.observer.dialogue.observer": "观察者",
			"star.observer.dialogue.suggestions": "继续追问建议",
			"star.observer.dialogue.input": "我的补充或纠正",
			"star.observer.dialogue.placeholder": "继续聊，或直接指出哪里不准确…",
			"star.observer.dialogue.send": "发送给星之观察者",
			"star.observer.dialogue.error": "这一轮没有完成；对话和卡片都没有被模型悄悄改写。",
			"star.observer.revision.eyebrow": "观察者建议修订这张卡",
			"star.observer.revision.disclosure": "这只是提案。只有你采纳后才会改卡；已有校准会回到“待确认”。",
			"star.observer.revision.apply": "采纳这次修订",
			"star.observer.revision.applying": "正在采纳…",
			"star.observer.boundary": "星卡不是占卜、诊断或人格裁决。象征只作隐喻；未经你确认的推测不会成为事实。",
			"star.ritual.eyebrow": "第一次观星 · 可随时离开并继续",
			"star.ritual.title": "先举行一场只属于你的观星礼",
			"star.ritual.subtitle": "你提供的是自述，不是测验答案。进度和资料会加密保存，模型不会在这里偷偷给你贴标签。",
			"star.ritual.progress": "观星礼进度",
			"star.ritual.step.identity": "坐标",
			"star.ritual.step.self": "自述",
			"star.ritual.step.consent": "约定",
			"star.ritual.identity.title": "你想以怎样的名字出现在星图中央？",
			"star.ritual.identity.body": "生日、时间和城市都是可选资料。未知或不愿提供，都可以安静地留白。",
			"star.ritual.displayName": "星图中的名字",
			"star.ritual.displayName.placeholder": "例如：小林、此刻的我",
			"star.ritual.birthYear": "出生年份（可选）",
			"star.ritual.birthMonth": "月",
			"star.ritual.birthDay": "日",
			"star.ritual.timeKnown": "我愿意提供出生时间",
			"star.ritual.birthTime": "出生时间",
			"star.ritual.cityKnown": "我愿意提供出生城市",
			"star.ritual.birthCity": "出生城市",
			"star.ritual.self.title": "怎样描述你，比一个类型更重要",
			"star.ritual.self.body": "MBTI 只是可选的自述入口。你可以填写已知类型、回答六个生活场景，或把判断留给未来的共同观察。",
			"star.ritual.mbti.known": "我知道自己的类型",
			"star.ritual.mbti.scenes": "从生活场景开始",
			"star.ritual.mbti.observe": "先不定义，慢慢观察",
			"star.ritual.mbti.type": "MBTI 类型",
			"star.ritual.scene.1": "走进陌生人的聚会时，我通常……",
			"star.ritual.scene.1a": "主动靠近人群，在互动中获得能量",
			"star.ritual.scene.1b": "先观察环境，在少数连接中安顿自己",
			"star.ritual.scene.2": "面对一段空白的周末，我更倾向……",
			"star.ritual.scene.2a": "提前决定安排，让时间有清晰骨架",
			"star.ritual.scene.2b": "保留弹性，跟着当时的状态展开",
			"star.ritual.scene.3": "朋友向我诉说困境时，我先注意……",
			"star.ritual.scene.3a": "他的感受，以及什么回应能让他被理解",
			"star.ritual.scene.3b": "问题的结构，以及什么办法真正有效",
			"star.ritual.scene.4": "学习一件新事物时，我更容易被……吸引",
			"star.ritual.scene.4a": "可能性、隐喻和还没出现的联系",
			"star.ritual.scene.4b": "实例、细节和可以验证的步骤",
			"star.ritual.scene.5": "忙碌了一整天后，我更想……",
			"star.ritual.scene.5a": "独处片刻，让注意力慢慢回来",
			"star.ritual.scene.5b": "找人说说话，让能量重新流动",
			"star.ritual.scene.6": "做重要决定时，我最终更信任……",
			"star.ritual.scene.6a": "一致的逻辑和经得起追问的理由",
			"star.ritual.scene.6b": "内在价值和对相关之人的影响",
			"star.ritual.consent.title": "最后，由你决定这片星空如何观察你",
			"star.ritual.consent.body": "写下 1—5 个属于你自己的词，以及你希望长期观察的问题。所有资料授权默认关闭。",
			"star.ritual.words": "描述自己的词（用逗号分隔，最多 5 个）",
			"star.ritual.words.placeholder": "好奇，慢热，愿意修正",
			"star.ritual.intent": "我希望在星图中长期观察……",
			"star.ritual.intent.placeholder": "例如：我在什么时候最像真正的自己？",
			"star.ritual.permissions": "允许未来的星图观察引用",
			"star.ritual.private": "未勾选的资料不会进入星图观察；你之后可以在“星图底稿”中随时修改。",
			"star.ritual.back": "上一步",
			"star.ritual.next": "保存并继续",
			"star.ritual.complete": "点亮我的星图",
			"star.ritual.saving": "正在保存……",
			"star.ritual.exit": "回到今天",
			"star.ritual.error": "这一步没有保存成功，请检查填写内容后再试。",
			"review.eyebrow": "庭院 · 回望",
			"review.title": "把已经发生的事，连成一条可以回看的路",
			"review.subtitle": "这里引用你亲手留下的记录，不替你解释人生；任何回望都由你确认后保存。",
			"review.private": "加密保存 · 由你决定",
			"review.overview": "庭院概览",
			"review.metric.openQuestions": "仍在生长的问题",
			"review.metric.savedReviews": "已经保存的回望",
			"review.metric.posture": "此刻的对话姿态",
			"review.loading": "正在轻轻打开庭院……",
			"review.retry": "重新载入",
			"review.inactive.title": "先从一次安心的对话开始",
			"review.inactive.body": "选择一种对话姿态后，庭院会为你保留开放问题与周期回望。",
			"review.error.generic": "庭院暂时没有回应，请稍后再试。",
			"review.error.conflict": "这份内容刚在别处更新，已为你重新载入最新版本。",
			"review.error.materialChanged": "回望所引用的记录已经变化，请重新查看材料后再保存。",
			"review.error.noMaterial": "这段时间还没有可引用的庭院记录。",
			"question.title": "开放问题",
			"question.subtitle": "不急着回答，先把值得继续观察的事留在这里。",
			"question.input.label": "此刻，你想继续带着哪个问题生活？",
			"question.input.placeholder": "例如：什么样的边界，能让我既关心别人，也不丢掉自己？",
			"question.date": "留下的日期",
			"question.add": "留在庭院",
			"question.empty.title": "这里还有一小块空地",
			"question.empty.body": "当一个问题不适合仓促回答时，可以先把它种在这里。",
			"question.status.open": "继续观察",
			"question.status.resolved": "已有回应",
			"question.status.dismissed": "暂时放下",
			"question.resolve": "现实已有答案",
			"question.dismiss": "暂时放下",
			"question.reopen": "重新打开",
			"question.notice.created": "这个问题已经留在庭院里。",
			"question.notice.closed": "这次变化已经记在它的生长轨迹里。",
			"question.notice.reopened": "这个问题重新回到了你的视野。",
			"review.period.title": "周期回望",
			"review.period.subtitle": "先看见原始材料，再写下只属于你的连接与判断。",
			"review.period.type": "回望尺度",
			"review.period.week": "这一周",
			"review.period.month": "这个月",
			"review.period.year": "这一年",
			"review.period.start": "开始日期",
			"review.period.end": "结束日期",
			"review.period.load": "查看这段时间的材料",
			"review.material.title": "可引用的庭院片段",
			"review.material.count": "{count} 个经过验证的来源",
			"review.material.empty.title": "这段时间很安静",
			"review.material.empty.body": "没有足够材料形成回望，你可以换一个时间范围。",
			"review.category.events": "发生过的事",
			"review.category.ongoing": "仍在继续",
			"review.category.changes": "发生的变化",
			"review.category.experiments": "现实实验",
			"review.category.focus": "值得留意",
			"review.editor.label": "我想怎样理解这段时间？",
			"review.editor.placeholder": "不用写得完整。可以从一个变化、一种反复出现的感受，或下一步想守住的东西开始。",
			"review.editor.hint": "先保存为草稿，确认后再收进庭院。",
			"review.create": "形成回望草稿",
			"review.empty.title": "回望会在这里慢慢成形",
			"review.empty.body": "选择一段时间，看看你已经留下了哪些可以连接的线索。",
			"review.status.proposed": "待确认",
			"review.status.saved": "已保存",
			"review.status.archived": "已归档",
			"review.sources": "引用 {count} 个庭院来源",
			"review.stale": "部分来源后来发生了变化；这份回望仍保留当时所见。",
			"review.save": "收进庭院",
			"review.archive": "归档",
			"review.notice.materialReady": "材料已经备好，你可以先读一遍再动笔。",
			"review.notice.created": "回望草稿已形成，仍由你决定是否保存。",
			"review.notice.saved": "这份回望已经收进庭院。",
			"review.notice.archived": "这份回望已经归档。",
			"error.notBlank": "只能在尚未开始对话的新会话中进入心智庭院。",
			"error.generic": "庭院设置未能保存，请稍后重试。"
		};
		/** English dictionary, complete against the Chinese key set. */
		const en = {
			"entry.open": "Enter Mind Garden",
			"entry.hint": "A place where you do not have to perform strength",
			"entry.close": "Not now",
			"disclosure.title": "A clear boundary first",
			"disclosure.body": "Replies here come from an AI model, not a human, therapist, or emergency service. The conversation is processed under this deployment’s durable storage and model-provider configuration. If you are in immediate danger, contact local emergency help and someone you trust.",
			"disclosure.accept": "Confirm the boundary to begin; no dialogue-mode choice is required",
			"disclosure.consent": "I have read and understand the AI, data-processing, and emergency-support boundaries above",
			"disclosure.consent.hint": "This confirmation only activates Mind Garden. It does not enable long-term memory or extra model review.",
			"disclosure.contract": "Three boundaries before entering Mind Garden",
			"disclosure.profile.title": "Private records belong to this profile",
			"disclosure.profile.body": "Garden content enters the encrypted vault, not workspace files.",
			"disclosure.model.title": "Uses this Session’s model configuration",
			"disclosure.model.body": "The provider matches ordinary conversation; extra material crosses only explicit authorization seams.",
			"disclosure.authority.title": "Interpretation and confirmation remain yours",
			"disclosure.authority.body": "Candidate memories, traits, and principles never become active just because AI proposed them.",
			"disclosure.start": "Start the conversation",
			"disclosure.starting": "Starting…",
			"disclosure.default": "Follows your lead by default; say “just listen” whenever needed.",
			"mode.serenity": "Serenity",
			"mode.serenity.desc": "Hear the feeling first; slow down without rushing to solve",
			"mode.clarity": "Clarity",
			"mode.clarity.desc": "See the pattern and ask one question that truly matters",
			"garden.title": "Mind Garden",
			"garden.expand": "Expand Mind Garden settings",
			"garden.collapse": "Collapse Mind Garden settings",
			"garden.close": "Close dialogue posture",
			"garden.storage": "This session uses durable storage",
			"garden.settings": "Garden settings",
			"garden.settings.eyebrow": "Dialogue posture and support style",
			"garden.settings.kicker": "PRIVATE CONTROL ROOM · PROFILE SCOPE",
			"garden.settings.body": "Calibrate companionship for this Session and manage the encrypted private archive spanning this Web profile. Harness continues to own model, Session, and attachment infrastructure.",
			"garden.settings.assurances": "Garden settings scope",
			"garden.settings.session": "Dialogue posture · current Session",
			"garden.settings.profile": "Private archive · current profile",
			"garden.settings.host": "Model and attachments · Harness-owned",
			"garden.settings.close": "Done",
			"garden.dialogue.title": "Calibrate companionship for now",
			"garden.dialogue.body": "Changes apply only to this Mind Garden Session and never rewrite records you already saved.",
			"backup.title": "Carry the whole garden with you",
			"backup.body": "Create a complete private archive protected by your passphrase. Memories, reflections, constellation data, photo stories, and verified originals are combined and encrypted before leaving the Host.",
			"backup.assurances": "Backup contents and security notes",
			"backup.assurance.records": "Four private collections",
			"backup.assurance.photos": "Verified originals included",
			"backup.assurance.secret": "No runtime key inside",
			"backup.passphrase": "Archive passphrase",
			"backup.passphrase.placeholder": "12+ characters; several words work well",
			"backup.confirm": "Enter it again",
			"backup.confirm.placeholder": "Confirm the secret only you know",
			"backup.hint": "DeepSeek Harness never stores this passphrase. A lost passphrase cannot be recovered.",
			"backup.hint.length": "Use a passphrase with at least 12 characters.",
			"backup.hint.match": "The two passphrases do not match yet.",
			"backup.action": "Seal and download",
			"backup.working": "Sealing…",
			"backup.success": "Private archive handed to your browser",
			"backup.failed": "Archive not created",
			"backup.error.passphrase": "The passphrase does not meet the length requirement.",
			"backup.error.size": "This garden exceeds the deployment’s safe export limit.",
			"backup.error.attachment": "At least one photo failed integrity verification, so no incomplete archive was created.",
			"backup.error.vault": "Private storage is locked or could not be authenticated.",
			"backup.error.download": "The browser could not receive the download. Check download permission and try again.",
			"backup.error.generic": "No archive was created, and existing garden data was not changed.",
			"restore.title": "Restore from a private archive",
			"restore.body": "Choose a .mgarden archive created by the current or original Mind Garden. Harness authenticates and previews it first, then adds only missing records; current records with the same ids always stay.",
			"restore.file": "Private archive file",
			"restore.file.action": "Choose archive",
			"restore.file.empty": "No .mgarden file selected",
			"restore.passphrase": "Archive passphrase",
			"restore.passphrase.placeholder": "Enter its passphrase (original archives allow 8+ characters)",
			"restore.inspect": "Inspect archive",
			"restore.inspecting": "Authenticating…",
			"restore.preview.ready": "Archive passed every integrity check",
			"restore.preview.legacy": "Original archive authenticated · private-profile migration preview",
			"restore.preview.add": "Will add",
			"restore.preview.keep": "Keep current",
			"restore.preview.photos": "Verified originals",
			"restore.preview.size": "Archive size",
			"restore.preview.rule": "Restore never overwrites a current record with the same id. The same archive can be retried safely after interruption.",
			"restore.preview.legacy.rule": "Compatible check-ins, journals, concerns, experiments, contemplations, period reviews, open questions, long-term memories, Star Map profile data, and Photo Stories are imported. Current same-id records always stay. Original conversations and cards without current evidence provenance remain in the original archive.",
			"restore.action": "Merge missing records",
			"restore.working": "Restoring…",
			"restore.cancel": "Not now",
			"restore.success": "Private archive merged into this garden",
			"restore.success.body": "Current records were preserved; missing content was authenticated, encrypted, and stored.",
			"restore.success.legacy.body": "Supported original private data was converted into current encrypted records; photos and particle settings also entered the Harness attachment system. The original archive was not rewritten.",
			"restore.error.passphrase": "The passphrase does not meet the archive security requirement.",
			"restore.error.invalid": "The passphrase is wrong, the archive is damaged, or it contains a record this version cannot safely recognize.",
			"restore.error.size": "This archive exceeds the deployment’s safe inspection limit.",
			"restore.error.attachment": "At least one original failed the current attachment store’s integrity checks. No private records were merged.",
			"restore.error.vault": "Private storage is locked or could not be authenticated. Restore storage access first.",
			"restore.error.generic": "Restore did not finish. No current same-id record was overwritten; keep the archive and try again.",
			"rotation.title": "Renew the private-storage key",
			"rotation.body": "Download a fresh archive first. Rotation re-encrypts every private record; verified photo originals remain protected by attachment storage.",
			"rotation.action": "Prepare rotation",
			"rotation.confirm.body": "This rotates the whole profile data key. If you leave midway, the next private-storage operation resumes from the durable journal. Begin now?",
			"rotation.confirm.action": "Confirm rotation",
			"rotation.cancel": "Not now",
			"rotation.working": "Calibrating key…",
			"rotation.success": "The new key now protects every record",
			"rotation.records": "records",
			"rotation.error.credentials": "The primary or staging credential is not writable. Private data still has a recovery path.",
			"rotation.error.vault": "Private storage is locked, or an earlier rotation must recover first.",
			"rotation.error.generic": "Rotation did not finish. Its durable journal retains the recovery path; try again later.",
			"section.mode": "Overall dialogue tendency",
			"section.intent": "How to support you now",
			"intent.auto": "Follow my lead",
			"intent.listen": "Just listen",
			"intent.settle": "Help me settle",
			"intent.clarify": "Help me clarify",
			"intent.next-step": "One small step",
			"view.garden": "Mind Garden",
			"space.navigation": "Mind Garden spaces",
			"space.title": "Mind Garden",
			"space.expand": "Leave compact navigation",
			"space.collapse": "Use compact navigation",
			"space.regions": "Five garden regions",
			"space.private": "A private, locally encrypted space",
			"space.region.now": "Now",
			"space.region.innerLife": "Inner life",
			"space.region.time": "Time",
			"space.region.keepsakes": "Keepsakes",
			"space.region.starGarden": "Star garden",
			"space.group.now": "NOW",
			"space.group.clarity": "COMING INTO FOCUS",
			"space.group.longTerm": "LONG-TERM REFLECTION",
			"space.today": "Today",
			"space.concerns": "Heart basket",
			"space.calendar": "Calendar",
			"space.photoStory": "Photo stories",
			"space.memory": "My memories",
			"space.growth": "Life themes",
			"space.starMap": "My constellation",
			"space.life": "Life review",
			"space.philosophy": "My philosophy",
			"orbit.label": "Today's reflection orbit",
			"orbit.center": "Now",
			"orbit.question.meta": "Still unfolding",
			"orbit.fallback.today": "Today's inner weather",
			"orbit.fallback.unnamed": "Waiting for your words",
			"orbit.fallback.memory": "A moment worth revisiting",
			"orbit.fallback.unwritten": "Not written yet",
			"orbit.fallback.tomorrow": "Continue tomorrow",
			"orbit.fallback.choice": "You decide",
			"orbit.fallback.stillness": "This quiet moment",
			"orbit.fallback.permission": "No answer is required",
			"orbit.fallback.noticed": "Already noticed",
			"orbit.fallback.stay": "Worth keeping here",
			"orbit.fallback.return": "A future reflection",
			"orbit.fallback.waiting": "Waiting for your return",
			"orbit.summary": "{questions} open questions · {reviews} saved reflections",
			"today.eyebrow": "Mind Garden · Daily grounding",
			"today.title": "Notice yourself first, then choose what to keep",
			"today.observatory.title": "Today begins here",
			"today.observatory.prompt": "What most needs to be heard with care right now?",
			"today.observatory.checkin": "Record this moment",
			"today.observatory.question": "Keep a question",
			"today.echo.title": "Today's echoes",
			"today.echo.question": "A question still in orbit",
			"today.echo.review": "A reflection already kept",
			"today.echo.tomorrow": "Continue tomorrow",
			"today.echo.ledger": "Private observation · Encrypted",
			"today.practice.title": "Place this moment here",
			"today.subtitle": "A check-in records only what you choose now. Journals stay editable and can enter authorized conversation context only when you explicitly allow it.",
			"today.loading": "Opening today's garden records…",
			"today.error": "Today's check-ins and journals are temporarily unavailable. Please try again.",
			"today.checkin.title": "Check in with this moment",
			"today.checkin.subtitle": "No score and no interpretation—just one coordinate for where you are.",
			"today.checkin.mood": "Mood right now",
			"today.checkin.energy": "Energy right now",
			"today.checkin.emotions": "Emotion words (optional)",
			"today.checkin.emotions.placeholder": "For example: calm, hesitant, hopeful",
			"today.checkin.emotions.hint": "Separate with spaces or commas. Up to three unique words are retained.",
			"today.checkin.save": "Keep this moment",
			"today.checkin.saved": "Today's check-in trail",
			"today.checkin.notice": "This moment is encrypted and kept in your garden.",
			"today.mood.-2": "Heavy",
			"today.mood.-2.glyph": "◔",
			"today.mood.-1": "Low",
			"today.mood.-1.glyph": "◑",
			"today.mood.0": "Steady",
			"today.mood.0.glyph": "◉",
			"today.mood.1": "Light",
			"today.mood.1.glyph": "◐",
			"today.mood.2": "Bright",
			"today.mood.2.glyph": "◕",
			"today.energy.1": "Very low",
			"today.energy.2": "Low",
			"today.energy.3": "Steady",
			"today.energy.4": "High",
			"today.energy.5": "Full",
			"today.journal.title": "Write a little",
			"today.journal.editing": "Continue revising this journal",
			"today.journal.subtitle": "One sentence is enough. A journal does not need a conclusion.",
			"today.journal.name": "Title (optional)",
			"today.journal.name.placeholder": "Give this page a name",
			"today.journal.body": "What I want to keep",
			"today.journal.body.placeholder": "What is happening? Which moment deserves to be seen?",
			"today.journal.retrieval": "Allow citation in conversations I authorize",
			"today.journal.retrieval.hint": "Off by default. You can change it later; the journal never enters model context automatically.",
			"today.journal.create": "Keep in today",
			"today.journal.update": "Save revision",
			"today.journal.cancel": "Cancel editing",
			"today.journal.shelf": "Today's journals",
			"today.journal.count": "{count} entries",
			"today.journal.empty": "This page is still blank. You do not need to write just to fill it.",
			"today.journal.retrievable": "Eligible when authorized",
			"today.journal.private": "Garden only",
			"today.journal.untitled": "An untitled page",
			"today.journal.edit": "Continue writing",
			"today.journal.delete": "Remove this page",
			"today.journal.delete.confirm": "Click again to confirm removal",
			"today.journal.notice.created": "This page is encrypted and kept in today.",
			"today.journal.notice.updated": "The journal and retrieval permission are saved.",
			"today.journal.notice.deleted": "This page has been removed from the garden.",
			"memory.eyebrow": "MIND GARDEN · MEMORY AND OPEN QUESTIONS",
			"memory.title": "Keep important questions—and choose when to let them go",
			"memory.subtitle": "Questions you write or ground in conversation evidence remain traceable here. The model cannot silently rewrite their state.",
			"governance.eyebrow": "MIND GARDEN · MEMORY GOVERNANCE",
			"governance.title": "Let “knowing you” stay accurate—and always correctable by you",
			"governance.subtitle": "Candidates never enter model context automatically. Conflicts, retrieval permission, provenance, and revisions take effect only after your decision.",
			"governance.summary": "Long-term memory governance overview",
			"governance.active": " active",
			"governance.candidates": " awaiting review",
			"governance.relationships": " relationships",
			"governance.loading": "Authenticating and organizing your encrypted memories…",
			"governance.error.load": "Encrypted memories are temporarily unavailable. Please try again.",
			"governance.error.stale": "This memory changed elsewhere. The current list has been reloaded; review it before deciding again.",
			"governance.error.sensitive": "High-sensitivity memory must stay local and cannot be recallable.",
			"governance.error.extraction": "This conversation could not be organized into candidates. Existing memories were not changed.",
			"governance.error.generic": "The memory operation did not complete. Please try again.",
			"governance.notice.proposed": "The candidate is encrypted and still cannot be recalled.",
			"governance.notice.confirmed": "The memory and its recall boundary are saved as you decided.",
			"governance.notice.resolved": "The memory relationship is settled as you decided.",
			"governance.notice.updated": "The memory, scope, and recall permission are saved.",
			"governance.notice.rejected": "The candidate is rejected and cannot enter model context.",
			"governance.notice.deleted": "The memory was removed from the encrypted library. Copies already present in a Session or model request are not erased retroactively.",
			"governance.notice.drafted": "This memory is in the Harness conversation composer and has not been sent.",
			"governance.notice.extracted": "Review is complete. Every new item remains in the candidate queue.",
			"governance.notice.automationEnabled": "This Session may now review new conversations automatically while idle.",
			"governance.notice.automationDisabled": "Automatic review is off; an in-flight request may still finish.",
			"governance.audit.title": "Recall this turn",
			"governance.audit.empty": "No memory recall has occurred yet.",
			"governance.audit.sent": "{count} confirmed memories entered model context this turn.",
			"governance.audit.local": "{count} memories matched locally but were not sent to the model.",
			"governance.extraction.title": "Conversation review",
			"governance.extraction.empty": "No model-assisted review has been requested.",
			"governance.extraction.running": "Reading the complete eligible messages for this review.",
			"governance.extraction.committing": "Encrypting candidates; {count} identified.",
			"governance.extraction.completed": "The latest review produced {count} candidates.",
			"governance.extraction.failed": "The latest review did not complete; existing memory is unchanged.",
			"governance.extraction.run": "Review this conversation",
			"governance.extraction.trigger.manual": "Started manually",
			"governance.extraction.trigger.automatic": "Started automatically",
			"governance.automation.title": "Review new memories while idle",
			"governance.automation.subtitle": "This is a separate authorization for this Session. It only covers new normally completed turns after you enable it and runs at true Agent idle.",
			"governance.automation.enabled": "Enabled",
			"governance.automation.disabled": "Keep off",
			"governance.automation.interval": "Eligible new turns between reviews",
			"governance.automation.interval.1": "Review every 1 turn",
			"governance.automation.interval.3": "Review every 3 turns",
			"governance.automation.interval.5": "Review every 5 turns",
			"governance.automation.status": "Latest status",
			"governance.automation.unavailable": "Authorization is temporarily unavailable",
			"governance.automation.outcome.never": "No automatic review yet",
			"governance.automation.outcome.running": "Reviewing now",
			"governance.automation.outcome.completed": "Latest review completed",
			"governance.automation.outcome.failed": "Latest review did not finish; waiting for new turns",
			"governance.automation.disclosure.model": "Each review makes one extra call to the configured model. Its conversation portion contains only newly eligible user messages and may include confirmed normal-sensitivity memories for relationship comparison.",
			"governance.automation.disclosure.candidates": "Model output remains recall-disabled candidate material until you explicitly confirm it.",
			"governance.automation.disclosure.safety": "High-risk turns handled locally by the safety capability are excluded from automatic review.",
			"governance.propose.title": "Write a candidate yourself",
			"governance.propose.subtitle": "Keep it as a candidate first, then separately decide whether it belongs in long-term memory.",
			"governance.propose.hint": "Saving leaves recall off; your confirmation is still required.",
			"governance.propose.save": "Add for review",
			"governance.kind": "Memory kind",
			"governance.kind.fact": "Fact",
			"governance.kind.preference": "Preference",
			"governance.kind.value": "Value",
			"governance.kind.support-preference": "Support preference",
			"governance.kind.decision": "Decision",
			"governance.kind.emotion": "Emotional experience",
			"governance.kind.episode": "Life episode",
			"governance.sensitivity": "Sensitivity",
			"governance.sensitivity.normal": "Normal",
			"governance.sensitivity.high": "High · local only",
			"governance.content": "Statement to retain",
			"governance.content.placeholder": "For example: I prefer to feel heard before we work on solutions.",
			"governance.reason": "How it may help later",
			"governance.reason.placeholder": "Name the concrete reason for retaining it",
			"governance.scope": "Situation where it applies (optional)",
			"governance.scope.placeholder": "For example: during high work stress",
			"governance.scope.label": "Scope: ",
			"governance.queue.title": "Needs your decision",
			"governance.queue.subtitle": "A model may suggest candidates and relationships; it cannot decide which statement represents you.",
			"governance.queue.empty": "There are no candidates awaiting confirmation. New candidates stop here first.",
			"governance.relationship.duplicate": "Possible duplicate",
			"governance.relationship.contradiction": "Conflicting expression",
			"governance.relationship.refinement": "Possibly a more precise refinement",
			"governance.relationship.existing": "Existing active memory",
			"governance.relationship.incoming": "Incoming candidate",
			"governance.relationship.missing": "The compared memory no longer exists.",
			"governance.relationship.keepExisting": "Keep existing",
			"governance.relationship.keepBoth": "Keep both with scope",
			"governance.relationship.replace": "Update with new wording",
			"governance.review.open": "Review candidate",
			"governance.review.close": "Close review",
			"governance.recall": "Future recall",
			"governance.recall.never": "Never recall automatically",
			"governance.recall.relevant": "Recall when relevant",
			"governance.recall.always": "Include every time",
			"governance.temporary": "Temporary days (optional)",
			"governance.temporary.placeholder": "Blank means long term",
			"governance.reject": "Do not retain",
			"governance.confirm": "Confirm with this boundary",
			"governance.library.title": "Long-term memory you confirmed",
			"governance.library.subtitle": "Every item can be revised, audited, or removed from the encrypted library. Copies already sent in a Session or model request follow deployment retention policy.",
			"governance.library.empty": "There is no confirmed memory yet. Candidates arrive here only after your decision.",
			"governance.continue": "Place in conversation composer",
			"governance.draft.template": "I want to verify and continue discussing this memory I confirmed:\n\n> {content}\n\nPlease treat it as background I can correct, not as a permanent definition of me.",
			"governance.history.open": "View revision history",
			"governance.history.close": "Close revision history",
			"governance.history.empty": "This memory has no earlier version.",
			"governance.edit.open": "Revise content and boundary",
			"governance.edit.close": "Cancel revision",
			"governance.edit.save": "Save new version",
			"governance.delete": "Delete memory",
			"governance.delete.confirm": "Click again: remove from library",
			"governance.archive.title": "Rejected, replaced, or expired records · {count}",
			"governance.status.candidate": "Candidate",
			"governance.status.confirmed": "Confirmed",
			"governance.status.temporary": "Temporary",
			"governance.status.rejected": "Rejected",
			"governance.status.superseded": "Replaced",
			"governance.status.expired": "Expired",
			"governance.expires": "until {date}",
			"governance.sources": "Source evidence · {count}",
			"governance.revision.confirmed": "Version before confirmation",
			"governance.revision.updated": "Version before revision",
			"governance.revision.rejected": "Version before rejection",
			"governance.revision.superseded": "Version before replacement",
			"governance.revision.replaced": "Version before accepting new wording",
			"life.eyebrow": "MIND GARDEN · LIFE REVIEW",
			"life.title": "Connect what happened into a path you can revisit",
			"life.subtitle": "Period reviews cite verified garden records. Inspect the material first, then write, save, or archive your own account.",
			"life.instrument.label": "Time corridor showing the truthful number of period reviews",
			"life.instrument.reviews": " real reviews",
			"life.metric.reviews": "Versions formed",
			"life.metric.saved": "Versions you saved",
			"life.metric.range": "Current review scale",
			"life.continue": "Place in conversation composer",
			"life.draft.template": "I want to continue from this life review covering {start} to {end}:\n\n> {content}\n\nPlease use my current situation to help me see what still holds and what has changed.",
			"life.notice.drafted": "This review is in the Harness conversation composer and has not been sent.",
			"photo.eyebrow": "MIND GARDEN · LIGHT ARCHIVE",
			"photo.title": "Let scattered moments meet again",
			"photo.subtitle": "The Harness attachment store verifies and keeps image bytes; story copy, particle settings, and references stay encrypted in your garden.",
			"photo.upload": "Keep photos",
			"photo.uploading": "Keeping photos…",
			"photo.uploadHint": "PNG, JPEG, WebP, and GIF are accepted within this deployment’s byte and pixel limits.",
			"photo.upload.optimized": "This photo exceeded the deployment limits and was kept as a high-quality WebP; its story and particle effects remain fully available.",
			"photo.empty.title": "There are no frames here yet",
			"photo.empty.body": "Choose a local photo and it becomes a private story that survives a cold restart.",
			"photo.empty.action": "Keep the first photo",
			"photo.loading": "Opening the light archive…",
			"photo.error": "Photo stories are unavailable. Please try again.",
			"photo.error.load": "The verified original could not be read; the story and particle settings are unchanged.",
			"photo.error.upload": "This photo was not admitted. Check the image format or try again later.",
			"photo.error.upload.size": "The photo still exceeds this deployment’s byte limit after optimization. Compress it and try again.",
			"photo.error.upload.dimension": "The photo dimensions or pixel count exceed the current limit. Animated GIFs are never flattened silently; resize this one first.",
			"photo.error.upload.format": "This file could not be decoded. Choose a valid PNG, JPEG, WebP, or GIF image.",
			"photo.error.upload.browser": "This browser could not optimize the photo. Update it, or export the image as WebP/JPEG and try again.",
			"photo.error.upload.unavailable": "Photo storage is temporarily unavailable. No file was written; try again later.",
			"photo.error.save": "The story copy and particle settings were not saved. Review them and try again.",
			"photo.error.observe": "This observation did not complete; the original, story, and particle settings are unchanged.",
			"photo.error.observe.model": "The vision model did not complete this observation. No partial result was saved; try again later.",
			"photo.error.observe.output": "The observation did not pass the format and safety checks, so it was not saved. You can observe again.",
			"photo.error.observe.route": "The current vision route cannot read this image. Check the model configuration in Harness.",
			"photo.error.dialogue": "This message did not receive a complete response and was not added to the story. Try again later.",
			"photo.error.delete": "The photo story was not deleted; its original reference and private record remain.",
			"photo.retry": "Load again",
			"photo.classic": "Classic cards",
			"photo.dynamic": "Dynamic gallery",
			"photo.albumView": "Photo-story album view",
			"photo.count": "{count} unfinished frames are kept here",
			"photo.date": "Kept on {date}",
			"photo.open": "Enter this photo story",
			"photo.back": "Back to the light archive",
			"photo.panel.controls": "Photo-story workbench",
			"photo.panel.dialogue": "AI dialogue",
			"photo.panel.edit": "Particle controls",
			"photo.toolbar.original": "Original",
			"photo.toolbar.recompose": "Reset",
			"photo.toolbar.dialogue": "Chat",
			"photo.toolbar.particles": "Tune",
			"photo.preview": "View original",
			"photo.recompose": "Recompose this frame",
			"photo.previewDialog": "Original photo-story preview",
			"photo.previewClose": "Close original preview",
			"photo.scene": "Rotatable 3D photo-particle scene",
			"photo.sceneLoading": "Rebuilding high-resolution particles…",
			"photo.sceneFallback": "Particle rendering is unavailable, so the verified image is shown.",
			"photo.sceneCount": "{count} particles · Drag to rotate · Wheel to zoom",
			"photo.storyTitle": "Name this frame",
			"photo.storyNote": "The story I want to keep",
			"photo.storyPlaceholder": "Keep the time, people, or off-camera sounds only you know. This space will not invent anything beyond the photograph.",
			"photo.particleTitle": "Light particles",
			"photo.particle.soft": "Soft paper",
			"photo.particle.dust": "Memory dust",
			"photo.particle.fluid": "Fluid echo",
			"photo.particle.nebula": "Deep nebula",
			"photo.pointSize": "Particle size",
			"photo.depth": "Depth strength",
			"photo.interaction": "Touch force",
			"photo.motion": "Breathing motion",
			"photo.save": "Save this frame",
			"photo.saving": "Saving…",
			"photo.saved": "Story copy and particle settings are encrypted and saved.",
			"photo.delete": "Let it go",
			"photo.deleteConfirm": "Press again to remove this story",
			"photo.deleteHint": "The story reference disappears immediately; immutable bytes follow deployment retention policy.",
			"photo.pagePrevious": "Previous page",
			"photo.pageNext": "Next page",
			"photo.page": "Page {current} / {total}",
			"photo.dynamicHint": "Use arrow keys or controls to change frame · Click to enter",
			"photo.carouselControls": "Dynamic gallery controls",
			"photo.carouselPrevious": "Previous frame",
			"photo.carouselNext": "Next frame",
			"photo.carouselPause": "Pause automatic rotation",
			"photo.carouselPlay": "Resume automatic rotation",
			"photo.carouselPosition": "{current} / {total} · {title}",
			"photo.sceneReducedMotion": "The verified image is shown to honor reduced-motion preferences.",
			"photo.dialogue.eyebrow": "PHOTO COMPANION · YOU BEGIN",
			"photo.dialogue.title": "Let this frame speak slowly",
			"photo.dialogue.boundary": "Observation comes from the configured vision model, not a factual authority. The image is sent once only after your click; later turns use frozen, unconfirmed grounding.",
			"photo.observe.title": "Choose whether the model may see this photo",
			"photo.observe.disclosure": "Clicking sends the verified image to this deployment’s configured vision model. The model can be wrong, and its description never becomes your memory automatically.",
			"photo.observe.action": "Observe this photo",
			"photo.observe.pending": "Looking gently…",
			"photo.observe.unconfirmed": "Model observation · not confirmed by you",
			"photo.observe.visible": "Elements the model considers visible",
			"photo.observe.uncertain": "Details it is unsure about",
			"photo.dialogue.me": "Me",
			"photo.dialogue.companion": "Photo companion",
			"photo.dialogue.suggestions": "Continue this photo story",
			"photo.dialogue.input": "Add context, correct the observation, or say what it brings back",
			"photo.dialogue.placeholder": "For example: the most important person here was actually outside the frame…",
			"photo.dialogue.send": "Continue this story",
			"photo.dialogue.pending": "Responding…",
			"concern.eyebrow": "MIND GARDEN · HEART BASKET",
			"concern.title": "Set a concern down without solving it immediately",
			"concern.subtitle": "Concerns never enter a conversation automatically. Schedule a reminder, complete one, or explicitly turn it into a journal.",
			"concern.input": "What I want to set down",
			"concern.placeholder": "One sentence is enough. This space does not ask you to have an answer yet.",
			"concern.reminder": "Look again on (optional)",
			"concern.retrieval": "If converted to a journal, allow it to be cited in conversations I authorize",
			"concern.add": "Place in the basket",
			"concern.compose.eyebrow": "SET IT DOWN",
			"concern.compose.title": "Choosing not to solve it now is still a choice",
			"concern.compose.body": "One sentence is enough. You can decide on a reminder or journal later.",
			"concern.collection.title": "What remains here",
			"concern.collection.emptyCount": "Empty is welcome",
			"concern.collection.count": "{count} items",
			"concern.edit": "Edit",
			"concern.edit.save": "Save changes",
			"concern.edit.cancel": "Cancel",
			"concern.conversation": "Place in conversation composer",
			"concern.conversation.draft": "I want to bring this concern back into the conversation:\n\n> {content}",
			"concern.convert": "Turn into journal",
			"concern.complete": "This is complete",
			"concern.loading": "Opening the heart basket…",
			"concern.empty": "The heart basket is empty. There is no need to write merely to fill it.",
			"concern.error": "The heart basket did not respond. Please try again.",
			"concern.status.active": "Still on my mind",
			"concern.status.completed": "Complete",
			"concern.status.converted": "Converted to journal",
			"concern.reminds": "Look again on {date}",
			"concern.notice.created": "This concern has been set down safely.",
			"concern.notice.updated": "The concern and reminder have been updated.",
			"concern.notice.drafted": "Placed in the conversation composer below; you can still edit it before sending.",
			"concern.notice.completed": "It has left the active list while its history remains.",
			"concern.notice.converted": "This concern is now a journal you can continue writing.",
			"calendar.eyebrow": "MIND GARDEN · TIME MAP",
			"calendar.title": "See what actually left a trace in time",
			"calendar.subtitle": "The calendar only projects verified garden records: check-ins, journals, concerns, principles, reality experiments, and open questions.",
			"calendar.month": "Month",
			"calendar.today": "Back to today",
			"calendar.previous": "Previous month",
			"calendar.next": "Next month",
			"calendar.filter": "Filter garden records",
			"calendar.filter.all": "All",
			"calendar.filter.checkin": "Mood",
			"calendar.filter.journal": "Journal",
			"calendar.filter.concern": "Concerns",
			"calendar.filter.principle": "Principles",
			"calendar.filter.experiment": "Experiments",
			"calendar.filter.question": "Questions",
			"calendar.showDay": "Day records",
			"calendar.showTrend": "Change trail",
			"calendar.grid": "Monthly garden calendar",
			"calendar.dayDetail": "Garden records for the selected day",
			"calendar.dayLabel": "{date}, {count} records",
			"calendar.eventCount": "{count} records",
			"calendar.loading": "Reading this day…",
			"calendar.emptyDay": "No garden records were kept on this day.",
			"calendar.error": "The calendar is unavailable. Please try again.",
			"calendar.weekday.sun": "SUN",
			"calendar.weekday.mon": "MON",
			"calendar.weekday.tue": "TUE",
			"calendar.weekday.wed": "WED",
			"calendar.weekday.thu": "THU",
			"calendar.weekday.fri": "FRI",
			"calendar.weekday.sat": "SAT",
			"calendar.event.checkin": "Mood check-in",
			"calendar.event.journal": "Journal",
			"calendar.event.concern": "Concern reminder",
			"calendar.event.principle": "Life principle",
			"calendar.event.experimentReview": "Reality experiment review",
			"calendar.event.experimentObservation": "Reality experiment observation",
			"calendar.event.question": "Open question",
			"calendar.event.noWords": "No emotion words were kept",
			"calendar.conversation": "Bring this record into conversation",
			"calendar.conversation.draft": "I want to continue from this {date} garden record.\n\n{kind}: {detail}",
			"calendar.notice.drafted": "This record is now in the conversation composer below.",
			"calendar.trend": "30-day mood trail",
			"calendar.trendChart": "Mood changes across the last 30 days",
			"calendar.trendEmpty": "The trail appears after check-ins on at least three distinct dates.",
			"growth.eyebrow": "MIND GARDEN · LIFE THEMES",
			"growth.title": "Turn a question into one small step you can observe in real life",
			"growth.subtitle": "There are no success or failure scores here. You decide each experiment, observation, and revision, and every observation remains intact.",
			"growth.private": "Encrypted locally · records reality without grading discipline",
			"growth.instrument.label": "Reality observatory showing truthful counts for active and observed experiments",
			"growth.instrument.active": " active in real life",
			"growth.instrument.observed": " with real observations",
			"growth.composer.label": "Create a reversible experiment",
			"growth.composer.title": "Make the next step small",
			"growth.composer.subtitle": "Write an action you can take, stop, and revise after reality answers.",
			"growth.composer.boundary": "This is not a task list and produces no completion score. What actually happened matters more than “success.”",
			"growth.journal.label": "REALITY FIELD NOTES",
			"growth.journal.title": "Experiments that actually happened",
			"growth.journal.subtitle": "Each observation remains intact. Status helps you find it; it does not decide what it means.",
			"growth.input.title": "What I want to try",
			"growth.input.reviewDate": "Review on (optional)",
			"growth.input.hypothesis": "My hypothesis (optional)",
			"growth.input.hypothesisPlaceholder": "For example: Naming a boundary first may not damage the relationship.",
			"growth.input.action": "One small action I can actually take",
			"growth.input.actionPlaceholder": "Write a concrete action, not a grand outcome.",
			"growth.create": "Create reality experiment",
			"growth.loading": "Reading life themes…",
			"growth.empty": "There are no reality experiments yet. Wait for a small question that truly deserves observation.",
			"growth.error": "Life themes did not respond. Please try again.",
			"growth.status.proposed": "Ready to begin",
			"growth.status.trying": "Trying",
			"growth.status.observed": "Observed",
			"growth.status.revised": "Revised",
			"growth.status.stopped": "Stopped",
			"growth.hypothesis": "Hypothesis",
			"growth.action": "Action",
			"growth.reviewDate": "Next review",
			"growth.observations": "Experiment observations",
			"growth.observation": "What actually happened this time?",
			"growth.start": "Begin trying",
			"growth.observe": "Record observation",
			"growth.record": "Keep this observation",
			"growth.stop": "Stop experiment",
			"growth.continue": "Place in conversation composer",
			"growth.draft.template": "I want to revisit this reality experiment:\n\n> {title}\n\nThe action I intended was: {action}\n\nPlease help me separate what actually happened, how I felt, and what still deserves observation.",
			"growth.notice.created": "The experiment exists and still waits for you to begin it explicitly.",
			"growth.notice.started": "The experiment has begun. Live first, then return to observe.",
			"growth.notice.observed": "This observation is preserved intact and has not been scored.",
			"growth.notice.stopped": "The experiment has stopped while its observations remain.",
			"growth.notice.drafted": "This experiment is in the Harness conversation composer and has not been sent.",
			"philosophy.eyebrow": "MIND GARDEN · MY PHILOSOPHY",
			"philosophy.title": "Let principles grow from experience and remain open to challenge",
			"philosophy.subtitle": "Post-conversation contemplation, AI-proposed principles, and beliefs you actually adopt stay strictly separate. Only your explicit confirmation changes them.",
			"philosophy.private": "Encrypted locally · thinking may change without becoming a verdict",
			"philosophy.instrument.label": "Philosophy specimen instrument showing confirmed contemplations, pending proposals, and active principles",
			"philosophy.instrument.notes": " confirmed notes",
			"philosophy.instrument.proposals": " pending proposals",
			"philosophy.instrument.principles": " living principles",
			"philosophy.loading": "Opening your philosophy notes…",
			"philosophy.error": "Philosophy notes are unavailable. Please try again.",
			"philosophy.contemplations": "Post-conversation contemplation",
			"philosophy.contemplationsHint": "Drafts never enter model context",
			"philosophy.emptyContemplations": "There are no contemplation notes yet.",
			"philosophy.add": "Leave a note",
			"philosophy.addLabel": "Write the understanding you genuinely want to keep from this conversation",
			"philosophy.saveDraft": "Save as draft",
			"philosophy.edit": "Edit",
			"philosophy.editLabel": "Revise this contemplation draft",
			"philosophy.save": "Save",
			"philosophy.confirm": "Confirm as mine",
			"philosophy.delete": "Delete draft",
			"philosophy.deleteQuestion": "This draft will be permanently deleted.",
			"philosophy.deleteConfirm": "Delete permanently",
			"philosophy.cancel": "Cancel",
			"philosophy.extract": "Distill one principle",
			"philosophy.extractLabel": "In your own words, write one life principle this contemplation may support",
			"philosophy.propose": "Create proposal",
			"philosophy.formation.manual": "Distilled by you from a confirmed contemplation",
			"philosophy.contemplation.draft": "Needs your confirmation",
			"philosophy.contemplation.confirmed": "Confirmed",
			"philosophy.proposals": "Principle proposals",
			"philosophy.proposalsHint": "Proposals are inert by default",
			"philosophy.emptyProposals": "There are no principle proposals waiting for your judgment.",
			"philosophy.proposal.proposed": "Needs a decision",
			"philosophy.proposal.accepted": "Accepted",
			"philosophy.proposal.rejected": "Rejected",
			"philosophy.accept": "This is my principle",
			"philosophy.reject": "Do not adopt",
			"philosophy.principles": "My life principles",
			"philosophy.principlesHint": "Every revision preserves history",
			"philosophy.emptyPrinciples": "There are no life principles you have confirmed yet.",
			"philosophy.principle.trying": "Trying",
			"philosophy.principle.adopted": "Adopted",
			"philosophy.principle.questioning": "Questioning again",
			"philosophy.principle.retired": "Retired",
			"philosophy.statusFor": "Change the status of principle “{principle}”",
			"philosophy.formation": "Formation context",
			"philosophy.quote": "What I said then",
			"philosophy.counterexample": "Counterexample and boundary",
			"philosophy.appliesTo": "Where this principle applies",
			"philosophy.versionCount": "{count} versions preserved",
			"philosophy.continue": "Place in conversation composer",
			"philosophy.draft.contemplation": "I want to return to this contemplation I confirmed:\n\n> {content}\n\nPlease consider what has happened recently and help me see what still holds and what needs revision.",
			"philosophy.draft.principle": "I want to test this life principle again:\n\n> {expression}\n\nKnown boundary or counterexample: {counterexample}\n\nDo not defend it for me; help me see whether reality still supports it.",
			"philosophy.notice.accepted": "You confirmed this principle, and it is now active.",
			"philosophy.notice.rejected": "This proposal was rejected and will not become your principle.",
			"philosophy.notice.revised": "The principle status changed and its previous version remains intact.",
			"philosophy.notice.drafted": "This thought is in the Harness conversation composer and has not been sent.",
			"philosophy.notice.created": "The contemplation draft is saved and remains tentative until you confirm it.",
			"philosophy.notice.updated": "The contemplation draft was revised.",
			"philosophy.notice.confirmed": "You confirmed this contemplation.",
			"philosophy.notice.deleted": "The contemplation draft was deleted.",
			"philosophy.notice.proposed": "The principle proposal exists and remains inert until you adopt it.",
			"philosophy.sourceUnavailable": "Finish a Serenity conversation before leaving a contemplation here. Nothing was saved.",
			"star.sidebar.eyebrow": "{count} motes waiting to be seen",
			"star.sidebar.title": "Enter my constellation",
			"star.sidebar.detail": "{count} reviews already shine",
			"star.sidebar.ritual.eyebrow": "A constellation waiting for light",
			"star.sidebar.ritual.title": "Light my constellation",
			"star.sidebar.ritual.detail": "Complete the first stargazing ritual",
			"star.sidebar.new-dust.eyebrow": "{count} motes await your judgment",
			"star.sidebar.new-dust.title": "Your constellation has changed",
			"star.sidebar.new-dust.detail": "Meet this new glimmer",
			"star.sidebar.continue.eyebrow": "A symbolic card remains open",
			"star.sidebar.continue.title": "Continue observing",
			"star.sidebar.continue.detail": "Follow the last conversation",
			"star.sidebar.draw.eyebrow": "{count} stars have been kept",
			"star.sidebar.draw.title": "Draw a symbolic card",
			"star.sidebar.draw.detail": "Invite a new angle into this moment",
			"star.eyebrow": "MIND GARDEN · CONSTELLATION",
			"star.title": "Let questions and reviews illuminate one another",
			"star.subtitle": "This constellation comes directly from records you kept in the garden. Its center is not a conclusion, but a self that can still change.",
			"star.back": "Back to today",
			"star.metrics": "Constellation overview",
			"star.metric.questions": "open motes",
			"star.metric.reviews": "review stars",
			"star.metric.traits": "self-authored motes",
			"star.metric.links": "visible orbits",
			"star.codex": "Constellation node codex",
			"star.center": "Me, right now",
			"star.center.serenity": "Approaching myself through serenity",
			"star.center.clarity": "Looking for the pattern through clarity",
			"star.question.since": "Still being observed since {date}",
			"star.review.unnamed": "Untitled review",
			"star.review.detail": "{start} — {end} · {count} sources",
			"star.kind.center": "Constellation center",
			"star.kind.trait": "My mote",
			"star.kind.question": "Open mote",
			"star.kind.review": "Review star",
			"star.selected.hint": "Choose a node below. Drag the constellation to rotate and use the wheel to zoom.",
			"star.controls": "Drag to rotate · Wheel to zoom · Keyboard through the node codex",
			"star.fallback": "The 3D constellation is unavailable. Every node remains accessible in the list.",
			"star.trait.detail": "You wrote this word during the ritual. It is not a model judgment about you.",
			"star.trait.retire": "Let this mote leave",
			"star.profile.open": "Constellation profile",
			"star.profile.title": "My constellation profile",
			"star.profile.subtitle": "This profile is encrypted. Only garden records you explicitly authorize may be used by future observations.",
			"star.profile.close": "Close profile",
			"star.profile.intent": "What I want to observe",
			"star.profile.tone": "Star Observer voice",
			"star.profile.tone.gentle": "Gentle companion",
			"star.profile.tone.direct": "Direct and clear",
			"star.profile.tone.mystic": "Poetic and contemplative",
			"star.profile.permissions": "Data future observations may use",
			"star.profile.permission.reflections": "Daily writing",
			"star.profile.permission.memories": "Confirmed memories",
			"star.profile.permission.questions": "Open questions",
			"star.profile.permission.reviews": "Period reviews",
			"star.profile.motion": "Reduce constellation motion",
			"star.profile.save": "Save profile",
			"star.profile.saved": "The constellation profile is saved.",
			"star.profile.error": "The profile could not be saved. Reload it and try again.",
			"star.loading": "Unlocking your constellation…",
			"star.error": "The constellation did not respond. Please try again.",
			"star.observer.summon": "Draw a reflection card",
			"star.observer.summon.hint": "Continue the conversation with the Star Observer",
			"star.observer.awaiting": "One card is waiting for your decision",
			"star.observer.eyebrow": "EVIDENCE-BOUND · CALIBRATED BY YOU",
			"star.observer.title": "Star Observer",
			"star.observer.close": "Close the Star Observer",
			"star.observer.disclosure": "Choose an observation lens. The Observer can read only encrypted material you explicitly allowed in the constellation profile, and every conclusion remains a correctable hypothesis.",
			"star.observer.deck": "Where to begin this time",
			"star.observer.deck.current-self": "Current self",
			"star.observer.deck.unfolded-self": "Unfolded self",
			"star.observer.deck.inner-debate": "Inner debate",
			"star.observer.question": "A question I want to bring (optional)",
			"star.observer.question.placeholder": "For example: Why do I keep checking again just before I begin?",
			"star.observer.permission.title": "Boundary for this call",
			"star.observer.permission.body": "This request always includes the constellation name, MBTI entry mode and result, self-words, long-term observation question, and selected tone; {count}/4 historical source types are additionally allowed. The exact request, evidence snapshot, and raw model response are encrypted together for audit.",
			"star.observer.draw": "Let starlight offer a testable hypothesis",
			"star.observer.drawing": "The Observer is moving through the motes…",
			"star.observer.error": "This observation did not complete. No substitute conclusion was created and your constellation did not change.",
			"star.observer.kind.imagination": "Imagination card",
			"star.observer.confidence.grounded": "More grounded",
			"star.observer.confidence.tentative": "Tentative observation",
			"star.observer.analysis.situation": "What is happening",
			"star.observer.analysis.core": "Key unknown",
			"star.observer.analysis.tradeoff": "Costs on both sides",
			"star.observer.analysis.guidance": "One reversible step",
			"star.observer.evidence": "View original excerpts cited by this card",
			"star.observer.imagination": "This card cites no personal history. It is only an imaginative lens and cannot create a trait automatically.",
			"star.observer.calibrate": "Does this resemble you? Your judgment outranks the model.",
			"star.observer.correction.placeholder": "Write a more accurate version. A rejection must say what is wrong.",
			"star.observer.resonates": "Resonates",
			"star.observer.uncertain": "Keep observing",
			"star.observer.rejects": "Not me",
			"star.observer.dissolve": "Let it dissolve",
			"star.observer.save": "Keep this star card",
			"star.observer.saved.title": "Saved star cards",
			"star.observer.saved.new": "Draw a new card",
			"star.observer.saved.state": "This card is saved. Its conversation and revisions remain encrypted with it.",
			"star.observer.dialogue.title": "Continue with the Star Observer",
			"star.observer.dialogue.ready": "Ready for a follow-up",
			"star.observer.dialogue.thinking": "Sorting this through",
			"star.observer.dialogue.thinking.detail": "Separating facts, interpretations, and costs on both sides…",
			"star.observer.dialogue.welcome": "Begin with one concrete event",
			"star.observer.dialogue.welcome.body": "Add an experience, challenge the reading, or ask the Observer to make the tradeoffs explicit.",
			"star.observer.dialogue.me": "Me",
			"star.observer.dialogue.observer": "Observer",
			"star.observer.dialogue.suggestions": "Suggested follow-ups",
			"star.observer.dialogue.input": "My addition or correction",
			"star.observer.dialogue.placeholder": "Continue, or point directly to what is inaccurate…",
			"star.observer.dialogue.send": "Send to the Star Observer",
			"star.observer.dialogue.error": "This exchange did not complete. Neither the conversation nor the card was silently rewritten.",
			"star.observer.revision.eyebrow": "The Observer suggests revising this card",
			"star.observer.revision.disclosure": "This is only a proposal. The card changes only if you accept it, and any earlier calibration returns to pending.",
			"star.observer.revision.apply": "Accept this revision",
			"star.observer.revision.applying": "Applying…",
			"star.observer.boundary": "Star cards are not fortune-telling, diagnosis, or personality verdicts. Symbols are metaphors; an unconfirmed inference never becomes fact.",
			"star.ritual.eyebrow": "FIRST OBSERVATION · LEAVE AND RESUME ANY TIME",
			"star.ritual.title": "Begin with a stargazing ritual that belongs to you",
			"star.ritual.subtitle": "These are self-descriptions, not test answers. Progress and profile data are encrypted, and no model labels you here.",
			"star.ritual.progress": "Ritual progress",
			"star.ritual.step.identity": "Coordinates",
			"star.ritual.step.self": "Self-description",
			"star.ritual.step.consent": "Agreement",
			"star.ritual.identity.title": "What name should appear at the center of your constellation?",
			"star.ritual.identity.body": "Birthday, time, and city are optional. Unknown or private information can remain blank.",
			"star.ritual.displayName": "Name in the constellation",
			"star.ritual.displayName.placeholder": "For example: Lin, or me right now",
			"star.ritual.birthYear": "Birth year (optional)",
			"star.ritual.birthMonth": "Month",
			"star.ritual.birthDay": "Day",
			"star.ritual.timeKnown": "I choose to provide a birth time",
			"star.ritual.birthTime": "Birth time",
			"star.ritual.cityKnown": "I choose to provide a birth city",
			"star.ritual.birthCity": "Birth city",
			"star.ritual.self.title": "How you describe yourself matters more than one type",
			"star.ritual.self.body": "MBTI is an optional doorway. Enter a known type, answer six lived scenes, or leave the question open for future shared observation.",
			"star.ritual.mbti.known": "I know my type",
			"star.ritual.mbti.scenes": "Begin with lived scenes",
			"star.ritual.mbti.observe": "Do not define me yet",
			"star.ritual.mbti.type": "MBTI type",
			"star.ritual.scene.1": "When I enter a gathering of strangers, I usually…",
			"star.ritual.scene.1a": "Approach people and gain energy through interaction",
			"star.ritual.scene.1b": "Observe first and settle into a few connections",
			"star.ritual.scene.2": "With a completely open weekend, I tend to…",
			"star.ritual.scene.2a": "Choose plans early and give time a clear shape",
			"star.ritual.scene.2b": "Keep it flexible and follow how I feel then",
			"star.ritual.scene.3": "When a friend shares a difficulty, I notice first…",
			"star.ritual.scene.3a": "Their feelings and what would help them feel understood",
			"star.ritual.scene.3b": "The problem structure and what would actually work",
			"star.ritual.scene.4": "When learning something new, I am drawn more to…",
			"star.ritual.scene.4a": "Possibilities, metaphors, and unseen connections",
			"star.ritual.scene.4b": "Examples, details, and verifiable steps",
			"star.ritual.scene.5": "After a full day, I would rather…",
			"star.ritual.scene.5a": "Be alone briefly and let my attention return",
			"star.ritual.scene.5b": "Talk with someone and let energy move again",
			"star.ritual.scene.6": "For an important decision, I ultimately trust…",
			"star.ritual.scene.6a": "Consistent logic and reasons that survive questions",
			"star.ritual.scene.6b": "Inner values and the effect on people involved",
			"star.ritual.consent.title": "Finally, you decide how this sky may observe you",
			"star.ritual.consent.body": "Write one to five words that are yours and a question you want to observe over time. Every data authorization starts off.",
			"star.ritual.words": "Words for myself (comma separated, up to 5)",
			"star.ritual.words.placeholder": "curious, slow to warm, willing to revise",
			"star.ritual.intent": "In this constellation, I want to observe…",
			"star.ritual.intent.placeholder": "For example: When do I feel most like myself?",
			"star.ritual.permissions": "Allow future constellation observations to cite",
			"star.ritual.private": "Unchecked data will not enter constellation observations. You can change this later in your profile.",
			"star.ritual.back": "Previous",
			"star.ritual.next": "Save and continue",
			"star.ritual.complete": "Illuminate my constellation",
			"star.ritual.saving": "Saving…",
			"star.ritual.exit": "Back to today",
			"star.ritual.error": "This step was not saved. Check the fields and try again.",
			"review.eyebrow": "GARDEN · REVIEW",
			"review.title": "Connect what happened into a path you can revisit",
			"review.subtitle": "This view cites records you chose to keep. It does not interpret your life for you, and nothing is saved without your confirmation.",
			"review.private": "Encrypted · Your choice",
			"review.overview": "Garden overview",
			"review.metric.openQuestions": "Questions still growing",
			"review.metric.savedReviews": "Saved reviews",
			"review.metric.posture": "Dialogue posture",
			"review.loading": "Opening the garden gently…",
			"review.retry": "Load again",
			"review.inactive.title": "Begin with one conversation that feels safe",
			"review.inactive.body": "Choose a dialogue posture and the garden can hold open questions and period reviews for you.",
			"review.error.generic": "The garden did not respond. Please try again.",
			"review.error.conflict": "This changed elsewhere, so the newest version has been loaded for you.",
			"review.error.materialChanged": "The cited records changed. Review the material again before saving.",
			"review.error.noMaterial": "There are no garden records to cite in this period yet.",
			"question.title": "Open questions",
			"question.subtitle": "No need to answer now. Keep what deserves more real-world observation.",
			"question.input.label": "Which question would you like to keep living with?",
			"question.input.placeholder": "For example: What boundary lets me care for others without losing myself?",
			"question.date": "Date kept",
			"question.add": "Keep in the garden",
			"question.empty.title": "There is still a little open ground here",
			"question.empty.body": "When a question should not be rushed, you can plant it here.",
			"question.status.open": "Observing",
			"question.status.resolved": "Answered",
			"question.status.dismissed": "Set aside",
			"question.resolve": "Reality answered it",
			"question.dismiss": "Set aside for now",
			"question.reopen": "Open again",
			"question.notice.created": "The question is now resting in your garden.",
			"question.notice.closed": "This change is now part of its growth trail.",
			"question.notice.reopened": "The question is back in view.",
			"review.period.title": "Period review",
			"review.period.subtitle": "See the source material first, then write the connections and judgments that are yours alone.",
			"review.period.type": "Review scale",
			"review.period.week": "This week",
			"review.period.month": "This month",
			"review.period.year": "This year",
			"review.period.start": "Start date",
			"review.period.end": "End date",
			"review.period.load": "View material for this period",
			"review.material.title": "Garden fragments you can cite",
			"review.material.count": "{count} verified sources",
			"review.material.empty.title": "This period is quiet",
			"review.material.empty.body": "There is not enough material for a review. Try another range.",
			"review.category.events": "What happened",
			"review.category.ongoing": "Still ongoing",
			"review.category.changes": "What changed",
			"review.category.experiments": "Reality experiments",
			"review.category.focus": "Worth noticing",
			"review.editor.label": "How do I understand this period?",
			"review.editor.placeholder": "It does not have to be complete. Begin with a change, a recurring feeling, or something you want to protect next.",
			"review.editor.hint": "Save a draft first, then confirm it belongs in the garden.",
			"review.create": "Create review draft",
			"review.empty.title": "Reviews will take shape here",
			"review.empty.body": "Choose a period and see which threads are already there to connect.",
			"review.status.proposed": "Needs confirmation",
			"review.status.saved": "Saved",
			"review.status.archived": "Archived",
			"review.sources": "Cites {count} garden sources",
			"review.stale": "Some sources changed later; this review still preserves what you saw then.",
			"review.save": "Keep in the garden",
			"review.archive": "Archive",
			"review.notice.materialReady": "The material is ready. Read it once before writing.",
			"review.notice.created": "The review draft is ready; you still decide whether to save it.",
			"review.notice.saved": "The review is now kept in your garden.",
			"review.notice.archived": "The review has been archived.",
			"error.notBlank": "Mind Garden can only begin in a new session before the conversation starts.",
			"error.generic": "The garden setting could not be saved. Please try again."
		};
		//#endregion
		//#region lib/types/client/index.js
		/** Mind Garden browser plugin: dock registration, locale, projection, and Remote actions. */
		const NS = "mindGarden";
		/** Required browser services. */
		const inject = [
			"slots",
			"remote",
			"remote.mindGarden",
			"remote.mindGardenMedia",
			"remote.mindGardenMemory",
			"remote.mindGardenReflection",
			"remote.mindGardenStarMap",
			"remote.mindGardenPortability",
			"locale"
		];
		async function settle(request) {
			try {
				const transport = await request;
				if (!transport.ok) return {
					ok: false,
					code: transport.error.code
				};
				return transport.value.ok ? {
					ok: true,
					value: transport.value.value
				} : {
					ok: false,
					code: transport.value.error.code,
					...transport.value.error.reason === void 0 ? {} : { reason: transport.value.error.reason }
				};
			} catch {
				return {
					ok: false,
					code: "unavailable"
				};
			}
		}
		function dockActions(ctx, sessionId) {
			return {
				onActivate: async (mode) => await ctx.remote.mindGarden.activate(sessionId, {
					mode,
					supportIntent: "auto",
					privacy: "durable",
					modelDisclosureAccepted: true,
					disclosureLocale: ctx.locale.getLocale().active === "en" ? "en" : "zh-CN"
				}),
				onSelectMode: async (expectedRevision, mode) => await ctx.remote.mindGarden.selectMode(sessionId, expectedRevision, mode),
				onSelectSupportIntent: async (expectedRevision, supportIntent) => await ctx.remote.mindGarden.selectSupportIntent(sessionId, expectedRevision, supportIntent)
			};
		}
		function bytesToBase64(data) {
			let binary = "";
			const stride = 32768;
			for (let offset = 0; offset < data.length; offset += stride) binary += String.fromCharCode(...data.subarray(offset, offset + stride));
			return btoa(binary);
		}
		const PHOTO_MEDIA_TYPES = new Set([
			"image/png",
			"image/jpeg",
			"image/webp",
			"image/gif"
		]);
		function viewActions(ctx, sessionId) {
			return {
				...dockActions(ctx, sessionId),
				onExportBackup: async (passphrase) => await settle(ctx.remote.mindGardenPortability.exportBackup(sessionId, { passphrase })),
				onInspectBackup: async (file, passphrase) => {
					let data;
					try {
						data = bytesToBase64(new Uint8Array(await file.arrayBuffer()));
					} catch {
						return {
							ok: false,
							code: "file-unavailable"
						};
					}
					try {
						return await settle(ctx.remote.mindGardenPortability.inspectBackup(sessionId, {
							data,
							passphrase
						}));
					} catch {
						return {
							ok: false,
							code: "unavailable"
						};
					}
				},
				onRestoreBackup: async (file, passphrase) => {
					let data;
					try {
						data = bytesToBase64(new Uint8Array(await file.arrayBuffer()));
					} catch {
						return {
							ok: false,
							code: "file-unavailable"
						};
					}
					try {
						return await settle(ctx.remote.mindGardenPortability.restoreBackup(sessionId, {
							data,
							passphrase,
							confirm: true
						}));
					} catch {
						return {
							ok: false,
							code: "unavailable"
						};
					}
				},
				onRotateVaultKey: async () => await settle(ctx.remote.mindGardenPortability.rotateDataKey(sessionId, { confirm: true })),
				onStarMapOverview: async () => await settle(ctx.remote.mindGardenStarMap.overview(sessionId)),
				onSaveStarRitual: async (request) => await settle(ctx.remote.mindGardenStarMap.saveRitualProgress(sessionId, request)),
				onCompleteStarRitual: async (request) => await settle(ctx.remote.mindGardenStarMap.completeRitual(sessionId, request)),
				onUpdateStarProfile: async (request) => await settle(ctx.remote.mindGardenStarMap.updateProfile(sessionId, request)),
				onUpdateStarTrait: async (request) => await settle(ctx.remote.mindGardenStarMap.updateTrait(sessionId, request)),
				onDrawStarCard: async (request) => await settle(ctx.remote.mindGardenStarMap.drawCard(sessionId, request)),
				onCalibrateStarCard: async (request) => await settle(ctx.remote.mindGardenStarMap.calibrateCard(sessionId, request)),
				onFinalizeStarCard: async (request) => await settle(ctx.remote.mindGardenStarMap.finalizeCard(sessionId, request)),
				onContinueStarCard: async (request) => await settle(ctx.remote.mindGardenStarMap.continueCard(sessionId, request)),
				onApplyStarCardRevision: async (request) => await settle(ctx.remote.mindGardenStarMap.applyCardRevision(sessionId, request)),
				onListMemories: async () => {
					const result = await settle(ctx.remote.mindGardenMemory.list(sessionId));
					return result.ok ? {
						ok: true,
						value: result.value.items
					} : result;
				},
				onProposeMemory: async (request) => await settle(ctx.remote.mindGardenMemory.propose(sessionId, request)),
				onConfirmMemory: async (item, request) => await settle(ctx.remote.mindGardenMemory.confirm(sessionId, {
					id: item.id,
					ifVersion: item.version,
					...request
				})),
				onUpdateMemory: async (item, request) => await settle(ctx.remote.mindGardenMemory.update(sessionId, {
					id: item.id,
					ifVersion: item.version,
					...request
				})),
				onRejectMemory: async (item) => await settle(ctx.remote.mindGardenMemory.reject(sessionId, {
					id: item.id,
					ifVersion: item.version
				})),
				onResolveMemoryRelationship: async (item, request) => await settle(ctx.remote.mindGardenMemory.resolveRelationship(sessionId, {
					id: item.id,
					ifVersion: item.version,
					...request
				})),
				onListMemoryRevisions: async (item) => {
					const result = await settle(ctx.remote.mindGardenMemory.listRevisions(sessionId, { id: item.id }));
					return result.ok ? {
						ok: true,
						value: result.value.revisions
					} : result;
				},
				onExtractMemories: async () => await settle(ctx.remote.mindGardenMemory.extract(sessionId, {})),
				onLatestMemoryExtraction: async () => {
					const result = await settle(ctx.remote.mindGardenMemory.latestExtraction(sessionId));
					return result.ok ? {
						ok: true,
						value: result.value.run
					} : result;
				},
				onMemoryAutomationPolicy: async () => await settle(ctx.remote.mindGardenMemory.automationPolicy(sessionId)),
				onSetMemoryAutomationPolicy: async (policy, enabled, minimumCompletedTurns) => await settle(ctx.remote.mindGardenMemory.setAutomationPolicy(sessionId, {
					enabled,
					minimumCompletedTurns,
					ifVersion: policy.version
				})),
				onDeleteMemory: async (item) => {
					const result = await settle(ctx.remote.mindGardenMemory.delete(sessionId, {
						id: item.id,
						ifVersion: item.version
					}));
					return result.ok ? {
						ok: true,
						value: true
					} : result;
				},
				onLatestMemoryAudit: async () => {
					const result = await settle(ctx.remote.mindGardenMemory.latestAudit(sessionId));
					return result.ok ? {
						ok: true,
						value: result.value.audit
					} : result;
				},
				onListPhotoStories: async () => {
					const result = await settle(ctx.remote.mindGardenMedia.listPhotoStories(sessionId, { limit: 60 }));
					return result.ok ? {
						ok: true,
						value: result.value.stories
					} : result;
				},
				onCreatePhotoStory: async (file, stamp) => {
					if (!PHOTO_MEDIA_TYPES.has(file.type)) return {
						ok: false,
						code: "attachment-rejected",
						reason: "UNSUPPORTED_MEDIA_TYPE"
					};
					const data = bytesToBase64(new Uint8Array(await file.arrayBuffer()));
					return await settle(ctx.remote.mindGardenMedia.createPhotoStory(sessionId, {
						data,
						mediaType: file.type,
						name: file.name,
						title: file.name.replace(/\.[^.]+$/, ""),
						stamp
					}));
				},
				onReadPhotoStory: async (story) => {
					const result = await settle(ctx.remote.mindGardenMedia.readPhotoStory(sessionId, { id: story.id }));
					return result.ok ? {
						ok: true,
						value: `data:${result.value.attachment.mediaType};base64,${result.value.data}`
					} : result;
				},
				onObservePhotoStory: async (story) => await settle(ctx.remote.mindGardenMedia.observePhotoStory(sessionId, {
					id: story.id,
					ifVersion: story.version,
					locale: ctx.locale.getLocale().active === "en" ? "en" : "zh-CN"
				})),
				onContinuePhotoStory: async (story, content, quickReplyKind = "") => await settle(ctx.remote.mindGardenMedia.continuePhotoStory(sessionId, {
					id: story.id,
					ifVersion: story.version,
					content,
					quickReplyKind,
					locale: ctx.locale.getLocale().active === "en" ? "en" : "zh-CN"
				})),
				onUpdatePhotoStory: async (story, title, note, particleConfig) => await settle(ctx.remote.mindGardenMedia.updatePhotoStory(sessionId, {
					id: story.id,
					ifVersion: story.version,
					title,
					note,
					particleConfig
				})),
				onDeletePhotoStory: async (story) => {
					const result = await settle(ctx.remote.mindGardenMedia.deletePhotoStory(sessionId, {
						id: story.id,
						ifVersion: story.version
					}));
					return result.ok ? {
						ok: true,
						value: true
					} : result;
				},
				onListConcerns: async () => {
					const result = await settle(ctx.remote.mindGardenReflection.listConcerns(sessionId, { includeClosed: true }));
					return result.ok ? {
						ok: true,
						value: result.value.concerns
					} : result;
				},
				onCreateConcern: async (content, stamp, reminder) => await settle(ctx.remote.mindGardenReflection.createConcern(sessionId, {
					content,
					stamp,
					...reminder === void 0 ? {} : { reminder }
				})),
				onUpdateConcern: async (concern, content, observedLocalDate, reminder) => await settle(ctx.remote.mindGardenReflection.updateConcern(sessionId, {
					id: concern.id,
					ifVersion: concern.version,
					content,
					observedLocalDate,
					...reminder === void 0 ? {} : { reminder }
				})),
				onCompleteConcern: async (concern) => await settle(ctx.remote.mindGardenReflection.completeConcern(sessionId, {
					id: concern.id,
					ifVersion: concern.version
				})),
				onConvertConcern: async (concern, stamp, allowRetrieval) => await settle(ctx.remote.mindGardenReflection.convertConcern(sessionId, {
					id: concern.id,
					ifVersion: concern.version,
					stamp,
					allowRetrieval
				})),
				onCalendarMonth: async (month) => await settle(ctx.remote.mindGardenReflection.month(sessionId, { month })),
				onCalendarDay: async (localDate) => await settle(ctx.remote.mindGardenReflection.day(sessionId, { localDate })),
				onCreateCheckin: async (mood, energy, emotionWords, stamp) => await settle(ctx.remote.mindGardenReflection.createCheckin(sessionId, {
					stamp,
					mood,
					energy,
					emotionWords,
					phase: "standalone"
				})),
				onCreateJournal: async (title, body, allowRetrieval, stamp) => await settle(ctx.remote.mindGardenReflection.createJournal(sessionId, {
					stamp,
					body,
					allowRetrieval,
					...title === "" ? {} : { title }
				})),
				onUpdateJournal: async (journal, title, body, allowRetrieval) => await settle(ctx.remote.mindGardenReflection.updateJournal(sessionId, {
					id: journal.id,
					ifVersion: journal.version,
					body,
					allowRetrieval,
					...title === "" ? {} : { title }
				})),
				onDeleteJournal: async (journal) => {
					const result = await settle(ctx.remote.mindGardenReflection.deleteJournal(sessionId, {
						id: journal.id,
						ifVersion: journal.version
					}));
					return result.ok ? {
						ok: true,
						value: true
					} : result;
				},
				onReflectionTrend: async (days, endDate) => await settle(ctx.remote.mindGardenReflection.trend(sessionId, {
					days,
					endDate
				})),
				onListExperiments: async () => {
					const result = await settle(ctx.remote.mindGardenReflection.listExperiments(sessionId, { includeStopped: true }));
					return result.ok ? {
						ok: true,
						value: result.value.experiments
					} : result;
				},
				onCreateExperiment: async (title, hypothesis, action, stamp, reviewStamp) => await settle(ctx.remote.mindGardenReflection.createExperiment(sessionId, {
					title,
					action,
					stamp,
					...hypothesis === "" ? {} : { hypothesis },
					...reviewStamp === void 0 ? {} : { reviewStamp }
				})),
				onStartExperiment: async (experiment, observedLocalDate) => await settle(ctx.remote.mindGardenReflection.startExperiment(sessionId, {
					id: experiment.id,
					ifVersion: experiment.version,
					observedLocalDate
				})),
				onObserveExperiment: async (experiment, observation, stamp) => await settle(ctx.remote.mindGardenReflection.observeExperiment(sessionId, {
					id: experiment.id,
					ifVersion: experiment.version,
					stamp,
					observation
				})),
				onStopExperiment: async (experiment) => await settle(ctx.remote.mindGardenReflection.stopExperiment(sessionId, {
					id: experiment.id,
					ifVersion: experiment.version
				})),
				onListContemplations: async () => {
					const result = await settle(ctx.remote.mindGardenReflection.listContemplations(sessionId, {}));
					return result.ok ? {
						ok: true,
						value: result.value.contemplations
					} : result;
				},
				onCreateContemplation: async (markdown) => await settle(ctx.remote.mindGardenReflection.createContemplation(sessionId, { markdown })),
				onUpdateContemplation: async (contemplation, markdown) => await settle(ctx.remote.mindGardenReflection.updateContemplation(sessionId, {
					id: contemplation.id,
					ifVersion: contemplation.version,
					markdown
				})),
				onConfirmContemplation: async (contemplation) => await settle(ctx.remote.mindGardenReflection.confirmContemplation(sessionId, {
					id: contemplation.id,
					ifVersion: contemplation.version
				})),
				onDeleteContemplation: async (contemplation) => {
					const result = await settle(ctx.remote.mindGardenReflection.deleteContemplation(sessionId, {
						id: contemplation.id,
						ifVersion: contemplation.version
					}));
					return result.ok ? {
						ok: true,
						value: true
					} : result;
				},
				onProposePrinciple: async (contemplation, content) => await settle(ctx.remote.mindGardenReflection.proposePrinciple(sessionId, {
					sourceContemplationId: contemplation.id,
					content
				})),
				onListPrincipleProposals: async () => {
					const result = await settle(ctx.remote.mindGardenReflection.listPrincipleProposals(sessionId, { includeClosed: true }));
					return result.ok ? {
						ok: true,
						value: result.value.proposals
					} : result;
				},
				onListPrinciples: async () => {
					const result = await settle(ctx.remote.mindGardenReflection.listPrinciples(sessionId, { includeRetired: true }));
					return result.ok ? {
						ok: true,
						value: result.value.principles
					} : result;
				},
				onAcceptPrincipleProposal: async (proposal, stamp) => await settle(ctx.remote.mindGardenReflection.acceptPrincipleProposal(sessionId, {
					id: proposal.id,
					ifVersion: proposal.version,
					stamp
				})),
				onRejectPrincipleProposal: async (proposal) => await settle(ctx.remote.mindGardenReflection.rejectPrincipleProposal(sessionId, {
					id: proposal.id,
					ifVersion: proposal.version
				})),
				onRevisePrincipleStatus: async (principle, status, stamp) => await settle(ctx.remote.mindGardenReflection.revisePrinciple(sessionId, {
					id: principle.id,
					ifVersion: principle.version,
					stamp,
					content: {
						...principle.current,
						status
					}
				})),
				onListOpenQuestions: async () => {
					const result = await settle(ctx.remote.mindGardenReflection.listOpenQuestions(sessionId, { includeClosed: true }));
					return result.ok ? {
						ok: true,
						value: result.value.questions
					} : result;
				},
				onCreateOpenQuestion: async (question, stamp) => await settle(ctx.remote.mindGardenReflection.createOpenQuestion(sessionId, {
					question,
					stamp
				})),
				onUpdateOpenQuestion: async (question, nextQuestion, status, stamp) => await settle(ctx.remote.mindGardenReflection.updateOpenQuestion(sessionId, {
					id: question.id,
					ifVersion: question.version,
					question: nextQuestion,
					status,
					stamp
				})),
				onPeriodReviewMaterial: async (request) => await settle(ctx.remote.mindGardenReflection.periodReviewMaterial(sessionId, request)),
				onCreatePeriodReview: async (material, content) => await settle(ctx.remote.mindGardenReflection.createPeriodReview(sessionId, {
					periodType: material.periodType,
					startStamp: material.startStamp,
					endStamp: material.endStamp,
					materialHash: material.materialHash,
					sourceIds: material.sources.map((source) => source.id),
					content
				})),
				onListPeriodReviews: async () => {
					const result = await settle(ctx.remote.mindGardenReflection.listPeriodReviews(sessionId, { includeArchived: true }));
					return result.ok ? {
						ok: true,
						value: result.value.reviews
					} : result;
				},
				onUpdatePeriodReview: async (review, content, status) => await settle(ctx.remote.mindGardenReflection.updatePeriodReview(sessionId, {
					id: review.id,
					ifVersion: review.version,
					content,
					status
				}))
			};
		}
		/** Register the session-scoped Mind Garden dock. */
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "ui-mind-garden: dictionaries");
			const t = ctx.locale.bind(NS);
			ctx.slots.inject("conversation.input.left", () => ctx.slots.register({
				name: "conversation.input.left",
				id: "mind-garden",
				order: 5,
				locale: NS,
				inject: (sessionId) => dockActions(ctx, sessionId)
			}, MindGardenDock));
			ctx.slots.inject("conversation.view", () => ctx.slots.register({
				name: "conversation.view",
				id: "mind-garden",
				order: 20,
				locale: NS,
				label: () => t("view.garden"),
				store: createMindGardenViewStore(),
				inject: (sessionId) => viewActions(ctx, sessionId)
			}, MindGardenView));
		}
		//#endregion
		exports.MindGardenDock = MindGardenDock;
		exports.MindGardenPanel = MindGardenPanel;
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map