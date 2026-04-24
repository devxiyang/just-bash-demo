# just-bash Incident Response Demo

一个可展示的 demo：模型通过 Vercel AI SDK 调用 `bash` tool，在 `just-bash` 沙箱中完成一次更复杂的舆情应急处置链路。它不只是跑单个脚本，而是读取多源输入、修改多段业务代码、运行测试、生成双 artifact，并判断 Nova X1 是否应该升级为 P1。

## Run

```bash
npm install
cp .env.example .env
# edit .env and set OPENAI_API_KEY or AI_GATEWAY_API_KEY
npm run web
```

Open:

- `http://localhost:4321/` for the presentation
- `http://localhost:4321/demo` for the live demo

## Demo Case

The demo simulates an incident-response agent for a product launch:

- Read `social-posts.jsonl`, `support-tickets.csv`, `escalation-rules.yaml`, `product-catalog.json`, and `incident.log`
- Implement `src/normalize.ts`, `src/risk-score.ts`, and `src/escalation.ts`
- Run `npm test` / `npm run lint`
- Generate:
  - `reports/escalation-decision.json`
  - `reports/incident-brief.md`
- Validate outputs with `incident-guard`

## Modes

- `Run live model`: 使用 `OPENAI_API_KEY` 或 `AI_GATEWAY_API_KEY` 调用 AI SDK provider，模型自己决定 bash 命令。
- `Scripted replay`: 不需要 API key，回放同样的操作流程，适合现场兜底。

## CLI

```bash
npm run demo -- --scripted
npm run demo -- "Inspect the repo, implement the incident-response pipeline, and verify"
```

## What It Shows

- Problem: custom tools 太碎；solution: bash/filesystem 是通用且模型熟悉的 action space。
- Problem: 真 shell 太危险；solution: virtual FS、无网络默认、命令注册和执行上限。
- Problem: 单一 toy case 太浅；solution: 用多源数据 + 规则文件 + 双 artifact 展示更真实的工程闭环。
- Problem: agent 需要真实反馈；solution: stdout/stderr/exitCode、tests、lint、guard 形成可解析反馈。
- Problem: 现场演示要稳；solution: live model + scripted replay + 全屏轨迹模式。
