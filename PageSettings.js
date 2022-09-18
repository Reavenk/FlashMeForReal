define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PageSettings = void 0;
    /**
     * A collection of parameters that defines the property of pages involves.
     *
     * Primarily:
     *	- The dimensions of the parts of the SVG dimensions that represent a single question.
     * 	- The dimensions of the PDF pages the questions will be compiled to.
     */
    class PageSettings {
        // TODO: We should probably just have a 2D vector class
        constructor(cardDim, pageDim, offsetDim) {
            this.cardWidth = cardDim[0];
            this.cardHeight = cardDim[1];
            this.pageWidth = pageDim[0];
            this.pageHeight = pageDim[1];
            this.offsetX = offsetDim[0];
            this.offsetY = offsetDim[1];
        }
        /**
         * The dimensions of the grid of cards on a single page.
         */
        ExpectedTileDim() {
            const epsBuffer = 0.001; // Guard against floating point errors
            let x = (this.pageWidth - 2 * this.offsetX) / this.cardWidth;
            let y = (this.pageHeight - 2 * this.offsetY) / this.cardHeight;
            return [Math.floor(x + epsBuffer), Math.floor(y + epsBuffer)];
        }
    }
    exports.PageSettings = PageSettings;
    /**
     * The target document sizes, where the cards will be of business card size, and
     * the final page will be letter size (8.5" x 11" cardstock). See The offsets are
     * centering a 2x5 grid of business cards on a letter size, such as [this](https://www.amazon.com/Hamilco-Blank-Business-Cards-Stock/dp/B07L8LB741/).
     */
    PageSettings.defaultLetter = new PageSettings([88.9, 50.8], [215.9, 279.4], [19.05, 12.7]);
});
