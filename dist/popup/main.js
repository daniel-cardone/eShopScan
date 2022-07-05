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
    const SIZE_MAPPINGS = {
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
    const stores = yield fetch(chrome.runtime.getURL("../res/stores.json")).then(res => res.json());
    const [tab] = yield chrome.tabs.query({ active: true, currentWindow: true });
    let canRun = true;
    const script = yield chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: checkForProduct,
        args: [stores]
    })
        .catch(_ => {
        canRun = false;
    });
    if (!canRun)
        return;
    const found = script[0].result;
    if (found) {
        document.querySelector("#success").classList.remove("hidden");
        createButtons();
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
                if (key === "check")
                    continue;
                if (key === "type")
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
    function createButtons() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let url = tab.url;
            url = url.replace(/(https?:\/\/)?(www.)?/g, "");
            url = url.slice(0, url.indexOf("/"));
            for (const storeName in stores) {
                const store = stores[storeName];
                if (url !== store.website)
                    continue;
                const storeType = store.type;
                if (storeType === "stock-text") {
                    const stockOptions = store.check;
                    for (const key in stockOptions) {
                        const value = stockOptions[key];
                        const button = document.createElement("button");
                        button.innerText = `Track this product for ${key}`;
                        button.addEventListener("click", () => {
                            console.log(key);
                        });
                        document.querySelector("#success").appendChild(button);
                    }
                }
                else if (storeType === "size-boxes") {
                    const sizeBoxesSelector = store.check.selector;
                    const elementGetter = yield chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        func: sizeBoxesSelector => {
                            const elements = document.querySelectorAll(sizeBoxesSelector);
                            const res = [];
                            for (const element of elements) {
                                res.push({
                                    textContent: element.textContent
                                });
                            }
                            return res;
                        },
                        args: [sizeBoxesSelector]
                    });
                    console.log(elementGetter);
                    for (const el of (_a = elementGetter[0].result) !== null && _a !== void 0 ? _a : []) {
                        const button = document.createElement("button");
                        const upperCaseText = el.textContent.toUpperCase();
                        const size = SIZE_MAPPINGS[upperCaseText] || upperCaseText;
                        button.textContent = `Track this size ${size} for this product`;
                        button.addEventListener("click", () => {
                            console.log(size);
                        });
                        document.querySelector("#success").appendChild(button);
                    }
                }
                break;
            }
        });
    }
}))();
// TODO: map out all the out of stock queries
