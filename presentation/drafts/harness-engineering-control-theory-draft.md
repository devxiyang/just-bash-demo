# 从写代码到掌舵：`harness engineering` 的控制论谱系

OpenAI 把这件事叫 `harness engineering`。这个名字很新，但它背后的结构一点也不新。

读那篇文章时，我一直有种强烈的既视感。后来才意识到：这不是第一次出现，甚至不是第二次，而是至少第三次。第一次是 18 世纪 Watt 的离心调速器。它出现之前，蒸汽机旁边需要站着一个人，根据转速变化手动拧阀门；它出现之后，机器开始自己感知偏差、自己施加修正。工人并没有消失，只是工作变了：从亲手拧阀门，变成设计那个让机器自动调节的装置。第二次是 Kubernetes。工程师不再把大量时间花在重启服务、补副本、手工回滚上，而是声明目标状态，再由 controller 持续比较当前状态与目标状态的偏差，并在偏离发生时自动做 reconciliation。现在，第三次轮到了代码本身。OpenAI 描述的不是“AI 帮工程师写点代码”，而是另一种分工：工程师越来越少亲手实现，转而设计环境、定义约束、搭建反馈回路，再由 agent 在这个回路里生成、修改、验证代码。[1][2][3]

![瓦特离心调速器控制回路](assets/watt-governor-control-loop.png)

这三件事表面上分属蒸汽时代、云原生时代和大模型时代，底层却是同一种模式：当某一层第一次同时拥有足够强的“传感器”和“执行器”，人类就会从该层的直接操作中退出来，上升到更高一层去设定目标、校准回路、处理异常。Norbert Wiener 在 1948 年给这种模式起了一个非常贴切的名字：控制论，`cybernetics`。而 Kubernetes 这个名字本身也来自希腊语，意思就是“舵手”或“领航员”。这个词抓住了关键变化：真正重要的，不是你还在不在干活，而是你是否还在亲手转动那个阀门。你不再负责每一个局部动作，而是负责系统在扰动中仍然朝正确方向收敛。你不再亲自操作，你开始掌舵。[4][5]

![Kubernetes 控制回路](assets/kubernetes-control-loop.png)

代码库之所以长期是最后一个“人工堡垒”，并不是因为它天然更复杂，而是因为它过去只在较低层次上形成闭环。编译器能检查语法，测试能检查行为，lint 能检查风格，这些当然都是真实的反馈系统，但它们只能控制那些可以机械验证的属性。更高一层的问题，例如这个改动是否符合系统架构、这个抽象是否会在规模扩大后失效、这个边界是否会导致未来的复杂性失控，过去既没有足够好的传感器，也没有足够好的执行器。只有人能判断，也只有人能修正。大模型真正改变的，不只是“它会写代码”，而是它第一次把高层语义上的感知能力和行动能力同时带了进来。它能够在相当程度上识别模块关系、接口不一致、层次混乱和设计违和，也能在同一层级上直接采取行动：重构模块、重写测试、调整依赖、统一边界。代码工程第一次有机会在更高的抽象层上闭环。[1]

但闭环的可能性，不等于闭环天然可靠。Watt 的调速器需要调参，Kubernetes 的 controller 需要正确的 spec，agent 也一样需要被校准。这里最容易被忽略的，是 Ashby 的 Law of Requisite Variety：只有足够的“多样性”才能抵消环境中的“多样性”。翻译成软件工程的话，就是代码库越复杂，你的控制系统就越不能只靠一句 prompt 或一份含糊的说明文档。它必须拥有与复杂性相匹配的感知和响应能力：分层清晰的架构文档、可执行的边界规则、带 remediation 指引的自定义 lint、稳定而快速的测试、可解析的 CI 输出、真实运行时信号，以及能够把错误重新喂回系统的反馈机制。这些东西不是 agent 的“辅助材料”，它们本身就是控制器的一部分。[6]

Conant 和 Ashby 后来又把这个判断推进了一步：任何好的 regulator，都必须包含被调节系统的模型。放到今天最常见的抱怨里，就是：agent 之所以“总是做错”，很多时候不是因为它不够聪明，而是因为我们根本没有把代码库的真实模型外化出来。团队对“什么叫好”的判断，往往仍然封存在少数资深工程师脑中：哪些依赖方向是允许的，哪些抽象是鼓励的，哪些模式虽然能跑但从长期看一定会烂，哪些风格符合团队的 taste，哪些边界一旦打破就会造成系统性漂移。如果这些东西没有被编码成文档、约束、测试和工具，那么它们对 agent 来说就根本不存在。于是它第一次会犯的错，第一百次依然会犯。问题不在于 agent 不会学习，而在于系统没有把“正确”写成机器可读的形式。[7][1]

![Harness Engineering 控制回路](assets/harness-engineering-control-loop.png)

