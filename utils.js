import {
  shieldCheck,
  spinner,
  shieldX,
  infoIcon,
  deleteIcon,
  linksToCheckMessage,
  noLinksMessage,
  itemsPerPage,
} from "./constants";
import { routes } from "./routes";

// pagination
let currentPage = 1;

// private helpers
function getColorClassification(prediction) {
  const isPhishing = prediction > 0.8;
  const isSafe = prediction < 0.4;
  const red = "rgb(204, 8, 8)";
  const green = "rgb(11, 175, 112)";
  const amber = "rgb(245, 158, 11)";
  return isPhishing ? red : isSafe ? green : amber;
}

function getLinksElements(predictionColor) {
  const linksWrapper = document.createElement("div");
  const linkElement = document.createElement("span");
  const safeButton = document.createElement("button");
  const phishingButton = document.createElement("button");
  const deleteButton = document.createElement("button");
  const buttonsWrapper = document.createElement("div");
  const finalUrl = document.createElement("span");

  linksWrapper.className = "links-wrapper";
  linkElement.className = "link";
  safeButton.className = "safe-button";
  phishingButton.className = "phishing-button";
  deleteButton.className = "delete-button";
  buttonsWrapper.className = "buttons-wrapper";
  finalUrl.className = "final-url";

  linkElement.style.color = predictionColor;
  deleteButton.innerHTML = deleteIcon;
  deleteButton.title = "Delete URL";

  return {
    linksWrapper,
    linkElement,
    safeButton,
    phishingButton,
    deleteButton,
    buttonsWrapper,
    finalUrl,
  };
}

function paginateLinks(currentLinks, linksElement) {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = currentLinks.slice(startIndex, endIndex);
  processElements(paginatedItems, linksElement);

  updatePaginationControls(currentLinks);
}

function updatePaginationControls(currentLinks) {
  const totalItems = currentLinks.length;
  const paginationElement = document.getElementById("pagination-controls");
  paginationElement.innerHTML = "";

  if (totalItems > itemsPerPage) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const prevButton = document.createElement("button");
    prevButton.textContent = "Previous";
    prevButton.disabled = currentPage === 1; // Disable if on the first page
    prevButton.onclick = () => {
      if (currentPage > 1) {
        currentPage--;
        viewLinks(currentLinks);
      }
    };
    paginationElement.appendChild(prevButton);

    const nextButton = document.createElement("button");
    nextButton.textContent = "Next";
    nextButton.disabled = currentPage === totalPages; // Disable if on the last page
    nextButton.onclick = () => {
      if (currentPage < totalPages) {
        currentPage++;
        viewLinks(currentLinks);
      }
    };
    paginationElement.appendChild(nextButton);
  }
}

function updateLinkFromStore(tabId, url, isSafe) {
  chrome.storage.sync.get([tabId.toString()], (data) => {
    if (data[tabId.toString()]) {
      let currentUrls = JSON.parse(data[tabId.toString()]);
      // Map through each link to update predictions where URLs match
      currentUrls = currentUrls.map((link) => {
        if (Object.keys(link.predictions).includes(url)) {
          // Create a copy of the predictions and update the relevant URL
          const updatedPredictions = {
            ...link.predictions,
            [url]: isSafe ? 0 : 1,
          };
          // Return a new link object with updated predictions
          return { ...link, predictions: updatedPredictions, isSafe: isSafe };
        }
        return link;
      });

      // Set the updated URLs back into storage
      chrome.storage.sync.set({
        [tabId.toString()]: JSON.stringify(currentUrls),
      });
    } else {
      console.error("No existing data found for this tab ID.");
    }
  });
}

function removeLinkFromStore(tabId, url) {
  chrome.storage.sync.get([tabId.toString()], (data) => {
    if (data[tabId.toString()]) {
      let currentUrls = JSON.parse(data[tabId.toString()]);
      currentUrls = currentUrls.filter(
        (link) => Object.keys(link.predictions)[0] !== url
      );
      chrome.storage.sync.set({
        [tabId.toString()]: JSON.stringify(currentUrls),
      });
    }
  });
}

// public helpers
export async function getActiveTabURL() {
  const tabs = await chrome.tabs.query({
    currentWindow: true,
    active: true,
  });

  return tabs[0];
}

