/** Mind Garden glyphs drawn with the same compact outline grammar as Harness icons. */

import type { ReactNode } from 'react'

export interface GardenIconProps {
  readonly size?: number
  readonly className?: string | undefined
}

function IconFrame({ size = 18, className, children }: GardenIconProps & { readonly children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.45"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export const GardenMarkIcon = (props: GardenIconProps) => (
  <IconFrame {...props}>
    <rect x="2.5" y="2.5" width="15" height="15" rx="3" />
    <path d="M10 16V8.6M10 11.2c-2.9-.2-4.5-1.7-4.7-4.4 2.9-.2 4.5 1.3 4.7 4.4ZM10 9.5c.2-2.7 1.8-4.1 4.6-4 .1 2.6-1.5 4-4.6 4Z" />
  </IconFrame>
)

export const TodayIcon = (props: GardenIconProps) => (
  <IconFrame {...props}>
    <circle cx="10" cy="10" r="3.1" />
    <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.35 4.35l1.4 1.4M14.25 14.25l1.4 1.4M15.65 4.35l-1.4 1.4M5.75 14.25l-1.4 1.4" />
  </IconFrame>
)

export const ConcernsIcon = (props: GardenIconProps) => (
  <IconFrame {...props}>
    <path d="M10 16.7 4.2 11.3C1.2 8.5 3 3.5 6.7 3.5c1.5 0 2.6.8 3.3 2 .7-1.2 1.8-2 3.3-2 3.7 0 5.5 5 2.5 7.8L10 16.7Z" />
    <path d="M7.5 9.2h5" />
  </IconFrame>
)

export const CalendarIcon = (props: GardenIconProps) => (
  <IconFrame {...props}>
    <rect x="3" y="4.3" width="14" height="12.7" rx="2.2" />
    <path d="M6.2 2.5v3.3M13.8 2.5v3.3M3 8h14M6.4 11h2M11.6 11h2M6.4 14h2" />
  </IconFrame>
)

export const PhotoStoryIcon = (props: GardenIconProps) => (
  <IconFrame {...props}>
    <rect x="2.8" y="3.2" width="14.4" height="13.6" rx="2.2" />
    <circle cx="7" cy="7.4" r="1.3" />
    <path d="m4.5 14 3.1-3.2 2.2 2.1 2.1-2.4 3.6 3.5" />
  </IconFrame>
)

export const MemoryIcon = (props: GardenIconProps) => (
  <IconFrame {...props}>
    <path d="M4.2 5.2c0-1.4 2.6-2.5 5.8-2.5s5.8 1.1 5.8 2.5-2.6 2.5-5.8 2.5-5.8-1.1-5.8-2.5Z" />
    <path d="M4.2 5.2v4.8c0 1.4 2.6 2.5 5.8 2.5s5.8-1.1 5.8-2.5V5.2M4.2 10v4.8c0 1.4 2.6 2.5 5.8 2.5s5.8-1.1 5.8-2.5V10" />
  </IconFrame>
)

export const GrowthIcon = (props: GardenIconProps) => (
  <IconFrame {...props}>
    <path d="M10 17V9.3M10 11.2c-3.7-.1-5.9-2-6.2-5.5 3.7-.2 5.9 1.7 6.2 5.5ZM10 8.7c.3-3.5 2.5-5.3 6.2-5.1.2 3.4-2 5.1-6.2 5.1Z" />
  </IconFrame>
)

export const StarMapIcon = (props: GardenIconProps) => (
  <IconFrame {...props}>
    <path d="m10 2.3 1.2 5.2L16.6 10l-5.4 2.5L10 17.7l-1.2-5.2L3.4 10l5.4-2.5L10 2.3Z" />
    <path d="M2.8 5.7h1.8M15.4 14.3h1.8" />
  </IconFrame>
)

export const LifeReviewIcon = (props: GardenIconProps) => (
  <IconFrame {...props}>
    <path d="M5 2.8h10M5 17.2h10M6 2.8c0 3 1.3 4.8 4 7.2-2.7 2.4-4 4.2-4 7.2M14 2.8c0 3-1.3 4.8-4 7.2 2.7 2.4 4 4.2 4 7.2" />
    <path d="M7.4 15.3h5.2" />
  </IconFrame>
)

export const PhilosophyIcon = (props: GardenIconProps) => (
  <IconFrame {...props}>
    <path d="M6.1 11.9A6 6 0 1 1 13.9 12c-1.1.8-1.5 1.6-1.6 2.3H7.7c-.1-.8-.5-1.6-1.6-2.4Z" />
    <path d="M7.8 17h4.4M8 7.7l1.5 1.5 2.8-3" />
  </IconFrame>
)

export const PrivateIcon = (props: GardenIconProps) => (
  <IconFrame {...props}>
    <rect x="4.2" y="8.5" width="11.6" height="8.7" rx="2" />
    <path d="M6.7 8.5V6.3a3.3 3.3 0 0 1 6.6 0v2.2M10 12v1.8" />
  </IconFrame>
)

export const CheckinIcon = (props: GardenIconProps) => (
  <IconFrame {...props}>
    <circle cx="10" cy="10" r="6.8" />
    <circle cx="10" cy="10" r="2.2" />
    <path d="M10 1.8v2M10 16.2v2M1.8 10h2M16.2 10h2" />
  </IconFrame>
)

export const JournalIcon = (props: GardenIconProps) => (
  <IconFrame {...props}>
    <path d="M4 3.2h8.2A2.8 2.8 0 0 1 15 6v10.8H6.8A2.8 2.8 0 0 1 4 14V3.2Z" />
    <path d="M4 13.8c0-1.5 1.2-2.7 2.8-2.7H15M7.2 6.5h4.6" />
  </IconFrame>
)
