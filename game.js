// 游戏引擎:状态机 + 属性系统 + 事件触发

const STAT_DEFS = [
  { key: "tech",    label: "技术", icon: "🧠" },
  { key: "comm",    label: "沟通", icon: "💬" },
  { key: "money",   label: "存款", icon: "💰" },
  { key: "health",  label: "健康", icon: "❤️" },
  { key: "network", label: "人脉", icon: "🤝" },
  { key: "fame",    label: "声誉", icon: "🔥" }
];

const State = {
  age: 22,
  stats: { tech: 50, comm: 50, money: 0, health: 80, network: 30, fame: 10 },
  flags: new Set(),
  history: [], // { age, text } —— 侧边日志用的简短摘要
  story: [],   // 完整人生故事(分享长图数据源):{ chapterId, chapterNo, chapterTitle, age, title, scene, choice, feedback }
  started: false,
  // 章节制
  lineId: "main",         // 合并后只有一条主线
  chapterId: null,
  eventIdx: 0,
  title: "junior",
  shownTitleEvents: new Set(),
  // 公司履历(动态生成)
  startCo: null,                // 起点公司
  currentCo: null,              // 当前所在公司
  companyHistory: [],           // [{co: "开水厂", years: [22, 28], reason: "起点"}]
  jobChanges: 0                 // 累计换工作次数
};

// 公司池(按规模/类型分组,全用"某"前缀降低法律风险)
const COMPANY_POOLS = {
  bigCorp:   ["某卷王厂", "某福报厂", "某鹅厂", "某狼厂", "某拼厂", "某美厂"],
  midCorp:   ["某菜厂", "某方舟", "某荔枝"],
  startup:   ["某黑曜 AI", "某藤蔓科技", "某野火 AI"],
  foreign:   ["某外企", "某蓝厂(外资)"]
};

// 加权抽公司:大厂 50%、中厂 30%、创业 15%、外企 5%
function pickRandomCompany(excludeList = []) {
  const r = Math.random();
  let pool;
  if (r < 0.5)      pool = COMPANY_POOLS.bigCorp;
  else if (r < 0.8) pool = COMPANY_POOLS.midCorp;
  else if (r < 0.95) pool = COMPANY_POOLS.startup;
  else              pool = COMPANY_POOLS.foreign;

  const filtered = pool.filter(c => !excludeList.includes(c));
  const final = filtered.length ? filtered : pool;
  return final[Math.floor(Math.random() * final.length)];
}

// 切换公司:更新 currentCo / 加入 history / 计数
function changeCompany(reason) {
  const exclude = State.companyHistory.map(h => h.co).concat(State.currentCo);
  const newCo = pickRandomCompany(exclude);
  if (State.currentCo) {
    // 关闭上一段
    const last = State.companyHistory[State.companyHistory.length - 1];
    if (last) last.endAge = State.age;
  }
  State.companyHistory.push({ co: newCo, startAge: State.age, reason });
  State.currentCo = newCo;
  State.jobChanges++;
  return newCo;
}

// 替换文本里 {startCo} / {currentCo} / {tl} 占位符
const RE_STARTCO = /\{startCo\}/g;
const RE_CURRENTCO = /\{currentCo\}/g;
const RE_TL = /\{tl\}/g;
const RE_TITLE = /\{title\}/g;
const RE_AGE = /\{age\}/g;
// 公司专属黑话占位:{im} {call} {review_unit} {purge_label} {greeting}
const FLAVOR_KEYS = ["im", "call", "review_unit", "perf_low", "purge_label", "greeting"];

// 根据 startCo 反查 COMPANIES 字典里的 flavor
function getCurrentFlavor() {
  if (!State.startCo || typeof COMPANIES !== "object") return null;
  for (const co of Object.values(COMPANIES)) {
    if (co.short === State.startCo) return co.flavor || null;
  }
  return null;
}

function currentTL() {
  // 老周还在 = 一直叫老周
  if (!State.flags || !State.flags.has("laozhou_gone") && !State.flags.has("followed_laozhou")) {
    return "老周";
  }
  // 跟着老周走了 —— 老周成了 CTO,叙事里继续叫老周
  if (State.flags.has("followed_laozhou")) {
    return "老周";  // 在创业公司里他仍是你的 boss
  }
  // 留下来 / 自己跳走 → 新 TL 小林
  return "小林";
}

// 智能替换:{key} 渲染后,如果替换值首尾是英文/数字,而原文相邻是中文,自动补空格(中英文混排可读性)
// 例: "14 个{im}群" + {im}=Slack → "14 个 Slack 群"(不是"14 个Slack群")
const RE_LATIN_START = /^[A-Za-z0-9]/;
const RE_LATIN_END = /[A-Za-z0-9]$/;
const RE_CJK = /[一-鿿]/;
function smartReplace(text, regex, value) {
  if (value === null || value === undefined) return text;
  const val = String(value);
  // 注:无捕获组的 replace callback 签名是 (match, offset, full)
  return text.replace(regex, function (match) {
    const args = arguments;
    const full = args[args.length - 1];
    const offset = args[args.length - 2];
    let left = "", right = "";
    if (RE_LATIN_START.test(val) && offset > 0 && RE_CJK.test(full[offset - 1])) {
      left = " ";
    }
    if (RE_LATIN_END.test(val)) {
      const next = full[offset + match.length];
      if (next && RE_CJK.test(next)) right = " ";
    }
    return left + val + right;
  });
}

function fillCo(text) {
  if (!text) return text;
  let s = String(text);
  if (State.startCo)   s = smartReplace(s, RE_STARTCO, State.startCo);
  if (State.currentCo) s = smartReplace(s, RE_CURRENTCO, State.currentCo);
  s = smartReplace(s, RE_TL, currentTL());
  if (State.title) s = smartReplace(s, RE_TITLE, titleLabel(State.title));
  if (State.age) s = smartReplace(s, RE_AGE, String(State.age));
  // 公司专属黑话占位
  const flavor = getCurrentFlavor() || {};
  const FLAVOR_FALLBACK = {
    im: "钉钉",
    call: "全名",
    review_unit: "年终述职",
    perf_low: "C",
    purge_label: "组织优化",
    greeting: "你那边怎么样"
  };
  for (const key of FLAVOR_KEYS) {
    const val = flavor[key] || FLAVOR_FALLBACK[key] || "";
    s = smartReplace(s, new RegExp(`\\{${key}\\}`, "g"), val);
  }
  return s;
}

// 统一渲染:标题 + 正文 + 按钮区 HTML(自动 fillCo)
// 给新代码用,老函数不强制迁移
function setScene(title, text, choicesHtml) {
  document.getElementById("scene-title").textContent = fillCo(title);
  document.getElementById("scene-text").textContent = fillCo(text);
  if (choicesHtml !== undefined) {
    document.getElementById("choices").innerHTML = choicesHtml;
  }
}

// ---------------- 渲染 ----------------

function renderStats(delta = {}) {
  const el = document.getElementById("stats");
  el.innerHTML = STAT_DEFS.map(s => {
    const v = State.stats[s.key];
    const d = delta[s.key];
    let cls = "stat";
    let deltaText = "";
    if (d !== undefined && d !== 0) {
      cls += d > 0 ? " delta-up" : " delta-down";
      deltaText = ` (${d > 0 ? "+" : ""}${d})`;
    }
    return `<span class="${cls}">${s.icon} ${s.label} ${v}${deltaText}</span>`;
  }).join("");
  document.getElementById("age").textContent = State.age;

  // 职级 badge
  const badgeEl = document.getElementById("title-badge");
  if (badgeEl) badgeEl.textContent = titleLabel(State.title);

  // 章节信息
  const ciEl = document.getElementById("chapter-info");
  if (ciEl) {
    if (State.lineId && State.chapterId) {
      const ch = LINES[State.lineId].chapters[State.chapterId];
      ciEl.textContent = `第 ${ch.chapter} 章 ${ch.title}`;
    } else {
      ciEl.textContent = "";
    }
  }
}

// ---------------- 章节制核心调度 ----------------
//
// 玩家流程:
//   start() -> 选线(LINE_PICKER) -> enterChapter(line.startChapter)
//     -> 章节封面(setting) -> 依次播放 events
//     -> 每个 event 可能是 textEvent / minigame / isEnding
//     -> 章节末:章节总结页 + 职级检查(若升级,触发 TITLE_EVENTS)
//     -> 进入下一章 或 进入结局

function getCurrentLine() {
  return State.lineId ? LINES[State.lineId] : null;
}

function getCurrentChapter() {
  const line = getCurrentLine();
  return line && State.chapterId ? line.chapters[State.chapterId] : null;
}

// 把玩家当步看到的完整故事(标题/场景正文/选中选项/选完后续)写入 State.story
// 统一在此处去 HTML 标签 + fillCo,修复历史上小游戏结局 log 未替换占位符的隐患
function pushStory(part) {
  const clean = s => fillCo(String(s).replace(/<[^>]+>/g, ""));
  const ch = getCurrentChapter();
  State.story.push({
    chapterId: State.chapterId,
    chapterNo: ch ? ch.chapter : null,
    chapterTitle: ch ? ch.title : null,
    age: State.age,
    title: part.title ? clean(part.title) : "",
    scene: part.scene ? clean(part.scene) : "",
    choice: part.choice ? clean(part.choice) : "",
    feedback: part.feedback ? clean(part.feedback) : ""
  });
}

// 开局 · 阶段 1: 找工作叙事
function renderOpening() {
  checkpoint("opening");
  document.getElementById("scene-title").textContent = OPENING.phase1.title;
  document.getElementById("scene-text").textContent = OPENING.phase1.text;
  const el = document.getElementById("choices");
  el.innerHTML = `<button class="choice big-cta" id="opening-btn">${OPENING.phase1.proceedLabel}</button>`;
  document.getElementById("opening-btn").onclick = () => renderOfferPicker();
}

// 开局 · 阶段 2: 3-4 个 Offer 选一个
function renderOfferPicker() {
  checkpoint("offer");
  document.getElementById("scene-title").textContent = OPENING.phase2.title;
  document.getElementById("scene-text").textContent = OPENING.phase2.text;
  const el = document.getElementById("choices");

  el.innerHTML = OPENING.phase2.offers.map((o, i) => `
    <button class="choice offer-card" data-i="${i}">
      <div class="oc-head">
        <span class="oc-emoji">${o.emoji}</span>
        <span class="oc-label">${o.label}</span>
      </div>
      <div class="oc-intro">${o.intro}</div>
      <div class="oc-joke">${o.joke.replace(/\n/g, "<br>")}</div>
      <div class="oc-effect">${formatOfferEffect(o.effect)}</div>
    </button>
  `).join("");

  el.querySelectorAll(".offer-card").forEach(btn => {
    btn.onclick = () => {
      const o = OPENING.phase2.offers[parseInt(btn.dataset.i, 10)];
      acceptOffer(o);
    };
  });
}

