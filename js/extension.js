export const getTab = () =>
    new Promise((resolve) => {
        if (chrome.tabs) {
            chrome.tabs.query(
                {
                    active: true,
                    lastFocusedWindow: true,
                },
                (tabs) => {
                    resolve(tabs[0]);
                }
            );
        } else {
            resolve(null);
        }
    });

export const getSettings = () =>
    new Promise((resolve) => {
        if (chrome.storage) {
            chrome.storage.local.get(["settings"], (data) => {
                console.log(data);
                resolve(data["settings"]);
            });
        } else {
            resolve({});
        }
    });

export const syncSettings = (settings = {}) => {
    if (chrome.storage) {
        console.log(settings);
        chrome.storage.local.set({ settings });
    }
};
