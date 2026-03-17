async function includeFiles() {
    const elements = Array.from(document.getElementsByTagName("*"));

    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        const file = element.getAttribute("data-include-file") || element.getAttribute("xlu-include-file");

        if (!file) {
            continue;
        }

        const clone = element.cloneNode(false);

        try {
            const response = await fetch(file);
            if (!response.ok) {
                return;
            }

            let content = await response.text();

            if (file === "article-template.html") {
                const articleData = {
                    title: element.getAttribute("data-title"),
                    subtitle: element.getAttribute("data-subtitle"),
                    date: element.getAttribute("data-date"),
                    displayDate: element.getAttribute("data-display-date"),
                    content: element.getAttribute("data-content"),
                    image: element.getAttribute("data-image"),
                    imageCaption: element.getAttribute("data-image-caption")
                };

                content = content.replace(/{{title}}/g, articleData.title)
                    .replace(/{{subtitle}}/g, articleData.subtitle)
                    .replace(/{{date}}/g, articleData.date)
                    .replace(/{{displayDate}}/g, articleData.displayDate)
                    .replace(/{{content}}/g, articleData.content)
                    .replace(/{{image}}/g, articleData.image || "")
                    .replace(/{{imageCaption}}/g, articleData.imageCaption || "");
            }

            clone.removeAttribute("data-include-file");
            clone.removeAttribute("xlu-include-file");
            clone.innerHTML = content;
            element.parentNode.replaceChild(clone, element);
            includeFiles();
        } catch (error) {
            console.error("Error fetching file:", error);
        }

        return;
    }
}

window.includeFiles = includeFiles;
window.xLuIncludeFile = includeFiles;
