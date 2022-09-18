import { PageSettings } from "./PageSettings";
import { DOMLoc } from "./DOMLoc";
import { CardSegTemplate } from "./CardSegTemplate";
import { SVGUtils } from "./SVGUtils";
import { CardSide } from "./CardSide";

/**
 * The application session and utilities.
 */
export class CardApp
{
    /**
     * The page settings to use in the application.
     */
    pageSettings          : PageSettings|null  = null;

    /**
     * The SVG to use as the blank page being rendered to. This may contain
     * extra details such as Inkscape guides, or full-page watermarks.
     * 
     * The document should be make to match the dimensions of pageSettings.
     */
    templateBlank       : DOMLoc|null   = null;

    /**
     * The SVG to use as the blank page being rendered to. This may contain
     * extra details such as Inkscape guides, or full-page watermarks.
     * 
     * The document should be make to match the dimensions of pageSettings.
     * 
     * This version explicitly visible lines to show the card boundaries, to
     * create a version where the user can manually cut the cards apart.
     */
    templateBlankLined 	: DOMLoc|null   = null;

    /**
     * The template for the questions side of a flash card.
     */
    cardQFace			: CardSide|null = null;

    /**
     * The template for the answer side of a flash card.
     */
    cardAFace			: CardSide|null = null;

    /**
     * The template for displaying the theme in the question side of a flashcard.
     */
    cardTheme			: CardSide|null = null;

    /**
     * Download hardcoded assets from the server.
     */
    InitializeDownloadAssets(): void
    {
        this.templateBlank = new DOMLoc();
        this.templateBlankLined = new DOMLoc();
        DOMLoc.LoadXMLURLInto("BlankDocument.svg", this.templateBlank);
        DOMLoc.LoadXMLURLInto("BlankDocument_Lined.svg", this.templateBlankLined);

        this.cardQFace = new CardSide();
        this.cardAFace = new CardSide();
        this.cardTheme = new CardSide();
        CardSide.LoadXMLURLInto("Card_QFace.svg", this.cardQFace);
        CardSide.LoadXMLURLInto("Card_AFace.svg", this.cardAFace);
        CardSide.LoadXMLURLInto("Card_Theme.svg", this.cardTheme);

        this.pageSettings = PageSettings.defaultLetter;
    }

    /**
     * Given a list of flashcard data, generate the SVGs of the double-sides printable pages.
     * @param cardsToComp The flashcard data to compile.
     * @returns The final SVG pages. The array will always be even as Q/A should be printed double-sided so they come in pairs.
     */
    GeneratePages(cardsToComp : [[string, CardSegTemplate]]) : Array<Document>
    {
        if(!this.pageSettings)
            throw new Error("GeneratePages missing expected page layout.");

        return this.GeneratePagesEx(cardsToComp, this.pageSettings);
    }

