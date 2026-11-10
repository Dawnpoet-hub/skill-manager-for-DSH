window.__ModuleLoader__.load({
  id: '@local/dsh-skill-manager-panel',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    const NS = 'skills.panel'
    const API = '/skill-manager/api'
    const API_TOKEN = 'skm_7c4e1a9b2d6f8c3e5a1b0d9f4c7e2a6b'

    const DICTS = {
      zh: {
        panel: '技能',
        title: '技能',
        subtitle: '通过任务专用技能扩展 DSH 的能力',
        search: '搜索技能',
        refresh: '刷新',
        add: '添加',
        installed: '已安装',
        all: '全部',
        enabled: '已启用',
        disabled: '已停用',
        loading: '正在加载技能…',
        loadFailed: '无法加载技能',
        retry: '重试',
        noMatches: '没有匹配的技能',
        empty: '还没有安装技能',
        emptyHint: '用「添加」从 GitHub 安装，或运行 ~/.dsh/bin/dsh-skills install。',
        noDescription: '暂无描述',
        enabledLabel: '启用技能',
        more: '更多操作',
        open: '打开',
        reveal: '在 Finder 中显示',
        copy: '复制 Markdown',
        close: '关闭',
        remove: '卸载',
        confirmRemove: '确认卸载',
        removing: '正在卸载…',
        try: '立即试用',
        tryCopied: '已复制使用提示，粘贴到对话即可',
        copied: '已复制 Markdown',
        copyFailed: '复制失败',
        addTitle: '添加技能',
        addHint: '支持 owner/repo、GitHub URL 或本地目录。',
        source: '仓库或目录',
        sourcePlaceholder: '例如 nextlevelbuilder/ui-ux-pro-max-skill',
        subdir: '子目录（可选）',
        subdirPlaceholder: '例如 .claude/skills/ui-ux-pro-max',
        name: '名称（可选）',
        namePlaceholder: '默认使用 SKILL.md 中的 name',
        install: '安装',
        installing: '正在安装…',
        cancel: '取消',
        installedToast: '安装完成',
        updatedToast: '已更新',
        openRoot: '打开技能目录',
        rootHint: '全局目录：~/.dsh/skills',
        detailFailed: '无法加载技能内容',
        toggleFailed: '操作失败',
        removeFailed: '卸载失败',
        installFailed: '安装失败',
        update: '更新',
        updating: '正在更新…',
        detailLabel: '技能详情',
        version: '版本',
      },
      en: {
        panel: 'Skills',
        title: 'Skills',
        subtitle: 'Extend DSH with task-specific skills',
        search: 'Search skills',
        refresh: 'Refresh',
        add: 'Add',
        installed: 'Installed',
        all: 'All',
        enabled: 'Enabled',
        disabled: 'Disabled',
        loading: 'Loading skills…',
        loadFailed: 'Could not load skills',
        retry: 'Retry',
        noMatches: 'No matching skills',
        empty: 'No skills installed yet',
        emptyHint: 'Use Add to install from GitHub, or run ~/.dsh/bin/dsh-skills install.',
        noDescription: 'No description',
        enabledLabel: 'Enable skill',
        more: 'More actions',
        open: 'Open',
        reveal: 'Show in Finder',
        copy: 'Copy Markdown',
        close: 'Close',
        remove: 'Uninstall',
        confirmRemove: 'Confirm uninstall',
        removing: 'Removing…',
        try: 'Try it',
        tryCopied: 'Usage prompt copied. Paste it into chat.',
        copied: 'Markdown copied',
        copyFailed: 'Copy failed',
        addTitle: 'Add a skill',
        addHint: 'Accepts owner/repo, a GitHub URL, or a local directory.',
        source: 'Repository or directory',
        sourcePlaceholder: 'e.g. nextlevelbuilder/ui-ux-pro-max-skill',
        subdir: 'Subdirectory (optional)',
        subdirPlaceholder: 'e.g. .claude/skills/ui-ux-pro-max',
        name: 'Name (optional)',
        namePlaceholder: 'Defaults to the name in SKILL.md',
        install: 'Install',
        installing: 'Installing…',
        cancel: 'Cancel',
        installedToast: 'Installed',
        updatedToast: 'Updated',
        openRoot: 'Open skills folder',
        rootHint: 'Global folder: ~/.dsh/skills',
        detailFailed: 'Could not load the skill',
        toggleFailed: 'Action failed',
        removeFailed: 'Uninstall failed',
        installFailed: 'Install failed',
        update: 'Update',
        updating: 'Updating…',
        detailLabel: 'Skill details',
        version: 'Version',
      },
    }

    const CSS = `
.skm-page { position: relative; box-sizing: border-box; display: flex; flex-direction: column; height: 100%; min-height: 0; background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-primary); }
.skm-page *, .skm-page *::before, .skm-page *::after { box-sizing: border-box; }
.skm-scroll { flex: 1; min-height: 0; overflow: auto; }
.skm-content { width: 100%; max-width: 1080px; margin: 0 auto; padding: 28px 36px 40px; }
.skm-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; }
.skm-heading h1 { margin: 0; font-size: 26px; line-height: 34px; font-weight: 600; letter-spacing: -0.01em; }
.skm-heading p { margin: 4px 0 0; font-size: 13px; line-height: 20px; color: var(--dsw-alias-label-secondary); }
.skm-tools { display: flex; flex: none; align-items: center; gap: 10px; }
.skm-search { display: flex; align-items: center; gap: 8px; width: 260px; height: 36px; padding: 0 12px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 18px; background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-secondary); transition: border-color 120ms ease; }
.skm-search:focus-within { border-color: var(--dsw-alias-brand-primary); }
.skm-search input { flex: 1; min-width: 0; border: 0; outline: 0; background: transparent; color: var(--dsw-alias-label-primary); font: inherit; font-size: 13px; }
.skm-search input::placeholder { color: var(--dsw-alias-label-secondary); }
.skm-icon-btn { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; padding: 0; border: 0; border-radius: 8px; background: transparent; color: var(--dsw-alias-label-secondary); cursor: pointer; }
.skm-icon-btn:hover { background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); }
.skm-icon-btn:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 1px; }
.skm-primary { display: inline-flex; align-items: center; gap: 6px; height: 36px; padding: 0 14px; border: 0; border-radius: 18px; background: var(--dsw-alias-button-primary-fill, var(--dsw-alias-brand-primary)); color: var(--dsw-alias-label-primary-foreground, var(--dsw-alias-bg-base)); font: inherit; font-size: 13px; font-weight: 500; cursor: pointer; white-space: nowrap; }
.skm-primary:hover { filter: brightness(1.08); }
.skm-primary:disabled { opacity: 0.6; cursor: default; }
.skm-primary:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 2px; }
.skm-tabs { display: flex; flex-wrap: wrap; gap: 8px; margin: 22px 0 18px; }
.skm-tab { height: 30px; padding: 0 13px; border: 0; border-radius: 15px; background: transparent; color: var(--dsw-alias-label-secondary); font: inherit; font-size: 12px; cursor: pointer; }
.skm-tab:hover { background: var(--dsw-alias-bg-layer-1); }
.skm-tab[data-active='true'] { background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); }
.skm-section { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin-bottom: 8px; }
.skm-section h2 { margin: 0; font-size: 14px; line-height: 22px; font-weight: 600; }
.skm-section span { font-size: 12px; color: var(--dsw-alias-label-secondary); }
.skm-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px 24px; }
.skm-card { display: flex; align-items: center; gap: 12px; width: 100%; padding: 11px 8px; border: 0; border-radius: 10px; background: transparent; color: inherit; font: inherit; text-align: left; cursor: pointer; }
.skm-card:hover { background: var(--dsw-alias-bg-layer-1); }
.skm-card:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: -2px; }
.skm-card-icon { display: flex; flex: none; align-items: center; justify-content: center; width: 40px; height: 40px; }
.skm-card-body { display: flex; flex: 1; flex-direction: column; min-width: 0; gap: 2px; }
.skm-card-name { display: flex; align-items: center; gap: 8px; font-size: 14px; line-height: 22px; font-weight: 600; }
.skm-badge { padding: 0 6px; border-radius: 6px; background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-secondary); font-size: 10px; line-height: 17px; font-weight: 500; }
.skm-card-desc { display: -webkit-box; overflow: hidden; -webkit-line-clamp: 2; -webkit-box-orient: vertical; color: var(--dsw-alias-label-secondary); font-size: 12px; line-height: 18px; }
.skm-check { flex: none; color: var(--dsw-alias-state-success-primary); }
.skm-state { padding: 44px 8px; color: var(--dsw-alias-label-secondary); font-size: 13px; text-align: center; }
.skm-empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 52px 16px; text-align: center; }
.skm-empty h3 { margin: 8px 0 0; font-size: 15px; font-weight: 600; }
.skm-empty p { margin: 0; max-width: 420px; color: var(--dsw-alias-label-secondary); font-size: 12px; line-height: 19px; }
.skm-foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 24px; padding-top: 12px; border-top: 1px solid var(--dsw-alias-border-l1); color: var(--dsw-alias-label-secondary); font-size: 11px; }
.skm-foot button { border: 0; background: transparent; color: var(--dsw-alias-label-secondary); font: inherit; font-size: 11px; cursor: pointer; }
.skm-foot button:hover { color: var(--dsw-alias-label-primary); text-decoration: underline; }
.skm-overlay { position: absolute; inset: 0; z-index: 30; display: flex; align-items: flex-start; justify-content: center; padding: 44px 24px; overflow: auto; background: rgba(0, 0, 0, 0.5); }
.skm-modal { display: flex; flex-direction: column; width: 640px; max-width: 100%; max-height: 100%; border: 1px solid var(--dsw-alias-border-l1); border-radius: 16px; background: var(--dsw-alias-bg-layer-1); box-shadow: 0 24px 70px rgba(0, 0, 0, 0.4); }
.skm-modal-head { display: flex; align-items: flex-start; gap: 14px; padding: 22px 24px 14px; }
.skm-modal-icon { display: flex; flex: none; align-items: center; justify-content: center; width: 48px; height: 48px; }
.skm-modal-titlewrap { flex: 1; min-width: 0; }
.skm-modal-title { margin: 2px 0 0; font-size: 20px; line-height: 28px; font-weight: 600; }
.skm-modal-desc { margin: 4px 0 0; color: var(--dsw-alias-label-secondary); font-size: 12px; line-height: 19px; }
.skm-modal-actions { display: flex; flex: none; align-items: center; gap: 6px; }
.skm-switch { box-sizing: border-box; position: relative; flex: 0 0 auto; width: 36px; height: 20px; padding: 2px; border: 0; border-radius: 999px; corner-shape: round; background: var(--dsw-alias-border-l3); cursor: pointer; transition: background-color 120ms ease; }
.skm-switch[aria-checked='true'] { background: var(--dsw-alias-brand-primary); }
.skm-switch:disabled { cursor: default; opacity: 0.5; }
.skm-switch:focus-visible { outline: var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color, var(--dsw-alias-state-business-primary)); outline-offset: 2px; }
.skm-switch-knob { display: block; width: 16px; height: 16px; border-radius: 50%; corner-shape: round; background: var(--dsw-alias-switch-thumb, var(--dsw-alias-label-secondary)); transition: transform 120ms ease, background-color 120ms ease; }
.skm-switch[aria-checked='true'] .skm-switch-knob { background: var(--dsw-alias-label-primary-foreground); transform: translate(16px); }
.skm-menu-wrap { position: relative; }
.skm-menu { position: absolute; top: 38px; right: 0; z-index: 40; min-width: 176px; padding: 4px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; background: var(--dsw-alias-bg-overlay); box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25); }
.skm-menu button { display: block; width: 100%; padding: 7px 10px; border: 0; border-radius: 7px; background: transparent; color: var(--dsw-alias-label-primary); font: inherit; font-size: 12px; text-align: left; cursor: pointer; }
.skm-menu button:hover { background: var(--dsw-alias-bg-layer-2); }
.skm-modal-scroll { flex: 1; min-height: 0; max-height: 54vh; margin-top: 6px; padding: 14px 24px 4px; overflow: auto; border-top: 1px solid var(--dsw-alias-border-l1); }
.skm-markdown { color: var(--dsw-alias-label-primary); font-size: 13px; line-height: 21px; overflow-wrap: anywhere; }
.skm-markdown h1, .skm-markdown h2, .skm-markdown h3, .skm-markdown h4 { margin: 16px 0 6px; font-weight: 600; line-height: 1.4; }
.skm-markdown h1 { font-size: 17px; }
.skm-markdown h2 { font-size: 15px; }
.skm-markdown h3, .skm-markdown h4 { font-size: 13px; }
.skm-markdown p { margin: 8px 0; }
.skm-markdown ul, .skm-markdown ol { margin: 6px 0; padding-left: 22px; }
.skm-markdown li { margin: 3px 0; }
.skm-markdown a { color: var(--dsw-alias-brand-primary); text-decoration: none; }
.skm-markdown a:hover { text-decoration: underline; }
.skm-markdown pre { margin: 10px 0; padding: 12px; overflow: auto; border-radius: 8px; background: var(--dsw-alias-bg-layer-2); font-size: 12px; line-height: 18px; }
.skm-markdown code { padding: 1px 5px; border-radius: 5px; background: var(--dsw-alias-bg-layer-2); font-size: 12px; }
.skm-markdown pre code { padding: 0; background: transparent; }
.skm-markdown blockquote { margin: 8px 0; padding: 2px 12px; border-left: 3px solid var(--dsw-alias-border-l2); color: var(--dsw-alias-label-secondary); }
.skm-markdown hr { margin: 14px 0; border: 0; border-top: 1px solid var(--dsw-alias-border-l1); }
.skm-tags { display: flex; flex-wrap: wrap; gap: 6px; padding: 12px 0 6px; }
.skm-tag { padding: 2px 8px; border-radius: 6px; background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-secondary); font-size: 11px; line-height: 18px; }
.skm-modal-foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 24px 20px; }
.skm-danger { padding: 6px 10px; border: 0; border-radius: 8px; background: transparent; color: var(--dsw-alias-state-error-primary); font: inherit; font-size: 12px; cursor: pointer; }
.skm-danger:hover { background: var(--dsw-alias-bg-layer-2); }
.skm-danger:disabled { opacity: 0.6; cursor: default; }
.skm-add { width: 520px; padding: 24px; gap: 12px; }
.skm-add h2 { margin: 0; font-size: 18px; line-height: 26px; font-weight: 600; }
.skm-add p { margin: 0; color: var(--dsw-alias-label-secondary); font-size: 12px; line-height: 19px; }
.skm-field { display: flex; flex-direction: column; gap: 5px; }
.skm-field label { color: var(--dsw-alias-label-secondary); font-size: 11px; }
.skm-field input { height: 36px; padding: 0 10px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 8px; background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); font: inherit; font-size: 13px; }
.skm-field input:focus-visible { outline: none; border-color: var(--dsw-alias-brand-primary); }
.skm-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.skm-error { color: var(--dsw-alias-state-error-primary); font-size: 12px; line-height: 18px; }
.skm-add-foot { display: flex; justify-content: flex-end; gap: 8px; margin-top: 4px; }
.skm-secondary { height: 36px; padding: 0 14px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 18px; background: transparent; color: var(--dsw-alias-label-primary); font: inherit; font-size: 13px; cursor: pointer; }
.skm-secondary:hover { background: var(--dsw-alias-bg-layer-2); }
.skm-toast { position: absolute; bottom: 22px; left: 50%; z-index: 60; transform: translateX(-50%); max-width: 80%; padding: 8px 14px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; background: var(--dsw-alias-bg-overlay); color: var(--dsw-alias-label-primary); font-size: 12px; line-height: 18px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3); }
.skm-toast[data-tone='error'] { color: var(--dsw-alias-state-error-primary); }
.skm-spin { animation: skm-spin 900ms linear infinite; }
@keyframes skm-spin { to { transform: rotate(360deg); } }
@media (max-width: 760px) {
  .skm-content { padding: 20px 18px 32px; }
  .skm-head { flex-direction: column; gap: 14px; }
  .skm-tools { width: 100%; flex-wrap: wrap; }
  .skm-search { flex: 1; width: auto; min-width: 160px; }
  .skm-grid { grid-template-columns: minmax(0, 1fr); }
  .skm-row { grid-template-columns: minmax(0, 1fr); }
  .skm-overlay { padding: 16px; }
  .skm-modal-scroll { max-height: 50vh; }
}
`

    async function api(path, options = {}) {
      const headers = { 'x-skm-token': API_TOKEN }
      if (options.body !== undefined) headers['content-type'] = 'application/json'
      const response = await fetch(API + path, { ...options, headers })
      let data = {}
      try {
        data = await response.json()
      } catch {
        data = {}
      }
      if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`)
      if (data && data.error) throw new Error(data.error)
      return data
    }

    function CubeIcon({ size = 40 }) {
      return h(
        'svg',
        { width: size, height: size, viewBox: '0 0 48 48', fill: 'none', 'aria-hidden': 'true', focusable: 'false' },
        h('defs', null,
          h('linearGradient', { id: 'skm-cube-grad', x1: 8, y1: 6, x2: 40, y2: 44, gradientUnits: 'userSpaceOnUse' },
            h('stop', { offset: 0, stopColor: '#A78BFA' }),
            h('stop', { offset: 0.5, stopColor: '#60A5FA' }),
            h('stop', { offset: 1, stopColor: '#F472B6' }),
          ),
        ),
        h('path', { d: 'M24 5 41 14v20L24 43 7 34V14z', fill: 'url(#skm-cube-grad)' }),
        h('path', { d: 'M24 5 41 14 24 23 7 14z', fill: '#FFFFFF', fillOpacity: 0.5 }),
        h('path', { d: 'M24 23v20M7 14l17 9 17-9', stroke: '#FFFFFF', strokeOpacity: 0.65, strokeWidth: 1.6 }),
      )
    }

    function CubeGlyph({ size = 16 }) {
      return h(
        'svg',
        { width: size, height: size, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': 'true', focusable: 'false', style: { display: 'block' } },
        h('path', {
          d: 'M8 1.6 14 5v6L8 14.4 2 11V5z',
          stroke: 'currentColor',
          strokeWidth: 1.2,
          strokeLinejoin: 'round',
        }),
        h('path', { d: 'M8 1.6 14 5 8 8.4 2 5z', stroke: 'currentColor', strokeWidth: 1.2, strokeLinejoin: 'round' }),
        h('path', { d: 'M8 8.4v6', stroke: 'currentColor', strokeWidth: 1.2 }),
      )
    }

    function SearchIcon() {
      return h('svg', { width: 15, height: 15, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': 'true' },
        h('circle', { cx: 7, cy: 7, r: 4.4, stroke: 'currentColor', strokeWidth: 1.3 }),
        h('path', { d: 'm10.4 10.4 3 3', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round' }),
      )
    }

    function RefreshIcon() {
      return h('svg', { width: 15, height: 15, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': 'true' },
        h('path', { d: 'M13 7a5 5 0 1 0-1.2 4.4', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round' }),
        h('path', { d: 'M13 3v4H9', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round', strokeLinejoin: 'round' }),
      )
    }

    function PlusIcon() {
      return h('svg', { width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': 'true' },
        h('path', { d: 'M8 3v10M3 8h10', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round' }),
      )
    }

    function CheckIcon() {
      return h('svg', { width: 15, height: 15, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': 'true' },
        h('path', { d: 'm3 8.4 3 3L13 4.6', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }),
      )
    }

    function MoreIcon() {
      return h('svg', { width: 16, height: 16, viewBox: '0 0 16 16', fill: 'currentColor', 'aria-hidden': 'true' },
        h('circle', { cx: 3, cy: 8, r: 1.2 }),
        h('circle', { cx: 8, cy: 8, r: 1.2 }),
        h('circle', { cx: 13, cy: 8, r: 1.2 }),
      )
    }

    function CloseIcon() {
      return h('svg', { width: 15, height: 15, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': 'true' },
        h('path', { d: 'm4 4 8 8M12 4l-8 8', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round' }),
      )
    }

    function inline(text) {
      const out = []
      const re = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g
      let last = 0
      let match
      while ((match = re.exec(text)) !== null) {
        if (match.index > last) out.push(text.slice(last, match.index))
        const token = match[0]
        if (token.startsWith('**')) {
          out.push(h('strong', { key: match.index }, token.slice(2, -2)))
        } else if (token.startsWith('`')) {
          out.push(h('code', { key: match.index }, token.slice(1, -1)))
        } else {
          const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token)
          out.push(h('a', { key: match.index, href: link[2], target: '_blank', rel: 'noreferrer' }, link[1]))
        }
        last = match.index + token.length
      }
      if (last < text.length) out.push(text.slice(last))
      return out
    }

    function renderMarkdown(text) {
      const lines = String(text || '').replace(/\r\n/g, '\n').split('\n')
      const out = []
      let i = 0
      let key = 0
      while (i < lines.length) {
        const line = lines[i]
        if (line.startsWith('```')) {
          const code = []
          i += 1
          while (i < lines.length && !lines[i].startsWith('```')) {
            code.push(lines[i])
            i += 1
          }
          i += 1
          out.push(h('pre', { key: key++ }, h('code', null, code.join('\n'))))
          continue
        }
        const heading = /^(#{1,4})\s+(.*)$/.exec(line)
        if (heading) {
          const level = Math.min(4, heading[1].length + 1)
          out.push(h(`h${level}`, { key: key++ }, inline(heading[2])))
          i += 1
          continue
        }
        if (/^\s*[-*]\s+/.test(line)) {
          const items = []
          while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
            items.push(lines[i].replace(/^\s*[-*]\s+/, ''))
            i += 1
          }
          out.push(h('ul', { key: key++ }, items.map((item, index) => h('li', { key: index }, inline(item)))))
          continue
        }
        if (/^\s*\d+\.\s+/.test(line)) {
          const items = []
          while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
            items.push(lines[i].replace(/^\s*\d+\.\s+/, ''))
            i += 1
          }
          out.push(h('ol', { key: key++ }, items.map((item, index) => h('li', { key: index }, inline(item)))))
          continue
        }
        if (/^\s*>\s?/.test(line)) {
          const block = []
          while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
            block.push(lines[i].replace(/^\s*>\s?/, ''))
            i += 1
          }
          out.push(h('blockquote', { key: key++ }, inline(block.join(' '))))
          continue
        }
        if (/^\s*(---|\*\*\*)\s*$/.test(line)) {
          out.push(h('hr', { key: key++ }))
          i += 1
          continue
        }
        if (line.trim() === '') {
          i += 1
          continue
        }
        const paragraph = []
        while (
          i < lines.length &&
          lines[i].trim() !== '' &&
          !/^(#{1,4})\s+|^\s*[-*]\s+|^\s*\d+\.\s+|^```|^\s*>/.test(lines[i])
        ) {
          paragraph.push(lines[i])
          i += 1
        }
        out.push(h('p', { key: key++ }, inline(paragraph.join(' '))))
      }
      return out
    }

    function Toggle({ checked, disabled, onChange, label }) {
      return h(
        'button',
        {
          type: 'button',
          role: 'switch',
          'aria-checked': checked ? 'true' : 'false',
          'aria-label': label,
          className: 'skm-switch',
          'data-on': checked ? 'true' : 'false',
          disabled,
          onClick: () => onChange(!checked),
        },
        h('span', { className: 'skm-switch-knob' }),
      )
    }

    function SkillsPage({ t }) {
      const [skills, setSkills] = React.useState([])
      const [loading, setLoading] = React.useState(true)
      const [refreshing, setRefreshing] = React.useState(false)
      const [error, setError] = React.useState('')
      const [query, setQuery] = React.useState('')
      const [filter, setFilter] = React.useState('all')
      const [selected, setSelected] = React.useState(null)
      const [detail, setDetail] = React.useState(null)
      const [detailLoading, setDetailLoading] = React.useState(false)
      const [detailError, setDetailError] = React.useState('')
      const [addOpen, setAddOpen] = React.useState(false)
      const [form, setForm] = React.useState({ source: '', subdir: '', name: '' })
      const [installError, setInstallError] = React.useState('')
      const [busy, setBusy] = React.useState('')
      const [menuOpen, setMenuOpen] = React.useState(false)
      const [confirmRemove, setConfirmRemove] = React.useState(false)
      const [toast, setToast] = React.useState(null)
      const toastTimer = React.useRef(null)
      const mounted = React.useRef(true)

      const notify = React.useCallback((text, tone = 'ok') => {
        setToast({ text, tone })
        if (toastTimer.current !== null) clearTimeout(toastTimer.current)
        toastTimer.current = setTimeout(() => {
          if (mounted.current) setToast(null)
        }, 2600)
      }, [])

      const load = React.useCallback(async (silent = false) => {
        if (silent) setRefreshing(true)
        else setLoading(true)
        try {
          const data = await api('/skills')
          if (!mounted.current) return
          setSkills(Array.isArray(data.skills) ? data.skills : [])
          setError('')
        } catch (cause) {
          if (!mounted.current) return
          if (!silent) setError(cause instanceof Error ? cause.message : String(cause))
          else notify(cause instanceof Error ? cause.message : String(cause), 'error')
        } finally {
          if (mounted.current) {
            setLoading(false)
            setRefreshing(false)
          }
        }
      }, [notify])

      React.useEffect(() => {
        mounted.current = true
        load()
        return () => {
          mounted.current = false
          if (toastTimer.current !== null) clearTimeout(toastTimer.current)
        }
      }, [load])

      const openDetail = React.useCallback(async (skill) => {
        setSelected(skill)
        setDetail(null)
        setDetailError('')
        setDetailLoading(true)
        setMenuOpen(false)
        setConfirmRemove(false)
        try {
          const data = await api(`/skill?name=${encodeURIComponent(skill.name)}`)
          if (mounted.current) setDetail(data)
        } catch (cause) {
          if (mounted.current) setDetailError(cause instanceof Error ? cause.message : String(cause))
        } finally {
          if (mounted.current) setDetailLoading(false)
        }
      }, [])

      const closeDetail = () => {
        if (busy !== '') return
        setSelected(null)
        setDetail(null)
        setDetailError('')
        setMenuOpen(false)
        setConfirmRemove(false)
      }

      const toggle = async (next) => {
        if (!detail || busy !== '') return
        setBusy('toggle')
        try {
          await api('/toggle', {
            method: 'POST',
            body: JSON.stringify({ name: detail.name, enabled: next }),
          })
          setDetail({ ...detail, enabled: next })
          await load(true)
          notify(next ? t('enabled') : t('disabled'))
        } catch (cause) {
          notify(cause instanceof Error ? cause.message : t('toggleFailed'), 'error')
        } finally {
          setBusy('')
        }
      }

      const remove = async () => {
        if (!detail || busy !== '') return
        if (!confirmRemove) {
          setConfirmRemove(true)
          return
        }
        setBusy('remove')
        try {
          await api('/remove', {
            method: 'POST',
            body: JSON.stringify({ name: detail.name }),
          })
          setSelected(null)
          setDetail(null)
          setConfirmRemove(false)
          await load(true)
          notify(t('remove'))
        } catch (cause) {
          notify(cause instanceof Error ? cause.message : t('removeFailed'), 'error')
        } finally {
          setBusy('')
        }
      }

      const update = async () => {
        if (!detail || busy !== '') return
        setBusy('update')
        try {
          await api('/update', {
            method: 'POST',
            body: JSON.stringify({ name: detail.name }),
          })
          setMenuOpen(false)
          await openDetail(detail)
          await load(true)
          notify(t('updatedToast'))
        } catch (cause) {
          notify(cause instanceof Error ? cause.message : t('update'), 'error')
        } finally {
          setBusy('')
        }
      }

      const reveal = async (mode) => {
        if (!detail) return
        setMenuOpen(false)
        try {
          await api('/reveal', {
            method: 'POST',
            body: JSON.stringify({ name: detail.name, mode }),
          })
        } catch (cause) {
          notify(cause instanceof Error ? cause.message : t('toggleFailed'), 'error')
        }
      }

      const copyContent = async () => {
        if (!detail) return
        try {
          await navigator.clipboard.writeText(detail.content)
          notify(t('copied'))
        } catch {
          notify(t('copyFailed'), 'error')
        }
      }

      const trySkill = async () => {
        if (!detail) return
        try {
          await navigator.clipboard.writeText(`请使用 ${detail.title} 技能：`)
          notify(t('tryCopied'))
        } catch {
          notify(t('tryCopied'))
        }
      }

      const install = async (event) => {
        event.preventDefault()
        if (busy !== '') return
        setInstallError('')
        setBusy('install')
        try {
          await api('/install', {
            method: 'POST',
            body: JSON.stringify({
              source: form.source.trim(),
              subdir: form.subdir.trim(),
              name: form.name.trim(),
            }),
          })
          setAddOpen(false)
          setForm({ source: '', subdir: '', name: '' })
          await load(true)
          notify(t('installedToast'))
        } catch (cause) {
          setInstallError(cause instanceof Error ? cause.message : t('installFailed'))
        } finally {
          setBusy('')
        }
      }

      const openRoot = async () => {
        try {
          await api('/open-root', { method: 'POST', body: '{}' })
        } catch (cause) {
          notify(cause instanceof Error ? cause.message : t('toggleFailed'), 'error')
        }
      }

      const filtered = React.useMemo(() => {
        const q = query.trim().toLowerCase()
        return skills.filter((skill) => {
          if (filter === 'enabled' && !skill.enabled) return false
          if (filter === 'disabled' && skill.enabled) return false
          if (q === '') return true
          return `${skill.title} ${skill.description} ${(skill.tags || []).join(' ')}`.toLowerCase().includes(q)
        })
      }, [skills, query, filter])

      const enabledCount = skills.filter((skill) => skill.enabled).length
      const disabledCount = skills.length - enabledCount

      const tabs = [
        { id: 'all', label: t('all'), count: skills.length },
        { id: 'enabled', label: t('enabled'), count: enabledCount },
        { id: 'disabled', label: t('disabled'), count: disabledCount },
      ]

      const tags = detail && Array.isArray(detail.tags) ? detail.tags : []

      return h(
        'section',
        { className: 'skm-page', 'aria-label': t('title') },
        h('style', null, CSS),
        h(
          'div',
          { className: 'skm-scroll' },
          h(
            'div',
            { className: 'skm-content' },
            h(
              'div',
              { className: 'skm-head' },
              h(
                'div',
                { className: 'skm-heading' },
                h('h1', null, t('title')),
                h('p', null, t('subtitle')),
              ),
              h(
                'div',
                { className: 'skm-tools' },
                h(
                  'div',
                  { className: 'skm-search' },
                  h(SearchIcon),
                  h('input', {
                    type: 'search',
                    value: query,
                    placeholder: t('search'),
                    'aria-label': t('search'),
                    onChange: (event) => setQuery(event.target.value),
                  }),
                ),
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'skm-icon-btn',
                    'aria-label': t('refresh'),
                    title: t('refresh'),
                    onClick: () => load(true),
                    disabled: refreshing,
                  },
                  h('span', { className: refreshing ? 'skm-spin' : undefined }, h(RefreshIcon)),
                ),
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'skm-primary',
                    onClick: () => {
                      setInstallError('')
                      setAddOpen(true)
                    },
                  },
                  h(PlusIcon),
                  t('add'),
                ),
              ),
            ),
            h(
              'div',
              { className: 'skm-tabs', role: 'tablist' },
              tabs.map((tab) =>
                h(
                  'button',
                  {
                    key: tab.id,
                    type: 'button',
                    role: 'tab',
                    'aria-selected': filter === tab.id ? 'true' : 'false',
                    className: 'skm-tab',
                    'data-active': filter === tab.id ? 'true' : 'false',
                    onClick: () => setFilter(tab.id),
                  },
                  `${tab.label} ${tab.count}`,
                ),
              ),
            ),
            h(
              'div',
              { className: 'skm-section' },
              h('h2', null, t('installed')),
              h('span', null, `${skills.length} ${t('installed')}`),
            ),
            loading
              ? h('div', { className: 'skm-state' }, t('loading'))
              : error !== ''
                ? h(
                    'div',
                    { className: 'skm-empty' },
                    h(CubeIcon, { size: 56 }),
                    h('h3', null, t('loadFailed')),
                    h('p', null, error),
                    h(
                      'button',
                      { type: 'button', className: 'skm-primary', onClick: () => load() },
                      t('retry'),
                    ),
                  )
                : skills.length === 0
                  ? h(
                      'div',
                      { className: 'skm-empty' },
                      h(CubeIcon, { size: 56 }),
                      h('h3', null, t('empty')),
                      h('p', null, t('emptyHint')),
                      h(
                        'button',
                        { type: 'button', className: 'skm-primary', onClick: () => setAddOpen(true) },
                        h(PlusIcon),
                        t('add'),
                      ),
                    )
                  : filtered.length === 0
                    ? h('div', { className: 'skm-state' }, t('noMatches'))
                    : h(
                        'div',
                        { className: 'skm-grid' },
                        filtered.map((skill) =>
                          h(
                            'button',
                            {
                              key: skill.name,
                              type: 'button',
                              className: 'skm-card',
                              'aria-label': skill.title,
                              onClick: () => openDetail(skill),
                            },
                            h('span', { className: 'skm-card-icon' }, h(CubeIcon, { size: 38 })),
                            h(
                              'span',
                              { className: 'skm-card-body' },
                              h(
                                'span',
                                { className: 'skm-card-name' },
                                skill.title,
                                skill.enabled
                                  ? null
                                  : h('span', { className: 'skm-badge' }, t('disabled')),
                              ),
                              h(
                                'span',
                                { className: 'skm-card-desc' },
                                skill.description || t('noDescription'),
                              ),
                            ),
                            skill.enabled
                              ? h('span', { className: 'skm-check', 'aria-hidden': 'true' }, h(CheckIcon))
                              : null,
                          ),
                        ),
                      ),
            h(
              'div',
              { className: 'skm-foot' },
              h('span', null, t('rootHint')),
              h('button', { type: 'button', onClick: openRoot }, t('openRoot')),
            ),
          ),
        ),
        selected
          ? h(
              'div',
              {
                className: 'skm-overlay',
                onMouseDown: (event) => {
                  if (event.target === event.currentTarget) closeDetail()
                },
              },
              h(
                'div',
                {
                  className: 'skm-modal',
                  role: 'dialog',
                  'aria-modal': 'true',
                  'aria-label': t('detailLabel'),
                },
                h(
                  'div',
                  { className: 'skm-modal-head' },
                  h('div', { className: 'skm-modal-icon' }, h(CubeIcon, { size: 46 })),
                  h(
                    'div',
                    { className: 'skm-modal-titlewrap' },
                    h('h2', { className: 'skm-modal-title' }, `${detail ? detail.title : selected.title} Skill`),
                    h(
                      'p',
                      { className: 'skm-modal-desc' },
                      detail ? detail.description || t('noDescription') : '',
                    ),
                  ),
                  h(
                    'div',
                    { className: 'skm-modal-actions' },
                    h(Toggle, {
                      checked: detail ? detail.enabled : selected.enabled,
                      disabled: busy !== '',
                      onChange: toggle,
                      label: t('enabledLabel'),
                    }),
                    h(
                      'div',
                      { className: 'skm-menu-wrap' },
                      h(
                        'button',
                        {
                          type: 'button',
                          className: 'skm-icon-btn',
                          'aria-label': t('more'),
                          title: t('more'),
                          onClick: () => setMenuOpen((value) => !value),
                        },
                        h(MoreIcon),
                      ),
                      menuOpen
                        ? h(
                            'div',
                            { className: 'skm-menu', role: 'menu' },
                            h('button', { type: 'button', role: 'menuitem', onClick: () => reveal('open') }, t('open')),
                            h('button', { type: 'button', role: 'menuitem', onClick: () => reveal('finder') }, t('reveal')),
                            h('button', { type: 'button', role: 'menuitem', onClick: copyContent }, t('copy')),
                            detail && detail.source
                              ? h('button', { type: 'button', role: 'menuitem', onClick: update, disabled: busy !== '' }, busy === 'update' ? t('updating') : t('update'))
                              : null,
                          )
                        : null,
                    ),
                    h(
                      'button',
                      {
                        type: 'button',
                        className: 'skm-icon-btn',
                        'aria-label': t('close'),
                        title: t('close'),
                        onClick: closeDetail,
                      },
                      h(CloseIcon),
                    ),
                  ),
                ),
                h(
                  'div',
                  { className: 'skm-modal-scroll' },
                  detailLoading
                    ? h('div', { className: 'skm-state' }, t('loading'))
                    : detailError !== ''
                      ? h(
                          'div',
                          { className: 'skm-empty' },
                          h('h3', null, t('detailFailed')),
                          h('p', null, detailError),
                          h(
                            'button',
                            { type: 'button', className: 'skm-secondary', onClick: () => openDetail(selected) },
                            t('retry'),
                          ),
                        )
                      : h('div', { className: 'skm-markdown' }, renderMarkdown(detail ? detail.content : '')),
                  tags.length > 0
                    ? h(
                        'div',
                        { className: 'skm-tags' },
                        tags.map((tag) => h('span', { key: tag, className: 'skm-tag' }, tag)),
                      )
                    : null,
                ),
                h(
                  'div',
                  { className: 'skm-modal-foot' },
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'skm-danger',
                      disabled: busy !== '',
                      onClick: remove,
                    },
                    busy === 'remove' ? t('removing') : confirmRemove ? t('confirmRemove') : t('remove'),
                  ),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'skm-primary',
                      onClick: trySkill,
                    },
                    h(PlusIcon),
                    t('try'),
                  ),
                ),
              ),
            )
          : null,
        addOpen
          ? h(
              'div',
              {
                className: 'skm-overlay',
                onMouseDown: (event) => {
                  if (event.target === event.currentTarget && busy === '') setAddOpen(false)
                },
              },
              h(
                'form',
                {
                  className: 'skm-modal skm-add',
                  onSubmit: install,
                  role: 'dialog',
                  'aria-modal': 'true',
                  'aria-label': t('addTitle'),
                },
                h('h2', null, t('addTitle')),
                h('p', null, t('addHint')),
                h(
                  'div',
                  { className: 'skm-field' },
                  h('label', { htmlFor: 'skm-source' }, t('source')),
                  h('input', {
                    id: 'skm-source',
                    value: form.source,
                    placeholder: t('sourcePlaceholder'),
                    autoFocus: true,
                    onChange: (event) => setForm({ ...form, source: event.target.value }),
                  }),
                ),
                h(
                  'div',
                  { className: 'skm-row' },
                  h(
                    'div',
                    { className: 'skm-field' },
                    h('label', { htmlFor: 'skm-subdir' }, t('subdir')),
                    h('input', {
                      id: 'skm-subdir',
                      value: form.subdir,
                      placeholder: t('subdirPlaceholder'),
                      onChange: (event) => setForm({ ...form, subdir: event.target.value }),
                    }),
                  ),
                  h(
                    'div',
                    { className: 'skm-field' },
                    h('label', { htmlFor: 'skm-name' }, t('name')),
                    h('input', {
                      id: 'skm-name',
                      value: form.name,
                      placeholder: t('namePlaceholder'),
                      onChange: (event) => setForm({ ...form, name: event.target.value }),
                    }),
                  ),
                ),
                installError !== '' ? h('div', { className: 'skm-error' }, installError) : null,
                h(
                  'div',
                  { className: 'skm-add-foot' },
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'skm-secondary',
                      disabled: busy !== '',
                      onClick: () => setAddOpen(false),
                    },
                    t('cancel'),
                  ),
                  h(
                    'button',
                    {
                      type: 'submit',
                      className: 'skm-primary',
                      disabled: busy !== '' || form.source.trim() === '',
                    },
                    busy === 'install' ? t('installing') : t('install'),
                  ),
                ),
              ),
            )
          : null,
        toast
          ? h('div', { className: 'skm-toast', 'data-tone': toast.tone, role: 'status' }, toast.text)
          : null,
      )
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        for (const [locale, dict] of Object.entries(DICTS)) {
          ctx.effect(
            () => ctx.locale.register(NS, locale, dict),
            `skill-manager-panel:${locale}`,
          )
        }
        const t = ctx.locale.bind(NS)

        ctx.slots.inject('main', () =>
          ctx.slots.register({ name: 'main', key: 'skills', locale: NS }, SkillsPage),
        )
        ctx.slots.inject('sidebar.panellist', () =>
          ctx.slots.register(
            {
              name: 'sidebar.panellist',
              id: 'skills',
              order: 1,
              label: () => t('panel'),
            },
            CubeGlyph,
          ),
        )
      },
    }
  },
})