这也是为什么很多过去听起来像“工程卫生”的老生常谈，到了 agent 时代突然变成了生产力前提。文档、测试、架构决策、反馈回路，这些实践从来不是新鲜事物。过去人们之所以总想跳过它们，是因为跳过的代价通常来得很慢：代码一点点变脏，团队一点点变慢，技术债一点点积累。而 agent 把这个代价放大成了高频、并行、持续发生的系统性风险。缺文档，agent 就会在每一次生成里误解你的约定；缺测试，回路根本闭不起来；缺架构约束，漂移会以机器速度扩散。更麻烦的是，一旦系统已经被错误模式污染，你甚至很难再指望 agent 来清理残局，因为它并不知道“干净”长什么样。没有校准，制造问题的机器也无法解决问题。[1]

但把判断写进系统，还只是 harness 的一半。另一半是：你到底让 agent 通过什么样的接口接触世界。控制器不仅需要目标和规则，也需要一个合适的 action space；如果接口设计错了，哪怕目标是对的，系统也会变得笨重、脆弱、难以校准。

![just-bash 作为 Agent 的接口层](assets/just-bash-interface-layer.png)

这也是 `just-bash` 值得放进这篇讨论里的原因。如果说 OpenAI 的 `harness engineering` 主要强调把团队判断写进反馈系统，那么 `just-bash` 解决的是另一个同样基础的问题：agent 应该用什么接口观察系统、操作系统、留下可验证的痕迹。一个很自然的误解是，既然 agent 可以理解高层意图，我们就应该替它发明越来越多 bespoke tools，给它越来越厚的领域 API，把每一步都提前切好。Vercel 的方向几乎相反。他们在官方文章里写得很直接：很多内部 agent 的复杂自定义 tooling 之所以脆弱，是因为人在替模型猜它需要什么；后来他们把大部分 custom tooling 换成 filesystem tool 和 bash tool，销售总结 agent 的单次成本从约 1 美元降到 0.25 美元，质量反而更好。[10] 这不是因为 bash 有某种怀旧魔法，而是因为它恰好是一种模型已经深度内化的控制界面。模型在训练中见过海量目录遍历、`grep`、管道、重定向和脚本组合；与其重新发明一套专有动作语言，不如直接把世界表示成文件，把动作收敛为一个它本来就会用的通用语法。[10]

从控制论角度看，`just-bash` 的启发不在于 “bash 很强”，而在于它把观测、操作和状态收拢到一套极少数原语上。文件系统负责持久状态，`stdout`、`stderr` 和 `exit code` 提供标准化反馈，Unix 命令负责可组合的局部动作。README 里还专门提供 AST transform plugins，用来在执行前后抽取命令元数据、捕获每条命令的输出。[11] 这已经不只是把 actuator 交给 agent，而是在 actuator 周围主动加上传感器。它甚至在实现层面强化了这种设计：每次 `exec()` 都会重置环境变量、函数和工作目录，只共享文件系统。[11] 也就是说，短期 shell 状态是一次性的，真正持续的状态必须落回文件里。这是一种非常“控制器式”的约束：尽量消灭隐藏状态，让系统的记忆留在可观察、可检查、可回放的地方。

更关键的是，`just-bash` 并不是单纯把 agent 放开了跑，而是把“约束编码”做得非常彻底。默认没有网络；开启网络时走 URL 前缀和 HTTP 方法 allow-list；CLI 默认使用 OverlayFS，从真实目录读取，但所有写入只停留在内存里；还有循环、递归和命令数量等执行上限。[11] 它的 threat model 甚至明确把“提交任意 bash 脚本的 AI agent 或用户”定义为首要不可信对象。[12] 这其实很能说明 harness engineering 的成熟形态：真正好的环境不是默认信任模型，而是假设模型会犯错、会走偏，甚至在某些意义上像 adversary 一样使用能力，于是提前在 actuator 周围加上边界、配额、可观测性和回滚空间。Watt 的 governor 要调参，agent 的 bash 也一样要调参。

如果再把 Vercel 关于 `"bash is all you need"` 的评测放进来，意义就更完整了。他们最后跑出来的最佳形态，不是纯 bash，也不是纯 SQL，而是 bash + SQLite 的混合体：agent 先用 SQL 获取候选答案，再用 `grep` 和文件系统 spot-check 自己的结果。[13] 真正的赢家不是单次运行的 raw accuracy，而是通过 self-verification 获得的稳定准确率。[13] 这几乎就是前面那条 generation-verification asymmetry 的一个工程化版本。重点不在于给 agent 一个更“聪明”的 actuator，而在于给它一个更便宜的验证环境。于是 `just-bash` 带来的真正启发并不是“以后 agent 都该用 bash”，而是：agent harness 应该优先选择那些模型已经熟悉的接口、能够把状态外化为可检查对象的表示方式，以及能让验证成本尽量低的工具组合。

