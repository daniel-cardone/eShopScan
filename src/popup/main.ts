(async () => {

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
        if (key === "check") continue;
        if (key === "type") continue;

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
      const store = stores[storeName];

      if (url !== store.website) continue;

      const storeType: StoreType = store.type;
      if (storeType === "stock-text") {
        const stockOptions = store.check;

        for (const key in stockOptions) {
          const value = stockOptions[key];
          const button = document.createElement("button");
          button.innerText = `Track this product for ${key}`;
          button.addEventListener("click", () => {
            console.log(key);
          });
          document.querySelector("#success")!.appendChild(button);
        }
      } else if (storeType === "size-boxes") {
        const sizeBoxesSelector = store.check.selector;

        const elements = await chrome.scripting.executeScript({
          target: { tabId: tab.id! },
          func: sizeBoxesSelector => document.querySelectorAll(sizeBoxesSelector),
          args: [sizeBoxesSelector]
        });

        console.log(elements)
        
        for (const el of elements![0].result ?? []) {
          const button = document.createElement("button");
          const upperCaseText = el.innerText.toUpperCase();
          const size = SIZE_MAPPINGS[upperCaseText] || upperCaseText;
          button.innerText = `Track this size ${size} for this product`;
          button.addEventListener("click", () => {
            console.log(size);
          });
          el.appendChild(button);
        }
      }

      break;
    }
  }
  
})();

// TODO: map out all the out of stock queries