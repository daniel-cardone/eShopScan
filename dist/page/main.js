"use strict";
// TODO: give the cards a dropdown with extra info (may need to change css so it doesnt look ugly)
(async () => {
    const ID = await new Promise(resolve => chrome.identity.getProfileUserInfo(info => resolve(info.id)));
    const URL = `http://localhost:8000/user/${ID}`;
    fetch(URL)
        .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error("Could not fetch user data");
    })
        .then((data) => {
        for (const product of data) {
            const card = document.createElement("div");
            card.classList.add("card");
            const img = document.createElement("img");
            img.setAttribute("src", product.img);
            img.setAttribute("alt", product.name);
            const container = document.createElement("div");
            container.classList.add("card-info");
            const name = document.createElement("h3");
            name.textContent = product.name;
            const a = document.createElement("a");
            a.setAttribute("href", product.productURL);
            a.setAttribute("target", "_blank");
            a.textContent = "Product Page";
            container.append(name, a);
            card.append(img, container);
            document.getElementsByClassName("card-container")[0].append(card);
        }
    })
        .catch(error => {
        const errorText = document.createElement("h2");
        errorText.classList.add("err");
        errorText.textContent = "There was an error loading your data. Please try again later.";
        document.body.appendChild(errorText);
    });
})();
