# just-bash Threat Model Presentation Plan

## Audience
工程团队、AI agent 平台/工具链开发者、安全评审同学。默认听众了解 shell、Node.js、sandbox、agent tool calling，但不一定读过 just-bash 源码。

## Objective
用 10-12 分钟讲清 `just-bash` 的安全模型：它不是 VM，而是一个为 AI agent 设计的虚拟 bash 环境；它通过虚拟文件系统、命令注册、网络 allow-list、执行上限和 defense-in-depth，把一个很危险的动作接口变成可控、可观测、可验证的 harness。

## Narrative Arc
1. Agent 需要 shell，因为 bash 是模型熟悉的通用 action space。
2. 但 shell 对 agent 来说天然危险，所以必须先定义 threat model。
3. just-bash 的核心边界是“保护 host 不受 untrusted scripts 影响”，不是保护 untrusted host。
4. 安全设计是分层的：primary architecture + virtual FS + network off + command registry + limits + data guards + secondary monkey-patching。
5. 残余风险仍然存在，尤其是 opt-in Python/JS、Node 版本差异、输出渲染上下文和宿主 hook。
6. 最后落点：这不是一个“绝对安全 shell”，而是一个可校准的 agent harness。

## Slide List
1. Title — just-bash Threat Model: 给 agent 一个可控的 shell
2. Why this exists — Agent 需要通用接口，但不能直接给真实 bash
3. System shape — Host process / just-bash sandbox / external world
4. Threat actors — Untrusted script author, malicious data source, compromised dependency
5. Trust boundaries — TB1-TB5 的安全边界
6. Attack surface map — 7 类主要攻击面
7. Defense layers — primary vs secondary defenses
8. Threat scenarios — 常见攻击如何被挡住
9. Known gaps — residual risks and accepted tradeoffs
10. Operating guidance — 如何安全地把 just-bash 用进 agent
11. Takeaway — not a VM, but a calibrated shell harness

## Source Plan
- Primary: `https://github.com/vercel-labs/just-bash/blob/main/THREAT_MODEL.md`
- Supporting: `https://github.com/vercel-labs/just-bash`
- Supporting: `https://vercel.com/blog/how-to-build-agents-with-filesystems-and-bash`

## Visual System
深色技术主题，背景为接近黑蓝色，重点色为 cyan、amber、red。使用 terminal、boundary、layer、shield 的视觉隐喻。文字全部保持可编辑；diagram、cards、tables 使用 PowerPoint shape 和 text。

## Editability Plan
所有标题、要点、表格、流程图文字、speaker notes 都是 PowerPoint 可编辑对象。引用和链接放进 speaker notes，避免挤占主视觉。
