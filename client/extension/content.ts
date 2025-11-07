import {
  extractJobDescriptionFromDOM,
  createJobExtractionButton,
} from "@/utils/jobExtractor";
import { saveToStorage } from "@/utils/storage";

let injectedButton = false;

function getPageHTML(): string {
  return document.documentElement.outerHTML;
}

function getPageText(): string {
  return document.body.innerText;
}

function injectButton() {
  if (injectedButton) return;

  const button = createJobExtractionButton();
  document.body.appendChild(button);
  injectedButton = true;

  button.addEventListener("click", async () => {
    // Capture the full HTML page
    const pageHTML = getPageHTML();
    const pageText = getPageText();
    const pageURL = window.location.href;

    // Also try to extract basic info from DOM as fallback
    const basicJobData = extractJobDescriptionFromDOM();

    // Save page content to storage for the popup to access
    try {
      await saveToStorage("currentPageHTML", pageHTML);
      await saveToStorage("currentPageText", pageText);
      await saveToStorage("currentPageURL", pageURL);
      if (basicJobData) {
        await saveToStorage("currentJobData", basicJobData);
      }

      // Open the popup
      chrome.runtime.sendMessage({ action: "openPopup" }).catch(() => {
        // Popup may already be open
      });
    } catch (error) {
      console.error("Error saving page data:", error);
      alert("Failed to analyze page. Please try again.");
    }
  });
}

// Wait for DOM to be ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", injectButton);
} else {
  injectButton();
}

// Also inject on dynamically loaded content
const observer = new MutationObserver(() => {
  if (!injectedButton) {
    injectButton();
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: false,
});

// Listen for messages from popup or background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getJobData") {
    const jobData = extractJobDescriptionFromDOM();
    sendResponse({ jobData: jobData || null });
  } else if (request.action === "getPageHTML") {
    const pageHTML = getPageHTML();
    sendResponse({ html: pageHTML });
  } else if (request.action === "getPageText") {
    const pageText = getPageText();
    sendResponse({ text: pageText });
  } else if (request.action === "injectButton") {
    injectButton();
    sendResponse({ success: true });
  }
});
