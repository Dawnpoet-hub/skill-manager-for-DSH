/**
 * Host half of the Skill Manager panel.
 *
 * The browser half cannot read `~/.dsh/skills`, so this half serves a small
 * JSON API over the Web carrier and reuses the `dsh-skills` CLI for the
 * mutating operations (install/update/disable/enable/remove), keeping the UI
 * and the command line on one implementation.
 */
import { execFile } from 'node:child_process'
import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const API_PREFIX = '/skill-manager'
const API_TOKEN = 'skm_7c4e1a9b2d6f8c3e5a1b0d9f4c7e2a6b'
const MAX_BODY_BYTES = 64 * 1024

const DSH_HOME = process.env.DSH_HOME || path.join(os.homedir(), '.dsh')
const SKILLS_ROOT = path.join(DSH_HOME, 'skills')
const DISABLED_ROOT = path.join(SKILLS_ROOT, '.system', 'disabled')
const BUNDLED_CLI = fileURLToPath(new URL('./dsh-skills', import.meta.url))
const CLI = process.env.DSH_SKILLS_BIN || BUNDLED_CLI
const BASH = process.platform === 'win32' ? 'bash' : '/bin/bash'

export function apply(ctx) {
  const handler = createHandler()
  ctx.inject(['webServer'], (webCtx) => {
    webCtx.effect(
      () =>
        webCtx.webServer.register({
          kind: 'prefix',
          path: API_PREFIX,
          handler,
        }),
      'skill-manager-panel: api route',
    )
  })
}

function createHandler() {
  return async (req, res) => {
    try {
      if (req.headers['x-skm-token'] !== API_TOKEN) return send(res, 403, { error: 'forbidden' })
      const url = new URL(req.url ?? '/', 'http://127.0.0.1')
      const route = url.pathname.slice(API_PREFIX.length).replace(/^\/+/, '')

      if (req.method === 'GET' && route === 'api/skills') {
        return send(res, 200, { skills: await listSkills() })
      }
      if (req.method === 'GET' && route === 'api/skill') {
        return send(res, 200, await readSkill(url.searchParams.get('name')))
      }
      if (req.method === 'POST') {
        const body = await readJson(req)
        if (route === 'api/toggle') return send(res, 200, await toggleSkill(body))
        if (route === 'api/remove') return send(res, 200, await removeSkill(body))
        if (route === 'api/install') return send(res, 200, await installSkill(body))
        if (route === 'api/update') return send(res, 200, await updateSkill(body))
        if (route === 'api/reveal') return send(res, 200, await revealSkill(body))
        if (route === 'api/open-root') return send(res, 200, await openRoot())
      }
      send(res, 404, { error: 'not found' })
    } catch (error) {
      send(res, 500, { error: error instanceof Error ? error.message : String(error) })
    }
  }
}

function send(res, status, value) {
  const body = JSON.stringify(value)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'content-length': Buffer.byteLength(body),
  })
  res.end(body)
}

async function readJson(req) {
  let size = 0
  const chunks = []
  for await (const chunk of req) {
    size += chunk.length
    if (size > MAX_BODY_BYTES) throw new Error('request body is too large')
    chunks.push(chunk)
  }
  const text = Buffer.concat(chunks).toString('utf8')
  if (text === '') return {}
  try {
    return JSON.parse(text)
  } catch {
    throw new Error('invalid JSON body')
  }
}

function parseFrontmatter(text) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text)
  if (!match) return { data: {}, body: text }
  const data = {}
  const lines = match[1].split(/\r?\n/)
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]
    if (/^\s/.test(line)) continue
    const m = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line)
    if (!m) continue
    let value = m[2].trim()
    if (value === '>' || value === '>-' || value === '|' || value === '|-') {
      const block = []
      while (i + 1 < lines.length && /^\s+/.test(lines[i + 1])) {
        block.push(lines[i + 1].replace(/^\s+/, ''))
        i += 1
      }
      value = block.join(' ').trim()
    } else {
      value = value.replace(/^['"]|['"]$/g, '')
    }
    data[m[1]] = value
  }
  return { data, body: text.slice(match[0].length) }
}

async function isDir(target) {
  try {
    return (await fs.stat(target)).isDirectory()
  } catch {
    return false
  }
}

async function readSource(dir) {
  try {
    const text = await fs.readFile(path.join(dir, '.dsh-skill-source'), 'utf8')
    const data = {}
    for (const line of text.split('\n')) {
      const at = line.indexOf('=')
      if (at > 0) data[line.slice(0, at)] = line.slice(at + 1)
    }
    return data
  } catch {
    return {}
  }
}

async function readMeta(dir, enabled) {
  const file = path.join(dir, 'SKILL.md')
  let text
  let stat
  try {
    text = await fs.readFile(file, 'utf8')
    stat = await fs.stat(file)
  } catch {
    return null
  }
  const { data } = parseFrontmatter(text)
  const folder = path.basename(dir)
  const title = typeof data.name === 'string' && data.name !== '' ? data.name : folder
  const source = await readSource(dir)
  const hasScripts = await isDir(path.join(dir, 'scripts'))
  const hasReferences = (await isDir(path.join(dir, 'references'))) || (await isDir(path.join(dir, 'reference')))
  const tags = ['全局']
  if (data.version) tags.push(`v${data.version}`)
  if (source.source) tags.push(/github\.com/i.test(source.source) ? 'GitHub' : '本地')
  if (hasScripts) tags.push('含脚本')
  if (hasReferences) tags.push('含参考')
  if (!enabled) tags.push('已停用')
  return {
    name: folder,
    title,
    description: typeof data.description === 'string' ? data.description : '',
    version: typeof data.version === 'string' ? data.version : '',
    enabled,
    dir,
    source: source.source || '',
    subdir: source.subdir || '',
    tags,
    updatedAt: stat.mtimeMs,
  }
}

