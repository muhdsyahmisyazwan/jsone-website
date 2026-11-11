/** Rotating icon names for services / capability cards (no CMS icon field). */
export const SERVICE_ICON_NAMES = [
  'layers',
  'workflow',
  'support',
  'plug',
  'shield',
  'chart',
  'users',
  'spark',
] as const

export type ServiceIconName = (typeof SERVICE_ICON_NAMES)[number]

export function serviceIconName(index: number): ServiceIconName {
  return SERVICE_ICON_NAMES[index % SERVICE_ICON_NAMES.length]
}
