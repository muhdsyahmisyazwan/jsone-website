/**
 * Role-based access for Sanity Content Lake.
 *
 * Apply these via:
 * 1. Sanity Manage → Project → API → Roles (custom roles), OR
 * 2. sanity.config.ts `acl` / resource permissions when using Sanity Roles API.
 *
 * Intended roles:
 * - administrator - full access (schemas, content, project settings)
 * - editor - create/update content; cannot manage members or delete singletons carelessly
 *
 * Content rules enforced in Studio + front end:
 * - `reviewed` must be true (document-level) or locale `reviewed` flags (field-level)
 *   before content is rendered on the live site (Phase 3 queries).
 */

export const ROLE_ADMIN = 'administrator'
export const ROLE_EDITOR = 'editor'

/**
 * Permission grants expressed as documentation for project setup.
 * Sanity custom roles are configured in the Manage UI; keep this file as the
 * source of truth for what each role should be allowed to do.
 */
export const roleMatrix = {
  [ROLE_ADMIN]: {
    description: 'Full project and content access',
    content: ['create', 'read', 'update', 'delete', 'publish'] as const,
    project: ['manageMembers', 'manageApi', 'manageDatasets'] as const,
  },
  [ROLE_EDITOR]: {
    description: 'Create and edit content; publish reviewed documents',
    content: ['create', 'read', 'update', 'publish'] as const,
    /** Editors should not delete singletons or manage project settings */
    deny: ['delete:siteSettings', 'delete:navigation', 'delete:footer', 'delete:homePage', 'manageMembers'],
  },
} as const

/**
 * Initial value helper: new page/news docs start unreviewed.
 * (Already set via schema initialValue; kept here for query/docs reference.)
 */
export const unpublishedUntilReviewedFilter = `reviewed == true`
