# DSH Skill Manager

为 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 提供的**可视化技能管理面板**。左侧栏「插件」下方新增「技能」入口，用来查看、搜索、启停、安装和卸载本机技能。

A visual manager for local DSH skills, rendered as a left-sidebar panel. Manage the `~/.dsh/skills` catalog without leaving the Harness UI.

## 功能

- **技能列表**：双列卡片、启用勾选、停用标记、来源/版本/脚本标签
- **中英双语**：右上角「中文 / English」切换，默认中文；名称、简介和功能说明会自动翻译，之后新装的技能同样生效
- **搜索与筛选**：按中英文名称、描述、标签搜索；全部 / 已启用 / 已停用
- **详情页**：完整的 `SKILL.md` 内容（Markdown 渲染）、描述、标签；中文模式可一键查看原文
- **启用 / 停用**：停用的技能移到 `.system/disabled`，随时可恢复
- **卸载**：默认移到 `.system/trash`，可手动恢复；不会直接删除文件
- **安装**：支持 `owner/repo`、GitHub URL 或本地目录，可选子目录/名称
- **更新**：先检查来源，没有新版本时提示「已是最新」，只有存在更新才重新拉取（先备份旧版本）
- **快捷操作**：打开目录、在文件管理器中显示、复制 Markdown、复制试用提示
- **明暗主题**：全部使用 DSH 主题令牌；开关、按钮与「插件」页保持同一套样式
- **翻译缓存**：翻译结果按技能内容指纹缓存，技能更新后自动失效重译

## 安装

### 方式一：DSH 插件页（推荐）

1. 打开 DSH 左侧栏的 **插件**。
2. 点右上角 **添加**。
3. 填入以下任一形式：
   - `github:Dawnpoet-hub/skill-manager-for-DSH`
   - `https://github.com/Dawnpoet-hub/skill-manager-for-DSH`
4. 安装并启用 bundle。
5. 左侧栏出现 **技能** 图标，点开即可使用。

> 如果你的 DSH 版本只接受本地目录：先 `git clone` 本仓库，然后在「添加」里选择克隆下来的目录。

### 方式二：本地目录

```bash
git clone https://github.com/Dawnpoet-hub/skill-manager-for-DSH.git
```

然后在 DSH 插件页选择这个目录安装；或在支持 `dsh plugin` 命令的版本中执行：

```bash
dsh plugin add ./skill-manager-for-DSH
```

首次安装通常无需重启，侧栏会自动出现「技能」入口；更新已安装版本后如仍显示旧界面，请重启 DSH 并刷新页面。

## 使用

- **添加技能**：右上角「添加」→ 填仓库，例如 `nextlevelbuilder/ui-ux-pro-max-skill`；多技能仓库用「子目录」指定包含 `SKILL.md` 的路径。
- **管理技能**：点卡片进入详情；右上角开关启用/停用；`...` 菜单可打开目录、在 Finder 中显示、复制 Markdown、更新。
- **卸载**：详情页左下角「卸载」→ 再点一次「确认卸载」。文件会进入 `~/.dsh/skills/.system/trash`，可手动恢复。
- **搜索**：支持名称、描述和标签；筛选标签会显示数量。
- **切换语言**：右上角「中文 / English」。默认中文；切到 English 不发翻译请求，直接显示 `SKILL.md` 原文。

## 中文翻译

- 默认显示中文。技能列表加载后自动翻译名称与简介；打开详情时翻译全文（首次可能需要几秒）。
- 翻译通过 DSH 自带的 `translator` 服务完成，默认提供方是 Bing；可在 DSH 的翻译设置中更换提供方。
- 代码块、行内代码、命令、链接和文件路径会被保护，翻译后保持原文，不会把可执行内容译成中文。
- 翻译结果缓存在 `~/.dsh/skill-manager/translations.json`，按 `SKILL.md` 内容指纹失效；更新/重装技能后会自动重译。
- 机器翻译不保证术语完全准确。需要逐字核对时，点「查看原文」或切换到 English。
- 翻译失败时显示原文并给出「重试翻译」，不会挡住技能管理功能。

### 隐私说明

开启中文显示时，技能名称、简介和说明文本会发送到 DSH `translator` 服务当前配置的提供方（默认 Bing）用于翻译；缓存只保存在本机。切到 English 可停止后续翻译请求。若技能内容包含不能外发的信息，请使用 English 显示。

## 环境要求

- DSH Desktop / Web，且启用 Web carrier（面板页面需要）
- 中文翻译需要 DSH 提供 `translator` 服务（随 DSH 提供）；不可用时仍显示原文和内置的中文名称/简介
- 管理目录：`~/.dsh/skills`（可用 `DSH_HOME` 覆盖；安装操作通过 `DSH_SKILLS_DIR` 同步给内置 CLI）
- **macOS / Linux**：完整功能
- **Windows**：浏览、搜索、详情可用；安装/启停/卸载需要 Git Bash 或 WSL 提供 `bash` 与 `git`
- 从 GitHub 安装技能时需要 `git`

## 工作原理

- **Host 半**（`index.js` + `translation.js`）：通过 `webServer` 注册 `/skill-manager/api`，读取 `~/.dsh/skills`、解析 frontmatter、返回详情并调用 DSH `translator` 服务；写操作复用随包分发的 `dsh-skills` CLI。
- **Client 半**（`client.js`）：注册 `sidebar.panellist` 的「技能」入口和 `main` 的 `skills` 页面；通过同源 `fetch` 调用上面的本地 API。
- **安全**：API 只监听 DSH 的本地 Web 端口，并要求 `x-skm-token` 请求头；不包含遥测。开启中文翻译时，技能文本会发送到 DSH 翻译服务配置的提供方，详见上方「隐私说明」。
- **数据位置**：技能读写 `~/.dsh/skills`；翻译缓存写入 `~/.dsh/skill-manager/translations.json`；不会改动 DSH 安装目录或其他插件。

## 目录结构

```
skill-manager-for-DSH/
├── package.json          # DSH bundle 清单 + dsh.client 声明
├── cordis.patch.yml      # 插入 skill-manager-panel 行
├── index.js              # Host 半：本地 JSON API
├── translation.js        # Host 半：Markdown 保护、分块、重试与翻译缓存辅助
├── client.js             # Client 半：侧边栏入口 + 列表/详情/添加 + 中英切换
├── dsh-skills            # 随包分发的技能管理 CLI
├── locale/zh.json        # 插件管理器显示文案
├── locale/en.json
├── icon.svg
├── LICENSE
└── README.md
```

内置 CLI 也可以单独使用：

```bash
./dsh-skills list
./dsh-skills install owner/repo --subdir path/to/skill
./dsh-skills disable <name>
./dsh-skills enable <name>
./dsh-skills remove <name>
./dsh-skills check <name>
./dsh-skills doctor
```

`check` 会输出 `STATUS=up-to-date` 或 `STATUS=update-available`；`update` 内部会先做同样的检查，无更新时不会重装。

## 卸载

在 DSH 插件页停用/移除本 bundle 即可。技能本身不会被删除；如需清理，可手动处理 `~/.dsh/skills`。

## License

MIT © 2026 Dawnpoet-hub
