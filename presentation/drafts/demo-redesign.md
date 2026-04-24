# Demo 重新设计：self-verification + 可观察的组合命令

> 状态：讨论中 · 尚未实现
> 关联分支：`claude/demo-presentation-discussion`

## 1 · 为什么要换

当前 Nova X1 scripted replay 已经砍到 6 步，但即使精简后，它仍是 "agent 实现业务功能" 这个方向。这个方向把观众的注意力引向 "LLM 写得对不对"——而这场 talk 的主角是 **harness**，不是 LLM。

新方向聚焦一句话：

> **bash 组合语法让 agent 能在一条命令里同时生成候选和验证；just-bash 的 AST 拦截让这条命令每一层都可观察——bespoke tools 结构上给不了这两件事。**

## 2 · 为什么不用 LLM

这个 demo **不需要** live LLM，原因：

- 这场 talk 讲 **harness engineering**。harness 是主角，LLM 是消费者。
- 现场让模型生成复合 bash 命令风险高：写岔一次全场节奏就断。
- 观众对 "模型在打字" 的注意力会盖过 "harness 在做什么"。

采用 framing（开场口播）：

> "我昨天让 Claude 跑了这个任务，它生成了以下几条命令。现场我带大家看 just-bash 怎么**执行和拦截**它们——重点不是 Claude 写得多好，是 harness 给了它什么样的观察面。"

这一句把 LLM 的位置摆对：**它是漂亮的房客，但今天我们参观的是房子。**

## 3 · 任务设计

**场景**：数据对账。SQLite 里的订单库 + 一堆原始 JSON 发货日志。找出数据库里标记"已发货"但在原始 JSON 里不存在的订单。

**为什么这个 task 合适**：

- 生成候选（SQL）和验证（grep 回原始文件）天然分离
- 直接撞上 Vercel *bash is all you need* 那篇的核心结论
- 3-5 分钟能演完，产出可视
- 跨领域通用，不需要团队背景知识

## 4 · 技术骨架

### 用到的 just-bash 能力

| 能力 | 现场展示什么 |
|---|---|
| `TeePlugin`（AST 拦截） | 把嵌套 `$(...)` / `<(...)` 的每一层 stdout 单独捕获并显示 |
| `CommandCollectorPlugin` | 命令执行完返回 `metadata.commands = [...]`，用于审计/成本归因 |
| 内建 `sqlite3` | 无需外部依赖直接查 SQL |
| OverlayFS + 无网络 | 默认能力，不需要单独演示 |

### 关键演示命令

```bash
diff <(sqlite3 orders.db "SELECT id FROM shipped ORDER BY id") \
     <(jq -r '.[].orderId' shipments/*.json | sort) \
  | head -20
```

- bespoke tools 世界里这是**一个黑盒调用**（例如 `reconcile_orders()`）。
- 有了 TeePlugin，harness 能把它拆成 5 层可见：
  - `[1] sqlite3 ...` → 5421 行
  - `[2] jq -r ...` → 5374 行
  - `[3] sort` → 5374 行
  - `[4] diff <(...) <(...)` → 47 行差集
  - `[5] head -20` → 20 行展示

## 5 · 现场编排（5 分钟 · 4 段）

| # | 时长 | 内容 | 要传达的信息 |
|---|---|---|---|
| 1 | 30s | `ls data/` 看到 `orders.db` + `shipments/*.json` | 环境就位 |
| 2 | 1 min | agent 先**天真版**：两次单独 exec 跑 SQL 和 jq | "能工作，但不够好" |
| 3 | 2 min | 重写成**组合命令**：`diff <(SQL) <(jq ...)`。切 TeePlugin 视图，每层中间结果像分镜展开 | **高潮**：组合语法 + 可观察 |
| 4 | 1.5 min | 打印 CommandCollector 的 metadata；收尾口播 | harness 自动可审计 |

**结尾一句**：

> "你看到的不是 agent 变聪明了，是**接口给了它施展的空间，同时没有把它变成黑盒**。这就是为什么 bash + AST plugins 是比 bespoke tools 更好的 action space。"

## 6 · 对现有代码的影响

**保留不动**：
- `sandbox.ts`（1286 行虚拟 FS + 沙箱实现）
- scripted replay 的骨架（emit 事件、展示命令、显示输出）

**要改的**：
- `agent.ts` 的 `steps` 数组——换成对账任务的命令序列
- 移除 `runLiveAgent`、AI SDK / OpenAI / Gateway 依赖——不再需要 API key 和 `.env`
- UI 上移除 "Live model / Scripted replay" 切换
- Web UI 需要新增 **TeePlugin 分层视图**——这是新工作量，不是现成能力
- 造数据：~500 订单 + ~450 发货 JSON，差 ~47 条

**老 Nova X1 demo 去向**：保留在 repo 作为 "完整工程案例"，从 talk 里撤掉。

## 7 · 待确认

1. **对账场景 vs 更贴合团队的场景**（比如 feature flag 发布前后指标对账、trace id 跨服务匹配）
2. **"天真版 → 组合版" 对比**要不要保留（+1 分钟，换 "bash 组合到底多省事" 的冲击）
3. **数据规模** 500/450/47 是否合适（stdout 体量、scroll 观感）
4. **slides S17 是否同步改口播**（把 scripted replay 的 6 步叙述替换成对账 4 段）

确认后开始实现。
