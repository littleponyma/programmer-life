// 虚构公司宇宙(黑话外号版,规避法律风险)
// flavor 字段说明:
//   im:           内部 IM 名(如 Lark / 钉钉 / 企业微信)
//   call:         同事互相称呼方式(如 同学 / 花名 / 工号 / English name)
//   review_unit:  绩效周期/形式(如 OKR 双月对齐 / PBC 述职 / 半年绩效)
//   perf_low:     最低档绩效的代号(如 3.25 / B- / C / 1 星 / 末位段位)
//   purge_label:  被裁/优化的官话(如 战略聚焦 / 组织优化 / TUP 削减)
//   greeting:     职场打招呼/口头禅
const COMPANIES = {
  juanwang: {
    short: "某卷王厂",
    vibe: "直接 culture,OKR 周会,大小周,Lark 99+ 永不消失。'同学'称呼无 P 级感。绩效档 3.25 = 末位。",
    flavor: {
      im: "Lark 群",
      call: "同学",
      review_unit: "OKR 双月对齐",
      perf_low: "3.25",
      purge_label: "战略聚焦优化",
      greeting: "你们这边晚上几点下班?"
    }
  },
  fubao: {
    short: "某福报厂",
    vibe: "花名文化,996 是修来的福报,HRBP 叫'政委'。'拥抱变化' = 你又要换组了。",
    flavor: {
      im: "钉钉",
      call: "(花名)",
      review_unit: "财年 271 盘点",
      perf_low: "3.25",       // 阿里也用过 3.25/3.5/3.75 这套
      purge_label: "组织优化",
      greeting: "拥抱变化嘛"
    }
  },
  ezh: {
    short: "某鹅厂",
    vibe: "赛马机制,同一件事 3 个组在干。微信群比 IM 重要,股票是大头。",
    flavor: {
      im: "企业微信",
      call: "全名",
      review_unit: "半年绩效",
      perf_low: "2 星",       // 鹅厂 1-5 星制
      purge_label: "组织活水",
      greeting: "南山见"
    }
  },
  lang: {
    short: "某狼厂",
    vibe: "PBC、奋斗者协议、TUP 股票分红。9 点之前下班 = 不奋斗。",
    flavor: {
      im: "WeLink",
      call: "工号 + 全名",
      review_unit: "PBC 述职",
      perf_low: "C-",         // 狼厂 A/B+/B/C/D 这套
      purge_label: "TUP 削减",
      greeting: "把饭吃到嘴里"
    }
  },
  pin: {
    short: "某拼厂",
    vibe: "11 点下班 = 早走。'本分'是终极关键词。段位制鄙视普通 P 级。",
    flavor: {
      im: "Knock",
      call: "工号",
      review_unit: "半年段位审核",
      perf_low: "末位段位",
      purge_label: "本分检讨",
      greeting: "你早走啊?"
    }
  },
  mei: {
    short: "某美厂",
    vibe: "铁军文化,重 KPI 不重 OKR。'多帮助别人,长期有耐心'。",
    flavor: {
      im: "大象",
      call: "X 哥/姐",
      review_unit: "KPI 复盘",
      perf_low: "末位 KPI",
      purge_label: "效率优化",
      greeting: "顺手帮一下"
    }
  },
  cai: {
    short: "某菜厂",
    vibe: "电商体系庞大,技术债重,新人首站常见。jvm 调优能干到退休。",
    flavor: {
      im: "钉钉(老版)",
      call: "(花名)",
      review_unit: "财年盘点",
      perf_low: "3.25",
      purge_label: "组织优化",
      greeting: "你以前在哪个 BU?"
    }
  },
  heiyao: {
    short: "某黑曜 AI",
    vibe: "AI 独角兽,现金多但每 6 个月战略变一次。CTO 是技术派。",
    flavor: {
      im: "Slack",
      call: "全名/英文名",
      review_unit: "OKR 单月对齐",
      perf_low: "不达预期",
      purge_label: "对齐战略调整",
      greeting: "burn rate 还顶得住吗"
    }
  },
  waiqi: {
    short: "某外企",
    vibe: "外企节奏,工资不如国内大厂但 work-life balance 真的存在。",
    flavor: {
      im: "Teams",
      call: "English name",
      review_unit: "Year-end review",
      perf_low: "Need Improvement",
      purge_label: "Restructure",
      greeting: "How was your weekend"
    }
  },
  tengman: {
    short: "某藤蔓科技",
    vibe: "中厂 SaaS,双休,但代码库还在 Java 8 + SVN。8000 行的 Controller 是常态。",
    flavor: {
      im: "钉钉",
      call: "全名",
      review_unit: "年终述职",
      perf_low: "C",
      purge_label: "组织优化",
      greeting: "周末加班吗"
    }
  },
  fangzhou: {
    short: "某方舟",
    vibe: "中厂稳态,996 不强制但有人在加。技术栈中规中矩。",
    flavor: {
      im: "钉钉",
      call: "X 哥/姐",
      review_unit: "季度复盘",
      perf_low: "C",
      purge_label: "结构优化",
      greeting: "你那边业务怎么样"
    }
  },
  lizhi: {
    short: "某荔枝",
    vibe: "中型电商,技术债重,业务方拍脑袋。35 岁的人在这里能找到归属感。",
    flavor: {
      im: "企业微信",
      call: "全名",
      review_unit: "财年盘点",
      perf_low: "C",
      purge_label: "战略调整",
      greeting: "需求又改了?"
    }
  },
  yehuo: {
    short: "某野火 AI",
    vibe: "A 轮 AI 创业,CTO 前大厂高 P。CEO 画饼:'3 年后值 100 亿'。DAU 800 其中 200 是测试账号。",
    flavor: {
      im: "Slack",
      call: "英文名",
      review_unit: "OKR 单月对齐",
      perf_low: "不达预期",
      purge_label: "对齐战略调整",
      greeting: "burn rate 还顶得住吗"
    }
  },
  lan: {
    short: "某蓝厂(外资)",
    vibe: "外资蓝色巨头,流程极度合规。文档比代码多。下班准时是企业 KPI。",
    flavor: {
      im: "Teams",
      call: "English name",
      review_unit: "Mid-year review",
      perf_low: "Below Expectations",
      purge_label: "Workforce optimization",
      greeting: "Cheers!"
    }
  }
};

// 固定 NPC,所有线路通用 —— 制造"老熟人"感
const NPCS = {
  laozhou:  { name: "老周",  role: "你的 TL · 始终是他",  flavor: "技术派,话不多。" },
  zhangjie: { name: "张姐",  role: "HRBP · 每家公司都有一个张姐", flavor: "笑得越温柔,事情越严重。" },
  xiaozhao: { name: "小赵",  role: "你 26 岁带过的实习生 · 比你晚 4 岁的标准成长线", flavor: "南邮硕士,if 嵌套 if 写不利索的那个,但人聪明。" },
  lige:     { name: "李哥",  role: "猎头 · 跳槽线常驻",   flavor: "每次跳槽都是他打的电话。" },
  laochen:  { name: "老陈",  role: "CTO · 创业线 boss",   flavor: "ex 大厂高 P,技术信仰者。" }
};
