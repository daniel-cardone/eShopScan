(async () => {

  const SIZE_MAPPINGS: SizeMap = {
    "XXXS": "3XSMALL",
    "XXS": "2XSMALL",
    "XS": "XSMALL",
    "S": "SMALL",
    "M": "MEDIUM",
    "L": "LARGE",
    "XL": "XLARGE",
    "XXL": "2XLARGE",
    "XXXL": "3XLARGE",
    "XXXXL": "4XLARGE",
    "XXXXXL": "5XLARGE",
    "3XS": "3XSMALL",
    "2XS": "2XSMALL",
    "1XS": "XSMALL",
    "1XL": "XLARGE",
    "2XL": "2XLARGE",
    "3XL": "3XLARGE",
    "4XL": "4XLARGE",
    "5XL": "5XLARGE"
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
  if (!canRun) return;
  
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
        if (key === "type") continue;
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

      const storeType: StoreType = store.type;
      if (storeType === "stock-text") {
        const stockOptions = store.check;

        for (const key in stockOptions) {
          const value = stockOptions[key];
          const button = document.createElement("button");
          button.textContent = `Track this product for ${key}`;
          button.addEventListener("click", () => {
            console.log(key);
          });
          document.querySelector("#success")!.appendChild(button);
        }
      } else if (storeType === "size-color-boxes") {
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

            option.textContent = text;
            option.value = text;
            dropdown.appendChild(option);
          }

          form.appendChild(dropdown);
        }

        document.querySelector("#success")!.appendChild(form);
      }

      break;
    }
  }
  
})();

// TODO: map out all the out of stock queries