function formatOfferEffect(effect) {
  const labelMap = { tech: "🧠技术", comm: "💬沟通", money: "💰存款", health: "❤️健康", network: "🤝人脉", fame: "🔥声誉" };
  return Object.entries(effect).map(([k, v]) =>
    `<span class="oe-tag ${v > 0 ? 'pos' : 'neg'}">${labelMap[k] || k} ${v > 0 ? "+" : ""}${v}</span>`
  ).join("");
}

function acceptOffer(offer) {
  applyEffect(offer.effect);
  (offer.flags || []).forEach(f => State.flags.add(f));
  State.startCo = offer.startCoLabel || offer.co;
  State.currentCo = State.startCo;
  State.companyHistory = [{ co: State.startCo, startAge: 22, reason: "起点 · 毕业首份" }];
  renderStats();
  enterMainLine();
}

function enterMainLine() {
  State.lineId = "main";
  const line = LINES.main;
  enterChapter(line.startChapter);
}

function enterChapter(chapterId) {
  // 进入新章先给上一章的"自然成长"——3 年时间任何人都会经验积累
  // 放在 enterChapter 开头能保证无论上一章怎么结束(被裁/特殊事件/正常)都加一次
  // 不在 ch1(玩家刚毕业,没有"上一章")
  if (State.chapterId) {
    applyEffect({ tech: 2, comm: 1 });
  }
  State.chapterId = chapterId;
  State.eventIdx = 0;
  State._randomRolled = false;  // 每章重置随机事件 flag
  const ch = getCurrentChapter();
  if (!ch) return;
  // 章节起点年龄
  if (ch.ageRange && ch.ageRange[0]) State.age = ch.ageRange[0];
  renderStats();
  renderChapterCover(ch);
}

// 章节封面页
function renderChapterCover(ch) {
  checkpoint("chapterCover");
  document.getElementById("scene-title").textContent = fillCo(`第 ${ch.chapter} 章  ${ch.title}`);
  document.getElementById("scene-text").textContent = fillCo(ch.setting);
  const el = document.getElementById("choices");
  el.innerHTML = `<button class="choice big-cta" id="start-ch-btn">开始这三年 →</button>`;
  document.getElementById("start-ch-btn").onclick = () => playNextEvent();
}

// 把 events 和 events_late 合成一个有效事件序列
// events_late 在 events 之后,在 random pool 和 chapter summary 之前
function getChapterEventList(ch) {
  if (!ch) return [];
  return [...(ch.events || []), ...(ch.events_late || [])];
}

// 依次播放章节内的事件
function playNextEvent() {
  const ch = getCurrentChapter();
  if (!ch) return;
  checkpoint("event");
  const eventList = getChapterEventList(ch);
  if (State.eventIdx >= eventList.length) {
    // 固定事件播完,先 roll 一下随机事件池
    if (ch.randomEventPool && !State._randomRolled) {
      State._randomRolled = true;
      const rolled = rollRandomEvent(ch.randomEventPool, State.age);
      if (rolled) {
        if (rolled.isChain && Array.isArray(rolled.chain)) {
          return renderChainEvent(rolled.chain);
        }
        return renderTextEvent(rolled);
      }
    }
    // 然后进入章节总结
    State._randomRolled = false;
    return renderChapterSummary(ch);
  }
  const evt = eventList[State.eventIdx];
  if (evt.age) State.age = evt.age;

  // 健康崩
  if (State.stats.health <= 0) {
    return showSpecialEnding("sudden_death");
  }

  renderStats();

  if (evt.isEnding) {
    return showEnding();
  }
  if (evt.forcedBranch === "age35") {
    return renderAge35Branch();
  }
  if (evt.minigame) {
    // intro 写到场景文案
    document.getElementById("scene-title").textContent = fillCo(ch.title);
    document.getElementById("scene-text").textContent = fillCo(evt.intro || "");
    return renderMinigame(evt.minigame);
  }
  if (evt.conditionalMinigame) {
    const cm = evt.conditionalMinigame;
    if (cm.requires(State)) {
      document.getElementById("scene-title").textContent = fillCo(ch.title);
      document.getElementById("scene-text").textContent = fillCo(cm.intro || "");
      return renderMinigame(cm.minigame);
    } else {
      State.eventIdx++;
      return playNextEvent();
    }
  }
  if (evt.conditionalTextEvent) {
    const cte = evt.conditionalTextEvent;
    if (cte.requires(State)) {
      return renderTextEvent({ title: cte.title, text: cte.text, choices: cte.choices });
    } else {
      State.eventIdx++;
      return playNextEvent();
    }
  }
  if (evt.textEvent) {
    return renderTextEvent(evt.textEvent);
  }
  State.eventIdx++;
  playNextEvent();
}

// 链式事件:连续 N 步,玩家每步必选,选完自动进下一步
// 用于"嫡系空降 → 主动背 C → PIP"这种逃不掉的剧本
// onComplete:可选,链结束后调。默认行为是进章节总结(给随机事件池用);
//             评审失败链应传 advanceFromMinigame
function renderChainEvent(chain, onComplete) {
  let idx = 0;

  function playStep() {
    if (idx >= chain.length) {
      if (onComplete) return onComplete();
      // 默认:进章节总结
      State._randomRolled = false;
      return renderChapterSummary(getCurrentChapter());
    }
    const step = chain[idx];
    const titleWithStep = `${step.title}  (${idx + 1}/${chain.length})`;
    // 支持 dynamicText:根据当前 flags 选择段落
    const text = typeof step.dynamicText === "function"
      ? step.dynamicText(State.flags)
      : step.text;
    // 支持 conditionalChoicesByFlag:玩家有指定 flag 时用替代 choices
    let choices = step.choices;
    if (step.conditionalChoicesByFlag) {
      for (const [flag, altChoices] of Object.entries(step.conditionalChoicesByFlag)) {
        if (State.flags.has(flag)) {
          choices = altChoices;
          break;
        }
      }
    }
    renderTextEventCustom({
      title: titleWithStep,
      text: text,
      choices: choices
    }, () => {
      idx++;
      playStep();
    });
  }

  playStep();
}

// renderTextEvent 的变体:支持指定选完后的 onDone 回调,而不是默认推 eventIdx
function renderTextEventCustom(te, onDone) {
  document.getElementById("scene-title").textContent = fillCo(te.title);
  document.getElementById("scene-text").textContent = fillCo(te.text);
  const el = document.getElementById("choices");
  el.innerHTML = "";
  (te.choices || []).forEach(c => {
    const btn = document.createElement("button");
    btn.className = "choice";
    btn.innerHTML = `${fillCo(c.text)}<span class="hint">${c.hint || ""}</span>`;
    btn.onclick = () => {
      const delta = applyEffect(c.effect || {});
      (c.flags || []).forEach(f => State.flags.add(f));
      State.history.push({ age: State.age, text: fillCo(c.text) });
      renderStats(delta);
      renderLog();

      showChoiceFeedback(c, delta, te, () => {
        if (c.doJobChange) {
          const reasonText = fillCo(c.doJobChange);
          const oldCo = State.currentCo;
          const newCo = changeCompany(reasonText);
          showCompanyChangeTransition(oldCo, newCo, reasonText, onDone);
          return;
        }
        onDone();
      });
    };
    el.appendChild(btn);
  });
}

// 35 岁强制分歧
function renderAge35Branch() {
  const rolled = rollAge35Branch(State.stats, State.flags);
  if (!rolled) {
    State.eventIdx++;
    return playNextEvent();
  }
  const branch = rolled.branch;
  renderTextEvent({
    title: branch.title,
    text: branch.text,
    choices: branch.choices
  });
}

// 简单文本事件:标题 + 文案 + 选项
function renderTextEvent(te) {
  // 支持 dynamicText(flags) 函数 —— 根据玩家 flag 输出不同段落
  const textValue = typeof te.dynamicText === "function"
    ? te.dynamicText(State.flags)
    : te.text;
  document.getElementById("scene-title").textContent = fillCo(te.title);
  document.getElementById("scene-text").textContent = fillCo(textValue);
  const el = document.getElementById("choices");
  el.innerHTML = "";
  (te.choices || []).forEach(c => {
    const btn = document.createElement("button");
    btn.className = "choice";
    btn.innerHTML = `${fillCo(c.text)}<span class="hint">${c.hint || ""}</span>`;
    btn.onclick = () => {
      const delta = applyEffect(c.effect || {});
      (c.flags || []).forEach(f => State.flags.add(f));
      State.history.push({ age: State.age, text: fillCo(c.text) });
      renderStats(delta);
      renderLog();

      // 显示反馈页,然后才跳下一个事件
      showChoiceFeedback(c, delta, te, () => {
        // 特殊后果(删库跑路)
        if (c.specialOutcome) {
          return handleSpecialOutcome(c.specialOutcome, () => {
            State.eventIdx++;
            playNextEvent();
          });
        }
        // 触发换公司
        if (c.doJobChange) {
          const reasonText = fillCo(c.doJobChange);
          const oldCo = State.currentCo;
          const newCo = changeCompany(reasonText);
          showCompanyChangeTransition(oldCo, newCo, reasonText, () => {
            State.eventIdx++;
            playNextEvent();
          });
          return;
        }
        State.eventIdx++;
        playNextEvent();
      });
    };
    el.appendChild(btn);
  });
}

// 根据属性变化自动生成兜底反馈文案
// 没作者写 feedback 时使用,比"时间过去了一段"有质感
function autoFeedbackFromDelta(delta) {
  // 看主导变化方向
  const positive = [];
  const negative = [];
  for (const [k, v] of Object.entries(delta)) {
    if (v >= 5) positive.push(k);
    else if (v <= -5) negative.push(k);
  }

  // 没有显著变化
  if (positive.length === 0 && negative.length === 0) {
    return "这一年没什么特别的事发生。\n你照常上班、下班、写代码、开会。回头看,这种'没事'其实是奢侈。";
  }

  // 健康/钱大降:有代价的选择
  if (delta.health !== undefined && delta.health <= -8) {
    return "你为这个选择付出了不少。\n那段时间你瘦了几公斤,身边的人开始问'你最近还好吗'。\n你说还行,但你心里知道这是有代价的。";
  }
  if (delta.money !== undefined && delta.money <= -15) {
    return "你这笔账自己默默扛了。\n你媳妇问家里钱怎么少了,你说'临时周转',但你心里清楚这是你的选择。";
  }

  // 技术/声誉大升:好选择
  if ((delta.tech !== undefined && delta.tech >= 5) ||
      (delta.fame !== undefined && delta.fame >= 5)) {
    return "这事让你有点小成就感。\n虽然没人在大群里夸你,但组里有几个人主动来和你聊。\n这是你这一行很少见的'被看见'。";
  }

  // 沟通/人脉升:社交选择
  if ((delta.comm !== undefined && delta.comm >= 5) ||
      (delta.network !== undefined && delta.network >= 5)) {
    return "你这次处理得圆熟。\n组里有人对你印象深了一档,但你自己有点说不清是不是'变油了'。";
  }

  // 默认:平淡过渡
  return "这事就这么过去了。\n你回过头看,知道这是你做的选择,也只能这样。";
}

