// 随机章节事件池
// 每章末按概率从对应池抽一个事件;池里可能有 nothing(留 30% 让人安稳过)
//
// 事件格式同 textEvent;选项的 doJobChange 字段会触发引擎换公司

const RANDOM_EVENT_POOLS = {

  // ============ 28-31 岁的中期事件 ============
  mid_career: [
    {
      id: "biz_cut_early",
      weight: 20,
      title: "你的业务线被砍了",
      text: "周一早会,VP 宣布业务关停。{currentCo}最近在收缩,你做了 2 年的项目就这样没了。\n团队 30 人,15 个有内部 HC,你 15 个老人之一。",
      choices: [
        {
          text: "抢内部 HC · 接受降薪 15% + 干运维老系统",
          hint: "存款 -15 技术 -3 健康 -8 沟通 +3  · 留下来的代价",
          effect: { money: -15, tech: -3, health: -8, comm: 3 },
          flags: ["internal_transfer", "demoted_internal"],
          feedback: "你转到了一个 5 年前的老业务,组里大家友好但保持距离。\n新 TL 没让你做核心 owner —— 你是'业务调整接收的人',大家心里都门清。\n你保住了工资单上的字段,但你的'势能'没了。"
        },
        {
          text: "拿 N+1 走,自己找下家",
          hint: "存款 +30 健康 -3",
          effect: { money: 30, health: -3 },
          flags: ["passive_jump"],
          doJobChange: "业务被砍,拿 N+1 离开 {currentCo}",
          feedback: "N+1 到账。你周末睡了 36 小时。\n下周一你开始投简历,你心里没数 —— 但你 30 岁不到,市场还认你。"
        },
        {
          text: "申请新业务孵化,赌一把",
          hint: "技术 +5 健康 -10 声誉 +3",
          effect: { tech: 5, health: -10, fame: 3 },
          feedback: "新业务孵化是 3 个月生死线。\n你和 5 个人挤一个小会议室,每天熬到 11 点。\n这赌的是公司给你'翻身'的窗口,你押了健康做筹码。"
        }
      ]
    },
    // (老周离职事件移到 mid_career_late 池,作为 ch4 主转折)
    {
      id: "early_shadow",
      weight: 20,
      maxAge: 26,  // 只在 26 岁前触发 —— 你刚转正不久才会被"空降师兄"
      title: "空降一个'师兄' · 你刚有点起色就被罩在阴影下",
      isChain: true,
      chain: [
        // Step 1: 一个老员工被指派来"指导你"
        {
          title: "新加入团队的'师兄' · 老板让他指导你",
          text: `你刚转正 1 年,刚被 TL 表扬过一次,你以为下半年可以接个小项目独立做。
周一例会,TL 宣布:从隔壁组调来一位'同学'(其实是 P+1),叫张师兄,30 岁。
'考虑到 X(你)还在成长期,张师兄会帮带一下,以后 X 的工作向张师兄同步。'

你听懂了。这话翻译过来 —— 你刚刚要冒头的位置,被罩了一层。

会后张师兄约你 1on1。他笑得很温柔:'兄弟,以前的事我都看过周报。\n以后你做的事,先跟我对一遍再发出去,我帮你把质量把好。'
你看着他的眼睛,你脑子里冒出三个字:**虚线了**。`,
          choices: [
            { text: "公开抗议 —— 你要 TL 给个明确说法", hint: "声誉 +3 沟通 -8 健康 -5", effect: { fame: 3, comm: -8, health: -5 }, flags: ["early_protest"] },
            { text: "答应,但只把流程做完不付出额外", hint: "技术 +3 健康 -5 沟通 -3  · 阳奉阴违", effect: { tech: 3, health: -5, comm: -3 }, flags: ["early_minimal"] },
            { text: "主动学,把张师兄当真师傅", hint: "技术 +8 沟通 +5 健康 -5  · 真服气", effect: { tech: 8, comm: 5, health: -5 }, flags: ["early_apprentice"] },
            { text: "找 TL 私下谈,问你怎么晋升", hint: "沟通 +5 健康 -3", effect: { comm: 5, health: -3 }, flags: ["early_ask_tl"] }
          ]
        },
        // Step 2: 半年后,你成了"汇报给张师兄"的人
        {
          title: "半年后 · 你给张师兄做支持",
          text: `半年过去。你做的事都贴着张师兄的标签往外发。
你写的方案、你做的优化、你修的 bug,在汇报材料里都是"张师兄团队的产出"。
TL 表扬你了一次:'X 这半年配合得好,辛苦了。'
重点是"配合"两个字。

中级评审快到了。你心里清楚 —— 你这半年的产出都被打到张师兄名下,你拿不出能讲的事。
你 {age} 岁。`,
          choices: [
            {
              text: "硬上 —— 把私下做的项目作为答辩材料",
              hint: "技术 +5 声誉 +5 健康 -8 沟通 -3  · 撕破脸",
              effect: { tech: 5, fame: 5, health: -8, comm: -3 },
              flags: ["early_hard_present"]
            },
            {
              text: "主动跳走 —— 这家给不了你舞台",
              hint: "存款 +25 健康 -5 声誉 +3", effect: { money: 25, health: -5, fame: 3 },
              flags: ["passive_jump", "jumped_after_shadow"],
              doJobChange: "26 岁就被空降压住,跳走另起一片"
            },
            {
              text: "认了,跟着张师兄混半年,寻找内部转岗",
              hint: "沟通 +5 技术 +3 健康 -3", effect: { comm: 5, tech: 3, health: -3 },
              flags: ["early_wait_transfer"]
            },
            {
              text: "学着张师兄的方法,反向'摘别人的果子'", hint: "技术 +3 沟通 +5 声誉 -5 健康 -5  · 黑化",
              effect: { tech: 3, comm: 5, fame: -5, health: -5 },
              flags: ["early_corrupted"]
            }
          ]
        },
        // Step 3: 后果分歧
        {
          title: "一年后 · 你的选择给了你什么",
          dynamicText: (flags) => {
            if (flags.has("early_hard_present")) {
              return `中级答辩你把私下做的项目讲了。
评委里有张师兄的老朋友,他问:'这个项目我记得 owner 是张师兄?'
你说:'实际执行是我。'
你过了 —— 但勉强过。张师兄从此再没和你说过话。
你 {age} 岁,中级 title 拿到了,但你学会了一件事 —— 这一行的'公平'要自己抢。`;
            }
            if (flags.has("early_wait_transfer")) {
              return `你忍了一年,等到内部活水机会。
你跳到另一个组,新 TL 不知道张师兄那档事。
你第一次独立做了一个项目,半年后稳过中级。
张师兄那条线在你走后没什么动静,你想想觉得,内部跳确实比跳外面省事。`;
            }
            if (flags.has("early_corrupted")) {
              return `你学张师兄,开始把组里小新人(你下面的实习生)的活包装成自己的。
你 {age} 岁中级稳过。
但你 raise 的小赵后来跟你疏远了 —— 你以为他不知道,其实他知道。
你之后的人生里,会反复想起这件事。`;
            }
            // 兜底:protest 路径
            return `你和 TL 反映了 3 次,他每次都说"在协调"。第 4 次他说:"你太执着这些事了。"
你 {age} 岁,没升中级。
半年后 TL 把你调到一个边缘业务做"独立 owner",听上去像升职,实际上是把你边缘化。
你坐在新工位上,看着窗外,第一次想"是不是该跳了"。`;
          },
          choices: [
            { text: "（继续人生）", hint: "→", effect: {} }
          ]
        }
      ]
    },
    {
      id: "headhunter_call",
      weight: 15,
      title: "猎头李哥来电话了",
      text: "李哥推你去一家大厂,给到 P+1,base 涨 40%。\n你刚 review 完小赵的代码,工位上还摆着今天没喝完的咖啡。",
      choices: [
        {
          text: "面试看看,过了就跳",
          hint: "存款 +50 健康 -8 声誉 +3",
          effect: { money: 50, health: -8, fame: 3 },
          flags: ["jumped_for_money"],
          doJobChange: "主动跳槽:为了 P+1 和 40% 涨幅",
          feedback: "你 4 轮面试过了。\n辞职那天{tl}说:'去吧,P+1 + 40% 这窗口不多见。'\n你心里有一秒钟想说'其实我也舍不得',但你没说出口。"
        },
        {
          text: "婉拒,继续待着",
          hint: "声誉 +2",
          effect: { fame: 2 },
          feedback: "你给李哥发了'最近不考虑'。\n他回:'X 哥稳。'\n你不知道这是真心还是猎头的礼貌话术,但你心里踏实一点。"
        },
        {
          text: "用 offer 找现司谈加薪",
          hint: "存款 +20 沟通 +5  · 谈判派",
          effect: { money: 20, comm: 5 },
          feedback: "你拿着大厂 offer 去和老板谈。\n老板第二天给你加了 15% —— 没给到 40%,但他记住了'X 拿外面 offer 谈过判'。\n这事是双刃剑,后面你再有动作,他会更敏感。"
        }
      ]
    },
    {
      id: "good_year",
      weight: 15,
      title: "这一年比较顺",
      text: "项目按时上线,绩效 A,年终奖按 6 个月发。\n你买了张机票去了趟日本。",
      choices: [
        { text: "享受这一年", hint: "健康 +8 存款 -5", effect: { health: 8, money: -5 } }
      ]
    },
    // ✨ 老周替你背事故 —— 师徒情最暖的时刻
    // 早期(mid_career)才会发生,因为这时候老周还把你当"自己人"
    {
      id: "laozhou_shielded_you",
      weight: 12,
      requireTitleIn: ["junior", "mid"],  // 你还嫩才会被保
      title: "✨ 老周替你背了那次 P0",
      text: `上周三下午,你改了一行配置,把生产环境的优惠券核销逻辑写错了。
半小时内核销失败率涨到 18%,直接进了 VP 张总的告警群。
你脑子一片空白。

老周看了一眼日志,直接在群里打字:
'是我让 X 改的,我没复核,我承担责任。'

你想说什么,他摆手让你先回工位。
那天晚上他在你工位旁边的小会议室和张总聊了 40 分钟。出来的时候他眉头紧着,看见你笑了一下:
'没事,我兜住了。下次改生产前问我。'

你 N 岁,你的 TL 替你背了一次足够你绩效掉 C 的事故。
你心里清楚:这种事一辈子遇不到几次。`,
      choices: [
        { text: "请老周吃饭 —— 你要谢他", hint: "存款 -3 沟通 +8 人脉 +10 健康 +5  · 师徒情", effect: { money: -3, comm: 8, network: 10, health: 5 }, flags: ["owe_laozhou"] },
        { text: "默默写复盘 + 加个 lint 规则,让自己长教训", hint: "技术 +10 健康 -3 声誉 +5  · 用行动还", effect: { tech: 10, health: -3, fame: 5 }, flags: ["owe_laozhou", "learned_lesson"] },
        { text: "嘴上谢一谢就过 —— 你以为这是他的本职", hint: "沟通 -5 人脉 -3 声誉 -3  · 不懂事", effect: { comm: -5, network: -3, fame: -3 } },
        { text: "私下偷偷给老周转了一笔红包", hint: "存款 -8 人脉 +5 沟通 -3 声誉 -3  · 江湖派(他可能不收)", effect: { money: -8, network: 5, comm: -3, fame: -3 } }
      ]
    },
    // 🎯 越级汇报(早期版本):只有 junior/mid 才会犯这种低级错
    // 高级及以上的人懂规矩,不会越级
    {
      id: "skip_level_early",
      weight: 12,
      requireTitleIn: ["junior", "mid"],  // ← 引擎按这个过滤
      title: "越级汇报 · 你绕开 TL 给 VP 提了方案",
      text: `周三公司架构月会,VP 在会上提到"组里推动效率低"。
你举手,讲了一个你私下做了 3 周的优化方案,数据 + demo 都齐。
VP 当场说:'这个有意思,你下来给我发下文档。'

会议室里你 TL 老周脸色没变,但你能感觉到温度变了。
你这个年纪 + 职级,你第一次知道"越级汇报"是什么感觉 —— 爽,但凉。`,
      choices: [
        { text: "事后主动找老周补一份汇报,认错", hint: "沟通 +5 健康 -3 声誉 +3  · 补救派", effect: { comm: 5, health: -3, fame: 3 }, flags: ["skip_level_apologized"] },
        { text: "什么都不解释 —— 你做的是对的", hint: "声誉 +5 沟通 -8 健康 -5  · 不解释派", effect: { fame: 5, comm: -8, health: -5 }, flags: ["skip_level_unapologetic"] },
        { text: "顺势开始和 VP 走得更近", hint: "人脉 +8 声誉 +5 沟通 -5  · 站队 VP", effect: { network: 8, fame: 5, comm: -5 }, flags: ["aligned_with_vp"] }
      ]
    },
    // ✨ 亮面 1:开源项目意外火了
    {
      id: "github_viral",
      weight: 8,
      title: "✨ 你下班做的小工具,GitHub Star 飞了",
      text: `周六早上你打开手机,GitHub 通知 99+。
你那个用周末写的开发者工具 —— 一个解决你自己日常痛点的小脚本 —— 昨晚被某行业大 V 转推了。
24 小时内 Star 从 50 涨到 5300。

issues 里有人问你商务合作,有人邀你做技术分享。
你 {age} 岁,这是你工作以来第一次有"被行业看见"的感觉。

你媳妇/室友/对象问:'是不是要红了?'
你说:'不知道,但感觉挺爽。'`,
      choices: [
        { text: "顺势经营 —— 写公众号、开技术社群", hint: "声誉 +15 人脉 +10 健康 -5  · 影响力派", effect: { fame: 15, network: 10, health: -5 }, flags: ["got_github_star"] },
        { text: "维护好项目就行,不当回事", hint: "技术 +5 声誉 +8 健康 +3  · 低调派", effect: { tech: 5, fame: 8, health: 3 } },
        { text: "趁热接商务合作,赚一波", hint: "存款 +20 声誉 +3 健康 -8  · 变现派", effect: { money: 20, fame: 3, health: -8 } }
      ]
    },
    // ★ 老周离职(迷茫期版) · 26-28 岁 · 两个变体二选一
    // 设计:你刚转正、刚找到工作节奏,你的"师傅"突然走了 —— 这是最真实的"保护伞失去"
    {
      id: "laozhou_leaves",
      weight: 25,
      minAge: 26,
      maxAge: 28,
      exclusiveGroup: "laozhou_exit",
      title: "老周离职 · 你的保护伞没了",
      text: `周三下午,老周拍你工位:'下班一起喝个酒。'
你愣了 0.5 秒就知道事情不对 —— 老周从不主动叫人喝酒。

烧烤店,他点了 4 瓶啤酒,半瓶进肚才说:'我提了。下个月走。'
你问:'去哪?'
他说:'出来做 AI infra,自己当 CTO。给你留了个位置,你想来 5% 股份。'
他又说:'不来也没事,新 TL 是从狼厂挖过来的,叫小林,卷得很。'

你刚转正一年,你还在跟着老周学怎么应付 VP。
你回家路上想了一晚上 —— 这是你这辈子第一次面对"保护伞没了"的感觉。`,
      choices: [
        {
          text: "跟老周走,联创 5% 股份",
          hint: "存款 -20 声誉 +5 技术 +5 健康 -10 人脉 +10  · 跟师傅出来",
          effect: { money: -20, fame: 5, tech: 5, health: -10, network: 10 },
          flags: ["followed_laozhou", "cofounded"],
          doJobChange: "26 岁跟老周联创,5% 股份",
          feedback: "你和老周成了联创。第一周你们 4 个人挤一间办公室,他煮咖啡你写代码。\n你才 27 岁,你存款被切了一截但你心里满 —— 这是你这辈子第一次'和信任的人一起做事'。"
        },
        {
          text: "留下来 · 你想试试看自己能不能扛",
          hint: "技术 +3 健康 -8 沟通 -3  · 走出保护区",
          effect: { tech: 3, health: -8, comm: -3 },
          flags: ["laozhou_gone", "standalone"],
          feedback: "老周走的那天,你站在工位上看着他打包东西。\n他离开后 3 个月你才意识到 —— 以前组里很多'政治'都是他帮你挡掉的。\n你 27 岁,第一次自己处理 VP 的临时需求,第一次自己写晋升文档,第一次真的'孤军作战'。"
        },
        {
          text: "趁机跳别家 · 你才 27 岁,世界还大",
          hint: "存款 +20 健康 -5 声誉 +3  · 自己飞",
          effect: { money: 20, health: -5, fame: 3 },
          flags: ["laozhou_gone", "jumped_own"],
          doJobChange: "老周走后,自己另跳一家",
          feedback: "老周走的消息发布当周,你就开始投简历。\n2 个月后你拿到新 offer,你 27 岁这年第一次独立做了人生选择。\n但你跳到新公司第一周,新 TL 不像老周那样照顾你。你才知道老周以前帮你过滤了多少。"
        },
        {
          text: "陪老周喝完酒 · 试图劝他留下",
          hint: "沟通 +3 健康 -3  · 大概率不成",
          effect: { comm: 3, health: -3 },
          flags: ["laozhou_gone"],
          feedback: "你试图劝他。\n老周喝了 3 瓶啤酒说:'X,这一行我已经看到天花板了。我不出去试一次,我永远不知道我能到哪。'\n你没再说什么,陪他喝完第 4 瓶。\n你 27 岁,第一次知道有些人的离开是劝不住的。"
        }
      ]
    },
    // 变体 B:老周被挖去 AI 独角兽,没带你 —— 迷茫期版
    {
      id: "laozhou_poached",
      weight: 20,
      minAge: 26,
      maxAge: 28,
      exclusiveGroup: "laozhou_exit",
      title: "老周走了 · 他没拉你",
      text: `周一晨会,老周面无表情地宣布:'我月底走,新机会。'
散会后部门群炸了。
你私下去找他,他在打包东西,看见你笑了一下:
'我去黑曜 AI 当架构师,P8 给我了。'

你心里有句话没问出口:'你带我走吗?'
但你看见他桌上那张 offer letter,上面只有他的名字。

他主动说:'你现在是{title},刚转正,去那边接不住。再过几年你升上来,我再拉你 —— 如果还能联系上的话。'

你 27 岁,第一次知道在职场里"你是谁的人"是不够的 —— 你还得"配得上"。`,
      choices: [
        {
          text: "拼命卷,争取早升一档让老周记得你",
          hint: "技术 +8 健康 -12 声誉 +5  · 死磕等机会",
          effect: { tech: 8, health: -12, fame: 5 },
          flags: ["laozhou_gone", "chasing_laozhou"],
          feedback: "你那年卷得比 22 岁刚毕业时还狠。\n你给老周发过 2 次消息汇报你的项目进展,他回了一个赞。\n你不知道他还记不记得当年说的话,但你只能赌。"
        },
        {
          text: "自己投简历,你不等老周",
          hint: "存款 +25 健康 -5 声誉 +3  · 自己找出路",
          effect: { money: 25, health: -5, fame: 3 },
          flags: ["laozhou_gone", "jumped_own"],
          doJobChange: "老周走了不带你,自己跳",
          feedback: "你自己投了几家公司,2 周内拿到 offer。\n你 27 岁,第一次靠自己的简历找到工作 —— 不是老周内推,不是同学推荐。\n这事让你心里某个地方踏实了 —— 你证明了自己不靠他也能站起来。"
        },
        {
          text: "留下来,看新 TL 小林怎么样",
          hint: "技术 +3 健康 -5 沟通 -3  · 走出保护区",
          effect: { tech: 3, health: -5, comm: -3 },
          flags: ["laozhou_gone", "standalone"],
          feedback: "新 TL 小林是 30 岁,比你大几岁。他风格比老周激进 10 倍。\n他给你的活更多、更杂,你最初不适应。\n后来你才发现 —— 老周以前在你和'真实工作量'之间过滤了多少。"
        },
        {
          text: "认了 —— 你不该有那个奢望",
          hint: "健康 +3 沟通 +3 声誉 -3  · 看开",
          effect: { health: 3, comm: 3, fame: -3 },
          flags: ["laozhou_gone", "accepted_no_favor"],
          feedback: "你和老周后来还是朋友,只是没有共同项目了。\n你 27 岁这年学到一件事 —— 在职场里,贵人会指路,但不会带你走。"
        }
      ]
    },
    {
      id: "nothing",
      weight: 30,
      skip: true
    }
  ],

  // ============ 32-34 岁的中后期事件(被动性更强) ============
  // 注:老周离职已移到 mid_career(26-28 岁),给玩家"迷茫期保护伞失去"的体验
  mid_career_late: [
    {
      id: "team_rebuild",
      weight: 15,  // 老周走的权重高了,这个降低
      title: "组织架构调整",
      text: "公司新一轮组织调整,你的二级部门换 VP。\n新 VP 第一周开大会,说要'优化组织结构,聚焦核心',会后大家都在悄悄找 HR。",
      choices: [
        { text: "主动找新 VP 表忠心", hint: "沟通 +5 声誉 -3", effect: { comm: 5, fame: -3 } },
        { text: "低调干活,看风向", hint: "技术 +3", effect: { tech: 3 } },
        { text: "顺势跳槽", hint: "存款 +30 健康 -5", effect: { money: 30, health: -5 }, flags: ["passive_jump"], doJobChange: "组织调整后主动跳走" }
      ]
    },
    {
      id: "pip_warning",
      weight: 20,
      title: "PIP 预警(还不是正式的)",
      text: "TL 找你一对一,说:'最近你绩效有点波动,我帮你压住了,但你下季度要拿 A 才行。'\n你心里很清楚,这是 PIP 前的最后警告。",
      choices: [
        {
          text: "下季度死磕,拿 A",
          hint: "技术 +5 健康 -12",
          effect: { tech: 5, health: -12 },
          feedback: "你那个季度睡眠 5 小时,体重掉了 4 公斤。\n年底绩效公示:你拿了 A。但你也学到了一件事 —— 这种'A'是用什么换的。"
        },
        {
          text: "主动找下家,体面走",
          hint: "存款 +20 健康 -3",
          effect: { money: 20, health: -3 },
          flags: ["passive_jump"],
          doJobChange: "PIP 预警后主动离开",
          feedback: "你没等 PIP 落地,自己投简历。\n2 个月后新 offer 到手,你递辞呈那天 TL 反而松了口气 —— 这件事对他也是 graceful exit。"
        },
        {
          text: "找老 leader 或老朋友内推",
          hint: "人脉 +5 存款 +15",
          effect: { network: 5, money: 15 },
          flags: ["network_save"],
          doJobChange: "靠人脉内推跳槽",
          feedback: "{tl} 拍胸脯帮你介绍,3 天内你就拿到了新公司 offer。\n你这次跳槽几乎没费劲 —— 你才意识到,人脉这种东西平时看不出来,关键时刻是真的救命。"
        }
      ]
    },
    {
      id: "biz_cut_severe",
      weight: 20,
      title: "整条业务线被裁",
      text: "公司战略调整,你所在的整条业务线都被砍掉。\n部门 200 人,只保留 20 个进新业务,其他全部 N+1。\n你不在那 20 人名单里。",
      choices: [
        {
          text: "拿 N+1,自己找下家",
          hint: "存款 +60 健康 -8",
          effect: { money: 60, health: -8 },
          flags: ["passive_jump", "biz_cut_survivor"],
          doJobChange: "业务线被裁,N+1 走人",
          feedback: "200 人散在不同公司,你这一拨'校友群'还热闹了几个月。\nN+1 到账,你给自己放了 2 周假,然后开始重新出发。"
        },
        {
          text: "争取最后 20 个 HC 之一",
          hint: "沟通 +8 健康 -10  · 求生派",
          effect: { comm: 8, health: -10 },
          flags: ["survived_cut"],
          feedback: "你跑到处约人喝咖啡 —— 你以前最讨厌的'职场政治',这次你做得满熟练。\n最后你抢到了一个 HC,降级一档进新业务。\n你保住了位置,但你这 2 周时间里看清了'人情'到底是什么样。"
        }
      ]
    },
    {
      id: "promotion_pass",
      weight: 15,
      title: "你升了一级",
      text: "Q4 答辩,你过了。涨薪 15%,股票多给一档。",
      choices: [
        { text: "庆祝一下", hint: "存款 +25 声誉 +5", effect: { money: 25, fame: 5 } }
      ]
    },
    {
      id: "gen_z_subordinate",
      weight: 20,
      requireTitleIn: ["senior_plus", "senior", "expert"],  // 带得动下属才有这事件
      title: "你的 00 后下属",
      text: `团队来了个 02 年的应届生,叫小吴。
入职第一周,他下班 5:55 就开始收拾东西。你 6:00 让他帮忙看个紧急的线上问题,他说:"哥,我下班了。"
第二个月你给他派任务,他在群里回:"这个不是我职责范围。"
绩效会上他说:"我躺平,B 也行。"
你被气笑了。`,
      choices: [
        {
          text: "尊重他的边界,自己扛",
          hint: "技术 +3 健康 -8 声誉 +3",
          effect: { tech: 3, health: -8, fame: 3 },
          flags: ["respected_genz"],
          feedback: "你接住了他不愿意接的活,自己加班搞完。\n他第二天给你买了杯咖啡,没说话。\n你不知道他是真的感激,还是觉得你这个老板'好欺负'。"
        },
        {
          text: "找他严肃谈话,要求改变",
          hint: "沟通 +3 健康 -5 声誉 -2 · 他可能不爽",
          effect: { comm: 3, health: -5, fame: -2 },
          feedback: "他全程听着,点头,说'好的哥我注意'。\n第二天他还是 5:55 准时收拾东西。\n你意识到 —— 这一代人是真的不吃这套。"
        },
        {
          text: "把他从核心活里踢出去,边缘化",
          hint: "沟通 -3 健康 -3  · 隐性报复",
          effect: { comm: -3, health: -3 },
          flags: ["marginalized_genz"],
          feedback: "他被分去维护一个 5 年前的老系统,基本没活。\n他也没抱怨,反而每天 5:55 走得更准时。\n你做的'边缘化'对他来说像是奖励。"
        },
        {
          text: "辞退他 —— 你不该养着这种人",
          hint: "声誉 +5 健康 -5  · 雷霆手段(有风险)",
          effect: { fame: 5, health: -5 },
          flags: ["fired_genz"],
          specialOutcome: "genz_fire",
          feedback: "你走 HR 流程,N+1 给他。\nHR 张姐让你想清楚:'00 后没有什么是不敢的,你确定?'\n你说:'确定。这种人留着是给团队添堵。'\n小吴办完手续,留下一句话:'好的哥。'\n然后他回工位收东西,看了你一眼。\n那一眼让你回家路上一直在想 —— 但已经晚了。"
        }
      ]
    },
    {
      id: "fruit_picker",
      weight: 25,
      exclusiveGroup: "ch4_drama",  // 与老周离职、实习生陷阱、嫡系空降互斥
      title: "空降一个'平级'同事 · 摘果子事件",
      isChain: true,
      chain: [
        // Step 1: 空降 + 老板支持
        {
          title: "新来的'同级' · 你的 owner 突然多了一个",
          text: `周三早会,TL 公布:从拼厂挖来一位平级同事,叫小卢,34 岁,在拼厂是 P7。
'考虑到 X 哥(就是你)工作太满,小卢加入后,会跟 X 哥一起 own 这条业务线。'

入职第三天,小卢约你一对一,带着小本本。
他说:'X 哥,以前的事你比我熟。先这样分:架构稳定性 + 老服务维护 你扛,我来主推新业务 + 跨部门协作。'
你心里一沉 —— 新业务和跨部门曝光度,才是绩效的关键。

你回 TL:'这分工不太对吧?新业务一直是我在做。'
TL 笑笑:'小卢是新来的,要给他空间。你经验丰富,辛苦先把后院稳住。'
他说完就翻开了下一个议题。`,
          choices: [
            { text: "硬刚 —— 当场跟 TL 说这是摘果子", hint: "声誉 -3 沟通 -5 健康 -5  · TL 不爽", effect: { fame: -3, comm: -5, health: -5 }, flags: ["fight_picker_step1"] },
            { text: "口头答应,私下找 TL 二谈", hint: "沟通 +3 健康 -5", effect: { comm: 3, health: -5 }, flags: ["soft_resist_step1"] },
            { text: "答应分工,但你心里有数,留一手", hint: "技术 +3 沟通 -3", effect: { tech: 3, comm: -3 }, flags: ["malicious_compliance_step1"] },
            { text: "完全配合,等小卢露破绽", hint: "沟通 +3 健康 -8 声誉 -3  · 闷头干", effect: { comm: 3, health: -8, fame: -3 }, flags: ["full_cooperate_step1"] }
          ]
        },
        // Step 2: 慢慢变虚线
        {
          title: "六个月后 · 你的名字从核心邮件里消失了",
          text: `半年过去。你发现几个变化:
- 新业务立项书 owner 写着小卢,你是"协作"
- 周报里你过去做的几个项目,小卢用"我们"开头,讲的是他的视角
- 跨部门评审会越来越多在小卢日历上,你的日历清出来一大块
- 上次 VP 表扬"新业务这边推动得很好",@ 的是小卢

最戳的是 —— 小卢上周在 OKR 评审里讲了一套架构方案,听起来很熟悉。
那是你 8 个月前在你私人 Notion 写过的,而你曾经在小卢入职第一周给他讲过。

下班路上你想了很久,你 {age} 岁。你现在站在岔路口:`,
          choices: [
            {
              text: "对着干 —— 在下次评审会上当面拆穿他的方案是你的",
              hint: "声誉 +5 沟通 -10 健康 -10  · 撕破脸",
              effect: { fame: 5, comm: -10, health: -10 },
              flags: ["fight_picker_step2"]
            },
            {
              text: "想办法把自己摘出去 —— 申请调到别的小组,做你主营业务",
              hint: "沟通 +5 技术 +3 健康 -3  · 自救派",
              effect: { comm: 5, tech: 3, health: -3 },
              flags: ["extract_self_step2"]
            },
            {
              text: "继续打下手 —— 你已经 {age} 岁,经不起折腾",
              hint: "健康 -10 声誉 -10 沟通 +3  · 认栽",
              effect: { health: -10, fame: -10, comm: 3 },
              flags: ["passive_endure_step2"]
            },
            {
              text: "直接找猎头跳走,这家公司不识货",
              hint: "存款 +35 健康 -5 声誉 +3", effect: { money: 35, health: -5, fame: 3 },
              flags: ["passive_jump", "jumped_after_picker"],
              doJobChange: "被摘果子,跳走不玩了"
            }
          ]
        },
        // Step 3: 后果分歧(根据 step2 的 flag 动态选段落)
        {
          title: "一年后 · 你的选择给了你什么",
          dynamicText: (flags) => {
            if (flags.has("fight_picker_step2")) {
              return `评审会撕破脸那天,小卢哭了 —— 哭得很委屈,VP 在场。
你被叫去 HR 谈了一次"管理沟通方式"。
那条业务线后来被砍了,你和小卢双输。但你的标签变成了"难合作"。

Q4 绩效 C。Q3 你拿到了 PIP 邀请。
一年过去了,你回头看,觉得自己当时可能太冲动了。`;
            }
            if (flags.has("extract_self_step2")) {
              return `你申请转到老李那组做技术专家,虽然 P 没动,但你做回了你擅长的事。
小卢继续在那条业务线上摘果子。
半年后业务推不动了,他被发现技术深度不够,自己走了。
你在新组得了 A。一年后老李推你冲专家答辩。

事实证明,聪明的不是赢果子,是不去那个果园。`;
            }
            if (flags.has("passive_endure_step2")) {
              return `你在小卢手下继续打杂。
绩效一路 B-。
小卢一年后跳走,留下一堆烂尾业务给你收拾。
你被叫去给老板汇报,为什么这块没出成绩。
老板看着你:'X 哥,你怎么不早点反映?'
你笑笑,没说话。

那一年你学会了一件事 —— 在职场里,沉默不是策略,沉默是代价。`;
            }
            // ★ 跳槽路径:小卢挂你的背调
            if (flags.has("jumped_after_picker")) {
              return `你跳到新公司,新 TL 友好,base 涨了 30%,业务也对口。
入职 3 周,HR 找你做最后一次背调确认 —— 你的旧 TL 出差,**小卢被列为 reference**。

第二天 HR 找你聊。
她说话很客气:'X 哥,我们 reference call 出了些问题。'
小卢电话里说:'X 是我们组的人,但他 ownership 不够强,我们核心项目都是我推动的。'

你脑袋嗡了一下。你想反驳,但你想起 step1 那天 TL 说的:'小卢是新来的,要给他空间。'
HR 给你两条路:'要么撤回 offer,要么降一档入职,从'高级'变'高级-'。'

你 {age} 岁。你刚交了房子定金。`;
            }
            // 兜底
            return "一年过去了。";
          },
          choices: [
            {
              text: "（继续人生）",
              hint: "→",
              effect: {}
            }
          ],
          // 跳槽路径下额外 choices:让玩家应对背调挂
          conditionalChoicesByFlag: {
            jumped_after_picker: [
              {
                text: "接受降档入职 —— 还是签了",
                hint: "存款 -15 声誉 -8 健康 -10  · 苟着",
                effect: { money: -15, fame: -8, health: -10 },
                flags: ["bg_check_demoted"],
                feedback: "你签了降档协议。\n你 33 岁这年学到了职场最丑陋的一面 —— 你以为离开一个人就摆脱他了,实际上他会用 reference call 继续抓你。\n你新公司第一周,你看着工牌上的'高级-',觉得讽刺。"
              },
              {
                text: "撤回 offer · 你再找一家",
                hint: "存款 -30 健康 -15 声誉 -3  · 失业重来",
                effect: { money: -30, health: -15, fame: -3 },
                flags: ["passive_jump", "bg_check_killed"],
                doJobChange: "被小卢背调挂了,offer 撤回,重新找工作",
                feedback: "你撤回了 offer。\n你 33 岁,刚交房子定金,你账户里钱开始紧。\n你重新投简历,这次你学聪明了 —— 你提前预防'前同事关系不好'的背调问题。\n你 2 个月后才找到下家,base 比小卢挂你的那家低 8%。"
              },
              {
                text: "找律师 · 这是恶意诋毁,要追究",
                hint: "存款 -25 健康 -8 声誉 +5  · 法律手段",
                effect: { money: -25, health: -8, fame: 5 },
                flags: ["filed_complaint"],
                feedback: "你咨询了律师,律师说 reference call 的内容在法律上很难界定恶意诋毁。\n你最终没起诉,但你把这事写成长帖发在脉脉(匿名),3 万阅读。\n小卢被识别出来,他在公司也有了麻烦。\n但你这事过后,自己在行业里也被打上了'敢撕破脸'的标签 —— 是好是坏看人。"
              }
            ]
          }
        }
      ]
    },
    {
      id: "lz_invite",
      weight: 12,
      title: "大学同学 LZ 拉你联创",
      text: `LZ 是你大学室友。他这些年走 IC 路,现在是另一家大厂的 P8 架构师。
凌晨 1 点他给你发微信:'兄弟,我打算出来,做开发者工具。'
'缺一个懂业务的合伙人,8% 股份起步。'
你看了眼时间,知道他是认真的 —— LZ 平时 10 点就睡了。`,
      choices: [
        { text: "跟 LZ 走,联创 8%", hint: "存款 -20 声誉 +8 技术 +5 健康 -10 人脉 +10  · 创业线", effect: { money: -20, fame: 8, tech: 5, health: -10, network: 10 }, flags: ["cofounded_with_lz"], doJobChange: "和大学室友 LZ 一起创业" },
        { text: "婉拒,你已经稳了", hint: "声誉 +3 健康 +5", effect: { fame: 3, health: 5 } },
        { text: "犹豫太久,机会被别人拿了", hint: "健康 -8 声誉 -5", effect: { health: -8, fame: -5 } }
      ]
    },
    // 🎭 背锅事件 · 老周还在版:他护你,问你愿不愿背
    {
      id: "scapegoat",
      weight: 25,
      excludeIfFlag: "laozhou_gone",  // 老周走后改触发"scapegoat_solo"
      title: "P0 事故复盘 · 领导让你背锅",
      text: `周一全员复盘会。上周那次支付链路 P0,故障是隔壁组小李改坏了配置。
但小李是 VP 张总的嫡系。
会前老周私下找你:'X,这事报上去得有个人负责。小李刚来,公司想保他。\n你资历老,大家信你,你担一下,我帮你压住绩效不让 C。'
你心里清楚:这是"背锅"的官话版本。`,
      choices: [
        {
          text: "答应背 —— 老周保你绩效",
          hint: "声誉 -10 沟通 +5 健康 -8 人脉 +5  · 当老好人",
          effect: { fame: -10, comm: 5, health: -8, network: 5 },
          flags: ["scapegoat_took"],
          feedback: `复盘报告上写的是你的名字。
小李的 VP 张总会后专门拍了拍你肩:'X 哥讲究。'
老周确实没让你掉绩效 —— 但你"愿意背锅"这个标签从此跟着你。
半年后又有事故,大家第一反应是"找 X 哥背"。`
        },
        {
          text: "拒绝 —— 责任写清楚,谁错谁担",
          hint: "声誉 +5 沟通 -10 健康 -5  · 撕破脸",
          effect: { fame: 5, comm: -10, health: -5 },
          flags: ["scapegoat_refused"],
          feedback: `复盘会全程僵硬。最后责任写了"配置变更人",小李名字白纸黑字。
你赢得了"原则性强"的口碑,但 VP 张总从那天起开会不太点你。
老周私下叹了口气:'你这一手干净,但 ...'
他没说完后半句。`
        },
        {
          text: "提条件 —— 背锅可以,但绩效给 A + 升级名额",
          hint: "声誉 -3 沟通 +3 健康 -5  · 谈判派",
          effect: { fame: -3, comm: 3, health: -5 },
          flags: ["scapegoat_bargained"],
          feedback: `老周愣了 2 秒,然后笑了:'你这小子学坏了 —— 行,我去申请。'
最后你拿到了 B+ 和"加快培养"标签,但没真升级。
你以为自己赢了一招,你不知道老周在 VP 那里说了什么。`
        },
        {
          text: "答应背,但顺手把证据邮件存了备份",
          hint: "声誉 -5 沟通 +3 健康 -5  · 小心眼派",
          effect: { fame: -5, comm: 3, health: -5 },
          flags: ["scapegoat_with_evidence"],
          feedback: `复盘照旧通过。但你那份证据邮件被你存到了私人 OneDrive。
半年后你确实用上了 —— 张总开始翻你旧账时,你回信里"附上"了那封原始邮件。
张总没再追究,但他也不再用你做核心事。
你保住了自己,代价是失去了上升通道。`
        }
      ]
    },
    // 🎭 背锅事件 · 老周不在版(新 TL 不护你,直接甩锅)
    {
      id: "scapegoat_solo",
      weight: 25,
      requireFlag: "laozhou_gone",  // 必须老周已走才触发(对偶 scapegoat)
      title: "P0 事故复盘 · 没人护你",
      text: `周一全员复盘会。上周那次支付链路 P0,故障是隔壁组小李改坏了配置。
但小李是 VP 张总的嫡系。

新 TL {tl} 会前找你(就是从狼厂挖来的那个 90 后):'X,这事报上去得有个人负责。\n你最近代码量不算多,绩效报告你这块也没数据,你来当一下。我向 VP 说你愿意担责。'
你心里清楚:这是 90 后版的"甩锅" —— 他和你没交情,他不会替你担保任何东西。`,
      choices: [
        {
          text: "答应背 —— 你没选择",
          hint: "声誉 -12 健康 -10  · 没人护你",
          effect: { fame: -12, health: -10 },
          flags: ["scapegoat_solo_took"],
          feedback: `你签了字。{tl}笑笑回去开会。\n半年后绩效公示:你拿了 C。\n你才意识到 —— {tl} 当时说的"我向 VP 说你愿意担责"根本不是承诺,而是流程话术。\n没了以前那个肯护你的 TL,你才知道一个 TL 替你压绩效是多大的人情。`
        },
        {
          text: "拒绝 —— 责任写清楚",
          hint: "声誉 +5 沟通 -10 健康 -8  · 撕破脸",
          effect: { fame: 5, comm: -10, health: -8 },
          flags: ["scapegoat_solo_refused"],
          feedback: `复盘报告上写了"配置变更人:小李"。{tl} 在会上看了你一眼,你看不懂他想说什么。\n半年后你绩效拿了 C,{tl} 私下说:"上次 VP 给小李的事情,我也不好压。"\n你 33 岁,你学到了一件事 —— 在大厂里,没护你的人就是会让你死。`
        },
        {
          text: "上越级反馈 —— 找小李的 VP 把这事说清楚",
          hint: "沟通 -5 声誉 +3 健康 -10  · 越级",
          effect: { comm: -5, fame: 3, health: -10 },
          flags: ["scapegoat_escalated"],
          feedback: `你越级给 VP 张总发了邮件。\n张总转给了你的 {tl},{tl} 找你聊了 1 小时。\n这事最后没人担责,但你和 {tl} 关系彻底破裂。\n3 个月后你被悄悄边缘化。\n你 33 岁第一次理解什么叫"越级反馈是双刃剑"。`
        }
      ]
    },
    // 🏛 办公室政治:两个 VP 抢资源,你被迫站队(老周还在版)
    {
      id: "office_politics",
      weight: 22,
      excludeIfFlag: "laozhou_gone",
      title: "两个 VP 抢资源 · 你被迫站队",
      text: `公司今年战略大调整,基础架构 VP 张总和业务平台 VP 李总要争一个新方向的 ownership。
两人都找过你 —— 张总说"你跟我做技术深度",李总说"你来我这里业务影响力大"。
你的 TL 老周中立,他私下说:'这事你自己拿主意,但选了就别后悔。'
两位 VP 你都得罪不起,你必须有动作。`,
      choices: [
        {
          text: "站张总 —— 技术派,长期看更稳",
          hint: "人脉 +8 沟通 +3 声誉 +3  · 选技术领导",
          effect: { network: 8, comm: 3, fame: 3 },
          flags: ["aligned_zhang"],
          feedback: `你周会上明确支持张总的方案。张总当晚就给你发了个赞。
李总没看你 —— 这就是答案。
半年后张总确实拿下了那个 ownership,你也跟着上了一档。
但你之后接业务侧的合作时,李总的人对你保持距离。`
        },
        {
          text: "站李总 —— 业务派,KPI 实在",
          hint: "人脉 +5 存款 +15 沟通 +3  · 选业务领导",
          effect: { network: 5, money: 15, comm: 3 },
          flags: ["aligned_li"],
          feedback: `你给李总写了 8 页方案,论据全是业务影响力。
他当晚拉你进了核心微信群。
半年后李总抢到了新方向,你拿到一笔特别奖金。
张总没再点过你的方案,你的技术 review 排队等了 2 个月。`
        },
        {
          text: "两边都接触,装中立 —— 等胜负出来再说",
          hint: "沟通 +5 声誉 -5 健康 -5  · 投机派",
          effect: { comm: 5, fame: -5, health: -5 },
          flags: ["politically_neutral"],
          feedback: `你在张总那里说"业务影响很重要",在李总那里说"技术深度是核心"。
3 个月后,两个 VP 在饭局上对照过笔记。
他们没明说,但你的两边好脸开始减少。
你以为自己是聪明人。在职场政治里,你是两边都不要的那种。`
        },
        {
          text: "拒绝站队,公开表态'我只管做事'",
          hint: "声誉 +8 沟通 -5 健康 -3 人脉 -5  · 清流派(危险)",
          effect: { fame: 8, comm: -5, health: -3, network: -5 },
          flags: ["refused_politics"],
          feedback: `你周会上说:'技术上我只看方案合不合理。'
组里有人佩服你的硬,有人觉得你不懂事。
半年后两个 VP 都不再把你列入核心决策圈。
你确实保住了"清白",但你也错过了那个 ownership 落到任何一边都本可以分一杯羹的机会。`
        }
      ]
    },
    // 💞 实习生暧昧/陷阱事件链
    // P7+ 才有可能带异性下属(对应真实带新人门槛)
    {
      id: "intern_trap",
      weight: 22,
      requireTitleIn: ["senior_plus", "senior", "expert"],
      exclusiveGroup: "ch4_drama",
      title: "实习生小雅 · 暧昧的开始",
      isChain: true,
      chain: [
        // Step 1: 暧昧 + 表白
        {
          title: "她突然说她喜欢你",
          text: `你今年带的实习生小雅,25 岁,海归硕士。
入职第二个月开始,她每天早上给你带咖啡。第三个月开始,她在加班群里 @ 你的次数比其他人加起来都多。
今晚她加完班说肚子饿,拉你去吃宵夜。烤串店,啤酒喝到第三瓶,她说:
'X 哥,我能不能不把你当 mentor 看?'
她眼睛亮亮的。你 {age} 岁,你已经很久没遇到这种眼神了。`,
          choices: [
            { text: "答应 —— 你也心动,愿意试试", hint: "健康 +5 沟通 +3  · 走入剧情", effect: { health: 5, comm: 3 }, flags: ["intern_accepted"] },
            { text: "委婉拒绝 —— 你是已婚 / 不合适", hint: "健康 -3 声誉 +3 沟通 +3  · 直接刹车", effect: { health: -3, fame: 3, comm: 3 }, flags: ["intern_rejected_cleanly"] },
            { text: "暧昧但不挑明 —— 你想看看怎么发展", hint: "健康 +3 声誉 -3  · 灰色地带", effect: { health: 3, fame: -3 }, flags: ["intern_ambiguous"] },
            { text: "假装没听懂,转话题谈工作", hint: "沟通 +3 健康 -3  · 装糊涂", effect: { comm: 3, health: -3 }, flags: ["intern_played_dumb"] }
          ]
        },
        // Step 2: 真相
        {
          title: "两个月后 · 你看见了她和另一个男生",
          text: `周末你在商场,看到小雅挽着一个 30 岁左右的男生。
他们看上去很熟,小雅在叫他"老公"。
你冷静地从另一条路绕开,没让他们看见你。

回家路上你打开她的朋友圈三天可见,翻了半天没找到这个男生。
你也开始翻她最近发给你的微信 ——
"X 哥,我转正答辩想申请直接走专家通道,你能帮我说说吗?"
"X 哥,听说核心组缺人,你能推我一下吗?"
"X 哥,我爸做生意需要一个技术顾问,你方便帮我介绍下你认识的吗?"

你 {age} 岁,你笑了一下。这种事你听别人讲过,你以为不会发生在自己身上。`,
          choices: [
            { text: "直接质问她 —— 你要个说法", hint: "声誉 +3 沟通 -10 健康 -10  · 撕破脸", effect: { fame: 3, comm: -10, health: -10 }, flags: ["intern_confronted"] },
            { text: "默默切断所有联系,她转正给 C", hint: "声誉 +5 沟通 -3 健康 -8  · 报复但克制", effect: { fame: 5, comm: -3, health: -8 }, flags: ["intern_cut_off"] },
            { text: "什么都不说,继续公事公办 —— 当没发生", hint: "声誉 -3 健康 -15 沟通 +3  · 闷在心里", effect: { fame: -3, health: -15, comm: 3 }, flags: ["intern_swallowed"] },
            { text: "把这事告诉 HR(给后来人提个醒)", hint: "声誉 +3 沟通 -5 健康 -8 人脉 -5  · 高风险", effect: { fame: 3, comm: -5, health: -8, network: -5 }, flags: ["intern_reported_hr"] }
          ]
        },
        // Step 3: 后果
        {
          title: "半年后 · 这件事留给你的",
          dynamicText: (flags) => {
            if (flags.has("intern_confronted")) {
              return `你和她在会议室里吵了一架,她当晚就辞职。
一周后她在脉脉发了一篇匿名文,标题是"35 岁大厂男 mentor 性骚扰下属"。
内容写得很有"细节",你读完整个人发抖。
你的 HR 找你"了解情况",你拿出了你保留的聊天记录,但部门里大家看你的眼神已经变了。
那一年你才知道,职场里有些"美好"是有标价的。`;
            }
            if (flags.has("intern_cut_off")) {
              return `你给她转正打了 C。她哭着找你"为什么",你说:'你心里清楚。'
她转身就走,3 个月内离职。
后来你听说她去了拼厂,继续她的"高情商职场路线"。
你这事没人知道,你也没和任何人说过。你只是从那以后,对任何"主动靠近你的下属"都不再轻易相信。`;
            }
            if (flags.has("intern_swallowed")) {
              return `你装作什么都没发生。给她正常的转正评价,正常的工作分配。
她半年后转正,跳去了别家。
但你这半年瘦了 8 斤,失眠加重。
你媳妇问你"最近怎么了",你说"工作忙"。
那一年你学会了一件事 —— 这一行最贵的不是钱,是你的判断力。`;
            }
            if (flags.has("intern_reported_hr")) {
              return `你给 HR 张姐说了这事。张姐表面客气,但你能感到她的眼神在重新评估你。
公司没处理小雅 —— 因为你"也参与了暧昧"。
3 个月后 HR 把你调离了带新人的资格。
那一年你做了你认为对的事,但你也付出了代价。`;
            }
            // 兜底:rejected_cleanly / played_dumb 等
            return `小雅后来对你态度变了,从主动变成普通同事。
她也没和你有进一步发生什么。
半年后她跳走了。
你做了一个安全的选择。这一行最难得的也许就是这个 —— 没事发生。`;
          },
          choices: [
            { text: "（继续人生）", hint: "→", effect: {} }
          ]
        }
      ]
    },
    // 💪 帮手下扛 C,赢得嫡系
    // 同样要求带得动下属,P7+ 才有
    // 如果玩家曾被老周护过(owe_laozhou flag),叙事会回响那段记忆
    {
      id: "shield_subordinate",
      weight: 22,
      requireTitleIn: ["senior_plus", "senior", "expert"],
      title: "手下小吴犯了大错 · 你扛还是不扛",
      dynamicText: (flags) => {
        const base = `周四下午,你带的中级小吴改了一个生产数据库的字段,没走 review。
半小时后核心服务挂了 30 分钟,GMV 损失 800 万。
晚上复盘会,VP 张总坐镇,他指着小吴问:"谁的责任?"
小吴脸白了 —— 他刚毕业 2 年,从来没遇到过这种场面。
你是他的 mentor,这事按规矩可以算"管理失职"也可以算"个人操作失误"。
你看见他手在抖。`;
        if (flags.has("owe_laozhou")) {
          return base + `

你脑子里突然闪过一个画面 —— 你刚工作那几年改错配置,老周在群里打字:"是我让 X 改的,我没复核,我承担责任。"
那天他和张总在小会议室聊了 40 分钟。出来的时候他对你说:"没事,我兜住了。"

你今天看着小吴,你已经不是当年那个 X 了。
你知道这一行有些东西不是流程,是这么传下来的。`;
        }
        return base + `\n你看了眼工位上的咖啡。`;
      },
      choices: [
        {
          text: "扛 —— '我作为 mentor 没把好关,锅我担'",
          hint: "声誉 -8 沟通 +5 健康 -10 人脉 +12  · 你赢了嫡系",
          effect: { fame: -8, comm: 5, health: -10, network: 12 },
          flags: ["shielded_subordinate", "has_loyalist", "paid_forward_laozhou"],
          flagLabels: { has_loyalist: "你赢得了一个嫡系" },
          feedback: `VP 张总在会上没说什么,只点头让你回去写复盘。
散会后小吴跟着你出会议室,嘴一直在动但没说出话。
你说:'下次改生产先 cc 我。'
他用力点头。

第二天小吴主动给你买了杯咖啡。
他不会说什么"哥我永远跟你",但你从此知道 —— 你组里有了一个**真正听你话的人**。
你这季度绩效掉到 B-,年终奖少 2 个月。但你赢了一个会一辈子记得你的兄弟。`
        },
        {
          text: "客观陈述 —— '是小吴操作失误,我之前提醒过'",
          hint: "声誉 +3 沟通 -5 健康 +3 人脉 -10  · 你失去了人心",
          effect: { fame: 3, comm: -5, health: 3, network: -10 },
          flags: ["threw_subordinate_under_bus"],
          feedback: `VP 张总点头:'X 你处理得很专业。'
小吴坐在那里盯着桌子。
散会后他没跟你说话,直接回工位。
后来你从别人嘴里听到他和组里抱怨"X 哥让我背了"。
他没再主动找过你。

你这季度绩效拿了 A,但你心里清楚 —— 你下次再需要"有人挡子弹"的时候,组里没人会上。`
        },
        {
          text: "各打 50 板 —— '我和他都有责任'",
          hint: "声誉 -3 沟通 +3 健康 -3",
          effect: { fame: -3, comm: 3, health: -3 },
          feedback: `张总皱了下眉:'各打 50 板是和稀泥。'
最后处理意见还是按你说的写了。小吴拿了 C,你绩效是 B。
小吴觉得你没护他,你觉得你护了他一半。
没人完全满意。`
        },
        {
          text: "甩锅给流程 —— '审批流程有漏洞,不是个人问题'",
          hint: "沟通 +8 声誉 -3 健康 -3  · 高手避雷",
          effect: { comm: 8, fame: -3, health: -3 },
          feedback: `张总笑了:'X 你越来越像 PM 了。'
最后处理意见是"流程优化",没人具体担责。
小吴感激你,但也知道你是在自保。
你这操作大家心里都门清,你的"老油条"标签悄悄贴上了。`
        }
      ]
    },
    // ✨ 亮面 2:你嗅到不对,主动排查防止了大事故
    {
      id: "averted_disaster",
      weight: 8,
      title: "✨ 你提前发现了一个潜在事故",
      text: `周五下午,你随手翻监控,发现一条很小的曲线异常 —— 大盘订单成功率从 99.97% 掉到 99.94%。
组里没人注意,因为还在 SLA 内。
你出于直觉拉了几个同事一起查,3 个小时定位到根因:某个限流规则下周就要打到 99% 失败。
你周末连开两天,推动修复 + 兜底。

下周一全员大会,VP 张总点名:'这周要特别表扬 X 同学,在没有任何告警的情况下主动发现并防止了一次潜在 P0 事故。这才是我们要的人。'
你站在工位旁边,有点不真实。`,
      choices: [
        { text: "顺势写一份复盘 + 推动监控告警优化", hint: "技术 +5 声誉 +10 沟通 +5  · 影响力扩散", effect: { tech: 5, fame: 10, comm: 5 } },
        { text: "低调谢一谢就回工位", hint: "声誉 +8 健康 +3  · 谦虚", effect: { fame: 8, health: 3 } },
        { text: "顺势找 VP 1on1 聊未来", hint: "人脉 +10 声誉 +5 沟通 +3  · 借势上位", effect: { network: 10, fame: 5, comm: 3 }, flags: ["aligned_with_vp"] }
      ]
    },
    {
      id: "nothing",
      weight: 8,  // ↓ 这章戏多,平稳更少
      skip: true
    }
  ],

  // ============ 35 岁后的事件(主要是消化期) ============
  post_35: [
    // ✨ 亮面 3:你带过的实习生回头感谢你
    {
      id: "former_intern_thanks",
      weight: 10,
      exclusiveGroup: "xiaozhao_track",
      excludeIfFlag: "xiaozhao_surpassed",  // 专家失败链已经讲过就不再讲
      title: "✨ 你带过的小赵 · 一封意外的消息",
      text: `周六上午,你收到一条微信:'X 哥,在吗?'
是小赵 —— 你 26 岁那年带过的实习生,现在已经是另一家大厂的高级架构师。
你们五六年没说过话了。

'X 哥,我刚拿到 P8。'
'当年要不是你认真给我 review 代码,我现在就是一个写屎山的中级。'
'真心谢谢你。'
'我们公司现在缺一个技术专家级别的 owner,base 60k,你有没有兴趣?我可以直推。'

你看着这条消息,看了 3 分钟。
你想起 7 年前你 review 他的 30 条 if 嵌套 if,你以为他只是觉得你麻烦。
你这一行最暖的时刻,可能就是这种。`,
      choices: [
        { text: "接受内推,这是命运给你的窗口", hint: "存款 +30 健康 +5 人脉 +10 声誉 +5", effect: { money: 30, health: 5, network: 10, fame: 5 }, flags: ["intern_payback", "passive_jump"], doJobChange: "前实习生小赵内推,跳过去做技术专家" },
        { text: "婉拒,但和他保持联系", hint: "人脉 +12 健康 +8 声誉 +5  · 暖心派", effect: { network: 12, health: 8, fame: 5 } },
        { text: "约他线下见一面 —— 你想看看他现在的样子", hint: "人脉 +8 健康 +5 沟通 +5", effect: { network: 8, health: 5, comm: 5 } }
      ]
    },
    {
      id: "lz_promoted",
      weight: 10,
      title: "同期 LZ 升 P9 了",
      text: `朋友圈刷到 LZ 的动态:他升 P9 了。
配图是公司给的水晶奖杯,文案三个字:'谢谢。'
评论区一片祝贺,你看了一会儿,留了个赞,没说话。

你想起 22 岁那天,你们一起在出租屋啃泡面写代码。
他选了纯 IC,这些年没换过公司。`,
      choices: [
        { text: "真心祝福他", hint: "健康 +3 沟通 +3", effect: { health: 3, comm: 3 } },
        { text: "心里不是滋味,默默关上朋友圈", hint: "健康 -5", effect: { health: -5 } },
        { text: "约他出来聊聊,想取经", hint: "技术 +3 人脉 +5", effect: { tech: 3, network: 5 } }
      ]
    },
    {
      id: "laowang_fired",
      weight: 10,
      minAge: 44,  // 老王 46 岁被裁,玩家比老王早 2 岁内才合理
      title: "老王被裁了",
      text: `老王是你外系大学同学,毕业去了另一家大厂走管理路。
这些年他跳了 4 家公司,每次跳薪资都涨,你以为他过得最好。
今晚他给你打电话:'兄弟,我被裁了。N+1,46 岁。'
'我投了 80 份简历,2 个面试,都是猎头说"年龄超限"。'
'你帮我想想办法。'`,
      choices: [
        {
          text: "帮他内推到你公司",
          hint: "人脉 +5 健康 -3  · 仗义",
          effect: { network: 5, health: -3 },
          feedback: `你把老王简历推给了 HR 张姐。
她笑笑收下:'X 哥,我尽力推。'
2 周后 HR 给你回复:'老王的简历我们这边面试不到下一轮,业务方说"职级倒挂"。'
你给老王发消息:'兄弟,我能做的我都做了。'
他回了一个'好'字。
你 47 岁那年学到一件事 —— 你给老朋友的支持,有时候只能停在"你尽力了"。`
        },
        {
          text: "下班开车去看他 · 喝酒聊聊",
          hint: "沟通 +5 健康 -5 人脉 +8  · 老朋友",
          effect: { comm: 5, health: -5, network: 8 },
          feedback: `你下班开车去老王家。
他穿着拖鞋开门,瘦了不少。
你们喝了 2 瓶啤酒,他讲他这 20 年:5 家公司,3 次跳槽涨薪,2 次组织调整被砍,这次是第 3 次。
他说:'我以前看你那条 IC 路觉得没意思,现在 46 岁回头看,你比我稳。'
你说:'我也觉得你前几次跳槽我羡慕过你。'
你们都没说话,又开了一瓶。
你 47 岁,你这才真懂 —— **同样从 22 岁出发,有人选 IC 有人选管理,20 年后你看着对方都觉得"另一条路更好"**。这一行没有标准答案。`
        },
        {
          text: "礼貌敷衍 —— 你也帮不了",
          hint: "健康 -3 人脉 -3 声誉 -3  · 自保",
          effect: { health: -3, network: -3, fame: -3 },
          feedback: `你给老王回了几句官话,然后挂了电话。
你没主动联系他,他也没再找你。
半年后你听说他回了老家。
你 47 岁那天,关上手机的时候心里有种说不出的感觉 —— 你保护了自己,但你也失去了一个老朋友。`
        }
      ]
    },
    {
      id: "new_boss_age_gap",
      weight: 15,  // 降低权重 —— 给嫡系空降事件让位
      title: "新领导比你年轻 5 岁",
      text: "新 TL 刚入职,比你年轻不少。第一次 1on1,他叫你'X 哥',你 {age} 岁。\n他说话礼貌但保持距离。",
      choices: [
        { text: "把他当年轻人带,聊一聊", hint: "沟通 +5 声誉 -3", effect: { comm: 5, fame: -3 } },
        { text: "保持职业关系,不熟", hint: "沟通 -3 健康 +3", effect: { comm: -3, health: 3 } },
        { text: "开始找下家,你和年轻领导合不来", hint: "存款 +20 健康 -5", effect: { money: 20, health: -5 }, flags: ["passive_jump"], doJobChange: "和年轻领导合不来,跳走" }
      ]
    },
    {
      id: "cronies_chain",
      weight: 30,
      title: "新领导带了他的人来",
      // 这是个链式事件,引擎会按 chain 顺序播放 3 步
      isChain: true,
      chain: [
        // ===== Step 1: 嫡系空降 =====
        {
          title: "新领导带了他的人来",
          text: `你的部门换了 VP,从狼厂挖来的 35 岁少帅,叫张总。
入职第二周,他从狼厂带了 3 个嫡系过来,直接进了你负责的核心组。
其中一个 32 岁的男生 —— 据说在狼厂是 P7+ —— 被任命为'你的同级 owner',分走了你最核心的两条业务线。

张总私下找你:'X 哥,你经验丰富,以后多从战略层面给我建议。\n具体执行,让年轻人多扛一些。'

你听懂了。这话翻译过来就是 —— 你的舞台被切走了。`,
          choices: [
            {
              text: "硬刚 —— 在周会上公开质疑分工",
              hint: "声誉 +3 沟通 -5 健康 -8  · 短期出气,长期被记恨",
              effect: { fame: 3, comm: -5, health: -8 },
              flags: ["confronted_vp"]
            },
            {
              text: "沉默接受 —— 配合工作,等机会",
              hint: "沟通 +3 健康 -5 声誉 -3  · 老实人之路",
              effect: { comm: 3, health: -5, fame: -3 },
              flags: ["silent_accept"]
            },
            {
              text: "主动靠拢嫡系 —— 帮他们快速接手",
              hint: "沟通 +5 声誉 -8 健康 -5  · 服软,但人看不起你",
              effect: { comm: 5, fame: -8, health: -5 },
              flags: ["embraced_cronies"]
            }
          ]
        },
        // ===== Step 2: 主动背 C =====
        {
          title: "Q3 绩效会 · 张总单独找你",
          text: `Q3 绩效公示前一周,张总单独叫你去他办公室。
他泡了茶,聊了 10 分钟家常。然后说:

'X 哥,这季度组里整体打分要拉开档次。年轻人需要 A 来留住信心,
你这边……能不能主动背一个 C?反正你这个层级,C 也不影响什么,
就当帮组里调结构。当然这是我个人请求,你也可以不接。'

你看着他的眼睛,你想起当年你 PIP 别人的时候用过同样的话术。
你知道'当然你也可以不接'后面跟着什么 —— 你不接,他下一步是直接给你 C 然后让 HR 找你。`,
          choices: [
            {
              text: "接 —— '没问题张总,我懂'",
              hint: "声誉 -8 沟通 +3 健康 -10  · 主动背 C",
              effect: { fame: -8, comm: 3, health: -10 },
              flags: ["took_c_voluntarily"]
            },
            {
              text: "拒 —— '我今年事情做得不少,凭什么背 C?'",
              hint: "声誉 -3 健康 -10 沟通 -5  · 被强制背 C",
              effect: { fame: -3, health: -10, comm: -5 },
              flags: ["forced_to_c"]
            },
            {
              text: "讨价 —— '能不能给我个 B-,我接受降薪'",
              hint: "声誉 -5 存款 -15 健康 -8  · 折中,但你已经标记了'可优化'",
              effect: { fame: -5, money: -15, health: -8 },
              flags: ["b_minus_compromise"]
            }
          ]
        },
        // ===== Step 3: HR 来了 =====
        {
          title: "Q4 第一周 · HR 张姐请你去喝茶",
          text: `Q4 第一周,HRBP 张姐通过{im}发来一句:'有空聊聊?'
你心里咯噔一下 —— 你升专家那年也是张姐找你聊的。
这次她笑得依然温柔,泡了茶,先聊了 10 分钟你孩子上几年级。

然后她说:'你今年绩效初评是 {perf_low}。'
推过来一份《绩效改进计划》(PIP)。
'公司觉得你最近状态需要调整,这是一份 3 个月的改进计划。
当然,如果你不想接 PIP,我们也准备了 N+2 的协议。'

她看着你,等你回答。
你想起你刚升中级那个晚上,你在群里发了'谢谢老周'。
你想起你给小赵签转正合同那天。
你想起上个月你主动背的那个 C。

你 {age} 岁。房贷还剩 12 年。儿子明年小升初。`,
          choices: [
            {
              text: "签 PIP,死磕 3 个月证明自己",
              hint: "健康 -20 技术 +3 声誉 -10  · 99% 的人最后还是走",
              effect: { health: -20, tech: 3, fame: -10 },
              flags: ["pip_accepted_late"]
            },
            {
              text: "拒签 PIP,拿 N+2 走人",
              hint: "存款 +80 健康 -5 声誉 -5  · 体面但失业",
              effect: { money: 80, health: -5, fame: -5 },
              flags: ["passive_jump", "n2_exit"],
              doJobChange: "嫡系空降 → 主动背 C → PIP,拿 N+2 走人"
            },
            {
              text: "争取 N+3 + 不签 PIP",
              hint: "存款 +110 沟通 +5 健康 -8  · 谈判派",
              effect: { money: 110, comm: 5, health: -8 },
              flags: ["passive_jump", "n3_negotiated"],
              doJobChange: "拿 N+3 体面离开"
            },
            {
              text: "什么都不签,装病请长假",
              hint: "健康 -25 存款 -20 声誉 -15  · 拖到被强制解除",
              effect: { health: -25, money: -20, fame: -15 },
              flags: ["dragged_out"]
            }
          ]
        }
      ]
    },
    {
      id: "former_subordinate_above",
      weight: 10,
      exclusiveGroup: "xiaozhao_track",
      excludeIfFlag: "xiaozhao_surpassed",
      title: "你的前下属成了你的领导",
      // 根据玩家跳槽情况文案不同:行业小,小赵跨公司也可能成你 TL
      dynamicText: (flags) => {
        // 如果玩家跳过(jobs>1),小赵就是"跳到你现在公司"
        // 如果玩家一直在原公司,小赵就是"跳回来"
        const jumped = flags.has("passive_jump") || flags.has("jumped_active") || flags.has("jumped_own");
        if (jumped) {
          return "你跳了几家公司,新公司新部门的 TL 入职那天,你愣了 0.5 秒 ——\n是小赵。你 26 岁带过的那个实习生。\n他这些年走得比你快,绕了一圈,你们居然又同框了。\n他对你很客气,但你感觉每次开会都不太对劲。\n这一行确实小,小到躲不开。";
        }
        return "你一直在 {currentCo}。前两年走的小赵,今年又被挖回来了。\n但他不再是你下属 —— 公司直接给他 P7+,做你的 TL。\n他对你很客气,但你感觉每次开会都不太对劲。";
      },
      choices: [
        { text: "好好配合", hint: "沟通 +5 健康 -3", effect: { comm: 5, health: -3 } },
        { text: "悄悄换组", hint: "沟通 +3 健康 +3", effect: { comm: 3, health: 3 } },
        { text: "辞职走人", hint: "存款 +25 健康 +5", effect: { money: 25, health: 5 }, flags: ["passive_jump"], doJobChange: "不想给前下属打工,跳槽" }
      ]
    },
    {
      id: "headhunter_silent",
      weight: 15,
      title: "猎头不再打电话了",
      text: "你打开领英,发现上次有人发消息已经是 9 个月前。\n简历评分还是 9.2/10,但没人看了。",
      choices: [
        { text: "硬扛,自己投简历", hint: "声誉 -5 健康 -5", effect: { fame: -5, health: -5 } },
        { text: "认命,继续在当前公司死磕", hint: "技术 +3 沟通 +3", effect: { tech: 3, comm: 3 } },
        { text: "看外企机会(降薪养老)", hint: "存款 -30 健康 +10", effect: { money: -30, health: 10 }, flags: ["to_foreign"], doJobChange: "跳去外企养老,薪水降 30%" }
      ]
    },
    {
      id: "nothing",
      weight: 45,
      skip: true
    }
  ],

  // ============ 老年事件(47+) ============
  old_age: [
    {
      id: "classmate_news_final",
      weight: 15,
      title: "大学同学群 · 最后一条更新",
      text: `大学班级群,平时一年发一次消息。
今天有人发了张照片:LZ 的微信公众号写了篇 6000 字长文,
标题《我 50 岁了,从 P9 退下来》。
他说他主动申请降级,从 P9 到 P7,只为了少开会、多写代码。

老王也在群里说话了:'我在县城开了家奶茶店,我家娃在镇里中学读初中。'
老王上次发消息是 5 年前。`,
      choices: [
        { text: "默默给 LZ 文章点赞,你能理解他", hint: "健康 +5 声誉 +3", effect: { health: 5, fame: 3 } },
        { text: "下班开车去看老王", hint: "健康 +8 人脉 +5 存款 -3", effect: { health: 8, network: 5, money: -3 } },
        { text: "群里没说话,默默退出群", hint: "健康 -5 声誉 -3", effect: { health: -5, fame: -3 } }
      ]
    },
    {
      id: "force_retire_offer",
      weight: 25,
      minAge: 50,  // "50 岁以上买断方案",玩家必须 50+
      title: "公司劝退 · 买断方案",
      text: "HRBP 张姐找你,说公司给 50 岁以上的'特别买断方案':一次性 24 个月薪资。\n她笑得很温柔。\n旁边桌上摆着 N+1 协议作为备选 —— 如果你不签这个,公司也会用别的方式让你走。",
      choices: [
        { text: "签买断,提前退休", hint: "存款 +120 健康 +10  · 拿钱走人", effect: { money: 120, health: 10 }, flags: ["early_retire", "force_retire_buyout"] },
        { text: "改谈技术顾问合同 —— 公司外但还有合作", hint: "存款 +60 健康 +5 声誉 +5 人脉 +8  · 体面收尾", effect: { money: 60, health: 5, fame: 5, network: 8 }, flags: ["consultant_path"], doJobChange: "买断后转技术顾问,保留客户关系" },
        { text: "拒绝,死扛到法定退休", hint: "存款 +30 健康 -10 声誉 -5", effect: { money: 30, health: -10, fame: -5 } }
      ]
    },
    {
      id: "industry_layoff",
      weight: 10,
      minAge: 48,
      title: "行业大裁员",
      text: "今年互联网整体收缩,大厂集体裁老人。你接到 N+1 通知。\n你 50+ 这个年纪,基本没人会接你的简历。",
      choices: [
        { text: "拿钱走人,回老家做小生意", hint: "存款 +50 健康 +12", effect: { money: 50, health: 12 }, flags: ["to_minsu"], doJobChange: "被裁,回老家做点小生意" },
        { text: "改做自由顾问,不上班但接活", hint: "存款 +30 健康 +8 人脉 +5", effect: { money: 30, health: 8, network: 5 }, flags: ["consultant_path"], doJobChange: "被裁后转自由技术顾问" }
      ]
    },
    {
      id: "nothing",
      weight: 60,
      skip: true
    }
  ]
};

