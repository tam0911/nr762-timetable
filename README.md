# 豫豐花園居民巴士時刻表

查詢豫豐花園 **NR762**（兆康站）及 **NR762A**（屯門市中心）居民巴士班次。

## 使用

開啟網站即可查詢下一班車及完整時刻表，支援手機瀏覽。

## 本地預覽

```bash
python -m http.server 8765
```

瀏覽器開啟 http://localhost:8765

## 更新時刻表

1. 修改 `js/data.js`
2. 若需同步 standalone 版本：`python build_standalone.py`

## GitHub Pages 部署

推送到 `main` 分支後，GitHub Actions 會自動部署網站。

首次使用請在 GitHub repository **Settings → Pages → Build and deployment** 確認來源為 **GitHub Actions**。

公開網址格式：`https://<你的帳號>.github.io/nr762-timetable/`
