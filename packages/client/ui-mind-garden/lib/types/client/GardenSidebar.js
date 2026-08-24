import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { IconPanelLeftOutline16, IconSettingsOutline16 } from '@deepseek-ai/dsh-client-ui-primitives';
import { CalendarIcon, ConcernsIcon, GardenMarkIcon, GrowthIcon, LifeReviewIcon, MemoryIcon, PhilosophyIcon, PhotoStoryIcon, PrivateIcon, StarMapIcon, TodayIcon, } from "./GardenIcons.js";
import css from './GardenSidebar.module.css';
const NAV_REGIONS = [
    {
        id: 'now',
        label: 'space.region.now',
        icon: TodayIcon,
        items: [{ id: 'today', label: 'space.today', icon: TodayIcon }],
    },
    {
        id: 'inner-life',
        label: 'space.region.innerLife',
        icon: ConcernsIcon,
        items: [
            { id: 'concerns', label: 'space.concerns', icon: ConcernsIcon },
            { id: 'growth', label: 'space.growth', icon: GrowthIcon },
        ],
    },
    {
        id: 'time',
        label: 'space.region.time',
        icon: CalendarIcon,
        items: [
            { id: 'calendar', label: 'space.calendar', icon: CalendarIcon },
            { id: 'life', label: 'space.life', icon: LifeReviewIcon },
        ],
    },
    {
        id: 'keepsakes',
        label: 'space.region.keepsakes',
        icon: PhotoStoryIcon,
        items: [
            { id: 'photo-story', label: 'space.photoStory', icon: PhotoStoryIcon },
            { id: 'memory', label: 'space.memory', icon: MemoryIcon },
        ],
    },
    {
        id: 'star-garden',
        label: 'space.region.starGarden',
        icon: StarMapIcon,
        items: [
            { id: 'star-map', label: 'space.starMap', icon: StarMapIcon },
            { id: 'philosophy', label: 'space.philosophy', icon: PhilosophyIcon },
        ],
    },
];
/** Render the five garden regions and the exact spaces inside the active region. */
export function GardenSidebar({ activeSpace, collapsed, starState, starCount, onSelect, onSettings, onToggle, t, }) {
    const activeRegion = NAV_REGIONS.find(region => region.items.some(item => item.id === activeSpace)) ?? NAV_REGIONS[0];
    return (_jsxs("header", { className: css.sidebar, "data-compact": collapsed, "aria-label": t('space.navigation'), children: [_jsxs("div", { className: css.topbar, children: [_jsxs("span", { className: css.identity, "aria-label": t('space.title'), children: [_jsx(GardenMarkIcon, { size: 23 }), _jsx("strong", { children: t('space.title') })] }), _jsx("nav", { className: css.regionNavigation, "aria-label": t('space.regions'), children: NAV_REGIONS.map((region) => {
                            const RegionIcon = region.icon;
                            const active = region.id === activeRegion.id;
                            return (_jsxs("button", { type: "button", className: css.region, "data-active": active, "aria-pressed": active, onClick: () => { onSelect(region.items[0].id); }, children: [_jsx(RegionIcon, { size: 17 }), _jsx("span", { children: t(region.label) })] }, region.id));
                        }) }), _jsxs("div", { className: css.utilities, children: [_jsxs("button", { type: "button", className: css.constellationStatus, onClick: () => { onSelect('star-map'); }, "aria-label": `${t('star.sidebar.title')} · ${t(`star.sidebar.${starState}.title`)}`, title: t(`star.sidebar.${starState}.detail`), children: [_jsx(StarMapIcon, { size: 17 }), _jsx("span", { children: starCount > 0 ? starCount : t(`star.sidebar.${starState}.title`) })] }), _jsx("button", { type: "button", className: css.utility, onClick: onToggle, "aria-label": collapsed ? t('space.expand') : t('space.collapse'), title: collapsed ? t('space.expand') : t('space.collapse'), children: _jsx(IconPanelLeftOutline16, { size: 16 }) }), _jsxs("button", { type: "button", className: css.settings, onClick: (event) => { onSettings(event.currentTarget); }, "aria-label": t('garden.settings'), children: [_jsx(IconSettingsOutline16, { size: 16 }), _jsx("span", { children: t('garden.settings') }), _jsx(PrivateIcon, { size: 13 })] })] })] }), _jsxs("nav", { className: css.spaceNavigation, "aria-label": t(activeRegion.label), children: [_jsx("span", { className: css.regionContext, children: t(activeRegion.label) }), activeRegion.items.map((item) => {
                        const ItemIcon = item.icon;
                        return (_jsxs("button", { type: "button", className: css.space, "data-active": activeSpace === item.id, "aria-current": activeSpace === item.id ? 'page' : undefined, onClick: () => { onSelect(item.id); }, children: [_jsx(ItemIcon, { size: 16 }), _jsx("span", { children: t(item.label) })] }, item.id));
                    }), _jsxs("span", { className: css.privateNote, children: [_jsx(PrivateIcon, { size: 13 }), t('space.private')] })] })] }));
}
//# sourceMappingURL=GardenSidebar.js.map