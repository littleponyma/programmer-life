// 小游戏定义
// 每个小游戏有自己的逻辑,但都返回 { effect: {...}, log: "...", nextOverride?: "..." }

const MINIGAMES = {

  // ============ 面试找工作小游戏 ============
  // 你被裁后 / 主动跳槽时触发
  // 玩家投了 50 份简历,获得 4 场面试机会,每场单独投放
  // 每场用"3 题答辩"决定挂还是过,过的 offer 集中到结尾
  interview_run: {
    title: "🎯 找工作 · 同时面试 4 家",
    prepNarrative: `你 N+1 拿到手了。
你给自己定了个目标:这周内投 100 份简历,争取 4 个面试机会。

第二天你接到 LinkedIn 私信。第三天接到猎头电话。
一周后你确定了 4 个面试,分布在下周一到周四。

每天早上你穿好衬衫,改 PPT 改到 1 点。
你媳妇/对象/室友问:'你今年才 X 岁,这是你第一次面试这么紧张?'
你说:'失业期面试和有工作面试,是两个心态。'`,

    // 4 家公司,各 3 题 ——题目针对玩家职级/履历不同
    companies: [
      {
        id: "bigA",
        name: "巨头 A 厂",
        level: "P7 同级",
        baseRange: "30-35k",
        questions: [
          {
            q: "面试官:'看你做了 6 年,你最自豪的项目讲讲。'",
            options: [
              { text: "讲数据 —— '订单系统重构 + GMV 涨了 18%'", score: 2 },
              { text: "讲技术 —— 'P99 从 800ms 降到 120ms'", score: 2 },
              { text: "讲过程 —— '我们做了很多事'", score: -2 },
              { text: "讲教训 —— '上次 P0 我背了锅,教会我...'", score: 1 }
            ]
          },
          {
            q: "面试官:'你为什么离开上家公司?'",
            options: [
              { text: "实话 —— '业务调整被优化了'", score: -1 },
              { text: "包装 —— '想找更有挑战的事'", score: 0 },
              { text: "中肯 —— '公司战略变了,我和方向不太契合'", score: 2 },
              { text: "甩锅 —— '上家公司管理混乱,我撑不下去了'", score: -2 }
            ]
          },
          {
            q: "面试官:'你对加班怎么看?'",
            options: [
              { text: "'我是奋斗者,加班没问题'", score: 1 },
              { text: "'看必要性 —— 业务关键时刻我加,平时讲效率'", score: 2 },
              { text: "'我尽量按 OKR 推进,不强求加班'", score: 0 },
              { text: "'我有家庭,不能 996'", score: -1 }
            ]
          }
        ]
      },
      {
        id: "midB",
        name: "中厂 B (上升期)",
        level: "P7+ 给一档",
        baseRange: "32-38k",
        questions: [
          {
            q: "CTO:'我们公司比你之前小,你为什么愿意来?'",
            options: [
              { text: "实话 —— '我需要工作,你们给的钱也行'", score: -2 },
              { text: "包装 —— '我看好你们的增长空间,我想 own 更大的'", score: 2 },
              { text: "技术答 —— '我喜欢你们的技术栈,有挑战'", score: 1 },
              { text: "反问 —— '你能告诉我你们 3 年规划吗?'", score: 0 }
            ]
          },
          {
            q: "CTO:'你能给我们带来什么?'",
            options: [
              { text: "'大厂带来的工程规范和稳定性'", score: 2 },
              { text: "'我能 own 一条业务线的端到端'", score: 2 },
              { text: "'看你们需要什么'", score: -1 },
              { text: "'我是 P7,你们至少能省一个招聘成本'", score: -2 }
            ]
          },
          {
            q: "CTO:'你接受降薪入职吗?'",
            options: [
              { text: "'看降多少,合理我接受'", score: 1 },
              { text: "'我宁可降薪也想来'", score: -1 },
              { text: "'base 可以谈,但期权要给'", score: 2 },
              { text: "'不接受 —— 我现在的级别就值这个价'", score: 0 }
            ]
          }
        ]
      },
      {
        id: "startupC",
        name: "AI 创业 C (B 轮)",
        level: "高级工程师 / 联创 5%",
        baseRange: "28-32k + 期权",
        questions: [
          {
            q: "CEO:'你能接受创业公司的节奏吗?'",
            options: [
              { text: "'可以,我之前在大厂也加班'", score: 0 },
              { text: "'我希望先了解你们 burn rate'", score: 2 },
              { text: "'我冲着期权来,节奏我能配合'", score: 1 },
              { text: "'我现在就想稳一点'", score: -2 }
            ]
          },
          {
            q: "CEO:'你怎么看 AI 替代工程师?'",
            options: [
              { text: "'我已经在用 LLM 写 30% 代码了,我是受益者'", score: 2 },
              { text: "'核心系统还是要人,AI 是辅助'", score: 1 },
              { text: "'我没用过 AI,我相信传统工程'", score: -3 },
              { text: "'AI 是泡沫,2 年后破'", score: -2 }
            ]
          },
          {
            q: "CEO:'你为什么不去更大的公司?'",
            options: [
              { text: "实话 —— '大厂裁我了'", score: -1 },
              { text: "'我想做一些更有影响力的事'", score: 2 },
              { text: "'我想拿期权'", score: 1 },
              { text: "'我想换换环境'", score: 0 }
            ]
          }
        ]
      },
      {
        id: "foreignD",
        name: "外企 D (养老向)",
        level: "Senior Engineer",
        baseRange: "25-30k(年终 1-2 月)",
        questions: [
          {
            q: "Hiring Manager:'Tell me about a conflict you handled.'(讲讲你处理过的冲突)",
            options: [
              { text: "讲产品经理改需求的事,你怎么协调", score: 2 },
              { text: "讲跨部门资源抢的事,你站队 VP 那次", score: -1 },
              { text: "讲带新人冲突,你扛了 C 那次", score: 2 },
              { text: "'我没什么冲突,大家挺好相处的'", score: -2 }
            ]
          },
          {
            q: "HM:'Why our company?'(为什么选我们)",
            options: [
              { text: "实话 —— '我想 work-life balance'", score: 1 },
              { text: "'我用过你们的产品,很欣赏'", score: 2 },
              { text: "'外企稳定'", score: -1 },
              { text: "'我朋友在这里,推荐我来'", score: 1 }
            ]
          },
          {
            q: "HM:'你的英语水平?'",
            options: [
              { text: "'Fluent reading, fair speaking'", score: 1 },
              { text: "'I can communicate in English daily.'", score: 2 },
              { text: "'我读英文文档没问题,口语一般'", score: 0 },
              { text: "'我英语不行,但能学'", score: -2 }
            ]
          }
        ]
      }
    ],

    // 通过线:每家公司 3 题总分 >= 3 通过
    passThreshold: 3,

    // 结算 —— 拿到的 offer 数量决定后续走向
    outcomes: {
      // 拿到 3-4 个 offer
      excellent: {
        condition: (passed) => passed >= 3,
        log: "面试一周后,你拿到 N 个 offer。\n你 30 多岁,在这个市场你还能挑。\nN+1 都没花完,你已经签了下家。",
        effect: { fame: 8, comm: 5, network: 5, health: 5 }
      },
      // 拿到 1-2 个 offer
      ok: {
        condition: (passed) => passed >= 1,
        log: "你拿到 N 个 offer。\n不是最好的选择,但够你不失业。\n签字那天你给自己买了瓶酒。",
        effect: { fame: 3, comm: 3, health: -3 }
      },
      // 0 offer
      failed: {
        condition: () => true,
        log: "4 家全挂。\n这周很难熬。你坐在阳台上看了一晚的天。\n你打开 BOSS 直聘,设了一个新的目标:'P 不重要,base 不重要,先有班上。'",
        effect: { fame: -10, health: -15, money: -20 }
      }
    }
  },

  // ============ 中级评审(初转中)============
  mid_review: {
    title: "🪪 中级工程师答辩",
    targetTitle: "mid",
    prepNarrative: `你 26 岁。
{tl} 昨晚拍你肩说:"明天答辩,我推你。你准备下。"

你回家做了一份 PPT。10 页。改到凌晨 2 点。
你媳妇还没睡,问:"中级答辩还要这么紧张?"
你说:"组里同期 6 个人,这次能过的也就 3 个。"

第二天早上你比平时早 1 小时到公司。
会议室在 5 楼。`,
    intro: `推开门。{tl} 一个人坐在你对面,泡了杯茶。
他说:"放轻松,讲讲你这一年做了啥。"
你嗓子有点干。`,
    judges: [
      { id: "tl", emoji: "👔", label: "TL {tl}", bias: "实际产出" }
    ],
    questions: [
      {
        q: "{tl}:'你这一年做的最有难度的事是什么?'",
        options: [
          {
            text: "P0 那次 —— 半夜起来排查,15 分钟定位 NPE,推动回滚",
            scores: { tl: 2 }
          },
          {
            text: "支撑了一个新业务上线 —— 写了 3 个微服务,QPS 扛住 1k",
            scores: { tl: 2 }
          },
          {
            text: "把组里的祖传屎山重构了一部分,降了 30% 的 bug 率",
            scores: { tl: 1 }
          },
          {
            text: "其实没啥特别难的,就是日常需求",
            scores: { tl: -2 }
          }
        ]
      },
      {
        q: "{tl}:'你觉得你和初级最大的区别是什么?'",
        options: [
          {
            text: "能独立扛端到端的事,不用我盯",
            scores: { tl: 2 }
          },
          {
            text: "代码风格变好了,我现在 review 几乎不挑你",
            scores: { tl: 1 }
          },
          {
            text: "对业务有理解了,不只是写代码",
            scores: { tl: 2 }
          },
          {
            text: "工资期望比以前高了 😅",
            scores: { tl: -1 }
          }
        ]
      }
    ],
    // 总分阈值:满分 4(2评委*2题 = 4 / 这里只有1评委*2题=4)
    outcomes: {
      pass: {
        condition: (total) => total >= 3,
        effect: { tech: 3, comm: 3, fame: 3 },
        log: "{tl} 30 秒就总结了:'OK,过了。下周公示。'\n你出会议室的时候,腿有点软。\n中午食堂遇到同期没过的小张,他笑着恭喜你,你说'下次到你'。",
        upgradeTo: "mid"
      },
      keep_position: {
        condition: (total) => total >= 0,
        effect: { fame: -3, health: -5 },
        log: "{tl}说:'今年名额紧,你再积累一年。'\n你知道这话翻译过来就是 —— 你还没到。",
        outcome: "keep_position",
        followupChain: [
          {
            title: "三个月后 · 部门聚餐",
            text: `Q4 部门聚餐。同期入职的小张升了中级,他坐主桌,{tl}特意叫了他敬酒。
你坐在角落,和实习生那一桌。
小张主动过来碰你的杯,说:'哥下次到你。'
你笑着干了。回家路上,你把这句话翻来覆去想。`,
            choices: [
              { text: "祝福他,你不嫉妒", hint: "健康 +3 沟通 +3", effect: { health: 3, comm: 3 } },
              { text: "心里有点酸", hint: "健康 -3", effect: { health: -3 } },
              { text: "开始悄悄看外面机会", hint: "存款 -3 健康 -3", effect: { money: -3, health: -3 }, flags: ["thinking_jump_mid"] }
            ]
          },
          {
            title: "半年后 · 小张挑大梁,你做边缘活",
            text: `小张升中级后被分到核心组 owner 新业务。你被分去维护一个 5 年前的老服务,需求基本没了,只剩 oncall 值班。
你和小张以前每天午饭一起吃,现在他经常和核心组的人吃。
你不怪他,你 25 岁那年也这样。
但你心里清楚 —— 你和他之间,有些东西回不去了。`,
            choices: [
              { text: "撑住,明年再考中级", hint: "技术 +3 健康 -8 声誉 +3  · 再战", effect: { tech: 3, health: -8, fame: 3 }, flags: ["mid_retry_next_year"] },
              { text: "干脆跳槽,这家公司不识货", hint: "存款 +15 健康 -5 声誉 +3  · 跳板", effect: { money: 15, health: -5, fame: 3 }, flags: ["passive_jump", "jumped_after_fail_mid"], doJobChange: "中级评审挂了 + 边缘化,跳走" },
              { text: "彻底躺平,反正中级也就这样", hint: "技术 -3 健康 +5 沟通 -3", effect: { tech: -3, health: 5, comm: -3 }, flags: ["mindset_lieflat"] }
            ]
          }
        ]
      },
      keep_position_fallback: {
        condition: () => true,  // 中级失败兜底,不会被裁
        effect: { fame: -5, health: -5 },
        log: "{tl}罕见地皱了眉:'你这答得有点散。回去想清楚再来。'",
        outcome: "keep_position",
        followupChain: [
          {
            title: "三个月后 · 你成了部门里那个'还没升中级'的老员工",
            text: `小张升了。当年比你晚 3 个月入职的小王也升了。
你成了组里最久的初级。
组里讨论问题,小张和小王会被叫去,你不会。
你 27 岁。{tl}还是会拍你肩,但不再说'下次到你'。`,
            choices: [
              { text: "再积累一年,绝不放弃", hint: "技术 +5 健康 -10  · 死磕派", effect: { tech: 5, health: -10 }, flags: ["mid_retry_next_year"] },
              { text: "跳到中厂,直接拿中级 title", hint: "存款 +10 健康 -5  · 跳板换 title", effect: { money: 10, health: -5 }, flags: ["passive_jump", "jumped_after_fail_mid"], doJobChange: "答辩挂了,跳中厂换 title" },
              { text: "心累了,先休息半年", hint: "存款 -10 健康 +10 技术 -5", effect: { money: -10, health: 10, tech: -5 }, flags: ["gap_year"] }
            ]
          }
        ]
      }
    }
  },

  // ============ 高级评审(中转高级)============
  senior_plus_review: {
    title: "🪪 高级工程师答辩",
    targetTitle: "senior_plus",
    prepNarrative: `你 29 岁。中级做了 1 年半,今年是冲高级的窗口。
高级 = P7,这是大厂晋升的第一道"分水岭"。
之前的中级是"能不能干活",这一级要证明的是"能不能 own 一摊事"。

你 PPT 改了 22 版。
你媳妇问:'你不是去年才升中级吗,怎么又开始紧张?'
你说:'高级才是真升级。'
凌晨 1 点你还在改备注,你想起前年答辩中级时,你 27 岁,觉得中级就是终点了。

会议室在 8 楼。你提前 25 分钟到。`,
    intro: `{tl}和业务负责人小郑坐在你对面。
小郑你只在跨部门会议见过,听说他对技术人 review 严苛。
{tl}冲你点头。你打开 PPT。第一页有点卡。`,
    judges: [
      { id: "tl",  emoji: "👔", label: "TL {tl}",   bias: "独立度" },
      { id: "biz", emoji: "💼", label: "业务方小郑", bias: "落地能力" }
    ],
    questions: [
      {
        q: "小郑:'你做过的事里,哪个是真正你 own 的?具体讲讲。'",
        options: [
          {
            text: "'X 项目 —— 从需求拆解、技术方案、上线推进,3 个月,我一个人扛的'",
            scores: { tl: 2, biz: 2 }
          },
          {
            text: "'Y 重构 —— {tl}给方向,我执行;后期我自己提了一个优化方案被采纳'",
            scores: { tl: 2, biz: 0 }
          },
          {
            text: "'我和小张一起做的 Z 项目,业务效果不错'",
            scores: { tl: 0, biz: 1 }
          },
          {
            text: "'其实老实说,我现在还在'被推着干',独立的事不多'",
            scores: { tl: -1, biz: -2 }
          }
        ]
      },
      {
        q: "{tl}:'中级到高级,你觉得自己变了什么?'",
        options: [
          {
            text: "'我开始会问「为什么做」,不是「怎么做」了'",
            scores: { tl: 2, biz: 2 }
          },
          {
            text: "'技术上我深入了,GitHub 上有 800 star 的项目'",
            scores: { tl: 1, biz: 0 }
          },
          {
            text: "'我开始能和业务方掰扯需求合理性了 —— 上次砍掉一个不合理需求,省了 2 周工时'",
            scores: { tl: 2, biz: 1 }
          },
          {
            text: "'我赚的钱比以前多了点'",
            scores: { tl: -2, biz: -1 }
          }
        ]
      }
    ],
    // 满分 8(2 评委 × 2 题 × 2),通过线 4
    outcomes: {
      pass: {
        condition: (total) => total >= 4,
        effect: { tech: 5, comm: 5, fame: 5, money: 12 },
        log: "小郑点头:'你这是真的 own 过,讲得清。OK。'\n{tl}笑了:'恭喜,P7。'\n你出会议室那一刻感觉自己解锁了一档,这是你第一次相信'我能独立扛一摊事'。",
        upgradeTo: "senior_plus"
      },
      keep_position: {
        condition: (total) => total >= 0,
        effect: { fame: -4, health: -6 },
        log: "小郑说:'你讲的事我感觉你是参与不是 own。回去再积累。'\n{tl}没说话。\n你回家路上一直想 —— 你以为你 own 了,但别人不这么看。",
        outcome: "keep_position",
        followupChain: [
          {
            title: "半年后 · 你看着同期升 P7,你还是 P6",
            text: `小张升了 P7,今年开始带 2 个人的小组。
你还是 P6,做的事和去年差不多,但你的"老板"现在多了一层 —— 小张。
小张是你 26 岁那年带过的实习生。

公司没明说,但你知道大家心里的逻辑 —— 你"被压"了。
你 29 岁。`,
            choices: [
              { text: "再战明年高级", hint: "技术 +5 健康 -10 沟通 +3", effect: { tech: 5, health: -10, comm: 3 }, flags: ["senior_plus_retry"] },
              { text: "跳到中厂,直接拿 P7+", hint: "存款 +30 健康 -5 声誉 +3", effect: { money: 30, health: -5, fame: 3 }, flags: ["passive_jump", "jumped_after_fail_sp"], doJobChange: "高级答辩挂了,跳中厂换 title" },
              { text: "申请转技术管理岗,绕开 IC 答辩", hint: "沟通 +5 技术 -3 存款 +15", effect: { comm: 5, tech: -3, money: 15 }, flags: ["track_manager"] }
            ]
          }
        ]
      },
      keep_position_fallback: {
        condition: () => true,
        effect: { fame: -6, health: -8 },
        log: "小郑直接说:'你这级别不到。'\n{tl}事后找你聊了 20 分钟,核心一句话 —— '你太执行了,你要往上跳一级思考'。",
        outcome: "keep_position",
        followupChain: [
          {
            title: "三个月后 · 你成了组里那个'卡 P6 的老人'",
            text: `部门里有几个像你这样卡在 P6 的人,他们都比你大 2-3 岁。
你以前看他们,以为他们是技术不行。
现在你混在他们里,你才发现:他们其实和你一样能干,只是没运气、没贵人、没赶上风口。
你 29 岁。`,
            choices: [
              { text: "学他们,卡住也认了,稳稳干", hint: "健康 +3 技术 +3  · 平躺", effect: { health: 3, tech: 3 }, flags: ["accept_p6_stuck"] },
              { text: "跳走 —— 你不想成为他们", hint: "存款 +25 健康 -3 声誉 +3", effect: { money: 25, health: -3, fame: 3 }, flags: ["passive_jump", "jumped_after_fail_sp"], doJobChange: "不想卡 P6,跳走" }
            ]
          }
        ]
      }
    }
  },

  // ============ 资深评审(高级转资深)============
  senior_review: {
    title: "🪪 资深工程师答辩",
    targetTitle: "senior",
    prepNarrative: `你 30 岁。高级做了 2 年,今年是冲资深的关键窗口。
资深 = P7+ / P8 临界,这一级是"能不能带方向"的分水岭。
高级是 own 一摊事,资深是 own 一整条线 + 带 3-5 个人。

这次答辩有 2 个评委:你的 TL —— {tl},还有产品线的 PM 王哥。
PM 王哥你只在评审会上见过,据说他给资深晋升只关心一件事 —— "你的事对业务的实际贡献"。

PPT 你改了 30 版。
凌晨 1 点你媳妇说:"你要不要去吃个夜宵?"
你说:"明天 9 点答辩,我不能困。"
她说:"我说的是现在 1 点。"

会议室在 12 楼。你提前 20 分钟到。`,
    intro: `{tl}和 PM 王哥已经坐着了。
{tl}冲你点了下头。王哥盯着自己的笔记本,没抬头。
你说"各位领导好",王哥这才看你。
他笑了下:"开始吧。"
你打开 PPT。`,
    judges: [
      { id: "tl",  emoji: "👔", label: "TL {tl}",   bias: "技术功底" },
      { id: "pm",  emoji: "💼", label: "PM 王哥",   bias: "业务贡献" }
    ],
    questions: [
      {
        q: "王哥:'你过去这两年,做的事给业务带来了多少价值?'",
        options: [
          {
            text: "讲数字 —— 'GMV 增长 23%,我主导的优化贡献了其中 8 个百分点'",
            scores: { tl: 0, pm: 2 }
          },
          {
            text: "讲技术 —— '架构升级让支付链路 P99 从 800ms 降到 120ms'",
            scores: { tl: 2, pm: 0 }
          },
          {
            text: "讲平衡 —— '技术升级直接支撑了双 11 多扛 3 倍流量,业务侧 GMV 翻倍'",
            scores: { tl: 2, pm: 2 }
          },
          {
            text: "讲过程 —— '我们做了很多事,具体数字我得回去查'",
            scores: { tl: -1, pm: -2 }
          }
        ]
      },
      {
        q: "{tl}:'你觉得资深和中级最本质的区别是什么?'",
        options: [
          {
            text: "能 own 一个项目从 0 到 1,自己拆解、推进、交付",
            scores: { tl: 2, pm: 1 }
          },
          {
            text: "可以带 1-2 个中级 / 初级,出活儿比单干多",
            scores: { tl: 1, pm: 1 }
          },
          {
            text: "对技术方案有自己的判断,不只是执行需求",
            scores: { tl: 2, pm: -1 }
          },
          {
            text: "工资能 hold 住房贷了 😂",
            scores: { tl: -2, pm: -1 }
          }
        ]
      }
    ],
    // 满分 8(2评委*2题*2分),通过线 4
    outcomes: {
      pass: {
        condition: (total) => total >= 4,
        effect: { tech: 5, comm: 5, fame: 5, money: 15 },
        log: "王哥合上笔记本:'OK 没问题。'\n{tl}笑了下:'恭喜。'\n你走出会议室,看了眼手机,小赵(你 4 年前带过的实习生,现在也是中级了)给你发了个红包说提前恭喜。\n你回家路上买了瓶酒。",
        upgradeTo: "senior"
      },
      keep_position: {
        condition: (total) => total >= 0,
        effect: { fame: -5, health: -8 },
        log: "王哥说:'你回去等通知。'\n第二天 HRBP 张姐告诉你:'今年资深名额紧,再积累一年。'\n你心里很清楚 —— 这话你 26 岁那年也听过。",
        outcome: "keep_position",
        followupChain: [
          {
            title: "半年后 · LZ 升资深,接手核心项目",
            text: `LZ 是你大学室友,你俩同时入职。今年他升资深了。
内部公告出来的那天,你在群里发了个鼓掌表情。
小赵(已经转正快 4 年的中级)私下问你:'X 哥,你今年怎么没过?'
你说:'明年再来。'
你看到 LZ 朋友圈晒新的项目立项书,你点了赞,没评论。`,
            choices: [
              { text: "约 LZ 吃饭聊聊,取经", hint: "技术 +5 人脉 +5 健康 -3", effect: { tech: 5, network: 5, health: -3 } },
              { text: "默默关上朋友圈,埋头干活", hint: "技术 +5 健康 -5  · 闷头干", effect: { tech: 5, health: -5 } },
              { text: "心里有点酸,开始想跳", hint: "存款 -3 健康 -5", effect: { money: -3, health: -5 }, flags: ["thinking_jump_senior"] }
            ]
          },
          {
            title: "一年后 · 你和 LZ 已经不在一个圈子",
            text: `LZ 现在是 5 人小组的 TL。
你还是 IC,做的还是去年那块业务。
你们以前每周都一起午饭,现在他午饭都和他组里的人吃。
组里讨论新项目立项,会议室门关着,你不在里面。
买房压力大,你儿子明年上幼儿园。`,
            choices: [
              { text: "再战明年资深,你不甘心", hint: "技术 +5 健康 -10 沟通 +3", effect: { tech: 5, health: -10, comm: 3 }, flags: ["senior_retry_next_year"] },
              { text: "找猎头投简历,跳板换 title", hint: "存款 +25 健康 -5 声誉 +5", effect: { money: 25, health: -5, fame: 5 }, flags: ["passive_jump", "jumped_after_fail_senior"], doJobChange: "资深答辩挂了,跳别家换 title" },
              { text: "申请内部转岗,换个组喘口气", hint: "沟通 +5 健康 -3 技术 -3  · 横转", effect: { comm: 5, health: -3, tech: -3 }, flags: ["internal_transfer"] },
              { text: "彻底躺平,反正卷不动了", hint: "技术 -5 健康 +8 沟通 -3", effect: { tech: -5, health: 8, comm: -3 }, flags: ["mindset_lieflat"] }
            ]
          }
        ]
      },
      keep_position_fallback: {
        condition: () => true,
        effect: { fame: -8, health: -10 },
        log: "王哥皱眉:'你这准备得不太够。'\n{tl}没说话。\n你回家路上一直在想自己哪里没讲清楚。",
        outcome: "keep_position",
        followupChain: [
          {
            title: "三个月后 · 你被边缘化了",
            text: `答辩挂得不好看,这事在部门内部传开了。
原本要交给你做 TL 候选的小组,临时换了人。
小赵(你 4 年前带过的小赵,现在已经是中级)被分到核心组,他第一周遇到问题主动找 LZ,不来找你了。
你工位上的咖啡杯越积越多。`,
            choices: [
              { text: "强忍着,埋头干活证明自己", hint: "技术 +8 健康 -15  · 死磕", effect: { tech: 8, health: -15 } },
              { text: "主动找{tl}谈调岗,换个赛道", hint: "沟通 +5 技术 -3", effect: { comm: 5, tech: -3 }, flags: ["internal_transfer"] },
              { text: "直接走人,这家公司你待够了", hint: "存款 +20 健康 +5 声誉 -3", effect: { money: 20, health: 5, fame: -3 }, flags: ["passive_jump", "jumped_after_fail_senior"], doJobChange: "答辩失败后被边缘化,跳走" }
            ]
          }
        ]
      }
    }
  },

  // ============ 专家评审(资深转专家)============
  expert_review: {
    title: "🪪 技术专家答辩",
    targetTitle: "expert",
    prepNarrative: `你 38 岁。
你做资深做了 4 年。35 岁那一关刚扛过去,你想再冲一次专家(P8)。
这是这一行体力还能撑住的最后窗口 —— 再晚一年,熬不动了。

这次有 3 个评委:{tl}、PM 王哥、跨部门的架构师老黎。
老黎是个传说级人物,40 岁,从来没人在他面前 PPT 顺利讲完。

你 PPT 改了 50 版。
最后一周你每天 5 点起来,在地铁上还在改备注。
你媳妇说:"你这状态比 25 岁拼。"
你说:"25 岁那时候我没什么可输的。"

会议室在 18 楼,大会议桌。
你提前 30 分钟到,把投影测试了 4 次。`,
    intro: `老黎最后一个进。他看了你一眼,没问好,直接坐下。
{tl}给你一个鼓励的眼神。
你开始讲。第 3 页 PPT 时,老黎已经皱眉了。`,
    judges: [
      { id: "tl",   emoji: "👔", label: "TL {tl}",     bias: "团队信任" },
      { id: "pm",   emoji: "💼", label: "PM 王哥",     bias: "业务价值" },
      { id: "arch", emoji: "🏛", label: "架构师老黎",  bias: "技术深度" }
    ],
    questions: [
      {
        q: "老黎:'你说你做的架构是公司核心 —— 在没有你的情况下,这套系统能撑多久?'",
        options: [
          {
            text: "诚实 —— '我已经写了 60 页文档,小赵能接手 80%,关键决策可能需要我远程指导 3 个月'",
            scores: { tl: 2, pm: 2, arch: 2 }
          },
          {
            text: "技术派 —— '我们设计就是高可用,任何人接手都能跑。'",
            scores: { tl: 0, pm: 1, arch: -1 }
          },
          {
            text: "邀功派 —— '说实话,没人能完全接住我的位置,这个系统的复杂度只有我懂'",
            scores: { tl: -2, pm: -2, arch: -2 }
          },
          {
            text: "反问 —— '你为什么会问这个?是有人要走吗?'",
            scores: { tl: -1, pm: 0, arch: 1 }
          }
        ]
      },
      {
        q: "王哥:'专家和资深拿的是两条线的钱。你凭什么值这个差价?'",
        options: [
          {
            text: "用 ROI 说话 —— '我主导的 3 个项目过去 2 年累计为公司省了 4000 万成本'",
            scores: { tl: 1, pm: 2, arch: 1 }
          },
          {
            text: "用影响力说话 —— '我培养了 6 个资深,其中 2 个已经独当一面'",
            scores: { tl: 2, pm: 1, arch: 0 }
          },
          {
            text: "用稀缺性说话 —— '我做的事,这家公司只有 5 个人能做,我是其中一个'",
            scores: { tl: 1, pm: 1, arch: 2 }
          },
          {
            text: "诚实承认 —— '我不知道我值不值,但我会尽力对得起这个 title'",
            scores: { tl: 1, pm: -1, arch: 1 }
          }
        ]
      },
      {
        q: "老黎:'你接下来 3 年想干什么?'",
        options: [
          {
            text: "深挖技术 —— '我想把我们的系统做成行业标杆,3 年内开源'",
            scores: { tl: 0, pm: -1, arch: 2 }
          },
          {
            text: "做业务 —— '我想跟 PM 一起,把这条业务线做到 100 亿 GMV'",
            scores: { tl: 1, pm: 2, arch: 0 }
          },
          {
            text: "带团队 —— '我想培养一波技术骨干,3 年内组里能有 3 个专家'",
            scores: { tl: 2, pm: 1, arch: 1 }
          },
          {
            text: "稳一稳 —— '我老婆刚生二胎,我想稳定一段时间'",
            scores: { tl: 0, pm: -1, arch: -1 }
          }
        ]
      }
    ],
    // 满分 18(3评委*3题*2),通过线 8
    outcomes: {
      pass: {
        condition: (total) => total >= 8,
        effect: { tech: 8, comm: 5, fame: 10, money: 30, network: 5 },
        log: "老黎合上笔记本:'你今天讲得比我预期好。'\n你愣了 0.5 秒才反应过来 —— 这是他最高的赞美。\n{tl}已经在群里发庆祝表情了。\n你晚上和媳妇出去吃饭,她说你看起来精神好了一点。",
        upgradeTo: "expert"
      },
      keep_position: {
        condition: (total) => total >= 0,
        effect: { fame: -8, health: -10, money: -5 },
        log: "老黎说:'再想想。'\n王哥说:'今年专家名额给到业务侧那边更合适。'\n{tl}没说话。\n你回到工位,看着自己 50 版的 PPT,关掉了文件。",
        outcome: "keep_position",
        followupChain: [
          {
            title: "半年后 · 你带过的小赵升专家了",
            text: `公司内网公告:小赵晋升专家。
小赵就是 7 年前你带的那个实习生,if 嵌套 if 都写不利索的那个。
你点开他的晋升答辩 PPT —— 38 页,做得比你的好。
他的项目老黎评价 '行业领先',这是老黎给你的答辩里没说过的话。

你 34 岁,资深做了 4 年。
小赵 30 岁,刚升专家。
他还在群里 @ 你说 '哥,谢谢当年的 review'。
你给他发了个红包。`,
            choices: [
              { text: "祝福他,你真心为他高兴", hint: "健康 +3 沟通 +5 声誉 +3", effect: { health: 3, comm: 5, fame: 3 }, flags: ["xiaozhao_surpassed"] },
              { text: "你心里非常不是滋味", hint: "健康 -10 沟通 -3", effect: { health: -10, comm: -3 }, flags: ["xiaozhao_surpassed"] },
              { text: "默默看完 PPT 后,你删了你 50 版的版本", hint: "技术 -3 健康 +5  · 放下", effect: { tech: -3, health: 5 }, flags: ["xiaozhao_surpassed"] }
            ]
          },
          {
            title: "一年后 · 你和小赵的关系变了",
            text: `小赵升专家后,接了一个跨部门的核心项目。
他给你 IM 说:'哥,这个 owner 我想推你做,但是我老板希望 owner 是专家。'
言外之意 —— 你的 title 不够,你做不了 owner,只能做执行。
你接住了,你说:'没事,你定。'
但你心里清楚 —— 上下级关系反过来了。`,
            choices: [
              { text: "明年再战专家答辩,不能就这样", hint: "技术 +8 健康 -15 沟通 +3", effect: { tech: 8, health: -15, comm: 3 }, flags: ["expert_retry_next_year"] },
              { text: "跳到另一家公司,直接拿专家 title", hint: "存款 +40 健康 -8 声誉 +5", effect: { money: 40, health: -8, fame: 5 }, flags: ["passive_jump", "jumped_after_fail_expert"], doJobChange: "专家答辩挂了,跳别家直接拿 title" },
              { text: "接受现实,做小赵的下属,稳稳干到退休", hint: "沟通 +5 健康 +5 声誉 -8  · 服气", effect: { comm: 5, health: 5, fame: -8 }, flags: ["accepted_subordinate"] },
              { text: "申请转管理岗,绕过 IC 答辩", hint: "沟通 +8 技术 -5 存款 +20", effect: { comm: 8, tech: -5, money: 20 }, flags: ["late_manager", "track_manager"] }
            ]
          }
        ]
      },
      keep_position_fallback: {
        condition: () => true,
        effect: { fame: -12, health: -12, money: -5 },
        log: "老黎中途打断了你 3 次。\n第 4 次他直接说:'我们没有更多问题了。'\n王哥眼神飘走了。\n你走出会议室,在走廊里站了 5 分钟。",
        outcome: "keep_position",
        followupChain: [
          {
            title: "一个月后 · 你的小赵已经在和别人讨论你的方案",
            text: `你路过会议室,听到小赵在跟跨部门的人讨论。
他正在讲一套架构方案 —— 那是你 3 年前写的。
他没提你的名字。也许是无意,也许不是。
你站门口听了 2 分钟,转身走了。`,
            choices: [
              { text: "找小赵谈,把话说开", hint: "沟通 +5 声誉 +3 健康 -3", effect: { comm: 5, fame: 3, health: -3 } },
              { text: "什么都不说,这种事计较没意思", hint: "健康 -3", effect: { health: -3 } },
              { text: "回工位写邮件 —— 你要离开这家公司", hint: "存款 +30 健康 +5 声誉 -3", effect: { money: 30, health: 5, fame: -3 }, flags: ["passive_jump", "jumped_after_fail_expert"], doJobChange: "答辩失败后被边缘化,主动跳" }
            ]
          }
        ]
      }
    }
  },

  // ============ 首席评审 ============
  // 5 评委 × 3 题,每个答案对每个评委有打分
  // 通过/失败 → 三种后果
  principal_review: {
    title: "💎 首席工程师晋升评审",
    targetTitle: "principal",
    // 准备期文案(渲染在评审前一个独立屏)
    prepNarrative: `你已经是技术专家 5 年。
今年公司给了你首席评审的资格 —— 一年通过率 8%。

过去三周,你 PPT 改了 47 版。
你媳妇问:'你为什么每天改到 1 点?'
你说:'万一过了,这家公司就再没什么能让我心动的了。'
她说:'不过呢?'
你没回答。

昨天晚上你只睡了 3 小时。今天早上你换了三件衬衫才出门。
你 38 岁。这一行你已经走了 16 年。

会议室在 18 楼。你坐电梯上来的时候,胃里翻江倒海。`,
    intro: `推开门。
5 个评委坐你对面。
VP 老李看了你一眼,你认识他 12 年了,他第一次用这种表情看你。
你打开 PPT。空调突然变得很冷。`,

    judges: [
      { id: "vp",    emoji: "🧓", label: "VP 老李",   bias: "战略" },
      { id: "cto",   emoji: "👩", label: "CTO",       bias: "技术深度" },
      { id: "biz",   emoji: "💼", label: "业务老板",  bias: "ROI" },
      { id: "peer",  emoji: "🧑", label: "平级专家",  bias: "真实度" },
      { id: "hrd",   emoji: "🎯", label: "HRD",       bias: "文化" }
    ],

    questions: [
      {
        q: "VP 老李:'介绍下你过去 3 年最骄傲的项目,以及它对公司的战略价值。'",
        options: [
          {
            text: "重点讲技术挑战 —— '我们做了业内第一个 XX 架构,QPS 从 5000 到 50000'",
            scores: { vp: -1, cto: 2, biz: -1, peer: 1, hrd: 0 }
          },
          {
            text: "重点讲业务结果 —— 'GMV 提升 18%,人效翻倍,公司因此进入新赛道'",
            scores: { vp: 2, cto: -1, biz: 2, peer: 0, hrd: 1 }
          },
          {
            text: "讲技术+业务平衡 —— '架构升级支撑了新业务,3 年 ROI 是 12 倍'",
            scores: { vp: 1, cto: 1, biz: 2, peer: 1, hrd: 1 }
          },
          {
            text: "诚实承认 —— '其实没有那种'最骄傲',我们就是把每件事做扎实'",
            scores: { vp: -1, cto: 0, biz: -2, peer: 2, hrd: 0 }
          }
        ]
      },
      {
        q: "CTO:'你怎么看大模型时代我们这条产品线的未来?'",
        options: [
          {
            text: "信心满满 —— 'LLM 是机会,我们已经在做 RAG 落地,半年内有 10% 增长点'",
            scores: { vp: 1, cto: 1, biz: 2, peer: -1, hrd: 1 }
          },
          {
            text: "技术深挖 —— '我们 infra 改造已经支持 vLLM 推理,模型压缩到 1B 还能保 80% 精度'",
            scores: { vp: 0, cto: 2, biz: -1, peer: 2, hrd: 0 }
          },
          {
            text: "保守 —— 'LLM 不是银弹,核心还是数据闭环和工程能力,我们不盲目跟风'",
            scores: { vp: 2, cto: 0, biz: 1, peer: 1, hrd: 1 }
          },
          {
            text: "扯到管理 —— '我已经组建了 AI 小组,招了 8 个人,人才战略才是关键'",
            scores: { vp: 1, cto: -2, biz: 0, peer: -2, hrd: 0 }
          }
        ]
      },
      {
        q: "HRD:'你怎么带团队?如何在高压环境保持团队凝聚力?'",
        options: [
          {
            text: "硬核派 —— 'KPI 拉满,该 PIP 的 PIP,留下来的都是精英'",
            scores: { vp: 0, cto: -1, biz: 1, peer: -2, hrd: -2 }
          },
          {
            text: "怀柔派 —— '心理安全感优先,我做了 23 次 1on1,知道每个人想要什么'",
            scores: { vp: 1, cto: 0, biz: -1, peer: 2, hrd: 2 }
          },
          {
            text: "结果派 —— '关心人也要关心结果,我会用透明 OKR 让大家自驱'",
            scores: { vp: 2, cto: 1, biz: 2, peer: 1, hrd: 1 }
          },
          {
            text: "实话派 —— '说实话我也不知道,管 200 人和管 20 人是两回事,我在学'",
            scores: { vp: -1, cto: 0, biz: -1, peer: 2, hrd: 0 }
          }
        ]
      }
    ],

    // 评分阈值(总分 = sum of all picks, 5 评委×3题, 最高 2×5×3=30, 最低 -30)
    // 通过线:>= 12 分
    // 折中线:0 ~ 12 分 (失败但温柔)
    // 灾难线:< 0 分(失败且公司看穿你水平)

    outcomes: {
      pass: {
        condition: (total) => total >= 12,
        effect: { fame: 15, comm: 8, network: 10, money: 30 },
        log: "评委们交换了眼神。VP 老李说:'你准备得很充分。结果下周公示。'\n下周一,你看到内部公告 —— 首席工程师 X(就是你)正式生效。\n你 38 岁,这一行内能拿到的 title 你已经拿到了。",
        upgradeTo: "principal"
      },
      keep_position: {
        condition: (total) => total >= 0,
        effect: { fame: -5, health: -8 },
        log: "评委们客气地说:'你回去等通知。'\n一周后 HRBP 找你:'今年首席名额紧,你再积累一年。'\n你心里很清楚,这话翻译过来就是 —— 不行。你回到原位置,P7。\n这一年其他人在升,你在原地。",
        outcome: "keep_position"
      },
      fired: {
        condition: () => true,
        effect: { fame: -15, health: -15, comm: -5 },
        log: "你答辩当晚就接到 TL 电话。\n第二天 HRBP 张姐找你,说:'公司觉得你的能力没达到 P7 应有的水平。'\n她推过来 N+1 协议。\n你 38 岁,你刚买的二套房贷款还有 25 年。",
        outcome: "fired"
      }
    }
  },


  // 玩法 1: Bug 排查(新版 · 三阶段)
  // 阶段1: 在日志里找到 NPE 行
  // 阶段2: 看 3 个 PR diff,找出哪个引入了 NPE
  // 阶段3: 复盘关键词评分
  bug_hunt: {
    title: "🐛 凌晨 02:43 · 支付服务 P0",
    intro: `你刚转正一周。电话把你从被窝里捞出来。
TL 发来一句话:"你先看,我 10 分钟到。"
你打开公司笔记本,屏幕亮起。`,

    // ============ 阶段一: 找 NPE ============
    phase1: {
      hint: "线上爆了 NullPointerException。在日志里找到它,点击那一行。",
      // 真实日志文本,玩家要滚动查看,NPE 行带 className="bug-line"
      logLines: [
        "2026-05-11 02:38:01 INFO  [http-nio-8080-exec-3] PayController received request orderId=20260511028471",
        "2026-05-11 02:38:01 DEBUG [http-nio-8080-exec-3] AmountValidator check amount=99.00 result=PASS",
        "2026-05-11 02:38:01 INFO  [http-nio-8080-exec-3] CouponService lookup code=SPRING2026",
        "2026-05-11 02:38:01 DEBUG [http-nio-8080-exec-3] CouponService cache miss, query db",
        "2026-05-11 02:38:01 INFO  [http-nio-8080-exec-3] CouponService db returned null",
        "2026-05-11 02:38:02 INFO  [scheduler-1] HealthCheck redis OK",
        "2026-05-11 02:38:02 INFO  [scheduler-1] HealthCheck mysql OK",
        "2026-05-11 02:38:02 INFO  [http-nio-8080-exec-3] PayController received request orderId=20260511028472",
        "2026-05-11 02:38:02 ERROR [http-nio-8080-exec-3] java.lang.NullPointerException: Cannot invoke \"Coupon.valid()\" because \"coupon\" is null",
        "2026-05-11 02:38:02 ERROR [http-nio-8080-exec-3]   at com.foo.order.OrderService.applyCoupon(OrderService.java:142)",
        "2026-05-11 02:38:02 ERROR [http-nio-8080-exec-3]   at com.foo.order.OrderService.createOrder(OrderService.java:88)",
        "2026-05-11 02:38:02 ERROR [http-nio-8080-exec-3]   at com.foo.payment.PayController.pay(PayController.java:58)",
        "2026-05-11 02:38:03 INFO  [http-nio-8080-exec-3] PayController received request orderId=20260511028473",
        "2026-05-11 02:38:03 ERROR [http-nio-8080-exec-3] java.lang.NullPointerException: Cannot invoke \"Coupon.valid()\" because \"coupon\" is null",
        "2026-05-11 02:38:03 INFO  [http-nio-8080-exec-3] PayController received request orderId=20260511028474",
        "2026-05-11 02:38:03 ERROR [http-nio-8080-exec-3] java.lang.NullPointerException: Cannot invoke \"Coupon.valid()\" because \"coupon\" is null",
        "2026-05-11 02:38:04 INFO  [scheduler-2] MetricsCollector flushed 1024 points",
        "2026-05-11 02:38:04 WARN  [http-nio-8080-exec-5] slow query detected sql=SELECT * FROM orders WHERE ... duration=820ms",
        "2026-05-11 02:38:05 INFO  [http-nio-8080-exec-3] PayController received request orderId=20260511028475",
        "2026-05-11 02:38:05 ERROR [http-nio-8080-exec-3] java.lang.NullPointerException: Cannot invoke \"Coupon.valid()\" because \"coupon\" is null"
      ],
      // 任何包含 NPE 的行点击都算对(更宽容)
      correctMatch: "NullPointerException",
      onFound: {
        text: "你看到了 → java.lang.NullPointerException: Cannot invoke \"Coupon.valid()\" because \"coupon\" is null\n\n好。问题在 OrderService.java:142,优惠券对象是 null 还调了 .valid()。\n\n现在的问题是 —— 这行代码不是你写的。谁的锅?",
        proceed: "继续 · 追责"
      }
    },

    // ============ 阶段二: 追责 ============
    phase2: {
      hint: "看看最近 30 分钟内的 3 个 PR,哪个引入了这个 NPE?点击你认为有问题的 PR。",
      prs: [
        {
          id: "pr-4521",
          title: "#4521  feat: 优惠券适配新春活动",
          author: "张伟",
          time: "02:30 发布(13 分钟前)",
          diff: [
            { type: "ctx",  text: "  public BigDecimal applyCoupon(Order order, String code) {" },
            { type: "del",  text: "    Coupon coupon = couponRepo.findByCode(code);" },
            { type: "del",  text: "    if (coupon != null && coupon.valid()) {" },
            { type: "add",  text: "    Coupon coupon = couponRepo.findByCode(code);" },
            { type: "add",  text: "    if (coupon.valid()) {                       // 新春活动券一定存在,简化" },
            { type: "ctx",  text: "      return order.amount.subtract(coupon.discount);" },
            { type: "ctx",  text: "    }" },
            { type: "ctx",  text: "    return order.amount;" },
            { type: "ctx",  text: "  }" }
          ],
          isCulprit: true,
          why: "PR 作者删掉了 null 判断,理由是\"新春活动券一定存在\"。但用户输入了不存在的券码时,findByCode 返回 null,直接 NPE。这就是你日志里看到的那一行。"
        },
        {
          id: "pr-4519",
          title: "#4519  chore: 升级日志依赖 log4j 2.19 → 2.21",
          author: "李娜",
          time: "01:15 发布(1 小时 28 分钟前)",
          diff: [
            { type: "ctx",  text: "  <dependency>" },
            { type: "ctx",  text: "    <groupId>org.apache.logging.log4j</groupId>" },
            { type: "ctx",  text: "    <artifactId>log4j-core</artifactId>" },
            { type: "del",  text: "    <version>2.19.0</version>" },
            { type: "add",  text: "    <version>2.21.1</version>" },
            { type: "ctx",  text: "  </dependency>" }
          ],
          isCulprit: false,
          why: "纯依赖升级,而且发布时间在故障开始之前 1 小时多,期间一直正常。不是这个锅。"
        },
        {
          id: "pr-4515",
          title: "#4515  fix: 修复退款幂等问题",
          author: "你",
          time: "昨天",
          diff: [
            { type: "ctx",  text: "  public Refund refund(String orderId) {" },
            { type: "add",  text: "    if (refundRepo.existsByOrderId(orderId)) {" },
            { type: "add",  text: "      return refundRepo.findByOrderId(orderId);" },
            { type: "add",  text: "    }" },
            { type: "ctx",  text: "    return doRefund(orderId);" },
            { type: "ctx",  text: "  }" }
          ],
          isCulprit: false,
          why: "这是你昨天的 PR,改的是退款,和支付主流程的优惠券没关系。"
        }
      ]
    },

    // ============ 阶段三: 复盘(三档话术) ============
    // 4 个维度 × 3 档话术,选项暴露你的水位
    // junior=1分 senior=2分 expert=3分,满分 12
    phase3: {
      hint: "TL 让你在事故群发一段复盘。每个维度三选一,你选什么话术,别人就知道你是什么水位。",
      dimensions: [
        {
          name: "根因",
          options: [
            {
              tier: "junior",
              text: "代码报了 NullPointerException,因为优惠券是 null。"
            },
            {
              tier: "senior",
              text: "#4521 删除了 coupon != null 判断,当用户输入不存在的券码时 findByCode 返回 null,后续 coupon.valid() NPE。"
            },
            {
              tier: "expert",
              text: "#4521 在'活动券必存在'的隐含假设下移除了空值防御,但接口未校验入参合法性,导致非法券码穿透到业务层。本质是契约边界未明确 —— 既不在 controller 层拦,也不在 repo 层兜底,缺陷被假设吃掉了。"
            }
          ]
        },
        {
          name: "影响",
          options: [
            {
              tier: "junior",
              text: "用户支付不了,挺多人投诉的。"
            },
            {
              tier: "senior",
              text: "02:38 - 02:51,支付成功率从 99.8% 跌至 82%,影响订单约 4200 单,涉及 GMV 约 41 万。"
            },
            {
              tier: "expert",
              text: "故障窗口 13 分钟,支付链路降级,GMV 损失约 41 万,但更值得关注的是:这是新春活动首日,客诉到达客服 SLA 阈值,Twitter 已有 3 条带品牌名的抱怨,品牌侧影响大于直接损失。"
            }
          ]
        },
        {
          name: "止血",
          options: [
            {
              tier: "junior",
              text: "已经回滚了,现在好了。"
            },
            {
              tier: "senior",
              text: "已回滚 #4521 至上一稳定版本,02:51 各节点流量恢复正常,核心指标已绿。"
            },
            {
              tier: "expert",
              text: "回滚 #4521 止血(02:51 恢复)。已通知客服话术,补偿券模板已生成,等待运营确认推送。下次发布前我会拉一次发布前清单的 review,这次缺的是变更影响评估。"
            }
          ]
        },
        {
          name: "改进",
          options: [
            {
              tier: "junior",
              text: "下次写代码要小心,加上 null 判断。"
            },
            {
              tier: "senior",
              text: "(1) OrderService 加 null 兜底;(2) 优惠券接口加单测覆盖不存在场景;(3) 发布前强制 code review 至少一人。"
            },
            {
              tier: "expert",
              text: "短期:补防御性代码 + 测试用例。中期:支付链路所有入参引入 @NotNull 注解 + 全局 advice 兜底,把空值检查从业务代码下沉到框架层。长期:复盘'活动券必存在'这类隐含假设的清单,纳入新人 onboarding。这次事故是契约问题,不是粗心问题,光改一行代码没意义。"
            }
          ]
        }
      ]
    },

    // ============ 最终结算 ============
    // 综合三阶段评分 → 三档结局
    outcomes: {
      perfect: {
        effect: { tech: 8, fame: 8, comm: 5 },
        log: "你定位到 #4521,在 8 分钟内推动回滚。复盘条理清晰,TL 把你的话原文转发到老板群。第二天晨会,你被点名表扬,这件事写进了你的转正评审 —— 是好的那种。"
      },
      ok: {
        effect: { tech: 3, fame: 2, health: -3 },
        log: "你定位到了问题,但花了点时间。TL 接手后帮你补齐了复盘。整体处理 OK,没掉链子,但也没出彩。"
      },
      bad: {
        effect: { tech: -2, fame: -5, health: -8 },
        log: "你慌了。日志看了好几遍才找到那行 NPE,追责也犹豫了。最后是 TL 到了之后定位的。第二天晨会,你被点名,这事写进了你的转正评审。"
      }
    }
  },

  // 玩法 X: Offer 谈判
  // 3 轮谈判,每轮玩家从手牌选 1 张出。HR 根据公司性格和出牌顺序做反应。
  // 大厂吃"硬"(竞品+GitHub),小厂吃"软"(沉默+GitHub)。
  // 每家公司有独立的初始 offer 和反应规则。
  offer_negotiation: {
    title: "💼 Offer 谈判",
    intro: "你和 HR 微信语音中。3 轮拉锯,每轮出一张牌。\n出牌顺序影响 HR 心理:第一轮就掏底牌通常被压价,留到后面会更主动。",

    // 公司配置,由 flag 决定走哪个
    companies: {
      target_bigtech: {
        name: "字节跳动 · 抖音电商",
        level: "P6",
        baseStart: 32,     // base 月薪(k)
        signonStart: 0,    // 签字费(万)
        equityStart: 0,    // 期权份数(无)
        hrPersonality: "professional", // 大厂 HR:流程化,吃硬不吃软
        opener: "我们 P6 标准是 base 32k,16 薪。你之前 28k,涨幅 14% 我觉得挺合理。你看?",
        flavorPrefix: "字节 HR"
      },
      target_smallco: {
        name: "推理科技 · AI Infra A 轮",
        level: "高级工程师 / 核心 5 号员工",
        baseStart: 26,
        signonStart: 0,
        equityStart: 30,   // 期权 30 份(万股,纸面)
        hrPersonality: "founder",  // 小厂常是创始人/CTO 直接谈,吃软
        opener: "我们现在 A 轮,base 给到 26k,但期权我能拍板给你 30 万股。你之前 28k 对吧?咱不在这点 base 上纠结。",
        flavorPrefix: "CTO 老陈"
      }
    },

    // 5 张筹码
    cards: [
      {
        id: "current_offer",
        label: "亮现司挽留",
        desc: "现司知道你想走,加薪到 32k 挽留",
        hint: "📌 锚定 +温和"
      },
      {
        id: "rival_offer",
        label: "亮竞品 Offer",
        desc: "美团给到 38k base + 5 万签字费",
        hint: "⚔️ 强硬 +拉高薪资"
      },
      {
        id: "github_proof",
        label: "甩 GitHub 800 star",
        desc: "你的开源项目 800 star,在圈内有人转",
        hint: "🎯 拉 title +技术影响力"
      },
      {
        id: "timeline",
        label: "承诺立刻到岗",
        desc: "现司已经办交接,可以一周内入职",
        hint: "⏳ 换签字费"
      },
      {
        id: "silence",
        label: "沉默不开价",
        desc: "\"嗯...我再想想。\"等 HR 主动",
        hint: "🤐 看 HR 反应"
      }
    ],

    // HR 反应规则:对每张牌,在不同轮次给出不同反应
    // delta: { base, signon, equity, hrMood (-2..2) }
    // hrMood 累积到 -2 以下,HR 撤回 offer;累积到 +2 以上,HR 加码
    reactions: {
      // === 大厂(字节)反应 ===
      target_bigtech: {
        current_offer: {
          round1: { base: 1, signon: 0, equity: 0, mood: -1, line: "现司加薪挽留挺正常的。但我们这边不能光看现司,要看你的能力价值。" },
          round2: { base: 2, signon: 0, equity: 0, mood: 0, line: "嗯,这个数字我可以往上跑一档审批,争取下。" },
          round3: { base: 1, signon: 0, equity: 0, mood: 0, line: "你都聊到这步了。我尽量帮你 push,但别抱太高期望。" }
        },
        rival_offer: {
          round1: { base: 0, signon: 0, equity: 0, mood: -2, line: "美团 38k? 嗯......老实说,我们这种排名,你不会真为了那 6k 去美团吧。我先给你这个数,你回去想想。" },
          round2: { base: 4, signon: 3, equity: 0, mood: 1, line: "美团确实给得高。我去申请一下 P6+,base 加到 36,签字 3 万,你看?" },
          round3: { base: 5, signon: 5, equity: 0, mood: 2, line: "OK,你确实有 backup。我直接走最高授权:base 37,签字 5 万。这是我能给的最高了,真的。" }
        },
        github_proof: {
          round1: { base: 1, signon: 0, equity: 0, mood: 1, line: "800 star?哪个项目?......哦这个我听过。技术评级我帮你提一档申请。" },
          round2: { base: 2, signon: 0, equity: 0, mood: 1, line: "OK,我让 TL 重新看下你的技术分,可能可以走 P6+ 通道。" },
          round3: { base: 1, signon: 0, equity: 0, mood: 0, line: "技术 title 这个流程我推一下。最快下周给答复。" }
        },
        timeline: {
          round1: { base: 0, signon: 1, equity: 0, mood: 0, line: "一周到岗?这个我们确实需要。签字费可以加一点。" },
          round2: { base: 0, signon: 3, equity: 0, mood: 1, line: "立刻到岗对我们 Q2 KPI 很关键,签字 3 万没问题。" },
          round3: { base: 0, signon: 2, equity: 0, mood: 0, line: "好的,签字 2 万,这个流程快,本周能锁。" }
        },
        silence: {
          round1: { base: 0, signon: 0, equity: 0, mood: -1, line: "你在想什么?我这边等你回应。" },
          round2: { base: 1, signon: 0, equity: 0, mood: 0, line: "......行吧,我再帮你 push 1k。" },
          round3: { base: 0, signon: 0, equity: 0, mood: -1, line: "你这样我也不好谈。要不你先回去想清楚?" }
        }
      },

      // === 小厂(创业)反应 ===
      target_smallco: {
        current_offer: {
          round1: { base: 1, signon: 0, equity: 0, mood: 0, line: "你现司 32k,我懂。我们创业公司 base 给不到这么高,但期权是真的。" },
          round2: { base: 2, signon: 0, equity: 0, mood: 0, line: "OK 我们 base 提到 28,期权那边咱再谈。" },
          round3: { base: 1, signon: 0, equity: 0, mood: 0, line: "base 真的就到这了,创业公司你懂的。" }
        },
        rival_offer: {
          round1: { base: 0, signon: 0, equity: 0, mood: -2, line: "美团 38k......兄弟,那你去美团啊。我们这种规模,卷 base 卷不过的。说实话,你要是冲着钱来,这不合适。" },
          round2: { base: 1, signon: 0, equity: 5, mood: -1, line: "嗯......期权我可以加 5 万股,base 加 1k。但你要是真比较 base,可能咱不合。" },
          round3: { base: 0, signon: 0, equity: 10, mood: 0, line: "期权再加 10 万股,这是我授权范围最大的。base 真不行。" }
        },
        github_proof: {
          round1: { base: 2, signon: 0, equity: 10, mood: 2, line: "哎那个项目就是你的?我们 infra 团队上周还在讨论!这下 base 给到 28,期权加 10 万股,你来直接是 5 号员工架构师。" },
          round2: { base: 3, signon: 0, equity: 15, mood: 2, line: "卧槽就是你写的!那必须升级,base 29,期权 45 万股,你直接做我们 infra TL。" },
          round3: { base: 2, signon: 0, equity: 10, mood: 1, line: "技术好的人我们一直缺。base 加 2k,期权 +10 万。" }
        },
        timeline: {
          round1: { base: 0, signon: 2, equity: 0, mood: 1, line: "一周到岗?太好了,我们这边正缺人。给你签字费 2 万。" },
          round2: { base: 0, signon: 1, equity: 5, mood: 1, line: "立刻到岗值得加码,期权 +5 万股,签字 1 万。" },
          round3: { base: 0, signon: 1, equity: 0, mood: 0, line: "OK 签字费 1 万,你下周一来。" }
        },
        silence: {
          round1: { base: 2, signon: 0, equity: 10, mood: 1, line: "嗯......让我猜,你是觉得 base 低?我直接给你最高:base 28,期权 40。你别走啊。" },
          round2: { base: 1, signon: 0, equity: 5, mood: 1, line: "兄弟咱有话直说,你想要啥?我加 base 1k 期权 5 万,你给个准信。" },
          round3: { base: 0, signon: 1, equity: 5, mood: 0, line: "你这样我没法谈。再给你点甜头:签字 1 万,期权 +5 万。" }
        }
      }
    },

    // 结算文案与属性映射
    settle: {
      // 根据最终拿到的 base/signon/equity/mood,给出 4 档结局
      // 各家公司有独立判定
      target_bigtech: {
        excellent: {
          condition: (r) => r.base >= 36 && r.mood >= 0,
          line: "你拿到了 base {base}k + 签字 {signon} 万 + 技术 title 提升。HR 在电话里说:'你这谈判真专业,期待合作。'",
          effect: { tech: 3, money: 50, fame: 5, comm: 5, health: -8 },
          nextButton: "入职大厂 →",
          flags: ["joined_bigtech"]
        },
        good: {
          condition: (r) => r.base >= 34,
          line: "Base {base}k 签字 {signon} 万。比你现在涨 20%,稳健。HR 客客气气送你入职。",
          effect: { tech: 3, money: 35, comm: 2, health: -8 },
          nextButton: "入职大厂 →",
          flags: ["joined_bigtech"]
        },
        ok: {
          condition: (r) => r.mood >= -1,
          line: "Base {base}k,你接了。算是上岸,但你后来听说同期进来的有 36k 的,有点闷。",
          effect: { tech: 2, money: 20, fame: -2, health: -10 },
          nextButton: "入职大厂 →",
          flags: ["joined_bigtech"]
        },
        bad: {
          condition: () => true,
          line: "HR 客气地说\"我们再考虑下\",三天后给你发了拒信。可能是你太强硬,可能是 HC 突然没了。\n你只能继续待在现司,但你和领导的关系微妙了 —— 他知道你想走过。",
          effect: { fame: -5, health: -10, comm: -3 },
          nextButton: "回去继续上班 →",
          flags: ["jump_failed"]
        }
      },
      target_smallco: {
        excellent: {
          condition: (r) => r.equity >= 45 && r.mood >= 1,
          line: "你拿到了 base {base}k + 期权 {equity} 万股,直接当 infra TL。CTO 说:'你来了我就安心了。'\n三年后这家公司 D 轮估值翻 10 倍,你的期权值不少钱(纸面)。",
          effect: { tech: 6, money: 15, fame: 10, network: 8, health: -8 },
          nextButton: "入职小厂 →",
          flags: ["joined_smallco"]
        },
        good: {
          condition: (r) => r.equity >= 35,
          line: "Base {base}k + 期权 {equity} 万股。期权能不能兑现要看公司命,但你赌的就是这个。",
          effect: { tech: 4, money: 10, fame: 5, network: 5, health: -10 },
          nextButton: "入职小厂 →",
          flags: ["joined_smallco"]
        },
        ok: {
          condition: (r) => r.mood >= -1,
          line: "Base {base}k + 期权 {equity} 万股。你签了,但 CTO 走的时候眼神有点冷,你不太确定他对你的期待还在不在。",
          effect: { tech: 2, money: 5, network: 2, health: -10 },
          nextButton: "入职小厂 →",
          flags: ["joined_smallco"]
        },
        bad: {
          condition: () => true,
          line: "CTO 说:\"我感觉你心思不在我们这。\" 谈崩了。\n你只能继续待原司,但已经心猿意马,工作没了精神头。",
          effect: { fame: -3, health: -8, comm: -3 },
          nextButton: "回去继续上班 →",
          flags: ["jump_failed"]
        }
      }
    }
  },

  // 玩法 2: 技术选型
  tech_choice: {
    title: "🛠️ 给老王的奶茶店做小程序",
    intro: "朋友老王要做奶茶店小程序,预算 2 万,2 个月。你的技术栈:Java + 一点 React。",
    options: [
      {
        text: "微信原生 + Java 后端(你最熟,但开发慢)",
        score: 2,
        result: "你扎实做完了,但花了 3 个月。老王嫌慢,差点翻脸。但项目能跑,他后来又介绍了两单。",
        effect: { tech: 3, money: 15, health: -8, network: 3 }
      },
      {
        text: "uni-app + Node(快,你不熟 Node)",
        score: 1,
        result: "你边学边做,撑住了 2 个月上线。代码有点屎山,但能跑。老王满意,你也涨了新技能。",
        effect: { tech: 5, money: 12, health: -10, fame: 2 }
      },
      {
        text: "用现成 SaaS 二次定制",
        score: 3,
        result: "聪明。你用现成模板搭起来,3 周交付。老王惊呆了,直接打款。你赚得轻松,他还推荐了 5 个同行。",
        effect: { tech: 1, money: 18, network: 8, fame: 3 }
      },
      {
        text: "推荐给别人做,你当技术顾问抽成",
        score: 2,
        result: "你介绍了个外包团队,自己抽 15%。轻松,但老王后来发现成本被抬高了,关系冷了一点。",
        effect: { money: 8, network: -3, health: 5 }
      }
    ]
  },

  // 玩法 3: 面试反问(角色反转)
  interview_back: {
    title: "💼 候选人反问你 3 个问题",
    intro: "候选人 25 岁,北邮硕士,简历漂亮。他问的每个问题,都暗藏对公司真实情况的探听。",
    questions: [
      {
        q: "团队加班严重吗?",
        options: [
          { text: "还好,偶尔忙的时候会晚一点", honesty: 0, hireChance: 0.7 },
          { text: "实话说项目期会到 11 点,平时 8 点", honesty: 2, hireChance: 0.3 },
          { text: "我们是奋斗者文化", honesty: -1, hireChance: 0.1 },
          { text: "反问他怎么定义严重", honesty: -1, hireChance: 0.4 }
        ]
      },
      {
        q: "团队技术氛围怎么样?",
        options: [
          { text: "我们鼓励技术分享,每月一次", honesty: 0, hireChance: 0.6 },
          { text: "说实话业务压得紧,大家没空搞这些", honesty: 2, hireChance: 0.2 },
          { text: "你来了就知道了", honesty: -1, hireChance: 0.3 },
          { text: "你最近在看什么技术?反向问他", honesty: 1, hireChance: 0.5 }
        ]
      },
      {
        q: "你在这家公司多久了?为什么留下来?",
        options: [
          { text: "5 年了,这里给了我成长", honesty: 0, hireChance: 0.5 },
          { text: "5 年了,主要是房贷和孩子,没怎么挑过", honesty: 3, hireChance: 0.4 },
          { text: "我刚来 1 年,前景看好", honesty: -2, hireChance: 0.6 },
          { text: "你想听真话还是场面话?", honesty: 2, hireChance: 0.3 }
        ]
      }
    ]
  }
};
