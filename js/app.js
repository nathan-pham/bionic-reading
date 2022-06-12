import { getTab, getSettings, syncSettings } from "/js/extension.js";
import { $, $$ } from "/js/query.js";

const enableButton = $("button");
const inputs = $$(".input input[type='range']");

// application state
const defaultSettings = { fixation: 3, saccades: 5, enabled: false };
let settings = Object.assign(defaultSettings, await getSettings());

const applyBionicReading = (settings = defaultSettings) => {
    const textElements = [...document.querySelectorAll("p")];
    const { fixation, saccades } = settings;
    const fixationFactor = (fixation * 2) / 10;
    const saccadesFactor = 5 - saccades;

    // fixation: amount bolded
    // saccades: frequency of modifications

    textElements.forEach((el) => {
        const words = el.textContent
            .toString()
            .split(" ")
            .map((word, i) => {
                const divider = Math.max(
                    Math.floor(fixationFactor * word.length),
                    1
                );

                if (i % saccadesFactor == 0) {
                    return (
                        `<b>${word.substring(0, divider)}</b>` +
                        word.substring(divider)
                    );
                }

                return word;
            });

        el.innerHTML = words.join(" ");
    });
};

enableButton.addEventListener("click", async () => {
    const tab = await getTab();

    // save enabled settings
    settings.enabled = !settings.enabled;
    updateEnableButton();
    syncSettings(compileInputs());

    if (tab && chrome.scripting) {
        chrome.scripting.executeScript({
            target: { tabId: tab.id, allFrames: true },
            func: applyBionicReading,
            args: [settings],
        });
    }
});

const updateEnableButton = () => {
    if (settings.enabled) {
        enableButton.textContent = "Disable";
    } else {
        enableButton.textContent = "Enable";
    }
};

// compile inputs to settings
const compileInputs = () =>
    Object.assign(
        defaultSettings,
        settings,
        inputs.reduce(
            (acc, input) => ({
                ...acc,
                [input.name]: parseInt(input.value),
            }),
            {}
        )
    );

// changes to inputs with sync settings to local storage
inputs.forEach((input) => {
    input.addEventListener("change", () => {
        settings = compileInputs();
        syncSettings(settings);
    });
});

// on startup sync UI to saved changes
Object.keys(settings).forEach((key) => {
    const input = inputs.find((input) => input.name === key);

    if (input) {
        input.value = settings[key];
    }
});

updateEnableButton();
