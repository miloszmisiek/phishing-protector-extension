(() => {
  let currentTabId = "";
  let currentUrls = [];
  const safeMark = `
    <svg xmlns="http://www.w3.org/2000/svg" 
      width="18" 
      height="18" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      stroke-width="2"
      stroke-linecap="round" 
      stroke-linejoin="round" 
      class="lucide lucide-check">
      <path d="M20 6 9 17l-5-5"/>
    </svg>
  `;
  const fetchUrls = () => {
    return new Promise((resolve) => {
      if (currentTabId) {
        chrome.storage.sync.get([currentTabId], (result) => {
          if (chrome.runtime.lastError) {
            console.error("Error fetching URLs:", chrome.runtime.lastError);
            resolve([]);
          } else {
            resolve(
              result[currentTabId] ? JSON.parse(result[currentTabId]) : []
            );
          }
        });
      } else {
        resolve([]);
      }
    });
  };
  // Add the necessary CSS for the spinner animation directly in the script
  const style = document.createElement("style");
  style.type = "text/css";
  style.innerHTML = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
  document.head.appendChild(style);

  const addMarkers = async () => {
    const root = document.getElementById("react-root");
    if (!root) return;

    currentUrls = await fetchUrls();
    const redirectionLinks = Array.from(
      root.querySelectorAll('a[href^="https://t.co/"]')
    );

    redirectionLinks.forEach((link) => {
      const urlIndex = currentUrls.findIndex(
        (url) => url.shortUrl === link.href
      );

      const addWarningSign = (link) => {
        // Ensure there is no existing warning sign before adding a new one
        if (!link.querySelector('img[src$="warning-only-sign.png"]')) {
          const warningSign = document.createElement("img");
          warningSign.src = chrome.runtime.getURL(
            "assets/warning-only-sign.png"
          );
          warningSign.width = 24;
          warningSign.height = 24;
          warningSign.style.display = "inline-block";
          warningSign.style.marginLeft = "10px";
          warningSign.onclick = (event) => {
            event.stopPropagation();
            event.preventDefault();
            alert("This link is external");
          };

          // Remove any existing safe mark icon if present
          const existingSafeMark = link.querySelector(".safe-mark-icon");
          if (existingSafeMark) {
            link.removeChild(existingSafeMark);
          }

          link.appendChild(warningSign);
          link.style.color = "red";
        }
      };

      const addSafeMark = (link) => {
        // Ensure there is no existing safe mark before adding a new one
        if (!link.querySelector(".safe-mark-icon")) {
          const safeMarkElement = new DOMParser().parseFromString(
            safeMark,
            "text/html"
          ).body.firstChild;
          safeMarkElement.classList.add("safe-mark-icon");
          link.appendChild(safeMarkElement);
          link.style.color = "rgb(11, 175, 112)";

          // Remove any existing warning sign if present
          const existingWarningSign = link.querySelector(
            'img[src$="warning-only-sign.png"]'
          );
          if (existingWarningSign) {
            link.removeChild(existingWarningSign);
          }
        }
      };

      // Check if the link is already processed and safe
      currentUrls[urlIndex]?.isSafe ? addSafeMark(link) : addWarningSign(link);
    });
  };

  // Update the toggleLinkLoader to reset styles when hiding the loader
  function toggleLinkLoader(link, show) {
    let loader = link.querySelector(".link-loader");
    let warningSign = link.querySelector('img[src$="warning-only-sign.png"]');
    if (show) {
      if (!loader) {
        loader = document.createElement("div");
        loader.className = "link-loader";
        loader.style.display = "inline-block";
        loader.style.marginLeft = "10px";
        loader.style.border = "4px solid #f3f3f3"; // Light grey
        loader.style.borderTop = "4px solid #3498db"; // Blue
        loader.style.borderRadius = "50%";
        loader.style.width = "10px";
        loader.style.height = "10px";
        loader.style.animation = "spin 2s linear infinite";
        link.appendChild(loader);
      }
      loader.style.display = "inline-block";
    } else if (loader) {
      loader.style.display = "none";
      link.removeChild(loader); // Remove the loader from the DOM
    }
  }

  function updateLinkAppearance(link, isSafe) {
    const warningSign = link.querySelector('img[src$="warning-only-sign.png"]');
    const safeIcon = link.querySelector(".safe-mark-icon"); // Check for existing safeMark icon

    if (isSafe) {
      if (warningSign) {
        link.removeChild(warningSign); // Ensure the correct parent is referenced
      }
      if (!safeIcon) {
        // Only add safeMark if it doesn't exist
        const safeMarkElement = new DOMParser().parseFromString(
          safeMark,
          "text/html"
        ).body.firstChild;
        safeMarkElement.classList.add("safe-mark-icon"); // Add class for easy identification
        link.appendChild(safeMarkElement);
      }
      link.style.color = "rgb(11, 175, 112)"; // Indicate safe color
    } else {
      if (!warningSign) {
        const newWarningSign = document.createElement("img");
        newWarningSign.src = chrome.runtime.getURL(
          "assets/warning-only-sign.png"
        );
        newWarningSign.width = 24;
        newWarningSign.style.display = "inline-block";
        newWarningSign.style.marginLeft = "10px";
        link.appendChild(newWarningSign);
        link.style.color = "red"; // Indicate danger color
      }
    }
  }

  const newTwitterTab = async () => {
    currentUrls = await fetchUrls();

    const observeDOM = (container, callback) => {
      if (!container) return;
      const observer = new MutationObserver((mutations) => {
        if (mutations.some((mutation) => mutation.addedNodes.length > 0)) {
          callback();
        }
      });
      observer.observe(container, { childList: true, subtree: true });
    };

    const waitForTimeline = async () => {
      const container = document.body;
      observeDOM(container, () => {
        const timeline = document.querySelector('[role="region"]');
        if (timeline) {
          addMarkers();
        }
      });
    };

    waitForTimeline();
  };
  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    const { type, tabId } = obj;
    if (type === "TWITTER") {
      currentTabId = tabId.toString();
      newTwitterTab();
      document.addEventListener(
        "click",
        async (event) => {
          const target = event.target.closest("a[href^='https://t.co/']");
          if (!target) return;

          // Attempt to find the URL in the currentUrls array
          const urlIndex = currentUrls.findIndex(
            (url) => url.shortUrl === target.href
          );

          if (urlIndex !== -1 && currentUrls[urlIndex].isSafe) {
            return;
          }

          // Prevent default if new URL or not safe
          event.stopImmediatePropagation();
          event.preventDefault();

          toggleLinkLoader(target, true); // Show loader next to the link

          try {
            // Fetch prediction only if URL is new or wasn't safe previously
            const predictionResponse = await postURL({ urls: [target.href] });
            const predictionValue = Object.values(
              predictionResponse.data[0].predictions
            )[0];
            const isSafe = predictionValue === 0;

            updateLinkAppearance(target, isSafe);

            const predictionWithOriginalUrl = {
              ...predictionResponse.data[0],
              originalUrl: target.innerText,
              shortUrl: target.href,
              isSafe: isSafe, // Update the safety status
            };

            chrome.storage.sync.set({
              [currentTabId]: JSON.stringify([
                ...currentUrls,
                predictionWithOriginalUrl,
              ]),
            });
            if (urlIndex === -1) {
              currentUrls.push(predictionWithOriginalUrl); // Add new URL if not already in the list
            } else {
              currentUrls[urlIndex] = predictionWithOriginalUrl; // Update existing URL
            }
          } catch (error) {
            console.error("Failed to fetch prediction:", error);
            alert("Failed to process the link. Please try again.");
          } finally {
            toggleLinkLoader(target, false); // Hide the loader and update appearance
          }
        },
        true
      );
    }
  });
  newTwitterTab();
})();

async function postURL(data) {
  try {
    const response = await fetch(modelPredicitonRoute, {
      method: "POST", // or 'PUT'
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    throw new Error(`Error: ${error}`);
  }
}
