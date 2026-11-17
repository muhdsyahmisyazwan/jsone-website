#!/usr/bin/env node
/**
 * Parse web/src/styles/global.css theme tokens and verify WCAG contrast.
 * Text pairs must be ≥ 4.5:1; UI pairs ≥ 3:1.
 *
 * Usage:
 *   node scripts/check-design-contrast.mjs           # CI check (exit 1 on fail)
 *   node scripts/check-design-contrast.mjs --markdown # Emit DESIGN.md §2-style tables
 */

import fs from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const cssPath = path.join(root, 'web', 'src', 'styles', 'global.css')
const markdown = process.argv.includes('--markdown')

const TEXT_MIN = 4.5
const UI_MIN = 3

function parseHex(input) {
  const h = String(input).trim().replace(/^#/, '')
  if (/^[0-9a-f]{3}$/i.test(h)) {
    return h.split('').map((c) => c + c).join('').toLowerCase()
  }
  if (/^[0-9a-f]{6}$/i.test(h)) return h.toLowerCase()
  return null
}

function toRgb(hex) {
  const h = parseHex(hex)
  if (!h) return null
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16))
}

function blendWhite(alpha, bgHex) {
  const bg = toRgb(bgHex)
  if (!bg) return null
  const out = bg.map((c) => Math.round(c * (1 - alpha) + 255 * alpha))
  return `#${out.map((x) => x.toString(16).padStart(2, '0')).join('')}`
}

function parseColor(raw, surfaces) {
  const v = String(raw).trim().replace(/;$/, '')
  if (parseHex(v)) return `#${parseHex(v)}`
  const rgb = v.match(
    /^rgb\(\s*(\d+)\s+(\d+)\s+(\d+)\s*\/\s*([\d.]+)\s*\)$/i,
  )
  if (rgb) {
    const a = Number(rgb[4])
    // Prefer blend on --bg for documentation; caller may re-blend
    return blendWhite(a, surfaces.bg) || v
  }
  return null
}

function luminance(hex) {
  const rgb = toRgb(hex)
  if (!rgb) return null
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a, b) {
  const L1 = luminance(a)
  const L2 = luminance(b)
  if (L1 == null || L2 == null) return null
  const hi = Math.max(L1, L2)
  const lo = Math.min(L1, L2)
  return (hi + 0.05) / (lo + 0.05)
}

function extractBlock(css, selectorRe) {
  const m = css.match(selectorRe)
  if (!m) return {}
  const start = m.index + m[0].length
  let depth = 1
  let i = start
  while (i < css.length && depth > 0) {
    if (css[i] === '{') depth++
    else if (css[i] === '}') depth--
    i++
  }
  const body = css.slice(start, i - 1)
  const vars = {}
  for (const line of body.matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/gi)) {
    vars[line[1]] = line[2].trim()
  }
  return vars
}