// 选项反馈页:显示这个选择带来的微剧情 + 属性变化
// choice: 选中的选项对象
// delta: 属性变化 {tech: +5, ...}
// te: 原事件(用于上下文,目前未用)
// onContinue: 玩家点继续后的回调
function showChoiceFeedback(choice, delta, te, onContinue) {
  const sceneTitle = document.getElementById("scene-title");
  const sceneText = document.getElementById("scene-text");
  const el = document.getElementById("choices");

  // 标题:用选项的简短描述
  sceneTitle.textContent = "你选择了 · " + fillCo(choice.text).replace(/<[^>]+>/g, "");

  // 主文案:作者写的 feedback,或者自动生成
  let feedbackText = "";
  if (typeof choice.feedback === "function") {
    feedbackText = choice.feedback(State.flags);
  } else if (choice.feedback) {
    feedbackText = choice.feedback;
  } else {
    // 没有作者写的反馈,根据 delta 自动生成有质感的兜底文案
    feedbackText = autoFeedbackFromDelta(delta);
  }
  sceneText.textContent = fillCo(feedbackText);

  // 写入完整人生故事(场景标题 + 场景正文 + 选中选项 + 选完后续)
  const sceneBody = typeof te.dynamicText === "function" ? te.dynamicText(State.flags) : te.text;
  pushStory({
    title: te.title,
    scene: sceneBody,
    choice: choice.text,
    feedback: feedbackText
  });

  // 渲染属性 delta 卡片 + 继续按钮
  const deltaItems = Object.entries(delta).filter(([k, v]) => v !== 0);
  let deltaHtml = "";
  if (deltaItems.length > 0) {
    const labelMap = { tech: "🧠 技术", comm: "💬 沟通", money: "💰 存款", health: "❤️ 健康", network: "🤝 人脉", fame: "🔥 声誉" };
    deltaHtml = `
      <div class="feedback-delta">
        ${deltaItems.map(([k, v]) => `
          <span class="fd-item ${v > 0 ? 'fd-up' : 'fd-down'}">
            ${labelMap[k] || k}
            <strong>${v > 0 ? '↑ +' : '↓ '}${Math.abs(v)}</strong>
          </span>
        `).join("")}
      </div>
    `;
  }

  // 显示 flag 变化(如果有"获得 xxx"性质的)
  let flagHtml = "";
  const significantFlags = (choice.flags || []).filter(f =>
    !f.startsWith("track_") && !f.startsWith("path_") && !f.endsWith("_passed") && !f.endsWith("_review_failed")
  );
  if (significantFlags.length > 0 && choice.flagLabels) {
    flagHtml = `<div class="feedback-flags">${significantFlags.map(f => choice.flagLabels[f] || "").filter(Boolean).map(t => `<span class="ff-tag">🏷 ${t}</span>`).join("")}</div>`;
  }

  el.innerHTML = `
    ${deltaHtml}
    ${flagHtml}
    <button class="choice big-cta" id="fb-continue">继续 →</button>
  `;
  document.getElementById("fb-continue").onclick = onContinue;
}

// 特殊后果(删库跑路等小概率彩蛋)
function handleSpecialOutcome(outcomeId, onDone) {
  const sceneTitle = document.getElementById("scene-title");
  const sceneText = document.getElementById("scene-text");
  const el = document.getElementById("choices");

  if (outcomeId === "genz_fire") {
    // 60% 概率触发删库跑路(原 30% 太低,玩家很难看到这个彩蛋)
    if (Math.random() < 0.6) {
      // 步骤 1: 半夜电话
      sceneTitle.textContent = "🔥 凌晨 03:47 · 电话";
      sceneText.textContent = `辞退通知发出 6 小时后。
凌晨 03:47,你被电话叫醒。
是 CTO,他声音抖:'X,你昨天辞的那个小吴 ——'
'他在交接前几分钟,用最后的权限登了生产 DB。'
'DROP DATABASE。核心订单库 17 TB,清零。Backup 是 8 小时前的。'

你心跳直接飙到 140。
你 5 分钟内冲到公司。
路上你想起小吴办手续时看你的那一眼。
你以为那是颓废,其实那是预告。`;
      pushStory({ title: "🔥 凌晨 03:47 · 电话", scene: sceneText.textContent });
      el.innerHTML = `<button class="choice big-cta" id="genz-step1">推开应急会议室门 →</button>`;
      document.getElementById("genz-step1").onclick = () => {
        sceneTitle.textContent = "🔥 删库跑路 · 后果";
        sceneText.textContent = `应急会议室里 12 个人,DBA + 运维 + 安全 + 法务 + CTO。
凌晨 5 点,警察来了 —— 这是刑事案件。
你被叫去做笔录,虽然你不是直接责任人,但你是"辞退决策人"。

事故损失评估:GMV 直接损失 2700 万,品牌信誉损失无法估算。
公司内部启动"问责机制",CTO 在会上说:
'我们要查清楚 —— 为什么会让一个有删库权限的工程师走得这么仓促。'

HRBP 张姐找你谈话。她不再笑了。
'X,这事公司不会让你扛刑事责任。但你这位置,可能要换一换。'

3 天后:你被调离管理岗。
1 个月后:你的下属重新分配。
3 个月后:你年终绩效 D,且'高潜培养'标签永久取消。
6 个月后:你接到那张 N+1 协议。`;
        pushStory({ title: "🔥 删库跑路 · 后果", scene: sceneText.textContent });
        // 严重后果:fame、health、money、network 全砍
        applyEffect({ fame: -30, health: -20, money: -30, network: -15, comm: -8 });
        State.flags.add("genz_revenge");
        State.flags.add("data_wipe_incident");  // 结局判定用
        renderStats();
        renderLog();
        el.innerHTML = `<button class="choice big-cta" id="genz-step2">这事会一辈子跟着你 →</button>`;
        document.getElementById("genz-step2").onclick = onDone;
      };
      return;
    }
    // 40% 概率走正常流程
    sceneTitle.textContent = "辞退完成 · 你松了口气";
    sceneText.textContent = `小吴办完手续走人。
组里没人替他说话,大家觉得他确实不合适。
你今年绩效照旧拿了 A。
那一眼回头看你的画面,你后来再没想起来。`;
    pushStory({ title: "辞退完成 · 你松了口气", scene: sceneText.textContent });
    el.innerHTML = `<button class="choice big-cta" id="genz-cont">回到工作 →</button>`;
    document.getElementById("genz-cont").onclick = onDone;
    return;
  }

  // 未识别的 special outcome,直接 done
  onDone();
}

// 换公司过渡页:让玩家清楚地看到"我换了"
function showCompanyChangeTransition(oldCo, newCo, reason, onContinue) {
  document.getElementById("scene-title").textContent = `📤 离开 ${oldCo}`;
  const text = `离开原因:${reason}\n\n两个月后,你入职了新公司 —— ${newCo}。\n\n新工牌挂上脖子的那一刻,你想起了 ${oldCo} 入职那天。你今年 ${State.age} 岁。`;
  document.getElementById("scene-text").textContent = text;
  const el = document.getElementById("choices");
  el.innerHTML = `<button class="choice big-cta" id="co-change-btn">入职 ${newCo} →</button>`;
  document.getElementById("co-change-btn").onclick = onContinue;
}

// 章节总结页
// 注:职级升级不在这里自动判定,而是在每章固定的"评审小游戏"事件里手动评审
function renderChapterSummary(ch) {
  // 章末年龄
  if (ch.summary && ch.summary.ageAtEnd) State.age = ch.summary.ageAtEnd;

  // 健康崩
  if (State.stats.health <= 0) return showSpecialEnding("sudden_death");

  renderChapterSummaryInner(ch);
}

function renderChapterSummaryInner(ch) {
  checkpoint("summary");
  renderStats();
  const titleHtml = `第 ${ch.chapter} 章 · ${ch.title} · 落幕`;
  document.getElementById("scene-title").textContent = fillCo(titleHtml);
  const summary = ch.summary || {};
  document.getElementById("scene-text").textContent = fillCo(summary.text || "");
  pushStory({ title: titleHtml, scene: summary.text || "" });

  // 总结页 UI:章节摘要 + 当前画像
  const el = document.getElementById("choices");
  const statsLine = STAT_DEFS.map(s => `${s.icon}${s.label} ${State.stats[s.key]}`).join("&nbsp;·&nbsp;");
  const nextLabel = ch.nextChapter ? "进入下一章 →" : "进入退休结局 →";
  el.innerHTML = `
    <div class="chapter-summary">
      <div class="cs-stats">${statsLine}</div>
      <div class="cs-title-badge">职级:${titleLabel(State.title)} · 年龄 ${State.age}</div>
    </div>
    <button class="choice big-cta" id="next-ch-btn">${nextLabel}</button>
  `;
  document.getElementById("next-ch-btn").onclick = () => {
    if (ch.nextChapter) {
      enterChapter(ch.nextChapter);
    } else {
      showEnding();
    }
  };
}

// 职级身份事件已被评审小游戏取代,不再使用

function renderLog() {
  const el = document.getElementById("log");
  el.innerHTML = State.history.slice(-8).map(h =>
    `<div class="entry"><span class="y">${h.age}岁</span>${h.text}</div>`
  ).join("");
  el.scrollTop = el.scrollHeight;
}

// ---------------- 状态变更 ----------------

// 各属性的 clamp 范围 —— money 没上限(单位万),其他能力值 0-100
const STAT_CLAMP = {
  tech:    { min: 0,    max: 100 },
  comm:    { min: 0,    max: 100 },
  health:  { min: 0,    max: 100 },
  network: { min: 0,    max: 100 },
  fame:    { min: 0,    max: 100 },
  money:   { min: -200, max: 9999 }   // 允许负债;退休后可达千万
};

