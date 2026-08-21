import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { IconPanelLeftOutline16, IconSettingsOutline16 } from '@deepseek-ai/dsh-client-ui-primitives';
import { CalendarIcon, ConcernsIcon, GardenMarkIcon, GrowthIcon, LifeReviewIcon, MemoryIcon, PhilosophyIcon, PhotoStoryIcon, PrivateIcon, StarMapIcon, TodayIcon, } from "./GardenIcons.js";
import css from './GardenSidebar.module.css';
const NAV_GROUPS = [
    {
        label: 'space.group.now',
        items: [
            { id: 'today', label: 'space.today', icon: TodayIcon },
            { id: 'concerns', label: 'space.concerns', icon: ConcernsIcon },
            { id: 'calendar', label: 'space.calendar', icon: CalendarIcon },
            { id: 'photo-story', label: 'space.photoStory', icon: PhotoStoryIcon },
        ],
    },
    {
        label: 'space.group.clarity',
        items: [
            { id: 'memory', label: 'space.memory', icon: MemoryIcon },
            { id: 'growth', label: 'space.growth', icon: GrowthIcon },
            { id: 'star-map', label: 'space.starMap', icon: StarMapIcon },
        ],
    },
    {
        label: 'space.group.longTerm',
        items: [
            { id: 'life', label: 'space.life', icon: LifeReviewIcon },
            { id: 'philosophy', label: 'space.philosophy', icon: PhilosophyIcon },
        ],
    },
];
/** Render the grouped garden rail and its live constellation entry. */
export function GardenSidebar({ activeSpace, collapsed, starState, starCount, onSelect, onSettings, onToggle, t, }) {
    return (_jsxs("aside", { className: css.sidebar, "data-collapsed": collapsed, "aria-label": t('space.navigation'), children: [_jsxs("div", { className: css.header, children: [_jsxs("span", { className: css.identity, children: [_jsx(GardenMarkIcon, { size: 22 }), !collapsed && _jsx("strong", { children: t('space.title') })] }), _jsx("button", { type: "button", className: css.toggle, onClick: onToggle, "aria-label": collapsed ? t('space.expand') : t('space.collapse'), title: collapsed ? t('space.expand') : t('space.collapse'), children: _jsx(IconPanelLeftOutline16, { size: 16 }) })] }), _jsx("nav", { className: css.navigation, children: NAV_GROUPS.map(group => (_jsxs("section", { className: css.group, "aria-label": t(group.label), children: [!collapsed && _jsx("span", { className: css.groupLabel, children: t(group.label) }), group.items.map((item) => {
                            const Icon = item.icon;
                            return (_jsxs("button", { type: "button", className: css.item, "data-active": activeSpace === item.id, "aria-current": activeSpace === item.id ? 'page' : undefined, "aria-label": collapsed ? t(item.label) : undefined, title: t(item.label), onClick: () => { onSelect(item.id); }, children: [_jsx(Icon, { size: 18, className: css.glyph }), !collapsed && _jsx("span", { children: t(item.label) })] }, item.id));
                        })] }, group.label))) }), !collapsed && (_jsxs("button", { type: "button", className: css.constellationStatus, onClick: () => { onSelect('star-map'); }, "aria-label": t('star.sidebar.title'), children: [_jsx(StarMapIcon, { size: 18 }), _jsxs("span", { children: [_jsx("small", { children: t(`star.sidebar.${starState}.eyebrow`).replace('{count}', String(starCount)) }), _jsx("strong", { children: t(`star.sidebar.${starState}.title`) }), _jsx("em", { children: t(`star.sidebar.${starState}.detail`) })] })] })), _jsxs("button", { type: "button", className: css.footer, onClick: (event) => { onSettings(event.currentTarget); }, "aria-label": t('garden.settings'), children: [_jsx(IconSettingsOutline16, { size: 15 }), !collapsed && _jsx("span", { children: t('garden.settings') }), !collapsed && _jsx(PrivateIcon, { size: 14, className: css.lock })] })] }));
}
//# sourceMappingURL=GardenSidebar.js.map