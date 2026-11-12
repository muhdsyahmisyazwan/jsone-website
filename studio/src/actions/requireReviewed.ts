import type {DocumentActionComponent} from 'sanity'

const GATED_TYPES = new Set(['page', 'news', 'homePage'])

/**
 * Wrap Sanity's Publish action so page / news / homepage cannot publish
 * until `reviewed` is checked. Apply via sanity.config.ts `document.actions`.
 */
export function withRequireReviewed(
  actions: DocumentActionComponent[],
  schemaType: string,
): DocumentActionComponent[] {
  if (!GATED_TYPES.has(schemaType)) return actions

  return actions.map((originalAction) => {
    if (originalAction.action !== 'publish') return originalAction

    const GatedPublish: DocumentActionComponent = (props) => {
      const original = originalAction(props)
      if (!original) return null

      const draft = props.draft as {reviewed?: boolean} | null
      const published = props.published as {reviewed?: boolean} | null
      const reviewed = Boolean(draft?.reviewed ?? published?.reviewed)

      if (reviewed) return original

      return {
        ...original,
        disabled: true,
        label: 'Publish (mark Reviewed first)',
        title:
          'Check “Reviewed for publish” on the Publishing tab before publishing. Unreviewed content must not ship.',
      }
    }

    GatedPublish.action = 'publish'
    return GatedPublish
  })
}
