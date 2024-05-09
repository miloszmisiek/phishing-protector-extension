chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!tab.url) return;
  if (
    (tab.url.includes("twitter.com") || tab.url.includes("x.com")) &&
    changeInfo.url === undefined
  ) {
    chrome.tabs.sendMessage(tabId, {
      type: "TWITTER",
      tabId,
    });
  }
});
