import fs from "node:fs/promises";
import path from "node:path";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const W = 1280;
const H = 720;
const OUT_DIR = "/Users/murph/Documents/Codex/2026-04-23-reading-openai-s-harness-engineering-post/outputs/just-bash-threat-model";
const SCRATCH_DIR = "/Users/murph/Documents/Codex/2026-04-23-reading-openai-s-harness-engineering-post/tmp/slides/just-bash-threat-model";
const PREVIEW_DIR = path.join(SCRATCH_DIR, "preview");
const PPTX_PATH = path.join(OUT_DIR, "just-bash-threat-model.pptx");

const C = {
  bg: "#07111F",
  bg2: "#0B1B2C",
  panel: "#10243A",
  panel2: "#132B45",
  line: "#274761",
  text: "#F4F7FA",
  muted: "#AFC1CF",
  dim: "#6F879A",
  cyan: "#34D3FF",
  cyanDark: "#0A7EA4",
  amber: "#F6B44B",
  red: "#FF6B6B",
  green: "#4FE3A4",
  white: "#FFFFFF",
  black: "#000000",
};

const FONT = {
  title: "PingFang SC",
  body: "PingFang SC",
  mono: "Menlo",
};

const SOURCES = {
  threat: "just-bash THREAT_MODEL.md: https://github.com/vercel-labs/just-bash/blob/main/THREAT_MODEL.md",
  readme: "just-bash README: https://github.com/vercel-labs/just-bash",
  blog: "Vercel blog: https://vercel.com/blog/how-to-build-agents-with-filesystems-and-bash",
};

function line(fill = C.line, width = 1) {
  return { style: "solid", fill, width };
}

function addShape(slide, geometry, x, y, w, h, fill = C.panel, stroke = C.line, strokeWidth = 1) {
  return slide.shapes.add({
    geometry,
    position: { left: x, top: y, width: w, height: h },
    fill,
    line: line(stroke, strokeWidth),
  });
}

function addText(slide, text, x, y, w, h, opts = {}) {
  const box = addShape(slide, "rect", x, y, w, h, opts.fill ?? "#00000000", opts.stroke ?? "#00000000", opts.strokeWidth ?? 0);
  box.text = text;
  box.text.fontSize = opts.size ?? 24;
  box.text.color = opts.color ?? C.text;
  box.text.bold = Boolean(opts.bold);
  box.text.typeface = opts.face ?? FONT.body;
  box.text.alignment = opts.align ?? "left";
  box.text.verticalAlignment = opts.valign ?? "top";
  box.text.insets = opts.insets ?? { left: 0, right: 0, top: 0, bottom: 0 };
  if (opts.autoFit) box.text.autoFit = opts.autoFit;
  return box;
}

function addTitle(slide, kicker, title, subtitle) {
  addText(slide, kicker, 58, 34, 520, 24, {
    size: 12,
    bold: true,
    color: C.cyan,
    face: FONT.mono,
  });
  addText(slide, title, 58, 72, 840, 78, {
    size: 38,
    bold: true,
    face: FONT.title,
  });
  if (subtitle) {
    addText(slide, subtitle, 60, 153, 820, 40, {
      size: 18,
      color: C.muted,
    });
  }
}

function addFooter(slide, idx) {
  addText(slide, `just-bash threat model · ${String(idx).padStart(2, "0")}`, 58, 678, 360, 18, {
    size: 10,
    color: C.dim,
    face: FONT.mono,
  });
  addShape(slide, "rect", 58, 662, 1164, 1, C.line, "#00000000", 0);
}

function addNotes(slide, notes, sourceKeys = ["threat"]) {
  const sourceLines = sourceKeys.map((key) => `- ${SOURCES[key]}`).join("\n");
  slide.speakerNotes.setText(`${notes}\n\nSources:\n${sourceLines}`);
}

function addCard(slide, x, y, w, h, label, body, opts = {}) {
  const accent = opts.accent ?? C.cyan;
  addShape(slide, "roundRect", x, y, w, h, opts.fill ?? C.panel, opts.stroke ?? C.line, 1.2);
  addShape(slide, "rect", x, y, 6, h, accent, "#00000000", 0);
  addText(slide, label, x + 22, y + 18, w - 44, 26, {
    size: opts.labelSize ?? 15,
    color: accent,
    bold: true,
    face: opts.labelFace ?? FONT.mono,
  });
  addText(slide, body, x + 22, y + 56, w - 44, h - 72, {
    size: opts.bodySize ?? 18,
    color: opts.bodyColor ?? C.text,
  });
}