    /**
     * Given a list of flashcard data, generate the SVGs of the double-sides printable pages.
     * 
     * See GeneratePages() for more information on parameters.
     * @param pageSettings The page settings to use.
     */
    GeneratePagesEx(
        cardsToComp : [[string, CardSegTemplate]], 
        pageSettings : PageSettings) : Array<Document>
    {
        
        if(!this.templateBlankLined || !this.templateBlank)
            throw Error("Attempting to generate pages undefined templates.")

        let pageRet : Array<Document> = [];
        
        // Get page info and number of items per page
        // 
        let useGrid = pageSettings.ExpectedTileDim();
        let cardsPerPage = useGrid[0] * useGrid[1];
        
        // TODO: Change this to bool parameter and send in value externally
        let cbLined = document.getElementById("cbLined") as HTMLInputElement | null;
        if(cbLined == null)
            throw Error("Attempting to generate pages with unknown cbLined information");

        let useLined = cbLined.checked;
        
        let pages = Math.ceil(cardsToComp.length / cardsPerPage);
        for(let p = 0; p < pages; ++p)
        {
            let baseStr = p * cardsPerPage;
            let baseEnd = baseStr + cardsPerPage;
            
            // For every set of questions, we need a pair of pages, one
            // for the questions, and the back-print for the answers.
            let pageQ : Document|null = 
                useLined ? 
                    this.templateBlankLined.CloneNode() : 
                    this.templateBlank.CloneNode();

            if(!pageQ) 
                continue;

            let layerQ : HTMLElement|null|undefined = pageQ.getElementById("layer1");
            if(!layerQ) 
                continue;
            //
            let pageA : Document = this.templateBlank.CloneNode();
            let layerA : HTMLElement|null = pageA.getElementById("layer1");
            if(!layerA)
                continue;
            
            for(let cIt = 0; cIt < cardsPerPage; ++cIt)
            {
                let idx = baseStr + cIt;
                if(idx >=  cardsToComp.length)
                    break;
                
                let cardTemp = cardsToComp[idx][1]; // Card Q/A pair template
                let qcol = cIt % useGrid[0];
                let qrow = Math.floor(cIt / useGrid[0]);
                let acol = useGrid[0] - 1 - qcol;
                let arow = qrow;

                if(!cardTemp)
                    continue;
                
                // 		QUESTION TILE
                //////////////////////////////////////////////////
                let tileOfsQ = 
                    [
                        pageSettings.offsetX + qcol * pageSettings.cardWidth, 
                        pageSettings.offsetY + qrow * pageSettings.cardHeight
                    ];
                
                if(this.cardQFace)
                    this.cardQFace.CloneInto(pageQ, layerQ, tileOfsQ);					
                
                if(cardTemp.theme)
                {
                    if(this.cardTheme)
                    {
                        let tempNodeClones = this.cardTheme.CloneInto(pageQ, layerQ, tileOfsQ);
                        if(!tempNodeClones)
                            continue;

                        CardSide.FindAndSetTheme(tempNodeClones, cardTemp.theme);
                    }
                }
                
                for( let dupIt = 0; dupIt < cardTemp.qSide.length; ++dupIt)
                {
                    let dup = pageQ.importNode(cardTemp.qSide[dupIt], true);
                    SVGUtils.MoveNode(dup, tileOfsQ);
                    layerQ.appendChild(dup);
                }
                
                // 		ANSWER TILE
                //////////////////////////////////////////////////
                let tileOfsA = 
                    [
                        pageSettings.offsetX + acol * pageSettings.cardWidth, 
                        pageSettings.offsetY + arow * pageSettings.cardHeight
                    ];

                if(this.cardAFace)
                    this.cardAFace.CloneInto(pageA, layerA, tileOfsA);					

                for( let dupIt = 0; dupIt < cardTemp.aSide.length; ++dupIt)
                {
                    let dup = pageA.importNode(cardTemp.aSide[dupIt], true);
                    SVGUtils.MoveNode(dup, tileOfsA);
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
     * Given SVG documents, compile them into a string for PDFConversion.php.
     * @param docs The documents to compile as the string payload.
     * @returns The string payload that can be sent for PDFConversion.php
     */
    static MergeDocumentsIntoString(docs : Array<Document>) : string
    {
        let docDumps : Array<string> = [];
        for(let i = 0; i < docs.length; ++i)
        {
            let dump = docs[i].documentElement.outerHTML;
            docDumps.push(dump);
        }
        return CardApp.CreateMergedPayloadFromString(docDumps)
    }

    /**
     * Given an array of strings representing seperate text files, compile them
     * into one concatenated string that can be processed by PDFConversion.php.
     * @param toContat The contents of the text files to concatenate.
     * @returns The string payload for PDFConversion.php.
     */
    static CreateMergedPayloadFromString(toContat : Array<string>) : string
    {
        let retCombined : string = "";
        retCombined += toContat.length.toString() + "|"
        
        for(let i = 0; i < toContat.length; ++i)
        {
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
     * Given a blob, set the browser to download it as a file.
     * @param filename The filename the browser should recommend saving the file as.
     * @param data A blob with the file content.
     */
    static DoDownload(filename: string, data: Blob)
    {
        let a : HTMLAnchorElement = document.createElement("a");
        if(!a)
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
     * Utility function to convert an SVG string to an XML document.
     * @param svgAsString The string representation of the SVG document.
     * @returns The generated XML document.
     */
    static StringToSVG(svgAsString : string) : Document
    {
        let parser : DOMParser = new DOMParser();
        let xmlDoc = parser.parseFromString(svgAsString, "text/xml");
        return xmlDoc;
    }

    /**
     * Utility function to parse an SVG string file containing the data for a flashcard.
     * @param svgAsString The SVG contents of a QA flashcard.
     * @returns The CardSegTemplate, representing the flashcard data.
     */
    ParseImportedCard(svgAsString : string) : CardSegTemplate
    {
        if(!this.pageSettings)
            throw new Error("ParseImportedCard missing expected letter page.");

        let svgDoc : Document = CardApp.StringToSVG(svgAsString);
        return new CardSegTemplate(svgDoc, this.pageSettings.cardWidth);
    }
}