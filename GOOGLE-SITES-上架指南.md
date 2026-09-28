# 豫豐花園巴士時刻表 — Google Sites 上架指南

Google Sites **無法直接上傳** HTML 網頁，需先用 **Google Apps Script** 託管，再嵌入 Google Sites。

---

## 第一步：部署到 Google Apps Script（約 5 分鐘）

1. 開啟 [Google Apps Script](https://script.google.com/)
2. 點 **「新專案」**
3. 將左側預設的 `Code.gs` 內容**全部刪除**，改為貼上 `google-apps-script/Code.gs` 的內容
4. 左側點 **「+」→「HTML」**，檔名改為 **`Index`**（必須完全一致）
5. 刪除 HTML 編輯器內全部內容，貼上 `google-apps-script/Index.html` 的**完整內容**
6. 右上角點 **「部署」→「新增部署作業」**
7. 類型選 **「網頁應用程式」**
8. 設定：
   - **說明**：豫豐花園巴士時刻表
   - **執行身分**：我
   - **具有存取權的使用者**：**任何人**（必須選這項，Google Sites 才能嵌入）
9. 點 **「部署」**，按提示授權 Google 帳戶
10. **複製「網頁應用程式 URL」**（格式類似 `https://script.google.com/macros/s/xxxxx/exec`）

> 日後更新時刻表：修改 Index.html 後，重新「部署 → 管理部署作業 → 編輯 → 版本選『新版本』→ 部署」。

---

## 第二步：嵌入 Google Sites

1. 開啟 [Google Sites](https://sites.google.com/)，建立新網站或編輯現有網站
2. 點右側 **「插入」→「嵌入」**
3. 選 **「嵌入程式碼」**（不是「網址」）
4. 貼上以下程式碼，把 `你的網址` 換成第一步複製的 URL：

```html
<iframe
  src="你的網址"
  width="100%"
  height="900"
  style="border:0; max-width:640px; display:block; margin:0 auto;"
  loading="lazy"
  title="豫豐花園巴士時刻表">
</iframe>
```

5. 點 **「下一步」→「插入」**
6. 拖曳調整嵌入區塊大小（建議高度 900px 以上，方便手機捲動）
7. 右上角點 **「發布」**，設定網站名稱及分享範圍

---

## 第三步：手機優化（建議）

在 Google Sites 頁面設定中：
- 使用 **空白版面** 或 **全寬版面**
- 隱藏不必要的頁首，讓嵌入內容佔滿畫面
- 分享連結給家人，或加入手機主畫面書籤

---

## 檔案說明

| 檔案 | 用途 |
|------|------|
| `google-apps-script/Code.gs` | Apps Script 後端（貼到 Code.gs） |
| `google-apps-script/Index.html` | 完整網頁（貼到 Index.html） |
| `standalone.html` | 單一檔案版本，可本機開啟測試 |

---

## 常見問題

**Q：嵌入後顯示空白？**  
A：確認部署時「具有存取權的使用者」選了 **任何人**，且 Index 檔名大小寫正確。

**Q：Google Sites 顯示「無法嵌入」？**  
A：改用「嵌入程式碼」而非「網址」；若仍失敗，直接在 Google Sites 放一個連結指向 Apps Script URL。

**Q：如何更新時刻表？**  
A：修改 `js/data.js` 後執行 `python build_standalone.py`，再將新的 `Index.html` 貼回 Apps Script 並重新部署。