async function scanRoot(root, enabled) {
  let entries
  try {
    entries = await fs.readdir(root, { withFileTypes: true })
  } catch {
    return []
  }
  const skills = []
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) continue
    const meta = await readMeta(path.join(root, entry.name), enabled)
    if (meta) skills.push(meta)
  }
  return skills
}

async function listSkills() {
  const enabled = await scanRoot(SKILLS_ROOT, true)
  const disabled = await scanRoot(DISABLED_ROOT, false)
  return [...enabled, ...disabled].sort((a, b) => {
    if (a.enabled !== b.enabled) return a.enabled ? -1 : 1
    return a.title.localeCompare(b.title)
  })
}

function safeName(name) {
  return typeof name === 'string' && /^[a-z0-9][a-z0-9-]*$/.test(name)
}

async function findSkill(name) {
  if (!safeName(name)) throw new Error('invalid skill name')
  for (const [root, enabled] of [
    [SKILLS_ROOT, true],
    [DISABLED_ROOT, false],
  ]) {
    const dir = path.join(root, name)
    if (path.dirname(dir) !== root) continue
    if (!(await isDir(dir))) continue
    try {
      await fs.access(path.join(dir, 'SKILL.md'))
      return { dir, enabled }
    } catch {
      // keep looking in the other root
    }
  }
  return null
}

async function readSkill(name) {
  const found = await findSkill(name)
  if (!found) throw new Error(`skill not found: ${name}`)
  const text = await fs.readFile(path.join(found.dir, 'SKILL.md'), 'utf8')
  const { data, body } = parseFrontmatter(text)
  const meta = await readMeta(found.dir, found.enabled)
  return { ...meta, frontmatter: data, content: body.slice(0, 400_000) }
}

function runCli(args, timeout = 180_000) {
  return new Promise((resolve) => {
    execFile(
      BASH,
      [CLI, ...args],
      {
        timeout,
        maxBuffer: 8 * 1024 * 1024,
        env: { ...process.env, DSH_SKILLS_DIR: SKILLS_ROOT },
      },
      (error, stdout, stderr) => {
        if (error) {
          resolve({ ok: false, error: (stderr || stdout || error.message).trim() })
          return
        }
        resolve({ ok: true, output: (stdout || '').trim() })
      },
    )
  })
}

async function requireCli() {
  try {
    await fs.access(CLI)
  } catch {
    throw new Error(`管理命令不存在：${CLI}（安装包不完整）`)
  }
}

async function toggleSkill(body) {
  const name = String(body.name || '')
  if (!safeName(name)) throw new Error('invalid skill name')
  await requireCli()
  const result = await runCli([body.enabled ? 'enable' : 'disable', name])
  if (!result.ok) throw new Error(result.error)
  return { ok: true, output: result.output }
}

async function removeSkill(body) {
  const name = String(body.name || '')
  if (!safeName(name)) throw new Error('invalid skill name')
  await requireCli()
  const result = await runCli(['remove', name])
  if (!result.ok) throw new Error(result.error)
  return { ok: true, output: result.output }
}

async function updateSkill(body) {
  const name = String(body.name || '')
  if (!safeName(name)) throw new Error('invalid skill name')
  await requireCli()
  const result = await runCli(['update', name])
  if (!result.ok) throw new Error(result.error)
  return { ok: true, output: result.output }
}

async function installSkill(body) {
  const source = String(body.source || '').trim()
  if (source === '') throw new Error('请填写仓库（owner/repo 或 GitHub URL）')
  await requireCli()
  const args = ['install', source]
  if (body.subdir) args.push('--subdir', String(body.subdir).trim())
  if (body.name) args.push('--name', String(body.name).trim())
  if (body.force) args.push('--force')
  const result = await runCli(args)
  if (!result.ok) throw new Error(result.error)
  return { ok: true, output: result.output }
}

function openSpec(target, reveal) {
  if (process.platform === 'darwin') {
    return { command: 'open', args: reveal ? ['-R', target] : [target] }
  }
  if (process.platform === 'win32') {
    return { command: 'explorer', args: reveal ? [`/select,${target}`] : [target] }
  }
  return { command: 'xdg-open', args: [reveal ? path.dirname(target) : target] }
}

function runOpen(spec) {
  return new Promise((resolve) => {
    execFile(spec.command, spec.args, (error, stdout, stderr) => {
      if (error) {
        resolve({ ok: false, error: (stderr || error.message).trim() })
        return
      }
      resolve({ ok: true })
    })
  })
}

async function revealSkill(body) {
  const found = await findSkill(String(body.name || ''))
  if (!found) throw new Error('skill not found')
  const result = await runOpen(openSpec(found.dir, body.mode === 'finder'))
  if (!result.ok) throw new Error(result.error)
  return { ok: true }
}

async function openRoot() {
  try {
    await fs.mkdir(SKILLS_ROOT, { recursive: true })
  } catch {
    // opening reports the real failure
  }
  const result = await runOpen(openSpec(SKILLS_ROOT, false))
  if (!result.ok) throw new Error(result.error)
  return { ok: true }
}
