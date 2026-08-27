/** Warm, two-level navigation for every Mind Garden destination. */

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

interface GardenNavRegion {
  readonly id: 'now' | 'inner-life' | 'time' | 'keepsakes' | 'star-garden'
  readonly label: MindGardenKey
  readonly icon: ComponentType<GardenIconProps>
  readonly items: readonly [GardenNavItem, ...GardenNavItem[]]
}

const NAV_REGIONS: readonly [GardenNavRegion, ...GardenNavRegion[]] = [
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

/** Render the five garden regions and the exact spaces inside the active region. */
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
  const activeRegion = NAV_REGIONS.find(region => region.items.some(item => item.id === activeSpace)) ?? NAV_REGIONS[0]

  return (
    <header className={css.sidebar} data-compact={collapsed} aria-label={t('space.navigation')}>
      <div className={css.topbar}>
        <span className={css.identity} aria-label={t('space.title')}>
          <GardenMarkIcon size={23} />
          <strong>{t('space.title')}</strong>
        </span>

        <nav className={css.regionNavigation} aria-label={t('space.regions')}>
          {NAV_REGIONS.map((region) => {
            const RegionIcon = region.icon
            const active = region.id === activeRegion.id
            return (
              <button
                type="button"
                className={css.region}
                data-active={active}
                key={region.id}
                aria-pressed={active}
                onClick={() => { onSelect(region.items[0].id) }}
              >
                <RegionIcon size={17} />
                <span>{t(region.label)}</span>
              </button>
            )
          })}
        </nav>

        <div className={css.utilities}>
          <button
            type="button"
            className={css.constellationStatus}
            onClick={() => { onSelect('star-map') }}
            aria-label={`${t('star.sidebar.title')} · ${t(`star.sidebar.${starState}.title`)}`}
            title={t(`star.sidebar.${starState}.detail`)}
          >
            <StarMapIcon size={17} />
            <span>{starCount > 0 ? starCount : t(`star.sidebar.${starState}.title`)}</span>
          </button>
          <button
            type="button"
            className={css.utility}
            onClick={onToggle}
            aria-label={collapsed ? t('space.expand') : t('space.collapse')}
            title={collapsed ? t('space.expand') : t('space.collapse')}
          >
            <IconPanelLeftOutline16 size={16} />
          </button>
          <button
            type="button"
            className={css.settings}
            onClick={(event) => { onSettings(event.currentTarget) }}
            aria-label={t('garden.settings')}
          >
            <IconSettingsOutline16 size={16} />
            <span>{t('garden.settings')}</span>
            <PrivateIcon size={13} />
          </button>
        </div>
      </div>

      <nav className={css.spaceNavigation} aria-label={t(activeRegion.label)}>
        <span className={css.regionContext}>{t(activeRegion.label)}</span>
        {activeRegion.items.map((item) => {
          const ItemIcon = item.icon
          return (
            <button
              type="button"
              className={css.space}
              data-active={activeSpace === item.id}
              key={item.id}
              aria-current={activeSpace === item.id ? 'page' : undefined}
              onClick={() => { onSelect(item.id) }}
            >
              <ItemIcon size={16} />
              <span>{t(item.label)}</span>
            </button>
          )
        })}
        <span className={css.privateNote}>
          <PrivateIcon size={13} />
          {t('space.private')}
        </span>
      </nav>
    </header>
  )
}
