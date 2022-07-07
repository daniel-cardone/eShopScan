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
    if (!canRun) {
        document.querySelector("#failure").classList.remove("hidden");
        document.querySelector("#loading").classList.add("hidden");
        return;
    }
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
                if (key === "types")
                    continue;
                if (key === "form")
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
                const storeTypes = store.type;
                const formData = store.form;
                const form = document.createElement("form");
                for (const key in formData) {
                    const value = formData[key];
                    const dropdown = document.createElement("select");
                    dropdown.id = key;
                    dropdown.name = key;
                    dropdown.classList.add("dropdown");
                    const elementGetter = yield chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        func: selector => [...document.querySelectorAll(selector)].map(el => el.outerHTML),
                        args: [value.element]
                    });
                    for (const elementString of elementGetter[0].result) {
                        const el = (new DOMParser()).parseFromString(elementString, "text/html").body.children.item(0);
                        const option = document.createElement("option");
                        let text = el;
                        for (let i = 0; i < value.data.length; i++) {
                            const prop = value.data[i];
                            if (value.args[i] === null) {
                                text = text[prop];
                            }
                            else {
                                text = text[prop](...value.args[i]);
                            }
                        }
                        text = (_a = SIZE_MAPPINGS[text]) !== null && _a !== void 0 ? _a : text;
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
                document.querySelector("#success").append(form);
                break;
            }
        });
    }
}))();
// TODO: map out all the out of stock queries
