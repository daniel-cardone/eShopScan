"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
(() => __awaiter(void 0, void 0, void 0, function* () {
    const stores = yield fetch(chrome.runtime.getURL("../res/stores.json")).then(res => res.json());
    const [tab] = yield chrome.tabs.query({ active: true, currentWindow: true });
    const script = yield chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: checkForProduct,
        args: [stores]
    });
    const found = script[0].result;
    if (found) {
        document.querySelector("#success").classList.remove("hidden");
    }
    else {
        document.querySelector("#failure").classList.remove("hidden");
    }
    document.querySelector("#loading").classList.add("hidden");
    function checkForProduct(stores) {
        let url = window.location.href;
        url = url.replace(/(https?:\/\/)?(www.)?/g, "");
        url = url.slice(0, url.indexOf("/"));
        let onStoreSite = false;
        let hasProduct = true;
        for (const storeName in stores) {
            const store = stores[storeName];
            if (url !== store.website)
                continue;
            onStoreSite = true;
            for (const key in store) {
                if (key === "website")
                    continue;
                const value = store[key];
                if (!document.querySelector(value)) {
                    hasProduct = false;
                    break;
                }
            }
        }
        return onStoreSite && hasProduct;
    }
}))();
