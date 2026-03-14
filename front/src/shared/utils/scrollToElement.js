export const scrollToElement = (elementName) => {
    const element = document.getElementById(elementName);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
};
