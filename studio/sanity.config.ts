import {defineConfig, isDev} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {presentationTool} from 'sanity/presentation'
import {documentInternationalization} from '@sanity/document-internationalization'
import {schemaTypes} from './src/schemaTypes'
import {isSingletonType, singletonActions, structure} from './src/structure'
import {supportedLanguages} from './src/lib/locales'
import {locations, mainDocuments} from './src/presentation/resolve'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'yourProjectId'
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

/** Production site origin used by Presentation Tool. */
const previewOrigin =
  process.env.SANITY_STUDIO_PREVIEW_ORIGIN ||
  process.env.SANITY_STUDIO_SITE_URL ||
  'https://www.jsone.com.my'

export default defineConfig({
  name: 'jsone',
  title: 'JS One',

  projectId,
  dataset,

  plugins: [
    structureTool({structure}),
    presentationTool({
      previewUrl: {
        initial: previewOrigin,
        previewMode: {
          enable: '/api/preview',
          shareAccess: true,
        },
      },
      allowOrigins: isDev
        ? ['http://localhost:*', previewOrigin]
        : [previewOrigin],
      resolve: {locations, mainDocuments},
    }),
    visionTool({defaultApiVersion: '2025-01-01'}),
    documentInternationalization({
      supportedLanguages,
      schemaTypes: ['page', 'news'],
      languageField: 'language',
      weakReferences: true,
    }),
  ],

  schema: {
    types: schemaTypes,
    templates: (templates) =>
      templates.filter(({schemaType}) => !isSingletonType(schemaType)),
  },

  document: {
    actions: (input, context) =>
      isSingletonType(context.schemaType)
        ? input.filter(({action}) => action && singletonActions.has(action))
        : input,
  },
})
