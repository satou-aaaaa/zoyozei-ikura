# AGENTS.md

贈与税いくら？：1年間にもらった額とだれからもらったかを読んで、贈与税の額を当てる1日5問の学習ゲーム。正解したら「どちらの表？」（一般税率・特例税率・かからない）も選ぶ。`index.html` と `data.js`（問題の種類と速算表）を GitHub Pages で公開する。

## 準備（最初に一度）

```bash
bash scripts/setup.sh   # Node.js（版は .nvmrc）を確かめ、検査の依存とブラウザを入れる。何度実行してもよい
```

Claude Code のクラウドセッションでは `.claude/settings.json` のフックが自動で実行する。

## push する前の確認

```bash
node qa/run.mjs   # 問題（35種類×3000問：答えが別に書いた速算表どおり・選び肢は4つ・2段目が表どおり・境目と国税庁の計算例・出典）・今日の5問と上級（3年分）・とことん・通しで遊ぶ・続きから・2段目・復習・幅320px・PWA・引き継ぎ・見やすさ（CI の QA と同じ）
```

## このリポジトリの決まり

- 答えは国税庁タックスアンサー No.4408「贈与税の計算と税率（暦年課税）」（［令和8年4月1日現在法令等］）の速算表2つ（一般税率・特例税率）から、`data.js` の `TAB` でコードが計算する（2026-11-17 に読んだ。要点は共有フォルダ games/zoyozei-ikura-research.md）。`qa/run.mjs` には別に書いた速算表（`QT`）と国税庁の計算例（500万円→一般53万円・特例48.5万円）があり、両方が合うかを見る。表を直すときは両方を国税庁のページと照らす。毎年4月の税制改正で税率・控除額・年れいが変わっていないか見る。
- 特例税率は、直系尊属（父母・祖父母など）から、贈与の年の1月1日に18歳以上の子・孫への贈与だけ。場面の年れいは1月1日のもの。もらった額は10万円単位（端数の扱いは No.4408 に無い）。相続時精算課税・配偶者控除・住宅取得資金などの非課税・一般と特例が混ざる年は扱わない。そのことと、税の相談の代わりではないこと、国税庁の資料や税務署で確かめることを遊び方・「このゲームについて」・README に置く（QA が見る）。
- 選び肢は4つ（答え・もう一方の表で出した額・110万円を引き忘れた額・控除額を引き忘れた額・となりの段で出した額など）。2回目のヒントは使う表（`key`）も見せる。2段目は「どちらの表？」（3つ）で、種類ごとに決まる（`grp`。110万円以下の種類は「かからない」）。
- 今日の5問（やさしい2・ふつう2・むずかしい1、種類は重ねない）・上級（むずかしい3、今日のむずかしいと別）は日本時間の日付の種で決まり、だれでも同じ。`Math.random()` は練習・とことんの種だけ。乱数は `sort` の比較の中で引かない。`KINDS`・言い回しの並びは最後に足すだけ（QA の `PIN` が第1回の1問目を見る）。`data.js` を変える PR は自動ではマージされない（`hold_paths`）。
- ★はまちがい＋ヒントの数（0で★3・1で★2・2以上で★1）。上級はヒントなし。時間制限なし。
- 好きなだけ遊べる：チケット・ライフ・回数制限・🔒で開くモードを入れない（shared-workflows `routines/game-dev.md` F1〜F7。QA が見る）。とことん（`runs.e`）はまちがえても続き、「ここで降りる」で終わる。
- 1問を深くする：`depth.js` と `qa/depth-check.mjs` は shared-workflows `template/` の写しで、ここでは直さない。自信あり・2段目「どちらの表？」・復習（1→3→7日後）。記録 `zyz-v1`・文字 `zyz-fs`・復習 `zyz-depth`。
- 保存の読み直しは共通部品 `GameStore`（`<!-- store:begin -->`〜`end`。shared-workflows `template/store/store.js` の写しで、ここでは直さない）。
- 共有は遊ぶ人が押したときに開くリンクだけ。シェアの文に問題・答えを出さない。感想は Issue フォーム（`.github/ISSUE_TEMPLATE/feedback.yml`）を開くだけ。応援は Ko-fi へのただのリンクだけ。
- 外へ通信しない（CSP の `connect-src 'self'` を広げない）。見やすさ（`<!-- a11y:begin -->`〜`end`・`qa/a11y.mjs`）と引き継ぎ（`transfer.js`・`qa/transfer-check.mjs`）は shared-workflows `template/` の写しで、ここでは直さない。
- 画面の土台は所得税いくら？（shotokuzei-ikura）から写した。写し元の言葉が残っていないかを QA が見る。
- PWA：画面のファイルを足したら `sw.js` の `SHELL` にも足し、中身を大きく変えたら `CACHE` の版を上げる。アイコンは `node tools/make-icons.cjs`、`og.png` は `node tools/make-og.cjs`。
- 公開リポジトリなので、個人情報・鍵を入れない。

## 公開

- GitHub Pages は `main` のルート（`/`）を公開する。PR の QA と Secret scan が ✅ になると `automerge.yml` が自動でマージする。止めたいときは下書きにするか、ラベル「自動マージしない」を付ける。
- `sw.js`・`manifest.webmanifest`・`data.js` を変える PR は自動ではマージされない（`hold_paths`）。CodeRabbit のレビューを読み、手でマージする直前に今の head へのレビューを読み直す。CodeRabbit は PR に `@coderabbitai review` とコメントして頼む。

## 共通のきまり

- PR の作り方・マージの仕方は satou-aaaaa/shared-workflows の `routines/pr.md`、全体のきまりは `routines/common.md` に従う。
- CI の部品は shared-workflows の共通部品を呼ぶ。リポジトリ側の .github/workflows には呼び出しと設定値だけを書く。
- Claude 以外の AI・人が作業するときは、shared-workflows の `routines/tool-map.md` と `routines/without-claude.md` を読む。
