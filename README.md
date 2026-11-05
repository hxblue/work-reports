# 工作汇报

用 HTML 做的工作汇报幻灯片。每份都是一个单独的 HTML 文件，双击就能在浏览器里打开，不需要联网，也能在浏览器里直接编辑。

在线查看：<https://hxblue.github.io/work-reports/>

## 汇报列表

| 日期 | 主题 | 在线查看 | 文件 |
|---|---|---|---|
| 2026-11 | 第一周工作汇报：AI Agent 中台调研与原型 | [打开](https://hxblue.github.io/work-reports/2026-11-week1-agent-hub/) | [index.html](2026-11-week1-agent-hub/index.html) |

## 怎么看、怎么编辑

- 翻页：方向键 ↓ / ↑、空格或鼠标滚轮。
- 鼠标移到左上角，会出现激光笔、全屏，以及编辑按钮。
- 按 `E` 进入编辑模式：点文字直接改，点图片可以换图，左上角 Pages 可以调页序、复制页、加新页。
- `Ctrl+S` 只把修改存在你自己的浏览器里。要留下修改，用 Pages 侧栏里的 **Export HTML** 导出文件。

## 目录

```
build.mjs                     生成脚本
templates/signal/             幻灯片模板（Signal 风格）和原作者的许可证
2026-11-week1-agent-hub/
  index.html                  生成好的汇报
  report.json                 标题、模板、输出文件名
  source/slides.html          幻灯片内容
  source/extra.css            这一期额外的样式
  assets/                     图片
```

## 新加一份汇报

1. 复制一个已有的汇报目录，改名，例如 `2026-12-monthly-review`。
2. 改 `report.json` 里的 `title` 和 `deckId`（`deckId` 每份要不同，否则浏览器里的草稿会互相覆盖）。
3. 改 `source/slides.html`。每页以 `<!-- 序号 说明 -->` 开头；可编辑的文字加 `data-s`，图片放进 `assets/` 后用 `{{IMG:文件名}}` 引用。
4. 运行 `node build.mjs 2026-12-monthly-review`，生成 `index.html`。
5. 在上面的汇报列表里加一行。

改内容时选一种方式：要么改 `source/` 后重新生成，要么在浏览器里改完再导出。两种混用的话，重新生成会覆盖浏览器里的修改。

需要 Node.js 18 或更新版本，没有其他依赖。

## 致谢与许可证

幻灯片模板和编辑功能来自：

- [frontend-slides-editable](https://github.com/archlizheng/frontend-slides-editable)，MIT 许可证，Copyright (c) 2026 LI ZHENG
- [beautiful-html-templates](https://github.com/zarazhangrui/beautiful-html-templates)，MIT 许可证，Copyright (c) 2026 Zara Zhang

许可证全文见 `templates/signal/` 目录。