function applyEffect(effect = {}) {
  const delta = {};
  for (const [k, v] of Object.entries(effect)) {
    if (State.stats[k] === undefined) continue;
    const c = STAT_CLAMP[k] || { min: 0, max: 100 };
    State.stats[k] = Math.max(c.min, Math.min(c.max, State.stats[k] + v));
    delta[k] = v;
  }
  return delta;
}

// 小游戏调用此函数表示自己结束了,引擎播下一个事件
function advanceFromMinigame() {
  State.eventIdx++;
  playNextEvent();
}

// ---------------- 小游戏 ----------------

// 所有小游戏完成后统一调 advanceFromMinigame(),不再需要 nextNode 参数
function renderMinigame(id) {
  const mg = MINIGAMES[id];
  if (!mg) return;
  if (id === "bug_hunt") return renderBugHunt(mg);
  if (id === "tech_choice") return renderTechChoice(mg);
  if (id === "interview_back") return renderInterviewBack(mg);
  if (id === "offer_negotiation") return renderOfferNegotiation(mg);
  if (id === "interview_run") return renderInterviewRun(mg);
  // 通用评审引擎:5 个级别评审都走这里
  if (["mid_review", "senior_plus_review", "senior_review", "expert_review", "principal_review"].includes(id)) {
    return renderReview(mg);
  }
}

// ---------------- 面试找工作小游戏 ----------------
function renderInterviewRun(mg, onComplete) {
  const el = document.getElementById("choices");
  const sceneText = document.getElementById("scene-text");
  const sceneTitle = document.getElementById("scene-title");

  // 步骤 1: 准备期
  sceneTitle.textContent = `${mg.title} · 准备期`;
  sceneText.textContent = mg.prepNarrative;
  el.innerHTML = `<button class="choice big-cta" id="ir-prep">第一家面试 →</button>`;
  document.getElementById("ir-prep").onclick = () => startCompany(0);

  let companyIdx = 0;
  const results = []; // [{ companyId, name, passed, score }]

  function startCompany(idx) {
    if (idx >= mg.companies.length) return settle();
    const co = mg.companies[idx];
    let qIdx = 0;
    let score = 0;

    sceneTitle.textContent = `${co.name} · 面试开始`;
    sceneText.textContent = `${co.name}\n职级: ${co.level}\n薪资: ${co.baseRange}\n\n3 道面试题。你需要 ${mg.passThreshold} 分以上才能拿到 offer。`;
    el.innerHTML = `<button class="choice big-cta" id="ir-start-co">进入面试 →</button>`;
    document.getElementById("ir-start-co").onclick = askQ;

    function askQ() {
      if (qIdx >= co.questions.length) return endCompany();
      const q = co.questions[qIdx];
      sceneTitle.textContent = `${co.name} · ${qIdx + 1}/${co.questions.length}`;
      sceneText.textContent = q.q;
      el.innerHTML = q.options.map((o, i) => `
        <button class="choice" data-i="${i}">${o.text}</button>
      `).join("");
      el.querySelectorAll(".choice").forEach(btn => {
        btn.onclick = () => {
          const opt = q.options[parseInt(btn.dataset.i, 10)];
          score += opt.score;
          qIdx++;
          askQ();
        };
      });
    }

    function endCompany() {
      const passed = score >= mg.passThreshold;
      results.push({ companyId: co.id, name: co.name, passed, score });
      sceneTitle.textContent = `${co.name} · 结果`;
      sceneText.textContent = passed
        ? `✅ ${co.name} 给你发了 offer。\n职级 ${co.level},base ${co.baseRange}。\n[本场得分 ${score}]`
        : `❌ ${co.name} 拒了。\nHR 回复:'感谢您的时间,我们决定不进入下一轮。'\n[本场得分 ${score}]`;
      el.innerHTML = `<button class="choice big-cta" id="ir-next-co">${idx + 1 >= mg.companies.length ? "查看面试结果 →" : "下一家面试 →"}</button>`;
      document.getElementById("ir-next-co").onclick = () => startCompany(idx + 1);
    }
  }

  function settle() {
    const passed = results.filter(r => r.passed).length;
    let outcome;
    if (mg.outcomes.excellent.condition(passed)) outcome = mg.outcomes.excellent;
    else if (mg.outcomes.ok.condition(passed)) outcome = mg.outcomes.ok;
    else outcome = mg.outcomes.failed;

    const delta = applyEffect(outcome.effect);
    renderStats(delta);
    renderLog();

    const offerList = results.filter(r => r.passed).map(r => `• ${r.name}`).join("\n");
    const logText = outcome.log.replace("N", passed);
    sceneTitle.textContent = `面试结果 · 拿到 ${passed}/${mg.companies.length} 个 offer`;
    sceneText.textContent = `${logText}\n\n${passed > 0 ? "拿到 offer 的公司:\n" + offerList : ""}`;

    // 如果 0 offer,记录 flag —— 后续触发失业链
    if (passed === 0) {
      State.flags.add("interview_zero_offer");
    }
    // 如果有 offer,自动换公司到第一家通过的
    let newCo = null;
    if (passed > 0) {
      const firstPass = results.find(r => r.passed);
      newCo = firstPass.name;
      // 触发换公司
      changeCompany(`面试 ${results.length} 家,过 ${passed} 家,接 ${newCo}`);
    }

    el.innerHTML = `<button class="choice big-cta" id="ir-done">${passed > 0 ? "入职新公司 →" : "进入待业期 →"}</button>`;
    document.getElementById("ir-done").onclick = () => {
      if (passed === 0) {
        // 0 offer 走失业链(投简历石沉大海、小厂给不起钱)
        renderUnemploymentChain(() => {
          if (onComplete) onComplete(passed);
          else advanceFromMinigame();
        });
      } else if (onComplete) {
        onComplete(passed);
      } else {
        advanceFromMinigame();
      }
    };
  }
}

// ---------------- 通用评审小游戏(中级/资深/专家/首席)----------------
// mg 必须有:title, prepNarrative, intro, judges, questions, outcomes, targetTitle
// outcomes 的 key 按"pass / keep_position / keep_position_fallback / fired"顺序优先匹配
function renderReview(mg) {
  const el = document.getElementById("choices");
  const sceneText = document.getElementById("scene-text");
  const sceneTitle = document.getElementById("scene-title");

  // 步骤 1: 准备期情绪铺垫
  sceneTitle.textContent = `${mg.title} · 评审前夜`;
  sceneText.textContent = mg.prepNarrative;
  el.innerHTML = `<button class="choice big-cta" id="review-prep-btn">走向会议室 →</button>`;
  document.getElementById("review-prep-btn").onclick = () => showIntro();

  let qIdx = 0;
  const judgeTotals = {};
  mg.judges.forEach(j => { judgeTotals[j.id] = 0; });

  // 步骤 2: 进入会议室
  function showIntro() {
    sceneTitle.textContent = `${mg.title} · 推开门`;
    sceneText.textContent = mg.intro;
    el.innerHTML = `<button class="choice big-cta" id="review-start-btn">开始答辩 →</button>`;
    document.getElementById("review-start-btn").onclick = () => startQuestions();
  }

  function startQuestions() {
    qIdx = 0;
    askQ();
  }

  function askQ() {
    if (qIdx >= mg.questions.length) return settle();
    const q = mg.questions[qIdx];

    sceneTitle.textContent = `${mg.title} · 第 ${qIdx + 1} / ${mg.questions.length} 题`;
    sceneText.textContent = q.q;

    const judgesHtml = mg.judges.map(j => `
      <div class="judge-chip">${j.emoji} ${j.label}<span class="jc-bias">(${j.bias})</span></div>
    `).join("");

    el.innerHTML = `
      <div class="review-board">
        <div class="judges-row">${judgesHtml}</div>
        ${q.options.map((o, i) => `
          <button class="choice review-option" data-i="${i}">${o.text}</button>
        `).join("")}
      </div>
    `;

    el.querySelectorAll(".review-option").forEach(btn => {
      btn.onclick = () => {
        const opt = q.options[parseInt(btn.dataset.i, 10)];
        for (const j of mg.judges) {
          judgeTotals[j.id] += (opt.scores[j.id] || 0);
        }
        qIdx++;
        askQ();
      };
    });
  }

  function settle() {
    const total = Object.values(judgeTotals).reduce((s, v) => s + v, 0);

    // 按定义顺序匹配 outcome
    const outcomeOrder = ["pass", "keep_position", "keep_position_fallback", "fired"];
    let outcome = null;
    let outcomeKey = null;
    for (const key of outcomeOrder) {
      const o = mg.outcomes[key];
      if (o && o.condition(total)) { outcome = o; outcomeKey = key; break; }
    }
    if (!outcome) {
      // 兜底:任何还没匹配的都按 keep_position 处理
      outcome = mg.outcomes.keep_position_fallback || mg.outcomes.keep_position;
      outcomeKey = "keep_position";
    }

    const delta = applyEffect(outcome.effect);
    State.history.push({ age: State.age, text: outcome.log });
    renderStats(delta);
    renderLog();

    // 标题
    const titleByOutcome = {
      pass: "✅ 评审通过",
      keep_position: "⚠️ 评审未通过 · 留原位置",
      keep_position_fallback: "⚠️ 评审未通过 · 留原位置",
      fired: "❌ 评审失败 · 被裁"
    };
    sceneTitle.textContent = titleByOutcome[outcomeKey] || "评审结果";
    pushStory({ title: titleByOutcome[outcomeKey] || "评审结果", scene: outcome.log });

    const scoresHtml = mg.judges.map(j => `
      <div class="judge-score">${j.emoji} ${j.label}: <span class="${judgeTotals[j.id] >= 0 ? 'pos' : 'neg'}">${judgeTotals[j.id] > 0 ? "+" : ""}${judgeTotals[j.id]}</span></div>
    `).join("");
    sceneText.textContent = outcome.log + `\n\n[评委评分总和: ${total}]`;

    el.innerHTML = `
      <div class="review-result">
        <div class="judge-scores">${scoresHtml}</div>
      </div>
      <button class="choice big-cta" id="review-next-btn">继续 →</button>
    `;

    // 处理后果
    if (outcomeKey === "pass" && outcome.upgradeTo) {
      State.title = outcome.upgradeTo;
      State.flags.add(`${outcome.upgradeTo}_passed`);
      State.shownTitleEvents.add(outcome.upgradeTo);
    } else if (outcomeKey === "keep_position" || outcomeKey === "keep_position_fallback") {
      State.flags.add(`${mg.targetTitle}_review_failed`);
    } else if (outcomeKey === "fired") {
      State.flags.add(`${mg.targetTitle}_review_fired`);
    }

    document.getElementById("review-next-btn").onclick = () => {
      if (outcomeKey === "fired") {
        renderUnemploymentChain(() => advanceFromMinigame());
      } else if (
        (outcomeKey === "keep_position" || outcomeKey === "keep_position_fallback") &&
        outcome.followupChain && outcome.followupChain.length > 0
      ) {
        // 评审失败 + 有后续链,跑链式后续(同事挪位、关系疏远、再战或跳板)
        renderChainEvent(outcome.followupChain, () => advanceFromMinigame());
      } else {
        advanceFromMinigame();
      }
    };
  }
}

