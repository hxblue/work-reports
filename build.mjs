// 生成汇报 HTML：templates/ 里的模板样式与编辑运行时 + 某一期的幻灯片内容
//
// 用法：node build.mjs <汇报目录>
//   例：node build.mjs 2026-11-week1-agent-hub
//
// 汇报目录里需要：
//   report.json        { "title": "...", "deckId": "...", "template": "signal/signal-gold.html", "output": "index.html" }
//   source/slides.html 幻灯片内容，每页以 <!-- 序号 说明 --> 开头
//   source/extra.css   这一期额外的样式（可选）
//   assets/            图片，在 slides.html 里用 {{IMG:文件名}} 引用，会内嵌成 data URL
//
// slides.html 里的简写：
//   data-s              → 可编辑文字槽位
//   data-edit-slot-image → 可替换的图片槽位
//   {{P}} / {{N}}        → 当前页码 / 总页数
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const reportDir = process.argv[2] ? resolve(root, process.argv[2]) : null;
if (!reportDir || !existsSync(join(reportDir, "report.json"))) {
  console.error("usage: node build.mjs <汇报目录>（目录里要有 report.json）");
  process.exit(1);
}
const cfg = JSON.parse(readFileSync(join(reportDir, "report.json"), "utf8"));

// === 模板：截取 #deck 之前的样式和编辑界面、之后的运行时脚本 ===
const tpl = readFileSync(join(root, "templates", cfg.template), "utf8");
const deckOpen = '<div id="deck" class="slides-offset stage" data-ported-template="signal">';
const start = tpl.indexOf(deckOpen);
const runtime = tpl.indexOf('<script id="swiss-slot-edit-runtime-js">');
if (start < 0 || runtime < 0) throw new Error("模板里找不到 #deck 或运行时脚本");
const deckClose = tpl.lastIndexOf("</div>", runtime);

let head = tpl.slice(0, start + deckOpen.length);
const tail = tpl.slice(deckClose);

// 每期用自己的 deck id，避免浏览器草稿互相覆盖
head = head.replace(/data-deck-id="[^"]*"/, `data-deck-id="${cfg.deckId}"`);
const title = `<title>${cfg.title}</title>`;
head = /<title>/.test(head) ? head.replace(/<title>[\s\S]*?<\/title>/, title) : head.replace("<head>", `<head>\n    ${title}`);

const extraPath = join(reportDir, "source", "extra.css");
if (existsSync(extraPath)) {
  const at = head.lastIndexOf("</style>");
  head = head.slice(0, at) + "\n" + readFileSync(extraPath, "utf8") + "\n" + head.slice(at);
}

// === 幻灯片 ===
const mime = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml" };
const embed = (name) => {
  const p = join(reportDir, "assets", name);
  if (!existsSync(p)) throw new Error(`找不到图片 assets/${name}`);
  return `data:${mime[extname(name).toLowerCase()] || "application/octet-stream"};base64,` + readFileSync(p).toString("base64");
};

const src = readFileSync(join(reportDir, "source", "slides.html"), "utf8");
const sections = src.split(/(?=<!-- \d+ )/).filter((s) => s.includes("<section"));
const N = sections.length;
const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

const slides = sections.map((sec, i) => {
  const page = String(i + 1).padStart(2, "0");
  let slot = 0;
  let out = sec
    .replace('<section class="', `<section id="slide-${i}" data-template-slide-index="${i + 1}" class="`)
    .replaceAll("{{P}}", page)
    .replaceAll("{{N}}", String(N).padStart(2, "0"))
    .replace(/\{\{IMG:([^}]+)\}\}/g, (m, name) => embed(name.trim()));
  out = out.replace(/<([a-z0-9]+)([^>]*?) data-s(?=[\s>])([^>]*)>([\s\S]*?)<\/\1>/g, (m, tag, a, b, inner) => {
    slot += 1;
    const label = esc(inner.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim().slice(0, 48));
    return `<${tag}${a}${b} data-edit-slot="s${i}-slot-${slot}" data-slot-type="text" data-slot-label="${label}" data-slot-locked-layout="true">${inner}</${tag}>`;
  });
  out = out.replace(/ data-edit-slot-image/g, () => {
    slot += 1;
    return ` data-edit-slot="s${i}-img-${slot}" data-slot-type="image" data-slot-label="图片" data-slot-locked-layout="true"`;
  });
  if (/ data-s[\s>]/.test(out)) throw new Error(`第 ${i + 1} 页：有没转换的 data-s（可能是同名标签嵌套）`);
  return out;
});

const outPath = join(reportDir, cfg.output || "index.html");
writeFileSync(outPath, head + "\n" + slides.join("\n") + "\n" + tail, "utf8");
console.log(`已生成 ${outPath}：${N} 页`);
