define(["require", "exports", "./SVGUtils"], function (require, exports, SVGUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CardSegTemplate = void 0;
    /**
     * All the information for a full flashcard.
     */
    class CardSegTemplate {
        /**
         * Constructor
         * @param xmlDoc An (SVG) XML document that contains both the question (left side) and answer (right side).
         * @param divX the horizontal midpoint that splits the question and answer regions.
         */
        constructor(xmlDoc, divX) {
            /**
             * Array of content on the left side where the question
             * should be.
             */
            this.qSide = new Array();
            /**
             * Array of content on the right side where the answer
             * should be.
             */
            this.aSide = new Array();
            /**
             * The text content of the theme text extracted from the document.
             */
            this.theme = null;
            // This is a hardcoded expectation from the
            // Inkscape SVG document loaded.
            let contentLayer = xmlDoc.documentElement.children.namedItem("layer1");
            let themeNode = contentLayer === null || contentLayer === void 0 ? void 0 : contentLayer.children.namedItem("theme");
            if (themeNode) {
                this.theme = themeNode.textContent;
                // Once the data is extracted, no reason to leave it to linger
                // with us always needing to iterate around it.
                contentLayer === null || contentLayer === void 0 ? void 0 : contentLayer.removeChild(themeNode);
            }
            if (contentLayer) {
                for (let i = 0; i < contentLayer.childElementCount; ++i) {
                    let childNode = contentLayer === null || contentLayer === void 0 ? void 0 : contentLayer.children[i];
                    let refPt = SVGUtils_1.SVGUtils.GetNodeRefPt(childNode);
                    if (!refPt) {
                        console.log("Skipping possibly problematic node");
                        continue;
                    }
                    let xpos = refPt[0];
                    // A flashcard content SVG should be twice the length
                    // of a flashcard, because the left will have the question,
                    // the the right will have the answer.
                    if (xpos < divX)
                        this.qSide.push(childNode);
                    else
                        this.aSide.push(childNode);
                }
            }
            // Move the answer's (that's on the right) to the left
            // so both items originate at 0,0.
            SVGUtils_1.SVGUtils.MoveNodes(this.aSide, [-divX, 0]);
        }
    }
    exports.CardSegTemplate = CardSegTemplate;
});
