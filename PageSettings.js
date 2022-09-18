define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PageSettings = void 0;
    class PageSettings {
        constructor(cardDim, pageDim, offsetDim) {
            this.cardWidth = cardDim[0];
            this.cardHeight = cardDim[1];
            this.pageWidth = pageDim[0];
            this.pageHeight = pageDim[1];
            this.offsetX = offsetDim[0];
            this.offsetY = offsetDim[1];
        }
        ExpectedTileDim() {
            const epsBuffer = 0.001; // Guard against floating point errors
            let x = (this.pageWidth - 2 * this.offsetX) / this.cardWidth;
            let y = (this.pageHeight - 2 * this.offsetY) / this.cardHeight;
            return [Math.floor(x + epsBuffer), Math.floor(y + epsBuffer)];
        }
    }
    exports.PageSettings = PageSettings;
    PageSettings.defaultLetter = new PageSettings([88.9, 50.8], [215.9, 279.4], [19.05, 12.7]);
});
