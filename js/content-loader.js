async function loadSiteData() {

    const response = await fetch("../data/site-data.json");
    const data = await response.json();

    applyIndexContent(data.index);

}

function applyIndexContent(indexData){

    const verticalSections = document.querySelectorAll(".text-image-vertical");
    const rightSections = document.querySelectorAll(".text-image-right");

    // ----- SECCIONES VERTICALES -----
    verticalSections.forEach((section, i) => {

        if(!indexData.vertical[i]) return;

        const title = section.querySelector("h2");
        const paragraph = section.querySelector("p");

        if(title){
            title.textContent = indexData.vertical[i].title;
        }

        if(paragraph){
            paragraph.textContent = indexData.vertical[i].text;
        }

    });

    // ----- SECCION DERECHA -----
    rightSections.forEach((section, i) => {

        if(!indexData.right[i]) return;

        const title = section.querySelector("h2");
        const paragraph = section.querySelector("p");

        if(title){
            title.textContent = indexData.right[i].title;
        }

        if(paragraph){
            paragraph.textContent = indexData.right[i].text;
        }

    });

}