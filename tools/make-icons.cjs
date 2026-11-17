// アプリのアイコン（icon-192.png・icon-512.png）を作る。紺の地に、白い紙の形と、赤い「贈」。
// 使い方: node tools/make-icons.cjs（qa/ の playwright を使う）
const path = require("path");
const { chromium } = require(path.join(__dirname, "..", "qa", "node_modules", "playwright"));
(async () => {
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  for (const s of [192, 512]) {
    const p = await b.newPage({ viewport: { width: s, height: s } });
    await p.setContent(`<body style="margin:0"><svg width="${s}" height="${s}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#123554"/>
      <rect x="20" y="16" width="60" height="68" rx="4" fill="#fffdf7"/>
      <circle cx="50" cy="50" r="20" fill="none" stroke="#c0392b" stroke-width="5"/>
      <text x="50" y="62" font-size="32" font-weight="900" text-anchor="middle" fill="#c0392b" font-family="'Noto Sans CJK JP',sans-serif">贈</text></svg></body>`);
    await p.screenshot({ path: path.join(__dirname, "..", `icon-${s}.png`), clip: { x: 0, y: 0, width: s, height: s } });
  }
  await b.close();
})();
