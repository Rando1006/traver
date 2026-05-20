# 三家庭旅遊行程協作網頁

Next.js + Neon Postgres + Drizzle ORM 的旅遊行程 MVP。樂沐家、小葵家、瓜峰家從同一個主頁切換，各自新增候選行程，並可直接加入 `/final` 彙整頁。

## 本機啟動

1. 安裝依賴：

```bash
npm install
```

2. 建立 `.env`，至少需要：

```bash
DATABASE_URL=你的 Neon Postgres 連線字串
```

3. 初始化資料庫 schema 與預設家庭：

```bash
npm run db:push
npm run db:seed
```

4. 啟動開發伺服器：

```bash
npm run dev
```

## Vercel 部署

在 Vercel 匯入 GitHub repo 後，請到 Project Settings > Environment Variables 加入 `DATABASE_URL`。Neon schema 已可用 `npm run db:push` 建立，三個預設家庭可用 `npm run db:seed` 寫入。

## 功能

- `/`：家庭切換、行程新增/編輯/刪除、加入或移出 final；同一天行程會放在同一個日期框內。
- `/final`：彙整所有已加入 final 的行程，依日期分組並按時間排序。
- 行程時間選填，地點可另外填 Google Map 連結。
- 不做帳密控管；家庭切換只作為資料分組，不是安全權限。
