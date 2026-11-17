// 贈与税いくら？の問題を作る（ブラウザと node の両方で使う）。
// 中身は、国税庁タックスアンサー No.4408「贈与税の計算と税率（暦年課税）」の速算表2つ・特例贈与財産の条件・計算例に書いてあることだけ（［令和8年4月1日現在法令等］。2026-11-17 に読んだ。要点は共有フォルダ games/zoyozei-ikura-research.md）。
// 1問は、1年間にもらった額とだれからもらったかを読んで、贈与税の額を選ぶ。正解したら2段目「どちらの表？」を選ぶ。
// 答えはコードで速算表（TAB）から計算する（もらった額−基礎控除110万円＝基礎控除後の課税価格。それ×税率−控除額）。金額は種で決まる（同じ tag なら、どの端末でも同じ問題になる）。
// もらった額は10万円単位にする（端数の扱いは No.4408 に無いので出さない）。1年に1人からだけもらう場面にする（一般と特例が混ざる年は出さない）。
// 相続時精算課税・配偶者控除・住宅取得資金などの非課税・申告の手続きは扱わない（画面に書く）。
// 乱数 R は呼ぶ回数が毎回同じになるように使う（sort の比較の中では引かない）。
// KINDS の並びは最後に足すだけにする（並べ替え・削除をすると過去の日の問題が変わる）。
(function (root) {
  "use strict";
  const LV = ["やさしい", "ふつう", "むずかしい"];
  const AS_OF = "令和8年4月1日現在法令等";

  // 出典（画面の「なぜ」に出す）
  const SRC = {
    z: ["国税庁 タックスアンサー No.4408 贈与税の計算と税率（暦年課税）", "https://www.nta.go.jp/taxes/shiraberu/taxanswer/zoyo/4408.htm"],
  };
  const MEDIA = { z: "1年間にもらった財産" };

  // 速算表（No.4408）。[基礎控除後の課税価格がこの額以下, 税率（％）, 控除額]。金額は円。
  const MAN = 10000, KISO = 110 * MAN;
  const TAB = {
    ippan: [[200 * MAN, 10, 0], [300 * MAN, 15, 10 * MAN], [400 * MAN, 20, 25 * MAN], [600 * MAN, 30, 65 * MAN], [1000 * MAN, 40, 125 * MAN], [1500 * MAN, 45, 175 * MAN], [3000 * MAN, 50, 250 * MAN], [Infinity, 55, 400 * MAN]],
    tokurei: [[200 * MAN, 10, 0], [400 * MAN, 15, 10 * MAN], [600 * MAN, 20, 30 * MAN], [1000 * MAN, 30, 90 * MAN], [1500 * MAN, 40, 190 * MAN], [3000 * MAN, 45, 265 * MAN], [4500 * MAN, 50, 415 * MAN], [Infinity, 55, 640 * MAN]],
  };
  const rowOf = (t, kakaku) => TAB[t].findIndex((x) => kakaku <= x[0]);
  // 贈与税の額。もらった額が110万円以下なら0円。
  const taxOf = (t, gift) => { const k = gift - KISO; if (k <= 0) return 0; const [, r, d] = TAB[t][rowOf(t, k)]; return (k * r) / 100 - d; };

  // 2段目「どちらの表？」
  const GROUPS = {
    ippan: { name: "一般税率", sub: "一般贈与財産用の速算表", set: "all" },
    tokurei: { name: "特例税率", sub: "特例贈与財産用の速算表", set: "all" },
    nashi: { name: "かからない", sub: "基礎控除110万円以下", set: "all" },
  };
  const GRP_WHY = {
    ippan: "夫婦・兄弟・夫の父・友人などからの贈与や、1月1日に18歳未満の子への親からの贈与は、一般税率の表を使います。",
    tokurei: "父母や祖父母など直系尊属から、贈与の年の1月1日に18歳以上の子や孫がもらった財産は、特例税率の表を使います。",
    nashi: "1年間（1月1日から12月31日）にもらった財産の合計が基礎控除の110万円以下なら、贈与税はかかりません。",
  };
  const GRP_KEYS = Object.keys(GROUPS);

  // 種類：[id, 難しさ, 表, 場面（＄ がもらった額）, 下限, 上限, 刻み, ヒント1]
  // 1年間にもらったのは、場面の1人からだけ。年れいは、もらった年の1月1日のもの。
  const D = [
    ["i_fufu", 0, "ippan", "妻が、1年間に夫から現金＄をもらった。", 130 * MAN, 300 * MAN, 10 * MAN, "夫から妻は、親から子でない。どちらの表？"],
    ["t_oya", 0, "tokurei", "25歳の子が、1年間に父から現金＄をもらった。", 130 * MAN, 300 * MAN, 10 * MAN, "父から、1月1日に18歳以上の子。どちらの表？"],
    ["n_oya", 0, "tokurei", "30歳の子が、1年間に母から現金＄をもらった。", 30 * MAN, 110 * MAN, 10 * MAN, "基礎控除は110万円。"],
    ["n_yujin", 0, "ippan", "会社員が、1年間に友人から現金＄をもらった。", 30 * MAN, 110 * MAN, 10 * MAN, "基礎控除は110万円。"],
    ["t_sofubo", 0, "tokurei", "28歳の孫が、1年間に祖母から現金＄をもらった。", 320 * MAN, 510 * MAN, 10 * MAN, "祖母から孫も直系尊属から。110万円を引いてから表を見る。"],
    ["i_ani", 0, "ippan", "弟が、1年間に兄から現金＄をもらった。", 320 * MAN, 410 * MAN, 10 * MAN, "兄から弟は直系尊属から？"],
    ["t_rei", 0, "tokurei", "国税庁の計算例。20歳の子が、1年間に親から現金＄をもらった。", 500 * MAN, 500 * MAN, 1, "390万円は、特例税率のどの段？"],
    ["i_rei", 0, "ippan", "国税庁の計算例。妻が、1年間に夫から現金＄をもらった。", 500 * MAN, 500 * MAN, 1, "390万円は、一般税率のどの段？"],
    ["t_haha", 0, "tokurei", "35歳の子が、1年間に母から現金＄をもらった。", 150 * MAN, 300 * MAN, 10 * MAN, "110万円を引いた額×10％。"],
    ["i_oba", 0, "ippan", "めいが、1年間におばから現金＄をもらった。", 150 * MAN, 300 * MAN, 10 * MAN, "おばは直系尊属でない。110万円を引いた額×10％。"],
    ["t_mid", 1, "tokurei", "40歳の子が、1年間に父から現金＄をもらった。", 520 * MAN, 1100 * MAN, 10 * MAN, "110万円を引いて、特例税率の表で。"],
    ["i_mid", 1, "ippan", "妻が、1年間に夫から現金＄をもらった。", 520 * MAN, 1100 * MAN, 10 * MAN, "110万円を引いて、一般税率の表で。"],
    ["i_otto_chichi", 1, "ippan", "妻が、1年間に夫の父から現金＄をもらった。", 300 * MAN, 700 * MAN, 10 * MAN, "夫の父は、妻の直系尊属？"],
    ["i_17", 1, "ippan", "1月1日に17歳だった子が、その年に父から現金＄をもらった。", 300 * MAN, 700 * MAN, 10 * MAN, "1月1日に18歳以上でないと？"],
    ["t_18", 1, "tokurei", "1月1日に18歳だった子が、その年に母から現金＄をもらった。", 300 * MAN, 700 * MAN, 10 * MAN, "1月1日に18歳以上なら？"],
    ["t_sofu", 1, "tokurei", "22歳の孫が、1年間に祖父から現金＄をもらった。", 720 * MAN, 1600 * MAN, 10 * MAN, "祖父から孫。110万円を引いて表を見る。"],
    ["i_yujin", 1, "ippan", "会社員が、1年間に友人から現金＄をもらった。", 720 * MAN, 1600 * MAN, 10 * MAN, "友人は親族でない。どちらの表？"],
    ["n_110", 1, "tokurei", "30歳の子が、1年間に父からちょうど＄をもらった。", 110 * MAN, 110 * MAN, 1, "基礎控除の110万円「以下」ならどうなる？"],
    ["k_310i", 1, "ippan", "弟が、1年間に姉からちょうど＄をもらった。", 310 * MAN, 310 * MAN, 1, "200万円以下の段は、2つの表で同じ。"],
    ["k_310t", 1, "tokurei", "26歳の子が、1年間に母からちょうど＄をもらった。", 310 * MAN, 310 * MAN, 1, "200万円以下の段は、2つの表で同じ。"],
    ["i_tsuma", 1, "ippan", "夫が、1年間に妻から現金＄をもらった。", 1200 * MAN, 1600 * MAN, 10 * MAN, "妻から夫は直系尊属から？"],
    ["t_sobo2", 1, "tokurei", "19歳の孫が、1年間に祖母から現金＄をもらった。", 1200 * MAN, 1600 * MAN, 10 * MAN, "1月1日に18歳以上の孫。"],
    ["t_big", 2, "tokurei", "45歳の子が、1年間に父から現金＄をもらった。", 1700 * MAN, 4600 * MAN, 100 * MAN, "特例税率の1,500万円を超え3,000万円以下は？"],
    ["i_big", 2, "ippan", "妻が、1年間に夫から現金＄をもらった。", 1700 * MAN, 3100 * MAN, 100 * MAN, "一般税率の1,500万円を超え3,000万円以下は？"],
    ["i_huge", 2, "ippan", "会社員が、1年間に友人から現金＄をもらった。", 3200 * MAN, 8000 * MAN, 100 * MAN, "一般税率で、3,000万円を超えると？"],
    ["t_huge", 2, "tokurei", "50歳の子が、1年間に母から現金＄をもらった。", 4700 * MAN, 9000 * MAN, 100 * MAN, "特例税率で、4,500万円を超えると？"],
    ["k_510i", 2, "ippan", "弟が、1年間に兄からちょうど＄をもらった。", 510 * MAN, 510 * MAN, 1, "一般税率で、ちょうど400万円の段は？"],
    ["k_510t", 2, "tokurei", "27歳の子が、1年間に父からちょうど＄をもらった。", 510 * MAN, 510 * MAN, 1, "特例税率で、ちょうど400万円の段は？"],
    ["k_410i", 2, "ippan", "妻が、1年間に夫からちょうど＄をもらった。", 410 * MAN, 410 * MAN, 1, "一般税率で、ちょうど300万円の段は？"],
    ["k_3110t", 2, "tokurei", "33歳の子が、1年間に母からちょうど＄をもらった。", 3110 * MAN, 3110 * MAN, 1, "特例税率で、ちょうど3,000万円の段は？"],
    ["k_3110i", 2, "ippan", "会社員が、1年間に友人からちょうど＄をもらった。", 3110 * MAN, 3110 * MAN, 1, "一般税率で、ちょうど3,000万円の段は？"],
    ["i_17b", 2, "ippan", "1月1日に17歳で、3月に18歳になった孫が、5月に祖父から現金＄をもらった。", 400 * MAN, 1100 * MAN, 10 * MAN, "年れいは、もらった年の1月1日で見る。"],
    ["i_otto_haha", 2, "ippan", "妻が、1年間に夫の母から現金＄をもらった。", 1200 * MAN, 1600 * MAN, 10 * MAN, "夫の母は、妻の直系尊属？"],
    ["n_120", 2, "ippan", "妻が、1年間に夫から現金＄をもらった。", 60 * MAN, 110 * MAN, 10 * MAN, "1年間の合計で見る。110万円以下なら？"],
    ["t_1010", 2, "tokurei", "29歳の子が、1年間に父からちょうど＄をもらった。", 1110 * MAN, 1110 * MAN, 1, "特例税率で、ちょうど1,000万円の段は？"],
  ];

  const yen = (n) => n.toLocaleString("ja-JP") + "円";
  const man = (n) => (n !== 0 && n % MAN === 0 ? `${(n / MAN).toLocaleString("ja-JP")}万円` : yen(n));
  const label = (t) => (t === 0 ? "かからない（0円）" : yen(t));
  const ri = (R, a, b) => a + Math.floor(R() * (b - a + 1));
  function shuffle(R, a) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = ri(R, 0, i); [b[i], b[j]] = [b[j], b[i]]; } return b; }
  function pickN(R, a, n) { return shuffle(R, a).slice(0, n); }

  function maker(id, tab, sent, lo, hi, step) {
    return (R) => {
      const n = Math.floor((hi - lo) / step), gift = lo + ri(R, 0, n) * step, ans = taxOf(tab, gift), k = gift - KISO;
      const other = tab === "ippan" ? "tokurei" : "ippan", grp = k <= 0 ? "nashi" : tab;
      const sentence = sent.replace("＄", man(gift));
      // 選び肢：もう一方の表で出した額・110万円を引き忘れた額・控除額を引き忘れた額・となりの段で出した額から3つ
      const cand = new Set([taxOf(other, gift)]);
      const noKiso = (t) => { const [, r, d] = TAB[t][rowOf(t, gift)]; return (gift * r) / 100 - d; };
      cand.add(noKiso(tab)); cand.add(noKiso(other));
      if (k > 0) { const i = rowOf(tab, k), [, r] = TAB[tab][i]; cand.add((k * r) / 100); for (const j of [i - 1, i + 1]) if (TAB[tab][j]) cand.add((k * TAB[tab][j][1]) / 100 - TAB[tab][j][2]); }
      else cand.add(0);
      const ok = (x) => Number.isInteger(x) && x >= 0 && x !== ans;
      const wrong0 = [...cand].filter(ok);
      for (const x of [10 * MAN, 20 * MAN, 5 * MAN, 1 * MAN, 30 * MAN]) { if (new Set(wrong0).size >= 3) break; if (ok(x) && !wrong0.includes(x)) wrong0.push(x); }
      const wrong = pickN(R, [...new Set(wrong0)].sort((a, b) => a - b), 3);
      const opts = shuffle(R, [ans, ...wrong]).map(label);
      const full = k <= 0 ? `${sentence} → ${man(gift)}は110万円以下なので、${label(0)}` : `${sentence} → (${man(gift)}−110万円)×${TAB[tab][rowOf(tab, k)][1]}％−${man(TAB[tab][rowOf(tab, k)][2])}＝${yen(ans)}`;
      return { type: "act", q: `${sentence}　贈与税はいくら？`, opts, ans: label(ans), rev: false, full, amt: gift, tax: ans, grp, v: `${gift}` };
    };
  }
  const KINDS = D.map(([id, lv, tab, sent, lo, hi, step, look]) => { const grp = hi <= KISO ? "nashi" : tab; return { id, lv, grp, tab, col: "z", sent, lo, hi, step, look, src: ["z"], name: GROUPS[grp].name + "：" + sent.replace(/＄/, "○円").slice(0, 24) + "…", key: grp === "nashi" ? "基礎控除は110万円（1年間の合計）" : `${GROUPS[grp].name}（${GROUPS[grp].sub}）`, why: GRP_WHY[grp], make: maker(id, tab, sent, lo, hi, step) }; });
  const BY = Object.fromEntries(KINDS.map((k) => [k.id, k]));
  const kindsOf = (lv) => KINDS.filter((k) => k.lv === lv).map((k) => k.id);
  const GRP_OF = Object.fromEntries(KINDS.map((k) => [k.id, k.grp]));
  const groupsOf = (g) => Object.keys(GROUPS).filter((x) => GROUPS[x].set === GROUPS[g].set);

  function seedOf(str) { let h = 2166136261; for (const ch of String(str)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  function make(tag) {
    const [kind] = String(tag).split("|"), k = BY[kind];
    if (!k) return null;
    const p = k.make(rng(seedOf(tag)), k.lv);
    return { tag, kind, lv: k.lv, name: k.name, look: k.look, key: k.key, why: k.why, grp: k.grp, gwhy: GRP_WHY[k.grp], media: MEDIA[k.col], src: k.src.map((s) => SRC[s]), ...p };
  }
  const keyOf = (P) => `${P.kind}:${P.q}:${P.opts.slice().sort().join("/")}`;

  function dailyTags(date) {
    const R = rng(seedOf("day:" + date)), e = pickN(R, kindsOf(0), 2), n = pickN(R, kindsOf(1), 2), h = pickN(R, kindsOf(2), 1);
    return [...e, ...n, ...h].map((id, i) => `${id}|${date}:d${i}`);
  }
  function hardTags(date) {
    const dh = dailyTags(date)[4].split("|")[0], R = rng(seedOf("hard:" + date)), h = pickN(R, kindsOf(2).filter((x) => x !== dh), 3);
    return h.map((id, i) => `${id}|${date}:h${i}`);
  }

  const ZYZ = { KINDS, BY, GROUPS, GRP_OF, GRP_WHY, LV, SRC, MEDIA, TAB, AS_OF, KISO, taxOf, rowOf, kindsOf, groupsOf, seedOf, rng, make, keyOf, dailyTags, hardTags, pickN };
  if (typeof module !== "undefined" && module.exports) module.exports = ZYZ; else root.ZYZ = ZYZ;
})(typeof self !== "undefined" ? self : this);
