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

    let onStoreSite = false;
    let hasProduct = true;

    for (const storeName in stores) {
      const store = stores[storeName];
      
      if (url !== store.website) continue;
      onStoreSite = true;

      for (const key in store) {
        if (key === "website") continue;
        if (key === "types") continue;
        if (key === "form") continue;

        const value = store[key];
        if (!document.querySelector(value)) {
          hasProduct = false;
          break;
        }
      }
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

      const storeTypes: StoreType = store.type;
      const formData = store.form as SizeBoxesObject;
      const form = document.createElement("form");

      for (const key in formData) {
        const value = formData[key];
        
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
          const el = (new DOMParser()).parseFromString(elementString, "text/html").body.children.item(0)!;
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

          text = SIZE_MAPPINGS[text] ?? text;

          option.textContent = text;
          option.value = text;
          dropdown.append(option);
        }
        
        const container = document.createElement("div");

        if (dropdown.children.length > 0) {
          const label = document.createElement("label");
          label.textContent = `${key}: `;
          label.setAttribute("for", key);
          container.append(label, dropdown);
        }

        form.append(container);
      }

      document.querySelector("#success")!.append(form);

      break;
    }
  }
  
})();

// TODO: map out all the out of stock queries