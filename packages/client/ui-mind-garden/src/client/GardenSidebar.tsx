/** Local navigation for the original Mind Garden spaces. */

import type { ComponentType } from 'react'
import { IconPanelLeftOutline16, IconSettingsOutline16 } from '@deepseek-ai/dsh-client-ui-primitives'
import type { MindGardenKey } from './locales.ts'
import type { MindGardenSpace } from './garden-store.ts'
import {
  CalendarIcon,
  ConcernsIcon,
  GardenMarkIcon,
  GrowthIcon,
  LifeReviewIcon,
  MemoryIcon,
  PhilosophyIcon,
  PhotoStoryIcon,
  PrivateIcon,
  StarMapIcon,
  TodayIcon,
  type GardenIconProps,
} from './GardenIcons.tsx'
import css from './GardenSidebar.module.css'

interface GardenNavItem {
  readonly id: MindGardenSpace
  readonly label: MindGardenKey
  readonly icon: ComponentType<GardenIconProps>
}

interface GardenNavGroup {
  readonly label: MindGardenKey
  readonly items: readonly GardenNavItem[]
}

const NAV_GROUPS: readonly GardenNavGroup[] = [
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
]

/** Props kept as plain values so the component remains independent from Client ctx. */
export interface GardenSidebarProps {
  readonly activeSpace: MindGardenSpace
  readonly collapsed: boolean
  readonly starState: 'ritual' | 'new-dust' | 'continue' | 'draw'
  readonly starCount: number
  readonly onSelect: (space: MindGardenSpace) => void
  readonly onSettings: (trigger: HTMLButtonElement) => void
  readonly onToggle: () => void
  readonly t: (key: MindGardenKey) => string
}

/** Render the grouped garden rail and its live constellation entry. */
export function GardenSidebar({
  activeSpace,
  collapsed,
  starState,
  starCount,
  onSelect,
  onSettings,
  onToggle,
  t,
}: GardenSidebarProps) {
  return (
    <aside className={css.sidebar} data-collapsed={collapsed} aria-label={t('space.navigation')}>
      <div className={css.header}>
        <span className={css.identity}>
          <GardenMarkIcon size={22} />
          {!collapsed && <strong>{t('space.title')}</strong>}
        </span>
        <button
          type="button"
          className={css.toggle}
          onClick={onToggle}
          aria-label={collapsed ? t('space.expand') : t('space.collapse')}
          title={collapsed ? t('space.expand') : t('space.collapse')}
        >
          <IconPanelLeftOutline16 size={16} />
        </button>
      </div>

      <nav className={css.navigation}>
        {NAV_GROUPS.map(group => (
          <section className={css.group} key={group.label} aria-label={t(group.label)}>
            {!collapsed && <span className={css.groupLabel}>{t(group.label)}</span>}
            {group.items.map((item) => {
              const Icon = item.icon
              return (
                <button
                  type="button"
                  className={css.item}
                  data-active={activeSpace === item.id}
                  key={item.id}
                  aria-current={activeSpace === item.id ? 'page' : undefined}
                  aria-label={collapsed ? t(item.label) : undefined}
                  title={t(item.label)}
                  onClick={() => { onSelect(item.id) }}
                >
                  <Icon size={18} className={css.glyph} />
                  {!collapsed && <span>{t(item.label)}</span>}
                </button>
              )
            })}
          </section>
        ))}
      </nav>

      {!collapsed && (
        <button type="button" className={css.constellationStatus} onClick={() => { onSelect('star-map') }} aria-label={t('star.sidebar.title')}>
          <StarMapIcon size={18} />
          <span>
            <small>{t(`star.sidebar.${starState}.eyebrow`).replace('{count}', String(starCount))}</small>
            <strong>{t(`star.sidebar.${starState}.title`)}</strong>
            <em>{t(`star.sidebar.${starState}.detail`)}</em>
          </span>
        </button>
      )}

      <button type="button" className={css.footer} onClick={(event) => { onSettings(event.currentTarget) }} aria-label={t('garden.settings')}>
        <IconSettingsOutline16 size={15} />
        {!collapsed && <span>{t('garden.settings')}</span>}
        {!collapsed && <PrivateIcon size={14} className={css.lock} />}
      </button>
    </aside>
  )
}
