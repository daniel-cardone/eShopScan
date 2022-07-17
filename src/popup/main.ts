const URLS = {
  stores: "http://localhost:8000/stores",
  userdata: "http://localhost:8000/userdata",
  track: "http://localhost:8000/track",
  untrack: "http://localhost:8000/untrack"
};

const SIZE_MAPPINGS: SizeMap = {
  "XXXS": "3X Small",
  "XXS": "2X Small",
  "XS": "Extra Small",
  "S": "Small",
  "M": "Medium",
  "L": "Large",
  "XL": "Extra Large",
  "XXL": "2X Large",
  "XXXL": "3X Large",
  "XXXXL": "4X Large",
  "XXXXXL": "5X Large",
  "3XS": "3X Small",
  "2XS": "2X Small",
  "1XS": "Extra Small",
  "1XL": "Extra Large",
  "2XL": "2X Large",
  "3XL": "3X Large",
  "4XL": "4X Large",
  "5XL": "5X Large"
};

const PARSER = new DOMParser();

function getSizeMappedText(text: string) {
  return SIZE_MAPPINGS[text] ?? text;
}

function sliceURL(url: string) {
  url = url.replace(/(https?:\/\/)?(www.)?/g, "");
  url = url.slice(0, url.indexOf("/"));
  let urlParts = url.split(".").reverse();
  urlParts.length = 2;
  url = urlParts.reverse().join(".");
  return url;
}

function shouldIgnoreLabel(labelsToIgnore: IgnoredLabel[], text: any, label: Element, container: Element) {
  let ignore = false;
  for (const labelToIgnore of labelsToIgnore) {
    if (labelToIgnore.type === "label-has-text") {
      if (text?.includes(labelToIgnore.rule)) {
        ignore = true;
        break;
      }
    } else if (labelToIgnore.type === "parent-has-text") {
      if (container.textContent?.includes(labelToIgnore.rule)) {
        ignore = true;
        break;
      }
    } else if (labelToIgnore.type === "label-equals-text") {
      if (text === labelToIgnore.rule) {
        ignore = true;
        break;
      }
    } else if (labelToIgnore.type === "parent-equals-text") {
      if (container.textContent === labelToIgnore.rule) {
        ignore = true;
        break;
      }
    } else if (labelToIgnore.type === "label-matches-selector") {
      if (label.matches(labelToIgnore.rule)) {
        ignore = true;
        break;
      }
    } else if (labelToIgnore.type === "parent-matches-selector") {
      if (container.matches(labelToIgnore.rule)) {
        ignore = true;
        break;
      }
    } else if (labelToIgnore.type === "label-has-selector") {
      if (label.querySelector(labelToIgnore.rule) !== null) {
        ignore = true;
        break;
      }
    } else if (labelToIgnore.type === "parent-has-selector") {
      if (container.querySelector(labelToIgnore.rule) !== null) {
        ignore = true;
        break;
      }
    }
  }

  return ignore;
}

let id: string | null = null;
chrome.identity.getProfileUserInfo(res => {
  id = res.id;

  if (!id) {
    document.querySelector("#noID")!.classList.remove("hidden");
    document.querySelector("#loading")!.classList.add("hidden");
    document.querySelector("#viewAllContainer")!.classList.add("hidden");
  } else {
    main();
  }
});

