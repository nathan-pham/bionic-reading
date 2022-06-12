import { getTab, getSettings, syncSettings } from "/js/extension.js";
import { $, $$ } from "/js/query.js";

const enableButton = $("button");
const inputs = $$(".input input[type='range']");

// application state
let settings = Object.assign({ fixation: 3, saccades: 5 }, await getSettings());

enableButton.addEventListener("click", async () => {
    const tab = await getTab();

    if (tab && chrome.scripting) {
        chrome.scripting.executeScript({
            target: { tabId: tab.id, allFrames: true },
            func: (settings) => {
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
            },
            args: [settings],
        });
    }
});

// compile inputs to settings
const compileInputs = () =>
    inputs.reduce(
        (acc, input) => ({
            ...acc,
            [input.name]: parseInt(input.value),
        }),
        {}
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
