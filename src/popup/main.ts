(async () => {

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
      }
    }

    return ignore;
  }

  const stores = await fetch(chrome.runtime.getURL("../res/stores.json")).then(res => res.json());
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  let canRun = true;
  const script = await chrome.scripting.executeScript({
    target: { tabId: tab.id! },
    func: checkForProduct,
    args: [stores]
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

  
  
  function checkForProduct(stores: StoresObject) {
    let url = window.location.href;
    url = url.replace(/(https?:\/\/)?(www.)?/g, "");
    url = url.slice(0, url.indexOf("/"));
    let urlParts = url.split(".").reverse();
    urlParts.length = 2;
    url = urlParts.reverse().join(".");

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
    let url = tab.url!;
    url = url.replace(/(https?:\/\/)?(www.)?/g, "");
    url = url.slice(0, url.indexOf("/"));

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
          for (const el of optionElements) {
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
            args: [value.element]
          });
          
          for (const elementString of elementGetter![0].result!) {
            const el = PARSER.parseFromString(elementString, "text/html").body.children.item(0)!;
            const option = document.createElement("option");

            let text = el as any;
            for (let i = 0; i < value.data.length; i++) {
              const prop = value.data[i];
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

      break;
    }
  }
  
})();

// TODO: map out all the websites

// TODO: fix famousfootwear

// TODO: add to amazon, remove price per unit in the options