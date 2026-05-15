// 合并主线 · 12 章
// 设计原则:
//   - 不预设"老兵"还是"流浪",玩家选择 + 随机事件共同塑造履历
//   - 公司名用 {currentCo} 占位符,每次换公司由引擎注入
//   - 章末可能触发随机事件池(被动跳槽、业务砍、领导走)
//   - 35 岁那章固定分歧,无论之前怎么选都会面对
//
// 每章固定结构:
//   chapter / ageRange / title / setting / events / summary / nextChapter
//   (新增) randomEventPool: 可选,该章末按概率从这里抽一个事件

const MAIN_LINE = {
  id: "main",
  name: "程序员的一生",
  startChapter: "ch1",
  chapters: {

    // ============ 第 1 章 入行 ============
    ch1: {
      chapter: 1, ageRange: [22, 25],
      title: "「入行」",
      setting: `你 22 岁,工号刚领到。{currentCo}的工牌挂在脖子上。
你被拉进 14 个{im}群,99+ 红点提示你不要点开。
你 TL 叫老周(在{currentCo}大家都按"{call}"称呼)—— 技术派,话不多。`,
      events: [
        {
          id: "ch1_p0",
          age: 23,
          minigame: "bug_hunt",
          intro: "试用期第二个月。凌晨 02:43,{im}弹出 P0 告警。"
        },
        // ★ 试用期转正 HR 1on1
        {
          id: "ch1_probation_oneone",
          age: 23,
          textEvent: {
            title: "试用期转正 · HRBP 张姐第一次找你 1on1",
            text: `P0 排查过去 2 周。HRBP 张姐通过{im}找你:'下午 3 点会议室 4,聊聊。'
你以为是常规转正面谈。
你走进会议室,张姐已经在了,桌上放着一杯茶给你。

她笑了下,开门见山:
'X,这是我们公司的常规转正 1on1。我会问你几个开放问题,放轻松。'

第一个问题就让你愣了 10 秒:
'**你觉得你 TL 老周怎么样?他带你的方式你满意吗?**'

你头皮一紧。这问题怎么答?`,
            choices: [
              {
                text: "实话 —— '老周技术很强,但有时候不太指导,要靠我自己摸'",
                hint: "声誉 -3 沟通 +3 健康 -3  · 太诚实",
                effect: { fame: -3, comm: 3, health: -3 },
                flags: ["hr_honest_about_tl"],
                feedback: "张姐笑笑,记了一笔。\n你不知道她记的是什么,但你回工位路上一直在想这件事。\n后来你才知道 —— 试用期 1on1 的反馈,有时候会回流到 TL 那里。"
              },
              {
                text: "标准答案 —— '老周很好,我学到很多。'",
                hint: "沟通 +5 声誉 +3  · 体面派",
                effect: { comm: 5, fame: 3 },
                flags: ["hr_diplomatic"],
                feedback: "张姐点头记下。\n你这一答让她对你印象稳定 —— '懂规矩的新人'。\n这是职场最稀缺的素质,你 23 岁就学会了。"
              },
              {
                text: "夸 —— '老周是我见过最好的技术 leader,毕业能跟着他我很幸运'",
                hint: "沟通 +3 声誉 -5  · 浮夸",
                effect: { comm: 3, fame: -5 },
                flags: ["hr_overpraise"],
                feedback: "张姐眼神变了 0.5 秒。\n她可能心里默默想:'这小子是不是太会说了。'\n职场里,'过分赞美'比'适度抱怨'更可疑。"
              },
              {
                text: "反问 —— '为什么这么问?组里出什么事了吗?'",
                hint: "技术 +3 沟通 -5 健康 -5  · 不上当",
                effect: { tech: 3, comm: -5, health: -5 },
                flags: ["hr_pushed_back"],
                feedback: "张姐愣了下,然后笑:'X 你挺敏锐的。没什么事,就是常规调研。'\n她记的内容你没看到,但你确定她不会忘了你这个反应。\n后来你才知道 —— 这种反问让 HR 觉得你'有戒心',但同时也'懂事'。"
              }
            ]
          }
        },
        // 第二个问题 —— 看玩家上一题的回答风格,引出后续
        {
          id: "ch1_probation_oneone_q2",
          age: 23,
          textEvent: {
            title: "试用期 1on1 · 第二个问题",
            text: `张姐换了个话题:
'你觉得组里哪个同事和你最合不来?'

这问题更要命。说没有 = 装老好人,说有 = 把同事卖了。
你想起组里那个老是抢你需求的小李 —— 你确实和他合不来。`,
            choices: [
              {
                text: "实话 —— '小李有时候和我抢需求,我们沟通成本高'",
                hint: "声誉 -5 沟通 +3  · 老实人,但话会传",
                effect: { fame: -5, comm: 3 },
                flags: ["hr_named_coworker"],
                feedback: "张姐很认真地记了下来。\n2 周后小李对你的态度变了 —— 你不知道是 HR 透露的还是巧合。\n你 23 岁第一次知道:**有些话,HR 不会替你保密**。"
              },
              {
                text: "圆话 —— '都还行,大家都是为了把事做好'",
                hint: "沟通 +5  · 标准答案",
                effect: { comm: 5 },
                feedback: "张姐点头。\n你这答案是教科书级别,虽然假,但**HR 期待你这样答**。\n你 23 岁就摸到了职场的潜规则。"
              },
              {
                text: "技术问题代替 —— '我和谁都能合作,但有时候业务需求不清晰让我难做'",
                hint: "沟通 +3 声誉 +3  · 转向派",
                effect: { comm: 3, fame: 3 },
                feedback: "张姐眼前一亮:'你这个反馈很有价值。'\n你把'人的问题'转成'流程的问题',这是高情商。\n你后来会发现,这是大公司里所有'抱怨'的最佳包装方式。"
              },
              {
                text: "反问 —— '问这个是要做什么调整吗?'",
                hint: "沟通 -3 健康 -3  · 太警觉",
                effect: { comm: -3, health: -3 },
                feedback: "张姐:'没事就是问问。'\n但她可能心里在记:'这小子防备心强。'\n防备心在职场是双刃剑 —— 你不会被骗,但你也不会被'当自己人'。"
              }
            ]
          }
        }
      ],
      summary: {
        text: "这三年,你完成了从'学生'到'打工人'的转变。\n{currentCo}的工牌挂在脖子上,你第一次有了'我有公司'的归属感。\n但你也第一次知道,半夜被电话叫起来排查 P0 是什么感觉。",
        ageAtEnd: 25
      },
      nextChapter: "ch2"
    },

    // ============ 第 2 章 站稳 ============
    ch2: {
      chapter: 2, ageRange: [26, 28],
      title: "「站稳脚跟」",
      setting: `{currentCo} · 你 26 岁,工作进入第 4 年。你还是初级 P5。
初级 = 这家公司里你最初级,组里讨论问题没你的位置,你提的方案 TL 会替你"打磨"再发出去。
你不带任何人,你是被带的那个。`,
      events: [
        {
          id: "ch2_being_reviewed",
          age: 26,
          textEvent: {
            title: "你的代码被资深小张 review 了 30 条",
            text: `小张是你组里的资深 P7,正式的 code review 负责人。
你这周交的一个支付链路改动,他贴了 30 条 review 评论。
其中 8 条是规范、12 条是逻辑、5 条是性能、5 条是"为什么这么写"。

最戳的是第 17 条:'这个写法 2 年前的版本里就有,你没翻过历史代码?'
你确实没翻过。

晚上你坐在工位上,看着这 30 条意见,你脑子里只有一句话:你还是个初级。`,
            choices: [
              {
                text: "全部消化吸收 —— 你想从他身上学",
                hint: "技术 +8 沟通 +3 健康 -5  · 真心学",
                effect: { tech: 8, comm: 3, health: -5 },
                flags: ["learner_humble"],
                feedback: `你周末加了两天班,把 30 条一一改完。\n小张看完你的二次提交,只回了一句:'OK。'\n但他下次安排活的时候,把更难的部分给了你。\n这就是初级的转折点 —— 你被'看见'了。`
              },
              {
                text: "改是改了,但你心里不爽 —— 他在挑刺",
                hint: "技术 +3 健康 -3 沟通 -3  · 表面服气",
                effect: { tech: 3, health: -3, comm: -3 },
                feedback: `你硬着头皮改完。\n下次小张 review 你的代码,提了 35 条 —— 比上次多 5 条。\n你不知道这是他真挑还是故意,但你开始**怕** review 这件事。`
              },
              {
                text: "和小张 1on1,把 30 条逐条讨论清楚",
                hint: "技术 +5 沟通 +5 健康 -3  · 较真派",
                effect: { tech: 5, comm: 5, health: -3 },
                feedback: `小张愿意聊。会议室里你们聊了 2 小时,他承认有 3 条其实他自己也吃不准。\n他说:'你这小子,有点意思。'\n从此你们关系不再是单向 review —— 你成了组里少数能和资深认真技术辩论的初级。`
              },
              {
                text: "直接合并 + 跳过他 review,反正你 leader 没意见",
                hint: "技术 -3 声誉 -5 沟通 -5  · 把同事得罪了",
                effect: { tech: -3, fame: -5, comm: -5 },
                feedback: `你的 PR 被强行 merge 后,小张当晚就给 leader 写了邮件。\n第二天 leader 找你聊,说:'技术上你做得不错,但你这做法把整个 review 流程废了。'\n小张从那天起再不主动和你说话。`
              }
            ]
          }
        },
        {
          id: "ch2_mid_review",
          age: 27,
          conditionalMinigame: {
            minigame: "mid_review",
            requires: (state) => state.title === "junior" && state.stats.tech >= 50,
            intro: "Q3 答辩季。{tl} 说要推你做中级。"
          }
        }
      ],
      events_late: [
        // 章末强制事件:28 岁还是初级 → 被"业务调整"裁掉
        // 只对"没机会答辩"的人触发(tech < 50,意味着评审根本没启动)
        // 否则评审刚失败又被裁,一年内两次打击,不真实
        {
          id: "ch2_low_level_purge",
          age: 28,
          conditionalTextEvent: {
            requires: (state) => state.title === "junior" && state.stats.tech < 50,
            title: "TL 找你一对一 · 不太好的消息",
            text: `周三下午,{tl}把你叫去小会议室。
他先聊了 10 分钟今天天气,然后说:

'X,公司新一轮架构调整。我们组要"聚焦核心业务",
你负责的那一块下个季度划归到隔壁组,他们已经有人 own 了。
我和 HR 聊了下,觉得对你来说这是一个'重新选择'的机会。
N+1 协议这周给你,你也可以看看外面。'

你听懂了。这话翻译过来 —— 你 {age} 岁还卡在初级,公司觉得性价比不行。
"业务调整"只是体面的说法。`,
            choices: [
              { text: "拿 N+1,主动找下家", hint: "存款 +30 健康 -8 声誉 -5  · 体面离开", effect: { money: 30, health: -8, fame: -5 }, flags: ["passive_jump", "purged_for_low_level"], doJobChange: "{age} 岁还是初级,被'业务调整'裁,N+1 走人" },
              { text: "找 {tl} 求转岗,降薪也认", hint: "存款 -20 沟通 +3 健康 -10 声誉 -10  · 留下来的代价", effect: { money: -20, comm: 3, health: -10, fame: -10 }, flags: ["demoted_internal", "begged_to_stay"] }
            ]
          }
        }
      ],
      summary: {
        text: `{currentCo}的座位号从 4 排挪到 3 排。
你这两年的主旋律是消化别人的 review,而不是 review 别人。
你也开始明白 —— 真正的"老员工"不一定是技术最好,而是组里见识最多的那个。`,
        ageAtEnd: 28
      },
      randomEventPool: "mid_career",
      nextChapter: "ch3"
    },

    // ============ 第 3 章 主动选择岔路 ============
    ch3: {
      chapter: 3, ageRange: [29, 31],
      title: "「该不该往上走」",
      setting: `{currentCo} · 你 30 岁。
30 岁是个门槛。买房、生娃、走管理还是技术,该决定的事这两年都摆上桌了。
但更现实的是 —— 你的职级决定了你这时有几条路可选。`,
      events: [
        // ★ 秋后算账:ch2 末选了 begged_to_stay/refused_to_leave 的玩家,半年后还是被裁
        {
          id: "ch3_purge_aftermath",
          age: 29,
          conditionalTextEvent: {
            requires: (state) => state.flags.has("begged_to_stay") || state.flags.has("refused_to_leave"),
            title: "半年后 · 你还是没躲过",
            text: `半年前你以为求转岗 / 拒签能保住位置。
半年后的现实是:你被分到的边缘业务也没什么活,组里大家见你都笑笑就过。
HRBP 张姐第二次找你聊,这次没那么客气:
'你看,公司已经给过你一次机会了。这次是 N+1,你这个数已经是最高的了。'
你看着合同,你 29 岁。
你想起去年那次"拒签",觉得自己当时挺天真的。`,
            choices: [
              { text: "签了,这次没得拖", hint: "存款 +40 健康 -8 声誉 -10  · 终于走人", effect: { money: 40, health: -8, fame: -10 }, flags: ["forced_purge_finalized"] }
            ]
          }
        },
        // ★ 紧接着面试找工作
        {
          id: "ch3_interview_after_purge",
          age: 29,
          conditionalMinigame: {
            minigame: "interview_run",
            requires: (state) => state.flags.has("forced_purge_finalized"),
            intro: "N+1 拿到手了。你已经一周没洗头,现在要开始投简历。"
          }
        },
        {
          id: "ch3_senior_plus_review",
          age: 29,
          conditionalMinigame: {
            minigame: "senior_plus_review",
            requires: (state) => state.title === "mid" && state.stats.tech >= 55,
            intro: "29 岁。中级做了 1 年半,你的 TL 推你冲高级 P7。"
          }
        },
        // 高级 P7 才有真正的 TL 选项
        {
          id: "ch3_branch_p7",
          age: 30,
          conditionalTextEvent: {
            requires: (state) => state.title === "senior_plus",
            title: "三条路摆在你面前(P7 才有的选项)",
            text: `下班后{tl}在茶水间堵你:'下面缺个 TL 苗子,我推你 —— 你现在 P7,有资格带人了。'
但你也接到猎头李哥的电话:某独角兽给到 P+1,股票可观。
你昨晚还在写 Rust,你还没玩够代码。`,
            choices: [
              {
                text: "接 TL,走管理路",
                hint: "沟通 +10 存款 +30 技术 -3  · 管理路",
                effect: { comm: 10, money: 30, tech: -3 },
                flags: ["track_manager"],
                feedback: `你 30 岁,正式从 IC 转管理。\n第一次 1on1,5 个下属 4 个比你大。第一次跨部门撕逼,你才知道"沟通"比"代码"难 10 倍。\n你的钱包变厚了,但你的代码量从此每个月归零。\n这扇门关上的那刻,你心里有过一秒钟的犹豫。`
              },
              {
                text: "婉拒 TL,继续做 IC,冲资深",
                hint: "技术 +10 存款 +15 声誉 +5  · 技术路",
                effect: { tech: 10, money: 15, fame: 5 },
                flags: ["track_ic"],
                feedback: `{tl}笑了:'你这小子是真喜欢写代码。'\n他把那个 TL 名额给了别人。\n你接下来 3 年专心做技术,32 岁过了资深答辩 —— 这是 IC 路最干净的那种。\n你从来没后悔过这次选择。`
              },
              {
                text: "跳到独角兽试试",
                hint: "技术 +5 存款 +40 健康 -8 声誉 +5  · 主动跳",
                effect: { tech: 5, money: 40, health: -8, fame: 5 },
                flags: ["jumped_active"],
                doJobChange: "主动跳到独角兽:P+1 + 期权",
                feedback: `辞职那天你给{tl}发了一条微信:'谢谢哥这些年。'\n他回:'外面累就回来,我给你留位置。'\n你知道这是客气,但你也知道他是真心。\n独角兽第一周你被丢进一个 0 人项目,你 30 岁,第一次真正"什么都靠自己"。`
              },
              {
                text: "都不接,稳稳干",
                hint: "技术 +3 健康 +5 存款 +10",
                effect: { tech: 3, health: 5, money: 10 },
                feedback: `你婉拒了 TL,也没看猎头。\n接下来 3 年你就是组里那个"靠谱、不野心"的中坚。\n老板对你印象稳定,但 35 岁那年你才发现 —— 稳定的人,在裁员名单上也排序靠后,但**不在最优先升职的名单上**。`
              }
            ]
          }
        },
        // 中级(没过 P7 评审):没人推你做 TL,你只能选跳槽或继续卷
        {
          id: "ch3_branch_mid",
          age: 30,
          conditionalTextEvent: {
            requires: (state) => state.title === "mid",
            title: "你 30 岁,中级,没人推你做 TL",
            text: `{tl}没找你聊 TL 的事 —— 因为你今年的高级答辩没过,他知道。
猎头李哥还在打,他给你推了几家中厂,P7 title 直接拿。
你看着工位上的咖啡,30 岁,中级 P6,没买房,没结婚的话 30 岁也算晚。`,
            choices: [
              { text: "再战一年高级,你不甘心", hint: "技术 +5 健康 -10  · 死磕", effect: { tech: 5, health: -10 }, flags: ["senior_plus_retry"] },
              { text: "跳到中厂,直接拿 P7", hint: "存款 +30 健康 -5 声誉 +3", effect: { money: 30, health: -5, fame: 3 }, flags: ["passive_jump", "jumped_for_title"], doJobChange: "为了 P7 title,跳中厂" },
              { text: "认了,稳稳干 P6 到退休", hint: "健康 +8 沟通 -3 技术 -3", effect: { health: 8, comm: -3, tech: -3 }, flags: ["accept_p6_stuck"] }
            ]
          }
        },
        // 初级:30 岁还是 P5,这是少数但真实存在
        {
          id: "ch3_branch_junior",
          age: 30,
          conditionalTextEvent: {
            requires: (state) => state.title === "junior",
            title: "你 30 岁,还是 P5",
            text: `你 30 岁,还在 P5 初级。
两次中级答辩都没过。组里 95 后已经 P6 了。
{tl}不再问你"今年要不要冲一冲",他改问"你最近还好吗"。
你妈打电话问你升职没,你说"快了"。`,
            choices: [
              { text: "再咬牙冲一次中级", hint: "技术 +5 健康 -10  · 死磕", effect: { tech: 5, health: -10 }, flags: ["mid_retry_last"] },
              { text: "跳到小厂,从 0 开始", hint: "存款 +10 健康 -3", effect: { money: 10, health: -3 }, flags: ["passive_jump"], doJobChange: "30 岁还是初级,跳小厂从头来" },
              { text: "考虑转行 —— 这一行可能不适合你", hint: "存款 -10 健康 +15 声誉 -5", effect: { money: -10, health: 15, fame: -5 }, flags: ["thinking_leave_industry"] }
            ]
          }
        }
      ],
      events_late: [
        // 章末强制事件:31 岁还卡 mid/junior → 被裁
        // 同样,只对"今年评审都没启动"的人触发,避免和评审失败链节奏冲突
        {
          id: "ch3_stuck_purge",
          age: 31,
          conditionalTextEvent: {
            requires: (state) => {
              const stuckLow = state.title === "junior";
              const stuckMidNoChance = state.title === "mid" && state.stats.tech < 55;
              return stuckLow || stuckMidNoChance;
            },
            title: "HR 张姐 · 团队结构优化",
            text: `张姐通过{im}发来:'有空聊聊?'
你心里咯噔一下,你 5 年前在 {currentCo} 没听过这种叫法,但这两年常听。

她笑得很温柔,先聊了 5 分钟你周末干嘛。然后她推过来一份文件:
'公司这边正在做"团队结构优化",对 30+ 但职级偏低的同学,我们准备了 N+2 协议。
你可以慢慢考虑,但我们希望两周内有答复。'

你 31 岁,P6 中级(或者还是 P5)。
你想起 26 岁那年看着 30+ 还是 P6 的老人,觉得他们"不会被裁"。
你今天就是他们之一。`,
            choices: [
              { text: "拿 N+2 走人 —— 自己再找下家", hint: "存款 +60 健康 -10 声誉 -8  · 体面离开", effect: { money: 60, health: -10, fame: -8 }, flags: ["passive_jump", "purged_for_low_level"], doJobChange: "30 岁还没升高级,N+2 走人" },
              { text: "求转岗到边缘业务,降一档继续", hint: "存款 -30 健康 -15 沟通 +3 声誉 -10", effect: { money: -30, health: -15, comm: 3, fame: -10 }, flags: ["demoted_internal", "begged_to_stay"] },
              { text: "拒签,赌公司不敢真裁你", hint: "健康 -20 声誉 -10  · 高风险博弈", effect: { health: -20, fame: -10 }, flags: ["refused_to_leave"] }
            ]
          }
        }
      ],
      summary: {
        text: "30 岁是个门槛。你做出了一个不能撤回的选择。\n买不买房、走管理还是技术、生不生孩子,这三件事这两年都摆在你面前。",
        ageAtEnd: 31
      },
      randomEventPool: "mid_career",
      nextChapter: "ch4"
    },

    // ============ 第 4 章 夹心层 ============
    ch4: {
      chapter: 4, ageRange: [32, 34],
      title: "「上有领导下有新人」",
      setting: "{currentCo} · 你 32 岁。组里来了 95 后,做事比你快,但你比他懂业务。",
      events: [
        // ★ ch3 末求转岗/赌不敢裁的玩家,这一章逃不掉
        // (用一个不同的 flag 命名空间避免和 ch3 链冲突)
        {
          id: "ch4_purge_aftermath",
          age: 32,
          conditionalTextEvent: {
            requires: (state) => {
              // 玩家是从 ch3 末过来的(在 ch3 后又留了 flag),但 ch3 已经处理过的不再触发
              const hasFlag = state.flags.has("begged_to_stay") || state.flags.has("refused_to_leave");
              const alreadyPurged = state.flags.has("forced_purge_finalized");
              return hasFlag && !alreadyPurged;
            },
            title: "32 岁这年 · 公司还是让你走了",
            text: `去年你求转岗、赌"公司不敢裁",换来了多 12 个月时间。
今年组织调整继续,你这一批"前批没走的老员工"成了重点目标。
HRBP 这次直接说:'N+1.5,你不签就走司法流程。'
你看着合同,32 岁。
你想起 30 岁那年你以为你比他们聪明。你现在只想签字走人。`,
            choices: [
              { text: "签 N+1.5,这次彻底走", hint: "存款 +50 健康 -10 声誉 -8", effect: { money: 50, health: -10, fame: -8 }, flags: ["forced_purge_finalized"] }
            ]
          }
        },
        {
          id: "ch4_interview_after_purge",
          age: 32,
          conditionalMinigame: {
            minigame: "interview_run",
            requires: (state) => state.flags.has("forced_purge_finalized") && !state.companyHistory.some(h => h.reason && h.reason.includes("面试")),
            intro: "32 岁,N+1.5 到账。但你这次找工作比 29 岁那次难多了。"
          }
        },
        {
          id: "ch4_senior_review",
          age: 32,
          conditionalMinigame: {
            minigame: "senior_review",
            requires: (state) => state.title === "senior_plus" && state.stats.tech >= 60 && state.stats.fame >= 40,
            intro: "32 岁。高级做了 2 年,今年冲资深(P8 临界)。"
          }
        },
        {
          id: "ch4_pressure",
          age: 33,
          textEvent: {
            title: "双 11 / 618 / 周年庆 · 反正你要值班",
            text: "大促保障期。你已经是骨干,值班室冰箱里有人贴的便利贴写着'加油宝贝'。\n你已经 36 小时没睡。{tl}问你:'你说怎么办?'",
            choices: [
              {
                text: "加机器扛过去,事后复盘",
                hint: "技术 +3 沟通 +5  · 务实派",
                effect: { tech: 3, comm: 5, health: -8 },
                feedback: `大促扛过去了。GMV 创新高,你拿了特别奖。\n但 3 个月后的复盘会上,VP 当众说:'X 哥这次靠堆机器,不是技术能力问题吗?'\n你笑笑没解释 —— 你知道堆机器是当时最优解,但你也知道 KPI 不是这么看的。`
              },
              {
                text: "亲自查 SQL,挑出慢查询优化",
                hint: "技术 +8 健康 -10  · 技术派",
                effect: { tech: 8, health: -10 },
                feedback: `你 36 小时没睡,把 7 条核心慢查询全优化了。P99 从 800ms 降到 120ms。\n复盘会上 VP 让你做技术分享,标题是《大促保障的底线思维》。\n你在台上,腰椎间盘已经开始疼了 —— 这是你 {age} 岁。`
              },
              {
                text: "推 DBA 团队定位,你只协调",
                hint: "沟通 +8 声誉 +3 健康 -3  · 管理派",
                effect: { comm: 8, fame: 3, health: -3 },
                feedback: `DBA 团队的活,DBA 来干。你协调 + 决策。\n大促 GMV 创新高,你和 DBA TL 并列写在嘉奖邮件里。\n你睡了 6 个小时,这是大促保障期最奢侈的事。`
              }
            ]
          }
        }
      ],
      summary: {
        text: "34 岁。你三天没回家。值班室的窗外天亮了三次。\n你回家那天在地铁上睡过站了三回。媳妇问你这值得吗,你没回答。",
        ageAtEnd: 34
      },
      randomEventPool: "mid_career_late",  // 这章末事件更"凶"
      nextChapter: "ch5"
    },

    // ============ 第 5 章 ★ 35 岁强制分歧 ============
    ch5: {
      chapter: 5, ageRange: [35, 37],
      title: "「悬崖边」",
      setting: "你 35 岁。这一年开 Q1 总结会的时候,你发现同期入职的人走了一半。",
      events: [
        {
          id: "ch5_force_branch",
          age: 35,
          forcedBranch: "age35"  // 引擎触发 35 岁强制分歧节点
        }
      ],
      summary: {
        text: "35 岁这年改变了你看待这一行的方式。\n你第一次知道,公司可以让你走,而不需要你做错什么。\n或者反过来:这一行可以让你留下来,但它不一定让你舒服。",
        ageAtEnd: 37
      },
      nextChapter: "ch6"
    },

    // ============ 第 6 章 后浪 ============
    ch6: {
      chapter: 6, ageRange: [38, 40],
      title: "「重新定义自己」",
      setting: "你 38 岁。35 岁那次冲击你扛过来了(或者你正在扛)。同事开始有 00 后了。",
      events: [
        {
          id: "ch6_expert_review",
          age: 38,
          conditionalMinigame: {
            minigame: "expert_review",
            requires: (state) => state.title === "senior" && state.stats.tech >= 70 && state.stats.fame >= 55,
            intro: "38 岁。资深做了 4 年。这是冲专家(P8)最后的体力窗口 —— 再晚就上不去了。"
          }
        },
        // 给低职级玩家(没到 senior)加一段"你这职级冲不了专家"的解释
        {
          id: "ch6_no_expert_chance",
          age: 38,
          conditionalTextEvent: {
            requires: (state) => state.title !== "senior" && state.title !== "expert" && state.title !== "principal",
            title: "你 38 岁,看着公司专家答辩名单",
            text: `公司内部公告:本年度技术专家(P8)答辩名单公示。
你扫了一眼,意料之中 —— 你不在上面。

按公司规则,专家评审要先是资深(P8 临界),再升一档才有资格答辩。
你现在是{title},按这一行的规矩,你这一辈子可能就到这了。

你 38 岁。你 28 岁那年觉得 P8 一定能到,38 岁这天你才知道不一定。`,
            choices: [
              {
                text: "认了 —— 这一行你能到这一层已经不错了",
                hint: "健康 +5 沟通 +3  · 看开",
                effect: { health: 5, comm: 3 },
                flags: ["accepted_career_cap"],
                feedback: "你把那张答辩公告关掉,继续干自己手里的事。\n这种事看开就过去了,看不开就憋出病。"
              },
              {
                text: "心里不甘,但表面上装没事",
                hint: "健康 -8 沟通 +3",
                effect: { health: -8, comm: 3 },
                feedback: "你嘴上说'还好',但晚上喝了一杯,一杯又一杯。\n你心里清楚 —— 这种'不甘'不会消失,只会变成失眠。"
              },
              {
                text: "约老周喝一杯,吐槽吐槽这事",
                hint: "健康 +3 沟通 +5 人脉 +5  · 找老朋友吐槽",
                effect: { health: 3, comm: 5, network: 5 },
                flags: ["vented_to_laozhou"],
                feedback: (flags) => {
                  if (flags && flags.has("followed_laozhou")) {
                    // 玩家跟老周创业了 —— 他还是你 boss,这事变成"找老板吐槽自己晋升"
                    return "你跟老周从 28 岁开始就在一个公司了。\n这次你和他喝酒不是吐槽 —— 是问他'公司什么时候能给我个像样的 title'。\n他端着杯子笑:'X,创业公司没 P 级,等公司大了我给你 CTO 当。'\n你也笑,但你心里清楚 —— 这话他 5 年前就说过。";
                  }
                  // 默认:老周已离开公司,你主动找他吐槽
                  return "你给老周发微信:'哥,周末有空喝一杯吗?'\n他秒回:'有,老地方。'\n烧烤店,他点了 4 瓶啤酒(还是 10 年前那个习惯)。\n你吐槽完,他没说什么大道理,只说:'X,你那时候跟我走我现在能给你 P+1,你自己选的。'\n你笑了下,知道他这句是带刺的关心。\n你想起 10 年前你也是这样陪他喝过 4 瓶啤酒,只是那次是他要走。";
                }
              },
              {
                text: "下决心:就算公司给不了 title,我自己做出影响力",
                hint: "技术 +5 声誉 +8 健康 -5  · 不靠公司",
                effect: { tech: 5, fame: 8, health: -5 },
                flags: ["builds_own_brand"],
                feedback: "你开始写公众号、开源项目、跨公司分享。\n公司给不了的 title,你自己用'行业影响力'换。\n你 40 岁那年,有人在朋友圈说'X 哥是真正的资深'。\nP 级是公司给的,影响力是自己挣的。"
              }
            ]
          }
        },
        {
          id: "ch6_reposition",
          age: 39,
          textEvent: {
            title: "39 岁 · 你给自己定个下半场的方向",
            text: `35 岁那一关是被动应对 —— 你扛过去了。
但 39 岁这年你开始主动想:接下来 20 年,你到底要做什么?

你的优势是行业积累 + 经验深度。
你的劣势是手快没新人快,新技术(大模型那波)你没赶上第一波红利。

这不是危机,是选择。`,
            choices: [
              {
                text: "深挖技术,做架构师 IC 路",
                hint: "技术 +10 声誉 +8  · 技术派",
                effect: { tech: 10, fame: 8, comm: -3 },
                flags: ["late_ic"],
                feedback: `你给自己定位是"技术压舱石"。\n你不再追新业务的曝光度,而是把核心系统做扎实。\n40 岁你被请去做行业大会的"老程序员闭门会"嘉宾 —— 你以前对这种事翻白眼,现在你坐在台上。`
              },
              {
                text: "做技术布道 / 内部讲师",
                hint: "声誉 +12 沟通 +8  · 影响力派",
                effect: { fame: 12, comm: 8, tech: -3 },
                flags: ["evangelist"],
                feedback: `你接下了内部技术分享 + 新人培训。\n你以前不屑做的事,现在做得心安理得 —— 因为你知道你**只能这样**继续往上走。\n你的影响力扩散到了部门外,这是你 35 岁前做不到的。`
              },
              {
                text: "申请转管理岗",
                hint: "沟通 +10 存款 +20  · 管理派",
                effect: { comm: 10, money: 20, tech: -5 },
                flags: ["late_manager"],
                feedback: `你 38 岁从 IC 转管理。这比 30 岁转晚了 8 年,但你这年纪转有个好处 —— 你**真懂业务也真懂技术**,下属糊弄不了你。\n第一年你拿到了 A,但你也开始每周开 30 个会,IDE 你一个月没打开。`
              }
            ]
          }
        }
      ],
      summary: {
        text: "你 40 岁。同事生日,小赵(你 26 岁带过的那个实习生)端着酒杯过来。\n他职级比你高了还是低,这事公司里没人挑明,但你心里有数。\n他叫你一声'老师'。\n你愣了 0.5 秒,笑笑接住。\n'老师'这个词,听起来该不该是表扬,你也分不清。",
        ageAtEnd: 40
      },
      randomEventPool: "post_35",
      nextChapter: "ch7"
    },

    // ============ 第 7 章 看见底牌 / 首席评审(条件触发) ============
    ch7: {
      chapter: 7, ageRange: [41, 43],
      title: "「看见底牌」",
      setting: "你 41 岁。腰椎间盘突出确诊。你已经一年没写过生产代码了 —— 你的工作变成了开会、审批、救火、写 PPT、给老板讲故事。\n你能预测每个新业务的失败方式,但你也无力阻止。",
      events: [
        {
          id: "ch7_principal_review",
          age: 41,
          // 条件触发首席评审:tech>=70 且 fame>=60 且 title=expert
          conditionalMinigame: {
            minigame: "principal_review",
            requires: (state) => state.title === "expert" && state.stats.tech >= 75 && state.stats.fame >= 60,
            intro: "{currentCo} 内部公告:本年度首席工程师评审名单公示。\n你的名字在上面。\n你已经做了 5 年技术专家。再往上,就是这一行能给你的天花板。"
          }
        },
        {
          id: "ch7_ceiling",
          age: 42,
          textEvent: {
            title: "你能爬到的最高位置,已经清晰",
            text: "今年的高级专家答辩 / 总监评审,委员会里有你 5 年前带过的人,他现在是高 P。\n你最近半年都在做架构治理 + 跨团队协调,IDE 一周打开不到 3 次。\n最后一个评委问:'你接下来想做什么?'",
            choices: [
              { text: "诚实回答:稳住团队和身体", hint: "声誉 +3 健康 +5  · 接受现实", effect: { fame: 3, health: 5 } },
              { text: "扯一通愿景,职业话术", hint: "沟通 +5 声誉 -3", effect: { comm: 5, fame: -3 } },
              { text: "反问:你接下来想做什么?", hint: "技术 +3 声誉 +5  · 真诚", effect: { tech: 3, fame: 5 } }
            ]
          }
        }
      ],
      summary: {
        text: "43 岁。无论答辩结果如何,你已经能心平气和地看待这件事。\n你也想清楚了 —— 你不再是写代码的人,你是替组里写代码的人挡子弹的人。",
        ageAtEnd: 43
      },
      randomEventPool: "post_35",
      nextChapter: "ch8"
    },

    // ============ 第 8 章 副业意外 ============
    ch8: {
      chapter: 8, ageRange: [44, 46],
      title: "「副业意外救了你」",
      setting: "你 44 岁。你这些年下班后随手做的小工具 / 公众号 / 副业号,开始有稳定收入。",
      events: [
        {
          id: "ch8_sidehustle",
          age: 45,
          textEvent: {
            title: "副业 MRR 破 2 万",
            text: "你那个用业余时间做的 SaaS 工具,这个月 MRR 突破 2 万。\n这不算多,但它是被动收入,在你被裁的那天还在涨。",
            choices: [
              { text: "辞职做全职 indie", hint: "存款 -20 声誉 +8 健康 +10  · 独立开发者", effect: { money: -20, fame: 8, health: 10 }, flags: ["to_indie"], doJobChange: "辞职做独立开发者" },
              { text: "继续打工,副业当后路", hint: "存款 +20 健康 +3", effect: { money: 20, health: 3 } },
              { text: "把副业卖了变现", hint: "存款 +80 声誉 -5  · 收割派", effect: { money: 80, fame: -5 } }
            ]
          }
        }
      ],
      summary: {
        text: "46 岁。你终于发现:真正属于你的东西,是你下班后做的那个小项目。",
        ageAtEnd: 46
      },
      nextChapter: "ch9"
    },

    // ============ 第 9 章 时代 ============
    ch9: {
      chapter: 9, ageRange: [47, 49],
      title: "「你成了别人嘴里的老人」",
      setting: "你 47 岁。已经 5 年没碰过生产代码。\n你的日常是开会、审 PR(只看注释和命名规范)、做架构图(画完没人按你说的做)、跨部门吵架、给老板背锅。\n身边大多数同事是 95 后 / 00 后。",
      events: [
        {
          id: "ch9_label",
          age: 48,
          textEvent: {
            title: "组里 25 岁的资深公开质疑你的方案",
            text: `周会,你讲了一个老业务的重构方案。
组里 25 岁的资深小李举手:'X 哥,这套方案在 2020 年是对的,现在云原生 + AI 编程时代,我们应该换思路。'
他列了 12 条问题。
你听完才发现 —— 你已经 5 年没真正写过代码,你说的"业内最佳实践"是 5 年前的事。
你脸上还在笑,心里在烧。`,
            choices: [
              { text: "公开承认 —— '你说得对,我们按你的来'", hint: "技术 +5 声誉 +5  · 输得起", effect: { tech: 5, fame: 5 } },
              { text: "嘴上承认,心里不爽,会后边缘化他", hint: "健康 -5 沟通 -3 声誉 -3", effect: { health: -5, comm: -3, fame: -3 }, flags: ["sidelined_subordinate"] },
              { text: "回去写邮件主动申请退出核心组", hint: "存款 +10 健康 +10 声誉 -3  · 看开", effect: { money: 10, health: 10, fame: -3 }, flags: ["self_demoted"] },
              { text: "心累了,这周末交辞职信", hint: "存款 +30 健康 +10", effect: { money: 30, health: 10 }, flags: ["resigned_quietly"] }
            ]
          }
        }
      ],
      summary: {
        text: "49 岁。你终于明白了什么叫'被时代抛弃'。\n你看着 25 岁的小李,想起 25 岁的自己,也想起当年那些被你公开质疑过的'老人'。\n这一行从来不是为你这个年龄段设计的。",
        ageAtEnd: 49
      },
      randomEventPool: "old_age",
      nextChapter: "ch10"
    },

    // ============ 第 10 章 最后一份工作 ============
    ch10: {
      chapter: 10, ageRange: [50, 52],
      title: "「最后一份工作」",
      setting: "你 50 岁。\n你想清楚了:全职打工这条路在这个行业的赛道里基本结束了。\n但你这 28 年的积累 —— 行业认识、技术判断、人脉、踩过的坑 —— 还有人愿意为它付钱。",
      events: [
        {
          id: "ch10_lastjob",
          age: 51,
          textEvent: {
            title: "你 50 岁,下一步怎么走?",
            text: `桌上摆着几个机会:
A. 某中厂找你做高级专家,base 不如以前,但接你这个年纪很难得 —— 5 年到退休
B. 几家创业公司想请你做技术顾问,半天工作日,3-4 家轮流,加起来收入比打工高
C. 你自己一直在做的小工具/独立产品,可以转全职
D. 干脆退休,存款够花,身体也该休息了`,
            choices: [
              {
                text: "接中厂的最后一份正经工作,稳到退休",
                hint: "存款 +30 健康 +5  · 体制内收尾",
                effect: { money: 30, health: 5 },
                flags: ["final_settle"],
                feedback: "你 50 岁入职中厂高级专家岗。\n组里小同事叫你'X 叔',这个称呼你以前听了会皱眉,现在听了会笑笑。\n5 年的合同稳稳干到退休。"
              },
              {
                text: "做几家公司的技术顾问 —— 不打卡,按合同结算",
                hint: "存款 +50 健康 +8 人脉 +10 声誉 +5  · 体面的下半场",
                effect: { money: 50, health: 8, network: 10, fame: 5 },
                flags: ["consultant_path"],
                doJobChange: "退出全职打工,做多家公司技术顾问",
                feedback: "你 50 岁这年,日历从此再没有早会。\n你为 3 家公司做顾问,每家半天,加起来比当年 P7 月薪还多。\n你最珍惜的是 —— 你终于可以**选择和谁合作**。"
              },
              {
                text: "全职做独立开发者",
                hint: "存款 -10 健康 +10 技术 +5 声誉 +5", effect: { money: -10, health: 10, tech: 5, fame: 5 }, flags: ["to_indie"], doJobChange: "50 岁转全职 indie",
                feedback: "你辞了职,全职做你那个 SaaS 工具。\n第一年 MRR 涨到 5 万美刀,你和家人在云南找了个院子。\n你写代码的时间比以前任何时候都长 —— 但没人催你了。"
              },
              {
                text: "干脆退休,够花了",
                hint: "健康 +15  · 解脱",
                effect: { health: 15 },
                flags: ["early_retire"],
                feedback: "你算了下,被动收入够花到 90 岁。\n你 50 岁这天,正式退休。\n你开始学木工,种菜,陪孩子。这是你 28 年来第一次,觉得'时间是自己的'。"
              }
            ]
          }
        }
      ],
      summary: {
        text: "52 岁。你和年轻的自己和解了。\n你 22 岁那天想的'我要去最好的公司',原来不是终点。",
        ageAtEnd: 52
      },
      nextChapter: "ch11"
    },

    // ============ 第 11 章 整理 ============
    ch11: {
      chapter: 11, ageRange: [53, 55],
      title: "「整理这辈子待过的所有公司」",
      setting: "你 54 岁。开始整理这些年的工牌、合同、纪念品。",
      events: [
        {
          id: "ch11_review",
          age: 54,
          textEvent: {
            title: "你把所有工牌摆一桌",
            text: "你把这辈子所有公司的工牌摆在桌上拍照。\n每张都代表一段你曾经全力以赴又转身告别的人生。",
            choices: [
              { text: "晒到朋友圈,坦然", hint: "声誉 +5 沟通 +5", effect: { fame: 5, comm: 5 } },
              { text: "默默收起来,只给孩子看", hint: "健康 +3", effect: { health: 3 } },
              { text: "全扔了,你不需要纪念", hint: "健康 +8 声誉 -3", effect: { health: 8, fame: -3 } }
            ]
          }
        }
      ],
      summary: {
        text: "55 岁。你想清楚了:你这辈子选的是'广'还是'深',现在都已经落定。",
        ageAtEnd: 55
      },
      nextChapter: "ch12"
    },

    // ============ 第 12 章 退休 ============
    ch12: {
      chapter: 12, ageRange: [56, 58],
      title: "「退休」",
      setting: "你 58 岁。最后一天上班。",
      events: [
        {
          id: "ch12_final",
          age: 58,
          isEnding: true
        }
      ],
      summary: {
        text: "你在中国互联网干了 36 年。\n",
        ageAtEnd: 58
      },
      nextChapter: null
    }
  }
};
