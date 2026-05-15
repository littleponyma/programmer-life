// 开局 · 两阶段
// 阶段 1: 找工作叙事页(自动,不点选,体现 2026 就业难)
// 阶段 2: 3-4 个 Offer 选择,每个有梗 + 起始属性 + 后续走势

const OPENING = {
  // 阶段 1: 求职煎熬期
  phase1: {
    title: "2026 · 毕业季",
    text: `6 月,你计算机系毕业。

你投了 218 份简历,回复你的 11 家,
愿意面试的 6 家,进入终面的 3 家。

同寝室的小李秋招颗粒无收,昨天朋友圈写:"考研二战去了"。
你妈昨晚视频里第三次问你"找到没",你说"快了"。

你打开邮箱,有 3 封 offer 邮件。
你盯着看了 10 分钟,知道这 3 张纸,会决定你接下来 36 年的人生。`,
    proceedLabel: "看看这 3 个 Offer →"
  },

  // 阶段 2: Offer 选择
  phase2: {
    title: "你手上的 3 个 Offer",
    text: "每一个都不完美。这就是 2026 年。",
    offers: [
      {
        co: "某卷王厂",
        emoji: "🟥",
        label: "某卷王厂 · 26k * 16 薪",
        intro: "搜索/电商大厂,base 业内最高 50%",
        joke: `📜 入职须知里第 7 条:"3.25 制度,年度淘汰末位 10%。"
HR 小姐姐微笑:"咱们这边技术成长非常快哦。"
工位实拍图:工位间距 70cm,每张桌子配按摩椅(没人有时间用)。`,
        effect: { tech: 2, money: 30, health: -15, fame: 3 },
        flags: ["start_volcano"],
        startCoLabel: "某卷王厂"
      },
      {
        co: "某福报厂",
        emoji: "🟧",
        label: "某福报厂 · 22k * 15 薪",
        intro: "B 端电商,大小周",
        joke: `📜 你问加班情况,HR 说:"年轻人嘛,不要太计较这些。"
工位摆设:每张桌子配一台空气净化器(治雾霾,也治焦虑)。
群里的运营每天 8 点发"早安宝子们"。`,
        effect: { tech: 1, money: 20, health: -10, comm: 2 },
        flags: ["start_blessing"],
        startCoLabel: "某福报厂"
      },
      {
        co: "中厂",
        emoji: "🟦",
        label: "某藤蔓科技 · 16k * 13 薪",
        intro: "中厂 SaaS,双休,但...",
        joke: `📜 双休是真的双休,这是它最大优点。
代码库:Java 8,SVN(2023 才刚切到 Git),技术栈 5 年没更新。
你 onboarding 第一天打开 IDE,看见一个 8000 行的 Controller。`,
        effect: { tech: -3, money: 5, health: 5, fame: -2 },
        flags: ["start_mid"],
        startCoLabel: "某藤蔓科技"
      },
      {
        co: "创业公司",
        emoji: "🟩",
        label: "某野火 AI · 18k + 8% 期权(纸面)",
        intro: "A 轮 AI 创业,CTO ex 大厂",
        joke: `📜 CTO 老陈第一次见你就给你画饼:"3 年后这家公司值 100 亿。"
你看了下他们的产品,目前 DAU 800,其中 200 是测试账号。
但 CTO 真的是大牛,你能跟他学到东西。期权么... 看运气。`,
        effect: { tech: 5, money: -3, health: -12, fame: 5, network: 5 },
        flags: ["start_startup"],
        startCoLabel: "某野火 AI"
      }
    ]
  }
};

// 引擎用全局表查找当前 line (合并后只剩一条 main)
const LINES = {
  main: MAIN_LINE
};