// 失业链:被裁后投简历 → 一无所获 → 小厂给不起这个钱 → 最终接受降薪
function renderUnemploymentChain(onDone) {
  const sceneTitle = document.getElementById("scene-title");
  const sceneText = document.getElementById("scene-text");
  const el = document.getElementById("choices");

  // 步骤 1: 失业期开始
  function step1() {
    State.age++; // 失业半年,年龄走半步算 1
    applyEffect({ money: -30, health: -10, fame: -5 });
    renderStats();

    sceneTitle.textContent = "📭 失业第 3 个月";
    sceneText.textContent = `你以为 P7 + 5 年大厂背景,一个月就能找到下家。\n\n你投了 47 份简历,回复 5 家。\n面试 3 家,2 家说"考虑下",1 家直接说:"你这背景我们 hold 不住"。\n\n猎头李哥 9 个月没主动联系你了。你周末把他备注改成了"已删"。\n\n房贷 38000/月。你卖了一辆车。`;
    el.innerHTML = `<button class="choice big-cta" id="unemp-next">看小厂的 Offer →</button>`;
    document.getElementById("unemp-next").onclick = step2;
  }

  // 步骤 2: 小厂给不起钱
  function step2() {
    sceneTitle.textContent = "📞 终于有家小厂给 Offer";
    sceneText.textContent = `一家 50 人的 SaaS 创业公司联系你。
CTO 是你 25 岁时教过的实习生,这世界真小。
他直说:"哥,你这背景我真的爱,但我们只能给到 base 25k。"
你之前是 45k。
你算了下,这个数加上失业期的存款消耗,2 年内你还得卖第二辆车。

[选项]`;

    el.innerHTML = `
      <button class="choice" id="unemp-a">接受小厂 Offer(降薪 44%)
        <span class="hint">存款 +15 健康 +5 声誉 -8 · 继续干</span>
      </button>
      <button class="choice" id="unemp-b">继续等大厂机会(失业再 6 个月)
        <span class="hint">存款 -25 健康 -15 声誉 -10 · 高风险</span>
      </button>
      <button class="choice" id="unemp-c">认清现实,自己做点小生意
        <span class="hint">存款 -10 健康 +8 · 转行</span>
      </button>
    `;

    document.getElementById("unemp-a").onclick = () => {
      applyEffect({ money: 15, health: 5, fame: -8 });
      const newCo = changeCompany("评审失败被裁后,降薪 44% 进入小厂");
      renderStats();
      sceneText.textContent = `你接受了。\n\n两周后你入职 ${newCo}。\nCTO 给你介绍团队那天,你笑得很职业。\n回家路上,你在车里坐了 20 分钟没下车。`;
      el.innerHTML = `<button class="choice big-cta" id="end-unemp">入职 ${newCo} →</button>`;
      document.getElementById("end-unemp").onclick = onDone;
    };
    document.getElementById("unemp-b").onclick = () => {
      applyEffect({ money: -25, health: -15, fame: -10 });
      State.flags.add("long_unemployment");
      State.age++;
      renderStats();
      sceneText.textContent = `又过了 6 个月。\n你投了 80+ 简历,2 家电话面,0 家终面。\n你 39 岁了。这一行的现实是:没人想要 38+ 的非首席。\n\n你最后还是接了一家中厂的资深岗,base 25k,比小厂还低,但有五险一金。`;
      const newCo = changeCompany("长期失业后,接受中厂资深岗");
      renderStats();
      el.innerHTML = `<button class="choice big-cta" id="end-unemp">入职 ${newCo} →</button>`;
      document.getElementById("end-unemp").onclick = onDone;
    };
    document.getElementById("unemp-c").onclick = () => {
      applyEffect({ money: -10, health: 8 });
      State.flags.add("to_minsu");
      State.currentCo = "自由职业 · 老家";
      State.companyHistory.push({ co: State.currentCo, startAge: State.age, reason: "评审失败后离开行业" });
      renderStats();
      sceneText.textContent = `你和媳妇商量了 3 个晚上,决定回老家。\n你开了家小店 —— 修电脑、装系统、装监控、跑跑外包。\n你 38 岁,这一行你 16 年的积累用上了 30%。\n但你睡眠回来了。`;
      el.innerHTML = `<button class="choice big-cta" id="end-unemp">开始新生活 →</button>`;
      document.getElementById("end-unemp").onclick = onDone;
    };
  }

  step1();
}

// ---------------- Offer 谈判 ----------------
function renderOfferNegotiation(mg) {
  const el = document.getElementById("choices");
  const sceneText = document.getElementById("scene-text");

  // 根据玩家选择的目标公司,决定走哪条线
  const targetKey = State.flags.has("target_bigtech") ? "target_bigtech" : "target_smallco";
  const company = mg.companies[targetKey];
  const reactions = mg.reactions[targetKey];
  const settleRules = mg.settle[targetKey];

  // 谈判状态
  const offer = {
    base: company.baseStart,
    signon: company.signonStart,
    equity: company.equityStart,
    mood: 0
  };
  let round = 1;
  const maxRound = 3;
  const usedCards = new Set();
  const history = []; // {round, card, line, delta}

  // 初始 opener
  history.push({ round: 0, card: null, line: `${company.flavorPrefix}:"${company.opener}"`, isOpener: true });

  function render() {
    document.getElementById("scene-title").textContent = `Offer 谈判 · ${company.name} · 第 ${Math.min(round, maxRound)}/${maxRound} 轮`;

    // 当前 offer 实时显示
    const offerHtml = `
      <div class="offer-board">
        <div class="offer-item"><span class="ol-label">Base</span><span class="ol-val">${offer.base}k</span></div>
        <div class="offer-item"><span class="ol-label">签字费</span><span class="ol-val">${offer.signon} 万</span></div>
        ${targetKey === "target_smallco" ? `<div class="offer-item"><span class="ol-label">期权</span><span class="ol-val">${offer.equity} 万股</span></div>` : ""}
        <div class="offer-item"><span class="ol-label">HR 心情</span><span class="ol-val mood mood-${offer.mood}">${moodIcon(offer.mood)}</span></div>
        <div class="offer-item"><span class="ol-label">职级</span><span class="ol-val">${company.level}</span></div>
      </div>
    `;

    // 对话历史
    const dialogHtml = history.map(h => {
      if (h.isOpener) return `<div class="neg-line hr">${h.line}</div>`;
      const cardLine = `<div class="neg-line you">第 ${h.round} 轮 · 你打出:<strong>${h.cardLabel}</strong></div>`;
      const hrLine = `<div class="neg-line hr">${company.flavorPrefix}:"${h.line}"</div>`;
      const deltaLine = h.delta ? `<div class="neg-delta">${formatDelta(h.delta)}</div>` : "";
      return cardLine + hrLine + deltaLine;
    }).join("");

    // 卡牌
    let cardsHtml = "";
    if (round <= maxRound && offer.mood > -2) {
      cardsHtml = `
        <div class="neg-cards-title">你的手牌(剩 ${maxRound - round + 1} 轮)</div>
        <div class="neg-cards">
          ${mg.cards.map(c => {
            const used = usedCards.has(c.id);
            return `
              <div class="neg-card ${used ? 'used' : ''}" data-id="${c.id}">
                <div class="nc-label">${c.label}</div>
                <div class="nc-desc">${c.desc}</div>
                <div class="nc-hint">${c.hint}</div>
              </div>
            `;
          }).join("")}
        </div>
      `;
    }

    el.innerHTML = `
      <div class="minigame neg-board">
        ${offerHtml}
        <div class="neg-dialog">${dialogHtml}</div>
        ${cardsHtml}
      </div>
    `;

    el.querySelectorAll(".neg-card:not(.used)").forEach(node => {
      node.onclick = () => playCard(node.dataset.id);
    });

    // 如果回合结束或 HR 撤回 offer,直接结算
    if (round > maxRound || offer.mood <= -2) {
      setTimeout(() => settle(), 500);
    }
  }

  function playCard(cardId) {
    const card = mg.cards.find(c => c.id === cardId);
    const roundKey = `round${round}`;
    const r = reactions[cardId][roundKey];
    if (!r) return;

    offer.base += r.base;
    offer.signon += r.signon;
    offer.equity += r.equity;
    offer.mood += r.mood;
    offer.mood = Math.max(-2, Math.min(2, offer.mood));

    history.push({
      round: round,
      cardLabel: card.label,
      line: r.line,
      delta: { base: r.base, signon: r.signon, equity: r.equity, mood: r.mood }
    });

    usedCards.add(cardId);
    round++;
    render();
  }

  function settle() {
    let outcome;
    let tierKey;
    for (const tier of ["excellent", "good", "ok", "bad"]) {
      const rule = settleRules[tier];
      if (rule.condition(offer)) { outcome = rule; tierKey = tier; break; }
    }
    if (!outcome) { outcome = settleRules.bad; tierKey = "bad"; }

    const line = outcome.line
      .replace("{base}", offer.base)
      .replace("{signon}", offer.signon)
      .replace("{equity}", offer.equity);

    const delta = applyEffect(outcome.effect);
    (outcome.flags || []).forEach(f => State.flags.add(f));
    State.history.push({ age: State.age, text: line });
    renderStats(delta);
    renderLog();

    const isBad = tierKey === "bad";
    const offerSummary = isBad
      ? ""
      : `\n\n[最终 Offer: base ${offer.base}k · 签字 ${offer.signon} 万${targetKey === "target_smallco" ? ` · 期权 ${offer.equity} 万股` : ""}]`;

    const negTitle = isBad ? "跳槽失败" : "谈判结果";
    document.getElementById("scene-title").textContent = negTitle;
    sceneText.textContent = line + offerSummary;
    pushStory({ title: negTitle, scene: line + offerSummary });
    el.innerHTML = `<button class="choice" id="next-btn">${outcome.nextButton || "继续 →"}</button>`;
    document.getElementById("next-btn").onclick = () => advanceFromMinigame();
  }

  render();
}

