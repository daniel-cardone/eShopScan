(async () => {

  const stores = await fetch(chrome.runtime.getURL("../res/stores.json")).then(res => res.json());
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const script = await chrome.scripting.executeScript({
    target: { tabId: tab.id! },
    func: checkForProduct,
    args: [stores]
  });
  const found = script[0].result!;

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
        if (key === "stock") continue;

        const value = store[key];
        if (!document.querySelector(value)) {
          hasProduct = false;
          break;
        }
      }
    }

    return onStoreSite && hasProduct;
  }

  function createButtons() {
    let url = tab.url!;
    url = url.replace(/(https?:\/\/)?(www.)?/g, "");
    url = url.slice(0, url.indexOf("/"));

    for (const storeName in stores) {
      const store = stores[storeName];

      if (url !== store.website) continue;

      const stockOptions = store.stock;

      for (const key in stockOptions) {
        const value = stockOptions[key];
        const button = document.createElement("button");
        button.innerText = `Track this product for ${key}`;
        button.addEventListener("click", () => {
          chrome.tabs.update({ url: value });
        });
        document.querySelector("#success")!.appendChild(button);
      }

      break;
    }
  }
  
})();

// TODO: add famous footwear, michaels

// TODO: map out all the out of stock queries