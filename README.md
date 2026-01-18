# 🌳 高雄探險家 | Kaohsiung Explorer

探索城市，發現知識！透過有趣的任務和問答，認識高雄的自然生態、歷史文化和美食。

## ✨ 功能特色

- 🗺️ **5 大景點**：高雄都會公園、橋頭糖廠、駁二藝術特區、瑞豐夜市、義大遊樂世界
- 📋 **25 個任務**：探索、答題、獲得知識卡片
- 📷 **拍照任務**：每個任務都有專屬拍照挑戰
- 🏆 **成就系統**：解鎖徽章、累積經驗值
- 👑 **排行榜**：和其他探險家一較高下
- 👥 **多用戶系統**：支援多個探險家帳號

---

## 🚀 部署到 Netlify

### 方法一：透過 GitHub（推薦）

#### 步驟 1：上傳到 GitHub

1. 在 GitHub 建立新的 Repository
2. 將此專案資料夾上傳到 GitHub：

```bash
# 初始化 Git
git init

# 添加所有檔案
git add .

# 提交
git commit -m "Initial commit: 高雄探險家"

# 連結 GitHub Repository（替換成你的 repo 網址）
git remote add origin https://github.com/YOUR_USERNAME/kaohsiung-explorer.git

# 推送
git push -u origin main
```

#### 步驟 2：連結 Netlify

1. 前往 [Netlify](https://app.netlify.com/)
2. 點擊「Add new site」→「Import an existing project」
3. 選擇「GitHub」
4. 授權並選擇你的 Repository
5. 設定如下：
   - **Branch to deploy**: `main`
   - **Build command**: `npm run build`
   - **Publish directory**: `build`
6. 點擊「Deploy site」

#### 步驟 3：等待部署完成

- Netlify 會自動安裝依賴並建置
- 建置完成後會提供一個網址（如 `https://xxx.netlify.app`）
- 你可以在 Site settings 自訂網域名稱

---

### 方法二：手動拖放部署

#### 步驟 1：本地建置

```bash
# 安裝依賴
npm install

# 建置專案
npm run build
```

#### 步驟 2：上傳到 Netlify

1. 前往 [Netlify Drop](https://app.netlify.com/drop)
2. 將 `build` 資料夾拖放到網頁上
3. 等待上傳完成
4. 獲得網址！

---

### 方法三：使用 Netlify CLI

```bash
# 安裝 Netlify CLI
npm install -g netlify-cli

# 登入 Netlify
netlify login

# 初始化專案
netlify init

# 部署
netlify deploy --prod
```

---

## 📁 專案結構

```
kaohsiung-explorer/
├── public/
│   └── index.html        # HTML 模板
├── src/
│   ├── index.js          # 入口檔案
│   └── App.jsx           # 主要應用程式
├── package.json          # 專案配置
├── netlify.toml          # Netlify 配置
└── README.md             # 說明文件
```

---

## 🛠️ 本地開發

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm start

# 開啟瀏覽器訪問 http://localhost:3000
```

---

## 📱 PWA 支援（選用）

如需將應用程式變成可安裝的 PWA，可在 `public` 資料夾新增 `manifest.json`：

```json
{
  "name": "高雄探險家",
  "short_name": "高雄探險家",
  "description": "探索城市，發現知識",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#22c55e",
  "background_color": "#f0fdf4",
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## 🔧 自訂網域

1. 在 Netlify 後台進入「Site settings」→「Domain management」
2. 點擊「Add custom domain」
3. 輸入你的網域名稱
4. 依照指示設定 DNS

---

## 📝 注意事項

- 資料儲存在瀏覽器的 localStorage，清除瀏覽器資料會遺失進度
- 照片會壓縮後儲存，建議每個任務上傳不超過 3 張
- 支援手機和電腦瀏覽器

---

## 🎮 遊戲內容

### 景點與任務

| 景點 | 任務數 | 主題 |
|------|--------|------|
| 🌳 高雄都會公園 | 5 | 自然生態 |
| 🏭 橋頭糖廠 | 5 | 歷史文化 |
| 🎨 駁二藝術特區 | 5 | 藝術創意 |
| 🏮 瑞豐夜市 | 5 | 美食文化 |
| 🎢 義大遊樂世界 | 5 | 科學遊樂 |

### 徽章系統

- 🌟 初次探險 - 完成第一個任務
- 📷 攝影新手 - 上傳第一張照片
- 📸 攝影達人 - 上傳 10 張照片
- 🌿 植物達人 - 發現 3 種植物
- 🌳 都會公園通 - 完成都會公園所有任務
- 🏭 糖廠達人 - 完成橋頭糖廠所有任務
- 🎨 藝術愛好者 - 完成駁二所有任務
- 🏮 夜市美食家 - 完成瑞豐夜市所有任務
- 🎢 遊樂園玩家 - 完成義大遊樂世界所有任務
- 👑 探險大師 - 完成所有 25 個任務

---

## 📄 授權

MIT License

---

Made with ❤️ for 高雄
