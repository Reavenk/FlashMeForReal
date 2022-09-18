import { SVGUtils } from "./SVGUtils";

/**
 * All the information for a full flashcard.
 */
export class CardSegTemplate
{
	/**
	 * Array of content on the left side where the question
     * should be.
	 */
    qSide: Array<Element>  = new Array<Element>();
    
	/**
	 * Array of content on the right side where the answer
     * should be.
	 */
    aSide: Array<Element> = new Array<Element>();

	/**
	 * The text content of the theme text extracted from the document.
	 */
    theme: string | null = null;

	/**
	 * Constructor
	 * @param xmlDoc An (SVG) XML document that contains both the question (left side) and answer (right side).
	 * @param divX the horizontal midpoint that splits the question and answer regions.
	 */
	constructor(xmlDoc : XMLDocument, divX : number)
	{
		// This is a hardcoded expectation from the
		// Inkscape SVG document loaded.
		let contentLayer : Element|null = xmlDoc.documentElement.children.namedItem("layer1");
		
		let themeNode : Element|null|undefined = contentLayer?.children.namedItem("theme");
		if(themeNode)
		{
			this.theme = themeNode.textContent;
			// Once the data is extracted, no reason to leave it to linger
			// with us always needing to iterate around it.
			contentLayer?.removeChild(themeNode);
		}
		
		if(contentLayer)
		{
			for( let i = 0; i < contentLayer.childElementCount; ++i)
			{
				let childNode : Element|undefined = contentLayer?.children[i];
					
				let refPt = SVGUtils.GetNodeRefPt(childNode);
				if(!refPt)
				{
					console.log("Skipping possibly problematic node");
					continue;
				}
				
				let xpos = refPt[0];
				
				// A flashcard content SVG should be twice the length
				// of a flashcard, because the left will have the question,
				// the the right will have the answer.
				if(xpos < divX)
					this.qSide.push(childNode);
				else
					this.aSide.push(childNode);
			}
		}
		
		// Move the answer's (that's on the right) to the left
		// so both items originate at 0,0.
		SVGUtils.MoveNodes(this.aSide, [-divX, 0]);
	}
}