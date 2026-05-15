// 结局集合 · 合并主线
// 判定原则:
//   1. 玩家主动选择(flag) 优先于 stats —— 选了什么就给什么结局
//   2. 职业里程碑(过首席/专家) 优先于负面状态(burnout)
//   3. burnout 是"真的什么都没拿到 + 健康崩"才触发
//
// determineEnding(lineId, flags, stats) 由 game.js 调用

const ENDINGS = {

  // ============ 顶尖职业成就 ============
  principal_legend: {
    title: "首席工程师 · 行业内说得上话的人",
    text: "你拿到了首席工程师 title,这是这一行内除了 CTO 之外能拿到的最高 IC 头衔。\n你在 ArchSummit 做过主题演讲,写过两本书,GitHub 8k star。\n你最骄傲的是 —— 有人因为你的开源库找到工作。\n你 58 岁那天最后一次走出 {currentCo} 大门,门口的保安已经换过三任了。"
  },

  vp: {
    title: "技术 VP · 管 300 人",
    text: "你管着 300 人的团队。你已经 8 年没写过代码了,但你会判断什么人能用、什么项目能成。\n年薪 350 万。同事评价你'人挺好的',这是最高赞美也是最深无奈。"
  },

  tech_expert: {
    title: "技术专家 · IC 路打到底",
    text: "你做了一辈子技术专家。没升 VP,也没去创业。\n你的代码至今还在生产里跑,组里小朋友看你 git log 像看博物馆。\n你最骄傲的不是头衔,是 —— 你写的东西真的有人用。"
  },

  // ============ 单一公司打到底 ============
  loyalist: {
    title: "{startCo} 老兵 · 一家干到退休",
    text: "你的工号是 {startCo} 的一段历史。\n你这辈子只在 {startCo} 待过,从工号 4 位数干到 7 位数。\n这一行能这样的人,这一代不到 5%。\n你儿子也学了计算机。你劝他别学,他没听,后来去了鹅厂。"
  },

  // ============ 创业线 ============
  founder_winner: {
    title: "创业赢家 · 公司上市/被收购",
    text: "你跟着老周(或 LZ)出来创业那一年,你不知道结果会怎样。\n5 年后公司被大厂收购,你的股权变现。\n你拿到了打工一辈子拿不到的数字。\n你给老周点了根烟,说'当年要不是你拉我,我现在还在卷晋升'。"
  },

  founder_normal: {
    title: "创业老兵 · 公司活着,你也活着",
    text: "你跟着出来创业的那家公司,没上市,但也没死。\n你做到了某个细分领域的小龙头。\n你不是富翁,但你掌控自己的时间。\n你 58 岁,还在写代码,但每天只写 4 小时。"
  },

  founder_failed: {
    title: "创业失败 · 回到打工",
    text: "你创业那 3 年,烧光了自己的 N+1 和股票。\n公司散了那天,你和老周(或 LZ)在烧烤店没说话,各喝了 5 瓶啤酒。\n后来你回大厂打工,从此再没碰过创业。\n你不后悔,但你也不会再来一次。"
  },

  // ============ 50 岁后的几种归宿 ============
  consultant: {
    title: "技术顾问 · 50 岁的体面下半场",
    text: "你 50 岁退出全职打工,做几家公司的技术顾问。\n半天工作日,3-4 家轮做,加起来比当年 P7 还多。\n你给老周(他还在自己创业)做了 5 年顾问,也给小赵的新公司当过 advisor。\n你最满意的不是钱 —— 是终于可以选择和谁合作。"
  },

  fire: {
    title: "财务自由 · 提前退休",
    text: "你 50 岁这年算了算,被动收入够花到 90 岁。\n你选择了提前退休 —— 这是这一行少数人能选的特权。\n你去云南买了个院子,种菜,带娃,偶尔写写技术博客。\n以前你以为退休是终点,现在你觉得这是真正的人生开始。"
  },

  graduated_minsu: {
    title: "中年毕业 · 开了家民宿",
    text: "42 岁那年你被'优化'。N+3 拿到手,你和家人商量了一晚,决定去大理开民宿。\n第一年亏了 30 万,第二年持平,第三年小赚。\n你现在不算富有,但你 5 年没有失眠了。"
  },

  // ============ 跳槽线 ============
  to_foreign: {
    title: "外企养老 · 38 岁逃离 996",
    text: "你 38 岁那年去了某外企。工资降了 30%,头发回来了一些。\n你现在 58 岁,这是你最后一家公司,你在这干了 20 年。\n讽刺的是 —— 你跳槽生涯里待最久的地方,反而是你最不'拼'的地方。"
  },

  to_overseas: {
    title: "出海定居 · 海外大厂养老",
    text: "你 35 岁那年跳去了海外。\n你的孩子上国际学校,你和过去一刀两断。\n你 58 岁,有房,有狗,过年不回国。\n你偶尔在 LinkedIn 上刷到老同事,他们升 VP 或被毕业,你都觉得离自己很远。"
  },

  nomad_50: {
    title: "职业流浪汉 · 50 岁仍在跳",
    text: "你这辈子换了 N 家公司。LinkedIn 上的人不再问你为什么换得这么频。\n你也不再解释。你存款够花,你身体还行,你和过去一刀两断。"
  },

  indie_winner: {
    title: "意外赢家 · 副业救了你",
    text: "你 44 岁那年靠副业 MRR 破 2 万,辞职做了 indie。\n5 年后产品被收购,你财务自由。\n你这辈子换过几家公司,但真正赚到钱的不是任何一家,是你下班后的那个小工具。"
  },

  // ============ 负面结局 ============
  eliminated: {
    title: "行业淘汰 · 40 岁回老家",
    text: "你 40 岁,没人接你的简历。你回了老家。\n开了家修电脑的小店,后来加做新媒体代运营。\n你 58 岁,过得不算富裕,但你妈终于不再问你'公司是哪家'了。"
  },

  burnout: {
    title: "燃尽 · 中年抑郁",
    text: "你 40 岁前后开始失眠,确诊抑郁。\n你最终辞了职,花了几年才学会不焦虑。\n你不后悔走过这一行 —— 但你回头看,觉得自己付出的代价太大了。"
  },

  data_wipe_marked: {
    title: "事故缠身 · 那次删库案",
    text: "那次删库案是你职业生涯永远擦不掉的污点。\n你 34 岁那年辞退的小吴最终判了 8 年,但你也再没回到管理岗。\n你后来跳了几次槽,每次背调都被问起这件事 —— 行业不大,都知道。\n你 58 岁退休,带过的下属现在分散在各个公司,没人主动联系你。\n你后来想,那一眼回头,你当时就应该看出他要做什么。"
  },

  // ============ 兜底 ============
  ordinary: {
    title: "普通的程序员",
    text: "你没大富大贵,也没掉队。和大多数同行一样,55 岁退休,有一套房,一个孩子,一身腰椎间盘突出。\n你说不上来这一生算不算成功,但你尽力了。"
  }
};