function moodIcon(m) {
  if (m >= 2) return "😄 很满意";
  if (m === 1) return "🙂 略好";
  if (m === 0) return "😐 中性";
  if (m === -1) return "😒 不爽";
  return "😡 要撤";
}

function formatDelta(d) {
  const parts = [];
  if (d.base) parts.push(`Base ${d.base > 0 ? "+" : ""}${d.base}k`);
  if (d.signon) parts.push(`签字 ${d.signon > 0 ? "+" : ""}${d.signon}万`);
  if (d.equity) parts.push(`期权 ${d.equity > 0 ? "+" : ""}${d.equity}万股`);
  if (d.mood) parts.push(`心情 ${d.mood > 0 ? "+" : ""}${d.mood}`);
  return parts.length ? "→ " + parts.join("  ") : "";
}

function renderBugHunt(mg) {
  const el = document.getElementById("choices");
  const sceneText = document.getElementById("scene-text");
  sceneText.textContent = mg.intro;

  // 三阶段评分
  const score = { phase1: 0, phase2: 0, phase3: 0 };

  // ============ 阶段一: 在日志里点击 NPE ============
  function renderPhase1() {
    document.getElementById("scene-title").textContent = "阶段 1/3 · 看日志";
    sceneText.textContent = mg.phase1.hint;

    const logHtml = mg.phase1.logLines.map((line, i) => {
      const isBug = line.includes(mg.phase1.correctMatch);
      return `<div class="log-line ${isBug ? 'bug-candidate' : ''}" data-i="${i}" data-bug="${isBug}">${escapeHtml(line)}</div>`;
    }).join("");

    el.innerHTML = `
      <div class="minigame terminal">
        <div class="term-header">
          <span class="term-title">📜 payment-service.log · 实时滚动</span>
          <span class="term-meta">点击你认为有问题的那一行</span>
        </div>
        <div class="term-body" id="term-body">${logHtml}</div>
      </div>
    `;

    let triedWrong = 0;
    el.querySelectorAll(".log-line").forEach(node => {
      node.onclick = () => {
        if (node.dataset.bug === "true") {
          // 命中
          node.classList.add("bug-found");
          score.phase1 = triedWrong === 0 ? 2 : 1; // 一次命中满分,试过才中半分
          setTimeout(() => phase1Found(), 600);
        } else {
          triedWrong++;
          node.classList.add("wrong-pick");
          setTimeout(() => node.classList.remove("wrong-pick"), 600);
        }
      };
    });
  }

  function phase1Found() {
    sceneText.textContent = mg.phase1.onFound.text;
    el.innerHTML = `<button class="choice" id="next-phase">${mg.phase1.onFound.proceed} →</button>`;
    document.getElementById("next-phase").onclick = renderPhase2;
  }

  // ============ 阶段二: 看 PR diff 追责 ============
  function renderPhase2() {
    document.getElementById("scene-title").textContent = "阶段 2/3 · 看 PR diff,找出谁的锅";
    sceneText.textContent = mg.phase2.hint;

    const openedPrs = new Set(); // 已看过 diff 的 PR
    let viewingPr = null;        // 当前打开的 PR
    let triedWrongPr = 0;

    function renderList() {
      const allViewed = mg.phase2.prs.every(p => openedPrs.has(p.id));

      const listHtml = mg.phase2.prs.map(pr => {
        const viewed = openedPrs.has(pr.id);
        const isOpen = viewingPr === pr.id;
        return `
          <div class="pr-card ${isOpen ? 'open' : ''} ${viewed ? 'viewed' : ''}">
            <div class="pr-card-head">
              <div>
                <div class="pr-title">${pr.title}${viewed ? ' <span class="pr-tick">✓ 已看</span>' : ''}</div>
                <div class="pr-meta">@${pr.author} · ${pr.time}</div>
              </div>
              <div class="pr-actions-inline">
                <button class="pr-view" data-action="view" data-id="${pr.id}">${isOpen ? '收起' : '👁 看 diff'}</button>
                <button class="pr-accuse ${viewed ? '' : 'locked'}" data-action="accuse" data-id="${pr.id}" ${viewed ? '' : 'disabled'}>
                  ⚖️ 就是这个 PR
                </button>
              </div>
            </div>
            ${isOpen ? renderDiff(pr) : ''}
          </div>
        `;
      }).join("");

      const banner = allViewed
        ? `<div class="phase2-banner ready">✅ 所有 PR 都看完了。现在点你认定的凶手 PR 上的"就是这个 PR"按钮。</div>`
        : `<div class="phase2-banner">👇 点开每个 PR 的"看 diff",看完后再点"就是这个 PR"指认凶手。(已看 ${openedPrs.size}/${mg.phase2.prs.length})</div>`;

      el.innerHTML = `
        <div class="minigame">
          ${banner}
          <div class="pr-list">${listHtml}</div>
        </div>
      `;

      el.querySelectorAll('[data-action="view"]').forEach(b => {
        b.onclick = () => {
          const id = b.dataset.id;
          viewingPr = viewingPr === id ? null : id;
          if (viewingPr) openedPrs.add(viewingPr);
          renderList();
        };
      });

      el.querySelectorAll('[data-action="accuse"]:not([disabled])').forEach(b => {
        b.onclick = () => {
          const pr = mg.phase2.prs.find(p => p.id === b.dataset.id);
          if (pr.isCulprit) {
            score.phase2 = triedWrongPr === 0 ? 2 : 1;
            sceneText.textContent = "✅ " + pr.why + "\n\n你在群里发:\"定位到 #4521,优惠券 null 判断被删,我让张伟来回滚。\" TL 回了个 👍。";
            el.innerHTML = `<button class="choice" id="next-phase">继续 · 写复盘 →</button>`;
            document.getElementById("next-phase").onclick = renderPhase3;
          } else {
            triedWrongPr++;
            b.classList.add("wrong-accuse");
            sceneText.textContent = "❌ " + pr.why + "\n\n再看看其他 PR。";
            setTimeout(() => { b.classList.remove("wrong-accuse"); renderList(); }, 1200);
          }
        };
      });
    }

    function renderDiff(pr) {
      const diffHtml = pr.diff.map(line => {
        const cls = line.type === "add" ? "diff-add" : line.type === "del" ? "diff-del" : "diff-ctx";
        const prefix = line.type === "add" ? "+" : line.type === "del" ? "-" : " ";
        return `<div class="diff-line ${cls}">${prefix} ${escapeHtml(line.text)}</div>`;
      }).join("");
      return `
        <div class="diff-view">
          <div class="diff-header">📄 ${pr.title} · @${pr.author}</div>
          ${diffHtml}
        </div>
      `;
    }

    renderList();
  }

  // ============ 阶段三: 复盘三档话术 ============
  function renderPhase3() {
    document.getElementById("scene-title").textContent = "阶段 3/3 · 写复盘到事故群";
    sceneText.textContent = mg.phase3.hint;

    const tierScore = { junior: 1, senior: 2, expert: 3 };
    const tierLabel = { junior: "新人", senior: "高级", expert: "专家" };
    const picks = {}; // dimensionName -> tier

    function render() {
      const dimsHtml = mg.phase3.dimensions.map(dim => {
        const optsHtml = dim.options.map(opt => {
          const picked = picks[dim.name] === opt.tier ? "picked" : "";
          return `
            <div class="pm-option ${picked}" data-dim="${dim.name}" data-tier="${opt.tier}">
              <div class="pm-option-text">${escapeHtml(opt.text)}</div>
            </div>
          `;
        }).join("");
        return `
          <div class="pm-dim">
            <div class="pm-dim-title">${dim.name}</div>
            ${optsHtml}
          </div>
        `;
      }).join("");

      const allPicked = mg.phase3.dimensions.every(d => picks[d.name]);
      const totalPreview = Object.values(picks).reduce((s, t) => s + tierScore[t], 0);

      el.innerHTML = `
        <div class="minigame pm-board">
          ${dimsHtml}
          <div class="pm-summary">
            ${mg.phase3.dimensions.map(d => {
              const t = picks[d.name];
              return `<span class="pm-chip ${t || 'empty'}">${d.name}: ${t ? tierLabel[t] : '—'}</span>`;
            }).join("")}
            <div class="pm-score">当前得分: ${totalPreview} / 12</div>
          </div>
          <button class="choice" id="pm-submit" ${allPicked ? "" : "disabled"}>
            ${allPicked ? "发送复盘到群 →" : "请把 4 个维度都选完"}
          </button>
        </div>
      `;

      el.querySelectorAll(".pm-option").forEach(node => {
        node.onclick = () => {
          picks[node.dataset.dim] = node.dataset.tier;
          render();
        };
      });

      const submit = document.getElementById("pm-submit");
      if (submit && allPicked) {
        submit.onclick = () => {
          const total = Object.values(picks).reduce((s, t) => s + tierScore[t], 0);
          // 总分 4..12 映射到 0..2
          if (total >= 10) score.phase3 = 2;
          else if (total >= 7) score.phase3 = 1;
          else score.phase3 = 0;
          // 把档次信息也带去结算,让文案更精准
          settle(picks, total);
        };
      }
    }

    render();
  }

  // ============ 结算 ============
  function settle(picks, pmTotal) {
    const total = score.phase1 + score.phase2 + score.phase3; // 0..6
    let outcome;
    if (total >= 5) outcome = mg.outcomes.perfect;
    else if (total >= 3) outcome = mg.outcomes.ok;
    else outcome = mg.outcomes.bad;

    // 根据复盘话术分布生成额外评论
    let pmComment = "";
    if (picks) {
      const tiers = Object.values(picks);
      const expertCount = tiers.filter(t => t === "expert").length;
      const juniorCount = tiers.filter(t => t === "junior").length;
      if (expertCount >= 3) {
        pmComment = "\n\n💬 TL 在群里回:\"这复盘写得比我都到位。下周技术分享你来讲这个 case。\"";
      } else if (expertCount >= 1 && juniorCount === 0) {
        pmComment = "\n\n💬 TL 回:\"👍 思路清楚,挺好。\"";
      } else if (juniorCount >= 3) {
        pmComment = "\n\n💬 TL 私聊你:\"复盘要再深入点,不是把现象描述一遍就行。明天我教你怎么写。\"";
      } else {
        pmComment = "\n\n💬 TL 回:\"嗯,知道了。\"";
      }
    }

    const delta = applyEffect(outcome.effect);
    State.history.push({ age: State.age, text: outcome.log });
    renderStats(delta);
    renderLog();
    document.getElementById("scene-title").textContent = "事故结算";
    const bugScene = outcome.log + pmComment
      + `\n\n[评分: 找Bug ${score.phase1}/2 · 追责 ${score.phase2}/2 · 复盘 ${score.phase3}/2${pmTotal ? ` (话术 ${pmTotal}/12)` : ""}]`;
    sceneText.textContent = bugScene;
    pushStory({ title: "事故结算", scene: bugScene });
    el.innerHTML = `<button class="choice" id="next-btn">继续 →</button>`;
    document.getElementById("next-btn").onclick = () => advanceFromMinigame();
  }

  renderPhase1();
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderTechChoice(mg) {
  const el = document.getElementById("choices");
  el.innerHTML = `
    <div class="minigame">
      <strong>${mg.title}</strong>
      <p style="margin: 8px 0; font-size: 13px;">${mg.intro}</p>
    </div>
  ` + mg.options.map((opt, i) => `
    <button class="choice" data-i="${i}">${opt.text}</button>
  `).join("");

  el.querySelectorAll(".choice").forEach(btn => {
    btn.onclick = () => {
      const i = parseInt(btn.dataset.i, 10);
      const opt = mg.options[i];
      const delta = applyEffect(opt.effect);
      State.history.push({ age: State.age, text: opt.result });
      renderStats(delta);
      renderLog();
      document.getElementById("scene-text").textContent = opt.result;
      pushStory({ title: mg.title, scene: opt.result, choice: opt.text });
      el.innerHTML = `<button class="choice" id="next-btn">继续 →</button>`;
      document.getElementById("next-btn").onclick = () => advanceFromMinigame();
    };
  });
}

function renderInterviewBack(mg) {
  const el = document.getElementById("choices");
  let qIdx = 0;
  let honesty = 0;
  let hireSum = 0;

  function renderQ() {
    if (qIdx >= mg.questions.length) return settle();
    const q = mg.questions[qIdx];
    document.getElementById("scene-text").textContent = `候选人:"${q.q}"`;
    el.innerHTML = `
      <div class="minigame">
        <strong>${mg.title}</strong>
        <p style="margin: 8px 0; font-size: 13px;">第 ${qIdx + 1} / ${mg.questions.length} 个问题</p>
      </div>
    ` + q.options.map((o, i) => `
      <button class="choice" data-i="${i}">${o.text}</button>
    `).join("");
    el.querySelectorAll(".choice").forEach(btn => {
      btn.onclick = () => {
        const i = parseInt(btn.dataset.i, 10);
        const opt = q.options[i];
        honesty += opt.honesty;
        hireSum += opt.hireChance;
        State.history.push({ age: State.age, text: `回答: ${opt.text}` });
        qIdx++;
        renderQ();
      };
    });
  }

  function settle() {
    const avgHire = hireSum / mg.questions.length;
    const willCome = Math.random() < avgHire;
    const effect = { fame: honesty, comm: 2 };
    if (willCome) effect.network = 5;
    else effect.network = -2;
    const delta = applyEffect(effect);
    const summary = willCome
      ? `候选人三天后回复:愿意来。你给团队捞到一个好苗子。诚实度 ${honesty >= 0 ? "+" : ""}${honesty}。`
      : `候选人婉拒了。可能是你说太多实话,或者太少。诚实度 ${honesty >= 0 ? "+" : ""}${honesty}。`;
    State.history.push({ age: State.age, text: summary });
    renderStats(delta);
    renderLog();
    document.getElementById("scene-text").textContent = summary;
    pushStory({ title: mg.title, scene: summary });
    el.innerHTML = `<button class="choice" id="next-btn">继续 →</button>`;
    document.getElementById("next-btn").onclick = () => advanceFromMinigame();
  }

  renderQ();
}

// ---------------- 结局判定 ----------------
// ENDINGS 和 determineEnding 由 data/endings.js 提供

// 通用 special endings
const SPECIAL_ENDINGS = {
  sudden_death: {
    title: "猝死",
    text: "你倒在工位上。同事们发了讣告,公司发了 50 万抚恤金。第二周,你的工位被新人接手,系统里你的账号被注销。"
  }
};

function showSpecialEnding(id) {
  const e = SPECIAL_ENDINGS[id];
  if (!e) return;
  renderEnding(e);
}

function showEnding() {
  const id = determineEnding(State.lineId, State.flags, State.stats);
  const e = ENDINGS[id];
  if (!e) {
    renderEnding({ title: "退休", text: "你退休了。" });
    return;
  }
  renderEnding(e);
}

function renderEnding(e) {
  checkpoint("ending");
  const stage = document.querySelector(".stage");
  stage.innerHTML = `
    <div class="ending">
      <h2>结局:${fillCo(e.title)}</h2>
      <p style="margin: 20px 0; line-height: 1.9;">${fillCo(e.text)}</p>
      <hr style="margin: 24px 0; border: none; border-top: 1px dashed #d8d2c4;" />
      <div class="summary">
        ${STAT_DEFS.map(s => `${s.icon} ${s.label}: ${State.stats[s.key]}`).join(" &nbsp; ")}
      </div>
      <div class="ending-actions">
        <button class="choice big-cta" id="share-img-btn" style="max-width:280px;">📷 生成人生长图</button>
      </div>
    </div>
  `;
  document.getElementById("start-btn").style.display = "none";
  document.getElementById("reset-btn").style.display = "inline-block";
  const shareBtn = document.getElementById("share-img-btn");
  if (shareBtn) shareBtn.onclick = () => openShareOverlay({ isEnding: true, title: e.title, text: e.text });
}

// ---------------- 人生轨迹分享长图 ----------------
// 用 canvas 把当前进度(结局或进行中)+ 属性 + 职业履历 + 人生轨迹绘制成一张竖向长图
// head: { isEnding, title, text } —— isEnding=false 时为"人生进行中"分享
function generateLifeImage(head) {
  const DPR = 2;
  const W = 520;
  const PAD = 28;
  const CW = W - PAD * 2;
  const COL = { bg: "#fffdf7", ink: "#2a2a2a", sub: "#555", faint: "#888", accent: "#c97b3e", line: "#e2dccd" };
  const F = {
    brand: "700 15px -apple-system,'PingFang SC','Microsoft YaHei',sans-serif",
    h1:    "700 26px -apple-system,'PingFang SC','Microsoft YaHei',sans-serif",
    label: "700 14px -apple-system,'PingFang SC','Microsoft YaHei',sans-serif",
    body:  "15px -apple-system,'PingFang SC','Microsoft YaHei',sans-serif",
    small: "13px -apple-system,'PingFang SC','Microsoft YaHei',sans-serif",
    foot:  "12px -apple-system,'PingFang SC','Microsoft YaHei',sans-serif"
  };

  const meas = document.createElement("canvas").getContext("2d");
  function wrap(ctx, text, font, maxW) {
    ctx.font = font;
    const lines = [];
    let cur = "";
    for (const ch of String(text)) {
      if (ch === "\n") { lines.push(cur); cur = ""; continue; }
      if (cur && ctx.measureText(cur + ch).width > maxW) { lines.push(cur); cur = ch; }
      else cur += ch;
    }
    lines.push(cur);
    return lines.length ? lines : [""];
  }

  // 单次绘制流程:ctx 为空(测量)或真实 ctx。返回内容总高度(逻辑 px)。
  function paint(ctx, draw) {
    let y = PAD;
    const hr = (gap) => {
      y += gap;
      if (draw) {
        ctx.strokeStyle = COL.line;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(PAD, y + 0.5);
        ctx.lineTo(W - PAD, y + 0.5);
        ctx.stroke();
      }
      y += gap;
    };
    const text = (str, font, color, lh, align) => {
      const lines = wrap(meas, str, font, CW);
      for (const ln of lines) {
        if (draw) {
          ctx.font = font;
          ctx.fillStyle = color;
          ctx.textAlign = align || "left";
          const x = align === "center" ? W / 2 : PAD;
          ctx.fillText(ln, x, y + lh * 0.72);
        }
        y += lh;
      }
    };

    // 品牌头
    text("🧑‍💻 程序员人生 · 人生轨迹", F.brand, COL.accent, 22, "center");
    y += 6;
    if (head.isEnding) {
      // 结局大标题 + 文案
      text("结局 · " + fillCo(head.title), F.h1, COL.ink, 34, "center");
      y += 4;
      text(fillCo(head.text), F.body, COL.sub, 24);
    } else {
      // 进行中:年龄 · 职级 · 当前公司
      text("人生进行中", F.h1, COL.ink, 34, "center");
      y += 4;
      const co = State.currentCo ? " · " + fillCo(State.currentCo) : "";
      const tl = (typeof titleLabel === "function") ? titleLabel(State.title) : "";
      text(`${State.age}岁 · ${tl}${co}`, F.body, COL.sub, 24, "center");
    }
    hr(14);

    // 最终属性
    text("最终属性", F.label, COL.accent, 22);
    y += 4;
    for (const s of STAT_DEFS) {
      text(`${s.icon} ${s.label}    ${State.stats[s.key]}`, F.small, COL.ink, 22);
    }
    hr(14);

    // 职业履历
    text("职业履历", F.label, COL.accent, 22);
    y += 4;
    const co = State.companyHistory || [];
    if (co.length === 0) {
      text("—", F.small, COL.faint, 22);
    }
    co.forEach((c, i) => {
      const end = c.endAge || State.age;
      text(`${c.startAge}-${end}岁  ${fillCo(c.co)}`, F.small, COL.ink, 21);
      if (c.reason) text(`　${fillCo(c.reason)}`, F.foot, COL.faint, 19);
      if (i < co.length - 1) y += 2;
    });
    hr(14);

    // 人生故事(完整叙事,按章节分组 + 步骤卡片)
    const story = State.story || [];
    if (story.length === 0) {
      // 降级:旧存档或未走完第一步,回退到 history 摘要
      text(`人生轨迹（22-${State.age} 岁）`, F.label, COL.accent, 22);
      y += 4;
      const hist = State.history || [];
      if (hist.length === 0) text("—", F.small, COL.faint, 22);
      hist.forEach(h => {
        text(`${h.age}岁 ｜ ${fillCo(h.text)}`, F.small, COL.sub, 22);
        y += 3;
      });
    } else {
      text(`人生故事（22-${State.age} 岁）`, F.label, COL.accent, 22);
      y += 6;

      // 圆角矩形辅助(两遍都调,fill 仅绘制遍)
      const roundRect = (x, y2, w, h, r) => {
        if (!draw) return;
        const rr = Math.min(r, h / 2, w / 2);
        ctx.beginPath();
        ctx.moveTo(x + rr, y2);
        ctx.arcTo(x + w, y2, x + w, y2 + h, rr);
        ctx.arcTo(x + w, y2 + h, x, y2 + h, rr);
        ctx.arcTo(x, y2 + h, x, y2, rr);
        ctx.arcTo(x, y2, x + w, y2, rr);
        ctx.closePath();
        ctx.fillStyle = "#f5f1e8";
        ctx.fill();
      };
      // 估算一段文本在卡片内宽下的行数
      const lineCount = (str, font) => str ? wrap(meas, str, font, CW - 24).length : 0;

      // 按 chapterNo 分组(story 已按时间追加,同章连续)
      let curNo = null;
      story.forEach((e, i) => {
        if (e.chapterNo !== curNo) {
          curNo = e.chapterNo;
          // 章节标题条
          if (i > 0) y += 6;
          const ageRange = (() => {
            const sameCh = story.filter(s => s.chapterNo === e.chapterNo);
            const a0 = sameCh[0].age, a1 = sameCh[sameCh.length - 1].age;
            return a0 === a1 ? `${a0}岁` : `${a0}-${a1}岁`;
          })();
          text(`第 ${e.chapterNo || "?"} 章 · ${e.chapterTitle || ""} (${ageRange})`, F.label, COL.accent, 22);
          y += 3;
        }

        // 卡片:先量内部高度,再画背景,再画文本
        const cardX = PAD;
        const cardInnerW = CW - 24;   // 左右各 12 内边距
        // 用临时 meas 量各段行数
        const titleLines = lineCount(`${e.age}岁 · ${e.title}`, F.label);
        const sceneLines = e.scene ? wrap(meas, e.scene, F.body, cardInnerW).length : 0;
        const choiceLines = e.choice ? wrap(meas, "→ 你选了:" + e.choice, F.small, cardInnerW).length : 0;
        const fbLines = e.feedback ? wrap(meas, e.feedback, F.body, cardInnerW).length : 0;

        let innerH = 10; // 顶部内边距
        innerH += titleLines * 20;
        if (e.scene) { innerH += 4 + sceneLines * 22; }
        if (e.choice) { innerH += 4 + choiceLines * 19; }
        if (e.feedback) { innerH += 4 + fbLines * 22; }
        innerH += 10; // 底部内边距

        const cardY = y;
        roundRect(cardX, cardY, CW, innerH, 8);
        // 画卡片内容(相对 cardY 偏移)
        let cy = cardY + 10;
        const drawText = (str, font, color, lh) => {
          const lines = wrap(meas, str, font, cardInnerW);
          for (const ln of lines) {
            if (draw) {
              ctx.font = font;
              ctx.fillStyle = color;
              ctx.textAlign = "left";
              ctx.fillText(ln, cardX + 12, cy + lh * 0.72);
            }
            cy += lh;
          }
        };
        drawText(`${e.age}岁 · ${e.title}`, F.label, COL.ink, 20);
        if (e.scene) { cy += 4; drawText(e.scene, F.body, COL.sub, 22); }
        if (e.choice) { cy += 4; drawText("→ 你选了:" + e.choice, F.small, COL.accent, 19); }
        if (e.feedback) { cy += 4; drawText(e.feedback, F.body, COL.ink, 22); }
        y = cardY + innerH + 6; // 卡片间距
      });
    }

    hr(14);
    text("程序员人生模拟器 · littleponyma.github.io/programmer-life", F.foot, COL.faint, 20, "center");
    y += PAD;
    return y;
  }

  const H = paint(null, false);
  const canvas = document.createElement("canvas");
  canvas.width = W * DPR;
  // 高度上限保护:Chrome canvas 单边硬上限约 16384px,留余量到 14000
  const finalH = Math.min(Math.ceil(H) * DPR, 14000);
  canvas.height = finalH;
  if (Math.ceil(H) * DPR > 14000) {
    console.warn("人生长图过高,已截断到 14000px(原始", Math.ceil(H) * DPR, "px)");
  }
  const ctx = canvas.getContext("2d");
  ctx.scale(DPR, DPR);
  ctx.fillStyle = COL.bg;
  ctx.fillRect(0, 0, W, H);
  // 顶部装饰条
  ctx.fillStyle = COL.accent;
  ctx.fillRect(0, 0, W, 6);
  paint(ctx, true);
  return canvas;
}

// 弹出浮层展示长图(游戏进行中 / 结局 通用)
function openShareOverlay(head) {
  const existing = document.getElementById("share-overlay");
  if (existing) existing.remove();
  const overlay = document.createElement("div");
  overlay.id = "share-overlay";
  overlay.className = "share-overlay";
  overlay.innerHTML =
    `<div class="share-modal">
       <div class="share-modal-head">
         <span>${head.isEnding ? "人生长图 · 结局" : "人生长图 · 进行中"}</span>
         <button class="share-close" id="share-close-btn" aria-label="关闭">✕</button>
       </div>
       <div class="share-scroll"><p class="share-tip" style="text-align:center">正在生成长图…</p></div>
       <div class="share-actions" id="share-actions"></div>
     </div>`;
  document.body.appendChild(overlay);
  const close = () => overlay.remove();
  overlay.addEventListener("click", ev => { if (ev.target === overlay) close(); });
  document.getElementById("share-close-btn").onclick = close;

  setTimeout(() => {
    try {
      const canvas = generateLifeImage(head);
      const url = canvas.toDataURL("image/png");
      overlay.querySelector(".share-scroll").innerHTML = `<img src="${url}" alt="人生轨迹长图" />`;
      document.getElementById("share-actions").innerHTML =
        `<a class="share-dl" href="${url}" download="程序员人生.png">下载图片</a>` +
        `<span class="share-tip">手机长按图片可保存 / 分享</span>`;
    } catch (err) {
      overlay.querySelector(".share-scroll").innerHTML =
        '<p class="share-tip" style="text-align:center">生成失败:' + ((err && err.message) || err) + '</p>';
    }
  }, 30);
}

// ---------------- 入口 ----------------

function start() {
  document.getElementById("start-btn").style.display = "none";
  document.getElementById("reset-btn").style.display = "inline-block";
  document.getElementById("share-btn").style.display = "inline-block";
  State.started = true;
  renderOpening();
}

function reset() {
  clearProgress();
  State.started = false;
  State._resumePoint = null;
  State.age = 22;
  State.stats = { tech: 50, comm: 50, money: 0, health: 80, network: 30, fame: 10 };
  State.flags = new Set();
  State.history = [];
  State.story = [];
  State.lineId = "main";
  State.chapterId = null;
  State.eventIdx = 0;
  State.title = "junior";
  State.shownTitleEvents = new Set();
  State.startCo = null;
  State.currentCo = null;
  State.companyHistory = [];
  State.jobChanges = 0;
  State._triggeredExclusiveGroups = new Set();
  State._randomRolled = false;
  document.querySelector(".stage").innerHTML = `
    <div class="scene" id="scene">
      <h2 id="scene-title">程序员的一生</h2>
      <p id="scene-text">点击下方按钮,选择你想体验的人生。</p>
    </div>
    <div class="choices" id="choices"></div>
    <div class="log" id="log"></div>
  `;
  document.getElementById("reset-btn").style.display = "none";
  document.getElementById("share-btn").style.display = "none";
  document.getElementById("start-btn").style.display = "inline-block";
  renderStats();
}

// ---------------- 进度存档(localStorage) ----------------
// 采用"检查点"策略:在每个稳定渲染点保存 State 快照 + _resumePoint 标记,
// 刷新后据此重建画面。进行中的小游戏/随机事件会回到其所属事件的开头。
const SAVE_KEY = "programmer_life_save_v1";

function saveProgress() {
  try {
    const data = {
      v: 1,
      age: State.age,
      stats: State.stats,
      flags: [...State.flags],
      history: State.history,
      story: State.story,
      started: State.started,
      lineId: State.lineId,
      chapterId: State.chapterId,
      eventIdx: State.eventIdx,
      title: State.title,
      shownTitleEvents: [...(State.shownTitleEvents || [])],
      startCo: State.startCo,
      currentCo: State.currentCo,
      companyHistory: State.companyHistory,
      jobChanges: State.jobChanges,
      triggeredExclusiveGroups: [...(State._triggeredExclusiveGroups || [])],
      randomRolled: State._randomRolled,
      resumePoint: State._resumePoint || null
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (e) { /* localStorage 不可用则静默忽略 */ }
}

function clearProgress() {
  try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* ignore */ }
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

// 在稳定渲染点调用:记录当前恢复点并落盘
function checkpoint(point) {
  State._resumePoint = point;
  saveProgress();
}

function restoreState(d) {
  State.age = d.age;
  State.stats = d.stats;
  State.flags = new Set(d.flags || []);
  State.history = d.history || [];
  State.story = d.story || [];
  State.started = d.started;
  State.lineId = d.lineId;
  State.chapterId = d.chapterId;
  State.eventIdx = d.eventIdx;
  State.title = d.title;
  State.shownTitleEvents = new Set(d.shownTitleEvents || []);
  State.startCo = d.startCo;
  State.currentCo = d.currentCo;
  State.companyHistory = d.companyHistory || [];
  State.jobChanges = d.jobChanges || 0;
  State._triggeredExclusiveGroups = new Set(d.triggeredExclusiveGroups || []);
  State._randomRolled = d.randomRolled || false;
  State._resumePoint = d.resumePoint || null;
}

function resumeGame(d) {
  restoreState(d);
  document.getElementById("start-btn").style.display = "none";
  document.getElementById("reset-btn").style.display = "inline-block";
  document.getElementById("share-btn").style.display = "inline-block";
  renderStats();
  switch (State._resumePoint) {
    case "opening": renderOpening(); break;
    case "offer": renderOfferPicker(); break;
    case "chapterCover": {
      const ch = getCurrentChapter();
      if (ch) renderChapterCover(ch); else playNextEvent();
      break;
    }
    case "event": playNextEvent(); break;
    case "summary": {
      const ch = getCurrentChapter();
      if (ch) renderChapterSummary(ch); else showEnding();
      break;
    }
    case "ending": showEnding(); break;
    default: renderOpening();
  }
}

// ---------------- 入口 ----------------

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("start-btn").onclick = start;
  document.getElementById("reset-btn").onclick = reset;
  document.getElementById("share-btn").onclick = () => openShareOverlay({ isEnding: false });
  const saved = loadProgress();
  if (saved && saved.started) {
    resumeGame(saved);
  } else {
    renderStats();
  }
});