function addPill(slide, text, x, y, w, color) {
  addShape(slide, "roundRect", x, y, w, 34, `${color}26`, color, 1.2);
  addText(slide, text, x, y + 7, w, 18, {
    size: 12,
    bold: true,
    color,
    align: "center",
    face: FONT.mono,
  });
}

function addArrow(slide, x, y, w, h, color = C.cyan) {
  addShape(slide, "rightArrow", x, y, w, h, `${color}CC`, "#00000000", 0);
}

function addBackground(slide) {
  slide.background.fill = C.bg;
  addShape(slide, "ellipse", -220, -230, 540, 540, "#0A6A8428", "#00000000", 0);
  addShape(slide, "ellipse", 940, -120, 520, 520, "#D7892920", "#00000000", 0);
  addShape(slide, "ellipse", 900, 510, 520, 280, "#34D3FF12", "#00000000", 0);
}

function terminal(slide, x, y, w, h, title = "sandbox") {
  addShape(slide, "roundRect", x, y, w, h, "#081727", C.line, 1.3);
  addShape(slide, "rect", x, y, w, 42, "#0F2D47", "#00000000", 0);
  addShape(slide, "ellipse", x + 18, y + 15, 10, 10, C.red, "#00000000", 0);
  addShape(slide, "ellipse", x + 34, y + 15, 10, 10, C.amber, "#00000000", 0);
  addShape(slide, "ellipse", x + 50, y + 15, 10, 10, C.green, "#00000000", 0);
  addText(slide, title, x + 75, y + 12, w - 90, 18, { size: 11, color: C.muted, face: FONT.mono });
}

function bulletText(items) {
  return items.map((item) => `• ${item}`).join("\n");
}

function createPresentation() {
  const p = Presentation.create({ slideSize: { width: W, height: H } });
  p.theme.colorScheme = {
    name: "just-bash dark",
    themeColors: { accent1: C.cyan, accent2: C.amber, bg1: C.bg, bg2: C.panel, tx1: C.text, tx2: C.muted },
  };
  return p;
}

function slide1(p) {
  const s = p.slides.add();
  addBackground(s);
  terminal(s, 660, 150, 500, 310, "agent action space");
  addText(s, "$ grep -r TODO src | head\n$ cat package.json\n$ sqlite3 data.db 'select count(*) from events'\n$ curl -s https://api.example.com | jq .", 700, 230, 410, 145, {
    size: 20,
    color: C.green,
    face: FONT.mono,
  });
  addText(s, "just-bash\nThreat Model", 64, 118, 530, 130, {
    size: 54,
    bold: true,
    face: FONT.title,
  });
  addText(s, "给 AI agent 一个熟悉、可控、可观测的 shell", 68, 270, 560, 40, {
    size: 22,
    color: C.muted,
  });
  addPill(s, "TypeScript bash interpreter", 68, 356, 250, C.cyan);
  addPill(s, "In-memory / Overlay FS", 338, 356, 240, C.amber);
  addPill(s, "Designed for AI agents", 68, 405, 250, C.green);
  addFooter(s, 1);
  addNotes(
    s,
    "Opening: just-bash is not trying to be a full VM. It gives agents the familiar bash/filesystem interface, then constrains and instruments that interface so it can be used safely.",
    ["readme", "threat"],
  );
}

function slide2(p) {
  const s = p.slides.add();
  addBackground(s);
  addTitle(s, "WHY IT EXISTS", "Agent 需要 shell，但不能直接给真实 bash", "核心问题不是“bash 强不强”，而是 action space 是否可控。");
  addCard(s, 70, 250, 330, 230, "为什么给 bash", "模型已经熟悉文件、grep、管道、重定向、脚本组合；bash 是低摩擦的通用动作语言。", { accent: C.cyan });
  addCard(s, 475, 250, 330, 230, "为什么不能给真 bash", "真实 shell 可以读 host 文件、跑二进制、访问网络、消耗资源、泄露 secrets。", { accent: C.red });
  addCard(s, 880, 250, 330, 230, "just-bash 的折中", "保留 shell 交互形态，但把文件系统、命令、网络、运行时都放进可审计边界。", { accent: C.green });
  addFooter(s, 2);
  addNotes(
    s,
    "Frame the product tradeoff: models benefit from a broad, composable interface. The security work is to keep the interface useful while constraining what it can actually touch.",
    ["readme", "blog"],
  );
}