// 从池中按权重抽事件 (skip:true 表示无事发生)
// 权重会根据玩家 flag 动态调整:
//   - demoted_internal:被降薪转岗过的人,更容易被再次 PIP/业务砍
//   - mindset_lieflat:躺平的人,更容易被打 D
function rollRandomEvent(poolId, ageGuard) {
  const pool = RANDOM_EVENT_POOLS[poolId];
  if (!pool) return null;
  const flags = State && State.flags ? State.flags : new Set();

  // 计算每个事件的调整权重
  const currentTitle = (State && State.title) || "junior";
  const triggeredGroups = (State && State._triggeredExclusiveGroups) || new Set();
  const weighted = pool.map(e => {
    // requireTitleIn 过滤:不满足职级条件的事件权重直接归 0
    if (Array.isArray(e.requireTitleIn) && !e.requireTitleIn.includes(currentTitle)) {
      return { e, w: 0 };
    }
    // 互斥组过滤:该组已经触发过,本局不再出现
    if (e.exclusiveGroup && triggeredGroups.has(e.exclusiveGroup)) {
      return { e, w: 0 };
    }
    // excludeIfFlag:如果玩家有指定 flag,该事件不触发(避免和已发生剧情重复)
    if (e.excludeIfFlag && flags.has(e.excludeIfFlag)) {
      return { e, w: 0 };
    }
    // 年龄上下限过滤
    const age = (State && State.age) || 0;
    if (typeof e.maxAge === "number" && age > e.maxAge) return { e, w: 0 };
    if (typeof e.minAge === "number" && age < e.minAge) return { e, w: 0 };
    let w = e.weight || 0;

    // 被降过薪的人更容易遇到坏事
    if (flags.has("demoted_internal")) {
      if (e.id === "biz_cut_early" || e.id === "biz_cut_severe" || e.id === "pip_warning"
          || e.id === "team_rebuild" || e.id === "new_boss_age_gap") w += 15;
      if (e.id === "good_year" || e.id === "promotion_pass") w = Math.max(2, w - 10);
      if (e.id === "nothing") w = Math.max(5, w - 10);
    }
    if (flags.has("mindset_lieflat")) {
      if (e.id === "pip_warning" || e.id === "biz_cut_severe") w += 10;
    }

    // 起点公司性格 ——— 不同起点 Offer 影响后续 3-5 年风险分布
    if (flags.has("start_volcano")) {
      // 卷王厂:PIP / 大裁员高发,但奖金升职也勤
      if (e.id === "pip_warning" || e.id === "biz_cut_severe") w += 10;
      if (e.id === "promotion_pass") w += 5;
    }
    if (flags.has("start_blessing")) {
      // 福报厂:业务砍 + 组织重组多,健康负担大
      if (e.id === "biz_cut_early" || e.id === "team_rebuild") w += 8;
    }
    if (flags.has("start_mid")) {
      // 中厂:风平浪静多,但好年也少
      if (e.id === "nothing" || e.id === "good_year") w += 8;
      if (e.id === "promotion_pass") w = Math.max(3, w - 5);
    }
    if (flags.has("start_startup")) {
      // 创业起点:更容易遇到联创邀请、业务大裁
      if (e.id === "laozhou_leaves" || e.id === "lz_invite") w += 12;
      if (e.id === "biz_cut_severe") w += 5;
    }

    return { e, w };
  });

  const total = weighted.reduce((s, x) => s + x.w, 0);
  let r = Math.random() * total;
  for (const x of weighted) {
    r -= x.w;
    if (r <= 0) {
      if (x.e.skip) return null;
      // 记录互斥组,本局之后该组不再触发
      if (x.e.exclusiveGroup) {
        if (!State._triggeredExclusiveGroups) State._triggeredExclusiveGroups = new Set();
        State._triggeredExclusiveGroups.add(x.e.exclusiveGroup);
      }
      return x.e;
    }
  }
  return null;
}
