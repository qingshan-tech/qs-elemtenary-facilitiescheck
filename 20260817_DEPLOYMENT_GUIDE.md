# 國小部各班級教室桌椅清點系統 (Vite + React) 部署與維護指引

本文件統整從 **Google AI Studio** 下載前端專案原始碼後，進行環境建置、除錯以及一勞永逸透過 **GitHub Pages / GitHub Actions** 自動部署的完整流程與維護注意事項。

---

## 專案資訊
* **專案名稱**：`qs-elemtenary-facilitiescheck`
* **GitHub Repository**：`https://github.com/qingshan-tech/qs-elemtenary-facilitiescheck`
* **GitHub Pages 網址**：`https://qingshan-tech.github.io/qs-elemtenary-facilitiescheck/`

---

## 一、新電腦環境建置（初次設定）

更換新電腦（如辦公室新機）時，需先確保基礎開發環境已就緒：

### 1. 安裝基礎工具
1. **Node.js (含 npm)**：至 [nodejs.org](https://nodejs.org/) 下載並安裝 **LTS 版本**。
2. **Git for Windows**：至 [git-scm.com](https://git-scm.com/) 下載安裝，全程選擇預設選項安裝即可。
3. **VS Code**：安裝最新版，完成後**務必重新啟動 VS Code** 讓環境變數生效。

### 2. 解除 Windows PowerShell 指令碼限制（避免 `npm.ps1` 報錯）
Windows 預設會阻擋終端機執行腳本，開啟 VS Code 的 Terminal（PowerShell）並執行：
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```
*提示確認時輸入 `Y` 或 `A` 按 Enter。*

### 3. 安裝專案依賴套件
```powershell
npm install
npm i --save-dev @types/react @types/react-dom @types/node
```

---

## 二、一勞永逸：設定 GitHub Actions 自動構建與部署（推薦）

為了解決每次從 Google AI Studio 下載解壓縮覆蓋後，`vite.config.ts` 與 `package.json` 設定會被重置、需重複手動打包的問題，建議採用 **GitHub Actions 自動化流程**。

### 1. 建立 Workflow 設定檔
在專案根目錄建立路徑 `.github/workflows/deploy.yml`，並填入以下內容：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main # 若預設分支為 master 請自行調整

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm install

      - name: Build project
        # 自動注入 Repository 名稱作為 base 路徑，避免手動寫死出錯
        run: npx vite build --base=/${{ github.event.repository.name }}/

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 2. 切換 GitHub 後台設定
1. 前往 GitHub Repo 頁面 ➡️ 點選 **Settings** ➡️ 左側點選 **Pages**。
2. 在 **Build and deployment** 下方的 **Source**，切換為 **`GitHub Actions`**。

---

## 三、日常快速維護與更新流程

設定好 GitHub Actions 後，日後從 Google AI Studio 迭代功能時的標準操作：

1. **更新程式碼**：
   * 從 Google AI Studio 下載新版本 `.zip`。
   * 解壓縮後將檔案複製並覆蓋專案目錄（主要覆蓋 `src/` 與 `index.html`）。
2. **推送到 GitHub**：
   在 VS Code Terminal 執行：
   ```powershell
   git add .
   git commit -m "更新網站內容與功能"
   git push
   ```
3. **自動上線**：
   * GitHub Actions 雲端會自動執行 npm install、打包 build 並發布至 Pages。
   * 等待 1~2 分鐘後重新整理網頁即可。

---

## 四、常見問題排查與解決方案 (Troubleshooting)

### Q1: 部署後網頁呈現一片空白，Console 顯示 404 (找不到 CSS / JS)
* **原因**：靜態資源路徑缺少 Repo 子路徑前綴。
* **解法**：確認 `vite.config.ts` 中的 `base` 是否設定為 Repo 名稱（前後需加斜線）：
  ```typescript
  export default defineConfig({
    plugins: [react()],
    base: '/qs-elemtenary-facilitiescheck/',
  })
  ```
  *(若使用上述 GitHub Actions 腳本，已包含自動參數注入，可有效避免此問題)*。

### Q2: 終端機出現 `TS2353: Object literal may only specify known properties`
* **原因**：`App.tsx` 傳入的資料欄位（如 `itemType`、`note`）在 `TransferLog` 型別介面中未定義。
* **解法**：在 `src/types.ts` 中將缺少欄位補齊，建議設為選填屬性（加 `?`）：
  ```typescript
  export interface TransferLog {
    id: string;
    itemType?: string;
    note?: string;
    // ...其餘欄位
  }
  ```

### Q3: VS Code 程式碼出現大量紅色波浪線（中文字或 React 標籤）
1. **中文字波浪線**：為編輯器 Spell Checker 誤判，可於 Extensions 中停用 `Code Spell Checker` 或檢查標籤語法是否閉合完整。
2. **JSX 語法紅字**：檢查右下角語言模式是否為 `TypeScript JSX`，並可透過 `Cmd/Ctrl + Shift + P` 執行 `TypeScript: Restart TS Server`。

### Q4: 終端機執行 npm 指令出現 `Error: spawn git ENOENT`
* **原因**：本機環境找不到 Git 執行檔。
* **解法**：安裝 Git for Windows 並重啟 VS Code。

### Q5: 網頁更新後畫面沒有變化
* **解法**：
  1. 檢查 GitHub Repo 頂部 **Actions** 頁籤，確認部署流程已顯示綠色勾勾 `✔`。
  2. 瀏覽器存在快取，請使用**無痕視窗**開啟或按 `Ctrl + F5` (Mac: `Cmd + Shift + R`) 強制重新整理。
