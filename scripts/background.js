/**
 * @var cacheInitialState
 * @description Cache initial state
 * @type {{ enabled: boolean, matches: string[] }}
 */

const cacheInitialState = {
  enabled: true,
  matches: [],
};

/**
 * @function isValid
 * @description Check cache validity
 *
 * @param {object} [cache]
 */

const isValid = (cache) =>
  typeof cache.enabled === "boolean" &&
  Array.isArray(cache.matches) &&
  cache.matches.every((match) => typeof match === "string");

/**
 * @function disableIcon
 * @description Disables icon
 *
 * @param {string} [tabId]
 * @returns {boolean}
 */

const disableIcon = (tabId) => {
  chrome.browserAction.setIcon({
    path: "assets/icons/disabled.png",
    tabId,
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
    tabId,
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
    tabId,
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
    tabId,
  });
};

/**
 * @async
 * @function getCache
 * @description Retrieves cache state
 *
 * @param {string} [hostname]
 * @param {void} [responseCallback]
 * @returns {Promise<{ enabled: boolean, matches: string[] }>} Cache state
 */

const getCache = async (hostname, responseCallback) => {
  chrome.storage.local.get(null, (store) => {
    try {
      const cache = store[hostname];

      if (!isValid(cache)) throw new Error();

      responseCallback(cache);
    } catch {
      chrome.storage.local.set({ [hostname]: cacheInitialState });
      responseCallback(cacheInitialState);
    }
  });
};

/**
 * @async
 * @function getTab
 * @description Retrieves current tab information
 *
 * @param {void} [responseCallback]
 * @returns {Promise<{ id: string, location: string }>} Current tab information
 */

const getTab = (responseCallback) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    responseCallback({
      id: tabs[0].id,
      hostname: new URL(tabs[0].url).hostname,
    });
  });
};

/**
 * @async
 * @function getList
 * @description Retrieves selectors list
 *
 * @param {void} [responseCallback]
 * @returns {Promise<{ matches: string[] }>} A selectors list
 */

const getList = async (responseCallback) => {
  try {
    const url =
      "https://raw.githubusercontent.com/wanhose/do-not-consent/master/data/elements.txt";
    const response = await fetch(url);
    const data = await response.text();

    if (response.status !== 200) throw new Error();

    responseCallback({ selectors: data.split("\n") });
  } catch {
    responseCallback({ selectors: [] });
  }
};

/**
 * @async
 * @function updateCache
 * @description Update cache state
 *
 * @param {string} [hostname]
 * @param {object} [state]
 */

const updateCache = async (hostname, state) => {
  chrome.storage.local.get(null, (cache) => {
    const current = cache[hostname];

    chrome.storage.local.set({
      [hostname]: {
        enabled:
          typeof state.enabled === "undefined"
            ? current.enabled
            : state.enabled,
        matches:
          typeof state.matches === "undefined"
            ? current.matches
            : [...new Set([...current.matches, ...state.matches])],
      },
    });
  });
};

/**
 * @description Listens to content messages
 */

chrome.runtime.onMessage.addListener((request, sender, responseCallback) => {
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
      case "GET_CACHE":
        getCache(request.hostname, responseCallback);
        break;
      case "GET_LIST":
        getList(responseCallback);
        break;
      case "GET_TAB":
        getTab(responseCallback);
        break;
      case "UPDATE_CACHE":
        updateCache(request.hostname, request.state);
        break;
      default:
        break;
    }
  });

  return true;
});
