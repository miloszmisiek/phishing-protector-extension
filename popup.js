import { getActiveTabURL, processElements, viewLinks } from "./utils.js";

// private constants
const notATwitterMessage = `
<div class="title-without-links">
  <p>This is not a</p>
  <img src="./assets/logo-black.png" width="24" height="24" />
  <p>page.</p>
</div>`;

document.addEventListener("DOMContentLoaded", async () => {
  const activeTab = await getActiveTabURL();

  if (activeTab.url.includes("twitter.com") || activeTab.url.includes("x.com")) {
    try {
      chrome.storage.sync.get([activeTab.id.toString()], (data) => {
        const currentUrls = data[activeTab.id.toString()]
          ? JSON.parse(data[activeTab.id.toString()])
          : [];
        viewLinks(currentUrls);
      });
    } catch (error) {
      console.error("Error fetching URLs:", error);
    }
  } else {
    const container = document.getElementsByClassName("container")[0];

    container.innerHTML = notATwitterMessage;
  }
});
