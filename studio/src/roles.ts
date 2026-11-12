/**
 * Role-based access for Sanity Content Lake.
 *
 * ## How to apply (Sanity Manage)
 *
 * 1. Open https://www.sanity.io/manage → your project → **API** → **Roles**
 * 2. Create custom roles matching the matrix below (or map existing viewers/editors).
 * 3. Invite users with **Administrator** or **Editor** only — avoid granting project
 *    owner rights to content editors.
 *
 * This file is the source of truth for intended permissions. Sanity’s hosted ACL UI
 * must be configured manually; Studio also gates **Publish** on `reviewed`
 * (`src/actions/requireReviewed.ts`).
 *
 * Intended roles:
 * - administrator — full access (schemas, content, project settings)
 * - editor — create/update/publish content; cannot manage members or delete singletons
 *
 * Content rules:
 * - Document-level `reviewed` (page, news, homePage) must be true before Publish.
 * - Field-level locale `reviewed` flags gate EN/MS/ZH strings on the live site.
 * - Homepage: `coalesce(reviewed, true)` in GROQ — set `reviewed` explicitly after seeding.
 */

export const ROLE_ADMIN = 'administrator'
export const ROLE_EDITOR = 'editor'

/**
 * Permission grants expressed as documentation for project setup.
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
    deny: [
      'delete:siteSettings',
      'delete:navigation',
      'delete:footer',
      'delete:homePage',
      'manageMembers',
    ],
  },
} as const

export const unpublishedUntilReviewedFilter = `reviewed == true`

export const rolesSetupChecklist = [
  'Create Administrator + Editor custom roles in Sanity Manage',
  'Editors: grant create/update/publish on documents; deny delete on singletons',
  'Administrators: full content + project member/API access',
  'Confirm Publish is disabled in Studio until Reviewed is checked',
  'Use Site status tool to confirm last rebuild after publish',
] as const
