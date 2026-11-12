/** @type {import('@lhci/cli').Config} */
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run preview -w web -- --host 127.0.0.1 --port 4321',
      startServerReadyPattern: 'Local|localhost|127\\.0\\.0\\.1',
      url: [
        'http://127.0.0.1:4321/',
        'http://127.0.0.1:4321/solutions/',
        'http://127.0.0.1:4321/contact/',
      ],
      numberOfRuns: 1,
      settings: {
        preset: 'desktop',
        // Form posts need /api; static preview has no API - ignore offline/network noise.
        skipAudits: ['uses-http2'],
      },
    },
    assert: {
      assertions: {
        // Perf can jitter on shared CI runners - warn at 90, enforce a11y/SEO harder.
        'categories:performance': ['warn', {minScore: 0.9}],
        'categories:accessibility': ['error', {minScore: 0.9}],
        'categories:best-practices': ['warn', {minScore: 0.9}],
        'categories:seo': ['error', {minScore: 0.9}],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: '.lighthouseci',
    },
  },
}
