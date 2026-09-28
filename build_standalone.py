from pathlib import Path

root = Path(__file__).parent
css = (root / "css" / "style.css").read_text(encoding="utf-8")
data = (root / "js" / "data.js").read_text(encoding="utf-8")
app = (root / "js" / "app.js").read_text(encoding="utf-8")

body = """
  <header class="top-bar">
    <div class="top-bar-inner">
      <div>
        <p class="top-bar-label">豫豐花園居民巴士</p>
        <p class="top-bar-sub">一至日及公眾假期</p>
      </div>
      <time class="live-clock" id="live-clock" aria-live="polite"></time>
    </div>
  </header>
  <main class="page">
    <section class="next-hero" id="next-hero" aria-live="polite">
      <p class="next-hero-route" id="hero-route">—</p>
      <p class="next-hero-time" id="hero-time">--:--</p>
      <p class="next-hero-wait" id="hero-wait">—</p>
      <p class="next-hero-direction" id="hero-direction">—</p>
    </section>
    <section class="panel">
      <div class="route-options" id="route-options"></div>
    </section>
    <section class="panel results-panel">
      <div class="view-tabs" role="tablist">
        <button type="button" class="view-tab active" data-view="next" role="tab">之後班次</button>
        <button type="button" class="view-tab" data-view="full" role="tab">完整時刻表</button>
      </div>
      <div id="next-panel" role="tabpanel">
        <div class="upcoming-list" id="next-cards"></div>
      </div>
      <div id="full-panel" hidden role="tabpanel">
        <p id="timetable-caption"></p>
        <div class="timetable-grid" id="timetable-grid"></div>
      </div>
    </section>
    <details class="remarks-details panel">
      <summary>備註及查詢熱線</summary>
      <ul class="remarks-list" id="remarks-list"></ul>
      <p class="footer-note">查詢熱線 <a href="tel:35154088">3515 4088</a></p>
    </details>
  </main>
"""

html = f"""<!DOCTYPE html>
<html lang="zh-HK">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="theme-color" content="#004c99">
  <title>豫豐花園巴士 | NR762</title>
  <style>
{css}
  </style>
</head>
<body>
{body}
  <script>
{data}
{app}
  </script>
</body>
</html>
"""

(root / "standalone.html").write_text(html, encoding="utf-8")

gas_dir = root / "google-apps-script"
gas_dir.mkdir(exist_ok=True)
(gas_dir / "Index.html").write_text(html, encoding="utf-8")
(gas_dir / "Code.gs").write_text(
    """function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('豫豐花園巴士時刻表')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
""",
    encoding="utf-8",
)

print("Built standalone.html and google-apps-script/")