// 结局判定(优先级从高到低)
function determineEnding(lineId, flags, stats) {
  const jobs = State.companyHistory ? State.companyHistory.length : 1;

  // ========== 第 0 优先级:严重事故标签覆盖一切(包括首席) ==========
  // 删库跑路这种"一辈子洗不掉的污点",凌驾于职业成就之上
  if (flags.has("data_wipe_incident")) {
    return "data_wipe_marked";
  }

  // ========== 第 1 优先级:首席评审通过 —— 游戏最高成就 ==========
  if (flags.has("principal_passed") || State.title === "principal") {
    return "principal_legend";
  }

  // ========== 第 2 优先级:50 岁主动选择(玩家最后一章自己选的归宿) ==========
  if (flags.has("consultant_path")) return "consultant";
  if (flags.has("early_retire") && stats.money >= 80) return "fire";
  if (flags.has("to_indie") || flags.has("resigned_quietly")) return "indie_winner";
  if (flags.has("to_minsu") || flags.has("force_retire_buyout")) return "graduated_minsu";

  // ========== 第 3 优先级:创业线 ==========
  const cofounded = flags.has("cofounded") || flags.has("followed_laozhou") || flags.has("cofounded_with_lz");
  if (cofounded) {
    if (stats.money >= 150 && stats.fame >= 60) return "founder_winner";
    if (stats.money >= 50) return "founder_normal";
    return "founder_failed";
  }

  // ========== 第 4 优先级:跳槽极端线 ==========
  if (flags.has("to_foreign")) return "to_foreign";
  if (flags.has("to_overseas")) return "to_overseas";
  if (jobs >= 5 && stats.money >= 40) return "nomad_50";

  // ========== 第 5 优先级:大厂晋升类(过专家评审) ==========
  if (State.title === "expert" || flags.has("expert_passed")) {
    // 走管理岗
    if (flags.has("late_manager") || flags.has("track_manager")) {
      if (stats.comm >= 60) return "vp";
    }
    // 走 IC 路
    return "tech_expert";
  }

  // ========== 第 6 优先级:单公司老兵 ==========
  if (jobs === 1 && (State.title === "senior" || State.title === "senior_plus")
      && stats.tech >= 60) {
    return "loyalist";
  }

  // ========== 第 7 优先级:负面结局(只在没成就时触发) ==========
  // burnout:健康崩 + 没拿到任何里程碑
  if (stats.health < 25 && stats.fame < 40) return "burnout";

  // 行业淘汰:钱少且名气低
  if (stats.money < 20 && stats.fame < 30) return "eliminated";

  // ========== 兜底 ==========
  return "ordinary";
}
