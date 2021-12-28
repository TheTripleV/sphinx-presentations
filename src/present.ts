"use strict";
export { present, buildPresentation};

import Reveal from 'reveal.js';
import { match, __, not, select, when, isMatching } from 'ts-pattern';

import {H, _H} from './element';
import {splitParagraph} from './split';
import { createScriptElement, createScriptSrcElement, htmlToElement} from './utils';
import {Slide, Item, buildSlide, Presentation, splitSlide} from './slide';


function buildPresentation(presentation: Presentation, slidesElement: _H){
    /* Generate HTML for an entire presentation.
        This is non-idempotent. The slidesElement passed in is modified.
        If a new slidesElement is returned, then the presentation library
        will have an reference to an out-of-date slide deck.
    */
    while (slidesElement.element.firstChild) {
        slidesElement.element.removeChild(slidesElement.element.firstChild);
    }
    for (const [index, slide] of presentation.slides.entries()) {
        
        let builtSlide = buildSlide(slide);
        slidesElement.append(
            builtSlide
        )
    }
}


function createSlides(elements: Element[]): Slide[] {
    let slides: Slide[] = [];

    let title = "";
    for (const element of elements) {
        if (["H1", "H2", "H3", "H4", "H5", "H6"].includes(element.tagName)) {
            // We have a title slide

            for (const child of element.children) {
                // Don't show the paragraph symbol that headerlinks use
                if (child.classList.contains("headerlink")) {
                    child.remove();
                }
            }
            
            title = element.textContent;
            slides.push({ type: "title", title: title, items: [] });
            continue;
        }

        if (element.classList.contains("image-reference")) {
            slides.push({ type: "figure and content", title: title, figure: {type: "figure", h: H(element)}, items:[] });
            continue;
        } else if (! isMatching({type: "figure and content"}, slides.at(-1))) {
            slides.push({ type: "content",  title: title, items: [] });
        }
        
        if (element.tagName.toLowerCase() == "p") {
            let text = element.textContent;
            text = text.replace(/\n/g, " ");
            let paragraphs = splitParagraph(text);

            for(const p of paragraphs) {
                // Create a text item with bullet points for each sentence
                slides.at(-1).items.push({ type: "text", text: p });
            }
            continue;
        }

        slides.at(-1).items.push({type: "html", h: H(element) });

    }

    return slides;

}

function getElements(): Element[] {
    let elements = [];
    let webSections = document.getElementsByClassName("section");
    for (const section of webSections) {
        for(const child of section.children) {
            if (child.classList.contains("section")) {
                break;
            }
            elements.push(child);
        }
    }
    return elements;
}

function present(): void {
    /* Start the presentation.
        This function gets called when the page loads at the window level in the browser.
        It is responsible for setting up the presentation and building it.
        This function reads the source HTML and generates the ADT.
        buildPresentation is then called to generate the presentation.
    */

    // Structure created below is:
    // -----
    // <reveal>
    //   <slides>
    //     <section> -> 1 section per slide
    //   </slides>
    // </reveal>
    // -----

    let reveal = H("div")
        .addClass("reveal")

    let slides = H("div")
        .addClass("slides");

    (window as any).slides = slides;

    let peabody = H("body")
        .addClass("rst-content")
        .append(
            reveal
                .append(slides)
        )

    reveal.prepend(
        htmlToElement(
            `<style>
            h1, h2, h3, h4, h5, h6 {
                align: left;
                left: 0px;
                font-size:42px;
            }
            p {
                font-size: 22px;
                text-align: left;
            }
            .break{
                display:block;
                margin:0 0 1em;
            }
        </style>
        `
        )
    );


    let elements = getElements();
    let slidesArray = createSlides(elements);
    console.log(slidesArray);
    let presentation = {slides: slidesArray};

    buildPresentation(presentation, slides);

    // Download the CSS for the presentation library
    peabody.prepend(
        htmlToElement(
            `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@4.1.2/dist/reveal.css">`
        )
    );

    peabody.append(
        // Download the JS for the presentation library
        createScriptSrcElement(
            `https://cdn.jsdelivr.net/npm/headjs@1.0.3/dist/1.0.0/head.min.js`,
            () => {
                peabody.append(
                    // Download the CSS for the presentation library
                    createScriptSrcElement(
                        `https://cdn.jsdelivr.net/npm/reveal.js@4.1.2/dist/reveal.min.js`,
                        () => {
                            initializePresentation(presentation, Reveal)
                        }
                    )
                )
            }
        )
    );

    // Inject the built presentation into the page
    let sherman = document.getElementsByTagName("body")[0];
    sherman.parentNode.replaceChild(peabody.element, sherman);

}
(window as any).present = present;

function initializePresentation(presentation: Presentation, reveal: Reveal) {
    /* This function is called after the presentation has been built.
        It initializes the presentation library and sets up a callback for splitting slides.
    */

    // Initialize the presentation library
    Reveal.initialize({
        controls: true,
        width: '100%',
        height: '100%',
        progress: true,
        slideNumber: true,
        history: false,
        keyboard: true,
        overview: true,
        center: false,
        disableLayout: true,
        touch: true,
        loop: false,
        rtl: false,
        shuffle: false,
        fragments: true,
        embedded: false,
        help: true,
        showNotes: false,
        autoPlayMedia: null,
        autoSlide: 0,
        autoSlideStoppable: true,
        autoSlideMethod: Reveal.navigateNext,
        mouseWheel: false,
        hideAddressBar: false,
        previewLinks: true,
        transition: 'slide', 
        transitionSpeed: 'default',
        backgroundTransition: 'fade',
        viewDistance: 3,
        parallaxBackgroundImage: '', 
        parallaxBackgroundSize: '',
        parallaxBackgroundHorizontal: null,
        parallaxBackgroundVertical: null,
        display: 'block'
    });

    Reveal.on( 'slidetransitionend', event => {
        // This is called when the current slide changes.
        let slideIndex = event.indexh;
        let slideHeight = event.currentSlide.getBoundingClientRect().height;
        let windowHeight = window.innerHeight;

        if (slideHeight > windowHeight) {
            // Split the current slide if it is too tall for the browser window
            let slide = presentation.slides[slideIndex];
            let newSlides = splitSlide(slide);
            if (newSlides.length == 1) {
                return;
            }
            let [slide1, slide2] = newSlides;
            presentation.slides[slideIndex] = slide1;
            presentation.slides.splice(slideIndex, 0, slide2);

            // @ts-ignore
            buildPresentation(window.slides);

            // Force a refresh of the presentation
            Reveal.slide( event.indexh, event.indexv, event.indexf );
        }

    });
}
(window as any).initializePresentation = initializePresentation;

window.addEventListener("DOMContentLoaded", () => {
    const query = window.location.search;
    const urlParams = new URLSearchParams(query);
    const shouldPresent = urlParams.get("present") != null;
    if (shouldPresent) {
        present();
    }
});


// window.addEventListener("DOMContentLoaded", () => {
//     /* Inject a "Present" button into the page so the user can launch the presentation. */
//     let fries = document.getElementsByClassName("wy-breadcrumbs-aside")[0];

//     let button = document.createElement("button");
//     button.textContent = "Present!";
//     button.onclick = present;

//     fries.appendChild(button);
// });