function resolveTheme(vars) {
  const surfaces = {
    bg: parseColor(vars.bg, {bg: '#000000'}) || '#000000',
    elevated: parseColor(vars['bg-elevated'], {bg: '#000000'}) || '#000000',
    muted: parseColor(vars['bg-muted'], {bg: '#000000'}) || '#000000',
  }
  const get = (name) => {
    const raw = vars[name]
    if (!raw) return null
    if (/rgb\(/.test(raw)) {
      // Keep raw alpha for border-control blending per surface in checks
      return raw
    }
    return parseColor(raw, surfaces)
  }
  const tokens = {}
  for (const key of Object.keys(vars)) {
    tokens[key] = get(key)
  }
  tokens._surfaces = surfaces
  tokens._raw = vars
  return tokens
}

function resolveAgainst(rawOrHex, surfaceHex) {
  if (!rawOrHex) return null
  if (/rgb\(/.test(rawOrHex)) {
    const m = rawOrHex.match(/\/\s*([\d.]+)/)
    const a = m ? Number(m[1]) : 1
    return blendWhite(a, surfaceHex)
  }
  return rawOrHex.startsWith('#') ? rawOrHex : parseColor(rawOrHex, {bg: surfaceHex})
}

function fmt(n) {
  return n == null ? '—' : n.toFixed(2)
}

const css = fs.readFileSync(cssPath, 'utf8')
const lightVars = extractBlock(
  css,
  /:root\s*,\s*\[data-theme=['"]light['"]\]\s*\{/,
)
const darkVars = extractBlock(css, /\[data-theme=['"]dark['"]\]\s*\{/)
if (!Object.keys(lightVars).length || !Object.keys(darkVars).length) {
  console.error('Could not parse light/dark theme blocks from', cssPath)
  process.exit(2)
}

const light = resolveTheme(lightVars)
const dark = resolveTheme(darkVars)

/** @type {{theme: string, kind: 'text'|'ui', label: string, fg: string, bg: string, min: number}[]} */
const checks = []

function addText(theme, tokens, fgName, bgName) {
  const surfaces = tokens._surfaces
  const bg =
    bgName === 'bg'
      ? surfaces.bg
      : bgName === 'bg-elevated'
        ? surfaces.elevated
        : bgName === 'bg-muted'
          ? surfaces.muted
          : resolveAgainst(tokens[bgName.replace(/^--/, '')] || tokens[bgName], surfaces.bg)
  const fg = resolveAgainst(tokens[fgName], surfaces.bg)
  if (!fg || !bg) return
  checks.push({
    theme,
    kind: 'text',
    label: `${fgName} / ${bgName}`,
    fg,
    bg,
    min: TEXT_MIN,
  })
}

function addUi(theme, tokens, fgName, bgKey) {
  const surfaces = tokens._surfaces
  const surfaceHex =
    bgKey === 'bg' ? surfaces.bg : bgKey === 'bg-elevated' ? surfaces.elevated : surfaces.muted
  const fg = resolveAgainst(tokens[fgName], surfaceHex)
  if (!fg) return
  checks.push({
    theme,
    kind: 'ui',
    label: `${fgName} / ${bgKey}`,
    fg,
    bg: surfaceHex,
    min: UI_MIN,
  })
}

for (const [theme, tokens] of [
  ['Light', light],
  ['Dark', dark],
]) {
  for (const fg of ['fg', 'fg-muted', 'fg-subtle', 'primary', 'danger', 'success']) {
    for (const bg of ['bg', 'bg-elevated', 'bg-muted']) addText(theme, tokens, fg, bg)
  }
  addText(theme, tokens, 'primary-fg', 'primary')
  addText(theme, tokens, 'accent-fg', 'accent')
  addText(theme, tokens, 'fg', 'primary-soft')
  addText(theme, tokens, 'fg', 'accent-soft')
  addText(theme, tokens, 'fg', 'danger-soft')
  addText(theme, tokens, 'fg', 'success-soft')
  addText(theme, tokens, 'fg', 'info-soft')
  addText(theme, tokens, 'danger', 'danger-soft')
  addText(theme, tokens, 'success', 'success-soft')
  addText(theme, tokens, 'primary', 'info-soft')

  for (const bg of ['bg', 'bg-elevated', 'bg-muted']) {
    addUi(theme, tokens, 'border-control', bg)
    addUi(theme, tokens, 'ring', bg)
    addUi(theme, tokens, 'illust-accent', bg)
  }
}

const failures = []
const rows = []

for (const c of checks) {
  const ratio = contrast(c.fg, c.bg)
  const pass = ratio != null && ratio >= c.min
  rows.push({...c, ratio, pass})
  if (!pass) {
    failures.push(
      `${c.theme} ${c.kind} ${c.label}: ${fmt(ratio)}:1 (need ≥ ${c.min}:1) [${c.fg} on ${c.bg}]`,
    )
  }
}

if (markdown) {
  console.log('### Generated semantic tokens (from global.css)\n')
  for (const [theme, tokens] of [
    ['Light', light],
    ['Dark', dark],
  ]) {
    console.log(`#### ${theme}\n`)
    console.log('| Token | Hex |')
    console.log('| ---- | ---- |')
    for (const key of [
      'bg',
      'bg-elevated',
      'bg-muted',
      'fg',
      'fg-muted',
      'fg-subtle',
      'border',
      'border-strong',
      'border-control',
      'primary',
      'accent',
      'ring',
      'danger',
      'danger-soft',
      'success',
      'success-soft',
      'info-soft',
      'illust-accent',
    ]) {
      const raw = tokens._raw[key]
      const resolved = tokens[key]
      console.log(`| \`--${key}\` | \`${raw || resolved || '—'}\` |`)
    }
    console.log('')
  }
  console.log('### Contrast pairs\n')
  console.log('| Theme | Kind | Pair | Fg | Bg | Ratio | Min | AA |')
  console.log('| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |')
  for (const r of rows) {
    console.log(
      `| ${r.theme} | ${r.kind} | ${r.label} | \`${r.fg}\` | \`${r.bg}\` | ${fmt(r.ratio)} | ${r.min} | ${r.pass ? 'Pass' : 'FAIL'} |`,
    )
  }
  process.exit(failures.length ? 1 : 0)
}

if (failures.length) {
  console.error(`Design contrast check failed (${failures.length}):\n`)
  for (const f of failures) console.error(' -', f)
  process.exit(1)
}

console.log(`Design contrast check passed (${rows.length} pairs).`)