export async function notify(results, message) {
  const notificationsElement = document.getElementById("notifications");
  const url = Object.keys(results[0])[0];

  const notificationHTML = `<p><strong>${url}</strong> ${message.replace(
    "URLs",
    ""
  )}</p>`;

  notificationsElement.innerHTML = infoIcon + notificationHTML;
  notificationsElement.className = "notifications";

  setTimeout(() => {
    notificationsElement.className = "notifications hidden";
  }, 3000);

  setTimeout(() => {
    notificationsElement.innerHTML = "";
  }, 3500);
}

export async function addToWhitelist(data) {
  try {
    const response = await fetch(routes.addToWhitelist, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    await notify(result.data[0].results, result.message);
    return result;
  } catch (error) {
    throw new Error(`Error: ${error}`);
  }
}

export async function addToBlacklist(data) {
  try {
    const response = await fetch(routes.addToBlacklist, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    await notify(result.data[0].results, result.message);
    return result;
  } catch (error) {
    throw new Error(`Error: ${error}`);
  }
}

export function processElements(currentLinks, linksElement) {
  currentLinks?.forEach((link) => {
    const predictionColor = getColorClassification(
      Object.values(link?.predictions)?.[0]
    );
    const {
      linksWrapper,
      linkElement,
      safeButton,
      phishingButton,
      deleteButton,
      buttonsWrapper,
      finalUrl,
    } = getLinksElements(predictionColor);

    finalUrl.innerText = Object.keys(link.predictions)[0];
    linkElement.innerText = link.originalUrl?.split("?")[0];
    linksElement.appendChild(linkElement);

    finalUrl.setAttribute("data-tooltip", "Click to copy");
    finalUrl.onclick = () => navigator.clipboard.writeText(finalUrl.innerText);

    const handleSafeButtonClick = async () => {
      const activeTab = await getActiveTabURL();
      safeButton.innerHTML = spinner;
      const result = await addToWhitelist({
        urls: [finalUrl.innerText],
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
      result.code === 200 && (safeButton.innerHTML = shieldCheck);
      updateLinkFromStore(activeTab.id, finalUrl.innerText, true);
      setTimeout(() => {
        linksWrapper.remove();
        window.location.reload();
      }, 3500);
    };

    const handlePhishingButtonClick = async () => {
      const activeTab = await getActiveTabURL();
      phishingButton.innerHTML = spinner;
      const result = await addToBlacklist({
        urls: [finalUrl.innerText],
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
      result.code === 200 && (phishingButton.innerHTML = shieldCheck);
      updateLinkFromStore(activeTab.id, finalUrl.innerText, false);
      setTimeout(() => {
        linksWrapper.remove();
        window.location.reload();
      }, 3500);
    };

    const handleDeleteButtonClick = async (linkElement, finalUrl) => {
      const activeTab = await getActiveTabURL();
      removeLinkFromStore(activeTab.id, finalUrl.innerText);
      linkElement.parentNode.removeChild(linkElement);
    };

    safeButton.innerHTML = shieldCheck;
    safeButton.onclick = handleSafeButtonClick;
    phishingButton.innerHTML = shieldX;
    phishingButton.onclick = handlePhishingButtonClick;
    deleteButton.onclick = () =>
      handleDeleteButtonClick(linksWrapper, finalUrl);

    buttonsWrapper.appendChild(safeButton);
    buttonsWrapper.appendChild(phishingButton);
    buttonsWrapper.appendChild(deleteButton);
    linksWrapper.appendChild(linkElement);
    linksWrapper.appendChild(finalUrl);
    linksWrapper.appendChild(buttonsWrapper);
    linksElement.appendChild(linksWrapper);
  });
}

// private helpers
export function viewLinks(currentLinks = []) {
  const titleMessage = document.getElementById("title-message");

  titleMessage.innerHTML = currentLinks.length
    ? linksToCheckMessage
    : noLinksMessage;

  const linksElement = document.getElementById("links-to-check");
  linksElement.innerHTML = "";
  const uniqueLinks = Array.from(
    new Map(
      currentLinks.map((item) => [Object.keys(item.predictions)[0], item])
    ).values()
  );

  paginateLinks(uniqueLinks, linksElement);
}