当然，另一重限制同样重要：Goodhart’s Law。一旦某个 measure 变成 target，它就不再是好的 measure。测试通过率、PR 吞吐量、benchmark 分数、review 速度，这些都很容易变成可优化但不可信任的代理指标。如果一个团队把 harness 理解成“找一个最方便量化的指标，然后让 agent 拼命把它做高”，那最后得到的多半不是一个可靠系统，而是一个极其擅长迎合代理目标的系统。真正成熟的 harness 从来不是单一指标驱动的，而是多种传感器共同工作：测试衡量行为，结构检查衡量边界，运行时信号揭示真实状态，人工 review 和用户反馈负责发现那些代理指标永远覆盖不到的偏差。控制的本质不是找到一个完美指标，而是在多个不完美指标之间维持校准，并在 proxy 失真时及时纠偏。[8]

沿着这条线往前看，工程师角色的变化也就很清楚了。未来最重要的能力，未必是比机器更快地写出实现，而是比机器更好地规定正确性、构造评估器、识别偏差、重写约束、重设目标。生成当然仍然重要，但它越来越不是最稀缺的东西。更稀缺的是判断：什么值得生成，什么不该生成；什么叫符合系统，什么只是局部可行；什么时候应该继续优化，什么时候应该停下来怀疑你正在优化的其实只是一个坏指标。Cobbe 等人的 verifier work 说明了一点：在很多问题上，提出候选解并不稀缺，稀缺的是高质量验证与筛选。生成更便宜之后，评估会变得更值钱。[9]

所以，与其说 `harness engineering` 是一种新的 coding 技巧，不如说它是软件工程第一次真正进入控制论阶段。代码不再只是人手工制造的产物，而是一个被持续调节、持续比较、持续纠偏的被控系统。工程师也不再主要是生产代码的人，而是设定航向、构造仪表、校准控制器的人。Watt 时代真正进步的人，不是把阀门拧得更熟练的人，而是意识到不该再让人一直站在阀门旁边的人。今天的软件工程，大概也正走到这个时刻。

## 原文摘录

[1] OpenAI, *Harness engineering: leveraging Codex in an agent-first world*  
“Humans steer. Agents execute.”  
链接: https://openai.com/index/harness-engineering/

[2] OpenAI, *Harness engineering: leveraging Codex in an agent-first world*  
“give Codex a map, not a 1,000-page instruction manual.”  
链接: https://openai.com/index/harness-engineering/

[3] OpenAI, *Harness engineering: leveraging Codex in an agent-first world*  
“anything it can’t access in-context while running effectively doesn’t exist.”  
链接: https://openai.com/index/harness-engineering/

[4] Kubernetes Docs, *Overview*  
“The name Kubernetes originates from Greek, meaning helmsman or pilot.”  
链接: https://kubernetes.io/docs/concepts/overview/

[5] Kubernetes Docs, *Controllers*  
“a control loop is a non-terminating loop that regulates the state of a system.”  
链接: https://kubernetes.io/docs/concepts/architecture/controller/

[6] W. Ross Ashby, *Cybernetics and Requisite Variety*  
“Only variety can destroy variety.”  
链接: https://panarchy.org/ashby/variety.1956.html

[7] Conant & Ashby, *Every Good Regulator of a System Must Be a Model of That System*  
“the best regulator of a system is one which is a model of that system”  
链接: https://governance.foundation/assets/frameworks/other/Conant_Ashby%20Every%20Good%20Regulator%20of%20a%20system%20must%20be%20a%20model%20of%20that%20system.pdf

[8] OpenAI, *Measuring Goodhart’s law*  
“When a measure becomes a target, it ceases to be a good measure.”  
链接: https://openai.com/index/measuring-goodharts-law/

[9] Cobbe et al., *Training Verifiers to Solve Math Word Problems*  
“generate many candidate solutions and select the one ranked highest by the verifier.”  
链接: https://arxiv.org/abs/2110.14168

[10] Vercel, *How to build agents with filesystems and bash*  
“We replaced most of the custom tooling in our internal agents with a filesystem tool and a bash tool.”  
链接: https://vercel.com/blog/how-to-build-agents-with-filesystems-and-bash

[11] vercel-labs/just-bash, *README*  
“Each `exec()` call gets its own isolated shell state”  
链接: https://github.com/vercel-labs/just-bash

[12] vercel-labs/just-bash, *THREAT_MODEL.md*  
“An AI agent or user submitting arbitrary bash scripts for execution”  
链接: https://github.com/vercel-labs/just-bash/blob/main/THREAT_MODEL.md

[13] Vercel, *Testing if "bash is all you need"*  
“The 'winner' wasn't raw accuracy on a single run, but consistent accuracy through self-verification.”  
链接: https://vercel.com/blog/testing-if-bash-is-all-you-need
