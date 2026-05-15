// 35 岁强制分歧节点
// 进入第 5 章时,根据玩家属性 + 随机权重,触发 4 种分歧之一
//
// 规则:
//   - PIP/优化(被动失业):tech < 60 或 fame < 40 时高权重
//   - 业务被砍(运气):固定权重,谁都可能遇到
//   - 平稳过 35:fame >= 60 && comm >= 60 才能触发
//   - 主动想跳:money 强 + fame 强时高权重

const AGE35_BRANCHES = {

  // A. 公司主动 PIP(被毕业)
  pip: {
    weight: (stats, flags) => {
      let w = 25;
      if (stats.tech < 60) w += 15;
      if (stats.fame < 40) w += 10;
      if (flags.has("mindset_lieflat")) w += 20;
      return w;
    },
    title: "HRBP 张姐找你聊聊",
    text: `Q1 总结会刚结束,HRBP 张姐通过{im}发来一句:'有空聊聊?'
你心里咯噔一下。
张姐笑得很温柔,泡了茶,先聊家常。然后她说:'你上季度绩效是 {perf_low},组里也有些反馈。'
她推过来一份"{purge_label}"评估材料。
你 35 岁。房贷剩 180 万,孩子上幼儿园,你爸刚做完白内障手术。`,
    choices: [
      {
        text: "签字,接受 PIP,3 个月证明自己",
        hint: "技术 +5 健康 -15 声誉 -5",
        effect: { tech: 5, health: -15, fame: -5 },
        flags: ["pip_accepted"],
        feedback: `3 个月后你拿到了 B+。
HRBP 张姐笑着说:'你看,只要努力还是能过的。'
但你心里清楚 —— 你这季度睡眠平均 5 小时,血压窜到 140,体检报告上多了 3 个"建议复查"。
你过了 PIP,但 PIP 也过了你。从此你的"高潜培养"标签消失。`
      },
      {
        text: "拒签,争 N+1 体面离开",
        hint: "存款 +60 声誉 -3 健康 +5",
        effect: { money: 60, fame: -3, health: 5 },
        flags: ["negotiated_exit", "passive_jump"],
        doJobChange: "PIP 拒签,N+1 离开 {currentCo}",
        feedback: `张姐没再笑。\n她推过来 N+1 协议:'X 哥,你想清楚就好。'\n你签字那一刻,看着自己 12 年的工号变成历史。\n出公司大门时保安没认出你,以为是面试的。\n你比想象中平静 —— 也许这就是答案。`
      },
      {
        text: "求转岗 · 接受降薪 20% + 降一档 P",
        hint: "存款 -25 沟通 +5 技术 -5 声誉 -8 健康 -8  · 体面留下的代价",
        effect: { money: -25, comm: 5, tech: -5, fame: -8, health: -8 },
        flags: ["internal_transfer", "demoted_internal", "swallowed_pride"],
        feedback: `你被分到边缘业务,降一档,降薪 20%。
组里大家见你都笑笑就过,没人主动找你聊事情。
你新 TL 是个 28 岁的年轻人,他不知道该怎么用一个"降级老人"。
你白天上班,晚上把降薪那部分从家庭账户里悄悄抠出来 —— 这事你没和你媳妇说。`
      }
    ]
  },

  // B. 业务线被砍(被裁,不是因为你)
  biz_cut: {
    weight: (stats, flags) => 25,  // 谁都可能遇到
    title: "你的业务线被砍",
    text: "周一早会,VP 宣布业务关停。你做了 4 年的 XX 项目就这样没了。\n部门 80 人,15 个有内部 HC,你不在那 15 人里。\n你这 4 年的代码、技术方案、晋升基础全在这条业务线上。",
    choices: [
      {
        text: "抢其他部门 HC · 降 P+1 档,薪水砍 25%",
        hint: "存款 -30 沟通 +5 声誉 -8 健康 -10  · 抢到了但伤了自尊",
        effect: { money: -30, comm: 5, fame: -8, health: -10 },
        flags: ["internal_demote", "demoted_internal"],
        feedback: `你转到一个老业务,新 TL 比你早入职 3 年,但级别比你低。
你的"前 4 年成就"在这个组不被认可 —— 你要从头证明自己。
你存款被切了一截,房贷压力变大,但至少没失业。
有时候你想 —— 你保住的是位置,还是 face?`
      },
      {
        text: "拿 N+1 走人,主动找下家",
        hint: "存款 +60 健康 -3",
        effect: { money: 60, health: -3 },
        flags: ["passive_jump", "biz_cut_survivor"],
        doJobChange: "业务被砍,N+1 拿到手,从 {currentCo} 离开",
        feedback: `N+1 到账那天是周五。
你给自己买了瓶威士忌,周末在家睡了 36 小时。
周一开始投简历。
你没让任何人知道你被裁了 —— 朋友圈"放假休息"。`
      },
      {
        text: "申请去新业务孵化",
        hint: "技术 +5 健康 -10 声誉 +3",
        effect: { tech: 5, health: -10, fame: 3 },
        flags: ["new_biz_gamble"],
        feedback: `新业务孵化听上去很美,实际上是"3 个月没成果就解散"。
你赌的是 3 个月内做出 MVP。
你 {age} 岁,你媳妇问你这事是不是有点冒险。
你说:'比被动等被裁强。'`
      }
    ]
  },

  // C. 平稳过 35(条件触发,奖励)
  smooth: {
    weight: (stats, flags) => {
      if (stats.fame >= 60 && stats.comm >= 60) return 30;
      return 0;
    },
    title: "你站稳了",
    text: "35 岁这年看起来风平浪静。\n你听说同期入职的 LZ 被 PIP 了,你出去吃饭安慰了他一晚。\n第二天上班,{tl}拍你肩说:'今年你晋升资深问题不大。'\n你长舒一口气。",
    choices: [
      {
        text: "好好准备答辩,稳过",
        hint: "技术 +5 沟通 +5 声誉 +5",
        effect: { tech: 5, comm: 5, fame: 5 },
        flags: ["smooth_past_35"],
        feedback: `Q4 答辩你过了。资深 title 到手。
LZ 给你发红包说恭喜。你没说什么,但你心里清楚 —— 你们这一批,你是少数没被 35 岁打倒的。
你不张扬,但你也开始相信 —— 这一行 35 岁不是死线,只是分水岭。`
      },
      {
        text: "你已经稳了,顺便看看外面机会",
        hint: "存款 +30 声誉 +3",
        effect: { money: 30, fame: 3 },
        feedback: `你拿着内部 offer 去面试别家。
你没真的想跳,只是想知道自己在市场上值多少。
3 家公司的 offer 让你心里踏实 —— 你不是被困在这里。
你回来找老板谈加薪,老板痛快批了 20%。`
      }
    ]
  },

  // D. 主动想跳(有底气时)
  active_jump: {
    weight: (stats, flags) => {
      let w = 15;
      if (stats.money >= 60) w += 10;
      if (stats.fame >= 50) w += 10;
      if (flags.has("track_manager")) w -= 10;
      return Math.max(5, w);
    },
    title: "你接到一个改变命运的电话",
    text: "猎头李哥给你打电话:某独角兽 CTO 直推,P+2,股票按 1500 万估值给。\n但你已经在 {currentCo} 待了快 7 年,这一步迈出去就回不来了。",
    choices: [
      {
        text: "跳了,赌一把",
        hint: "技术 +5 存款 +60 健康 -10",
        effect: { tech: 5, money: 60, health: -10 },
        flags: ["jumped_active", "big_bet"],
        doJobChange: "主动跳到独角兽,赌期权",
        feedback: `你把辞职信交了的那天,{tl}拍你肩:'去吧,该赌就赌。'
独角兽给的不只是钱,是一个"再来一次"的机会。
你新公司第一周,CEO 亲自带你认识团队 —— 你 {age} 岁,第一次有"被重视"的感觉。
但你也清楚,赌注的反面是 —— 如果赌输了,你这一行可能就到此为止。`
      },
      {
        text: "用 offer 找老板谈加薪",
        hint: "存款 +30 沟通 +8",
        effect: { money: 30, comm: 8 },
        feedback: `你拿着独角兽的 offer 给老板看。
老板没说话,第二天找你说:'X,base 加 25%,股票多发一档。'
你点头接受。
你赢得了筹码,也让公司记住了'X 会用 offer 谈判'。这是双刃剑 —— 下次再用,就不一定灵了。`
      },
      {
        text: "婉拒,继续在 {currentCo}",
        hint: "声誉 +5",
        effect: { fame: 5 },
        flags: ["loyal_at_35"],
        feedback: `你婉拒了猎头。
老板没说什么,但他知道这事 —— 你的"忠诚"被记下了。
半年后他主动给你升一档。
但你心里偶尔会想 —— 那 1500 万估值的股票,如果你真去了,会是多少。`
      }
    ]
  }
};

// 从 4 个分支里按权重抽一个
function rollAge35Branch(stats, flags) {
  const entries = Object.entries(AGE35_BRANCHES).map(([id, b]) => ({
    id, branch: b, weight: b.weight(stats, flags)
  })).filter(e => e.weight > 0);

  const total = entries.reduce((s, e) => s + e.weight, 0);
  let r = Math.random() * total;
  for (const e of entries) {
    r -= e.weight;
    if (r <= 0) return e;
  }
  return entries[0];
}