async function main() {

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const stores = await fetch(URLS.stores).then(res => res.json()).catch(err => {});

  let canRun = true;
  const script = await chrome.scripting.executeScript({
    target: { tabId: tab.id! },
    func: checkForProduct,
    args: [stores, sliceURL(tab.url!)]
  })
  .catch(_ => {
    canRun = false;
  });
  if (!canRun) {
    document.querySelector("#failure")!.classList.remove("hidden");
    document.querySelector("#loading")!.classList.add("hidden");
    return;
  }
  
  const found = script![0].result!;

  if (found) {
    document.querySelector("#success")!.classList.remove("hidden");
    createButtons();
  } else {
    document.querySelector("#failure")!.classList.remove("hidden");
  }
  document.querySelector("#loading")!.classList.add("hidden");

  
  
  async function checkForProduct(stores: StoresObject, url: string) {
    while (document.readyState !== "complete") {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    let onStoreSite = false;
    let hasProduct = true;

    for (const storeName in stores) {
      const store = stores[storeName];
      
      if (url !== store.website) continue;
      onStoreSite = true;

      for (const key in store) {
        if (key === "website") continue;
        if (key === "form") continue;

        const value = store[key];
        if (!document.querySelector(value)) {
          hasProduct = false;
          break;
        }
      }
      break;
    }

    return onStoreSite && hasProduct;
  }

  async function createButtons() {
    const url = sliceURL(tab.url!);

    for (const storeName in stores) {
      const store: Store = stores[storeName];
      
      if (url !== store.website) continue;
      
      const formData = store.form as StoreOptionsObject;
      const form = document.createElement("form");

      const heading = document.createElement("h2");
      heading.textContent = "Track an Item:";
      form.append(heading);

      const productNameGetter = await chrome.scripting.executeScript({
        target: { tabId: tab.id! },
        func: selector =>  document.querySelector(selector)!.outerHTML,
        args: [store.name]
      });
      const itemNameString = productNameGetter![0].result!;
      const itemName = PARSER.parseFromString(itemNameString, "text/html").body.children.item(0)!.textContent;
      const itemNameElement = document.createElement("p");
      itemNameElement.textContent = itemName;
      form.append(itemNameElement);

      if (Object.keys(formData.general).length > 0) {
        const data = formData.general as StoreGeneralOptions;

        const containersGetter = await chrome.scripting.executeScript({
          target: { tabId: tab.id! },
          func: (selector: string, parents: number) => {
            return [...document.querySelectorAll(selector)].map(el => {
              for (let i = 0; i < parents; i++) {
                el = el.parentElement!;
              }
              return el.outerHTML;
            });
          },
          args: [data.container, data.parents]
        });

        const containersArray: string[] = containersGetter![0].result!;
        const containers = containersArray.map(el => PARSER.parseFromString(el, "text/html").body.children.item(0)!);

        for (const container of containers) {
          const selectWrapper = document.createElement("div");
          selectWrapper.classList.add("select-wrapper");
          const label = document.createElement("label");
          let text = container as any;
          for (let i = 0; i < data.label.func.length; i++) {
            const prop = data.label.func[i];
            const args = data.label.args[i];
            if (args === null) {
              text = text[prop]!;
            } else {
              text = text[prop](...args);
            }
          }

          const labelsToIgnore = data.label.labelsToIgnore;
          if (shouldIgnoreLabel(labelsToIgnore, text, label, container)) continue;

          label.textContent = `${text}: `;
          label.setAttribute("for", text);
          selectWrapper.append(label);

          const dropdown = document.createElement("select");
          dropdown.setAttribute("name", text);

          const optionElements = container.querySelectorAll(data.options.query);
          const fallbackElements = data.options.fallback ? container.querySelectorAll(data.options.fallback.query) : null;
          for (let i = 0; i < optionElements.length; i++) {
            let el = optionElements.item(i);
            let text = el as any;
            for (let i = 0; i < data.options.func.length; i++) {
              const prop = data.options.func[i];
              const args = data.options.args[i];
              if (args === null) {
                text = text[prop]!;
              } else {
                text = text[prop](...args);
              }
            }

            if (text === "" && fallbackElements !== null) {
              el = fallbackElements.item(i);
              text = el as any;
              for (let i = 0; i < data.options.fallback!.func.length; i++) {
                const prop = data.options.fallback!.func[i];
                const args = data.options.fallback!.args[i];
                console.log(text, prop, args)
                if (args === null) {
                  text = text[prop]!;
                } else {
                  text = text[prop](...args);
                }
              }
            }

            text = getSizeMappedText(text);

            const option = document.createElement("option");
            option.textContent = text;
            option.value = text;
            dropdown.append(option);
          }

          selectWrapper.append(dropdown);
          form.append(selectWrapper);
        }
      }

      if (Object.keys(formData.extra).length > 0) {
        for (const key in formData.extra) {
          const data = formData.extra as StoreExtraOptions;
          const value = data[key];
          
          const dropdown = document.createElement("select");
          dropdown.id = key;
          dropdown.name = key;
          dropdown.classList.add("dropdown");

          const elementGetter = await chrome.scripting.executeScript({
            target: { tabId: tab.id! },
            func: selector =>  [...document.querySelectorAll(selector)].map(el => el.outerHTML),
            args: [value.query]
          });
          
          for (const elementString of elementGetter![0].result!) {
            const el = PARSER.parseFromString(elementString, "text/html").body.children.item(0)!;
            const option = document.createElement("option");

            let text = el as any;
            for (let i = 0; i < value.func.length; i++) {
              const prop = value.func[i];
              if (value.args[i] === null) {
                text = text[prop]!;
              } else {
                text = text[prop](...value.args[i]);
              }
            }

            text = getSizeMappedText(text);

            option.textContent = text;
            option.value = text;
            dropdown.append(option);
          }
          
          const selectWrapper = document.createElement("div");
          selectWrapper.classList.add("select-wrapper");

          if (dropdown.children.length > 0) {
            const label = document.createElement("label");
            label.textContent = `${key}: `;
            label.setAttribute("for", key);
            selectWrapper.append(label, dropdown);
          }

          form.append(selectWrapper);
        }
      }

      document.querySelector("#success")!.append(form);

      const trackButton = document.createElement("button");
      trackButton.textContent = "Track";
      trackButton.addEventListener("click", () => {
        document.querySelector("#success")!.remove();
        document.querySelector("#processingRequest")!.classList.remove("hidden");
        const formData = new FormData(document.querySelector("form")!);
        const data: TrackRequest = {
          productURL: tab.url!,
          userID: id!,
          formData: {}
        };
        for (const key of formData.keys()) {
          data.formData[key] = formData.get(key)!.toString();
        }

        fetch(URLS.track, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
        })
        .then(res => {
          if (!res.ok) {
            return res.text().then(text => { throw new Error(text) });
          }
          finishUp(0);
        })
        .catch(trackingError);
      });
      document.querySelector("#success")!.append(trackButton);

      const untrackButton = document.createElement("button");
      untrackButton.textContent = "Untrack";
      untrackButton.addEventListener("click", () => {
        document.querySelector("#success")!.remove();
        document.querySelector("#processingRequest")!.classList.remove("hidden");
        fetch(URLS.untrack, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ productURL: tab.url!, userID: id! })
        })
        .then(res => {
          if (!res.ok) {
            return res.text().then(text => { throw new Error(text) });
          }
          finishUp(1);
        })
        .catch(trackingError);
      });
      document.querySelector("#success")!.append(untrackButton);

      break;
    }
  }

  function finishUp(code: 0 | 1) {
    const text = ["Tracked!", "Untracked!"][code];
    document.querySelector("#processingRequest")!.classList.add("hidden");
    document.querySelector("#goodRequest")!.classList.remove("hidden");
    document.querySelector("#resultRequestText")!.textContent = text;
  }

  function trackingError(errorText: string) {
    document.querySelector("#processingRequest")!.classList.add("hidden");
    document.querySelector("#badRequest")!.classList.remove("hidden");
    document.querySelector("#errorInfo")!.textContent = errorText;
  }
  
};

// TODO: map out all the websites

// TODO: more amazon testing

// TODO: animation for success from backend, fix fetch catching