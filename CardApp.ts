import { PageSettings } from "./PageSettings";
import { DOMLoc } from "./DOMLoc";
import { CardSegTemplate } from "./CardSegTemplate";
import { SVGUtils } from "./SVGUtils";
import { CardSide } from "./CardSide";

export class CardApp
{
    letterPage          : PageSettings|null  = null;
    templateBlank       : DOMLoc|null   = null;
    templateBlankLined 	: DOMLoc|null   = null;
    cardQFace			: CardSide|null = null;
    cardAFace			: CardSide|null = null;
    cardTheme			: CardSide|null = null;

    InitializeDownloadAssets()
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

        this.letterPage = PageSettings.defaultLetter;
    }

    GeneratePages(cardsToComp : [[string, CardSegTemplate]]) : Array<Document>
    {
        if(!this.letterPage)
            throw new Error("GeneratePages missing expected page layout.");

        return this.GeneratePagesEx(cardsToComp, this.letterPage);
    }

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

                        CardSide.FindSetTheme(tempNodeClones, cardTemp.theme);
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

    static StringToSVG(svgAsString : string) : Document
    {
        let parser : DOMParser = new DOMParser();
        let xmlDoc = parser.parseFromString(svgAsString, "text/xml");
        return xmlDoc;
    }

    ParseImportedCard(svgAsString : string) : CardSegTemplate
    {
        if(!this.letterPage)
            throw new Error("ParseImportedCard missing expected letter page.");

        let svgDoc : Document = CardApp.StringToSVG(svgAsString);
        return new CardSegTemplate(svgDoc, this.letterPage.cardWidth);
    }
}