function slide3(p) {
  const s = p.slides.add();
  addBackground(s);
  addTitle(s, "SYSTEM SHAPE", "安全边界：host 进程里的一层 sandbox", "它保护 host 不受 untrusted scripts 影响；不保护你免受 malicious host hook 影响。");
  addShape(s, "roundRect", 80, 220, 1120, 360, "#0B2034", C.line, 1.4);
  addText(s, "HOST PROCESS (Node.js)", 108, 245, 300, 26, { size: 15, bold: true, color: C.muted, face: FONT.mono });
  addShape(s, "roundRect", 210, 300, 780, 205, "#102C45", C.cyan, 2);
  addText(s, "JUST-BASH SANDBOX", 238, 323, 260, 24, { size: 17, bold: true, color: C.cyan, face: FONT.mono });
  const parts = [
    ["Parser", 250],
    ["AST", 425],
    ["Interpreter", 600],
    ["Commands", 775],
  ];
  for (const [label, x] of parts) {
    addShape(s, "roundRect", x, 374, 130, 62, "#071827", C.line, 1);
    addText(s, label, x, 395, 130, 18, { size: 16, bold: true, align: "center" });
  }
  addArrow(s, 382, 392, 34, 24, C.cyan);
  addArrow(s, 557, 392, 34, 24, C.cyan);
  addArrow(s, 732, 392, 34, 24, C.cyan);
  addCard(s, 84, 462, 260, 72, "外部", "脚本输入 / 数据源", { accent: C.red, bodySize: 15 });
  addCard(s, 862, 462, 310, 72, "host 资源", "真实文件、env、网络、child_process", { accent: C.amber, bodySize: 15 });
  addText(s, "Trust boundary", 520, 520, 240, 24, { size: 18, color: C.amber, bold: true, align: "center" });
  addFooter(s, 3);
  addNotes(
    s,
    "The threat model is explicit about trusted vs untrusted components. The host-provided fs/fetch/custom commands/plugins are trusted hooks; if the host is malicious, just-bash cannot sandbox the host from itself.",
    ["threat"],
  );
}

function slide4(p) {
  const s = p.slides.add();
  addBackground(s);
  addTitle(s, "THREAT ACTORS", "首要 adversary 是脚本作者", "把 AI agent 当成会提交任意 bash 的不可信用户。");
  addCard(s, 70, 235, 350, 290, "1A · Untrusted Script Author", "Who: AI agent 或用户提交任意 bash\nCapability: 完全控制脚本输入\nGoal: sandbox escape、读 host FS、泄露 secrets、DoS、提权\nTrust: ZERO", { accent: C.red, bodySize: 17 });
  addCard(s, 465, 235, 350, 290, "1B · Malicious Data Source", "Who: HTTP 响应、文件内容、stdin\nCapability: 控制 expansion、变量、参数里的数据\nGoal: prototype pollution、IFS 注入、path traversal", { accent: C.amber, bodySize: 17 });
  addCard(s, 860, 235, 350, 290, "1C · Compromised Dependency", "Who: npm supply-chain attacker\nCapability: import-time code execution\nStatus: 运行时防御范围外，但属于部署加固问题", { accent: C.cyan, bodySize: 17 });
  addFooter(s, 4);
  addNotes(
    s,
    "The important presentation point: the threat model is unusually explicit that the script is zero-trust. This makes sense because agent output is the primary input to the shell.",
    ["threat"],
  );
}

