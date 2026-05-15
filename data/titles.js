// 职级系统
// 职级升级不再自动判定 —— 通过 ch2/ch3/ch4/ch7 的评审小游戏获得
// 这里只保留 TITLES 列表和显示辅助

// 真实国内大厂职级阶梯(对应 P5-P9):
//   初级(P5) → 中级(P6) → 高级(P7) → 资深(P7+/P8 临界) → 专家(P8) → 首席(P9)
const TITLES = [
  { id: "junior",      label: "初级工程师", short: "Jr." },
  { id: "mid",         label: "中级工程师", short: "Mid." },
  { id: "senior_plus", label: "高级工程师", short: "Sr+." },
  { id: "senior",      label: "资深工程师", short: "Sr." },
  { id: "expert",      label: "技术专家",   short: "Expert" },
  { id: "principal",   label: "首席工程师", short: "Principal" }
];

function titleLabel(id) {
  const t = TITLES.find(t => t.id === id);
  return t ? t.label : id;
}
