# 部署到 GitHub Pages

## 快速部署（推薦）

在 PowerShell 執行：

```powershell
cd c:\Users\ws08\Projects\nr762-timetable
.\deploy-github.ps1
```

腳本會自動：登入 GitHub → 建立 repository → 推送程式碼 → 啟用 Pages。

---

## 手動步驟

### 1. 登入 GitHub

```powershell
gh auth login
```

選 **GitHub.com → HTTPS → Login with a web browser**，按提示完成授權。

### 2. 建立 repository 並推送

```powershell
cd c:\Users\ws08\Projects\nr762-timetable
gh repo create nr762-timetable --public --source=. --remote=origin --push --description "豫豐花園 NR762/NR762A 居民巴士時刻表"
```

若 repository 已存在，改為：

```powershell
git remote add origin https://github.com/你的帳號/nr762-timetable.git
git push -u origin main
```

### 3. 啟用 GitHub Pages

1. 開啟 `https://github.com/你的帳號/nr762-timetable/settings/pages`
2. **Build and deployment → Source** 選 **GitHub Actions**
3. 等待 Actions 完成（約 1–2 分鐘）

### 4. 取得網址

```
https://你的帳號.github.io/nr762-timetable/
```

---

## 更新時刻表

```powershell
# 修改 js/data.js 後
git add js/data.js
git -c user.name="Thomas" -c user.email="你的email" commit -m "Update timetable"
git push
```

推送後 GitHub Actions 會自動重新部署。
