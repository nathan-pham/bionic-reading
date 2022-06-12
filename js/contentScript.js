const getSettings = () =>
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

const main = (async () => {
    const settings = await getSettings();
    if (settings.enabled) {
        applyBionicReading(settings);
    }
})();