function slide5(p) {
  const s = p.slides.add();
  addBackground(s);
  addTitle(s, "TRUST BOUNDARIES", "五条边界决定了防御设计", "每条边界都有一个对应的失败模式。");
  const rows = [
    ["TB1", "Script → Parser", "任意输入不能 crash、hang、泄露信息"],
    ["TB2", "Interpreter → Filesystem", "必须限制在 sandbox root，阻断 symlink escape"],
    ["TB3", "Interpreter → Network", "默认关闭；开启后必须 URL / method allow-list"],
    ["TB4", "Interpreter → Host Process", "不得访问 env、Node internals、child_process"],
    ["TB5", "Data → JS key space", "用户数据进入 object key 时防 prototype pollution"],
  ];
  let y = 218;
  rows.forEach(([id, edge, point], i) => {
    const color = [C.cyan, C.green, C.amber, C.red, C.cyan][i];
    addShape(s, "roundRect", 82, y, 1120, 68, i % 2 ? "#102036" : "#0D1C30", C.line, 1);
    addText(s, id, 110, y + 20, 70, 22, { size: 18, bold: true, color, face: FONT.mono });
    addText(s, edge, 205, y + 18, 310, 24, { size: 20, bold: true });
    addText(s, point, 550, y + 19, 560, 22, { size: 18, color: C.muted });
    y += 78;
  });
  addFooter(s, 5);
  addNotes(
    s,
    "Use this slide to slow down: trust boundaries are more important than the long attack inventory. They explain why the defenses are shaped the way they are.",
    ["threat"],
  );
}

function slide6(p) {
  const s = p.slides.add();
  addBackground(s);
  addTitle(s, "ATTACK SURFACE MAP", "攻击面不是一个点，而是一张面", "parser、expansion、FS、network、JS escape、DoS、prototype pollution 都要分别处理。");
  const items = [
    ["Parser", "token bomb / 深层嵌套 / oversized input", C.cyan],
    ["Expansion", "brace bomb / glob bomb / string growth", C.amber],
    ["Filesystem", "path traversal / symlink escape / path leak", C.green],
    ["Network", "SSRF / redirects / response bomb", C.red],
    ["JS Escape", "Function / eval / import() / process.*", C.red],
    ["DoS", "infinite loop / recursion / regex / FD exhaustion", C.amber],
    ["Data Integrity", "__proto__ / constructor / unsafe object keys", C.cyan],
    ["Info Leak", "process.env / argv / stack paths / timing", C.green],
  ];
  items.forEach(([label, body, color], i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    addCard(s, 62 + col * 304, 232 + row * 190, 278, 142, label, body, { accent: color, bodySize: 15 });
  });
  addFooter(s, 6);
  addNotes(
    s,
    "The threat model's attack surface inventory is valuable because it is concrete: it names both the vector and the file where the defense lives. Present this as an engineering checklist, not a theoretical taxonomy.",
    ["threat"],
  );
}

function slide7(p) {
  const s = p.slides.add();
  addBackground(s);
  addTitle(s, "DEFENSE LAYERS", "Primary defense 是架构；secondary defense 是兜底", "不要把 monkey-patching 误读成唯一安全边界。");
  const layers = [
    ["Architecture", "没有 child_process 代码路径；命令只跑注册的 JS 实现", C.green],
    ["Virtual FS", "InMemoryFs / OverlayFs；symlink 默认 deny；写入可停留内存", C.cyan],
    ["Network", "默认没有 curl；开启后 URL prefix + method allow-list + redirect check", C.amber],
    ["Execution Limits", "loop / command / call depth / string / glob / FD 上限", C.red],
    ["Data Guards", "Map、null-prototype objects、safeGet/safeSet", C.cyan],
    ["Defense-in-Depth", "Function、eval、process.*、Module._resolveFilename 等二级阻断", C.green],
  ];
  layers.forEach(([label, body, color], i) => {
    const y = 220 + i * 65;
    addShape(s, "roundRect", 150 + i * 24, y, 900 - i * 48, 52, `${color}24`, color, 1.3);
    addText(s, label, 175 + i * 24, y + 14, 220, 20, { size: 17, bold: true, color });
    addText(s, body, 410 + i * 24, y + 15, 560 - i * 48, 18, { size: 15, color: C.text });
  });
  addText(s, "Primary", 78, 238, 70, 24, { size: 14, color: C.green, bold: true, face: FONT.mono, align: "right" });
  addText(s, "Secondary", 72, 563, 76, 24, { size: 14, color: C.cyan, bold: true, face: FONT.mono, align: "right" });
  addFooter(s, 7);
  addNotes(
    s,
    "Emphasize the hierarchy: defense-in-depth is useful, but the primary safety property is no intended path from bash interpretation to host JS execution or host resources.",
    ["threat"],
  );
}

