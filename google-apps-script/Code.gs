function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('豫豐花園巴士時刻表')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
