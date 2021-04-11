/**
 * @function disableIcon
 * @description Disables icon
 *
 * @param {string} [tabId]
 */

const disableIcon = (tabId) => {
  chrome.browserAction.setIcon({
    path: "assets/icons/disabled.png",
    tabId: tabId,
  });
};

/**
 * @function disablePopup
 * @description Disables popup
 *
 * @param {string} [tabId]
 */

const disablePopup = (tabId) => {
  chrome.browserAction.setPopup({
    popup: "",
    tabId: tabId,
  });
};

/**
 * @function enableIcon
 * @description Enables icon
 *
 * @param {string} [tabId]
 */

const enableIcon = (tabId) => {
  chrome.browserAction.setIcon({
    path: "assets/icons/enabled.png",
    tabId: tabId,
  });
};

/**
 * @function enablePopup
 * @description Enables popup
 *
 * @param {string} [tabId]
 */

const enablePopup = (tabId) => {
  chrome.browserAction.setPopup({
    popup: "popup.html",
    tabId: tabId,
  });
};

/**
 * @description Listens to content messages
 */

chrome.runtime.onMessage.addListener((request) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    const tabId = tab.id;

    switch (request.type) {
      case "DISABLE_ICON":
        disableIcon(tabId);
        break;
      case "DISABLE_POPUP":
        disablePopup(tabId);
        break;
      case "ENABLE_ICON":
        enableIcon(tabId);
        break;
      case "ENABLE_POPUP":
        enablePopup(tabId);
        break;
      default:
        break;
    }
  });
});
