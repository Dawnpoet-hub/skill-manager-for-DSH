/**
 * Translation helpers for the Skill Manager panel.
 *
 * The panel does not ship a model or a credential. It uses the translator
 * service that DSH already owns (`ctx.get('translator')`) and keeps the result
 * in a local cache outside the skills directory. The helpers here are pure
 * except for the provider call: Markdown protection, chunking, retries and the
 * small curated seed used for the skills that ship with this profile.
 */
import { createHash } from 'node:crypto'

const HAN_RE = /[\u3400-\u9fff\uf900-\ufaff]/g
const LATIN_RE = /[A-Za-z]/g
const TOKEN_RE = /SKMTOKEN(\d{4})/g
const TOKEN_PREFIX = 'SKMTOKEN'
const MAX_ATTEMPTS = 3
const RETRY_DELAY_MS = 700
const DEFAULT_MAX_TEXT_CHARS = 4_000

/** Known skills get an instant, reviewed display name and summary. */
export const CURATED_METADATA = {
  'design-taste-frontend': {
    title: '设计品味 · 前端',
    source: 'tasteskill 2.5.1, the anti-slop frontend skill.',
    description:
      '面向公司官网与产品页的前端设计技能：强调独特文案、统一设计系统、真实素材、克制的动效，以及用真实浏览器完成检查与收尾，避免模板化的「AI 味」页面。',
  },
  impeccable: {
    title: '精湛设计',
    source: 'Use when the user wants to design, redesign, shape, critique, audit, polish',
    description:
      '用于设计、重做、评审、打磨和简化前端界面，覆盖信息层级、布局、字体、颜色、动效、文案、可访问性与响应式细节；也可用来让平淡的界面更有张力。',
  },
  'ui-ux-pro-max': {
    title: 'UI/UX 设计专家',
    source: 'UI/UX design intelligence for web, mobile, and desktop.',
    description:
      '可检索的 UI/UX 设计知识库：内置风格、产品配色、字体搭配、UX 规范、图标、动效预设与多技术栈实现建议，适合在设计与评审界面时按需查询。',
  },
  'skill-manager': {
    title: '技能管理器',
    source: '统一管理本机 DSH 技能',
    description: '统一管理本机 DSH 技能：查看、搜索、安装、更新、启停和卸载。',
  },
  'harness-creator': {
    title: 'Harness 创建器',
    source: 'Use when building a reliable harness',
    description: '指导构建可靠 Harness 的技能，覆盖上下文、工具、验证与失败处理。',
  },
  'dsh-doc': {
    title: 'DSH 文档',
    source: 'Use when a task needs facts about DeepSeek Harness (DSH) itself',
    description:
      '查询 DSH 自身的文档与实现事实，用于设计、排查和扩展 DSH 插件、配置与界面。',
  },
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function normalize(text) {
  return String(text ?? '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Content identity used to invalidate cached translations after an update. */
export function fingerprint(text) {
  return createHash('sha256').update(String(text ?? '')).digest('hex')
}

/** True when the text already contains enough Han prose to skip translation. */
export function isMostlyChinese(text) {
  const prose = String(text ?? '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`\n]*`/g, ' ')
  const han = (prose.match(HAN_RE) || []).length
  const latin = (prose.match(LATIN_RE) || []).length
  return han >= 20 && han >= latin * 0.5
}

/** Pick the reviewed seed only while the installed description still matches it. */
export function curatedMetadata(meta) {
  const seed = CURATED_METADATA[meta?.name]
  if (!seed) return {}
  const description = normalize(meta.description)
  const source = normalize(seed.source)
  const sameSource = description === '' || description.startsWith(source)
  return {
    title: seed.title,
    description: sameSource ? seed.description : '',
  }
}

/** Clean a machine-translated short title without inventing text. */
export function cleanTitle(value) {
  return normalize(value)
    .replace(/^[“”"'`*_#\s]+|[“”"'`*_#\s]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function protectLine(line, protect) {
  let out = line
  out = out.replace(/`[^`\n]*`/g, (match) => protect(match))
  out = out.replace(/!?\[[^\]]*\]\([^)]*\)/g, (match) => protect(match))
  out = out.replace(/<!--[\s\S]*?-->|<[^>]+>/g, (match) => protect(match))
  out = out.replace(/\bhttps?:\/\/[^\s<>)]+/g, (match) => protect(match))
  out = out.replace(
    /(^|[\s(（])((?:~\/|\.{1,2}\/|\/)[^\s,;:，。；：)）]+)/g,
    (_match, prefix, target) => `${prefix}${protect(target)}`,
  )
  out = out.replace(
    /\b[\w.-]+\.(?:md|markdown|json|jsonc|js|mjs|cjs|ts|tsx|jsx|py|sh|bash|zsh|yml|yaml|toml|css|scss|html|svg|png|jpe?g|webp|gif|lock)\b/g,
    (match) => protect(match),
  )
  return out
}

/**
 * Replace code, links, paths and other literal fragments with stable tokens,
 * then translate only the prose. A token that the provider drops fails loudly
 * instead of silently deleting code from the display.
 */
export function protectMarkdown(body) {
  const source = String(body ?? '').replace(/\r\n?/g, '\n')
  const pieces = []
  const protect = (value) => {
    const index = pieces.length
    pieces.push(value)
    return ` ${TOKEN_PREFIX}${String(index).padStart(4, '0')} `
  }
  const output = []
  const lines = source.split('\n')
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    const fence = /^(\s*)(`{3,}|~{3,})(.*)$/.exec(line)
    if (fence) {
      const marker = fence[2]
      const block = [line]
      const close = new RegExp(`^\\s*${marker[0] === '`' ? '`' : '~'}{${marker.length},}\\s*$`)
      i += 1
      while (i < lines.length) {
        block.push(lines[i])
        if (close.test(lines[i])) {
          i += 1
          break
        }
        i += 1
      }
      output.push(protect(block.join('\n')))
      continue
    }
    if (/^( {4}|\t)/.test(line) && line.trim() !== '') {
      const block = [line]
      i += 1
      while (i < lines.length && (/^( {4}|\t)/.test(lines[i]) || lines[i].trim() === '')) {
        block.push(lines[i])
        i += 1
      }
      output.push(protect(block.join('\n')))
      continue
    }
    if (/^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(line)) {
      output.push(protect(line))
      i += 1
      continue
    }
    output.push(protectLine(line, protect))
    i += 1
  }

  const text = output.join('\n')
  return {
    text,
    restore(translated) {
      const value = String(translated ?? '')
      for (let index = 0; index < pieces.length; index += 1) {
        const token = `${TOKEN_PREFIX}${String(index).padStart(4, '0')}`
        if (!value.includes(token)) {
          throw new Error('自动翻译丢失了受保护的代码或链接，请重试')
        }
      }
      let missing = false
      const restored = value.replace(TOKEN_RE, (match, digits) => {
        const piece = pieces[Number(digits)]
        if (piece === undefined) {
          missing = true
          return match
        }
        return piece
      })
      if (missing) throw new Error('自动翻译返回了未知的占位标记，请重试')
      return restored
    },
  }
}

function splitLongLine(line, limit) {
  const parts = []
  let rest = line
  while (rest.length > limit) {
    let cut = rest.lastIndexOf(' ', limit)
    if (cut < Math.floor(limit * 0.5)) cut = limit
    parts.push(rest.slice(0, cut))
    rest = rest.slice(cut).replace(/^\s+/, '')
  }
  if (rest !== '') parts.push(rest)
  return parts
}

/** Split at line boundaries first so headings and list markers stay intact. */
export function chunkText(text, limit) {
  const safeLimit = Math.max(180, Number(limit) || DEFAULT_MAX_TEXT_CHARS)
  const chunks = []
  let current = ''
  for (const line of String(text ?? '').split('\n')) {
    if (current !== '' && current.length + 1 + line.length > safeLimit) {
      chunks.push(current)
      current = line
    } else {
      current = current === '' ? line : `${current}\n${line}`
    }
  }
  if (current !== '') chunks.push(current)
  const out = []
  for (const chunk of chunks) {
    if (chunk.length <= safeLimit) {
      out.push(chunk)
      continue
    }
    out.push(...splitLongLine(chunk, safeLimit))
  }
  return out
}

function errorCode(error) {
  return error && typeof error === 'object' ? error.code : undefined
}

function isTextLimit(error) {
  return errorCode(error) === 'TRANSLATION_TEXT_LIMIT'
}

function retryable(error) {
  const code = errorCode(error)
  if (code === undefined) return true
  return [
    'TRANSLATION_INVALID_RESPONSE',
    'TRANSLATION_HTTP_ERROR',
    'TRANSLATION_REQUEST_FAILED',
    'TRANSLATION_TIMEOUT',
    'TRANSLATION_RESPONSE_LIMIT',
  ].includes(code)
}

async function translateChunk(translator, text, options) {
  const request = {
    text,
    targetLanguage: options.targetLanguage,
    sourceLanguage: options.sourceLanguage,
  }
  let spec
  try {
    spec = translator.resolve(request)
  } catch (error) {
    // Never silently switch a user's paid/private route to another provider.
    // Paid routes need a Session; the panel is stateless.
    if (errorCode(error) === 'TRANSLATION_SESSION_REQUIRED') {
      throw new Error('自动翻译不可用：当前翻译服务要求活动会话，请在 DSH 翻译设置中改用 Bing 后重试')
    }
    throw error
  }

  let lastError
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    if (options.signal?.aborted) throw options.signal.reason ?? new Error('translation aborted')
    try {
      const result = await translator.translate(spec, options.signal)
      if (typeof result !== 'string' || result.trim() === '') {
        throw new Error('translator returned empty text')
      }
      return { text: result, provider: spec.provider }
    } catch (error) {
      lastError = error
      if (options.signal?.aborted) throw error
      if (!retryable(error) || attempt === MAX_ATTEMPTS) throw error
      await delay(RETRY_DELAY_MS * attempt)
    }
  }
  throw lastError
}

/**
 * Translate arbitrary text through the Host translator service.
 * @returns `{ text, provider }`; already-Chinese text is returned untouched.
 */
export async function translateText(translator, text, options = {}) {
  if (!translator || typeof translator.resolve !== 'function' || typeof translator.translate !== 'function') {
    throw new Error('自动翻译服务不可用：当前 DSH 未提供 translator 服务')
  }
  const value = String(text ?? '')
  if (value.trim() === '') return { text: '', provider: '' }
  if (isMostlyChinese(value)) return { text: value, provider: '' }

  const resolvedOptions = {
    targetLanguage: options.targetLanguage || 'zh-CN',
    sourceLanguage: options.sourceLanguage || 'auto',
    signal: options.signal,
    onProgress: options.onProgress,
  }
  const configured = Number(translator.maxTextChars)
  let limit = Number.isFinite(configured) && configured >= 200
    ? Math.min(configured, DEFAULT_MAX_TEXT_CHARS)
    : DEFAULT_MAX_TEXT_CHARS

  for (let round = 0; round < 4; round += 1) {
    try {
      const chunks = chunkText(value, Math.max(180, limit - 60))
      const results = []
      let provider = ''
      for (let index = 0; index < chunks.length; index += 1) {
        const result = await translateChunk(translator, chunks[index], resolvedOptions)
        results.push(result.text)
        provider = result.provider || provider
        if (options.onProgress) options.onProgress(index + 1, chunks.length)
        if (index < chunks.length - 1) await delay(180)
      }
      return { text: results.join('\n'), provider }
    } catch (error) {
      if (isTextLimit(error) && limit > 300) {
        limit = Math.floor(limit / 2)
        continue
      }
      throw error
    }
  }
  throw new Error('自动翻译请求过大，无法拆分翻译')
}

/**
 * Translate the two list fields. A reviewed seed wins for known skills while
 * its source description is still installed; unknown skills are translated.
 */
export async function translateMetadata(translator, meta, options = {}) {
  const curated = curatedMetadata(meta)
  let title = curated.title || ''
  let description = curated.description || ''
  let provider = 'curated'

  if (title === '') {
    const source = meta.title && meta.title !== meta.name
      ? meta.title
      : String(meta.name || '').replace(/[-_]+/g, ' ')
    const result = await translateText(translator, source, options)
    const candidate = cleanTitle(result.text)
    title = /[\u3400-\u9fff\uf900-\ufaff]/.test(candidate)
      ? candidate
      : (meta.title || meta.name)
    provider = result.provider || provider
  }

  if (description === '' && meta.description) {
    const result = await translateText(translator, meta.description, options)
    description = result.text.trim()
    provider = result.provider || provider
  }

  return { title, description, provider }
}

/** Translate the body while keeping code, links and paths byte-for-byte. */
export async function translateContent(translator, body, options = {}) {
  const source = String(body ?? '')
  if (source.trim() === '') return { text: '', provider: '' }
  if (isMostlyChinese(source)) return { text: source, provider: '' }

  const protectedDoc = protectMarkdown(source)
  const prose = protectedDoc.text.replace(TOKEN_RE, ' ').trim()
  if (prose === '') return { text: source, provider: '' }

  const result = await translateText(translator, protectedDoc.text, options)
  return { text: protectedDoc.restore(result.text), provider: result.provider }
}
