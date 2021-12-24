import { describe } from 'mocha';
import { expect } from 'chai';
import { present, buildPresentation, buildPresentationCPS, splitSlide, splitSlideCPS, buildItem, buildItemCPS, buildSlide, buildSlideCPS, Slide, Item, Text, Html, Figure, Presentation } from '../src/present';
import { H } from '../src/element';

describe("splitSlide", () => {

    describe("title", () => {
        it("size small slide", () => {
            let slide: Slide = {type: "title", items: [], path: []};
            let splitSlides = splitSlide(slide);
            expect(splitSlides.length).to.equal(1);
        });

        it("size big slide", () => {
            let slide: Slide = {type: "title", items: [{type: "text", text: "asdf1"}, {type: "text", text: "asdf2"}], path: []};
            let splitSlides = splitSlide(slide);
            expect(splitSlides.length).to.equal(1);
        });

        it("contents small slide", () => {
            let slide: Slide = {type: "title", items: [], path: []};
            let splitSlides = splitSlide(slide);
            expect(splitSlides[0]).to.deep.equal(slide);
        });

        it("contents big slide", () => {
            let slide: Slide = {type: "title", items: [{type: "text", text: "asdf1"}, {type: "text", text: "asdf2"}, {type: "text", text: "asdf3"}], path: []};
            let splitSlides = splitSlide(slide);
            expect(splitSlides[0]).to.deep.equal(slide);
        });

    });

    describe("title and contents", () => {
        it("size small slide", () => {
            let slide: Slide = {type: "title and content", items: [{type: "text", text: "asdf1"}, {type: "text", text: "asdf2"}], path: []};
            let splitSlides = splitSlide(slide);
            expect(splitSlides.length).to.equal(1);
        });

        it("size big slide", () => {
            let slide: Slide = {type: "title and content", items: [{type: "text", text: "asdf1"}, {type: "text", text: "asdf2"}, {type: "text", text: "asdf3"}], path: []};
            let splitSlides = splitSlide(slide);
            expect(splitSlides.length).to.equal(2);
        });

        it("contents small slide", () => {
            let slide: Slide = {type: "title and content", items: [{type: "text", text: "asdf1"}, {type: "text", text: "asdf2"}], path: []};
            let splitSlides = splitSlide(slide);
            expect(splitSlides[0]).to.deep.equal(slide);
        });

        it("contents big slide", () => {
            let slide: Slide = {type: "title and content", items: [{type: "text", text: "asdf1"}, {type: "text", text: "asdf2"}, {type: "text", text: "asdf3"}], path: []};
            let splitSlides = splitSlide(slide);
            expect(splitSlides[0]).to.deep.equal({type: "title and content", items: [{type: "text", text: "asdf1"}, {type: "text", text: "asdf2"}], path: []});
            expect(splitSlides[1]).to.deep.equal({type: "title and content", items: [{type: "text", text: "asdf1"}, {type: "text", text: "asdf3"}], path: []});
        });

    });


    describe("figure and contents", () => {
        it("size small slide", () => {
            let slide: Slide = {type: "figure and content", items: [{type: "figure", h: H("q")}, {type: "text", text: "asdf2"}], path: []};
            let splitSlides = splitSlide(slide);
            expect(splitSlides.length).to.equal(1);
        });

        it("size big slide", () => {
            let slide: Slide = {type: "figure and content", items: [{type: "figure", h: H("q")}, {type: "text", text: "asdf2"}, {type: "text", text: "asdf3"}], path: []};
            let splitSlides = splitSlide(slide);
            expect(splitSlides.length).to.equal(2);
        });

        it("contents small slide", () => {
            let slide: Slide = {type: "figure and content", items: [{type: "figure", h: H("q")}, {type: "text", text: "asdf2"}], path: []};
            let splitSlides = splitSlide(slide);
            expect(splitSlides[0]).to.deep.equal(slide);
        });

        it("contents big slide", () => {
            let slide: Slide = {type: "figure and content", items: [{type: "figure", h: H("q")}, {type: "text", text: "asdf2"}, {type: "text", text: "asdf3"}], path: []};
            let splitSlides = splitSlide(slide);
            expect(splitSlides[0].type).to.equal("figure and content");
            expect(splitSlides[0].items[0].type).to.equal("figure");
            // @ts-ignore
            expect(splitSlides[0].items[0].h.element.tagName).to.equal("Q");
            expect(splitSlides[0].items[1].type).to.equal("text");
            // @ts-ignore
            expect(splitSlides[0].items[1].text).to.equal("asdf2");
            expect(splitSlides[0].items.length).to.equal(2);


            expect(splitSlides[1].type).to.equal("figure and content");
            expect(splitSlides[1].items[0].type).to.equal("figure");
            // @ts-ignore
            expect(splitSlides[1].items[0].h.element.tagName).to.equal("Q");
            expect(splitSlides[1].items[1].type).to.equal("text");
            // @ts-ignore
            expect(splitSlides[1].items[1].text).to.equal("asdf3");
            expect(splitSlides[1].items.length).to.equal(2);

        });

    });

});


describe("buildItem", () => {
    it("html", () => {
        let item: Item = {type: "html", h: H("p")};
        let html = buildItem(item);
        expect(html.element.outerHTML).to.deep.equal("<p></p>");
    });

    it("text", () => {
        let item: Item = {type: "text", text: "asdf"};
        let html = buildItem(item);
        expect(html.element.outerHTML).to.equal("<p>asdf</p>");
    });

    it("figure", () => {
        let item: Item = {type: "figure", h: H("img")};
        item.h.element.setAttribute("src", "asdf");
        let html = buildItem(item);
        expect(html.element.outerHTML).to.equal("<img src=\"asdf\">");
    });

    it("slide", () => {
        let item: Slide = {type: "title", items: [{type: "text", text: "asdf"}], path: []};
        let html = buildItem(item);
        expect(html.element.outerHTML).to.equal("<section><h1>asdf</h1></section>");
    });
});


describe("buildSlide", () => {
    it("title", () => {
        let slide: Slide = {type: "title", items: [{type: "text", text: "asdf"}], path: []};
        let html = buildSlide(slide);
        expect(html.element.outerHTML).to.equal("<section><h1>asdf</h1></section>");
    });

    it("title and content", () => {
        let slide: Slide = {type: "title and content", items: [{type: "text", text: "asdf1"}, {type: "text", text: "asdf2"}], path: []};
        let html = buildSlide(slide);
        expect(html.element.outerHTML).to.equal("<section><h1>asdf1</h1><p>asdf2</p></section>");
    });

    it("figure and content", () => {
        let slide: Slide = {type: "figure and content", items: [{type: "figure", h: H("q")}, {type: "text", text: "asdf2"}], path: []};
        let html = buildSlide(slide);
        expect(html.element.outerHTML).to.equal("<section><table><tr><td style=\"width: 50%\"><q></q></td><td><p>asdf2</p></td></tr></table></section>");
    });
});