function slide8(p) {
  const s = p.slides.add();
  addBackground(s);
  addTitle(s, "SCENARIOS", "威胁模型最后要能回答：这个攻击怎么结束？", "把安全讨论落到 verdict，而不是抽象形容词。");
  const rows = [
    ["cat /etc/passwd", "OverlayFs / root containment", "BLOCKED"],
    ["ln -s /etc/passwd x", "allowSymlinks=false", "BLOCKED"],
    ["while true; do :; done", "maxLoopIterations", "BLOCKED"],
    ["curl evil.com", "network off / allow-list", "BLOCKED"],
    ["arr[__proto__]=evil", "Map / null-prototype", "BLOCKED"],
    ["python escape", "opt-in WASM + worker + timeout", "RESIDUAL"],
  ];
  addShape(s, "roundRect", 95, 225, 1090, 330, "#0C2034", C.line, 1.2);
  addText(s, "Scenario", 130, 250, 260, 22, { size: 15, bold: true, color: C.cyan, face: FONT.mono });
  addText(s, "Defense path", 450, 250, 420, 22, { size: 15, bold: true, color: C.cyan, face: FONT.mono });
  addText(s, "Verdict", 1000, 250, 110, 22, { size: 15, bold: true, color: C.cyan, face: FONT.mono, align: "center" });
  rows.forEach(([a, b, c], i) => {
    const y = 292 + i * 39;
    if (i % 2 === 0) addShape(s, "rect", 112, y - 8, 1048, 34, "#FFFFFF08", "#00000000", 0);
    addText(s, a, 130, y, 300, 18, { size: 15, color: C.text, face: FONT.mono });
    addText(s, b, 450, y, 420, 18, { size: 15, color: C.muted });
    const color = c === "BLOCKED" ? C.green : C.amber;
    addPill(s, c, 982, y - 7, 120, color);
  });
  addFooter(s, 8);
  addNotes(
    s,
    "This slide should be presented as the payoff of the threat model. If a model cannot produce scenario verdicts, it is not operational enough.",
    ["threat"],
  );
}

function slide9(p) {
  const s = p.slides.add();
  addBackground(s);
  addTitle(s, "KNOWN GAPS", "残余风险被明确写出来，反而是成熟信号", "好的 threat model 不承诺绝对安全；它标注 tradeoffs 和部署条件。");
  addCard(s, 70, 230, 350, 215, "Node version edge", "dynamic import() 依赖 Node.js 20.6+ 的 ESM loader hook；更旧版本存在残余风险。", { accent: C.amber, bodySize: 17 });
  addCard(s, 465, 230, 350, 215, "Secondary layer limits", "pre-captured references、globalThis reassignment 说明 monkey-patching 不是 primary boundary。", { accent: C.cyan, bodySize: 17 });
  addCard(s, 860, 230, 350, 215, "Opt-in Python", "Python 通过 CPython WASM 隔离，但开启后风险评级为 MEDIUM，仍需配置 timeout 和边界。", { accent: C.red, bodySize: 17 });
  addCard(s, 268, 478, 350, 112, "Output contexts", "如果把 sandbox 输出渲染到网页，还要考虑 XSS/CSP。", { accent: C.green, bodySize: 16 });
  addCard(s, 662, 478, 350, 112, "Fuzzing scope", "trap、job control、复杂 heredoc、Unicode edge cases 仍是后续加固点。", { accent: C.green, bodySize: 16 });
  addFooter(s, 9);
  addNotes(
    s,
    "Use this slide to keep the presentation credible. just-bash is beta software and the README says to use at your own risk. The threat model is strong because it names residual risk clearly.",
    ["threat", "readme"],
  );
}

