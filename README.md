# DSH Skill Manager

为 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 提供的**可视化技能管理面板**。左侧栏「插件」下方新增「技能」入口，用来查看、搜索、启停、安装和卸载本机技能。

A visual manager for local DSH skills, rendered as a left-sidebar panel. Manage the `~/.dsh/skills` catalog without leaving the Harness UI.

## 功能

- **技能列表**：双列卡片、启用勾选、停用标记、来源/版本/脚本标签
- **搜索与筛选**：按名称、描述、标签搜索；全部 / 已启用 / 已停用
- **详情页**：完整的 `SKILL.md` 内容（Markdown 渲染）、描述、标签
- **启用 / 停用**：停用的技能移到 `.system/disabled`，随时可恢复
- **卸载**：默认移到 `.system/trash`，可手动恢复；不会直接删除文件
- **安装**：支持 `owner/repo`、GitHub URL 或本地目录，可选子目录/名称
- **更新**：先检查来源，没有新版本时提示「已是最新」，只有存在更新才重新拉取（先备份旧版本）
- **快捷操作**：打开目录、在文件管理器中显示、复制 Markdown、复制试用提示
- **明暗主题**：全部使用 DSH 主题令牌；开关、按钮与「插件」页保持同一套样式

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

安装后无需重启，侧栏会自动出现「技能」入口（必要时刷新页面）。

## 使用

- **添加技能**：右上角「添加」→ 填仓库，例如 `nextlevelbuilder/ui-ux-pro-max-skill`；多技能仓库用「子目录」指定包含 `SKILL.md` 的路径。
- **管理技能**：点卡片进入详情；右上角开关启用/停用；`...` 菜单可打开目录、在 Finder 中显示、复制 Markdown、更新。
- **卸载**：详情页左下角「卸载」→ 再点一次「确认卸载」。文件会进入 `~/.dsh/skills/.system/trash`，可手动恢复。
- **搜索**：支持名称、描述和标签；筛选标签会显示数量。

## 环境要求

- DSH Desktop / Web，且启用 Web carrier（面板页面需要）
- 管理目录：`~/.dsh/skills`（可用 `DSH_HOME` 覆盖；安装操作通过 `DSH_SKILLS_DIR` 同步给内置 CLI）
- **macOS / Linux**：完整功能
- **Windows**：浏览、搜索、详情可用；安装/启停/卸载需要 Git Bash 或 WSL 提供 `bash` 与 `git`
- 从 GitHub 安装技能时需要 `git`

## 工作原理

- **Host 半**（`index.js`）：通过 `webServer` 注册 `/skill-manager/api`，读取 `~/.dsh/skills`、解析 frontmatter、返回详情；写操作复用随包分发的 `dsh-skills` CLI。
- **Client 半**（`client.js`）：注册 `sidebar.panellist` 的「技能」入口和 `main` 的 `skills` 页面；通过同源 `fetch` 调用上面的本地 API。
- **安全**：API 只监听 DSH 的本地 Web 端口，并要求 `x-skm-token` 请求头；不包含遥测、不上传技能内容。
- **数据位置**：只读写 `~/.dsh/skills`，不会改动 DSH 安装目录或其他插件。

## 目录结构

```
skill-manager-for-DSH/
├── package.json          # DSH bundle 清单 + dsh.client 声明
├── cordis.patch.yml      # 插入 skill-manager-panel 行
├── index.js              # Host 半：本地 JSON API
├── client.js             # Client 半：侧边栏入口 + 列表/详情/添加
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
