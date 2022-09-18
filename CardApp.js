define(["require", "exports", "./PageSettings", "./DOMLoc", "./CardSegTemplate", "./SVGUtils", "./CardSide"], function (require, exports, PageSettings_1, DOMLoc_1, CardSegTemplate_1, SVGUtils_1, CardSide_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CardApp = void 0;
    /**
     *
     */
    class CardApp {
        constructor() {
            /**
             *
             */
            this.letterPage = null;
            /**
             *
             */
            this.templateBlank = null;
            /**
             *
             */
            this.templateBlankLined = null;
            /**
             *
             */
            this.cardQFace = null;
            /**
             *
             */
            this.cardAFace = null;
            /**
             *
             */
            this.cardTheme = null;
        }
        /**
         *
         */
        InitializeDownloadAssets() {
            this.templateBlank = new DOMLoc_1.DOMLoc();
            this.templateBlankLined = new DOMLoc_1.DOMLoc();
            DOMLoc_1.DOMLoc.LoadXMLURLInto("BlankDocument.svg", this.templateBlank);
            DOMLoc_1.DOMLoc.LoadXMLURLInto("BlankDocument_Lined.svg", this.templateBlankLined);
            this.cardQFace = new CardSide_1.CardSide();
            this.cardAFace = new CardSide_1.CardSide();
            this.cardTheme = new CardSide_1.CardSide();
            CardSide_1.CardSide.LoadXMLURLInto("Card_QFace.svg", this.cardQFace);
            CardSide_1.CardSide.LoadXMLURLInto("Card_AFace.svg", this.cardAFace);
            CardSide_1.CardSide.LoadXMLURLInto("Card_Theme.svg", this.cardTheme);
            this.letterPage = PageSettings_1.PageSettings.defaultLetter;
        }
        /**
         *
         * @param cardsToComp
         * @returns
         */
        GeneratePages(cardsToComp) {
            if (!this.letterPage)
                throw new Error("GeneratePages missing expected page layout.");
            return this.GeneratePagesEx(cardsToComp, this.letterPage);
        }
        /**
         *
         * @param cardsToComp
         * @param pageSettings
         * @returns
         */
        GeneratePagesEx(cardsToComp, pageSettings) {
            if (!this.templateBlankLined || !this.templateBlank)
                throw Error("Attempting to generate pages undefined templates.");
            let pageRet = [];
            // Get page info and number of items per page
            // 
            let useGrid = pageSettings.ExpectedTileDim();
            let cardsPerPage = useGrid[0] * useGrid[1];
            // TODO: Change this to bool parameter and send in value externally
            let cbLined = document.getElementById("cbLined");
            if (cbLined == null)
                throw Error("Attempting to generate pages with unknown cbLined information");
            let useLined = cbLined.checked;
            let pages = Math.ceil(cardsToComp.length / cardsPerPage);
            for (let p = 0; p < pages; ++p) {
                let baseStr = p * cardsPerPage;
                let baseEnd = baseStr + cardsPerPage;
                // For every set of questions, we need a pair of pages, one
                // for the questions, and the back-print for the answers.
                let pageQ = useLined ?
                    this.templateBlankLined.CloneNode() :
                    this.templateBlank.CloneNode();
                if (!pageQ)
                    continue;
                let layerQ = pageQ.getElementById("layer1");
                if (!layerQ)
                    continue;
                //
                let pageA = this.templateBlank.CloneNode();
                let layerA = pageA.getElementById("layer1");
                if (!layerA)
                    continue;
                for (let cIt = 0; cIt < cardsPerPage; ++cIt) {
                    let idx = baseStr + cIt;
                    if (idx >= cardsToComp.length)
                        break;
                    let cardTemp = cardsToComp[idx][1]; // Card Q/A pair template
                    let qcol = cIt % useGrid[0];
                    let qrow = Math.floor(cIt / useGrid[0]);
                    let acol = useGrid[0] - 1 - qcol;
                    let arow = qrow;
                    if (!cardTemp)
                        continue;
                    // 		QUESTION TILE
                    //////////////////////////////////////////////////
                    let tileOfsQ = [
                        pageSettings.offsetX + qcol * pageSettings.cardWidth,
                        pageSettings.offsetY + qrow * pageSettings.cardHeight
                    ];
                    if (this.cardQFace)
                        this.cardQFace.CloneInto(pageQ, layerQ, tileOfsQ);
                    if (cardTemp.theme) {
                        if (this.cardTheme) {
                            let tempNodeClones = this.cardTheme.CloneInto(pageQ, layerQ, tileOfsQ);
                            if (!tempNodeClones)
                                continue;
                            CardSide_1.CardSide.FindAndSetTheme(tempNodeClones, cardTemp.theme);
                        }
                    }
                    for (let dupIt = 0; dupIt < cardTemp.qSide.length; ++dupIt) {
                        let dup = pageQ.importNode(cardTemp.qSide[dupIt], true);
                        SVGUtils_1.SVGUtils.MoveNode(dup, tileOfsQ);
                        layerQ.appendChild(dup);
                    }
                    // 		ANSWER TILE
                    //////////////////////////////////////////////////
                    let tileOfsA = [
                        pageSettings.offsetX + acol * pageSettings.cardWidth,
                        pageSettings.offsetY + arow * pageSettings.cardHeight
                    ];
                    if (this.cardAFace)
                        this.cardAFace.CloneInto(pageA, layerA, tileOfsA);
                    for (let dupIt = 0; dupIt < cardTemp.aSide.length; ++dupIt) {
                        let dup = pageA.importNode(cardTemp.aSide[dupIt], true);
                        SVGUtils_1.SVGUtils.MoveNode(dup, tileOfsA);
                        layerA.appendChild(dup);
                    }
                    //////////////////////////////////////////////////
                }
                pageRet.push(pageQ);
                pageRet.push(pageA);
            }
            return pageRet;
        }
        /**
         *
         * @param docs
         * @returns
         */
        static MergeDocumentsIntoString(docs) {
            let docDumps = [];
            for (let i = 0; i < docs.length; ++i) {
                let dump = docs[i].documentElement.outerHTML;
                docDumps.push(dump);
            }
            return CardApp.CreateMergedPayloadFromString(docDumps);
        }
        /**
         *
         * @param toContat
         * @returns
         */
        static CreateMergedPayloadFromString(toContat) {
            let retCombined = "";
            retCombined += toContat.length.toString() + "|";
            for (let i = 0; i < toContat.length; ++i) {
                //retCombined += svgPageStrings[i].length + "|" + svgPageStrings[i];
                //
                // We turn it into a blob to check the length of the bytes
                // the string will use up, not the character count. This is
                // because that's what PHP will use when we index, for some
                // unknown reason.
                retCombined += new Blob([toContat[i]]).size + "|" + toContat[i];
            }
            return retCombined;
        }
        /**
         *
         * @param filename
         * @param data
         */
        static DoDownload(filename, data) {
            let a = document.createElement("a");
            if (!a)
                throw new Error("Could not created required elements for download.");
            a.style.display = "none";
            document.body.appendChild(a);
            let url = window.URL.createObjectURL(data);
            a.href = url;
            a.download = filename;
            a.click();
            window.URL.revokeObjectURL(url);
        }
        /**
         *
         * @param svgAsString
         * @returns
         */
        static StringToSVG(svgAsString) {
            let parser = new DOMParser();
            let xmlDoc = parser.parseFromString(svgAsString, "text/xml");
            return xmlDoc;
        }
        /**
         *
         * @param svgAsString
         * @returns
         */
        ParseImportedCard(svgAsString) {
            if (!this.letterPage)
                throw new Error("ParseImportedCard missing expected letter page.");
            let svgDoc = CardApp.StringToSVG(svgAsString);
            return new CardSegTemplate_1.CardSegTemplate(svgDoc, this.letterPage.cardWidth);
        }
    }
    exports.CardApp = CardApp;
});
