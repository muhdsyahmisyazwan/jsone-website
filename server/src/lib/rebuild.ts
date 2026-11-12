import {spawn} from 'node:child_process'
import {closeSync, existsSync, mkdirSync, openSync, statSync, unlinkSync} from 'node:fs'
import path from 'node:path'

export type RebuildStatus = {
  configured: boolean
  lastAttemptAt: string | null
  lastStartedAt: string | null
  lastResult: 'started' | 'debounced' | 'locked' | 'failed' | 'invalid_command' | null
  lastError: string | null
  debounceMs: number
  logPath: string | null
  logMtime: string | null
  logAgeSec: number | null
}

type State = {
  lastAttemptAt: number | null
  lastStartedAt: number | null
  lastResult: RebuildStatus['lastResult']
  lastError: string | null
}

const state: State = {
  lastAttemptAt: null,
  lastStartedAt: null,
  lastResult: null,
  lastError: null,
}

const SHELL_META = /[;&|`$<>(){}[\]\\\n\r]/

/** Only absolute executable paths; no shell metacharacters. */
export function parseRebuildCommand(
  command: string,
): {file: string; args: string[]} | {error: string} {
  const trimmed = command.trim()
  if (!trimmed) return {error: 'empty'}
  if (SHELL_META.test(trimmed)) {
    return {error: 'shell_metacharacters_not_allowed'}
  }

  const parts = trimmed.split(/\s+/).filter(Boolean)
  const file = parts[0]
  if (!file) return {error: 'empty'}

  const isAbs =
    file.startsWith('/') || /^[A-Za-z]:[\\/]/.test(file) || file.startsWith('\\\\')
  if (!isAbs) return {error: 'must_be_absolute_path'}
  if (!existsSync(file)) return {error: 'command_not_found'}

  return {file, args: parts.slice(1)}
}

function tryAcquireLock(lockPath: string): boolean {
  try {
    mkdirSync(path.dirname(lockPath), {recursive: true})
    const fd = openSync(lockPath, 'wx')
    closeSync(fd)
    return true
  } catch {
    return false
  }
}

function clearLock(lockPath: string): void {
  try {
    unlinkSync(lockPath)
  } catch {
    // ignore
  }
}

export type TriggerRebuildOptions = {
  command: string
  debounceMs: number
  /** Short Node-side mutex path (script should also flock for the full rebuild). */
  lockPath?: string
}

export type TriggerRebuildResult =
  | {ok: true; started: true}
  | {ok: true; started: false; reason: 'debounced' | 'locked'}
  | {ok: false; error: string}

export function triggerRebuild(options: TriggerRebuildOptions): TriggerRebuildResult {
  const now = Date.now()
  state.lastAttemptAt = now

  const parsed = parseRebuildCommand(options.command)
  if ('error' in parsed) {
    state.lastResult = 'invalid_command'
    state.lastError = parsed.error
    return {ok: false, error: parsed.error}
  }

  if (state.lastStartedAt !== null && now - state.lastStartedAt < options.debounceMs) {
    state.lastResult = 'debounced'
    state.lastError = null
    return {ok: true, started: false, reason: 'debounced'}
  }

  const lockPath = options.lockPath
  if (lockPath) {
    try {
      if (existsSync(lockPath)) {
        const age = now - statSync(lockPath).mtimeMs
        if (age > options.debounceMs) clearLock(lockPath)
      }
    } catch {
      // ignore
    }
    if (!tryAcquireLock(lockPath)) {
      state.lastResult = 'locked'
      state.lastError = null
      return {ok: true, started: false, reason: 'locked'}
    }
  }

  try {
    const child = spawn(parsed.file, parsed.args, {
      shell: false,
      detached: true,
      stdio: 'ignore',
      env: process.env,
    })
    child.unref()

    state.lastStartedAt = now
    state.lastResult = 'started'
    state.lastError = null

    // Node lock is only a short mutex; rebuild.sh holds flock for the full run.
    if (lockPath) {
      setTimeout(() => clearLock(lockPath), 2_000).unref?.()
    }

    console.log('[sanity-webhook] rebuild started:', parsed.file, parsed.args.join(' '))
    return {ok: true, started: true}
  } catch (error) {
    if (lockPath) clearLock(lockPath)
    state.lastResult = 'failed'
    state.lastError = error instanceof Error ? error.message : 'spawn_failed'
    console.error('[sanity-webhook] rebuild spawn failed', error)
    return {ok: false, error: 'spawn_failed'}
  }
}

export function getRebuildStatus(options: {
  command?: string
  debounceMs: number
  logPath?: string
}): RebuildStatus {
  let logMtime: string | null = null
  let logAgeSec: number | null = null
  const logPath = options.logPath || null

  if (logPath && existsSync(logPath)) {
    try {
      const mtimeMs = statSync(logPath).mtimeMs
      logMtime = new Date(mtimeMs).toISOString()
      logAgeSec = Math.max(0, Math.floor((Date.now() - mtimeMs) / 1000))
    } catch {
      // ignore
    }
  }

  return {
    configured: Boolean(options.command),
    lastAttemptAt: state.lastAttemptAt ? new Date(state.lastAttemptAt).toISOString() : null,
    lastStartedAt: state.lastStartedAt ? new Date(state.lastStartedAt).toISOString() : null,
    lastResult: state.lastResult,
    lastError: state.lastError,
    debounceMs: options.debounceMs,
    logPath,
    logMtime,
    logAgeSec,
  }
}
