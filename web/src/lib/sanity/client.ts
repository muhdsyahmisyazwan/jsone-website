import {createClient, type SanityClient} from '@sanity/client'

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID as string | undefined
const dataset = (import.meta.env.PUBLIC_SANITY_DATASET as string | undefined) || 'production'
const token = import.meta.env.SANITY_API_READ_TOKEN as string | undefined
const apiVersion = '2025-01-01'

export const sanityConfigured = Boolean(projectId && projectId !== 'yourProjectId')

export const sanityClient: SanityClient | null = sanityConfigured
  ? createClient({
      projectId: projectId!,
      dataset,
      apiVersion,
      useCdn: true,
      token: token || undefined,
      perspective: token ? 'published' : 'published',
    })
  : null

/** Preview / draft client - used in Phase 4. */
export function getPreviewClient(previewToken?: string): SanityClient | null {
  if (!sanityConfigured || !projectId) return null
  const t = previewToken || token
  if (!t) return null
  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token: t,
    perspective: 'previewDrafts',
  })
}

export async function sanityFetch<T>(
  query: string,
  params: Record<string, unknown> = {},
  client: SanityClient | null = sanityClient,
): Promise<T | null> {
  if (!client) return null
  try {
    return await client.fetch<T>(query, params)
  } catch (error) {
    console.error('[sanity] fetch failed', error)
    return null
  }
}