function slide10(p) {
  const s = p.slides.add();
  addBackground(s);
  addTitle(s, "OPERATING GUIDANCE", "如果你要把 just-bash 接进 agent，按最小权限启用", "默认安全姿态比功能完整性更重要。");
  const items = [
    ["1", "先用 InMemoryFs 或 OverlayFs", "让写入可丢弃；需要真实写入时只指向 workspace sandbox。"],
    ["2", "网络默认关闭", "只给必要 URL prefix 和 HTTP methods；不要轻易 full internet。"],
    ["3", "Python / JS opt-in", "只有任务需要时打开；配置 timeout、内存和输出处理。"],
    ["4", "customCommands 当 trusted host code", "自定义命令、fetch、transform plugin 可以绕过 sandbox，必须像生产代码一样审。"],
    ["5", "需要任意二进制时换 VM", "README 明确建议：需要 full VM / arbitrary binary execution 时用 Vercel Sandbox。"],
  ];
  items.forEach(([n, title, body], i) => {
    const y = 220 + i * 76;
    addShape(s, "ellipse", 92, y, 42, 42, i % 2 ? C.cyan : C.amber, "#00000000", 0);
    addText(s, n, 92, y + 10, 42, 18, { size: 14, bold: true, color: C.bg, align: "center", face: FONT.mono });
    addText(s, title, 160, y + 2, 380, 24, { size: 20, bold: true });
    addText(s, body, 160, y + 30, 880, 26, { size: 17, color: C.muted });
  });
  addFooter(s, 10);
  addNotes(
    s,
    "Convert the threat model into practical advice. The most important operational idea is least privilege: turn on capabilities only when the agent actually needs them.",
    ["readme", "threat"],
  );
}

function slide11(p) {
  const s = p.slides.add();
  addBackground(s);
  addText(s, "Takeaway", 64, 92, 260, 30, { size: 18, bold: true, color: C.cyan, face: FONT.mono });
  addText(s, "just-bash 不是一个 VM，\n而是一个可校准的 shell harness。", 64, 145, 760, 130, { size: 44, bold: true, face: FONT.title });
  addText(s, "它把 agent 熟悉的 bash/filesystem 接口，包进一组明确的边界：虚拟文件系统、命令注册、网络 allow-list、执行上限、数据结构防护和二级逃逸阻断。", 68, 320, 700, 86, { size: 21, color: C.muted });
  const x = 850;
  addShape(s, "roundRect", x, 155, 300, 330, "#0C2034", C.cyan, 1.5);
  addText(s, "Useful", x + 35, 205, 230, 34, { size: 28, bold: true, color: C.green, align: "center" });
  addText(s, "熟悉的 bash action space", x + 35, 243, 230, 24, { size: 17, color: C.muted, align: "center" });
  addText(s, "Bounded", x + 35, 305, 230, 34, { size: 28, bold: true, color: C.amber, align: "center" });
  addText(s, "默认关闭危险能力", x + 35, 343, 230, 24, { size: 17, color: C.muted, align: "center" });
  addText(s, "Observable", x + 35, 405, 230, 34, { size: 28, bold: true, color: C.cyan, align: "center" });
  addText(s, "stdout / stderr / exit code", x + 35, 443, 230, 24, { size: 17, color: C.muted, align: "center" });
  addFooter(s, 11);
  addNotes(
    s,
    "Close by tying it back to harness engineering: the shell is the actuator, but the threat model determines how that actuator is bounded, observed, and made safe enough for agentic workflows.",
    ["threat", "readme"],
  );
}

async function saveBlob(blob, filePath) {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  await fs.writeFile(filePath, bytes);
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.mkdir(PREVIEW_DIR, { recursive: true });
  const presentation = createPresentation();
  slide1(presentation);
  slide2(presentation);
  slide3(presentation);
  slide4(presentation);
  slide5(presentation);
  slide6(presentation);
  slide7(presentation);
  slide8(presentation);
  slide9(presentation);
  slide10(presentation);
  slide11(presentation);

  for (let i = 0; i < presentation.slides.items.length; i += 1) {
    const preview = await presentation.export({ slide: presentation.slides.items[i], format: "png", scale: 1 });
    await saveBlob(preview, path.join(PREVIEW_DIR, `slide-${String(i + 1).padStart(2, "0")}.png`));
  }
  const pptxBlob = await PresentationFile.exportPptx(presentation);
  await pptxBlob.save(PPTX_PATH);
  console.log(PPTX_PATH);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
